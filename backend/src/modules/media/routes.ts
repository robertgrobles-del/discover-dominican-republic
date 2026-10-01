import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { assertPublicUrl } from "../../lib/public-url.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import { audit } from "../../lib/audit.js";
import { readImage, sniffMime, type ImageMime } from "./images.js";
import type { Scanner } from "./antivirus.js";
import { processImage, VARIANTS, type Processed, type VariantName } from "./process.js";

const MB = 1024 * 1024;
export const PURPOSES = { avatar: 2 * MB, review_photo: 5 * MB, ugc: 8 * MB, listing_image: 8 * MB, cms: 10 * MB } as const;
type Purpose = keyof typeof PURPOSES;
const MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MIN_SIDE = 16, MAX_SIDE = 12_000, MAX_PIXELS = 60_000_000;
const UPLOAD_TTL_SECONDS = 15 * 60;
/** Estas finalidades pasan por moderación antes de mostrarse, salvo que las suba el equipo. */
const MODERATED = new Set<Purpose>(["review_photo", "ugc"]);
const STAFF = ["admin", "editor", "moderator"];

export interface MediaStorage {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}
/** Disco local (desarrollo y despliegues de un solo servidor). Un almacenamiento S3 implementa la misma interfaz. */
export class LocalStorage implements MediaStorage {
  constructor(private readonly dir: string) {}
  private file(key: string) {
    if (!/^[0-9a-f-]{36}(-(thumb|medium|large))?$/.test(key)) throw new Error("Clave de almacenamiento inválida"); // impide rutas con "../"
    return path.join(this.dir, key);
  }
  async put(key: string, data: Buffer) { await mkdir(this.dir, { recursive: true }); await writeFile(this.file(key), data); }
  async get(key: string) { const f = this.file(key); try { return await readFile(f); } catch { return null; } }
  async delete(key: string) { await rm(this.file(key), { force: true }); }
}

export type Fetcher = (url: string) => Promise<{ status: number; contentType: string | null; body: Buffer }>;
const defaultFetcher: Fetcher = async (url) => {
  await assertPublicUrl(url);
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000), headers: { accept: "image/*" } });
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > PURPOSES.cms) throw AppError.validation("El archivo supera el tamaño permitido");
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length > PURPOSES.cms) throw AppError.validation("El archivo supera el tamaño permitido");
  return { status: res.status, contentType: res.headers.get("content-type"), body };
};

declare module "fastify" { interface FastifyInstance { mediaFetcher: { fn: Fetcher }; mediaStorage: MediaStorage; scanner: Scanner } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
type StoredVariant = { key: string; width: number; height: number; size: number; mime: string };
const asset = (r: Record<string, unknown>, base: string) => {
  const stored = (r.variants ?? {}) as Partial<Record<VariantName, StoredVariant>>;
  const url = `${base}/${r.id}`;
  return {
    id: r.id, purpose: r.purpose, status: r.status, mime: r.mime, width: r.width, height: r.height, size: r.size, alt: r.alt, credit: r.credit, created_at: r.created_at,
    // Cada variante que no existe (imagen más pequeña que ese ancho) apunta al original: el cliente puede pedir siempre la que quiera.
    ...(r.status === "ready" ? {
      url,
      variants: { original: url, ...Object.fromEntries((Object.keys(VARIANTS) as VariantName[]).map((n) => [n, stored[n] ? `${url}?variant=${n}` : url])) },
      variant_sizes: Object.fromEntries(Object.entries(stored).map(([n, v]) => [n, { width: v!.width, height: v!.height }])),
    } : {}),
  };
};

/** Guarda el original saneado y sus variantes; devuelve lo que se anota en la base. */
async function storeProcessed(storage: MediaStorage, id: string, p: Processed) {
  await storage.put(id, p.original.data);
  const variants: Record<string, StoredVariant> = {};
  for (const v of p.variants) {
    const key = `${id}-${v.name}`;
    await storage.put(key, v.data);
    variants[v.name] = { key, width: v.width, height: v.height, size: v.data.length, mime: v.mime };
  }
  return variants;
}
export const deleteFiles = async (storage: MediaStorage, key: string | null, variants: unknown) => {
  if (key) await storage.delete(key).catch(() => undefined);
  for (const v of Object.values((variants ?? {}) as Record<string, StoredVariant>)) await storage.delete(v.key).catch(() => undefined);
};

/** Archivos y medios (docs §5.16): subida con URL firmada, validación del archivo real, moderación e importación desde una URL. */
export async function mediaRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const secret = app.env.APP_SECRET!;
  const storage = app.mediaStorage;
  const base = `${app.env.PUBLIC_BASE_URL}/api/v1/media/files`;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const isStaff = (req: FastifyRequest) => !!req.user?.roles.some((x) => STAFF.includes(x));
  const tag = ["medios"];

