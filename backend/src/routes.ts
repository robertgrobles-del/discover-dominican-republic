import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/routes.js";
import { configRoutes } from "./modules/config/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { provincesRoutes } from "./modules/provinces/routes.js";

/** Todas las rutas de la API cuelgan de /api/v1 (docs §3.1). `/health` también existe en la raíz para balanceadores. */
export async function registerRoutes(app: FastifyInstance, version: string) {
  await app.register(healthRoutes, { version });
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes, { version });
      await v1.register(configRoutes);
      await v1.register(authRoutes);
      await v1.register(provincesRoutes);
    },
    { prefix: "/api/v1" },
  );
}
