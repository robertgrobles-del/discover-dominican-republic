import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/routes.js";
import { wellKnownRoutes } from "./modules/auth/well-known.js";
import { configRoutes } from "./modules/config/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { paymentWebhookRoutes } from "./modules/payments/webhooks.js";
import { BookingService } from "./modules/operators/bookings.js";
import { CatalogService } from "./modules/operators/catalog.js";
import { PromotionService } from "./modules/operators/promotions.js";
import { registerGameJobs } from "./modules/game/jobs.js";
import { PlayService } from "./modules/game/play.js";
import { StoreService } from "./modules/store/service.js";
import { storeRoutes } from "./modules/store/routes.js";
import { LiveService } from "./modules/live/service.js";
import path from "node:path";
import { LocalStorage, defaultFetcher, mediaRoutes, registerMediaJobs } from "./modules/media/routes.js";
import { i18nRoutes } from "./modules/i18n/routes.js";
import { analyticsRoutes, registerAnalyticsJobs } from "./modules/analytics/routes.js";
import { marketingRoutes, registerMarketingJobs } from "./modules/marketing/routes.js";
import { toolsRoutes } from "./modules/tools/routes.js";
import { liveRoutes, registerLiveJobs } from "./modules/live/routes.js";
import { discoverRoutes } from "./modules/discover/routes.js";
import { gameAdminRoutes } from "./modules/game/admin.js";
import { gameRoutes } from "./modules/game/routes.js";
import { GameService } from "./modules/game/service.js";
import { JobRunner } from "./modules/jobs/runner.js";
import { registerOperatorJobs } from "./modules/operators/jobs.js";
import { PayoutService } from "./modules/operators/payouts.js";
import { AutomationService } from "./modules/operators/automations.js";
import { IcalService } from "./modules/operators/ical.js";
import { createGateway } from "./modules/operators/gateway.js";
import { formsRoutes } from "./modules/forms/routes.js";
import { campaignRoutes } from "./modules/community/campaigns.js";
import { socialRoutes } from "./modules/community/social.js";
import { reviewRoutes } from "./modules/community/reviews.js";
import { adminCmsRoutes } from "./modules/admin/cms.js";
import { adminSiteRoutes } from "./modules/admin/site.js";
import { adminUserRoutes } from "./modules/admin/users.js";
import { meRoutes } from "./modules/me/routes.js";
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
  const store = new StoreService(app.db, app.env, app.gateway, app.mailer, app.log);
  app.decorate("store", store);
  app.decorate("live", new LiveService(app.db, app.env, app.log));
  app.decorate("mediaStorage", new LocalStorage(path.resolve(app.env.MEDIA_DIR)));
  app.decorate("mediaFetcher", { fn: defaultFetcher });
  const game = new GameService(app.db);
  app.decorate("game", game);
  app.decorate("play", new PlayService(app.db, game));
  const ical = new IcalService(app.db, app.log);
  const automations = new AutomationService(app.db, app.env, app.mailer, ical, app.log);
  app.decorate("ical", ical);
  app.decorate("automations", automations);
  const payouts = new PayoutService(app.db, app.mailer);
  const runner = new JobRunner(app.db, app.log);
  app.decorate("payouts", payouts);
  app.decorate("jobs", runner);
  registerGameJobs(app, runner);
  registerLiveJobs(app, runner);
  registerMarketingJobs(app, runner);
  registerAnalyticsJobs(app, runner);
  registerMediaJobs(app, runner);
  // Higiene de datos y retención: lo que ya no sirve se borra (los datos personales no se guardan más de lo necesario, Ley 172-13).
  runner.register({
    name: "maintenance.purge", description: "Borra sesiones, tokens, correos, eventos de pago y avisos vencidos según su retención", everySeconds: 86_400,
    run: async () => {
      const q = (sql: string) => app.db.query(sql).then((r) => r.rowCount ?? 0);
      return {
        refresh_tokens: await q("DELETE FROM refresh_tokens WHERE expires_at < now() - interval '30 days'"),
        auth_tokens: await q("DELETE FROM auth_tokens WHERE (used_at IS NOT NULL AND used_at < now() - interval '7 days') OR expires_at < now() - interval '7 days'"),
        email_log: await q("DELETE FROM email_log WHERE status IN ('sent', 'delivered', 'failed', 'bounced', 'complained') AND created_at < now() - interval '90 days'"),
        payment_events: await q("DELETE FROM payment_events WHERE processed_at IS NOT NULL AND received_at < now() - interval '1 year'"),
        job_marks: await q("DELETE FROM job_marks WHERE created_at < now() - interval '1 year'"),
        notifications: await q("DELETE FROM notifications WHERE is_read AND created_at < now() - interval '180 days'"),
        store_carts: await q("DELETE FROM store_carts WHERE user_id IS NULL AND updated_at < now() - interval '30 days'"),
      };
    },
  });
  runner.register({ name: "orders.auto_cancel", description: "Cancela pedidos de la tienda sin cobrar tras 60 min y devuelve stock y cupón", everySeconds: 900, run: async () => ({ cancelled: await store.cancelUnpaid(60) }) });
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
      await v1.register(adminUserRoutes);
      await v1.register(adminSiteRoutes);
      await v1.register(adminCmsRoutes);
      await v1.register(meRoutes);
      await v1.register(formsRoutes);
      await v1.register(reviewRoutes);
      await v1.register(socialRoutes);
      await v1.register(campaignRoutes);
      await v1.register(gameRoutes);
      await v1.register(storeRoutes);
      await v1.register(discoverRoutes);
      await v1.register(liveRoutes);
      await v1.register(toolsRoutes);
      await v1.register(marketingRoutes);
      await v1.register(analyticsRoutes);
      await v1.register(i18nRoutes);
      await v1.register(mediaRoutes);
      await v1.register(gameAdminRoutes);
      await v1.register(paymentWebhookRoutes);
    },
    { prefix: "/api/v1" },
  );
}
