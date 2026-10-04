import { resolveAssetsDeep } from "./assetPaths";
import type { ApiRow, PlaceIndex } from "./contentMappers";

/**
 * Colecciones secundarias del catálogo (montañas, ríos, recetas, parques, aeropuertos…). Sus archivos locales
 * tienen formas muy distintas entre sí —arreglos o diccionarios, claves en español o en inglés—, así que en
 * lugar de un convertidor por colección hay una tabla que dice, para cada una, qué columna del backend
 * alimenta qué campo local. Es la inversa de `backend/scripts/static/mappers.ts`.
 *
 * Reglas, pensadas para que un dato del backend nunca rompa una pantalla:
 *  - Sólo se listan los campos que el backend guarda tal cual. Los que guarda transformados (una dificultad
 *    numérica convertida a texto, una descripción compuesta) se quedan con el valor local.
 *  - Un valor sólo sustituye al local si es del mismo tipo (texto por texto, lista por lista del mismo tipo).
 *  - Las imágenes `/assets/…` (imágenes empaquetadas con el sitio) se traducen a su nombre compilado; si no
 *    se puede, el registro local conserva la suya.
 *  - `extras` trae la ficha completa tal como la conoce el sitio: alimenta los campos que no tienen columna.
 *  - Una fila que no existe en local se añade si trae su ficha en `extras`, o si la colección está marcada con
 *    `addNew` y trae lo imprescindible.
 */

type Item = Record<string, unknown>;
type Loaded = Item[] | Record<string, Item>;

export interface CollectionSpec {
  /** Nombre con el que se informa de la colección. */
  name: string;
  /** Segmento de la API (`/api/v1/<path>`). Varias colecciones locales pueden compartir tabla. */
  path: string;
  /** Carga el módulo local bajo demanda: el mismo trozo que descargan las pantallas que lo usan. */
  load: () => Promise<Loaded>;
  /** Slug con el que este registro local quedó guardado en la base. */
  keyOf: (item: Item) => string | undefined;
  /** En tablas compartidas, qué filas pertenecen a esta colección. */
  accepts?: (row: ApiRow) => boolean;
  /** Campo local (admite `a.b`) ← columna del backend. */
  fields: Record<string, string>;
  /** Permite mostrar filas que sólo existen en el backend. */
  addNew?: {
    /** Campos locales que deben quedar con valor para que la ficha sea presentable. */
    required: string[];
    /** Campos de jerarquía que se calculan de las relaciones de la fila. */
    derive?: (row: ApiRow, places: PlaceIndex) => Item;
  };
}

export interface Change { collection: string; slug: string; field: string; from: unknown; to: unknown }

const slugify = (name: unknown) => String(name ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isPlain = (v: unknown): v is Item => typeof v === "object" && v !== null && !Array.isArray(v);

function getPath(item: Item, path: string): unknown {
  return path.split(".").reduce<unknown>((at, key) => (isPlain(at) ? at[key] : undefined), item);
}
function setPath(item: Item, path: string, value: unknown): void {
  const keys = path.split(".");
  let at = item;
  for (const key of keys.slice(0, -1)) { if (!isPlain(at[key])) at[key] = {}; at = at[key] as Item; }
  at[keys[keys.length - 1]!] = value;
}

/**
 * Valor del backend listo para ocupar el lugar del local, o `undefined` si no debe tocarlo. `sample` es el
 * valor actual del registro o, si no lo tiene, el de otro registro de la colección: dice de qué tipo es el campo.
 */
export function compatible(sample: unknown, raw: unknown): unknown {
  const resolved = resolveAssetsDeep(raw);
  const value = resolved.value;
  if (value === null || value === undefined || !resolved.ok) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  if (sample === undefined || sample === null) return Array.isArray(value) || isPlain(value) ? undefined : value;
  if (typeof sample === "number") { const n = typeof value === "string" ? Number(value) : value; return typeof n === "number" && Number.isFinite(n) ? n : undefined; }
  if (Array.isArray(sample)) {
    if (!Array.isArray(value)) return undefined;
    if (sample.length === 0 || value.length === 0) return value;
    const [a, b] = [sample[0], value[0]];
    if (typeof a !== typeof b || isPlain(a) !== isPlain(b)) return undefined;
    // Listas de objetos: la fila debe traer al menos las claves que la pantalla lee del registro local.
    return isPlain(a) && isPlain(b) && !Object.keys(a).every((key) => key in b) ? undefined : value;
  }
  if (isPlain(sample)) return isPlain(value) ? value : undefined;
  return typeof sample === typeof value ? value : undefined;
}

/** Texto estable de un valor: la base devuelve los objetos con las claves en otro orden. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isPlain(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

// Lo que la base normaliza no cuenta como cambio: decimales fijos, orden de claves, listas vacías frente a ausentes.
function same(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6;
  if (typeof a === "object" || typeof b === "object") return canonical(a ?? []) === canonical(b ?? []);
  return a === b;
}

/** Registro vacío con la misma forma que `sample`: base de una fila que sólo existe en el backend. */
function blankLike(sample: unknown): unknown {
  if (Array.isArray(sample)) return [];
  if (isPlain(sample)) return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, blankLike(value)]));
  return typeof sample === "string" ? "" : typeof sample === "number" ? 0 : typeof sample === "boolean" ? false : undefined;
}

