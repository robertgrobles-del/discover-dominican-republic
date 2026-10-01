import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { WeatherServiceGateway } from "./gateway.js";

const ok = z.object({ data: z.any() });
const tag = ["datos vivos"];

/** Rutas públicas compartidas por el facade actual y el proceso autónomo weather. */
export async function weatherPublicRoutes(app: FastifyInstance, options: { gateway?: WeatherServiceGateway } = {}) {
  const gateway = options.gateway;
  const r = app.withTypeProvider<ZodTypeProvider>();
  const locations = app.weather.locations;

  r.get("/live/weather", {
    schema: { tags: tag, summary: "Clima actual de una ciudad o de todas", querystring: z.object({ province: z.enum(locations.map((l) => l.slug) as [string, ...string[]]).optional() }), response: { 200: ok } },
  }, async (req, reply) => { reply.header("cache-control", "public, max-age=300"); return { data: gateway ? await gateway.weather(req.query.province) : await app.weather.weather(req.query.province) }; });

  r.get("/live/weather/forecast", {
    schema: { tags: tag, summary: "Pronóstico de una ciudad", querystring: z.object({ province: z.enum(locations.map((l) => l.slug) as [string, ...string[]]), days: z.coerce.number().int().min(1).max(7).default(5) }), response: { 200: ok } },
  }, async (req, reply) => { reply.header("cache-control", "public, max-age=300"); return { data: gateway ? await gateway.forecast(req.query.province, req.query.days) : await app.weather.forecast(req.query.province, req.query.days) }; });

  r.get("/live/locations", {
    schema: { tags: tag, summary: "Ciudades con clima", response: { 200: ok } },
  }, async (_req, reply) => { reply.header("cache-control", "public, max-age=86400"); return { data: locations.map(({ slug, name }) => ({ slug, name })) }; });
}
