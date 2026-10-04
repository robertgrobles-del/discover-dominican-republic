// Comprueba que el catálogo que sirve el backend, convertido con `contentMappers`, coincide con los datos
// locales de los que se cargó. Requiere la API en marcha y el contenido importado (`npm run db:import-static`).
// Uso: npx tsx scripts/check-catalog-parity.ts [http://localhost:3000/api/v1]
import { readdirSync } from "node:fs";
import { register } from "node:module";
import { bars } from "../src/data/bars";
import { beaches } from "../src/data/beaches";
import { destinations } from "../src/data/destinations";
import { experiences } from "../src/data/experiences";
import { hotels } from "../src/data/hotels";
import { restaurants } from "../src/data/restaurants";
import {
  CATALOG_FIELDS, DERIVED_KEYS, withExtras, barPatch, beachPatch, buildPlaceIndex, destinationPatch, experiencePatch, hotelPatch, restaurantPatch,
  type ApiRow, type CatalogCollection, type PlaceIndex,
} from "../src/services/contentMappers";
import { setAssetResolver } from "../src/services/assetPaths";
import { collectionGroups, planCollections } from "../src/services/catalogCollections";
import { mergeInPlace } from "../src/services/datasetHydration";

// Aquí las imágenes empaquetadas se importan como `/assets/<archivo>`, igual que las guardó la carga de la base.
setAssetResolver((fileName) => `/assets/${fileName}`);

const API = (process.argv[2] ?? "http://localhost:3000/api/v1").replace(/\/$/, "");

async function listAll(collection: CatalogCollection): Promise<ApiRow[]> {
  const rows: ApiRow[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${API}/${collection}?per_page=100&page=${page}&fields=${CATALOG_FIELDS[collection].join(",")}&lang=es`);
    if (!res.ok) throw new Error(`${collection}: la API respondió ${res.status} ${await res.text()}`);
    const body = (await res.json()) as { data: ApiRow[]; meta: { total_pages: number } };
    rows.push(...body.data);
    if (page >= body.meta.total_pages) break;
  }
  return rows;
}

// Igualdad tolerante a lo que la base normaliza: números guardados con decimales fijos y listas vacías frente a ausentes.
/** Texto estable de un valor: la base devuelve los objetos con las claves en otro orden. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object" && value !== null) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
function same(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6;
  if (typeof a === "object" || typeof b === "object") return canonical(a ?? []) === canonical(b ?? []);
  return a === b;
}

type Item = { slug: string } & Record<string, unknown>;
function compare(name: string, local: Item[], rows: ApiRow[], patch: (row: ApiRow, places: PlaceIndex) => Record<string, unknown>, places: PlaceIndex): number {
  const bySlug = new Map(local.map((item) => [item.slug, item]));
  let matched = 0, diffs = 0;
  const onlyApi: string[] = [];
  for (const row of rows) {
    const mapped = withExtras(row, patch(row, places));
    const original = bySlug.get(String(mapped.slug));
    if (!original) { onlyApi.push(String(row.slug)); continue; }
    matched++;
    for (const [key, value] of Object.entries(mapped)) {
      if (key === "id") continue; // en local el id puede no ser el slug; las pantallas enlazan por slug
      // Lo que la API añade sobre un campo que el local no tiene es información nueva, no una discrepancia;
      // y las etiquetas de jerarquía las conserva el registro local (ver `overlay`).
      if (original[key] === undefined || (DERIVED_KEYS as readonly string[]).includes(key)) continue;
      if (!same(value, original[key])) { diffs++; if (diffs <= 12) console.log(`  ≠ ${name}/${original.slug}.${key}: API=${JSON.stringify(value)?.slice(0, 70)} local=${JSON.stringify(original[key])?.slice(0, 70)}`); }
    }
  }
  const missing = local.filter((item) => !rows.some((row) => row.slug === item.slug)).map((item) => item.slug);
  console.log(`${name.padEnd(13)} local ${String(local.length).padStart(3)} · API ${String(rows.length).padStart(3)} · emparejados ${String(matched).padStart(3)} · diferencias ${diffs}${onlyApi.length ? ` · sólo en API: ${onlyApi.length}` : ""}${missing.length ? ` · sólo en local: ${missing.join(", ").slice(0, 120)}` : ""}`);
  return diffs;
}

const [provinceRows, destinationRows] = await Promise.all([listAll("provinces"), listAll("destinations")]);
const places = buildPlaceIndex(provinceRows, destinationRows);
let total = 0;
total += compare("destinations", destinations as unknown as Item[], destinationRows, destinationPatch, places);
total += compare("beaches", beaches as unknown as Item[], await listAll("beaches"), beachPatch, places);
total += compare("hotels", hotels as unknown as Item[], await listAll("hotels"), hotelPatch, places);
total += compare("restaurants", restaurants as unknown as Item[], await listAll("restaurants"), restaurantPatch, places);
total += compare("bars", bars as unknown as Item[], await listAll("bars"), barPatch, places);
total += compare("experiences", experiences as unknown as Item[], await listAll("experiences"), experiencePatch, places);

// Algunos archivos de datos importan imágenes empaquetadas. Fuera del empaquetador se resuelven a la misma ruta
// `/assets/<archivo>` que guardó la carga de la base; la hidratación ignora esas rutas, así que no cuentan.
register(`data:text/javascript,${encodeURIComponent(`
  const IMAGES = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif"];
  export async function load(url, context, next) {
    const file = url.split("?")[0];
    if (!IMAGES.some((ext) => file.toLowerCase().endsWith(ext))) return next(url, context);
    return { format: "module", shortCircuit: true, source: "export default " + JSON.stringify("/assets/" + file.split("/").pop()) + ";" };
  }`)}`);

// Colecciones secundarias: lo que la hidratación cambiaría sobre los datos locales debe ser nada.
async function listRaw(path: string): Promise<ApiRow[]> {
  const rows: ApiRow[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${API}/${path}?per_page=100&page=${page}&fields=*&lang=es`);
    if (!res.ok) throw new Error(`${path}: la API respondió ${res.status}`);
    const body = (await res.json()) as { data: ApiRow[]; meta: { total_pages: number } };
    rows.push(...body.data);
    if (page >= body.meta.total_pages) break;
  }
  return rows;
}
for (const [path, group] of collectionGroups()) {
  try {
    const loaded = await Promise.all(group.map((spec) => spec.load()));
    const rows = await listRaw(path);
    planCollections(group, loaded, rows, places).forEach((plan, i) => {
      const size = Array.isArray(loaded[i]) ? loaded[i].length : Object.keys(loaded[i]!).length;
      console.log(`${group[i]!.name.padEnd(17)} local ${String(size).padStart(3)} · API ${String(rows.length).padStart(3)} · emparejados ${String(plan.matched).padStart(3)} · diferencias ${plan.changes.length}${plan.added.length ? ` · nuevos: ${plan.added.length}` : ""}`);
      for (const c of plan.changes.slice(0, 6)) console.log(`  ≠ ${c.collection}/${c.slug}.${c.field}: API=${JSON.stringify(c.to)?.slice(0, 70)} local=${JSON.stringify(c.from)?.slice(0, 70)}`);
      total += plan.changes.length + plan.added.length;
    });
  } catch (err) {
    // Los archivos que importan imágenes empaquetadas sólo cargan dentro del empaquetador.
    console.log(`${group.map((spec) => spec.name).join(", ").padEnd(17)} no comprobable aquí: ${(err as Error).message.slice(0, 90)}`);
  }
}

