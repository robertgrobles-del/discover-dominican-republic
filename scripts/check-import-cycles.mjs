import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const sourceRoot = resolve("src");
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(path);
  }
}
await walk(sourceRoot);
const known = new Set(files.map((file) => resolve(file)));
const graph = new Map();
const importPattern = /(?:\bfrom\s*|\bimport\s*\()\s*["']([^"']+)["']/g;
for (const file of files) {
  const content = (await readFile(file, "utf8"))
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*import\s+type\b[\s\S]*?;\s*$/gm, "");
  const edges = [];
  for (const [, specifier] of content.matchAll(importPattern)) {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
    const base = resolve(specifier.startsWith("@/") ? sourceRoot : join(file, ".."), specifier.startsWith("@/") ? specifier.slice(2) : specifier);
    const candidates = [base, ...[".ts", ".tsx", ".js", ".jsx"].map((suffix) => `${base}${suffix}`), ...["index.ts", "index.tsx"].map((name) => join(base, name))];
    const target = candidates.find((candidate) => known.has(candidate));
    if (target) edges.push(target);
  }
  graph.set(resolve(file), edges);
}

const active = [];
const visited = new Set();
const cycles = new Set();
function visit(file) {
  if (active.includes(file)) {
    const cycle = active.slice(active.indexOf(file)).map((item) => relative(process.cwd(), item));
    cycles.add([...new Set(cycle)].sort().join(" | "));
    return;
  }
  if (visited.has(file)) return;
  active.push(file);
  for (const target of graph.get(file) || []) visit(target);
  active.pop();
  visited.add(file);
}
for (const file of graph.keys()) visit(file);
if (cycles.size) {
  console.error(`Se detectaron ${cycles.size} ciclos de imports:`);
  for (const cycle of cycles) console.error(`- ${cycle}`);
  process.exitCode = 1;
} else {
  console.log(`Sin ciclos de imports locales en ${files.length} módulos.`);
}
