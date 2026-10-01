import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { loadEnv, type Env } from "./config/env.js";
import { createPool, type Db } from "./db/pool.js";
import { bindRequestId } from "./lib/request-context.js";
import { setAuditChainSecret } from "./lib/audit.js";
import { registerAuth } from "./plugins/auth.js";
import { registerErrorHandling } from "./plugins/errors.js";
import { registerMetrics } from "./plugins/metrics.js";
import { registerEtag } from "./plugins/etag.js";
import { registerOpenApi } from "./plugins/openapi.js";
import { registerPublicCache } from "./plugins/public-cache.js";
import { registerSecurity } from "./plugins/security.js";
import { registerRoutes } from "./routes.js";

declare module "fastify" { interface FastifyInstance { routeTable: { method: string; url: string; authenticated: boolean; roles: string[]; orgScope: boolean }[] } }

export interface BuildOptions {
  env?: Env;
  /** Pool inyectado (tests). Si no se pasa, se crea uno y se cierra con la app. */
  db?: Db;
}

/** `false` (sin proxy), `true`, número de saltos o lista de CIDR: sólo se confía en X-Forwarded-For de proxies conocidos, para que nadie falsee su IP y evada los límites. */
function parseTrustProxy(v: string): boolean | string[] | ((address: string, hop: number) => boolean) {
  if (v === "false" || v === "") return false;
  if (v === "true") return true;
  if (/^\d+$/.test(v)) { const hops = Number(v); return (_address, hop) => hop < hops; }
  return v.split(",").map((x) => x.trim()).filter(Boolean);
}

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };

export async function buildApp(opts: BuildOptions = {}) {
  const env = opts.env ?? loadEnv();
  const app = Fastify({
    logger: env.NODE_ENV === "test" ? false : { level: env.LOG_LEVEL, redact: ["req.headers.authorization", "req.headers.cookie"] },
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
    bodyLimit: 1_048_576,
  }).withTypeProvider<ZodTypeProvider>();

  // Inventario de rutas con su protección (lo consulta la prueba de seguridad: toda ruta nueva sin autenticación debe justificarse).
  // Se registra primero para ver las opciones tal como las declaró cada módulo, antes de que los plugins añadan sus propios hooks.
  const routeTable: { method: string; url: string; authenticated: boolean; roles: string[]; orgScope: boolean }[] = [];
  app.decorate("routeTable", routeTable);
  app.addHook("onRoute", (r) => {
    // `app.requireRole(...)` y el guard `org(...)` del panel llevan adjuntos los roles que exigen y si son del panel del operador; aquí sólo se leen.
    const hooks = ([] as unknown[]).concat((r.onRequest ?? []) as unknown | unknown[]);
    const roles = [...new Set(hooks.flatMap((h) => (h as { roles?: string[] }).roles ?? []))];
    const orgScope = hooks.some((h) => !!(h as { orgScope?: boolean }).orgScope);
    for (const m of ([] as string[]).concat(r.method as string | string[])) routeTable.push({ method: m, url: r.url, authenticated: !!r.onRequest, roles, orgScope });
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const db = opts.db ?? createPool(env);
  app.decorate("db", db);
  app.decorate("env", env);
  // '' = sin secreto: las entradas quedan fuera de la cadena (igual criterio que audit()); en producción APP_SECRET es obligatoria.
  setAuditChainSecret(env.APP_SECRET ?? "");
  // Asocia cada petición a un request_id de trazabilidad (viaja a los proveedores externos con las llamadas salientes).
  // Antes de auth/security para que cualquier fetch en el ciclo de la petición ya tenga el contexto.
  app.addHook("onRequest", async (req) => { bindRequestId(req.id); });
  registerPublicCache(app);
  if (!opts.db) app.addHook("onClose", async () => { await db.end(); });

  app.addHook("onSend", async (req, reply) => { reply.header("x-request-id", req.id); });

  registerErrorHandling(app);
  await registerAuth(app);
  await registerSecurity(app, env);
  registerEtag(app);
  registerMetrics(app);
  await registerOpenApi(app, env, pkg.version);
  await registerRoutes(app, pkg.version);
  return app;
}
