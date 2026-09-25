import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { tableAdminRoutes, type TableCfg } from "../admin/tables.js";
import type { JobRunner } from "../jobs/runner.js";
import { audit } from "../operators/team.js";
import { FX_CURRENCIES, TIME_ZONES, WEATHER_LOCATIONS, LiveService } from "./service.js";

declare module "fastify" { interface FastifyInstance { live: LiveService } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const CURRENCIES = ["DOP", ...FX_CURRENCIES] as [string, ...string[]];

/** Tablas de datos vivos que el equipo edita a mano (o que un proveedor sobreescribe). */
const LIVE_TABLES: TableCfg[] = [
  { table: "exchange_rates", pk: "id", readonly: ["id", "created_at"], order: "rate_date DESC, currency_code", label: "Tasas de cambio", check: (d) => { if (d.buy_rate !== undefined && d.sell_rate !== undefined && Number(d.sell_rate) < Number(d.buy_rate)) throw AppError.validation("La tasa de venta no puede ser menor que la de compra"); } },
  { table: "fuel_prices", pk: "id", readonly: ["id", "created_at"], order: "effective_date DESC", label: "Precios de combustibles" },
  { table: "lotteries", pk: "id", readonly: ["id", "created_at", "updated_at"], order: "name", label: "Loterías" },
  { table: "lottery_draws", pk: "id", readonly: ["id", "created_at", "updated_at"], order: "name", label: "Sorteos" },
  { table: "lottery_results", pk: "id", readonly: ["id", "created_at", "updated_at"], order: "draw_date DESC", label: "Resultados de lotería" },
  { table: "weather_alerts", pk: "id", readonly: ["id", "created_at"], order: "created_at DESC", label: "Alertas meteorológicas" },
  { table: "weather_snapshots", pk: "id", readonly: ["id", "updated_at"], order: "location_name", label: "Clima por ciudad" },
  { table: "marine_reports", pk: "id", readonly: ["id", "created_at", "updated_at"], order: "created_at DESC", label: "Reportes marinos" },
  { table: "webcams", pk: "id", readonly: ["id", "created_at"], order: "sort_order, name", label: "Webcams" },
];

/** Datos vivos y utilidades (docs §5.5). */
export async function liveRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const live = app.live;
  const db = app.db;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const pub = <T>(reply: { header: (k: string, v: string) => unknown }, v: T, cache = PUBLIC_CACHE) => { reply.header("cache-control", cache); return v; };
  const tag = ["datos vivos"];

  r.get("/live/exchange-rates", { schema: { tags: tag, summary: "Tasas vigentes (DOP por unidad de cada moneda)", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await live.latestRates() }, "public, max-age=60"));
  r.get("/live/exchange-rates/history", { schema: { tags: tag, summary: "Serie histórica de una moneda contra el DOP", querystring: z.object({ pair: z.string().regex(/^[A-Z]{3}-DOP$/).default("USD-DOP"), days: z.coerce.number().int().min(1).max(365).default(30) }), response: { 200: ok } } }, async (req, reply) => {
    const cur = req.query.pair.slice(0, 3);
    if (!(FX_CURRENCIES as readonly string[]).includes(cur)) throw AppError.validation(`Moneda no soportada: ${cur}`, { supported: FX_CURRENCIES });
    return pub(reply, { data: await live.rateHistory(cur, req.query.days) }, "public, max-age=300");
  });
  r.post("/utils/convert", { config: rl(120, "1 minute"), schema: { tags: tag, summary: "Convierte un monto con la tasa vigente (punto medio compra/venta)", body: z.object({ amount: z.number().min(0).max(1_000_000_000), from: z.enum(CURRENCIES), to: z.enum(CURRENCIES) }), response: { 200: ok } } }, async (req) => ({ data: await live.convert(req.body.amount, req.body.from, req.body.to) }));

  r.get("/live/fuel-prices", { schema: { tags: tag, summary: "Combustibles vigentes y variación contra la semana anterior", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await live.fuel() }, "public, max-age=300"));

  r.get("/lotteries", { schema: { tags: tag, summary: "Loterías con sus sorteos y último resultado", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await live.lotteries() }, "public, max-age=120"));
  r.get("/lotteries/:id", { schema: { tags: tag, summary: "Ficha de una lotería con sus últimos resultados", params: z.object({ id: uuid }), response: { 200: ok } } }, async (req, reply) => pub(reply, { data: await live.lottery(req.params.id) }, "public, max-age=120"));
  r.get("/live/lottery/results", { schema: { tags: tag, summary: "Resultados por lotería o sorteo y rango de fechas", querystring: z.object({ game: uuid.optional(), from: date.optional(), to: date.optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }), response: { 200: ok } } }, async (req, reply) => pub(reply, { data: await live.lotteryResults(req.query) }, "public, max-age=120"));

