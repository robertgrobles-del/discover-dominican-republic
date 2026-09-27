import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `sp${Date.now().toString(36)}${n++}@test.local`;
const REASON = "La persona no ve su reserva confirmada (ticket 4F7K2)";

describe("sesión de soporte (sólo lectura)", () => {
  let app: FastifyInstance, strict: FastifyInstance;
  let pool: pg.Pool;
  let admin: { token: string; id: string; email: string }, editor: { token: string; id: string };
  const call = (a: FastifyInstance, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    a.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const c = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) => call(app, method, url, opts);
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await c("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona Ayudada" } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await c("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string, email };
  };
  const start = async (target: string, token = admin.token, reason = REASON) => c("POST", `/admin/users/${target}/impersonate`, { token, payload: { reason } });

  beforeAll(async () => {
    app = await makeApp();
    strict = await makeApp({ REQUIRE_2FA_FOR_STAFF: "true" });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor");
  });
  afterAll(async () => { await pool.end(); await Promise.all([app.close(), strict.close()]); });

  it("abre una sesión de 15 minutos con el banner y sin token de refresco, y avisa a la persona", async () => {
    const u = await account();
    const res = await start(u.id);
    expect(res.statusCode).toBe(201);
    const d = json(res).data;
    expect(d).toMatchObject({ read_only: true, expires_in: 900, target: { id: u.id } });
    expect(d.banner).toContain("sólo lectura");
    expect(d).not.toHaveProperty("refresh_token");
    expect(new Date(d.expires_at).getTime() - Date.now()).toBeLessThanOrEqual(15 * 60_000);
    const me = json(await c("GET", "/auth/me", { token: d.access_token })).data;
    expect(me).toMatchObject({ email: u.email, impersonation: { by: admin.id, read_only: true } });
    expect(json(await c("GET", "/auth/me", { token: u.token })).data.impersonation).toBeNull();          // la sesión normal no lo lleva
    const inbox = json(await c("GET", "/me/notifications", { token: u.token })).data as { title: string }[];
    expect(inbox.some((x) => x.title === "El equipo de soporte revisó tu cuenta")).toBe(true);
    expect((await pool.query("SELECT expires_at - created_at AS d FROM refresh_tokens WHERE family_id = (SELECT sid FROM support_sessions WHERE id = $1)", [d.session_id])).rows[0].d.minutes).toBeGreaterThanOrEqual(14);
  });

  it("lee lo que la persona ve, pero no puede escribir nada ni ver lo sensible", async () => {
    const u = await account();
    const s = json(await start(u.id)).data.access_token as string;
    expect((await c("GET", "/me/favorites", { token: s })).statusCode).toBe(200);
    expect((await c("GET", "/me/notifications", { token: s })).statusCode).toBe(200);
    expect((await c("GET", "/me/bookings", { token: s })).statusCode).toBe(200);
    for (const [m, url, payload] of [["PATCH", "/me/profile", { display_name: "Hackeado" }], ["PUT", "/me/favorites/beach/b1000000-0000-4000-8000-000000000001", {}], ["POST", "/support/tickets", { subject: "Hola mundo", description: "Mensaje de prueba largo" }], ["POST", "/me/notifications/read-all", {}], ["DELETE", "/me/favorites/beach/b1000000-0000-4000-8000-000000000001", undefined]] as const) {
      const res = await c(m, url, { token: s, payload });
      expect(res.statusCode, `${m} ${url}`).toBe(403);
      expect(json(res).error.details.code).toBe("IMPERSONATION_READONLY");
    }
    for (const url of ["/me/export", "/auth/sessions"]) {
      const res = await c("GET", url, { token: s });
      expect(res.statusCode, url).toBe(403);
      expect(json(res).error.details.code, url).toBe("IMPERSONATION_RESTRICTED");
    }
    expect((await c("GET", "/admin/users", { token: s })).statusCode).toBe(403);
    expect((await c("POST", `/admin/users/${admin.id}/impersonate`, { token: s, payload: { reason: REASON } })).statusCode).toBe(403);   // no se encadenan
    expect(json(await c("GET", "/auth/me", { token: u.token })).data.display_name).toBe("Persona Ayudada");                          // nada cambió
  });

  it("todo queda auditado: inicio, cada petición (incluidas las rechazadas, sin cuerpos) y cierre", async () => {
    const u = await account();
    const d = json(await start(u.id)).data;
    await c("GET", "/me/favorites?x=secreto", { token: d.access_token });
    await c("PATCH", "/me/profile", { token: d.access_token, payload: { display_name: "Intento" } });
    const end = await c("POST", "/auth/impersonation/end", { token: d.access_token });
    expect(end.statusCode).toBe(200);
    const log = (await pool.query("SELECT action, actor_id, meta FROM audit_log WHERE entity_id = $1 AND action LIKE 'support.%' ORDER BY id", [u.id])).rows;
    expect(log.map((l) => l.action)).toEqual(["support.impersonation_started", "support.impersonated_request", "support.impersonated_request", "support.impersonation_ended", "support.impersonated_request"]);
    expect(log[0]).toMatchObject({ actor_id: admin.id, meta: { reason: REASON, minutes: 15 } });
    expect(log[1]!.meta).toMatchObject({ method: "GET", path: "/api/v1/me/favorites", status: 200, session: d.session_id });
    expect(JSON.stringify(log)).not.toMatch(/secreto|Intento/);                       // ni parámetros ni cuerpos
    expect(log[2]!.meta).toMatchObject({ method: "PATCH", status: 403 });
    const list = json(await c("GET", `/admin/support-sessions?target_id=${u.id}`, { token: admin.token }));
    expect(list.data[0]).toMatchObject({ id: d.session_id, admin_email: admin.email, target_email: u.email, reason: REASON, requests: 3 });
    expect(list.data[0].ended_at).toBeTruthy();
    expect((await c("GET", "/admin/support-sessions", { token: editor.token })).statusCode).toBe(403);
  });

  it("al cerrarla, al vencer o si la cuenta se suspende, el token deja de servir", async () => {
    const u = await account(), v = await account(), w = await account();
    const closed = json(await start(u.id)).data.access_token as string;
    expect((await c("GET", "/me/favorites", { token: closed })).statusCode).toBe(200);
    await c("POST", "/auth/impersonation/end", { token: closed });
    expect((await c("GET", "/me/favorites", { token: closed })).statusCode).toBe(401);
    expect((await c("POST", "/auth/impersonation/end", { token: u.token })).statusCode).toBe(422);          // una sesión normal no es de soporte

    const expiring = json(await start(v.id)).data;
    await pool.query("UPDATE refresh_tokens SET expires_at = now() - interval '1 minute' WHERE family_id = (SELECT sid FROM support_sessions WHERE id = $1)", [expiring.session_id]);
    expect((await c("GET", "/me/favorites", { token: expiring.access_token })).statusCode).toBe(401);

    const live = json(await start(w.id)).data.access_token as string;
    expect((await c("POST", `/admin/users/${w.id}/suspend`, { token: admin.token, payload: { reason: "Prueba de suspensión" } })).statusCode).toBeLessThan(300);
    expect((await c("GET", "/me/favorites", { token: live })).statusCode).toBe(401);                         // suspender revoca también las sesiones de soporte
  });

  it("valida: sólo el admin, motivo real, no en cuentas del personal, no en la propia, ni en cuentas inactivas", async () => {
    const u = await account(), staff = await account("moderator"), gone = await account();
    expect((await start(u.id, editor.token)).statusCode).toBe(403);
    expect((await start(u.id, u.token)).statusCode).toBe(403);
    expect((await c("POST", `/admin/users/${u.id}/impersonate`, { payload: { reason: REASON } })).statusCode).toBe(401);
    expect((await start(u.id, admin.token, "corto")).statusCode).toBe(400);
    const staffRes = await start(staff.id);
    expect(staffRes.statusCode).toBe(403);
    expect(json(staffRes).error.details.code).toBe("STAFF_TARGET");
    const self = await start(admin.id);
    expect(self.statusCode).toBe(422);
    expect(json(self).error.details.code).toBe("SELF_IMPERSONATION");
    expect((await start("99999999-9999-4999-8999-999999999999")).statusCode).toBe(404);
    await pool.query("UPDATE users SET status = 'suspended' WHERE id = $1", [gone.id]);
    expect((await start(gone.id)).statusCode).toBe(422);
    expect((await pool.query("SELECT count(*)::int AS n FROM support_sessions WHERE target_id = ANY($1)", [[staff.id, admin.id, gone.id]])).rows[0].n).toBe(0);
  });

  it("con la política de 2FA activa exige que el admin haya verificado su segundo factor", async () => {
    const u = await account();
    const login = json(await call(strict, "POST", "/auth/login", { payload: { email: admin.email, password: PW } })).data.tokens.access_token as string;
    const res = await call(strict, "POST", `/admin/users/${u.id}/impersonate`, { token: login, payload: { reason: REASON } });
    expect(res.statusCode).toBe(403);
    expect(json(res).error.code).toBe("MFA_REQUIRED");
    expect((await pool.query("SELECT count(*)::int AS n FROM support_sessions WHERE target_id = $1", [u.id])).rows[0].n).toBe(0);
  });
});