  // El binario llega crudo (no JSON): este parser sólo existe dentro de este plugin.
  app.addContentTypeParser([...MIMES], { parseAs: "buffer", bodyLimit: 12 * MB }, (_req, body, done) => done(null, body));

  const sign = (id: string, exp: number, mime: string, size: number) => createHmac("sha256", secret).update(`media:${id}:${exp}:${mime}:${size}`).digest("base64url");

  r.post("/media/upload-url", {
    onRequest: app.authenticate, config: rl(60, "1 hour"),
    schema: { tags: tag, summary: "Pide una URL firmada para subir una imagen (PUT directo con el binario)", security: bearer, body: z.object({ mime: z.enum(MIMES), size: z.number().int().min(1).max(12 * MB), purpose: z.enum(Object.keys(PURPOSES) as [Purpose, ...Purpose[]]), alt: z.string().trim().max(200).optional(), credit: z.string().trim().max(200).optional() }), response: { 201: ok } },
  }, async (req, reply) => {
    const b = req.body;
    if (b.size > PURPOSES[b.purpose]) throw new AppError("BUSINESS_RULE", `Para "${b.purpose}" el máximo es ${PURPOSES[b.purpose] / MB} MB`, { code: "FILE_TOO_LARGE", max_bytes: PURPOSES[b.purpose] });
    if (["listing_image", "cms"].includes(b.purpose) && !req.user!.roles.some((x) => [...STAFF, "partner"].includes(x)) && !(await db.query("SELECT 1 FROM org_members WHERE user_id = $1", [req.user!.id])).rowCount) throw new AppError("FORBIDDEN", "Tu cuenta no puede subir ese tipo de imagen");
    const open = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM media_assets WHERE owner_id = $1 AND status = 'pending' AND created_at > now() - interval '1 day'", [req.user!.id])).rows[0]!.n;
    if (open >= 50) throw new AppError("RATE_LIMITED", "Tienes demasiadas subidas sin completar; termínalas o espera", { code: "TOO_MANY_PENDING" });
    const row = (await db.query<{ id: string }>("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, alt, credit) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [req.user!.id, b.purpose, b.mime, b.size, b.alt ?? null, b.credit ?? null])).rows[0]!;
    const exp = Math.floor(Date.now() / 1000) + UPLOAD_TTL_SECONDS;
    reply.code(201);
    return { data: { asset_id: row.id, upload: { method: "PUT", url: `/api/v1/media/${row.id}/upload?exp=${exp}&sig=${sign(row.id, exp, b.mime, b.size)}`, headers: { "content-type": b.mime }, expires_in: UPLOAD_TTL_SECONDS, max_bytes: PURPOSES[b.purpose] } } };
  });

  r.put("/media/:id/upload", {
    bodyLimit: 12 * MB, config: rl(120, "1 hour"),
    schema: { tags: tag, summary: "Sube el binario a la URL firmada (sin sesión: la firma lo autoriza)", params: uuid, querystring: z.object({ exp: z.coerce.number().int(), sig: z.string().max(100) }), response: { 204: z.null() } },
  }, async (req, reply) => {
    const a = (await db.query<{ mime: string; declared_size: number; status: string }>("SELECT mime, declared_size, status FROM media_assets WHERE id = $1", [req.params.id])).rows[0];
    if (!a) throw AppError.notFound("Archivo");
    const good = Buffer.from(sign(req.params.id, req.query.exp, a.mime, a.declared_size)), got = Buffer.from(req.query.sig);
    if (good.length !== got.length || !timingSafeEqual(good, got)) throw new AppError("FORBIDDEN", "La URL de subida no es válida");
    if (req.query.exp < Date.now() / 1000) throw new AppError("FORBIDDEN", "La URL de subida venció; pide otra", { code: "UPLOAD_URL_EXPIRED" });
    if (a.status !== "pending") throw new AppError("CONFLICT", "Este archivo ya se subió", { reason: "ALREADY_UPLOADED" });
    if (req.headers["content-type"]?.split(";")[0]!.trim() !== a.mime) throw AppError.validation("El tipo de contenido no coincide con el declarado");
    const body = req.body as Buffer;
    if (!Buffer.isBuffer(body) || body.length !== a.declared_size) throw AppError.validation("El tamaño no coincide con el declarado", { declared: a.declared_size, received: Buffer.isBuffer(body) ? body.length : 0 });
    await storage.put(req.params.id, body);
    await db.query("UPDATE media_assets SET status = 'uploaded', storage_key = $2, size = $3, sha256 = $4 WHERE id = $1 AND status = 'pending'", [req.params.id, req.params.id, body.length, createHash("sha256").update(body).digest("hex")]);
    reply.code(204);
    return null;
  });

  const reject = async (id: string, why: string, code: string): Promise<never> => {
    await storage.delete(id);
    await db.query("UPDATE media_assets SET status = 'rejected', moderation_note = $2 WHERE id = $1", [id, why]);
    throw new AppError("BUSINESS_RULE", why, { code });
  };

  r.post("/media/:id/complete", { onRequest: app.authenticate, config: rl(120, "1 hour"), schema: { tags: tag, summary: "Confirma la subida: se valida el archivo real (formato, tamaño y dimensiones)", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const a = (await db.query<{ owner_id: string | null; purpose: Purpose; mime: ImageMime; status: string; declared_size: number }>("SELECT owner_id, purpose, mime, status, declared_size FROM media_assets WHERE id = $1", [req.params.id])).rows[0];
    if (!a || (a.owner_id !== req.user!.id && !isStaff(req))) throw AppError.notFound("Archivo");
    if (a.status === "ready" || a.status === "in_review") return { data: asset((await db.query("SELECT * FROM media_assets WHERE id = $1", [req.params.id])).rows[0], base) };
    if (a.status !== "uploaded") throw new AppError("BUSINESS_RULE", a.status === "pending" ? "Todavía no se subió el archivo" : "Este archivo fue rechazado", { code: "INVALID_STATE" });
    const buf = await storage.get(req.params.id);
    if (!buf || buf.length !== a.declared_size) return reject(req.params.id, "El archivo no se guardó completo", "INCOMPLETE_UPLOAD");
    // Antivirus antes de interpretar nada del archivo. Si el análisis no responde lanza 503 y el archivo sigue "subido": se reintenta con el mismo `complete`.
    const scan = await app.scanner.scan(buf);
    if (!scan.clean) {
      await db.query("UPDATE media_assets SET scan_status = 'infected', scanned_at = now() WHERE id = $1", [req.params.id]);
      await audit(db, { actor: req.user!.id, action: "media.malware_detected", entity: "media", id: req.params.id, meta: { signature: scan.signature }, ip: req.ip });
      return reject(req.params.id, "El archivo fue rechazado por seguridad", "MALWARE_DETECTED");
    }
    await db.query("UPDATE media_assets SET scan_status = $2, scanned_at = now() WHERE id = $1", [req.params.id, app.scanner.name === "none" ? "skipped" : "clean"]);
    const img = readImage(buf);
    if (!img) return reject(req.params.id, "El archivo no es una imagen válida", "NOT_AN_IMAGE");
    if (img.mime !== a.mime || sniffMime(buf) !== a.mime) return reject(req.params.id, "El contenido no coincide con el tipo declarado", "MIME_MISMATCH");
    if (img.width < MIN_SIDE || img.height < MIN_SIDE) return reject(req.params.id, `La imagen es demasiado pequeña (mínimo ${MIN_SIDE} px por lado)`, "IMAGE_TOO_SMALL");
    if (img.width > MAX_SIDE || img.height > MAX_SIDE || img.width * img.height > MAX_PIXELS) return reject(req.params.id, "La imagen tiene demasiados píxeles", "IMAGE_TOO_LARGE");
    let processed: Processed;
    try { processed = await processImage(buf, a.mime); }
    catch { return reject(req.params.id, "El archivo de imagen está dañado o no se puede procesar", "IMAGE_CORRUPT"); }
    const variants = await storeProcessed(storage, req.params.id, processed);   // reemplaza el original por su versión sin metadatos
    const status = MODERATED.has(a.purpose) && !isStaff(req) ? "in_review" : "ready";
    const row = (await db.query("UPDATE media_assets SET status = $2, width = $3, height = $4, size = $5, sha256 = $6, variants = $7, sanitized = $8, completed_at = now() WHERE id = $1 RETURNING *", [req.params.id, status, processed.original.width, processed.original.height, processed.original.data.length, createHash("sha256").update(processed.original.data).digest("hex"), JSON.stringify(variants), processed.sanitized])).rows[0];
    return { data: asset(row, base) };
  });

  const visible = async (id: string, req: FastifyRequest) => {
    const a = (await db.query("SELECT * FROM media_assets WHERE id = $1", [id])).rows[0];
    if (!a) return null;
    if (a.status === "ready" || (a.owner_id && a.owner_id === req.user?.id) || isStaff(req)) return a;
    return null;
  };

  r.get("/media/files/:id", { onRequest: optionalUser, schema: { tags: tag, summary: "El archivo (inmutable y cacheable una vez aprobado). `?variant=thumb|medium|large` sirve una versión reducida en webp; si no existe, el original", params: uuid, querystring: z.object({ variant: z.enum(["original", "thumb", "medium", "large"]).optional() }) } }, async (req, reply) => {
    const a = await visible(req.params.id, req);
    const v = req.query.variant && req.query.variant !== "original" ? (a?.variants as Partial<Record<VariantName, StoredVariant>> | undefined)?.[req.query.variant] : undefined;
    const buf = a && (v ? await storage.get(v.key) : a.storage_key ? await storage.get(a.storage_key) : null);
    if (!a || !buf) throw AppError.notFound("Archivo");
    reply.header("content-type", v ? v.mime : a.mime).header("x-content-type-options", "nosniff").header("content-disposition", "inline").header("content-security-policy", "default-src 'none'; sandbox")
      .header("cache-control", a.status === "ready" ? "public, max-age=31536000, immutable" : "private, no-store").header("content-length", String(buf.length));
    return reply.send(buf);
  });

  r.get("/media/:id", { onRequest: optionalUser, schema: { tags: tag, summary: "Metadatos y URLs (público si está aprobado; si no, sólo el dueño o el equipo)", security: [{}, ...bearer], params: uuid, response: { 200: ok } } }, async (req) => {
    const a = await visible(req.params.id, req);
    if (!a) throw AppError.notFound("Archivo");
    return { data: asset(a, base) };
  });

  r.delete("/media/:id", { onRequest: app.authenticate, schema: { tags: tag, summary: "Elimina un archivo (dueño o admin)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const a = (await db.query<{ owner_id: string | null; storage_key: string | null; variants: unknown }>("SELECT owner_id, storage_key, variants FROM media_assets WHERE id = $1", [req.params.id])).rows[0];
    if (!a || (a.owner_id !== req.user!.id && !req.user!.roles.includes("admin"))) throw AppError.notFound("Archivo");
    await deleteFiles(storage, a.storage_key, a.variants);
    await db.query("DELETE FROM media_assets WHERE id = $1", [req.params.id]);
    if (a.owner_id !== req.user!.id) await audit(db, { actor: req.user!.id, action: "media.deleted", entity: "media", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---------- Administración ----------
  const editor = app.requireRole("admin", "editor");
  const mod = app.requireRole("admin", "moderator");
  r.get("/admin/media", { onRequest: editor, schema: { tags: ["admin"], summary: "Biblioteca de medios", security: bearer, querystring: z.object({ q: z.string().trim().max(100).optional(), purpose: z.enum(Object.keys(PURPOSES) as [Purpose, ...Purpose[]]).optional(), status: z.enum(["pending", "uploaded", "ready", "in_review", "rejected"]).optional(), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(48) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const q = req.query;
    const p = [q.q ? `%${q.q.replace(/[\\%_]/g, "\\$&")}%` : null, q.purpose ?? null, q.status ?? null];
    const w = "($1::text IS NULL OR alt ILIKE $1 OR credit ILIKE $1 OR source_url ILIKE $1) AND ($2::text IS NULL OR purpose = $2) AND ($3::text IS NULL OR status = $3)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM media_assets WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT * FROM media_assets WHERE ${w} ORDER BY created_at DESC LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, p);
    return { data: rows.map((x) => ({ ...asset(x, base), owner_id: x.owner_id, source_url: x.source_url, moderation_note: x.moderation_note })), meta: pageMeta(q.page, q.per_page, total) };
  });

  r.post("/admin/media/:id/moderate", { onRequest: mod, schema: { tags: ["admin"], summary: "Aprueba o rechaza una imagen de usuario", security: bearer, params: uuid, body: z.object({ action: z.enum(["approve", "reject"]), reason: z.string().trim().max(300).optional() }), response: { 200: ok } } }, async (req) => {
    const a = (await db.query<{ status: string; storage_key: string | null; variants: unknown }>("SELECT status, storage_key, variants FROM media_assets WHERE id = $1", [req.params.id])).rows[0];
    if (!a) throw AppError.notFound("Archivo");
    if (a.status !== "in_review") throw new AppError("BUSINESS_RULE", "Sólo se moderan las imágenes en revisión", { code: "INVALID_STATE" });
    if (req.body.action === "reject" && !req.body.reason) throw AppError.validation("Indica el motivo del rechazo");
    if (req.body.action === "reject") await deleteFiles(storage, a.storage_key, a.variants);
    const row = (await db.query("UPDATE media_assets SET status = $2, moderation_note = $3 WHERE id = $1 RETURNING *", [req.params.id, req.body.action === "approve" ? "ready" : "rejected", req.body.reason ?? null])).rows[0];
    await audit(db, { actor: req.user!.id, action: `media.${req.body.action}`, entity: "media", id: req.params.id, meta: { reason: req.body.reason }, ip: req.ip });
    return { data: asset(row, base) };
  });

  r.post("/admin/media/import-url", {
    onRequest: editor, config: rl(30, "1 hour"),
    schema: { tags: ["admin"], summary: "Descarga una imagen de una URL https pública a nuestro almacenamiento", security: bearer, body: z.object({ url: z.string().url().max(1000), alt: z.string().trim().max(200).optional(), credit: z.string().trim().max(200).optional() }), response: { 201: ok } },
  }, async (req, reply) => {
    let res;
    try { res = await app.mediaFetcher.fn(req.body.url); } catch (e) { if (e instanceof AppError) throw e; throw new AppError("UPSTREAM_ERROR", "No se pudo descargar la imagen", { reason: (e as Error).message.slice(0, 120) }); }
    if (res.status !== 200) throw new AppError("UPSTREAM_ERROR", `El sitio respondió ${res.status}`);
    if (res.body.length > PURPOSES.cms) throw AppError.validation("El archivo supera el tamaño permitido");
    const scan = await app.scanner.scan(res.body);
    if (!scan.clean) { await audit(db, { actor: req.user!.id, action: "media.malware_detected", entity: "media", id: null, meta: { signature: scan.signature, url: req.body.url }, ip: req.ip }); throw new AppError("BUSINESS_RULE", "El archivo fue rechazado por seguridad", { code: "MALWARE_DETECTED" }); }
    const img = readImage(res.body);
    if (!img) throw AppError.validation("La URL no apunta a una imagen válida (jpeg, png, webp o gif)");
    if (img.width < MIN_SIDE || img.height < MIN_SIDE || img.width > MAX_SIDE || img.height > MAX_SIDE || img.width * img.height > MAX_PIXELS) throw AppError.validation("Las dimensiones de la imagen no son válidas");
    let processed: Processed;
    try { processed = await processImage(res.body, img.mime); } catch { throw AppError.validation("La imagen está dañada o no se puede procesar"); }
    const row = (await db.query<{ id: string }>(
      "INSERT INTO media_assets (owner_id, purpose, mime, declared_size, size, width, height, alt, credit, sha256, source_url, status, completed_at, sanitized) VALUES ($1,'cms',$2,$3,$4,$5,$6,$7,$8,$9,$10,'ready',now(),$11) RETURNING id",
      [req.user!.id, img.mime, res.body.length, processed.original.data.length, processed.original.width, processed.original.height, req.body.alt ?? null, req.body.credit ?? new URL(req.body.url).hostname, createHash("sha256").update(processed.original.data).digest("hex"), req.body.url, processed.sanitized],
    )).rows[0]!;
    const variants = await storeProcessed(storage, row.id, processed);
    await db.query("UPDATE media_assets SET storage_key = $1, variants = $2 WHERE id = $1", [row.id, JSON.stringify(variants)]);
    await audit(db, { actor: req.user!.id, action: "media.imported", entity: "media", id: row.id, meta: { url: req.body.url }, ip: req.ip });
    reply.code(201);
    return { data: asset((await db.query("SELECT * FROM media_assets WHERE id = $1", [row.id])).rows[0], base) };
  });
}

export function registerMediaJobs(app: FastifyInstance, runner: JobRegistrar) {
  runner.register({
    name: "media.cleanup", description: "Elimina subidas sin completar de más de 24 h", everySeconds: 86_400,
    run: async () => {
      const { rows } = await app.db.query<{ id: string; storage_key: string | null }>("DELETE FROM media_assets WHERE status IN ('pending', 'uploaded') AND created_at < now() - interval '24 hours' RETURNING id, storage_key");
      for (const x of rows) if (x.storage_key) await app.mediaStorage.delete(x.storage_key).catch(() => undefined);
      return { deleted: rows.length };
    },
  });
}

export { defaultFetcher };
