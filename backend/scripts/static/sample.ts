// Muestra un elemento de cada colección de un archivo de src/data (textos recortados) para escribir sus mapeos.
import { loadStatic } from "./loader.js";

const [file, name, idx = "0"] = process.argv.slice(2);
const m = await loadStatic(file!);
const trim = (v: unknown, depth = 0): unknown => {
  if (typeof v === "string") return v.length > 48 ? `${v.slice(0, 48)}…(${v.length})` : v;
  if (Array.isArray(v)) return v.length > 3 ? [...v.slice(0, 2).map((x) => trim(x, depth + 1)), `…+${v.length - 2}`] : v.map((x) => trim(x, depth + 1));
  if (v && typeof v === "object") return depth > 3 ? "{…}" : Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, trim(x, depth + 1)]));
  return v;
};
const data = m[name!] as unknown;
const item = Array.isArray(data) ? data[Number(idx)] : (data as Record<string, unknown>)[Object.keys(data as object)[Number(idx)]!];
console.log(JSON.stringify(trim(item), null, 1).slice(0, 2600));
