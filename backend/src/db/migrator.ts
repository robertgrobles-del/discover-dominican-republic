import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

export const MIGRATIONS_DIR = fileURLToPath(new URL("../../migrations/", import.meta.url));

export interface MigrationResult { applied: string[]; skipped: string[] }

/** Aplica en orden los .sql pendientes de `migrations/`. Cada archivo corre en su propia transacción.
 *  Un advisory lock de sesión excluye dos migradores simultáneos (dos réplicas desplegando a la vez):
 *  el segundo espera, luego ve todo aplicado y no ejecuta nada. */
export async function migrate(pool: Pool, opts: { reset?: boolean; dir?: string; log?: (m: string) => void } = {}): Promise<MigrationResult> {
  const dir = opts.dir ?? MIGRATIONS_DIR;
  const log = opts.log ?? (() => undefined);
  const lock = await pool.connect();
  try {
    await lock.query("SELECT pg_advisory_lock(727100)");
    if (opts.reset) {
      await pool.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
      log("Esquema public recreado");
    }
    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
    const done = new Map((await pool.query<{ name: string; checksum: string }>("SELECT name, checksum FROM schema_migrations")).rows.map((r) => [r.name, r.checksum]));
    const result: MigrationResult = { applied: [], skipped: [] };
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      const sql = readFileSync(join(dir, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const prev = done.get(file);
      if (prev) {
        if (prev !== checksum) throw new Error(`La migración ${file} ya se aplicó y su contenido cambió. Crea una migración nueva en lugar de editarla.`);
        result.skipped.push(file);
        continue;
      }
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [file, checksum]);
        await client.query("COMMIT");
        result.applied.push(file);
        log(`✔ ${file}`);
      } catch (e) {
        await client.query("ROLLBACK");
        throw new Error(`Falló ${file}: ${(e as Error).message}`);
      } finally {
        client.release();
      }
    }
    return result;
  } finally {
    await lock.query("SELECT pg_advisory_unlock(727100)").catch(() => undefined);
    lock.release();
  }
}
