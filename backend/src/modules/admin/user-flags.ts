import type { PoolClient } from "pg";
import type { UserFlagsPort } from "../../contracts/moderation.js";
import type { Db } from "../../db/pool.js";

/** Adaptador PostgreSQL de las banderas de cuenta que otros dominios levantan para revisión de seguridad. */
export class PostgresUserFlags implements UserFlagsPort {
  constructor(private readonly db: Db) {}

  async increment(userId: string, flagName: string, c: Db | PoolClient = this.db) {
    const { rows } = await c.query<{ value: string }>(
      `INSERT INTO user_flags (user_id, flag_name, value) VALUES ($1, $2, '1')
       ON CONFLICT (user_id, flag_name) DO UPDATE SET value = (user_flags.value::int + 1)::text, updated_at = now() RETURNING value`,
      [userId, flagName],
    );
    return Number(rows[0]!.value);
  }

  async set(userId: string, flagName: string, value: string) {
    await this.db.query("INSERT INTO user_flags (user_id, flag_name, value) VALUES ($1, $2, $3) ON CONFLICT (user_id, flag_name) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [userId, flagName, value]);
  }
}

declare module "fastify" {
  interface FastifyInstance { userFlags: UserFlagsPort }
}
