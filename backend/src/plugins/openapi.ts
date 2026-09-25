import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import type { Env } from "../config/env.js";

export async function registerOpenApi(app: FastifyInstance, env: Env, version: string) {
  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: { title: "Descubre RD API", version, description: "API REST v1 del portal Descubre RD. Contrato completo: docs/BACKEND_API.md" },
      servers: [{ url: env.PUBLIC_BASE_URL, description: "Servidor actual" }],
      tags: [
        { name: "sistema", description: "Salud, versión y configuración pública" },
        { name: "territorio", description: "Provincias, destinos y contenido del territorio (CMS)" },
      ],
      components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
    },
    transform: jsonSchemaTransform,
  });
  if (env.DOCS_ENABLED) await app.register(swaggerUi, { routePrefix: "/docs" });
  // El contrato OpenAPI es la fuente única para generar el SDK del frontend.
  app.get("/openapi.json", { schema: { hide: true } }, async () => app.swagger());
}
