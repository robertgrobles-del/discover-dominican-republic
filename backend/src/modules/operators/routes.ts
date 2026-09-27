import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { BookingService } from "./bookings.js";
import { CatalogService, CATEGORIES, type Membership, type OrgRole } from "./catalog.js";
import type { PaymentGateway } from "./gateway.js";
import { AutomationService } from "./automations.js";
import { EngagementService } from "./engagement.js";
import { IcalService } from "./ical.js";
import type { JobRunner } from "../jobs/runner.js";
import type { PayoutService } from "./payouts.js";
import { PromotionService } from "./promotions.js";
import { ReportService } from "./reports.js";
import { audit, TeamService } from "./team.js";

declare module "fastify" {
  interface FastifyInstance { jobs: JobRunner; payouts: PayoutService; automations: AutomationService; ical: IcalService; catalog: CatalogService; bookings: BookingService; promotions: PromotionService; gateway: PaymentGateway }
  interface FastifyRequest { member?: Membership }
}

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD");
const any = z.any();
const ok = z.object({ data: any });
const paged = z.object({ data: any, meta: z.object({ page: z.number(), per_page: z.number(), total: z.number(), total_pages: z.number() }) });
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(24) };
const bearer = [{ bearerAuth: [] }];
const id = z.object({ id: z.string().min(1).max(80) });

const extra = z.object({ id: z.string().min(1).max(40), name: z.string().min(1).max(80), price: z.number().min(0), unit: z.enum(["person", "booking", "night"]) });
const listingBody = z.object({
  category: z.enum(CATEGORIES), title: z.string().trim().min(3).max(120), summary: z.string().max(400).optional(), description: z.string().max(8000).optional(), destination: z.string().max(80).nullish(),
  price: z.number().min(0).max(1_000_000).optional(), currency: z.enum(["USD", "DOP"]).optional(), duration: z.string().max(60).nullish(), capacity: z.number().int().min(1).max(10_000).optional(),
  min_age: z.number().int().min(0).max(99).nullish(), languages: z.array(z.string().max(30)).max(10).optional(), includes: z.array(z.string().max(120)).max(30).optional(),
  meeting_point: z.string().max(200).nullish(), cancellation_policy: z.enum(["flexible", "moderada", "estricta"]).optional(), images: z.array(z.string().max(500)).max(20).optional(),
  time_slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).max(12).optional(), deposit_percent: z.number().int().min(1).max(90).nullish(), child_price: z.number().min(0).nullish(),
  infants_free: z.boolean().optional(), min_guests: z.number().int().min(1).nullish(), days: z.number().int().min(1).max(60).nullish(),
  itinerary: z.array(z.object({ day: z.number().int().min(1), title: z.string().max(120), description: z.string().max(1000).optional() })).max(60).optional(),
  components: z.array(z.string().max(80)).max(30).optional(), extras: z.array(extra).max(20).optional(),
});
const roomBody = z.object({
  name: z.string().trim().min(1).max(80), price: z.number().min(0), guests: z.number().int().min(1).max(50), quantity: z.number().int().min(1).max(500), beds: z.string().max(80).nullish(),
  amenities: z.array(z.string().max(50)).max(30).optional(), image: z.string().max(500).nullish(), min_nights: z.number().int().min(1).max(30).optional(), weekend_price: z.number().min(0).nullish(),
});
const bookingRequest = z.object({
  listing_id: z.string().min(1).max(80), room_id: z.string().uuid().optional(), date, check_out: date.optional(), time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  adults: z.number().int().min(1).max(200), children: z.number().int().min(0).max(200).default(0), infants: z.number().int().min(0).max(50).default(0),
  extras: z.array(z.string().max(40)).max(20).default([]), promo_code: z.string().trim().max(40).optional(),
});
const contact = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().toLowerCase().pipe(z.email().max(254)), phone: z.string().trim().max(30).optional() });
const promoBody = z.object({
  code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/), type: z.enum(["percent", "fixed"]), value: z.number().gt(0).max(1_000_000), listing_id: z.string().max(80).nullish(),
  starts_at: date.nullish(), ends_at: date.nullish(), max_uses: z.number().int().min(1).nullish(), active: z.boolean().optional(),
});

