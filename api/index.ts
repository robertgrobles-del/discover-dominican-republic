// Función de Vercel: recibe todo /api/v1/* (ver rewrites en vercel.json).
// Todo en un solo archivo a propósito: Vercel no resolvía el import de un módulo hermano (ERR_MODULE_NOT_FOUND).
import type { IncomingMessage, ServerResponse } from "node:http";
// Cliente web: habla con Turso por HTTP, sin el módulo nativo de SQLite que no hace falta en Vercel.
import { createClient, type Client, type InValue } from "@libsql/client/web";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { dueDraws, isIsoDate, rdNow, scrapeAndSyncLotteries } from "./scraper/loterias.js";

// Mini backend de staging (Turso/SQLite): acceso al panel, provincias y noticias.
// Responde con el mismo contrato que el backend completo para /auth/*, así el frontend no cambia.

export interface ApiRequest { method: string; path: string; headers: Record<string, string | undefined>; body: unknown; ip?: string; lang?: string; query?: Record<string, string> }
/** body se envía como JSON; raw, tal cual (imágenes). */
export interface ApiResponse { status: number; body?: unknown; raw?: Uint8Array; headers?: Record<string, string> }

const ACCESS_TTL = 15 * 60;            // segundos
const REFRESH_TTL = 7 * 24 * 60 * 60;
const MAX_FAILED_LOGINS = 8;           // por correo en la ventana
const FAILED_WINDOW_MIN = 15;
const REFRESH_COOKIE = "drs_refresh";
// Roles al estilo WordPress. admin: todo. editor: todo el contenido. autor: crea, publica y edita sus noticias.
// colaborador: escribe y edita sus borradores, no publica ni sube imágenes.
const STAFF_ROLES = ["admin", "editor", "autor", "colaborador"];

// ---------- utilidades ----------
const err = (status: number, message: string): ApiResponse => ({ status, body: { error: { message } } });
const now = () => new Date().toISOString();
const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function hashPassword(password: string, salt = randomBytes(16)): string {
  return `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}
// Hash de relleno: un correo inexistente tarda lo mismo que una contraseña equivocada.
const DUMMY_HASH = hashPassword(randomBytes(12).toString("hex"));

function sign(payload: Record<string, unknown>, secret: string, ttl: number): string {
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl }));
  return `${head}.${body}.${createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url")}`;
}

export function verifyToken(token: string, secret: string, typ: "access" | "refresh"): { sub: string } | null {
  const [head, body, sig] = token.split(".");
  if (!head || !body || !sig) return null;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url"));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as { sub?: string; typ?: string; exp?: number };
    if (p.typ !== typ || typeof p.sub !== "string" || typeof p.exp !== "number" || p.exp * 1000 < Date.now()) return null;
    return { sub: p.sub };
  } catch {
    return null;
  }
}

const cookie = (value: string, maxAge: number, secure: boolean) =>
  `${REFRESH_COOKIE}=${value}; Path=/api/v1/auth; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;

function readCookie(header: string | undefined, name: string): string | null {
  for (const part of (header ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

// ---------- validación ----------
type Fields = Record<string, unknown>;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REGIONS = ["norte", "sur", "este", "santo-domingo"];
const STATUSES = ["draft", "published"];
const POST_TYPES = ["noticia", "reportaje", "invitado", "patrocinado"];

function str(o: Fields, key: string, max: number, required = false): string | null | Error {
  const v = o[key];
  if (v === undefined || v === null || v === "") return required ? new Error(`${key} es obligatorio`) : null;
  if (typeof v !== "string") return new Error(`${key} debe ser texto`);
  const t = v.trim();
  if (required && !t) return new Error(`${key} es obligatorio`);
  if (t.length > max) return new Error(`${key} admite como máximo ${max} caracteres`);
  return t || null;
}

function url(o: Fields, key: string): string | null | Error {
  const v = str(o, key, 2000);
  if (v instanceof Error || v === null) return v;
  if (/^\/api\/v1\/media\/[0-9a-f-]{36}\.webp$/.test(v)) return v; // imagen subida al propio sitio
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? v : new Error(`${key} debe ser una URL http(s)`);
  } catch {
    return new Error(`${key} debe ser una URL válida`);
  }
}

function num(o: Fields, key: string, min: number, max: number): number | null | Error {
  const v = o[key];
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : new Error(`${key} debe ser un número entre ${min} y ${max}`);
}

function oneOf(o: Fields, key: string, allowed: string[], fallback: string | null): string | null | Error {
  const v = o[key] ?? fallback;
  if (v === null) return null;
  return typeof v === "string" && allowed.includes(v) ? v : new Error(`${key} debe ser uno de: ${allowed.join(", ")}`);
}

/** Valida y normaliza; devuelve el primer error que encuentre. */
function collect(spec: Record<string, () => unknown>): Record<string, InValue> | Error {
  const out: Record<string, InValue> = {};
  for (const [k, f] of Object.entries(spec)) {
    const v = f();
    if (v instanceof Error) return v;
    out[k] = v as InValue;
  }
  return out;
}

function bool(o: Fields, key: string): number | Error {
  const v = o[key];
  if (v === undefined || v === null || v === "" || v === false || v === 0 || v === "false" || v === "0") return 0;
  if (v === true || v === 1 || v === "true" || v === "1") return 1;
  return new Error(`${key} debe ser verdadero o falso`);
}

const slugOf = (b: Fields, max: number) => () => {
  const s = str(b, "slug", max, true);
  return s instanceof Error || SLUG.test(s!) ? s : new Error("slug solo admite minúsculas, números y guiones");
};

const categorySpec = (b: Fields) => ({
  slug: slugOf(b, 80),
  name: () => str(b, "name", 80, true),
  sort_order: () => { const n = num(b, "sort_order", 0, 100000); return n instanceof Error || n === null || Number.isInteger(n) ? n ?? 0 : new Error("sort_order debe ser un número entero"); },
});

const provinceSpec = (b: Fields) => ({
  slug: () => { const s = str(b, "slug", 80, true); return s instanceof Error || SLUG.test(s!) ? s : new Error("slug solo admite minúsculas, números y guiones"); },
  name: () => str(b, "name", 120, true),
  region: () => oneOf(b, "region", REGIONS, null) ?? new Error("region es obligatorio"),
  capital: () => str(b, "capital", 120),
  short_description: () => str(b, "short_description", 300),
  description: () => str(b, "description", 20000),
  image_url: () => url(b, "image_url"),
  latitude: () => num(b, "latitude", -90, 90),
  longitude: () => num(b, "longitude", -180, 180),
  status: () => oneOf(b, "status", STATUSES, "draft"),
  image_alt: () => str(b, "image_alt", 300),
  hero_images: () => jsonList(b, "hero_images", 10),
  color_primary: () => color(b, "color_primary"),
  color_accent: () => color(b, "color_accent"),
  municipalities: () => jsonList(b, "municipalities", 60),
  places: () => jsonList(b, "places", 80),
  gallery: () => jsonList(b, "gallery", 60),
  seo_title: () => str(b, "seo_title", 90),
  seo_description: () => str(b, "seo_description", 200),
  focus_keywords: () => str(b, "focus_keywords", 200),
  // Componentes editables de la página (016_province_page.sql). Los catálogos se cargan solos, no van aquí.
  tagline: () => str(b, "tagline", 160),
  intro: () => str(b, "intro", 5000),
  population: () => int(b, "population", 0, 10_000_000),
  area_km2: () => num(b, "area_km2", 0, 100_000),
  best_time: () => str(b, "best_time", 300),
  weather_info: () => str(b, "weather_info", 500),
  how_to_get_there: () => str(b, "how_to_get_there", 1000),
  highlights: () => jsonList(b, "highlights", 20),
  typical_dishes: () => jsonList(b, "typical_dishes", 20),
  categories: () => jsonList(b, "categories", 12),
  slides: () => jsonList(b, "slides", 10),
  about: () => jsonTexts(b, "about", ["history", "geography", "artAndCulture", "politicalDivision", "economy", "demographics", "location"], 6000),
  themes: () => jsonList(b, "themes", 12),
  traveler_tags: () => jsonList(b, "traveler_tags", 12),
  itinerary: () => jsonList(b, "itinerary", 14),
  airport: () => jsonTexts(b, "airport", ["nombre", "codigo", "distancia"]),
  transport: () => jsonList(b, "transport", 10),
  blocks: () => jsonList(b, "blocks", 40),
  photo_credits: () => jsonList(b, "photo_credits", 60),
  intro_layout: () => oneOf(b, "intro_layout", ["abanico", "espejo", "mosaico"], null),
  intro_cards: () => jsonList(b, "intro_cards", 3),
});

const int = (o: Fields, key: string, min: number, max: number) => {
  const n = num(o, key, min, max);
  return n instanceof Error || n === null || Number.isInteger(n) ? n : new Error(`${key} debe ser un número entero`);
};

/** Ubicación normalizada: provincia y, si se sabe, municipio y destino (ver checkLocation). */
const locationSpec = (b: Fields, provinceRequired = false) => ({
  province_id: () => str(b, "province_id", 64, provinceRequired),
  municipality_id: () => str(b, "municipality_id", 64),
  destination_id: () => str(b, "destination_id", 64),
});

const placeSpec = (b: Fields) => ({
  slug: slugOf(b, 120),
  name: () => str(b, "name", 160, true),
  short_description: () => str(b, "short_description", 300),
  description: () => str(b, "description", 20000),
  highlights: () => jsonList(b, "highlights", 20),
  image_url: () => url(b, "image_url"),
  image_alt: () => str(b, "image_alt", 300),
  gallery: () => jsonList(b, "gallery", 60),
  latitude: () => num(b, "latitude", -90, 90),
  longitude: () => num(b, "longitude", -180, 180),
  seo_title: () => str(b, "seo_title", 90),
  seo_description: () => str(b, "seo_description", 200),
  status: () => oneOf(b, "status", STATUSES, "draft"),
});

const municipalitySpec = (b: Fields) => ({
  ...placeSpec(b),
  province_id: () => str(b, "province_id", 64, true),
  kind: () => oneOf(b, "kind", ["municipio", "distrito_municipal"], "municipio"),
  is_capital: () => bool(b, "is_capital"),
  population: () => int(b, "population", 0, 10_000_000),
});

const destinationSpec = (b: Fields) => {
  const { destination_id: _d, ...loc } = locationSpec(b); // un destino no está dentro de otro; la provincia se exige en crud
  return {
    ...placeSpec(b), ...loc,
    kind: () => oneOf(b, "kind", ["zona_turistica", "ciudad", "pueblo", "sector", "isla"], "zona_turistica"),
    is_popular: () => bool(b, "is_popular"),
  };
};

/**
 * El municipio y el destino deben ser de la provincia indicada (y el destino, de su municipio). Si falta la provincia o
 * el municipio, se completan con los del destino o el municipio: elegir «Boca Chica» basta para salir en Santo Domingo.
 */
async function checkLocation(db: Client, v: Record<string, InValue>): Promise<string | null> {
  const one = async (sql: string, id: InValue) => (await db.execute({ sql, args: [id] })).rows[0] as Record<string, InValue> | undefined;
  if (v.destination_id != null) {
    const d = await one("SELECT province_id, municipality_id FROM destinations WHERE id = ?", v.destination_id);
    if (!d) return "El destino indicado no existe";
    v.province_id ??= d.province_id;
    v.municipality_id ??= d.municipality_id;
    if (d.province_id !== v.province_id) return "El destino no pertenece a esa provincia";
    if (d.municipality_id != null && v.municipality_id !== d.municipality_id) return "El destino no pertenece a ese municipio";
  }
  if (v.municipality_id != null) {
    const m = await one("SELECT province_id FROM municipalities WHERE id = ?", v.municipality_id);
    if (!m) return "El municipio indicado no existe";
    v.province_id ??= m.province_id;
    if (m.province_id !== v.province_id) return "El municipio no pertenece a esa provincia";
  }
  return null;
}

/** Lista guardada como JSON (array o texto JSON de un array), con tope de elementos y de tamaño. */
function jsonList(o: Fields, key: string, maxItems: number): string | null | Error {
  let v = o[key];
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { return new Error(`${key} no es JSON válido`); } }
  if (!Array.isArray(v)) return new Error(`${key} debe ser una lista`);
  if (v.length > maxItems) return new Error(`${key} admite como máximo ${maxItems} elementos`);
  const out = JSON.stringify(v);
  return out.length > 60_000 ? new Error(`${key} es demasiado largo`) : v.length ? out : null;
}
function color(o: Fields, key: string): string | null | Error {
  const v = str(o, key, 7);
  return v instanceof Error || v === null || /^#[0-9a-f]{6}$/i.test(v) ? v : new Error(`${key} debe ser un color #rrggbb`);
}

const newsSpec = (b: Fields) => ({
  slug: () => { const s = str(b, "slug", 120, true); return s instanceof Error || SLUG.test(s!) ? s : new Error("slug solo admite minúsculas, números y guiones"); },
  title: () => str(b, "title", 200, true),
  excerpt: () => str(b, "excerpt", 500),
  body: () => str(b, "body", 100000),         // Markdown (se muestra sin HTML)
  cover_url: () => url(b, "cover_url"),
  image_alt: () => str(b, "image_alt", 300),
  image_credit: () => str(b, "image_credit", 200),
  category_id: () => str(b, "category_id", 64),
  province_id: () => str(b, "province_id", 64),
  author: () => str(b, "author", 120),
  source_url: () => url(b, "source_url"),
  featured: () => bool(b, "featured"),
  seo_title: () => str(b, "seo_title", 90),
  seo_description: () => str(b, "seo_description", 200),
  status: () => oneOf(b, "status", STATUSES, "draft"),
  post_type: () => oneOf(b, "post_type", POST_TYPES, "noticia"),
  sponsor: () => str(b, "sponsor", 120),
  focus_keywords: () => str(b, "focus_keywords", 200),
});

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const fmt = (o: Fields, key: string, re: RegExp, label: string) => () => { const v = str(o, key, 10); return v instanceof Error || v === null || re.test(v) ? v : new Error(`${key} debe ser ${label}`); };

const eventSpec = (b: Fields) => ({
  slug: slugOf(b, 120),
  name: () => str(b, "name", 200, true),
  event_type: () => str(b, "event_type", 60),
  short_description: () => str(b, "short_description", 300),
  description: () => str(b, "description", 20000),
  image_url: () => url(b, "image_url"),
  start_date: fmt(b, "start_date", DATE, "una fecha AAAA-MM-DD"),
  end_date: fmt(b, "end_date", DATE, "una fecha AAAA-MM-DD"),
  start_time: fmt(b, "start_time", TIME, "una hora HH:MM"),
  end_time: fmt(b, "end_time", TIME, "una hora HH:MM"),
  venue: () => str(b, "venue", 200),
  address: () => str(b, "address", 300),
  province: () => str(b, "province", 120),
  price_range: () => str(b, "price_range", 120),
  ticket_url: () => url(b, "ticket_url"),
  organizer: () => str(b, "organizer", 200),
  is_featured: () => bool(b, "is_featured"),
  status: () => oneOf(b, "status", STATUSES, "draft"),
  submitter_email: () => str(b, "submitter_email", 254),
  submitter_phone: () => str(b, "submitter_phone", 30),
  venue_id: () => str(b, "venue_id", 64),
  venue_type: () => oneOf(b, "venue_type", VENUE_CATEGORIES, null),
  venue_room: () => str(b, "venue_room", 160),
  ...locationSpec(b),
});

export const VENUE_CATEGORIES = ["estadio", "arena", "teatro", "anfiteatro", "centro_convenciones", "golf", "mall", "discoteca", "parque", "museo", "playa",
  "plaza", "carretera", "montana", "rio", "hotel", "restaurante", "otro"];

