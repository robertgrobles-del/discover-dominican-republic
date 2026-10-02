import type { NotifyFn } from "../../contracts/notifications.js";
import type { Db } from "../../db/pool.js";
import { audit, auditInsert } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";
import type { OrgRole } from "./catalog.js";

type Requestable = "admin" | "recepcion" | "guia";
/** Máximo de solicitudes abiertas a la vez por persona, para que no se use como correo masivo a empresas. */
const MAX_OPEN_PER_USER = 5;

/**
 * Solicitudes para unirse a una organización (plan de accesos, punto 81). Complementan a las invitaciones:
 * aquí la iniciativa es de la persona. El dueño o un administrador ve quién es (cuenta, correo verificado,
 * antigüedad), qué rol pide y para qué, y decide. Aprobar crea la membresía en la misma transacción.
 */
export class JoinRequestService {
  constructor(private readonly db: Db, private readonly notify: NotifyFn) {}

  async create(input: { orgId: string; userId: string; role: Requestable; message?: string; ip: string }) {
    const org = (await this.db.query<{ business_name: string }>("SELECT business_name FROM partner_profiles WHERE id = $1", [input.orgId])).rows[0];
    if (!org) throw AppError.notFound("Organización");
    const u = (await this.db.query<{ verified: Date | null }>("SELECT email_verified_at AS verified FROM users WHERE id = $1 AND status = 'active'", [input.userId])).rows[0];
    // Sin correo verificado la organización no tendría cómo saber quién pide entrar.
    if (!u?.verified) throw new AppError("FORBIDDEN", "Verifica tu correo antes de pedir acceso a una organización", { reason: "EMAIL_NOT_VERIFIED" });
    if ((await this.db.query("SELECT 1 FROM org_members WHERE org_id = $1 AND user_id = $2", [input.orgId, input.userId])).rowCount) throw new AppError("CONFLICT", "Ya eres parte de este equipo", { reason: "ALREADY_MEMBER" });
    const open = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM org_join_requests WHERE user_id = $1 AND status = 'pending'", [input.userId])).rows[0]!.n;
    if (open >= MAX_OPEN_PER_USER) throw new AppError("BUSINESS_RULE", "Tienes demasiadas solicitudes abiertas; espera a que te respondan o retira alguna", { code: "TOO_MANY_REQUESTS" });

    let id: string;
    try {
      id = (await this.db.query<{ id: string }>("INSERT INTO org_join_requests (org_id, user_id, requested_role, message) VALUES ($1,$2,$3,$4) RETURNING id", [input.orgId, input.userId, input.role, input.message?.trim() || null])).rows[0]!.id;
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya tienes una solicitud pendiente con esta organización", { reason: "REQUEST_ALREADY_PENDING" });
      throw e;
    }
    await audit(this.db, { actor: input.userId, action: "org.join_requested", entity: "org", id: input.orgId, org: input.orgId, meta: { request_id: id, role: input.role }, ip: input.ip });
    const managers = (await this.db.query<{ user_id: string }>("SELECT user_id FROM org_members WHERE org_id = $1 AND role IN ('owner', 'admin') AND (expires_at IS NULL OR expires_at > now())", [input.orgId])).rows;
    for (const m of managers) await this.notify(m.user_id, { type: "system", title: "Alguien pide unirse a tu equipo", message: `Solicita el rol de ${input.role} en ${org.business_name}.`, link: "/operadores", data: { join_request_id: id, org_id: input.orgId } });
    return { id, org_id: input.orgId, requested_role: input.role, status: "pending" };
  }

  /** Solicitudes de la organización con lo necesario para valorar a quien pide entrar, sin datos de más. */
  async listForOrg(orgId: string, status: string) {
    return (await this.db.query(
      `SELECT r.id, r.user_id, r.requested_role, r.message, r.status, r.granted_role, r.decision_note, r.created_at, r.decided_at,
              coalesce(p.display_name, split_part(u.email, '@', 1)) AS applicant_name, u.email AS applicant_email,
              (u.email_verified_at IS NOT NULL) AS email_verified, u.created_at AS account_created_at
         FROM org_join_requests r JOIN users u ON u.id = r.user_id LEFT JOIN profiles p ON p.id = u.id
        WHERE r.org_id = $1 AND r.status = $2 ORDER BY r.created_at DESC LIMIT 100`, [orgId, status],
    )).rows;
  }

