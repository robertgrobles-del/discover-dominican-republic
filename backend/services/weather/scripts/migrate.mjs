#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const args = new Set(process.argv.slice(2));
for (const arg of args) if (arg !== "--check" && arg !== "--help") throw new Error(`Argumento no reconocido: ${arg}`);
if (args.size > 1) throw new Error("Usa sólo --check o --help.");
if (args.has("--help")) {
  console.log("Uso: node scripts/migrate.mjs [--check]");
  console.log("Requiere WEATHER_DATABASE_URL. Por defecto aplica migraciones; --check sólo valida estado y checksums.");
  process.exit(0);
}

const connectionString = process.env.WEATHER_DATABASE_URL;
if (!connectionString) throw new Error("WEATHER_DATABASE_URL es obligatoria; no se acepta DATABASE_URL genérica.");
const { Client } = pg;
const client = new Client({ connectionString, application_name: "descubre-weather-migrations" });
const here = dirname(fileURLToPath(import.meta.url));
const migrationDir = join(here, "..", "migrations");
const lockId = "DWTHR001";
let locked = false;

try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(hashtextextended($1, 0))", [lockId]);
  locked = true;
  await client.query("SET search_path TO public");
  const ledgerExists = (await client.query("SELECT to_regclass('public.weather_schema_migrations') IS NOT NULL AS present")).rows[0].present;
  if (!ledgerExists && args.has("--check")) throw new Error("No existe weather_schema_migrations; ejecuta npm run weather:migrate.");
  if (!ledgerExists) await client.query(`CREATE TABLE weather_schema_migrations (
    name text PRIMARY KEY,
    checksum_sha256 text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const files = (await readdir(migrationDir)).filter((name) => /^\d{3}_[a-z0-9_-]+\.sql$/.test(name)).sort();
  const appliedRows = (await client.query("SELECT name, checksum_sha256 FROM weather_schema_migrations ORDER BY name")).rows;
  const applied = new Map(appliedRows.map((row) => [row.name, row.checksum_sha256]));
  const pending = [];
  for (const name of files) {
    const sql = await readFile(join(migrationDir, name), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    if (applied.has(name)) {
      if (applied.get(name) !== checksum) throw new Error(`Checksum distinto para ${name}; no edites una migración aplicada. Crea una nueva migración.`);
    } else pending.push({ name, sql, checksum });
  }
  const unknown = [...applied.keys()].filter((name) => !files.includes(name));
  if (unknown.length) throw new Error(`La base registra migraciones ausentes del servicio: ${unknown.join(", ")}`);
  const identity = (await client.query("SELECT current_database() AS database_name")).rows[0];
  console.log(`Base weather: ${identity.database_name}. Aplicadas: ${applied.size}; pendientes: ${pending.length}.`);
  if (args.has("--check")) {
    if (pending.length) throw new Error(`Faltan migraciones: ${pending.map((item) => item.name).join(", ")}`);
    console.log("Esquema weather al día; checksums verificados.");
  } else {
    for (const migration of pending) {
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query("INSERT INTO weather_schema_migrations (name, checksum_sha256) VALUES ($1, $2)", [migration.name, migration.checksum]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
      console.log(`Aplicada ${migration.name}.`);
    }
    console.log("Migraciones weather completadas.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (locked) await client.query("SELECT pg_advisory_unlock(hashtextextended($1, 0))", [lockId]).catch(() => undefined);
  await client.end().catch(() => undefined);
}
