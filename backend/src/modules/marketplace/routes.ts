import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { audit } from "../operators/team.js";
import { CATEGORIES, type MarketplaceService } from "./service.js";

declare module "fastify" { interface FastifyInstance { marketplace: MarketplaceService } }

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(24) };
const url = z.string().url().max(500);
const items = z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) })).min(1).max(30);

/** Marketplace de vendedores locales (docs §5.9). */
export async function marketplaceRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const mp = app.marketplace, db = app.db;
  const auth = app.authenticate, admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const soft = { security: [{}, ...bearer] };
  const tokenQ = z.object({ token: z.string().max(100).optional() });
  const access = (req: FastifyRequest) => ({ token: (req.query as { token?: string }).token, userId: req.user?.id });

  // ---------- Catálogo público ----------
  r.get("/marketplace/products", { schema: { tags: ["marketplace"], summary: "Catálogo de vendedores locales", querystring: z.object({ ...pageQ, vendor: z.string().max(80).optional(), category: z.enum(CATEGORIES).optional(), kind: z.enum(["product", "experience"]).optional(), q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req, reply) => {
    const { rows, total } = await mp.publicProducts(req.query);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/marketplace/products/:slug", { schema: { tags: ["marketplace"], summary: "Detalle de un producto (DOP y USD)", params: z.object({ slug: z.string().max(120) }), response: { 200: ok } } }, async (req, reply) => { reply.header("cache-control", PUBLIC_CACHE); return { data: await mp.publicProduct(req.params.slug) }; });
  r.get("/marketplace/categories", { schema: { tags: ["marketplace"], summary: "Categorías con productos", response: { 200: ok } } }, async (_q, reply) => { reply.header("cache-control", PUBLIC_CACHE); return { data: await mp.categories() }; });
  r.get("/marketplace/vendors", { schema: { tags: ["marketplace"], summary: "Vendedores activos", querystring: z.object(pageQ), response: { 200: paged } } }, async (req, reply) => {
    const { rows, total } = await mp.publicVendors(req.query.page, req.query.per_page);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  // ---------- Mi tienda (vendedor) ----------
  const vendorBody = z.object({ name: z.string().trim().min(3).max(80), bio: z.string().trim().max(1500), logo_url: url, cover_url: url, province_id: z.string().uuid(), city: z.string().trim().max(80), phone: z.string().trim().min(7).max(30), payout_method: z.enum(["bank_transfer", "paypal"]), payout_details: z.string().trim().min(5).max(300) });
  r.post("/marketplace/vendors/apply", { onRequest: auth, config: rl(5, "1 hour"), schema: { tags: ["marketplace"], summary: "Solicita abrir una tienda (correo verificado; el equipo la revisa)", security: bearer, body: vendorBody.pick({ name: true, bio: true, logo_url: true, province_id: true, city: true, phone: true }).partial().required({ name: true }), response: { 201: ok } } }, async (req, reply) => {
    reply.code(201);
    return { data: await mp.applyVendor(req.user!.id, req.body) };
  });
  r.get("/marketplace/vendors/me", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Mi tienda", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await mp.myVendor(req.user!.id) }));
  r.patch("/marketplace/vendors/me", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Edita mi tienda y mi forma de cobro", security: bearer, body: vendorBody.partial().strict(), response: { 200: ok } } }, async (req) => ({ data: await mp.updateVendor(req.user!.id, req.body) }));
  r.get("/marketplace/vendors/:slug", { schema: { tags: ["marketplace"], summary: "Tienda pública con sus productos", params: z.object({ slug: z.string().max(80) }), response: { 200: ok } } }, async (req, reply) => { reply.header("cache-control", PUBLIC_CACHE); return { data: await mp.publicVendor(req.params.slug) }; });

  const productBody = z.object({ name: z.string().trim().min(3).max(120), category: z.enum(CATEGORIES), kind: z.enum(["product", "experience"]), description: z.string().trim().max(4000), price: z.number().min(0).max(1_000_000), stock: z.number().int().min(0).max(100_000), images: z.array(url).max(10) });
  r.get("/partner/marketplace/products", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Mis productos (todos los estados)", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["draft", "pending_review", "published", "rejected", "archived"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.vendorProducts(req.user!.id, req.query.page, req.query.per_page, req.query.status);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/partner/marketplace/products", { onRequest: auth, config: rl(60, "1 hour"), schema: { tags: ["marketplace"], summary: "Publica un producto o experiencia (pasa por revisión)", security: bearer, body: productBody.partial().required({ name: true, category: true, price: true }), response: { 201: ok } } }, async (req, reply) => {
    reply.code(201);
    return { data: await mp.createProduct(req.user!.id, req.body) };
  });
  r.patch("/partner/marketplace/products/:id", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Edita: precio y existencias al instante; el contenido vuelve a revisión. `archived` retira o reactiva", security: bearer, params: uuid, body: productBody.partial().extend({ archived: z.boolean() }).partial().strict(), response: { 200: ok } } }, async (req) => ({ data: await mp.updateProduct(req.user!.id, req.params.id, req.body) }));
  r.delete("/partner/marketplace/products/:id", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Elimina un producto (los pedidos conservan su instantánea)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => { await mp.deleteProduct(req.user!.id, req.params.id); reply.code(204); return null; });

  r.get("/partner/marketplace/orders", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Artículos vendidos por mi tienda (con los datos de entrega)", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "shipped", "delivered", "cancelled"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.vendorOrders(req.user!.id, req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/partner/marketplace/order-items/:id", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Marca un artículo como enviado (con guía) o entregado", security: bearer, params: uuid, body: z.object({ status: z.enum(["shipped", "delivered"]), courier_name: z.string().trim().max(80).optional(), tracking_number: z.string().trim().max(80).optional() }), response: { 200: ok } } }, async (req) => ({ data: await mp.vendorSetItem(req.user!.id, req.params.id, req.body.status, req.body) }));
  r.post("/partner/marketplace/order-items/:id/cancel", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Cancela un artículo que no puedo surtir (se reembolsa y vuelve al stock)", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await mp.vendorCancelItem(req.user!.id, req.params.id) }));
  r.get("/partner/payouts", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Mis liquidaciones y saldo por liquidar", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await mp.vendorPayouts(req.user!.id) }));

  // ---------- Compra ----------
  r.post("/marketplace/checkout/quote", { schema: { tags: ["marketplace"], summary: "Cotiza un carrito de productos del marketplace", body: z.object({ items }), response: { 200: ok } } }, async (req) => ({ data: await mp.quote(req.body.items) }));
  r.post("/marketplace/orders", {
    onRequest: [app.flags.gate("checkout_enabled", "Las compras están en pausa por unos minutos"), app.flags.gate("marketplace_orders_enabled", "Los pedidos del marketplace están en pausa"), optionalUser], config: rl(15, "1 minute"),
    schema: {
      tags: ["marketplace"], summary: "Crea y cobra un pedido (Idempotency-Key obligatorio; puede mezclar vendedores; `ref_code` atribuye a un embajador)", ...soft,
      body: z.object({
        items, contact: z.object({ name: z.string().trim().min(2).max(100), email, phone: z.string().trim().min(7).max(30).optional() }),
        shipping: z.object({ address: z.string().trim().min(8).max(300), city: z.string().trim().min(2).max(80), province: z.string().trim().max(60).optional(), notes: z.string().trim().max(500).optional() }).optional(),
        payment_method_token: z.string().max(200), ref_code: z.string().trim().max(30).optional(), locale: z.enum(["es", "en"]).optional(),
      }),
      response: { 200: ok, 201: ok },
    },
  }, async (req, reply) => {
    const key = req.headers["idempotency-key"];
    if (typeof key !== "string" || key.length < 8 || key.length > 100) throw AppError.validation("Falta el encabezado Idempotency-Key (8–100 caracteres, único por intento de compra)");
    const b = req.body;
    const res = await mp.createOrder({ actor: { userId: req.user?.id }, contact: b.contact, shipping: b.shipping, items: b.items, paymentToken: b.payment_method_token, idempotencyKey: key, locale: b.locale, refCode: await app.ambassadors.resolve(b.ref_code, { userId: req.user?.id, email: b.contact.email }) });
    reply.code(res.replayed ? 200 : 201);
    return { data: { order: res.order, access_token: res.accessToken, replayed: res.replayed } };
  });
  r.get("/me/marketplace/orders", { onRequest: auth, schema: { tags: ["marketplace"], summary: "Mis pedidos del marketplace", security: bearer, querystring: z.object(pageQ), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.listMine(req.user!.id, req.query.page, req.query.per_page);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/marketplace/orders/:id", { onRequest: optionalUser, schema: { tags: ["marketplace"], summary: "Detalle y seguimiento por artículo (token de invitado o sesión del titular)", ...soft, params: uuid, querystring: tokenQ, response: { 200: ok } } }, async (req) => ({ data: await mp.getForCustomer(req.params.id, access(req)) }));
  r.post("/marketplace/orders/:id/cancel", { onRequest: optionalUser, config: rl(10, "1 minute"), schema: { tags: ["marketplace"], summary: "Cancela mientras ningún vendedor haya enviado; reembolsa todo", ...soft, params: uuid, querystring: tokenQ, body: z.object({ reason: z.string().trim().max(300).optional() }).nullish(), response: { 200: ok } } }, async (req) => ({ data: await mp.cancel(req.params.id, access(req), req.body?.reason) }));

  // ================= Administración =================
  r.get("/admin/marketplace/vendors", { onRequest: admin, schema: { tags: ["admin"], summary: "Vendedores y solicitudes", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "active", "suspended", "rejected"]).optional(), q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.adminVendors(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/marketplace/vendors/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Aprueba, rechaza o suspende un vendedor; fija su comisión", security: bearer, params: uuid, body: z.object({ status: z.enum(["active", "suspended", "rejected"]), commission_rate: z.number().min(0).max(60), note: z.string().trim().max(300) }).partial().strict(), response: { 200: ok } } }, async (req) => {
    const data = await mp.adminSetVendor(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: "marketplace.vendor_updated", entity: "marketplace_vendor", id: req.params.id, meta: { status: req.body.status ?? null, commission_rate: req.body.commission_rate ?? null }, ip: req.ip });
    return { data };
  });
  r.get("/admin/marketplace/products", { onRequest: admin, schema: { tags: ["admin"], summary: "Productos (por defecto, en revisión primero con `status`)", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["draft", "pending_review", "published", "rejected", "archived"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.adminProducts(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/marketplace/products/:id/review", { onRequest: admin, schema: { tags: ["admin"], summary: "Aprueba o rechaza (con motivo) un producto en revisión", security: bearer, params: uuid, body: z.object({ decision: z.enum(["approve", "reject"]), note: z.string().trim().max(300).optional() }), response: { 200: ok } } }, async (req) => {
    const data = await mp.adminReview(req.params.id, req.body.decision, req.body.note);
    await audit(db, { actor: req.user!.id, action: `marketplace.product_${req.body.decision}`, entity: "marketplace_product", id: req.params.id, ip: req.ip });
    return { data };
  });
  r.get("/admin/marketplace/orders", { onRequest: admin, schema: { tags: ["admin"], summary: "Pedidos del marketplace", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "paid", "processing", "completed", "cancelled", "refunded"]).optional(), q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.adminOrders(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/admin/marketplace/orders/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Detalle de un pedido", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await mp.adminOrder(req.params.id) }));
  r.post("/admin/marketplace/orders/:id/refund", { onRequest: admin, schema: { tags: ["admin"], summary: "Reembolsa un artículo (`item_id`) o todo lo reembolsable del pedido; no aplica a lo ya liquidado", security: bearer, params: uuid, body: z.object({ item_id: z.string().uuid().optional(), restock: z.boolean().default(false), reason: z.string().trim().min(3).max(300) }), response: { 200: ok } } }, async (req) => {
    const data = await mp.adminRefund(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: "marketplace.order_refunded", entity: "marketplace_order", id: req.params.id, meta: { item: req.body.item_id ?? "all", reason: req.body.reason }, ip: req.ip });
    return { data };
  });
  r.get("/admin/marketplace/payouts", { onRequest: admin, schema: { tags: ["admin"], summary: "Liquidaciones a vendedores", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "paid", "failed"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await mp.adminPayouts(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/marketplace/payouts/generate", { onRequest: admin, schema: { tags: ["admin"], summary: "Genera ya las liquidaciones pendientes (también corre sola cada día)", security: bearer, response: { 200: ok } } }, async (req) => {
    const data = await mp.generatePayouts();
    await audit(db, { actor: req.user!.id, action: "marketplace.payouts_generated", entity: "vendor_payment", id: null, meta: { payouts: data.payouts }, ip: req.ip });
    return { data };
  });
  r.patch("/admin/marketplace/payouts/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Marca una liquidación como pagada (con referencia) o fallida (los artículos vuelven a liquidarse)", security: bearer, params: uuid, body: z.object({ status: z.enum(["paid", "failed"]), reference: z.string().trim().min(2).max(100).optional() }), response: { 200: ok } } }, async (req) => {
    const data = await mp.adminSettlePayout(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: `marketplace.payout_${req.body.status}`, entity: "vendor_payment", id: req.params.id, ip: req.ip });
    return { data };
  });
}
