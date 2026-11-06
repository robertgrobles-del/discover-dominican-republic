// Integra traducciones en el diccionario del traductor del sitio (src/i18n/auto: keys.json + <idioma>.json,
// listas alineadas por posición). Entrada: uno o varios JSON { "texto en español": { en, fr, de, it, pt } }.
//   node scripts/merge-auto-translations.mjs lote1.json lote2.json …
// Rellena la posición si el texto ya existe; si no, lo añade al final en todas las listas a la vez.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../src/i18n/auto/", import.meta.url));
const LANGS = ["en", "fr", "de", "it", "pt"];
const norm = (s) => s.replace(/\s+/g, " ").trim(); // igual que norm() en src/i18n/autoTranslate.ts

const keys = JSON.parse(readFileSync(`${dir}keys.json`, "utf8"));
const lists = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(`${dir}${l}.json`, "utf8"))]));
for (const l of LANGS) if (lists[l].length !== keys.length) throw new Error(`${l}.json desalineado: ${lists[l].length} ≠ ${keys.length}`);
const index = new Map(keys.map((k, i) => [k, i]));

let added = 0, filled = 0;
for (const file of process.argv.slice(2)) {
  const batch = JSON.parse(readFileSync(file, "utf8"));
  for (const [rawEs, tr] of Object.entries(batch)) {
    const es = norm(rawEs);
    if (!es || !tr || LANGS.some((l) => typeof tr[l] !== "string" || !tr[l].trim())) throw new Error(`Traducción incompleta: «${es}»`);
    let i = index.get(es);
    if (i === undefined) {
      i = keys.push(es) - 1;
      index.set(es, i);
      for (const l of LANGS) lists[l].push("");
      added++;
    } else filled++;
    for (const l of LANGS) lists[l][i] = norm(tr[l]);
  }
}
writeFileSync(`${dir}keys.json`, JSON.stringify(keys));
for (const l of LANGS) writeFileSync(`${dir}${l}.json`, JSON.stringify(lists[l]));
console.log(`claves nuevas: ${added} · completadas: ${filled} · total: ${keys.length}`);
