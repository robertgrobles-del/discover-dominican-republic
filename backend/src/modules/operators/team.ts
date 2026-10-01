import { createHmac, randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { hashToken } from "../auth/tokens.js";
import type { Mailer } from "../mailer/mailer.js";
import type { OrgRole } from "./catalog.js";

export const INVITE_DAYS = 7;
type Invitable = "admin" | "recepcion" | "guia";
const RANK: Record<OrgRole, number> = { owner: 3, admin: 2, recepcion: 1, guia: 1 };

/** Clave HMAC de la cadena de auditoría; la inyecta buildApp con APP_SECRET y nunca se guarda en la base. */
let chainSecret: string | undefined;
export function setAuditChainSecret(secret: string) { chainSecret = secret; }

/** Candado propio (el del migrador es 727100): serializa escrituras concurrentes entre instancias para que la cadena no se bifurque. */
const AUDIT_LOCK = 7271001;

/** Cómo se firma una fila: exactamente los campos tal cual quedan almacenados (formas canónicas de jsonb y timestamptz). */
const SIGN = (c: string) => `encode(hmac(concat_ws('|', coalesce(${c}actor_id,''), ${c}action, ${c}entity_type, coalesce(${c}entity_id,''), coalesce(${c}org_id,''), ${c}meta, coalesce(${c}ip,''), ${c}epoch, coalesce(${c}prev_hash,'')), $KEY, 'sha256'), 'hex')`;
/** Misma firma pero sobre los parámetros del INSERT (la fila aún no existe cuando se calcula el hash). Los uuid se pasan por su forma de texto, igual que los lee el verificador. */
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
  /** Entradas de la cadena consideradas en la ventana (todas las que siguen a `afterId`, tope `limit` para el detalle). */
  checked: number;
  first_id: number | null;
  last_id: number | null;
  broken: { id: number; reason: "hash" | "enlace" }[];
}

/** Recalcula los HMAC de la cadena de auditoría y comprueba los enlaces prev→siguiente en la ventana indicada. */
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

export type AuditEntry = { actor?: string | null; action: string; entity: string; id?: string | null; org?: string | null; meta?: Record<string, unknown>; ip?: string };

/** Inserta la fila firmada en la cadena. Se llama dentro de una transacción abierta; quien necesite atomicidad con sus propios cambios comparte esa transacción. */
export async function auditInsert(c: PoolClient, e: AuditEntry) {
  await c.query("SELECT pg_advisory_xact_lock($1)", [AUDIT_LOCK]);
  const prev = (await c.query<{ hash: string | null }>("SELECT hash FROM audit_log WHERE hash IS NOT NULL ORDER BY id DESC LIMIT 1")).rows[0]?.hash ?? null;
  await c.query(
    `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, org_id, meta, ip, created_at, prev_hash, hash)
     SELECT $1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9, CASE WHEN $10::text = '' THEN NULL ELSE ${INSERT_SIGN} END`,
    [e.actor ?? null, e.action, e.entity, e.id ?? null, e.org ?? null, JSON.stringify(e.meta ?? {}), e.ip ?? null, new Date(), prev, chainSecret ?? ""],
  );
}

/** Escribe una entrada en la bitácora de auditoría firmándola dentro de la cadena de hash (acciones sensibles de admin y del equipo). */
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

