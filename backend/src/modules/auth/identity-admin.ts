import type { PoolClient } from "pg";
import type { IdentityAdminPort } from "../../contracts/identity.js";
import type { Db } from "../../db/pool.js";
import { hashToken, newOpaqueToken } from "../../lib/opaque-tokens.js";

/** Adaptador PostgreSQL de las escrituras de identidad que piden otros dominios. */
export class PostgresIdentityAdmin implements IdentityAdminPort {
  constructor(private readonly db: Db) {}

  async userIdsWithRole(role: string) {
    const { rows } = await this.db.query<{ id: string }>("SELECT ur.user_id AS id FROM user_roles ur JOIN users u ON u.id = ur.user_id WHERE ur.role = $1::app_role AND u.status = 'active'", [role]);
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
