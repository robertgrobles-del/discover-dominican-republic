import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { loadEnv, type Env } from "../src/config/env.js";

export const testEnv = (over: Partial<Record<keyof Env, string>> = {}): Env =>
  loadEnv({ NODE_ENV: "test", DATABASE_URL: process.env.TEST_DATABASE_URL!, RATE_LIMIT_MAX: "10000", DOCS_ENABLED: "true", ...over } as NodeJS.ProcessEnv);

export async function makeApp(over: Partial<Record<keyof Env, string>> = {}): Promise<FastifyInstance> {
  const app = await buildApp({ env: testEnv(over) });
  await app.ready();
  return app;
}

export const json = <T = any>(res: { body: string }): T => JSON.parse(res.body) as T;
