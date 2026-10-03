import type { Pool } from "pg";
import type { SettlementReaderPort } from "../../contracts/settlements.js";
import { addDays } from "../../lib/dates.js";

const RD = "AT TIME ZONE 'America/Santo_Domingo'";
const inRange = (col: string) => `${col} >= ($1::date::timestamp ${RD}) AND ${col} < (($2::date + 1)::timestamp ${RD})`;
const SIGNED = "CASE WHEN p.kind = 'refund' THEN -p.amount ELSE p.amount END";
const LIVE_INVOICE = "i.status NOT IN ('cancelled', 'rejected')";
const UNSETTLED_AFTER_DAYS = 14;
const LIST_LIMIT = 100;
const num = (v: unknown) => Number(v ?? 0);

export type Discrepancy =
  | { kind: "paid_without_invoice" | "invoice_mismatch"; reference_type: "booking" | "store_order"; reference_id: string; label: string; currency: string; collected: number; invoiced: number }
  | { kind: "invoice_without_payment"; reference_type: string; reference_id: string; label: string; currency: string; collected: 0; invoiced: number }
  | { kind: "unsettled_booking"; reference_type: "booking"; reference_id: string; label: string; currency: string; collected: number; invoiced: 0 };

/**
 * Conciliación para finanzas (plan de 150 mejoras, punto 103): junta en una vista lo cobrado (reservas y tienda),
 * lo facturado con NCF y lo liquidado a operadores, y lista lo que no cuadra. Sólo lee; no corrige nada.
 */
export class ReconciliationService {
  constructor(private readonly pool: Pool, private readonly settlements: SettlementReaderPort) {}

