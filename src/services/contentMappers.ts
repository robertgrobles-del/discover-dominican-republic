import type { Bar } from "@/data/bars";
import type { Beach } from "@/data/beaches";
import type { Destination } from "@/data/destinations";
import type { Experience } from "@/data/experiences";
import type { Hotel } from "@/data/hotels";
import type { Restaurant } from "@/data/restaurants";
import { resolveAsset, resolveAssetsDeep } from "./assetPaths";

/**
 * Conversión de las filas del catálogo del backend (`/api/v1/<colección>`) a los tipos que ya consumen las
 * pantallas. Es la inversa de `backend/scripts/static/mappers.ts`, que carga estos mismos datos en la base.
 *
 * Funciones puras, sin red ni variables de entorno: se pueden probar y ejecutar fuera del navegador.
 */

export type ApiRow = Record<string, unknown>;

/** Nombre y slug de los lugares a los que apunta una fila por su id (uuid). */
export interface PlaceIndex {
  provinces: Map<string, { name: string; slug: string }>;
  destinations: Map<string, { name: string; slug: string; provinceId: string | null }>;
}

/** Columnas que se piden de cada colección; `id` y las relaciones se usan para resolver nombres. */
export const CATALOG_FIELDS = {
  provinces: ["id", "slug", "name"],
  destinations: ["id", "slug", "name", "extras", "province_id", "description", "short_description", "image_url", "gallery", "highlights", "typical_dishes", "latitude", "longitude", "weather_info", "best_time_to_visit", "how_to_get_there"],
  beaches: ["id", "slug", "name", "extras", "destination_id", "province_id", "beach_type", "description", "short_description", "image_url", "gallery", "activities", "amenities", "water_color", "sand_type", "wave_intensity", "crowd_level", "access_type", "parking_available", "lifeguard_on_duty", "how_to_get_there", "best_time_to_visit", "latitude", "longitude", "rating", "is_popular", "is_featured"],
  hotels: ["id", "slug", "name", "extras", "destination_id", "category", "stars", "description", "short_description", "image_url", "gallery", "address", "phone", "website", "price_range", "amenities", "latitude", "longitude", "rating", "review_count", "is_featured"],
  restaurants: ["id", "slug", "name", "extras", "destination_id", "cuisine_type", "category", "price_range", "description", "short_description", "image_url", "gallery", "address", "phone", "opening_hours", "latitude", "longitude", "rating", "review_count", "services", "signature_dishes", "is_featured"],
  bars: ["id", "slug", "name", "extras", "destination_id", "bar_type", "price_range", "description", "short_description", "image_url", "gallery", "address", "phone", "opening_hours", "latitude", "longitude", "rating", "review_count", "music_style", "minimum_age", "dress_code", "services", "is_featured"],
  experiences: ["id", "slug", "name", "extras", "destination_id", "category", "experience_type", "difficulty", "duration", "description", "short_description", "image_url", "gallery", "highlights", "included", "requirements", "best_season", "price_range", "rating", "review_count", "is_featured"],
} as const;
export type CatalogCollection = keyof typeof CATALOG_FIELDS;

const text = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v : undefined);
const num = (v: unknown): number | undefined => { const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v; return typeof n === "number" && Number.isFinite(n) ? n : undefined; };
const flag = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);
const list = (v: unknown): string[] | undefined => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined);
/**
 * Ruta de imagen utilizable. `/assets/…` es una imagen empaquetada con el sitio: se traduce a su nombre
 * compilado y, si no se puede, se ignora para que el registro local conserve la suya.
 */
const image = (v: unknown): string | undefined => { const url = text(v); return url ? resolveAsset(url) : undefined; };
const images = (v: unknown): string[] | undefined => { const urls = list(v)?.map(resolveAsset); return urls && urls.every((url): url is string => url !== undefined) ? urls : undefined; };

/**
 * Suma a la conversión de una fila su ficha completa (`extras`): los campos que no tienen columna propia. Lo
 * que sí tiene columna manda sobre la copia que quedó en `extras`.
 */
export function withExtras<T extends object>(row: ApiRow, patch: Partial<T>): Partial<T> {
  const extras = row.extras;
  if (typeof extras !== "object" || extras === null || Array.isArray(extras)) return patch;
  const kept = Object.entries(extras).map(([key, value]) => [key, resolveAssetsDeep(value)] as const).filter(([, value]) => value.ok).map(([key, value]) => [key, value.value]);
  return { ...(Object.fromEntries(kept) as Partial<T>), ...patch };
}

