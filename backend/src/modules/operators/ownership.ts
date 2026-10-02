import type { IdentityAdminPort } from "../../contracts/identity.js";
import type { NotifyFn } from "../../contracts/notifications.js";
import type { Db } from "../../db/pool.js";
import { audit, auditInsert } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";

export const TRANSFER_DAYS = 7;

interface Transfer { id: string; org_id: string; from_user_id: string; to_user_id: string; status: string; expires_at: Date; created_at: Date; decided_at: Date | null }
const COLUMNS = "id, org_id, from_user_id, to_user_id, status, expires_at, created_at, decided_at";

/**
 * Transferencia de propiedad de una organización (plan de accesos, punto 82). El propietario la propone
 * tras volver a identificarse, la persona elegida la acepta y sólo entonces cambian los roles, en una
 * transacción: el propietario anterior pasa a administrador y nunca hay cero ni dos propietarios.
 */
export class OwnershipService {
  constructor(private readonly db: Db, private readonly identity: Pick<IdentityAdminPort, "reauthenticate">, private readonly notify: NotifyFn) {}

  private async expireStale(orgId: string) {
    await this.db.query("UPDATE org_ownership_transfers SET status = 'expired', decided_at = now() WHERE org_id = $1 AND status = 'pending' AND expires_at <= now()", [orgId]);
  }

  /** Transferencia abierta de la organización, si la hay. */
  async current(orgId: string): Promise<Transfer | null> {
    await this.expireStale(orgId);
    return (await this.db.query<Transfer>(`SELECT ${COLUMNS} FROM org_ownership_transfers WHERE org_id = $1 AND status = 'pending'`, [orgId])).rows[0] ?? null;
  }

  async propose(input: { orgId: string; ownerId: string; toUserId: string; password: string; sessionHasMfa: boolean; ip: string }): Promise<Transfer> {
    // Volver a identificarse: la contraseña siempre, y el segundo factor si la cuenta lo tiene activo.
    const check = await this.identity.reauthenticate(input.ownerId, input.password);
    if (!check.ok) throw new AppError("FORBIDDEN", "La contraseña no es correcta", { code: "REAUTH_FAILED" });
    if (check.twoFactorEnabled && !input.sessionHasMfa) throw new AppError("FORBIDDEN", "Inicia sesión con tu verificación en dos pasos para transferir la propiedad", { code: "MFA_REQUIRED" });
    if (input.toUserId === input.ownerId) throw AppError.validation("Elige a otra persona del equipo");

    const target = (await this.db.query<{ status: string }>(
      "SELECT u.status FROM org_members m JOIN users u ON u.id = m.user_id WHERE m.org_id = $1 AND m.user_id = $2 AND (m.expires_at IS NULL OR m.expires_at > now())", [input.orgId, input.toUserId],
    )).rows[0];
    if (!target) throw new AppError("BUSINESS_RULE", "La nueva persona propietaria debe ser ya miembro del equipo", { code: "NOT_A_MEMBER" });
    if (target.status !== "active") throw new AppError("BUSINESS_RULE", "Esa cuenta no está activa", { code: "INVALID_STATE" });

    await this.expireStale(input.orgId);
    let transfer: Transfer;
    try {
      transfer = (await this.db.query<Transfer>(
        `INSERT INTO org_ownership_transfers (org_id, from_user_id, to_user_id, expires_at) VALUES ($1, $2, $3, now() + make_interval(days => $4)) RETURNING ${COLUMNS}`,
        [input.orgId, input.ownerId, input.toUserId, TRANSFER_DAYS],
      )).rows[0]!;
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya hay una transferencia de propiedad pendiente", { reason: "TRANSFER_ALREADY_PENDING" });
      throw e;
    }
    await audit(this.db, { actor: input.ownerId, action: "org.ownership_transfer_proposed", entity: "org", id: input.orgId, org: input.orgId, meta: { transfer_id: transfer.id, to: input.toUserId }, ip: input.ip });
    await this.notify(input.toUserId, { type: "system", title: "Te proponen ser propietario de la organización", message: `Tienes ${TRANSFER_DAYS} días para aceptar o rechazar.`, link: "/operadores", data: { transfer_id: transfer.id, org_id: input.orgId } });
    return transfer;
  }

