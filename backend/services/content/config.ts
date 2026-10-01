import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CONTENT_DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  CONTENT_SERVICE_TOKEN: z.string().min(32),
});

export type ContentServiceConfig = z.infer<typeof configSchema>;

export function loadContentConfig(source: NodeJS.ProcessEnv = process.env): ContentServiceConfig {
  const parsed = configSchema.safeParse(source);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Configuración inválida para content: ${detail}`);
  }
  return parsed.data;
}
