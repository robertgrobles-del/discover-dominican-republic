import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

// Inventario estático de acceso a tablas por dominio. Complementa audit-module-dependencies.mjs:
// aquél mide imports; éste, qué módulos leen o escriben cada tabla de la base compartida.
// Es léxico: busca nombres de tabla tras FROM/JOIN/INTO/UPDATE/DELETE FROM en el código de cada módulo.
// No ve SQL construido con nombres dinámicos (p. ej. las colecciones del catálogo) ni triggers.
const modulesRoot = resolve("src/modules");
const migrationsDir = resolve("migrations");
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const maxShared = arg("max-shared") === undefined ? null : Number(arg("max-shared"));
const maxSharedWrites = arg("max-shared-writes") === undefined ? null : Number(arg("max-shared-writes"));
const markdownOut = arg("markdown");
for (const [name, value] of [["max-shared", maxShared], ["max-shared-writes", maxSharedWrites]]) {
  if (value !== null && (!Number.isInteger(value) || value < 0)) throw new Error(`--${name} debe ser un entero no negativo`);
}

// Tablas reales: las que crean las migraciones (evita contar alias, CTE o palabras sueltas).
const tables = new Set();
for (const file of (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql"))) {
  const sql = await readFile(join(migrationsDir, file), "utf8");
  for (const [, name] of sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi)) tables.add(name.toLowerCase());
}

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.ts$/.test(entry.name)) files.push(file);
  }
}
await walk(modulesRoot);

const WRITE = /\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+(?:ONLY\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi;
const READ = /\b(?:FROM|JOIN)\s+(?:ONLY\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi;
/** tabla → { readers: Set<módulo>, writers: Set<módulo> } */
const access = new Map();
const touch = (table, module, kind) => {
  if (!tables.has(table)) return;
  if (!access.has(table)) access.set(table, { readers: new Set(), writers: new Set() });
  access.get(table)[kind].add(module);
};

for (const file of files) {
  const module = relative(modulesRoot, file).split(/[\\/]/)[0];
  const content = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const written = new Set();
  for (const [, name] of content.matchAll(WRITE)) { written.add(name.toLowerCase()); touch(name.toLowerCase(), module, "writers"); }
  // `DELETE FROM x` también casa con FROM: no se cuenta además como lectura si el módulo sólo escribe ahí.
  for (const match of content.matchAll(READ)) {
    const name = match[1].toLowerCase();
    const before = content.slice(Math.max(0, match.index - 8), match.index);
    if (/DELETE\s+$/i.test(before)) continue;
    touch(name, module, "readers");
  }
}

const rows = [...access.entries()].map(([table, { readers, writers }]) => {
  const modules = new Set([...readers, ...writers]);
  return { table, modules: [...modules].sort(), writers: [...writers].sort(), readers: [...readers].sort() };
});
const shared = rows.filter((r) => r.modules.length > 1).sort((a, b) => b.writers.length - a.writers.length || b.modules.length - a.modules.length || a.table.localeCompare(b.table));
const multiWriter = shared.filter((r) => r.writers.length > 1);

console.log(`Tablas con acceso SQL estático: ${rows.length} de ${tables.size} definidas en migraciones`);
console.log(`Tablas tocadas por más de un módulo: ${shared.length}`);
console.log(`Tablas escritas por más de un módulo: ${multiWriter.length}`);
for (const r of shared) {
  const onlyReaders = r.readers.filter((m) => !r.writers.includes(m));
  console.log(`  ${r.table.padEnd(34)} escriben: ${r.writers.join(", ") || "—"}${onlyReaders.length ? `  | sólo leen: ${onlyReaders.join(", ")}` : ""}`);
}

if (markdownOut) {
  const lines = [
    "| Tabla | Escriben | Sólo leen |",
    "| --- | --- | --- |",
    ...shared.map((r) => `| \`${r.table}\` | ${r.writers.map((m) => `\`${m}\``).join(", ") || "—"} | ${r.readers.filter((m) => !r.writers.includes(m)).map((m) => `\`${m}\``).join(", ") || "—"} |`),
  ];
  await writeFile(markdownOut, lines.join("\n") + "\n");
}

if (maxShared !== null && shared.length > maxShared) {
  console.error(`Límite excedido: ${shared.length} tablas compartidas > ${maxShared}`);
  process.exitCode = 1;
}
if (maxSharedWrites !== null && multiWriter.length > maxSharedWrites) {
  console.error(`Límite excedido: ${multiWriter.length} tablas con varios escritores > ${maxSharedWrites}`);
  process.exitCode = 1;
}
