import type { FastifyBaseLogger } from "fastify";
import type { Pool, PoolClient } from "pg";
import type { WeatherService } from "../../src/modules/weather/service.js";

/** Lease de liderazgo; el repository usa otro lock por ejecución para coordinar también el refresh manual. */
const WEATHER_REFRESH_LOCK = 7_271_002;

/** Agenda refresh sin solapamiento y con advisory lock para tener un único worker por base. */
export async function startWeatherRefreshScheduler(
  pool: Pool,
  weather: WeatherService,
  log: FastifyBaseLogger,
  intervalSeconds: number,
): Promise<() => Promise<void>> {
  const lockClient: PoolClient = await pool.connect();
  const { rows } = await lockClient.query<{ acquired: boolean }>("SELECT pg_try_advisory_lock($1) AS acquired", [WEATHER_REFRESH_LOCK]);
  if (!rows[0]?.acquired) {
    lockClient.release();
    log.info("Otra instancia posee el lock del scheduler weather; no se inicia un segundo worker");
    return async () => undefined;
  }

  let stopped = false;
  let timer: NodeJS.Timeout | undefined;
  let running: Promise<void> | undefined;

  const schedule = () => {
    if (stopped) return;
    timer = setTimeout(() => { void run(); }, intervalSeconds * 1000);
    timer.unref();
  };
  const run = async () => {
    if (stopped || running) return;
    running = (async () => {
      try {
        const result = await weather.refreshWeather();
        log.info({ result }, "Refresh meteorológico completado");
      } catch (err) {
        log.error({ err }, "Falló el refresh meteorológico");
      }
    })();
    try { await running; } finally { running = undefined; schedule(); }
  };

  log.info({ intervalSeconds }, "Scheduler weather iniciado; primera actualización inmediata");
  void run();
  return async () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    await running?.catch(() => undefined);
    try { await lockClient.query("SELECT pg_advisory_unlock($1)", [WEATHER_REFRESH_LOCK]); }
    finally { lockClient.release(); }
  };
}
