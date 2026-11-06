// Función de Vercel: recibe todo /api/v1/* (ver rewrites en vercel.json).
// Todo en un solo archivo a propósito: Vercel no resolvía el import de un módulo hermano (ERR_MODULE_NOT_FOUND).
import type { IncomingMessage, ServerResponse } from "node:http";
// Cliente web: habla con Turso por HTTP, sin el módulo nativo de SQLite que no hace falta en Vercel.
import { createClient, type Client, type InValue } from "@libsql/client/web";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

// Mini backend de staging (Turso/SQLite): acceso al panel, provincias y noticias.
// Responde con el mismo contrato que el backend completo para /auth/*, así el frontend no cambia.

export interface ApiRequest { method: string; path: string; headers: Record<string, string | undefined>; body: unknown; ip?: string; lang?: string }
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
});

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
// refs: columnas que apuntan a otra tabla. Se comprueban aquí porque Turso, por HTTP, no garantiza las claves foráneas.
const TABLES = {
  provinces: { spec: provinceSpec, order: "name COLLATE NOCASE", refs: {} },
  news: { spec: newsSpec, order: "created_at DESC", refs: { province_id: ["provinces", "La provincia indicada no existe"], category_id: ["news_categories", "La categoría indicada no existe"] } },
  news_categories: { spec: categorySpec, order: "sort_order, name COLLATE NOCASE", refs: {} },
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
    if (table === "provinces") await db.execute({ sql: "UPDATE news SET province_id = NULL WHERE province_id = ?", args: [id] });
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

async function publicApi(db: Client, path: string, lang?: Lang): Promise<ApiResponse | null> {
  if (path === "/public/provinces") {
    const r = await db.execute(`SELECT id, slug, name, region, capital, short_description, description, image_url, latitude, longitude, updated_at
      FROM provinces WHERE status = 'published' ORDER BY name COLLATE NOCASE`);
    return { status: 200, body: { data: await overlay(db, "provinces", r.rows as unknown as Record<string, unknown>[], lang) }, headers: PUBLIC_CACHE };
  }
  const detail = path.match(/^\/public\/news\/([^/]+)$/);
  if (detail) {
    const n = SLUG.test(detail[1]) ? await findNews(db, detail[1]) : null;
    return n ? { status: 200, body: { data: (await localizeNews(db, [n], lang))[0] }, headers: PUBLIC_CACHE } : err(404, "No encontrada");
  }
  if (path === "/public/news") {
    return { status: 200, body: { data: await localizeNews(db, (await listNews(db)).slice(0, 50), lang) }, headers: PUBLIC_CACHE };
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
                 + (SELECT COUNT(*) FROM content_translations WHERE data LIKE ?) AS n`,
      args: [url, like, url, like, like],
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
export const siteUrl = () => (process.env.SITE_URL || "https://www.descubrerepdom.com").replace(/\/+$/, "");
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
  WHERE n.status = 'published' AND n.published_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now')`; // las programadas, aún no

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

function sitemap(rows: NewsRow[]): string {
  const url = (loc: string, lastmod?: string | null, extra = "") =>
    `<url><loc>${xmlEsc(`${siteUrl()}${loc}`)}</loc>${lastmod ? `<lastmod>${xmlEsc(lastmod)}</lastmod>` : ""}${extra}</url>`;
  const newest = rows.map((r) => r.updated_at).sort().at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`
    + url("/") + url("/noticias", newest) + url("/eventos") + url("/requisitos-viaje") + url("/e-ticket") + url("/privacidad") + url("/terminos") + url("/contacto")
    + rows.map((n) => url(`/noticias/${n.slug}`, n.updated_at || n.published_at,
      n.cover_url ? `<image:image><image:loc>${xmlEsc(absolute(n.cover_url))}</image:loc></image:image>` : "")).join("")
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
    return { status: 200, raw: enc(sitemap(await listNews(db))), headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": HTML_CACHE["Cache-Control"] } };
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
  + "gastronomía, naturaleza, infraestructura y avisos al viajero) y guía de sus provincias y destinos.";

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

function llmsTxt(rows: NewsRow[]): string {
  const items = rows.map((n) => `- [${n.title}](${siteUrl()}/noticias/${n.slug}.md): ${newsDescription(n)}`).join("\n");
  return `# ${SITE_NAME}\n\n> ${SITE_SUMMARY}\n\n`
    + "Contenido en español de República Dominicana. Cada noticia tiene una versión en Markdown (enlaces de abajo) "
    + `y una página web en ${siteUrl()}/noticias/<slug>. Los datos estructurados de cada página siguen schema.org (NewsArticle).\n\n`
    + `## Noticias\n\n${items || "- Todavía no hay noticias publicadas."}\n\n`
    + `## Guías\n\n- [E-Ticket de República Dominicana: guía del nuevo portal](${siteUrl()}/e-ticket.md): cómo hacer gratis el formulario de entrada y salida en eticket.gob.do.\n\n`
    + `## Opcional\n\n- [Todas las noticias en un solo archivo](${siteUrl()}/llms-full.txt)\n`
    + `- [Listado de noticias](${siteUrl()}/noticias)\n- [Feed RSS](${siteUrl()}/noticias/rss.xml)\n- [Sitemap](${siteUrl()}/sitemap.xml)\n`;
}

const TEXT_HEADERS = (type: string) => ({ "Content-Type": `${type}; charset=utf-8`, "Cache-Control": HTML_CACHE["Cache-Control"], "X-Robots-Tag": "noindex" });

async function llmRoute(db: Client, path: string): Promise<ApiResponse | null> {
  const enc = (text: string) => new TextEncoder().encode(text);
  if (path === "/llms.txt") return { status: 200, raw: enc(llmsTxt(await listNews(db))), headers: TEXT_HEADERS("text/plain") };
  if (path === "/llms-full.txt") {
    const rows = (await listNews(db)).slice(0, 100);
    const text = `# ${SITE_NAME}: noticias completas\n\n> ${SITE_SUMMARY}\n\n${rows.map(newsMarkdown).join("\n---\n\n")}`;
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
               + (SELECT COUNT(*) FROM contact_messages WHERE ip_hash = ? AND created_at > ?) AS n`,
    args: [hash, since, hash, since, hash, since],
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

async function submitEstablishment(db: Client, body: Fields, hash: string | null): Promise<ApiResponse> {
  const email = emailOf(body);
  if (email instanceof Error) return err(422, email.message);
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
  const details = body.details && typeof body.details === "object" ? JSON.stringify(body.details) : null;
  if (details && details.length > 20_000) return err(422, "Los detalles del negocio son demasiado extensos");
  if (await tooManySubmissions(db, hash)) return err(429, "Demasiados envíos. Inténtalo más tarde.");
  const id = randomUUID();
  const cols = Object.keys(values);
  await db.execute({
    sql: `INSERT INTO establishment_requests (id, email, details, ip_hash, ${cols.join(", ")}) VALUES (?, ?, ?, ?, ${cols.map(() => "?").join(", ")})`,
    args: [id, email, details, hash, ...Object.values(values)],
  });
  return { status: 201, body: { data: { id, status: "pending" } } };
}

/** Panel (solo admin): participantes del sorteo y solicitudes de negocios. Sin ip_hash. */
type FormResource = "leads" | "establishment-requests" | "contact-messages";
async function formsAdmin(db: Client, resource: FormResource, method: string, id: string | undefined, body: Fields): Promise<ApiResponse> {
  const table = resource.replace("-", "_");
  const cols = resource === "leads"
    ? "id, name, email, interest, message, source, created_at"
    : resource === "contact-messages" ? "id, name, email, subject, message, created_at"
    : "id, type, name, contact_name, email, phone, address, province, website, photo_url, description, rnc, schedule, details, status, created_at, updated_at";
  if (method === "GET" && !id) return { status: 200, body: { data: (await db.execute(`SELECT ${cols} FROM ${table} ORDER BY created_at DESC LIMIT 2000`)).rows } };
  if (!id) return err(405, "Método no permitido");
  if (method === "DELETE") {
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

// ---------- router ----------
export async function handle(req: ApiRequest, db: Client, secret: string, secureCookies = true, loadShell: ShellLoader = fetchShell, translate: Translator = defaultTranslator): Promise<ApiResponse> {
  const lang = isLang(req.lang) ? req.lang : undefined;
  const path = req.path.replace(/^\/api\/v1/, "").replace(/\/+$/, "") || "/";
  const body = (req.body && typeof req.body === "object" ? req.body : {}) as Fields;
  const m = req.method.toUpperCase();

  if (path === "/health") return { status: 200, body: { data: { ok: true } } };
  if (m === "GET" && path.startsWith("/public/")) return (await publicApi(db, path, lang)) ?? err(404, "Ruta no encontrada");
  const media = m === "GET" && path.match(/^\/media\/([^/]+)\.webp$/); // el id se valida en serveMedia
  if (media) return serveMedia(db, media[1]);
  if (m === "GET") {
    const seo = (await seoRoute(db, path, req.headers["x-forwarded-host"] ?? req.headers.host, loadShell, lang)) ?? (await llmRoute(db, path));
    if (seo) return seo;
  }
  // La landing pide el catálogo de anuncios del backend completo; staging no tiene anuncios.
  if (m === "GET" && path === "/ads/catalog") return { status: 200, body: { data: [] }, headers: PUBLIC_CACHE };

  if (m === "POST" && path === "/leads") return submitLead(db, body, ipHash(req.ip, secret));
  if (m === "POST" && path === "/contact") return submitContact(db, body, ipHash(req.ip, secret));
  if (m === "POST" && path === "/establishments/register") return submitEstablishment(db, body, ipHash(req.ip, secret));

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

  const match = path.match(/^\/admin\/(provinces|news|news-categories)(?:\/([A-Za-z0-9-]+))?$/);
  if (match && m !== "GET" && !manager) {
    if (match[1] !== "news") return err(403, "Solo un editor o administrador modifica provincias y categorías");
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
