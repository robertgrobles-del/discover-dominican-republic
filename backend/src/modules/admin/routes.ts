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

  const any = z.any();
  const uuid = z.object({ id: z.string().uuid() });
  const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) };

  // ---- Trabajos programados (docs 5.17/9) ----
  r.get("/admin/jobs", { preHandler: admin, schema: { tags: ["admin"], summary: "Trabajos programados y su último resultado", security: bearer, response: { 200: z.object({ data: any }) } } }, async () => ({ data: await app.jobs.list() }));
  r.post("/admin/jobs/:name/run", { preHandler: admin, schema: { tags: ["admin"], summary: "Ejecuta un trabajo ahora", security: bearer, params: z.object({ name: z.string().max(60) }), response: { 200: z.object({ data: any }) } } }, async (req) => {
    const data = await app.jobs.runNow(req.params.name);
    await audit(app.db, { actor: req.user!.id, action: "job.run", entity: "job", id: req.params.name, ip: req.ip });
    return { data };
  });
  r.patch("/admin/jobs/:name", { preHandler: admin, schema: { tags: ["admin"], summary: "Activa/desactiva un trabajo o cambia su frecuencia", security: bearer, params: z.object({ name: z.string().max(60) }), body: z.object({ enabled: z.boolean().optional(), interval_seconds: z.number().int().min(30).max(30 * 86_400).optional() }), response: { 204: z.null() } } }, async (req, reply) => {
    await app.jobs.update(req.params.name, req.body);
    await audit(app.db, { actor: req.user!.id, action: "job.update", entity: "job", id: req.params.name, meta: req.body, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---- Liquidaciones a operadores ----
  r.get("/admin/payouts", { preHandler: admin, schema: { tags: ["admin"], summary: "Liquidaciones a operadores", security: bearer, querystring: z.object({ ...page, status: z.enum(["pending", "paid", "failed"]).optional(), org_id: z.string().uuid().optional() }), response: { 200: z.object({ data: any, meta: any }) } } }, async (req) => {
    const { rows, total } = await app.payouts.listAll(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/payouts", { preHandler: admin, schema: { tags: ["admin"], summary: "Genera ahora el lote de liquidaciones (opcionalmente de una organización)", security: bearer, body: z.object({ org_id: z.string().uuid().optional() }).nullish(), response: { 201: z.object({ data: any }) } } }, async (req, reply) => {
    const data = await app.payouts.generate({ orgId: req.body?.org_id });
    await audit(app.db, { actor: req.user!.id, action: "payout.generate", entity: "payout", meta: data, ip: req.ip });
    reply.code(201);
    return { data };
  });
  r.get("/admin/payouts/:id/items", { preHandler: admin, schema: { tags: ["admin"], summary: "Reservas de una liquidación", security: bearer, params: uuid, response: { 200: z.object({ data: any }) } } }, async (req) => ({ data: await app.payouts.items(req.params.id) }));
  r.post("/admin/payouts/:id/mark-paid", { preHandler: admin, schema: { tags: ["admin"], summary: "Marca una liquidación como pagada (comprobante obligatorio) y avisa al operador", security: bearer, params: uuid, body: z.object({ reference: z.string().trim().min(3).max(120) }), response: { 204: z.null() } } }, async (req, reply) => {
    await app.payouts.markPaid(req.params.id, req.user!.id, req.body, req.ip);
    reply.code(204);
    return null;
  });
}
