import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { BY_TABLE, COLLECTIONS } from "../content/collections.js";
import { manifest } from "../content/routes.js";
import { audit } from "../operators/team.js";

const REVIEWABLE = new Map(COLLECTIONS.filter((c) => c.reviewable).map((c) => [c.entityType, c]));
const TYPES = [...REVIEWABLE.keys()] as [string, ...string[]];
const PROFANITY = /\b(mierda|puta|puto|carajo|coño|pendejo|maldito|fuck|shit|bitch|asshole)\b/i;

/** Moderación automática: lo dudoso pasa a `pending` para revisión humana; lo limpio se publica. */
export function screenReview(text: string): string[] {
  const reasons: string[] = [];
  if (/(https?:\/\/|www\.|\b[\w-]+\.(com|net|org|do|io|xyz)\b)/i.test(text)) reasons.push("contains_link");
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text) || /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(text)) reasons.push("contains_contact");
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letters.length > 20 && (letters.match(/[A-ZÁÉÍÓÚÑ]/g)?.length ?? 0) / letters.length > 0.6) reasons.push("shouting");
  if (/(.)\1{7,}/.test(text)) reasons.push("repeated_characters");
  if (PROFANITY.test(text)) reasons.push("profanity");
  return reasons;
}

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const reviewBody = z.object({
  rating: z.number().int().min(1).max(5), title: z.string().trim().max(120).optional(), comment: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(2000).optional(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** Reseñas del portal: escritura, moderación y respuesta oficial. La lectura pública vive en cada colección (`/{colección}/{id}/reviews`). */
export async function reviewRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  /** Mantiene `rating` y `review_count` de la entidad (si su tabla los tiene) con las reseñas aprobadas. */
  const refresh = async (entityType: string, entityId: string) => {
    const def = REVIEWABLE.get(entityType);
    const cols = def ? manifest[def.table] : undefined;
    if (!def || (!cols?.rating && !cols?.review_count)) return;
    const sets: string[] = [];
    if (cols.rating) sets.push("rating = coalesce((SELECT round(avg(rating)::numeric, 1) FROM reviews WHERE entity_type = $1 AND entity_id = $2 AND is_approved), rating)");
    if (cols.review_count) sets.push("review_count = (SELECT count(*) FROM reviews WHERE entity_type = $1 AND entity_id = $2 AND is_approved)");
    await db.query(`UPDATE "${def.table}" SET ${sets.join(", ")} WHERE id = $2`, [entityType, entityId]);
  };

  const entityExists = async (type: string, id: string) => {
    const def = REVIEWABLE.get(type)!;
    const cols = manifest[def.table] ?? {};
    const extra = [cols.status ? "status = 'published'" : "", cols.deleted_at ? "deleted_at IS NULL" : "", def.visible ?? ""].filter(Boolean).join(" AND ");
    return !!(await db.query(`SELECT 1 FROM "${def.table}" WHERE id = $1${extra ? ` AND ${extra}` : ""}`, [id])).rowCount;
  };

  const own = async (userId: string, id: string) => {
    const row = (await db.query("SELECT id, entity_type, entity_id, rating, title, comment, status, created_at FROM reviews WHERE id = $1 AND user_id = $2", [id, userId])).rows[0];
    if (!row) throw AppError.notFound("Reseña");
    return row;
  };

  r.post("/reviews", {
    preHandler: app.authenticate, config: rl(20, "1 hour"),
    schema: { tags: ["reseñas"], summary: "Deja una reseña (una por entidad; pasa por moderación automática)", security: bearer, body: reviewBody.extend({ entity_type: z.enum(TYPES), entity_id: z.string().uuid() }), response: { 201: ok } },
  }, async (req, reply) => {
    const b = req.body;
    if (!(await entityExists(b.entity_type, b.entity_id))) throw AppError.notFound("Lugar o servicio");
    const verified = !!(await db.query("SELECT 1 FROM users WHERE id = $1 AND email_verified_at IS NOT NULL", [req.user!.id])).rowCount;
    const reasons = screenReview(`${b.title ?? ""} ${b.comment ?? ""}`);
    if (!verified) reasons.push("email_not_verified");
    const status = reasons.length ? "pending" : "approved";
    try {
      const row = (await db.query<{ id: string }>(
        `INSERT INTO reviews (user_id, entity_type, entity_id, rating, title, comment, visit_date, status, is_approved, moderation_note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [req.user!.id, b.entity_type, b.entity_id, b.rating, b.title ?? null, b.comment ?? null, b.visit_date ?? null, status, status === "approved", reasons.join(",") || null],
      )).rows[0]!;
      if (status === "approved") await refresh(b.entity_type, b.entity_id);
      reply.code(201);
      return { data: { id: row.id, status, ...(status === "pending" ? { message: "Tu reseña está en revisión y se publicará pronto." } : {}) } };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya dejaste una reseña aquí; edítala en lugar de crear otra", { reason: "ALREADY_REVIEWED" });
      throw e;
    }
  });

  r.patch("/reviews/:id", {
    preHandler: app.authenticate, config: rl(30, "1 hour"),
    schema: { tags: ["reseñas"], summary: "Edita mi reseña (vuelve a moderarse)", security: bearer, params: uuid, body: reviewBody.partial(), response: { 200: ok } },
  }, async (req) => {
    const cur = await own(req.user!.id, req.params.id);
    const b = req.body;
    const title = b.title ?? cur.title, comment = b.comment ?? cur.comment;
    const reasons = screenReview(`${title ?? ""} ${comment ?? ""}`);
    const status = reasons.length ? "pending" : cur.status === "rejected" ? "pending" : "approved";
    await db.query(
      "UPDATE reviews SET rating = coalesce($2, rating), title = $3, comment = $4, visit_date = coalesce($5, visit_date), status = $6, is_approved = ($6 = 'approved'), moderation_note = $7, updated_at = now() WHERE id = $1",
      [cur.id, b.rating ?? null, title, comment, b.visit_date ?? null, status, reasons.join(",") || null],
    );
    await refresh(cur.entity_type, cur.entity_id);
    return { data: { id: cur.id, status } };
  });

  r.delete("/reviews/:id", { preHandler: app.authenticate, schema: { tags: ["reseñas"], summary: "Elimina mi reseña", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const cur = await own(req.user!.id, req.params.id);
    await db.query("DELETE FROM reviews WHERE id = $1", [cur.id]);
    await refresh(cur.entity_type, cur.entity_id);
    reply.code(204);
    return null;
  });

  r.post("/reviews/:id/helpful", { preHandler: app.authenticate, config: rl(120, "1 hour"), schema: { tags: ["reseñas"], summary: "Marca una reseña como útil (una vez; no la propia)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const rev = (await db.query<{ user_id: string }>("SELECT user_id FROM reviews WHERE id = $1 AND is_approved", [req.params.id])).rows[0];
    if (!rev) throw AppError.notFound("Reseña");
    if (rev.user_id === req.user!.id) throw AppError.validation("No puedes votar tu propia reseña");
    const ins = await db.query("INSERT INTO review_votes (review_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [req.params.id, req.user!.id]);
    if (ins.rowCount) await db.query("UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1", [req.params.id]);
    reply.code(204);
    return null;
  });

  r.post("/reviews/:id/report", {
    preHandler: app.authenticate, config: rl(30, "1 hour"),
    schema: { tags: ["reseñas"], summary: "Reporta una reseña (a los 3 reportes distintos se oculta hasta revisarla)", security: bearer, params: uuid, body: z.object({ reason: z.enum(["spam", "offensive", "fake", "irrelevant", "other"]), detail: z.string().trim().max(500).optional() }), response: { 204: z.null() } },
  }, async (req, reply) => {
    const rev = (await db.query<{ entity_type: string; entity_id: string }>("SELECT entity_type, entity_id FROM reviews WHERE id = $1 AND is_approved", [req.params.id])).rows[0];
    if (!rev) throw AppError.notFound("Reseña");
    const ins = await db.query("INSERT INTO review_reports (review_id, user_id, reason, detail) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING", [req.params.id, req.user!.id, req.body.reason, req.body.detail ?? null]);
    if (ins.rowCount) {
      const n = (await db.query<{ report_count: number }>("UPDATE reviews SET report_count = report_count + 1 WHERE id = $1 RETURNING report_count", [req.params.id])).rows[0]!.report_count;
      if (n >= 3) {
        await db.query("UPDATE reviews SET status = 'pending', is_approved = false, moderation_note = 'reported' WHERE id = $1", [req.params.id]);
        await refresh(rev.entity_type, rev.entity_id);
      }
    }
    reply.code(204);
    return null;
  });

  r.get("/me/reviews", { preHandler: app.authenticate, schema: { tags: ["reseñas"], summary: "Mis reseñas (incluye las pendientes)", security: bearer, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(50).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM reviews WHERE user_id = $1", [req.user!.id])).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, entity_type, entity_id, rating, title, comment, visit_date, status, helpful_count, reply, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.user!.id]);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  // ---- Respuesta oficial del establecimiento ----
  r.post("/reviews/:id/reply", {
    preHandler: app.authenticate,
    schema: { tags: ["reseñas"], summary: "Respuesta oficial (editor/admin, o el operador dueño del servicio)", security: bearer, params: uuid, body: z.object({ reply: z.string().trim().min(1).max(1000) }), response: { 204: z.null() } },
  }, async (req, reply) => {
    const rev = (await db.query<{ entity_type: string; entity_id: string }>("SELECT entity_type, entity_id FROM reviews WHERE id = $1 AND is_approved", [req.params.id])).rows[0];
    if (!rev) throw AppError.notFound("Reseña");
    const staff = req.user!.roles.some((x) => ["admin", "editor"].includes(x));
    if (!staff) throw new AppError("FORBIDDEN", "Sólo el equipo del sitio puede responder reseñas de contenido del portal");
    await db.query("UPDATE reviews SET reply = $2, replied_at = now() WHERE id = $1", [req.params.id, req.body.reply]);
    await audit(db, { actor: req.user!.id, action: "review.reply", entity: "review", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---- Moderación (docs §5.17) ----
  const mod = app.requireRole("admin", "moderator");
  r.get("/admin/reviews", {
    preHandler: mod,
    schema: { tags: ["admin"], summary: "Cola de moderación de reseñas", security: bearer, querystring: z.object({ status: z.enum(["pending", "approved", "rejected"]).default("pending"), reported: z.enum(["true", "false"]).optional(), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req) => {
    const w = `r.status = $1${req.query.reported === "true" ? " AND r.report_count > 0" : ""}`;
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM reviews r WHERE ${w}`, [req.query.status])).rows[0]!.n;
    const { rows } = await db.query(
      `SELECT r.id, r.entity_type, r.entity_id, r.rating, r.title, r.comment, r.status, r.moderation_note, r.report_count, r.created_at, r.user_id, p.display_name
         FROM reviews r LEFT JOIN profiles p ON p.id = r.user_id WHERE ${w} ORDER BY r.report_count DESC, r.created_at LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.query.status],
    );
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/reviews/:id", {
    preHandler: mod,
    schema: { tags: ["admin"], summary: "Aprueba o rechaza una reseña", security: bearer, params: uuid, body: z.object({ status: z.enum(["approved", "rejected"]), note: z.string().trim().max(300).optional() }), response: { 204: z.null() } },
  }, async (req, reply) => {
    const rev = (await db.query<{ entity_type: string; entity_id: string }>(
      "UPDATE reviews SET status = $2, is_approved = ($2 = 'approved'), moderation_note = coalesce($3, moderation_note), report_count = CASE WHEN $2 = 'approved' THEN 0 ELSE report_count END WHERE id = $1 RETURNING entity_type, entity_id", [req.params.id, req.body.status, req.body.note ?? null],
    )).rows[0];
    if (!rev) throw AppError.notFound("Reseña");
    if (req.body.status === "approved") await db.query("DELETE FROM review_reports WHERE review_id = $1", [req.params.id]);
    await refresh(rev.entity_type, rev.entity_id);
    await audit(db, { actor: req.user!.id, action: `review.${req.body.status}`, entity: "review", id: req.params.id, meta: { note: req.body.note }, ip: req.ip });
    reply.code(204);
    return null;
  });
}

void BY_TABLE;
