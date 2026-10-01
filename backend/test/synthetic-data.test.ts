import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { assertNotProduction, parseBatchArg, SYNTHETIC_TABLES } from "../scripts/purge-synthetic.js";

/**
 * Punto 69 del plan: "Usar datos sintéticos etiquetados para demos. Separar cuentas y datasets de
 * demostración del entorno y registros reales".
 *
 * Comprueba contra la base de pruebas que el etiquetado existe (columnas + índices de la migración
 * 0057), que la guarda de producción de la purga se comporta, y —de forma estática, sin ejecutar
 * los seeds— que los tres seeds etiquetan lo que insertan y no pueden correr en producción.
 */
const TABLES = ["users", "bookings", "reviews", "partner_profiles", "creator_profiles"] as const;
const SEEDS = ["seed-demo", "seed-bulk", "seed-mass-faker"] as const;

const readSeed = (name: string) => readFileSync(new URL(`../scripts/${name}.ts`, import.meta.url), "utf8");
const readPurge = () => readFileSync(new URL("../scripts/purge-synthetic.ts", import.meta.url), "utf8");

describe("datos sintéticos etiquetados (punto 69)", () => {
  let pool: pg.Pool;
  beforeAll(() => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  afterAll(async () => {
    await pool.end();
  });

  it("las cinco tablas de personas y cuentas tienen is_synthetic boolean NOT NULL DEFAULT false", async () => {
    const { rows } = await pool.query(
      `SELECT table_name, data_type, is_nullable, column_default
         FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'is_synthetic' AND table_name = ANY($1::text[])`,
      [TABLES]
    );
    const cols = rows as { table_name: string; data_type: string; is_nullable: string; column_default: string | null }[];
    expect(cols.map((r) => r.table_name).sort()).toEqual([...TABLES].sort());
    for (const c of cols) {
      expect(c.data_type, c.table_name).toBe("boolean");
      expect(c.is_nullable, c.table_name).toBe("NO");
      expect(c.column_default, c.table_name).toBe("false");
    }
  });

  it("las cinco tablas guardan el lote en synthetic_batch text, con índice parcial por lote", async () => {
    const { rows: cols } = await pool.query(
      `SELECT table_name, data_type, is_nullable
         FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'synthetic_batch' AND table_name = ANY($1::text[])`,
      [TABLES]
    );
    const batchCols = cols as { table_name: string; data_type: string; is_nullable: string }[];
    expect(batchCols.map((r) => r.table_name).sort()).toEqual([...TABLES].sort());
    for (const c of batchCols) {
      expect(c.data_type, c.table_name).toBe("text");
      expect(c.is_nullable, c.table_name).toBe("YES"); // sólo las filas sintéticas llevan lote
    }

    // Índices parciales: indexan sólo las filas sintéticas, para limpiar por lote sin penalizar lo real.
    const { rows: idx } = await pool.query(
      `SELECT tablename, indexdef FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = ANY($1::text[]) AND indexdef ILIKE '%synthetic_batch%'`,
      [TABLES]
    );
    const indexes = idx as { tablename: string; indexdef: string }[];
    expect(indexes.map((r) => r.tablename).sort()).toEqual([...TABLES].sort());
    for (const i of indexes) expect(i.indexdef, i.tablename).toMatch(/WHERE\s+is_synthetic/i);
  });

  it("assertNotProduction corta en producción y deja pasar development/test", () => {
    expect(() => assertNotProduction({ NODE_ENV: "production" })).toThrow(/producción/);
    expect(() => assertNotProduction({ NODE_ENV: "development" })).not.toThrow();
    expect(() => assertNotProduction({ NODE_ENV: "test" })).not.toThrow();
    expect(() => assertNotProduction({})).not.toThrow();
  });

  it("la purga borra sólo lo etiquetado y en orden seguro por claves foráneas", () => {
    const src = readPurge();
    expect(src).toContain("WHERE is_synthetic = true");
    expect(src).not.toMatch(/DELETE[^;]*LIKE/i); // nunca borra por patrón de texto
    expect(SYNTHETIC_TABLES).toEqual(["bookings", "reviews", "creator_profiles", "partner_profiles", "users"]);
    expect(SYNTHETIC_TABLES[SYNTHETIC_TABLES.length - 1]).toBe("users"); // la raíz se borra al final
    expect(parseBatchArg(["--batch", "seed-bulk"])).toBe("seed-bulk");
    expect(parseBatchArg([])).toBeNull();
    expect(() => parseBatchArg(["--batch"])).toThrow(/nombre de lote/);
  });

  it("los tres seeds etiquetan lo que insertan y ninguno puede correr en producción", () => {
    for (const name of SEEDS) {
      const src = readSeed(name);

      // 1. Lote propio y explícito, igual al nombre del script.
      expect(src, name).toContain(`const SYNTHETIC_BATCH = "${name}"`);

      // 2. Guarda de producción que termina el proceso con código != 0, antes del primer INSERT.
      const guard = /process\.env\.NODE_ENV\s*===\s*"production"[\s\S]{0,200}?process\.exit\(1\)/;
      expect(guard.test(src), `${name} debe negarse a correr en producción`).toBe(true);
      expect(src.search(guard), `${name} debe guardar antes de insertar`).toBeLessThan(src.indexOf("INSERT INTO"));

      // 3. Todas las filas que inserta en las tablas de personas/opiniones van etiquetadas. El valor puede
      //    ir literal (`true`) o como parámetro (`$n`): lo que no puede faltar es la columna.
      const users = /INSERT INTO users \(([^)]*)\)[\s\S]*?VALUES \(([^)]*)\)/.exec(src);
      expect(users, `${name} no inserta en users`).not.toBeNull();
      expect(users![1], name).toContain("is_synthetic");
      expect(users![1], name).toContain("synthetic_batch");
      expect(users![2], name).toMatch(/true|\$\d+/);

      const reviews = /INSERT INTO reviews \(([^)]*)\)[\s\S]*?VALUES \(([^)]*)\)/.exec(src);
      expect(reviews, `${name} no inserta en reviews`).not.toBeNull();
      expect(reviews![1], name).toContain("is_synthetic");
      expect(reviews![1], name).toContain("synthetic_batch");
      expect(reviews![2], name).toMatch(/true|\$\d+/);
    }
  });

  it("seed-bulk conserva su limpieza por prefijo bulk- junto a la etiqueta por lote", () => {
    const src = readSeed("seed-bulk");
    expect(src).toContain("slug LIKE 'bulk-%'");
    expect(src).toContain("bulk-");           // correos de las cuentas sintéticas
    expect(src).toContain("SYNTHETIC_BATCH"); // y, además del prefijo, el lote
  });
});
