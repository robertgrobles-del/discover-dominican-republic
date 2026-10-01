import pg from "pg";
import type { Env } from "../config/env.js";

// `numeric` y `bigint` llegan como número en JSON (los importes usan numeric(12,2): sin pérdida en este rango).
pg.types.setTypeParser(1700, (v) => Number(v));
pg.types.setTypeParser(20, (v) => Number(v));
// `date` (sin hora) se mantiene como texto YYYY-MM-DD para evitar desfases de zona horaria.
pg.types.setTypeParser(1082, (v) => v);

export function createPool(env: Pick<Env, "DATABASE_URL" | "DB_POOL_MAX">) {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30_000,
    statement_timeout: 15_000,
    // Nadie debe quedar sentado dentro de una transacción sin hacer nada: si una consulta no
    // llega en 60 s la sesión quedó colgada (cliente muerto, bug) y Postgres la corta.
    idle_in_transaction_session_timeout: 60_000,
    connectionTimeoutMillis: 10_000,
    application_name: "descubre-rd-api",
  });
  // Sin este listener, un error en un cliente idle (reinicio/failover de Postgres) derriba el proceso.
  pool.on("error", (err) => console.error("[pool] error en cliente inactivo:", err.message));
  return pool;
}
export type Db = pg.Pool;
