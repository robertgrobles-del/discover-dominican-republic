import type { SearchAnalyticsPort } from "../../contracts/search-analytics.js";
import type { Db } from "../../db/pool.js";

/** PostgreSQL adapter for search-term telemetry stored in `analytics_events`. */
export class PostgresSearchAnalytics implements SearchAnalyticsPort {
  constructor(private readonly db: Db) {}

  async recordSearch(query: string, results: number): Promise<void> {
    await this.db.query("INSERT INTO analytics_events (event_type, page, metadata) VALUES ('search', '/search', $1)", [JSON.stringify({ q: query, results })]);
  }

  async listPopularSearches(limit: number): Promise<string[]> {
    // Sólo búsquedas que observó el servidor (`recordSearch`: sin sesión). Las que reporta el cliente por la ingesta anónima
    // (siempre con `session_id`) traen texto y conteo elegidos por quien llama y no deben publicarse en una lista pública.
    // El conteo de resultados se lee con guardia de tipo: un valor no entero nunca rompe la consulta.
    const { rows } = await this.db.query<{ q: string; n: number }>(
      "SELECT metadata->>'q' AS q, count(*)::int AS n FROM analytics_events WHERE event_type = 'search' AND session_id IS NULL AND created_at > now() - interval '7 days' AND (CASE WHEN jsonb_typeof(metadata->'results') = 'number' AND (metadata->>'results') ~ '^[0-9]{1,9}$' THEN (metadata->>'results')::int ELSE 0 END) > 0 GROUP BY 1 HAVING count(*) >= 2 ORDER BY 2 DESC, 1 LIMIT $1",
      [limit],
    );
    return rows.map((row) => row.q);
  }
}