  r.get("/live/weather", { schema: { tags: tag, summary: "Clima actual de una ciudad o de todas", querystring: z.object({ province: z.enum(WEATHER_LOCATIONS.map((l) => l.slug) as [string, ...string[]]).optional() }), response: { 200: ok } } }, async (req, reply) => pub(reply, { data: await live.weather(req.query.province) }, "public, max-age=300"));
  r.get("/live/weather/forecast", { schema: { tags: tag, summary: "Pronóstico de una ciudad", querystring: z.object({ province: z.enum(WEATHER_LOCATIONS.map((l) => l.slug) as [string, ...string[]]), days: z.coerce.number().int().min(1).max(7).default(5) }), response: { 200: ok } } }, async (req, reply) => pub(reply, { data: await live.forecast(req.query.province, req.query.days) }, "public, max-age=300"));
  r.get("/live/weather/alerts", { schema: { tags: tag, summary: "Alertas meteorológicas vigentes", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await live.alerts() }, "public, max-age=60"));
  r.get("/live/beach-status", { schema: { tags: tag, summary: "Estado del mar por localidad y alertas de oleaje o sargazo", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await live.beachStatus() }, "public, max-age=120"));
  r.get("/live/marine-reports", { schema: { tags: tag, summary: "Reportes marinos recientes", querystring: z.object({ location: z.string().max(100).optional(), limit: z.coerce.number().int().min(1).max(100).default(30) }), response: { 200: ok } } }, async (req, reply) =>
    pub(reply, { data: (await db.query("SELECT id, location, wind_speed, wind_direction, wave_height, wave_period, water_temp, condition_rating, recommendation, created_at FROM marine_reports WHERE ($1::text IS NULL OR location = $1) ORDER BY created_at DESC LIMIT $2", [req.query.location ?? null, req.query.limit])).rows }, "public, max-age=60"));
  r.post("/live/marine-reports", {
    preHandler: app.requireRole("admin", "editor"),
    schema: { tags: tag, summary: "Registra un reporte marino (editor)", security: bearer, body: z.object({ location: z.string().trim().min(2).max(100), wind_speed: z.number().min(0).max(300), wind_direction: z.string().trim().min(1).max(10), wave_height: z.number().min(0).max(20), wave_period: z.number().int().min(0).max(60), water_temp: z.number().min(10).max(40), condition_rating: z.enum(["Excelente", "Buena", "Regular", "Mala", "Peligrosa"]), recommendation: z.string().trim().min(3).max(500) }), response: { 201: ok } },
  }, async (req, reply) => {
    const b = req.body;
    try {
      const row = (await db.query("INSERT INTO marine_reports (location, wind_speed, wind_direction, wave_height, wave_period, water_temp, condition_rating, recommendation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id", [b.location, b.wind_speed, b.wind_direction, b.wave_height, b.wave_period, b.water_temp, b.condition_rating, b.recommendation])).rows[0];
      await audit(db, { actor: req.user!.id, action: "live.marine_report", entity: "marine_report", id: row.id, ip: req.ip });
      reply.code(201);
      return { data: row };
    } catch (e) { if ((e as { code?: string }).code === "23514") throw AppError.validation("La calificación no es válida"); throw e; }
  });
  r.get("/live/webcams", { schema: { tags: tag, summary: "Webcams", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: (await db.query("SELECT id, name, location, province, stream_url, thumbnail_url FROM webcams WHERE is_active ORDER BY sort_order, name")).rows }, "public, max-age=600"));
  r.get("/live/events-now", { schema: { tags: tag, summary: "Eventos que ocurren hoy", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await live.eventsNow() }, "public, max-age=120"));
  r.get("/live/time-zones", { schema: { tags: tag, summary: "Zonas horarias frecuentes de los visitantes", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: TIME_ZONES }, "public, max-age=86400"));
  r.get("/live/locations", { schema: { tags: tag, summary: "Ciudades con clima", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: WEATHER_LOCATIONS.map(({ slug, name }) => ({ slug, name })) }, "public, max-age=86400"));

  // ---------- Administración ----------
  await tableAdminRoutes(app, LIVE_TABLES, ["admin", "editor"]);
  r.post("/admin/live/refresh", { preHandler: app.requireRole("admin"), schema: { tags: ["admin"], summary: "Actualiza ahora tasas o clima desde el proveedor configurado", security: bearer, querystring: z.object({ source: z.enum(["fx", "weather"]) }), response: { 200: ok } } }, async (req) => {
    const res = await app.jobs.runNow(req.query.source === "fx" ? "fx.refresh" : "weather.refresh");
    await audit(db, { actor: req.user!.id, action: "live.refresh", entity: "live", id: req.query.source, ip: req.ip });
    return { data: res };
  });
}

/** Trabajos de datos vivos (docs §9). Sin proveedor configurado no hacen nada. */
export function registerLiveJobs(app: FastifyInstance, runner: JobRunner) {
  runner.register({ name: "fx.refresh", description: "Tasas de cambio desde el proveedor (cada 30 min)", everySeconds: 1800, run: async () => ({ ...(await app.live.refreshRates()) }) });
  runner.register({ name: "weather.refresh", description: "Clima y pronóstico de las ciudades principales (cada 30 min)", everySeconds: 1800, run: async () => ({ ...(await app.live.refreshWeather()) }) });
}
