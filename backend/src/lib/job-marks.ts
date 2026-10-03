import type { Pool, PoolClient } from "pg";

/**
 * Marca de "ya se hizo" para trabajos que no cuelgan de una fila propia (un aviso por día, por semana, por salida).
 * Devuelve true sólo a quien la crea: si dos instancias llegan a la vez, una sola continúa.
 */
export async function claimJobMark(db: Pool | PoolClient, key: string): Promise<boolean> {
  return ((await db.query("INSERT INTO job_marks (key) VALUES ($1) ON CONFLICT DO NOTHING", [key])).rowCount ?? 0) > 0;
}