/** Objeto JSON pequeño con solo textos (p. ej. «cómo llegar»: byCar, byBus…). */
function jsonTexts(o: Fields, key: string, keys: string[], maxLen = 1000): string | null | Error {
  let v = o[key];
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { return new Error(`${key} no es JSON válido`); } }
  if (typeof v !== "object" || Array.isArray(v)) return new Error(`${key} debe ser un objeto`);
  const out: Record<string, string> = {};
  for (const k of keys) {
    const t = (v as Fields)[k];
    if (typeof t === "string" && t.trim()) out[k] = t.trim().slice(0, maxLen);
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

const venueSpec = (b: Fields) => ({
  slug: slugOf(b, 120),
  name: () => str(b, "name", 200, true),
  category: () => oneOf(b, "category", VENUE_CATEGORIES, "otro"),
  category_label: () => str(b, "category_label", 80),
  short_description: () => str(b, "short_description", 300),
  description: () => str(b, "description", 20000),
  image_url: () => url(b, "image_url"),
  image_alt: () => str(b, "image_alt", 300),
  gallery: () => jsonList(b, "gallery", 60),
  address: () => str(b, "address", 300),
  city: () => str(b, "city", 120),
  province: () => str(b, "province", 120),
  latitude: () => num(b, "latitude", -90, 90),
  longitude: () => num(b, "longitude", -180, 180),
  map_url: () => url(b, "map_url"),
  capacity: () => { const n = num(b, "capacity", 0, 1_000_000); return n instanceof Error || n === null || Number.isInteger(n) ? n : new Error("capacity debe ser un número entero"); },
  year_built: () => { const n = num(b, "year_built", 1492, 2100); return n instanceof Error || n === null || Number.isInteger(n) ? n : new Error("year_built debe ser un año"); },
  amenities: () => jsonList(b, "amenities", 40),
  features: () => jsonList(b, "features", 40),
  how_to_get: () => jsonTexts(b, "how_to_get", ["byCar", "byBus", "byMetro", "parking", "taxi"]),
  accessibility: () => str(b, "accessibility", 1000),
  schedule: () => str(b, "schedule", 300),
  phone: () => { const ph = str(b, "phone", 30); return ph instanceof Error || ph === null || /^[+\d\s().-]{7,30}$/.test(ph) ? ph : new Error("Teléfono no válido"); },
  email: () => { const e = str(b, "email", 254); return e instanceof Error || e === null || EMAIL.test(e) ? e : new Error("Correo no válido"); },
  website: () => url(b, "website"),
  seo_title: () => str(b, "seo_title", 90),
  seo_description: () => str(b, "seo_description", 200),
  status: () => oneOf(b, "status", STATUSES, "draft"),
  ...locationSpec(b),
});

export const BEACH_TYPES = ["arena-blanca", "arena-dorada", "virgen", "bahia", "deportiva", "urbana"];
export const WAVE_INTENSITIES = ["calma", "moderada", "fuerte"];
export const CROWD_LEVELS = ["baja", "media", "alta"];
export const ACCESS_TYPES = ["publico", "semi-privado", "privado"];

const beachSpec = (b: Fields) => ({
  slug: slugOf(b, 120),
  name: () => str(b, "name", 200, true),
  beach_type: () => oneOf(b, "beach_type", BEACH_TYPES, "arena-blanca"),
  short_description: () => str(b, "short_description", 300),
  description: () => str(b, "description", 20000),
  image_url: () => url(b, "image_url"),
  image_alt: () => str(b, "image_alt", 300),
  gallery: () => jsonList(b, "gallery", 60),
  activities: () => jsonList(b, "activities", 30),
  amenities: () => jsonList(b, "amenities", 30),
  water_color: () => str(b, "water_color", 120),
  sand_type: () => str(b, "sand_type", 120),
  wave_intensity: () => oneOf(b, "wave_intensity", WAVE_INTENSITIES, "calma"),
  crowd_level: () => oneOf(b, "crowd_level", CROWD_LEVELS, "media"),
  access_type: () => oneOf(b, "access_type", ACCESS_TYPES, "publico"),
  parking_available: () => bool(b, "parking_available"),
  lifeguard_on_duty: () => bool(b, "lifeguard_on_duty"),
  how_to_get_there: () => str(b, "how_to_get_there", 1000),
  best_time_to_visit: () => str(b, "best_time_to_visit", 300),
  latitude: () => num(b, "latitude", -90, 90),
  longitude: () => num(b, "longitude", -180, 180),
  rating: () => num(b, "rating", 0, 5) ?? 0, // 0 = sin valoración (la columna en Turso es NOT NULL); la web no la muestra
  is_popular: () => bool(b, "is_popular"),
  is_featured: () => bool(b, "is_featured"),
  seo_title: () => str(b, "seo_title", 90),
  seo_description: () => str(b, "seo_description", 200),
  status: () => oneOf(b, "status", STATUSES, "draft"),
  ...locationSpec(b),
});

// ---------- usuarios ----------
interface UserRow { id: string; email: string; password_hash: string; display_name: string | null; roles: string; created_at: string }

function publicUser(u: UserRow) {
  let roles: string[] = [];
  try { roles = JSON.parse(u.roles); } catch { /* roles corruptos: sin permisos */ }
  return { id: u.id, email: u.email, email_verified: true, display_name: u.display_name, avatar_url: null, locale: "es", roles, created_at: u.created_at };
}

async function findUser(db: Client, where: "id" | "email", value: string): Promise<UserRow | null> {
  const r = await db.execute({ sql: `SELECT * FROM users WHERE ${where} = ?`, args: [value] });
  return (r.rows[0] as unknown as UserRow) ?? null;
}

function sessionFor(u: UserRow, secret: string, secure: boolean): ApiResponse {
  return {
    status: 200,
    body: { data: { user: publicUser(u), tokens: { access_token: sign({ sub: u.id, typ: "access" }, secret, ACCESS_TTL), expires_in: ACCESS_TTL } } },
    headers: { "Set-Cookie": cookie(sign({ sub: u.id, typ: "refresh" }, secret, REFRESH_TTL), REFRESH_TTL, secure) },
  };
}

// ---------- CRUD genérico ----------
const LOCATION_REFS = {
  province_id: ["provinces", "La provincia indicada no existe"],
  municipality_id: ["municipalities", "El municipio indicado no existe"],
  destination_id: ["destinations", "El destino indicado no existe"],
} as const;
const LOCATED = new Set<string>(["events", "venues", "destinations", "beaches"]);

// refs: columnas que apuntan a otra tabla. Se comprueban aquí porque Turso, por HTTP, no garantiza las claves foráneas.
const TABLES = {
  provinces: { spec: provinceSpec, order: "name COLLATE NOCASE", refs: {} },
  news: { spec: newsSpec, order: "created_at DESC", refs: { province_id: ["provinces", "La provincia indicada no existe"], category_id: ["news_categories", "La categoría indicada no existe"] } },
  news_categories: { spec: categorySpec, order: "sort_order, name COLLATE NOCASE", refs: {} },
  events: { spec: eventSpec, order: "start_date DESC, name COLLATE NOCASE", refs: { venue_id: ["venues", "El recinto indicado no existe"], ...LOCATION_REFS } },
  venues: { spec: venueSpec, order: "name COLLATE NOCASE", refs: LOCATION_REFS },
  municipalities: { spec: municipalitySpec, order: "name COLLATE NOCASE", refs: { province_id: ["provinces", "La provincia indicada no existe"] } },
  destinations: { spec: destinationSpec, order: "name COLLATE NOCASE", refs: LOCATION_REFS },
  beaches: { spec: beachSpec, order: "name COLLATE NOCASE", refs: LOCATION_REFS },
} as const satisfies Record<string, { spec: (b: Fields) => Record<string, () => unknown>; order: string; refs: Record<string, readonly [string, string]> }>;

async function crud(db: Client, table: keyof typeof TABLES, method: string, id: string | undefined, body: Fields, userId: string): Promise<ApiResponse> {
  const { spec, order, refs } = TABLES[table] as (typeof TABLES)[keyof typeof TABLES] & { refs: Record<string, readonly [string, string]> };
  if (method === "GET" && !id) return { status: 200, body: { data: (await db.execute(`SELECT * FROM ${table} ORDER BY ${order}`)).rows } };
  if (method === "GET") {
    const row = (await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [id!] })).rows[0];
    return row ? { status: 200, body: { data: row } } : err(404, "No encontrado");
  }
  if (method === "DELETE" && id) {
    if (table === "news_categories") {
      const n = Number((await db.execute({ sql: "SELECT COUNT(*) AS n FROM news WHERE category_id = ?", args: [id] })).rows[0]?.n ?? 0);
      if (n) return err(409, `No se puede eliminar: ${n} noticia${n === 1 ? " usa" : "s usan"} esta categoría`);
    }
    if (table === "provinces") {
      const n = Number((await db.execute({ sql: "SELECT (SELECT COUNT(*) FROM municipalities WHERE province_id = ?) + (SELECT COUNT(*) FROM destinations WHERE province_id = ?) AS n", args: [id, id] })).rows[0]?.n ?? 0);
      if (n) return err(409, `No se puede eliminar: tiene ${n} municipios o destinos. Elimínalos o muévelos antes`);
      await db.execute({ sql: "UPDATE news SET province_id = NULL WHERE province_id = ?", args: [id] });
      for (const t of ["events", "venues", "beaches"]) await db.execute({ sql: `UPDATE ${t} SET province_id = NULL WHERE province_id = ?`, args: [id] });
    }
    if (table === "municipalities") {
      for (const t of ["destinations", "events", "venues", "beaches"]) await db.execute({ sql: `UPDATE ${t} SET municipality_id = NULL WHERE municipality_id = ?`, args: [id] });
    }
    if (table === "destinations") {
      for (const t of ["events", "venues", "beaches"]) await db.execute({ sql: `UPDATE ${t} SET destination_id = NULL WHERE destination_id = ?`, args: [id] });
    }
    if (table === "venues") await db.execute({ sql: "UPDATE events SET venue_id = NULL WHERE venue_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM content_translations WHERE entity = ? AND entity_id = ?", args: [table, id] });
    const r = await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    return r.rowsAffected ? { status: 204 } : err(404, "No encontrado");
  }
  if (method !== "POST" && method !== "PUT") return err(405, "Método no permitido");
  if (method === "PUT" && !id) return err(405, "Método no permitido");

  const values = collect(spec(body));
  if (values instanceof Error) return err(422, values.message);
  for (const [col, [refTable, message]] of Object.entries(refs)) {
    if (values[col] == null) continue;
    const found = await db.execute({ sql: `SELECT 1 FROM ${refTable} WHERE id = ?`, args: [values[col]] });
    if (!found.rows.length) return err(422, message);
  }
  if (table === "events" && values.venue_id != null && values.province_id == null && values.municipality_id == null && values.destination_id == null) {
    // Sin ubicación propia, el evento hereda la de su recinto.
    const v = (await db.execute({ sql: "SELECT province_id, municipality_id, destination_id FROM venues WHERE id = ?", args: [values.venue_id] })).rows[0];
    if (v) Object.assign(values, { province_id: v.province_id, municipality_id: v.municipality_id, destination_id: v.destination_id });
  }
  if (LOCATED.has(table)) {
    const bad = await checkLocation(db, values);
    if (bad) return err(422, bad);
    if (table === "destinations" && values.province_id == null) return err(422, "province_id es obligatorio: indica la provincia o el municipio");
  }
  if (table === "news") {
    // Fecha de publicación: la que se indique (puede ser pasada; si es futura, la noticia queda programada y no
    // sale en lo público hasta entonces). Sin indicarla, la que ya tenía o, al publicar, la de ahora.
    const given = body.published_at;
    let date: string | null = null;
    if (given !== undefined && given !== null && given !== "") {
      const d = new Date(String(given));
      if (Number.isNaN(d.getTime()) || d.getUTCFullYear() < 1990 || d.getTime() > Date.now() + 5 * 365 * 86_400_000) {
        return err(422, "Fecha de publicación no válida");
      }
      date = d.toISOString();
    }
    const prev = id ? ((await db.execute({ sql: "SELECT published_at FROM news WHERE id = ?", args: [id] })).rows[0]?.published_at as string | null) : null;
    values.published_at = date ?? prev ?? (values.status === "published" ? now() : null);
  }

  try {
    if (method === "POST") {
      const newId = randomUUID();
      const cols = Object.keys(values);
      await db.execute({
        sql: `INSERT INTO ${table} (id, created_by, ${cols.join(", ")}) VALUES (?, ?, ${cols.map(() => "?").join(", ")})`,
        args: [newId, userId, ...Object.values(values)],
      });
      return { status: 201, body: { data: (await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [newId] })).rows[0] } };
    }
    const cols = Object.keys(values);
    const r = await db.execute({
      sql: `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(", ")}, updated_at = ? WHERE id = ?`,
      args: [...Object.values(values), now(), id!],
    });
    if (!r.rowsAffected) return err(404, "No encontrado");
    return { status: 200, body: { data: (await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [id!] })).rows[0] } };
  } catch (e) {
    if (String(e).includes("UNIQUE")) return err(409, "Ya existe un registro con ese slug");
    if (String(e).includes("FOREIGN KEY")) return err(422, "Hay una referencia a un registro que no existe");
    throw e;
  }
}

// ---------- edición en lote ----------
// Solo estos campos se cambian a la vez en varias fichas; cada ficha pasa por la misma validación que al guardarla sola.
const BULK_FIELDS = {
  provinces: ["status", "region", "intro_layout"],
  news: ["status", "category_id", "province_id", "featured", "post_type"],
  events: ["status", "is_featured", "event_type", "province_id", "municipality_id", "destination_id"],
  venues: ["status", "category", "province_id", "municipality_id", "destination_id"],
  municipalities: ["status", "province_id", "kind", "is_capital"],
  destinations: ["status", "province_id", "municipality_id", "kind", "is_popular"],
  beaches: ["status", "beach_type", "wave_intensity", "crowd_level", "access_type", "is_featured", "is_popular", "province_id", "municipality_id", "destination_id"],
} as const;
type BulkTable = keyof typeof BULK_FIELDS;
const MAX_BULK = 500;

async function bulkEdit(db: Client, table: BulkTable, body: Fields, userId: string): Promise<ApiResponse> {
  const ids = Array.isArray(body.ids) ? [...new Set(body.ids.filter((x): x is string => typeof x === "string" && x.length <= 64))] : [];
  const patch = body.patch && typeof body.patch === "object" && !Array.isArray(body.patch) ? body.patch as Fields : null;
  if (!ids.length || ids.length > MAX_BULK) return err(422, `Indica entre 1 y ${MAX_BULK} fichas`);
  if (!patch || !Object.keys(patch).length) return err(422, "Indica qué cambiar");
  const allowed: readonly string[] = BULK_FIELDS[table];
  const bad = Object.keys(patch).find((k) => !allowed.includes(k));
  if (bad) return err(422, `No se puede cambiar «${bad}» en lote`);
  // Cambiar de provincia o municipio suelta los niveles de debajo que ya no encajarían.
  const reset: Fields = {};
  if ("province_id" in patch && !("municipality_id" in patch) && allowed.includes("municipality_id")) reset.municipality_id = null;
  if (("province_id" in patch || "municipality_id" in patch) && !("destination_id" in patch) && allowed.includes("destination_id")) reset.destination_id = null;

  const errors: { id: string; name: string; message: string }[] = [];
  let updated = 0;
  // De 10 en 10 en paralelo: cada ficha son 3-4 viajes a Turso y en serie 150 fichas pasarían el límite de la función.
  const one = async (id: string) => {
    const row = (await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [id] })).rows[0] as Fields | undefined;
    if (!row) { errors.push({ id, name: id, message: "No existe" }); return; }
    const r = await crud(db, table, "PUT", id, { ...row, ...reset, ...patch }, userId);
    if (r.status === 200) updated++;
    else errors.push({ id, name: String(row.name ?? row.title ?? id), message: (r.body as { error?: { message?: string } })?.error?.message ?? "Error" });
  };
  for (let i = 0; i < ids.length; i += 10) await Promise.all(ids.slice(i, i + 10).map(one));
  return { status: 200, body: { data: { updated, errors } } };
}

/** Autor y colaborador: solo sus noticias; el colaborador no publica ni toca lo ya publicado. */
async function ownNewsGuard(db: Client, method: string, id: string | undefined, body: Fields, userId: string, isAutor: boolean): Promise<ApiResponse | null> {
  if (!isAutor && body.status === "published") return err(403, "Un colaborador no puede publicar: guarda el borrador y un editor lo revisará");
  if (!id) return null;
  const row = (await db.execute({ sql: "SELECT created_by, status FROM news WHERE id = ?", args: [id] })).rows[0];
  if (!row) return null; // crud responde 404
  if (row.created_by !== userId) return err(403, "Solo puedes modificar tus propias noticias");
  if (!isAutor && row.status === "published") return err(403, "Un colaborador no puede modificar una noticia publicada");
  return null;
}

// ---------- usuarios del panel (solo admin) ----------
const ROLES = STAFF_ROLES;
const MIN_PASSWORD = 12;

async function adminCount(db: Client): Promise<number> {
  return Number((await db.execute(`SELECT COUNT(*) AS n FROM users WHERE roles LIKE '%"admin"%'`)).rows[0]?.n ?? 0);
}

async function usersApi(db: Client, method: string, id: string | undefined, body: Fields, me: UserRow): Promise<ApiResponse> {
  if (method === "GET" && !id) {
    const rows = (await db.execute("SELECT * FROM users ORDER BY created_at")).rows as unknown as UserRow[];
    return { status: 200, body: { data: rows.map(publicUser) } };
  }

  const role = oneOf(body, "role", ROLES, null);
  if (role instanceof Error) return err(422, role.message);
  const displayName = str(body, "display_name", 120);
  if (displayName instanceof Error) return err(422, displayName.message);
  const password = body.password;
  if (password !== undefined && password !== null && password !== "" &&
      (typeof password !== "string" || password.length < MIN_PASSWORD || password.length > 200)) {
    return err(422, `La contraseña debe tener entre ${MIN_PASSWORD} y 200 caracteres`);
  }

  if (method === "POST" && !id) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return err(422, "Correo no válido");
    if (typeof password !== "string" || !password) return err(422, "La contraseña es obligatoria");
    const newId = randomUUID();
    try {
      await db.execute({
        sql: "INSERT INTO users (id, email, password_hash, display_name, roles) VALUES (?, ?, ?, ?, ?)",
        args: [newId, email, hashPassword(password), displayName, JSON.stringify([role ?? "editor"])],
      });
    } catch (e) {
      if (String(e).includes("UNIQUE")) return err(409, "Ya existe un usuario con ese correo");
      throw e;
    }
    return { status: 201, body: { data: publicUser((await findUser(db, "id", newId))!) } };
  }

  if (!id) return err(405, "Método no permitido");
  const target = await findUser(db, "id", id);
  if (!target) return err(404, "No encontrado");
  const targetIsAdmin = publicUser(target).roles.includes("admin");

  if (method === "DELETE") {
    if (target.id === me.id) return err(422, "No puedes eliminar tu propia cuenta");
    if (targetIsAdmin && (await adminCount(db)) <= 1) return err(422, "Debe quedar al menos un administrador");
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    return { status: 204 };
  }

  if (method === "PATCH" || method === "PUT") {
    if (role && role !== "admin" && targetIsAdmin && (await adminCount(db)) <= 1) return err(422, "Debe quedar al menos un administrador");
    const sets: string[] = [];
    const args: InValue[] = [];
    if (role) { sets.push("roles = ?"); args.push(JSON.stringify([role])); }
    if (body.display_name !== undefined) { sets.push("display_name = ?"); args.push(displayName); }
    if (typeof password === "string" && password) { sets.push("password_hash = ?"); args.push(hashPassword(password)); }
    if (sets.length) await db.execute({ sql: `UPDATE users SET ${sets.join(", ")} WHERE id = ?`, args: [...args, id] });
    return { status: 200, body: { data: publicUser((await findUser(db, "id", id))!) } };
  }
  return err(405, "Método no permitido");
}

