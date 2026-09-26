import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import type { TripService } from "./service.js";

declare module "fastify" { interface FastifyInstance { trips: TripService } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha AAAA-MM-DD");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora HH:MM");
const url = z.string().url().max(500);
const spotId = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,79}$/);

const tripBody = z.object({
  title: z.string().trim().min(2).max(120), start_date: date.nullable(), end_date: date.nullable(), party_size: z.number().int().min(1).max(100), budget: z.number().min(0).max(100_000_000).nullable(),
  currency: z.enum(["USD", "DOP"]), notes: z.string().trim().max(2000).nullable(),
});
const itemBody = z.object({
  day: z.number().int().min(1).max(60), time: time.nullable(), entity_type: z.string().trim().max(40), entity_id: z.string().uuid(), title: z.string().trim().max(160), notes: z.string().trim().max(1000).nullable(), cost: z.number().min(0).max(10_000_000),
});
const itinerary = z.object({ days: z.array(z.object({ title: z.string().trim().max(160).optional(), items: z.array(z.object({ type: z.string().trim().max(40).optional(), ref: z.string().trim().max(60).optional(), title: z.string().trim().max(160).optional(), time: z.string().max(5).optional(), notes: z.string().trim().max(1000).optional(), cost: z.number().min(0).max(10_000_000).optional() })).max(30) })).min(1).max(60) });

