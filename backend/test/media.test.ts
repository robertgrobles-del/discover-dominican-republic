import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readImage, sniffMime } from "../src/modules/media/images.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `md${Date.now().toString(36)}${n++}@test.local`;

const mk = (w: number, h: number, fmt: "png" | "jpeg" | "webp" | "gif") => sharp({ create: { width: w, height: h, channels: 3, background: { r: 11, g: 92, b: 171 } } })[fmt]().toBuffer();
/** Imágenes reales (el servidor las decodifica y recodifica). */
const REAL = { png: await mk(320, 200, "png"), jpeg: await mk(640, 480, "jpeg"), jpegBig: await mk(1024, 768, "jpeg"), webp: await mk(800, 600, "webp"), gif: await mk(100, 50, "gif") };
// Cabeceras mínimas: sólo para lo que se rechaza antes de decodificar (tamaño, dimensiones o formato falso).
const png = (w = 320, h = 200, pad = 64) => {
  if (w === 320 && h === 200) return REAL.png;
  const b = Buffer.alloc(33 + pad);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8); b.write("IHDR", 12, "ascii"); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); b[24] = 8; b[25] = 2;
  return b;
};
const jpeg = (w = 640, h = 480, pad = 32) => {
  if (w === 640 && h === 480) return REAL.jpeg;
  if (w === 1024 && h === 768) return REAL.jpegBig;
  const b = Buffer.alloc(20 + pad);
  b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[3] = 0xe0; b.writeUInt16BE(4, 4); // APP0 vacío
  b[8] = 0xff; b[9] = 0xc0; b.writeUInt16BE(11, 10); b[12] = 8; b.writeUInt16BE(h, 13); b.writeUInt16BE(w, 15);
  return b;
};
const webpX = (w = 800, h = 600) => {
  if (w === 800 && h === 600) return REAL.webp;
  const b = Buffer.alloc(40);
  b.write("RIFF", 0, "ascii"); b.writeUInt32LE(32, 4); b.write("WEBP", 8, "ascii"); b.write("VP8X", 12, "ascii"); b.writeUInt32LE(10, 16);
  b.writeUIntLE(w - 1, 24, 3); b.writeUIntLE(h - 1, 27, 3);
  return b;
};
const gif = (w = 100, h = 50) => { if (w === 100 && h === 50) return REAL.gif; const b = Buffer.alloc(20); b.write("GIF89a", 0, "ascii"); b.writeUInt16LE(w, 6); b.writeUInt16LE(h, 8); return b; };

describe("lectura de imágenes", () => {
  it("detecta el formato por los bytes y lee las dimensiones de cada formato", () => {
    expect(readImage(png(320, 200))).toEqual({ mime: "image/png", width: 320, height: 200 });
    expect(readImage(jpeg(640, 480))).toEqual({ mime: "image/jpeg", width: 640, height: 480 });
    expect(readImage(webpX(800, 600))).toEqual({ mime: "image/webp", width: 800, height: 600 });
    expect(readImage(gif(100, 50))).toEqual({ mime: "image/gif", width: 100, height: 50 });
  });
  it("rechaza lo que no es imagen aunque lo pretenda", () => {
    for (const bad of [Buffer.from("<svg onload=alert(1)>"), Buffer.from("MZ\x90\x00 ejecutable"), Buffer.alloc(0), Buffer.from("%PDF-1.4"), Buffer.from([0x89, 0x50, 0x4e, 0x47])]) expect(readImage(bad)).toBeNull();
    expect(sniffMime(Buffer.from("GIF89a"))).toBe("image/gif");
    expect(sniffMime(Buffer.from("<html>"))).toBeNull();
  });
});

