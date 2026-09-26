// Prueba de carga: levanta la API en este proceso sobre una base propia (descubre_rd_load), la llena con los datos del mock más
// volumen sintético, y mide latencia y errores de las rutas más usadas con autocannon.
//
//   npm run loadtest                       (8 s por escenario, 40 conexiones)
//   npm run loadtest -- --duration 20 --connections 100 --assert
//
// Con --assert el proceso termina con error si algún escenario supera su umbral de p99 o tiene errores (para CI o antes de un despliegue).
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import autocannon from "autocannon";
import pg from "pg";
import { buildApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { migrate } from "../src/db/migrator.js";

const arg = (name: string, def: string) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] ?? def : def; };
const flag = (name: string) => process.argv.includes(`--${name}`);
const DURATION = Number(arg("duration", "8"));
const CONNECTIONS = Number(arg("connections", "40"));
const ADMIN_URL = arg("admin-url", "postgres://postgres:postgres@localhost:5434/postgres");
const DB_URL = arg("db", "postgres://postgres:postgres@localhost:5434/descubre_rd_load");
const DB_NAME = new URL(DB_URL).pathname.slice(1);
const SKIP_SETUP = flag("skip-setup");
const BULK = Number(arg("bulk", "300000"));            // eventos de analítica; el resto del volumen sale de esta cifra

const q = async (pool: pg.Pool, sql: string, p: unknown[] = []) => (await pool.query(sql, p)).rows;

