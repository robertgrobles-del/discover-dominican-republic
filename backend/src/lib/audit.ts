import type { PoolClient } from "pg";
import type { Db } from "../db/pool.js";

/** Clave HMAC de la cadena, inyectada al iniciar la aplicación y no persistida. */
let chainSecret: string | undefined;
export function setAuditChainSecret(secret: string) { chainSecret = secret; }

/** Serializa escrituras entre instancias para impedir que la cadena se bifurque. */
const AUDIT_LOCK = 7271001;

/** Firma una fila con los valores canónicos tal como PostgreSQL los almacena. */
const SIGN = (c: string) => `encode(hmac(concat_ws('|', coalesce(${c}actor_id,''), ${c}action, ${c}entity_type, coalesce(${c}entity_id,''), coalesce(${c}org_id,''), ${c}meta, coalesce(${c}ip,''), ${c}epoch, coalesce(${c}prev_hash,'')), $KEY, 'sha256'), 'hex')`;
/** Firma los parámetros del INSERT antes de que exista la fila. */
const INSERT_SIGN = `encode(hmac(concat_ws('|', coalesce($1::uuid::text,''), $2::text, $3::text, coalesce($4::text,''), coalesce($5::uuid::text,''), $6::jsonb::text, coalesce($7::text,''), floor(extract(epoch FROM $8::timestamptz))::text, coalesce($9::text,'')), $10, 'sha256'), 'hex')`;
const VERIFY_SQL = `
  WITH ch AS (
    SELECT id, actor_id::text AS actor_id, action, entity_type, entity_id, org_id::text AS org_id, meta::text AS meta, ip,
           floor(extract(epoch FROM created_at))::text AS epoch, prev_hash, hash,
           lag(hash) OVER (ORDER BY id) AS prev_in_chain, row_number() OVER (ORDER BY id) AS rn
      FROM audit_log WHERE hash IS NOT NULL AND ($1::bigint IS NULL OR id > $1::bigint)
     ORDER BY id LIMIT $2
  ), chk AS (
    SELECT id, rn, hash, prev_hash, prev_in_chain, ${SIGN("")} AS expected FROM ch
  )
  SELECT id, CASE WHEN expected <> hash THEN 'hash' ELSE 'enlace' END AS reason
    FROM chk
   WHERE expected <> hash
      OR (rn > 1 AND prev_hash IS DISTINCT FROM prev_in_chain)
      OR (rn = 1 AND $1::bigint IS NULL AND prev_hash IS NOT NULL)
   ORDER BY id LIMIT 5`;

export interface AuditChainReport {
  ok: boolean;
  /** Entradas de la cadena consideradas (el detalle se limita al tope solicitado). */
  checked: number;
  first_id: number | null;
  last_id: number | null;
  broken: { id: number; reason: "hash" | "enlace" }[];
}

export type AuditEntry = {
  actor?: string | null;
  action: string;
  entity: string;
  id?: string | null;
  org?: string | null;
  meta?: Record<string, unknown>;
  ip?: string;
};

/** Verifica HMAC y enlaces prev→siguiente en la ventana indicada. */
export async function auditChainVerify(db: Db, o: { afterId?: number; limit?: number } = {}): Promise<AuditChainReport> {
  if (!chainSecret) return { ok: false, checked: 0, first_id: null, last_id: null, broken: [] };
  const afterId = o.afterId ?? null, limit = Math.min(o.limit ?? 5000, 20_000);
  const w = "FROM audit_log WHERE hash IS NOT NULL AND ($1::bigint IS NULL OR id > $1::bigint)";
  const head = (await db.query<{ n: number; first_id: number | null; last_id: number | null }>(
    `SELECT count(*)::int AS n, min(id)::bigint AS first_id, max(id)::bigint AS last_id ${w}`, [afterId],
  )).rows[0]!;
  const broken = (await db.query<{ id: number; reason: "hash" | "enlace" }>(VERIFY_SQL.replace("$KEY", "$3"), [afterId, limit, chainSecret])).rows;
  return { ok: broken.length === 0, checked: head.n, first_id: head.first_id === null ? null : Number(head.first_id), last_id: head.last_id === null ? null : Number(head.last_id), broken };
}

/** Inserta una fila firmada dentro de la transacción del llamador. */
export async function auditInsert(c: PoolClient, e: AuditEntry) {
  await c.query("SELECT pg_advisory_xact_lock($1)", [AUDIT_LOCK]);
  const prev = (await c.query<{ hash: string | null }>("SELECT hash FROM audit_log WHERE hash IS NOT NULL ORDER BY id DESC LIMIT 1")).rows[0]?.hash ?? null;
  await c.query(
    `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, org_id, meta, ip, created_at, prev_hash, hash)
     SELECT $1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9, CASE WHEN $10::text = '' THEN NULL ELSE ${INSERT_SIGN} END`,
    [e.actor ?? null, e.action, e.entity, e.id ?? null, e.org ?? null, JSON.stringify(e.meta ?? {}), e.ip ?? null, new Date(), prev, chainSecret ?? ""],
  );
}

/** Escribe una entrada de auditoría en una transacción propia. */
export async function audit(db: Db, e: AuditEntry) {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    await auditInsert(c, e);
    await c.query("COMMIT");
  } catch (err) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally { c.release(); }
}
