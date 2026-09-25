import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { isIsoDate } from "./domain/dates.js";

/** Reportes del operador (docs §5.10): resumen, rendimiento por servicio, canales y cancelaciones en un rango de fechas de servicio. */
export class ReportService {
  constructor(private readonly db: Db) {}

  async summary(orgId: string, opts: { from: string; to: string; only?: string[] }) {
    if (!isIsoDate(opts.from) || !isIsoDate(opts.to) || opts.to < opts.from) throw AppError.validation("Rango de fechas inválido");
    const p: unknown[] = [orgId, opts.from, opts.to, opts.only ?? null];
    const base = "FROM bookings b WHERE b.org_id = $1 AND b.date BETWEEN $2::date AND $3::date AND ($4::text[] IS NULL OR b.listing_id = ANY($4))";
    const paid = "(SELECT coalesce(sum(CASE WHEN p.kind = 'refund' THEN -p.amount ELSE p.amount END), 0) FROM booking_payments p WHERE p.booking_id = b.id AND p.status = 'succeeded')";

    const totals = (await this.db.query(
      `SELECT count(*)::int AS bookings, count(*) FILTER (WHERE b.status = 'cancelled')::int AS cancelled, count(*) FILTER (WHERE b.status = 'completed')::int AS completed,
              coalesce(sum(b.guests) FILTER (WHERE b.status <> 'cancelled'), 0)::int AS guests,
              coalesce(sum(b.total_price) FILTER (WHERE b.status <> 'cancelled'), 0) AS booked_value, coalesce(sum(${paid}), 0) AS collected ${base}`, p,
    )).rows[0];
    const byListing = (await this.db.query(
      `SELECT b.listing_id, max(b.listing_title) AS title, count(*) FILTER (WHERE b.status <> 'cancelled')::int AS bookings, coalesce(sum(b.guests) FILTER (WHERE b.status <> 'cancelled'), 0)::int AS guests,
              coalesce(sum(b.total_price) FILTER (WHERE b.status <> 'cancelled'), 0) AS booked_value, coalesce(sum(${paid}), 0) AS collected ${base} GROUP BY b.listing_id ORDER BY booked_value DESC`, p,
    )).rows;
    const bySource = (await this.db.query(`SELECT b.source, count(*)::int AS bookings, coalesce(sum(b.total_price), 0) AS booked_value ${base} AND b.status <> 'cancelled' GROUP BY b.source ORDER BY bookings DESC`, p)).rows;
    const byMonth = (await this.db.query(`SELECT to_char(b.date, 'YYYY-MM') AS month, count(*)::int AS bookings, coalesce(sum(b.total_price), 0) AS booked_value ${base} AND b.status <> 'cancelled' GROUP BY 1 ORDER BY 1`, p)).rows;
    const promos = (await this.db.query(`SELECT b.promo_code AS code, count(*)::int AS bookings, coalesce(sum(b.discount), 0) AS discount_given ${base} AND b.promo_code IS NOT NULL AND b.status <> 'cancelled' GROUP BY 1 ORDER BY 2 DESC`, p)).rows;

    const num = (v: unknown) => Number(v ?? 0);
    const rate = totals.bookings ? Math.round((totals.cancelled / totals.bookings) * 1000) / 10 : 0;
    return {
      range: { from: opts.from, to: opts.to },
      totals: { bookings: totals.bookings, completed: totals.completed, cancelled: totals.cancelled, cancellation_rate: rate, guests: totals.guests, booked_value: num(totals.booked_value), collected: num(totals.collected),
        average_booking: totals.bookings - totals.cancelled > 0 ? Math.round((num(totals.booked_value) / (totals.bookings - totals.cancelled)) * 100) / 100 : 0 },
      by_listing: byListing.map((r) => ({ ...r, booked_value: num(r.booked_value), collected: num(r.collected) })),
      by_source: bySource.map((r) => ({ ...r, booked_value: num(r.booked_value) })),
      by_month: byMonth.map((r) => ({ ...r, booked_value: num(r.booked_value) })),
      promotions: promos.map((r) => ({ ...r, discount_given: num(r.discount_given) })),
    };
  }
}