  async listMine(userId: string) {
    return (await this.db.query(
      `SELECT r.id, r.org_id, o.business_name, r.requested_role, r.granted_role, r.status, r.decision_note, r.created_at, r.decided_at
         FROM org_join_requests r JOIN partner_profiles o ON o.id = r.org_id WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT 50`, [userId],
    )).rows;
  }

  async decide(input: { orgId: string; requestId: string; actor: { id: string; role: OrgRole }; decision: "approved" | "rejected"; role?: Requestable; listingIds?: string[]; note?: string; ip: string }) {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [input.orgId]); // mismo candado que los cambios de rol del equipo
      const r = (await c.query<{ user_id: string; requested_role: Requestable; status: string }>("SELECT user_id, requested_role, status FROM org_join_requests WHERE id = $1 AND org_id = $2 FOR UPDATE", [input.requestId, input.orgId])).rows[0];
      if (!r) throw AppError.notFound("Solicitud");
      if (r.status !== "pending") throw new AppError("BUSINESS_RULE", `La solicitud ya está ${r.status}`, { code: "INVALID_STATE" });

      let granted: Requestable | null = null;
      if (input.decision === "approved") {
        granted = input.role ?? r.requested_role;
        // Igual que en las invitaciones: sólo el propietario puede incorporar a otro administrador.
        if (granted === "admin" && input.actor.role !== "owner") throw new AppError("FORBIDDEN", "Sólo el propietario puede incorporar administradores");
        const ids = granted === "guia" ? input.listingIds ?? [] : [];
        if (granted === "guia" && !ids.length) throw AppError.validation("Un guía necesita al menos un servicio asignado", { field: "listing_ids" });
        if (ids.length && (await c.query("SELECT id FROM operator_listings WHERE org_id = $1 AND id = ANY($2)", [input.orgId, ids])).rows.length !== new Set(ids).size) throw AppError.validation("Algún servicio no pertenece a tu organización");
        if ((await c.query("SELECT 1 FROM users WHERE id = $1 AND status = 'active'", [r.user_id])).rowCount !== 1) throw new AppError("BUSINESS_RULE", "La cuenta que solicitó ya no está activa", { code: "INVALID_STATE" });
        await c.query("INSERT INTO org_members (org_id, user_id, role, listing_ids) VALUES ($1,$2,$3,$4) ON CONFLICT (org_id, user_id) DO NOTHING", [input.orgId, r.user_id, granted, ids]);
      }
      await c.query("UPDATE org_join_requests SET status = $2, granted_role = $3, decided_by = $4, decided_at = now(), decision_note = $5 WHERE id = $1", [input.requestId, input.decision, granted, input.actor.id, input.note ?? null]);
      await auditInsert(c, { actor: input.actor.id, action: `org.join_request_${input.decision}`, entity: "user", id: r.user_id, org: input.orgId, meta: { request_id: input.requestId, requested: r.requested_role, granted }, ip: input.ip });
      await c.query("COMMIT");
      await this.notify(r.user_id, { type: "system", title: input.decision === "approved" ? "Aceptaron tu solicitud para unirte al equipo" : "No aceptaron tu solicitud para unirte al equipo", message: input.note ?? null, link: "/operadores", data: { join_request_id: input.requestId, org_id: input.orgId } });
      return { id: input.requestId, status: input.decision, granted_role: granted, user_id: r.user_id };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  async cancel(requestId: string, userId: string) {
    const res = await this.db.query("UPDATE org_join_requests SET status = 'cancelled', decided_at = now() WHERE id = $1 AND user_id = $2 AND status = 'pending'", [requestId, userId]);
    if (!res.rowCount) throw AppError.notFound("Solicitud pendiente propia");
  }
}
