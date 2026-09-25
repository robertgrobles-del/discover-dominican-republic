import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PUBLIC_CACHE } from "../../plugins/etag.js";

const LOCALES = [
  { code: "es", name: "Español", default: true },
  { code: "en", name: "English", default: false },
  { code: "fr", name: "Français", default: false },
  { code: "de", name: "Deutsch", default: false },
  { code: "pt", name: "Português", default: false },
  { code: "it", name: "Italiano", default: false },
];

const schema = z.object({
  data: z.object({
    locales: z.array(z.object({ code: z.string(), name: z.string(), default: z.boolean() })),
    currencies: z.array(z.string()),
    default_currency: z.string(),
    usd_dop: z.object({ rate: z.number(), source: z.enum(["exchange_rates", "default"]), rate_date: z.string().nullable() }),
    features: z.record(z.string(), z.boolean()),
    api: z.object({ base_url: z.string(), docs_url: z.string().nullable() }),
  }),
});

/** Configuración de arranque para el cliente (docs §5.19): idiomas, monedas, banderas y tasa USD→DOP. */
export async function configRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/config",
    { schema: { tags: ["sistema"], summary: "Configuración pública de arranque", response: { 200: schema } } },
    async (_req, reply) => {
      const { env, db } = app;
      // Tasa de venta vigente USD→DOP; si aún no se cargan tasas se usa la de respaldo de la configuración.
      const { rows } = await db.query<{ sell_rate: number; rate_date: string }>(
        "SELECT sell_rate, rate_date FROM exchange_rates WHERE currency_code = 'USD' ORDER BY rate_date DESC LIMIT 1",
      );
      const row = rows[0];
      reply.header("cache-control", PUBLIC_CACHE);
      return {
        data: {
          locales: LOCALES,
          currencies: ["USD", "DOP"],
          default_currency: "USD",
          usd_dop: row ? { rate: row.sell_rate, source: "exchange_rates" as const, rate_date: row.rate_date } : { rate: env.DEFAULT_USD_DOP, source: "default" as const, rate_date: null },
          features: { checkout: env.FEATURE_CHECKOUT, ai_chat: env.FEATURE_AI_CHAT, operators: env.FEATURE_OPERATORS, store: env.FEATURE_STORE },
          api: { base_url: `${env.PUBLIC_BASE_URL}/api/v1`, docs_url: env.DOCS_ENABLED ? `${env.PUBLIC_BASE_URL}/docs` : null },
        },
      };
    },
  );
}
