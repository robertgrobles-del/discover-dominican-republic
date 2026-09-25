import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";

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
  // Límite por IP en memoria; con varias instancias se pasa a Redis (docs §2).
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    allowList: (req) => req.url.startsWith("/health"),
  });
}
