// Carga completa desde Strapi: `npm run cms:sync` (todo) o `npm run cms:sync -- destino playa` (modelos concretos).
// Requiere CMS_URL y CMS_API_TOKEN (Strapi: Settings → API Tokens, sólo lectura basta).
import pino from "pino";
import { loadEnv } from "../src/config/env.js";
import { createPool } from "../src/db/pool.js";
import { CmsSyncService } from "../src/modules/cms/sync.js";

const env = loadEnv();
const db = createPool(env);
const cms = new CmsSyncService(env, db, pino({ level: "warn" }));
try {
  if (!cms.canFetch) throw new Error("Configura CMS_URL y CMS_API_TOKEN");
  const models = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const summary = await cms.backfill(models.length ? models : undefined);
  for (const s of summary) console.log(`${s.model.padEnd(12)} ${s.locale}  aplicadas ${s.applied}  ignoradas ${s.ignored}  errores ${s.errors}`);
  if (summary.some((s) => s.errors)) process.exitCode = 1;
} catch (e) {
  console.error((e as Error).message);
  process.exitCode = 1;
} finally {
  await db.end();
}