  /** La persona elegida acepta: los dos roles cambian juntos o no cambia ninguno. */
  async accept(orgId: string, transferId: string, userId: string, ip: string): Promise<Transfer> {
    await this.expireStale(orgId);
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [orgId]); // mismo candado que los cambios de rol del equipo
      const t = (await c.query<Transfer>(`SELECT ${COLUMNS} FROM org_ownership_transfers WHERE id = $1 AND org_id = $2 FOR UPDATE`, [transferId, orgId])).rows[0];
      if (!t || t.to_user_id !== userId) throw AppError.notFound("Transferencia de propiedad");
      if (t.status !== "pending") throw new AppError("BUSINESS_RULE", `La transferencia ya está ${t.status}`, { code: "INVALID_STATE" });
      const roles = (await c.query<{ user_id: string; role: string }>("SELECT user_id, role FROM org_members WHERE org_id = $1 AND user_id = ANY($2::uuid[]) FOR UPDATE", [orgId, [t.from_user_id, t.to_user_id]])).rows;
      const fromRole = roles.find((r) => r.user_id === t.from_user_id)?.role;
      // Si entre la propuesta y la aceptación cambió el equipo, la propuesta ya no vale.
      if (fromRole !== "owner" || !roles.some((r) => r.user_id === t.to_user_id)) {
        await c.query("UPDATE org_ownership_transfers SET status = 'cancelled', decided_at = now() WHERE id = $1", [transferId]);
        await c.query("COMMIT");
        throw new AppError("BUSINESS_RULE", "El equipo cambió desde que se propuso la transferencia; hay que proponerla de nuevo", { code: "TRANSFER_STALE" });
      }
      // Primero baja el propietario actual: el índice único admite un solo propietario por organización.
      await c.query("UPDATE org_members SET role = 'admin' WHERE org_id = $1 AND user_id = $2", [orgId, t.from_user_id]);
      await c.query("UPDATE org_members SET role = 'owner', expires_at = NULL, listing_ids = '{}' WHERE org_id = $1 AND user_id = $2", [orgId, t.to_user_id]);
      const done = (await c.query<Transfer>(`UPDATE org_ownership_transfers SET status = 'accepted', decided_at = now() WHERE id = $1 RETURNING ${COLUMNS}`, [transferId])).rows[0]!;
      await auditInsert(c, { actor: userId, action: "org.ownership_transferred", entity: "org", id: orgId, org: orgId, meta: { transfer_id: transferId, from: t.from_user_id, to: t.to_user_id }, ip });
      await c.query("COMMIT");
      await this.notify(t.from_user_id, { type: "system", title: "La propiedad de la organización se transfirió", message: "Ahora tienes rol de administrador en el equipo.", link: "/operadores", data: { transfer_id: transferId, org_id: orgId } });
      return done;
    } catch (e) {
      await c.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally { c.release(); }
  }

  /** Rechaza quien fue elegido o retira quien la propuso. */
  async close(orgId: string, transferId: string, userId: string, ip: string): Promise<"declined" | "cancelled"> {
    const t = (await this.db.query<Transfer>(`SELECT ${COLUMNS} FROM org_ownership_transfers WHERE id = $1 AND org_id = $2 AND status = 'pending'`, [transferId, orgId])).rows[0];
    if (!t || (t.to_user_id !== userId && t.from_user_id !== userId)) throw AppError.notFound("Transferencia de propiedad");
    const status = t.to_user_id === userId ? "declined" : "cancelled";
    await this.db.query("UPDATE org_ownership_transfers SET status = $2, decided_at = now() WHERE id = $1", [transferId, status]);
    await audit(this.db, { actor: userId, action: `org.ownership_transfer_${status}`, entity: "org", id: orgId, org: orgId, meta: { transfer_id: transferId }, ip });
    await this.notify(status === "declined" ? t.from_user_id : t.to_user_id, { type: "system", title: status === "declined" ? "Rechazaron la transferencia de propiedad" : "Se retiró la propuesta de transferencia de propiedad", data: { transfer_id: transferId, org_id: orgId } });
    return status;
  }
}
