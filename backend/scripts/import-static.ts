// Carga en la base el contenido que hoy vive embebido en el frontend (src/data/*.ts), sin modificar esos archivos.
//   npm run db:import-static                    (todo)
//   npm run db:import-static -- --dry-run       (simula: hace todo dentro de una transacción y la revierte)
//   npm run db:import-static -- --only beaches,hotels
// Es idempotente: repetirlo no duplica ni pisa lo que el equipo haya editado después en el CMS.
import pg from "pg";
import { runImport } from "./static/run.js";

const flag = (n: string) => process.argv.includes(`--${n}`);
const only = (() => { const i = process.argv.indexOf("--only"); return i >= 0 ? (process.argv[i + 1] ?? "").split(",").filter(Boolean) : []; })();
const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd";
const dry = flag("dry-run");

const pool = new pg.Pool({ connectionString: url, max: 1 });
const c = await pool.connect();
try {
  await c.query("BEGIN");
  console.log(`${dry ? "SIMULACIÓN (no se guarda nada)" : "Carga real"} en ${new URL(url).pathname.slice(1)}\n`);
  const res = await runImport(c, { only, log: console.log });
  await c.query(dry ? "ROLLBACK" : "COMMIT");
  const n = (k: "source" | "inserted" | "existing" | "skipped") => res.reduce((s, r) => s + r[k], 0);
  console.log(`\nTotal: origen ${n("source")} · nuevas ${n("inserted")} · ya existían ${n("existing")} · omitidas ${n("skipped")}`);
  const errors = res.flatMap((r) => r.errors.map((e) => `  ${r.key}: ${e}`));
  if (errors.length) { console.log(`\n${errors.length} problema(s):\n${errors.slice(0, 40).join("\n")}`); process.exitCode = 1; }
} catch (e) {
  await c.query("ROLLBACK").catch(() => undefined);
  console.error("Error:", (e as Error).message);
  process.exitCode = 1;
} finally { c.release(); await pool.end(); }
