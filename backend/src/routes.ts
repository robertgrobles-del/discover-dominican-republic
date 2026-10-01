import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/routes.js";
import { wellKnownRoutes } from "./modules/auth/well-known.js";
import { configRoutes } from "./modules/config/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { paymentWebhookRoutes } from "./modules/payments/webhooks.js";
import { BookingService } from "./modules/operators/bookings.js";
import { CatalogService } from "./modules/operators/catalog.js";
import { OperatorVerificationService } from "./modules/operators/verification.js";
import { PromotionService } from "./modules/operators/promotions.js";
import { registerGameJobs } from "./modules/game/jobs.js";
import { PlayService } from "./modules/game/play.js";
import { StoreService } from "./modules/store/service.js";
import { storeRoutes } from "./modules/store/routes.js";
import { emailAdminRoutes, emailWebhookRoutes } from "./modules/mailer/routes.js";
import { FlagService } from "./lib/flags.js";
import { IpRuleService, registerIpRules } from "./plugins/ip-rules.js";
import { adminSecurityRoutes } from "./modules/admin/security.js";
import { adminSupportRoutes } from "./modules/forms/support-desk.js";
import { impersonationRoutes } from "./modules/admin/impersonation.js";
import { adminModerationRoutes } from "./modules/admin/moderation.js";
import { adminImportRoutes, ImportService, registerImportJobs } from "./modules/admin/imports.js";
import { NotificationService } from "./modules/notifications/service.js";
import { notificationRoutes } from "./modules/notifications/routes.js";
import { insertNotification } from "./modules/notifications/insert.js";
import { AiService } from "./modules/ai/service.js";
import { aiRoutes } from "./modules/ai/routes.js";
import { createAiProvider } from "./modules/ai/provider.js";
import { TripService } from "./modules/trips/service.js";
import { PostgresContentReader } from "./modules/content/reader.js";
import { HttpContentReader } from "./modules/content/http-reader.js";
import { tripRoutes } from "./modules/trips/routes.js";
import { AmbassadorService } from "./modules/ambassadors/service.js";
import { ambassadorRoutes } from "./modules/ambassadors/routes.js";
import { MarketplaceService } from "./modules/marketplace/service.js";
import { marketplaceRoutes } from "./modules/marketplace/routes.js";
import { LiveService } from "./modules/live/service.js";
import { WeatherService } from "./modules/weather/service.js";
import { PostgresWeatherRepository } from "./modules/weather/repository.js";
import { WeatherServiceGateway } from "./modules/weather/gateway.js";
import { weatherRoutes } from "./modules/weather/routes.js";
import { todayInSantoDomingo } from "./lib/dates.js";
import path from "node:path";
import { LocalStorage, type MediaStorage, defaultFetcher, mediaRoutes, registerMediaJobs } from "./modules/media/routes.js";
import { createScanner } from "./modules/media/antivirus.js";
import { S3Storage } from "./modules/media/storage-s3.js";
import { i18nRoutes } from "./modules/i18n/routes.js";
import { analyticsRoutes, registerAnalyticsJobs } from "./modules/analytics/routes.js";
import { marketingRoutes, registerMarketingJobs } from "./modules/marketing/routes.js";
import { toolsRoutes } from "./modules/tools/routes.js";
import { liveRoutes } from "./modules/live/routes.js";
import { discoverRoutes } from "./modules/discover/routes.js";
import { PostgresSearchAnalytics } from "./modules/analytics/search.js";
import { PostgresPublicSettingsReader } from "./modules/admin/settings-reader.js";
import { PostgresFavoritesReader } from "./modules/me/favorites.js";
import { CommunityGame } from "./modules/game/community.js";
import { ExploreService } from "./modules/game/explore.js";
import { exploreRoutes } from "./modules/game/explore-routes.js";
import { gameAdminRoutes } from "./modules/game/admin.js";
import { gameRoutes } from "./modules/game/routes.js";
import { GameService } from "./modules/game/service.js";
import { JobRunner } from "./modules/jobs/runner.js";
import { registerOperatorJobs } from "./modules/operators/jobs.js";
import { eraseOperatorData } from "./modules/operators/erasure.js";
import { PostgresIdentityAdmin } from "./modules/auth/identity-admin.js";
import { PostgresProfileStore, eraseProfileData } from "./modules/me/profile-store.js";
import { registerAccountJobs } from "./modules/me/jobs.js";
import { eraseNotifications } from "./modules/notifications/erasure.js";
import { eraseSupportData } from "./modules/forms/erasure.js";
import { PayoutService } from "./modules/operators/payouts.js";
import { AutomationService } from "./modules/operators/automations.js";
import { IcalService } from "./modules/operators/ical.js";
import { createGateway } from "./modules/operators/gateway.js";
import { formsRoutes } from "./modules/forms/routes.js";
import { campaignRoutes } from "./modules/community/campaigns.js";
import { socialRoutes } from "./modules/community/social.js";
import { reviewRoutes } from "./modules/community/reviews.js";
import { adminCmsRoutes } from "./modules/admin/cms.js";
import { SponsorshipService } from "./modules/sponsorship/service.js";
import { sponsorshipRoutes } from "./modules/sponsorship/routes.js";
import { CreatorService } from "./modules/creators/service.js";
import { creatorRoutes } from "./modules/creators/routes.js";
import { TransactionalProductsService } from "./modules/products/service.js";
import { transactionalProductsRoutes } from "./modules/products/routes.js";
import { MembershipsAndTicketingService } from "./modules/memberships/service.js";
import { membershipsRoutes } from "./modules/memberships/routes.js";
import { FiscalInvoicingService } from "./modules/billing/invoicing.js";
import { fiscalInvoiceRoutes } from "./modules/billing/routes.js";
import { adminSiteRoutes } from "./modules/admin/site.js";
import { adminUserRoutes } from "./modules/admin/users.js";
import { meRoutes } from "./modules/me/routes.js";
import { verifyPassword } from "./modules/auth/password.js";
import { screenReview } from "./modules/community/reviews.js";
import { communityModeration } from "./modules/community/moderation.js";
import { mediaModeration, mediaReview } from "./modules/media/moderation.js";
import { creatorVideoModeration } from "./modules/creators/moderation.js";
import { PostgresUserFlags } from "./modules/admin/user-flags.js";
import { PostgresLeadCapture } from "./modules/marketing/leads.js";
import { PostgresSupportIntake } from "./modules/forms/support-intake.js";
import { accessRoutes } from "./modules/access/routes.js";
import { adminRoutes } from "./modules/admin/routes.js";
import { operatorRoutes } from "./modules/operators/routes.js";
import { contentRoutes } from "./modules/content/routes.js";

