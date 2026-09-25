import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { audit } from "../operators/team.js";

const ROLES = ["admin", "editor", "moderator", "partner", "ambassador", "user"] as const;
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const ok = z.object({ data: z.any() });

/** Gestión de usuarios (docs §5.17): listado, roles, suspensión y restablecimiento de contraseña. Siempre auditada. */
export async function adminUserRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");

  const revokeSessions = (id: string) => db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [id]);
  const rolesOf = async (id: string) => (await db.query<{ role: string }>("SELECT role::text FROM user_roles WHERE user_id = $1 ORDER BY role", [id])).rows.map((x) => x.role);
  const exists = async (id: string) => { if (!(await db.query("SELECT 1 FROM users WHERE id = $1", [id])).rowCount) throw AppError.notFound("Usuario"); };

  r.get("/admin/users", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Usuarios (filtros por texto, rol y estado)", security: bearer, querystring: z.object({ q: z.string().trim().max(100).optional(), role: z.enum(ROLES).optional(), status: z.enum(["active", "suspended", "deleted"]).optional(), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(25) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req) => {
    const p: unknown[] = [], w = ["true"];
    const bind = (v: unknown) => { p.push(v); return `$${p.length}`; };
    if (req.query.q) { const ph = bind(`%${req.query.q.replace(/[\\%_]/g, "\\$&")}%`); w.push(`(u.email ILIKE ${ph} OR pr.display_name ILIKE ${ph})`); }
    if (req.query.role) w.push(`EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = ${bind(req.query.role)}::app_role)`);
    if (req.query.status === "suspended") w.push("(u.status = 'suspended' OR coalesce(pr.is_suspended, false))");
    else if (req.query.status) w.push(`u.status = ${bind(req.query.status)}`);
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM users u LEFT JOIN profiles pr ON pr.id = u.id WHERE ${w.join(" AND ")}`, p)).rows[0]!.n;
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.status, u.created_at, u.last_login_at, u.email_verified_at IS NOT NULL AS email_verified, u.totp_enabled_at IS NOT NULL AS two_factor, pr.display_name, coalesce(pr.is_suspended, false) AS suspended,
              coalesce((SELECT array_agg(role::text ORDER BY role) FROM user_roles ur WHERE ur.user_id = u.id), '{}') AS roles
         FROM users u LEFT JOIN profiles pr ON pr.id = u.id WHERE ${w.join(" AND ")} ORDER BY u.created_at DESC, u.id LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p,
    );
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.get("/admin/users/:id", { preHandler: admin, schema: { tags: ["admin"], summary: "Detalle de un usuario", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const u = (await db.query(
      `SELECT u.id, u.email, u.status, u.locale, u.created_at, u.last_login_at, u.email_verified_at, u.totp_enabled_at IS NOT NULL AS two_factor, u.marketing_opt_in,
              pr.display_name, pr.avatar_url, pr.is_suspended, pr.suspension_reason, pr.country, pr.deletion_requested_at,
              (SELECT count(*)::int FROM bookings b WHERE b.user_id = u.id) AS bookings, (SELECT count(*)::int FROM reviews rv WHERE rv.user_id = u.id) AS reviews,
              (SELECT count(*)::int FROM social_posts sp WHERE sp.user_id = u.id) AS posts, (SELECT count(*)::int FROM support_tickets st WHERE st.user_id = u.id) AS tickets
         FROM users u LEFT JOIN profiles pr ON pr.id = u.id WHERE u.id = $1`, [req.params.id],
    )).rows[0];
    if (!u) throw AppError.notFound("Usuario");
    const suspensions = (await db.query("SELECT reason, suspended_by, expires_at, is_active, created_at FROM user_suspensions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", [req.params.id])).rows;
    const orgs = (await db.query("SELECT m.org_id, m.role, p.business_name FROM org_members m JOIN partner_profiles p ON p.id = m.org_id WHERE m.user_id = $1", [req.params.id])).rows;
    return { data: { ...u, roles: await rolesOf(req.params.id), suspensions, organizations: orgs } };
  });

  r.put("/admin/users/:id/roles", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Reemplaza los roles de un usuario (no puedes cambiar los tuyos ni quitar al último admin)", security: bearer, params: uuid, body: z.object({ roles: z.array(z.enum(ROLES)).max(6) }), response: { 200: ok } },
  }, async (req) => {
    const id = req.params.id;
    if (id === req.user!.id) throw new AppError("FORBIDDEN", "No puedes cambiar tus propios roles");
    await exists(id);
    const next = [...new Set(req.body.roles)];
    const before = await rolesOf(id);
    if (before.includes("admin") && !next.includes("admin")) {
      const admins = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM user_roles ur JOIN users u ON u.id = ur.user_id WHERE ur.role = 'admin' AND u.status = 'active'")).rows[0]!.n;
      if (admins <= 1) throw new AppError("BUSINESS_RULE", "No se puede quitar al último administrador", { code: "LAST_ADMIN" });
    }
    const c = await db.connect();
    try {
      await c.query("BEGIN");
      await c.query("DELETE FROM user_roles WHERE user_id = $1", [id]);
      for (const role of next) await c.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
      await c.query("COMMIT");
    } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
    await revokeSessions(id); // el nuevo rol se aplica en el siguiente inicio de sesión
    await audit(db, { actor: req.user!.id, action: "user.roles_changed", entity: "user", id, meta: { before, after: next }, ip: req.ip });
    return { data: { roles: next } };
  });

  r.post("/admin/users/:id/suspend", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Suspende una cuenta y cierra sus sesiones", security: bearer, params: uuid, body: z.object({ reason: z.string().trim().min(5).max(300), expires_at: z.string().datetime({ offset: true }).optional() }), response: { 204: z.null() } },
  }, async (req, reply) => {
    const id = req.params.id;
    if (id === req.user!.id) throw new AppError("FORBIDDEN", "No puedes suspenderte a ti mismo");
    await exists(id);
    if ((await rolesOf(id)).includes("admin")) throw new AppError("FORBIDDEN", "Quita el rol de administrador antes de suspender esta cuenta");
    await db.query("INSERT INTO profiles (id) VALUES ($1) ON CONFLICT DO NOTHING", [id]);
    await db.query("UPDATE profiles SET is_suspended = true, suspension_reason = $2 WHERE id = $1", [id, req.body.reason]);
    await db.query("UPDATE user_suspensions SET is_active = false WHERE user_id = $1 AND is_active", [id]);
    await db.query("INSERT INTO user_suspensions (user_id, reason, suspended_by, expires_at) VALUES ($1,$2,$3,$4)", [id, req.body.reason, req.user!.id, req.body.expires_at ?? null]);
    await revokeSessions(id);
    await audit(db, { actor: req.user!.id, action: "user.suspended", entity: "user", id, meta: { reason: req.body.reason }, ip: req.ip });
    reply.code(204);
    return null;
  });

  r.post("/admin/users/:id/unsuspend", { preHandler: admin, schema: { tags: ["admin"], summary: "Reactiva una cuenta suspendida", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await exists(req.params.id);
    await db.query("UPDATE profiles SET is_suspended = false, suspension_reason = NULL WHERE id = $1", [req.params.id]);
    await db.query("UPDATE user_suspensions SET is_active = false WHERE user_id = $1 AND is_active", [req.params.id]);
    await db.query("UPDATE users SET status = 'active' WHERE id = $1 AND status = 'suspended'", [req.params.id]);
    await audit(db, { actor: req.user!.id, action: "user.unsuspended", entity: "user", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  r.post("/admin/users/:id/reset-password", { preHandler: admin, schema: { tags: ["admin"], summary: "Envía al usuario un enlace de restablecimiento de contraseña", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const u = (await db.query<{ email: string }>("SELECT email FROM users WHERE id = $1 AND status <> 'deleted'", [req.params.id])).rows[0];
    if (!u) throw AppError.notFound("Usuario");
    await app.auth.forgotPassword(u.email);
    await audit(db, { actor: req.user!.id, action: "user.password_reset_sent", entity: "user", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });
}
