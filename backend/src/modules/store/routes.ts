import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { audit } from "../operators/team.js";
import { StoreService, type Actor } from "./service.js";

declare module "fastify" { interface FastifyInstance { store: StoreService } }

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const CATEGORIES = ["poster", "ropa", "accesorios", "hogar", "bolsos"] as const;
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const orderId = z.object({ id: z.string().regex(/^ORD-[A-Z2-9]{8}$/) });
const uuid = z.object({ id: z.string().uuid() });
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(24) };

/** Tienda oficial (docs §5.9): catálogo, carrito compartido, cotización, pedidos y devoluciones. */
export async function storeRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const store = app.store;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const actor = (req: FastifyRequest): Actor => ({ userId: req.user?.id ?? null, cartToken: typeof req.headers["x-cart-token"] === "string" ? req.headers["x-cart-token"] : null });
  const access = (req: FastifyRequest) => ({ token: (req.query as { token?: string }).token, userId: req.user?.id });
  const tokenQ = z.object({ token: z.string().max(100).optional() });
  const soft = { security: [{}, ...bearer] };

  // ---------- Catálogo ----------
  r.get("/store/products", { schema: { tags: ["tienda"], summary: "Catálogo de la tienda oficial", querystring: z.object({ ...pageQ, category: z.enum(CATEGORIES).optional(), featured: z.enum(["true", "false"]).optional(), q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req, reply) => {
    const { rows, total } = await store.products({ category: req.query.category, featured: req.query.featured === "true", q: req.query.q, page: req.query.page, per_page: req.query.per_page });
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/store/products/:slug", { schema: { tags: ["tienda"], summary: "Detalle de un producto (precio en DOP y USD)", params: z.object({ slug: z.string().max(120) }), response: { 200: ok } } }, async (req, reply) => { reply.header("cache-control", PUBLIC_CACHE); return { data: await store.product(req.params.slug) }; });
  r.get("/store/categories", { schema: { tags: ["tienda"], summary: "Categorías con productos", response: { 200: ok } } }, async (_q, reply) => { reply.header("cache-control", PUBLIC_CACHE); return { data: await store.categories() }; });

  // ---------- Carrito (cuenta o invitado con X-Cart-Token) ----------
  const cartHeaders = { "x-cart-token": z.string().max(100).optional() };
  r.get("/cart", { onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Mi carrito (cuenta, o invitado con X-Cart-Token)", ...soft, headers: z.object(cartHeaders).passthrough(), response: { 200: ok } } }, async (req) => ({ data: await store.cart(actor(req)) }));
  r.post("/cart/items", {
    onRequest: optionalUser, config: rl(120, "1 minute"),
    schema: { tags: ["tienda"], summary: "Agrega un producto (valida talla, color y stock). Un invitado recibe `cart_token` la primera vez", ...soft, body: z.object({ product_id: z.string().min(1).max(80), size: z.string().max(20).optional(), color: z.string().max(30).optional(), quantity: z.number().int().min(1).max(20).default(1) }), response: { 201: ok } },
  }, async (req, reply) => { reply.code(201); return { data: await store.addItem(actor(req), req.body) }; });
  r.patch("/cart/items/:id", { onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Cambia la cantidad", ...soft, params: uuid, body: z.object({ quantity: z.number().int().min(1).max(20) }), response: { 200: ok } } }, async (req) => ({ data: await store.setQuantity(actor(req), req.params.id, req.body.quantity) }));
  r.delete("/cart/items/:id", { onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Quita un artículo", ...soft, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await store.removeItem(actor(req), req.params.id) }));
  r.delete("/cart", { onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Vacía el carrito", ...soft, response: { 204: z.null() } } }, async (req, reply) => { await store.clear(actor(req)); reply.code(204); return null; });
  r.post("/cart/merge", { onRequest: app.authenticate, schema: { tags: ["tienda"], summary: "Al iniciar sesión, fusiona el carrito de invitado (X-Cart-Token) con el de la cuenta", security: bearer, headers: z.object({ "x-cart-token": z.string().max(100) }).passthrough(), response: { 200: ok } } }, async (req) => {
    const token = actor(req).cartToken;
    if (!token) throw AppError.validation("Falta el encabezado X-Cart-Token");
    return { data: { ...(await store.merge(req.user!.id, token)), cart: await store.cart({ userId: req.user!.id }) } };
  });
  r.put("/cart/coupon", { onRequest: optionalUser, config: rl(30, "1 minute"), schema: { tags: ["tienda"], summary: "Aplica o quita un cupón del carrito", ...soft, body: z.object({ code: z.string().trim().min(2).max(40).nullable() }), response: { 200: ok } } }, async (req) => {
    await store.applyCoupon(actor(req), req.body.code);
    return { data: await store.cart(actor(req)) };
  });

  // ---------- Cotización, cupones y pedidos ----------
  r.post("/checkout/quote", { onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Subtotal, cupón, envío (gratis desde RD$ 2 500, si no RD$ 250), ITBIS incluido y total en DOP y USD", ...soft, body: z.object({ coupon_code: z.string().trim().max(40).optional() }).nullish(), response: { 200: ok } } }, async (req) => ({ data: await store.quote(actor(req), req.body?.coupon_code) }));
  r.post("/coupons/validate", { config: rl(30, "1 minute"), onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Valida un cupón contra un subtotal", ...soft, body: z.object({ code: z.string().trim().min(2).max(40), subtotal: z.number().min(0).max(10_000_000) }), response: { 200: ok } } }, async (req) => ({ data: await store.validateCoupon(req.body.code, req.body.subtotal, req.user?.id) }));

  r.post("/orders", {
    onRequest: [app.flags.gate("checkout_enabled", "Las compras están en pausa por unos minutos"), optionalUser], config: rl(15, "1 minute"),
    schema: {
      tags: ["tienda"], summary: "Crea el pedido desde el carrito (Idempotency-Key obligatorio; descuenta stock con bloqueo; cobra con la pasarela)", ...soft,
      body: z.object({
        contact: z.object({ name: z.string().trim().min(2).max(100), email, phone: z.string().trim().min(7).max(30).optional() }),
        shipping: z.object({ address: z.string().trim().min(8).max(300), city: z.string().trim().min(2).max(80), province: z.string().trim().max(60).optional(), notes: z.string().trim().max(500).optional() }),
        coupon_code: z.string().trim().max(40).optional(), ref_code: z.string().trim().max(30).optional(), payment_method_token: z.string().max(200), locale: z.enum(["es", "en"]).optional(),
      }),
      response: { 200: ok, 201: ok },
    },
  }, async (req, reply) => {
    const key = req.headers["idempotency-key"];
    if (typeof key !== "string" || key.length < 8 || key.length > 100) throw AppError.validation("Falta el encabezado Idempotency-Key (8–100 caracteres, único por intento de compra)");
    const b = req.body;
    const res = await store.createOrder({ actor: actor(req), contact: b.contact, shipping: b.shipping, couponCode: b.coupon_code, paymentToken: b.payment_method_token, idempotencyKey: key, locale: b.locale, refCode: await app.ambassadors.resolve(b.ref_code, { userId: req.user?.id, email: b.contact.email }) });
    reply.code(res.replayed ? 200 : 201);
    return { data: { order: res.order, access_token: res.accessToken, replayed: res.replayed } };
  });
  r.get("/me/orders", { onRequest: app.authenticate, schema: { tags: ["tienda"], summary: "Mis pedidos", security: bearer, querystring: z.object(pageQ), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await store.listMine(req.user!.id, req.query.page, req.query.per_page);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/orders/:id", { onRequest: optionalUser, schema: { tags: ["tienda"], summary: "Detalle y seguimiento (token de invitado o sesión del titular)", ...soft, params: orderId, querystring: tokenQ, response: { 200: ok } } }, async (req) => ({ data: await store.getForCustomer(req.params.id, access(req)) }));
  r.post("/orders/:id/cancel", { onRequest: optionalUser, config: rl(10, "1 minute"), schema: { tags: ["tienda"], summary: "Cancela un pedido que aún no salió; reembolsa lo cobrado", ...soft, params: orderId, querystring: tokenQ, body: z.object({ reason: z.string().trim().max(300).optional() }).nullish(), response: { 200: ok } } }, async (req) => ({ data: await store.cancel(req.params.id, access(req), req.body?.reason) }));
  r.post("/orders/:id/return-request", { onRequest: optionalUser, config: rl(10, "1 minute"), schema: { tags: ["tienda"], summary: "Solicita una devolución dentro de las 72 h de la entrega", ...soft, params: orderId, querystring: tokenQ, body: z.object({ reason: z.string().trim().min(5).max(500) }), response: { 200: ok } } }, async (req) => ({ data: await store.requestReturn(req.params.id, access(req), req.body.reason) }));

  // ================= Administración =================
  const admin = app.requireRole("admin");
  const productBody = z.object({
    slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/), name: z.string().trim().min(2).max(120), category: z.enum(CATEGORIES), price: z.number().min(0).max(1_000_000), stock: z.number().int().min(0).max(100_000),
    active: z.boolean(), featured: z.boolean(), emoji: z.string().max(8).nullable(), tone: z.string().max(30).nullable(), sizes: z.array(z.string().max(20)).max(12), colors: z.array(z.string().max(30)).max(12),
    tagline: z.string().max(200).nullable(), description: z.string().max(4000).nullable(), includes: z.array(z.string().max(120)).max(20), images: z.array(z.string().url().max(500)).max(10), sort_order: z.number().int().min(-1000).max(1000),
  });
  const db = app.db;

  r.get("/admin/store/orders", { onRequest: admin, schema: { tags: ["admin"], summary: "Pedidos de la tienda", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded", "return_requested"]).optional(), q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await store.adminList({ status: req.query.status, q: req.query.q, page: req.query.page, per_page: req.query.per_page });
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/admin/store/orders/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Detalle de un pedido", security: bearer, params: orderId, response: { 200: ok } } }, async (req) => ({ data: await store.adminGet(req.params.id) }));
  r.patch("/admin/store/orders/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Cambia el estado (processing → shipped con guía → delivered; cancelar reembolsa)", security: bearer, params: orderId, body: z.object({ status: z.enum(["processing", "shipped", "delivered", "cancelled"]), courier_name: z.string().trim().max(80).optional(), tracking_number: z.string().trim().max(80).optional(), reason: z.string().trim().max(300).optional() }), response: { 200: ok } } }, async (req) => {
    const data = await store.adminSetStatus(req.params.id, req.body.status, req.body);
    await audit(db, { actor: req.user!.id, action: `store.order_${req.body.status}`, entity: "store_order", id: req.params.id, ip: req.ip });
    return { data };
  });
  r.post("/admin/store/orders/:id/refund", { onRequest: admin, schema: { tags: ["admin"], summary: "Reembolso total o parcial (con o sin devolver el stock)", security: bearer, params: orderId, body: z.object({ amount: z.number().gt(0).optional(), restock: z.boolean().default(false), reason: z.string().trim().min(3).max(300) }), response: { 200: ok } } }, async (req) => {
    const data = await store.adminRefund(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: "store.order_refunded", entity: "store_order", id: req.params.id, meta: { amount: req.body.amount ?? "all", reason: req.body.reason }, ip: req.ip });
    return { data };
  });

  r.get("/admin/store/products", { onRequest: admin, schema: { tags: ["admin"], summary: "Catálogo completo (incluye inactivos)", security: bearer, querystring: z.object({ ...pageQ, q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req) => {
    const q = req.query.q ? `%${req.query.q.replace(/[\\%_]/g, "\\$&")}%` : null;
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM store_products WHERE deleted_at IS NULL AND ($1::text IS NULL OR name ILIKE $1)", [q])).rows[0]!.n;
    const { rows } = await db.query(`SELECT * FROM store_products WHERE deleted_at IS NULL AND ($1::text IS NULL OR name ILIKE $1) ORDER BY sort_order, name LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [q]);
    return { data: rows.map((x) => ({ ...x, price: Number(x.price) })), meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/store/products", { onRequest: admin, schema: { tags: ["admin"], summary: "Crea un producto", security: bearer, body: productBody.partial().required({ slug: true, name: true, category: true, price: true }), response: { 201: ok } } }, async (req, reply) => {
    const b = req.body;
    try {
      const row = (await db.query(
        `INSERT INTO store_products (id, slug, name, category, price, stock, active, featured, emoji, tone, sizes, colors, tagline, description, includes, images, sort_order)
         VALUES ('prd_' || replace(gen_random_uuid()::text, '-', ''), $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
        [b.slug, b.name, b.category, b.price, b.stock ?? 0, b.active ?? true, b.featured ?? false, b.emoji ?? null, b.tone ?? null, b.sizes ?? [], b.colors ?? [], b.tagline ?? null, b.description ?? null, b.includes ?? [], b.images ?? [], b.sort_order ?? 0],
      )).rows[0];
      await audit(db, { actor: req.user!.id, action: "store.product_created", entity: "store_product", id: row.id, ip: req.ip });
      reply.code(201);
      return { data: { ...row, price: Number(row.price) } };
    } catch (e) { if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe un producto con ese slug", { reason: "SLUG_TAKEN" }); throw e; }
  });
  r.patch("/admin/store/products/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Edita un producto (precio, stock, variantes, destacados…)", security: bearer, params: z.object({ id: z.string().max(80) }), body: productBody.partial().strict(), response: { 200: ok } } }, async (req) => {
    const entries = Object.entries(req.body).filter(([, v]) => v !== undefined);
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    try {
      const row = (await db.query(`UPDATE store_products SET ${entries.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *`, [req.params.id, ...entries.map(([, v]) => v)])).rows[0];
      if (!row) throw AppError.notFound("Producto");
      await audit(db, { actor: req.user!.id, action: "store.product_updated", entity: "store_product", id: req.params.id, meta: { fields: entries.map(([k]) => k) }, ip: req.ip });
      return { data: { ...row, price: Number(row.price) } };
    } catch (e) { if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe un producto con ese slug", { reason: "SLUG_TAKEN" }); throw e; }
  });
  r.delete("/admin/store/products/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Retira un producto del catálogo (borrado lógico; los pedidos conservan su instantánea)", security: bearer, params: z.object({ id: z.string().max(80) }), response: { 204: z.null() } } }, async (req, reply) => {
    if (!(await db.query("UPDATE store_products SET deleted_at = now(), active = false, updated_at = now() WHERE id = $1 AND deleted_at IS NULL", [req.params.id])).rowCount) throw AppError.notFound("Producto");
    await audit(db, { actor: req.user!.id, action: "store.product_deleted", entity: "store_product", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---- Cupones ----
  const couponBody = z.object({ code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/), description: z.string().max(200).nullable(), discount_percentage: z.number().gt(0).max(100).nullable(), discount_amount: z.number().gt(0).max(1_000_000).nullable(), expires_at: z.string().datetime({ offset: true }).nullable(), max_uses: z.number().int().min(1).nullable(), min_subtotal: z.number().min(0).nullable(), per_user_limit: z.number().int().min(1).max(100), is_active: z.boolean() });
  r.get("/admin/discount_coupons", { onRequest: admin, schema: { tags: ["admin"], summary: "Cupones de descuento", security: bearer, response: { 200: ok } } }, async () => ({ data: (await db.query("SELECT id, code, description, discount_percentage, discount_amount, expires_at, max_uses, uses_count, min_subtotal, per_user_limit, is_active, created_at FROM discount_coupons ORDER BY created_at DESC LIMIT 500")).rows }));
  r.post("/admin/discount_coupons", { onRequest: admin, schema: { tags: ["admin"], summary: "Crea un cupón (porcentaje o monto fijo)", security: bearer, body: couponBody.partial().required({ code: true }), response: { 201: ok } } }, async (req, reply) => {
    const b = req.body;
    if (!!b.discount_percentage === !!b.discount_amount) throw AppError.validation("Indica un porcentaje o un monto fijo (uno solo)");
    try {
      const row = (await db.query("INSERT INTO discount_coupons (code, description, discount_percentage, discount_amount, expires_at, max_uses, min_subtotal, per_user_limit, is_active) VALUES (upper($1),$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, code", [b.code, b.description ?? null, b.discount_percentage ?? null, b.discount_amount ?? null, b.expires_at ?? null, b.max_uses ?? null, b.min_subtotal ?? null, b.per_user_limit ?? 1, b.is_active ?? true])).rows[0];
      await audit(db, { actor: req.user!.id, action: "store.coupon_created", entity: "coupon", id: row.id, ip: req.ip });
      reply.code(201);
      return { data: row };
    } catch (e) { if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe ese cupón", { reason: "CODE_TAKEN" }); throw e; }
  });
  r.patch("/admin/discount_coupons/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Edita o desactiva un cupón", security: bearer, params: uuid, body: couponBody.omit({ code: true }).partial().strict(), response: { 204: z.null() } } }, async (req, reply) => {
    const entries = Object.entries(req.body).filter(([, v]) => v !== undefined);
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    if (!(await db.query(`UPDATE discount_coupons SET ${entries.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")} WHERE id = $1`, [req.params.id, ...entries.map(([, v]) => v)])).rowCount) throw AppError.notFound("Cupón");
    await audit(db, { actor: req.user!.id, action: "store.coupon_updated", entity: "coupon", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });
}
