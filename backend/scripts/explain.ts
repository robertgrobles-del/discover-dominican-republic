// EXPLAIN (ANALYZE, BUFFERS) de las consultas más representativas de la API pública (B7.63): sirve para revisar
// planes antes y después de tocar índices o datos. Los tiempos en caliente se miden con /metrics y
// `npm run loadtest -- --assert`.
//
//   npm run db:explain                        (usa DATABASE_URL, o el Postgres local del puerto 5434)
//   npm run db:explain -- --db postgres://…
//
// Las consultas llevan literales incrustadas (nada de entrada externa) y son de sólo lectura.
import pg from "pg";

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const URL = arg("db") ?? process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd";

const QUERIES: { name: string; sql: string }[] = [
  { name: "listado paginado (orden por updated_at)", sql: `SELECT id FROM destinations WHERE status = 'published' AND deleted_at IS NULL ORDER BY updated_at DESC, id LIMIT 24` },
  { name: "conteo para la paginación", sql: `SELECT count(*)::int AS n FROM destinations WHERE status = 'published' AND deleted_at IS NULL` },
  { name: "búsqueda LIKE con trigram", sql: `SELECT id, name FROM beaches WHERE status = 'published' AND deleted_at IS NULL AND lower(f_unaccent(name::text)) LIKE '%playa%' ORDER BY name LIMIT 10` },
  { name: "búsqueda multi-colección (UNION ALL)", sql: `SELECT * FROM (
      (SELECT 'destination'::text AS type, id FROM destinations WHERE status = 'published' AND deleted_at IS NULL AND lower(f_unaccent(name::text)) LIKE '%playa%' ESCAPE '\\' LIMIT 10)
      UNION ALL
      (SELECT 'beach'::text, id FROM beaches WHERE status = 'published' AND deleted_at IS NULL AND lower(f_unaccent(name::text)) LIKE '%playa%' ESCAPE '\\' LIMIT 10)
      UNION ALL
      (SELECT 'hotel'::text, id FROM hotels WHERE status = 'published' AND deleted_at IS NULL AND lower(f_unaccent(name::text)) LIKE '%playa%' ESCAPE '\\' LIMIT 10)
    ) u` },
  { name: "faceta (GROUP BY, sin el propio campo del filtro)", sql: `SELECT status::text AS value, count(*)::int AS count FROM destinations WHERE deleted_at IS NULL AND status IS NOT NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 50` },
  { name: "mapa por bbox", sql: `SELECT id FROM beaches WHERE status = 'published' AND deleted_at IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL AND longitude BETWEEN -72.0 AND -68.0 AND latitude BETWEEN 18.0 AND 19.9 ORDER BY rating DESC NULLS LAST, id LIMIT 500` },
  { name: "cerca de mí (haversine, 20 km)", sql: `SELECT id, name, (2 * 6371000 * asin(sqrt(power(sin(radians((latitude - 18.4861) / 2)), 2) + cos(radians(18.4861)) * cos(radians(latitude)) * power(sin(radians((-69.9312 - longitude) / 2)), 2)))) AS distance_m
     FROM beaches
     WHERE status = 'published' AND deleted_at IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL
       AND (2 * 6371000 * asin(sqrt(power(sin(radians((latitude - 18.4861) / 2)), 2) + cos(radians(18.4861)) * cos(radians(latitude)) * power(sin(radians((-69.9312 - longitude) / 2)), 2)))) <= 20000
     ORDER BY distance_m LIMIT 20` },
  { name: "búsquedas frecuentes (analytics, 7 días)", sql: `SELECT metadata->>'q' AS q, count(*)::int AS n FROM analytics_events WHERE event_type = 'search' AND created_at > now() - interval '7 days' AND coalesce((metadata->>'results')::int, 0) > 0 GROUP BY 1 HAVING count(*) >= 2 ORDER BY 2 DESC, 1 LIMIT 10` },
];

async function main() {
  const pool = new pg.Pool({ connectionString: URL, max: 1 });
  try {
    console.log(`EXPLAIN (ANALYZE, BUFFERS) sobre ${URL.replace(/:[^:@/]+@/, ":***@")}`);
    for (const { name, sql } of QUERIES) {
      console.log(`\n══ ${name}`);
      try {
        const { rows } = await pool.query<{ "QUERY PLAN": string }>(`EXPLAIN (ANALYZE, BUFFERS) ${sql}`);
        for (const r of rows) console.log(r["QUERY PLAN"]);
      } catch (e) { console.log(`  (no se pudo explicar: ${(e as Error).message})`); }
    }
  } finally { await pool.end(); }
}

main().catch((e) => { console.error(e); process.exit(1); });
