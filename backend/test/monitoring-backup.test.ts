import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { decryptFile, encryptFile, offsiteConfigFromEnv, uploadEncrypted } from "../src/lib/backup-offsite.js";
import { createErrorReporter, fingerprint, parseDsn, parseStack } from "../src/lib/error-reporter.js";

interface Sent { url: string; headers: Record<string, string>; body: string }
const recorder = (status = 200) => {
  const sent: Sent[] = [];
  const send = (async (url: string | URL | Request, init?: RequestInit) => {
    sent.push({ url: String(url), headers: init?.headers as Record<string, string>, body: String(init?.body) });
    return new Response("", { status });
  }) as typeof fetch;
  return { sent, send };
};
const DSN = "https://abc123@o42.ingest.sentry.io/4501";

describe("monitoreo de errores", () => {
  it("sin configurar no envía nada", async () => {
    const { sent, send } = recorder();
    const reporter = createErrorReporter({ environment: "test", fetch: send });
    expect(reporter.enabled).toBe(false);
    await reporter.capture(new Error("x"));
    expect(sent).toEqual([]);
  });

  it("interpreta el DSN de Sentry y rechaza lo que no lo es", () => {
    expect(parseDsn(DSN)).toMatchObject({ key: "abc123", envelopeUrl: "https://o42.ingest.sentry.io/api/4501/envelope/" });
    expect(parseDsn("https://k@sentry.interno.do/sentry/7")).toMatchObject({ envelopeUrl: "https://sentry.interno.do/sentry/api/7/envelope/" });
    expect(parseDsn("https://o42.ingest.sentry.io/4501")).toBeNull(); // sin clave
    expect(parseDsn("no es una url")).toBeNull();
  });

  it("envía a Sentry el error con su pila y sólo los datos técnicos de la petición", async () => {
    const { sent, send } = recorder();
    const reporter = createErrorReporter({ dsn: DSN, environment: "production", release: "api@1.2.3", serverName: "vps-1", fetch: send, now: () => 1_700_000_000_000 });
    await reporter.capture(new TypeError("No se pudo leer 'total' de la reserva 8f14e45f"), { source: "petición", requestId: "req-1", method: "POST", route: "/bookings/:id/pay", userId: "user-9" });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.url).toBe("https://o42.ingest.sentry.io/api/4501/envelope/");
    expect(sent[0]!.headers["x-sentry-auth"]).toContain("sentry_key=abc123");
    const [header, item, payload] = sent[0]!.body.split("\n").map((line) => JSON.parse(line));
    expect(header).toMatchObject({ dsn: DSN });
    expect(item).toMatchObject({ type: "event", length: Buffer.byteLength(sent[0]!.body.split("\n")[2]!) });
    expect(payload).toMatchObject({
      platform: "node", level: "error", environment: "production", release: "api@1.2.3", server_name: "vps-1", transaction: "POST /bookings/:id/pay",
      tags: { source: "petición", request_id: "req-1", route: "/bookings/:id/pay", method: "POST" }, user: { id: "user-9" },
    });
    expect(payload.exception.values[0]).toMatchObject({ type: "TypeError", value: "No se pudo leer 'total' de la reserva 8f14e45f" });
    expect(payload.exception.values[0].stacktrace.frames.at(-1).filename).toContain("monitoring-backup.test");
    expect(payload).not.toHaveProperty("request"); // ni URL real, ni cuerpo, ni cabeceras
  });

  it("avisa al canal una vez por error cada cinco minutos y cuenta las repeticiones", async () => {
    const { sent, send } = recorder();
    let now = 1_000_000;
    const reporter = createErrorReporter({ webhookUrl: "https://hooks.slack.com/services/T/B/x", environment: "production", fetch: send, now: () => now });
    const boom = (n: number) => new Error(`Falló el cobro ${n}`); // mismo origen y mismo mensaje salvo el número
    const fail = (n: number) => reporter.capture(boom(n), { method: "POST", route: "/pay", requestId: `r${n}` });
    await fail(1); await fail(2); await fail(3);
    expect(sent).toHaveLength(1);
    expect(JSON.parse(sent[0]!.body).text).toContain("⚠️ Error en la API · production\nError: Falló el cobro 1\nPOST /pay · petición r1");
    now += 5 * 60_000 + 1;
    await fail(4);
    expect(JSON.parse(sent[1]!.body).text).toContain("(2 repeticiones más desde el último aviso)");
    await reporter.capture(new RangeError("otro distinto"), {});
    expect(sent).toHaveLength(3); // un error diferente avisa por su cuenta
  });

  it("limita los avisos por minuto, pero la caída del proceso avisa siempre; Discord recibe su formato", async () => {
    const { sent, send } = recorder();
    const reporter = createErrorReporter({ webhookUrl: "https://discord.com/api/webhooks/1/abc", environment: "production", fetch: send, now: () => 5_000 });
    for (let i = 0; i < 20; i++) await reporter.capture(new Error(`distinto ${String.fromCharCode(97 + i)}`), { route: `/r${String.fromCharCode(97 + i)}` });
    expect(sent).toHaveLength(6);
    await reporter.capture(new Error("sin memoria"), { source: "excepción no capturada", level: "fatal" });
    expect(sent).toHaveLength(7);
    expect(JSON.parse(sent[6]!.body)).toEqual({ content: expect.stringContaining("🔴 La API se detuvo · production\nError: sin memoria\nexcepción no capturada") });
  });

  it("un monitoreo caído no lanza: sólo deja constancia", async () => {
    const logged: string[] = [];
    const reporter = createErrorReporter({ dsn: DSN, webhookUrl: "https://hooks.slack.com/x", environment: "test", log: (m) => logged.push(m), fetch: (async () => { throw new Error("sin red"); }) as typeof fetch });
    await expect(reporter.capture("texto lanzado, no un Error")).resolves.toBeUndefined();
    expect(logged).toHaveLength(2);
    await expect(createErrorReporter({ dsn: DSN, environment: "test", fetch: recorder(429).send, log: (m) => logged.push(m) }).capture(new Error("x"))).resolves.toBeUndefined();
  });

  it("la huella ignora números e identificadores, y la pila se ordena como espera Sentry", () => {
    const a = new Error("Reserva 123 no existe"), b = new Error("Reserva 987 no existe");
    b.stack = a.stack!.replace("123", "987");
    expect(fingerprint(a, {})).toBe(fingerprint(b, {}));
    expect(fingerprint(a, { route: "/x" })).not.toBe(fingerprint(a, { route: "/y" }));
    const frames = parseStack("Error: x\n    at interno (node:internal/process:1:2)\n    at pagar (file:///app/src/pay.ts:10:5)\n    at /app/node_modules/lib/index.js:3:1");
    expect(frames.map((f) => [f.function, f.in_app])).toEqual([["<anónimo>", false], ["pagar", true], ["interno", false]]);
  });
});

