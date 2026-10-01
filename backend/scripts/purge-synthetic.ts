#!/usr/bin/env node
/**
 * Punto 69 del plan: limpieza de datos sintéticos etiquetados.
 *
 * Borra ÚNICAMENTE las filas marcadas con `is_synthetic = true` (migración 0057) de las cinco
 * tablas que representan personas y cuentas. Las filas reales (is_synthetic = false, el DEFAULT)
 * no se tocan nunca: no hay ningún borrado por patrón de texto ni por fecha.
 *
 * USO:
 *   DATABASE_URL=postgres://... npm run db:purge-synthetic
 *   DATABASE_URL=postgres://... npm run db:purge-synthetic -- --batch seed-bulk
 *
 * `--batch <nombre>` limita el borrado a un lote concreto ('seed-demo', 'seed-bulk', 'seed-mass-faker', …).
 * Sin `--batch` se limpian todos los lotes sintéticos.
 *
 * Orden seguro por claves foráneas: primero las hijas (bookings, reviews, creator_profiles),
 * después partner_profiles y por último users, que es la raíz referenciada por casi todo.
 *
 * IMPORTANTE: no corre en producción (assertNotProduction). Sale con código != 0 si algo falla.
 */
import { Pool, type Pool as PgPool } from "pg";

/** Tablas etiquetadas, en orden seguro de borrado (hijas → raíz). */
export const SYNTHETIC_TABLES = ["bookings", "reviews", "creator_profiles", "partner_profiles", "users"] as const;
export type SyntheticTable = (typeof SYNTHETIC_TABLES)[number];

export interface PurgeResult {
  table: SyntheticTable;
  deleted: number;
  error: string | null;
}

/** Las columnas de etiquetado existen sólo para poder limpiar demos; en producción no hay demos que limpiar. */
export function assertNotProduction(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV === "production") {
    throw new Error("purge-synthetic.ts NO debe ejecutarse en producción: los datos sintéticos nunca deben existir ahí.");
  }
}

/** `--batch <nombre>` → nombre del lote; sin la bandera devuelve null (todos los lotes). */
export function parseBatchArg(argv: string[]): string | null {
  const i = argv.indexOf("--batch");
  if (i === -1) return null;
  const value = argv[i + 1];
  if (!value || value.startsWith("--")) throw new Error("--batch requiere un nombre de lote (p. ej. --batch seed-bulk).");
  return value;
}

/**
 * Borra lo etiquetado tabla por tabla, sin transacción global: cada DELETE es atómico y el resumen
 * final informa qué tabla falló. Un fallo de FK no impide intentar las demás.
 */
export async function purgeSynthetic(pool: PgPool, batch: string | null = null): Promise<PurgeResult[]> {
  const results: PurgeResult[] = [];
  for (const table of SYNTHETIC_TABLES) {
    const sql = batch
      ? `DELETE FROM ${table} WHERE is_synthetic = true AND synthetic_batch = $1`
      : `DELETE FROM ${table} WHERE is_synthetic = true`;
    try {
      const res = await pool.query(sql, batch ? [batch] : []);
      results.push({ table, deleted: res.rowCount ?? 0, error: null });
    } catch (err) {
      results.push({ table, deleted: 0, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

function printSummary(results: PurgeResult[], batch: string | null): void {
  console.log(`\n🧹 Purga de datos sintéticos${batch ? ` (lote "${batch}")` : " (todos los lotes)"}`);
  console.log("=".repeat(58));
  let total = 0;
  for (const r of results) {
    if (r.error) {
      console.log(`   ❌ ${r.table.padEnd(17)} 0 borradas — ${r.error}`);
    } else {
      total += r.deleted;
      console.log(`   ✅ ${r.table.padEnd(17)} ${String(r.deleted).padStart(6)} borradas`);
    }
  }
  console.log("=".repeat(58));
  console.log(`   Total: ${total} fila(s) sintética(s) eliminadas.`);
}

async function main(): Promise<void> {
  assertNotProduction(process.env); // antes de abrir siquiera la conexión
  const batch = parseBatchArg(process.argv.slice(2));

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const results = await purgeSynthetic(pool, batch);
    printSummary(results, batch);

    const failures = results.filter((r) => r.error);
    if (failures.length > 0) {
      console.error(`\n❌ ${failures.length} tabla(s) no se pudieron limpiar. Revisa las claves foráneas y reintenta.`);
      process.exitCode = 1;
    } else {
      console.log("✅ Purga completada. Los registros reales (is_synthetic = false) quedaron intactos.");
    }
  } finally {
    await pool.end();
  }
}

// Importado por las pruebas (VITEST) sólo por sus funciones exportadas: no debe ejecutarse entonces.
if (!process.env.VITEST) {
  main().catch((err) => {
    console.error("❌ Error en la purga de datos sintéticos:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
