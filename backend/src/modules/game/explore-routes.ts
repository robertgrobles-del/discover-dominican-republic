import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { tableAdminRoutes, type TableCfg } from "../admin/tables.js";
import { audit } from "../operators/team.js";
import { CommunityGame } from "./community.js";
import { ExploreService, sha } from "./explore.js";

declare module "fastify" { interface FastifyInstance { explore: ExploreService; community: CommunityGame } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const proof = { lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional(), accuracy_m: z.number().min(0).max(100_000).optional(), qr_code: z.string().trim().min(6).max(200).optional() };

const TABLES: TableCfg[] = [
  { table: "gamified_routes", pk: "id", readonly: ["id", "created_at", "updated_at"], order: "name", label: "Rutas gamificadas" },
  { table: "route_checkpoints", pk: "id", readonly: ["id", "created_at", "qr_hash"], order: "route_id, checkpoint_order", label: "Puntos de ruta" },
  { table: "digital_collectibles", pk: "id", readonly: ["id", "created_at", "updated_at", "current_supply"], order: "name", label: "Coleccionables" },
  { table: "photo_challenges", pk: "id", readonly: ["id", "created_at", "closed_at"], order: "created_at DESC", label: "Retos de foto" },
  { table: "explorer_guilds", pk: "id", readonly: ["id", "created_at", "member_count", "total_xp", "created_by"], order: "name", label: "Gremios" },
];

/** Pasaporte, rutas, provincias, coleccionables, retos de foto y gremios (docs §5.11). */
export async function exploreRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const explore = app.explore, community = app.community;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const auth = app.authenticate;
  const admin = app.requireRole("admin");
  const mod = app.requireRole("admin", "moderator");
  const tag = ["explorar"];
  const pub = <T>(reply: { header: (k: string, v: string) => unknown }, v: T) => { reply.header("cache-control", PUBLIC_CACHE); return v; };

  // ---------- Pasaporte y provincias ----------
  r.get("/passport/me", { onRequest: auth, schema: { tags: tag, summary: "Mi pasaporte: sellos, totales y provincias", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await explore.passport(req.user!.id) }));
  r.post("/passport/stamps", {
    onRequest: auth, config: rl(30, "1 hour"),
    schema: { tags: tag, summary: "Sella un lugar: se verifica tu ubicación (o el QR del lugar) en el servidor", security: bearer, body: z.object({ entity_type: z.string().max(40), entity_id: z.string().uuid(), notes: z.string().trim().max(500).optional(), rating: z.number().int().min(1).max(5).optional(), ...proof }), response: { 201: ok } },
  }, async (req, reply) => { reply.code(201); return { data: await explore.stamp(req.user!.id, req.body) }; });

