import { bars as localBars, type Bar } from "@/data/bars";
import { beaches as localBeaches, type Beach } from "@/data/beaches";
import { destinations as localDestinations, type Destination } from "@/data/destinations";
import { experiences as localExperiences, type Experience } from "@/data/experiences";
import { hotels as localHotels, type Hotel } from "@/data/hotels";
import { restaurants as localRestaurants, type Restaurant } from "@/data/restaurants";
import { fetchApi } from "@/lib/fastifyClient";
import {
  CATALOG_FIELDS, barPatch, beachPatch, buildPlaceIndex, destinationPatch, experiencePatch, hasCardBasics, hotelPatch, overlay, restaurantPatch,
  type ApiRow, type CatalogCollection, type PlaceIndex,
} from "./contentMappers";

/**
 * Catálogo público leído del backend por el mismo origen (`/api/v1/<colección>`), convertido a los tipos de las
 * pantallas. Si el backend no responde, cada función devuelve los datos locales: una caída de la API no deja
 * el sitio sin catálogo.
 */

const PAGE_SIZE = 100;
const MAX_PAGES = 20;
interface Page { data: ApiRow[]; meta: { total_pages: number } }

/** Todas las filas publicadas de una colección, página por página. */
export async function listAll(collection: CatalogCollection, locale = "es"): Promise<ApiRow[]> {
  const fields = CATALOG_FIELDS[collection].join(",");
  const rows: ApiRow[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchApi<Page>(`/${collection}?per_page=${PAGE_SIZE}&page=${page}&fields=${fields}&lang=${locale}`);
    rows.push(...res.data);
    if (page >= res.meta.total_pages) break;
  }
  return rows;
}

/** Filas completas de una colección, con todas sus columnas públicas y sin convertir. */
export async function listRaw(collection: string, locale = "es"): Promise<ApiRow[]> {
  const rows: ApiRow[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchApi<Page>(`/${collection}?per_page=${PAGE_SIZE}&page=${page}&fields=*&lang=${locale}`);
    rows.push(...res.data);
    if (page >= res.meta.total_pages) break;
  }
  return rows;
}

// Provincias y destinos resuelven los nombres de todas las demás colecciones: se piden una vez por idioma.
const placeIndexes = new Map<string, Promise<{ places: PlaceIndex; destinations: ApiRow[] }>>();
function placesFor(locale: string) {
  let pending = placeIndexes.get(locale);
  if (!pending) {
    pending = Promise.all([listAll("provinces", locale), listAll("destinations", locale)]).then(([provinces, destinations]) => ({ places: buildPlaceIndex(provinces, destinations), destinations }));
    // Un fallo no se queda guardado: el siguiente intento vuelve a pedirlo.
    pending.catch(() => placeIndexes.delete(locale));
    placeIndexes.set(locale, pending);
  }
  return pending;
}

async function load<T extends { slug: string; name: string; description: string; imageUrl: string }>(
  collection: CatalogCollection, local: T[], patch: (row: ApiRow, places: PlaceIndex) => Partial<T>, locale: string,
): Promise<T[]> {
  try {
    const [{ places }, rows] = await Promise.all([placesFor(locale), listAll(collection, locale)]);
    return overlay(local, rows.map((row) => patch(row, places)), hasCardBasics<T>);
  } catch {
    return local;
  }
}

export const contentApi = {
  beaches: (locale = "es"): Promise<Beach[]> => load("beaches", localBeaches, beachPatch, locale),
  hotels: (locale = "es"): Promise<Hotel[]> => load("hotels", localHotels, hotelPatch, locale),
  restaurants: (locale = "es"): Promise<Restaurant[]> => load("restaurants", localRestaurants, restaurantPatch, locale),
  bars: (locale = "es"): Promise<Bar[]> => load("bars", localBars, barPatch, locale),
  experiences: (locale = "es"): Promise<Experience[]> => load("experiences", localExperiences, experiencePatch, locale),
  async destinations(locale = "es"): Promise<Destination[]> {
    try {
      const { places, destinations } = await placesFor(locale);
      return overlay(localDestinations, destinations.map((row) => destinationPatch(row, places)), hasCardBasics<Destination>);
    } catch {
      return localDestinations;
    }
  },
};
