import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import helmet from "@fastify/helmet";
import pg from "pg";
import { loadContentConfig } from "./config.js";
import { COLLECTIONS } from "../../src/contracts/content-collections.js";
import { PostgresContentReader } from "../../src/modules/content/reader.js";
import { contentInternalRoutes } from "../../src/modules/content/internal-routes.js";
import { bindRequestId } from "../../src/lib/request-context.js";
import { registerErrorHandling } from "../../src/plugins/errors.js";

const config = loadContentConfig();
// Mismos parsers que el monolito (src/db/pool.ts) para que las respuestas sean idénticas por ambos transportes.
pg.types.setTypeParser(1700, (v) => Number(v));
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1082, (v) => v);
const pool = new pg.Pool({
  connectionString: config.CONTENT_DATABASE_URL,
  max: config.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 15_000,
  application_name: "descubre-content-service",
});
pool.on("error", (err) => console.error("[content-db] Error en cliente inactivo:", err.message));

// `verifiedIds` puede traer miles de identificadores: el límite de cuerpo es mayor que el del facade.
const app = Fastify({ logger: { level: config.LOG_LEVEL, redact: ["req.headers.authorization", "req.headers.cookie"] }, requestIdHeader: "x-request-id", genReqId: () => randomUUID(), bodyLimit: 4_194_304 });
await app.register(helmet);
app.addHook("onClose", async () => { await pool.end(); });
app.addHook("onRequest", async (request) => { bindRequestId(request.id); });
app.addHook("onSend", async (request, reply) => { reply.header("x-request-id", request.id); });
registerErrorHandling(app);

const tables = [...new Set(COLLECTIONS.map((collection) => collection.table))];
app.get("/health/live", async () => ({ status: "ok" }));
app.get("/health/ready", async (_request, reply) => {
  try {
    const missing = (await pool.query<{ name: string }>(
      "SELECT name FROM unnest($1::text[]) AS name WHERE to_regclass('public.' || quote_ident(name)) IS NULL",
      [tables],
    )).rows;
    if (missing.length) throw new Error(`Proyección de contenido incompleta: faltan ${missing.length} tablas`);
    await pool.query("SELECT f_unaccent('á'), similarity('a', 'a')");
    return { status: "ready" };
  } catch (error) {
    app.log.warn({ err: error }, "Servicio de contenido no listo");
    reply.code(503);
    return { status: "unavailable" };
  }
});
contentInternalRoutes(app, new PostgresContentReader(pool), config.CONTENT_SERVICE_TOKEN);

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Cerrando servicio content");
  await app.close();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