// Documentos de contenido: volcar cada uno sobre su archivo local no debe cambiar nada.
const datasetKey = (file: string) => file.replace(/\.tsx?$/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();
const dataFiles = new Map(readdirSync(new URL("../src/data/", import.meta.url)).filter((f) => /\.tsx?$/.test(f)).map((f) => [datasetKey(f), f]));
const index = (await (await fetch(`${API}/datasets`)).json()) as { data: { key: string; revision: number }[] };
let documents = 0, documentDiffs = 0;
for (const { key, revision } of index.data) {
  const file = dataFiles.get(key);
  if (!file) { console.log(`documento ${key}: no corresponde a ningún archivo local`); continue; }
  try {
    const doc = ((await (await fetch(`${API}/datasets/${key}`)).json()) as { data: { value: Record<string, unknown> } }).data.value;
    const mod = (await import(`../src/data/${file}`)) as Record<string, unknown>;
    const changes = Object.entries(doc).reduce((sum, [name, value]) => sum + mergeInPlace(mod[name], value, false), 0);
    documents++;
    if (changes > 0) { documentDiffs += changes; console.log(`  ≠ documento ${key}: ${changes} diferencias${revision > 0 ? " (editado en el CMS)" : ""}`); }
  } catch (err) {
    console.log(`documento ${key}: no comprobable aquí: ${(err as Error).message.slice(0, 90)}`);
  }
}
console.log(`documentos        ${documents} comprobados · diferencias ${documentDiffs}`);
total += documentDiffs;
console.log(total === 0 ? "\nParidad completa: la API convertida coincide con los datos locales." : `\n${total} diferencias entre la API convertida y los datos locales.`);
process.exit(total === 0 ? 0 : 1);
