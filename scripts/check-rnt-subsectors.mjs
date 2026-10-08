import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const txtPath = resolve(process.cwd(), "docs/Registro Nacional Turístico.txt");
const content = readFileSync(txtPath, "utf-8");
const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

console.log("Total lines:", lines.length);
console.log("Header:", lines[0]);

function parseCsvLine(line) {
  const res = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      res.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  res.push(current.trim());
  return res;
}

const subsectors = new Map();
for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  const sub = cols[0] || "(empty)";
  subsectors.set(sub, (subsectors.get(sub) || 0) + 1);
}

console.log("\n--- Subsectors Count ---");
for (const [sub, count] of subsectors.entries()) {
  console.log(`${sub}: ${count}`);
}
