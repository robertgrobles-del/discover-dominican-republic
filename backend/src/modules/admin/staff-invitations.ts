import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { audit, auditInsert } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";
import { hashToken, newOpaqueToken } from "../../lib/opaque-tokens.js";

export const STAFF_INVITE_DAYS = 7;
const INVITABLE = ["editor", "moderator"] as const;
const OPEN = "accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now()";

const bearer = [{ bearerAuth: [] }];
const ok = z.object({ data: z.any() });

/**
 * Invitaciones para personal interno (plan de accesos, punto 17). Un administrador invita por correo a un
 * editor o moderador; el rol se concede cuando esa persona acepta con la cuenta del correo invitado, ya
 * verificado. Conceder `admin` no pasa por aquí: va por una solicitud con doble aprobación.
 */
export async function adminStaffInvitationRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");
  const tags = ["admin", "invitaciones de personal"];
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  r.get("/admin/staff-invitations", { onRequest: admin, schema: { tags, summary: "Invitaciones de personal abiertas y recientes", security: bearer, response: { 200: ok } } }, async () => ({
    data: (await db.query(
      `SELECT id, email, role, invited_by, expires_at, accepted_at, revoked_at, created_at,
              CASE WHEN accepted_at IS NOT NULL THEN 'accepted' WHEN revoked_at IS NOT NULL THEN 'revoked' WHEN expires_at <= now() THEN 'expired' ELSE 'open' END AS status
         FROM staff_invitations ORDER BY created_at DESC LIMIT 100`,
    )).rows,
  }));

  r.post("/admin/staff-invitations", {
    onRequest: admin, config: rl(20, "1 hour"),
    schema: { tags, summary: "Invita por correo a un editor o moderador (vence a los 7 días)", security: bearer, body: z.object({ email: z.string().trim().toLowerCase().pipe(z.email().max(254)), role: z.enum(INVITABLE) }), response: { 201: ok } },
  }, async (req, reply) => {
    const { email, role } = req.body;
    // Quien ya tiene el rol no necesita invitación.
    const existing = (await db.query<{ id: string }>("SELECT id FROM users WHERE lower(email) = $1", [email])).rows[0];
    if (existing && (await app.identity.rolesWithExpiry(existing.id)).some((x) => x.role === role && x.expires_at === null)) throw new AppError("CONFLICT", "Esa persona ya tiene ese rol", { reason: "ALREADY_HAS_ROLE" });

    const token = newOpaqueToken();
    try {
      // Una invitación vencida sin cerrar no debe impedir invitar de nuevo.
      await db.query("UPDATE staff_invitations SET revoked_at = now() WHERE lower(email) = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at <= now()", [email]);
      await db.query("INSERT INTO staff_invitations (email, role, token_hash, invited_by, expires_at) VALUES ($1,$2,$3,$4, now() + make_interval(days => $5))", [email, role, hashToken(token), req.user!.id, STAFF_INVITE_DAYS]);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya hay una invitación abierta para ese correo", { reason: "INVITATION_OPEN" });
      throw e;
    }
    const inviter = (await db.query<{ n: string }>("SELECT coalesce(p.display_name, u.email) AS n FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [req.user!.id])).rows[0]!.n;
    await app.mailer.send({ to: email, template: "org.invitation", locale: "es", data: { operator: "el equipo de Descubre RD", inviter, role, days: STAFF_INVITE_DAYS, url: `${app.env.WEB_BASE_URL}/admin/invitacion?token=${token}` } });
    await audit(db, { actor: req.user!.id, action: "staff.invited", entity: "staff_invitation", meta: { email, role }, ip: req.ip });
    reply.code(201);
    // El token sólo viaja por correo; en pruebas se devuelve para poder aceptar sin leer el buzón.
    return { data: { email, role, expires_in_days: STAFF_INVITE_DAYS, token: app.env.NODE_ENV === "test" ? token : undefined } };
  });

  r.delete("/admin/staff-invitations/:id", { onRequest: admin, schema: { tags, summary: "Revoca una invitación abierta", security: bearer, params: z.object({ id: z.string().uuid() }), response: { 204: z.null() } } }, async (req, reply) => {
    const row = (await db.query<{ email: string; role: string }>(`UPDATE staff_invitations SET revoked_at = now() WHERE id = $1 AND ${OPEN} RETURNING email, role`, [req.params.id])).rows[0];
    if (!row) throw AppError.notFound("Invitación abierta");
    await audit(db, { actor: req.user!.id, action: "staff.invitation_revoked", entity: "staff_invitation", id: req.params.id, meta: row, ip: req.ip });
    reply.code(204);
    return null;
  });

  // Vista mínima para que la persona sepa a qué rol da acceso antes de aceptar (punto 28 del plan).
  r.get("/staff-invitations/:token", { config: rl(30, "1 minute"), schema: { tags, summary: "Vista previa de una invitación de personal", params: z.object({ token: z.string().max(100) }), response: { 200: ok } } }, async (req) => {
    const row = (await db.query(`SELECT email, role, expires_at FROM staff_invitations WHERE token_hash = $1 AND ${OPEN}`, [hashToken(req.params.token)])).rows[0];
    if (!row) throw AppError.notFound("Invitación");
    return { data: row };
  });

  r.post("/staff-invitations/:token/accept", {
    onRequest: app.authenticate, config: rl(10, "1 minute"),
    schema: { tags, summary: "Acepta la invitación con la cuenta del correo invitado (correo verificado)", security: bearer, params: z.object({ token: z.string().max(100) }), response: { 200: ok } },
  }, async (req) => {
    const userId = req.user!.id;
    const c = await db.connect();
    try {
      await c.query("BEGIN");
      const inv = (await c.query<{ id: string; email: string; role: string; invited_by: string | null }>(`SELECT id, email, role, invited_by FROM staff_invitations WHERE token_hash = $1 AND ${OPEN} FOR UPDATE`, [hashToken(req.params.token)])).rows[0];
      if (!inv) throw AppError.notFound("Invitación");
      const u = (await c.query<{ email: string; verified: Date | null; status: string }>("SELECT email, email_verified_at AS verified, status FROM users WHERE id = $1", [userId])).rows[0]!;
      if (u.email.toLowerCase() !== inv.email.toLowerCase()) throw new AppError("FORBIDDEN", "Esta invitación es para otro correo. Inicia sesión con la cuenta invitada.", { reason: "EMAIL_MISMATCH" });
      // Sin correo verificado no hay prueba de que la cuenta sea de quien recibió la invitación.
      if (!u.verified) throw new AppError("FORBIDDEN", "Verifica tu correo antes de aceptar la invitación", { reason: "EMAIL_NOT_VERIFIED" });
      if (u.status !== "active") throw new AppError("BUSINESS_RULE", "La cuenta no está activa", { code: "INVALID_STATE" });
      await app.identity.grantRole(userId, inv.role, c);
      await c.query("UPDATE staff_invitations SET accepted_at = now(), accepted_by = $2 WHERE id = $1", [inv.id, userId]);
      await auditInsert(c, { actor: userId, action: "staff.invitation_accepted", entity: "user", id: userId, meta: { role: inv.role, invitation_id: inv.id, invited_by: inv.invited_by }, ip: req.ip });
      await c.query("COMMIT");
      if (inv.invited_by) await app.notifications.notify(inv.invited_by, { type: "system", title: `${u.email} aceptó la invitación como ${inv.role}`, link: "/admin", data: { invitation_id: inv.id } });
      // El rol entra en el próximo token: basta con renovar la sesión, sin cerrarla.
      return { data: { role: inv.role, note: "Vuelve a iniciar sesión o renueva tu sesión para usar el nuevo rol" } };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  });
}
