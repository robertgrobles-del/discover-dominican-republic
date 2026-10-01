import type { PublicSettingsReaderPort } from "../../contracts/site-settings.js";
import type { Db } from "../../db/pool.js";

/** PostgreSQL adapter that exposes only settings flagged as public. */
export class PostgresPublicSettingsReader implements PublicSettingsReaderPort {
  constructor(private readonly db: Db) {}

  async getPublicSetting(key: string): Promise<unknown> {
    return (await this.db.query<{ value: unknown }>("SELECT value FROM site_settings WHERE key = $1 AND is_public", [key])).rows[0]?.value;
  }
}
