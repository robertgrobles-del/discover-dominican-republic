import type { Db } from "../../db/pool.js";
import type { NotificationInput } from "../../contracts/notifications.js";

/** Umbral por omisión; el equipo lo ajusta con el ajuste `analytics.bounce_alert` ({ threshold_pct, min_sessions }). */
const DEFAULTS = { threshold_pct: 70, min_sessions: 50 };
const RD = "AT TIME ZONE 'America/Santo_Domingo'";
const IN_RANGE = `created_at >= ($1::date::timestamp ${RD}) AND created_at < (($2::date + 1)::timestamp ${RD})`;
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

export interface BounceSettings { threshold_pct: number; min_sessions: number }

/**
 * Tasa de rebote (plan de 150 mejoras, punto 106): de las sesiones que vieron alguna página, cuántas
 * se fueron tras un único evento. Todo es agregado: de aquí no sale ninguna sesión individual.
 */
export class BounceService {
  constructor(private readonly db: Db) {}

  async settings(): Promise<BounceSettings> {
    const v = (await this.db.query<{ value: unknown }>("SELECT value FROM site_settings WHERE key = 'analytics.bounce_alert'")).rows[0]?.value as Partial<BounceSettings> | undefined;
    const num = (x: unknown, min: number, max: number, fallback: number) => (typeof x === "number" && x >= min && x <= max ? x : fallback);
    return { threshold_pct: num(v?.threshold_pct, 1, 100, DEFAULTS.threshold_pct), min_sessions: num(v?.min_sessions, 1, 1_000_000, DEFAULTS.min_sessions) };
  }

  async report(from: string, to: string) {
    const settings = await this.settings();
    // Una sesión cuenta en cada día en que vio una página; rebota si ese día sólo dejó ese evento.
    const perSession = `SELECT (created_at ${RD})::date AS day, session_id, count(*) AS events,
                               (array_agg(page ORDER BY created_at) FILTER (WHERE event_type = 'page_view'))[1] AS landing
                          FROM analytics_events WHERE ${IN_RANGE} AND session_id IS NOT NULL
                         GROUP BY 1, 2 HAVING count(*) FILTER (WHERE event_type = 'page_view') > 0`;
    const byDay = (await this.db.query<{ day: string; sessions: number; bounced: number }>(
      `SELECT day::text AS day, count(*)::int AS sessions, count(*) FILTER (WHERE events = 1)::int AS bounced FROM (${perSession}) s GROUP BY day ORDER BY day`, [from, to],
    )).rows;
    const byPage = (await this.db.query<{ page: string; sessions: number; bounced: number }>(
      `SELECT landing AS page, count(*)::int AS sessions, count(*) FILTER (WHERE events = 1)::int AS bounced FROM (${perSession}) s
        WHERE landing IS NOT NULL GROUP BY landing HAVING count(*) >= 5 ORDER BY bounced DESC, landing LIMIT 20`, [from, to],
    )).rows;
    const sessions = byDay.reduce((n, d) => n + d.sessions, 0), bounced = byDay.reduce((n, d) => n + d.bounced, 0);
    const rate = pct(bounced, sessions);
    return {
      range: { from, to }, sessions, bounced, bounce_rate: rate, ...settings,
      alert: sessions >= settings.min_sessions && rate > settings.threshold_pct,
      daily: byDay.map((d) => ({ ...d, bounce_rate: pct(d.bounced, d.sessions) })),
      landing_pages: byPage.map((p) => ({ ...p, bounce_rate: pct(p.bounced, p.sessions) })),
    };
  }

  /** Avisa al equipo, una sola vez por día evaluado, si el rebote de ese día superó el umbral con tráfico suficiente. */
  async alertFor(day: string, notifyStaff: (n: NotificationInput) => Promise<void>) {
    const r = await this.report(day, day);
    const result = { day, sessions: r.sessions, bounce_rate: r.bounce_rate, threshold_pct: r.threshold_pct, alerted: false };
    if (!r.alert) return result;
    const mark = await this.db.query("INSERT INTO job_marks (key) VALUES ($1) ON CONFLICT DO NOTHING", [`bounce_alert:${day}`]);
    if (!mark.rowCount) return result;
    const worst = r.landing_pages[0];
    await notifyStaff({
      type: "system", title: `Tasa de rebote alta: ${r.bounce_rate} % el ${day}`,
      message: `Superó el umbral de ${r.threshold_pct} % con ${r.sessions} sesiones.${worst ? ` La entrada con más rebotes fue ${worst.page} (${worst.bounce_rate} %).` : ""}`,
      link: "/admin?tab=analytics", data: { day, bounce_rate: r.bounce_rate, sessions: r.sessions, threshold_pct: r.threshold_pct },
    });
    return { ...result, alerted: true };
  }
}
