// Genera src/modules/content/manifest.json: columnas y tipos de las tablas de contenido, leídos de la base migrada.
// Permite construir esquemas OpenAPI/Zod exactos sin conectarse a la base al arrancar. Una prueba verifica que no haya desfase.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { readManifest } from "../src/modules/content/manifest-reader.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd" });
try {
  const manifest = await readManifest(pool);
  const file = fileURLToPath(new URL("../src/modules/content/manifest.json", import.meta.url));
  writeFileSync(file, JSON.stringify(manifest, null, 1) + "\n");
  const empty = Object.entries(manifest).filter(([, c]) => Object.keys(c).length === 0).map(([t]) => t);
  console.log(`manifest.json: ${Object.keys(manifest).length} tablas`, empty.length ? `¡sin columnas: ${empty.join(", ")}!` : "");
  if (empty.length) process.exitCode = 1;
} finally {
  await pool.end();
}
