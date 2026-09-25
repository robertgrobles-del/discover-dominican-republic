import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import type { Env } from "../config/env.js";
import { createPostgresStore, purgeRateLimits } from "./rate-limit-store.js";

export async function registerSecurity(app: FastifyInstance, env: Env) {
  await app.register(helmet, {
    // La API sólo sirve JSON; la UI de documentación (/docs) necesita sus propios scripts y estilos.
    contentSecurityPolicy: env.DOCS_ENABLED ? false : { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
  const origins = env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  await app.register(cors, {
    origin: origins,
    credentials: true, // cookie de refresco en modo web (sólo con la lista blanca de orígenes)
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept-Language", "Idempotency-Key", "X-Request-Id", "If-None-Match", "X-Refresh-Transport"],
    exposedHeaders: ["X-Request-Id", "ETag", "X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
    maxAge: 86400,
  });
  // Límite por IP. Con una sola instancia basta la memoria; con varias, los contadores se comparten en PostgreSQL o Redis.
  // Si el almacén falla se deja pasar la solicitud (skipOnError): los intentos de contraseña siguen limitados por la base de datos (bloqueo de cuenta).
  const store: Record<string, unknown> = {};
  if (env.RATE_LIMIT_STORE === "postgres") {
    store.store = createPostgresStore(app.db);
    const timer = setInterval(() => void purgeRateLimits(app.db).catch(() => undefined), 60_000);
    timer.unref();
    app.addHook("onClose", async () => { clearInterval(timer); });
  } else if (env.RATE_LIMIT_STORE === "redis") {
    const redis = new Redis(env.REDIS_URL!, { connectTimeout: 500, maxRetriesPerRequest: 1 });
    redis.on("error", (err) => app.log.warn({ err: err.message }, "Redis (límite de tasa) no disponible"));
    store.redis = redis;
    store.nameSpace = "descubre-rl-";
    app.addHook("onClose", async () => { await redis.quit().catch(() => undefined); });
  } else if (env.NODE_ENV === "production") {
    app.log.warn("RATE_LIMIT_STORE=memory en producción: con varias instancias los límites no se comparten (usa postgres o redis)");
  }
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    allowList: (req) => req.url.startsWith("/health"),
    skipOnError: true,
    ...store,
  });
}
