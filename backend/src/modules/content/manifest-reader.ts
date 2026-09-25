import type { Pool } from "pg";
import { COLLECTIONS } from "./collections.js";

export type ColType = "uuid" | "text" | "integer" | "numeric" | "boolean" | "jsonb" | "array" | "timestamp" | "date";
export type Manifest = Record<string, Record<string, { type: ColType; nullable: boolean }>>;

export const normalizeType = (dataType: string): ColType => {
  switch (dataType) {
    case "uuid": return "uuid";
    case "integer": case "smallint": case "bigint": return "integer";
    case "numeric": case "double precision": case "real": return "numeric";
    case "boolean": return "boolean";
    case "jsonb": case "json": return "jsonb";
    case "ARRAY": return "array";
    case "timestamp with time zone": case "timestamp without time zone": return "timestamp";
    case "date": return "date";
    default: return "text";
  }
};

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