describe("copia externa de respaldos", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "respaldo-"));
  const KEY = "clave-de-prueba-suficientemente-larga";
  let server: Server, port: number;
  const received: { method: string; url: string; headers: Record<string, string | string[] | undefined>; body: Buffer }[] = [];
  let status = 200;

  beforeAll(async () => {
    server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c)).on("end", () => { received.push({ method: req.method!, url: req.url!, headers: req.headers, body: Buffer.concat(chunks) }); res.statusCode = status; res.end(status === 200 ? "" : "<Error>AccessDenied</Error>"); });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as { port: number }).port;
  });
  afterAll(async () => { await new Promise((resolve) => server.close(resolve)); rmSync(dir, { recursive: true, force: true }); });

  const env = (over: Record<string, string> = {}) => ({ ...process.env, BACKUP_S3_BUCKET: "respaldos", BACKUP_S3_ACCESS_KEY_ID: "AKIA", BACKUP_S3_SECRET_ACCESS_KEY: "secreto", BACKUP_ENCRYPTION_KEY: KEY, BACKUP_S3_ENDPOINT: `http://127.0.0.1:${port}`, ...over });

  it("sin bucket no hay copia externa; a medias o con clave corta, falla diciendo qué falta", () => {
    expect(offsiteConfigFromEnv({})).toBeNull();
    expect(() => offsiteConfigFromEnv({ BACKUP_S3_BUCKET: "b", BACKUP_S3_ACCESS_KEY_ID: "a" })).toThrow(/BACKUP_S3_SECRET_ACCESS_KEY, BACKUP_ENCRYPTION_KEY/);
    expect(() => offsiteConfigFromEnv(env({ BACKUP_ENCRYPTION_KEY: "corta" }))).toThrow(/24 caracteres/);
    expect(offsiteConfigFromEnv(env({ BACKUP_S3_PREFIX: "/prod" }))).toMatchObject({ bucket: "respaldos", prefix: "prod/", region: "us-east-1", pathStyle: true });
    expect(offsiteConfigFromEnv({ ...env(), BACKUP_S3_ENDPOINT: "", BACKUP_S3_REGION: "eu-west-1", BACKUP_S3_PATH_STYLE: "false" })).toMatchObject({ endpoint: "https://s3.eu-west-1.amazonaws.com", pathStyle: false });
  });

  it("cifra, sube el archivo y su huella con petición firmada, y lo subido se descifra al original", async () => {
    const original = path.join(dir, "descubre_rd-2026.dump"), encrypted = `${original}.enc`, restored = path.join(dir, "restaurado.dump");
    const content = Buffer.from("PGDMP volcado de prueba ".repeat(2000));
    writeFileSync(original, content);
    encryptFile(original, encrypted, env());
    expect(readFileSync(encrypted).subarray(0, 8).toString()).toBe("Salted__");
    expect(readFileSync(encrypted).includes(Buffer.from("volcado de prueba"))).toBe(false);

    const result = await uploadEncrypted(offsiteConfigFromEnv(env({ BACKUP_S3_PREFIX: "prod" }))!, encrypted);
    expect(result.key).toBe("prod/descubre_rd-2026.dump.enc");
    expect(received.map((r) => `${r.method} ${r.url}`)).toEqual(["PUT /respaldos/prod/descubre_rd-2026.dump.enc", "PUT /respaldos/prod/descubre_rd-2026.dump.enc.sha256"]);
    expect(received[0]!.headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIA\/\d{8}\/us-east-1\/s3\/aws4_request, SignedHeaders=.*host.*, Signature=[0-9a-f]{64}$/);
    expect(received[0]!.headers["x-amz-content-sha256"]).toBe("UNSIGNED-PAYLOAD");
    expect(received[1]!.body.toString()).toBe(`${result.sha256}  descubre_rd-2026.dump.enc\n`);

    const downloaded = path.join(dir, "bajado.enc");
    writeFileSync(downloaded, received[0]!.body);
    decryptFile(downloaded, restored, env());
    expect(readFileSync(restored).equals(content)).toBe(true);
    expect(() => decryptFile(downloaded, path.join(dir, "mal.dump"), env({ BACKUP_ENCRYPTION_KEY: "otra-clave-distinta-pero-igual-de-larga" }))).toThrow();
  });

  it("si el almacenamiento rechaza la subida, falla con el motivo", async () => {
    const file = path.join(dir, "x.dump.enc");
    writeFileSync(file, "x");
    status = 403;
    await expect(uploadEncrypted(offsiteConfigFromEnv(env())!, file)).rejects.toThrow(/403.*AccessDenied/);
    status = 200;
  });
});
