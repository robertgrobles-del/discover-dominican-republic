// PostgreSQL local sin Docker: levanta un clúster real (binarios de embedded-postgres) en el puerto 5433.
// Sólo para desarrollo. La vía oficial es `docker compose up -d` (ver README).
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const dir = fileURLToPath(new URL("../.data/pg", import.meta.url));
const port = Number(process.env.EMBEDDED_PG_PORT ?? 5434);
const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port, persistent: true,
  // UTF-8 y colación neutra: el locale por defecto de Windows (WIN1252) rechaza emojis y otros caracteres
  initdbFlags: ["--encoding=UTF8", "--locale=C"] });

if (!existsSync(`${dir}/PG_VERSION`)) await pg.initialise();
await pg.start();
for (const db of ["descubre_rd", "descubre_rd_test"]) {
  try { await pg.createDatabase(db); } catch { /* ya existe */ }
}
console.log(`PostgreSQL embebido listo: postgres://postgres:postgres@localhost:${port}/descubre_rd`);

const stop = async () => { await pg.stop(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => undefined, 1 << 30);
