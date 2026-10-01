import { z } from "zod";

const bool = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");

/** Cada entrada de TRUST_PROXY debe ser una IP (v4/v6) o un CIDR. */
const TRUST_PROXY_ITEM = /^(?:(?:\d{1,3}\.){3}\d{1,3}|[0-9a-fA-F:]+)(?:\/\d{1,3})?$/;
const trustProxyShape = (v: string) => ["", "false", "true"].includes(v) || /^\d+$/.test(v) || v.split(",").every((x) => TRUST_PROXY_ITEM.test(x.trim()));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),
  /** Proxies de confianza para X-Forwarded-For: false | true | nº de saltos | lista de IP/CIDR. Por defecto ninguno (no se acepta la cabecera): nadie puede falsear su IP para evadir los límites. El formato se valida al arrancar y en producción no se admite "true". */
  TRUST_PROXY: z.string().default("false").refine(trustProxyShape, "debe ser \"false\", \"true\", un número de saltos o una lista de IP/CIDR separadas por comas"),
  /** Si se define, habilita GET /metrics (Prometheus) con `Authorization: Bearer <token>`. */
  METRICS_TOKEN: z.string().min(16).optional(),
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
  /** Secreto para firmar enlaces sin estado (baja de newsletter). Obligatorio en producción. */
  APP_SECRET: z.string().min(32).optional(),
  TOTP_ISSUER: z.string().default("Descubre RD"),
  /** Exige 2FA a admin/editor/moderator para usar rutas de personal. Por defecto: sí en producción, no en desarrollo. */
  REQUIRE_2FA_FOR_STAFF: bool.optional(),
  /** Inicio de sesión con Google (OIDC). Sin CLIENT_ID/SECRET el proveedor queda desactivado. ISSUER sólo se cambia en pruebas. */
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  OAUTH_GOOGLE_ISSUER: z.string().url().default("https://accounts.google.com"),
  /** Destinos permitidos tras el login social (además de WEB_BASE_URL y CORS_ORIGINS), separados por comas. */
  OAUTH_REDIRECT_ALLOWLIST: z.string().default(""),
  /** Pasarela de pago: fake (simulador, sólo desarrollo/pruebas) | none (sin cobros en línea). Las reales se agregan como implementaciones de PaymentGateway. */
  PAYMENT_PROVIDER: z.enum(["fake", "none", "stripe", "azul", "cardnet"]).optional(),
  /** Pasarelas locales: integración preliminar. En producción exigen confirmar que se validaron contra el sandbox del adquirente. */
  PAYMENT_LOCAL_GATEWAY_VALIDATED: bool.default(false),
  AZUL_BASE_URL: z.string().url().default("https://pruebas.azul.com.do/webservices/JSON/Default.aspx"),
  AZUL_MERCHANT_ID: z.string().min(3).optional(),
  AZUL_AUTH1: z.string().min(3).optional(),
  AZUL_AUTH2: z.string().min(3).optional(),
  /** Certificado y llave de cliente (PEM) para el TLS mutuo que exige Azul. */
  AZUL_CERT_PATH: z.string().optional(),
  AZUL_KEY_PATH: z.string().optional(),
  CARDNET_BASE_URL: z.string().url().default("https://lab.cardnet.com.do/servicios/tokens/v1"),
  CARDNET_PRIVATE_KEY: z.string().min(10).optional(),
  STRIPE_SECRET_KEY: z.string().min(10).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),
  /** Secreto con el que el proveedor de correo firma sus eventos (entrega, rebote, queja). Sin él, /webhooks/email queda apagado. */
  EMAIL_WEBHOOK_SECRET: z.string().min(16).optional(),
  /** Web Push (VAPID). Con ambas claves se envían push a los dispositivos registrados; genera el par con `npx web-push generate-vapid-keys`. */
  VAPID_PUBLIC_KEY: z.string().min(20).optional(),
  VAPID_PRIVATE_KEY: z.string().min(20).optional(),
  VAPID_SUBJECT: z.string().default("mailto:soporte@descubre.local"),
  /** Asistente de IA: none (apagado) | fake (simulador, sólo desarrollo/pruebas) | anthropic (requiere ANTHROPIC_API_KEY). */
  AI_PROVIDER: z.enum(["none", "fake", "anthropic"]).optional(),
  ANTHROPIC_API_KEY: z.string().min(10).optional(),
  AI_MODEL: z.string().default("claude-sonnet-5"),
  AI_MODEL_LIGHT: z.string().default("claude-haiku-4-5-20251001"),
  /** Solicitudes de IA por usuario y día (el personal tiene 10 veces más) y tope global de gasto diario en USD. */
  AI_DAILY_LIMIT_USER: z.coerce.number().int().min(1).default(20),
  AI_DAILY_BUDGET_USD: z.coerce.number().min(0).default(20),
  /** Proveedores de datos vivos: none (sin llamadas externas) | open_er_api (tasas) | openweather (clima, requiere OPENWEATHER_API_KEY). */
  FX_PROVIDER: z.enum(["none", "open_er_api"]).default("none"),
  FX_SPREAD_PCT: z.coerce.number().min(0).max(10).default(1),
  WEATHER_PROVIDER: z.enum(["none", "openweather"]).default("none"),
  OPENWEATHER_API_KEY: z.string().min(10).optional(),
  /** Ventana de corte: bloquea escrituras/refresh del clima en el facade hasta que el proxy al dueño nuevo esté listo. */
  WEATHER_WRITES_FROZEN: bool.default(false),
  /** Facade → servicio weather; ambos procesos comparten WEATHER_SERVICE_TOKEN para firmar comandos internos breves. */
  WEATHER_SERVICE_URL: z.string().url().optional(),
  WEATHER_SERVICE_TOKEN: z.string().min(32).optional(),
  /** Facade → servicio content: las lecturas de catálogo de otros dominios salen por HTTP en vez de la base compartida. */
  CONTENT_SERVICE_URL: z.string().url().optional(),
  CONTENT_SERVICE_TOKEN: z.string().min(32).optional(),
  /** Carpeta de las imágenes subidas (almacenamiento local). Con varios servidores se usa un almacenamiento compartido (S3). */
  MEDIA_DIR: z.string().default("storage/media"),
  /** Dónde viven los archivos subidos: local (disco; un solo servidor) | s3 (S3, MinIO, R2, Spaces…; varios servidores). */
  MEDIA_STORAGE: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PREFIX: z.string().default("media/"),
  /** true: el bucket va en la ruta (MinIO y la mayoría de compatibles); false: en el host (AWS S3 clásico). */
  S3_PATH_STYLE: bool.default(true),
  /** Antivirus de las subidas: none | clamd (ClamAV por TCP). Si el análisis no responde, el archivo no se aprueba y se puede reintentar. */
  AV_PROVIDER: z.enum(["none", "clamd"]).default("none"),
  CLAMAV_HOST: z.string().default("127.0.0.1"),
  CLAMAV_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
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
  /** Trabajos programados de Operadores RD (recordatorios, solicitudes de reseña, sincronización de calendarios). */
  JOBS_ENABLED: bool.default(true),
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
    const origins = env.CORS_ORIGINS.split(",").map((x) => x.trim()).filter(Boolean);
    if (!origins.length || origins.includes("*") || origins.some((o) => !/^https:\/\//.test(o))) throw new Error("Configuración inválida: en producción CORS_ORIGINS debe listar orígenes https concretos (sin \"*\" ni http)");
    if (/\/\/postgres:postgres@/.test(env.DATABASE_URL)) throw new Error("Configuración inválida: DATABASE_URL usa las credenciales por defecto de desarrollo");
    if (!env.APP_SECRET) throw new Error("Configuración inválida: APP_SECRET (mínimo 32 caracteres) es obligatoria en producción");
    if (!env.TOTP_ENCRYPTION_KEY) throw new Error("Configuración inválida: TOTP_ENCRYPTION_KEY es obligatoria en producción");
    if (env.TRUST_PROXY === "true") throw new Error("Configuración inválida: en producción TRUST_PROXY no puede ser \"true\" (cualquiera podría falsear su IP en X-Forwarded-For); indica el número de saltos del proxy o su lista de IP/CIDR");
    if (env.MAIL_TRANSPORT !== "smtp") throw new Error("Configuración inválida: en producción MAIL_TRANSPORT debe ser smtp; \"log\" y \"memory\" no entregan correo real");
  }
  env.APP_SECRET ??= "dev-only-app-secret-change-me-0123456789"; // sólo llega aquí sin valor fuera de producción
  env.REQUIRE_2FA_FOR_STAFF ??= env.NODE_ENV === "production";
  env.PAYMENT_PROVIDER ??= env.NODE_ENV === "production" ? "none" : "fake";
  if (env.NODE_ENV === "production" && env.PAYMENT_PROVIDER === "fake") throw new Error("Configuración inválida: PAYMENT_PROVIDER=fake no está permitido en producción");
  if (!!env.VAPID_PUBLIC_KEY !== !!env.VAPID_PRIVATE_KEY) throw new Error("Configuración inválida: VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY van juntas");
  env.AI_PROVIDER ??= env.NODE_ENV === "production" ? "none" : "fake";
  if (env.NODE_ENV === "production" && env.AI_PROVIDER === "fake") throw new Error("Configuración inválida: AI_PROVIDER=fake no está permitido en producción");
  if (env.AI_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) throw new Error("Configuración inválida: AI_PROVIDER=anthropic requiere ANTHROPIC_API_KEY");
  if (env.MEDIA_STORAGE === "s3" && (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY)) throw new Error("Configuración inválida: MEDIA_STORAGE=s3 requiere S3_BUCKET, S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY");
  if (env.PAYMENT_PROVIDER === "azul" && (!env.AZUL_MERCHANT_ID || !env.AZUL_AUTH1 || !env.AZUL_AUTH2 || !env.AZUL_CERT_PATH || !env.AZUL_KEY_PATH)) throw new Error("Configuración inválida: PAYMENT_PROVIDER=azul requiere AZUL_MERCHANT_ID, AZUL_AUTH1, AZUL_AUTH2, AZUL_CERT_PATH y AZUL_KEY_PATH");
  if (env.PAYMENT_PROVIDER === "cardnet" && !env.CARDNET_PRIVATE_KEY) throw new Error("Configuración inválida: PAYMENT_PROVIDER=cardnet requiere CARDNET_PRIVATE_KEY");
  if (env.NODE_ENV === "production" && (env.PAYMENT_PROVIDER === "azul" || env.PAYMENT_PROVIDER === "cardnet") && !env.PAYMENT_LOCAL_GATEWAY_VALIDATED) throw new Error("Configuración inválida: las pasarelas azul y cardnet son preliminares; valida la integración en el sandbox del adquirente y define PAYMENT_LOCAL_GATEWAY_VALIDATED=true");
  if (env.PAYMENT_PROVIDER === "stripe" && (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)) throw new Error("Configuración inválida: PAYMENT_PROVIDER=stripe requiere STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET");
  if (env.WEATHER_PROVIDER === "openweather" && !env.OPENWEATHER_API_KEY) throw new Error("Configuración inválida: WEATHER_PROVIDER=openweather requiere OPENWEATHER_API_KEY");
  if (!!env.WEATHER_SERVICE_URL !== !!env.WEATHER_SERVICE_TOKEN) throw new Error("Configuración inválida: WEATHER_SERVICE_URL y WEATHER_SERVICE_TOKEN deben configurarse juntos");
  if (env.NODE_ENV === "production" && env.WEATHER_SERVICE_URL && new URL(env.WEATHER_SERVICE_URL).protocol !== "https:") throw new Error("Configuración inválida: WEATHER_SERVICE_URL debe usar HTTPS en producción");
  if (!!env.CONTENT_SERVICE_URL !== !!env.CONTENT_SERVICE_TOKEN) throw new Error("Configuración inválida: CONTENT_SERVICE_URL y CONTENT_SERVICE_TOKEN deben configurarse juntos");
  if (env.NODE_ENV === "production" && env.CONTENT_SERVICE_URL && new URL(env.CONTENT_SERVICE_URL).protocol !== "https:") throw new Error("Configuración inválida: CONTENT_SERVICE_URL debe usar HTTPS en producción");
  if (env.TOTP_ENCRYPTION_KEY && Buffer.from(env.TOTP_ENCRYPTION_KEY, "base64").length !== 32) throw new Error("Configuración inválida: TOTP_ENCRYPTION_KEY debe ser de 32 bytes en base64");
  if (!!env.OAUTH_GOOGLE_CLIENT_ID !== !!env.OAUTH_GOOGLE_CLIENT_SECRET) throw new Error("Configuración inválida: OAUTH_GOOGLE_CLIENT_ID y OAUTH_GOOGLE_CLIENT_SECRET van juntos");
  if (env.RATE_LIMIT_STORE === "redis" && !env.REDIS_URL) throw new Error("Configuración inválida: RATE_LIMIT_STORE=redis requiere REDIS_URL");
  if (env.NODE_ENV === "test" && !source.MAIL_TRANSPORT) env.MAIL_TRANSPORT = "memory";
  if (env.NODE_ENV === "test" && source.JOBS_ENABLED === undefined) env.JOBS_ENABLED = false; // las pruebas ejecutan automations.run() a mano
  if (env.NODE_ENV === "test" && source.MAIL_WORKER_ENABLED === undefined) env.MAIL_WORKER_ENABLED = false; // las pruebas vacían la cola con drain()
  if (env.NODE_ENV === "production" && env.DOCS_ENABLED && !source.DOCS_ENABLED) env.DOCS_ENABLED = false; // en producción la documentación es explícita
  return env;
}
