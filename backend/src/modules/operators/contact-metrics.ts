import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import type { MailerPort } from "../../contracts/email.js";
import { AppError } from "../../lib/errors.js";
import { claimJobMark } from "../../lib/job-marks.js";
import { addDays, isIsoDate, todayInSantoDomingo } from "./domain/dates.js";

export const CONTACT_CHANNELS = ["whatsapp", "call", "directions", "website"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];
type ChannelCounts = Record<ContactChannel, number>;

const MAX_RANGE_DAYS = 366;
const RD = "AT TIME ZONE 'America/Santo_Domingo'";
const zero = (): ChannelCounts => ({ whatsapp: 0, call: 0, directions: 0, website: 0 });
const money = (currency: string, amount: number) => `${currency === "USD" ? "US$ " : "RD$ "}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Semana completa más reciente (lunes a domingo) anterior a `today`. */
export function previousWeek(today: string): { from: string; to: string } {
  const sinceMonday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const monday = addDays(today, -sinceMonday);
  return { from: addDays(monday, -7), to: addDays(monday, -1) };
}

/**
 * Clics de contacto de un operador (plan de 150 mejoras, puntos 23 y 102). Se guardan como contadores diarios
 * por canal y servicio: no hay sesión, usuario ni IP, así que no hay nada personal que exportar o borrar.
 */
export class ContactMetricsService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly mailer: MailerPort) {}

  /** Suma un clic. Un operador no público o un servicio ajeno no revelan nada: simplemente no se cuenta. */
  async record(slug: string, channel: ContactChannel, listingId?: string, now = new Date()): Promise<boolean> {
    const org = (await this.db.query<{ id: string }>("SELECT id FROM partner_profiles WHERE slug = $1 AND verification = 'verified' AND website_enabled", [slug])).rows[0];
    if (!org) return false;
    const listing = listingId
      ? (await this.db.query<{ id: string }>("SELECT id FROM operator_listings WHERE id = $1 AND org_id = $2 AND status = 'published'", [listingId, org.id])).rows[0]?.id ?? ""
      : "";
    await this.db.query(
      `INSERT INTO org_contact_daily (org_id, listing_id, channel, day, clicks) VALUES ($1, $2, $3, $4::date, 1)
       ON CONFLICT (org_id, listing_id, channel, day) DO UPDATE SET clicks = org_contact_daily.clicks + 1`,
      [org.id, listing, channel, todayInSantoDomingo(now)],
    );
    return true;
  }

  async summary(orgId: string, opts: { from: string; to: string; only?: string[] }) {
    if (!isIsoDate(opts.from) || !isIsoDate(opts.to) || opts.to < opts.from) throw AppError.validation("Rango de fechas inválido");
    if (addDays(opts.from, MAX_RANGE_DAYS) < opts.to) throw AppError.validation(`El rango no puede superar ${MAX_RANGE_DAYS} días`);
    const p: unknown[] = [orgId, opts.from, opts.to, opts.only ?? null];
    const base = "FROM org_contact_daily c WHERE c.org_id = $1 AND c.day BETWEEN $2::date AND $3::date AND ($4::text[] IS NULL OR c.listing_id = ANY($4))";
    const cols = CONTACT_CHANNELS.map((ch) => `coalesce(sum(c.clicks) FILTER (WHERE c.channel = '${ch}'), 0)::int AS ${ch}`).join(", ");
    const pick = (r: Record<string, unknown>): ChannelCounts => ({ whatsapp: Number(r.whatsapp), call: Number(r.call), directions: Number(r.directions), website: Number(r.website) });
    const withTotal = (c: ChannelCounts) => ({ ...c, total: c.whatsapp + c.call + c.directions + c.website });

    const totals = pick((await this.db.query(`SELECT ${cols} ${base}`, p)).rows[0] ?? zero());
    const byDay = (await this.db.query(`SELECT c.day::text AS day, ${cols} ${base} GROUP BY c.day ORDER BY c.day`, p)).rows;
    const byListing = (await this.db.query(
      `SELECT c.listing_id, (SELECT l.title FROM operator_listings l WHERE l.id = c.listing_id) AS title, ${cols} ${base} GROUP BY c.listing_id ORDER BY sum(c.clicks) DESC, c.listing_id`, p,
    )).rows;
    return {
      range: { from: opts.from, to: opts.to },
      totals: withTotal(totals),
      by_day: byDay.map((r) => ({ day: r.day as string, ...withTotal(pick(r)) })),
      by_listing: byListing.map((r) => ({ listing_id: (r.listing_id as string) || null, title: (r.title as string | null) ?? (r.listing_id ? null : "Sitio del operador"), ...withTotal(pick(r)) })),
    };
  }

  async weeklyReportEnabled(orgId: string): Promise<boolean> {
    return (await this.db.query<{ on: boolean }>("SELECT weekly_report_enabled AS on FROM partner_profiles WHERE id = $1", [orgId])).rows[0]?.on ?? false;
  }
  async setWeeklyReport(orgId: string, enabled: boolean): Promise<void> {
    await this.db.query("UPDATE partner_profiles SET weekly_report_enabled = $2 WHERE id = $1", [orgId, enabled]);
  }

  /**
   * Envía a cada operador verificado el resumen de la última semana completa, una sola vez por semana.
   * Quien no tuvo reservas ni clics no recibe correo: un reporte vacío cada lunes es ruido.
   */
  async sendWeeklyReports(now = new Date()): Promise<{ week: string; sent: number }> {
    const { from, to } = previousWeek(todayInSantoDomingo(now));
    const inWeek = `b.created_at >= ($1::date::timestamp ${RD}) AND b.created_at < (($2::date + 1)::timestamp ${RD})`;
    const { rows } = await this.db.query<{ id: string; business_name: string; email: string; bookings: number } & ChannelCounts>(
      `SELECT * FROM (
         SELECT p.id, p.business_name, p.email,
                (SELECT count(*)::int FROM bookings b WHERE b.org_id = p.id AND b.status <> 'cancelled' AND ${inWeek}) AS bookings,
                ${CONTACT_CHANNELS.map((ch) => `(SELECT coalesce(sum(c.clicks), 0)::int FROM org_contact_daily c WHERE c.org_id = p.id AND c.channel = '${ch}' AND c.day BETWEEN $1::date AND $2::date) AS ${ch}`).join(",\n                ")}
           FROM partner_profiles p
          WHERE p.verification = 'verified' AND p.weekly_report_enabled
            AND NOT EXISTS (SELECT 1 FROM job_marks m WHERE m.key = 'weekly_report:' || p.id || ':' || $1)
       ) t WHERE bookings + whatsapp + call + directions + website > 0 ORDER BY id LIMIT 500`, [from, to],
    );
    let sent = 0;
    for (const o of rows) {
      if (!(await claimJobMark(this.db, `weekly_report:${o.id}:${from}`))) continue; // otra instancia ya lo envió
      const revenue = (await this.db.query<{ currency: string; total: string }>(
        `SELECT b.currency, sum(b.total_price) AS total FROM bookings b WHERE b.org_id = $3 AND b.status <> 'cancelled' AND ${inWeek} GROUP BY b.currency ORDER BY b.currency`, [from, to, o.id],
      )).rows;
      await this.mailer.send({
        to: o.email, template: "operator.weekly_report", locale: "es",
        data: {
          operator: o.business_name, period: `${from} – ${to}`, bookings: o.bookings,
          revenue: revenue.length ? revenue.map((r) => money(r.currency, Number(r.total))).join(" · ") : "—",
          whatsapp: o.whatsapp, calls: o.call, directions: o.directions, website: o.website,
          url: `${this.env.WEB_BASE_URL}/operadores/panel/reportes`,
        },
      });
      sent++;
    }
    return { week: from, sent };
  }
}
