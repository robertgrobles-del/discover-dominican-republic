import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import pg from "pg";
import { loadWeatherConfig } from "./config.js";
import { PostgresWeatherRepository } from "../../src/modules/weather/repository.js";
import { WeatherService } from "../../src/modules/weather/service.js";
import { weatherPublicRoutes } from "../../src/modules/weather/public-routes.js";
import { bindRequestId } from "../../src/lib/request-context.js";
import { registerErrorHandling } from "../../src/plugins/errors.js";
import { registerEtag } from "../../src/plugins/etag.js";
import { startWeatherRefreshScheduler } from "./scheduler.js";
import { weatherInternalAdminRoutes } from "./admin-routes.js";

const config = loadWeatherConfig();
const pool = new pg.Pool({
  connectionString: config.WEATHER_DATABASE_URL,
  max: config.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 15_000,
  application_name: "descubre-weather-service",
});
pool.on("error", (err) => console.error("[weather-db] Error en cliente inactivo:", err.message));

const app = Fastify({ logger: { level: config.LOG_LEVEL, redact: ["req.headers.authorization", "req.headers.cookie"] }, requestIdHeader: "x-request-id", genReqId: () => randomUUID(), bodyLimit: 1_048_576 }).withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await app.register(helmet);
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
const weather = new WeatherService(
  new PostgresWeatherRepository(pool),
  { WEATHER_PROVIDER: config.WEATHER_PROVIDER, OPENWEATHER_API_KEY: config.OPENWEATHER_API_KEY },
  app.log,
);
app.decorate("weather", weather);
let stopScheduler: () => Promise<void> = async () => undefined;
app.addHook("onClose", async () => { await stopScheduler(); await pool.end(); });
app.addHook("onRequest", async (request) => { bindRequestId(request.id); });
app.addHook("onSend", async (request, reply) => { reply.header("x-request-id", request.id); });
registerErrorHandling(app);
registerEtag(app);

if (config.DOCS_ENABLED) {
  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: { title: "Descubre RD Weather API", version: "1.0.0", description: "Contrato público del servicio de clima y pronóstico." },
      tags: [{ name: "datos vivos", description: "Clima actual, pronóstico y ubicaciones disponibles" }],
    },
    transform: jsonSchemaTransform,
  });
}

app.get("/health/live", async () => ({ status: "ok" }));
app.get("/health/ready", async (_request, reply) => {
  try {
    await pool.query("SELECT 1");
    const schema = (await pool.query<{ snapshots: string | null; nonces: string | null; migrations: string | null }>(
      "SELECT to_regclass('public.weather_snapshots')::text AS snapshots, to_regclass('public.weather_internal_nonces')::text AS nonces, to_regclass('public.weather_schema_migrations')::text AS migrations",
    )).rows[0]!;
    if (!schema.snapshots || !schema.nonces || !schema.migrations) throw new Error("Migraciones weather pendientes");
    const current = await pool.query("SELECT 1 FROM public.weather_schema_migrations WHERE name = '001_weather_snapshots.sql'");
    if (!current.rowCount) throw new Error("Migración inicial weather no registrada");
    return { status: "ready" };
  } catch {
    reply.code(503);
    return { status: "unavailable" };
  }
});
await app.register(weatherPublicRoutes);
await weatherInternalAdminRoutes(app, pool, config);
if (config.DOCS_ENABLED) {
  await app.register(swaggerUi, { routePrefix: "/docs" });
  app.get("/openapi.json", { schema: { hide: true } }, async () => app.swagger());
}

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Cerrando servicio weather");
  await app.close();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
  if (config.WEATHER_REFRESH_ENABLED) {
    stopScheduler = await startWeatherRefreshScheduler(pool, weather, app.log, config.WEATHER_REFRESH_INTERVAL_SECONDS);
  }
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