async function prepare() {
  const admin = new pg.Pool({ connectionString: ADMIN_URL, max: 1 });
  try { if (!(await q(admin, "SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME])).length) await admin.query(`CREATE DATABASE "${DB_NAME}" ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'`); }
  finally { await admin.end(); }
  const pool = new pg.Pool({ connectionString: DB_URL, max: 4 });
  console.log("· Migrando el esquema…");
  await migrate(pool, { reset: true });
  console.log("· Sembrando los datos del mock…");
  const seed = spawnSync("npx", ["tsx", "scripts/seed-from-mock.ts"], { env: { ...process.env, DATABASE_URL: DB_URL }, shell: true, encoding: "utf8" });
  if (seed.status !== 0) throw new Error(`Falló el sembrado:\n${seed.stdout}\n${seed.stderr}`);
  console.log(`· Volumen sintético (${BULK.toLocaleString()} eventos de analítica y su proporción de usuarios, reseñas y XP)…`);
  const users = Math.max(200, Math.round(BULK / 100));
  await pool.query(`INSERT INTO users (id, email, password_hash, status, email_verified_at) SELECT gen_random_uuid(), 'carga' || g || '@load.test', 'x', 'active', now() FROM generate_series(1, $1) g`, [users]);
  await pool.query(`INSERT INTO profiles (id, display_name) SELECT id, 'Persona ' || row_number() OVER () FROM users WHERE email LIKE 'carga%@load.test' ON CONFLICT DO NOTHING`);
  await pool.query(`INSERT INTO user_gamification (id, user_id, total_xp, coins, current_level) SELECT gen_random_uuid(), id, (random() * 8000)::int, (random() * 500)::int, 1 + (random() * 9)::int FROM users WHERE email LIKE 'carga%@load.test' ON CONFLICT (user_id) DO NOTHING`);
  await pool.query(`INSERT INTO gamification_transactions (id, user_id, transaction_type, xp_amount, coin_amount, action, created_at) SELECT gen_random_uuid(), u.id, 'earn', 10, 1, 'daily_checkin', now() - (random() * 60 || ' days')::interval FROM (SELECT id FROM users WHERE email LIKE 'carga%@load.test') u, generate_series(1, $1) g`, [Math.max(20, Math.round(BULK / users))]);
  await pool.query(`INSERT INTO analytics_events (event_type, page, session_id, created_at, country, source) SELECT (ARRAY['page_view','page_view','page_view','search','click','favorite'])[1 + (random() * 5)::int], '/' || (ARRAY['destinos','hoteles','playas','restaurantes','experiencias','mapa','tienda'])[1 + (random() * 6)::int], 's' || (random() * ${Math.max(1000, Math.round(BULK / 6))})::int, now() - (random() * 90 || ' days')::interval, (ARRAY['DO','US','ES','FR','DE','CA'])[1 + (random() * 5)::int], (ARRAY['google.com','instagram.com','direct'])[1 + (random() * 2)::int] FROM generate_series(1, $1)`, [BULK]);
  await pool.query("ANALYZE");
  const sizes = await q(pool, "SELECT relname AS t, n_live_tup::int AS rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 5");
  console.log("  tablas más grandes:", sizes.map((s) => `${s.t}=${Number(s.rows).toLocaleString()}`).join(", "));
  return pool;
}

interface Scenario { name: string; method?: "GET" | "POST"; path: string; body?: unknown; headers?: Record<string, string>; connections?: number; p99: number }

async function main() {
  const pool = SKIP_SETUP ? new pg.Pool({ connectionString: DB_URL, max: 4 }) : await prepare();
  const env = loadEnv({ NODE_ENV: "development", DATABASE_URL: DB_URL, RATE_LIMIT_MAX: "100000000", AUTH_RATE_LIMIT_ENABLED: "false", JOBS_ENABLED: "false", MAIL_WORKER_ENABLED: "false", LOG_LEVEL: "error", PORT: "3999", REQUIRE_2FA_FOR_STAFF: "false" } as unknown as NodeJS.ProcessEnv);
  const app = await buildApp({ env });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const base = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;

  const dest = (await q(pool, "SELECT slug FROM destinations WHERE status = 'published' LIMIT 1"))[0]?.slug as string | undefined;
  const hotel = (await q(pool, "SELECT slug FROM hotels WHERE status = 'published' LIMIT 1"))[0]?.slug as string | undefined;
  // Un usuario real para las rutas autenticadas.
  const email = "carga-login@load.test", password = "Correcta-Clave-2026!";
  await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password, accept_terms: true } });   // en una repetición ya existe
  const admin = (await q(pool, "SELECT id FROM users WHERE email = $1", [email]))[0]!.id as string;
  await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING", [admin]);
  const token = JSON.parse((await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password } })).body).data.tokens.access_token as string;
  const auth = { authorization: `Bearer ${token}` };
  const adminTok = JSON.parse((await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password } })).body).data.tokens.access_token as string;
  const adm = { authorization: `Bearer ${adminTok}` };

  const S: Scenario[] = [
    { name: "health", path: "/api/v1/health", p99: 50 },
    { name: "lista de destinos", path: "/api/v1/destinations?per_page=24", p99: 250 },
    ...(dest ? [{ name: "detalle de destino", path: `/api/v1/destinations/${dest}`, p99: 250 }] : []),
    ...(hotel ? [{ name: "detalle de hotel", path: `/api/v1/hotels/${hotel}`, p99: 250 }] : []),
    { name: "filtro de hoteles", path: "/api/v1/hotels?per_page=24&sort=-rating", p99: 300 },
    { name: "búsqueda global", path: "/api/v1/search?q=playa&limit=20", p99: 400 },
    { name: "autocompletado", path: "/api/v1/search/suggest?q=pun", p99: 200 },
    { name: "portada personalizada", path: "/api/v1/recommendations/home", headers: auth, p99: 500 },
    { name: "mapa (capa de playas)", path: "/api/v1/map/features?layer=beaches", p99: 400 },
    { name: "cerca de mí", path: "/api/v1/geo/nearby?lat=18.58&lng=-68.4&radius=20000", p99: 400 },
    { name: "tienda: catálogo", path: "/api/v1/store/products?per_page=24", p99: 250 },
    { name: "marketplace: catálogo", path: "/api/v1/marketplace/products?per_page=24", p99: 250 },
    { name: "ranking de jugadores", path: "/api/v1/gamification/leaderboard?scope=all&limit=50", p99: 400 },
    { name: "mi perfil de juego", path: "/api/v1/gamification/me", headers: auth, p99: 300 },
    { name: "panel de analítica (30 días)", path: "/api/v1/admin/analytics/overview", headers: adm, p99: 1500, connections: 10 },
    { name: "login (argon2)", method: "POST", path: "/api/v1/auth/login", body: { email, password }, p99: 1500, connections: 8 },
    { name: "evento de analítica", method: "POST", path: "/api/v1/analytics/events", body: { events: [{ type: "page_view", page: "/destinos", session_id: "carga-sesion-1" }], consent: true }, p99: 200 },
  ];

  const results: { name: string; rps: number; p50: number; p97: number; p99: number; max: number; errors: number; non2xx: number; ok: boolean; limit: number; status: string }[] = [];
  console.log(`\nAPI en ${base} · ${DURATION} s por escenario · ${CONNECTIONS} conexiones (salvo lo indicado)\n`);
  for (const s of S) {
    const r = await autocannon({ url: base + s.path, method: s.method ?? "GET", connections: s.connections ?? CONNECTIONS, duration: DURATION, headers: { "content-type": "application/json", ...(s.headers ?? {}) }, body: s.body ? JSON.stringify(s.body) : undefined });
    const bad = r.non2xx + r.errors + r.timeouts;
    const ok = r.latency.p99 <= s.p99 && bad === 0;
    const sample = ok ? "" : (await app.inject({ method: s.method ?? "GET", url: s.path, headers: s.headers, payload: s.body as never })).statusCode;
    results.push({ name: s.name, rps: Math.round(r.requests.average), p50: r.latency.p50, p97: r.latency.p97_5, p99: r.latency.p99, max: r.latency.max, errors: r.errors + r.timeouts, non2xx: r.non2xx, ok, limit: s.p99, status: ok ? "ok" : `revisar (${sample})` });
    console.log(`${ok ? "✓" : "✗"} ${s.name.padEnd(30)} ${String(Math.round(r.requests.average)).padStart(6)} req/s  p50 ${String(r.latency.p50).padStart(4)} ms  p99 ${String(r.latency.p99).padStart(5)} ms (límite ${s.p99})  errores ${bad}`);
  }
  writeFileSync("loadtest-report.json", JSON.stringify({ at: new Date().toISOString(), duration: DURATION, connections: CONNECTIONS, results }, null, 2));
  await app.close();
  await pool.end();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${failed.length ? `${failed.length} escenario(s) fuera de umbral` : "Todos los escenarios dentro de sus umbrales"} · informe en loadtest-report.json`);
  if (flag("assert") && failed.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
