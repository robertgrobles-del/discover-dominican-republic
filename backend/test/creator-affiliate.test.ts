import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { normalizeTarget } from "../src/modules/creators/affiliate.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const tag = Date.now().toString(36);
const shipping = { address: "Calle Duarte 15, Ensanche Naco", city: "Santo Domingo", province: "Distrito Nacional" };
const contact = (email = "comprador@test.local") => ({ name: "Comprador Prueba", email, phone: "8095551234" });

describe("destinos de los enlaces", () => {
  it("sólo admite páginas del sitio y quita un ref previo", () => {
    expect(normalizeTarget("/tienda?ref=EMB-XX&cat=1")).toBe("/tienda?cat=1");
    expect(normalizeTarget("/destino/samana#playas")).toBe("/destino/samana#playas");
    for (const bad of ["https://otro.com", "//otro.com/x", "tienda", "/a b", "/x\"onload"]) expect(() => normalizeTarget(bad)).toThrow();
  });
});

/** Enlaces de afiliado de los creadores: un código por enlace que viaja por el `?ref=` del sitio hasta el pedido pagado. */
describe("enlaces de afiliado de creadores", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;

  const call = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...(opts.headers ?? {}) } });
  const account = async () => {
    const email = `ca${tag}${n++}@test.local`;
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Creadora Prueba" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const creator = async () => {
    const u = await account();
    expect((await call("POST", "/creators/onboarding", { token: u.token, payload: { handle: `ca_${tag}_${n++}`, display_name: "Creadora Prueba" } })).statusCode).toBe(201);
    return u;
  };
  const storeOrder = async (productId: string, o: { ref?: string; token?: string; email?: string } = {}) => {
    const cart = json(await call("POST", "/cart/items", { token: o.token, payload: { product_id: productId, quantity: 1 } })).data.cart_token as string | undefined;
    const res = await call("POST", "/orders", { token: o.token, headers: { "idempotency-key": `cr-aff-${Date.now()}-${n++}`, ...(cart ? { "x-cart-token": cart } : {}) }, payload: { contact: contact(o.email), shipping, payment_method_token: "tok_test_ok", ...(o.ref ? { ref_code: o.ref } : {}) } });
    expect(res.statusCode).toBe(201);
    return json(res).data.order as { id: string; total: number; ref_code?: string | null };
  };
  const ledger = async (orderId: string) => (await pool.query("SELECT * FROM creator_ledger WHERE source_ref LIKE $1 ORDER BY created_at", [`store:${orderId}%`])).rows;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = await account();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email: a.email, password: PW } })).data.tokens.access_token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("el creador genera enlaces por destino (sin duplicados) y los archiva; quien no es creador no puede", async () => {
    expect((await call("GET", "/creators/me/affiliate", { token: (await account()).token })).statusCode).toBe(403);
    const c = await creator();
    const first = await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/tienda", label: "Tienda" } });
    expect(first.statusCode).toBe(201);
    const link = json(first).data;
    expect(link.code).toMatch(/^CR-[A-Z2-9]{8}$/);
    const again = await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/tienda?ref=OTRO" } });
    expect(again.statusCode).toBe(200);
    expect(json(again).data.code).toBe(link.code);
    expect((await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "https://evil.example" } })).statusCode).toBe(400);

    const ov = json(await call("GET", "/creators/me/affiliate", { token: c.token })).data;
    expect(ov).toMatchObject({ commission_rate: 8, attribution_window_days: 30 });
    expect(ov.links).toHaveLength(1);
    expect((await call("DELETE", `/creators/me/affiliate/links/${link.id}`, { token: (await creator()).token })).statusCode).toBe(404); // de otro creador
    expect((await call("DELETE", `/creators/me/affiliate/links/${link.id}`, { token: c.token })).statusCode).toBe(204);
    expect(json(await call("GET", `/ambassadors/track?ref=${link.code}`)).data.valid).toBe(false); // archivado ya no cuenta
  });

  it("el clic se cuenta, la compra queda atribuida y la comisión se estima, se ajusta y se revierte con el pedido", async () => {
    const c = await creator();
    const link = json(await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/tienda" } })).data;
    const tracked = json(await call("GET", `/ambassadors/track?ref=${link.code.toLowerCase()}`)).data;
    expect(tracked).toMatchObject({ valid: true, ref: link.code });

    const product = json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `cr-aff-${tag}-${n++}`, name: "Afiche de Samaná", category: "poster", price: 2500, stock: 20 } })).data;
    const buyer = await account();
    const order = await storeOrder(product.id, { ref: link.code, token: buyer.token, email: buyer.email });
    const [entry] = await ledger(order.id);
    expect(entry).toMatchObject({ creator_id: c.id, source: "affiliate_commission", status: "estimated", affiliate_link_id: link.id });
    expect(Number(entry.amount)).toBeGreaterThan(0);
    const before = Number((await pool.query("SELECT balance_pending FROM creator_profiles WHERE id = $1", [c.id])).rows[0].balance_pending);
    expect(before).toBe(Number(entry.amount));

    const ov = json(await call("GET", "/creators/me/affiliate", { token: c.token })).data;
    expect(ov.totals).toMatchObject({ clicks: 1, orders: 1 });

    // Reembolso completo mientras sigue estimada: la comisión se revierte y el saldo vuelve a cero.
    expect((await call("POST", `/admin/store/orders/${order.id}/refund`, { token: admin, payload: { reason: "Devolución" } })).statusCode).toBe(200);
    const [reversed] = await ledger(order.id);
    expect(reversed.status).toBe("reversed");
    expect(Number((await pool.query("SELECT balance_pending FROM creator_profiles WHERE id = $1", [c.id])).rows[0].balance_pending)).toBe(0);
  });

  it("una comisión ya confirmada no se reescribe: un reembolso posterior deja un reverso visible", async () => {
    const c = await creator();
    const link = json(await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/tienda" } })).data;
    const product = json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `cr-aff-${tag}-${n++}`, name: "Taza de larimar", category: "poster", price: 3000, stock: 20 } })).data;
    const order = await storeOrder(product.id, { ref: link.code });
    await pool.query("UPDATE creator_ledger SET status = 'confirmed', confirmed_at = now() WHERE source_ref = $1", [`store:${order.id}`]);
    await call("POST", `/admin/store/orders/${order.id}/refund`, { token: admin, payload: { reason: "Devolución" } });
    await call("POST", `/admin/store/orders/${order.id}/refund`, { token: admin, payload: { reason: "Repetida" } });
    const rows = await ledger(order.id);
    expect(rows.map((r) => r.status)).toEqual(["confirmed", "confirmed"]);
    expect(rows[1]).toMatchObject({ source: "reversal", reverses_entry_id: rows[0].id });
    expect(Number(rows[1].amount)).toBe(-Number(rows[0].amount));
  });

  it("un pedido por transferencia genera la comisión cuando el equipo confirma el depósito", async () => {
    const c = await creator();
    const link = json(await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/tienda" } })).data;
    const product = json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `cr-aff-${tag}-${n++}`, name: "Cuadro de Altos de Chavón", category: "poster", price: 4000, stock: 20 } })).data;
    // Sin una cuenta activa donde depositar, la transferencia no se ofrece.
    await pool.query("INSERT INTO store_bank_accounts (bank_name, account_number, holder_name) SELECT 'Banco Prueba', '0001234567', 'Descubre RD' WHERE NOT EXISTS (SELECT 1 FROM store_bank_accounts WHERE is_active)");
    const buyer = await account();
    await call("POST", "/cart/items", { token: buyer.token, payload: { product_id: product.id, quantity: 1 } });
    const placed = await call("POST", "/orders", { token: buyer.token, headers: { "idempotency-key": `cr-tr-${Date.now()}-${n++}` }, payload: { contact: contact(buyer.email), shipping, payment_method: "transfer", ref_code: link.code } });
    expect(placed.statusCode).toBe(201);
    const orderId = json(placed).data.order.id as string;
    expect(await ledger(orderId)).toHaveLength(0); // sin pagar todavía
    expect((await call("POST", `/admin/store/orders/${orderId}/confirm-transfer`, { token: admin, payload: { reference: `DEP-${tag}-${n++}` } })).statusCode).toBe(200);
    const [entry] = await ledger(orderId);
    expect(entry).toMatchObject({ creator_id: c.id, status: "estimated", affiliate_link_id: link.id });
  });

  it("quien se registra con el enlace da puntos a ambos al verificar el correo, y el registro se cuenta en el enlace", async () => {
    const c = await creator();
    const link = json(await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/" } })).data;
    const res = json(await call("POST", "/auth/register", { payload: { email: `ref${tag}${n++}@test.local`, password: PW, accept_terms: true, ref_code: link.code.toLowerCase() } }));
    const newId = res.data.user.id as string;
    expect((await pool.query("SELECT signup_ref_code FROM users WHERE id = $1", [newId])).rows[0].signup_ref_code).toBe(link.code);
    const xp = async (id: string) => Number((await pool.query("SELECT coalesce((SELECT total_xp FROM user_gamification WHERE user_id = $1), 0) AS x", [id])).rows[0].x);
    const before = await xp(c.id);
    // Lo que hace verifyEmail tras marcar el correo (el token real llega por correo).
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [newId]);
    await app.auth.onEmailVerified!(newId);
    expect(await xp(c.id)).toBeGreaterThan(before);
    expect(await xp(newId)).toBeGreaterThan(0);
    expect(json(await call("GET", "/creators/me/affiliate", { token: c.token })).data.totals.signups).toBe(1);
    await app.auth.onEmailVerified!(newId); // repetido: no vuelve a dar puntos
    expect(json(await call("GET", "/creators/me/affiliate", { token: c.token })).data.totals.signups).toBe(1);
  });

  it("no hay comisión por comprar con el propio enlace", async () => {
    const c = await creator();
    const link = json(await call("POST", "/creators/me/affiliate/links", { token: c.token, payload: { target_path: "/tienda" } })).data;
    const product = json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `cr-aff-${tag}-${n++}`, name: "Llavero", category: "poster", price: 900, stock: 20 } })).data;
    const own = await storeOrder(product.id, { ref: link.code, token: c.token, email: c.email });
    expect(await ledger(own.id)).toHaveLength(0);
  });

  it("el equipo ve el directorio e invita a un creador a una estancia abierta en nombre del operador", async () => {
    const c = await creator();
    const operator = await account();
    const stay = (await pool.query(
      "INSERT INTO creator_stays (operator_id, hotel_name, destination, stay_title, stay_description) VALUES ($1,'Hotel Prueba','Samaná','Fin de semana creador','Dos noches frente al mar') RETURNING id", [operator.id],
    )).rows[0].id;
    const dir = json(await call("GET", `/admin/creators?q=ca_${tag}`, { token: admin }));
    expect(dir.data.some((x: { id: string }) => x.id === c.id)).toBe(true);
    expect((await call("GET", "/admin/creators", { token: c.token })).statusCode).toBe(403);
    expect(json(await call("GET", "/admin/creator-stays/open", { token: admin })).data.some((s: { id: string }) => s.id === stay)).toBe(true);

    const invite = await call("POST", `/admin/creators/${c.id}/invite-stay`, { token: admin, payload: { stay_id: stay, invitation_message: "Te proponemos esta estancia para tu próximo contenido." } });
    expect(invite.statusCode).toBe(201);
    expect(json(invite).data).toMatchObject({ creator_id: c.id, operator_id: operator.id, stay_id: stay, status: "pending" });
    expect((await call("POST", `/admin/creators/${c.id}/invite-stay`, { token: admin, payload: { stay_id: stay, invitation_message: "Segunda invitación igual a la primera." } })).statusCode).toBe(409);
    const mine = json(await call("GET", "/creators/me/invitations", { token: c.token })).data as { stay_id: string }[];
    expect(mine.some((i) => i.stay_id === stay)).toBe(true);
  });
});