/** Quita las claves sin valor: lo que la API no trae no debe pisar lo que ya tiene el registro local. */
function defined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Slug a partir de un nombre, para las filas antiguas que no lo tienen guardado. */
const slugify = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function buildPlaceIndex(provinces: ApiRow[], destinations: ApiRow[]): PlaceIndex {
  const entry = (row: ApiRow) => { const name = text(row.name); return name ? { name, slug: text(row.slug) ?? slugify(name) } : null; };
  const index: PlaceIndex = { provinces: new Map(), destinations: new Map() };
  for (const p of provinces) { const e = entry(p); if (e) index.provinces.set(String(p.id), e); }
  for (const d of destinations) { const e = entry(d); if (e) index.destinations.set(String(d.id), { ...e, provinceId: text(d.province_id) ?? null }); }
  return index;
}

/** Campos de jerarquía (destino y provincia) que comparten alojamientos, restaurantes, bares y experiencias. */
function placeOf(row: ApiRow, places: PlaceIndex) {
  const destination = places.destinations.get(String(row.destination_id));
  const province = places.provinces.get(String(destination?.provinceId ?? row.province_id));
  return defined({ destinationId: destination?.slug, destinationName: destination?.name, province: province?.name, provinceId: province?.slug });
}

/** Lo que tienen en común todas las fichas del catálogo. El slug hace de id: es estable y es el que usan las rutas. */
function common(row: ApiRow) {
  return defined({
    id: text(row.slug), slug: text(row.slug), name: text(row.name),
    shortDescription: text(row.short_description), description: text(row.description),
    imageUrl: image(row.image_url), gallery: images(row.gallery),
    latitude: num(row.latitude), longitude: num(row.longitude), rating: num(row.rating), isFeatured: flag(row.is_featured),
  });
}

export function beachPatch(row: ApiRow, places: PlaceIndex): Partial<Beach> {
  const province = places.provinces.get(String(row.province_id));
  const destination = places.destinations.get(String(row.destination_id));
  return {
    ...common(row),
    ...defined({
      province: province?.name, provinceId: province?.slug, provinceSlug: province?.slug,
      destinationId: destination?.slug, destinationName: destination?.name,
      beachType: text(row.beach_type) as Beach["beachType"] | undefined,
      activities: list(row.activities), amenities: list(row.amenities),
      waterColor: text(row.water_color), sandType: text(row.sand_type),
      waveIntensity: text(row.wave_intensity) as Beach["waveIntensity"] | undefined,
      crowdLevel: text(row.crowd_level) as Beach["crowdLevel"] | undefined,
      accessType: text(row.access_type) as Beach["accessType"] | undefined,
      parkingAvailable: flag(row.parking_available), lifeguardOnDuty: flag(row.lifeguard_on_duty),
      howToGetThere: text(row.how_to_get_there), bestTimeToVisit: text(row.best_time_to_visit),
      isPopular: flag(row.is_popular),
    }),
  };
}

export function hotelPatch(row: ApiRow, places: PlaceIndex): Partial<Hotel> {
  return {
    ...common(row), ...placeOf(row, places),
    ...defined({
      category: text(row.category) as Hotel["category"] | undefined, stars: num(row.stars),
      amenities: list(row.amenities), priceRange: text(row.price_range) as Hotel["priceRange"] | undefined,
      reviewCount: num(row.review_count), address: text(row.address), phone: text(row.phone), website: text(row.website),
    }),
  };
}

export function restaurantPatch(row: ApiRow, places: PlaceIndex): Partial<Restaurant> {
  return {
    ...common(row), ...placeOf(row, places),
    ...defined({
      cuisineType: list(row.cuisine_type), category: text(row.category) as Restaurant["category"] | undefined,
      signatureDishes: list(row.signature_dishes), priceRange: text(row.price_range) as Restaurant["priceRange"] | undefined,
      reviewCount: num(row.review_count), address: text(row.address), phone: text(row.phone),
      openingHours: text(row.opening_hours), services: list(row.services),
    }),
  };
}

export function barPatch(row: ApiRow, places: PlaceIndex): Partial<Bar> {
  return {
    ...common(row), ...placeOf(row, places),
    ...defined({
      barType: text(row.bar_type) as Bar["barType"] | undefined, musicStyle: list(row.music_style),
      priceRange: text(row.price_range) as Bar["priceRange"] | undefined, reviewCount: num(row.review_count),
      address: text(row.address), phone: text(row.phone), openingHours: text(row.opening_hours),
      minimumAge: num(row.minimum_age), dressCode: text(row.dress_code), services: list(row.services),
    }),
  };
}

