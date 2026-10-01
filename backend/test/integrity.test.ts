/**
 * B4 (Plan Maestro 31-40): carreras de operaciones concurrentes, integridad referencial y
 * configuración de la conexión. Cada prueba ataca el mismo recurso al mismo tiempo desde
 * varias corutinas reales y exige el invariante que el código (locks, índices únicos, gates
 * atómicos) promete — no basta con que funcione en secuencia.
 */
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPool } from "../src/db/pool.js";
import { FiscalInvoicingService } from "../src/modules/billing/invoicing.js";
import { MembershipsAndTicketingService } from "../src/modules/memberships/service.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const contact = { name: "Cliente Integridad", email: "integridad@test.local", phone: "8095551234" };
const shipping = { address: "Calle Duarte 15, Ensanche Naco", city: "Santo Domingo", province: "Distrito Nacional" };

describe("B4 — integridad y carreras concurrentes", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  let n = 0;
  const uniq = () => `it4${Date.now().toString(36)}${n++}@test.local`;
  const signup = async () => {
    const email = uniq();
    const res = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const mkProduct = async (over: object) =>
    json(await app.inject({
      method: "POST", url: "/api/v1/admin/store/products",
      headers: { authorization: `Bearer ${admin}` },
      payload: { slug: `it4-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, name: "Producto", category: "poster", price: 1000, stock: 10, ...over },
    })).data;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: a.email, password: PW } })).data.tokens.access_token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("31/33/34 — 5 suscripciones simultáneas: una sola membresía ACTIVE y un solo bono VIP de 500", async () => {
    const u = await signup();
    const svc = new MembershipsAndTicketingService(pool);
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => svc.subscribeUserToPlan(u.id, "pasaporte-rd-vip")));
    expect(results.filter((r) => r.status === "fulfilled").length).toBeGreaterThanOrEqual(1);
    // El índice parcial único uq_user_memberships_active (0053) garantiza el invariante
    // aunque el servicio pierda una carrera; el perdedor reintenta y la última gana.
    const statuses = (await pool.query("SELECT status, count(*)::int AS n FROM user_memberships WHERE user_id = $1 GROUP BY status", [u.id])).rows;
    expect(statuses.find((r) => r.status === "ACTIVE")?.n).toBe(1);
    const bonus = (await pool.query("SELECT count(*)::int AS n, max(points_delta)::int AS pts FROM loyalty_points_ledger WHERE user_id = $1 AND reason = 'VIP_BONUS'", [u.id])).rows[0];
    expect(bonus.n).toBe(1); // reference_id fijo vip_bonus:<user> + uq_loyalty_ledger_reference
    expect(bonus.pts).toBe(500);
    expect((await pool.query("SELECT coalesce(sum(points_delta), 0)::int AS b FROM loyalty_points_ledger WHERE user_id = $1", [u.id])).rows[0].b).toBe(500);
  });

  it("33/34 — 3 check-ins simultáneos del mismo QR: uno gana y los demás reciben CONFLICT", async () => {
    const u = await signup();
    const svc = new MembershipsAndTicketingService(pool);
    const t = await svc.purchaseTicket({ eventId: `evt-it4-${Date.now()}`, userId: u.id, price: 10 });
    const results = await Promise.allSettled(Array.from({ length: 3 }, () => svc.verifyAndCheckInTicket(t.qr_code_hash)));
    const won = results.filter((r) => r.status === "fulfilled");
    const lost = results.filter((r) => r.status === "rejected");
    expect(won).toHaveLength(1);
    expect(lost).toHaveLength(2);
    for (const r of lost) expect((r as PromiseRejectedResult).reason.code).toBe("CONFLICT");
    expect((await pool.query("SELECT count(*)::int AS n FROM live_event_tickets WHERE qr_code_hash = $1 AND status = 'CHECKED_IN'", [t.qr_code_hash])).rows[0].n).toBe(1);
  });

  it("33/34 — dos pedidos simultáneos con la misma Idempotency-Key: un solo pedido y una sola baja de stock", async () => {
    const prod = await mkProduct({ name: `Idem ${Date.now().toString(36)}`, stock: 5, price: 500 });
    const cart = json(await app.inject({ method: "POST", url: "/api/v1/cart/items", payload: { product_id: prod.id, quantity: 1 } })).data.cart_token as string;
    const key = `it4-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const send = () => app.inject({
      method: "POST", url: "/api/v1/orders",
      payload: { contact, shipping, payment_method_token: "tok_test_ok" },
      headers: { "x-cart-token": cart, "idempotency-key": key },
    });
    // El índice uq_store_orders_idem (0022) hace que la segunda inserción choque y se
    // convierta en replay del pedido del ganador: 201 + 200 con el mismo id.
    const [a, b] = await Promise.all([send(), send()]);
    const created = [a, b].find((r) => r.statusCode === 201);
    const replayed = [a, b].find((r) => r.statusCode === 200);
    expect(created, "uno crea").toBeDefined();
    expect(replayed, "el otro reinterpreta la misma clave").toBeDefined();
    expect(json(replayed!).data.replayed).toBe(true);
    expect(json(created!).data.order.id).toBe(json(replayed!).data.order.id);
    expect((await pool.query("SELECT count(*)::int AS n FROM store_orders WHERE idempotency_key = $1", [key])).rows[0].n).toBe(1);
    expect(Number((await pool.query("SELECT stock FROM store_products WHERE id = $1", [prod.id])).rows[0].stock)).toBe(4);
  });

  it("33/34 — 5 facturas simultáneas por el camino sin secuencia (B02): NCF únicos y consecutivos", async () => {
    const svc = new FiscalInvoicingService(pool);
    const ref = `it4-${Date.now()}`;
    const out = await Promise.all(Array.from({ length: 5 }, (_, i) =>
      svc.issueInvoice({
        ncf_type: "B02", buyer_name: `Cliente ${i}`, subtotal: 100 + i,
        reference_type: "order", reference_id: `${ref}-${i}`,
      })));
    expect(new Set(out.map((r) => r.ncf)).size).toBe(5);
    const nums = out.map((r) => Number(r.ncf.slice(3))).sort((x, y) => x - y);
    expect(nums[4]! - nums[0]!).toBe(4); // el lock de fallback serializa el correlativo
  });

  it("33/34 — 10 abonos simultáneos de 100 pts: suma exacta y balance_after sin saltos", async () => {
    const u = await signup();
    const svc = new MembershipsAndTicketingService(pool);
    await Promise.all(Array.from({ length: 10 }, () => svc.creditLoyaltyPoints(u.id, 100, "PURCHASE_REWARD")));
    const rows = (await pool.query("SELECT points_delta, balance_after FROM loyalty_points_ledger WHERE user_id = $1 AND reference_id IS NULL", [u.id])).rows;
    expect(rows).toHaveLength(10);
    expect(rows.reduce((s, r) => s + r.points_delta, 0)).toBe(1000);
    // El lock por usuario (pg_advisory_xact_lock) hace que cada abono vea el SUM del anterior.
    expect(rows.map((r) => r.balance_after).sort((a, b) => a - b)).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
  });

  it("36/38 — el pool impone los timeouts de sesión y un nombre de aplicación", async () => {
    const p = createPool({ DATABASE_URL: process.env.TEST_DATABASE_URL!, DB_POOL_MAX: 2 });
    try {
      // pg_settings.setting está en su unidad base (ms) — SHOW/current_setting lo formatean ("15s", "1min").
      const toms = async (name: string) => (await p.query("SELECT setting::int AS v FROM pg_settings WHERE name = $1", [name])).rows[0].v;
      expect(await toms("statement_timeout")).toBe(15_000);
      expect(await toms("idle_in_transaction_session_timeout")).toBe(60_000);
      expect((await p.query("SHOW application_name")).rows[0].application_name).toBe("descubre-rd-api");
    } finally { await p.end(); }
  });

  it("31/37 — las FK de 0053 existen y los planes usan los índices calientes", async () => {
    const fks = (await pool.query("SELECT conname FROM pg_constraint WHERE contype = 'f' AND conname = ANY($1)", [
      ["fk_store_orders_user", "fk_user_memberships_user", "fk_loyalty_ledger_user", "fk_event_tickets_user"],
    ])).rows.map((r) => r.conname).sort();
    expect(fks).toEqual(["fk_event_tickets_user", "fk_loyalty_ledger_user", "fk_store_orders_user", "fk_user_memberships_user"]);
    expect((await pool.query("SELECT 1 FROM pg_indexes WHERE indexname IN ('uq_user_memberships_active', 'uq_loyalty_ledger_reference', 'uq_store_orders_idem')")).rows).toHaveLength(3);

    // Con el seqscan desactivado, el único plan posible para estas consultas es el índice:
    // prueba de que el índice coincide con la forma real de la consulta.
    const c = await pool.connect();
    try {
      await c.query("SET enable_seqscan = off");
      const qr = await c.query("EXPLAIN (FORMAT JSON) SELECT * FROM live_event_tickets WHERE qr_code_hash = 'probe'");
      expect(JSON.stringify(qr.rows)).toContain("idx_event_tickets_qr");
      const xp = await c.query("EXPLAIN (FORMAT JSON) SELECT user_id FROM user_gamification ORDER BY total_xp DESC LIMIT 10");
      expect(JSON.stringify(xp.rows)).toContain("idx_user_gamification_xp");
    } finally {
      await c.query("SET enable_seqscan = on").catch(() => undefined);
      c.release();
    }
  });
});
