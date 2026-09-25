import pg from "pg";
import type { Env } from "../config/env.js";

// `numeric` y `bigint` llegan como número en JSON (los importes usan numeric(12,2): sin pérdida en este rango).
pg.types.setTypeParser(1700, (v) => Number(v));
pg.types.setTypeParser(20, (v) => Number(v));
// `date` (sin hora) se mantiene como texto YYYY-MM-DD para evitar desfases de zona horaria.
pg.types.setTypeParser(1082, (v) => v);

export function createPool(env: Pick<Env, "DATABASE_URL" | "DB_POOL_MAX">) {
  return new pg.Pool({ connectionString: env.DATABASE_URL, max: env.DB_POOL_MAX, idleTimeoutMillis: 30_000, statement_timeout: 15_000 });
}
export type Db = pg.Pool;
