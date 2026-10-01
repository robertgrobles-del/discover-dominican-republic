import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { IdentityAdminPort } from "../../contracts/identity.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import type { NotifyFn } from "../../contracts/notifications.js";
import type { Db } from "../../db/pool.js";
import { audit, auditInsert } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";

/** Cada cuánto se abre sola una revisión del personal y cuánto tiempo hay para completarla. */
export const REVIEW_EVERY_DAYS = 90;
export const REVIEW_DUE_DAYS = 14;
const ROLES_LOCK = 7271002; // mismo candado que los cambios de rol: el conteo de administradores se lee bajo él

interface ReviewRow { id: string; scope: string; status: string; opened_by: string | null; due_at: Date; created_at: Date; closed_at: Date | null }

/**
 * Revisiones periódicas de acceso (plan de accesos, punto 99): cada cierto tiempo una persona responsable
 * confirma o retira los roles del personal, con fecha, decisión y justificación. Una revisión es una foto de
 * los accesos en el momento de abrirla; cerrar exige haber decidido todos sus elementos.
 */
export class AccessReviewService {
  constructor(private readonly db: Db, private readonly identity: IdentityAdminPort) {}

  /** Abre una revisión del personal con todos los roles globales distintos de `user`. Null si ya hay una abierta. */
  async open(openedBy: string | null): Promise<ReviewRow | null> {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      if ((await c.query("SELECT 1 FROM access_reviews WHERE status = 'open' FOR UPDATE")).rowCount) { await c.query("ROLLBACK"); return null; }
      const review = (await c.query<ReviewRow>(
        "INSERT INTO access_reviews (scope, opened_by, due_at) VALUES ('staff', $1, now() + make_interval(days => $2)) RETURNING id, scope, status, opened_by, due_at, created_at, closed_at",
        [openedBy, REVIEW_DUE_DAYS],
      )).rows[0]!;
      await c.query(
        `INSERT INTO access_review_items (review_id, subject_user_id, role, expires_at)
         SELECT $1, ur.user_id, ur.role::text, ur.expires_at FROM user_roles ur JOIN users u ON u.id = ur.user_id
          WHERE ur.role::text <> 'user' AND u.status <> 'deleted' AND (ur.expires_at IS NULL OR ur.expires_at > now())`, [review.id],
      );
      await auditInsert(c, { actor: openedBy, action: "access_review.opened", entity: "access_review", id: review.id, meta: { scope: "staff", automatic: openedBy === null } });
      await c.query("COMMIT");
      return review;
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  /** Días desde que se cerró la última revisión; null si nunca hubo una. */
  async daysSinceLastClosed(): Promise<number | null> {
    const row = (await this.db.query<{ days: number | null }>("SELECT floor(extract(epoch FROM now() - max(closed_at)) / 86400)::int AS days FROM access_reviews WHERE status = 'closed'")).rows[0];
    return row?.days ?? null;
  }

  async list() {
    return (await this.db.query(
      `SELECT r.id, r.scope, r.status, r.opened_by, r.due_at, r.created_at, r.closed_at, (r.status = 'open' AND r.due_at < now()) AS overdue,
              count(i.id)::int AS items, count(i.id) FILTER (WHERE i.decision IS NULL)::int AS pending,
              count(i.id) FILTER (WHERE i.decision = 'revoke')::int AS revoked
         FROM access_reviews r LEFT JOIN access_review_items i ON i.review_id = r.id
        GROUP BY r.id ORDER BY r.created_at DESC LIMIT 50`,
    )).rows;
  }

  async get(id: string) {
    const review = (await this.db.query<ReviewRow>("SELECT id, scope, status, opened_by, due_at, created_at, closed_at FROM access_reviews WHERE id = $1", [id])).rows[0];
    if (!review) throw AppError.notFound("Revisión de accesos");
    const { rows } = await this.db.query<{ subject_user_id: string }>(
      `SELECT i.id, i.subject_user_id, u.email, p.display_name, i.role, i.expires_at, i.decision, i.justification, i.decided_by, i.decided_at
         FROM access_review_items i JOIN users u ON u.id = i.subject_user_id LEFT JOIN profiles p ON p.id = u.id
        WHERE i.review_id = $1 ORDER BY i.role, u.email`, [id],
    );
    // La última sesión ayuda a detectar accesos sin uso; es un dato de `auth` y se le pide a él.
    const sessions = await this.identity.lastSessionAt([...new Set(rows.map((row) => row.subject_user_id))]);
    return { ...review, items: rows.map((row) => ({ ...row, last_session_at: sessions.get(row.subject_user_id) ?? null })) };
  }

  /** Confirma o retira un acceso. Retirar quita el rol y cierra las sesiones en la misma transacción que la decisión. */
  async decide(reviewId: string, itemId: string, reviewerId: string, decision: "keep" | "revoke", justification: string, ip: string) {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock($1)", [ROLES_LOCK]);
      const item = (await c.query<{ subject_user_id: string; role: string; decision: string | null; status: string }>(
        "SELECT i.subject_user_id, i.role, i.decision, r.status FROM access_review_items i JOIN access_reviews r ON r.id = i.review_id WHERE i.id = $1 AND i.review_id = $2 FOR UPDATE OF i", [itemId, reviewId],
      )).rows[0];
      if (!item) throw AppError.notFound("Elemento de la revisión");
      if (item.status !== "open") throw new AppError("BUSINESS_RULE", "La revisión ya está cerrada", { code: "INVALID_STATE" });
      if (item.decision) throw new AppError("BUSINESS_RULE", "Ese acceso ya fue revisado", { code: "INVALID_STATE" });
      if (item.subject_user_id === reviewerId) throw new AppError("FORBIDDEN", "No puedes revisar tus propios accesos: debe hacerlo otra persona", { code: "SELF_REVIEW" });
      if (decision === "revoke") {
        if (item.role === "admin") {
          const admins = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM user_roles ur JOIN users u ON u.id = ur.user_id WHERE ur.role = 'admin' AND u.status = 'active' AND (ur.expires_at IS NULL OR ur.expires_at > now())")).rows[0]!.n;
          if (admins <= 1) throw new AppError("BUSINESS_RULE", "No se puede quitar al último administrador", { code: "LAST_ADMIN" });
        }
        await this.identity.revokeRole(item.subject_user_id, item.role, c);
        await this.identity.revokeSessions(item.subject_user_id, c);
      }
      await c.query("UPDATE access_review_items SET decision = $2, justification = $3, decided_by = $4, decided_at = now() WHERE id = $1", [itemId, decision, justification, reviewerId]);
      await auditInsert(c, { actor: reviewerId, action: `access_review.${decision}`, entity: "user", id: item.subject_user_id, meta: { review_id: reviewId, role: item.role, justification }, ip });
      await c.query("COMMIT");
      return { subject_user_id: item.subject_user_id, role: item.role, decision };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  async close(reviewId: string, actorId: string, ip: string) {
    const pending = (await this.db.query<{ status: string; pending: number }>(
      "SELECT r.status, (SELECT count(*)::int FROM access_review_items i WHERE i.review_id = r.id AND i.decision IS NULL) AS pending FROM access_reviews r WHERE r.id = $1", [reviewId],
    )).rows[0];
    if (!pending) throw AppError.notFound("Revisión de accesos");
    if (pending.status !== "open") throw new AppError("BUSINESS_RULE", "La revisión ya está cerrada", { code: "INVALID_STATE" });
    if (pending.pending > 0) throw new AppError("BUSINESS_RULE", `Quedan ${pending.pending} accesos sin revisar`, { code: "REVIEW_INCOMPLETE", pending: pending.pending });
    await this.db.query("UPDATE access_reviews SET status = 'closed', closed_at = now(), closed_by = $2 WHERE id = $1", [reviewId, actorId]);
    await audit(this.db, { actor: actorId, action: "access_review.closed", entity: "access_review", id: reviewId, ip });
  }
}

declare module "fastify" {
  interface FastifyInstance { accessReviews: AccessReviewService }
}

/** Abre la revisión trimestral sola y recuerda las que pasan de su fecha límite. */
export function registerAccessReviewJobs(d: { runner: JobRegistrar; reviews: AccessReviewService; identity: IdentityAdminPort; notify: NotifyFn; db: Db }) {
  d.runner.register({
    name: "access.reviews.schedule", description: `Abre una revisión de accesos del personal cada ${REVIEW_EVERY_DAYS} días y recuerda las vencidas`, everySeconds: 86_400,
    run: async () => {
      const admins = await d.identity.userIdsWithRole("admin");
      const since = await d.reviews.daysSinceLastClosed();
      let opened = false;
      // La primera revisión se abre a mano: sin historial no hay base para saber cuándo tocaba.
      if (since !== null && since >= REVIEW_EVERY_DAYS) {
        const review = await d.reviews.open(null);
        if (review) {
          opened = true;
          for (const id of admins) await d.notify(id, { type: "system", title: "Toca revisar los accesos del personal", message: `Tienes ${REVIEW_DUE_DAYS} días para confirmar o retirar cada rol.`, link: "/admin", data: { access_review_id: review.id } });
        }
      }
      const overdue = (await d.db.query<{ id: string }>("UPDATE access_reviews SET reminded_at = now() WHERE status = 'open' AND due_at < now() AND (reminded_at IS NULL OR reminded_at < now() - interval '7 days') RETURNING id")).rows;
      for (const r of overdue) for (const id of admins) await d.notify(id, { type: "system", title: "La revisión de accesos está vencida", message: "Quedan accesos del personal sin confirmar.", link: "/admin", data: { access_review_id: r.id } });
      return { opened, overdue_reminders: overdue.length };
    },
  });
}

const bearer = [{ bearerAuth: [] }];
const ok = z.object({ data: z.any() });

export async function adminAccessReviewRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const admin = app.requireRole("admin");
  const tags = ["admin", "revisión de accesos"];
  const id = z.object({ id: z.string().uuid() });

  r.get("/admin/access-reviews", { onRequest: admin, schema: { tags, summary: "Revisiones de acceso del personal, con lo pendiente de cada una", security: bearer, response: { 200: ok } } }, async () => ({ data: await app.accessReviews.list() }));

  r.post("/admin/access-reviews", { onRequest: admin, schema: { tags, summary: "Abre una revisión con los roles actuales del personal (sólo una abierta a la vez)", security: bearer, response: { 201: ok } } }, async (req, reply) => {
    const review = await app.accessReviews.open(req.user!.id);
    if (!review) throw new AppError("CONFLICT", "Ya hay una revisión de accesos abierta", { reason: "REVIEW_ALREADY_OPEN" });
    reply.code(201);
    return { data: await app.accessReviews.get(review.id) };
  });

  r.get("/admin/access-reviews/:id", { onRequest: admin, schema: { tags, summary: "Una revisión con cada acceso, su última sesión y la decisión tomada", security: bearer, params: id, response: { 200: ok } } }, async (req) => ({ data: await app.accessReviews.get(req.params.id) }));

  r.post("/admin/access-reviews/:id/items/:itemId/decide", {
    onRequest: admin,
    schema: {
      tags, summary: "Confirma o retira un acceso (justificación obligatoria; nadie revisa los suyos)", security: bearer,
      params: z.object({ id: z.string().uuid(), itemId: z.string().uuid() }),
      body: z.object({ decision: z.enum(["keep", "revoke"]), justification: z.string().trim().min(5).max(300) }),
      response: { 200: ok },
    },
  }, async (req) => {
    const result = await app.accessReviews.decide(req.params.id, req.params.itemId, req.user!.id, req.body.decision, req.body.justification, req.ip);
    if (result.decision === "revoke") await app.notifications.notify(result.subject_user_id, { type: "system", title: `Se retiró tu acceso de ${result.role}`, message: "Fue una decisión de la revisión periódica de accesos. Tu sesión se cerró para aplicar el cambio.", data: { role: result.role } });
    return { data: result };
  });

  r.post("/admin/access-reviews/:id/close", { onRequest: admin, schema: { tags, summary: "Cierra la revisión (exige haber decidido todos los accesos)", security: bearer, params: id, response: { 204: z.null() } } }, async (req, reply) => {
    await app.accessReviews.close(req.params.id, req.user!.id, req.ip);
    reply.code(204);
    return null;
  });
}