// ---------- contenido público (landing) ----------
// Solo lo publicado; los borradores se quedan en el panel. Caché corta en la CDN de Vercel.
const PUBLIC_CACHE = { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300" };

// Un evento deja de salir al llegar su fecha y hora de fin (hora de RD, UTC-4); sin hora de fin, al acabar el día.
const EVENT_LIVE = "(COALESCE(end_date, start_date) IS NULL OR datetime(COALESCE(end_date, start_date) || ' ' || COALESCE(end_time, '23:59'), '+4 hours') > datetime('now'))";
const PROVINCE_PAGE = "tagline, intro, population, area_km2, best_time, weather_info, how_to_get_there, highlights, typical_dishes, categories, "
  + "slides, about, themes, traveler_tags, itinerary, airport, transport, blocks, photo_credits, intro_layout, intro_cards";
const PLACE_PUBLIC = "id, slug, name, short_description, description, highlights, image_url, image_alt, gallery, latitude, longitude, seo_title, seo_description";
// Sin los datos de contacto de quien lo envió ni la huella de IP.
const EVENT_PUBLIC = "id, slug, name, event_type, short_description, description, image_url, start_date, end_date, start_time, end_time, venue, venue_type, venue_room, address, province, price_range, ticket_url, organizer, is_featured, updated_at";
const BEACH_PUBLIC = `b.id, b.slug, b.name, b.province_id, b.municipality_id, b.destination_id, b.beach_type, b.short_description, b.description,
  b.image_url, b.image_alt, b.gallery, b.activities, b.amenities, b.water_color, b.sand_type, b.wave_intensity, b.crowd_level,
  b.access_type, b.parking_available, b.lifeguard_on_duty, b.how_to_get_there, b.best_time_to_visit, b.latitude, b.longitude,
  b.rating, b.is_popular, b.is_featured, b.seo_title, b.seo_description, b.updated_at,
  p.name AS province_name, p.slug AS province_slug, p.region AS province_region,
  m.name AS municipality_name, d.name AS destination_name`;
const BEACH_FROM = `FROM beaches b
  LEFT JOIN provinces p ON p.id = b.province_id
  LEFT JOIN municipalities m ON m.id = b.municipality_id
  LEFT JOIN destinations d ON d.id = b.destination_id`;

async function publicApi(db: Client, path: string, lang?: Lang): Promise<ApiResponse | null> {
  if (path === "/public/provinces") {
    const r = await db.execute(`SELECT id, slug, name, region, capital, short_description, description, image_url, latitude, longitude, updated_at
      FROM provinces WHERE status = 'published' ORDER BY name COLLATE NOCASE`);
    return { status: 200, body: { data: await overlay(db, "provinces", r.rows as unknown as Record<string, unknown>[], lang) }, headers: PUBLIC_CACHE };
  }
  // Ficha completa (portada en slider, galería, municipios, lugares, colores y SEO) de una provincia publicada.
  const pv = path.match(/^\/public\/provinces\/([^/]+)$/);
  if (pv) {
    const r = SLUG.test(pv[1]) ? await db.execute({ sql: `SELECT id, slug, name, region, capital, short_description, description, image_url, image_alt,
      hero_images, gallery, municipalities, places, color_primary, color_accent, latitude, longitude, seo_title, seo_description, focus_keywords,
      ${PROVINCE_PAGE}, updated_at
      FROM provinces WHERE status = 'published' AND slug = ?`, args: [pv[1]] }) : null;
    if (!r?.rows[0]) return err(404, "No encontrada");
    const province = (await overlay(db, "provinces", r.rows as unknown as Record<string, unknown>[], lang))[0];
    // Municipios y destinos publicados de la provincia, para su sección y sus enlaces.
    const [munis, dests] = await Promise.all([
      db.execute({ sql: `SELECT ${PLACE_PUBLIC}, kind, is_capital, population FROM municipalities WHERE status = 'published' AND province_id = ? ORDER BY is_capital DESC, name COLLATE NOCASE`, args: [province.id as string] }),
      db.execute({ sql: `SELECT ${PLACE_PUBLIC}, kind, is_popular, municipality_id FROM destinations WHERE status = 'published' AND province_id = ? ORDER BY is_popular DESC, name COLLATE NOCASE`, args: [province.id as string] }),
    ]);
    return { status: 200, body: { data: { ...province, territory: { municipalities: munis.rows, destinations: dests.rows } } }, headers: PUBLIC_CACHE };
  }
  const detail = path.match(/^\/public\/news\/([^/]+)$/);
  if (detail) {
    const n = SLUG.test(detail[1]) ? await findNews(db, detail[1]) : null;
    return n ? { status: 200, body: { data: (await localizeNews(db, [n], lang))[0] }, headers: PUBLIC_CACHE } : err(404, "No encontrada");
  }
  if (path === "/public/events") {
    const r = await db.execute(`SELECT ${EVENT_PUBLIC} FROM events WHERE status = 'published' AND ${EVENT_LIVE} ORDER BY start_date, name COLLATE NOCASE`);
    return { status: 200, body: { data: r.rows }, headers: PUBLIC_CACHE };
  }
  const ev = path.match(/^\/public\/events\/([^/]+)$/);
  if (ev) {
    const r = SLUG.test(ev[1]) ? await db.execute({ sql: `SELECT ${EVENT_PUBLIC} FROM events WHERE status = 'published' AND ${EVENT_LIVE} AND slug = ?`, args: [ev[1]] }) : null;
    return r?.rows[0] ? { status: 200, body: { data: r.rows[0] }, headers: PUBLIC_CACHE } : err(404, "No encontrado");
  }
  if (path === "/public/beaches") {
    const r = await db.execute(`SELECT ${BEACH_PUBLIC} ${BEACH_FROM} WHERE b.status = 'published' ORDER BY b.is_featured DESC, b.is_popular DESC, b.rating DESC, b.name COLLATE NOCASE`);
    return { status: 200, body: { data: r.rows }, headers: PUBLIC_CACHE };
  }
  const beach = path.match(/^\/public\/beaches\/([^/]+)$/);
  if (beach) {
    const r = SLUG.test(beach[1]) ? await db.execute({ sql: `SELECT ${BEACH_PUBLIC} ${BEACH_FROM} WHERE b.status = 'published' AND b.slug = ?`, args: [beach[1]] }) : null;
    return r?.rows[0] ? { status: 200, body: { data: r.rows[0] }, headers: PUBLIC_CACHE } : err(404, "No encontrada");
  }
  if (path === "/public/news") {
    return { status: 200, body: { data: await localizeNews(db, (await listNews(db)).slice(0, 50), lang) }, headers: PUBLIC_CACHE };
  }
  if (path === "/public/establishments") {
    const r = await db.execute(`
      SELECT id, type, name, contact_name, phone, email, address, province, website, photo_url, description, schedule, details, created_at,
             (SELECT group_concat('/api/v1/establishment-files/' || f.id || CASE f.kind WHEN 'menu' THEN '.pdf' ELSE '.webp' END, ' ')
                FROM establishment_files f WHERE f.request_id = establishment_requests.id) AS files
      FROM establishment_requests
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `);
    return { status: 200, body: { data: r.rows }, headers: PUBLIC_CACHE };
  }
  const est = path.match(/^\/public\/establishments\/([^/]+)$/);
  if (est) {
    const r = await db.execute({
      sql: `
        SELECT id, type, name, contact_name, phone, email, address, province, website, photo_url, description, schedule, details, created_at,
               (SELECT group_concat('/api/v1/establishment-files/' || f.id || CASE f.kind WHEN 'menu' THEN '.pdf' ELSE '.webp' END, ' ')
                  FROM establishment_files f WHERE f.request_id = establishment_requests.id) AS files
        FROM establishment_requests
        WHERE status = 'approved' AND id = ?
        LIMIT 1
      `,
      args: [est[1]],
    });
    return r.rows[0] ? { status: 200, body: { data: r.rows[0] }, headers: PUBLIC_CACHE } : err(404, "Negocio no encontrado");
  }
  return null;
}

// ---------- imágenes (WebP) ----------
// El panel convierte a WebP en el navegador y envía base64; aquí se comprueba que de verdad sea WebP y su tamaño.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MEDIA_ID = /^[0-9a-f-]{36}$/;

const isWebp = (b: Uint8Array) =>
  b.length > 12 && String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP";

async function uploadMedia(db: Client, body: Fields, userId: string): Promise<ApiResponse> {
  if (typeof body.data !== "string" || body.data.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4) {
    return err(413, "La imagen supera los 2 MB");
  }
  const bytes = new Uint8Array(Buffer.from(body.data, "base64"));
  if (!isWebp(bytes)) return err(415, "Solo se aceptan imágenes WebP");
  if (bytes.length > MAX_IMAGE_BYTES) return err(413, "La imagen supera los 2 MB");
  const dim = (k: string) => { const n = num(body, k, 1, 20000); return typeof n === "number" ? Math.round(n) : null; };
  const alt = str(body, "alt", 300);
  const id = randomUUID();
  await db.execute({
    sql: "INSERT INTO media (id, mime, bytes, size, width, height, alt, created_by) VALUES (?, 'image/webp', ?, ?, ?, ?, ?, ?)",
    args: [id, bytes, bytes.length, dim("width"), dim("height"), alt instanceof Error ? null : alt, userId],
  });
  return { status: 201, body: { data: { id, url: `/api/v1/media/${id}.webp`, size: bytes.length } } };
}

/** Biblioteca de medios del panel: listado (sin los bytes), texto alternativo y borrado de lo que no se usa. */
async function mediaAdmin(db: Client, method: string, id: string | undefined, body: Fields): Promise<ApiResponse> {
  if (method === "GET" && !id) {
    const r = await db.execute(`SELECT id, size, width, height, alt, created_at FROM media ORDER BY created_at DESC LIMIT 500`);
    return { status: 200, body: { data: r.rows.map((m) => ({ ...m, url: `/api/v1/media/${String(m.id)}.webp` })) } };
  }
  if (!id || !MEDIA_ID.test(id)) return err(404, "No encontrada");
  if (method === "PATCH") {
    const alt = str(body, "alt", 300);
    if (alt instanceof Error) return err(422, alt.message);
    const r = await db.execute({ sql: "UPDATE media SET alt = ? WHERE id = ?", args: [alt, id] });
    return r.rowsAffected ? { status: 200, body: { data: { id, alt } } } : err(404, "No encontrada");
  }
  if (method === "DELETE") {
    // No se borra una imagen en uso: dejaría portadas y cuerpos con la foto rota.
    const url = `/api/v1/media/${id}.webp`;
    const like = `%${url}%`;
    const used = await db.execute({
      sql: `SELECT (SELECT COUNT(*) FROM news WHERE cover_url = ? OR body LIKE ?)
                 + (SELECT COUNT(*) FROM provinces WHERE image_url = ? OR description LIKE ?)
                 + (SELECT COUNT(*) FROM beaches WHERE image_url = ? OR gallery LIKE ?)
                 + (SELECT COUNT(*) FROM content_translations WHERE data LIKE ?) AS n`,
      args: [url, like, url, like, url, like, like],
    });
    const n = Number(used.rows[0]?.n ?? 0);
    if (n) return err(409, `No se puede eliminar: la usa${n === 1 ? "" : "n"} ${n} publicaci${n === 1 ? "ón" : "ones"}`);
    const r = await db.execute({ sql: "DELETE FROM media WHERE id = ?", args: [id] });
    return r.rowsAffected ? { status: 204 } : err(404, "No encontrada");
  }
  return err(405, "Método no permitido");
}

async function serveMedia(db: Client, id: string): Promise<ApiResponse> {
  if (!MEDIA_ID.test(id)) return err(404, "No encontrada");
  const row = (await db.execute({ sql: "SELECT bytes FROM media WHERE id = ?", args: [id] })).rows[0];
  if (!row) return err(404, "No encontrada");
  // Cada subida tiene un id nuevo: la imagen nunca cambia y se puede cachear un año.
  return { status: 200, raw: new Uint8Array(row.bytes as ArrayBuffer), headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } };
}

// ---------- SEO: páginas de noticias con metadatos en el HTML, sitemap y RSS ----------
// Google ejecuta JavaScript, pero las vistas previas de WhatsApp, Facebook o X y otros buscadores no: por eso
// /noticias y /noticias/<slug> se sirven desde aquí con el index.html del sitio y sus metadatos ya escritos.
// React sustituye después el resumen legible del #root por la página completa.
export const siteUrl = () => (process.env.SITE_URL || "https://descubrerepdom.com").replace(/\/+$/, "");
const SITE_NAME = "Descubre RD";
const DEFAULT_IMAGE = "/og-default.jpg";
const HTML_CACHE = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600" };

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
// JSON-LD dentro de <script>: "<" escapado para que un texto nunca cierre la etiqueta.
const ldJson = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const absolute = (u: string | null | undefined) => (!u ? `${siteUrl()}${DEFAULT_IMAGE}` : /^https?:\/\//.test(u) ? u : `${siteUrl()}${u}`);

/** Texto plano a partir del Markdown del cuerpo (para descripciones y el resumen sin JavaScript). */
export function plainText(md: string | null | undefined): string {
  return String(md ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")          // imágenes
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")          // enlaces → su texto
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // encabezados, citas y listas
    .replace(/[*_`~]|^-{3,}$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Recorta en el último espacio antes del límite, sin cortar palabras. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).trimEnd()}…`;
}

type NewsRow = {
  id: string; slug: string; title: string; excerpt: string | null; body: string | null; cover_url: string | null;
  image_alt: string | null; image_credit: string | null; author: string | null; source_url: string | null; post_type: string; sponsor: string | null;
  featured: number; published_at: string | null; updated_at: string; seo_title: string | null; seo_description: string | null;
  province_name: string | null; category_name: string | null; category_slug: string | null;
  cover_width: number | null; cover_height: number | null;
};

const NEWS_SELECT = `SELECT n.id, n.slug, n.title, n.excerpt, n.body, n.cover_url, n.image_alt, n.image_credit, n.author, n.source_url, n.post_type, n.sponsor,
    n.featured, n.published_at, n.updated_at, n.seo_title, n.seo_description, n.category_id, n.province_id,
    p.name AS province_name, c.name AS category_name, c.slug AS category_slug, m.width AS cover_width, m.height AS cover_height
  FROM news n
  LEFT JOIN provinces p ON p.id = n.province_id AND p.status = 'published'
  LEFT JOIN news_categories c ON c.id = n.category_id
  LEFT JOIN media m ON n.cover_url = '/api/v1/media/' || m.id || '.webp'
  WHERE n.status = 'published' AND n.published_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now','+2 seconds')`; // las programadas, aún no; +2 s: el reloj de SQLite va por detrás del de JS en Windows

const listNews = async (db: Client) =>
  (await db.execute(`${NEWS_SELECT} ORDER BY n.featured DESC, n.published_at DESC LIMIT 200`)).rows as unknown as NewsRow[];
const findNews = async (db: Client, slug: string) =>
  ((await db.execute({ sql: `${NEWS_SELECT} AND n.slug = ?`, args: [slug] })).rows[0] as unknown as NewsRow) ?? null;

export const newsDescription = (n: NewsRow) => clip(n.seo_description || n.excerpt || plainText(n.body) || n.title, 160);
export const newsTitle = (n: NewsRow) => clip(n.seo_title || n.title, 70);

interface PageMeta {
  title: string; description: string; path: string; image?: string | null; imageAlt?: string | null;
  imageWidth?: number | null; imageHeight?: number | null; type?: "website" | "article"; noindex?: boolean;
  published?: string | null; modified?: string | null; section?: string | null; jsonLd?: unknown[]; body: string;
  markdown?: string; // versión para agentes de IA
  lang?: Lang;        // idioma de esta versión (sin él, español)
  alternates?: Lang[]; // otros idiomas disponibles, para hreflang
}

/** Sustituye en el index.html los metadatos genéricos por los de la página y escribe su resumen en #root. */
export function renderShell(shell: string, m: PageMeta): string {
  const urlFor = (l?: Lang) => `${siteUrl()}${m.path}${l ? `?lang=${l}` : ""}`;
  const url = urlFor(m.lang);
  const OG_LOCALE: Record<Lang | "es", string> = { es: "es_DO", en: "en_US", fr: "fr_FR", de: "de_DE", it: "it_IT", pt: "pt_BR" };
  const hreflang = m.alternates?.length
    ? [`<link rel="alternate" hreflang="es" href="${esc(urlFor())}" />`,
       ...m.alternates.map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(urlFor(l))}" />`),
       `<link rel="alternate" hreflang="x-default" href="${esc(urlFor())}" />`]
    : [];
  const image = absolute(m.image);
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="robots" content="${m.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${SITE_NAME}: noticias" href="${siteUrl()}/noticias/rss.xml" />`,
    m.markdown ? `<link rel="alternate" type="text/markdown" href="${siteUrl()}${m.markdown}" />` : "",
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[m.lang ?? "es"]}" />`,
    ...hreflang,
    `<meta property="og:type" content="${m.type ?? "website"}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    m.imageAlt ? `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />` : "",
    m.imageWidth ? `<meta property="og:image:width" content="${m.imageWidth}" />` : "",
    m.imageHeight ? `<meta property="og:image:height" content="${m.imageHeight}" />` : "",
    m.published ? `<meta property="article:published_time" content="${esc(m.published)}" />` : "",
    m.modified ? `<meta property="article:modified_time" content="${esc(m.modified)}" />` : "",
    m.section ? `<meta property="article:section" content="${esc(m.section)}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    ...(m.jsonLd ?? []).map(ldJson),
  ].filter(Boolean).join("\n    ");

  return shell
    // Fuera los genéricos de la landing que esta página reemplaza (los JSON-LD del sitio se conservan).
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|keywords|og:[^"]+|twitter:[^"]+|article:[^"]+)"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<html lang="[^"]*"/, `<html lang="${m.lang ?? "es"}"`)
    .replace("</head>", `    ${tags}\n  </head>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${m.body}</div>`);
}

const publisher = () => ({ "@type": "Organization", name: SITE_NAME, url: siteUrl(), logo: { "@type": "ImageObject", url: `${siteUrl()}/icon-512.png`, width: 512, height: 512 } });
const breadcrumb = (items: [string, string][]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${siteUrl()}${path}` })),
});

function newsPage(n: NewsRow, lang?: Lang, alternates: Lang[] = []): PageMeta {
  const path = `/noticias/${n.slug}`;
  const description = newsDescription(n);
  const image = absolute(n.cover_url);
  return {
    title: `${newsTitle(n)} | ${SITE_NAME}`, description, path, image: n.cover_url, imageAlt: n.image_alt || n.title,
    imageWidth: n.cover_width, imageHeight: n.cover_height, type: "article",
    published: n.published_at, modified: n.updated_at, section: n.category_name, markdown: `${path}.md`, lang, alternates,
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "NewsArticle",
        headline: clip(n.title, 110), description, image: [image], inLanguage: lang ?? "es-DO",
        datePublished: n.published_at, dateModified: n.updated_at || n.published_at,
        author: n.author ? { "@type": "Person", name: n.author } : publisher(),
        publisher: publisher(), mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl()}${path}` },
        ...(n.category_name ? { articleSection: n.category_name } : {}),
        ...(n.province_name ? { contentLocation: { "@type": "Place", name: `${n.province_name}, República Dominicana` } } : {}),
        ...(n.source_url ? { isBasedOn: n.source_url } : {}),
      },
      breadcrumb([["Inicio", "/"], ["Noticias", "/noticias"], [n.title, path]]),
    ],
    body: `<article><p>${esc(n.category_name ?? "Noticias")}</p><h1>${esc(n.title)}</h1>${n.excerpt ? `<p>${esc(n.excerpt)}</p>` : ""}`
      + `<p>${esc(clip(plainText(n.body), 600))}</p><p><a href="/noticias">Más noticias</a></p></article>`,
  };
}

