import type { PoolClient } from "pg";
import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";
import type { ProfileAdminPort } from "../../contracts/profile.js";
import type { Db } from "../../db/pool.js";

/** Adaptador PostgreSQL de las escrituras de perfil que piden otros dominios. */
export class PostgresProfileStore implements ProfileAdminPort {
  constructor(private readonly db: Db) {}

  async setSuspension(userId: string, reason: string | null, c: PoolClient) {
    if (reason === null) { await c.query("UPDATE profiles SET is_suspended = false, suspension_reason = NULL WHERE id = $1", [userId]); return; }
    await c.query("INSERT INTO profiles (id) VALUES ($1) ON CONFLICT DO NOTHING", [userId]);
    await c.query("UPDATE profiles SET is_suspended = true, suspension_reason = $2 WHERE id = $1", [userId, reason]);
  }

  async createProfile(profile: { id: string; displayName: string; avatarUrl?: string | null }, c: PoolClient) {
    await c.query("INSERT INTO profiles (id, display_name, avatar_url, role) VALUES ($1, $2, $3, 'user')", [profile.id, profile.displayName, profile.avatarUrl ?? null]);
  }

  async saveNotificationPrefs(userId: string, prefs: Record<string, Record<string, boolean>>) {
    await this.db.query("INSERT INTO profiles (id) VALUES ($1) ON CONFLICT DO NOTHING", [userId]);
    await this.db.query("UPDATE profiles SET notification_prefs = $2 WHERE id = $1", [userId, JSON.stringify(prefs)]);
  }
}

/** Borrado de cuenta: datos personales del perfil, favoritos y relaciones de seguimiento. */
export const eraseProfileData: AccountErasureParticipant = async (c, userId) => {
  await c.query("UPDATE profiles SET display_name = NULL, avatar_url = NULL, bio = NULL, travel_interests = NULL, country = NULL, birth_year = NULL, notification_prefs = '{}' WHERE id = $1", [userId]);
  await c.query("DELETE FROM favorites WHERE user_id = $1", [userId]);
  await c.query("DELETE FROM explorer_follows WHERE follower_id = $1 OR following_id = $1", [userId]);
};

declare module "fastify" {
  interface FastifyInstance { profiles: ProfileAdminPort }
}