/** Equipo de la organización e invitaciones (docs §5.10). Sólo se puede gestionar a quien tiene un rol inferior. */
export class TeamService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly mailer: Mailer) {}

  private canManage(actor: OrgRole, target: OrgRole) { return actor === "owner" || (actor === "admin" && RANK[target] < RANK.admin); }

  private async checkListings(orgId: string, role: OrgRole, ids: string[]) {
    if (role === "guia" && !ids.length) throw AppError.validation("Un guía necesita al menos un servicio asignado");
    if (!ids.length) return;
    const { rows } = await this.db.query("SELECT id FROM operator_listings WHERE org_id = $1 AND id = ANY($2)", [orgId, ids]);
    if (rows.length !== new Set(ids).size) throw AppError.validation("Algún servicio no pertenece a tu organización");
  }

  async list(orgId: string) {
    const members = await this.db.query(
      `SELECT m.user_id, m.role, m.listing_ids, m.created_at, u.email, p.display_name FROM org_members m JOIN users u ON u.id = m.user_id LEFT JOIN profiles p ON p.id = u.id
        WHERE m.org_id = $1 ORDER BY (m.role = 'owner') DESC, m.created_at`, [orgId],
    );
    const invitations = await this.db.query(
      "SELECT id, email, role, listing_ids, expires_at, created_at FROM org_invitations WHERE org_id = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() ORDER BY created_at DESC", [orgId],
    );
    return { members: members.rows, invitations: invitations.rows };
  }

  async invite(m: { org_id: string; role: OrgRole; business_name: string }, actorId: string, input: { email: string; role: Invitable; listing_ids?: string[] }) {
    if (!this.canManage(m.role, input.role)) throw new AppError("FORBIDDEN", "Tu rol no puede invitar a ese rol");
    const email = input.email.trim().toLowerCase();
    const ids = input.role === "guia" ? input.listing_ids ?? [] : [];
    await this.checkListings(m.org_id, input.role, ids);
    if ((await this.db.query("SELECT 1 FROM org_members mm JOIN users u ON u.id = mm.user_id WHERE mm.org_id = $1 AND lower(u.email) = $2", [m.org_id, email])).rowCount) {
      throw new AppError("CONFLICT", "Esa persona ya es parte del equipo", { reason: "ALREADY_MEMBER" });
    }
    const token = randomBytes(24).toString("base64url");
    try {
      await this.db.query("UPDATE org_invitations SET revoked_at = now() WHERE org_id = $1 AND lower(email) = $2 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at <= now()", [m.org_id, email]);
      await this.db.query(
        "INSERT INTO org_invitations (org_id, email, role, listing_ids, token_hash, invited_by, expires_at) VALUES ($1,$2,$3,$4,$5,$6, now() + make_interval(days => $7))",
        [m.org_id, email, input.role, ids, hashToken(token), actorId, INVITE_DAYS],
      );
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya hay una invitación abierta para ese correo", { reason: "INVITATION_OPEN" });
      throw e;
    }
    const inviter = (await this.db.query<{ n: string }>("SELECT coalesce(p.display_name, u.email) AS n FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [actorId])).rows[0]!.n;
    await this.mailer.send({ to: email, template: "org.invitation", locale: "es", data: { operator: m.business_name, inviter, role: input.role, days: INVITE_DAYS, url: `${this.env.WEB_BASE_URL}/operadores/invitacion?token=${token}` } });
    await audit(this.db, { actor: actorId, action: "org.invite", entity: "org", id: m.org_id, org: m.org_id, meta: { email, role: input.role } });
    return { email, role: input.role, expires_in_days: INVITE_DAYS, token: this.env.NODE_ENV === "test" ? token : undefined };
  }

  async revoke(orgId: string, actor: OrgRole, invitationId: string) {
    const { rows } = await this.db.query<{ role: OrgRole }>("SELECT role FROM org_invitations WHERE id = $1 AND org_id = $2 AND accepted_at IS NULL AND revoked_at IS NULL", [invitationId, orgId]);
    if (!rows[0]) throw AppError.notFound("Invitación");
    if (!this.canManage(actor, rows[0].role)) throw new AppError("FORBIDDEN", "Tu rol no puede revocar esa invitación");
    await this.db.query("UPDATE org_invitations SET revoked_at = now() WHERE id = $1", [invitationId]);
  }

  /** Vista pública mínima para que la persona invitada sepa a qué equipo se une antes de aceptar. */
  async preview(token: string) {
    const { rows } = await this.db.query(
      `SELECT i.email, i.role, i.expires_at, p.business_name FROM org_invitations i JOIN partner_profiles p ON p.id = i.org_id
        WHERE i.token_hash = $1 AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at > now()`, [hashToken(token)],
    );
    if (!rows[0]) throw AppError.notFound("Invitación");
    return rows[0];
  }

  async accept(userId: string, token: string) {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const inv = (await c.query("SELECT id, org_id, email, role, listing_ids FROM org_invitations WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() FOR UPDATE", [hashToken(token)])).rows[0];
      if (!inv) throw AppError.notFound("Invitación");
      const u = (await c.query("SELECT email FROM users WHERE id = $1", [userId])).rows[0];
      if (u.email.toLowerCase() !== inv.email.toLowerCase()) throw new AppError("FORBIDDEN", "Esta invitación es para otro correo. Inicia sesión con la cuenta invitada.", { reason: "EMAIL_MISMATCH" });
      if ((await c.query("SELECT 1 FROM org_members WHERE org_id = $1 AND user_id = $2", [inv.org_id, userId])).rowCount) throw new AppError("CONFLICT", "Ya eres parte de este equipo", { reason: "ALREADY_MEMBER" });
      await c.query("INSERT INTO org_members (org_id, user_id, role, listing_ids) VALUES ($1,$2,$3,$4)", [inv.org_id, userId, inv.role, inv.listing_ids]);
      await c.query("UPDATE org_invitations SET accepted_at = now() WHERE id = $1", [inv.id]);
      await c.query("COMMIT");
      await audit(this.db, { actor: userId, action: "org.join", entity: "org", id: inv.org_id, org: inv.org_id, meta: { role: inv.role } });
      return { org_id: inv.org_id as string, role: inv.role as OrgRole };
    } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
  }

  async updateMember(orgId: string, actor: { id: string; role: OrgRole }, userId: string, patch: { role?: Invitable; listing_ids?: string[] }) {
    if (userId === actor.id) throw new AppError("FORBIDDEN", "No puedes cambiar tu propio rol");
    // El candado por organización serializa cambios concurrentes de rol: sin él, dos dueños que se degradan a la vez podrían dejar a la org sin dueño.
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [orgId]);
      const cur = (await c.query<{ role: OrgRole }>("SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0];
      if (!cur) throw AppError.notFound("Miembro");
      if (!this.canManage(actor.role, cur.role) || (patch.role && !this.canManage(actor.role, patch.role))) throw new AppError("FORBIDDEN", "Tu rol no puede modificar a esta persona");
      const role = patch.role ?? cur.role;
      const ids = role === "guia" ? patch.listing_ids ?? (await c.query<{ l: string[] }>("SELECT listing_ids AS l FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0]!.l : [];
      await this.checkListings(orgId, role, ids);
      await c.query("UPDATE org_members SET role = $3, listing_ids = $4 WHERE org_id = $1 AND user_id = $2", [orgId, userId, role, ids]);
      if (cur.role === "owner" && role !== "owner") {
        const owners = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM org_members WHERE org_id = $1 AND role = 'owner'", [orgId])).rows[0]!.n;
        if (owners < 1) throw new AppError("BUSINESS_RULE", "La organización debe conservar al menos un propietario", { reason: "LAST_OWNER" });
      }
      await auditInsert(c, { actor: actor.id, action: "org.member_update", entity: "user", id: userId, org: orgId, meta: { from: cur.role, to: role } });
      await c.query("COMMIT");
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  async remove(orgId: string, actor: { id: string; role: OrgRole }, userId: string) {
    const cur = (await this.db.query<{ role: OrgRole }>("SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0];
    if (!cur) throw AppError.notFound("Miembro");
    if (cur.role === "owner") throw new AppError("FORBIDDEN", "El propietario no se puede quitar");
    if (userId !== actor.id && !this.canManage(actor.role, cur.role)) throw new AppError("FORBIDDEN", "Tu rol no puede quitar a esta persona");
    await this.db.query("DELETE FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId]);
    await audit(this.db, { actor: actor.id, action: "org.member_remove", entity: "user", id: userId, org: orgId, meta: { role: cur.role } });
  }
}
