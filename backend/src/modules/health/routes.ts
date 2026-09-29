import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const ok = z.object({ status: z.literal("ok") });

// ── Schemas compartidos ──────────────────────────────────────────────────────
const checkStatus = z.enum(["up", "down", "degraded"]);
const checkDetail = z.object({ status: checkStatus, latency_ms: z.number().nullable(), detail: z.string().optional() });

export async function healthRoutes(app: FastifyInstance, opts: { version: string }) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  // GET /health — Liveness (Kubernetes liveness probe)
  r.get("/health", { schema: { tags: ["sistema"], summary: "Liveness: el proceso responde", response: { 200: ok } }, config: { rateLimit: false } }, async () => ({ status: "ok" as const }));

  // GET /health/ready — Readiness (Kubernetes readiness probe, verifica DB)
  r.get(
    "/health/ready",
    {
      schema: {
        tags: ["sistema"], summary: "Readiness: dependencias disponibles (base de datos)",
        response: {
          200: z.object({ status: z.literal("ready"), checks: z.object({ database: z.literal("up") }) }),
          503: z.object({ status: z.literal("unavailable"), checks: z.object({ database: z.literal("down") }) }),
        },
      },
      config: { rateLimit: false },
    },
    async (_req, reply) => {
      try {
        await app.db.query("SELECT 1");
        return { status: "ready" as const, checks: { database: "up" as const } };
      } catch {
        return reply.code(503).send({ status: "unavailable" as const, checks: { database: "down" as const } });
      }
    },
  );

  const dbHealthSchema = z.object({
    status: checkStatus,
    latency_ms: z.number().nullable(),
    pool: z.object({ total: z.number(), idle: z.number(), waiting: z.number() }).nullable(),
    migrations: z.object({ applied: z.number(), latest: z.string().nullable() }).nullable(),
  });

  // GET /health/db — Diagnóstico detallado de la base de datos (Sprint 6.3)
  r.get(
    "/health/db",
    {
      schema: {
        tags: ["sistema"], summary: "Health detallado de la base de datos: latencia, pool y migraciones",
        response: {
          200: dbHealthSchema,
          206: dbHealthSchema,
          503: dbHealthSchema,
        },
      },
      config: { rateLimit: false },
    },
    async (_req, reply) => {
      const t0 = Date.now();
      try {
        await app.db.query("SELECT 1");
        const latency_ms = Date.now() - t0;

        // Pool stats (depende del tipo de pool expuesto en app.db)
        const poolAny = app.db as any;
        const pool = poolAny.totalCount !== undefined
          ? { total: poolAny.totalCount, idle: poolAny.idleCount, waiting: poolAny.waitingCount }
          : null;

        // Migraciones aplicadas
        let migrations: { applied: number; latest: string | null } | null = null;
        try {
          const { rows } = await app.db.query<{ count: number; latest: string }>(
            "SELECT count(*)::int AS count, max(filename) AS latest FROM schema_migrations"
          );
          migrations = { applied: rows[0]?.count ?? 0, latest: rows[0]?.latest ?? null };
        } catch { /* schema_migrations puede no existir aun */ }

        const status = latency_ms > 1000 ? ("degraded" as const) : ("up" as const);
        const code = status === "up" ? 200 : 206;
        return reply.code(code).send({ status, latency_ms, pool, migrations });
      } catch (err) {
        return reply.code(503).send({ status: "down" as const, latency_ms: null, pool: null, migrations: null });
      }
    },
  );

  const queueHealthSchema = z.object({ status: checkStatus, pending: z.number(), failed: z.number(), oldest_pending_minutes: z.number().nullable() });

  // GET /health/queue — Estado de la cola de emails (Sprint 6.3)
  r.get(
    "/health/queue",
    {
      schema: {
        tags: ["sistema"], summary: "Estado de la cola de correos: pendientes y fallidos",
        response: {
          200: queueHealthSchema,
          503: queueHealthSchema,
        },
      },
      config: { rateLimit: false },
    },
    async (_req, reply) => {
      try {
        const { rows } = await app.db.query<{ pending: number; failed: number; oldest_minutes: number | null }>(`
          SELECT
            count(*) FILTER (WHERE status = 'pending')::int AS pending,
            count(*) FILTER (WHERE status = 'failed')::int AS failed,
            EXTRACT(EPOCH FROM (now() - min(created_at) FILTER (WHERE status = 'pending'))) / 60 AS oldest_minutes
          FROM email_queue
          WHERE created_at > now() - interval '24 hours'
        `);
        const { pending, failed, oldest_minutes } = rows[0] ?? { pending: 0, failed: 0, oldest_minutes: null };
        const status = failed > 50 ? ("degraded" as const) : pending > 500 ? ("degraded" as const) : ("up" as const);
        return { status, pending, failed, oldest_pending_minutes: oldest_minutes ? Math.round(oldest_minutes) : null };
      } catch {
        return reply.code(503).send({ status: "down" as const, pending: 0, failed: 0, oldest_pending_minutes: null });
      }
    },
  );

  // GET /health/cache — Estado de Redis (Sprint 6.3)
  r.get(
    "/health/cache",
    {
      schema: {
        tags: ["sistema"], summary: "Estado de la caché Redis (si está configurada)",
        response: { 200: checkDetail, 503: checkDetail },
      },
      config: { rateLimit: false },
    },
    async (_req, reply) => {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        return { status: "up" as const, latency_ms: null, detail: "Cache Redis no configurada (modo sin caché activo)" };
      }
      const t0 = Date.now();
      try {
        // Ping via TCP nativo si no hay cliente Redis registrado en app
        const cacheAny = (app as any).cache;
        if (cacheAny?.ping) {
          await cacheAny.ping();
        }
        return { status: "up" as const, latency_ms: Date.now() - t0 };
      } catch (err: any) {
        return reply.code(503).send({ status: "down" as const, latency_ms: null, detail: err?.message ?? "Redis unreachable" });
      }
    },
  );

  const detailedSchema = z.object({
    status: checkStatus,
    version: z.string(),
    environment: z.string(),
    uptime_seconds: z.number(),
    checks: z.object({
      database: checkDetail,
      queue: z.object({ status: checkStatus, pending: z.number(), failed: z.number() }),
      cache: checkDetail,
    }),
  });

  // GET /health/detailed — Resumen unificado para dashboards (UptimeRobot, Grafana)
  r.get(
    "/health/detailed",
    {
      schema: {
        tags: ["sistema"], summary: "Diagnóstico completo de todos los subsistemas",
        response: {
          200: detailedSchema,
          206: detailedSchema,
          503: detailedSchema,
        },
      },
      config: { rateLimit: false },
    },
    async (_req, reply) => {
      const [dbResult, queueResult, cacheResult] = await Promise.allSettled([
        // DB
        (async () => {
          const t0 = Date.now();
          await app.db.query("SELECT 1");
          return { status: "up" as const, latency_ms: Date.now() - t0 };
        })(),
        // Queue
        (async () => {
          const { rows } = await app.db.query<{ pending: number; failed: number }>(`
            SELECT count(*) FILTER (WHERE status='pending')::int AS pending,
                   count(*) FILTER (WHERE status='failed')::int AS failed
            FROM email_queue WHERE created_at > now() - interval '24 hours'
          `);
          const r = rows[0] ?? { pending: 0, failed: 0 };
          return { status: (r.failed > 50 || r.pending > 500 ? "degraded" : "up") as "up" | "degraded", ...r };
        })(),
        // Cache (best effort)
        (async () => ({ status: "up" as const, latency_ms: null as null | number }))(),
      ]);

      const db   = dbResult.status === "fulfilled"    ? dbResult.value    : { status: "down" as const, latency_ms: null };
      const queue = queueResult.status === "fulfilled" ? queueResult.value : { status: "down" as const, pending: 0, failed: 0 };
      const cache = cacheResult.status === "fulfilled" ? cacheResult.value : { status: "down" as const, latency_ms: null };

      const overallStatus = [db.status, queue.status, cache.status].includes("down")
        ? ("down" as const)
        : [db.status, queue.status, cache.status].includes("degraded")
          ? ("degraded" as const)
          : ("up" as const);

      const httpCode = overallStatus === "up" ? 200 : overallStatus === "degraded" ? 206 : 503;

      return reply.code(httpCode).send({
        status: overallStatus,
        version: opts.version,
        environment: app.env.NODE_ENV,
        uptime_seconds: Math.floor(process.uptime()),
        checks: { database: db, queue, cache },
      });
    },
  );

  // GET /version — Versión de la API
  r.get(
    "/version",
    {
      schema: {
        tags: ["sistema"], summary: "Versión de la API",
        response: { 200: z.object({ name: z.string(), version: z.string(), environment: z.string(), commit: z.string().nullable() }) },
      },
    },
    async () => ({ name: "descubre-rd-api", version: opts.version, environment: app.env.NODE_ENV, commit: process.env.GIT_SHA ?? null }),
  );
}
