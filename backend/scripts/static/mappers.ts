// Mapeo del contenido estático del frontend (src/data/*.ts) a las colecciones del CMS. Cada `Dataset` dice de qué archivo sale,
// a qué tabla va y cómo se convierte cada elemento. Los ids son UUID v5 derivados de (tabla, id original): repetir la carga no duplica
// y las referencias entre colecciones (destino → playa) se resuelven sin consultas.
import { v5 as uuidv5 } from "uuid";
import { slugify } from "../../src/lib/slug.js";

export type Row = Record<string, unknown>;
export interface Ctx {
  /** Id de la provincia por su slug o nombre (con o sin acentos); null si no existe. */
  prov(x?: string | null): string | null;
  /** Id del destino (de la base) por su slug estático. */
  dest(x?: string | null): string | null;
}
export interface Dataset {
  key: string; file: string; table: string;
  items: (m: Record<string, unknown>) => unknown[];
  map: (x: any, c: Ctx) => Row | null;
}

const NS = "7f1c1a52-6d7b-4d6a-9d0a-5a0c7c2e0d11";
export const idOf = (table: string, staticId: string) => uuidv5(`${table}:${staticId}`, NS);
const nn = <T>(v: T | undefined | null): T | null => (v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? null : v);
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown, def: unknown = []) => (v === undefined || v === null ? def : v);
const price = (s: unknown): number | null => { const m = typeof s === "string" ? /(\d[\d,]*(?:\.\d+)?)/.exec(s) : null; return m ? Number(m[1]!.replace(/,/g, "")) : typeof s === "number" ? s : null; };
/** "18.4636° N, 69.8827° W" o "18.4720, -69.8823" → { lat, lng }. */
const coords = (s: unknown): { lat: number; lng: number } | null => {
  if (typeof s !== "string") return null;
  const m = /(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?\s*,\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?/i.exec(s);
  if (!m) return null;
  let lat = Number(m[1]), lng = Number(m[3]);
  if (m[2]?.toUpperCase() === "S") lat = -Math.abs(lat);
  if (m[4]?.toUpperCase() === "W") lng = -Math.abs(lng);
  return { lat, lng };
};
const arr = (k: string) => (m: Record<string, unknown>) => list(m[k]);

/** Campos comunes de las colecciones editoriales. */
const base = (table: string, x: { id?: string; slug?: string }, name: string): Row => ({ id: idOf(table, String(x.id ?? x.slug ?? name)), slug: x.slug ?? slugify(name) });

export const DATASETS: Dataset[] = [
  // ---------- Provincias (las 32, por si falta alguna) ----------
  { key: "provinces", file: "gamificacionTuristicaData.ts", table: "provinces", items: arr("PROVINCES"), map: (p) => ({ id: idOf("provinces", slugify(p.name)), name: p.name, slug: slugify(p.name), region: p.region }) },

  // ---------- Destinos ----------
  { key: "destinations", file: "destinations.ts", table: "destinations", items: arr("destinations"),
    map: (d, c) => ({ ...base("destinations", d, d.name), name: d.name, province_id: c.prov(d.type === "provincia" ? d.slug : d.province ?? d.region), description: d.description, short_description: d.shortDescription, image_url: d.imageUrl, gallery: d.gallery, highlights: d.highlights, typical_dishes: d.typicalDishes, latitude: d.latitude, longitude: d.longitude, weather_info: nn(d.weatherInfo), best_time_to_visit: nn(d.bestTimeToVisit), how_to_get_there: nn(d.howToGetThere) }) },

  // ---------- Naturaleza ----------
  { key: "beaches", file: "beaches.ts", table: "beaches", items: arr("beaches"),
    map: (b, c) => ({ ...base("beaches", b, b.name), name: b.name, destination_id: c.dest(b.destinationId), province_id: c.prov(b.provinceSlug ?? b.provinceId ?? b.province), beach_type: b.beachType, description: b.description, short_description: b.shortDescription, image_url: b.imageUrl, gallery: b.gallery, activities: b.activities, amenities: b.amenities, water_color: nn(b.waterColor), sand_type: nn(b.sandType), wave_intensity: nn(b.waveIntensity), crowd_level: nn(b.crowdLevel), access_type: nn(b.accessType), parking_available: b.parkingAvailable ?? null, lifeguard_on_duty: b.lifeguardOnDuty ?? null, how_to_get_there: nn(b.howToGetThere), best_time_to_visit: nn(b.bestTimeToVisit), latitude: b.latitude, longitude: b.longitude, rating: b.rating, review_count: b.reviewCount ?? 0, is_popular: !!b.isPopular, is_featured: !!b.isFeatured }) },
  { key: "mountains", file: "mountains.ts", table: "mountains", items: arr("mountains"),
    map: (m, c) => ({ ...base("mountains", m, m.name), name: m.name, altitude_m: m.altitude, mountain_range: m.range, range_name: m.rangeName, province_id: c.prov(m.provinceId ?? m.provinceName), short_description: m.shortDescription, description: m.description, image_url: m.imageUrl, gallery: obj(m.gallery), activities: obj(m.activities), difficulty: nn(m.difficulty), duration: nn(m.duration), best_season: nn(m.bestSeason), flora: obj(m.flora), fauna: obj(m.fauna), highlights: obj(m.highlights), how_to_get_there: nn(m.howToGetThere), safety_tips: obj(m.safetyTips), guides_required: !!m.guidesRequired, price_range: nn(m.priceRange), rating: m.rating ?? null, review_count: m.reviewCount ?? 0, is_popular: !!m.isPopular, is_featured: !!m.isFeatured, latitude: nn(m.latitude), longitude: nn(m.longitude) }) },
  { key: "rivers", file: "rivers.ts", table: "rivers", items: arr("rivers"),
    map: (r, c) => ({ ...base("rivers", r, r.name), name: r.name, destination_id: c.dest(r.destinationId), description: r.description, short_description: r.shortDescription, image_url: r.imageUrl, gallery: r.gallery, address: nn(r.mainProvinceName), difficulty: nn(r.difficulty), activities: r.activities, best_season: nn(r.bestSeason), duration: nn(r.duration), price_range: nn(r.priceRange), safety_tips: r.safetyTips, adrenaline_level: r.adrenalineLevel ?? null, certified_guides: !!r.guidesRequired, latitude: nn(r.latitude), longitude: nn(r.longitude), rating: r.rating ?? null, is_featured: !!r.isFeatured }) },
  { key: "rios", file: "riosData.ts", table: "rivers", items: arr("rios"),
    map: (r) => ({ id: idOf("rivers", `rio:${r.id}`), name: r.nombre, slug: slugify(r.nombre), description: r.descripcion, short_description: r.descripcion, image_url: r.imagen, address: r.ubicacion, difficulty: typeof r.dificultad === "number" ? (["", "facil", "facil", "moderado", "dificil", "experto"][r.dificultad] ?? null) : nn(r.dificultad), activities: r.actividades, best_season: nn(r.mejorEpoca), adrenaline_level: r.adrenalina === "Alta" ? 4 : r.adrenalina === "Media" ? 3 : r.adrenalina === "Baja" ? 1 : null, rating: r.rating ?? null, is_featured: !!r.popular }) },
  { key: "protected_areas", file: "reservasData.ts", table: "protected_areas", items: arr("reservas"),
    map: (r) => ({ ...base("protected_areas", r, r.nombre), name: r.nombre, category: r.tipo, location: r.ubicacion, size: r.superficie ?? "—", fee: r.precio ?? "Gratis", hours: r.horario ?? "—", attractions: { species: obj(r.especies), activities: obj(r.actividades), habitat: r.categoria ?? null }, rules: [], description: r.descripcion }) },

  // ---------- Dónde dormir, comer y salir ----------
  { key: "hotels", file: "hotels.ts", table: "hotels", items: arr("hotels"),
    map: (h, c) => ({ ...base("hotels", h, h.name), name: h.name, destination_id: c.dest(h.destinationId), category: nn(h.category), stars: h.stars ?? null, description: h.description, short_description: h.shortDescription, image_url: h.imageUrl, gallery: h.gallery, address: nn(h.address), phone: nn(h.phone), website: nn(h.website), price_range: nn(h.priceRange), amenities: h.amenities, latitude: nn(h.latitude), longitude: nn(h.longitude), rating: h.rating ?? null, review_count: h.reviewCount ?? 0, is_featured: !!h.isFeatured, is_active: true }) },
  { key: "restaurants", file: "restaurants.ts", table: "restaurants", items: arr("restaurants"),
    map: (r, c) => ({ ...base("restaurants", r, r.name), name: r.name, destination_id: c.dest(r.destinationId), cuisine_type: r.cuisineType, category: nn(r.category), price_range: nn(r.priceRange), description: r.description, short_description: r.shortDescription, image_url: r.imageUrl, gallery: r.gallery, address: nn(r.address), phone: nn(r.phone), opening_hours: nn(r.openingHours), latitude: nn(r.latitude), longitude: nn(r.longitude), rating: r.rating ?? null, review_count: r.reviewCount ?? 0, services: r.services, signature_dishes: r.signatureDishes, is_featured: !!r.isFeatured, is_active: true }) },
  { key: "bars", file: "bars.ts", table: "bars", items: arr("bars"),
    map: (b, c) => ({ ...base("bars", b, b.name), name: b.name, destination_id: c.dest(b.destinationId), bar_type: nn(b.barType), price_range: nn(b.priceRange), description: b.description, short_description: b.shortDescription, image_url: b.imageUrl, gallery: b.gallery, address: nn(b.address), phone: nn(b.phone), opening_hours: nn(b.openingHours), latitude: nn(b.latitude), longitude: nn(b.longitude), rating: b.rating ?? null, review_count: b.reviewCount ?? 0, music_style: b.musicStyle, minimum_age: b.minimumAge ?? null, dress_code: nn(b.dressCode), services: b.services, is_featured: !!b.isFeatured, is_active: true }) },
  { key: "shopping_centers", file: "shopping-malls.ts", table: "shopping_centers", items: arr("shoppingMalls"),
    map: (s) => ({ id: idOf("shopping_centers", s.slug), name: s.nombre, slug: s.slug, address: nn(s.direccion), phone: nn(s.telefono), website: nn(s.website), image_url: nn(s.imagen), is_active: true }) },
  { key: "clinics", file: "healthCenters.ts", table: "clinics", items: arr("centrosSalud"),
    map: (h) => ({ id: idOf("clinics", h.id), name: h.name, slug: slugify(h.name), address: nn(h.address), phone: nn(h.phone), specialties: h.services, is_active: true }) },

  // ---------- Qué hacer ----------
  { key: "experiences", file: "experiences.ts", table: "experiences", items: arr("experiences"),
    map: (e, c) => ({ ...base("experiences", e, e.name), title: e.name, name: e.name, destination_id: c.dest(e.destinationId), category: e.category, experience_type: nn(e.experienceType), difficulty: nn(e.difficulty), duration: nn(e.duration), description: e.description, short_description: e.shortDescription, image_url: e.imageUrl, gallery: e.gallery, highlights: e.highlights, included: e.included, requirements: e.requirements, best_season: nn(e.bestSeason), price_range: nn(e.priceRange), rating: e.rating ?? null, review_count: e.reviewCount ?? 0, is_featured: !!e.isFeatured, is_active: true }) },
  { key: "theme_parks", file: "parquesData.ts", table: "theme_parks", items: (m) => Object.values((m.parquesData ?? {}) as object),
    map: (p) => { const c = p.coordenadas ?? {}; return { id: idOf("theme_parks", p.id), name: p.nombre, slug: slugify(p.nombre), park_type: nn(p.tipo), description: p.descripcionLarga ?? p.descripcion, short_description: p.descripcion, image_url: p.imagen, gallery: obj(p.galeria), address: nn(p.ubicacion), price_adult: nn(p.precioAdulto), price_child: nn(p.precioNino), opening_hours: [p.horario, p.diasOperacion].filter(Boolean).join(" · ") || null, attractions: obj(p.atracciones), services: obj(p.servicios), includes: obj(p.incluye), duration_recommended: nn(p.duracion), latitude: nn(c.lat), longitude: nn(c.lng), rating: p.rating ?? null }; } },
  { key: "stadiums", file: "venuesData.ts", table: "stadiums", items: (m) => Object.values((m.VENUES_DATA ?? {}) as Record<string, { category: string }>).filter((v) => ["estadio", "arena", "teatro"].includes(v.category)),
    map: (v) => ({ ...base("stadiums", v, v.name), name: v.name, stadium_type: v.categoryLabel ?? v.category, description: v.description, short_description: v.description, image_url: v.image, address: nn(v.address), capacity: typeof v.capacity === "number" ? v.capacity : price(v.capacity), home_teams: (v.homeTeams ?? []).map((t: { name: string }) => t.name), facilities: obj(v.amenities), rating: v.rating ?? null }) },
  { key: "golf_courses", file: "venuesData.ts", table: "golf_courses", items: (m) => Object.values((m.VENUES_DATA ?? {}) as Record<string, { category: string }>).filter((v) => v.category === "golf"),
    map: (v) => ({ ...base("golf_courses", v, v.name), name: v.name, holes: v.golfSpecs?.holes ?? 18, par: v.golfSpecs?.par ?? 72, designer: nn(v.golfSpecs?.designer), description: v.description, image_url: v.image }) },
  { key: "ports", file: "portsData.ts", table: "ports_marinas", items: arr("cruisePorts"),
    map: (p) => { const c = coords(p.coordinates); return { id: idOf("ports_marinas", p.id), name: p.name, slug: p.id, port_type: "port", description: `${p.type} en ${p.location}. Líneas: ${(p.cruiseLines ?? []).join(", ")}. Horario: ${p.schedule ?? "según itinerario"}.`, image_url: p.image, services: (p.facilities ?? []).map((f: { name: string }) => f.name), latitude: c?.lat ?? null, longitude: c?.lng ?? null }; } },
  { key: "marinas", file: "portsData.ts", table: "ports_marinas", items: arr("marinasList"),
    map: (p) => ({ id: idOf("ports_marinas", p.id), name: p.name, slug: p.id, port_type: "marina", description: `Marina en ${p.location}. Eslora máxima ${p.maxLength}.`, image_url: p.image, capacity_slips: p.slips ?? null, services: p.services }) },
  { key: "events", file: "eventosData.ts", table: "events", items: arr("eventosEstaticosCompletos"),
    map: (e) => ({ id: idOf("events", e.id), title: e.name, slug: e.slug, start_date: e.start_date, end_date: nn(e.end_date), location: [e.venue, e.province].filter(Boolean).join(", "), description: e.description, image_url: e.image_url, category: nn(e.event_type), is_active: true }) },

  // ---------- Gastronomía y transporte ----------
  { key: "recipes_criollas", file: "criolloRecipesData.ts", table: "recipes", items: arr("criolloRecipes"),
    map: (r) => ({ id: idOf("recipes", `c:${r.id}`), name: r.name, slug: r.id ?? slugify(r.name), category: nn(r.category), region: nn(r.region), difficulty: nn(r.difficulty), prep_time: nn(r.prepTime), cook_time: nn(r.cookTime), calories: nn(r.calories), description: r.description, short_description: String(r.description ?? "").slice(0, 160), maridaje: nn(r.maridaje), ingredients: obj(r.ingredients), steps: obj(r.instructions), image_url: nn(r.imageUrl), video_image_url: nn(r.heroImage), is_featured: false }) },
  { key: "recipes_platos", file: "recipesData.ts", table: "recipes", items: (m) => Object.values((m.recipesData ?? {}) as object),
    map: (r) => ({ id: idOf("recipes", `p:${r.id}`), name: r.title, slug: r.slug ?? slugify(r.title), category: "platos-tipicos", region: nn(r.region), difficulty: nn(r.difficulty), prep_time: nn(r.prepTime), cook_time: nn(r.cookTime), total_time: nn(r.time), servings: nn(r.servings), short_description: nn(String(r.tagline ?? "").replace(/^"|"$/g, "")), description: r.description, history: nn(r.history), quote: nn(String(r.quote ?? "").replace(/^"|"$/g, "")), maridaje: nn(r.maridaje), badges: obj(r.badges), ingredients: obj(r.ingredients, {}), steps: obj(r.steps), image_url: nn(r.heroImage), video_image_url: nn(r.videoImage), is_featured: true }) },
  { key: "airports", file: "airports.ts", table: "airports", items: arr("airports"),
    map: (a, c) => ({ id: idOf("airports", a.id), name: a.name, slug: a.slug ?? slugify(a.name), code: nn(a.code), icao: nn(a.icao), city: nn(a.city), province_id: c.prov(a.provinceId ?? a.provinceName), airport_type: nn(a.type), short_description: nn(a.shortDescription), description: a.description, image_url: nn(a.imageUrl), gallery: obj(a.gallery, null), latitude: nn(a.coordinates?.lat), longitude: nn(a.coordinates?.lng), terminals: obj(a.terminals), airlines: obj(a.airlines), destinations: obj(a.destinations), services: obj(a.services), transportation: obj(a.transportation), nearby_destinations: obj(a.nearbyDestinations), phone: nn(a.phone), website: nn(a.website), rating: nn(a.rating), review_count: a.reviewCount ?? 0, is_featured: !!(a.isFeatured || a.isPopular) }) },

  // ---------- Historia, blog y sostenibilidad ----------
  { key: "blog", file: "blogData.ts", table: "articles", items: arr("blogPosts"),
    map: (b) => ({ id: idOf("articles", b.id), slug: b.slug, title: b.title, excerpt: b.excerpt, content: b.content, image_url: b.imageUrl, category: b.category, tags: b.tags, author_name: b.author?.name ?? null, author_image: nn(b.author?.avatar), is_published: true, is_featured: !!b.isFeatured, published_at: b.publishedAt }) },
  { key: "history", file: "historyArticles.ts", table: "articles", items: arr("historyArticles"),
    map: (h) => ({ id: idOf("articles", `h:${h.id}`), slug: h.slug, title: h.title, excerpt: h.summary, content: (h.contentSections ?? []).map((s: { heading: string; content: string }) => `## ${s.heading}\n\n${s.content}`).join("\n\n") + (h.quote?.text ? `\n\n> ${h.quote.text} — ${h.quote.author}` : ""), image_url: h.heroImage, category: `historia-${h.category}`, tags: [h.era, h.period].filter(Boolean), author_name: h.author?.name ?? null, is_published: true, is_featured: false }) },
  { key: "offset_projects", file: "carbonoData.ts", table: "offset_projects", items: arr("offsetProjects"),
    map: (p) => ({ id: idOf("offset_projects", p.id), title: p.title, location: p.location, category: p.category, description: [p.description, p.impact ? `Impacto: ${p.impact}` : "", p.partner ? `Aliado: ${p.partner}` : ""].filter(Boolean).join(" "), cost_info: p.cost_info }) },
  { key: "rutas_sabor", file: "rutasSaborData.ts", table: "routes", items: (m) => Object.values((m.RUTAS_SABOR_DATA ?? {}) as object),
    map: (r) => ({ id: idOf("routes", r.id), title: r.name, slug: slugify(r.name), description: [r.tagline, r.description, `Paradas: ${(r.paradasClave ?? []).map((p: { nombre: string }) => p.nombre).join("; ")}`].filter(Boolean).join("\n\n") }) },
];
