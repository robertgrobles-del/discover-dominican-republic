import { createHmac } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0, k = 0;
const uniq = () => `st${Date.now().toString(36)}${n++}@test.local`;
const contact = (email = "cliente@test.local") => ({ name: "Cliente Tienda", email, phone: "8095551234" });
const shipping = { address: "Calle Duarte 15, Ensanche Naco", city: "Santo Domingo", province: "Distrito Nacional" };

describe("tienda oficial", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  let poster: { id: string; slug: string };   // RD$ 1 200, sin variantes
  let shirt: { id: string; slug: string };    // RD$ 1 500, tallas y colores
  let cap: { id: string; slug: string };      // RD$ 900

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; cart?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...(opts.cart ? { "x-cart-token": opts.cart } : {}), ...opts.headers } });
  const signup = async () => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const mkProduct = async (over: object) => json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `p-${tag}-${Math.random().toString(36).slice(2, 7)}`, name: "Producto", category: "poster", price: 1000, stock: 10, ...over } })).data;
  const add = (product: string, cart?: string, over: object = {}, token?: string) => call("POST", "/cart/items", { cart, token, payload: { product_id: product, quantity: 1, ...over } });
  const order = (opts: { cart?: string; token?: string; coupon?: string; pay?: string; email?: string; key?: string } = {}) =>
    call("POST", "/orders", { cart: opts.cart, token: opts.token, headers: { "idempotency-key": opts.key ?? `ord-key-${Date.now()}-${k++}` }, payload: { contact: contact(opts.email), shipping, payment_method_token: opts.pay ?? "tok_test_ok", ...(opts.coupon ? { coupon_code: opts.coupon } : {}) } });
  const stockOf = async (id: string) => Number((await pool.query("SELECT stock FROM store_products WHERE id = $1", [id])).rows[0].stock);
  /** Carrito de invitado con un producto; devuelve su token. */
  const guestCart = async (product: string, qty = 1, over: object = {}) => json(await add(product, undefined, { quantity: qty, ...over })).data.cart_token as string;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email: a.email, password: PW } })).data.tokens.access_token;
    poster = await mkProduct({ name: `Póster Samaná ${tag}`, price: 1200, stock: 50, featured: true, tagline: "Ballenas jorobadas", category: "poster" });
    shirt = await mkProduct({ name: `Camiseta ${tag}`, category: "ropa", price: 1500, stock: 30, sizes: ["S", "M", "L"], colors: ["azul", "blanco"] });
    cap = await mkProduct({ name: `Gorra ${tag}`, category: "accesorios", price: 900, stock: 40 });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("catálogo", () => {
    it("lista con filtros, muestra USD y oculta lo inactivo o borrado", async () => {
      const list = json(await call("GET", `/store/products?q=${encodeURIComponent(`Samaná ${tag}`)}`));
      expect(list.data).toHaveLength(1);
      expect(list.data[0]).toMatchObject({ slug: poster.slug, price: 1200, currency: "DOP", in_stock: true, featured: true });
      expect(list.data[0].price_usd).toBeCloseTo(1200 / 59.8, 1);
      expect(json(await call("GET", "/store/products?category=ropa&per_page=100")).data.every((p: { category: string }) => p.category === "ropa")).toBe(true);
      expect(json(await call("GET", "/store/products?featured=true&per_page=100")).data.some((p: { id: string }) => p.id === poster.id)).toBe(true);
      const hidden = await mkProduct({ name: `Oculto ${tag}`, active: false });
      const gone = await mkProduct({ name: `Borrado ${tag}` });
      await call("DELETE", `/admin/store/products/${gone.id}`, { token: admin });
      const all = json(await call("GET", `/store/products?q=${tag}&per_page=100`)).data.map((p: { id: string }) => p.id);
      expect(all).not.toContain(hidden.id);
      expect(all).not.toContain(gone.id);
      expect((await call("GET", `/store/products/${hidden.slug}`)).statusCode).toBe(404);
      expect((await call("GET", `/store/products/${poster.slug}`)).statusCode).toBe(200);
      expect(json(await call("GET", "/store/categories")).data.map((c: { category: string }) => c.category)).toEqual(expect.arrayContaining(["poster", "ropa"]));
    });

    it("sólo el admin edita el catálogo y los slugs son únicos", async () => {
      const u = await signup();
      expect((await call("POST", "/admin/store/products", { token: u.token, payload: { slug: "x-x", name: "Xx", category: "poster", price: 1 } })).statusCode).toBe(403);
      expect((await call("POST", "/admin/store/products", { token: admin, payload: { slug: poster.slug, name: "Repetido", category: "poster", price: 1 } })).statusCode).toBe(409);
      expect((await call("POST", "/admin/store/products", { token: admin, payload: { slug: "malo-1", name: "Malo", category: "coches", price: 1 } })).statusCode).toBe(400);
      expect((await call("PATCH", `/admin/store/products/${cap.id}`, { token: admin, payload: { price: 950, inventado: 1 } })).statusCode).toBe(400);
      expect((await call("PATCH", `/admin/store/products/${cap.id}`, { token: admin, payload: { price: 950 } })).statusCode).toBe(200);
      await call("PATCH", `/admin/store/products/${cap.id}`, { token: admin, payload: { price: 900 } });
    });
  });

  describe("carrito", () => {
    it("un invitado recibe su token, exige variantes y respeta el stock", async () => {
      expect((await add(shirt.id)).statusCode).toBe(400); // falta talla y color
      expect((await add(shirt.id, undefined, { size: "XXL", color: "azul" })).statusCode).toBe(400);
      const res = await add(shirt.id, undefined, { size: "M", color: "azul", quantity: 2 });
      expect(res.statusCode).toBe(201);
      const token = json(res).data.cart_token as string;
      expect(token).toBeTruthy();
      const cart = json(await call("GET", "/cart", { cart: token })).data;
      expect(cart).toMatchObject({ count: 2, subtotal: 3000 });
      expect(cart.items[0]).toMatchObject({ size: "M", color: "azul", quantity: 2, unit_price: 1500, line_total: 3000 });
      expect(json(await call("GET", "/cart")).data.count).toBe(0); // sin token no ve nada
      expect(json(await call("GET", "/cart", { cart: "inventado" })).data.count).toBe(0);

      const again = json(await add(shirt.id, token, { size: "M", color: "azul", quantity: 1 })).data;
      expect(again.cart.count).toBe(3);
      expect(again.cart_token).toBeNull(); // el token sólo se entrega al crear el carrito
      const limited = await mkProduct({ name: `Limitado ${tag}`, stock: 3 });
      const over = await add(limited.id, token, { quantity: 4 });
      expect(over.statusCode).toBe(422);
      expect(json(over).error.details).toMatchObject({ code: "STOCK_INSUFFICIENT", available: 3 });
      expect((await add(cap.id, token, { quantity: 21 })).statusCode).toBe(400);
    });

    it("cambiar cantidad, quitar y vaciar; un carrito ajeno no se toca", async () => {
      const token = await guestCart(cap.id, 2);
      const other = await guestCart(poster.id);
      const id = json(await call("GET", "/cart", { cart: token })).data.items[0].id;
      expect(json(await call("PATCH", `/cart/items/${id}`, { cart: token, payload: { quantity: 5 } })).data.count).toBe(5);
      expect((await call("PATCH", `/cart/items/${id}`, { cart: other, payload: { quantity: 1 } })).statusCode).toBe(404);
      expect((await call("PATCH", `/cart/items/${id}`, { cart: token, payload: { quantity: 999 } })).statusCode).toBe(400);
      expect(json(await call("DELETE", `/cart/items/${id}`, { cart: token })).data.count).toBe(0);
      await add(cap.id, token);
      expect((await call("DELETE", "/cart", { cart: token })).statusCode).toBe(204);
      expect(json(await call("GET", "/cart", { cart: token })).data.count).toBe(0);
    });

    it("al iniciar sesión se fusiona el carrito de invitado con el de la cuenta", async () => {
      const u = await signup();
      await add(cap.id, undefined, { quantity: 2 }, u.token);
      const guest = await guestCart(cap.id, 3);
      await add(poster.id, guest);
      expect((await call("POST", "/cart/merge", { token: u.token })).statusCode).toBe(400); // falta el token
      const mres = await call("POST", "/cart/merge", { token: u.token, cart: guest });
      const res = json(mres).data;
      expect(res.merged).toBe(2);
      expect(res.cart).toMatchObject({ count: 6 }); // gorras 2+3, póster 1
      expect(json(await call("GET", "/cart", { cart: guest })).data.count).toBe(0); // el carrito de invitado desaparece
      expect(json(await call("GET", "/cart", { token: u.token })).data.count).toBe(6);
    });
  });

  describe("cotización y cupones", () => {
    it("envío gratis desde RD$ 2 500, ITBIS incluido y total en USD", async () => {
      const small = await guestCart(cap.id, 1); // 900
      const q1 = json(await call("POST", "/checkout/quote", { cart: small })).data;
      expect(q1).toMatchObject({ subtotal: 900, shipping: 250, total: 1150, free_shipping_remaining: 1600, valid: true });
      expect(q1.tax_included).toBeCloseTo(1150 * 18 / 118, 2);
      expect(q1.total_usd).toBeCloseTo(1150 / 59.8, 1);
      const big = await guestCart(poster.id, 3); // 3 600
      expect(json(await call("POST", "/checkout/quote", { cart: big })).data).toMatchObject({ subtotal: 3600, shipping: 0, total: 3600, free_shipping_remaining: 0 });
      expect((await call("POST", "/checkout/quote", { cart: "vacío" })).statusCode).toBe(422);
    });

    it("cupones: porcentaje, monto fijo, mínimo, vencido, usos máximos y límite por persona", async () => {
      const mk = (payload: object) => call("POST", "/admin/discount_coupons", { token: admin, payload });
      expect((await mk({ code: `MALO${tag}`, discount_percentage: 10, discount_amount: 5 })).statusCode).toBe(400);
      expect((await mk({ code: `PCT${tag}`, discount_percentage: 10 })).statusCode).toBe(201);
      expect((await mk({ code: `PCT${tag}`, discount_percentage: 10 })).statusCode).toBe(409);
      await mk({ code: `FIJO${tag}`, discount_amount: 300, min_subtotal: 2000 });
      await mk({ code: `VENCIDO${tag}`, discount_percentage: 50, expires_at: new Date(Date.now() - 86_400_000).toISOString() });
      await mk({ code: `UNICO${tag}`, discount_percentage: 20, max_uses: 1 });
      const cart = await guestCart(poster.id, 3); // 3 600
      const quote = async (code: string) => json(await call("POST", "/checkout/quote", { cart, payload: { coupon_code: code } })).data;
      expect(await quote(`pct${tag}`)).toMatchObject({ discount: 360, total: 3240, coupon: { applied: true } }); // sin distinguir mayúsculas
      expect(await quote(`FIJO${tag}`)).toMatchObject({ discount: 300, total: 3300 });
      expect((await quote(`VENCIDO${tag}`)).coupon).toMatchObject({ applied: false, reason: expect.stringContaining("venció") });
      expect((await quote("NOEXISTE")).coupon.applied).toBe(false);
      const small = await guestCart(cap.id);
      expect(json(await call("POST", "/checkout/quote", { cart: small, payload: { coupon_code: `FIJO${tag}` } })).data.coupon.reason).toContain("mínima");
      expect(json(await call("POST", "/coupons/validate", { payload: { code: `PCT${tag}`, subtotal: 1000 } })).data).toMatchObject({ valid: true, discount: 100, type: "percent" });
      expect(json(await call("POST", "/coupons/validate", { payload: { code: `VENCIDO${tag}`, subtotal: 1000 } })).data.valid).toBe(false);
    });
  });

  describe("pedidos", () => {
    it("crea el pedido: cobra, descuenta stock, vacía el carrito, confirma por correo y da acceso con token", async () => {
      const before = await stockOf(poster.id);
      const cart = await guestCart(poster.id, 3);
      const res = await order({ cart, email: "compra@test.local" });
      expect(res.statusCode).toBe(201);
      const { order: o, access_token } = json(res).data;
      expect(o).toMatchObject({ status: "paid", payment_status: "paid", subtotal: 3600, shipping: 0, total: 3600, amount_paid: 3600, currency: "DOP" });
      expect(o.id).toMatch(/^ORD-[A-Z2-9]{8}$/);
      expect(o.items).toEqual([expect.objectContaining({ name: `Póster Samaná ${tag}`, quantity: 3, unit_price: 1200, line_total: 3600 })]);
      expect(await stockOf(poster.id)).toBe(before - 3);
      expect(json(await call("GET", "/cart", { cart })).data.count).toBe(0);
      await app.mailer.drain();
      expect(app.mailer.last("compra@test.local", "store.order_confirmation")).toBeTruthy();
      expect((await call("GET", `/orders/${o.id}`)).statusCode).toBe(404);
      expect((await call("GET", `/orders/${o.id}?token=mal-token`)).statusCode).toBe(404);
      expect((await call("GET", `/orders/${o.id}?token=${access_token}`)).statusCode).toBe(200);
      // El precio del pedido es una instantánea: cambiar el catálogo no lo altera.
      await call("PATCH", `/admin/store/products/${poster.id}`, { token: admin, payload: { price: 9999 } });
      expect(json(await call("GET", `/orders/${o.id}?token=${access_token}`)).data.total).toBe(3600);
      await call("PATCH", `/admin/store/products/${poster.id}`, { token: admin, payload: { price: 1200 } });
    });

    it("exige Idempotency-Key y un reintento devuelve el mismo pedido sin duplicar", async () => {
      const cart = await guestCart(cap.id, 1);
      expect((await call("POST", "/orders", { cart, payload: { contact: contact(), shipping, payment_method_token: "tok_test_ok" } })).statusCode).toBe(400);
      const key = `idem-${Date.now()}`;
      const a = await order({ cart, key, email: "idem@test.local" });
      const b = await order({ cart, key, email: "idem@test.local" });
      expect(a.statusCode).toBe(201);
      expect(b.statusCode).toBe(200);
      expect(json(b).data.replayed).toBe(true);
      expect(json(b).data.order.id).toBe(json(a).data.order.id);
      expect((await pool.query("SELECT count(*)::int AS n FROM store_orders WHERE idempotency_key = $1", [key])).rows[0].n).toBe(1);
    });

    it("un pago rechazado o caído no deja pedido activo: devuelve stock y cupón y conserva el carrito", async () => {
      await call("POST", "/admin/discount_coupons", { token: admin, payload: { code: `RECHAZO${tag}`, discount_percentage: 10, max_uses: 1 } });
      const before = await stockOf(cap.id);
      const cart = await guestCart(cap.id, 2);
      const declined = await order({ cart, pay: "tok_test_declined", coupon: `RECHAZO${tag}` });
      expect(declined.statusCode).toBe(402);
      expect(json(declined).error.code).toBe("PAYMENT_FAILED");
      const down = await order({ cart, pay: "tok_test_error" });
      expect(down.statusCode).toBe(502);
      expect(await stockOf(cap.id)).toBe(before);
      expect((await pool.query("SELECT uses_count FROM discount_coupons WHERE code = $1", [`RECHAZO${tag}`.toUpperCase()])).rows[0].uses_count).toBe(0);
      expect(json(await call("GET", "/cart", { cart })).data.count).toBe(2); // puede reintentar
      expect((await order({ cart, coupon: `RECHAZO${tag}`, email: "reintento@test.local" })).statusCode).toBe(201); // el cupón sigue libre
    });

    it("nunca vende más que el stock: 10 pedidos simultáneos por 3 unidades → exactamente 3", async () => {
      const scarce = await mkProduct({ name: `Escaso ${tag}`, stock: 3, price: 3000 });
      const carts = await Promise.all(Array.from({ length: 10 }, () => guestCart(scarce.id, 1)));
      const results = await Promise.all(carts.map((c, i) => order({ cart: c, email: `carrera${i}@test.local` })));
      expect(results.filter((r) => r.statusCode === 201)).toHaveLength(3);
      for (const r of results.filter((x) => x.statusCode !== 201)) { expect(r.statusCode).toBe(422); expect(json(r).error.details.code).toBe("STOCK_INSUFFICIENT"); }
      expect(await stockOf(scarce.id)).toBe(0);
      expect(Number((await pool.query("SELECT coalesce(sum(quantity), 0) AS n FROM store_order_items WHERE product_id = $1", [scarce.id])).rows[0].n)).toBe(3);
    });

    it("cupón: se cuenta al comprar, un usuario lo usa una vez y el descuento llega al pedido", async () => {
      await call("POST", "/admin/discount_coupons", { token: admin, payload: { code: `UNAVEZ${tag}`, discount_percentage: 10, per_user_limit: 1 } });
      const u = await signup();
      const c1 = json(await add(poster.id, undefined, { quantity: 2 }, u.token)).data;
      void c1;
      const first = await order({ token: u.token, coupon: `UNAVEZ${tag}` });
      expect(first.statusCode).toBe(201);
      expect(json(first).data.order).toMatchObject({ subtotal: 2400, discount: 240, total: 2160 + 250, coupon_code: `UNAVEZ${tag}`.toUpperCase() });
      await add(poster.id, undefined, { quantity: 2 }, u.token);
      const second = await order({ token: u.token, coupon: `UNAVEZ${tag}` });
      expect(second.statusCode).toBe(422);
      expect(json(second).error.details.code).toBe("COUPON_INVALID");
    });

    it("el cliente cancela antes del envío: reembolso total y stock devuelto; después ya no", async () => {
      const cart = await guestCart(cap.id, 2);
      const before = await stockOf(cap.id);
      const { order: o, access_token } = json(await order({ cart, email: "cancela@test.local" })).data;
      expect(await stockOf(cap.id)).toBe(before - 2);
      const res = json(await call("POST", `/orders/${o.id}/cancel?token=${access_token}`, { payload: { reason: "Me equivoqué" } })).data;
      expect(res).toMatchObject({ status: "cancelled", payment_status: "refunded", refund_amount: o.total });
      expect(await stockOf(cap.id)).toBe(before);
      expect((await call("POST", `/orders/${o.id}/cancel?token=${access_token}`)).statusCode).toBe(422);
      const c2 = await guestCart(cap.id, 1);
      const p2 = json(await order({ cart: c2, email: "enviado@test.local" })).data;
      await call("PATCH", `/admin/store/orders/${p2.order.id}`, { token: admin, payload: { status: "shipped", tracking_number: "T-1" } });
      expect((await call("POST", `/orders/${p2.order.id}/cancel?token=${p2.access_token}`)).statusCode).toBe(422);
    });

    it("los pedidos de una cuenta son privados y aparecen en su historial", async () => {
      const a = await signup(), b = await signup();
      await add(cap.id, undefined, {}, a.token);
      const o = json(await order({ token: a.token })).data.order;
      expect((await call("GET", `/orders/${o.id}`, { token: b.token })).statusCode).toBe(404);
      expect((await call("POST", `/orders/${o.id}/cancel`, { token: b.token })).statusCode).toBe(404);
      expect((await call("GET", `/orders/${o.id}`, { token: a.token })).statusCode).toBe(200);
      const mine = json(await call("GET", "/me/orders", { token: a.token }));
      expect(mine.meta.total).toBe(1);
      expect(json(await call("GET", "/me/orders", { token: b.token })).meta.total).toBe(0);
    });

    it("sin pedir el pago no hay pedido, y los pedidos sin cobrar vencen y liberan stock", async () => {
      const cart = await guestCart(cap.id, 1);
      const noTok = await call("POST", "/orders", { cart, headers: { "idempotency-key": `k-${Date.now()}` }, payload: { contact: contact(), shipping } });
      expect(noTok.statusCode).toBe(400);
      const before = await stockOf(cap.id);
      const o = json(await order({ cart, email: "vence@test.local" })).data.order;
      await pool.query("UPDATE store_orders SET status = 'pending', payment_status = 'unpaid', created_at = now() - interval '3 hours' WHERE id = $1", [o.id]);
      const run = await app.jobs.runNow("orders.auto_cancel");
      expect((run.result as { cancelled: number }).cancelled).toBeGreaterThanOrEqual(1);
      expect((await pool.query("SELECT status, cancel_reason FROM store_orders WHERE id = $1", [o.id])).rows[0]).toEqual({ status: "cancelled", cancel_reason: "payment_timeout" });
      expect(await stockOf(cap.id)).toBe(before); // el pedido vencido devolvió su unidad
    });
  });

  describe("administración de pedidos", () => {
    it("flujo de estados con guía, avisos por correo, devolución dentro de 72 h y reembolso parcial y total", async () => {
      const cart = await guestCart(shirt.id, 2, { size: "L", color: "blanco" }); // 3 000 → envío gratis
      const { order: o, access_token } = json(await order({ cart, email: "flujo@test.local" })).data;
      const id = o.id;
      const patch = (payload: object, token = admin) => call("PATCH", `/admin/store/orders/${id}`, { token, payload });
      expect((await patch({ status: "processing" }, (await signup()).token)).statusCode).toBe(403);
      expect((await patch({ status: "delivered" })).statusCode).toBe(422);
      expect(json(await patch({ status: "processing" })).data.status).toBe("processing");
      expect((await patch({ status: "shipped" })).statusCode).toBe(400); // sin guía
      expect(json(await patch({ status: "shipped", courier_name: "Vimenpaq", tracking_number: "VP-001" })).data).toMatchObject({ status: "shipped", tracking_number: "VP-001" });
      expect((await call("POST", `/orders/${id}/return-request?token=${access_token}`, { payload: { reason: "Talla incorrecta" } })).statusCode).toBe(422); // aún no llega
      expect(json(await patch({ status: "delivered" })).data.status).toBe("delivered");
      await app.mailer.drain();
      expect(app.mailer.outbox.some((m) => m.to === "flujo@test.local" && m.subject.includes("en camino"))).toBe(true);
      expect(json(await call("GET", `/orders/${id}?token=${access_token}`)).data.return_window_open).toBe(true);

      const ret = await call("POST", `/orders/${id}/return-request?token=${access_token}`, { payload: { reason: "Talla incorrecta, quedó grande" } });
      expect(json(ret).data.status).toBe("return_requested");

      const stock = await stockOf(shirt.id);
      const part = json(await call("POST", `/admin/store/orders/${id}/refund`, { token: admin, payload: { amount: 1000, reason: "Devolución parcial" } })).data;
      expect(part).toMatchObject({ refund_amount: 1000, payment_status: "partial", status: "return_requested" });
      expect((await call("POST", `/admin/store/orders/${id}/refund`, { token: admin, payload: { amount: 5000, reason: "demasiado" } })).statusCode).toBe(422);
      const full = json(await call("POST", `/admin/store/orders/${id}/refund`, { token: admin, payload: { restock: true, reason: "Devolución completa" } })).data;
      expect(full).toMatchObject({ status: "refunded", payment_status: "refunded", refund_amount: 3000 });
      expect(await stockOf(shirt.id)).toBe(stock + 2);
      expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'store.order_refunded' AND entity_id = $1", [id])).rowCount).toBe(2);
    });

    it("la ventana de devolución de 72 h se respeta", async () => {
      const cart = await guestCart(cap.id, 1);
      const { order: o, access_token } = json(await order({ cart, email: "tarde@test.local" })).data;
      await call("PATCH", `/admin/store/orders/${o.id}`, { token: admin, payload: { status: "shipped", tracking_number: "T-9" } });
      await call("PATCH", `/admin/store/orders/${o.id}`, { token: admin, payload: { status: "delivered" } });
      await pool.query("UPDATE store_orders SET delivered_at = now() - interval '73 hours' WHERE id = $1", [o.id]);
      const res = await call("POST", `/orders/${o.id}/return-request?token=${access_token}`, { payload: { reason: "Ya es tarde para esto" } });
      expect(res.statusCode).toBe(422);
      expect(json(res).error.details.code).toBe("RETURN_WINDOW_CLOSED");
    });

    it("lista y filtra pedidos", async () => {
      const list = json(await call("GET", "/admin/store/orders?status=refunded&per_page=100", { token: admin }));
      expect(list.data.every((x: { status: string }) => x.status === "refunded")).toBe(true);
      expect(json(await call("GET", "/admin/store/orders?q=flujo@test.local", { token: admin })).data.length).toBeGreaterThan(0);
      expect((await call("GET", "/admin/store/orders", { token: (await signup()).token })).statusCode).toBe(403);
    });
  });
});

