import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { audit } from "../../lib/audit.js";
import { weatherPublicRoutes } from "./public-routes.js";
import { pageQuery, idParams, weatherSnapshotBody } from "./admin-contract.js";
import { WeatherServiceGateway } from "./gateway.js";

const tag = ["admin"];
const bearer = [{ bearerAuth: [] }];

/** API del subdominio meteorológico. Los paths públicos actuales se conservan para el facade. */
export async function weatherRoutes(app: FastifyInstance) {
  const gateway = app.env.WEATHER_SERVICE_URL ? new WeatherServiceGateway(app.env.WEATHER_SERVICE_URL, app.env.WEATHER_SERVICE_TOKEN!, app.log) : undefined;
  await weatherPublicRoutes(app, { gateway });
  const r = app.withTypeProvider<ZodTypeProvider>();
  const editor = app.requireRole("admin", "editor");
  const assertWritesEnabled = () => {
    if (app.env.WEATHER_WRITES_FROZEN) throw new AppError("SERVICE_UNAVAILABLE", "La administración del clima está temporalmente congelada por migración");
  };

  r.get("/admin/weather_snapshots", {
    onRequest: editor,
    schema: { tags: tag, summary: "Clima por ciudad: lista", security: bearer, querystring: pageQuery },
  }, async (req) => {
    const { rows, total } = gateway ? await gateway.adminList(req.query.page, req.query.per_page, req.user!.id) : await app.weather.adminList(req.query.page, req.query.per_page);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.post("/admin/weather_snapshots", {
    onRequest: editor,
    schema: { tags: tag, summary: "Clima por ciudad: crear", security: bearer, body: weatherSnapshotBody },
  }, async (req, reply) => {
    assertWritesEnabled();
    const row = gateway ? await gateway.adminCreate(req.body, req.user!.id) : await app.weather.adminCreate(req.body);
    await audit(app.db, { actor: req.user!.id, action: "admin.weather_snapshots.create", entity: "weather_snapshots", id: String(row.id), ip: req.ip });
    reply.code(201);
    return { data: row };
  });

  r.patch("/admin/weather_snapshots/:id", {
    onRequest: editor,
    schema: { tags: tag, summary: "Clima por ciudad: editar", security: bearer, params: idParams, body: weatherSnapshotBody },
  }, async (req) => {
    assertWritesEnabled();
    const row = gateway ? await gateway.adminUpdate(req.params.id, req.body, req.user!.id) : await app.weather.adminUpdate(req.params.id, req.body);
    if (!row) throw AppError.notFound("Clima por ciudad");
    await audit(app.db, { actor: req.user!.id, action: "admin.weather_snapshots.update", entity: "weather_snapshots", id: req.params.id, meta: { fields: Object.keys(req.body) }, ip: req.ip });
    return { data: row };
  });

  r.delete("/admin/weather_snapshots/:id", {
    onRequest: editor,
    schema: { tags: tag, summary: "Clima por ciudad: borrar", security: bearer, params: idParams },
  }, async (req, reply) => {
    assertWritesEnabled();
    const deleted = gateway ? await gateway.adminDelete(req.params.id, req.user!.id) : await app.weather.adminDelete(req.params.id);
    if (!deleted) throw AppError.notFound("Clima por ciudad");
    await audit(app.db, { actor: req.user!.id, action: "admin.weather_snapshots.delete", entity: "weather_snapshots", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });
}
