import type { PoolClient } from "pg";
import type { IdentityAdminPort, TemporaryRole } from "../../contracts/identity.js";
import type { Db } from "../../db/pool.js";
import { hashToken, newOpaqueToken } from "../../lib/opaque-tokens.js";
import { auditInsert } from "../../lib/audit.js";

/** Adaptador PostgreSQL de las escrituras de identidad que piden otros dominios. */
export class PostgresIdentityAdmin implements IdentityAdminPort {
  constructor(private readonly db: Db) {}

  async userIdsWithRole(role: string) {
    const { rows } = await this.db.query<{ id: string }>("SELECT ur.user_id AS id FROM user_roles ur JOIN users u ON u.id = ur.user_id WHERE ur.role = $1::app_role AND u.status = 'active' AND (ur.expires_at IS NULL OR ur.expires_at > now())", [role]);
    return rows.map((row) => row.id);
  }

  async revokeSessions(userId: string, c: Db | PoolClient = this.db) {
    await c.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
  }

  async revokeSessionFamily(familyId: string, c: Db | PoolClient = this.db) {
    await c.query("UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL", [familyId]);
  }

  async createSupportSession(input: { userId: string; familyId: string; adminId: string; ip: string; expiresAt: Date }) {
    await this.db.query(
      "INSERT INTO refresh_tokens (user_id, family_id, token_hash, user_agent, ip, expires_at, impersonated_by) VALUES ($1,$2,$3,'support-session',$4,$5,$6)",
      [input.userId, input.familyId, hashToken(newOpaqueToken()), input.ip, input.expiresAt, input.adminId],
    );
  }

  async resetTwoFactor(userId: string, c: Db | PoolClient = this.db) {
    await c.query("UPDATE users SET totp_secret_enc = NULL, totp_enabled_at = NULL, totp_recovery_hashes = '{}', totp_last_step = NULL WHERE id = $1", [userId]);
  }

  async replaceRoles(userId: string, roles: string[], c: PoolClient) {
    await c.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
    for (const role of roles) await c.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [userId, role]);
  }

  async grantRole(userId: string, role: string, c: Db | PoolClient = this.db) {
    await c.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role) ON CONFLICT DO NOTHING", [userId, role]);
  }

  async revokeRole(userId: string, role: string, c: Db | PoolClient = this.db) {
    await c.query("DELETE FROM user_roles WHERE user_id = $1 AND role = $2::app_role", [userId, role]);
  }

  async grantTemporaryRole(input: { userId: string; role: string; expiresAt: Date; reason: string; grantedBy: string }, c: Db | PoolClient = this.db) {
    // Un rol permanente no se toca: el ON CONFLICT sólo renueva concesiones que ya eran temporales.
    const res = await c.query(
      `INSERT INTO user_roles (user_id, role, expires_at, grant_reason, granted_by) VALUES ($1, $2::app_role, $3, $4, $5)
       ON CONFLICT (user_id, role) DO UPDATE SET expires_at = EXCLUDED.expires_at, grant_reason = EXCLUDED.grant_reason, granted_by = EXCLUDED.granted_by, expiry_notified_at = NULL
       WHERE user_roles.expires_at IS NOT NULL`,
      [input.userId, input.role, input.expiresAt, input.reason, input.grantedBy],
    );
    return !!res.rowCount;
  }

  async claimExpiringRoleNotices(withinHours: number) {
    const { rows } = await this.db.query<TemporaryRole>(
      `UPDATE user_roles SET expiry_notified_at = now()
        WHERE expires_at IS NOT NULL AND expiry_notified_at IS NULL AND expires_at > now() AND expires_at <= now() + make_interval(hours => $1)
        RETURNING user_id, role::text AS role, expires_at`, [withinHours],
    );
    return rows;
  }

  async expireTemporaryRoles() {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const { rows } = await c.query<TemporaryRole>("DELETE FROM user_roles WHERE expires_at IS NOT NULL AND expires_at <= now() RETURNING user_id, role::text AS role, expires_at");
      for (const r of rows) {
        await this.revokeSessions(r.user_id, c);
        await auditInsert(c, { actor: null, action: "user.role_expired", entity: "user", id: r.user_id, meta: { role: r.role, expired_at: r.expires_at.toISOString() } });
      }
      await c.query("COMMIT");
      return rows;
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  async rolesWithExpiry(userId: string) {
    const { rows } = await this.db.query<{ role: string; expires_at: Date | null; grant_reason: string | null; granted_by: string | null }>(
      "SELECT role::text AS role, expires_at, grant_reason, granted_by::text AS granted_by FROM user_roles WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now()) ORDER BY role", [userId],
    );
    return rows;
  }

  async setAccountStatus(userId: string, status: "suspended" | "active", c: Db | PoolClient = this.db) {
    if (status === "suspended") await c.query("UPDATE users SET status = 'suspended' WHERE id = $1 AND status <> 'deleted'", [userId]);
    else await c.query("UPDATE users SET status = 'active' WHERE id = $1 AND status = 'suspended'", [userId]);
  }

  async setLocale(userId: string, locale: string) {
    await this.db.query("UPDATE users SET locale = $2, updated_at = now() WHERE id = $1", [userId, locale]);
  }

  async setMarketingOptIn(userId: string, optIn: boolean) {
    await this.db.query("UPDATE users SET marketing_opt_in = $2 WHERE id = $1", [userId, optIn]);
  }

  async anonymizeAccount(userId: string, c: PoolClient) {
    await c.query("UPDATE users SET email = 'deleted-' || id || '@invalid.local', password_hash = 'x', status = 'deleted', totp_secret_enc = NULL, totp_enabled_at = NULL, totp_recovery_hashes = '{}', marketing_opt_in = false, updated_at = now() WHERE id = $1", [userId]);
    await c.query("UPDATE refresh_tokens SET revoked_at = coalesce(revoked_at, now()) WHERE user_id = $1", [userId]);
  }
}

declare module "fastify" {
  interface FastifyInstance { identity: IdentityAdminPort }
}
