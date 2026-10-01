import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import type { ModerationOutcome, ModerationPorts } from "../../contracts/moderation.js";
import { audit } from "../../lib/audit.js";

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const TYPES = ["review", "post", "comment", "media", "ugc_media", "photo_submission", "report", "creator_video"] as const;
type Type = (typeof TYPES)[number];
const QUEUE_TYPES = TYPES.filter((t) => t !== "comment");
const ACTIONS = ["approve", "reject", "remove"] as const;
type Action = (typeof ACTIONS)[number];

interface Item { type: Type; id: string; author_id: string | null; author_name: string | null; excerpt: string | null; reports: number; auto_flags: string[]; created_at: Date }

/** Moderación unificada (docs §5.17): una cola para reseñas, publicaciones, fotos y reportes, con la misma acción y aviso al autor. */
export async function adminModerationRoutes(app: FastifyInstance, { screenReview, decide, closeReport }: ModerationPorts) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const mod = app.requireRole("admin", "moderator"), admin = app.requireRole("admin");
  const tag = ["admin", "moderación"];
  const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(30) };
  const flagged = (text: string | null) => (text ? screenReview(text) : []);
  const limitSql = (perPage: number, pageNo: number) => `LIMIT ${perPage} OFFSET ${(pageNo - 1) * perPage}`;

  /** Lo pendiente de cada tipo, normalizado. */
  const pending: Record<Exclude<Type, "comment">, { count: string; list: (limit: string) => string }> = {
    review: {
      count: "SELECT count(*)::int AS n FROM reviews WHERE status = 'pending'",
      list: (l) => `SELECT r.id, r.user_id AS author_id, p.display_name AS author_name, coalesce(r.comment, r.title) AS excerpt, r.report_count AS reports, r.created_at FROM reviews r LEFT JOIN profiles p ON p.id = r.user_id WHERE r.status = 'pending' ORDER BY r.report_count DESC, r.created_at ${l}`,
    },
    post: {
      count: "SELECT count(*)::int AS n FROM social_posts WHERE report_count > 0 AND is_active AND deleted_at IS NULL",
      list: (l) => `SELECT s.id, s.user_id AS author_id, p.display_name AS author_name, s.content AS excerpt, s.report_count AS reports, s.created_at FROM social_posts s LEFT JOIN profiles p ON p.id = s.user_id WHERE s.report_count > 0 AND s.is_active AND s.deleted_at IS NULL ORDER BY s.report_count DESC, s.created_at ${l}`,
    },
    media: {
      count: "SELECT count(*)::int AS n FROM media_assets WHERE status = 'in_review'",
      list: (l) => `SELECT m.id, m.owner_id AS author_id, p.display_name AS author_name, coalesce(m.alt, m.purpose) AS excerpt, 0 AS reports, m.created_at FROM media_assets m LEFT JOIN profiles p ON p.id = m.owner_id WHERE m.status = 'in_review' ORDER BY m.created_at ${l}`,
    },
    ugc_media: {
      count: "SELECT count(*)::int AS n FROM ugc_media WHERE status = 'pending'",
      list: (l) => `SELECT m.id, m.user_id AS author_id, p.display_name AS author_name, m.media_url AS excerpt, 0 AS reports, m.created_at FROM ugc_media m LEFT JOIN profiles p ON p.id = m.user_id WHERE m.status = 'pending' ORDER BY m.created_at ${l}`,
    },
    photo_submission: {
      count: "SELECT count(*)::int AS n FROM photo_submissions WHERE NOT is_approved",
      list: (l) => `SELECT s.id, s.user_id AS author_id, p.display_name AS author_name, s.caption AS excerpt, 0 AS reports, s.created_at FROM photo_submissions s LEFT JOIN profiles p ON p.id = s.user_id WHERE NOT s.is_approved ORDER BY s.created_at ${l}`,
    },
    report: {
      count: "SELECT count(*)::int AS n FROM ugc_reports WHERE status = 'pendiente'",
      list: (l) => `SELECT rp.id, rp.user_id AS author_id, p.display_name AS author_name, rp.target_type || ': ' || rp.reason AS excerpt, 1 AS reports, rp.created_at FROM ugc_reports rp LEFT JOIN profiles p ON p.id = rp.user_id WHERE rp.status = 'pendiente' ORDER BY rp.created_at ${l}`,
    },
    // Punto 44: las publicaciones de creador entran en la misma cola mientras esperan moderación.
    creator_video: {
      count: "SELECT count(*)::int AS n FROM creator_videos WHERE status = 'pending_review'",
      list: (l) => `SELECT v.id, v.creator_id AS author_id, c.display_name AS author_name, v.title AS excerpt, 0 AS reports, v.created_at FROM creator_videos v LEFT JOIN creator_profiles c ON c.id = v.creator_id WHERE v.status = 'pending_review' ORDER BY v.created_at ${l}`,
    },
  };

  r.get("/admin/moderation/queue", {
    onRequest: mod,
    schema: { tags: tag, summary: "Cola unificada de lo pendiente (sin `type`: lo más antiguo de cada tipo, con los totales)", security: bearer, querystring: z.object({ ...page, type: z.enum(QUEUE_TYPES).optional() }), response: { 200: paged } },
  }, async (req) => {
    const fetchType = async (t: Exclude<Type, "comment">, perPage: number, pageNo: number): Promise<Item[]> =>
      (await db.query(pending[t].list(limitSql(perPage, pageNo)))).rows.map((x) => ({ type: t, id: x.id, author_id: x.author_id, author_name: x.author_name, excerpt: x.excerpt ? String(x.excerpt).slice(0, 300) : null, reports: x.reports, auto_flags: t === "review" || t === "post" || t === "photo_submission" ? flagged(x.excerpt) : [], created_at: x.created_at }));
    const totals = Object.fromEntries(await Promise.all(QUEUE_TYPES.map(async (t) => [t, (await db.query<{ n: number }>(pending[t].count)).rows[0]!.n] as const)));
    if (req.query.type) return { data: await fetchType(req.query.type, req.query.per_page, req.query.page), meta: { ...pageMeta(req.query.page, req.query.per_page, totals[req.query.type]!), totals } };
    const per = Math.min(req.query.per_page, 20);
    const merged = (await Promise.all(QUEUE_TYPES.map((t) => fetchType(t, per, 1)))).flat().sort((a, b) => b.reports - a.reports || a.created_at.getTime() - b.created_at.getTime());
    return { data: merged, meta: { totals, total: Object.values(totals).reduce((s, n) => s + n, 0) } };
  });

  /** Aplica la acción en el dominio dueño del contenido y devuelve a quién avisar. */
  const apply = async (type: Type, id: string, action: Action, reason: string | undefined, actor: string): Promise<ModerationOutcome> => {
    if (type !== "photo_submission") return decide[type](id, action, reason, actor);
    const s = (await db.query<{ user_id: string }>("SELECT user_id FROM photo_submissions WHERE id = $1", [id])).rows[0];
    if (!s) throw AppError.notFound("Foto");
    await app.community.moderate(id, action === "approve" ? "approve" : "reject", reason);
    return { authorId: s.user_id, label: "tu foto del reto" };
  };

  r.post("/admin/moderation/:type/:id/:action", {
    onRequest: mod,
    schema: {
      tags: tag, summary: "Aprueba, rechaza o retira un contenido (rechazar y retirar exigen motivo). Avisa a la persona y queda auditado", security: bearer,
      params: z.object({ type: z.enum(TYPES), id: z.string().uuid(), action: z.enum(ACTIONS) }), body: z.object({ reason: z.string().trim().min(3).max(300).optional() }).nullish(), response: { 200: ok },
    },
  }, async (req) => {
    const { type, id, action } = req.params;
    const reason = req.body?.reason;
    if (action !== "approve" && !reason) throw AppError.validation("Indica el motivo", { field: "reason" });
    const { authorId, label } = await apply(type, id, action, reason, req.user!.id);
    const approved = action === "approve";
    if (type !== "report") await app.notifications.notify(authorId, { type: "social", title: approved ? `Aprobamos ${label}` : action === "remove" ? `Retiramos ${label}` : `No pudimos aprobar ${label}`, message: approved ? null : reason, link: null, data: { moderated: type, id } });
    else await app.notifications.notify(authorId, { type: "system", title: "Revisamos tu reporte", message: "Gracias por ayudarnos a cuidar la comunidad.", data: { report_id: id } });
    await audit(db, { actor: req.user!.id, action: `moderation.${action}`, entity: type, id, meta: { reason }, ip: req.ip });
    return { data: { type, id, action, notified: !!authorId } };
  });

  // ---------- Punto 44: apelaciones de contenido de creador ----------
  r.get("/admin/moderation/appeals", {
    onRequest: mod,
    schema: { tags: tag, summary: "Apelaciones pendientes de creadores, con contexto limitado (sin correo ni datos de pago)", security: bearer, querystring: z.object(page), response: { 200: paged } },
  }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM creator_video_appeals WHERE status = 'pending'")).rows[0]!.n;
    const { rows } = await db.query(
      `SELECT a.id, a.video_id, a.creator_id, a.reason, a.status, a.rule_code, a.created_at,
              v.title AS video_title, v.status AS video_status, v.review_notes,
              c.handle AS creator_handle, c.display_name AS creator_name
         FROM creator_video_appeals a
         JOIN creator_videos v ON v.id = a.video_id
         JOIN creator_profiles c ON c.id = a.creator_id
        WHERE a.status = 'pending'
        ORDER BY a.created_at ${limitSql(req.query.per_page, req.query.page)}`,
    );
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.post("/admin/moderation/appeals/:id/resolve", {
    onRequest: mod,
    schema: {
      tags: tag, summary: "Resuelve la apelación de un creador: aceptarla devuelve la publicación a revisión", security: bearer,
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ status: z.enum(["accepted", "rejected"]), note: z.string().trim().min(3).max(300) }),
      response: { 200: ok },
    },
  }, async (req) => {
    // `resolveAppeal` resuelve en una transacción y escribe la entrada de auditoría dentro de ella.
    const { appeal, video } = await app.creators.resolveAppeal(req.user!.id, req.params.id, req.body.status, req.body.note, req.ip);
    return { data: { appeal, video_status: video?.status ?? null } };
  });

  // ---------- Reportes ----------
  r.get("/admin/moderation/reports", {
    onRequest: mod,
    schema: { tags: tag, summary: "Reportes de usuarios con un extracto de lo reportado", security: bearer, querystring: z.object({ ...page, status: z.enum(["pendiente", "revisado", "ignorado"]).default("pendiente") }), response: { 200: paged } },
  }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM ugc_reports WHERE status = $1", [req.query.status])).rows[0]!.n;
    const { rows } = await db.query(`SELECT rp.id, rp.user_id AS reporter_id, rp.target_type, rp.target_id, rp.reason, rp.status, rp.created_at FROM ugc_reports rp WHERE rp.status = $1 ORDER BY rp.created_at ${limitSql(req.query.per_page, req.query.page)}`, [req.query.status]);
    const excerpt = async (t: string, id: string) => {
      const sql = t === "post" ? "SELECT content AS x FROM social_posts WHERE id = $1" : t === "review" ? "SELECT coalesce(comment, title) AS x FROM reviews WHERE id = $1" : t === "comment" ? "SELECT content AS x FROM social_comments WHERE id = $1" : null;
      return sql ? ((await db.query<{ x: string | null }>(sql, [id])).rows[0]?.x?.slice(0, 300) ?? null) : null;
    };
    return { data: await Promise.all(rows.map(async (x) => ({ ...x, excerpt: await excerpt(x.target_type, x.target_id) }))), meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/moderation/reports/:id", {
    onRequest: mod,
    schema: { tags: tag, summary: "Cierra un reporte como revisado o ignorado", security: bearer, params: z.object({ id: z.string().uuid() }), body: z.object({ status: z.enum(["revisado", "ignorado"]), note: z.string().trim().max(300).optional() }), response: { 200: ok } },
  }, async (req) => {
    const rp = await closeReport(req.params.id, req.body.status);
    if (!rp) throw AppError.notFound("Reporte");
    await app.notifications.notify(rp.user_id, { type: "system", title: "Revisamos tu reporte", message: "Gracias por ayudarnos a cuidar la comunidad.", data: { report_id: req.params.id } });
    await audit(db, { actor: req.user!.id, action: "moderation.report_closed", entity: "ugc_report", id: req.params.id, meta: { status: req.body.status, note: req.body.note }, ip: req.ip });
    return { data: { id: req.params.id, status: req.body.status } };
  });

  // ---------- Prueba de filtros automáticos ----------
  r.post("/admin/moderation/rules/test", {
    onRequest: admin,
    schema: { tags: tag, summary: "Prueba los filtros automáticos con un texto: motivos detectados y si se publicaría sin revisión", security: bearer, body: z.object({ text: z.string().min(1).max(5000) }), response: { 200: ok } },
  }, async (req) => {
    const reasons = screenReview(req.body.text);
    return { data: { reasons, would_publish: reasons.length === 0, rules: ["contains_link", "contains_contact", "shouting", "repeated_characters", "profanity"] } };
  });
}
