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
  /** Dónde viven los contadores: memory (una instancia) · postgres (varias instancias, sin infraestructura extra) · redis (varias instancias, más rápido). */
  RATE_LIMIT_STORE: z.enum(["memory", "postgres", "redis"]).default("memory"),
  REDIS_URL: z.string().optional(),
  DOCS_ENABLED: bool.default(true),
  /** Tasa de respaldo USD→DOP cuando aún no hay `exchange_rates` cargadas. */
  DEFAULT_USD_DOP: z.coerce.number().positive().default(59.8),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  /** Claves PEM (RS256) para firmar/verificar JWT. En desarrollo y pruebas se generan al arrancar si faltan; en producción son obligatorias. */
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  /** Claves públicas anteriores (arreglo JSON de PEM) que siguen validando tokens ya emitidos durante una rotación. */
  JWT_PREVIOUS_PUBLIC_KEYS: z.string().optional().transform((v, ctx) => {
    if (!v?.trim()) return [] as string[];
    try {
      const parsed: unknown = JSON.parse(v);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) return parsed as string[];
    } catch { /* cae al error de abajo */ }
    ctx.addIssue({ code: "custom", message: "debe ser un arreglo JSON de claves públicas PEM" });
    return z.NEVER;
  }),
  /** Clave AES-256 (32 bytes en base64) que cifra los secretos TOTP en reposo. Obligatoria en producción. */
  TOTP_ENCRYPTION_KEY: z.string().optional(),
  TOTP_ISSUER: z.string().default("Descubre RD"),
  /** Exige 2FA a admin/editor/moderator para usar rutas de personal. Por defecto: sí en producción, no en desarrollo. */
  REQUIRE_2FA_FOR_STAFF: bool.optional(),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().min(30).default(900),
  REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  LOGIN_MAX_FAILURES: z.coerce.number().int().min(1).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).default(15),
  WEB_BASE_URL: z.string().url().default("http://localhost:8080"),
  MAIL_FROM: z.string().default("Descubre RD <no-reply@descubre.local>"),
  /** log: imprime el correo en el log (desarrollo) · smtp: envía por SMTP (Mailpit/SES) · memory: pruebas. */
  MAIL_TRANSPORT: z.enum(["log", "smtp", "memory"]).default("log"),
  /** Trabajador que vacía la cola de correo dentro de este proceso (se puede apagar y correr aparte). */
  MAIL_WORKER_ENABLED: bool.default(true),
  MAIL_POLL_MS: z.coerce.number().int().min(200).default(2000),
  MAIL_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: bool.default(false),
  /** Límites por ruta de autenticación (registro, login, olvidé mi contraseña). Se desactivan en pruebas. */
  AUTH_RATE_LIMIT_ENABLED: bool.default(true),
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
  if (env.NODE_ENV === "production") {
    if (!env.JWT_PRIVATE_KEY || !env.JWT_PUBLIC_KEY) throw new Error("Configuración inválida: JWT_PRIVATE_KEY y JWT_PUBLIC_KEY son obligatorias en producción");
    if (!env.TOTP_ENCRYPTION_KEY) throw new Error("Configuración inválida: TOTP_ENCRYPTION_KEY es obligatoria en producción");
    if (env.MAIL_TRANSPORT === "memory") throw new Error("Configuración inválida: MAIL_TRANSPORT=memory no está permitido en producción");
  }
  env.REQUIRE_2FA_FOR_STAFF ??= env.NODE_ENV === "production";
  if (env.TOTP_ENCRYPTION_KEY && Buffer.from(env.TOTP_ENCRYPTION_KEY, "base64").length !== 32) throw new Error("Configuración inválida: TOTP_ENCRYPTION_KEY debe ser de 32 bytes en base64");
  if (env.RATE_LIMIT_STORE === "redis" && !env.REDIS_URL) throw new Error("Configuración inválida: RATE_LIMIT_STORE=redis requiere REDIS_URL");
  if (env.NODE_ENV === "test" && !source.MAIL_TRANSPORT) env.MAIL_TRANSPORT = "memory";
  if (env.NODE_ENV === "test" && source.MAIL_WORKER_ENABLED === undefined) env.MAIL_WORKER_ENABLED = false; // las pruebas vacían la cola con drain()
  if (env.NODE_ENV === "production" && env.DOCS_ENABLED && !source.DOCS_ENABLED) env.DOCS_ENABLED = false; // en producción la documentación es explícita
  return env;
}
