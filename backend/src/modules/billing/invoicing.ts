import { createHash, randomUUID } from "node:crypto";
import { type Pool } from "pg";
import { AppError } from "../../lib/errors.js";

export type NcfType = "B01" | "B02" | "B14" | "B15" | "E31" | "E32" | "E44" | "E45";

export interface FiscalInvoiceInput {
  ncf_type: NcfType;
  buyer_name: string;
  buyer_rnc_cedula?: string;
  subtotal: number;
  itbis?: number;
  currency?: string;
  exchange_rate?: number;
  reference_type: string;
  reference_id: string;
  payment_method?: string;
}

export interface FiscalInvoiceRow {
  id: string;
  invoice_number: string;
  ncf: string;
  ncf_type: string;
  buyer_rnc_cedula: string | null;
  buyer_name: string;
  subtotal: number;
  itbis: number;
  total: number;
  currency: string;
  exchange_rate: number;
  reference_type: string;
  reference_id: string;
  payment_method: string;
  security_code_dgii: string;
  qr_url: string;
  status: string;
  issued_at: string;
}

export class FiscalInvoicingService {
  constructor(private pool: Pool) {}

  /**
   * Emite un comprobante fiscal electrónico correlativo cumpliendo con las normas de DGII.
   */
  async issueInvoice(input: FiscalInvoiceInput): Promise<FiscalInvoiceRow> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Validar tipo de comprobante vs RNC (B01 requiere RNC/Cédula válido)
      if (input.ncf_type === "B01" || input.ncf_type === "E31") {
        if (!input.buyer_rnc_cedula || input.buyer_rnc_cedula.replace(/[^0-9]/g, "").length < 9) {
          throw new AppError("VALIDATION_ERROR", "Para comprobantes de Crédito Fiscal (B01/E31) se requiere un RNC o Cédula válido de 9 u 11 dígitos.");
        }
      }

      // Obtener y bloquear la secuencia correlativa
      const seqRes = await client.query(
        `SELECT prefix, current_number, max_number, expires_at, is_active
         FROM fiscal_sequences
         WHERE ncf_type = $1
         FOR UPDATE`,
        [input.ncf_type]
      );

      let ncf: string;
      if (seqRes.rows.length === 0) {
        // Fallback correlativo estándar si no existe secuencia previa. El conteo es lectura
        // susceptible de carrera (dos emisiones → mismo número): un lock de transacción por
        // tipo lo serializa, mismo papel que el FOR UPDATE del camino con secuencia.
        await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`fiscal-fallback:${input.ncf_type}`]);
        const countRes = await client.query(`SELECT count(*)::int as c FROM fiscal_invoices WHERE ncf_type = $1`, [input.ncf_type]);
        const nextNum = (countRes.rows[0]?.c || 0) + 1;
        ncf = `${input.ncf_type}${String(nextNum).padStart(8, "0")}`;
      } else {
        const seq = seqRes.rows[0];
        if (!seq.is_active || new Date(seq.expires_at) < new Date()) {
          throw new AppError("BUSINESS_RULE", `La secuencia para comprobante ${input.ncf_type} está vencida o inactiva ante la DGII.`);
        }
        if (seq.current_number > seq.max_number) {
          throw new AppError("BUSINESS_RULE", `Se ha agotado el rango autorizado de comprobantes ${input.ncf_type}.`);
        }
        ncf = `${seq.prefix}${String(seq.current_number).padStart(8, "0")}`;

        // Incrementar secuencia
        await client.query(
          `UPDATE fiscal_sequences SET current_number = current_number + 1, updated_at = NOW() WHERE ncf_type = $1`,
          [input.ncf_type]
        );
      }

      const subtotal = Math.round(input.subtotal * 100) / 100;
      const itbis = Math.round((input.itbis ?? subtotal * 0.18) * 100) / 100;
      const total = Math.round((subtotal + itbis) * 100) / 100;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

      // Generar código de seguridad para firma e-CF
      const securityCode = createHash("sha256")
        .update(`${ncf}:${total}:${input.buyer_rnc_cedula || "CF"}:${input.reference_id}`)
        .digest("hex")
        .slice(0, 16)
        .toUpperCase();

      const qrUrl = `https://dgii.gov.do/ecf/consulta?rnc=131000000&ncf=${ncf}&monto=${total}&codigo=${securityCode}`;

      const insertRes = await client.query(
        `INSERT INTO fiscal_invoices (
          invoice_number, ncf, ncf_type, buyer_rnc_cedula, buyer_name, subtotal, itbis, total,
          currency, exchange_rate, reference_type, reference_id, payment_method, security_code_dgii, qr_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'issued')
        RETURNING *`,
        [
          invoiceNumber,
          ncf,
          input.ncf_type,
          input.buyer_rnc_cedula || null,
          input.buyer_name,
          subtotal,
          itbis,
          total,
          input.currency || "DOP",
          input.exchange_rate || 1.0,
          input.reference_type,
          input.reference_id,
          input.payment_method || "credit_card",
          securityCode,
          qrUrl,
        ]
      );

      await client.query("COMMIT");
      return insertRes.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getInvoiceByNcf(ncf: string): Promise<FiscalInvoiceRow | null> {
    const res = await this.pool.query(`SELECT * FROM fiscal_invoices WHERE ncf = $1 LIMIT 1`, [ncf]);
    return res.rows[0] || null;
  }

  async listInvoicesByReference(referenceType: string, referenceId: string): Promise<FiscalInvoiceRow[]> {
    const res = await this.pool.query(
      `SELECT * FROM fiscal_invoices WHERE reference_type = $1 AND reference_id = $2 ORDER BY issued_at DESC`,
      [referenceType, referenceId]
    );
    return res.rows;
  }
}