import { seoRoutes } from "./modules/seo/routes.js";
import { TelemetryQueue } from "./lib/telemetry-queue.js";

/** Todas las rutas de la API cuelgan de /api/v1 (docs §3.1). `/health` también existe en la raíz para balanceadores. */
export async function registerRoutes(app: FastifyInstance, version: string) {
  // La pasarela se decora en la raíz para que pruebas y otros módulos accedan a ella.
  app.decorate("gateway", createGateway(app.env));
  app.decorate("flags", new FlagService(app.db));
  const imports = new ImportService(app.db, app.log);
  app.decorate("imports", imports);
  const ipRules = new IpRuleService(app.db);
  app.decorate("ipRules", ipRules);
  registerIpRules(app, ipRules);
  const promotions = new PromotionService(app.db);
  const businessVerification = new OperatorVerificationService(app.db);
  app.decorate("businessVerification", businessVerification);
  const identity = new PostgresIdentityAdmin(app.db);
  app.decorate("identity", identity);
  const profiles = new PostgresProfileStore(app.db);
  const userFlags = new PostgresUserFlags(app.db);
  app.decorate("leads", new PostgresLeadCapture(app.db));
  app.decorate("supportIntake", new PostgresSupportIntake(app.db));
  app.decorate("userFlags", userFlags);
  app.decorate("profiles", profiles);
  app.decorate("catalog", new CatalogService(app.db, app.env, app.log));
  app.decorate("promotions", promotions);
  const notifications = new NotificationService(app.db, app.env, app.log, profiles);
  app.decorate("notifications", notifications);
  app.addHook("preClose", async () => { notifications.closeStreams(); });
  app.addHook("onClose", async () => { await notifications.close(); });
  const notifyUser = notifications.notify.bind(notifications);
  const bookingService = new BookingService(app.db, app.env, promotions, app.gateway, app.mailer, app.log);
  bookingService.notifyUser = notifyUser;
  app.decorate("bookings", bookingService);
  const store = new StoreService(app.db, app.env, app.gateway, app.mailer, app.log);
  store.notifyUser = notifyUser;
  app.decorate("store", store);
  const ambassadors = new AmbassadorService(app.db, app.env, app.mailer, app.log, identity);
  ambassadors.notifyUser = notifyUser;
  app.decorate("ambassadors", ambassadors);
  store.onMoneyChange = (id) => ambassadors.syncOrder("store", id);
  const marketplace = new MarketplaceService(app.db, app.env, app.gateway, app.mailer, app.log);
  marketplace.notifyUser = notifyUser;
  app.decorate("marketplace", marketplace);
  marketplace.onMoneyChange = (id) => ambassadors.syncOrder("marketplace", id);
  const live = new LiveService(app.db, app.env, app.log);
  app.decorate("live", live);
  const weather = new WeatherService(new PostgresWeatherRepository(app.db), app.env, app.log);
  app.decorate("weather", weather);
  const weatherGateway = app.env.WEATHER_SERVICE_URL
    ? new WeatherServiceGateway(app.env.WEATHER_SERVICE_URL, app.env.WEATHER_SERVICE_TOKEN!, app.log)
    : undefined;
  const mediaStorage: MediaStorage = app.env.MEDIA_STORAGE === "s3"
    ? new S3Storage({ endpoint: app.env.S3_ENDPOINT ?? `https://s3.${app.env.S3_REGION}.amazonaws.com`, region: app.env.S3_REGION, bucket: app.env.S3_BUCKET!, accessKey: app.env.S3_ACCESS_KEY_ID!, secretKey: app.env.S3_SECRET_ACCESS_KEY!, prefix: app.env.S3_PREFIX, pathStyle: app.env.S3_PATH_STYLE })
    : new LocalStorage(path.resolve(app.env.MEDIA_DIR));
  app.decorate("mediaStorage", mediaStorage);
  app.decorate("scanner", createScanner(app.env));
  app.decorate("mediaFetcher", { fn: defaultFetcher });
  // Fase 9.1: cola Redis opcional para telemetría de alto volumen (analítica anónima); sin REDIS_URL sigue insertando directo.
  const telemetryQueue = new TelemetryQueue(app.env.REDIS_URL, app.log);
  app.decorate("telemetryQueue", telemetryQueue);
  app.addHook("onClose", async () => { await telemetryQueue.close(); });
  const game = new GameService(app.db, insertNotification);
  const contentReader = app.env.CONTENT_SERVICE_URL
    ? new HttpContentReader(app.env.CONTENT_SERVICE_URL, app.env.CONTENT_SERVICE_TOKEN!, app.log)
    : new PostgresContentReader(app.db);
  app.decorate("game", game);
  app.decorate("play", new PlayService(app.db, game));
  app.decorate("explore", new ExploreService(app.db, game, contentReader, userFlags));
  app.decorate("trips", new TripService(app.db, game, contentReader, insertNotification));
  app.decorate("ai", new AiService(app.db, app.env, createAiProvider(app.env), app.log, contentReader, businessVerification));
  app.decorate("community", new CommunityGame(app.db, game, mediaReview));
  const sponsorship = new SponsorshipService(app.db);
  app.decorate("sponsorship", sponsorship);
  const creators = new CreatorService(app.db);
  app.decorate("creators", creators);
  const products = new TransactionalProductsService(app.db);
  app.decorate("products", products);
  const memberships = new MembershipsAndTicketingService(app.db);
  app.decorate("membershipsService", memberships);
  const invoicing = new FiscalInvoicingService(app.db);
  app.decorate("invoicingService", invoicing);
  const ical = new IcalService(app.db, app.log);
  const automations = new AutomationService(app.db, app.env, app.mailer, ical, app.log);
  app.decorate("ical", ical);
  app.decorate("automations", automations);
  const payouts = new PayoutService(app.db, app.mailer);
  const runner = new JobRunner(app.db, app.log);
  app.decorate("payouts", payouts);
  app.decorate("jobs", runner);
  registerGameJobs(app, runner);
  runner.register({ name: "fx.refresh", description: "Tasas de cambio desde el proveedor (cada 30 min)", everySeconds: 1800, run: async () => ({ ...(await live.refreshRates()) }) });
  if (!weatherGateway && !app.env.WEATHER_WRITES_FROZEN) runner.register({ name: "weather.refresh", description: "Clima y pronóstico de las ciudades principales (cada 30 min)", everySeconds: 1800, run: async () => ({ ...(await weather.refreshWeather()) }) });
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
        user_geo_events: await q("DELETE FROM user_geo_events WHERE at < now() - interval '30 days'"),
        store_carts: await q("DELETE FROM store_carts WHERE user_id IS NULL AND updated_at < now() - interval '30 days'"),
      };
    },
  });
  runner.register({ name: "orders.auto_cancel", description: "Cancela pedidos de la tienda sin cobrar tras 60 min y devuelve stock y cupón", everySeconds: 900, run: async () => ({ cancelled: await store.cancelUnpaid(60) }) });
  runner.register({ name: "marketplace.auto_cancel", description: "Cancela pedidos del marketplace sin cobrar tras 60 min y devuelve el stock", everySeconds: 900, run: async () => ({ cancelled: await marketplace.cancelUnpaid(60) }) });
  runner.register({ name: "marketplace.payouts", description: "Genera las liquidaciones a vendedores de lo entregado y sin devolución", everySeconds: 86_400, run: async () => marketplace.generatePayouts() });
  runner.register({ name: "ambassadors.settle", description: "Libera las comisiones de embajadores cuyo periodo de espera terminó", everySeconds: 3600, run: async () => ambassadors.settle() });
  registerImportJobs(runner, imports);
  registerOperatorJobs({ db: app.db, env: app.env, mailer: app.mailer, runner, automations, ical, payouts });
  registerAccountJobs({ db: app.db, runner, participants: [(c, userId) => identity.anonymizeAccount(userId, c), eraseProfileData, eraseNotifications, eraseOperatorData, eraseSupportData] });
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
      await v1.register(async (meApp) => meRoutes(meApp, { verifyPassword }));
      // Catálogo de capacidades y auditoría visual de permisos (Plan de accesos, puntos 58/66/70): recibe el
      // inventario de rutas ya construido por el hook onRoute de app.ts para poder contrastarlo con el catálogo.
      await v1.register(accessRoutes, { routeTable: app.routeTable });
      await v1.register(formsRoutes);
      await v1.register(reviewRoutes);
      await v1.register(socialRoutes);
      await v1.register(campaignRoutes);
      await v1.register(gameRoutes);
      await v1.register(storeRoutes);
      await v1.register(async (discoverApp) => discoverRoutes(discoverApp, {
        contentReader,
        searchAnalytics: new PostgresSearchAnalytics(app.db),
        publicSettings: new PostgresPublicSettingsReader(app.db),
        favorites: new PostgresFavoritesReader(app.db),
      }));
      await v1.register(weatherRoutes);
      await v1.register(async (liveApp) => liveRoutes(liveApp, {
        runRefreshJob: (source, requestId, actorId) => source === "weather" && weatherGateway
          ? weatherGateway.refresh(actorId)
          : runner.runNow(source === "fx" ? "fx.refresh" : "weather.refresh", { requestId }),
        // Adaptador temporal: el catálogo `events` sigue siendo compartido; su ownership candidato es content.
        eventsNow: async () => (await app.db.query(
          "SELECT id, title, slug, start_date, end_date, location, image_url FROM events WHERE status = 'published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()) AND start_date <= $1::date AND coalesce(end_date, start_date) >= $1::date ORDER BY start_date LIMIT 50",
          [todayInSantoDomingo()],
        )).rows,
      }));
      await v1.register(toolsRoutes);
      await v1.register(marketingRoutes);
      await v1.register(analyticsRoutes);
      await v1.register(i18nRoutes);
      await v1.register(mediaRoutes);
      await v1.register(gameAdminRoutes);
      await v1.register(exploreRoutes);
      await v1.register(tripRoutes);
      await v1.register(aiRoutes);
      await v1.register(emailAdminRoutes);
      await v1.register(notificationRoutes);
      await v1.register(adminSecurityRoutes);
      await v1.register(adminSupportRoutes);
      const communityDecisions = communityModeration(app.db, game, app.log);
      await v1.register(async (moderationApp) => adminModerationRoutes(moderationApp, {
        screenReview,
        decide: {
          review: communityDecisions.review, post: communityDecisions.post, comment: communityDecisions.comment,
          ugc_media: communityDecisions.ugc_media, report: communityDecisions.report,
          media: mediaModeration(app.db, app.mediaStorage),
          creator_video: creatorVideoModeration(app.db),
        },
        closeReport: communityDecisions.closeReport,
      }));
      await v1.register(impersonationRoutes);
      await v1.register(adminImportRoutes);
      await v1.register(emailWebhookRoutes);
      await v1.register(marketplaceRoutes);
      await v1.register(ambassadorRoutes);
      await v1.register(paymentWebhookRoutes);
      await v1.register(sponsorshipRoutes);
      await v1.register(creatorRoutes);
      await v1.register(transactionalProductsRoutes);
      await v1.register(membershipsRoutes);
      await v1.register(fiscalInvoiceRoutes);
    },
    { prefix: "/api/v1" },
  );
  // El versionado es exclusivo: toda ruta de API vive bajo /api/v1 (gobierno de compatibilidad, docs §3.1).
  // Sólo el sitemap/SEO se registra en la raíz porque lo consumen rastreadores sin prefijo.
  await app.register(seoRoutes);
}