  r.get("/gamification/provinces", { onRequest: auth, schema: { tags: tag, summary: "Provincias visitadas y pendientes", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await explore.provinces(req.user!.id) }));
  r.post("/gamification/provinces/:slug/visit", { onRequest: auth, config: rl(20, "1 hour"), schema: { tags: tag, summary: "Registra la visita a una provincia con tu ubicación", security: bearer, params: z.object({ slug: z.string().max(100) }), body: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), accuracy_m: z.number().min(0).max(100_000).optional() }), response: { 200: ok } } }, async (req) => ({ data: await explore.visitProvince(req.user!.id, req.params.slug, req.body) }));

  // ---------- Rutas ----------
  r.get("/gamification/routes", { onRequest: optionalUser, schema: { tags: tag, summary: "Rutas gamificadas (con mi avance si hay sesión)", security: [{}, ...bearer], response: { 200: ok } } }, async (req) => ({ data: await explore.routes(req.user?.id ?? null) }));
  r.get("/gamification/routes/:id", { onRequest: optionalUser, schema: { tags: tag, summary: "Detalle de una ruta con sus puntos", security: [{}, ...bearer], params: z.object({ id: z.string().max(100) }), response: { 200: ok } } }, async (req) => ({ data: await explore.route(req.params.id, req.user?.id ?? null) }));
  r.post("/gamification/routes/:id/start", { onRequest: auth, schema: { tags: tag, summary: "Inicia una ruta", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await explore.startRoute(req.user!.id, req.params.id) }));
  r.post("/gamification/routes/:id/checkpoints/:cp/complete", {
    onRequest: auth, config: rl(60, "1 hour"),
    schema: { tags: tag, summary: "Completa un punto de la ruta (ubicación o QR verificados en el servidor; en orden si la ruta es secuencial)", security: bearer, params: z.object({ id: z.string().uuid(), cp: z.string().uuid() }), body: z.object({ photo_media_id: z.string().uuid().optional(), ...proof }), response: { 200: ok } },
  }, async (req) => ({ data: await explore.completeCheckpoint(req.user!.id, req.params.id, req.params.cp, req.body) }));

  // ---------- Coleccionables ----------
  r.get("/collectibles", { onRequest: optionalUser, schema: { tags: tag, summary: "Catálogo de coleccionables (suministro restante y condición de desbloqueo)", security: [{}, ...bearer], response: { 200: ok } } }, async (req) => ({ data: await community.collectibles(req.user?.id ?? null) }));
  r.get("/collectibles/me", { onRequest: auth, schema: { tags: tag, summary: "Mi colección", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await community.myCollectibles(req.user!.id) }));
  r.patch("/collectibles/me/:id", { onRequest: auth, schema: { tags: tag, summary: "Marca como favorito u ordena uno de mis coleccionables", security: bearer, params: uuid, body: z.object({ is_favorite: z.boolean().optional(), display_order: z.number().int().min(0).max(1000).nullable().optional() }), response: { 204: z.null() } } }, async (req, reply) => { await community.updateMine(req.user!.id, req.params.id, req.body); reply.code(204); return null; });
  r.delete("/collectibles/me/:id", { onRequest: auth, schema: { tags: tag, summary: "Quita un coleccionable de mi colección", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => { await community.removeMine(req.user!.id, req.params.id); reply.code(204); return null; });
  r.post("/collectibles/:id/claim", { onRequest: auth, config: rl(20, "1 hour"), schema: { tags: tag, summary: "Reclama un coleccionable si cumples su condición (suministro limitado, sin sobreventa)", security: bearer, params: uuid, response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await community.claim(req.user!.id, req.params.id) }; });

  // ---------- Retos de foto ----------
  r.get("/gamification/photo-challenges", { schema: { tags: tag, summary: "Retos de fotografía", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await community.challenges() }));
  r.get("/gamification/photo-challenges/:id/submissions", { onRequest: optionalUser, schema: { tags: tag, summary: "Fotos aprobadas de un reto, ordenadas por votos", security: [{}, ...bearer], params: uuid, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(50).default(24) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const s = await community.submissions(req.params.id, req.user?.id ?? null, req.query.page, req.query.per_page);
    return { data: s.rows, meta: pageMeta(req.query.page, req.query.per_page, s.total) };
  });
  r.post("/gamification/photo-challenges/:id/submissions", { onRequest: auth, config: rl(10, "1 hour"), schema: { tags: tag, summary: "Envía tu foto (subida antes con /media/upload-url); queda pendiente de moderación", security: bearer, params: uuid, body: z.object({ media_id: z.string().uuid(), caption: z.string().trim().max(200).optional() }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await community.submit(req.user!.id, req.params.id, req.body) }; });
  r.post("/gamification/photo-submissions/:id/vote", { onRequest: auth, config: rl(60, "1 hour"), schema: { tags: tag, summary: "Vota una foto (una vez; no la propia)", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await community.vote(req.user!.id, req.params.id) }));

  // ---------- Gremios ----------
  r.get("/gamification/guilds", { onRequest: optionalUser, schema: { tags: tag, summary: "Gremios de exploradores", security: [{}, ...bearer], response: { 200: ok } } }, async (req) => ({ data: await community.guilds(req.user?.id ?? null) }));
  r.post("/gamification/guilds", { onRequest: auth, config: rl(5, "1 hour"), schema: { tags: tag, summary: "Crea un gremio (nivel 3 o más; un gremio por persona)", security: bearer, body: z.object({ name: z.string().trim().min(3).max(60), description: z.string().trim().max(300).optional(), icon: z.string().max(8).optional(), region: z.string().trim().min(2).max(60) }), response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await community.createGuild(req.user!.id, req.body) }; });
  r.post("/gamification/guilds/:id/join", { onRequest: auth, config: rl(20, "1 hour"), schema: { tags: tag, summary: "Únete a un gremio", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => { await community.join(req.user!.id, req.params.id); reply.code(204); return null; });
  r.post("/gamification/guilds/:id/leave", { onRequest: auth, schema: { tags: tag, summary: "Sal de tu gremio (el mando pasa al miembro más antiguo; si eres el último, se disuelve)", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await community.leave(req.user!.id, req.params.id) }));

  // ================= Administración =================
  r.post("/admin/place-qr", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Genera el código QR de un lugar (se muestra una sola vez; sólo se guarda su hash)", security: bearer, body: z.object({ entity_type: z.string().max(40), entity_id: z.string().uuid() }), response: { 201: ok } },
  }, async (req, reply) => {
    const code = `RD-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
    const place = await explore.createPlaceQr(req.body.entity_type, req.body.entity_id, code);
    await audit(db, { actor: req.user!.id, action: "explore.place_qr", entity: place.entity_type, id: place.entity_id, ip: req.ip });
    reply.code(201);
    return { data: { ...place, code, note: "Guarda o imprime este código ahora: no se puede volver a consultar." } };
  });
  r.post("/admin/route-checkpoints/:id/qr", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Genera el código QR de un punto de ruta (se muestra una sola vez)", security: bearer, params: uuid, response: { 201: ok } },
  }, async (req, reply) => {
    const code = `RD-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
    if (!(await db.query("UPDATE route_checkpoints SET qr_hash = $2 WHERE id = $1", [req.params.id, sha(code)])).rowCount) throw AppError.notFound("Punto de ruta");
    await audit(db, { actor: req.user!.id, action: "explore.checkpoint_qr", entity: "route_checkpoint", id: req.params.id, ip: req.ip });
    reply.code(201);
    return { data: { checkpoint_id: req.params.id, code, note: "Guarda o imprime este código ahora: no se puede volver a consultar." } };
  });
  r.get("/admin/photo-submissions", { onRequest: mod, schema: { tags: ["admin"], summary: "Fotos de retos por moderar", security: bearer, querystring: z.object({ status: z.enum(["pending", "approved"]).default("pending"), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const w = req.query.status === "approved";
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM photo_submissions WHERE is_approved = $1", [w])).rows[0]!.n;
    const { rows } = await db.query(`SELECT s.id, s.challenge_id, s.user_id, s.image_url, s.caption, s.votes, s.is_approved, s.is_winner, s.created_at, c.title AS challenge FROM photo_submissions s JOIN photo_challenges c ON c.id = s.challenge_id WHERE s.is_approved = $1 ORDER BY s.created_at LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [w]);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/photo-submissions/:id/moderate", { onRequest: mod, schema: { tags: ["admin"], summary: "Aprueba o rechaza una foto de un reto", security: bearer, params: uuid, body: z.object({ action: z.enum(["approve", "reject"]), note: z.string().trim().max(300).optional() }), response: { 200: ok } } }, async (req) => {
    const res = await community.moderate(req.params.id, req.body.action, req.body.note);
    await audit(db, { actor: req.user!.id, action: `explore.photo_${req.body.action}`, entity: "photo_submission", id: req.params.id, ip: req.ip });
    return { data: res };
  });
  r.post("/admin/photo-challenges/:id/close", { onRequest: admin, schema: { tags: ["admin"], summary: "Cierra el reto y premia a la foto más votada", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const res = await community.closeChallenge(req.params.id);
    await audit(db, { actor: req.user!.id, action: "explore.challenge_closed", entity: "photo_challenge", id: req.params.id, meta: res as never, ip: req.ip });
    return { data: res };
  });
  await tableAdminRoutes(app, TABLES, ["admin"]);
}
