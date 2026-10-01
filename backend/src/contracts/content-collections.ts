// Registro de colecciones de contenido público (docs §5.3). Una definición por colección alimenta seis rutas
// genéricas: listado, facetas, detalle, relacionados, cercanos y reseñas. Las columnas se validan contra
// `manifest.json` (generado de la base) en las pruebas, por lo que un cambio de esquema que rompa una definición se detecta al instante.

/** Cómo se compara un filtro `filter[columna]=valor`. */
export type FilterKind =
  | "eq"        // igualdad (texto sin distinguir mayúsculas/acentos, uuid, número, booleano o fecha según el tipo de la columna)
  | "range"     // igualdad y operadores gte/lte/gt/lt (números y fechas)
  | "contains"; // columnas de lista (jsonb o text[]): coincide si contiene alguno de los valores

export interface Relation { column: string; table: string; fields: string[] }

export interface CollectionDef {
  /** Segmento de ruta bajo /api/v1 */
  path: string;
  table: string;
  /** Nombre singular usado en `reviews.entity_type` y favoritos */
  entityType: string;
  label: string;
  /** Columna que actúa como título (para orden por defecto y búsqueda) */
  title: string;
  search: string[];
  filters: Record<string, FilterKind>;
  sort: string[];
  defaultSort: { column: string; dir: "ASC" | "DESC" }[];
  /** Columnas que no se envían en los listados (sí en el detalle) */
  listExclude: string[];
  /** Columnas que nunca son públicas */
  exclude: string[];
  geo?: { lat: string; lng: string };
  relations: Record<string, Relation>;
  /** Columnas con las que se calculan los "relacionados" */
  related: string[];
  /** Campos traducibles vía entity_translations */
  translatable: string[];
  /** Condición SQL adicional de visibilidad (sin parámetros) */
  visible?: string;
  /** Aparece en /nearby por defecto */
  nearbyDefault?: boolean;
  reviewable: boolean;
  tag: string;
}

const HEAVY = ["description", "content", "biography", "gallery", "company_description", "historical_info", "production_process", "safety_tips", "significance", "house_rules", "host_description", "responsibilities", "benefits", "skills", "requirements", "achievements", "quotes", "sources", "consequences", "key_figures", "attractions", "rules", "tolls_data", "animation_config", "slider_items"];
const TEXT_TRANSLATABLE = ["name", "title", "description", "short_description", "excerpt", "content", "headline", "subtext", "highlights"];
const NOT_PUBLIC_DEFAULT = ["verification_notes", "verified_at"];

type Partial_ = Partial<Omit<CollectionDef, "path" | "table" | "entityType" | "label" | "tag">>;
function def(path: string, table: string, entityType: string, label: string, tag: string, o: Partial_ = {}): CollectionDef {
  const title = o.title ?? "name";
  return {
    path, table, entityType, label, tag, title,
    search: o.search ?? [title, "short_description", "description"],
    filters: o.filters ?? {},
    sort: o.sort ?? [title, "created_at"],
    defaultSort: o.defaultSort ?? [{ column: title, dir: "ASC" }],
    listExclude: o.listExclude ?? HEAVY,
    exclude: [...NOT_PUBLIC_DEFAULT, ...(o.exclude ?? [])],
    geo: o.geo,
    relations: o.relations ?? {},
    related: o.related ?? [],
    translatable: o.translatable ?? TEXT_TRANSLATABLE,
    visible: o.visible,
    nearbyDefault: o.nearbyDefault ?? false,
    reviewable: o.reviewable ?? false,
  };
}
const geo = { lat: "latitude", lng: "longitude" };
const destination: Record<string, Relation> = { destination: { column: "destination_id", table: "destinations", fields: ["id", "slug", "name"] } };
const province: Record<string, Relation> = { province: { column: "province_id", table: "provinces", fields: ["id", "slug", "name"] } };
const rated = (extra: string[] = []) => ["rating", "review_count", ...extra];

