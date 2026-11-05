import compress from "@fastify/compress";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { Redis } from "ioredis";
import type { Env } from "../config/env.js";
import { createPostgresStore, purgeRateLimits } from "./rate-limit-store.js";

export async function registerSecurity(app: FastifyInstance, env: Env) {
  // Comprime respuestas JSON grandes (listados, exportaciones) con Brotli/gzip según lo que acepte el cliente.
  await app.register(compress, { global: true, encodings: ["br", "gzip"] });
  await app.register(helmet, {
    // La API sólo sirve JSON; la UI de documentación (/docs) necesita sus propios scripts y estilos.
    contentSecurityPolicy: env.DOCS_ENABLED ? false : { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
  // Helmet no añade Permissions-Policy. Geolocalización se usa en el portal;
  // cámara y micrófono no son necesarios y se deniegan de forma explícita.
  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    return payload;
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
  // Límite por IP, con dos presupuestos: las lecturas (GET/HEAD) tienen el suyo, más amplio, porque una carga del portal
  // pide decenas de colecciones; todo lo que escribe conserva el estricto. Las rutas con límite propio no cambian.
  // Con una sola instancia basta la memoria; con varias, los contadores se comparten en PostgreSQL o Redis.
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
  const isRead = (req: FastifyRequest) => req.method === "GET" || req.method === "HEAD";
  await app.register(rateLimit, {
    max: (req) => (isRead(req) ? env.RATE_LIMIT_READ_MAX : env.RATE_LIMIT_MAX),
    keyGenerator: (req) => (isRead(req) ? `${req.ip}|r` : req.ip),
    timeWindow: env.RATE_LIMIT_WINDOW,
    allowList: (req) => req.url.startsWith("/health"),
    skipOnError: true,
    ...store,
  });
}
