import type { Pool } from "pg";
import { COLLECTIONS } from "../../contracts/content-collections.js";
import type { ContentManifest } from "../../contracts/content-schema.js";
import { normalizeType, type ColType } from "../../lib/db-types.js";
export { normalizeType } from "../../lib/db-types.js";
export type { ColType } from "../../lib/db-types.js";

export type Manifest = ContentManifest;

/** Lee de la base las columnas y tipos de las tablas de contenido (base de `manifest.json`). */
export async function readManifest(pool: Pool): Promise<Manifest> {
  const tables = [...new Set([...COLLECTIONS.map((c) => c.table), "reviews", "profiles"])].sort();
  const { rows } = await pool.query<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>(
    `SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ANY($1) ORDER BY table_name, ordinal_position`, [tables],
  );
  const out: Manifest = {};
  for (const t of tables) out[t] = {};
  for (const r of rows) out[r.table_name]![r.column_name] = { type: normalizeType(r.data_type), nullable: r.is_nullable === "YES" };
  return out;
}
