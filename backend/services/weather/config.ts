import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  WEATHER_DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  WEATHER_PROVIDER: z.enum(["none", "openweather"]).default("none"),
  OPENWEATHER_API_KEY: z.string().min(10).optional(),
  WEATHER_REFRESH_ENABLED: z.enum(["true", "false", "1", "0"]).default("false").transform((value) => value === "true" || value === "1"),
  WEATHER_REFRESH_INTERVAL_SECONDS: z.coerce.number().int().min(60).max(86_400).default(1800),
  DOCS_ENABLED: z.enum(["true", "false", "1", "0"]).default("false").transform((value) => value === "true" || value === "1"),
  WEATHER_SERVICE_TOKEN: z.string().min(32).optional(),
});

export type WeatherServiceConfig = z.infer<typeof configSchema>;

export function loadWeatherConfig(source: NodeJS.ProcessEnv = process.env): WeatherServiceConfig {
  const parsed = configSchema.safeParse(source);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Configuración inválida para weather: ${detail}`);
  }
  if (parsed.data.WEATHER_PROVIDER === "openweather" && !parsed.data.OPENWEATHER_API_KEY) {
    throw new Error("Configuración inválida para weather: OPENWEATHER_API_KEY es obligatoria con WEATHER_PROVIDER=openweather");
  }
  if (parsed.data.WEATHER_REFRESH_ENABLED && parsed.data.WEATHER_PROVIDER !== "openweather") {
    throw new Error("Configuración inválida para weather: el refresh requiere WEATHER_PROVIDER=openweather");
  }
  return parsed.data;
}