export const COLLECTIONS: CollectionDef[] = [
  // ---- Territorio ----
  def("provinces", "provinces", "province", "Provincias", "territorio", { filters: { region: "eq" }, sort: ["name", "region", "created_at"], search: ["name", "description"], translatable: ["name", "description"], listExclude: [] }),
  def("municipalities", "municipalities", "municipality", "Municipios", "territorio", { filters: { province_id: "eq", municipality_type: "eq", is_tourist_destination: "eq" }, geo, relations: province, related: ["province_id"] }),
  def("destinations", "destinations", "destination", "Destinos", "territorio", { filters: { province_id: "eq", best_time_to_visit: "eq" }, geo, relations: province, related: ["province_id"], reviewable: true, nearbyDefault: false }),
  def("beaches", "beaches", "beach", "Playas", "territorio", {
    filters: { destination_id: "eq", province_id: "eq", beach_type: "eq", water_color: "eq", sand_type: "eq", wave_intensity: "eq", crowd_level: "eq", access_type: "eq", parking_available: "eq", lifeguard_on_duty: "eq", is_popular: "eq", is_featured: "eq", rating: "range" },
    sort: ["name", "rating", "review_count", "created_at"], defaultSort: [{ column: "is_featured", dir: "DESC" }, { column: "name", dir: "ASC" }], geo, relations: { ...destination, ...province }, related: ["destination_id", "province_id", "beach_type"], reviewable: true, nearbyDefault: true,
  }),
  def("mountains", "mountains", "mountain", "Montañas", "territorio", { filters: { province_id: "eq", difficulty: "eq", mountain_range: "eq", guides_required: "eq", altitude_m: "range", is_popular: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "altitude_m", "rating", "review_count", "created_at"], geo, relations: province, related: ["province_id", "mountain_range"], reviewable: true }),
  def("rivers", "rivers", "river", "Ríos", "territorio", { filters: { destination_id: "eq", difficulty: "eq", is_featured: "eq", certified_guides: "eq", adrenaline_level: "range", rating: "range" }, sort: ["name", "rating", "adrenaline_level", "created_at"], geo, relations: destination, related: ["destination_id", "difficulty"], reviewable: true }),
  def("parks", "parks", "park", "Parques nacionales", "territorio", { filters: { province_id: "eq", destination_id: "eq", park_type: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "rating", "area_km2", "created_at"], geo, relations: { ...destination, ...province }, related: ["province_id", "park_type"], reviewable: true }),
  def("protected-areas", "protected_areas", "protected_area", "Áreas protegidas", "territorio", { filters: { category: "eq" }, search: ["name", "description", "location"], related: ["category"] }),
  def("caves", "caves", "cave", "Cuevas", "territorio", { filters: { destination_id: "eq", cave_type: "eq", difficulty: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "rating", "created_at"], geo, relations: destination, related: ["destination_id"], reviewable: true }),
  def("hot-springs", "hot_springs", "hot_spring", "Aguas termales", "territorio", { filters: { province: "eq" }, search: ["name", "description", "location"], related: ["province"] }),
  def("monuments", "monuments", "monument", "Monumentos y museos", "territorio", { filters: { province_id: "eq", destination_id: "eq", monument_type: "eq", is_featured: "eq" }, sort: ["name", "rating", "created_at"], geo, relations: { ...destination, ...province }, related: ["province_id", "monument_type"], reviewable: true, nearbyDefault: true }),
  def("bird-species", "bird_species", "bird_species", "Aves", "territorio", { filters: { conservation: "eq" }, search: ["name", "scientific_name", "description"], related: ["conservation"] }),
  def("recipes", "recipes", "recipe", "Recetas criollas", "gastronomia", { filters: { category: "eq", region: "eq", difficulty: "eq", is_featured: "eq" }, search: ["name", "short_description", "description", "region"], translatable: ["name", "short_description", "description", "history", "maridaje", "quote"], related: ["category", "region"] }),
  def("airports", "airports", "airport", "Aeropuertos", "servicios", { filters: { province_id: "eq", airport_type: "eq", code: "eq", is_featured: "eq" }, search: ["name", "code", "icao", "city", "short_description"], geo, relations: province, related: ["province_id"] }),
  def("offset-projects", "offset_projects", "offset_project", "Proyectos de compensación", "territorio", { title: "title", filters: { category: "eq" }, search: ["title", "description", "location"] }),
  def("toll-routes", "toll_routes", "toll_route", "Rutas con peaje", "territorio", { search: ["name", "description"] }),

  // ---- Alojamiento, gastronomía y servicios ----
  def("hotels", "hotels", "hotel", "Hoteles", "alojamiento", {
    filters: { destination_id: "eq", category: "eq", stars: "range", price_range: "eq", is_featured: "eq", is_sponsored: "eq", amenities: "contains", rating: "range" },
    sort: ["name", "rating", "stars", "review_count", "created_at"], defaultSort: [{ column: "is_sponsored", dir: "DESC" }, { column: "is_featured", dir: "DESC" }, { column: "name", dir: "ASC" }],
    geo, relations: destination, related: ["destination_id", "category"], reviewable: true, nearbyDefault: true,
  }),
  def("airbnb-listings", "airbnb_listings", "airbnb", "Alojamientos tipo Airbnb", "alojamiento", { filters: { destination_id: "eq", property_type: "eq", guests: "range", bedrooms: "range", price_per_night: "range", is_superhost: "eq", instant_book: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "rating", "price_per_night", "created_at"], geo, relations: destination, related: ["destination_id", "property_type"], reviewable: true }),
  def("restaurants", "restaurants", "restaurant", "Restaurantes", "gastronomia", { filters: { destination_id: "eq", cuisine_type: "contains", price_range: "eq", category: "eq", is_featured: "eq", is_sponsored: "eq", rating: "range" }, sort: ["name", "rating", "review_count", "created_at"], defaultSort: [{ column: "is_sponsored", dir: "DESC" }, { column: "is_featured", dir: "DESC" }, { column: "name", dir: "ASC" }], geo, relations: destination, related: ["destination_id", "category"], reviewable: true, nearbyDefault: true }),
  def("bars", "bars", "bar", "Bares y vida nocturna", "gastronomia", { filters: { destination_id: "eq", bar_type: "contains", price_range: "eq", is_featured: "eq", is_sponsored: "eq", rating: "range", minimum_age: "range" }, sort: ["name", "rating", "review_count", "created_at"], geo, relations: destination, related: ["destination_id"], reviewable: true, nearbyDefault: true }),
  def("spas", "spas_wellness", "spa", "Spas y bienestar", "servicios", { search: ["name", "description"], filters: { destination_id: "eq", is_sponsored: "eq" }, relations: destination, related: ["destination_id"], reviewable: true }),
  def("experiences", "experiences", "experience", "Experiencias", "servicios", { title: "title", search: ["title", "name", "short_description", "description"], filters: { destination_id: "eq", category: "eq", experience_type: "eq", difficulty: "eq", price: "range", is_sponsored: "eq" }, sort: ["title", "price", "created_at"], relations: destination, related: ["destination_id", "category"], reviewable: true }),
  def("tours", "tour_packages", "tour", "Tours y paquetes", "servicios", { filters: { destination_id: "eq", category: "eq", difficulty: "eq", price_from: "range", max_group_size: "range", is_featured: "eq", is_sponsored: "eq", rating: "range" }, sort: ["name", "price_from", "rating", "created_at"], relations: destination, related: ["destination_id", "category"], reviewable: true }),
  def("events", "events", "event", "Eventos", "eventos", { title: "title", search: ["title", "description", "location"], filters: { destination_id: "eq", category: "eq", start_date: "range", end_date: "range" }, sort: ["start_date", "title", "created_at"], defaultSort: [{ column: "start_date", dir: "ASC" }], relations: destination, related: ["destination_id", "category"], reviewable: true }),
  def("clinics", "clinics", "clinic", "Clínicas y centros de salud", "servicios", { filters: { destination_id: "eq", specialties: "contains" }, search: ["name", "address"], relations: destination, related: ["destination_id"] }),
  def("ports", "ports_marinas", "port", "Puertos y marinas", "servicios", { search: ["name", "description"], filters: { destination_id: "eq", port_type: "eq" }, geo, relations: destination, related: ["destination_id", "port_type"] }),
  def("stadiums", "stadiums", "stadium", "Estadios", "servicios", { filters: { destination_id: "eq", stadium_type: "eq", sport_types: "contains", capacity: "range" }, sort: ["name", "capacity", "created_at"], geo, relations: destination, related: ["destination_id"] }),
  def("theme-parks", "theme_parks", "theme_park", "Parques temáticos", "servicios", { filters: { destination_id: "eq", park_type: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "rating", "created_at"], geo, relations: destination, related: ["destination_id"], reviewable: true }),
  def("golf-courses", "golf_courses", "golf_course", "Campos de golf", "servicios", { search: ["name", "description"], filters: { destination_id: "eq", holes: "range" }, relations: destination, related: ["destination_id"] }),
  def("shopping-centers", "shopping_centers", "shopping_center", "Centros comerciales", "servicios", { filters: { destination_id: "eq" }, search: ["name", "address"], relations: destination, related: ["destination_id"] }),
  def("souvenirs", "souvenirs", "souvenir", "Souvenirs", "servicios", { search: ["name", "description"] }),
  def("artisan-workshops", "artisanal_workshops", "artisan_workshop", "Talleres artesanales", "servicios", { filters: { destination_id: "eq", workshop_type: "eq", craft_types: "contains", skill_level: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "rating", "created_at"], geo, relations: destination, related: ["destination_id"], reviewable: true }),
  def("coffee-experiences", "coffee_experiences", "coffee_experience", "Experiencias de café", "servicios", { filters: { destination_id: "eq", experience_type: "eq", is_featured: "eq", rating: "range" }, sort: ["name", "rating", "created_at"], geo, relations: destination, related: ["destination_id"], reviewable: true }),
  def("tour-guides", "tour_guides", "tour_guide", "Guías turísticos", "servicios", { filters: { languages: "contains", specialties: "contains", is_eco_guide: "eq", rating: "range", price_per_day: "range" }, sort: ["name", "rating", "price_per_day", "created_at"], search: ["name", "bio"], related: [], translatable: ["bio"], reviewable: true }),
  def("travel-agencies", "travel_agencies", "travel_agency", "Agencias de viaje", "servicios", { filters: { is_verified: "eq", services: "contains" }, search: ["name", "description"], exclude: ["verification_status"] }),
  def("tour-operators", "tour_operators", "tour_operator", "Operadores de turismo", "servicios", { filters: { is_verified: "eq" }, search: ["name", "description"], exclude: ["verification_status"] }),
  def("establecimientos", "establecimientos", "establecimiento", "Directorio oficial de establecimientos", "servicios", {
    title: "nombre", search: ["nombre", "actividad", "subsector", "sector_zona"], filters: { provincia: "eq", subsector: "eq", actividad: "eq", estatus_licencia: "eq", estatus_establecimiento: "eq" }, sort: ["nombre", "provincia", "created_at"],
    exclude: ["rut", "numero_identificacion", "telefono", "correo", "estatus_proceso", "import_key"], listExclude: [], translatable: [],
  }),

  // ---- Historia, cultura y editorial ----
  def("historical-figures", "historical_figures", "historical_figure", "Personajes históricos", "historia", { filters: { era: "eq", category: "eq", is_featured: "eq" }, search: ["name", "title", "short_description", "biography"], related: ["era", "category"], translatable: ["name", "title", "short_description", "biography"] }),
  def("historical-events", "historical_events", "historical_event", "Eventos históricos", "historia", { filters: { era: "eq", category: "eq", year: "range", is_featured: "eq" }, sort: ["year", "name", "created_at"], defaultSort: [{ column: "year", dir: "ASC" }], related: ["era", "category"] }),
  def("articles", "articles", "article", "Artículos", "editorial", { title: "title", search: ["title", "excerpt", "content"], filters: { category: "eq", tags: "contains", is_featured: "eq" }, sort: ["title", "created_at", "published_at"], defaultSort: [{ column: "published_at", dir: "DESC" }], related: ["category"], visible: "COALESCE(is_published, true)", translatable: ["title", "excerpt", "content"] }),
  def("routes", "routes", "route", "Rutas", "editorial", { title: "title", search: ["title", "description"], filters: { difficulty: "eq", duration_hours: "range", distance_km: "range" }, sort: ["title", "duration_hours", "distance_km", "created_at"], related: ["difficulty"], reviewable: true }),
  def("audio-guides", "audio_guides", "audio_guide", "Audioguías", "editorial", { title: "title", search: ["title", "description"], sort: ["title"], filters: { language: "eq", associated_entity_type: "eq", associated_entity_id: "eq" }, translatable: ["title", "description"] }),
  def("job-vacancies", "job_vacancies", "job_vacancy", "Empleo", "editorial", { title: "title", search: ["title", "company_name", "short_description", "description", "location"], filters: { province: "eq", job_type: "eq", category: "eq", experience_level: "eq", is_remote: "eq", is_urgent: "eq", is_featured: "eq", salary_min: "range", deadline: "range" }, sort: ["title", "deadline", "salary_min", "created_at"], defaultSort: [{ column: "is_urgent", dir: "DESC" }, { column: "created_at", dir: "DESC" }], related: ["category"], visible: "(deadline IS NULL OR deadline >= CURRENT_DATE)" }),
  def("emergency-contacts", "emergency_contacts", "emergency_contact", "Contactos de emergencia", "servicios", { title: "institution", search: ["institution", "address"], filters: { province_id: "eq" }, sort: ["institution", "created_at"], geo, relations: province, translatable: ["institution"] }),
  def("offers", "offers", "offer", "Ofertas", "marketing", { title: "title", search: ["title", "description"], filters: { is_flash: "eq", price: "range", discount_percentage: "range" }, sort: ["title", "price", "discount_percentage", "end_time", "created_at"], defaultSort: [{ column: "is_flash", dir: "DESC" }, { column: "end_time", dir: "ASC" }], geo: { lat: "latitude", lng: "longitude" }, visible: "(start_time IS NULL OR start_time <= now()) AND (end_time IS NULL OR end_time >= now())", exclude: ["discount_code"] }),
];

export const BY_PATH = new Map(COLLECTIONS.map((c) => [c.path, c]));
export const BY_TABLE = new Map(COLLECTIONS.map((c) => [c.table, c]));
