import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { STAFF_ROLES } from "../../lib/roles.js";
import { audit } from "../../lib/audit.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
export const SUPPORT_SESSION_MINUTES = 15;

/**
 * Sesión de soporte (docs §5.17). El admin ve la cuenta de otra persona tal como ella la ve, para ayudarle, con estas garantías:
 * sólo lectura (cualquier escritura se rechaza), sin acceso a lo sensible (exportar datos, 2FA, sesiones, panel), 15 minutos y sin
 * renovación, motivo obligatorio, sólo a cuentas que no son del personal, con verificación en dos pasos del admin, aviso a la
 * persona y cada petición queda auditada.
 */
export async function impersonationRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");
  const tag = ["admin", "soporte"];

  r.post("/admin/users/:id/impersonate", {
    onRequest: admin, config: { rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max: 10, timeWindow: "1 hour" } : { max: 1_000_000, timeWindow: "1 minute" } },
    schema: {
      tags: tag, summary: "Abre una sesión de soporte de sólo lectura (15 min, sin renovación) en la cuenta de una persona que no es del personal. Exige motivo y verificación en dos pasos", security: bearer,
      params: z.object({ id: z.string().uuid() }), body: z.object({ reason: z.string().trim().min(10).max(300) }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    if (req.user!.imp) throw new AppError("FORBIDDEN", "No se puede abrir una sesión de soporte desde otra");
    if (app.env.REQUIRE_2FA_FOR_STAFF && !req.user!.mfa) throw new AppError("MFA_REQUIRED", "Esta acción requiere verificación en dos pasos", { setup: "/api/v1/auth/2fa/setup", verify: "/api/v1/auth/2fa/verify" });
    if (req.params.id === req.user!.id) throw new AppError("BUSINESS_RULE", "No tiene sentido abrir una sesión de soporte en tu propia cuenta", { code: "SELF_IMPERSONATION" });
    const t = (await db.query<{ id: string; status: string; locale: string; roles: string[] }>("SELECT u.id, u.status, u.locale, coalesce((SELECT array_agg(role::text) FROM user_roles ur WHERE ur.user_id = u.id), '{}') AS roles FROM users u WHERE u.id = $1", [req.params.id])).rows[0];
    if (!t) throw AppError.notFound("Usuario");
    if (t.roles.some((x) => STAFF_ROLES.includes(x))) throw new AppError("FORBIDDEN", "No se puede abrir una sesión de soporte en la cuenta de una persona del personal", { code: "STAFF_TARGET" });
    if (t.status !== "active") throw new AppError("BUSINESS_RULE", `La cuenta está en estado "${t.status}"`, { code: "INVALID_STATE" });

    const sid = randomUUID();
    const expires = new Date(Date.now() + SUPPORT_SESSION_MINUTES * 60_000);
    // La sesión vive en refresh_tokens (así la comprueba `authenticate` y se revoca con el resto si la persona cambia su contraseña), pero sin token de refresco entregable.
    await app.identity.createSupportSession({ userId: t.id, familyId: sid, adminId: req.user!.id, ip: req.ip, expiresAt: expires });
    const row = (await db.query<{ id: string }>("INSERT INTO support_sessions (admin_id, target_id, reason, sid, ip, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [req.user!.id, t.id, req.body.reason, sid, req.ip, expires])).rows[0]!;
    const token = await app.tokens.signAccess({ sub: t.id, roles: t.roles, locale: t.locale, sid, mfa: false, imp: req.user!.id }, SUPPORT_SESSION_MINUTES * 60);
    await audit(db, { actor: req.user!.id, action: "support.impersonation_started", entity: "user", id: t.id, meta: { reason: req.body.reason, session: row.id, minutes: SUPPORT_SESSION_MINUTES }, ip: req.ip });
    // Transparencia: la persona sabe que el equipo miró su cuenta.
    await app.notifications.notify(t.id, { type: "system", title: "El equipo de soporte revisó tu cuenta", message: "Fue en modo de sólo lectura, para ayudarte con tu consulta.", data: { support_session: row.id } });
    reply.code(201);
    return { data: { access_token: token, expires_in: SUPPORT_SESSION_MINUTES * 60, expires_at: expires.toISOString(), read_only: true, session_id: row.id, target: { id: t.id }, banner: "Estás viendo la cuenta de otra persona en modo de sólo lectura" } };
  });

  r.post("/auth/impersonation/end", {
    onRequest: app.authenticate,
    schema: { tags: tag, summary: "Cierra la sesión de soporte actual", security: bearer, response: { 200: ok } },
  }, async (req) => {
    if (!req.user!.imp) throw new AppError("BUSINESS_RULE", "Esta no es una sesión de soporte", { code: "NOT_IMPERSONATING" });
    await app.identity.revokeSessionFamily(req.user!.sid);
    await db.query("UPDATE support_sessions SET ended_at = now() WHERE sid = $1 AND ended_at IS NULL", [req.user!.sid]);
    await audit(db, { actor: req.user!.imp, action: "support.impersonation_ended", entity: "user", id: req.user!.id, ip: req.ip });
    return { data: { ended: true } };
  });

  r.get("/admin/support-sessions", {
    onRequest: admin,
    schema: { tags: tag, summary: "Sesiones de soporte abiertas (quién, a quién, por qué, cuándo)", security: bearer, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(30), admin_id: z.string().uuid().optional(), target_id: z.string().uuid().optional() }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req) => {
    const p = [req.query.admin_id ?? null, req.query.target_id ?? null];
    const w = "($1::uuid IS NULL OR s.admin_id = $1) AND ($2::uuid IS NULL OR s.target_id = $2)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM support_sessions s WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT s.id, s.admin_id, a.email AS admin_email, s.target_id, t.email AS target_email, s.reason, s.ip, s.started_at, s.expires_at, s.ended_at, (SELECT count(*)::int FROM audit_log l WHERE l.action = 'support.impersonated_request' AND l.meta->>'session' = s.id::text) AS requests FROM support_sessions s JOIN users a ON a.id = s.admin_id JOIN users t ON t.id = s.target_id WHERE ${w} ORDER BY s.started_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
}
