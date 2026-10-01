// Verificador de enlaces del directorio (mejora 70 del plan maestro).
// Recorre las columnas de URL externas del contenido publicado y reporta las que no responden.
// Uso: npm run check:links -- [--limit=200] [--timeout=8000] [--json]
// Sale con código 1 si hay enlaces rotos, para poder programarlo y alertar.
import pg from "pg";
import { COLLECTIONS } from "../src/contracts/content-collections.js";
import { contentVisibility } from "../src/contracts/content-visibility.js";
import { hasContentColumn } from "../src/contracts/content-schema.js";
import { assertPublicUrl } from "../src/lib/public-url.js";

const URL_COLUMNS = ["website", "website_url", "booking_url", "external_url", "source_url", "video_url"];
const arg = (name: string, fallback: number) => Number(process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback);
const limit = arg("limit", 200), timeoutMs = arg("timeout", 8000), asJson = process.argv.includes("--json");

export type LinkResult = { table: string; id: string; column: string; url: string; problem: string };

/** Comprueba un enlace: HEAD y, si el servidor no lo admite, GET. Devuelve el problema o null si responde bien. */
export async function probe(url: string, fetchImpl: typeof fetch = fetch, timeout = 8000): Promise<string | null> {
  try { await assertPublicUrl(url); } catch (error) { return error instanceof Error ? error.message : "URL no permitida"; }
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetchImpl(url, { method, redirect: "follow", signal: AbortSignal.timeout(timeout), headers: { "user-agent": "DescubreRD-LinkCheck/1.0" } });
      if (res.status < 400) return null;
      if (method === "HEAD" && (res.status === 405 || res.status === 403 || res.status === 501)) continue;
      return `HTTP ${res.status}`;
    } catch (error) {
      if (method === "GET") return error instanceof Error && error.name === "TimeoutError" ? "sin respuesta" : "no se pudo conectar";
    }
  }
  return "no se pudo conectar";
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd" });
  const broken: LinkResult[] = [];
  let checked = 0;
  try {
    for (const def of COLLECTIONS) {
      for (const column of URL_COLUMNS.filter((c) => hasContentColumn(def.table, c))) {
        if (checked >= limit) break;
        const { rows } = await pool.query<{ id: string; url: string }>(
          `SELECT id::text AS id, "${column}" AS url FROM "${def.table}" WHERE ${contentVisibility(def)} AND "${column}" LIKE 'http%' LIMIT $1`, [limit - checked],
        );
        for (const row of rows) {
          checked++;
          const problem = await probe(row.url, fetch, timeoutMs);
          if (problem) broken.push({ table: def.table, id: row.id, column, url: row.url, problem });
        }
      }
    }
  } finally {
    await pool.end();
  }
  if (asJson) console.log(JSON.stringify({ checked, broken }, null, 1));
  else {
    console.log(`Enlaces revisados: ${checked}. Rotos: ${broken.length}.`);
    for (const b of broken) console.log(`  ${b.table}/${b.id} ${b.column}: ${b.url} → ${b.problem}`);
  }
  if (broken.length) process.exitCode = 1;
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/check-links.ts")) await main();