/** Ficha completa que acompaña a la fila, si la trae. */
const extrasOf = (row: ApiRow): Item | null => (isPlain(row.extras) && Object.keys(row.extras).length > 0 ? row.extras : null);
/** Campo local que hace de título: el primero de la tabla de correspondencias. */
const titleField = (spec: CollectionSpec) => Object.keys(spec.fields)[0]!;

const itemsOf = (loaded: Loaded): Item[] => (Array.isArray(loaded) ? loaded : Object.values(loaded));

/** Cambios que una fila produce sobre su registro local. No modifica nada. */
function changesFor(spec: CollectionSpec, item: Item, row: ApiRow, sample: Item, slug: string): Change[] {
  const changes: Change[] = [];
  // Primero las columnas; después, de `extras`, los campos que no tienen columna.
  const mapped = new Set(Object.keys(spec.fields).map((field) => field.split(".")[0]));
  const candidates: [string, unknown][] = [
    ...Object.entries(spec.fields).map(([field, column]): [string, unknown] => [field, row[column]]),
    ...Object.entries(extrasOf(row) ?? {}).filter(([key]) => !mapped.has(key)),
  ];
  for (const [field, value] of candidates) {
    const current = getPath(item, field);
    const next = compatible(current ?? getPath(sample, field), value);
    if (next === undefined || same(current, next)) continue;
    if (current === undefined && next === false) continue; // la base guarda `false` donde el local no dice nada
    changes.push({ collection: spec.name, slug, field, from: current, to: next });
  }
  return changes;
}

export interface CollectionPlan { changes: Change[]; added: Item[]; matched: number }

/**
 * Qué cambiaría en las colecciones locales que comparten una tabla, dadas sus filas. Cada fila va a la primera
 * colección que la reconoce por slug; las que no reconoce ninguna pueden añadirse a la que admite filas nuevas.
 */
export function planCollections(specs: CollectionSpec[], loaded: Loaded[], rows: ApiRow[], places?: PlaceIndex): CollectionPlan[] {
  const indexes = specs.map((spec, i) => new Map(itemsOf(loaded[i]!).map((item) => [spec.keyOf(item), item] as const)));
  const plans: CollectionPlan[] = specs.map(() => ({ changes: [], added: [], matched: 0 }));
  const seen = new Set<string>();
  for (const row of rows) {
    const slug = typeof row.slug === "string" && row.slug ? row.slug : slugify(row.name ?? row.title);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const owner = specs.findIndex((spec, i) => (spec.accepts?.(row) ?? true) && indexes[i]!.has(slug));
    if (owner >= 0) {
      const spec = specs[owner]!, item = indexes[owner]!.get(slug)!;
      plans[owner]!.matched++;
      plans[owner]!.changes.push(...changesFor(spec, item, row, itemsOf(loaded[owner]!)[0] ?? item, slug));
      continue;
    }
    // Fila nueva. Con ficha en `extras` va a la colección cuya forma tiene (la que reconoce su título); sin
    // ella, sólo a una colección que sepa completar una ficha a partir de las columnas.
    const extras = extrasOf(row);
    const target = specs.findIndex((spec, i) => (spec.accepts?.(row) ?? true) && (extras ? titleField(spec) in extras : !!spec.addNew && Array.isArray(loaded[i])));
    const sample = target >= 0 ? itemsOf(loaded[target]!)[0] : undefined;
    if (target < 0 || !sample) continue;
    const spec = specs[target]!;
    let fresh: Item;
    if (extras) {
      const resolved = resolveAssetsDeep(extras);
      if (!resolved.ok) continue;
      fresh = resolved.value as Item;
    } else {
      if (!places) continue;
      fresh = blankLike(sample) as Item;
      if ("id" in sample) fresh.id = slug;
      if ("slug" in sample) fresh.slug = slug;
      for (const [field, value] of Object.entries(spec.addNew!.derive?.(row, places) ?? {})) if (value !== undefined) setPath(fresh, field, value);
    }
    for (const change of changesFor(spec, fresh, row, sample, slug)) setPath(fresh, change.field, change.to);
    const required = spec.addNew?.required ?? [titleField(spec)];
    if (indexes[target]!.has(spec.keyOf(fresh))) continue; // su ficha apunta a un registro que ya existe con otro slug
    if (required.every((field) => { const v = getPath(fresh, field); return v !== undefined && v !== "" && v !== 0; })) plans[target]!.added.push(fresh);
  }
  return plans;
}