function newsListPage(rows: NewsRow[]): PageMeta {
  const title = `Noticias de turismo en República Dominicana | ${SITE_NAME}`;
  const description = "Actualidad del turismo dominicano: eventos, cultura, gastronomía, naturaleza y avisos para viajeros.";
  return {
    title, description, path: "/noticias", image: rows[0]?.cover_url,
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "CollectionPage", name: "Noticias", description, url: `${siteUrl()}/noticias`,
        mainEntity: { "@type": "ItemList", itemListElement: rows.slice(0, 50).map((n, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl()}/noticias/${n.slug}`, name: n.title })) },
      },
      breadcrumb([["Inicio", "/"], ["Noticias", "/noticias"]]),
    ],
    body: `<main><h1>Noticias</h1><ul>${rows.map((n) => `<li><a href="/noticias/${esc(n.slug)}">${esc(n.title)}</a>${n.excerpt ? ` — ${esc(n.excerpt)}` : ""}</li>`).join("")}</ul></main>`,
  };
}

const xmlEsc = (v: unknown) => esc(v).replace(/&#39;/g, "&apos;");

// shortcut: copia a mano de los slugs de src/data (airports, puertosDetalleData, marinasDetalleData); al pasar esos
// datos a Turso, leerlos de la base. Cada página pública nueva de staging se añade aquí (sitemap y llms.txt).
const AIRPORTS = ["aeropuerto-internacional-de-punta-cana", "aeropuerto-internacional-las-americas", "aeropuerto-internacional-del-cibao",
  "aeropuerto-internacional-gregorio-luperon", "aeropuerto-internacional-de-la-romana", "aeropuerto-internacional-presidente-juan-bosch",
  "aeropuerto-internacional-maria-montez", "aeropuerto-internacional-dr-joaquin-balaguer"];
const PORTS = ["sans-souci", "amber-cove", "taino-bay", "cabo-rojo", "la-romana", "puerto-caucedo", "puerto-haina", "manzanillo"];
const MARINAS = ["casa-de-campo", "cap-cana", "ocean-world", "marina-zar-par", "puerto-bahia", "luperon"];
export const STATIC_PAGES = [
  "/eventos", "/playas", "/loterias", "/loterias/como-se-gana", "/loterias/juego-responsable", "/loterias/estadisticas", "/requisitos-viaje", "/e-ticket", "/aeropuerto", ...AIRPORTS.map((x) => `/aeropuerto/${x}`),
  "/puertos-marinas", ...PORTS.map((x) => `/puerto/${x}`), ...MARINAS.map((x) => `/marina/${x}`),
  "/provincias", "/negocios", "/anunciate", "/registra-tu-negocio", "/contacto", "/privacidad", "/terminos",
];

/** Fichas públicas que salen de Turso además de las noticias: eventos vigentes, playas, provincias, negocios y loterías. */
interface PublicExtras {
  events: { slug: string; name: string; short_description: string | null; start_date: string | null; province: string | null; image_url: string | null; updated_at: string | null }[];
  businesses: { id: string; name: string; province: string | null; description: string | null; created_at: string | null }[];
  provinces: { slug: string; name: string; short_description: string | null; tagline: string | null; image_url: string | null; updated_at: string | null }[];
  beaches: { slug: string; name: string; short_description: string | null; province: string | null; image_url: string | null; updated_at: string | null }[];
  lotteries?: { slug: string; name: string; description: string | null; updated_at: string | null }[];
  draws?: { lottery_slug: string; slug: string; name: string; description: string | null; updated_at: string | null }[];
}
async function publicExtras(db: Client): Promise<PublicExtras> {
  const indicatorsDb = getIndicatorsDb(db);
  const [ev, biz, prov, bch, lots, drws] = await Promise.all([
    db.execute(`SELECT slug, name, short_description, start_date, province, image_url, updated_at FROM events WHERE status = 'published' AND ${EVENT_LIVE} ORDER BY start_date`),
    db.execute("SELECT id, name, province, description, created_at FROM establishment_requests WHERE status = 'approved' ORDER BY name COLLATE NOCASE"),
    db.execute("SELECT slug, name, short_description, tagline, image_url, updated_at FROM provinces WHERE status = 'published' ORDER BY name COLLATE NOCASE"),
    db.execute("SELECT b.slug, b.name, b.short_description, p.name AS province, b.image_url, b.updated_at FROM beaches b LEFT JOIN provinces p ON p.id = b.province_id WHERE b.status = 'published' ORDER BY b.name COLLATE NOCASE"),
    indicatorsDb.execute("SELECT slug, name, description, updated_at FROM lotteries WHERE is_active = 1 ORDER BY name COLLATE NOCASE").catch(() => ({ rows: [] })),
    indicatorsDb.execute("SELECT d.slug, d.name, d.description, d.updated_at, l.slug AS lottery_slug FROM lottery_draws d INNER JOIN lotteries l ON l.id = d.lottery_id WHERE d.is_active = 1 ORDER BY d.draw_time").catch(() => ({ rows: [] })),
  ]);
  return {
    events: ev.rows as unknown as PublicExtras["events"],
    businesses: biz.rows as unknown as PublicExtras["businesses"],
    provinces: prov.rows as unknown as PublicExtras["provinces"],
    beaches: bch.rows as unknown as PublicExtras["beaches"],
    lotteries: lots.rows as unknown as PublicExtras["lotteries"],
    draws: drws.rows as unknown as PublicExtras["draws"],
  };
}

/**
 * Fecha W3C para <lastmod>. SQLite guarda a veces "AAAA-MM-DD HH:MM:SS" (datetime('now'), en UTC), que Google rechaza:
 * se pasa a ISO con zona. Lo que no sea una fecha válida no lleva <lastmod>.
 */
export function w3cDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(v) ? `${v.replace(" ", "T")}Z` : v;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function sitemap(rows: NewsRow[], extras: PublicExtras = { events: [], businesses: [], provinces: [], beaches: [] }): string {
  const url = (loc: string, lastmod?: string | null, extra = "") =>
    `<url><loc>${xmlEsc(`${siteUrl()}${loc}`)}</loc>${w3cDate(lastmod) ? `<lastmod>${w3cDate(lastmod)}</lastmod>` : ""}${extra}</url>`;
  const newest = rows.map((r) => r.updated_at).sort().at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`
    + url("/") + url("/noticias", newest) + STATIC_PAGES.map((p) => url(p)).join("")
    + rows.map((n) => url(`/noticias/${n.slug}`, n.updated_at || n.published_at,
      n.cover_url ? `<image:image><image:loc>${xmlEsc(absolute(n.cover_url))}</image:loc></image:image>` : "")).join("")
    + extras.events.map((e) => url(`/evento/${e.slug}`, e.updated_at,
      e.image_url ? `<image:image><image:loc>${xmlEsc(absolute(e.image_url))}</image:loc></image:image>` : "")).join("")
    + extras.businesses.map((b) => url(`/negocios/${b.id}`, b.created_at)).join("")
    + extras.provinces.map((p) => url(`/provincia/${p.slug}`, p.updated_at,
      p.image_url ? `<image:image><image:loc>${xmlEsc(absolute(p.image_url))}</image:loc></image:image>` : "")).join("")
    + extras.beaches.map((b) => url(`/playa/${b.slug}`, b.updated_at,
      b.image_url ? `<image:image><image:loc>${xmlEsc(absolute(b.image_url))}</image:loc></image:image>` : "")).join("")
    + (extras.lotteries || []).map((l) => url(`/loteria/${l.slug}`, l.updated_at)).join("")
    + (extras.draws || []).map((d) => url(`/loteria/${d.lottery_slug}/${d.slug}`, d.updated_at)).join("")
    + "</urlset>";
}

function rss(rows: NewsRow[]): string {
  const items = [...rows].sort((a, b) => String(b.published_at).localeCompare(String(a.published_at))).slice(0, 50).map((n) => {
    const link = `${siteUrl()}/noticias/${n.slug}`;
    return `<item><title>${xmlEsc(n.title)}</title><link>${xmlEsc(link)}</link><guid isPermaLink="true">${xmlEsc(link)}</guid>`
      + (n.published_at ? `<pubDate>${new Date(n.published_at).toUTCString()}</pubDate>` : "")
      + (n.category_name ? `<category>${xmlEsc(n.category_name)}</category>` : "")
      + `<description>${xmlEsc(newsDescription(n))}</description></item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>`
    + `<title>${SITE_NAME}: noticias</title><link>${siteUrl()}/noticias</link><language>es-DO</language>`
    + `<description>Actualidad del turismo en República Dominicana.</description>`
    + `<atom:link href="${siteUrl()}/noticias/rss.xml" rel="self" type="application/rss+xml" />${items}</channel></rss>`;
}

/** index.html del despliegue actual; se pide al propio sitio una vez por instancia. */
let shellCache: string | null = null;
export type ShellLoader = (host: string | undefined) => Promise<string>;
const fetchShell: ShellLoader = async (host) => {
  if (shellCache) return shellCache;
  const origin = host ? `https://${host}` : siteUrl();
  const res = await fetch(`${origin}/index.html`);
  if (!res.ok) throw new Error(`No se pudo leer index.html (${res.status})`);
  return (shellCache = await res.text());
};

/** Guía del e-Ticket: metadatos, FAQPage y HowTo sacados de public/e-ticket.md (la misma fuente que leen los agentes). */
export function eticketPage(md: string): PageMeta {
  const section = (title: string) => md.split(/^## /m).find((x) => x.startsWith(title)) ?? "";
  const faqs = [...section("Preguntas frecuentes").matchAll(/^### (.+)\n([^#\n][^\n]*)/gm)].map(([, q, a]) => ({ q: q.trim(), a: a.trim() }));
  const steps = [...section("Pasos").matchAll(/^\d+\. (.+)$/gm)].map((m) => m[1].trim());
  const title = "E-Ticket República Dominicana 2026: guía del nuevo portal | Descubre RD";
  const description = "Cómo hacer gratis el e-Ticket de entrada y salida de República Dominicana en el nuevo portal eticket.gob.do: pasos, novedades, QR, menores y cómo evitar fraudes.";
  return {
    title, description, path: "/e-ticket", markdown: "/e-ticket.md",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@context": "https://schema.org", "@type": "HowTo", name: "Cómo hacer el e-Ticket de República Dominicana", totalTime: "PT15M",
        estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: 0 },
        step: steps.map((t, i) => ({ "@type": "HowToStep", position: i + 1, text: t })) },
      breadcrumb([["Inicio", "/"], ["E-Ticket", "/e-ticket"]]),
    ],
    body: `<main><h1>E-Ticket de República Dominicana</h1><p>${esc(description)}</p><ol>${steps.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>`
      + `<h2>Preguntas frecuentes</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}</main>`,
  };
}

let eticketCache: string | null = null;
const fetchEticketMd = async (host: string | undefined) => {
  if (eticketCache) return eticketCache;
  const res = await fetch(`${host ? `https://${host}` : siteUrl()}/e-ticket.md`);
  if (!res.ok) throw new Error(`No se pudo leer e-ticket.md (${res.status})`);
  return (eticketCache = await res.text());
};

async function seoRoute(db: Client, path: string, host: string | undefined, loadShell: ShellLoader, lang?: Lang): Promise<ApiResponse | null> {
  const enc = (text: string) => new TextEncoder().encode(text);
  if (path === "/sitemap.xml") {
    return { status: 200, raw: enc(sitemap(await listNews(db), await publicExtras(db))), headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": HTML_CACHE["Cache-Control"] } };
  }
  if (path === "/rss.xml") {
    return { status: 200, raw: enc(rss(await listNews(db))), headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": HTML_CACHE["Cache-Control"] } };
  }
  if (path === "/render/e-ticket") return { status: 200, raw: enc(renderShell(await loadShell(host), eticketPage(await fetchEticketMd(host)))), headers: HTML_CACHE };
  if (path === "/render/noticias") return { status: 200, raw: enc(renderShell(await loadShell(host), newsListPage(await listNews(db)))), headers: HTML_CACHE };
  const one = path.match(/^\/render\/noticias\/([^/]+)$/);
  if (one) {
    const n = SLUG.test(one[1]) ? await findNews(db, one[1]) : null;
    if (n) {
      const alternates = await newsLangs(db, n.id);
      const shown = lang && alternates.includes(lang) ? lang : undefined; // sin traducción, la versión española
      const page = newsPage((await localizeNews(db, [n], shown))[0], shown, alternates);
      return { status: 200, raw: enc(renderShell(await loadShell(host), page)), headers: HTML_CACHE };
    }
    const notFound: PageMeta = {
      title: `Noticia no encontrada | ${SITE_NAME}`, description: "La noticia que buscas no existe o ya no está publicada.",
      path: `/noticias/${one[1]}`, noindex: true, body: `<main><h1>Noticia no encontrada</h1><p><a href="/noticias">Ver todas las noticias</a></p></main>`,
    };
    return { status: 404, raw: enc(renderShell(await loadShell(host), notFound)), headers: { ...HTML_CACHE, "Cache-Control": "public, max-age=0, s-maxage=30" } };
  }
  return null;
}

// ---------- agentes de IA: llms.txt y versión Markdown de cada noticia ----------
// Los agentes (ChatGPT, Claude, Perplexity, Gemini…) leen mejor texto plano que una SPA: /llms.txt es el índice
// (https://llmstxt.org), /noticias/<slug>.md cada noticia limpia y /llms-full.txt todas juntas.
const SITE_SUMMARY = "Portal de turismo de República Dominicana: noticias de actualidad turística (eventos, cultura, "
  + "gastronomía, naturaleza, infraestructura y avisos al viajero), guía del e-Ticket, aeropuertos, "
  + "puertos de cruceros, marinas, eventos y directorio de negocios turísticos por provincia.";

/** Las URLs relativas del cuerpo (imágenes subidas) pasan a absolutas: el Markdown se lee fuera del sitio. */
const absoluteMarkdown = (md: string) => md.replace(/\]\((\/[^)\s]+)/g, (_m, u: string) => `](${siteUrl()}${u}`);

export function newsMarkdown(n: NewsRow): string {
  const meta = [
    `- URL: ${siteUrl()}/noticias/${n.slug}`,
    n.published_at ? `- Publicada: ${n.published_at.slice(0, 10)}` : "",
    n.updated_at && n.updated_at !== n.published_at ? `- Actualizada: ${n.updated_at.slice(0, 10)}` : "",
    n.category_name ? `- Categoría: ${n.category_name}` : "",
    n.province_name ? `- Provincia: ${n.province_name}, República Dominicana` : "",
    `- Autor: ${n.author || "Redacción Descubre RD"}`,
    n.source_url ? `- Fuente original: ${n.source_url}` : "",
  ].filter(Boolean).join("\n");
  const cover = n.cover_url ? `\n\n![${n.image_alt || n.title}](${absolute(n.cover_url)})${n.image_credit ? `\n\n_${n.image_credit}_` : ""}` : "";
  return `# ${n.title}\n\n${n.excerpt ? `> ${n.excerpt}\n\n` : ""}${meta}${cover}\n\n${absoluteMarkdown(n.body ?? "").trim()}\n`;
}

function llmsTxt(rows: NewsRow[], extras: PublicExtras = { events: [], businesses: [], provinces: [], beaches: [] }): string {
  const items = rows.map((n) => `- [${n.title}](${siteUrl()}/noticias/${n.slug}.md): ${newsDescription(n)}`).join("\n");
  return `# ${SITE_NAME}\n\n> ${SITE_SUMMARY}\n\n`
    + "Contenido en español de República Dominicana. Cada noticia tiene una versión en Markdown (enlaces de abajo) "
    + `y una página web en ${siteUrl()}/noticias/<slug>. Los datos estructurados de cada página siguen schema.org (NewsArticle).\n\n`
    + `## Noticias\n\n${items || "- Todavía no hay noticias publicadas."}\n\n`
    + (extras.provinces.length ? `## Provincias\n\n${extras.provinces.map((p) => `- [${p.name}](${siteUrl()}/provincia/${p.slug}): ${[p.tagline, p.short_description].filter(Boolean).join(". ")}`).join("\n")}\n\n` : "")
    + (extras.beaches.length ? `## Playas\n\n${extras.beaches.map((b) => `- [${b.name}](${siteUrl()}/playa/${b.slug}): ${[b.province, b.short_description].filter(Boolean).join(". ")}`).join("\n")}\n\n` : "")
    + (extras.events.length ? `## Próximos eventos\n\n${extras.events.map((e) => `- [${e.name}](${siteUrl()}/evento/${e.slug}): ${[e.start_date, e.province, e.short_description].filter(Boolean).join(". ")}`).join("\n")}\n\n` : "")
    + (extras.businesses.length ? `## Negocios del directorio\n\n${extras.businesses.map((b) => `- [${b.name}](${siteUrl()}/negocios/${b.id})${b.province ? `: ${b.province}` : ""}`).join("\n")}\n\n` : "")
    + ((extras.lotteries && extras.lotteries.length) ? `## Loterías Dominicanas\n\n- [Loterías Dominicanas: Resultados en Vivo y Comprobador](${siteUrl()}/loterias): números ganadores de hoy, horarios y estadísticas.\n`
      + extras.lotteries.map((l) => `- [${l.name}](${siteUrl()}/loteria/${l.slug}): ${l.description || "Resultados oficiales, horarios y sorteos."}`).join("\n") + "\n\n" : "")
    + ((extras.draws && extras.draws.length) ? `### Históricos de Sorteos\n\n`
      + extras.draws.map((d) => `- [${d.name}](${siteUrl()}/loteria/${d.lottery_slug}/${d.slug}): ${d.description || "Histórico de resultados, números calientes y fríos."}`).join("\n") + "\n\n" : "")
    + `## Guías\n\n- [E-Ticket de República Dominicana: guía del nuevo portal](${siteUrl()}/e-ticket.md): cómo hacer gratis el formulario de entrada y salida en eticket.gob.do.\n`
    + `- [Aeropuertos internacionales de República Dominicana](${siteUrl()}/aeropuerto): terminales, aerolíneas, transporte y destinos cercanos de los ${AIRPORTS.length} aeropuertos.\n`
    + `- [Puertos de cruceros y marinas](${siteUrl()}/puertos-marinas): ${PORTS.length} puertos (Amber Cove, Taíno Bay, Sans Souci, Cabo Rojo…) y ${MARINAS.length} marinas (Cap Cana, Casa de Campo, Ocean World…).\n`
    + `- [Playas de República Dominicana](${siteUrl()}/playas): directorio de playas por provincia, tipo de arena, oleaje, actividades y servicios.\n`
    + `- [Loterías Dominicanas](${siteUrl()}/loterias): resultados oficiales en vivo de LEIDSA, Lotería Nacional, LOTEKA, Real, La Primera, New York y Florida.\n`
    + `- [Cómo se gana en cada lotería](${siteUrl()}/loterias/como-se-gana): reglas por sorteo (cuántos números salen, rango y jugadas).\n`
    + `- [Números calientes y fríos](${siteUrl()}/loterias/estadisticas): cuántas veces salió cada número por sorteo y cuándo salió por última vez.\n`
    + `- [Juego responsable](${siteUrl()}/loterias/juego-responsable): consejos, señales de alerta y dónde pedir ayuda en RD.\n`
    + `- [Eventos en República Dominicana](${siteUrl()}/eventos): conciertos, festivales y deportes con fecha, lugar y provincia.\n`
    + `- [Directorio de negocios turísticos](${siteUrl()}/negocios): negocios y servicios turísticos por provincia.\n\n`
    + `## Opcional\n\n- [Todas las noticias en un solo archivo](${siteUrl()}/llms-full.txt)\n`
    + `- [Listado de noticias](${siteUrl()}/noticias)\n- [Feed RSS](${siteUrl()}/noticias/rss.xml)\n- [Sitemap](${siteUrl()}/sitemap.xml)\n`;
}

const TEXT_HEADERS = (type: string) => ({ "Content-Type": `${type}; charset=utf-8`, "Cache-Control": HTML_CACHE["Cache-Control"], "X-Robots-Tag": "noindex" });

async function llmRoute(db: Client, path: string): Promise<ApiResponse | null> {
  const enc = (text: string) => new TextEncoder().encode(text);
  if (path === "/llms.txt") return { status: 200, raw: enc(llmsTxt(await listNews(db), await publicExtras(db))), headers: TEXT_HEADERS("text/plain") };
  if (path === "/llms-full.txt") {
    const rows = (await listNews(db)).slice(0, 100);
    const extras = await publicExtras(db);
    const lotterySection = extras.draws && extras.draws.length > 0
      ? `\n\n## Loterías Dominicanas e Históricos Oficiales\n\n`
        + (extras.lotteries || []).map((l) => `### ${l.name}\n- URL: ${siteUrl()}/loteria/${l.slug}\n- Descripción: ${l.description || "Lotería oficial en República Dominicana"}\n`).join("\n")
        + `\n### Sorteos Activos:\n`
        + (extras.draws || []).map((d) => `- **${d.name}** (${d.lottery_slug}): ${siteUrl()}/loteria/${d.lottery_slug}/${d.slug}\n  ${d.description || "Histórico de bolos premiados y estadísticas."}`).join("\n")
      : "";
    const text = `# ${SITE_NAME}: índice completo para agentes de IA\n\n> ${SITE_SUMMARY}\n\n${rows.map(newsMarkdown).join("\n---\n\n")}${lotterySection}`;
    return { status: 200, raw: enc(text), headers: TEXT_HEADERS("text/plain") };
  }
  const md = path.match(/^\/md\/noticias\/([^/]+)$/);
  if (md) {
    const n = SLUG.test(md[1]) ? await findNews(db, md[1]) : null;
    return n ? { status: 200, raw: enc(newsMarkdown(n)), headers: TEXT_HEADERS("text/markdown") } : err(404, "No encontrada");
  }
  return null;
}

// ---------- formularios públicos de la landing ----------
// Sorteo (POST /leads) y registro de negocios (POST /establishments/register): mismo contrato que el backend
// completo, que es lo que ya envían SorteoLectorBanner y RegistroEstablecimientoModal.
const MAX_FORM_SUBMISSIONS_PER_HOUR = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ipHash = (ip: string | undefined, secret: string) => (ip ? createHmac("sha256", secret).update(`ip:${ip}`).digest("hex").slice(0, 32) : null);

async function tooManySubmissions(db: Client, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const r = await db.execute({
    sql: `SELECT (SELECT COUNT(*) FROM leads WHERE ip_hash = ? AND created_at > ?)
               + (SELECT COUNT(*) FROM establishment_requests WHERE ip_hash = ? AND created_at > ?)
               + (SELECT COUNT(*) FROM contact_messages WHERE ip_hash = ? AND created_at > ?)
               + (SELECT COUNT(*) FROM events WHERE ip_hash = ? AND created_at > ?) AS n`,
    args: [hash, since, hash, since, hash, since, hash, since],
  });
  return Number(r.rows[0]?.n ?? 0) >= MAX_FORM_SUBMISSIONS_PER_HOUR;
}

function emailOf(body: Fields): string | Error {
  const e = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  return EMAIL.test(e) && e.length <= 254 ? e : new Error("Correo electrónico no válido");
}

async function submitLead(db: Client, body: Fields, hash: string | null): Promise<ApiResponse> {
  if (body.consent !== true) return err(422, "Debes aceptar recibir comunicaciones para participar");
  const email = emailOf(body);
  if (email instanceof Error) return err(422, email.message);
  const values = collect({
    // El boletín solo pide el correo; el sorteo exige nombre.
    name: () => (body.source === "newsletter" ? str(body, "name", 120) ?? email : str(body, "name", 120, true)),
    interest: () => str(body, "interest", 200),
    message: () => str(body, "message", 1000),
    source: () => str(body, "source", 60) ?? "landing",
  });
  if (values instanceof Error) return err(422, values.message);
  if (await tooManySubmissions(db, hash)) return err(429, "Demasiados envíos. Inténtalo más tarde.");
  // Un correo participa una vez por formulario; repetir no es un error para quien lo envía.
  const r = await db.execute({
    sql: `INSERT INTO leads (id, name, email, interest, message, source, consent, ip_hash) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
          ON CONFLICT(email, source) DO NOTHING`,
    args: [randomUUID(), values.name, email, values.interest, values.message, values.source, hash],
  });
  return { status: r.rowsAffected ? 201 : 200, body: { data: { registered: true, duplicate: !r.rowsAffected } } };
}

async function submitContact(db: Client, body: Fields, hash: string | null): Promise<ApiResponse> {
  const email = emailOf(body);
  if (email instanceof Error) return err(422, email.message);
  const values = collect({
    name: () => str(body, "name", 120, true),
    subject: () => str(body, "subject", 160),
    message: () => { const m = str(body, "message", 3000, true); return m instanceof Error || (m && m.length >= 10) ? m : new Error("Escribe un mensaje de al menos 10 caracteres"); },
  });
  if (values instanceof Error) return err(422, values.message);
  if (await tooManySubmissions(db, hash)) return err(429, "Demasiados envíos. Inténtalo más tarde.");
  await db.execute({
    sql: "INSERT INTO contact_messages (id, name, email, subject, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?)",
    args: [randomUUID(), values.name, email, values.subject, values.message, hash],
  });
  return { status: 201, body: { data: { received: true } } };
}

const FORM_POSTS = new Set(["/leads", "/contact", "/establishments/register", "/establishments/files", "/events/submissions"]);

/**
 * Barrera común de los formularios públicos: el campo trampa (un bot lo rellena; se le responde como si
 * hubiera ido bien para que no reintente) y el origen (solo se aceptan envíos desde el propio sitio).
 */
function formGuard(req: ApiRequest, body: Fields): ApiResponse | null {
  if (typeof body.hp_website === "string" && body.hp_website.trim()) return { status: 201, body: { data: { received: true } } };
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  if (origin && host) {
    try { if (new URL(origin).host !== host) return err(403, "Origen no permitido"); } catch { return err(403, "Origen no permitido"); }
  }
  return null;
}

/** «Registrar mi evento»: entra como borrador y el equipo lo revisa en el panel antes de publicarlo. */
async function submitEvent(db: Client, body: Fields, hash: string | null): Promise<ApiResponse> {
  const email = emailOf({ email: body.organizer_email });
  if (email instanceof Error) return err(422, email.message);
  const values = collect({
    name: () => str(body, "title", 200, true),
    start_date: fmt(body, "start_date", DATE, "una fecha AAAA-MM-DD"),
    start_time: fmt(body, "start_time", TIME, "una hora HH:MM"),
    address: () => str(body, "location", 300, true),
    description: () => { const d = str(body, "description", 5000, true); return d instanceof Error || d!.length >= 20 ? d : new Error("Describe el evento con al menos 20 caracteres"); },
    event_type: () => str(body, "category", 60),
    organizer: () => str(body, "organizer_name", 200, true),
    submitter_phone: () => { const ph = str(body, "organizer_phone", 30); return ph instanceof Error || ph === null || /^[+\d\s().-]{7,30}$/.test(ph) ? ph : new Error("Teléfono no válido"); },
    ticket_url: () => url(body, "ticket_url"),
    price_range: () => str(body, "price_info", 120),
  });
  if (values instanceof Error) return err(422, values.message);
  if (!values.start_date) return err(422, "start_date es obligatorio");
  if (await tooManySubmissions(db, hash)) return err(429, "Demasiados envíos. Inténtalo más tarde.");
  const base = String(values.name).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "evento";
  const id = randomUUID();
  const cols = Object.keys(values);
  await db.execute({
    sql: `INSERT INTO events (id, slug, status, submitter_email, ip_hash, ${cols.join(", ")}) VALUES (?, ?, 'draft', ?, ?, ${cols.map(() => "?").join(", ")})`,
    args: [id, `${base}-${id.slice(0, 6)}`, email, hash, ...Object.values(values)],
  });
  return { status: 201, body: { data: { id, status: "pending" } } };
}

// ---------- archivos del registro de negocios: fotos (WebP) y menú (PDF) ----------
// Se suben uno a uno antes de enviar la solicitud (una función de Vercel no acepta cuerpos de más de 4,5 MB).
// shortcut: los archivos de un registro abandonado quedan sin request_id; si crecen, borrarlos con más de un día.
const MAX_MENU_BYTES = 2.5 * 1024 * 1024; // en base64 cabe en el límite de 4 MB de readBody
const MAX_FILES_PER_HOUR = 30;
const MAX_PHOTOS = 8;
const isPdf = (b: Uint8Array) => b.length > 5 && String.fromCharCode(...b.subarray(0, 5)) === "%PDF-";
const fileUrl = (id: string, kind: string) => `/api/v1/establishment-files/${id}.${kind === "menu" ? "pdf" : "webp"}`;

async function uploadEstablishmentFile(db: Client, body: Fields, hash: string | null): Promise<ApiResponse> {
  const kind = body.kind === "photo" || body.kind === "menu" ? body.kind : null;
  if (!kind) return err(422, "kind debe ser photo o menu");
  const max = kind === "menu" ? MAX_MENU_BYTES : MAX_IMAGE_BYTES;
  const tooBig = kind === "menu" ? "El menú supera los 2,5 MB" : "La foto supera los 2 MB";
  if (typeof body.data !== "string" || body.data.length > Math.ceil(max / 3) * 4 + 4) return err(413, tooBig);
  const bytes = new Uint8Array(Buffer.from(body.data, "base64"));
  if (kind === "photo" ? !isWebp(bytes) : !isPdf(bytes)) return err(415, kind === "photo" ? "Solo se aceptan fotos WebP" : "El menú debe ser un PDF");
  if (bytes.length > max) return err(413, tooBig);
  if (hash) {
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const n = Number((await db.execute({ sql: "SELECT COUNT(*) AS n FROM establishment_files WHERE ip_hash = ? AND created_at > ?", args: [hash, since] })).rows[0]?.n ?? 0);
    if (n >= MAX_FILES_PER_HOUR) return err(429, "Demasiados archivos. Inténtalo más tarde.");
  }
  const id = randomUUID();
  await db.execute({
    sql: "INSERT INTO establishment_files (id, kind, mime, bytes, size, ip_hash) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, kind, kind === "menu" ? "application/pdf" : "image/webp", bytes, bytes.length, hash],
  });
  return { status: 201, body: { data: { id, url: fileUrl(id, kind), size: bytes.length } } };
}

async function serveEstablishmentFile(db: Client, id: string, ext: string): Promise<ApiResponse> {
  if (!MEDIA_ID.test(id)) return err(404, "No encontrado");
  const row = (await db.execute({ sql: "SELECT mime, bytes FROM establishment_files WHERE id = ?", args: [id] })).rows[0];
  if (!row || (ext === "pdf") !== (row.mime === "application/pdf")) return err(404, "No encontrado");
  const headers: Record<string, string> = { "Content-Type": String(row.mime), "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" };
  if (ext === "pdf") headers["Content-Security-Policy"] = "sandbox"; // un PDF subido por cualquiera no ejecuta nada en el sitio
  return { status: 200, raw: new Uint8Array(row.bytes as ArrayBuffer), headers };
}

/** Ids de archivos que trae la solicitud: deben existir, ser del tipo esperado y no estar ya ligados a otra. */
async function pendingFiles(db: Client, body: Fields): Promise<{ photos: string[]; menu: string | null } | Error> {
  const photos = Array.isArray(body.photo_ids) ? body.photo_ids : [];
  const menu = typeof body.menu_id === "string" && body.menu_id ? body.menu_id : null;
  if (photos.length > MAX_PHOTOS) return new Error(`Máximo ${MAX_PHOTOS} fotos`);
  const ids = [...photos, ...(menu ? [menu] : [])];
  if (ids.some((x) => typeof x !== "string" || !MEDIA_ID.test(x)) || new Set(ids).size !== ids.length) return new Error("Archivos no válidos");
  if (!ids.length) return { photos: [], menu: null };
  const rows = (await db.execute({ sql: `SELECT id, kind FROM establishment_files WHERE request_id IS NULL AND id IN (${ids.map(() => "?").join(", ")})`, args: ids })).rows;
  const kindOf = new Map(rows.map((r) => [String(r.id), String(r.kind)]));
  if (photos.some((p) => kindOf.get(p as string) !== "photo") || (menu && kindOf.get(menu) !== "menu")) return new Error("Archivos no válidos o ya usados; vuelve a subirlos");
  return { photos: photos as string[], menu };
}

async function submitEstablishment(db: Client, body: Fields, hash: string | null): Promise<ApiResponse> {
  const email = emailOf(body);
  if (email instanceof Error) return err(422, email.message);
  const files = await pendingFiles(db, body);
  if (files instanceof Error) return err(422, files.message);
  const values = collect({
    type: () => { const t = str(body, "type", 40, true); return t instanceof Error || /^[a-z0-9_-]+$/.test(t!) ? t : new Error("Tipo de negocio no válido"); },
    name: () => str(body, "name", 160, true),
    contact_name: () => str(body, "contact_name", 120, true),
    phone: () => { const ph = str(body, "phone", 30, true); return ph instanceof Error || /^[+\d\s().-]{7,30}$/.test(ph!) ? ph : new Error("Teléfono no válido"); },
    address: () => str(body, "address", 300),
    province: () => str(body, "province", 80),
    website: () => url(body, "website"),
    photo_url: () => url(body, "photo_url"),
    description: () => str(body, "description", 3000),
    rnc: () => str(body, "rnc", 20),
    schedule: () => str(body, "schedule", 200),
  });
  if (values instanceof Error) return err(422, values.message);
  if (!values.photo_url && files.photos.length) values.photo_url = fileUrl(files.photos[0], "photo"); // la primera foto es la portada
  const details = body.details && typeof body.details === "object" ? JSON.stringify(body.details) : null;
  if (details && details.length > 20_000) return err(422, "Los detalles del negocio son demasiado extensos");
  if (await tooManySubmissions(db, hash)) return err(429, "Demasiados envíos. Inténtalo más tarde.");
  const id = randomUUID();
  const cols = Object.keys(values);
  const linked = [...files.photos, ...(files.menu ? [files.menu] : [])];
  const initialStatus = body.status === "approved" ? "approved" : "pending";
  await db.batch([
    {
      sql: `INSERT INTO establishment_requests (id, email, details, status, ip_hash, ${cols.join(", ")}) VALUES (?, ?, ?, ?, ?, ${cols.map(() => "?").join(", ")})`,
      args: [id, email, details, initialStatus, hash, ...Object.values(values)],
    },
    ...(linked.length ? [{ sql: `UPDATE establishment_files SET request_id = ? WHERE request_id IS NULL AND id IN (${linked.map(() => "?").join(", ")})`, args: [id, ...linked] }] : []),
  ], "write");
  return { status: 201, body: { data: { id, status: initialStatus } } };
}

/** Panel (solo admin): participantes del sorteo y solicitudes de negocios. Sin ip_hash. */
type FormResource = "leads" | "establishment-requests" | "contact-messages";
async function formsAdmin(db: Client, resource: FormResource, method: string, id: string | undefined, body: Fields): Promise<ApiResponse> {
  const table = resource.replace("-", "_");
  const cols = resource === "leads"
    ? "id, name, email, interest, message, source, created_at"
    : resource === "contact-messages" ? "id, name, email, subject, message, created_at"
    // files: urls de las fotos y el menú subidos, separadas por espacios
    : `id, type, name, contact_name, email, phone, address, province, website, photo_url, description, rnc, schedule, details, status, created_at, updated_at,
       (SELECT group_concat('/api/v1/establishment-files/' || f.id || CASE f.kind WHEN 'menu' THEN '.pdf' ELSE '.webp' END, ' ')
          FROM establishment_files f WHERE f.request_id = establishment_requests.id) AS files`;
  if (method === "GET" && !id) return { status: 200, body: { data: (await db.execute(`SELECT ${cols} FROM ${table} ORDER BY created_at DESC LIMIT 2000`)).rows } };
  if (!id) return err(405, "Método no permitido");
  if (method === "DELETE") {
    // SQLite no aplica ON DELETE CASCADE si foreign_keys está apagado: se borran a mano.
    if (table === "establishment_requests") await db.execute({ sql: "DELETE FROM establishment_files WHERE request_id = ?", args: [id] });
    const r = await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    return r.rowsAffected ? { status: 204 } : err(404, "No encontrado");
  }
  if (method === "PATCH" && table === "establishment_requests") {
    const status = oneOf(body, "status", ["pending", "approved", "rejected"], null);
    if (!status || status instanceof Error) return err(422, "status debe ser pending, approved o rejected");
    const r = await db.execute({ sql: "UPDATE establishment_requests SET status = ?, updated_at = ? WHERE id = ?", args: [status, now(), id] });
    return r.rowsAffected ? { status: 200, body: { data: { id, status } } } : err(404, "No encontrado");
  }
  return err(405, "Método no permitido");
}

// ---------- idiomas del contenido del CMS ----------
// El español vive en la fila; las traducciones, en content_translations (un JSON por registro e idioma).
// Lo público acepta ?lang=xx y completa con español lo que no esté traducido.
export const LANGS = ["en", "fr", "de", "it", "pt"] as const;
export type Lang = (typeof LANGS)[number];
const LANG_NAMES: Record<Lang, string> = { en: "inglés", fr: "francés", de: "alemán", it: "italiano", pt: "portugués" };
type Entity = "news" | "provinces" | "news_categories";
const TRANSLATABLE: Record<Entity, Record<string, number>> = {
  news: { title: 200, excerpt: 500, body: 100000, seo_title: 90, seo_description: 200, image_alt: 300, image_credit: 200 },
  provinces: { name: 120, capital: 120, short_description: 300, description: 20000 },
  news_categories: { name: 80 },
};
const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

async function translationsOf(db: Client, entity: Entity, ids: string[], lang: Lang): Promise<Map<string, Record<string, string>>> {
  const out = new Map<string, Record<string, string>>();
  if (!ids.length) return out;
  const r = await db.execute({
    sql: `SELECT entity_id, data FROM content_translations WHERE entity = ? AND lang = ? AND entity_id IN (${ids.map(() => "?").join(",")})`,
    args: [entity, lang, ...ids],
  });
  for (const row of r.rows) {
    try { out.set(String(row.entity_id), JSON.parse(String(row.data))); } catch { /* traducción corrupta: se ignora */ }
  }
  return out;
}

/** Sobrescribe en cada fila los campos traducidos no vacíos; `idKey` apunta al id del registro traducido. */
async function overlay<T extends Record<string, unknown>>(db: Client, entity: Entity, rows: T[], lang: Lang | undefined,
  map: Record<string, string> = {}, idKey = "id"): Promise<T[]> {
  if (!lang || !rows.length) return rows;
  const ids = [...new Set(rows.map((r) => r[idKey]).filter((v): v is string => typeof v === "string"))];
  const tr = await translationsOf(db, entity, ids, lang);
  return rows.map((row) => {
    const t = tr.get(String(row[idKey]));
    if (!t) return row;
    const next: Record<string, unknown> = { ...row };
    for (const [field, value] of Object.entries(t)) {
      const target = map[field] ?? (Object.keys(map).length ? null : field);
      if (target && typeof value === "string" && value.trim()) next[target] = value;
    }
    return next as T;
  });
}

/** Noticias traducidas, con su categoría y provincia también en ese idioma. */
async function localizeNews<T extends Record<string, unknown>>(db: Client, rows: T[], lang: Lang | undefined): Promise<T[]> {
  if (!lang) return rows;
  let out = await overlay(db, "news", rows, lang);
  out = await overlay(db, "news_categories", out, lang, { name: "category_name" }, "category_id");
  return overlay(db, "provinces", out, lang, { name: "province_name" }, "province_id");
}

/** Idiomas con traducción de una noticia (para hreflang). */
async function newsLangs(db: Client, id: string): Promise<Lang[]> {
  const r = await db.execute({ sql: "SELECT lang FROM content_translations WHERE entity = 'news' AND entity_id = ?", args: [id] });
  return r.rows.map((x) => x.lang).filter(isLang);
}

async function translationsAdmin(db: Client, method: string, entity: string, id: string, lang: string | undefined, body: Fields, userId: string): Promise<ApiResponse> {
  if (!(entity in TRANSLATABLE)) return err(404, "Ruta no encontrada");
  const e = entity as Entity;
  if (method === "GET" && !lang) {
    const r = await db.execute({ sql: "SELECT lang, data, updated_at FROM content_translations WHERE entity = ? AND entity_id = ?", args: [e, id] });
    const data: Record<string, unknown> = {};
    for (const row of r.rows) { try { data[String(row.lang)] = JSON.parse(String(row.data)); } catch { /* ignora */ } }
    return { status: 200, body: { data } };
  }
  if (!isLang(lang)) return err(422, `Idioma no válido; usa uno de: ${LANGS.join(", ")}`);
  if (method === "DELETE") {
    await db.execute({ sql: "DELETE FROM content_translations WHERE entity = ? AND entity_id = ? AND lang = ?", args: [e, id, lang] });
    return { status: 204 };
  }
  if (method !== "PUT") return err(405, "Método no permitido");
  const src = (body.data && typeof body.data === "object" ? body.data : {}) as Fields;
  const clean: Record<string, string> = {};
  for (const [field, max] of Object.entries(TRANSLATABLE[e])) {
    const v = str(src, field, max);
    if (v instanceof Error) return err(422, v.message);
    if (v) clean[field] = v;
  }
  const exists = await db.execute({ sql: `SELECT 1 FROM ${e} WHERE id = ?`, args: [id] });
  if (!exists.rows.length) return err(404, "No encontrado");
  if (!Object.keys(clean).length) {
    await db.execute({ sql: "DELETE FROM content_translations WHERE entity = ? AND entity_id = ? AND lang = ?", args: [e, id, lang] });
    return { status: 200, body: { data: {} } };
  }
  await db.execute({
    sql: `INSERT INTO content_translations (entity, entity_id, lang, data, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(entity, entity_id, lang) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
    args: [e, id, lang, JSON.stringify(clean), userId, now()],
  });
  return { status: 200, body: { data: clean } };
}

// ---------- traducción con IA (Gemini o Claude) ----------
/** Traduce los campos de español a cada idioma pedido. Devuelve { en: {campo: texto}, … }. */
export type Translator = (fields: Record<string, string>, to: Lang[]) => Promise<Record<string, Record<string, string>>>;

const claudeTranslate: Translator = async (fields, to) => {
  if (!process.env.ANTHROPIC_API_KEY) throw Object.assign(new Error("Falta ANTHROPIC_API_KEY en Vercel"), { status: 503 });
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const keys = Object.keys(fields);
  const fieldSchema = { type: "object", properties: Object.fromEntries(keys.map((k) => [k, { type: "string" }])), required: keys, additionalProperties: false };
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // si el modelo declina, la API reintenta con el recomendado por categoría
    output_config: {
      effort: "low", // traducir es una tarea directa
      format: { type: "json_schema", schema: { type: "object", properties: Object.fromEntries(to.map((l) => [l, fieldSchema])), required: to, additionalProperties: false } },
    },
    system: TRANSLATE_SYSTEM,
    messages: [{
      role: "user",
      content: translatePrompt(fields, to),
    }],
  });
  if (response.stop_reason === "refusal") throw Object.assign(new Error("El modelo no pudo traducir este contenido"), { status: 422 });
  if (response.stop_reason === "max_tokens") throw Object.assign(new Error("El texto es demasiado largo para traducirlo de una vez"), { status: 422 });
  const text = response.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
  return JSON.parse(text) as Record<string, Record<string, string>>;
};

const TRANSLATE_SYSTEM = "Eres traductor profesional de un portal de turismo de República Dominicana. Traduce del español con tono "
  + "periodístico natural. Conserva intactos el formato Markdown, las URLs, los nombres propios de lugares "
  + "dominicanos (Samaná, Las Terrenas, Los Haitises…) y las cifras. Devuelve solo el JSON pedido.";
const translatePrompt = (fields: Record<string, string>, to: Lang[]) =>
  `Traduce cada campo al ${to.map((l) => `${LANG_NAMES[l]} (${l})`).join(", ")}.\n\n${JSON.stringify(fields)}`;

/** Gemini por REST (generateContent con salida JSON según esquema). Modelo configurable con GEMINI_MODEL. */
const geminiTranslate: Translator = async (fields, to) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("Falta GEMINI_API_KEY en Vercel"), { status: 503 });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const keys = Object.keys(fields);
  const fieldSchema = { type: "OBJECT", properties: Object.fromEntries(keys.map((k) => [k, { type: "STRING" }])), required: keys };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: TRANSLATE_SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: translatePrompt(fields, to) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: Object.fromEntries(to.map((l) => [l, fieldSchema])), required: [...to] },
      },
    }),
  });
  if (!res.ok) {
    console.error("Gemini", res.status, (await res.text()).slice(0, 500));
    throw Object.assign(new Error("Gemini no pudo traducir"), { status: res.status === 429 ? 429 : 502 });
  }
  const json = (await res.json()) as { candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[] };
  const c = json.candidates?.[0];
  if (c?.finishReason === "SAFETY") throw Object.assign(new Error("El modelo no pudo traducir este contenido"), { status: 422 });
  if (c?.finishReason === "MAX_TOKENS") throw Object.assign(new Error("El texto es demasiado largo para traducirlo de una vez"), { status: 422 });
  return JSON.parse((c?.content?.parts ?? []).map((x) => x.text ?? "").join("")) as Record<string, Record<string, string>>;
};

/** Proveedor: TRANSLATION_PROVIDER (gemini | claude); si no se indica, Gemini cuando hay su clave, si no Claude. */
const defaultTranslator: Translator = (fields, to) => {
  const forced = process.env.TRANSLATION_PROVIDER;
  const useGemini = forced ? forced === "gemini" : Boolean(process.env.GEMINI_API_KEY) || !process.env.ANTHROPIC_API_KEY;
  return (useGemini ? geminiTranslate : claudeTranslate)(fields, to);
};

async function translateRoute(body: Fields, translate: Translator): Promise<ApiResponse> {
  const src = (body.fields && typeof body.fields === "object" ? body.fields : {}) as Record<string, unknown>;
  const fields = Object.fromEntries(Object.entries(src).filter(([, v]) => typeof v === "string" && v.trim()).map(([k, v]) => [k, String(v)]));
  if (!Object.keys(fields).length) return err(422, "No hay texto en español para traducir");
  if (JSON.stringify(fields).length > 120_000) return err(413, "El texto es demasiado largo para traducirlo de una vez");
  const to = (Array.isArray(body.to) ? body.to : LANGS).filter(isLang);
  if (!to.length) return err(422, "Indica al menos un idioma de destino");
  try {
    return { status: 200, body: { data: await translate(fields, to) } };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status && status < 500) return err(status, (e as Error).message);
    if (status === 503) return err(503, (e as Error).message);
    console.error(e);
    return err(502, "No se pudo traducir ahora; inténtalo de nuevo");
  }
}

// ---------- Loterías e Indicadores (Turso) ----------
let indicatorsDbClient: Client | null = null;
function getIndicatorsDb(mainDb: Client): Client {
  const url = process.env.TURSO_DB_LOTERY_URL || process.env.TURSO_INDICATORS_DATABASE_URL;
  const token = process.env.TURSO_AUTH_LOTERY_TOKEN || process.env.TURSO_INDICATORS_AUTH_TOKEN;
  if (url && !url.startsWith("file:")) {
    indicatorsDbClient ??= createClient({
      url,
      authToken: token,
    });
    return indicatorsDbClient;
  }
  return mainDb;
}

/** Datos de contacto de una lotería (editables en el panel). */
const lotteryInfo = (l: Record<string, unknown>) => Object.fromEntries(
  (["phone", "address", "tv_channels", "founded", "slogan"] as const).map((k) => [k, l[k] ? String(l[k]) : null]),
);

/** Carrusel del hero de /loterias: diapositivas activas en su orden, con el enlace al sorteo si lo tienen. */
async function handleGetLotteryHero(db: Client): Promise<ApiResponse> {
  const r = await db.execute(`SELECT s.id, s.title, s.prize, s.caption, s.link_url, d.slug AS draw_slug, d.name AS draw_name, l.slug AS lottery_slug, l.name AS lottery_name
    FROM lottery_hero_slides s LEFT JOIN lottery_draws d ON d.id = s.draw_id LEFT JOIN lotteries l ON l.id = d.lottery_id
    WHERE s.is_active = 1 ORDER BY s.sort_order, s.created_at`);
  return { status: 200, body: { data: r.rows.map((x) => ({
    id: String(x.id), title: String(x.title), prize: x.prize ? String(x.prize) : null, caption: x.caption ? String(x.caption) : null,
    link_url: x.link_url ? String(x.link_url) : x.draw_slug ? `/loteria/${String(x.lottery_slug)}/${String(x.draw_slug)}` : null,
    draw_name: x.draw_name ? String(x.draw_name) : null, lottery_name: x.lottery_name ? String(x.lottery_name) : null,
  })) }, headers: PUBLIC_CACHE };
}

/**
 * Números calientes y fríos de un sorteo: cuántas veces salió cada número en los últimos N días (30 a 365),
 * su porcentaje sobre los sorteos y cuándo salió por última vez. Solo con resultados reales guardados.
 */
async function handleGetLotteryStats(db: Client, drawId?: string, daysParam?: string, fromParam?: string, toParam?: string): Promise<ApiResponse> {
  if (!drawId || !/^[A-Za-z0-9-]{1,64}$/.test(drawId)) return err(422, "Indica el sorteo (draw)");
  const days = Math.min(365, Math.max(7, Number(daysParam) || 365));
  const d = (await db.execute({ sql: "SELECT id, name, ball_range_min, ball_range_max, number_of_balls FROM lottery_draws WHERE id = ? AND is_active = 1", args: [drawId] })).rows[0];
  if (!d) return err(404, "Sorteo no encontrado");
  const today = rdNow().date;
  // Rango propio (desde/hasta, p. ej. el año en curso) o, si no, los últimos N días (365 por defecto).
  const custom = isIsoDate(fromParam) && isIsoDate(toParam) && fromParam <= toParam;
  if ((fromParam || toParam) && !custom) return err(422, "Rango no válido: usa from y to en AAAA-MM-DD, con from antes que to");
  const rows = (await db.execute(custom
    ? { sql: "SELECT draw_date, winning_numbers FROM lottery_results WHERE draw_id = ? AND is_active = 1 AND draw_date >= ? AND draw_date <= ? ORDER BY draw_date", args: [drawId, fromParam, toParam] }
    : { sql: "SELECT draw_date, winning_numbers FROM lottery_results WHERE draw_id = ? AND is_active = 1 AND draw_date > date(?, ?) AND draw_date <= ? ORDER BY draw_date", args: [drawId, today, `-${days} days`, today] },
  )).rows;
  const min = Number(d.ball_range_min), max = Number(d.ball_range_max);
  const stats = new Map<number, { count: number; last: string | null }>();
  for (let n = min; n <= max; n++) stats.set(n, { count: 0, last: null });
  for (const r of rows) {
    let nums: unknown = [];
    try { nums = JSON.parse(String(r.winning_numbers)); } catch { /* fila dañada: se ignora */ }
    if (!Array.isArray(nums)) continue;
    for (const n of new Set(nums as number[])) {
      const s = stats.get(n);
      if (s) { s.count++; s.last = String(r.draw_date); }
    }
  }
  const total = rows.length;
  const daysSince = (date: string | null) => (date ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000) : null);
  return {
    status: 200,
    body: { data: {
      draw: { id: String(d.id), name: String(d.name), ball_range_min: min, ball_range_max: max, number_of_balls: Number(d.number_of_balls) },
      days: custom ? null : days, range_from: custom ? fromParam : null, range_to: custom ? toParam : null, total_draws: total, from: rows.length ? String(rows[0].draw_date) : null, to: rows.length ? String(rows[rows.length - 1].draw_date) : null,
      // Probabilidad de que un número concreto salga en un sorteo (bolos sin reposición): bolos / números posibles.
      probability: Math.min(1, Number(d.number_of_balls) / (max - min + 1)),
      numbers: [...stats].map(([n, s]) => ({ n, count: s.count, pct: total ? s.count / total : 0, last_date: s.last, days_since: daysSince(s.last) })),
    } },
    headers: PUBLIC_CACHE,
  };
}

async function handleGetLotteries(db: Client, dateParam?: string): Promise<ApiResponse> {
  const lotteriesRes = await db.execute("SELECT id, slug, name, country, logo_url, website_url, description, color_scheme, phone, address, tv_channels, founded, slogan, is_active FROM lotteries WHERE is_active = 1 ORDER BY name COLLATE NOCASE");
  const drawsRes = await db.execute("SELECT id, lottery_id, slug, name, draw_days, draw_time, ball_range_min, ball_range_max, number_of_balls, tombolas_count, has_bonus, bonus_name, schedule_description, how_to_play, logo_url, is_active FROM lottery_draws WHERE is_active = 1 ORDER BY draw_time");

  const resultsRes = dateParam
    ? await db.execute({ sql: "SELECT id, draw_id, draw_date, winning_numbers, bonus_number, jackpot_amount FROM lottery_results WHERE draw_date = ? AND is_active = 1", args: [dateParam] })
    : await db.execute(`
        SELECT r.id, r.draw_id, r.draw_date, r.winning_numbers, r.bonus_number, r.jackpot_amount
        FROM lottery_results r
        INNER JOIN (
          SELECT draw_id, MAX(draw_date) as max_date
          FROM lottery_results
          WHERE is_active = 1
          GROUP BY draw_id
        ) latest ON r.draw_id = latest.draw_id AND r.draw_date = latest.max_date
      `);

  const resultsByDraw = new Map<string, { id: string; draw_date: string; winning_numbers: number[]; bonus_number: number | null; jackpot_amount: string | null }>();
  for (const r of resultsRes.rows) {
    resultsByDraw.set(String(r.draw_id), {
      id: String(r.id),
      draw_date: String(r.draw_date),
      winning_numbers: typeof r.winning_numbers === "string" ? (JSON.parse(r.winning_numbers) as number[]) : [],
      bonus_number: r.bonus_number !== null ? Number(r.bonus_number) : null,
      jackpot_amount: r.jackpot_amount ? String(r.jackpot_amount) : null,
    });
  }

  const drawsByLottery = new Map<string, unknown[]>();
  for (const d of drawsRes.rows) {
    const lId = String(d.lottery_id);
    if (!drawsByLottery.has(lId)) drawsByLottery.set(lId, []);
    drawsByLottery.get(lId)!.push({
      id: String(d.id),
      slug: String(d.slug),
      name: String(d.name),
      draw_days: typeof d.draw_days === "string" ? JSON.parse(d.draw_days) : d.draw_days,
      draw_time: String(d.draw_time),
      ball_range_min: Number(d.ball_range_min),
      ball_range_max: Number(d.ball_range_max),
      number_of_balls: Number(d.number_of_balls),
      tombolas_count: Number(d.tombolas_count),
      has_bonus: Boolean(d.has_bonus),
      bonus_name: d.bonus_name ? String(d.bonus_name) : null,
      schedule_description: d.schedule_description ? String(d.schedule_description) : null,
      how_to_play: d.how_to_play ? String(d.how_to_play) : null,
      logo_url: d.logo_url ? String(d.logo_url) : null,
      latest_result: resultsByDraw.get(String(d.id)) || null,
    });
  }

  const lotteries = lotteriesRes.rows.map((l) => ({
    id: String(l.id),
    slug: String(l.slug),
    name: String(l.name),
    country: String(l.country),
    logo_url: l.logo_url ? String(l.logo_url) : null,
    website_url: l.website_url ? String(l.website_url) : null,
    description: l.description ? String(l.description) : null,
    color_scheme: l.color_scheme ? String(l.color_scheme) : null,
    ...lotteryInfo(l),
    draws: drawsByLottery.get(String(l.id)) || [],
  }));

  return { status: 200, body: { data: lotteries }, headers: PUBLIC_CACHE };
}

async function handleGetLotteryResults(db: Client, dateParam?: string, companySlug?: string): Promise<ApiResponse> {
  let sql = `
    SELECT
      r.id, r.draw_id, r.draw_date, r.winning_numbers, r.bonus_number, r.jackpot_amount, r.is_active,
      d.id AS d_id, d.lottery_id AS d_lottery_id, d.name AS d_name, d.slug AS d_slug, d.draw_days AS d_draw_days,
      d.draw_time AS d_draw_time, d.ball_range_min AS d_ball_range_min, d.ball_range_max AS d_ball_range_max,
      d.number_of_balls AS d_number_of_balls, d.tombolas_count AS d_tombolas_count, d.has_bonus AS d_has_bonus, d.logo_url AS d_logo_url,
      l.id AS l_id, l.slug AS l_slug, l.name AS l_name, l.country AS l_country, l.logo_url AS l_logo_url
    FROM lottery_results r
    INNER JOIN lottery_draws d ON d.id = r.draw_id
    INNER JOIN lotteries l ON l.id = d.lottery_id
    WHERE r.is_active = 1
  `;
  const args: InValue[] = [];
  if (dateParam) {
    // Por sorteo, el resultado de ese día o, si aún no hay, el último resultado disponible (la web lo pinta en gris con su fecha).
    sql += ` AND r.draw_date = (SELECT MAX(r2.draw_date) FROM lottery_results r2 WHERE r2.draw_id = r.draw_id AND r2.is_active = 1
              AND r2.draw_date <= ?)`;
    args.push(dateParam);
  }
  if (companySlug && companySlug !== "all") {
    sql += " AND (l.slug = ? OR l.id = ?)";
    args.push(companySlug, companySlug);
  }
  sql += " ORDER BY r.draw_date DESC, d.draw_time ASC LIMIT 150";

  const res = await db.execute({ sql, args });
  const data = res.rows.map((row) => ({
    id: String(row.id),
    draw_id: String(row.draw_id),
    draw_date: String(row.draw_date),
    winning_numbers: typeof row.winning_numbers === "string" ? (JSON.parse(row.winning_numbers) as number[]) : [],
    bonus_number: row.bonus_number !== null ? Number(row.bonus_number) : null,
    jackpot_amount: row.jackpot_amount ? String(row.jackpot_amount) : null,
    is_active: Boolean(row.is_active),
    lottery_draws: {
      id: String(row.d_id),
      lottery_id: String(row.d_lottery_id),
      slug: String(row.d_slug),
      name: String(row.d_name),
      draw_days: typeof row.d_draw_days === "string" ? JSON.parse(row.d_draw_days) : row.d_draw_days,
      draw_time: String(row.d_draw_time),
      ball_range_min: Number(row.d_ball_range_min),
      ball_range_max: Number(row.d_ball_range_max),
      number_of_balls: Number(row.d_number_of_balls),
      tombolas_count: Number(row.d_tombolas_count),
      has_bonus: Boolean(row.d_has_bonus),
      logo_url: row.d_logo_url ? String(row.d_logo_url) : null,
      is_active: true,
      lotteries: {
        id: String(row.l_id),
        slug: String(row.l_slug),
        name: String(row.l_name),
        country: String(row.l_country),
        logo_url: row.l_logo_url ? String(row.l_logo_url) : null,
        is_active: true,
      },
    },
  }));

  return { status: 200, body: { data }, headers: PUBLIC_CACHE };
}

async function handleGetLotteryDetail(db: Client, slug: string): Promise<ApiResponse> {
  const lotRes = await db.execute({
    sql: "SELECT id, slug, name, country, logo_url, website_url, description, color_scheme, phone, address, tv_channels, founded, slogan FROM lotteries WHERE slug = ? OR id = ?",
    args: [slug, slug],
  });
  if (!lotRes.rows.length) return err(404, "Lotería no encontrada");
  const lot = lotRes.rows[0];

  const drawsRes = await db.execute({
    sql: "SELECT id, slug, name, draw_days, draw_time, ball_range_min, ball_range_max, number_of_balls, tombolas_count, has_bonus, bonus_name, description, schedule_description, how_to_play, logo_url FROM lottery_draws WHERE lottery_id = ? AND is_active = 1 ORDER BY draw_time",
    args: [lot.id],
  });

  const resultsRes = await db.execute({
    sql: `SELECT r.id, r.draw_id, r.draw_date, r.winning_numbers, r.bonus_number, r.jackpot_amount
          FROM lottery_results r
          INNER JOIN lottery_draws d ON d.id = r.draw_id
          WHERE d.lottery_id = ? AND r.is_active = 1
          ORDER BY r.draw_date DESC, d.draw_time ASC LIMIT 60`,
    args: [lot.id],
  });

  const results = resultsRes.rows.map((r) => ({
    id: String(r.id),
    draw_id: String(r.draw_id),
    draw_date: String(r.draw_date),
    winning_numbers: typeof r.winning_numbers === "string" ? (JSON.parse(r.winning_numbers) as number[]) : [],
    bonus_number: r.bonus_number !== null ? Number(r.bonus_number) : null,
    jackpot_amount: r.jackpot_amount ? String(r.jackpot_amount) : null,
  }));

  return {
    status: 200,
    body: {
      data: {
        id: String(lot.id),
        slug: String(lot.slug),
        name: String(lot.name),
        country: String(lot.country),
        logo_url: lot.logo_url ? String(lot.logo_url) : null,
        website_url: lot.website_url ? String(lot.website_url) : null,
        description: lot.description ? String(lot.description) : null,
        color_scheme: lot.color_scheme ? String(lot.color_scheme) : null,
        ...lotteryInfo(lot),
        draws: drawsRes.rows.map((d) => ({
          id: String(d.id),
          slug: String(d.slug),
          name: String(d.name),
          draw_days: typeof d.draw_days === "string" ? JSON.parse(d.draw_days) : d.draw_days,
          draw_time: String(d.draw_time),
          ball_range_min: Number(d.ball_range_min),
          ball_range_max: Number(d.ball_range_max),
          number_of_balls: Number(d.number_of_balls),
          tombolas_count: Number(d.tombolas_count),
          has_bonus: Boolean(d.has_bonus),
          bonus_name: d.bonus_name ? String(d.bonus_name) : null,
          description: d.description ? String(d.description) : null,
          schedule_description: d.schedule_description ? String(d.schedule_description) : null,
          how_to_play: d.how_to_play ? String(d.how_to_play) : null,
          logo_url: d.logo_url ? String(d.logo_url) : null,
        })),
        recent_results: results,
      },
    },
    headers: PUBLIC_CACHE,
  };
}

async function handleGetDrawDetail(
  db: Client,
  companySlug: string,
  drawSlug: string,
  query?: Record<string, string>
): Promise<ApiResponse> {
  const lotRes = await db.execute({
    sql: "SELECT id, slug, name, country, logo_url, website_url, description, color_scheme, phone, address, tv_channels, founded, slogan FROM lotteries WHERE slug = ? OR id = ?",
    args: [companySlug, companySlug],
  });
  if (!lotRes.rows.length) return err(404, "Lotería no encontrada");
  const lot = lotRes.rows[0];

  const drawRes = await db.execute({
    sql: `SELECT id, lottery_id, slug, name, draw_days, draw_time, ball_range_min, ball_range_max,
                 number_of_balls, tombolas_count, has_bonus, bonus_name, description, schedule_description, how_to_play
          FROM lottery_draws
          WHERE (slug = ? OR id = ?) AND (lottery_id = ? OR lottery_id = ?)`,
    args: [drawSlug, drawSlug, String(lot.id), `lot-${companySlug}`],
  });
  if (!drawRes.rows.length) return err(404, "Sorteo no encontrado");
  const draw = drawRes.rows[0];

  const relatedRes = await db.execute({
    sql: "SELECT id, slug, name, draw_time FROM lottery_draws WHERE lottery_id = ? AND id != ? AND is_active = 1 ORDER BY draw_time",
    args: [String(lot.id), String(draw.id)],
  });

  const limit = Math.min(Math.max(Number(query?.limit) || 90, 1), 365);
  const year = query?.year;
  const month = query?.month;
  const targetNumber = query?.number;

  let sql = "SELECT id, draw_id, draw_date, winning_numbers, bonus_number, jackpot_amount FROM lottery_results WHERE draw_id = ? AND is_active = 1";
  const args: InValue[] = [String(draw.id)];

  if (year && /^\d{4}$/.test(year)) {
    if (month && /^\d{1,2}$/.test(month)) {
      sql += " AND draw_date LIKE ?";
      args.push(`${year}-${month.padStart(2, "0")}-%`);
    } else {
      sql += " AND draw_date LIKE ?";
      args.push(`${year}-%`);
    }
  } else if (month && /^\d{1,2}$/.test(month)) {
    sql += " AND substr(draw_date, 6, 2) = ?";
    args.push(month.padStart(2, "0"));
  }

  sql += " ORDER BY draw_date DESC LIMIT ?";
  args.push(limit);

  const resultsRes = await db.execute({ sql, args });

  let results = resultsRes.rows.map((r) => ({
    id: String(r.id),
    draw_id: String(r.draw_id),
    draw_date: String(r.draw_date),
    winning_numbers: typeof r.winning_numbers === "string" ? (JSON.parse(r.winning_numbers) as number[]) : [],
    bonus_number: r.bonus_number !== null ? Number(r.bonus_number) : null,
    jackpot_amount: r.jackpot_amount ? String(r.jackpot_amount) : null,
  }));

  if (targetNumber && /^\d{1,2}$/.test(targetNumber)) {
    const numToFind = Number(targetNumber);
    results = results.filter((r) => r.winning_numbers.includes(numToFind));
  }

  const freqMap = new Map<number, number>();
  for (const r of results) {
    for (const num of r.winning_numbers) {
      freqMap.set(num, (freqMap.get(num) || 0) + 1);
    }
  }

  const sortedFreq = Array.from(freqMap.entries())
    .map(([num, count]) => ({
      number: String(num).padStart(2, "0"),
      count,
      percentage: results.length > 0 ? Math.round((count / results.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const hotNumbers = sortedFreq.slice(0, 5);
  const coldNumbers = sortedFreq.slice(-5).reverse();

  return {
    status: 200,
    body: {
      data: {
        lottery: {
          id: String(lot.id),
          slug: String(lot.slug),
          name: String(lot.name),
          country: String(lot.country),
          logo_url: lot.logo_url ? String(lot.logo_url) : null,
          website_url: lot.website_url ? String(lot.website_url) : null,
          description: lot.description ? String(lot.description) : null,
          color_scheme: lot.color_scheme ? String(lot.color_scheme) : null,
        },
        draw: {
          id: String(draw.id),
          lottery_id: String(draw.lottery_id),
          slug: String(draw.slug),
          name: String(draw.name),
          draw_days: typeof draw.draw_days === "string" ? JSON.parse(draw.draw_days) : draw.draw_days,
          draw_time: String(draw.draw_time),
          ball_range_min: Number(draw.ball_range_min),
          ball_range_max: Number(draw.ball_range_max),
          number_of_balls: Number(draw.number_of_balls),
          tombolas_count: Number(draw.tombolas_count),
          has_bonus: Boolean(draw.has_bonus),
          bonus_name: draw.bonus_name ? String(draw.bonus_name) : null,
          description: draw.description ? String(draw.description) : null,
          schedule_description: draw.schedule_description ? String(draw.schedule_description) : null,
          how_to_play: draw.how_to_play ? String(draw.how_to_play) : null,
        },
        results,
        stats: {
          total_draws: results.length,
          hot_numbers: hotNumbers,
          cold_numbers: coldNumbers,
          latest_result: results[0] || null,
        },
        related_draws: relatedRes.rows.map((rd) => ({
          id: String(rd.id),
          slug: String(rd.slug),
          name: String(rd.name),
          draw_time: String(rd.draw_time),
        })),
      },
    },
    headers: PUBLIC_CACHE,
  };
}

/** Sincroniza un día (hoy por defecto). La fecha no puede ser futura ni anterior a 2000. */
async function handleSyncLotteries(db: Client, body: Fields): Promise<ApiResponse> {
  const htmlContent = typeof body.htmlContent === "string" && body.htmlContent.length <= 2_000_000 ? body.htmlContent : undefined;
  const today = rdNow().date;
  const date = body.date === undefined || body.date === "" ? today : body.date;
  if (!isIsoDate(date) || date > today || date < "2000-01-01") return err(422, "Fecha no válida: usa AAAA-MM-DD, hoy o un día pasado");
  const report = await scrapeAndSyncLotteries(db, { htmlContent, date });
  return { status: 200, body: { data: report } };
}

/** Cron (cada minuto): sólo descarga si a algún sorteo le toca intento (3, 5 o 10 min tras su hora) y aún no tiene resultado. */
async function handleLotteryCron(db: Client): Promise<ApiResponse> {
  const due = await dueDraws(db);
  if (!due.length) return { status: 200, body: { data: { due: 0 } } };
  const report = await scrapeAndSyncLotteries(db, { drawIds: due });
  return { status: 200, body: { data: { due: due.length, ...report } } };
}

/** Premio manual (texto libre, ej. «RD$ 120 millones») de un sorteo en una fecha. Vacío lo borra.
 * Si el día aún no tiene resultado se crea la fila oculta (is_active = 0) y el sincronizador la activa al guardar los números. */
async function setLotteryPrize(db: Client, body: Fields): Promise<ApiResponse> {
  const drawId = typeof body.draw_id === "string" ? body.draw_id : "";
  const date = body.date;
  if (!isIsoDate(date) || date < "2000-01-01") return err(422, "Fecha no válida: usa AAAA-MM-DD");
  const prize = str(body, "jackpot_amount", 120);
  if (prize instanceof Error) return err(422, prize.message);
  const draw = await db.execute({ sql: "SELECT id FROM lottery_draws WHERE id = ?", args: [drawId] });
  if (!draw.rows.length) return err(404, "Sorteo no encontrado");
  await db.execute({
    sql: `INSERT INTO lottery_results (id, draw_id, draw_date, winning_numbers, jackpot_amount, is_active, updated_at)
          VALUES (?, ?, ?, '[]', ?, 0, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
          ON CONFLICT (draw_id, draw_date) DO UPDATE SET jackpot_amount = excluded.jackpot_amount, updated_at = excluded.updated_at`,
    args: [`res-${drawId}-${date}`, drawId, date, prize ?? null],
  });
  return { status: 200, body: { data: { draw_id: drawId, date, jackpot_amount: prize ?? null } } };
}

/**
 * Resultado cargado a mano (sorteos que la fuente no publica). Misma validación que el sincronizador: fecha no futura,
 * cantidad exacta de números y rango del sorteo. Conserva el premio si ya había uno.
 */
async function setManualResult(db: Client, body: Fields): Promise<ApiResponse> {
  const drawId = typeof body.draw_id === "string" ? body.draw_id : "";
  const date = body.date;
  if (!isIsoDate(date) || date > rdNow().date || date < "2000-01-01") return err(422, "Fecha no válida: usa AAAA-MM-DD, hoy o un día pasado");
  const d = (await db.execute({ sql: "SELECT number_of_balls, ball_range_min, ball_range_max, has_bonus FROM lottery_draws WHERE id = ?", args: [drawId] })).rows[0];
  if (!d) return err(404, "Sorteo no encontrado");
  const nums = Array.isArray(body.numbers) ? body.numbers.map(Number) : [];
  const [count, min, max] = [Number(d.number_of_balls), Number(d.ball_range_min), Number(d.ball_range_max)];
  if (nums.length !== count) return err(422, `Este sorteo saca ${count} números y enviaste ${nums.length}`);
  if (nums.some((n) => !Number.isInteger(n) || n < min || n > max)) return err(422, `Los números deben estar entre ${min} y ${max}`);
  const bonusRaw = body.bonus_number;
  const bonus = bonusRaw === undefined || bonusRaw === null || bonusRaw === "" ? null : Number(bonusRaw);
  if (bonus !== null && (!Number(d.has_bonus) || !Number.isInteger(bonus) || bonus < 0 || bonus > 99)) return err(422, "Bolo adicional no válido para este sorteo");
  await db.execute({
    sql: `INSERT INTO lottery_results (id, draw_id, draw_date, winning_numbers, bonus_number, is_active, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
          ON CONFLICT (draw_id, draw_date) DO UPDATE SET winning_numbers = excluded.winning_numbers, bonus_number = excluded.bonus_number,
            is_active = 1, updated_at = excluded.updated_at`,
    args: [`res-${drawId}-${date}`, drawId, date, JSON.stringify(nums), bonus],
  });
  return { status: 200, body: { data: { draw_id: drawId, date, winning_numbers: nums, bonus_number: bonus } } };
}

async function listLotteryPrizes(db: Client, drawId: string): Promise<ApiResponse> {
  const r = await db.execute({
    sql: "SELECT draw_date, jackpot_amount, is_active, winning_numbers, bonus_number FROM lottery_results WHERE draw_id = ? AND (jackpot_amount IS NOT NULL OR is_active = 1) ORDER BY draw_date DESC LIMIT 60",
    args: [drawId],
  });
  const nums = (v: unknown) => { try { const a = JSON.parse(String(v)); return Array.isArray(a) ? (a as number[]) : []; } catch { return []; } };
  return { status: 200, body: { data: r.rows.map((x) => ({
    date: String(x.draw_date), jackpot_amount: x.jackpot_amount ? String(x.jackpot_amount) : null, has_result: Number(x.is_active) === 1,
    winning_numbers: Number(x.is_active) === 1 ? nums(x.winning_numbers) : [], bonus_number: x.bonus_number === null ? null : Number(x.bonus_number),
  })) } };
}

// ---------- loterías y sorteos (panel) ----------
const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const lotterySpec = (b: Fields) => ({
  slug: slugOf(b, 80),
  name: () => str(b, "name", 120, true),
  country: () => str(b, "country", 80) ?? "República Dominicana",
  logo_url: () => url(b, "logo_url"),
  website_url: () => url(b, "website_url"),
  description: () => str(b, "description", 1000),
  color_scheme: () => str(b, "color_scheme", 80),
  phone: () => str(b, "phone", 80),
  address: () => str(b, "address", 200),
  tv_channels: () => str(b, "tv_channels", 200),
  founded: () => str(b, "founded", 60),
  slogan: () => str(b, "slogan", 120),
  is_active: () => bool(b, "is_active"),
});
const heroSpec = (b: Fields) => ({
  title: () => str(b, "title", 120, true),
  prize: () => str(b, "prize", 80),
  caption: () => str(b, "caption", 200),
  draw_id: () => str(b, "draw_id", 64),
  link_url: () => { const v = str(b, "link_url", 300); return v instanceof Error || v === null || /^(\/[^/]|https:\/\/)/.test(v) ? v : new Error("link_url: usa una ruta del sitio (/loterias/...) o un enlace https://"); },
  sort_order: () => int(b, "sort_order", 0, 999) ?? 0,
  is_active: () => bool(b, "is_active"),
});
const parseDays = (v: unknown): unknown => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return null;
  try { return JSON.parse(v); } catch { return null; }
};
const drawSpec = (b: Fields) => ({
  lottery_id: () => str(b, "lottery_id", 64, true),
  slug: slugOf(b, 100),
  name: () => str(b, "name", 120, true),
  source_name: () => str(b, "source_name", 120),
  source_path: () => { const p = str(b, "source_path", 120); return p instanceof Error || p === null || /^[a-z0-9-]+$/.test(p) ? p : new Error("source_path: solo minúsculas, números y guiones (ej.: resultados-loto)"); },
  draw_days: () => {
    const list = parseDays(b.draw_days);
    if (!Array.isArray(list) || !list.length || list.some((d) => !DAYS.includes(String(d)))) return new Error("draw_days: elige al menos un día de la semana");
    return JSON.stringify(DAYS.filter((d) => list.includes(d)));
  },
  draw_time: () => { const t = str(b, "draw_time", 5, true); return t instanceof Error || /^([01]\d|2[0-3]):[0-5]\d$/.test(t!) ? t : new Error("draw_time debe ser HH:MM (hora de RD)"); },
  sunday_time: () => { const t = str(b, "sunday_time", 5); return t instanceof Error || t === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : new Error("sunday_time debe ser HH:MM o quedar vacío"); },
  ball_range_min: () => int(b, "ball_range_min", 0, 99) ?? 0,
  ball_range_max: () => int(b, "ball_range_max", 1, 99) ?? 99,
  number_of_balls: () => int(b, "number_of_balls", 1, 20) ?? 3,
  tombolas_count: () => int(b, "tombolas_count", 1, 20) ?? 1,
  has_bonus: () => bool(b, "has_bonus"),
  bonus_name: () => str(b, "bonus_name", 80),
  description: () => str(b, "description", 1000),
  schedule_description: () => str(b, "schedule_description", 200),
  how_to_play: () => str(b, "how_to_play", 2000),
  logo_url: () => url(b, "logo_url"),
  is_active: () => bool(b, "is_active"),
});

async function lotteryAdmin(db: Client, kind: "lotteries" | "lottery_draws" | "lottery_hero_slides", method: string, id: string | undefined, body: Fields): Promise<ApiResponse> {
  if (method === "GET" && !id) {
    const sql = kind === "lottery_hero_slides"
      ? "SELECT s.*, d.name AS draw_name FROM lottery_hero_slides s LEFT JOIN lottery_draws d ON d.id = s.draw_id ORDER BY s.sort_order, s.created_at"
      : kind === "lotteries"
      ? "SELECT l.*, (SELECT COUNT(*) FROM lottery_draws d WHERE d.lottery_id = l.id) AS draws_count FROM lotteries l ORDER BY l.name COLLATE NOCASE"
      : "SELECT d.*, l.name AS lottery_name, (SELECT MAX(draw_date) FROM lottery_results r WHERE r.draw_id = d.id AND r.is_active = 1) AS last_result FROM lottery_draws d JOIN lotteries l ON l.id = d.lottery_id ORDER BY l.name COLLATE NOCASE, d.draw_time";
    return { status: 200, body: { data: (await db.execute(sql)).rows } };
  }
  if (method === "DELETE" && id) {
    if (kind === "lotteries") {
      const n = Number((await db.execute({ sql: "SELECT COUNT(*) AS n FROM lottery_draws WHERE lottery_id = ?", args: [id] })).rows[0]?.n ?? 0);
      if (n) return err(409, `No se puede eliminar: tiene ${n} sorteo${n === 1 ? "" : "s"}. Elimínalos o desactiva la lotería`);
    } else if (kind === "lottery_draws") {
      await db.execute({ sql: "DELETE FROM lottery_results WHERE draw_id = ?", args: [id] });
    }
    const r = await db.execute({ sql: `DELETE FROM ${kind} WHERE id = ?`, args: [id] });
    return r.rowsAffected ? { status: 204 } : err(404, "No encontrado");
  }
  if (!(method === "POST" && !id) && !(method === "PUT" && id)) return err(405, "Método no permitido");
  const values = collect(kind === "lotteries" ? lotterySpec(body) : kind === "lottery_draws" ? drawSpec(body) : heroSpec(body));
  if (values instanceof Error) return err(422, values.message);
  if (kind === "lottery_hero_slides" && values.draw_id && !(await db.execute({ sql: "SELECT 1 FROM lottery_draws WHERE id = ?", args: [values.draw_id] })).rows.length) {
    return err(422, "El sorteo indicado no existe");
  }
  if (kind === "lottery_draws") {
    if (!(await db.execute({ sql: "SELECT 1 FROM lotteries WHERE id = ?", args: [values.lottery_id] })).rows.length) return err(422, "La lotería indicada no existe");
    if (Number(values.ball_range_min) >= Number(values.ball_range_max)) return err(422, "El número mínimo debe ser menor que el máximo");
  }
  try {
    const cols = Object.keys(values);
    if (method === "POST") {
      const newId = randomUUID();
      await db.execute({ sql: `INSERT INTO ${kind} (id, ${cols.join(", ")}) VALUES (?, ${cols.map(() => "?").join(", ")})`, args: [newId, ...Object.values(values)] });
      return { status: 201, body: { data: (await db.execute({ sql: `SELECT * FROM ${kind} WHERE id = ?`, args: [newId] })).rows[0] } };
    }
    const r = await db.execute({ sql: `UPDATE ${kind} SET ${cols.map((c) => `${c} = ?`).join(", ")}, updated_at = ? WHERE id = ?`, args: [...Object.values(values), now(), id!] });
    if (!r.rowsAffected) return err(404, "No encontrado");
    return { status: 200, body: { data: (await db.execute({ sql: `SELECT * FROM ${kind} WHERE id = ?`, args: [id!] })).rows[0] } };
  } catch (e) {
    if (String(e).includes("UNIQUE")) return err(409, "Ya existe un registro con ese slug");
    throw e;
  }
}

// ---------- router ----------
export async function handle(req: ApiRequest, db: Client, secret: string, secureCookies = true, loadShell: ShellLoader = fetchShell, translate: Translator = defaultTranslator): Promise<ApiResponse> {
  const lang = isLang(req.lang) ? req.lang : undefined;
  const path = req.path.replace(/^\/api\/v1/, "").replace(/\/+$/, "") || "/";
  const body = (req.body && typeof req.body === "object" ? req.body : {}) as Fields;
  const m = req.method.toUpperCase();

  if (path === "/health") return { status: 200, body: { data: { ok: true } } };

  // Loterías e Indicadores (Turso)
  const indicatorsDb = getIndicatorsDb(db);
  if (m === "GET" && (path === "/lotteries" || path === "/public/lotteries")) {
    return handleGetLotteries(indicatorsDb, req.query?.date);
  }
  if (m === "GET" && (path === "/lotteries/results" || path === "/public/lotteries/results")) {
    return handleGetLotteryResults(indicatorsDb, req.query?.date, req.query?.company);
  }
  if (m === "GET" && (path === "/lotteries/hero" || path === "/public/lotteries/hero")) return handleGetLotteryHero(indicatorsDb);
  if (m === "GET" && (path === "/lotteries/stats" || path === "/public/lotteries/stats")) return handleGetLotteryStats(indicatorsDb, req.query?.draw, req.query?.days, req.query?.from, req.query?.to);
  const drawMatch = m === "GET" && path.match(/^\/(?:public\/)?lotteries\/([a-z0-9-]+)\/(?:draws\/)?([a-z0-9-]+)$/);
  if (drawMatch && drawMatch[1] !== "sync" && drawMatch[1] !== "results") {
    return handleGetDrawDetail(indicatorsDb, drawMatch[1], drawMatch[2], req.query);
  }
  const lotMatch = m === "GET" && path.match(/^\/(?:public\/)?lotteries\/([a-z0-9-]+)$/);
  if (lotMatch && lotMatch[1] !== "sync" && lotMatch[1] !== "results") {
    return handleGetLotteryDetail(indicatorsDb, lotMatch[1]);
  }
  // Sincronizar escribe resultados: sólo el cron de Vercel (CRON_SECRET) aquí; el equipo, más abajo y con sesión.
  if ((m === "POST" || m === "GET") && path === "/lotteries/sync") { // GET: así lo llama el cron de Vercel
    const cron = process.env.CRON_SECRET;
    if (!cron || req.headers.authorization !== `Bearer ${cron}`) return err(401, "No autenticado");
    return handleLotteryCron(indicatorsDb);
  }

  if (m === "GET" && path.startsWith("/public/")) return (await publicApi(db, path, lang)) ?? err(404, "Ruta no encontrada");
  const media = m === "GET" && path.match(/^\/media\/([^/]+)\.webp$/); // el id se valida en serveMedia
  if (media) return serveMedia(db, media[1]);
  const estFile = m === "GET" && path.match(/^\/establishment-files\/([^/]+)\.(webp|pdf)$/);
  if (estFile) return serveEstablishmentFile(db, estFile[1], estFile[2]);
  if (m === "GET") {
    const seo = (await seoRoute(db, path, req.headers["x-forwarded-host"] ?? req.headers.host, loadShell, lang)) ?? (await llmRoute(db, path));
    if (seo) return seo;
  }
  // La landing pide el catálogo de anuncios del backend completo; staging no tiene anuncios.
  if (m === "GET" && path === "/ads/catalog") return { status: 200, body: { data: [] }, headers: PUBLIC_CACHE };

  if (m === "POST" && FORM_POSTS.has(path)) {
    const blocked = formGuard(req, body);
    if (blocked) return blocked;
  }
  if (m === "POST" && path === "/events/submissions") return submitEvent(db, body, ipHash(req.ip, secret));
  if (m === "POST" && path === "/leads") return submitLead(db, body, ipHash(req.ip, secret));
  if (m === "POST" && path === "/contact") return submitContact(db, body, ipHash(req.ip, secret));
  if (m === "POST" && path === "/establishments/register") return submitEstablishment(db, body, ipHash(req.ip, secret));
  if (m === "POST" && path === "/establishments/files") return uploadEstablishmentFile(db, body, ipHash(req.ip, secret));

  if (path === "/auth/login" && m === "POST") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password || password.length > 200) return err(401, "Invalid login credentials");
    const since = new Date(Date.now() - FAILED_WINDOW_MIN * 60_000).toISOString();
    const fails = Number((await db.execute({ sql: "SELECT COUNT(*) AS n FROM login_attempts WHERE email = ? AND created_at > ?", args: [email, since] })).rows[0]?.n ?? 0);
    if (fails >= MAX_FAILED_LOGINS) return err(429, "Demasiados intentos");
    const user = await findUser(db, "email", email);
    const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH) && !!user;
    if (!ok) {
      await db.execute({ sql: "INSERT INTO login_attempts (email, ip) VALUES (?, ?)", args: [email, req.ip ?? null] });
      return err(401, "Invalid login credentials");
    }
    await db.execute({ sql: "DELETE FROM login_attempts WHERE email = ?", args: [email] });
    return sessionFor(user!, secret, secureCookies);
  }

  if (path === "/auth/refresh" && m === "POST") {
    const claims = verifyToken(readCookie(req.headers.cookie, REFRESH_COOKIE) ?? "", secret, "refresh");
    const user = claims && (await findUser(db, "id", claims.sub));
    // shortcut: el refresco no se revoca en el servidor (JWT sin lista negra); con usuarios reales, guardar los tokens en una tabla.
    return user ? sessionFor(user, secret, secureCookies) : err(401, "Sesión expirada");
  }

  if (path === "/auth/logout" && m === "POST") return { status: 204, headers: { "Set-Cookie": cookie("", 0, secureCookies) } };

  // Todo lo demás requiere sesión.
  const bearer = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  const claims = bearer ? verifyToken(bearer, secret, "access") : null;
  const user = claims && (await findUser(db, "id", claims.sub));
  if (!user) return err(401, "No autenticado");

  if (path === "/auth/me" && m === "GET") return { status: 200, body: { data: publicUser(user) } };

  const roles = publicUser(user).roles;
  if (!roles.some((r) => STAFF_ROLES.includes(r))) return err(403, "Sin permisos");

  const users = path.match(/^\/admin\/users(?:\/([A-Za-z0-9-]+))?$/);
  if (users) return roles.includes("admin") ? usersApi(db, m, users[1], body, user) : err(403, "Solo un administrador gestiona usuarios");

  const manager = roles.includes("admin") || roles.includes("editor"); // gestiona todo el contenido
  if (path === "/admin/lotteries/sync" && m === "POST") {
    return manager ? handleSyncLotteries(getIndicatorsDb(db), body) : err(403, "Solo un editor o administrador sincroniza loterías");
  }
  if (path === "/admin/lotteries/result" && m === "POST") {
    return manager ? setManualResult(getIndicatorsDb(db), body) : err(403, "Solo un editor o administrador carga resultados");
  }
  if (path === "/admin/lotteries/prize" && m === "POST") {
    return manager ? setLotteryPrize(getIndicatorsDb(db), body) : err(403, "Solo un editor o administrador registra premios");
  }
  const prizes = path.match(/^\/admin\/lotteries\/prizes\/([A-Za-z0-9-]+)$/);
  if (prizes && m === "GET") return manager ? listLotteryPrizes(getIndicatorsDb(db), prizes[1]) : err(403, "Sin permisos");
  const lot = path.match(/^\/admin\/(lotteries|lottery-draws|lottery-hero)(?:\/([A-Za-z0-9-]+))?$/);
  if (lot) return manager ? lotteryAdmin(getIndicatorsDb(db), lot[1] === "lotteries" ? "lotteries" : lot[1] === "lottery-hero" ? "lottery_hero_slides" : "lottery_draws", m, lot[2], body) : err(403, "Solo un editor o administrador gestiona loterías");
  if (path === "/admin/media" && m === "POST") {
    return roles.includes("colaborador") && !manager && !roles.includes("autor") ? err(403, "Un colaborador no puede subir imágenes") : uploadMedia(db, body, user.id);
  }
  const lib = path.match(/^\/admin\/media(?:\/([^/]+))?$/);
  if (lib && !(m === "POST" && !lib[1])) {
    return m === "GET" || manager ? mediaAdmin(db, m, lib[1], body) : err(403, "Solo un editor o administrador modifica la biblioteca");
  }
  if (path === "/admin/translate" && m === "POST") return translateRoute(body, translate);
  const tr = path.match(/^\/admin\/translations\/(news|provinces|news_categories)\/([A-Za-z0-9-]+)(?:\/([a-z]{2}))?$/);
  if (tr) return translationsAdmin(db, m, tr[1], tr[2], tr[3], body, user.id);

  const forms = path.match(/^\/admin\/(leads|establishment-requests|contact-messages)(?:\/([A-Za-z0-9-]+))?$/);
  if (forms) {
    if (!roles.includes("admin")) return err(403, "Solo un administrador ve los datos de los formularios");
    return formsAdmin(db, forms[1] as FormResource, m, forms[2], body);
  }

  const bulk = path.match(/^\/admin\/(provinces|news|events|venues|municipalities|destinations|beaches)\/bulk$/);
  if (bulk) {
    if (m !== "POST") return err(405, "Método no permitido");
    if (!manager) return err(403, "Solo un editor o administrador edita en lote");
    return bulkEdit(db, bulk[1] as BulkTable, body, user.id);
  }

  const match = path.match(/^\/admin\/(provinces|news|news-categories|events|venues|municipalities|destinations|beaches)(?:\/([A-Za-z0-9-]+))?$/);
  if (match && m !== "GET" && !manager) {
    if (match[1] !== "news") return err(403, "Solo un editor o administrador modifica provincias, municipios, destinos, playas, categorías, eventos y recintos");
    const denied = await ownNewsGuard(db, m, match[2], body, user.id, roles.includes("autor"));
    if (denied) return denied;
  }
  if (match) return crud(db, match[1].replace("-", "_") as keyof typeof TABLES, m, match[2], body, user.id);

  return err(404, "Ruta no encontrada");
}

// ---------- adaptador de Vercel ----------
let db: Client | null = null;

/** La ruta pedida: la original si Vercel la conserva en req.url; si no, la que deja la reescritura en ?route=. */
function routeOf(rawUrl = "/"): string {
  const url = new URL(rawUrl, "http://x");
  const route = url.searchParams.get("route");
  return url.pathname.startsWith("/api/v1/") || route === null ? url.pathname : `/api/v1/${route.replace(/^\/+/, "")}`;
}

function config() {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET } = process.env;
  if (!TURSO_DATABASE_URL || !JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("Faltan TURSO_DATABASE_URL o JWT_SECRET (mínimo 32 caracteres)");
  }
  db ??= createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
  return { db, secret: JWT_SECRET };
}

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined) return req.body; // Vercel ya lo parseó
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > 4_000_000) throw Object.assign(new Error("Cuerpo demasiado grande"), { status: 413 });
    chunks.push(c as Buffer);
  }
  const text = Buffer.concat(chunks).toString();
  return text ? JSON.parse(text) : {};
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const { db, secret } = config();
    const out = await handle(
      {
        method: req.method ?? "GET",
        path: routeOf(req.url),
        headers: req.headers as Record<string, string | undefined>,
        body: await readBody(req),
        ip: (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim(),
        lang: new URL(req.url ?? "/", "http://x").searchParams.get("lang") ?? undefined,
        query: Object.fromEntries(new URL(req.url ?? "/", "http://x").searchParams.entries()),
      },
      db,
      secret,
    );
    for (const [k, v] of Object.entries(out.headers ?? {})) res.setHeader(k, v);
    if (out.raw) return void res.writeHead(out.status).end(Buffer.from(out.raw));
    if (out.body === undefined) return void res.writeHead(out.status).end();
    res.writeHead(out.status, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(out.body));
  } catch (e) {
    // Tabla o columna inexistente: falta aplicar migraciones (node staging/db.mjs migrate). Se dice tal cual.
    if (/no such (table|column)/i.test(String(e))) {
      console.error(e);
      return void res.writeHead(503, { "Content-Type": "application/json; charset=utf-8" })
        .end(JSON.stringify({ error: { message: "La base de datos no está actualizada: faltan migraciones. Vuelve a desplegar o ejecuta node staging/db.mjs migrate." } }));
    }
    const status = (e as { status?: number }).status ?? (e instanceof SyntaxError ? 400 : 500);
    if (status === 500) console.error(e);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
      .end(JSON.stringify({ error: { message: status === 500 ? "Error interno" : (e as Error).message } }));
  }
}
