import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { addDays } from "./domain/dates.js";

/** Planes que incluyen el reporte trimestral de demanda. */
const PREMIUM_TIERS = ["premium_partner", "corporativo"];
const WEEKDAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const pct = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : null);

/** Primer y último día de un trimestre `AAAA-Tn`, y el trimestre anterior para comparar. */
export function quarterRange(quarter: string): { from: string; to: string; previous: string } {
  const m = /^(\d{4})-T([1-4])$/.exec(quarter);
  if (!m) throw AppError.validation("El trimestre debe tener la forma AAAA-Tn, por ejemplo 2026-T3");
  const year = Number(m[1]), q = Number(m[2]);
  const from = `${year}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`;
  const next = q === 4 ? `${year + 1}-01-01` : `${year}-${String(q * 3 + 1).padStart(2, "0")}-01`;
  return { from, to: addDays(next, -1), previous: q === 1 ? `${year - 1}-T4` : `${year}-T${q - 1}` };
}

interface Totals { bookings: number; cancelled: number; guests: number; lead_days: number | null }

/**
 * Reporte trimestral de demanda para planes Premium (plan de 150 mejoras, punto 31). Los hallazgos salen de
 * reglas sobre los datos del propio operador, no de un modelo de IA: no hay proveedor de IA contratado y así
 * cada frase puede comprobarse contra las cifras que la acompañan.
 */
export class DemandReportService {
  constructor(private readonly db: Db) {}

  private async totals(orgId: string, from: string, to: string): Promise<Totals> {
    const r = (await this.db.query<{ bookings: number; cancelled: number; guests: number; lead_days: string | null }>(
      `SELECT count(*)::int AS bookings, count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
              coalesce(sum(guests) FILTER (WHERE status <> 'cancelled'), 0)::int AS guests,
              avg(date - (created_at AT TIME ZONE 'America/Santo_Domingo')::date) FILTER (WHERE status <> 'cancelled') AS lead_days
         FROM bookings WHERE org_id = $1 AND date BETWEEN $2::date AND $3::date`, [orgId, from, to],
    )).rows[0]!;
    return { ...r, lead_days: r.lead_days === null ? null : Math.round(Number(r.lead_days) * 10) / 10 };
  }

  async quarterly(orgId: string, quarter: string) {
    const sub = await this.db.query("SELECT 1 FROM operator_subscriptions WHERE org_id = $1 AND status = 'active' AND plan_tier = ANY($2) AND current_period_end > now()", [orgId, PREMIUM_TIERS]);
    if (!sub.rowCount) throw new AppError("FORBIDDEN", "El reporte trimestral de demanda está incluido en los planes Premium y Corporativo");
    const { from, to, previous } = quarterRange(quarter);
    const prev = quarterRange(previous);
    const p = [orgId, from, to];
    const live = "FROM bookings WHERE org_id = $1 AND date BETWEEN $2::date AND $3::date AND status <> 'cancelled'";

    const [now, before] = await Promise.all([this.totals(orgId, from, to), this.totals(orgId, prev.from, prev.to)]);
    const revenue = (await this.db.query<{ currency: string; total: string }>(`SELECT currency, sum(total_price) AS total ${live} GROUP BY currency ORDER BY currency`, p)).rows.map((r) => ({ currency: r.currency, booked_value: Number(r.total) }));
    const byWeekday = (await this.db.query<{ weekday: number; bookings: number; guests: number }>(`SELECT extract(isodow FROM date)::int AS weekday, count(*)::int AS bookings, sum(guests)::int AS guests ${live} GROUP BY 1 ORDER BY 1`, p)).rows;
    const byMonth = (await this.db.query<{ month: string; bookings: number; guests: number }>(`SELECT to_char(date, 'YYYY-MM') AS month, count(*)::int AS bookings, sum(guests)::int AS guests ${live} GROUP BY 1 ORDER BY 1`, p)).rows;
    const topListings = (await this.db.query<{ listing_id: string; title: string; bookings: number; guests: number }>(`SELECT listing_id, max(listing_title) AS title, count(*)::int AS bookings, sum(guests)::int AS guests ${live} GROUP BY listing_id ORDER BY guests DESC, listing_id LIMIT 5`, p)).rows;
    const clicks = (await this.db.query<{ n: number }>("SELECT coalesce(sum(clicks), 0)::int AS n FROM org_contact_daily WHERE org_id = $1 AND day BETWEEN $2::date AND $3::date", p)).rows[0]!.n;

    const valid = now.bookings - now.cancelled, validBefore = before.bookings - before.cancelled;
    const cancelRate = now.bookings ? Math.round((now.cancelled / now.bookings) * 1000) / 10 : 0;
    const growth = pct(valid, validBefore);
    const peak = byWeekday.reduce<{ weekday: number; guests: number } | null>((b, r) => (!b || r.guests > b.guests ? r : b), null);

    const findings: string[] = [];
    if (valid === 0) findings.push("No hubo reservas con fecha de servicio en este trimestre.");
    else {
      if (growth === null) findings.push(`Tuviste ${valid} reservas; el trimestre anterior no tuvo ninguna con la que comparar.`);
      else findings.push(`Las reservas ${growth >= 0 ? "subieron" : "bajaron"} un ${Math.abs(growth)} % frente al trimestre anterior (${valid} frente a ${validBefore}).`);
      if (peak) findings.push(`El día con más viajeros fue el ${WEEKDAYS[peak.weekday - 1]} (${peak.guests} personas).`);
      if (now.lead_days !== null) findings.push(`En promedio te reservan con ${now.lead_days} días de anticipación${now.lead_days < 3 ? ": casi todo es de último momento" : ""}.`);
      if (cancelRate >= 15) findings.push(`Se canceló el ${cancelRate} % de las reservas; conviene revisar la política de cancelación o los recordatorios.`);
      if (topListings[0] && now.guests > 0) findings.push(`"${topListings[0].title}" concentró el ${Math.round((topListings[0].guests / now.guests) * 100)} % de los viajeros.`);
      if (clicks > 0) findings.push(`Por cada reserva hubo ${Math.round((clicks / valid) * 10) / 10} clics de contacto (WhatsApp, llamada, ruta o sitio web).`);
    }
    return {
      quarter, range: { from, to }, compared_to: previous, generated_by: "reglas sobre tus datos (sin IA)",
      totals: { bookings: valid, cancelled: now.cancelled, cancellation_rate: cancelRate, guests: now.guests, average_party_size: valid ? Math.round((now.guests / valid) * 10) / 10 : 0, average_lead_days: now.lead_days, contact_clicks: clicks, revenue },
      previous: { bookings: validBefore, guests: before.guests, growth_pct: growth },
      by_month: byMonth, by_weekday: byWeekday.map((r) => ({ ...r, name: WEEKDAYS[r.weekday - 1] })), top_listings: topListings,
      findings,
    };
  }
}
