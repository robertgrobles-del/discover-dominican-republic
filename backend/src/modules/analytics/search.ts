import type { SearchAnalyticsPort } from "../../contracts/search-analytics.js";
import type { Db } from "../../db/pool.js";

/** PostgreSQL adapter for search-term telemetry stored in `analytics_events`. */
export class PostgresSearchAnalytics implements SearchAnalyticsPort {
  constructor(private readonly db: Db) {}

  async recordSearch(query: string, results: number): Promise<void> {
    await this.db.query("INSERT INTO analytics_events (event_type, page, metadata) VALUES ('search', '/search', $1)", [JSON.stringify({ q: query, results })]);
  }

  async listPopularSearches(limit: number): Promise<string[]> {
    const { rows } = await this.db.query<{ q: string; n: number }>(
      "SELECT metadata->>'q' AS q, count(*)::int AS n FROM analytics_events WHERE event_type = 'search' AND created_at > now() - interval '7 days' AND coalesce((metadata->>'results')::int, 0) > 0 GROUP BY 1 HAVING count(*) >= 2 ORDER BY 2 DESC, 1 LIMIT $1",
      [limit],
    );
    return rows.map((row) => row.q);
  }
}
