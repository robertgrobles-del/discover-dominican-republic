// Comprueba que el catálogo que sirve el backend, convertido con `contentMappers`, coincide con los datos
// locales de los que se cargó. Requiere la API en marcha y el contenido importado (`npm run db:import-static`).
// Uso: npx tsx scripts/check-catalog-parity.ts [http://localhost:3000/api/v1]
import { bars } from "../src/data/bars";
import { beaches } from "../src/data/beaches";
import { destinations } from "../src/data/destinations";
import { experiences } from "../src/data/experiences";
import { hotels } from "../src/data/hotels";
import { restaurants } from "../src/data/restaurants";
import {
  CATALOG_FIELDS, DERIVED_KEYS, barPatch, beachPatch, buildPlaceIndex, destinationPatch, experiencePatch, hotelPatch, restaurantPatch,
  type ApiRow, type CatalogCollection, type PlaceIndex,
} from "../src/services/contentMappers";

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
function same(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6;
  if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  return a === b;
}

type Item = { slug: string } & Record<string, unknown>;
function compare(name: string, local: Item[], rows: ApiRow[], patch: (row: ApiRow, places: PlaceIndex) => Record<string, unknown>, places: PlaceIndex): number {
  const bySlug = new Map(local.map((item) => [item.slug, item]));
  let matched = 0, diffs = 0;
  const onlyApi: string[] = [];
  for (const row of rows) {
    const mapped = patch(row, places);
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
console.log(total === 0 ? "\nParidad completa: la API convertida coincide con los datos locales." : `\n${total} diferencias entre la API convertida y los datos locales.`);
process.exit(total === 0 ? 0 : 1);
