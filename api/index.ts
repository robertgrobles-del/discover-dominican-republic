// Función de Vercel: recibe todo /api/v1/* (ver rewrites en vercel.json).
// Todo en un solo archivo a propósito: Vercel no resolvía el import de un módulo hermano (ERR_MODULE_NOT_FOUND).
import type { IncomingMessage, ServerResponse } from "node:http";
// Cliente web: habla con Turso por HTTP, sin el módulo nativo de SQLite que no hace falta en Vercel.
import { createClient, type Client, type InValue } from "@libsql/client/web";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

// Mini backend de staging (Turso/SQLite): acceso al panel, provincias y noticias.
// Responde con el mismo contrato que el backend completo para /auth/*, así el frontend no cambia.

export interface ApiRequest { method: string; path: string; headers: Record<string, string | undefined>; body: unknown; ip?: string }
/** body se envía como JSON; raw, tal cual (imágenes). */
export interface ApiResponse { status: number; body?: unknown; raw?: Uint8Array; headers?: Record<string, string> }

const ACCESS_TTL = 15 * 60;            // segundos
const REFRESH_TTL = 7 * 24 * 60 * 60;
const MAX_FAILED_LOGINS = 8;           // por correo en la ventana
const FAILED_WINDOW_MIN = 15;
const REFRESH_COOKIE = "drs_refresh";
const STAFF_ROLES = ["admin", "editor"];

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
});

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
  status: () => oneOf(b, "status", STATUSES, "draft"),
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
    // Una noticia ya publicada conserva su fecha al editarla; solo la estrena al publicarse.
    const prev = id ? (await db.execute({ sql: "SELECT published_at FROM news WHERE id = ?", args: [id] })).rows[0]?.published_at : null;
    values.published_at = values.status === "published" ? ((prev as string | null) ?? now()) : null;
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

// ---------- usuarios del panel (solo admin) ----------
const ROLES = ["admin", "editor"];
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

async function publicApi(db: Client, path: string): Promise<ApiResponse | null> {
  if (path === "/public/provinces") {
    const r = await db.execute(`SELECT id, slug, name, region, capital, short_description, description, image_url, latitude, longitude, updated_at
      FROM provinces WHERE status = 'published' ORDER BY name COLLATE NOCASE`);
    return { status: 200, body: { data: r.rows }, headers: PUBLIC_CACHE };
  }
  if (path === "/public/news") {
    const r = await db.execute(`SELECT n.id, n.slug, n.title, n.excerpt, n.body, n.cover_url, n.image_alt, n.image_credit, n.author, n.source_url,
        n.featured, n.published_at, p.name AS province_name, c.name AS category_name, c.slug AS category_slug
      FROM news n
      LEFT JOIN provinces p ON p.id = n.province_id AND p.status = 'published'
      LEFT JOIN news_categories c ON c.id = n.category_id
      WHERE n.status = 'published' ORDER BY n.featured DESC, n.published_at DESC LIMIT 50`);
    return { status: 200, body: { data: r.rows }, headers: PUBLIC_CACHE };
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

async function serveMedia(db: Client, id: string): Promise<ApiResponse> {
  if (!MEDIA_ID.test(id)) return err(404, "No encontrada");
  const row = (await db.execute({ sql: "SELECT bytes FROM media WHERE id = ?", args: [id] })).rows[0];
  if (!row) return err(404, "No encontrada");
  // Cada subida tiene un id nuevo: la imagen nunca cambia y se puede cachear un año.
  return { status: 200, raw: new Uint8Array(row.bytes as ArrayBuffer), headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } };
}

// ---------- router ----------
export async function handle(req: ApiRequest, db: Client, secret: string, secureCookies = true): Promise<ApiResponse> {
  const path = req.path.replace(/^\/api\/v1/, "").replace(/\/+$/, "") || "/";
  const body = (req.body && typeof req.body === "object" ? req.body : {}) as Fields;
  const m = req.method.toUpperCase();

  if (path === "/health") return { status: 200, body: { data: { ok: true } } };
  if (m === "GET" && path.startsWith("/public/")) return (await publicApi(db, path)) ?? err(404, "Ruta no encontrada");
  const media = m === "GET" && path.match(/^\/media\/([^/]+)\.webp$/); // el id se valida en serveMedia
  if (media) return serveMedia(db, media[1]);
  // La landing pide el catálogo de anuncios del backend completo; staging no tiene anuncios.
  if (m === "GET" && path === "/ads/catalog") return { status: 200, body: { data: [] }, headers: PUBLIC_CACHE };

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

  if (path === "/admin/media" && m === "POST") return uploadMedia(db, body, user.id);

  const match = path.match(/^\/admin\/(provinces|news|news-categories)(?:\/([A-Za-z0-9-]+))?$/);
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
      },
      db,
      secret,
    );
    for (const [k, v] of Object.entries(out.headers ?? {})) res.setHeader(k, v);
    if (out.raw) return void res.writeHead(out.status).end(Buffer.from(out.raw));
    if (out.body === undefined) return void res.writeHead(out.status).end();
    res.writeHead(out.status, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(out.body));
  } catch (e) {
    const status = (e as { status?: number }).status ?? (e instanceof SyntaxError ? 400 : 500);
    if (status === 500) console.error(e);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
      .end(JSON.stringify({ error: { message: status === 500 ? "Error interno" : (e as Error).message } }));
  }
}
