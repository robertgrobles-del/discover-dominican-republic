import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

// Inventario estático de imports entre dominios. No cuenta llamadas HTTP,
// imports dinámicos calculados ni accesos a tablas compartidas.
const modulesRoot = resolve("src/modules");
const files = [];
const maxPairsArg = process.argv.find((arg) => arg.startsWith("--max-pairs="));
const maxPairs = maxPairsArg ? Number(maxPairsArg.slice("--max-pairs=".length)) : null;

if (maxPairs !== null && (!Number.isInteger(maxPairs) || maxPairs < 0)) {
  throw new Error("--max-pairs debe ser un entero no negativo");
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.ts$/.test(entry.name)) files.push(resolve(file));
  }
}

await walk(modulesRoot);
const known = new Set(files);
const counts = new Map();
const importPattern = /(?:\bfrom\s*|\bimport\s*\()\s*["']([^"']+)["']/g;

for (const file of files) {
  const content = (await readFile(file, "utf8"))
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const source = relative(modulesRoot, file).split(/[\\/]/)[0];

  for (const [, specifier] of content.matchAll(importPattern)) {
    if (!specifier.startsWith(".")) continue;
    const base = resolve(dirname(file), specifier);
    const candidates = [base, `${base}.ts`, base.replace(/\.js$/, ".ts"), join(base, "index.ts")];
    const target = candidates.find((candidate) => known.has(candidate));
    if (!target) continue;
    const destination = relative(modulesRoot, target).split(/[\\/]/)[0];
    if (source === destination) continue;
    const key = `${source} -> ${destination}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
}

const ranked = [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b));
console.log(`Referencias estáticas entre dominios: ${ranked.reduce((sum, [, count]) => sum + count, 0)}`);
console.log(`Pares origen → destino: ${ranked.length}`);
for (const [edge, count] of ranked) console.log(`${String(count).padStart(3)}  ${edge}`);
if (maxPairs !== null && ranked.length > maxPairs) {
  console.error(`El acoplamiento entre dominios supera el límite: ${ranked.length} > ${maxPairs}`);
  process.exitCode = 1;
}
