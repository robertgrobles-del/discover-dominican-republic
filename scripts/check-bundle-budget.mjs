import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const outDir = path.resolve("dist");
const manifest = JSON.parse(await readFile(path.join(outDir, ".vite/manifest.json"), "utf8"));
const entries = Object.entries(manifest);
const root = entries.find(([, item]) => item.isEntry);
if (!root) throw new Error("Vite manifest has no entry module");

const initialFiles = new Set();
function includeImports(key) {
  const item = manifest[key];
  if (!item) return;
  if (item.file?.endsWith(".js")) initialFiles.add(item.file);
  for (const imported of item.imports ?? []) includeImports(imported);
}
includeImports(root[0]);

async function gzipKb(file) {
  const content = await readFile(path.join(outDir, file));
  return gzipSync(content, { level: 9 }).length / 1024;
}

const initialKb = (await Promise.all([...initialFiles].map(gzipKb))).reduce((sum, n) => sum + n, 0);
const dynamicEntries = [...new Map(entries
  .filter(([, item]) => item.isDynamicEntry && item.file?.endsWith(".js"))
  .map(([, item]) => [item.file, item])).entries()];
let largestRoute = { file: "", kb: 0 };
for (const [, item] of dynamicEntries) {
  const kb = await gzipKb(item.file);
  if (kb > largestRoute.kb) largestRoute = { file: item.file, kb };
}
const allChunks = [...new Map(entries
  .filter(([, item]) => item.file?.endsWith(".js"))
  .map(([, item]) => [item.file, item])).entries()];
let largestChunk = { file: "", kb: 0, rawKb: 0 };
for (const [, item] of allChunks) {
  const kb = await gzipKb(item.file);
  const rawKb = (await stat(path.join(outDir, item.file))).size / 1024;
  if (rawKb > largestChunk.rawKb) largestChunk = { file: item.file, kb, rawKb };
}

console.log(`Initial JS (gzip, entry + static imports): ${initialKb.toFixed(1)} KiB / 500 KiB`);
console.log(`Largest lazy route entry (gzip): ${largestRoute.file} ${largestRoute.kb.toFixed(1)} KiB / 250 KiB`);
console.log(`Largest JS chunk: ${largestChunk.file} ${largestChunk.rawKb.toFixed(1)} KiB raw, ${largestChunk.kb.toFixed(1)} KiB gzip`);
if (initialKb > 500 || largestRoute.kb > 250 || largestChunk.rawKb > 800) {
  console.error("Bundle budget exceeded: reduce initial imports, route dependencies, or split oversized chunks.");
  process.exitCode = 1;
}
