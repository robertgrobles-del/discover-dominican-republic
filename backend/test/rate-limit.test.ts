import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { purgeRateLimits } from "../src/plugins/rate-limit-store.js";
import { json, makeApp } from "./helpers.js";

describe("límites de tasa compartidos (PostgreSQL)", () => {
  let pool: pg.Pool;
  beforeAll(() => { pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); });
  beforeEach(async () => { await pool.query("DELETE FROM rate_limits"); });

  const codes = async (app: FastifyInstance, n: number, url = "/api/v1/version") => {
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push((await app.inject({ url })).statusCode);
    return out;
  };

  it("cuenta las solicitudes en la base y responde 429 al superar el máximo", async () => {
    const app = await makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "3" });
    const res = await app.inject({ url: "/api/v1/version" });
    expect(res.headers["x-ratelimit-limit"]).toBe("3");
    expect(res.headers["x-ratelimit-remaining"]).toBe("2");
    expect(await codes(app, 3)).toEqual([200, 200, 429]);
    const limited = await app.inject({ url: "/api/v1/version" });
    expect(json(limited).error.code).toBe("RATE_LIMITED");
    expect(Number(limited.headers["retry-after"])).toBeGreaterThan(0);
    const row = (await pool.query("SELECT count FROM rate_limits")).rows[0];
    expect(row.count).toBeGreaterThanOrEqual(4);
    await app.close();
  });

  it("varias instancias comparten el mismo contador", async () => {
    const [a, b] = await Promise.all([makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "4" }), makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "4" })]);
    expect(await codes(a, 2)).toEqual([200, 200]);
    expect(await codes(b, 2)).toEqual([200, 200]);
    expect((await a.inject({ url: "/api/v1/version" })).statusCode).toBe(429);
    expect((await b.inject({ url: "/api/v1/version" })).statusCode).toBe(429);
    await Promise.all([a.close(), b.close()]);
  });

  it("es atómico bajo concurrencia: ni una solicitud de más", async () => {
    const [a, b] = await Promise.all([makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "10" }), makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "10" })]);
    const results = await Promise.all(Array.from({ length: 40 }, (_, i) => (i % 2 ? a : b).inject({ url: "/api/v1/version" }).then((r) => r.statusCode)));
    expect(results.filter((c) => c === 200)).toHaveLength(10);
    expect(results.filter((c) => c === 429)).toHaveLength(30);
    await Promise.all([a.close(), b.close()]);
  });

  it("la ventana se reinicia al vencer", async () => {
    const app = await makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "2", RATE_LIMIT_WINDOW: "1 second" });
    expect(await codes(app, 3)).toEqual([200, 200, 429]);
    await new Promise((r) => setTimeout(r, 1200));
    expect(await codes(app, 2)).toEqual([200, 200]);
    await app.close();
  });

  it("cada ruta con límite propio tiene su contador independiente", async () => {
    const app = await makeApp({ RATE_LIMIT_STORE: "postgres", AUTH_RATE_LIMIT_ENABLED: "true" });
    const login = () => app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: "x@limite.test", password: "cualquiera" } }).then((r) => r.statusCode);
    const results: number[] = [];
    for (let i = 0; i < 11; i++) results.push(await login());
    expect(results.slice(0, 10).every((c) => c === 401)).toBe(true);
    expect(results[10]).toBe(429);
    // registro tiene su propio cupo (10/hora) aunque login ya se agotó
    const reg = await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email: `limite${Date.now()}@test.local`, password: "Correcta-Clave-2026!", accept_terms: true } });
    expect(reg.statusCode).toBe(201);
    const keys = (await pool.query("SELECT key FROM rate_limits ORDER BY key")).rows.map((r) => r.key as string);
    expect(keys.some((k) => k.startsWith("POST:/api/v1/auth/login|"))).toBe(true);
    expect(keys.some((k) => k.startsWith("POST:/api/v1/auth/register|"))).toBe(true);
    await app.close();
  });

  it("/health no se limita", async () => {
    const app = await makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "1" });
    expect(await codes(app, 5, "/health")).toEqual([200, 200, 200, 200, 200]);
    await app.close();
  });

  it("si el almacén falla, la API sigue respondiendo (falla abierta) y se recupera sola", async () => {
    const app = await makeApp({ RATE_LIMIT_STORE: "postgres", RATE_LIMIT_MAX: "1" });
    await pool.query("ALTER TABLE rate_limits RENAME TO rate_limits_off");
    try {
      expect(await codes(app, 3)).toEqual([200, 200, 200]);
    } finally {
      await pool.query("ALTER TABLE rate_limits_off RENAME TO rate_limits");
    }
    expect(await codes(app, 2)).toEqual([200, 429]);
    await app.close();
  });

  it("purga los contadores vencidos", async () => {
    await pool.query("INSERT INTO rate_limits (key, count, expires_at) VALUES ('viejo', 5, now() - interval '1 hour'), ('vigente', 1, now() + interval '1 hour')");
    await purgeRateLimits(pool);
    expect((await pool.query("SELECT key FROM rate_limits")).rows.map((r) => r.key)).toEqual(["vigente"]);
  });
});

describe("antibombardeo de correo de restablecimiento", () => {
  it("máximo 3 correos por hora a una cuenta, sin revelar si existe", async () => {
    const app = await makeApp();
    const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const email = `bomba${Date.now()}@test.local`;
    await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: "Correcta-Clave-2026!", accept_terms: true } });
    const codes: number[] = [];
    for (let i = 0; i < 6; i++) codes.push((await app.inject({ method: "POST", url: "/api/v1/auth/forgot-password", payload: { email } })).statusCode);
    expect(codes).toEqual([202, 202, 202, 202, 202, 202]); // la respuesta nunca cambia
    const n = (await pool.query("SELECT count(*)::int AS n FROM email_log WHERE to_email = $1 AND template = 'auth.reset_password'", [email])).rows[0].n;
    expect(n).toBe(3);
    await pool.end();
    await app.close();
  });
});

describe.skipIf(!process.env.REDIS_URL)("límites de tasa con Redis (requiere REDIS_URL)", () => {
  it("comparte el contador entre instancias y responde 429", async () => {
    const env = { RATE_LIMIT_STORE: "redis", REDIS_URL: process.env.REDIS_URL!, RATE_LIMIT_MAX: "3" };
    const [a, b] = await Promise.all([makeApp(env), makeApp(env)]);
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) codes.push((await (i % 2 ? a : b).inject({ url: `/api/v1/version?k=${Date.now()}` })).statusCode);
    expect(codes.filter((c) => c === 429).length).toBeGreaterThanOrEqual(1);
    await Promise.all([a.close(), b.close()]);
  });
});
