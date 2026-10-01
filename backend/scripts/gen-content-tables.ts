// Lista de tablas que posee el servicio de contenido, derivada de COLLECTIONS.
// La consume services/content/scripts/sync-projection.sh. Con --check sólo compara.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { COLLECTIONS } from "../src/contracts/content-collections.js";

const file = fileURLToPath(new URL("../services/content/content-tables.txt", import.meta.url));
const tables = [...new Set(COLLECTIONS.map((collection) => collection.table))].sort();
const expected = `# Generado por \`npm run content:tables\` a partir de COLLECTIONS. No editar a mano.\n${tables.join("\n")}\n`;

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(file, "utf8").replace(/\r\n/g, "\n"); } catch { /* aún no existe */ }
  if (current !== expected) { console.error("content-tables.txt está desfasado: ejecuta `npm run content:tables`"); process.exit(1); }
  console.log(`content-tables.txt al día (${tables.length} tablas)`);
} else {
  writeFileSync(file, expected);
  console.log(`content-tables.txt: ${tables.length} tablas`);
}