describe("tienda con Stripe (se cobra en USD)", () => {
  const SECRET = "whsec_store_test_123456";
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  let product: string;
  const calls: { url: string; form: URLSearchParams }[] = [];
  let seq = 0;
  const stripeMock = vi.fn(async (url: string, init: { body?: string }) => {
    const form = new URLSearchParams(init.body ?? "");
    calls.push({ url, form });
    const send = (body: unknown) => ({ status: 200, json: async () => body });
    if (url.endsWith("/payment_intents")) return send({ id: `pi_store_${++seq}`, status: "succeeded" });
    if (url.endsWith("/refunds")) return send({ id: `re_store_${++seq}` });
    return send({});
  });
  const call = (method: "GET" | "POST" | "PATCH", url: string, opts: { token?: string; cart?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...(opts.cart ? { "x-cart-token": opts.cart } : {}), ...opts.headers } });
  const sign = (raw: string) => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${createHmac("sha256", SECRET).update(`${t}.${raw}`).digest("hex")}`; };
  const webhook = (event: object) => { const raw = JSON.stringify(event); return app.inject({ method: "POST", url: "/api/v1/webhooks/payments/stripe", payload: raw, headers: { "content-type": "application/json", "stripe-signature": sign(raw) } }); };

  beforeAll(async () => {
    vi.stubGlobal("fetch", stripeMock);
    app = await makeApp({ PAYMENT_PROVIDER: "stripe", STRIPE_SECRET_KEY: "sk_test_123456789", STRIPE_WEBHOOK_SECRET: SECRET });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [reg.data.user.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token;
    product = json(await call("POST", "/admin/store/products", { token: admin, payload: { slug: `stripe-${tag}`, name: "Póster Stripe", category: "poster", price: 2990, stock: 20 } })).data.id;
  });
  afterAll(async () => { vi.unstubAllGlobals(); await pool.end(); await app.close(); });

  const buy = async (email: string) => {
    const cart = json(await call("POST", "/cart/items", { payload: { product_id: product, quantity: 1 } })).data.cart_token as string;
    return call("POST", "/orders", { cart, headers: { "idempotency-key": `stripe-${Date.now()}-${k++}` }, payload: { contact: contact(email), shipping, payment_method_token: "pm_ok" } });
  };

  it("cobra el equivalente en USD con la tasa del pedido y reembolsa en USD", async () => {
    const res = await buy("stripe1@test.local");
    expect(res.statusCode).toBe(201);
    const o = json(res).data.order;
    expect(o).toMatchObject({ total: 2990, status: "paid", currency: "DOP" });
    const c = calls.filter((x) => x.url.endsWith("/payment_intents")).at(-1)!;
    expect(c.form.get("currency")).toBe("usd");
    expect(Number(c.form.get("amount"))).toBe(Math.round((2990 / 59.8) * 100)); // 50.00 USD
    expect(c.form.get("metadata[order_id]")).toBe(o.id);
    const pay = (await pool.query("SELECT charged_amount, charged_currency, provider FROM store_payments WHERE order_id = $1", [o.id])).rows[0];
    expect(pay).toMatchObject({ charged_currency: "USD", provider: "stripe" });
    expect(Number(pay.charged_amount)).toBe(50);
    await call("PATCH", `/admin/store/orders/${o.id}`, { token: admin, payload: { status: "cancelled" } });
    const rf = calls.filter((x) => x.url.endsWith("/refunds")).at(-1)!;
    expect(rf.form.get("amount")).toBe("5000");
  });

  it("el webhook concilia un pedido cuya respuesta de cobro se perdió y devuelve un cobro huérfano", async () => {
    const o = json(await buy("stripe2@test.local")).data.order;
    await pool.query("DELETE FROM store_payments WHERE order_id = $1", [o.id]);
    await pool.query("UPDATE store_orders SET status = 'pending', payment_status = 'unpaid', amount_paid = 0 WHERE id = $1", [o.id]);
    const ev = (id: string, pi: string, orderId: string) => ({ id, type: "payment_intent.succeeded", data: { object: { id: pi, amount: 5000, amount_received: 5000, currency: "usd", metadata: { order_id: orderId, kind: "full" } } } });
    expect(json(await webhook(ev("evt_s1", "pi_lost_store", o.id))).outcome).toBe("reconciled");
    expect((await pool.query("SELECT status, payment_status FROM store_orders WHERE id = $1", [o.id])).rows[0]).toEqual({ status: "paid", payment_status: "paid" });
    expect(json(await webhook(ev("evt_s1", "pi_lost_store", o.id))).outcome).toBe("duplicate");

    const orphan = json(await buy("stripe3@test.local")).data.order;
    await pool.query("DELETE FROM store_payments WHERE order_id = $1", [orphan.id]);
    await pool.query("UPDATE store_orders SET status = 'cancelled', payment_status = 'unpaid', amount_paid = 0 WHERE id = $1", [orphan.id]);
    const refundsBefore = calls.filter((x) => x.url.endsWith("/refunds")).length;
    expect(json(await webhook(ev("evt_s2", "pi_orphan_store", orphan.id))).outcome).toBe("orphan_refunded");
    expect(calls.filter((x) => x.url.endsWith("/refunds")).length).toBe(refundsBefore + 1);
    expect((await pool.query("SELECT payment_status FROM store_orders WHERE id = $1", [orphan.id])).rows[0].payment_status).toBe("refunded");
  });
});
