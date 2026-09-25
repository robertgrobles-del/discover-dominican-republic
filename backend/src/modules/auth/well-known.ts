import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

/** Claves públicas de firma (JWKS): permiten a otros servicios (o a un gateway) verificar los tokens sin compartir secretos. */
export async function wellKnownRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/.well-known/jwks.json",
    {
      schema: {
        tags: ["auth"], summary: "Claves públicas de firma de los JWT (JWKS)",
        response: { 200: z.object({ keys: z.array(z.record(z.string(), z.any())) }) },
      },
    },
    async (_req, reply) => {
      reply.header("cache-control", "public, max-age=3600");
      return app.tokens.publicJwks() as { keys: Record<string, unknown>[] };
    },
  );
}
