import { z } from "zod";

const bool = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.string().url().default("postgres://postgres:postgres@localhost:5434/descubre_rd"),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  /** Orígenes permitidos por CORS, separados por comas (portal, paneles, staging). */
  CORS_ORIGINS: z.string().default("http://localhost:8080,http://localhost:5173"),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(120),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
  DOCS_ENABLED: bool.default(true),
  /** Tasa de respaldo USD→DOP cuando aún no hay `exchange_rates` cargadas. */
  DEFAULT_USD_DOP: z.coerce.number().positive().default(59.8),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  FEATURE_CHECKOUT: bool.default(false),
  FEATURE_AI_CHAT: bool.default(false),
  FEATURE_OPERATORS: bool.default(true),
  FEATURE_STORE: bool.default(true),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Configuración inválida: ${detail}`);
  }
  const env = parsed.data;
  if (env.NODE_ENV === "production" && env.DOCS_ENABLED && !source.DOCS_ENABLED) env.DOCS_ENABLED = false; // en producción la documentación es explícita
  return env;
}
