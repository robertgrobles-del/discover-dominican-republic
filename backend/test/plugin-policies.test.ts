import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createErrorReporter } from "../src/lib/error-reporter.js";
import { json, makeApp } from "./helpers.js";

// Regresiones de los controles por ruta (reglas de IP, sesión de soporte), del request id y de la política de 2FA del personal.
const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `pp${Date.now().toString(36)}${n++}@test.local`;
const REASON = "La persona no ve su reserva confirmada (ticket 4F7K2)";

describe("políticas de los plugins", () => {
  let app: FastifyInstance, strict: FastifyInstance;
  let pool: pg.Pool;
  let admin: { token: string; id: string };
  const call = (a: FastifyInstance, method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown; ip?: string; raw?: boolean } = {}) =>
    a.inject({ method, url: opts.raw ? url : `/api/v1${url}`, payload: opts.payload as object, remoteAddress: opts.ip, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (a: FastifyInstance, role?: string) => {
    const email = uniq();
    const reg = json(await call(a, "POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona Prueba" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call(a, "POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };
  const cleanRules = async () => { await pool.query("DELETE FROM ip_rules"); app.ipRules.clear(); };

  beforeAll(async () => {
    app = await makeApp();
    strict = await makeApp({ REQUIRE_2FA_FOR_STAFF: "true" });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account(app, "admin");
  });
  afterAll(async () => { await cleanRules(); await pool.end(); await Promise.all([app.close(), strict.close()]); });

  it("una sesión de soporte no esquiva la lista de lo sensible con la ruta codificada", async () => {
    const u = await account(app);
    const s = json(await call(app, "POST", `/admin/users/${u.id}/impersonate`, { token: admin.token, payload: { reason: REASON } })).data.access_token as string;
    for (const url of ["/me/%65xport", "/auth/%73essions", "/me/export#x", "/auth/2f%61/setup"]) {
      const res = await call(app, "GET", url, { token: s });
      expect(res.statusCode, url).not.toBe(200);
      if (res.statusCode === 403) expect(json(res).error.details.code, url).toBe("IMPERSONATION_RESTRICTED");
    }
  });

  it("las reglas de IP del panel se aplican aunque la ruta venga codificada o termine en /health", async () => {
    await cleanRules();
    await pool.query("INSERT INTO ip_rules (cidr, action, scope) VALUES ('127.0.0.1', 'allow', 'admin')");
    app.ipRules.clear();
    const ip = "198.51.100.20";
    for (const url of ["/admin/system/feature-flags", "/%61dmin/system/feature-flags", "/admin/system/health", "/admin/settings/health", "/admin/system/feature-flags#/health"]) {
      const res = await call(app, "GET", url, { token: admin.token, ip });
      expect(res.statusCode, url).toBe(403);
      expect(json(res).error.details.code, url).toBe("ADMIN_IP_NOT_ALLOWED");
    }
    await pool.query("INSERT INTO ip_rules (cidr, action, scope) VALUES ('198.51.100.0/24', 'deny', 'all')");
    app.ipRules.clear();
    expect((await call(app, "GET", "/destinations#/health", { ip })).statusCode).toBe(403);
    // La salud del servicio sigue exenta (por su ruta exacta).
    expect((await call(app, "GET", "/health", { ip, raw: true })).statusCode).toBe(200);
    expect((await call(app, "GET", "/health", { ip })).statusCode).toBe(200);
    await cleanRules();
  });

  it("sólo adopta un X-Request-Id con forma de identificador", async () => {
    const ok = await app.inject({ url: "/health", headers: { "x-request-id": "abc-123" } });
    expect(ok.headers["x-request-id"]).toBe("abc-123");
    for (const bad of ["<!channel> <https://evil.example|clic>", "x".repeat(200)]) {
      const res = await app.inject({ url: "/health", headers: { "x-request-id": bad } });
      expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  it("el aviso al equipo no copia tal cual un request id con marcado", async () => {
    let body = "";
    const rep = createErrorReporter({ webhookUrl: "https://hooks.slack.example/x", environment: "test", fetch: (async (_u: string, init: { body: string }) => { body = init.body; return new Response(null, { status: 200 }); }) as never });
    await rep.capture(new Error("boom"), { requestId: `<!channel> ${"y".repeat(300)}` });
    const text = JSON.parse(body).text as string;
    expect(text).not.toContain("<!channel>");
    expect(text).not.toContain("y".repeat(129));
  });

  it("con la política de 2FA, el personal sin segundo factor no modera ni borra lo ajeno fuera del panel", async () => {
    const owner = await account(strict);
    const mod = await account(strict, "moderator");
    const adm = await account(strict, "admin");
    const post = json(await call(strict, "POST", "/social/posts", { token: owner.token, payload: { content: "Un atardecer increíble en la playa" } })).data.id as string;
    expect((await call(strict, "GET", "/admin/users", { token: adm.token })).statusCode).toBe(403);          // MFA_REQUIRED en el panel
    expect((await call(strict, "DELETE", `/social/posts/${post}`, { token: mod.token })).statusCode).toBe(404);
    expect((await call(strict, "DELETE", `/social/posts/${post}`, { token: adm.token })).statusCode).toBe(404);
    expect((await pool.query("SELECT deleted_at FROM social_posts WHERE id = $1", [post])).rows[0].deleted_at).toBeNull();
    // Lo propio sigue funcionando.
    const own = json(await call(strict, "POST", "/social/posts", { token: mod.token, payload: { content: "Mi propia publicación de prueba" } })).data.id as string;
    expect((await call(strict, "DELETE", `/social/posts/${own}`, { token: mod.token })).statusCode).toBe(204);
    // Sin la política (entorno de pruebas por defecto) el moderador sí modera.
    const post2 = json(await call(app, "POST", "/social/posts", { token: (await account(app)).token, payload: { content: "Otra publicación cualquiera" } })).data.id as string;
    const mod2 = await account(app, "moderator");
    expect((await call(app, "DELETE", `/social/posts/${post2}`, { token: mod2.token })).statusCode).toBe(204);
  });
});
