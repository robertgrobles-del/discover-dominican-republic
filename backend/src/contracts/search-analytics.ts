/** Search-term telemetry owned by analytics. Queries are normalized text without personal data. */
export interface SearchAnalyticsPort {
  recordSearch(query: string, results: number): Promise<void>;
  /** Terms searched at least twice in the last 7 days that returned results, most frequent first. */
  listPopularSearches(limit: number): Promise<string[]>;
}
