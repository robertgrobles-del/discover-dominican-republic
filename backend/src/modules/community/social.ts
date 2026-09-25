import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { COLLECTIONS } from "../content/collections.js";
import { audit } from "../operators/team.js";
import { screenReview } from "./reviews.js";

const POSTS_PER_DAY = 10;
const REPORTS_TO_HIDE = 3;
const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const httpsUrl = z.string().url().max(500).refine((u) => u.startsWith("https://"), "Debe ser una URL https");
const ENTITY_TYPES = [...new Set(COLLECTIONS.map((c) => c.entityType))] as [string, ...string[]];

const author = (name: string | null, avatar: string | null, id: string) => {
  const [first = "", second = ""] = (name ?? "").trim().split(/\s+/);
  return { id, name: first ? `${first}${second ? ` ${second[0]!.toUpperCase()}.` : ""}` : "Explorador", avatar_url: avatar };
};
const encodeCursor = (d: Date, id: string) => Buffer.from(`${d.toISOString()}|${id}`).toString("base64url");
const decodeCursor = (c: string): [string, string] | null => {
  const [t, id] = Buffer.from(c, "base64url").toString().split("|");
  return t && id && !Number.isNaN(Date.parse(t)) && /^[0-9a-f-]{36}$/.test(id) ? [t, id] : null;
};

