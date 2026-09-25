import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { audit } from "../operators/team.js";

/** Administración transversal: restablecer 2FA de una cuenta y consultar la bitácora de auditoría. */
export async function adminRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const admin = app.requireRole("admin");
  const bearer = [{ bearerAuth: [] }];

  r.post("/admin/users/:id/2fa/reset", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Desactiva la verificación en dos pasos de una cuenta (pérdida de dispositivo y de códigos)", security: bearer, params: z.object({ id: z.string().uuid() }), body: z.object({ reason: z.string().trim().min(5).max(300) }), response: { 204: z.null() } },
  }, async (req, reply) => {
    if (req.params.id === req.user!.id) throw new AppError("FORBIDDEN", "No puedes restablecer tu propio 2FA; usa tus códigos de recuperación");
    const u = (await app.db.query<{ email: string; totp: Date | null; name: string | null }>("SELECT u.email, u.totp_enabled_at AS totp, p.display_name AS name FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [req.params.id])).rows[0];
    if (!u) throw AppError.notFound("Usuario");
    if (!u.totp) throw new AppError("BUSINESS_RULE", "Esa cuenta no tiene 2FA activo");
    await app.db.query("UPDATE users SET totp_secret_enc = NULL, totp_enabled_at = NULL, totp_recovery_hashes = '{}', totp_last_step = NULL WHERE id = $1", [req.params.id]);
    await app.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [req.params.id]);
    await audit(app.db, { actor: req.user!.id, action: "user.2fa_reset", entity: "user", id: req.params.id, meta: { reason: req.body.reason }, ip: req.ip });
    await app.mailer.send({ to: u.email, template: "auth.two_factor_reset", locale: "es", data: { name: u.name ?? u.email } });
    reply.code(204);
    return null;
  });

  r.get("/admin/audit", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Bitácora de auditoría", security: bearer, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50), action: z.string().max(60).optional(), entity_type: z.string().max(40).optional(), entity_id: z.string().max(80).optional() }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req) => {
    const p: unknown[] = [];
    const w = ["true"];
    for (const k of ["action", "entity_type", "entity_id"] as const) if (req.query[k]) { p.push(req.query[k]); w.push(`${k} = $${p.length}`); }
    const total = (await app.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM audit_log WHERE ${w.join(" AND ")}`, p)).rows[0]!.n;
    const { rows } = await app.db.query(`SELECT id, actor_id, action, entity_type, entity_id, org_id, meta, ip, created_at FROM audit_log WHERE ${w.join(" AND ")} ORDER BY id DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
}
