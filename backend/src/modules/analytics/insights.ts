import type { Db } from "../../db/pool.js";

const RD = "AT TIME ZONE 'America/Santo_Domingo'";
const inRange = (col: string) => `${col} >= ($1::date::timestamp ${RD}) AND ${col} < (($2::date + 1)::timestamp ${RD})`;
/** Una reseña de alguien con sello de Pasaporte pesa el doble: hay evidencia de que estuvo de visita. */
const VERIFIED_WEIGHT = 2;
const HEATMAP_EVENTS = ["page_view", "click", "outbound_link", "favorite", "share"] as const;
export type HeatmapMetric = (typeof HEATMAP_EVENTS)[number] | "all";
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Reportes agregados para el equipo (plan de 150 mejoras, puntos 112 y 115). Nada de aquí identifica a una persona. */
export class InsightsService {
  constructor(private readonly db: Db) {}

  /**
   * Índice de satisfacción de 0 a 100: promedio de las reseñas aprobadas del rango, donde las de visitantes
   * con sello de Pasaporte Digital pesan el doble. Las reseñas sintéticas de demostración no cuentan.
   */
  async satisfaction(from: string, to: string) {
    const scored = `SELECT r.entity_type, r.rating, to_char(r.created_at ${RD}, 'YYYY-MM') AS month,
                           EXISTS (SELECT 1 FROM passport_stamps s WHERE s.user_id = r.user_id) AS verified
                      FROM reviews r WHERE r.status = 'approved' AND NOT r.is_synthetic AND ${inRange("r.created_at")}`;
    const cols = `count(*)::int AS reviews, count(*) FILTER (WHERE verified)::int AS verified_reviews, avg(rating) AS avg_rating,
                  avg(rating) FILTER (WHERE verified) AS avg_verified,
                  sum(rating * CASE WHEN verified THEN ${VERIFIED_WEIGHT} ELSE 1 END)::float / nullif(sum(5 * CASE WHEN verified THEN ${VERIFIED_WEIGHT} ELSE 1 END), 0) * 100 AS idx`;
    type Row = { reviews: number; verified_reviews: number; avg_rating: string | null; avg_verified: string | null; idx: number | null };
    const shape = (r: Row) => ({
      reviews: r.reviews, verified_reviews: r.verified_reviews,
      average_rating: r.avg_rating === null ? null : Math.round(Number(r.avg_rating) * 100) / 100,
      average_verified_rating: r.avg_verified === null ? null : Math.round(Number(r.avg_verified) * 100) / 100,
      index: r.idx === null ? null : round1(r.idx),
    });
    const total = (await this.db.query<Row>(`SELECT ${cols} FROM (${scored}) t`, [from, to])).rows[0]!;
    const byType = (await this.db.query<Row & { entity_type: string }>(`SELECT entity_type, ${cols} FROM (${scored}) t GROUP BY entity_type ORDER BY count(*) DESC, entity_type`, [from, to])).rows;
    const byMonth = (await this.db.query<Row & { month: string }>(`SELECT month, ${cols} FROM (${scored}) t GROUP BY month ORDER BY month`, [from, to])).rows;
    return {
      range: { from, to }, ...shape(total), verified_weight: VERIFIED_WEIGHT,
      by_entity_type: byType.map((r) => ({ entity_type: r.entity_type, ...shape(r) })),
      by_month: byMonth.map((r) => ({ month: r.month, ...shape(r) })),
    };
  }

  /** Actividad por día de la semana (1 = lunes) y hora de Santo Domingo, opcionalmente sólo bajo un prefijo de página. */
  async heatmap(from: string, to: string, metric: HeatmapMetric, pagePrefix?: string) {
    const types = metric === "all" ? [...HEATMAP_EVENTS] : [metric];
    const { rows } = await this.db.query<{ weekday: number; hour: number; events: number; sessions: number }>(
      `SELECT extract(isodow FROM created_at ${RD})::int AS weekday, extract(hour FROM created_at ${RD})::int AS hour, count(*)::int AS events, count(DISTINCT session_id)::int AS sessions
         FROM analytics_events WHERE ${inRange("created_at")} AND event_type = ANY($3::text[]) AND ($4::text IS NULL OR starts_with(page, $4))
        GROUP BY 1, 2 ORDER BY 1, 2`, [from, to, types, pagePrefix ?? null],
    );
    const peak = rows.reduce<{ weekday: number; hour: number; events: number } | null>((best, r) => (!best || r.events > best.events ? { weekday: r.weekday, hour: r.hour, events: r.events } : best), null);
    return { range: { from, to }, metric, page_prefix: pagePrefix ?? null, total_events: rows.reduce((n, r) => n + r.events, 0), peak, cells: rows };
  }
}

export const HEATMAP_METRICS = [...HEATMAP_EVENTS, "all"] as const;
