import type { Env } from "./config/env.js";
import type { Db } from "./db/pool.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
    env: Env;
  }
}
