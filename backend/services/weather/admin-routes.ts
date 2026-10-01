import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { pageMeta } from "../../src/lib/pagination.js";
import { AppError } from "../../src/lib/errors.js";
import { idParams, pageQuery, weatherSnapshotBody } from "../../src/modules/weather/admin-contract.js";
import { verifyWeatherInternalRequest } from "../../src/modules/weather/internal-auth.js";
import type { WeatherServiceConfig } from "./config.js";

export async function weatherInternalAdminRoutes(app: FastifyInstance, db: Pool, config: WeatherServiceConfig) {
  if (!config.WEATHER_SERVICE_TOKEN) return;
  const r = app.withTypeProvider<ZodTypeProvider>();
  const verify = async (request: FastifyRequest) => {
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) throw new AppError("UNAUTHENTICATED", "Solicitud interna no autorizada");
    const claims = await verifyWeatherInternalRequest(config.WEATHER_SERVICE_TOKEN!, auth.slice(7), request.method, request.url, request.body);
    await db.query("DELETE FROM weather_internal_nonces WHERE expires_at < now()");
    const { rowCount } = await db.query("INSERT INTO weather_internal_nonces (jti, expires_at) VALUES ($1::uuid, $2) ON CONFLICT (jti) DO NOTHING", [claims.jti, claims.expiresAt]);
    if (!rowCount) throw new AppError("UNAUTHENTICATED", "Solicitud interna ya utilizada");
  };
  const internal = { hide: true, tags: ["interno"] };
  r.get("/internal/admin/weather_snapshots", { preHandler: verify, schema: { ...internal, querystring: pageQuery } }, async (req) => {
    const { rows, total } = await app.weather.adminList(req.query.page, req.query.per_page);
    return { data: { rows, total } };
  });
  r.post("/internal/admin/weather_snapshots", { preHandler: verify, schema: { ...internal, body: weatherSnapshotBody } }, async (req, reply) => {
    const row = await app.weather.adminCreate(req.body); reply.code(201); return { data: row };
  });
  r.patch("/internal/admin/weather_snapshots/:id", { preHandler: verify, schema: { ...internal, params: idParams, body: weatherSnapshotBody } }, async (req) => {
    const row = await app.weather.adminUpdate(req.params.id, req.body); if (!row) throw AppError.notFound("Clima por ciudad"); return { data: row };
  });
  r.delete("/internal/admin/weather_snapshots/:id", { preHandler: verify, schema: { ...internal, params: idParams } }, async (req, reply) => {
    if (!(await app.weather.adminDelete(req.params.id))) throw AppError.notFound("Clima por ciudad"); reply.code(204); return null;
  });
  r.post("/internal/admin/weather_refresh", { preHandler: verify, schema: internal }, async () => ({ data: await app.weather.refreshWeather() }));
}