/** Mi viaje, e-tickets y reto Top 100 (docs §5.7). */
export async function tripRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const trips = app.trips;
  const auth = app.authenticate;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const tag = ["mi viaje"];
  const trip = z.object({ id: z.string().uuid() });
  const tripItem = z.object({ id: z.string().uuid(), itemId: z.string().uuid() });

  r.get("/me/trips", { onRequest: auth, schema: { tags: tag, summary: "Mis viajes y los compartidos conmigo", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await trips.list(req.user!.id) }));
  r.post("/me/trips", { onRequest: auth, schema: { tags: tag, summary: "Crea un viaje (máximo 50)", security: bearer, body: tripBody.partial().required({ title: true }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await trips.create(req.user!.id, req.body as never) }; });
  r.get("/me/trips/:id", { onRequest: auth, schema: { tags: tag, summary: "Detalle con las actividades por día, votos y miembros", security: bearer, params: trip, response: { 200: ok } } }, async (req) => ({ data: await trips.get(req.params.id, req.user!.id) }));
  r.patch("/me/trips/:id", { onRequest: auth, schema: { tags: tag, summary: "Edita el viaje (dueño)", security: bearer, params: trip, body: tripBody.partial().strict(), response: { 200: ok } } }, async (req) => ({ data: await trips.update(req.params.id, req.user!.id, req.body) }));
  r.delete("/me/trips/:id", { onRequest: auth, schema: { tags: tag, summary: "Elimina el viaje (dueño)", security: bearer, params: trip, response: { 204: z.null() } } }, async (req, reply) => { await trips.remove(req.params.id, req.user!.id); reply.code(204); return null; });

  r.post("/me/trips/:id/items", { onRequest: auth, config: rl(120, "1 minute"), schema: { tags: tag, summary: "Agrega una actividad (lugar del catálogo o texto libre)", security: bearer, params: trip, body: itemBody.partial().required({ day: true }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await trips.addItem(req.params.id, req.user!.id, req.body as never) }; });
  r.patch("/me/trips/:id/items/:itemId", { onRequest: auth, schema: { tags: tag, summary: "Edita una actividad (día, hora, notas, costo)", security: bearer, params: tripItem, body: itemBody.pick({ day: true, time: true, title: true, notes: true, cost: true }).partial().strict(), response: { 200: ok } } }, async (req) => ({ data: await trips.updateItem(req.params.id, req.params.itemId, req.user!.id, req.body as never) }));
  r.delete("/me/trips/:id/items/:itemId", { onRequest: auth, schema: { tags: tag, summary: "Quita una actividad", security: bearer, params: tripItem, response: { 204: z.null() } } }, async (req, reply) => { await trips.removeItem(req.params.id, req.params.itemId, req.user!.id); reply.code(204); return null; });
  r.post("/me/trips/:id/reorder", { onRequest: auth, schema: { tags: tag, summary: "Reordena y cambia de día varias actividades", security: bearer, params: trip, body: z.object({ items: z.array(z.object({ id: z.string().uuid(), day: z.number().int().min(1).max(60), position: z.number().int().min(0).max(1000) })).min(1).max(300) }), response: { 200: ok } } }, async (req) => ({ data: await trips.reorder(req.params.id, req.user!.id, req.body.items) }));
  r.post("/me/trips/:id/from-itinerary", { onRequest: auth, config: rl(20, "1 minute"), schema: { tags: tag, summary: "Copia un itinerario (prediseñado o de /ai/itinerary) al viaje", security: bearer, params: trip, body: itinerary, response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await trips.fromItinerary(req.params.id, req.user!.id, req.body.days) }; });
  r.get("/me/trips/:id/summary", { onRequest: auth, schema: { tags: tag, summary: "Presupuesto estimado, mapa (GeoJSON) y reservas del periodo", security: bearer, params: trip, response: { 200: ok } } }, async (req) => ({ data: await trips.summary(req.params.id, req.user!.id) }));

  r.post("/me/trips/:id/share", { onRequest: auth, schema: { tags: tag, summary: "Crea el enlace público de sólo lectura (se muestra una vez; volver a llamar lo reemplaza)", security: bearer, params: trip, response: { 200: ok } } }, async (req) => ({ data: await trips.share(req.params.id, req.user!.id) }));
  r.delete("/me/trips/:id/share", { onRequest: auth, schema: { tags: tag, summary: "Deja de compartir el viaje", security: bearer, params: trip, response: { 204: z.null() } } }, async (req, reply) => { await trips.unshare(req.params.id, req.user!.id); reply.code(204); return null; });
  r.get("/trips/shared/:token", { config: rl(60, "1 minute"), schema: { tags: tag, summary: "Vista pública de un viaje compartido (sin costos ni datos privados)", params: z.object({ token: z.string().min(20).max(80) }), response: { 200: ok } } }, async (req, reply) => { reply.header("cache-control", PUBLIC_CACHE); return { data: await trips.shared(req.params.token) }; });

  r.post("/me/trips/:id/members", { onRequest: auth, config: rl(20, "1 hour"), schema: { tags: tag, summary: "Crea un enlace de invitación al planificador grupal (viewer o editor, válido 7 días, 5 usos)", security: bearer, params: trip, body: z.object({ role: z.enum(["viewer", "editor"]) }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await trips.invite(req.params.id, req.user!.id, req.body.role) }; });
  r.post("/trips/join", { onRequest: auth, config: rl(20, "1 hour"), schema: { tags: tag, summary: "Acepta una invitación con su token", security: bearer, body: z.object({ token: z.string().min(20).max(80) }), response: { 200: ok } } }, async (req) => ({ data: await trips.join(req.user!.id, req.body.token) }));
  r.delete("/me/trips/:id/members/:userId", { onRequest: auth, schema: { tags: tag, summary: "El dueño quita a un miembro, o un miembro sale del viaje", security: bearer, params: z.object({ id: z.string().uuid(), userId: z.string().uuid() }), response: { 204: z.null() } } }, async (req, reply) => { await trips.removeMember(req.params.id, req.user!.id, req.params.userId); reply.code(204); return null; });
  r.post("/me/trips/:id/items/:itemId/vote", { onRequest: auth, config: rl(120, "1 minute"), schema: { tags: tag, summary: "Voto +1 / −1 (0 lo retira)", security: bearer, params: tripItem, body: z.object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) }), response: { 200: ok } } }, async (req) => ({ data: await trips.vote(req.params.id, req.params.itemId, req.user!.id, req.body.value) }));

  const diaryBody = z.object({ entry_date: date, title: z.string().trim().min(1).max(120), body: z.string().trim().max(5000), location: z.string().trim().max(120), photos: z.array(url).max(10), is_public: z.boolean() });
  r.get("/me/trips/:id/diary", { onRequest: auth, schema: { tags: tag, summary: "Diario del viaje", security: bearer, params: trip, response: { 200: ok } } }, async (req) => ({ data: await trips.diary(req.params.id, req.user!.id) }));
  r.post("/me/trips/:id/diary", { onRequest: auth, config: rl(60, "1 hour"), schema: { tags: tag, summary: "Nueva entrada del diario (opcionalmente pública en el enlace compartido)", security: bearer, params: trip, body: diaryBody.partial().required({ entry_date: true, title: true }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await trips.addDiary(req.params.id, req.user!.id, req.body as never) }; });
  r.patch("/me/trips/:id/diary/:entryId", { onRequest: auth, schema: { tags: tag, summary: "Edita una entrada", security: bearer, params: z.object({ id: z.string().uuid(), entryId: z.string().uuid() }), body: diaryBody.partial().strict(), response: { 200: ok } } }, async (req) => ({ data: await trips.updateDiary(req.params.id, req.params.entryId, req.user!.id, req.body) }));
  r.delete("/me/trips/:id/diary/:entryId", { onRequest: auth, schema: { tags: tag, summary: "Borra una entrada", security: bearer, params: z.object({ id: z.string().uuid(), entryId: z.string().uuid() }), response: { 204: z.null() } } }, async (req, reply) => { await trips.removeDiary(req.params.id, req.params.entryId, req.user!.id); reply.code(204); return null; });

  r.get("/me/trips/:id/packing-list", { onRequest: auth, schema: { tags: tag, summary: "Lista de empaque", security: bearer, params: trip, response: { 200: ok } } }, async (req) => ({ data: await trips.packing(req.params.id, req.user!.id) }));
  r.put("/me/trips/:id/packing-list", { onRequest: auth, schema: { tags: tag, summary: "Reemplaza la lista de empaque (marcar/desmarcar)", security: bearer, params: trip, body: z.object({ items: z.array(z.object({ id: z.string().min(1).max(40), label: z.string().trim().min(1).max(100), checked: z.boolean(), category: z.string().trim().max(40).optional() })).max(200) }), response: { 200: ok } } }, async (req) => ({ data: await trips.setPacking(req.params.id, req.user!.id, req.body.items) }));
  r.post("/me/trips/:id/check-in", { onRequest: auth, config: rl(20, "1 minute"), schema: { tags: tag, summary: "Check-in digital de una reserva propia (suma XP una sola vez)", security: bearer, params: trip, body: z.object({ booking_id: z.string().uuid() }), response: { 200: ok } } }, async (req) => ({ data: await trips.checkIn(req.params.id, req.user!.id, req.body.booking_id) }));

  // ---------- E-tickets ----------
  r.get("/me/tickets", { onRequest: auth, schema: { tags: tag, summary: "Mis e-tickets (eventos) y vouchers de reservas, con el código para el QR", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await trips.tickets(req.user!.id) }));
  r.get("/me/tickets/:id", { onRequest: auth, schema: { tags: tag, summary: "Detalle de un ticket", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await trips.ticket(req.user!.id, req.params.id) }));
  r.post("/tickets/verify", { onRequest: auth, config: rl(240, "1 minute"), schema: { tags: tag, summary: "Escáner: valida un código; los tickets de eventos se marcan como usados (personal) y las reservas las consulta el personal del operador", security: bearer, body: z.object({ code: z.string().trim().min(4).max(60) }), response: { 200: ok } } }, async (req) => ({ data: await trips.verify(req.user!.id, req.user!.roles, req.body.code) }));

  // ---------- Reto Top 100 ----------
  r.get("/me/spots", { onRequest: auth, schema: { tags: tag, summary: "Mis lugares del Top 100: visitados y deseados", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await trips.spots(req.user!.id) }));
  r.put("/me/spots/:spot_id", { onRequest: auth, config: rl(60, "1 minute"), schema: { tags: tag, summary: "Marca un lugar como visitado (10/25/50/100 dan premios)", security: bearer, params: z.object({ spot_id: spotId }), body: z.object({ notes: z.string().trim().max(300).optional() }).nullish(), response: { 200: ok } } }, async (req) => ({ data: await trips.markVisited(req.user!.id, req.params.spot_id, req.body?.notes) }));
  r.delete("/me/spots/:spot_id", { onRequest: auth, schema: { tags: tag, summary: "Quita un lugar de mis visitados (el premio ya otorgado se conserva)", security: bearer, params: z.object({ spot_id: spotId }), response: { 204: z.null() } } }, async (req, reply) => { await trips.unmark(req.user!.id, req.params.spot_id, "visited"); reply.code(204); return null; });
  r.put("/me/wishlist/:spot_id", { onRequest: auth, config: rl(60, "1 minute"), schema: { tags: tag, summary: "Agrega un lugar a mi lista de deseos", security: bearer, params: z.object({ spot_id: spotId }), response: { 200: ok } } }, async (req) => ({ data: await trips.wish(req.user!.id, req.params.spot_id) }));
  r.delete("/me/wishlist/:spot_id", { onRequest: auth, schema: { tags: tag, summary: "Quita un lugar de mi lista de deseos", security: bearer, params: z.object({ spot_id: spotId }), response: { 204: z.null() } } }, async (req, reply) => { await trips.unmark(req.user!.id, req.params.spot_id, "wishlist"); reply.code(204); return null; });
}
