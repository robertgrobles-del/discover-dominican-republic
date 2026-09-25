import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/routes.js";
import { wellKnownRoutes } from "./modules/auth/well-known.js";
import { configRoutes } from "./modules/config/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { paymentWebhookRoutes } from "./modules/payments/webhooks.js";
import { BookingService } from "./modules/operators/bookings.js";
import { CatalogService } from "./modules/operators/catalog.js";
import { PromotionService } from "./modules/operators/promotions.js";
import { JobRunner } from "./modules/jobs/runner.js";
import { registerOperatorJobs } from "./modules/operators/jobs.js";
import { PayoutService } from "./modules/operators/payouts.js";
import { AutomationService } from "./modules/operators/automations.js";
import { IcalService } from "./modules/operators/ical.js";
import { createGateway } from "./modules/operators/gateway.js";
import { adminRoutes } from "./modules/admin/routes.js";
import { operatorRoutes } from "./modules/operators/routes.js";
import { contentRoutes } from "./modules/content/routes.js";

/** Todas las rutas de la API cuelgan de /api/v1 (docs §3.1). `/health` también existe en la raíz para balanceadores. */
export async function registerRoutes(app: FastifyInstance, version: string) {
  // La pasarela se decora en la raíz para que pruebas y otros módulos accedan a ella.
  app.decorate("gateway", createGateway(app.env));
  const promotions = new PromotionService(app.db);
  app.decorate("catalog", new CatalogService(app.db, app.env, app.log));
  app.decorate("promotions", promotions);
  app.decorate("bookings", new BookingService(app.db, app.env, promotions, app.gateway, app.mailer, app.log));
  const ical = new IcalService(app.db, app.log);
  const automations = new AutomationService(app.db, app.env, app.mailer, ical, app.log);
  app.decorate("ical", ical);
  app.decorate("automations", automations);
  const payouts = new PayoutService(app.db, app.mailer);
  const runner = new JobRunner(app.db, app.log);
  app.decorate("payouts", payouts);
  app.decorate("jobs", runner);
  registerOperatorJobs({ db: app.db, env: app.env, mailer: app.mailer, runner, automations, ical, payouts });
  if (app.env.JOBS_ENABLED) { runner.start(); app.addHook("onClose", async () => { await runner.stop(); }); }
  await app.register(healthRoutes, { version });
  await app.register(wellKnownRoutes);
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes, { version });
      await v1.register(configRoutes);
      await v1.register(authRoutes);
      await v1.register(contentRoutes);
      await v1.register(operatorRoutes);
      await v1.register(adminRoutes);
      await v1.register(paymentWebhookRoutes);
    },
    { prefix: "/api/v1" },
  );
}
