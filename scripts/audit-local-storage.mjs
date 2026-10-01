import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = join(process.cwd(), "src");
const sourceFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(path);
  }
}

await walk(root);
let findings = 0;
for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/\b(?:localStorage|sessionStorage)\s*\./.test(line)) {
      findings += 1;
      console.log(`${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`);
    }
  });
}
console.log(`\n${findings} accesos directos a almacenamiento web; revisar finalidad y retención según docs/ALMACENAMIENTO_LOCAL.md.`);
