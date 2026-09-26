import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0, k = 0;
const uniq = () => `mp${Date.now().toString(36)}${n++}@test.local`;
const shipping = { address: "Calle Duarte 15, Ensanche Naco", city: "Santo Domingo", province: "Distrito Nacional" };
const contact = (email = "comprador@test.local") => ({ name: "Comprador Prueba", email, phone: "8095551234" });

describe("marketplace y embajadores", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (o: { verified?: boolean; role?: string } = {}) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona Prueba" } }));
    if (o.verified !== false) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (o.role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, o.role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string, email };
  };
  /** Tienda aprobada. */
  const vendor = async (name: string, rate?: number) => {
    const u = await account();
    expect((await call("POST", "/marketplace/vendors/apply", { token: u.token, payload: { name: `${name} ${tag}`, city: "Santiago" } })).statusCode).toBe(201);
    const set = await call("PATCH", `/admin/marketplace/vendors/${u.id}`, { token: admin, payload: { status: "active", ...(rate !== undefined ? { commission_rate: rate } : {}) } });
    expect(set.statusCode).toBe(200);
    return u;
  };
  /** Producto publicado. */
  const product = async (v: { token: string }, over: object = {}) => {
    const p = json(await call("POST", "/partner/marketplace/products", { token: v.token, payload: { name: `Producto ${tag} ${k++}`, category: "artesania", price: 1000, stock: 10, description: "Hecho a mano", ...over } })).data;
    expect((await call("POST", `/admin/marketplace/products/${p.id}/review`, { token: admin, payload: { decision: "approve" } })).statusCode).toBe(200);
    return p as { id: string; slug: string };
  };
  const buy = (items: { product_id: string; quantity: number }[], o: { token?: string; pay?: string; ref?: string; email?: string; noShip?: boolean } = {}) =>
    call("POST", "/marketplace/orders", { token: o.token, headers: { "idempotency-key": `mp-key-${Date.now()}-${k++}` }, payload: { items, contact: contact(o.email), ...(o.noShip ? {} : { shipping }), payment_method_token: o.pay ?? "tok_test_ok", ...(o.ref ? { ref_code: o.ref } : {}) } });
  const stockOf = async (id: string) => Number((await pool.query("SELECT stock FROM marketplace_products WHERE id = $1", [id])).rows[0].stock);

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account({ role: "admin" })).token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("vendedores y catálogo", () => {
    it("solicitud con correo verificado, aprobación del equipo y suspensión", async () => {
      const unverified = await account({ verified: false });
      expect((await call("POST", "/marketplace/vendors/apply", { token: unverified.token, payload: { name: `Sin verificar ${tag}` } })).statusCode).toBe(403);
      const u = await account();
      const applied = await call("POST", "/marketplace/vendors/apply", { token: u.token, payload: { name: `Artesanías del Valle ${tag}`, city: "Jarabacoa", phone: "8095550000" } });
      expect(applied.statusCode).toBe(201);
      expect(json(applied).data).toMatchObject({ status: "pending", commission_rate: 15 });
      expect((await call("POST", "/marketplace/vendors/apply", { token: u.token, payload: { name: "Otra vez" } })).statusCode).toBe(409);
      expect(json(await call("POST", "/partner/marketplace/products", { token: u.token, payload: { name: "Collar", category: "joyeria", price: 500 } })).error.details.code).toBe("NOT_VENDOR");
      expect((await call("PATCH", `/admin/marketplace/vendors/${u.id}`, { token: u.token, payload: { status: "active" } })).statusCode).toBe(403);
      expect(json(await call("PATCH", `/admin/marketplace/vendors/${u.id}`, { token: admin, payload: { status: "active", commission_rate: 12 } })).data).toMatchObject({ status: "active", commission_rate: 12 });
      const shop = json(await call("GET", "/marketplace/vendors/me", { token: u.token })).data;
      expect(json(await call("GET", `/marketplace/vendors/${shop.slug}`)).data.name).toBe(`Artesanías del Valle ${tag}`);
      await call("PATCH", `/admin/marketplace/vendors/${u.id}`, { token: admin, payload: { status: "suspended", note: "Quejas" } });
      expect((await call("GET", `/marketplace/vendors/${shop.slug}`)).statusCode).toBe(404);
      expect((await call("GET", "/marketplace/vendors/me")).statusCode).toBe(401);
    });

    it("los productos pasan por revisión; precio y stock cambian al instante, el contenido vuelve a revisión", async () => {
      const v = await vendor("Cacao");
      const created = json(await call("POST", "/partner/marketplace/products", { token: v.token, payload: { name: `Cacao orgánico ${tag}`, category: "cafe-cacao-ron", price: 450, stock: 20, description: "Cacao de Duarte" } })).data;
      expect(created.status).toBe("pending_review");
      const publicList = async (q: string) => json(await call("GET", `/marketplace/products?q=${encodeURIComponent(q)}&per_page=100`)).data as { id: string }[];
      expect((await publicList(`Cacao orgánico ${tag}`)).some((p) => p.id === created.id)).toBe(false);
      expect((await call("GET", `/marketplace/products/${created.slug}`)).statusCode).toBe(404);
      expect((await call("POST", `/admin/marketplace/products/${created.id}/review`, { token: v.token, payload: { decision: "approve" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/marketplace/products/${created.id}/review`, { token: admin, payload: { decision: "reject" } })).statusCode).toBe(400); // rechazar exige motivo
      await call("POST", `/admin/marketplace/products/${created.id}/review`, { token: admin, payload: { decision: "approve" } });
      const detail = json(await call("GET", `/marketplace/products/${created.slug}`)).data;
      expect(detail).toMatchObject({ price: 450, currency: "DOP", in_stock: true, kind: "product" });
      expect(detail.price_usd).toBeCloseTo(450 / 59.8, 1);
      expect(detail.vendor.name).toContain("Cacao");
      expect((await publicList(`Cacao orgánico ${tag}`)).some((p) => p.id === created.id)).toBe(true);

      const quick = json(await call("PATCH", `/partner/marketplace/products/${created.id}`, { token: v.token, payload: { price: 500, stock: 8 } })).data;
      expect(quick).toMatchObject({ status: "published", price: 500, stock: 8 });
      const edited = json(await call("PATCH", `/partner/marketplace/products/${created.id}`, { token: v.token, payload: { name: `Cacao premium ${tag}` } })).data;
      expect(edited.status).toBe("pending_review");
      expect((await call("GET", `/marketplace/products/${created.slug}`)).statusCode).toBe(404);

      const other = await vendor("Otra tienda");
      expect((await call("PATCH", `/partner/marketplace/products/${created.id}`, { token: other.token, payload: { price: 1 } })).statusCode).toBe(404); // no es suyo
      expect((await call("DELETE", `/partner/marketplace/products/${created.id}`, { token: v.token })).statusCode).toBe(204);
      expect(json(await call("GET", "/partner/marketplace/products", { token: v.token })).data).toHaveLength(0);
      const cats = json(await call("GET", "/marketplace/categories")).data as { category: string }[];
      expect(Array.isArray(cats)).toBe(true);
    });
  });

  describe("pedidos", () => {
    it("un pedido con dos vendedores descuenta stock, guarda la comisión de cada uno y es idempotente", async () => {
      const a = await vendor("Vendedor A", 10), b = await vendor("Vendedor B", 20);
      const pa = await product(a, { price: 1200, stock: 5 }), pb = await product(b, { price: 800, stock: 5 });
      const q = json(await call("POST", "/marketplace/checkout/quote", { payload: { items: [{ product_id: pa.id, quantity: 2 }, { product_id: pb.id, quantity: 1 }] } })).data;
      expect(q).toMatchObject({ subtotal: 3200, total: 3200, needs_shipping: true });
      const key = `mp-idem-${tag}`;
      const payload = { items: [{ product_id: pa.id, quantity: 2 }, { product_id: pb.id, quantity: 1 }], contact: contact(), shipping, payment_method_token: "tok_test_ok" };
      const res = await call("POST", "/marketplace/orders", { headers: { "idempotency-key": key }, payload });
      expect(res.statusCode).toBe(201);
      const { order, access_token } = json(res).data;
      expect(order).toMatchObject({ status: "paid", payment_status: "paid", total: 3200, amount_paid: 3200 });
      expect(order.items).toHaveLength(2);
      expect(await stockOf(pa.id)).toBe(3);
      expect(await stockOf(pb.id)).toBe(4);
      const rows = (await pool.query("SELECT name, line_total, commission_rate, commission, vendor_net FROM marketplace_order_items WHERE order_id = $1 ORDER BY line_total DESC", [order.id])).rows;
      expect(rows.map((r) => [Number(r.line_total), Number(r.commission_rate), Number(r.commission), Number(r.vendor_net)])).toEqual([[2400, 10, 240, 2160], [800, 20, 160, 640]]);
      const again = await call("POST", "/marketplace/orders", { headers: { "idempotency-key": key }, payload });
      expect(again.statusCode).toBe(200);
      expect(json(again).data).toMatchObject({ replayed: true, order: { id: order.id } });
      expect(await stockOf(pa.id)).toBe(3);
      // Acceso del invitado por token; sin token no.
      expect((await call("GET", `/marketplace/orders/${order.id}?token=${access_token}`)).statusCode).toBe(200);
      expect((await call("GET", `/marketplace/orders/${order.id}`)).statusCode).toBe(404);
      // Cada vendedor recibió su aviso.
      const mails = (await pool.query("SELECT count(*)::int AS n FROM email_log WHERE template = 'vendor.new_order' AND created_at > now() - interval '1 minute'")).rows[0].n;
      expect(mails).toBeGreaterThanOrEqual(2);
    });

    it("valida: dirección para productos, stock, productos no publicados y pago rechazado (que devuelve el stock)", async () => {
      const v = await vendor("Validaciones");
      const p = await product(v, { price: 500, stock: 2 });
      const exp = await product(v, { kind: "experience", category: "experiencia", price: 900, stock: 4 });
      expect((await buy([{ product_id: p.id, quantity: 1 }], { noShip: true })).statusCode).toBe(400);
      expect((await buy([{ product_id: exp.id, quantity: 1 }], { noShip: true })).statusCode).toBe(201); // una experiencia no necesita dirección
      const over = await buy([{ product_id: p.id, quantity: 3 }]);
      expect(over.statusCode).toBe(422);
      expect(json(over).error.details).toMatchObject({ code: "STOCK_INSUFFICIENT", items: [{ product_id: p.id, available: 2 }] });
      const pending = json(await call("POST", "/partner/marketplace/products", { token: v.token, payload: { name: `Pendiente ${tag}`, category: "arte", price: 100, stock: 3 } })).data;
      expect((await buy([{ product_id: pending.id, quantity: 1 }])).statusCode).toBe(422);
      const declined = await buy([{ product_id: p.id, quantity: 2 }], { pay: "tok_test_declined" });
      expect(declined.statusCode).toBe(402);
      expect(await stockOf(p.id)).toBe(2);
      expect((await buy([{ product_id: p.id, quantity: 1 }], { pay: "tok_test_error" })).statusCode).toBe(502);
      expect(await stockOf(p.id)).toBe(2);
      expect((await call("POST", "/marketplace/orders", { payload: { items: [{ product_id: p.id, quantity: 1 }], contact: contact(), shipping, payment_method_token: "tok_test_ok" } })).statusCode).toBe(400); // sin Idempotency-Key
    });

    it("los dos compiten por la última unidad: sólo uno la compra", async () => {
      const v = await vendor("Carrera");
      const p = await product(v, { price: 300, stock: 1 });
      const res = await Promise.all([buy([{ product_id: p.id, quantity: 1 }]), buy([{ product_id: p.id, quantity: 1 }])]);
      expect(res.map((x) => x.statusCode).sort()).toEqual([201, 422]);
      expect(await stockOf(p.id)).toBe(0);
    });

    it("el envío y la entrega se registran por artículo; el pedido pasa a processing y luego a completed", async () => {
      const a = await vendor("Envío A"), b = await vendor("Envío B");
      const pa = await product(a, { price: 700 }), pb = await product(b, { price: 900 });
      const buyer = await account();
      const order = json(await buy([{ product_id: pa.id, quantity: 1 }, { product_id: pb.id, quantity: 1 }], { token: buyer.token })).data.order;
      const itemA = order.items.find((i: { vendor_name: string }) => i.vendor_name.startsWith("Envío A"));
      const itemB = order.items.find((i: { vendor_name: string }) => i.vendor_name.startsWith("Envío B"));
      const ship = (v: { token: string }, id: string, payload: object) => call("PATCH", `/partner/marketplace/order-items/${id}`, { token: v.token, payload });
      expect((await ship(b, itemA.id, { status: "delivered" })).statusCode).toBe(404); // no es su artículo
      expect((await ship(a, itemA.id, { status: "shipped" })).statusCode).toBe(400);   // falta guía
      expect((await ship(a, itemA.id, { status: "shipped", courier_name: "Vimenpaq", tracking_number: "VP123" })).statusCode).toBe(200);
      expect(json(await call("GET", `/me/marketplace/orders`, { token: buyer.token })).data[0]).toMatchObject({ id: order.id, status: "processing" });
      expect(json(await ship(a, itemA.id, { status: "shipped", tracking_number: "X" })).error.details.code).toBe("INVALID_TRANSITION");
      // Con un artículo ya enviado el cliente no puede cancelar todo el pedido.
      expect(json(await call("POST", `/marketplace/orders/${order.id}/cancel`, { token: buyer.token })).error.details.code).toBe("INVALID_STATE");
      expect((await ship(a, itemA.id, { status: "delivered" })).statusCode).toBe(200);
      await ship(b, itemB.id, { status: "shipped", tracking_number: "VP999" });
      await ship(b, itemB.id, { status: "delivered" });
      const done = json(await call("GET", `/marketplace/orders/${order.id}`, { token: buyer.token })).data;
      expect(done.status).toBe("completed");
      expect(done.items.find((i: { id: string }) => i.id === itemA.id)).toMatchObject({ fulfillment_status: "delivered", tracking_number: "VP123", courier_name: "Vimenpaq" });
      const mine = json(await call("GET", "/partner/marketplace/orders?per_page=100", { token: a.token })).data as { id: string; address: string; customer_name: string }[];
      expect(mine.map((x) => x.id)).toContain(itemA.id);
      expect(mine.map((x) => x.id)).not.toContain(itemB.id);
      expect(mine.find((x) => x.id === itemA.id)).toMatchObject({ address: shipping.address, customer_name: "Comprador Prueba" });
    });

    it("el cliente cancela lo que no salió (reembolso y stock) y el vendedor cancela un artículo que no puede surtir", async () => {
      const a = await vendor("Cancela A"), b = await vendor("Cancela B");
      const pa = await product(a, { price: 600, stock: 5 }), pb = await product(b, { price: 400, stock: 5 });
      const buyer = await account();
      const o1 = json(await buy([{ product_id: pa.id, quantity: 2 }], { token: buyer.token })).data.order;
      expect(await stockOf(pa.id)).toBe(3);
      const cancelled = json(await call("POST", `/marketplace/orders/${o1.id}/cancel`, { token: buyer.token, payload: { reason: "Me arrepentí" } })).data;
      expect(cancelled).toMatchObject({ status: "cancelled", payment_status: "refunded", refund_amount: 1200 });
      expect(await stockOf(pa.id)).toBe(5);
      expect((await call("POST", `/marketplace/orders/${o1.id}/cancel`, { token: buyer.token })).statusCode).toBe(422);

      const o2 = json(await buy([{ product_id: pa.id, quantity: 1 }, { product_id: pb.id, quantity: 1 }], { token: buyer.token })).data.order;
      const itemB = o2.items.find((i: { vendor_name: string }) => i.vendor_name.startsWith("Cancela B"));
      expect((await call("POST", `/partner/marketplace/order-items/${itemB.id}/cancel`, { token: a.token })).statusCode).toBe(404);
      const after = json(await call("POST", `/partner/marketplace/order-items/${itemB.id}/cancel`, { token: b.token })).data;
      expect(after).toMatchObject({ status: "paid", payment_status: "partial", refund_amount: 400 });
      expect(after.items.find((i: { id: string }) => i.id === itemB.id).fulfillment_status).toBe("cancelled");
      expect(await stockOf(pb.id)).toBe(5);
      expect((await call("POST", `/partner/marketplace/order-items/${itemB.id}/cancel`, { token: b.token })).statusCode).toBe(422);
    });

    it("los pedidos sin cobrar vencen y devuelven el stock", async () => {
      const v = await vendor("Vence");
      const p = await product(v, { stock: 3 });
      const o = (await pool.query("INSERT INTO marketplace_orders (customer_name, customer_email, total_amount, status, created_at) VALUES ('X','vence@test.local', 1000, 'pending', now() - interval '3 hours') RETURNING id")).rows[0];
      await pool.query("INSERT INTO marketplace_order_items (order_id, item_id, vendor_id, product_id, name, quantity, price_unit, line_total) VALUES ($1,$2,$3,$2,'x',2,500,1000)", [o.id, p.id, v.id]);
      await pool.query("UPDATE marketplace_products SET stock = 1 WHERE id = $1", [p.id]);
      expect(await app.marketplace.cancelUnpaid(60)).toBeGreaterThanOrEqual(1);
      expect(await stockOf(p.id)).toBe(3);
      expect((await pool.query("SELECT status FROM marketplace_orders WHERE id = $1", [o.id])).rows[0].status).toBe("cancelled");
    });
  });

  describe("liquidaciones a vendedores", () => {
    it("liquida sólo lo entregado y sin devolución; una vez; y una liquidación fallida libera los artículos", async () => {
      const v = await vendor("Liquida", 10);
      const p = await product(v, { price: 1000, stock: 20 });
      const deliver = async (qty: number) => {
        const o = json(await buy([{ product_id: p.id, quantity: qty }])).data.order;
        const id = o.items[0].id as string;
        await call("PATCH", `/partner/marketplace/order-items/${id}`, { token: v.token, payload: { status: "shipped", tracking_number: "T1" } });
        await call("PATCH", `/partner/marketplace/order-items/${id}`, { token: v.token, payload: { status: "delivered" } });
        return { order: o.id as string, item: id };
      };
      const d1 = await deliver(2), d2 = await deliver(1), d3 = await deliver(1);
      const sent = json(await buy([{ product_id: p.id, quantity: 1 }])).data.order;   // sin entregar: no se liquida
      void sent;
      // Un reembolso antes de liquidar excluye el artículo.
      expect((await call("POST", `/admin/marketplace/orders/${d3.order}/refund`, { token: admin, payload: { item_id: d3.item, reason: "Devuelto" } })).statusCode).toBe(200);
      const bal = json(await call("GET", "/partner/payouts", { token: v.token })).data.balance;
      expect(bal).toMatchObject({ to_settle: 2700, in_progress: 900 });   // (2000 + 1000) − 10 % ; el entregado con espera todavía cuenta
      const before = await app.marketplace.generatePayouts();             // con la ventana de 3 días no hay nada
      expect(before.payouts).toBe(0);
      const gen = await app.marketplace.generatePayouts(0);
      expect(gen.payouts).toBeGreaterThanOrEqual(1);
      const list = json(await call("GET", "/partner/payouts", { token: v.token })).data.payouts as { id: string; amount: number; gross: number; commission: number; item_count: number; status: string }[];
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ amount: 2700, gross: 3000, commission: 300, item_count: 2, status: "pending" });
      expect((await app.marketplace.generatePayouts(0)).payouts).toBe(0);
      // Ya liquidado: no se puede reembolsar el artículo.
      const settled = await call("POST", `/admin/marketplace/orders/${d1.order}/refund`, { token: admin, payload: { item_id: d1.item, reason: "Tarde" } });
      expect(settled.statusCode).toBe(422);
      expect(json(settled).error.details.code).toBe("ITEM_ALREADY_SETTLED");
      // Fallida: los artículos vuelven a estar disponibles para un nuevo lote.
      expect((await call("PATCH", `/admin/marketplace/payouts/${list[0]!.id}`, { token: v.token, payload: { status: "failed" } })).statusCode).toBe(403);
      expect((await call("PATCH", `/admin/marketplace/payouts/${list[0]!.id}`, { token: admin, payload: { status: "paid" } })).statusCode).toBe(400);
      expect((await call("PATCH", `/admin/marketplace/payouts/${list[0]!.id}`, { token: admin, payload: { status: "failed" } })).statusCode).toBe(200);
      expect((await call("PATCH", `/admin/marketplace/payouts/${list[0]!.id}`, { token: admin, payload: { status: "failed" } })).statusCode).toBe(422);
      const again = await app.marketplace.generatePayouts(0);
      expect(again.payouts).toBeGreaterThanOrEqual(1);
      const second = (await pool.query("SELECT id FROM vendor_payments WHERE partner_id = $1 AND status = 'pending'", [v.id])).rows[0].id;
      const paid = json(await call("PATCH", `/admin/marketplace/payouts/${second}`, { token: admin, payload: { status: "paid", reference: "TRF-001" } })).data;
      expect(paid).toMatchObject({ status: "paid", amount: 2700, reference: "TRF-001" });
      expect(json(await call("GET", "/admin/marketplace/payouts?status=paid", { token: admin })).data.some((x: { id: string }) => x.id === second)).toBe(true);
      expect(json(await call("GET", "/admin/marketplace/orders?status=completed", { token: admin })).data.length).toBeGreaterThan(0);
    });
  });

  describe("embajadores", () => {
    const applyAndApprove = async (over: { rate?: number } = {}) => {
      const u = await account();
      const applied = await call("POST", "/ambassadors/apply", { token: u.token, payload: { motivation: "Tengo un blog de viajes por el Caribe con miles de lectores.", audience: "Viajeros", social_links: { instagram: "https://instagram.com/viajero" } } });
      expect(applied.statusCode).toBe(201);
      const set = await call("PATCH", `/admin/ambassadors/${u.id}`, { token: admin, payload: { status: "approved", ...(over.rate !== undefined ? { commission_override: over.rate } : {}) } });
      expect(set.statusCode).toBe(200);
      const me = json(await call("GET", "/ambassadors/me", { token: u.token })).data;
      return { ...u, code: me.referral_code as string };
    };
    const storeProduct = async (price: number) => json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `amb-${tag}-${k++}`, name: `Producto embajador ${k}`, category: "poster", price, stock: 50 } })).data as { id: string };
    const storeOrder = async (productId: string, o: { ref?: string; token?: string; email?: string } = {}) => {
      const cart = json(await call("POST", "/cart/items", { token: o.token, payload: { product_id: productId, quantity: 1 } })).data.cart_token as string | undefined;
      const res = await call("POST", "/orders", { token: o.token, headers: { "idempotency-key": `amb-key-${Date.now()}-${k++}`, ...(cart ? { "x-cart-token": cart } : {}) }, payload: { contact: contact(o.email), shipping, payment_method_token: "tok_test_ok", ...(o.ref ? { ref_code: o.ref } : {}) } });
      expect(res.statusCode).toBe(201);
      return json(res).data.order as { id: string; total: number };
    };
    const referral = async (source: string, id: string) => (await pool.query("SELECT * FROM ambassador_referrals WHERE source_type = $1 AND source_id = $2", [source, id])).rows[0];

    it("la solicitud exige correo verificado, se aprueba por el equipo y da un código y el rol", async () => {
      const unverified = await account({ verified: false });
      expect((await call("POST", "/ambassadors/apply", { token: unverified.token, payload: { motivation: "Quiero ser embajador de Descubre RD porque me encanta." } })).statusCode).toBe(403);
      const u = await account();
      expect((await call("POST", "/ambassadors/apply", { token: u.token, payload: { motivation: "corto" } })).statusCode).toBe(400);
      expect((await call("POST", "/ambassadors/apply", { token: u.token, payload: { motivation: "Comparto mis viajes por la isla en redes y en mi blog." } })).statusCode).toBe(201);
      expect((await call("POST", "/ambassadors/apply", { token: u.token, payload: { motivation: "Comparto mis viajes por la isla en redes y en mi blog." } })).statusCode).toBe(409);
      let me = json(await call("GET", "/ambassadors/me", { token: u.token })).data;
      expect(me).toMatchObject({ status: "pending", tier: "bronze", commission_rate: 5, sales_count: 0 });
      expect(me.referral_code).toMatch(/^EMB-[2-9A-Z]{6}$/);
      expect((await call("GET", "/ambassadors/me/referrals", { token: u.token })).statusCode).toBe(403);   // aún no aprobado
      expect(json(await call("GET", `/ambassadors/track?ref=${me.referral_code}`)).data.valid).toBe(false);  // pendiente: no cuenta
      expect((await call("PATCH", `/admin/ambassadors/${u.id}`, { token: u.token, payload: { status: "approved" } })).statusCode).toBe(403);
      expect(json(await call("GET", "/admin/ambassadors?status=pending", { token: admin })).data.some((x: { id: string }) => x.id === u.id)).toBe(true);
      await call("PATCH", `/admin/ambassadors/${u.id}`, { token: admin, payload: { status: "approved", note: "Bienvenido" } });
      me = json(await call("GET", "/ambassadors/me", { token: u.token })).data;
      expect(me.status).toBe("approved");
      expect((await pool.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'ambassador'", [u.id])).rowCount).toBe(1);
      expect(json(await call("GET", `/ambassadors/track?ref=${me.referral_code.toLowerCase()}`)).data).toMatchObject({ valid: true, cookie_days: 30 });
      expect(json(await call("GET", "/ambassadors/track?ref=EMB-NOEXISTE")).data.valid).toBe(false);
      expect((await pool.query("SELECT clicks FROM ambassadors WHERE id = $1", [u.id])).rows[0].clicks).toBe(1);
      // Rechazada: puede volver a solicitar.
      const rej = await account();
      await call("POST", "/ambassadors/apply", { token: rej.token, payload: { motivation: "Quiero promocionar el turismo dominicano con mi comunidad." } });
      await call("PATCH", `/admin/ambassadors/${rej.id}`, { token: admin, payload: { status: "rejected", note: "Perfil incompleto" } });
      expect((await call("PATCH", `/admin/ambassadors/${rej.id}`, { token: admin, payload: { status: "approved" } })).statusCode).toBe(422);
      expect((await call("POST", "/ambassadors/apply", { token: rej.token, payload: { motivation: "Vuelvo a solicitarlo con más detalle de mi audiencia." } })).statusCode).toBe(201);
    });

    it("la comisión se calcula en el servidor sobre lo cobrado; se ignoran la autocompra y los códigos inválidos", async () => {
      const amb = await applyAndApprove();
      const prod = await storeProduct(4000);
      const o = await storeOrder(prod.id, { ref: amb.code, email: "cliente-emb@test.local" });
      const ref = await referral("store", o.id);
      expect(ref).toMatchObject({ status: "pending", referred_email: "cliente-emb@test.local" });
      expect(Number(ref.sale_amount)).toBe(4000);
      expect(Number(ref.commission_earned)).toBe(200);   // 5 % de bronce
      expect(Number(ref.rate)).toBe(5);
      const me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me).toMatchObject({ in_hold: 200, available: 0, total_earned: 0 });
      // Autocompra (misma cuenta o mismo correo) y código inválido: la compra sigue, sin comisión.
      const self = await storeOrder(prod.id, { ref: amb.code, token: amb.token });
      expect(await referral("store", self.id)).toBeUndefined();
      const sameMail = await storeOrder(prod.id, { ref: amb.code, email: amb.email });
      expect(await referral("store", sameMail.id)).toBeUndefined();
      const bad = await storeOrder(prod.id, { ref: "EMB-INVENTA" });
      expect(await referral("store", bad.id)).toBeUndefined();
      // Un embajador sólo aprobado atribuye: uno suspendido deja de contar.
      await call("PATCH", `/admin/ambassadors/${amb.id}`, { token: admin, payload: { status: "suspended" } });
      const susp = await storeOrder(prod.id, { ref: amb.code });
      expect(await referral("store", susp.id)).toBeUndefined();
      expect((await pool.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'ambassador'", [amb.id])).rowCount).toBe(0);
    });

    it("también se atribuyen las ventas del marketplace, y un reembolso revierte la comisión", async () => {
      const amb = await applyAndApprove({ rate: 10 });
      const v = await vendor("Con embajador");
      const p = await product(v, { price: 2000, stock: 10 });
      const o = json(await buy([{ product_id: p.id, quantity: 1 }], { ref: amb.code })).data.order;
      let ref = await referral("marketplace", o.id);
      expect(ref).toMatchObject({ status: "pending" });
      expect(Number(ref.commission_earned)).toBe(200);   // 10 % (comisión especial)
      const refunded = await call("POST", `/admin/marketplace/orders/${o.id}/refund`, { token: admin, payload: { reason: "Producto dañado" } });
      expect(refunded.statusCode).toBe(200);
      ref = await referral("marketplace", o.id);
      expect(ref.status).toBe("reversed");
      expect(Number(ref.commission_earned)).toBe(0);
      const me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me).toMatchObject({ in_hold: 0, available: 0 });
      // Tienda: un reembolso parcial reduce la base; el total la revierte.
      const prod = await storeProduct(3000);
      const so = await storeOrder(prod.id, { ref: amb.code });
      expect(Number((await referral("store", so.id)).commission_earned)).toBe(300);
      await call("POST", `/admin/store/orders/${so.id}/refund`, { token: admin, payload: { amount: 1000, reason: "Ajuste parcial" } });
      expect(Number((await referral("store", so.id)).commission_earned)).toBe(200);
      await call("POST", `/admin/store/orders/${so.id}/refund`, { token: admin, payload: { reason: "Devolución completa" } });
      expect((await referral("store", so.id)).status).toBe("reversed");
    });

    it("las comisiones salen de la espera, se piden en un pago (mínimo RD$ 1 000) y el equipo lo marca pagado o fallido", async () => {
      const amb = await applyAndApprove();
      const prod = await storeProduct(20_000);                       // 5 % = RD$ 1 000
      const small = await storeProduct(2_000);                       // RD$ 100
      const o1 = await storeOrder(prod.id, { ref: amb.code });
      const o2 = await storeOrder(small.id, { ref: amb.code });
      expect((await app.ambassadors.settle()).approved).toBe(0);     // la espera de 7 días no terminó
      await pool.query("UPDATE ambassador_referrals SET hold_until = now() - interval '1 minute' WHERE source_id = ANY($1)", [[o1.id, o2.id]]);
      expect((await app.ambassadors.settle()).approved).toBeGreaterThanOrEqual(2);
      let me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me).toMatchObject({ available: 1100, total_earned: 1100, sales_count: 2, in_hold: 0 });
      expect(json(await call("POST", "/ambassadors/me/payouts/request", { token: amb.token, payload: {} })).error.details.code).toBe("PAYOUT_METHOD_REQUIRED");
      const list = json(await call("GET", "/ambassadors/me/referrals", { token: amb.token })).data as { buyer: string; commission: number; status: string }[];
      expect(list).toHaveLength(2);
      expect(list[0]!.buyer).toMatch(/^co\*\*\*@test\.local$/);      // el comprador va enmascarado
      const req = await call("POST", "/ambassadors/me/payouts/request", { token: amb.token, payload: { method: "bank_transfer", details: "Banreservas 0123456789 Ana Pérez" } });
      expect(req.statusCode).toBe(201);
      expect(json(req).data).toMatchObject({ amount: 1100, commissions: 2 });
      me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me).toMatchObject({ available: 0, requested: 1100, payout_method: "bank_transfer" });
      expect(json(await call("POST", "/ambassadors/me/payouts/request", { token: amb.token, payload: null })).error.details.code).toBe("BELOW_MINIMUM");
      // Con el pago pendiente, un reembolso no toca lo que ya está en la solicitud.
      await call("POST", `/admin/store/orders/${o2.id}/refund`, { token: admin, payload: { reason: "Devolución" } });
      expect((await referral("store", o2.id)).status).toBe("requested");

      const payout = json(await call("GET", "/admin/ambassadors/payouts?status=pending", { token: admin })).data.find((x: { ambassador_id: string }) => x.ambassador_id === amb.id);
      expect(payout).toMatchObject({ amount: 1100, status: "pending", payout_method: "bank_transfer" });
      expect((await call("PATCH", `/admin/ambassadors/payouts/${payout.id}`, { token: amb.token, payload: { status: "paid", reference: "X-1" } })).statusCode).toBe(403);
      expect((await call("PATCH", `/admin/ambassadors/payouts/${payout.id}`, { token: admin, payload: { status: "paid" } })).statusCode).toBe(400);
      expect((await call("PATCH", `/admin/ambassadors/payouts/${payout.id}`, { token: admin, payload: { status: "failed", note: "Cuenta inválida" } })).statusCode).toBe(200);
      me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me).toMatchObject({ available: 1100, requested: 0 });     // vuelve a estar disponible
      const again = json(await call("POST", "/ambassadors/me/payouts/request", { token: amb.token, payload: {} })).data;
      const ok = await call("PATCH", `/admin/ambassadors/payouts/${again.id}`, { token: admin, payload: { status: "paid", reference: "TRF-778" } });
      expect(json(ok).data).toMatchObject({ status: "paid", reference: "TRF-778" });
      expect((await call("PATCH", `/admin/ambassadors/payouts/${again.id}`, { token: admin, payload: { status: "failed" } })).statusCode).toBe(422);
      me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me).toMatchObject({ paid: 1100, available: 0, requested: 0 });
      expect(json(await call("GET", "/ambassadors/me/payouts", { token: amb.token })).data.map((p: { status: string }) => p.status).sort()).toEqual(["failed", "paid"]);
      const mail = (await pool.query("SELECT count(*)::int AS n FROM email_log WHERE template = 'ambassador.payout' AND created_at > now() - interval '1 minute'")).rows[0].n;
      expect(mail).toBeGreaterThanOrEqual(1);
    });

    it("el nivel sube con las ventas y la comisión se congela al momento de la venta", async () => {
      const amb = await applyAndApprove();
      const prod = await storeProduct(1000);
      const first = await storeOrder(prod.id, { ref: amb.code });
      await pool.query("UPDATE ambassadors SET sales_count = 10 WHERE id = $1", [amb.id]);   // llega a plata
      const second = await storeOrder(prod.id, { ref: amb.code });
      expect(Number((await referral("store", first.id)).rate)).toBe(5);
      expect(Number((await referral("store", second.id)).rate)).toBe(7);
      const me = json(await call("GET", "/ambassadors/me", { token: amb.token })).data;
      expect(me.next_tier).toBeTruthy();
    });
  });
});