/** RD Social (docs §5.6): publicaciones, likes, comentarios, reportes y medios de usuarios, con moderación. */
export async function socialRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const mod = app.requireRole("admin", "moderator");

  /** Publicar y comentar exige correo verificado (frena cuentas desechables). */
  const requireVerified = async (userId: string) => {
    if (!(await db.query("SELECT 1 FROM users WHERE id = $1 AND email_verified_at IS NOT NULL", [userId])).rowCount) throw new AppError("FORBIDDEN", "Verifica tu correo para participar en RD Social", { code: "EMAIL_NOT_VERIFIED" });
  };
  const screen = (text: string) => {
    const bad = screenReview(text).filter((x) => x !== "shouting");
    if (bad.length) throw new AppError("BUSINESS_RULE", "Tu mensaje no cumple las normas de la comunidad (enlaces, datos de contacto o lenguaje ofensivo)", { code: "CONTENT_REJECTED", reasons: bad });
  };

  const postSelect = (me: string | null) => `p.id, p.user_id, p.content, p.image_url, p.gallery, p.location, p.destination_id, p.entity_ref, p.likes_count, p.comments_count, p.created_at,
      pr.display_name, pr.avatar_url, ${me ? "EXISTS (SELECT 1 FROM social_likes l WHERE l.post_id = p.id AND l.user_id = $ME) AS liked_by_me" : "false AS liked_by_me"}`;
  const toPost = (x: Record<string, any>) => ({
    id: x.id, author: author(x.display_name, x.avatar_url, x.user_id), content: x.content, media: [...(x.image_url ? [x.image_url] : []), ...((x.gallery as string[] | null) ?? [])], location: x.location, destination_id: x.destination_id,
    entity_ref: x.entity_ref, likes_count: x.likes_count, comments_count: x.comments_count, liked_by_me: !!x.liked_by_me, created_at: new Date(x.created_at).toISOString(),
  });
  const VISIBLE = "p.is_active AND p.deleted_at IS NULL AND coalesce(pr.is_suspended, false) = false";

  r.get("/social/feed", {
    preHandler: optionalUser,
    schema: {
      tags: ["social"], summary: "Feed de RD Social", security: [{}, ...bearer],
      querystring: z.object({ filter: z.enum(["latest", "following", "trending", "province"]).default("latest"), province_id: z.string().uuid().optional(), cursor: z.string().max(200).optional(), limit: z.coerce.number().int().min(1).max(50).default(20) }),
      response: { 200: z.object({ data: z.any(), meta: z.any() }) },
    },
  }, async (req) => {
    const { filter, limit } = req.query;
    const me = req.user?.id ?? null;
    if (filter === "following" && !me) throw new AppError("UNAUTHENTICATED", "Inicia sesión para ver a quienes sigues");
    const params: unknown[] = me ? [me] : [];
    const where = [VISIBLE];
    if (filter === "following") where.push("p.user_id IN (SELECT following_id FROM explorer_follows WHERE follower_id = $1)");
    if (filter === "province") {
      if (!req.query.province_id) throw AppError.validation("Falta province_id");
      params.push(req.query.province_id);
      where.push(`p.destination_id IN (SELECT id FROM destinations WHERE province_id = $${params.length})`);
    }
    let order = "p.created_at DESC, p.id DESC";
    if (filter === "trending") { where.push("p.created_at > now() - interval '7 days'"); order = "(p.likes_count * 2 + p.comments_count) DESC, p.created_at DESC, p.id DESC"; }
    else if (req.query.cursor) {
      const c = decodeCursor(req.query.cursor);
      if (!c) throw AppError.validation("Cursor inválido");
      params.push(c[0], c[1]);
      where.push(`(p.created_at, p.id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`);
    }
    const sql = `SELECT ${postSelect(me).replace(/\$ME/g, "$1")} FROM social_posts p JOIN profiles pr ON pr.id = p.user_id WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${limit + 1}`;
    const rows = (await db.query(sql, params)).rows;
    const page = rows.slice(0, limit);
    const last = page.at(-1);
    return { data: page.map(toPost), meta: { limit, next_cursor: filter !== "trending" && rows.length > limit && last ? encodeCursor(new Date(last.created_at), last.id) : null } };
  });

  r.post("/social/posts", {
    preHandler: app.authenticate, config: rl(20, "1 hour"),
    schema: {
      tags: ["social"], summary: `Publica (máx. ${POSTS_PER_DAY} al día; correo verificado)`, security: bearer,
      body: z.object({ content: z.string().trim().min(1).max(1000), media: z.array(httpsUrl).max(6).optional(), location: z.string().trim().max(120).optional(), destination_id: z.string().uuid().optional(), entity_ref: z.object({ type: z.enum(ENTITY_TYPES), id: z.string().uuid() }).optional() }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body, me = req.user!.id;
    await requireVerified(me);
    screen(b.content);
    const today = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM social_posts WHERE user_id = $1 AND created_at > now() - interval '24 hours'", [me])).rows[0]!.n;
    if (today >= POSTS_PER_DAY) throw new AppError("RATE_LIMITED", `Llegaste al máximo de ${POSTS_PER_DAY} publicaciones por día`, { code: "DAILY_POST_LIMIT" });
    if (b.destination_id && !(await db.query("SELECT 1 FROM destinations WHERE id = $1", [b.destination_id])).rowCount) throw AppError.validation("El destino no existe");
    const [image, ...gallery] = b.media ?? [];
    const row = (await db.query<{ id: string }>(
      "INSERT INTO social_posts (user_id, content, image_url, gallery, location, destination_id, entity_ref) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [me, b.content, image ?? null, gallery.length ? JSON.stringify(gallery) : null, b.location ?? null, b.destination_id ?? null, b.entity_ref ? JSON.stringify(b.entity_ref) : null],
    )).rows[0]!;
    reply.code(201);
    return { data: { id: row.id } };
  });

  r.delete("/social/posts/:id", { preHandler: app.authenticate, schema: { tags: ["social"], summary: "Borra una publicación (dueño o moderador; borrado lógico)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const p = (await db.query<{ user_id: string }>("SELECT user_id FROM social_posts WHERE id = $1 AND deleted_at IS NULL", [req.params.id])).rows[0];
    if (!p) throw AppError.notFound("Publicación");
    const staff = req.user!.roles.some((x) => ["admin", "moderator"].includes(x));
    if (p.user_id !== req.user!.id && !staff) throw AppError.notFound("Publicación"); // no revela publicaciones ajenas
    await db.query("UPDATE social_posts SET deleted_at = now(), is_active = false WHERE id = $1", [req.params.id]);
    if (p.user_id !== req.user!.id) await audit(db, { actor: req.user!.id, action: "social.post_deleted", entity: "social_post", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  const visiblePost = async (id: string) => {
    const p = (await db.query("SELECT p.id FROM social_posts p JOIN profiles pr ON pr.id = p.user_id WHERE p.id = $1 AND " + VISIBLE, [id])).rows[0];
    if (!p) throw AppError.notFound("Publicación");
  };

  r.put("/social/posts/:id/like", { preHandler: app.authenticate, config: rl(200, "1 hour"), schema: { tags: ["social"], summary: "Like (idempotente)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await visiblePost(req.params.id);
    const ins = await db.query("INSERT INTO social_likes (user_id, post_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [req.user!.id, req.params.id]);
    if (ins.rowCount) await db.query("UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = $1", [req.params.id]);
    reply.code(204);
    return null;
  });
  r.delete("/social/posts/:id/like", { preHandler: app.authenticate, schema: { tags: ["social"], summary: "Quita el like", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const del = await db.query("DELETE FROM social_likes WHERE user_id = $1 AND post_id = $2", [req.user!.id, req.params.id]);
    if (del.rowCount) await db.query("UPDATE social_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1", [req.params.id]);
    reply.code(204);
    return null;
  });

  r.get("/social/posts/:id/comments", { schema: { tags: ["social"], summary: "Comentarios de una publicación", params: uuid, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    await visiblePost(req.params.id);
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM social_comments WHERE post_id = $1 AND is_active", [req.params.id])).rows[0]!.n;
    const { rows } = await db.query(
      `SELECT c.id, c.user_id, c.content, c.created_at, pr.display_name, pr.avatar_url FROM social_comments c JOIN profiles pr ON pr.id = c.user_id
        WHERE c.post_id = $1 AND c.is_active AND coalesce(pr.is_suspended, false) = false ORDER BY c.created_at, c.id LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.params.id],
    );
    return { data: rows.map((c) => ({ id: c.id, author: author(c.display_name, c.avatar_url, c.user_id), content: c.content, created_at: new Date(c.created_at).toISOString() })), meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.post("/social/posts/:id/comments", {
    preHandler: app.authenticate, config: rl(30, "1 hour"),
    schema: { tags: ["social"], summary: "Comenta (3–500 caracteres)", security: bearer, params: uuid, body: z.object({ content: z.string().trim().min(3).max(500) }), response: { 201: ok } },
  }, async (req, reply) => {
    await requireVerified(req.user!.id);
    await visiblePost(req.params.id);
    screen(req.body.content);
    const dup = await db.query("SELECT 1 FROM social_comments WHERE user_id = $1 AND post_id = $2 AND content = $3 AND created_at > now() - interval '1 day'", [req.user!.id, req.params.id, req.body.content]);
    if (dup.rowCount) throw new AppError("CONFLICT", "Ya publicaste ese mismo comentario", { reason: "DUPLICATE_COMMENT" });
    const c = (await db.query<{ id: string; created_at: Date }>("INSERT INTO social_comments (user_id, post_id, content) VALUES ($1,$2,$3) RETURNING id, created_at", [req.user!.id, req.params.id, req.body.content])).rows[0]!;
    await db.query("UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = $1", [req.params.id]);
    reply.code(201);
    // xp_awarded lo calculará el módulo de gamificación (docs §5.11); hasta entonces siempre es 0.
    return { data: { comment: { id: c.id, content: req.body.content, created_at: c.created_at.toISOString() }, xp_awarded: 0 } };
  });

  r.delete("/social/comments/:id", { preHandler: app.authenticate, schema: { tags: ["social"], summary: "Borra un comentario (dueño o moderador)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const c = (await db.query<{ user_id: string; post_id: string }>("SELECT user_id, post_id FROM social_comments WHERE id = $1 AND is_active", [req.params.id])).rows[0];
    const staff = req.user!.roles.some((x) => ["admin", "moderator"].includes(x));
    if (!c || (c.user_id !== req.user!.id && !staff)) throw AppError.notFound("Comentario");
    await db.query("UPDATE social_comments SET is_active = false WHERE id = $1", [req.params.id]);
    await db.query("UPDATE social_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [c.post_id]);
    reply.code(204);
    return null;
  });

  r.get("/social/me/comment-stats", { preHandler: app.authenticate, schema: { tags: ["social"], summary: "Mis estadísticas de participación", security: bearer, response: { 200: ok } } }, async (req) => {
    const row = (await db.query<{ posts_today: number; total_comments: number }>(
      "SELECT (SELECT count(*)::int FROM social_posts WHERE user_id = $1 AND created_at > now() - interval '24 hours') AS posts_today, (SELECT count(*)::int FROM social_comments WHERE user_id = $1 AND is_active) AS total_comments", [req.user!.id],
    )).rows[0]!;
    return { data: row };
  });

  // ---------- Reportes y medios de usuarios ----------
  const REPORT_TARGETS = ["post", "comment", "review", "ugc_media", "user"] as const;
  r.post("/ugc/reports", {
    preHandler: app.authenticate, config: rl(30, "1 hour"),
    schema: { tags: ["social"], summary: "Reporta contenido (a los 3 reportes distintos una publicación se oculta hasta revisarla)", security: bearer, body: z.object({ target_type: z.enum(REPORT_TARGETS), target_id: z.string().uuid(), reason: z.enum(["spam", "offensive", "fake", "inappropriate", "other"]), detail: z.string().trim().max(500).optional() }), response: { 204: z.null() } },
  }, async (req, reply) => {
    const b = req.body;
    const table = { post: "social_posts", comment: "social_comments", review: "reviews", ugc_media: "ugc_media", user: "users" }[b.target_type];
    if (!(await db.query(`SELECT 1 FROM ${table} WHERE id = $1`, [b.target_id])).rowCount) throw AppError.notFound("Contenido");
    const ins = await db.query("INSERT INTO ugc_reports (user_id, target_type, target_id, reason, detail) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING", [req.user!.id, b.target_type, b.target_id, b.reason, b.detail ?? null]);
    if (ins.rowCount && b.target_type === "post") {
      const n = (await db.query<{ report_count: number }>("UPDATE social_posts SET report_count = report_count + 1 WHERE id = $1 RETURNING report_count", [b.target_id])).rows[0]!.report_count;
      if (n >= REPORTS_TO_HIDE) await db.query("UPDATE social_posts SET is_active = false WHERE id = $1 AND deleted_at IS NULL", [b.target_id]);
    }
    reply.code(204);
    return null;
  });

  r.post("/ugc/media", {
    preHandler: app.authenticate, config: rl(20, "1 hour"),
    schema: { tags: ["social"], summary: "Sube una foto o video de un lugar (queda pendiente de aprobación)", security: bearer, body: z.object({ media_url: httpsUrl, media_type: z.enum(["photo", "video"]), entity_type: z.enum(ENTITY_TYPES), entity_id: z.string().uuid() }), response: { 201: ok } },
  }, async (req, reply) => {
    await requireVerified(req.user!.id);
    const b = req.body;
    const def = COLLECTIONS.find((c) => c.entityType === b.entity_type)!;
    if (!(await db.query(`SELECT 1 FROM "${def.table}" WHERE id = $1`, [b.entity_id])).rowCount) throw AppError.notFound("Lugar o servicio");
    const row = (await db.query<{ id: string }>("INSERT INTO ugc_media (user_id, media_url, media_type, associated_entity_type, associated_entity_id) VALUES ($1,$2,$3,$4,$5) RETURNING id", [req.user!.id, b.media_url, b.media_type, b.entity_type, b.entity_id])).rows[0]!;
    reply.code(201);
    return { data: { id: row.id, status: "pending" } };
  });
  r.get("/ugc/media", { schema: { tags: ["social"], summary: "Fotos y videos aprobados de un lugar", querystring: z.object({ entity_type: z.enum(ENTITY_TYPES), entity_id: z.string().uuid() }), response: { 200: ok } } }, async (req) => ({
    data: (await db.query("SELECT id, media_url, media_type, created_at FROM ugc_media WHERE associated_entity_type = $1 AND associated_entity_id = $2 AND status = 'approved' ORDER BY created_at DESC LIMIT 100", [req.query.entity_type, req.query.entity_id])).rows,
  }));

  // ---------- Moderación (docs §5.17) ----------
  const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) };
  r.get("/admin/ugc/reports", { preHandler: mod, schema: { tags: ["admin"], summary: "Cola de reportes de usuarios", security: bearer, querystring: z.object({ ...page, status: z.enum(["pendiente", "revisado", "ignorado"]).default("pendiente") }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM ugc_reports WHERE status = $1", [req.query.status])).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, user_id, target_type, target_id, reason, detail, status, created_at FROM ugc_reports WHERE status = $1 ORDER BY created_at LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.query.status]);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/ugc/reports/:id", { preHandler: mod, schema: { tags: ["admin"], summary: "Resuelve un reporte", security: bearer, params: uuid, body: z.object({ status: z.enum(["revisado", "ignorado"]) }), response: { 204: z.null() } } }, async (req, reply) => {
    const res = await db.query("UPDATE ugc_reports SET status = $2 WHERE id = $1", [req.params.id, req.body.status]);
    if (!res.rowCount) throw AppError.notFound("Reporte");
    await audit(db, { actor: req.user!.id, action: "ugc.report_resolved", entity: "ugc_report", id: req.params.id, meta: { status: req.body.status }, ip: req.ip });
    reply.code(204);
    return null;
  });
  r.patch("/admin/social/posts/:id", { preHandler: mod, schema: { tags: ["admin"], summary: "Oculta o restaura una publicación", security: bearer, params: uuid, body: z.object({ is_active: z.boolean() }), response: { 204: z.null() } } }, async (req, reply) => {
    const res = await db.query("UPDATE social_posts SET is_active = $2, report_count = CASE WHEN $2 THEN 0 ELSE report_count END WHERE id = $1 AND deleted_at IS NULL", [req.params.id, req.body.is_active]);
    if (!res.rowCount) throw AppError.notFound("Publicación");
    await audit(db, { actor: req.user!.id, action: req.body.is_active ? "social.post_restored" : "social.post_hidden", entity: "social_post", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });
  r.get("/admin/ugc/media", { preHandler: mod, schema: { tags: ["admin"], summary: "Medios de usuarios por aprobar", security: bearer, querystring: z.object({ ...page, status: z.enum(["pending", "approved", "rejected"]).default("pending") }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM ugc_media WHERE status = $1", [req.query.status])).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, user_id, media_url, media_type, associated_entity_type AS entity_type, associated_entity_id AS entity_id, status, created_at FROM ugc_media WHERE status = $1 ORDER BY created_at LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.query.status]);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/ugc/media/:id", { preHandler: mod, schema: { tags: ["admin"], summary: "Aprueba o rechaza un medio", security: bearer, params: uuid, body: z.object({ status: z.enum(["approved", "rejected"]) }), response: { 204: z.null() } } }, async (req, reply) => {
    const res = await db.query("UPDATE ugc_media SET status = $2 WHERE id = $1", [req.params.id, req.body.status]);
    if (!res.rowCount) throw AppError.notFound("Medio");
    await audit(db, { actor: req.user!.id, action: `ugc.media_${req.body.status}`, entity: "ugc_media", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });
}
