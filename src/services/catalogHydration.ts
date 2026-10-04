import { bars } from "@/data/bars";
import { beaches } from "@/data/beaches";
import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { hotels } from "@/data/hotels";
import { restaurants } from "@/data/restaurants";
import { CATALOG_SOURCE } from "@/lib/catalogSource";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { contentApi, listRaw } from "./contentApi";

/**
 * Hidratación del catálogo. Decenas de pantallas importan los arreglos de `src/data` y sus funciones de
 * búsqueda directamente. En lugar de reescribirlas una por una, al arrancar se sustituye el contenido de esos
 * arreglos por lo que dice el backend, que es la fuente de verdad (`docs/FUENTE_DE_VERDAD.md`). Como las
 * funciones de búsqueda leen el arreglo en cada llamada, todas las pantallas ven los datos del backend.
 *
 * Los archivos locales quedan como respaldo: si el backend no responde, el sitio muestra lo que ya traía.
 */

export interface HydrationResult { source: "static" | "api"; hydrated: string[]; timedOut: boolean }

/** Tiempo que el arranque espera al backend antes de pintar con los datos locales. */
export const HYDRATION_TIMEOUT_MS = 2500;

function replaceInPlace<T>(target: T[], next: T[]): boolean {
  if (next === target) return false; // contentApi devuelve el mismo arreglo local cuando el backend no respondió
  target.splice(0, target.length, ...next);
  return true;
}

/**
 * Tablas de catálogo que algunas pantallas todavía consultan por el cliente simulado (`supabase.from(...)`).
 * El backend las sirve con el mismo esquema, así que sus filas pueden ocupar el lugar de la copia local.
 */
const MOCK_CATALOG_TABLES = ["provinces", "destinations", "hotels", "restaurants", "bars", "beaches", "experiences", "events", "articles"] as const;

/** Rellena las tablas de catálogo del cliente simulado. Cada tabla falla por separado: una caída no arrastra a las demás. */
async function hydrateMockCatalog(locale: string): Promise<string[]> {
  if (!IS_MOCK_DATA) return []; // con datos reales no existe el cliente simulado
  const loaded = await Promise.all(MOCK_CATALOG_TABLES.map(async (table) => [table, await listRaw(table, locale).catch(() => [])] as const));
  const { hydrateMockTables } = await import("@/integrations/supabase/client");
  return hydrateMockTables(Object.fromEntries(loaded)).map((table) => `mock:${table}`);
}

let pending: Promise<HydrationResult> | null = null;

async function run(locale: string): Promise<HydrationResult> {
  // Destinos primero no hace falta: cada carga superpone sobre su propio arreglo local.
  const [b, h, r, ba, e, d, mock] = await Promise.all([
    contentApi.beaches(locale), contentApi.hotels(locale), contentApi.restaurants(locale),
    contentApi.bars(locale), contentApi.experiences(locale), contentApi.destinations(locale),
    hydrateMockCatalog(locale).catch(() => [] as string[]),
  ]);
  const hydrated: string[] = [...mock];
  if (replaceInPlace(beaches, b)) hydrated.push("beaches");
  if (replaceInPlace(hotels, h)) hydrated.push("hotels");
  if (replaceInPlace(restaurants, r)) hydrated.push("restaurants");
  if (replaceInPlace(bars, ba)) hydrated.push("bars");
  if (replaceInPlace(experiences, e)) hydrated.push("experiences");
  if (replaceInPlace(destinations, d)) hydrated.push("destinations");
  return { source: "api", hydrated, timedOut: false };
}

/**
 * Carga el catálogo del backend sobre los datos locales. Con `VITE_CATALOG_SOURCE=static` no hace nada.
 * Se resuelve al terminar o al cumplirse `timeoutMs`, lo que ocurra antes: un backend lento no retrasa el
 * primer pintado más de ese tiempo, y la carga sigue en segundo plano para las siguientes navegaciones.
 */
export function hydrateCatalog(opts: { locale?: string; timeoutMs?: number; source?: typeof CATALOG_SOURCE } = {}): Promise<HydrationResult> {
  if ((opts.source ?? CATALOG_SOURCE) !== "api") return Promise.resolve({ source: "static", hydrated: [], timedOut: false });
  pending ??= run(opts.locale ?? "es");
  const timeout = new Promise<HydrationResult>((resolve) => setTimeout(() => resolve({ source: "api", hydrated: [], timedOut: true }), opts.timeoutMs ?? HYDRATION_TIMEOUT_MS));
  return Promise.race([pending, timeout]);
}

/** Espera a la hidratación en curso, si la hay. Para quien necesita los datos del backend y puede esperar. */
export function catalogReady(): Promise<unknown> {
  return pending ?? Promise.resolve();
}

/** Sólo para pruebas: olvida la carga anterior. */
export function resetCatalogHydration(): void {
  pending = null;
}
