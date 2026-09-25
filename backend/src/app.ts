import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { loadEnv, type Env } from "./config/env.js";
import { createPool, type Db } from "./db/pool.js";
import { registerErrorHandling } from "./plugins/errors.js";
import { registerEtag } from "./plugins/etag.js";
import { registerOpenApi } from "./plugins/openapi.js";
import { registerSecurity } from "./plugins/security.js";
import { registerRoutes } from "./routes.js";

export interface BuildOptions {
  env?: Env;
  /** Pool inyectado (tests). Si no se pasa, se crea uno y se cierra con la app. */
  db?: Db;
}

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };

export async function buildApp(opts: BuildOptions = {}) {
  const env = opts.env ?? loadEnv();
  const app = Fastify({
    logger: env.NODE_ENV === "test" ? false : { level: env.LOG_LEVEL, redact: ["req.headers.authorization", "req.headers.cookie"] },
    trustProxy: true,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
    bodyLimit: 1_048_576,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const db = opts.db ?? createPool(env);
  app.decorate("db", db);
  app.decorate("env", env);
  if (!opts.db) app.addHook("onClose", async () => { await db.end(); });

  app.addHook("onSend", async (req, reply) => { reply.header("x-request-id", req.id); });

  registerErrorHandling(app);
  await registerSecurity(app, env);
  registerEtag(app);
  await registerOpenApi(app, env, pkg.version);
  await registerRoutes(app, pkg.version);
  return app;
}
