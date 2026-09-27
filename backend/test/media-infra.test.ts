import { createHash } from "node:crypto";
import http from "node:http";
import net from "node:net";
import type { AddressInfo } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { ClamdScanner } from "../src/modules/media/antivirus.js";
import { S3Storage, signV4 } from "../src/modules/media/storage-s3.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `mi${Date.now().toString(36)}${n++}@test.local`;
const EICAR = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
const listen = (s: http.Server | net.Server) => new Promise<number>((res) => s.listen(0, "127.0.0.1", () => res((s.address() as AddressInfo).port)));
const close = (s: http.Server | net.Server) => new Promise<void>((res) => { s.close(() => res()); (s as http.Server).closeAllConnections?.(); });

describe("firma AWS SigV4 (vectores oficiales de la documentación de AWS)", () => {
  const cred = { accessKey: "AKIAIOSFODNN7EXAMPLE", secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", region: "us-east-1", service: "s3", host: "examplebucket.s3.amazonaws.com", date: new Date("2013-05-24T00:00:00Z") };
  const EMPTY = createHash("sha256").update("").digest("hex");

  it("GET Object con encabezado Range", () => {
    const r = signV4({ ...cred, method: "GET", path: "/test.txt", headers: { range: "bytes=0-9" }, payloadHash: EMPTY });
    expect(r.signature).toBe("f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41");
    expect(r.headers.authorization).toContain("SignedHeaders=host;range;x-amz-content-sha256;x-amz-date");
  });
  it("PUT Object con contenido, fecha y clase de almacenamiento", () => {
    const body = "Welcome to Amazon S3.";
    const r = signV4({ ...cred, method: "PUT", path: "/test%24file.text", headers: { date: "Fri, 24 May 2013 00:00:00 GMT", "x-amz-storage-class": "REDUCED_REDUNDANCY" }, payloadHash: createHash("sha256").update(body).digest("hex") });
    expect(r.signature).toBe("98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd");
  });
  it("GET Bucket Lifecycle (parámetro de consulta sin valor)", () => {
    const r = signV4({ ...cred, method: "GET", path: "/", query: { lifecycle: "" }, payloadHash: EMPTY });
    expect(r.signature).toBe("fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a200a0136783543");
  });
  it("GET Bucket (List Objects) con varios parámetros ordenados", () => {
    const r = signV4({ ...cred, method: "GET", path: "/", query: { prefix: "J", "max-keys": "2" }, payloadHash: EMPTY });
    expect(r.signature).toBe("34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69dc6f7");
  });
});

/** S3 de mentira: verifica la firma de cada petición con la misma función y guarda los objetos en memoria. */
function fakeS3(secret: string, bucket: string) {
  const objects = new Map<string, Buffer>();
  const hosts: string[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      hosts.push(req.headers.host ?? "");
      const auth = req.headers.authorization ?? "";
      const claimed = req.headers["x-amz-content-sha256"];
      const actual = createHash("sha256").update(body).digest("hex");
      const signedNames = /SignedHeaders=([^,]+)/.exec(auth)?.[1]?.split(";") ?? [];
      const extra = Object.fromEntries(signedNames.filter((h) => !["host", "x-amz-content-sha256", "x-amz-date"].includes(h)).map((h) => [h, String(req.headers[h] ?? "")]));
      const date = String(req.headers["x-amz-date"] ?? "");
      const expected = signV4({ method: req.method!, host: req.headers.host!, path: req.url!.split("?")[0]!, headers: extra, payloadHash: actual, region: "us-east-1", service: "s3", accessKey: "AKIDTEST", secretKey: secret, date: new Date(date.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z")) });
      if (claimed !== actual || expected.headers.authorization !== auth) { res.writeHead(403).end("SignatureDoesNotMatch"); return; }
      const key = decodeURIComponent(req.url!.split("?")[0]!).replace(new RegExp(`^/${bucket}/`), "");
      if (req.method === "PUT") { objects.set(key, body); res.writeHead(200).end(); }
      else if (req.method === "GET") { const o = objects.get(key); o ? res.writeHead(200, { "content-length": o.length }).end(o) : res.writeHead(404).end("NoSuchKey"); }
      else if (req.method === "DELETE") { objects.delete(key); res.writeHead(204).end(); }
      else res.writeHead(405).end();
    });
  });
  return { server, objects, hosts };
}

describe("almacenamiento S3", () => {
  const ID = "11111111-1111-4111-8111-111111111111";
  let s3: ReturnType<typeof fakeS3>, port: number;
  const store = (over: object = {}) => new S3Storage({ endpoint: `http://127.0.0.1:${port}`, region: "us-east-1", bucket: "medios", accessKey: "AKIDTEST", secretKey: "secreto-de-prueba", prefix: "media/", pathStyle: true, ...over });
  beforeAll(async () => { s3 = fakeS3("secreto-de-prueba", "medios"); port = await listen(s3.server); });
  afterAll(async () => { await close(s3.server); });

  it("guarda, lee, sobrescribe y borra (binarios completos), con prefijo y firma válida", async () => {
    const s = store();
    const data = Buffer.from(Array.from({ length: 5000 }, (_, i) => i % 256));
    await s.put(ID, data);
    expect([...s3.objects.keys()]).toContain(`media/${ID}`);
    expect((await s.get(ID))!.equals(data)).toBe(true);
    await s.put(ID, Buffer.from("otro"));
    expect((await s.get(ID))!.toString()).toBe("otro");
    await s.put(`${ID}-thumb`, Buffer.from("t"));
    expect((await s.get(`${ID}-thumb`))!.toString()).toBe("t");
    await s.delete(ID);
    expect(await s.get(ID)).toBeNull();
    await s.delete(ID);                                                 // borrar lo que no existe no falla
  });

  it("rechaza claves que no son de archivo y firmas con otro secreto; estilo host con el bucket en el nombre", async () => {
    const s = store();
    await expect(s.get("../etc/passwd")).rejects.toThrow(/inválida/);
    await expect(s.put(`${ID}-evil`, Buffer.from("x"))).rejects.toThrow(/inválida/);
    await expect(store({ secretKey: "otro-secreto" }).put(ID, Buffer.from("x"))).rejects.toThrow(/403/);
    // Con pathStyle=false el bucket va en el host (aquí "medios.127.0.0.1" no resuelve: sólo se comprueba cómo se arma la URL).
    const host = (store({ pathStyle: false }) as unknown as { target(k: string): { host: string; path: string } }).target(`media/${ID}`);
    expect(host).toEqual({ host: `medios.127.0.0.1:${port}`, path: `/media/${ID}` });
  });
});

/** clamd de mentira: implementa INSTREAM y marca como infectado lo que contenga la cadena EICAR. */
function fakeClamd(opts: { reply?: string; silent?: boolean } = {}) {
  const seen = { commands: [] as string[], bytes: 0 };
  const server = net.createServer((sock) => {
    let buf = Buffer.alloc(0), started = false, payload = Buffer.alloc(0);
    sock.on("data", (d) => {
      buf = Buffer.concat([buf, d]);
      if (!started) {
        const i = buf.indexOf(0);
        if (i < 0) return;
        seen.commands.push(buf.subarray(0, i).toString());
        buf = buf.subarray(i + 1);
        started = true;
      }
      while (buf.length >= 4) {
        const len = buf.readUInt32BE(0);
        if (len === 0) {
          seen.bytes = payload.length;
          if (opts.silent) return;
          const found = payload.toString("latin1").includes("EICAR-STANDARD-ANTIVIRUS-TEST-FILE");
          sock.end(opts.reply ?? (found ? "stream: Win.Test.EICAR_HDB-1 FOUND\0" : "stream: OK\0"));
          return;
        }
        if (buf.length < 4 + len) break;
        payload = Buffer.concat([payload, buf.subarray(4, 4 + len)]);
        buf = buf.subarray(4 + len);
      }
    });
    sock.on("error", () => undefined);
  });
  return { server, seen };
}

describe("antivirus ClamAV (protocolo clamd)", () => {
  it("envía el archivo por INSTREAM en bloques y distingue limpio de infectado", async () => {
    const { server, seen } = fakeClamd();
    const port = await listen(server);
    const scanner = new ClamdScanner("127.0.0.1", port);
    const big = Buffer.alloc(300_000, 7);
    expect(await scanner.scan(big)).toEqual({ clean: true });
    expect(seen.commands).toEqual(["zINSTREAM"]);
    expect(seen.bytes).toBe(300_000);                                          // llegó completo aunque son 5 bloques de 64 KB
    expect(await scanner.scan(Buffer.from(`inofensivo ${EICAR} inofensivo`))).toEqual({ clean: false, signature: "Win.Test.EICAR_HDB-1" });
    expect(await scanner.scan(Buffer.alloc(0))).toEqual({ clean: true });
    await close(server);
  });

  it("un análisis que falla NO se toma como limpio: sin servidor, sin respuesta o con respuesta rara lanza SCAN_UNAVAILABLE", async () => {
    const dead = new ClamdScanner("127.0.0.1", 1);
    await expect(dead.scan(Buffer.from("x"))).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", details: { code: "SCAN_UNAVAILABLE" } });
    const silent = fakeClamd({ silent: true });
    const p1 = await listen(silent.server);
    await expect(new ClamdScanner("127.0.0.1", p1, 300).scan(Buffer.from("x"))).rejects.toMatchObject({ details: { code: "SCAN_UNAVAILABLE", reason: "tiempo agotado" } });
    const weird = fakeClamd({ reply: "stream: ERROR\0" });
    const p2 = await listen(weird.server);
    await expect(new ClamdScanner("127.0.0.1", p2).scan(Buffer.from("x"))).rejects.toMatchObject({ details: { code: "SCAN_UNAVAILABLE" } });
    await Promise.all([close(silent.server), close(weird.server)]);
  });
});

describe("medios con S3 y antivirus (API)", () => {
  let pool: pg.Pool, s3: ReturnType<typeof fakeS3>, s3Port: number, clam: ReturnType<typeof fakeClamd>, clamPort: number;
  let dir: string, app: FastifyInstance, plain: FastifyInstance;
  let user: { token: string; id: string }, editor: { token: string };
  const call = (a: FastifyInstance, method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    a.inject({ method, url: url.startsWith("/api") ? url : `/api/v1${url}`, payload: opts.payload as never, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (a: FastifyInstance, role?: string) => {
    const email = uniq();
    const reg = json(await call(a, "POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call(a, "POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };
  const png = () => sharp({ create: { width: 800, height: 600, channels: 3, background: { r: 10, g: 90, b: 170 } } }).png().toBuffer();
  const upload = async (a: FastifyInstance, who: { token: string }, file: Buffer, purpose = "avatar") => {
    const u = json(await call(a, "POST", "/media/upload-url", { token: who.token, payload: { mime: "image/png", size: file.length, purpose } })).data;
    await call(a, "PUT", u.upload.url, { payload: file, headers: { "content-type": "image/png" } });
    const done = await call(a, "POST", `/media/${u.asset_id}/complete`, { token: who.token });
    return { id: u.asset_id as string, done };
  };
  const scan = async (id: string) => (await pool.query("SELECT status, scan_status, scanned_at FROM media_assets WHERE id = $1", [id])).rows[0];

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    s3 = fakeS3("secreto-api", "bucket-api"); s3Port = await listen(s3.server);
    clam = fakeClamd(); clamPort = await listen(clam.server);
    dir = mkdtempSync(path.join(tmpdir(), "rd-mi-"));
    app = await makeApp({ MEDIA_DIR: dir, MEDIA_STORAGE: "s3", S3_ENDPOINT: `http://127.0.0.1:${s3Port}`, S3_BUCKET: "bucket-api", S3_ACCESS_KEY_ID: "AKIDTEST", S3_SECRET_ACCESS_KEY: "secreto-api", S3_PREFIX: "medios/", AV_PROVIDER: "clamd", CLAMAV_PORT: String(clamPort) });
    plain = await makeApp({ MEDIA_DIR: dir });
    user = await account(app); editor = await account(app, "editor");
  });
  afterAll(async () => { await pool.end(); await Promise.all([app.close(), plain.close()]); await Promise.all([close(s3.server), close(clam.server)]); rmSync(dir, { recursive: true, force: true }); });

  it("la configuración exige bucket y claves con MEDIA_STORAGE=s3", () => {
    expect(() => loadEnv({ NODE_ENV: "test", DATABASE_URL: "postgres://x", MEDIA_STORAGE: "s3" } as never)).toThrow(/S3_BUCKET/);
    expect(() => loadEnv({ NODE_ENV: "test", DATABASE_URL: "postgres://x", MEDIA_STORAGE: "s3", S3_BUCKET: "b", S3_ACCESS_KEY_ID: "a", S3_SECRET_ACCESS_KEY: "s" } as never)).not.toThrow();
  });

  it("sube, analiza, procesa y sirve desde S3 (original saneado y variantes) y al borrar limpia todo", async () => {
    const big = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: { r: 1, g: 2, b: 3 } } }).jpeg().toBuffer();
    const u = json(await call(app, "POST", "/media/upload-url", { token: editor.token, payload: { mime: "image/jpeg", size: big.length, purpose: "cms" } })).data;
    await call(app, "PUT", u.upload.url, { payload: big, headers: { "content-type": "image/jpeg" } });
    const done = await call(app, "POST", `/media/${u.asset_id}/complete`, { token: editor.token });
    expect(done.statusCode).toBe(200);
    expect(json(done).data.status).toBe("ready");
    expect(await scan(u.asset_id)).toMatchObject({ status: "ready", scan_status: "clean" });
    const keys = [...s3.objects.keys()].filter((k) => k.includes(u.asset_id));
    expect(keys.sort()).toEqual([`medios/${u.asset_id}`, `medios/${u.asset_id}-large`.replace("-large", "-medium"), `medios/${u.asset_id}-thumb`].sort().filter((k) => keys.includes(k)));
    expect(keys.length).toBeGreaterThanOrEqual(3);
    expect((await sharp((await call(app, "GET", `/media/files/${u.asset_id}`)).rawPayload).metadata()).width).toBe(2000);
    expect((await call(app, "GET", `/media/files/${u.asset_id}?variant=thumb`)).headers["content-type"]).toBe("image/webp");
    expect((await pool.query("SELECT 1 FROM media_assets WHERE id = $1 AND sanitized", [u.asset_id])).rowCount).toBe(1);
    expect((await call(app, "DELETE", `/media/${u.asset_id}`, { token: editor.token })).statusCode).toBe(204);
    expect([...s3.objects.keys()].filter((k) => k.includes(u.asset_id))).toEqual([]);
  });

  it("un archivo infectado se rechaza, se borra y queda registrado; el limpio pasa", async () => {
    const infected = Buffer.concat([await png(), Buffer.from(EICAR)]);          // PNG válido con la firma de prueba EICAR al final
    const bad = await upload(app, user, infected);
    expect(bad.done.statusCode).toBe(422);
    expect(json(bad.done).error.details.code).toBe("MALWARE_DETECTED");
    expect(await scan(bad.id)).toMatchObject({ status: "rejected", scan_status: "infected" });
    expect([...s3.objects.keys()].some((k) => k.includes(bad.id))).toBe(false);          // ni el original quedó guardado
    expect((await pool.query("SELECT meta FROM audit_log WHERE action = 'media.malware_detected' AND entity_id = $1", [bad.id])).rows[0].meta).toMatchObject({ signature: "Win.Test.EICAR_HDB-1" });
    const good = await upload(app, user, await png());
    expect(good.done.statusCode).toBe(200);
    expect(await scan(good.id)).toMatchObject({ status: "ready", scan_status: "clean" });
    // Importar desde una URL también pasa por el análisis.
    app.mediaFetcher.fn = async () => ({ status: 200, contentType: "image/png", body: infected });
    const imp = await call(app, "POST", "/admin/media/import-url", { token: editor.token, payload: { url: "https://images.example.com/virus.png" } });
    expect(imp.statusCode).toBe(422);
    expect(json(imp).error.details.code).toBe("MALWARE_DETECTED");
  });

  it("si el antivirus no responde el archivo no se aprueba, queda pendiente y se reintenta con el mismo complete", async () => {
    const down = await makeApp({ MEDIA_DIR: dir, AV_PROVIDER: "clamd", CLAMAV_PORT: "1" });
    try {
      const u = await account(down);
      const file = await png();
      const r = await upload(down, u, file);
      expect(r.done.statusCode).toBe(503);
      expect(json(r.done).error.details.code).toBe("SCAN_UNAVAILABLE");
      expect((await scan(r.id)).status).toBe("uploaded");                        // ni aprobado ni rechazado
      expect((await call(down, "GET", `/media/files/${r.id}`)).statusCode).toBe(404);
      // Vuelve el servicio: mismo archivo, misma llamada.
      const up = await makeApp({ MEDIA_DIR: dir, AV_PROVIDER: "clamd", CLAMAV_PORT: String(clamPort) });
      try {
        const token = json(await call(up, "POST", "/auth/login", { payload: { email: (await pool.query("SELECT email FROM users WHERE id = $1", [u.id])).rows[0].email, password: PW } })).data.tokens.access_token;
        const retry = await call(up, "POST", `/media/${r.id}/complete`, { token });
        expect(retry.statusCode).toBe(200);
        expect(await scan(r.id)).toMatchObject({ status: "ready", scan_status: "clean" });
      } finally { await up.close(); }
    } finally { await down.close(); }
  });

  it("sin antivirus configurado los archivos siguen su curso y se anota que no se analizaron", async () => {
    const u = await account(plain);
    const r = await upload(plain, u, await png());
    expect(r.done.statusCode).toBe(200);
    expect(await scan(r.id)).toMatchObject({ status: "ready", scan_status: "skipped" });
  });
});
