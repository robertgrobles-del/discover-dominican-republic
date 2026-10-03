import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { audit } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";

/** Cambia al modificar el texto: una aceptación siempre queda ligada a la versión que se leyó. */
export const TERMS_VERSION = "2026-10-borrador";
export const BUSINESS_TYPES = ["hotel", "restaurante", "bar", "operador", "agencia", "guia", "otro"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];
/** Tipos cuyo negocio es una organización de operador: sólo su propietario puede solicitar el sello. */
const ORG_TYPES: BusinessType[] = ["operador", "agencia", "guia"];

interface ContractSubject { audit_id: string; business_id: string; business_name: string; business_type: string; rnc: string | null; applicant_user_id: string | null; commission_rate: number | null; badge_expires_at: string }

/**
 * Texto del contrato. Es un BORRADOR operativo, no un documento revisado por un abogado: antes de usarlo con
 * negocios reales hay que validarlo legalmente y subir `TERMS_VERSION`.
 */
export function renderContract(s: ContractSubject, issuedOn: string): string {
  const commission = s.commission_rate === null
    ? "La comisión aplicable es la del tarifario vigente publicado en el panel al momento de cada venta."
    : `La comisión de la plataforma es del ${s.commission_rate} % sobre cada reserva cobrada a través de Descubre RD.`;
  return [
    `TÉRMINOS COMERCIALES — DESCUBRE RD (versión ${TERMS_VERSION})`,
    `Emitido el ${issuedOn} para ${s.business_name}${s.rnc ? `, RNC ${s.rnc}` : ""} (${s.business_type}).`,
    "",
    "1. Objeto. Descubre RD publica la ficha del negocio con el Sello Verificado y, cuando aplique, procesa sus reservas.",
    `2. Vigencia del sello. El Sello Verificado es válido hasta el ${s.badge_expires_at.slice(0, 10)} y se renueva con una nueva revisión documental.`,
    `3. Comisión. ${commission}`,
    "4. Veracidad. El negocio declara que la información y los documentos entregados son auténticos y se compromete a mantenerlos al día.",
    "5. Retiro del sello. Descubre RD puede retirar el sello si la información deja de ser cierta o si hay incumplimientos reiterados con los viajeros.",
    "6. Datos personales. Cada parte trata los datos de los viajeros conforme a la Ley 172-13 y sólo para prestar el servicio contratado.",
    "7. Terminación. Cualquiera de las partes puede terminar la relación con 30 días de aviso; las reservas ya confirmadas se honran.",
    "",
    "La aceptación de estos términos queda registrada con fecha, cuenta e identificador de este documento.",
  ].join("\n");
}

/** Solicitud de Sello Verificado (Claim & Verify) y contrato de términos comerciales (plan de 150 mejoras, punto 30). */
export class ContractService {
  constructor(private readonly db: Db) {}

  async apply(userId: string, input: { business_id: string; business_type: BusinessType; business_name: string; rnc?: string; mitur_license?: string; documents: string[] }, ip?: string) {
    if (ORG_TYPES.includes(input.business_type)) {
      const owner = await this.db.query("SELECT 1 FROM org_members WHERE org_id = $1 AND user_id = $2 AND role = 'owner'", [input.business_id, userId]);
      if (!owner.rowCount) throw new AppError("FORBIDDEN", "Sólo el propietario de la organización puede solicitar el sello");
    }
    // Una sola solicitud en revisión por negocio y solicitante: no se duplica la cola de quien revisa.
    const ins = await this.db.query(
      `INSERT INTO business_verification_audits (business_id, business_type, business_name, applicant_user_id, rnc, mitur_license, documents)
       SELECT $1, $2, $3, $4, $5, $6, $7
        WHERE NOT EXISTS (SELECT 1 FROM business_verification_audits WHERE business_id = $1 AND applicant_user_id = $4 AND status = 'pending')
       RETURNING id, business_id, business_type, business_name, status, created_at`,
      [input.business_id, input.business_type, input.business_name, userId, input.rnc ?? null, input.mitur_license ?? null, input.documents],
    );
    if (!ins.rows[0]) throw new AppError("CONFLICT", "Ese negocio ya tiene una solicitud en revisión");
    await audit(this.db, { actor: userId, action: "verification.apply", entity: "verification_audit", id: ins.rows[0].id, meta: { business_id: input.business_id, business_type: input.business_type }, ip });
    return ins.rows[0];
  }

  async myApplications(userId: string) {
    return (await this.db.query(
      `SELECT a.id, a.business_id, a.business_type, a.business_name, a.status, a.audit_notes, a.badge_expires_at, a.created_at, c.id AS contract_id, c.accepted_at AS contract_accepted_at
         FROM business_verification_audits a LEFT JOIN business_contracts c ON c.audit_id = a.id WHERE a.applicant_user_id = $1 ORDER BY a.created_at DESC LIMIT 100`, [userId],
    )).rows;
  }

  /** Se llama dentro de la transacción que aprueba la solicitud: sello y contrato nacen juntos o no nace ninguno. */
  async issue(c: PoolClient, s: ContractSubject): Promise<void> {
    const body = renderContract(s, new Date().toISOString().slice(0, 10));
    await c.query(
      `INSERT INTO business_contracts (audit_id, business_id, business_name, applicant_user_id, terms_version, body, body_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (audit_id) DO NOTHING`,
      [s.audit_id, s.business_id, s.business_name, s.applicant_user_id, TERMS_VERSION, body, createHash("sha256").update(body).digest("hex")],
    );
  }

  async myContracts(userId: string) {
    return (await this.db.query("SELECT id, audit_id, business_id, business_name, terms_version, body, body_hash, issued_at, accepted_at FROM business_contracts WHERE applicant_user_id = $1 ORDER BY issued_at DESC", [userId])).rows;
  }

  /** Acepta el texto exacto que se leyó: si la huella no coincide, no se registra nada. */
  async accept(userId: string, id: string, bodyHash: string, ip?: string) {
    const row = (await this.db.query<{ body_hash: string; accepted_at: Date | null }>("SELECT body_hash, accepted_at FROM business_contracts WHERE id = $1 AND applicant_user_id = $2", [id, userId])).rows[0];
    if (!row) throw AppError.notFound("Contrato");
    if (row.body_hash !== bodyHash) throw new AppError("CONFLICT", "El texto del contrato no coincide con el que se emitió");
    const upd = await this.db.query("UPDATE business_contracts SET accepted_at = now(), accepted_by = $2, accepted_ip = $3 WHERE id = $1 AND accepted_at IS NULL RETURNING accepted_at", [id, userId, ip ?? null]);
    if (upd.rows[0]) await audit(this.db, { actor: userId, action: "contract.accept", entity: "business_contract", id, meta: { terms_version: TERMS_VERSION, body_hash: bodyHash }, ip });
    return { accepted_at: (upd.rows[0]?.accepted_at ?? row.accepted_at) as Date, already_accepted: !upd.rows[0] };
  }
}
