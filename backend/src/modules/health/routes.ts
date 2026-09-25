import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const ok = z.object({ status: z.literal("ok") });

export async function healthRoutes(app: FastifyInstance, opts: { version: string }) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get("/health", { schema: { tags: ["sistema"], summary: "Liveness: el proceso responde", response: { 200: ok } }, config: { rateLimit: false } }, async () => ({ status: "ok" as const }));

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