  async report(from: string, to: string) {
    const p = [from, to];
    const q = async <T extends Record<string, unknown>>(sql: string, params: unknown[] = p) => (await this.pool.query<T>(sql, params)).rows;

    const collected = await q<{ source: string; currency: string; provider: string; charges: string; refunds: string; payments: number }>(
      `SELECT 'booking' AS source, p.currency, coalesce(p.provider, p.method) AS provider,
              coalesce(sum(p.amount) FILTER (WHERE p.kind <> 'refund'), 0) AS charges, coalesce(sum(p.amount) FILTER (WHERE p.kind = 'refund'), 0) AS refunds, count(*)::int AS payments
         FROM booking_payments p WHERE p.status = 'succeeded' AND ${inRange("p.created_at")} GROUP BY 2, 3
       UNION ALL
       SELECT 'store_order', 'DOP', coalesce(p.provider, 'otro'),
              coalesce(sum(p.amount) FILTER (WHERE p.kind <> 'refund'), 0), coalesce(sum(p.amount) FILTER (WHERE p.kind = 'refund'), 0), count(*)::int
         FROM store_payments p WHERE p.status = 'succeeded' AND ${inRange("p.created_at")} GROUP BY 3
       ORDER BY 1, 2, 3`,
    );
    const failed = await q<{ n: number }>(
      `SELECT (SELECT count(*) FROM booking_payments p WHERE p.status = 'failed' AND ${inRange("p.created_at")})::int
            + (SELECT count(*) FROM store_payments p WHERE p.status = 'failed' AND ${inRange("p.created_at")})::int AS n`,
    );
    const invoiced = await q<{ reference_type: string; currency: string; invoices: number; subtotal: string; itbis: string; total: string }>(
      `SELECT i.reference_type, i.currency, count(*)::int AS invoices, sum(i.subtotal) AS subtotal, sum(i.itbis) AS itbis, sum(i.total) AS total
         FROM fiscal_invoices i WHERE ${LIVE_INVOICE} AND ${inRange("i.issued_at")} GROUP BY 1, 2 ORDER BY 1, 2`,
    );
    const payouts = await q<{ status: string; currency: string; payouts: number; gross: string; commission: string; net: string }>(
      `SELECT o.status, o.currency, count(*)::int AS payouts, sum(o.gross) AS gross, sum(o.commission) AS commission, sum(o.net) AS net
         FROM payouts o WHERE ${inRange("o.created_at")} GROUP BY 1, 2 ORDER BY 1, 2`,
    );

    // Cobros netos del rango por reserva o pedido, frente a los comprobantes vigentes de esa misma referencia.
    const perReference = await q<{ reference_type: "booking" | "store_order"; reference_id: string; label: string; currency: string; collected: string; invoiced: string | null }>(
      `WITH paid AS (
         SELECT 'booking' AS reference_type, b.id::text AS reference_id, b.reference AS label, p.currency, sum(${SIGNED}) AS collected
           FROM booking_payments p JOIN bookings b ON b.id = p.booking_id WHERE p.status = 'succeeded' AND ${inRange("p.created_at")} GROUP BY b.id, b.reference, p.currency
         UNION ALL
         SELECT 'store_order', p.order_id, p.order_id, 'DOP', sum(${SIGNED})
           FROM store_payments p WHERE p.status = 'succeeded' AND ${inRange("p.created_at")} GROUP BY p.order_id
       )
       SELECT paid.*, (SELECT sum(i.total) FROM fiscal_invoices i WHERE i.reference_type = paid.reference_type AND i.reference_id IN (paid.reference_id, paid.label) AND i.currency = paid.currency AND ${LIVE_INVOICE}) AS invoiced
         FROM paid WHERE paid.collected > 0 ORDER BY paid.collected DESC`,
    );
    const orphanInvoices = await q<{ reference_type: string; reference_id: string; ncf: string; currency: string; total: string }>(
      `SELECT i.reference_type, i.reference_id, i.ncf, i.currency, i.total FROM fiscal_invoices i
        WHERE ${LIVE_INVOICE} AND ${inRange("i.issued_at")} AND i.reference_type IN ('booking', 'store_order')
          AND NOT EXISTS (SELECT 1 FROM booking_payments p JOIN bookings b ON b.id = p.booking_id WHERE i.reference_type = 'booking' AND p.status = 'succeeded' AND i.reference_id IN (b.id::text, b.reference))
          AND NOT EXISTS (SELECT 1 FROM store_payments p WHERE i.reference_type = 'store_order' AND p.status = 'succeeded' AND p.order_id = i.reference_id)
        ORDER BY i.issued_at DESC LIMIT ${LIST_LIMIT}`,
    );
    // Completadas hace más de dos semanas y aún fuera de toda liquidación; se mira hasta un año atrás del rango.
    const unsettled = await this.settlements.unsettledBookings(addDays(from, -366), addDays(to, -UNSETTLED_AFTER_DAYS), LIST_LIMIT);

    const discrepancies: Discrepancy[] = [];
    for (const r of perReference) {
      const got = num(r.collected), inv = num(r.invoiced);
      if (r.invoiced === null) discrepancies.push({ kind: "paid_without_invoice", reference_type: r.reference_type, reference_id: r.reference_id, label: r.label, currency: r.currency, collected: got, invoiced: 0 });
      else if (Math.abs(got - inv) > 0.01) discrepancies.push({ kind: "invoice_mismatch", reference_type: r.reference_type, reference_id: r.reference_id, label: r.label, currency: r.currency, collected: got, invoiced: inv });
    }
    for (const i of orphanInvoices) discrepancies.push({ kind: "invoice_without_payment", reference_type: i.reference_type, reference_id: i.reference_id, label: i.ncf, currency: i.currency, collected: 0, invoiced: num(i.total) });
    for (const b of unsettled) discrepancies.push({ kind: "unsettled_booking", reference_type: "booking", reference_id: b.id, label: b.reference, currency: b.currency, collected: b.amount_paid, invoiced: 0 });

    const counts = { paid_without_invoice: 0, invoice_mismatch: 0, invoice_without_payment: 0, unsettled_booking: 0 };
    for (const d of discrepancies) counts[d.kind]++;
    // La lista se recorta para la pantalla; los conteos son del total.
    const byKind = (k: Discrepancy["kind"]) => discrepancies.filter((d) => d.kind === k).slice(0, LIST_LIMIT);
    return {
      range: { from, to },
      collected: collected.map((r) => ({ source: r.source, currency: r.currency, provider: r.provider, payments: r.payments, charges: num(r.charges), refunds: num(r.refunds), net: Math.round((num(r.charges) - num(r.refunds)) * 100) / 100 })),
      failed_payments: failed[0]?.n ?? 0,
      invoiced: invoiced.map((r) => ({ reference_type: r.reference_type, currency: r.currency, invoices: r.invoices, subtotal: num(r.subtotal), itbis: num(r.itbis), total: num(r.total) })),
      payouts: payouts.map((r) => ({ status: r.status, currency: r.currency, payouts: r.payouts, gross: num(r.gross), commission: num(r.commission), net: num(r.net) })),
      discrepancy_counts: counts,
      discrepancies: (Object.keys(counts) as Discrepancy["kind"][]).flatMap(byKind),
      notes: { unsettled_after_days: UNSETTLED_AFTER_DAYS, list_limit: LIST_LIMIT },
    };
  }
}
