#!/usr/bin/env node
/**
 * Sprint 6.3 — Migration Guard
 * Valida que todas las migraciones en /migrations esten aplicadas en la DB.
 * Uso: npx tsx scripts/check-migrations.ts
 * Salida: exit 0 si todo OK, exit 1 si hay migraciones pendientes o error.
 */
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

interface MigrationRecord { name: string; applied_at: string; }

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined,
  });

  try {
    // Verificar conexion
    await pool.query("SELECT 1");
    console.log("✅ Conexion a base de datos: OK");

    // Obtener migraciones aplicadas
    let applied: Set<string>;
    try {
      const { rows } = await pool.query<MigrationRecord>(
        // La columna se llama `name` (schema_migrations, migrator.ts); leer `filename` siempre daba vacío.
        "SELECT name FROM schema_migrations ORDER BY name"
      );
      applied = new Set(rows.map(r => r.name));
      console.log(`📋 Migraciones aplicadas en DB: ${applied.size}`);
    } catch {
      // Tabla schema_migrations no existe aun (primera ejecucion)
      applied = new Set();
      console.warn("⚠️  Tabla schema_migrations no encontrada — se asume cero migraciones aplicadas.");
    }

    // Obtener archivos .sql del directorio
    const files = (await readdir(MIGRATIONS_DIR))
      .filter(f => f.endsWith(".sql"))
      .sort();
    console.log(`📂 Archivos de migracion encontrados: ${files.length}`);

    // Detectar pendientes
    const pending = files.filter(f => !applied.has(f));
    if (pending.length === 0) {
      console.log(`\n✅ Todas las migraciones estan aplicadas (${files.length}/${files.length}).`);
      process.exit(0);
    }

    // Reporte de pendientes
    console.error(`\n❌ ${pending.length} migracion(es) PENDIENTE(S):`);
    for (const p of pending) {
      console.error(`   - ${p}`);
    }
    console.error(`\nEjecuta las migraciones pendientes antes de desplegar.`);
    process.exit(1);
  } catch (err) {
    console.error("❌ Error al verificar migraciones:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
