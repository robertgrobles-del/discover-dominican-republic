import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/routes.js";
import { wellKnownRoutes } from "./modules/auth/well-known.js";
import { configRoutes } from "./modules/config/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { createGateway } from "./modules/operators/gateway.js";
import { operatorRoutes } from "./modules/operators/routes.js";
import { contentRoutes } from "./modules/content/routes.js";

/** Todas las rutas de la API cuelgan de /api/v1 (docs §3.1). `/health` también existe en la raíz para balanceadores. */
export async function registerRoutes(app: FastifyInstance, version: string) {
  // La pasarela se decora en la raíz para que pruebas y otros módulos accedan a ella.
  app.decorate("gateway", createGateway(app.env));
  await app.register(healthRoutes, { version });
  await app.register(wellKnownRoutes);
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes, { version });
      await v1.register(configRoutes);
      await v1.register(authRoutes);
      await v1.register(contentRoutes);
      await v1.register(operatorRoutes);
    },
    { prefix: "/api/v1" },
  );
}
