import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadStatic } from "./loader.js";

const dir = fileURLToPath(new URL("../../../src/data/", import.meta.url));
const only = process.argv[2];
for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts") && (!only || x.includes(only))).sort()) {
  try {
    const m = await loadStatic(f);
    const parts = Object.entries(m).map(([k, v]) => {
      if (Array.isArray(v)) return `${k}[${v.length}]{${v[0] && typeof v[0] === "object" ? Object.keys(v[0] as object).slice(0, 16).join(",") : typeof v[0]}}`;
      if (v && typeof v === "object") return `${k}{${Object.keys(v as object).slice(0, 8).join(",")}}`;
      return `${k}:${typeof v}`;
    });
    console.log(`${f}: ${parts.join(" | ")}`);
  } catch (e) { console.log(`${f}: ERROR ${(e as Error).message.split("\n")[0]}`); }
}