export function experiencePatch(row: ApiRow, places: PlaceIndex): Partial<Experience> {
  return {
    ...common(row), ...placeOf(row, places),
    ...defined({
      category: text(row.category) as Experience["category"] | undefined, experienceType: text(row.experience_type),
      difficulty: text(row.difficulty) as Experience["difficulty"] | undefined, duration: text(row.duration),
      highlights: list(row.highlights), included: list(row.included), requirements: list(row.requirements),
      bestSeason: text(row.best_season), priceRange: text(row.price_range) as Experience["priceRange"] | undefined,
      reviewCount: num(row.review_count),
    }),
  };
}

/**
 * Los destinos guardan en la base sólo una parte de su ficha: región, tipo, categorías, actividades, consejos y
 * el bloque "acerca de" viven aún en el archivo local. Por eso aquí la API sólo actualiza lo que sí almacena.
 */
export function destinationPatch(row: ApiRow, places: PlaceIndex): Partial<Destination> {
  const province = places.provinces.get(String(row.province_id));
  const { rating: _rating, isFeatured: _isFeatured, ...base } = common(row);
  return {
    ...base,
    ...defined({
      province: province?.name, provinceSlug: province?.slug, provinceId: province?.slug,
      highlights: list(row.highlights), typicalDishes: list(row.typical_dishes),
      weatherInfo: text(row.weather_info), bestTimeToVisit: text(row.best_time_to_visit), howToGetThere: text(row.how_to_get_there),
    }),
  };
}

/**
 * Campos de jerarquía que se derivan de la relación con el destino y la provincia. Las fichas locales ya
 * traen su propia etiqueta, a veces más corta que el nombre real ("Zona Colonial"), y ésa es la que se
 * muestra: lo derivado sólo rellena lo que falte.
 */
const DERIVED_KEYS = ["destinationId", "destinationName", "province", "provinceId", "provinceSlug"] as const;
/**
 * Claves que un registro local conserva aunque la API traiga otro valor: las etiquetas de jerarquía y el `id`,
 * que en los archivos locales es la clave con la que se enlazan entre sí (no siempre coincide con el slug).
 */
const LOCAL_KEYS = ["id", ...DERIVED_KEYS] as const;

/**
 * Superpone lo que trae la API sobre los registros locales, emparejando por slug.
 *  - Un registro que está en ambos conserva sus campos locales y toma de la API los que ésta almacena.
 *  - Uno que sólo está en la API se muestra si trae lo mínimo para una ficha (`isComplete`); `fallback` rellena
 *    antes lo que falte, de modo que un registro sin foto se ve con la imagen genérica en vez de desaparecer.
 *  - Uno que sólo está en local se conserva: la API todavía no es la única fuente del catálogo.
 * El orden es el de la API, y al final los que sólo existen en local.
 */
export { DERIVED_KEYS };

export function overlay<T extends { slug: string }>(local: T[], patches: Partial<T>[], isComplete: (item: Partial<T>) => item is T, fallback: Partial<T> = {}): T[] {
  const bySlug = new Map(local.map((item) => [item.slug, item]));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const patch of patches) {
    if (!patch.slug || seen.has(patch.slug)) continue;
    const base = bySlug.get(patch.slug);
    const merged: Partial<T> = base ? { ...base, ...patch } : patch;
    if (base) for (const key of LOCAL_KEYS) { const kept = (base as Record<string, unknown>)[key]; if (kept !== undefined) (merged as Record<string, unknown>)[key] = kept; }
    // Lo que ni la API ni el registro local traen se rellena con el valor de reserva (p. ej. la imagen genérica).
    for (const [key, value] of Object.entries(fallback)) if (!(merged as Record<string, unknown>)[key]) (merged as Record<string, unknown>)[key] = value;
    if (!isComplete(merged)) continue;
    seen.add(patch.slug);
    out.push(merged);
  }
  for (const item of local) if (!seen.has(item.slug)) out.push(item);
  return out;
}

/** Imagen genérica del sitio para un registro que todavía no tiene fotografía. */
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

/** Lo mínimo para pintar una ficha sin huecos: identidad, textos e imagen. */
export function hasCardBasics<T extends { slug: string; name: string; description: string; imageUrl: string }>(item: Partial<T>): item is T {
  return !!item.slug && !!item.name && !!item.description && !!item.imageUrl;
}