/** Portal de operadores: catálogo, motor de reservas, promociones e ingresos (docs §5.8 y §5.10). */
export async function operatorRoutes(app: FastifyInstance) {
  const { catalog, promotions, bookings } = app; // se crean en la raíz (routes.ts) para compartirlos con otros módulos
  const team = new TeamService(app.db, app.env, app.mailer);
  const engagement = new EngagementService(app.db, bookings);
  const icalSvc = app.ical;
  const reports = new ReportService(app.db);
  const r = app.withTypeProvider<ZodTypeProvider>();
  // Mismo criterio que auth: las pruebas desactivan estos topes con AUTH_RATE_LIMIT_ENABLED=false.
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  /** Usuario si manda un token válido; un token inválido se ignora (la reserva de invitado sigue funcionando). */
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };

  /** preHandler del panel: exige sesión, pertenecer a una organización y (opcional) alguno de los roles. */
  const org = (...roles: OrgRole[]) => async (req: FastifyRequest) => {
    await app.authenticate(req, undefined as never);
    const wanted = req.headers["x-org-id"];
    const m = await catalog.membership(req.user!.id, typeof wanted === "string" ? wanted : undefined);
    if (!m) throw new AppError("FORBIDDEN", "No perteneces a ninguna organización de operador");
    if (roles.length && !roles.includes(m.role)) throw new AppError("FORBIDDEN", "Tu rol no permite esta acción");
    req.member = m;
  };
  const only = (m: Membership) => (m.role === "guia" ? m.listing_ids : undefined);
  const staff = app.requireRole("admin");
  const idem = (req: FastifyRequest) => {
    const k = req.headers["idempotency-key"];
    if (typeof k !== "string" || k.length < 8 || k.length > 100) throw AppError.validation("Falta el encabezado Idempotency-Key (8–100 caracteres, único por intento de compra)");
    return k;
  };

  // ================= Público =================
  r.get("/operators", { schema: { tags: ["operadores"], summary: "Directorio de operadores verificados", querystring: z.object({ ...pageQ, q: z.string().max(100).optional(), category: z.enum(CATEGORIES).optional(), destination: z.string().max(80).optional() }), response: { 200: paged } } }, async (req, reply) => {
    const { rows, total } = await catalog.directory(req.query);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/operators/:slug", { schema: { tags: ["operadores"], summary: "Sitio web público de un operador", params: z.object({ slug: z.string().max(100) }), response: { 200: ok } } }, async (req, reply) => {
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: await catalog.publicSite(req.params.slug) };
  });
  r.get("/operators/:slug/listings/:listing", { schema: { tags: ["operadores"], summary: "Ficha pública de un servicio", params: z.object({ slug: z.string().max(100), listing: z.string().max(140) }), response: { 200: ok } } }, async (req, reply) => {
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: await catalog.publicListing(req.params.slug, req.params.listing) };
  });
  r.get("/listings/:id/availability", { schema: { tags: ["reservas"], summary: "Disponibilidad por día (máx. 62 días)", params: id, querystring: z.object({ from: date, to: date }), response: { 200: ok } } }, async (req) => ({ data: await bookings.availability(req.params.id, req.query.from, req.query.to) }));

  r.post("/bookings/quote", { config: rl(120, "1 minute"), schema: { tags: ["reservas"], summary: "Cotiza una reserva (precio final, disponibilidad y motivos si no se puede)", body: bookingRequest, response: { 200: ok } } }, async (req) => {
    const { quote } = await bookings.quote(req.body);
    return { data: quote };
  });
  r.post("/promotions/validate", { config: rl(30, "1 minute"), schema: { tags: ["reservas"], summary: "Valida un código promocional para un servicio", body: z.object({ listing_id: z.string().max(80), code: z.string().max(40) }), response: { 200: ok } } }, async (req) => {
    const { rows } = await app.db.query<{ org_id: string }>("SELECT org_id FROM operator_listings WHERE id = $1", [req.body.listing_id]);
    if (!rows[0]) throw AppError.notFound("Servicio");
    const p = await promotions.findValid(app.db, rows[0].org_id, req.body.listing_id, req.body.code);
    return { data: p ? { valid: true, code: p.code, type: p.type, value: p.value } : { valid: false } };
  });

  r.post("/bookings", {
    onRequest: [app.flags.gate("checkout_enabled", "Las reservas están en pausa por unos minutos"), optionalUser], config: rl(20, "1 minute"),
    schema: {
      tags: ["reservas"], summary: "Crea una reserva (el servidor recalcula el precio; requiere Idempotency-Key)", security: [{}, ...bearer],
      body: z.object({ request: bookingRequest, contact, notes: z.string().trim().max(1000).optional(), payment_mode: z.enum(["pay_now", "deposit", "pay_later"]), payment_method_token: z.string().max(200).optional(), locale: z.enum(["es", "en"]).optional() }),
      response: { 200: ok, 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const res = await bookings.create(
      { request: b.request, contact: b.contact, notes: b.notes, payment_mode: b.payment_mode, payment_token: b.payment_method_token, idempotency_key: idem(req), locale: b.locale },
      { userId: req.user?.id, source: "web" },
    );
    reply.code(res.replayed ? 200 : 201);
    return { data: { booking: res.booking, access_token: res.accessToken, replayed: res.replayed } };
  });

  const access = (req: FastifyRequest) => ({ token: (req.query as { token?: string }).token, userId: req.user?.id });
  const tokenQ = z.object({ token: z.string().max(100).optional() });
  r.get("/bookings/:id", { onRequest: optionalUser, schema: { tags: ["reservas"], summary: "Detalle de una reserva (token de invitado o sesión del titular)", params: id.extend({ id: z.string().uuid() }), querystring: tokenQ, response: { 200: ok } } }, async (req) => ({ data: await bookings.getForTraveler(req.params.id, access(req)) }));
  r.post("/bookings/:id/cancel", { onRequest: optionalUser, schema: { tags: ["reservas"], summary: "Cancela con reembolso según la política", params: id.extend({ id: z.string().uuid() }), querystring: tokenQ, body: z.object({ reason: z.string().max(300).optional() }).nullish(), response: { 200: ok } } }, async (req) => ({ data: await bookings.cancel(req.params.id, { by: "traveler", ...access(req), reason: req.body?.reason }) }));
  r.post("/bookings/:id/pay-balance", { onRequest: optionalUser, config: rl(10, "1 minute"), schema: { tags: ["reservas"], summary: "Paga el saldo pendiente", params: id.extend({ id: z.string().uuid() }), querystring: tokenQ, body: z.object({ payment_method_token: z.string().max(200) }), response: { 200: ok } } }, async (req) => ({ data: await bookings.payBalance(req.params.id, access(req), req.body.payment_method_token) }));
  r.get("/me/bookings", { onRequest: app.authenticate, schema: { tags: ["reservas"], summary: "Mis reservas", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await bookings.listForUser(req.user!.id, req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  // ================= Organización =================
  r.post("/orgs", { onRequest: app.authenticate, schema: { tags: ["operadores"], summary: "Registra mi organización de operador (queda pendiente de verificación)", security: bearer, body: z.object({ business_name: z.string().trim().min(2).max(120), business_type: z.string().max(60).optional(), email: z.string().email().optional(), phone: z.string().max(30).optional(), province: z.string().max(60).optional(), description: z.string().max(2000).optional() }), response: { 201: ok } } }, async (req, reply) => {
    const u = await app.db.query<{ email: string }>("SELECT email FROM users WHERE id = $1", [req.user!.id]);
    reply.code(201);
    return { data: await catalog.createOrg(req.user!.id, u.rows[0]!.email, req.body) };
  });
  r.get("/orgs/me", { onRequest: org(), schema: { tags: ["operadores"], summary: "Mi organización y mi rol", security: bearer, response: { 200: ok } } }, async (req) => ({ data: { org: await catalog.orgById(req.member!.org_id), role: req.member!.role, listing_ids: req.member!.listing_ids } }));
  r.patch("/orgs/me", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Actualiza mi organización", security: bearer, body: z.object({ business_name: z.string().trim().min(2).max(120), phone: z.string().max(30), description: z.string().max(2000), province: z.string().max(60), logo_url: z.string().max(500).nullable(), cover_url: z.string().max(500).nullable(), payout_method: z.string().max(200).nullable(), website_enabled: z.boolean() }).partial(), response: { 200: ok } } }, async (req) => ({ data: await catalog.updateOrg(req.member!.org_id, req.body as never) }));

  // ---- Anuncios ----
  r.get("/org/listings", { onRequest: org(), schema: { tags: ["operadores"], summary: "Mis servicios", security: bearer, querystring: z.object({ status: z.enum(["draft", "published", "paused"]).optional() }), response: { 200: ok } } }, async (req) => ({ data: await catalog.listListings(req.member!.org_id, { status: req.query.status, only: only(req.member!) }) }));
  r.post("/org/listings", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Crea un servicio (borrador)", security: bearer, body: listingBody, response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await catalog.createListing(req.member!.org_id, req.body as never) }; });
  r.get("/org/listings/:id", { onRequest: org(), schema: { tags: ["operadores"], summary: "Detalle de un servicio", security: bearer, params: id, response: { 200: ok } } }, async (req) => {
    const o = only(req.member!); if (o && !o.includes(req.params.id)) throw AppError.notFound("Servicio");
    return { data: await catalog.getListing(req.member!.org_id, req.params.id) };
  });
  r.patch("/org/listings/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Edita un servicio", security: bearer, params: id, body: listingBody.partial(), response: { 200: ok } } }, async (req) => ({ data: await catalog.updateListing(req.member!.org_id, req.params.id, req.body as never) }));
  r.put("/org/listings/:id/status", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Publica, pausa o pasa a borrador (publicar exige organización verificada)", security: bearer, params: id, body: z.object({ status: z.enum(["draft", "published", "paused"]) }), response: { 200: ok } } }, async (req) => ({ data: await catalog.setListingStatus(req.member!.org_id, req.params.id, req.body.status) }));
  r.delete("/org/listings/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Elimina un servicio sin reservas", security: bearer, params: id, response: { 204: z.null() } } }, async (req, reply) => { await catalog.deleteListing(req.member!.org_id, req.params.id); reply.code(204); return null; });

  // ---- Habitaciones, tarifas y bloqueos ----
  r.post("/org/listings/:id/rooms", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Crea una habitación", security: bearer, params: id, body: roomBody, response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await catalog.createRoom(req.member!.org_id, req.params.id, req.body as never) }; });
  r.patch("/org/rooms/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Edita una habitación", security: bearer, params: id.extend({ id: z.string().uuid() }), body: roomBody.partial(), response: { 200: ok } } }, async (req) => ({ data: await catalog.updateRoom(req.member!.org_id, req.params.id, req.body as never) }));
  r.delete("/org/rooms/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Elimina una habitación sin reservas", security: bearer, params: id.extend({ id: z.string().uuid() }), response: { 204: z.null() } } }, async (req, reply) => { await catalog.deleteRoom(req.member!.org_id, req.params.id); reply.code(204); return null; });
  r.put("/org/rooms/:id/rates", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Tarifas: fin de semana, noches mínimas y temporadas", security: bearer, params: id.extend({ id: z.string().uuid() }), body: z.object({ weekend_price: z.number().min(0).nullish(), min_nights: z.number().int().min(1).max(30).optional(), seasons: z.array(z.object({ name: z.string().max(60), from: date, to: date, price: z.number().min(0) })).max(24).optional() }), response: { 200: ok } } }, async (req) => ({ data: await catalog.setRates(req.member!.org_id, req.params.id, req.body) }));
  r.put("/org/rooms/:id/blocks", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Fechas bloqueadas manualmente", security: bearer, params: id.extend({ id: z.string().uuid() }), body: z.object({ blocks: z.array(z.object({ from: date, to: date, reason: z.string().max(120).optional() })).max(200) }), response: { 200: ok } } }, async (req) => ({ data: await catalog.setBlocks(req.member!.org_id, req.params.id, req.body.blocks) }));

  // ---- Reservas del operador ----
  const bookingFilters = z.object({ ...pageQ, status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional(), source: z.enum(["web", "manual", "marketplace"]).optional(), listing_id: z.string().max(80).optional(), from: date.optional(), to: date.optional(), q: z.string().max(100).optional() });
  r.get("/org/bookings", { onRequest: org(), schema: { tags: ["operadores"], summary: "Reservas de mi organización", security: bearer, querystring: bookingFilters, response: { 200: paged } } }, async (req) => {
    const { rows, total } = await bookings.listForOrg(req.member!.org_id, { ...req.query, only: only(req.member!) });
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/org/bookings", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Reserva manual (teléfono, mostrador): confirmada, sin comisión", security: bearer, body: z.object({ request: bookingRequest, contact, notes: z.string().max(1000).optional() }), response: { 201: ok } } }, async (req, reply) => {
    const res = await bookings.create({ request: req.body.request, contact: req.body.contact, notes: req.body.notes, payment_mode: "pay_later" }, { userId: req.user!.id, source: "manual", orgId: req.member!.org_id });
    reply.code(201);
    return { data: res.booking };
  });
  r.get("/org/bookings/:id", { onRequest: org(), schema: { tags: ["operadores"], summary: "Detalle de una reserva", security: bearer, params: id.extend({ id: z.string().uuid() }), response: { 200: ok } } }, async (req) => ({ data: await bookings.getForOrg(req.member!.org_id, req.params.id, only(req.member!)) }));
  r.put("/org/bookings/:id/status", { onRequest: org(), schema: { tags: ["operadores"], summary: "Cambia el estado (cancelar reembolsa todo)", security: bearer, params: id.extend({ id: z.string().uuid() }), body: z.object({ status: z.enum(["confirmed", "in_progress", "completed", "cancelled"]), reason: z.string().max(300).optional() }), response: { 200: ok } } }, async (req) => {
    await bookings.getForOrg(req.member!.org_id, req.params.id, only(req.member!));
    if (req.member!.role === "guia" && req.body.status !== "in_progress" && req.body.status !== "completed") throw new AppError("FORBIDDEN", "Tu rol no permite esta acción");
    const updated = await bookings.setStatus(req.member!.org_id, req.params.id, req.body.status, { reason: req.body.reason });
    if (updated.status === "completed") {
      const uid = (await app.db.query<{ user_id: string | null }>("SELECT user_id FROM bookings WHERE id = $1", [req.params.id])).rows[0]?.user_id;
      if (uid) await app.game.safeGrant({ userId: uid, action: "booking_completed", ref: req.params.id, description: "Reserva completada" }, req.log);
    }
    return { data: updated };
  });
  r.patch("/org/bookings/:id", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Notas internas", security: bearer, params: id.extend({ id: z.string().uuid() }), body: z.object({ notes: z.string().max(1000).nullable() }), response: { 200: ok } } }, async (req) => ({ data: await bookings.updateNotes(req.member!.org_id, req.params.id, req.body.notes) }));
  r.post("/org/bookings/:id/payments", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Registra un cobro manual (efectivo, transferencia)", security: bearer, params: id.extend({ id: z.string().uuid() }), body: z.object({ amount: z.number().gt(0), method: z.enum(["cash", "transfer", "card_present", "other"]).optional() }), response: { 200: ok } } }, async (req) => ({ data: await bookings.addManualPayment(req.member!.org_id, req.params.id, req.body, req.user!.id) }));
  r.get("/org/calendar", { onRequest: org(), schema: { tags: ["operadores"], summary: "Calendario de reservas (máx. 93 días)", security: bearer, querystring: z.object({ from: date, to: date, listing_id: z.string().max(80).optional() }), response: { 200: ok } } }, async (req) => ({ data: await bookings.calendar(req.member!.org_id, req.query.from, req.query.to, only(req.member!), req.query.listing_id) }));
  r.get("/org/income", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Ingresos, comisión y saldo por liquidar", security: bearer, querystring: z.object({ from: date.optional(), to: date.optional() }), response: { 200: ok } } }, async (req) => ({ data: await bookings.income(req.member!.org_id, req.query.from, req.query.to) }));

  // ---- Promociones ----
  r.get("/org/promotions", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Mis códigos promocionales", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await promotions.list(req.member!.org_id) }));
  r.post("/org/promotions", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Crea un código", security: bearer, body: promoBody, response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await promotions.create(req.member!.org_id, req.body) }; });
  r.patch("/org/promotions/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Edita un código", security: bearer, params: id, body: promoBody.partial(), response: { 200: ok } } }, async (req) => ({ data: await promotions.update(req.member!.org_id, req.params.id, req.body) }));
  r.delete("/org/promotions/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Elimina un código", security: bearer, params: id, response: { 204: z.null() } } }, async (req, reply) => { await promotions.remove(req.member!.org_id, req.params.id); reply.code(204); return null; });

  // ================= Fase B: equipo, mensajes, reseñas, calendarios y reportes =================
  const listingScope = (req: FastifyRequest) => only(req.member!);
  const memberId = id.extend({ id: z.string().uuid() });

  // ---- Equipo ----
  r.get("/org/team", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Miembros e invitaciones abiertas", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await team.list(req.member!.org_id) }));
  r.post("/org/team/invitations", { onRequest: org("owner", "admin"), config: rl(20, "1 hour"), schema: { tags: ["operadores"], summary: "Invita a alguien al equipo por correo", security: bearer, body: z.object({ email: z.string().trim().toLowerCase().pipe(z.email().max(254)), role: z.enum(["admin", "recepcion", "guia"]), listing_ids: z.array(z.string().max(80)).max(50).optional() }), response: { 201: ok } } }, async (req, reply) => {
    reply.code(201);
    return { data: await team.invite(req.member!, req.user!.id, req.body) };
  });
  r.delete("/org/team/invitations/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Revoca una invitación", security: bearer, params: memberId, response: { 204: z.null() } } }, async (req, reply) => { await team.revoke(req.member!.org_id, req.member!.role, req.params.id); reply.code(204); return null; });
  r.patch("/org/team/members/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Cambia el rol o los servicios de un miembro", security: bearer, params: memberId, body: z.object({ role: z.enum(["admin", "recepcion", "guia"]).optional(), listing_ids: z.array(z.string().max(80)).max(50).optional() }), response: { 204: z.null() } } }, async (req, reply) => { await team.updateMember(req.member!.org_id, { id: req.user!.id, role: req.member!.role }, req.params.id, req.body); reply.code(204); return null; });
  r.delete("/org/team/members/:id", { onRequest: org(), schema: { tags: ["operadores"], summary: "Quita a un miembro (o sal tú del equipo)", security: bearer, params: memberId, response: { 204: z.null() } } }, async (req, reply) => { await team.remove(req.member!.org_id, { id: req.user!.id, role: req.member!.role }, req.params.id); reply.code(204); return null; });
  r.get("/team-invitations/:token", { config: rl(30, "1 minute"), schema: { tags: ["operadores"], summary: "Vista previa de una invitación", params: z.object({ token: z.string().max(100) }), response: { 200: ok } } }, async (req) => ({ data: await team.preview(req.params.token) }));
  r.post("/team-invitations/:token/accept", { onRequest: app.authenticate, config: rl(10, "1 minute"), schema: { tags: ["operadores"], summary: "Acepta una invitación con la cuenta invitada", security: bearer, params: z.object({ token: z.string().max(100) }), response: { 200: ok } } }, async (req) => ({ data: await team.accept(req.user!.id, req.params.token) }));

  // ---- Mensajes ----
  r.get("/org/messages", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Conversaciones", security: bearer, querystring: z.object({ ...pageQ, unread: z.enum(["true", "false"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await engagement.threads(req.member!.org_id, { unread: req.query.unread === "true", page: req.query.page, per_page: req.query.per_page });
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/org/messages/:thread", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Mensajes de una conversación (la marca como leída)", security: bearer, params: z.object({ thread: z.string().max(120) }), response: { 200: ok } } }, async (req) => ({ data: await engagement.thread(req.member!.org_id, req.params.thread) }));
  r.post("/org/messages/:thread", { onRequest: org("owner", "admin", "recepcion"), schema: { tags: ["operadores"], summary: "Responde una conversación", security: bearer, params: z.object({ thread: z.string().max(120) }), body: z.object({ body: z.string().trim().min(1).max(2000) }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await engagement.reply(req.member!.org_id, req.params.thread, req.body.body) }; });
  r.post("/bookings/:id/messages", { onRequest: optionalUser, config: rl(20, "1 minute"), schema: { tags: ["reservas"], summary: "El viajero escribe al operador desde su reserva", params: id.extend({ id: z.string().uuid() }), querystring: tokenQ, body: z.object({ body: z.string().trim().min(1).max(2000) }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await engagement.travelerMessage(req.params.id, access(req), req.body.body) }; });

  // ---- Reseñas ----
  r.post("/bookings/:id/review", { onRequest: optionalUser, config: rl(10, "1 minute"), schema: { tags: ["reservas"], summary: "Reseña verificada de una reserva completada (una por reserva)", params: id.extend({ id: z.string().uuid() }), querystring: tokenQ, body: z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(2000).optional() }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await engagement.review(req.params.id, access(req), req.body) }; });
  r.get("/listings/:id/reviews", { schema: { tags: ["operadores"], summary: "Reseñas públicas de un servicio", params: id, querystring: z.object(pageQ), response: { 200: paged } } }, async (req, reply) => {
    const { rows, total } = await engagement.publicReviews(req.params.id, req.query.page, req.query.per_page);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/org/reviews", { onRequest: org(), schema: { tags: ["operadores"], summary: "Reseñas de mis servicios", security: bearer, querystring: z.object({ ...pageQ, unanswered: z.enum(["true", "false"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await engagement.orgReviews(req.member!.org_id, { unanswered: req.query.unanswered === "true", only: listingScope(req), page: req.query.page, per_page: req.query.per_page });
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.put("/org/reviews/:id/reply", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Responde una reseña", security: bearer, params: id, body: z.object({ reply: z.string().trim().min(1).max(1000) }), response: { 204: z.null() } } }, async (req, reply) => { await engagement.replyReview(req.member!.org_id, req.params.id, req.body.reply); reply.code(204); return null; });

  // ---- Calendarios iCal ----
  r.get("/ical/:file", { config: rl(60, "1 minute"), schema: { tags: ["operadores"], summary: "Feed iCal de una habitación (URL secreta para Airbnb, Booking, Google…)", params: z.object({ file: z.string().regex(/^[a-f0-9]{20,64}\.ics$/) }) } }, async (req, reply) => {
    reply.header("content-type", "text/calendar; charset=utf-8").header("cache-control", "private, max-age=300");
    return icalSvc.exportFeed(req.params.file.slice(0, -4));
  });
  r.get("/org/rooms/:id/calendar", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "URL de exportación y calendarios importados", security: bearer, params: memberId, response: { 200: ok } } }, async (req) => ({ data: await icalSvc.feedInfo(req.member!.org_id, req.params.id) }));
  r.post("/org/rooms/:id/calendar-links", { onRequest: org("owner", "admin"), config: rl(20, "1 hour"), schema: { tags: ["operadores"], summary: "Importa un calendario iCal externo (https) y bloquea sus fechas", security: bearer, params: memberId, body: z.object({ name: z.string().trim().min(1).max(60), url: z.string().url().max(500) }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await icalSvc.addLink(req.member!.org_id, req.params.id, req.body) }; });
  r.post("/org/calendar-links/:id/sync", { onRequest: org("owner", "admin"), config: rl(30, "1 hour"), schema: { tags: ["operadores"], summary: "Sincroniza ahora un calendario importado", security: bearer, params: memberId, response: { 200: ok } } }, async (req) => ({ data: await icalSvc.sync(req.member!.org_id, req.params.id) }));
  r.delete("/org/calendar-links/:id", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Quita un calendario importado y sus bloqueos", security: bearer, params: memberId, response: { 204: z.null() } } }, async (req, reply) => { await icalSvc.removeLink(req.member!.org_id, req.params.id); reply.code(204); return null; });

  // ---- Reportes ----
  r.get("/org/reports/summary", { onRequest: org("owner", "admin"), schema: { tags: ["operadores"], summary: "Resumen: reservas, ingresos, servicios, canales, cancelaciones y promociones", security: bearer, querystring: z.object({ from: date, to: date }), response: { 200: ok } } }, async (req) => ({ data: await reports.summary(req.member!.org_id, { from: req.query.from, to: req.query.to }) }));

  // ---- Liquidaciones ----
  r.get("/org/payouts", { onRequest: org("owner"), schema: { tags: ["operadores"], summary: "Mis liquidaciones y lo pendiente de pago", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "paid", "failed"]).optional() }), response: { 200: z.object({ data: any, meta: z.any() }) } } }, async (req) => {
    const { rows, total, pending } = await app.payouts.listForOrg(req.member!.org_id, req.query);
    return { data: rows, meta: { ...pageMeta(req.query.page, req.query.per_page, total), pending } };
  });
  r.get("/org/payouts/:id/items", { onRequest: org("owner"), schema: { tags: ["operadores"], summary: "Reservas incluidas en una liquidación", security: bearer, params: memberId, response: { 200: ok } } }, async (req) => ({ data: await app.payouts.items(req.params.id, req.member!.org_id) }));

  // ================= Administración =================
  r.get("/admin/orgs", { onRequest: staff, schema: { tags: ["admin"], summary: "Operadores registrados", security: bearer, querystring: z.object({ ...pageQ, verification: z.enum(["unverified", "pending", "verified", "rejected"]).optional(), q: z.string().max(100).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await catalog.adminListOrgs(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.put("/admin/orgs/:id/verification", { onRequest: staff, schema: { tags: ["admin"], summary: "Verifica o rechaza un operador", security: bearer, params: id.extend({ id: z.string().uuid() }), body: z.object({ verification: z.enum(["unverified", "pending", "verified", "rejected"]) }), response: { 200: ok } } }, async (req) => {
    const data = await catalog.setVerification(req.params.id, req.body.verification);
    await audit(app.db, { actor: req.user!.id, action: "org.verification", entity: "org", id: req.params.id, org: req.params.id, meta: { verification: req.body.verification }, ip: req.ip });
    return { data };
  });
}