/** Aplica un plan sobre los datos locales, en su sitio: quien ya importó el módulo ve el cambio. */
export function applyPlan(spec: CollectionSpec, loaded: Loaded, plan: CollectionPlan): boolean {
  const index = new Map(itemsOf(loaded).map((item) => [spec.keyOf(item), item] as const));
  for (const change of plan.changes) { const item = index.get(change.slug); if (item) setPath(item, change.field, change.to); }
  for (const item of plan.added) {
    if (index.has(spec.keyOf(item))) continue;
    if (Array.isArray(loaded)) loaded.push(item);
    else loaded[String(item.id ?? item.slug ?? spec.keyOf(item))] = item;
  }
  return plan.changes.length > 0 || plan.added.length > 0;
}

const provinceOf = (row: ApiRow, places: PlaceIndex) => places.provinces.get(String(row.province_id));
const as = <T>(value: T) => value as unknown as Loaded;
const CRIOLLO_CATEGORIES = ["fuerte", "postre", "bebida", "desayuno"];
const isHistory = (row: ApiRow) => String(row.category ?? "").startsWith("historia-");
const isDish = (row: ApiRow) => row.category === "platos-tipicos";

export const SECONDARY_COLLECTIONS: CollectionSpec[] = [
  {
    name: "mountains", path: "mountains", load: async () => as((await import("../data/mountains")).mountains),
    keyOf: (m) => (m.slug as string) ?? slugify(m.name),
    fields: {
      name: "name", altitude: "altitude_m", range: "mountain_range", rangeName: "range_name", shortDescription: "short_description",
      description: "description", imageUrl: "image_url", gallery: "gallery", activities: "activities", difficulty: "difficulty",
      duration: "duration", bestSeason: "best_season", flora: "flora", fauna: "fauna", highlights: "highlights",
      howToGetThere: "how_to_get_there", safetyTips: "safety_tips", guidesRequired: "guides_required", priceRange: "price_range",
      rating: "rating", reviewCount: "review_count", isPopular: "is_popular", isFeatured: "is_featured",
    },
    addNew: { required: ["name", "description", "imageUrl", "provinceId"], derive: (row, places) => ({ provinceId: provinceOf(row, places)?.slug, provinceName: provinceOf(row, places)?.name }) },
  },
  {
    name: "rivers", path: "rivers", load: async () => as((await import("../data/rivers")).rivers),
    keyOf: (r) => (r.slug as string) ?? slugify(r.name),
    fields: {
      name: "name", description: "description", shortDescription: "short_description", imageUrl: "image_url", gallery: "gallery",
      mainProvinceName: "address", difficulty: "difficulty", activities: "activities", bestSeason: "best_season", duration: "duration",
      priceRange: "price_range", safetyTips: "safety_tips", adrenalineLevel: "adrenaline_level", guidesRequired: "certified_guides",
      latitude: "latitude", longitude: "longitude", rating: "rating", isFeatured: "is_featured",
    },
    addNew: { required: ["name", "description", "imageUrl", "mainProvinceName"] },
  },
  {
    // Comparte tabla con `rivers`, que va antes: si un río está en los dos archivos, la fila de la base es la suya.
    name: "rios", path: "rivers", load: async () => as((await import("../data/riosData")).rios),
    keyOf: (r) => slugify(r.nombre),
    fields: { nombre: "name", descripcion: "description", imagen: "image_url", ubicacion: "address", actividades: "activities", mejorEpoca: "best_season", rating: "rating" },
  },
  {
    name: "reservas", path: "protected-areas", load: async () => as((await import("../data/reservasData")).reservas),
    keyOf: (r) => (r.slug as string) ?? slugify(r.nombre),
    fields: { nombre: "name", tipo: "category", ubicacion: "location", superficie: "size", precio: "fee", horario: "hours", descripcion: "description" },
  },
  {
    name: "shoppingMalls", path: "shopping-centers", load: async () => as((await import("../data/shopping-malls")).shoppingMalls),
    keyOf: (s) => s.slug as string,
    fields: { nombre: "name", direccion: "address", telefono: "phone", website: "website", imagen: "image_url" },
  },
  {
    name: "centrosSalud", path: "clinics", load: async () => as((await import("../data/healthCenters")).centrosSalud),
    keyOf: (h) => slugify(h.name),
    fields: { name: "name", address: "address", phone: "phone", services: "specialties" },
  },
  {
    name: "parquesData", path: "theme-parks", load: async () => as((await import("../data/parquesData")).parquesData),
    keyOf: (p) => slugify(p.nombre),
    fields: {
      nombre: "name", tipo: "park_type", descripcionLarga: "description", descripcion: "short_description", imagen: "image_url",
      galeria: "gallery", ubicacion: "address", precioAdulto: "price_adult", precioNino: "price_child", atracciones: "attractions",
      servicios: "services", incluye: "includes", duracion: "duration_recommended", rating: "rating",
    },
  },
  {
    name: "venues (estadios)", path: "stadiums", load: async () => as((await import("../data/venuesData")).VENUES_DATA),
    keyOf: (v) => (v.slug as string) ?? slugify(v.name),
    fields: { name: "name", description: "description", image: "image_url", address: "address", capacity: "capacity", rating: "rating" },
  },
  {
    name: "venues (golf)", path: "golf-courses", load: async () => as((await import("../data/venuesData")).VENUES_DATA),
    keyOf: (v) => (v.slug as string) ?? slugify(v.name),
    fields: { name: "name", description: "description", image: "image_url", "golfSpecs.holes": "holes", "golfSpecs.par": "par", "golfSpecs.designer": "designer" },
  },
  {
    name: "cruisePorts", path: "ports", load: async () => as((await import("../data/portsData")).cruisePorts),
    keyOf: (p) => p.id as string, accepts: (row) => row.port_type === "port",
    fields: { name: "name", image: "image_url" },
  },
  {
    name: "marinasList", path: "ports", load: async () => as((await import("../data/portsData")).marinasList),
    keyOf: (p) => p.id as string, accepts: (row) => row.port_type === "marina",
    fields: { name: "name", image: "image_url", slips: "capacity_slips", services: "services" },
  },
  {
    name: "eventos", path: "events", load: async () => as((await import("../data/eventosData")).eventosEstaticosCompletos),
    keyOf: (e) => e.slug as string,
    // Las fechas no: la base las devuelve con hora y zona, y las pantallas esperan el día tal como está en local.
    fields: { name: "title", description: "description", image_url: "image_url", event_type: "category" },
  },
  {
    name: "criolloRecipes", path: "recipes", load: async () => as((await import("../data/criolloRecipesData")).criolloRecipes),
    keyOf: (r) => (r.id as string) ?? slugify(r.name), accepts: (row) => !isDish(row),
    fields: {
      name: "name", category: "category", region: "region", difficulty: "difficulty", prepTime: "prep_time", cookTime: "cook_time",
      calories: "calories", description: "description", maridaje: "maridaje", ingredients: "ingredients", instructions: "steps",
      imageUrl: "image_url", heroImage: "video_image_url",
    },
  },
  {
    name: "recipesData", path: "recipes", load: async () => as((await import("../data/recipesData")).recipesData),
    keyOf: (r) => (r.slug as string) ?? slugify(r.title), accepts: isDish,
    fields: {
      title: "name", region: "region", difficulty: "difficulty", prepTime: "prep_time", cookTime: "cook_time", time: "total_time",
      servings: "servings", description: "description", history: "history", maridaje: "maridaje", badges: "badges",
      ingredients: "ingredients", steps: "steps", heroImage: "image_url", videoImage: "video_image_url",
    },
  },
  {
    name: "airports", path: "airports", load: async () => as((await import("../data/airports")).airports),
    keyOf: (a) => (a.slug as string) ?? slugify(a.name),
    fields: {
      name: "name", code: "code", icao: "icao", city: "city", type: "airport_type", shortDescription: "short_description",
      description: "description", imageUrl: "image_url", gallery: "gallery", "coordinates.lat": "latitude", "coordinates.lng": "longitude",
      terminals: "terminals", airlines: "airlines", destinations: "destinations", services: "services", transportation: "transportation",
      nearbyDestinations: "nearby_destinations", phone: "phone", website: "website", rating: "rating", reviewCount: "review_count",
    },
    addNew: { required: ["name", "code", "description", "imageUrl", "coordinates.lat", "provinceId"], derive: (row, places) => ({ provinceId: provinceOf(row, places)?.slug, provinceName: provinceOf(row, places)?.name }) },
  },
  {
    name: "blogPosts", path: "articles", load: async () => as((await import("../data/blogData")).blogPosts),
    keyOf: (b) => b.slug as string, accepts: (row) => !isHistory(row),
    // La fecha de publicación no: la base la devuelve con hora y zona.
    fields: { title: "title", excerpt: "excerpt", content: "content", imageUrl: "image_url", category: "category", tags: "tags", "author.name": "author_name", "author.avatar": "author_image", isFeatured: "is_featured" },
  },
  {
    name: "historyArticles", path: "articles", load: async () => as((await import("../data/historyArticles")).historyArticles),
    keyOf: (h) => h.slug as string, accepts: isHistory,
    // El cuerpo no: en la base es un único texto compuesto a partir de las secciones locales.
    fields: { title: "title", summary: "excerpt", heroImage: "image_url", "author.name": "author_name" },
  },
  {
    // La descripción de la base es un texto compuesto (descripción, impacto y aliado): el detalle llega por `extras`.
    name: "offsetProjects", path: "offset-projects", load: async () => as((await import("../data/carbonoData")).offsetProjects),
    keyOf: (p) => slugify(p.title),
    fields: { title: "title", location: "location", category: "category", cost_info: "cost_info" },
  },
  {
    name: "rutasSabor", path: "routes", load: async () => as((await import("../data/rutasSaborData")).RUTAS_SABOR_DATA),
    keyOf: (r) => slugify(r.name), accepts: (row) => isPlain(row.extras) && "paradasClave" in row.extras,
    fields: { name: "title" },
  },
];