describe("medios", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let dir: string;
  let user: { token: string; id: string }, other: { token: string; id: string }, editor: { token: string; id: string }, moderator: { token: string; id: string }, admin: { token: string; id: string };

  const call = (method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: url.startsWith("/api") ? url : `/api/v1${url}`, payload: opts.payload as never, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };
  const ask = (token: string, over: object = {}) => call("POST", "/media/upload-url", { token, payload: { mime: "image/png", size: png().length, purpose: "avatar", ...over } });
  /** Flujo completo: URL firmada → PUT → complete. */
  const upload = async (who: { token: string }, file: Buffer, mime = "image/png", purpose = "avatar") => {
    const u = json(await ask(who.token, { mime, size: file.length, purpose })).data;
    const put = await call("PUT", u.upload.url, { payload: file, headers: { "content-type": mime } });
    const done = await call("POST", `/media/${u.asset_id}/complete`, { token: who.token });
    return { id: u.asset_id as string, url: u.upload.url as string, put, done };
  };

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "rd-media-"));
    app = await makeApp({ MEDIA_DIR: dir });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    user = await account(); other = await account(); editor = await account("editor"); moderator = await account("moderator"); admin = await account("admin");
  });
  afterAll(async () => { await pool.end(); await app.close(); rmSync(dir, { recursive: true, force: true }); });

  it("sube una imagen con URL firmada, la valida y la sirve inmutable y sin riesgo de ejecución", async () => {
    const file = png(320, 200);
    const up = await upload(user, file);
    expect(up.put.statusCode).toBe(204);
    expect(up.done.statusCode).toBe(200);
    const a = json(up.done).data;
    expect(a).toMatchObject({ status: "ready", mime: "image/png", width: 320, height: 200, purpose: "avatar" });
    expect(a.size).toBeGreaterThan(0);
    expect(a.url).toContain(`/api/v1/media/files/${up.id}`);
    const res = await call("GET", `/media/files/${up.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
    expect(res.headers["cache-control"]).toContain("immutable");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toContain("sandbox");
    expect(await sharp(res.rawPayload).metadata()).toMatchObject({ format: "png", width: 320, height: 200 });
    expect(json(await call("GET", `/media/${up.id}`)).data).toMatchObject({ id: up.id, status: "ready" });
    expect(json(await call("GET", `/media/${up.id}`)).data.variants.original).toContain(up.id);
  });

  it("acepta jpeg, webp y gif", async () => {
    for (const [file, mime, w, h] of [[jpeg(640, 480), "image/jpeg", 640, 480], [webpX(800, 600), "image/webp", 800, 600], [gif(100, 50), "image/gif", 100, 50]] as const) {
      const up = await upload(user, file, mime);
      expect(json(up.done).data, mime).toMatchObject({ status: "ready", mime, width: w, height: h });
    }
  });

  it("exige sesión para pedir la URL y valida tipo, tamaño y finalidad", async () => {
    expect((await call("POST", "/media/upload-url", { payload: { mime: "image/png", size: 100, purpose: "avatar" } })).statusCode).toBe(401);
    for (const bad of [{ mime: "image/svg+xml" }, { mime: "application/pdf" }, { size: 0 }, { size: 13 * 1024 * 1024 }, { purpose: "malware" }]) expect((await ask(user.token, bad)).statusCode, JSON.stringify(bad)).toBe(400);
    const big = await ask(user.token, { size: 3 * 1024 * 1024 }); // el avatar admite 2 MB
    expect(big.statusCode).toBe(422);
    expect(json(big).error.details).toMatchObject({ code: "FILE_TOO_LARGE", max_bytes: 2 * 1024 * 1024 });
    expect((await ask(user.token, { purpose: "listing_image" })).statusCode).toBe(403);
    expect((await ask(user.token, { purpose: "cms" })).statusCode).toBe(403);
    expect((await ask(editor.token, { purpose: "cms" })).statusCode).toBe(201);
  });

  it("la URL firmada no se puede falsificar, reutilizar, ni usar vencida o con otro contenido", async () => {
    const file = png();
    const u = json(await ask(user.token, { size: file.length })).data;
    const put = (url: string, body: Buffer = file, type = "image/png") => call("PUT", url, { payload: body, headers: { "content-type": type } });
    expect((await put(u.upload.url.replace(/sig=[^&]+/, "sig=aaaa"))).statusCode).toBe(403);
    const otherAsset = json(await ask(user.token, { size: file.length })).data;
    const swapped = otherAsset.upload.url.replace(otherAsset.asset_id, u.asset_id); // firma de otro archivo
    expect((await put(swapped)).statusCode).toBe(403);
    expect((await put(u.upload.url.replace(/exp=\d+/, "exp=1"))).statusCode).toBe(403);
    expect((await put(u.upload.url, file, "image/jpeg")).statusCode).toBe(400); // el tipo no coincide con el declarado
    expect((await put(u.upload.url, Buffer.concat([file, Buffer.from("x")]))).statusCode).toBe(400); // otro tamaño
    expect((await put(u.upload.url)).statusCode).toBe(204);
    expect((await put(u.upload.url)).statusCode).toBe(409); // ya subido
    expect((await put("/api/v1/media/99999999-9999-4999-8999-999999999999/upload?exp=9999999999&sig=x")).statusCode).toBe(404);
  });

  it("rechaza archivos que fingen ser imágenes o no coinciden con lo declarado", async () => {
    const cases: [string, Buffer, string, string][] = [
      ["texto disfrazado de png", Buffer.from("<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'></svg>" + " ".repeat(40)), "image/png", "NOT_AN_IMAGE"],
      ["jpeg declarado como png", jpeg(), "image/png", "MIME_MISMATCH"],
      ["demasiado pequeña", png(4, 4), "image/png", "IMAGE_TOO_SMALL"],
      ["demasiados píxeles", png(20_000, 20_000), "image/png", "IMAGE_TOO_LARGE"],
    ];
    for (const [name, file, mime, code] of cases) {
      const up = await upload(user, file, mime);
      expect(up.done.statusCode, name).toBe(422);
      expect(json(up.done).error.details.code, name).toBe(code);
      expect((await pool.query("SELECT status FROM media_assets WHERE id = $1", [up.id])).rows[0].status, name).toBe("rejected");
      expect((await call("GET", `/media/files/${up.id}`)).statusCode, name).toBe(404); // y el binario se borró
    }
  });

  it("completar antes de subir falla, y sólo el dueño (o el equipo) puede completar", async () => {
    const u = json(await ask(user.token)).data;
    expect((await call("POST", `/media/${u.asset_id}/complete`, { token: user.token })).statusCode).toBe(422);
    await call("PUT", u.upload.url, { payload: png(), headers: { "content-type": "image/png" } });
    expect((await call("POST", `/media/${u.asset_id}/complete`, { token: other.token })).statusCode).toBe(404);
    expect((await call("POST", `/media/${u.asset_id}/complete`, { token: user.token })).statusCode).toBe(200);
    expect((await call("POST", `/media/${u.asset_id}/complete`, { token: user.token })).statusCode).toBe(200); // idempotente
  });

  it("las fotos de usuarios (reseñas, UGC) esperan moderación y no son públicas hasta aprobarse", async () => {
    const up = await upload(user, png(), "image/png", "review_photo");
    expect(json(up.done).data.status).toBe("in_review");
    expect(json(up.done).data.url).toBeUndefined();
    expect((await call("GET", `/media/${up.id}`)).statusCode).toBe(404);
    expect((await call("GET", `/media/files/${up.id}`)).statusCode).toBe(404);
    expect((await call("GET", `/media/files/${up.id}`, { token: other.token })).statusCode).toBe(404);
    const mine = await call("GET", `/media/files/${up.id}`, { token: user.token });
    expect(mine.statusCode).toBe(200);
    expect(mine.headers["cache-control"]).toContain("no-store");
    expect((await call("POST", `/admin/media/${up.id}/moderate`, { token: user.token, payload: { action: "approve" } })).statusCode).toBe(403);
    expect((await call("POST", `/admin/media/${up.id}/moderate`, { token: editor.token, payload: { action: "approve" } })).statusCode).toBe(403); // el editor no modera fotos de usuarios
    expect(json(await call("POST", `/admin/media/${up.id}/moderate`, { token: moderator.token, payload: { action: "approve" } })).data.status).toBe("ready");
    expect((await call("GET", `/media/files/${up.id}`)).statusCode).toBe(200);
    expect((await call("POST", `/admin/media/${up.id}/moderate`, { token: moderator.token, payload: { action: "approve" } })).statusCode).toBe(422); // ya no está en revisión

    const bad = await upload(user, png(), "image/png", "ugc");
    expect((await call("POST", `/admin/media/${bad.id}/moderate`, { token: moderator.token, payload: { action: "reject" } })).statusCode).toBe(400); // sin motivo
    expect(json(await call("POST", `/admin/media/${bad.id}/moderate`, { token: moderator.token, payload: { action: "reject", reason: "Contenido inapropiado" } })).data.status).toBe("rejected");
    expect((await call("GET", `/media/files/${bad.id}`, { token: user.token })).statusCode).toBe(404); // el archivo se eliminó
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'media.reject' AND entity_id = $1", [bad.id])).rowCount).toBe(1);
  });

  it("las imágenes que sube el equipo se publican directo", async () => {
    const up = await upload(editor, png(), "image/png", "ugc");
    expect(json(up.done).data.status).toBe("ready");
  });

  it("sólo el dueño o un admin elimina, y se borra el binario", async () => {
    const up = await upload(user, png());
    expect((await call("DELETE", `/media/${up.id}`, { token: other.token })).statusCode).toBe(404);
    expect((await call("DELETE", `/media/${up.id}`)).statusCode).toBe(401);
    expect((await call("DELETE", `/media/${up.id}`, { token: user.token })).statusCode).toBe(204);
    expect((await call("GET", `/media/files/${up.id}`)).statusCode).toBe(404);
    const up2 = await upload(user, png());
    expect((await call("DELETE", `/media/${up2.id}`, { token: admin.token })).statusCode).toBe(204);
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'media.deleted' AND entity_id = $1", [up2.id])).rowCount).toBe(1);
  });

  it("la biblioteca del CMS filtra y sólo la ven admin y editor", async () => {
    expect((await call("GET", "/admin/media", { token: user.token })).statusCode).toBe(403);
    const lib = json(await call("GET", "/admin/media?purpose=avatar&status=ready&per_page=100", { token: editor.token }));
    expect(lib.data.length).toBeGreaterThan(0);
    expect(lib.data.every((m: { purpose: string; status: string }) => m.purpose === "avatar" && m.status === "ready")).toBe(true);
    expect((await call("GET", "/admin/media?status=inventado", { token: editor.token })).statusCode).toBe(400);
  });

  it("importa desde una URL pública validando el archivo real; nunca llega a redes internas", async () => {
    const file = jpeg(1024, 768, 200);
    app.mediaFetcher.fn = async () => ({ status: 200, contentType: "image/jpeg", body: file });
    const imp = await call("POST", "/admin/media/import-url", { token: editor.token, payload: { url: "https://images.example.com/foto.jpg", alt: "Playa" } });
    expect(imp.statusCode).toBe(201);
    expect(json(imp).data).toMatchObject({ status: "ready", mime: "image/jpeg", width: 1024, height: 768, purpose: "cms", credit: "images.example.com" });
    expect(await sharp((await call("GET", `/media/files/${json(imp).data.id}`)).rawPayload).metadata()).toMatchObject({ format: "jpeg", width: 1024, height: 768 });
    expect(json(imp).data.variants.thumb).toContain("?variant=thumb");
    expect(json(imp).data.variants.large).toBe(json(imp).data.variants.original);   // 1024 px < 1600: no se agranda
    expect((await call("POST", "/admin/media/import-url", { token: user.token, payload: { url: "https://images.example.com/foto.jpg" } })).statusCode).toBe(403);

    app.mediaFetcher.fn = async () => ({ status: 200, contentType: "image/png", body: Buffer.from("<html>no soy una imagen</html>") });
    expect((await call("POST", "/admin/media/import-url", { token: editor.token, payload: { url: "https://x.example.com/a.png" } })).statusCode).toBe(400);
    app.mediaFetcher.fn = async () => ({ status: 404, contentType: null, body: Buffer.alloc(0) });
    expect((await call("POST", "/admin/media/import-url", { token: editor.token, payload: { url: "https://x.example.com/a.png" } })).statusCode).toBe(502);
    app.mediaFetcher.fn = async () => { throw new Error("timeout"); };
    expect((await call("POST", "/admin/media/import-url", { token: editor.token, payload: { url: "https://x.example.com/a.png" } })).statusCode).toBe(502);

    const { defaultFetcher } = await import("../src/modules/media/routes.js");
    app.mediaFetcher.fn = defaultFetcher;
    for (const url of ["https://127.0.0.1/a.png", "https://169.254.169.254/latest/meta-data", "http://example.com/a.png", "https://localhost/a.png", "https://10.0.0.5/a.png"]) {
      expect((await call("POST", "/admin/media/import-url", { token: editor.token, payload: { url } })).statusCode, url).toBe(400);
    }
  });

  it("el trabajo de limpieza elimina subidas abandonadas de más de 24 h", async () => {
    const u = json(await ask(user.token)).data;
    await call("PUT", u.upload.url, { payload: png(), headers: { "content-type": "image/png" } });
    await pool.query("UPDATE media_assets SET created_at = now() - interval '2 days' WHERE id = $1", [u.asset_id]);
    const run = await app.jobs.runNow("media.cleanup");
    expect((run.result as { deleted: number }).deleted).toBeGreaterThanOrEqual(1);
    expect((await pool.query("SELECT 1 FROM media_assets WHERE id = $1", [u.asset_id])).rowCount).toBe(0);
    expect(await app.mediaStorage.get(u.asset_id)).toBeNull();
  });

  describe("variantes y saneado", () => {
    it("genera miniatura y mediana en webp sin agrandar nunca, y sirve la variante pedida", async () => {
      const big = await mk(2000, 1000, "jpeg");
      const up = await upload(editor, big, "image/jpeg", "cms");
      const a = json(up.done).data;
      expect(a).toMatchObject({ status: "ready", width: 2000, height: 1000 });
      expect(Object.keys(a.variant_sizes).sort()).toEqual(["large", "medium", "thumb"]);
      expect(a.variant_sizes.thumb).toEqual({ width: 320, height: 160 });
      expect(a.variants.thumb).toBe(`${a.url}?variant=thumb`);
      const thumb = await call("GET", `/media/files/${up.id}?variant=thumb`);
      expect(thumb.headers["content-type"]).toBe("image/webp");
      expect(thumb.headers["cache-control"]).toContain("immutable");
      expect(await sharp(thumb.rawPayload).metadata()).toMatchObject({ format: "webp", width: 320, height: 160 });
      expect(thumb.rawPayload.length).toBeLessThan(big.length);
      expect((await call("GET", `/media/files/${up.id}?variant=original`)).headers["content-type"]).toBe("image/jpeg");
      expect((await call("GET", `/media/files/${up.id}?variant=enorme`)).statusCode).toBe(400);
      // Una imagen chica no tiene variantes: todas apuntan al original y ?variant= devuelve el original.
      const small = await upload(user, png());
      const s = json(small.done).data;
      expect(s.variant_sizes).toEqual({});
      expect(s.variants.thumb).toBe(s.url);
      expect((await call("GET", `/media/files/${small.id}?variant=thumb`)).headers["content-type"]).toBe("image/png");
    });

    it("quita los metadatos (EXIF/GPS), aplica la orientación y marca el original como saneado", async () => {
      const marked = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: 200, g: 50, b: 50 } } }).jpeg().withExif({ IFD0: { ImageDescription: "MARCA-GPS-SECRETA-4242", Copyright: "Ana Pérez" } }).withMetadata({ orientation: 6 }).toBuffer();
      expect(marked.includes(Buffer.from("MARCA-GPS-SECRETA-4242"))).toBe(true);      // el archivo de origen sí la trae
      const up = await upload(user, marked, "image/jpeg", "review_photo");
      const a = json(up.done).data;
      expect(a.status).toBe("in_review");
      const served = await call("GET", `/media/files/${up.id}`, { token: user.token });
      expect(served.rawPayload.includes(Buffer.from("MARCA-GPS-SECRETA-4242"))).toBe(false);
      expect(served.rawPayload.includes(Buffer.from("Ana Pérez"))).toBe(false);
      const meta = await sharp(served.rawPayload).metadata();
      expect(meta.exif).toBeUndefined();
      expect(meta.orientation).toBeUndefined();
      expect(meta).toMatchObject({ width: 480, height: 640 });            // la rotación de la etiqueta pasó a los píxeles
      expect((await pool.query("SELECT sanitized, width, height FROM media_assets WHERE id = $1", [up.id])).rows[0]).toEqual({ sanitized: true, width: 480, height: 640 });
    });

    it("rechaza una imagen con cabecera válida pero cuerpo dañado, y el gif pasa sin recodificarse", async () => {
      const bad = Buffer.concat([REAL.png.subarray(0, 60), Buffer.alloc(400, 7)]);   // cabecera PNG correcta, datos basura
      const up = await upload(user, bad);
      expect(up.done.statusCode).toBe(422);
      expect(json(up.done).error.details.code).toBe("IMAGE_CORRUPT");
      expect(await app.mediaStorage.get(up.id)).toBeNull();
      const g = await upload(user, REAL.gif, "image/gif");
      expect(json(g.done).data).toMatchObject({ status: "ready", mime: "image/gif", width: 100, height: 50 });
      expect((await pool.query("SELECT sanitized FROM media_assets WHERE id = $1", [g.id])).rows[0].sanitized).toBe(false);
      expect((await app.mediaStorage.get(g.id))!.equals(REAL.gif)).toBe(true);
    });

    it("al eliminar o rechazar se borran también las variantes", async () => {
      const big = await mk(1800, 900, "png");
      const del = await upload(editor, big, "image/png", "cms");
      const keys = (await pool.query("SELECT variants FROM media_assets WHERE id = $1", [del.id])).rows[0].variants as Record<string, { key: string }>;
      expect(Object.keys(keys).length).toBe(3);
      for (const v of Object.values(keys)) expect(await app.mediaStorage.get(v.key)).not.toBeNull();
      expect((await call("DELETE", `/media/${del.id}`, { token: editor.token })).statusCode).toBe(204);
      for (const v of Object.values(keys)) expect(await app.mediaStorage.get(v.key)).toBeNull();
      expect(await app.mediaStorage.get(del.id)).toBeNull();

      const rej = await upload(user, await mk(1200, 800, "jpeg"), "image/jpeg", "ugc");
      const k2 = (await pool.query("SELECT variants FROM media_assets WHERE id = $1", [rej.id])).rows[0].variants as Record<string, { key: string }>;
      expect((await call("POST", `/admin/media/${rej.id}/moderate`, { token: moderator.token, payload: { action: "reject", reason: "Inapropiada" } })).statusCode).toBe(200);
      for (const v of Object.values(k2)) expect(await app.mediaStorage.get(v.key)).toBeNull();
    });

    it("las variantes de una imagen en revisión no son públicas", async () => {
      const up = await upload(user, await mk(1000, 700, "jpeg"), "image/jpeg", "ugc");
      expect(json(up.done).data.status).toBe("in_review");
      expect((await call("GET", `/media/files/${up.id}?variant=thumb`)).statusCode).toBe(404);
      expect((await call("GET", `/media/files/${up.id}?variant=thumb`, { token: user.token })).statusCode).toBe(200);
      await call("POST", `/admin/media/${up.id}/moderate`, { token: moderator.token, payload: { action: "approve" } });
      expect((await call("GET", `/media/files/${up.id}?variant=thumb`)).statusCode).toBe(200);
    });

    it("las claves de almacenamiento de variantes también están restringidas", async () => {
      const id = "11111111-1111-4111-8111-111111111111";
      await expect(app.mediaStorage.get(`${id}-thumb`)).resolves.toBeNull();
      await expect(app.mediaStorage.get(`${id}-../x`)).rejects.toThrow();
      await expect(app.mediaStorage.get(`${id}-evil`)).rejects.toThrow();
    });
  });

  it("la clave de almacenamiento no admite rutas con ../", async () => {
    await expect(app.mediaStorage.get("../../etc/passwd")).rejects.toThrow();
    await expect(app.mediaStorage.put("..%2f..", Buffer.from("x"))).rejects.toThrow();
  });
});
