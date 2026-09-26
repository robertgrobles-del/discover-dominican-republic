import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { json, makeApp, testEnv } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `sc${Date.now().toString(36)}${n++}@test.local`;
const tagId = Date.now().toString(36);
const UUID = "99999999-9999-4999-8999-999999999999";
/** Sustituye los parámetros de ruta por valores plausibles. */
const fill = (url: string) => url.replace(/:(\w+)/g, (_m, p: string) => (/id$/i.test(p) ? UUID : "x"));

/**
 * Rutas que pueden llamarse sin sesión (públicas o autorizadas de otra forma). Toda ruta que cambia datos y no esté aquí
 * DEBE exigir autenticación: si una ruta nueva rompe esta prueba, hay que protegerla o justificarla en esta lista.
 */
const PUBLIC_MUTATIONS: RegExp[] = [
  /^\/api\/v1\/auth\//, /^\/api\/v1\/bookings(\/|$)/, /^\/api\/v1\/orders(\/|$)/, /^\/api\/v1\/cart(\/|$)/, /^\/api\/v1\/checkout\/quote$/, /^\/api\/v1\/coupons\/validate$/, /^\/api\/v1\/promotions\/validate$/,
  /^\/api\/v1\/contact$/, /^\/api\/v1\/newsletter\//, /^\/api\/v1\/leads$/, /^\/api\/v1\/establishments\/register$/, /^\/api\/v1\/advertisers\/requests$/, /^\/api\/v1\/vacation-registrations$/,
  /^\/api\/v1\/analytics\/events$/, /^\/api\/v1\/ads\//, /^\/api\/v1\/surveys\//, /^\/api\/v1\/tools\//, /^\/api\/v1\/calculators\//, /^\/api\/v1\/utils\/convert$/,
  /^\/api\/v1\/webhooks\/payments\//, /^\/api\/v1\/media\/:id\/upload$/, /^\/api\/v1\/orders\/:id\//, /^\/api\/v1\/team-invitations\//, /^\/api\/v1\/listings\//,
  /^\/api\/v1\/reviews\/:id\/(helpful|report)$/, /^\/api\/v1\/marketplace\/checkout\/quote$/, /^\/api\/v1\/marketplace\/orders(\/|$)/,
];
/** Prefijos que SIEMPRE exigen sesión, sea cual sea el método. */
const ALWAYS_PROTECTED: RegExp[] = [/^\/api\/v1\/admin\//, /^\/api\/v1\/org\//, /^\/api\/v1\/me(\/|$)/, /^\/api\/v1\/support\//, /^\/api\/v1\/social\/me\//, /^\/api\/v1\/gamification\/me/, /^\/api\/v1\/partner\//, /^\/api\/v1\/ambassadors\/(me|apply)/, /^\/api\/v1\/marketplace\/vendors\/(me|apply)$/];

describe("seguridad", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let plain: string;
  const call = (method: string, url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method: method as "GET", url, payload: opts.payload as never, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    plain = json(await call("POST", "/api/v1/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } })).data.tokens.access_token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("inventario de rutas", () => {
    const routes = () => app.routeTable.filter((r) => r.url.startsWith("/api/v1/") && r.method !== "HEAD" && r.method !== "OPTIONS");

    it("hay un inventario razonable de rutas", () => {
      expect(routes().length).toBeGreaterThan(500);
    });

    it("todo lo administrativo, del panel del operador y de la cuenta exige sesión (verificado en el código, no sólo por muestreo)", () => {
      const open = routes().filter((r) => ALWAYS_PROTECTED.some((p) => p.test(r.url)) && !r.authenticated);
      expect(open.map((r) => `${r.method} ${r.url}`)).toEqual([]);
    });

    it("cualquier ruta que modifica datos y no está autenticada figura en la lista de excepciones", () => {
      const unexpected = routes().filter((r) => r.method !== "GET" && !r.authenticated && !PUBLIC_MUTATIONS.some((p) => p.test(r.url)));
      expect(unexpected.map((r) => `${r.method} ${r.url}`)).toEqual([]);
    });
  });

  describe("autorización real", () => {
    const protectedRoutes = () => app.routeTable.filter((r) => r.url.startsWith("/api/v1/") && !["HEAD", "OPTIONS"].includes(r.method) && ALWAYS_PROTECTED.some((p) => p.test(r.url)));

    it("sin sesión: 401 en todas, aunque el cuerpo sea inválido (la autenticación va antes que la validación)", async () => {
      const bad: string[] = [];
      for (const r of protectedRoutes()) {
        const res = await call(r.method, fill(r.url), { payload: r.method === "GET" || r.method === "DELETE" ? undefined : { basura: true } });
        if (res.statusCode !== 401) bad.push(`${r.method} ${r.url} → ${res.statusCode}`);
      }
      expect(bad).toEqual([]);
    }, 120_000);

    it("con una cuenta sin rol: /admin/* siempre 403 (nunca 200, 400, 404 ni 500)", async () => {
      const bad: string[] = [];
      for (const r of protectedRoutes().filter((x) => x.url.startsWith("/api/v1/admin/"))) {
        const res = await call(r.method, fill(r.url), { token: plain, payload: r.method === "GET" || r.method === "DELETE" ? undefined : { basura: true } });
        if (res.statusCode !== 403) bad.push(`${r.method} ${r.url} → ${res.statusCode}`);
      }
      expect(bad).toEqual([]);
    }, 120_000);

    it("con una cuenta sin organización: /org/* siempre 403", async () => {
      const bad: string[] = [];
      for (const r of protectedRoutes().filter((x) => x.url.startsWith("/api/v1/org/"))) {
        const res = await call(r.method, fill(r.url), { token: plain, payload: r.method === "GET" || r.method === "DELETE" ? undefined : { basura: true } });
        if (res.statusCode !== 403) bad.push(`${r.method} ${r.url} → ${res.statusCode}`);
      }
      expect(bad).toEqual([]);
    }, 120_000);

    it("ninguna ruta responde 500 ante entradas basura (con y sin sesión)", async () => {
      const bad: string[] = [];
      const all = app.routeTable.filter((r) => r.url.startsWith("/api/v1/") && !["HEAD", "OPTIONS"].includes(r.method) && !/webhooks|\/upload$|\/ical\//.test(r.url));
      for (const r of all) {
        const res = await call(r.method, fill(r.url), { token: plain, payload: r.method === "GET" || r.method === "DELETE" ? undefined : { "__proto__": { admin: true }, x: "'; DROP TABLE users; --", n: 1e309 } });
        if (res.statusCode >= 500) bad.push(`${r.method} ${r.url} → ${res.statusCode}`);
      }
      expect(bad).toEqual([]);
    }, 240_000);
  });

  describe("inyección y entradas hostiles", () => {
    it("no interpreta SQL en búsquedas, ordenamientos ni filtros", async () => {
      const users = (await pool.query("SELECT count(*)::int AS n FROM users")).rows[0].n;
      for (const url of [
        "/api/v1/search?q=%27%3B%20DROP%20TABLE%20users%3B%20--", "/api/v1/beaches?q=%27%20OR%20%271%27%3D%271", "/api/v1/beaches?sort=name%3BDROP%20TABLE%20users", "/api/v1/beaches?sort=-name,(select%20pg_sleep(5))",
        "/api/v1/beaches?filter%5Bname%22%3B%20DROP%5D=1", "/api/v1/hotels?filter%5Bstars%5D%5Bgte%5D=1%20OR%201%3D1", "/api/v1/tools/dictionary?q=%25%27%3B--", "/api/v1/store/products?q=%27%3B%20DROP%20TABLE%20store_products%3B--",
      ]) {
        const res = await call("GET", url);
        expect(res.statusCode, url).toBeLessThan(500);
      }
      expect((await pool.query("SELECT count(*)::int AS n FROM users")).rows[0].n).toBeGreaterThanOrEqual(users);
      expect((await call("GET", "/api/v1/beaches?sort=name%3BDROP%20TABLE%20users")).statusCode).toBe(400);
      expect((await call("GET", "/api/v1/beaches?filter%5Bname%22%3B%20DROP%5D=1")).statusCode).toBe(400);
    });

    it("rechaza cuerpos gigantes (413) y JSON malformado (400) sin filtrar detalles internos", async () => {
      const big = await call("POST", "/api/v1/auth/login", { payload: { email: "a@b.co", password: "x".repeat(2_000_000) } });
      expect(big.statusCode).toBe(413);
      const bad = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: "{no es json", headers: { "content-type": "application/json" } });
      expect(bad.statusCode).toBe(400);
      for (const res of [big, bad]) expect(res.body).not.toMatch(/at .*\.(ts|js):\d+|node_modules|stack/i);
      expect(json(bad).error).toHaveProperty("request_id");
    });

    it("no permite asignar roles ni campos internos al registrarse (mass assignment)", async () => {
      const email = uniq();
      const res = await call("POST", "/api/v1/auth/register", { payload: { email, password: PW, accept_terms: true, roles: ["admin"], role: "admin", email_verified: true, id: UUID } });
      const roles = json(res).data?.user?.roles ?? [];
      expect(roles).not.toContain("admin");
      const row = (await pool.query("SELECT email_verified_at, id FROM users WHERE email = $1", [email])).rows[0];
      expect(row.email_verified_at).toBeNull();
      expect(row.id).not.toBe(UUID);
    });

    it("las rutas 404 y los errores devuelven el sobre estándar sin detalles internos", async () => {
      const res = await call("GET", "/api/v1/no-existe");
      expect(res.statusCode).toBe(404);
      expect(json(res).error).toMatchObject({ code: "NOT_FOUND" });
      expect(res.headers["x-request-id"]).toBeTruthy();
    });
  });

  describe("cabeceras y CORS", () => {
    it("incluye las cabeceras de seguridad y no revela el servidor", async () => {
      const res = await call("GET", "/health");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBeTruthy();
      expect(res.headers["strict-transport-security"]).toBeTruthy();
      expect(res.headers["x-powered-by"]).toBeUndefined();
    });

    it("CORS sólo responde a los orígenes de la lista blanca", async () => {
      const preflight = (origin: string) => call("OPTIONS", "/api/v1/auth/login", { headers: { origin, "access-control-request-method": "POST" } });
      const evil = await preflight("https://evil.example.com");
      expect(evil.headers["access-control-allow-origin"]).toBeUndefined();
      const own = await makeApp({ CORS_ORIGINS: "https://portal.example.com" });
      const good = await own.inject({ method: "OPTIONS", url: "/api/v1/auth/login", headers: { origin: "https://portal.example.com", "access-control-request-method": "POST" } });
      expect(good.headers["access-control-allow-origin"]).toBe("https://portal.example.com");
      const bad = await own.inject({ method: "OPTIONS", url: "/api/v1/auth/login", headers: { origin: "https://portal.example.com.evil.io", "access-control-request-method": "POST" } });
      expect(bad.headers["access-control-allow-origin"]).toBeUndefined();
      await own.close();
    });
  });

  describe("IP del cliente", () => {
    const ipOf = async (trust: string, forwarded: string) => {
      const a = await buildApp({ env: testEnv({ TRUST_PROXY: trust } as never) });
      a.get("/_ip", async (req) => ({ ip: req.ip }));
      await a.ready();
      const res = await a.inject({ url: "/_ip", headers: { "x-forwarded-for": forwarded } });
      await a.close();
      return json(res).ip as string;
    };
    it("por defecto no acepta X-Forwarded-For (nadie puede falsear su IP para evadir los límites)", async () => {
      expect(await ipOf("false", "1.2.3.4")).not.toBe("1.2.3.4");
    });
    it("con un proxy de confianza sí la usa, y con saltos limita cuánto se cree", async () => {
      expect(await ipOf("true", "1.2.3.4")).toBe("1.2.3.4");
      expect(await ipOf("1", "9.9.9.9, 1.2.3.4")).toBe("1.2.3.4"); // un salto: la última IP añadida por nuestro proxy
    });
  });

  describe("configuración de producción", () => {
    const prod = { NODE_ENV: "production", DATABASE_URL: "postgres://app:clave-real@db.example.com:5432/rd", JWT_PRIVATE_KEY: "a", JWT_PUBLIC_KEY: "b", APP_SECRET: "s".repeat(40), TOTP_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"), MAIL_TRANSPORT: "log" } as NodeJS.ProcessEnv;
    it("exige orígenes https concretos y no acepta credenciales de desarrollo", async () => {
      const { loadEnv } = await import("../src/config/env.js");
      expect(() => loadEnv({ ...prod, CORS_ORIGINS: "*" })).toThrow(/CORS_ORIGINS/);
      expect(() => loadEnv({ ...prod, CORS_ORIGINS: "http://portal.example.com" })).toThrow(/CORS_ORIGINS/);
      expect(() => loadEnv({ ...prod, CORS_ORIGINS: "" })).toThrow(/CORS_ORIGINS/);
      expect(() => loadEnv({ ...prod, CORS_ORIGINS: "https://portal.example.com", DATABASE_URL: "postgres://postgres:postgres@db.example.com/rd" })).toThrow(/credenciales por defecto/);
      const ok = loadEnv({ ...prod, CORS_ORIGINS: "https://portal.example.com,https://www.example.com", PAYMENT_PROVIDER: "none" });
      expect(ok.NODE_ENV).toBe("production");
      expect(ok.TRUST_PROXY).toBe("false");
    });
  });

  describe("métricas", () => {
    it("no existen sin token configurado", async () => {
      expect((await call("GET", "/metrics")).statusCode).toBe(404);
    });
    it("requieren el token, usan el patrón de la ruta y exponen el estado del negocio", async () => {
      const token = "token-de-metricas-largo-1234";
      const m = await makeApp({ METRICS_TOKEN: token });
      await m.inject({ url: `/api/v1/orders/ORD-ABCDEFGH?token=secreto-que-no-debe-aparecer` });
      await m.inject({ url: "/api/v1/nope-1" });
      expect((await m.inject({ url: "/metrics" })).statusCode).toBe(401);
      expect((await m.inject({ url: "/metrics", headers: { authorization: "Bearer otro-token-equivocado-1234" } })).statusCode).toBe(401);
      const res = await m.inject({ url: "/metrics", headers: { authorization: `Bearer ${token}` } });
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/plain");
      expect(res.body).toContain('http_requests_total{method="GET",route="/api/v1/orders/:id"');
      expect(res.body).not.toContain("ORD-ABCDEFGH");
      expect(res.body).not.toContain("secreto-que-no-debe-aparecer");
      expect(res.body).toMatch(/http_request_duration_seconds_bucket\{method="GET",route="\/api\/v1\/orders\/:id",le="\+Inf"\} 1/);
      for (const name of ["app_db_up 1", "app_jobs_failed", "app_mail_queue_depth", "app_payment_events_unprocessed", "db_pool_connections{state=\"total\"}", "process_resident_memory_bytes"]) expect(res.body, name).toContain(name);
      await m.close();
    });
  });

  describe("retención de datos", () => {
    it("el mantenimiento borra lo vencido y respeta lo vigente", async () => {
      const u = json(await call("POST", "/api/v1/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } })).data.user.id as string;
      const ins = (sql: string, p: unknown[] = []) => pool.query(sql, p);
      await ins("INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) VALUES ($1, 'h-viejo-' || $2, gen_random_uuid(), now() - interval '40 days'), ($1, 'h-nuevo-' || $2, gen_random_uuid(), now() + interval '10 days')", [u, tagId]);
      await ins("INSERT INTO email_log (to_email, template, locale, subject, payload, status) VALUES ('viejo@t.local', 't', 'es', 's', '{}', 'sent'), ('cola@t.local', 't', 'es', 's', '{}', 'queued')");
      await ins("UPDATE email_log SET created_at = now() - interval '100 days' WHERE to_email IN ('viejo@t.local', 'cola@t.local')");
      const run = await app.jobs.runNow("maintenance.purge");
      expect(run.status).toBe("success");
      const left = (await ins("SELECT token_hash FROM refresh_tokens WHERE user_id = $1", [u])).rows.map((r) => r.token_hash);
      expect(left).toContain(`h-nuevo-${tagId}`);
      expect(left).not.toContain(`h-viejo-${tagId}`);
      expect((await ins("SELECT to_email FROM email_log WHERE to_email IN ('viejo@t.local', 'cola@t.local')")).rows.map((r) => r.to_email)).toEqual(["cola@t.local"]); // lo pendiente no se borra aunque sea viejo
      await ins("DELETE FROM email_log WHERE to_email = 'cola@t.local'");
    });
  });
});