/** Las recetas criollas nuevas sólo se muestran si su categoría es una de las que la pantalla sabe pintar. */
const criollo = SECONDARY_COLLECTIONS.find((spec) => spec.name === "criolloRecipes")!;
criollo.addNew = { required: ["name", "description", "imageUrl"] };
criollo.accepts = (row) => !isDish(row) && (row.category == null || CRIOLLO_CATEGORIES.includes(String(row.category)));

/** Colecciones agrupadas por la ruta de la API que comparten. */
export function collectionGroups(specs: CollectionSpec[] = SECONDARY_COLLECTIONS): Map<string, CollectionSpec[]> {
  const groups = new Map<string, CollectionSpec[]>();
  for (const spec of specs) groups.set(spec.path, [...(groups.get(spec.path) ?? []), spec]);
  return groups;
}

/**
 * Carga del backend las colecciones secundarias y actualiza sus datos locales. Cada tabla falla por separado.
 * Devuelve los nombres de las colecciones que cambiaron.
 */
export async function hydrateSecondaryCollections(
  fetchRows: (path: string) => Promise<ApiRow[]>, places: Promise<PlaceIndex>, specs: CollectionSpec[] = SECONDARY_COLLECTIONS,
): Promise<string[]> {
  const changed = await Promise.all([...collectionGroups(specs)].map(async ([path, group]) => {
    try {
      const [rows, loaded, index] = await Promise.all([fetchRows(path), Promise.all(group.map((spec) => spec.load())), places]);
      const plans = planCollections(group, loaded, rows, index);
      return group.filter((spec, i) => applyPlan(spec, loaded[i]!, plans[i]!)).map((spec) => spec.name);
    } catch {
      return []; // sin esta tabla, sus colecciones siguen con los datos locales
    }
  }));
  return changed.flat();
}
