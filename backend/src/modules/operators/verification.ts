import type { BusinessVerificationPort, VerificationAuditFilters } from "../../contracts/business-verification.js";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { auditInsert } from "../../lib/audit.js";

/** PostgreSQL adapter and use cases for the verified-business workflow. */
export class OperatorVerificationService implements BusinessVerificationPort {
  constructor(private readonly db: Db) {}

  async listApprovedBusinessIds(): Promise<string[]> {
    const { rows } = await this.db.query<{ id: string }>(
      "SELECT DISTINCT business_id::text AS id FROM business_verification_audits WHERE status = 'approved'",
    );
    return rows.map((row) => row.id);
  }

  async listAudits(filters: VerificationAuditFilters) {
    const params: unknown[] = [];
    const where = ["true"];
    if (filters.status) { params.push(filters.status); where.push(`status = $${params.length}`); }
    if (filters.businessType) { params.push(filters.businessType); where.push(`business_type = $${params.length}`); }
    const total = (await this.db.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM business_verification_audits WHERE ${where.join(" AND ")}`,
      params,
    )).rows[0]!.n;
    const { rows } = await this.db.query(
      `SELECT id, business_id, business_type, business_name, applicant_user_id, rnc, mitur_license, documents,
              status, audited_by, audit_notes, badge_expires_at, created_at, updated_at
         FROM business_verification_audits
        WHERE ${where.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT ${filters.perPage} OFFSET ${(filters.page - 1) * filters.perPage}`,
      params,
    );
    return { rows, total };
  }

  async approveAudit(input: { id: string; actorId: string; notes: string; badgeNotes: string; expiresAt: string; ip?: string }) {
    return this.tx(async (c) => {
      const audit = (await c.query<{ business_id: string; business_type: string }>(
        "SELECT business_id, business_type FROM business_verification_audits WHERE id = $1 FOR UPDATE",
        [input.id],
      )).rows[0];
      if (!audit) return null;
      await c.query(
        `UPDATE business_verification_audits
            SET status = 'approved', audited_by = $1, audit_notes = $2, badge_expires_at = $3, updated_at = now()
          WHERE id = $4`,
        [input.actorId, input.notes, input.expiresAt, input.id],
      );
      if (["operador", "agencia", "guia"].includes(audit.business_type)) {
        await c.query(
          `UPDATE partner_profiles
              SET verified_badge = true, verified_badge_issued_at = now(), verified_badge_notes = $1, verification = 'verified', updated_at = now()
            WHERE id = $2`,
          [input.badgeNotes, audit.business_id],
        );
      }
      await auditInsert(c, { actor: input.actorId, action: "verification.approve", entity: "verification_audit", id: input.id, meta: { business_id: audit.business_id }, ip: input.ip });
      return audit;
    });
  }

  async rejectAudit(input: { id: string; actorId: string; reason: string; ip?: string }) {
    return this.tx(async (c) => {
      const audit = (await c.query<{ business_id: string }>(
        "SELECT business_id FROM business_verification_audits WHERE id = $1 FOR UPDATE",
        [input.id],
      )).rows[0];
      if (!audit) return null;
      await c.query(
        `UPDATE business_verification_audits
            SET status = 'rejected', audited_by = $1, audit_notes = $2, updated_at = now()
          WHERE id = $3`,
        [input.actorId, input.reason, input.id],
      );
      await auditInsert(c, { actor: input.actorId, action: "verification.reject", entity: "verification_audit", id: input.id, meta: { reason: input.reason }, ip: input.ip });
      return audit;
    });
  }

  /** Decisión, sello del perfil y entrada de auditoría se confirman o revierten juntos. */
  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const out = await fn(c);
      await c.query("COMMIT");
      return out;
    } catch (err) {
      await c.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally { c.release(); }
  }
}

declare module "fastify" {
  interface FastifyInstance { businessVerification: BusinessVerificationPort }
}
