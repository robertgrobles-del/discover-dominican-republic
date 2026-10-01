import { randomBytes } from "node:crypto";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { audit, auditInsert } from "../../lib/audit.js";
import { hashToken } from "../../lib/opaque-tokens.js";
import type { MailerPort } from "../../contracts/email.js";
import type { OrgRole } from "./catalog.js";

// Compatibilidad durante la migración de imports de auditoría hacia lib/audit.
export { audit, auditChainVerify, auditInsert, setAuditChainSecret, type AuditChainReport, type AuditEntry } from "../../lib/audit.js";

export const INVITE_DAYS = 7;
type Invitable = "admin" | "recepcion" | "guia";
const RANK: Record<OrgRole, number> = { owner: 3, admin: 2, recepcion: 1, guia: 1 };

/** Equipo de la organización e invitaciones (docs §5.10). Sólo se puede gestionar a quien tiene un rol inferior. */
export class TeamService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly mailer: MailerPort) {}

  private canManage(actor: OrgRole, target: OrgRole) { return actor === "owner" || (actor === "admin" && RANK[target] < RANK.admin); }

  private async checkListings(orgId: string, role: OrgRole, ids: string[]) {
    if (role === "guia" && !ids.length) throw AppError.validation("Un guía necesita al menos un servicio asignado");
    if (!ids.length) return;
    const { rows } = await this.db.query("SELECT id FROM operator_listings WHERE org_id = $1 AND id = ANY($2)", [orgId, ids]);
    if (rows.length !== new Set(ids).size) throw AppError.validation("Algún servicio no pertenece a tu organización");
  }

  async list(orgId: string) {
    const members = await this.db.query(
      `SELECT m.user_id, m.role, m.listing_ids, m.created_at, m.expires_at, u.email, p.display_name FROM org_members m JOIN users u ON u.id = m.user_id LEFT JOIN profiles p ON p.id = u.id
        WHERE m.org_id = $1 ORDER BY (m.role = 'owner') DESC, m.created_at`, [orgId],
    );
    const invitations = await this.db.query(
      "SELECT id, email, role, listing_ids, expires_at, created_at FROM org_invitations WHERE org_id = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() ORDER BY created_at DESC", [orgId],
    );
    return { members: members.rows, invitations: invitations.rows };
  }

  async invite(m: { org_id: string; role: OrgRole; business_name: string }, actorId: string, input: { email: string; role: Invitable; listing_ids?: string[] }) {
    if (!this.canManage(m.role, input.role)) throw new AppError("FORBIDDEN", "Tu rol no puede invitar a ese rol");
    const email = input.email.trim().toLowerCase();
    const ids = input.role === "guia" ? input.listing_ids ?? [] : [];
    await this.checkListings(m.org_id, input.role, ids);
    if ((await this.db.query("SELECT 1 FROM org_members mm JOIN users u ON u.id = mm.user_id WHERE mm.org_id = $1 AND lower(u.email) = $2", [m.org_id, email])).rowCount) {
      throw new AppError("CONFLICT", "Esa persona ya es parte del equipo", { reason: "ALREADY_MEMBER" });
    }
    const token = randomBytes(24).toString("base64url");
    try {
      await this.db.query("UPDATE org_invitations SET revoked_at = now() WHERE org_id = $1 AND lower(email) = $2 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at <= now()", [m.org_id, email]);
      await this.db.query(
        "INSERT INTO org_invitations (org_id, email, role, listing_ids, token_hash, invited_by, expires_at) VALUES ($1,$2,$3,$4,$5,$6, now() + make_interval(days => $7))",
        [m.org_id, email, input.role, ids, hashToken(token), actorId, INVITE_DAYS],
      );
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya hay una invitación abierta para ese correo", { reason: "INVITATION_OPEN" });
      throw e;
    }
    const inviter = (await this.db.query<{ n: string }>("SELECT coalesce(p.display_name, u.email) AS n FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [actorId])).rows[0]!.n;
    await this.mailer.send({ to: email, template: "org.invitation", locale: "es", data: { operator: m.business_name, inviter, role: input.role, days: INVITE_DAYS, url: `${this.env.WEB_BASE_URL}/operadores/invitacion?token=${token}` } });
    await audit(this.db, { actor: actorId, action: "org.invite", entity: "org", id: m.org_id, org: m.org_id, meta: { email, role: input.role } });
    return { email, role: input.role, expires_in_days: INVITE_DAYS, token: this.env.NODE_ENV === "test" ? token : undefined };
  }

  async revoke(orgId: string, actor: OrgRole, invitationId: string) {
    const { rows } = await this.db.query<{ role: OrgRole }>("SELECT role FROM org_invitations WHERE id = $1 AND org_id = $2 AND accepted_at IS NULL AND revoked_at IS NULL", [invitationId, orgId]);
    if (!rows[0]) throw AppError.notFound("Invitación");
    if (!this.canManage(actor, rows[0].role)) throw new AppError("FORBIDDEN", "Tu rol no puede revocar esa invitación");
    await this.db.query("UPDATE org_invitations SET revoked_at = now() WHERE id = $1", [invitationId]);
  }

  /** Vista pública mínima para que la persona invitada sepa a qué equipo se une antes de aceptar. */
  async preview(token: string) {
    const { rows } = await this.db.query(
      `SELECT i.email, i.role, i.expires_at, p.business_name FROM org_invitations i JOIN partner_profiles p ON p.id = i.org_id
        WHERE i.token_hash = $1 AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at > now()`, [hashToken(token)],
    );
    if (!rows[0]) throw AppError.notFound("Invitación");
    return rows[0];
  }

  async accept(userId: string, token: string) {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const inv = (await c.query("SELECT id, org_id, email, role, listing_ids FROM org_invitations WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() FOR UPDATE", [hashToken(token)])).rows[0];
      if (!inv) throw AppError.notFound("Invitación");
      const u = (await c.query("SELECT email FROM users WHERE id = $1", [userId])).rows[0];
      if (u.email.toLowerCase() !== inv.email.toLowerCase()) throw new AppError("FORBIDDEN", "Esta invitación es para otro correo. Inicia sesión con la cuenta invitada.", { reason: "EMAIL_MISMATCH" });
      if ((await c.query("SELECT 1 FROM org_members WHERE org_id = $1 AND user_id = $2", [inv.org_id, userId])).rowCount) throw new AppError("CONFLICT", "Ya eres parte de este equipo", { reason: "ALREADY_MEMBER" });
      await c.query("INSERT INTO org_members (org_id, user_id, role, listing_ids) VALUES ($1,$2,$3,$4)", [inv.org_id, userId, inv.role, inv.listing_ids]);
      await c.query("UPDATE org_invitations SET accepted_at = now() WHERE id = $1", [inv.id]);
      await c.query("COMMIT");
      await audit(this.db, { actor: userId, action: "org.join", entity: "org", id: inv.org_id, org: inv.org_id, meta: { role: inv.role } });
      return { org_id: inv.org_id as string, role: inv.role as OrgRole };
    } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
  }

  async updateMember(orgId: string, actor: { id: string; role: OrgRole }, userId: string, patch: { role?: Invitable; listing_ids?: string[]; expires_at?: string | null }) {
    if (userId === actor.id) throw new AppError("FORBIDDEN", "No puedes cambiar tu propio rol");
    // El candado por organización serializa cambios concurrentes de rol: sin él, dos dueños que se degradan a la vez podrían dejar a la org sin dueño.
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [orgId]);
      const cur = (await c.query<{ role: OrgRole }>("SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0];
      if (!cur) throw AppError.notFound("Miembro");
      if (!this.canManage(actor.role, cur.role) || (patch.role && !this.canManage(actor.role, patch.role))) throw new AppError("FORBIDDEN", "Tu rol no puede modificar a esta persona");
      const role = patch.role ?? cur.role;
      const ids = role === "guia" ? patch.listing_ids ?? (await c.query<{ l: string[] }>("SELECT listing_ids AS l FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0]!.l : [];
      await this.checkListings(orgId, role, ids);
      if (patch.expires_at && new Date(patch.expires_at).getTime() <= Date.now()) throw AppError.validation("La fecha de fin debe ser futura", { field: "expires_at" });
      // `expires_at` ausente conserva el vencimiento actual; null lo quita.
      await c.query("UPDATE org_members SET role = $3, listing_ids = $4, expires_at = CASE WHEN $5::boolean THEN $6::timestamptz ELSE expires_at END WHERE org_id = $1 AND user_id = $2", [orgId, userId, role, ids, patch.expires_at !== undefined, patch.expires_at ?? null]);
      if (cur.role === "owner" && role !== "owner") {
        const owners = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM org_members WHERE org_id = $1 AND role = 'owner'", [orgId])).rows[0]!.n;
        if (owners < 1) throw new AppError("BUSINESS_RULE", "La organización debe conservar al menos un propietario", { reason: "LAST_OWNER" });
      }
      await auditInsert(c, { actor: actor.id, action: "org.member_update", entity: "user", id: userId, org: orgId, meta: { from: cur.role, to: role, ...(patch.expires_at !== undefined ? { expires_at: patch.expires_at } : {}) } });
      await c.query("COMMIT");
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  async remove(orgId: string, actor: { id: string; role: OrgRole }, userId: string) {
    const cur = (await this.db.query<{ role: OrgRole }>("SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0];
    if (!cur) throw AppError.notFound("Miembro");
    if (cur.role === "owner") throw new AppError("FORBIDDEN", "El propietario no se puede quitar");
    if (userId !== actor.id && !this.canManage(actor.role, cur.role)) throw new AppError("FORBIDDEN", "Tu rol no puede quitar a esta persona");
    await this.db.query("DELETE FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId]);
    await audit(this.db, { actor: actor.id, action: "org.member_remove", entity: "user", id: userId, org: orgId, meta: { role: cur.role } });
  }
}
