import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const EVENT = "e1000000-0000-4000-8000-000000000001";   // Festival del Merengue (fixtures)
const EVENT2 = "e1000000-0000-4000-8000-000000000002";  // Carnaval (fixtures)

describe("capacidades acotadas (plan de accesos, puntos 85, 95 y 96)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let admin: Account;

  const call = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const account = async (role?: string): Promise<Account> => {
    const email = `cg${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Permiso Prueba" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, email, token: role ? await login(email) : (reg.data.tokens.access_token as string) };
  };
  const grant = (body: object, token = admin.token) => call("POST", "/admin/capability-grants", { token, payload: body });
  const REASON = "Apoyo temporal al equipo editorial";

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin");
  });
  afterAll(async () => {
    await pool.query("DELETE FROM capability_grants WHERE reason LIKE $1", [`%${tag}%`]);
    await pool.end();
    await app.close();
  });

  it("sólo administración concede, con motivo, a otra persona y con un alcance válido", async () => {
    const u = await account();
    expect((await grant({ user_id: u.id, capability: "catalog.manage", collections: ["events"], reason: REASON }, u.token)).statusCode).toBe(403);
    expect((await grant({ user_id: admin.id, capability: "analytics.read", reason: REASON })).statusCode).toBe(403);
    expect((await grant({ user_id: u.id, capability: "catalog.manage", collections: ["events"], reason: "corto" })).statusCode).toBe(400);
    expect((await grant({ user_id: u.id, capability: "catalog.manage", reason: REASON })).statusCode).toBe(400);                                 // sin colecciones
    expect((await grant({ user_id: u.id, capability: "catalog.manage", collections: ["no-existe"], reason: REASON })).statusCode).toBe(400);
    expect((await grant({ user_id: u.id, capability: "catalog.manage", collections: ["events"], record_ids: [EVENT], reason: REASON })).statusCode).toBe(400); // registros sin vencimiento
    expect((await grant({ user_id: u.id, capability: "analytics.read", collections: ["events"], reason: REASON })).statusCode).toBe(400);
    expect((await grant({ user_id: u.id, capability: "admin.accounts", reason: REASON })).statusCode).toBe(400);                                 // no hay atajo a administración
  });

  it("gestión de catálogo acotada a una colección: edita ahí y en ninguna otra parte, sin publicar ni administrar (96)", async () => {
    const u = await account();
    expect((await call("GET", "/admin/events", { token: u.token })).statusCode).toBe(403);
    const res = await grant({ user_id: u.id, capability: "catalog.manage", collections: ["events"], reason: `${REASON} ${tag}` });
    expect(res.statusCode).toBe(201);
    expect(json(await call("GET", "/me/capability-grants", { token: u.token })).data[0]).toMatchObject({ capability: "catalog.manage", collections: ["events"] });

    expect((await call("GET", "/admin/events", { token: u.token })).statusCode).toBe(200);
    const created = await call("POST", "/admin/events", { token: u.token, payload: { title: `Evento ${tag}`, start_date: "2027-03-01", category: "cultural" } });
    expect(created.statusCode).toBe(201);
    const id = json(created).data.id as string;
    expect(json(created).data.status).toBe("draft");
    expect((await call("PATCH", `/admin/events/${id}`, { token: u.token, payload: { title: `Evento ${tag} editado`, version: 1 } })).statusCode).toBe(200);
    expect((await call("POST", `/admin/events/${id}/submit-review`, { token: u.token })).statusCode).toBe(200);

    // Lo que el permiso no da.
    expect((await call("POST", `/admin/events/${id}/publish`, { token: u.token })).statusCode).toBe(403);       // publicar es de administración
    expect((await call("GET", "/admin/events/export", { token: u.token })).statusCode).toBe(403);
    expect((await call("GET", "/admin/beaches", { token: u.token })).statusCode).toBe(403);                     // otra colección
    expect((await call("GET", "/admin/users", { token: u.token })).statusCode).toBe(403);                       // usuarios y seguridad
    expect((await call("GET", "/admin/analytics/overview", { token: u.token })).statusCode).toBe(403);
    expect((await call("DELETE", `/admin/events/${id}?hard=true`, { token: u.token })).statusCode).toBe(403);   // borrado definitivo
    expect(json(await call("GET", "/auth/me", { token: await login(u.email) })).data.roles).toEqual(["user"]);  // no cambió su rol global

    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'capability.granted' AND entity_id = $1", [u.id])).rowCount).toBe(1);
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'cms.update' AND actor_id = $1", [u.id])).rowCount).toBe(1);
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
  });

  it("administración delegada de un evento concreto: sólo ese registro, siempre con vencimiento (85)", async () => {
    const u = await account();
    const res = await grant({ user_id: u.id, capability: "catalog.manage", collections: ["events"], record_ids: [EVENT], hours: 48, reason: `Organizador del festival ${tag}` });
    expect(res.statusCode).toBe(201);
    expect(new Date(json(res).data.expires_at).getTime()).toBeGreaterThan(Date.now() + 47 * 3_600_000);

    expect((await call("GET", `/admin/events/${EVENT}`, { token: u.token })).statusCode).toBe(200);
    const other = await call("GET", `/admin/events/${EVENT2}`, { token: u.token });
    expect(other.statusCode).toBe(403);
    expect(json(other).error.details.code).toBe("OUT_OF_GRANT_SCOPE");
    expect((await call("PATCH", `/admin/events/${EVENT2}`, { token: u.token, payload: { title: "No debería", version: 1 } })).statusCode).toBe(403);
    expect((await call("POST", "/admin/events", { token: u.token, payload: { title: "Evento nuevo no permitido", start_date: "2027-03-01", category: "cultural" } })).statusCode).toBe(403);
    expect((await call("DELETE", `/admin/events/${EVENT2}`, { token: u.token })).statusCode).toBe(403);

    // Al vencer, el acceso se corta sin esperar a ningún trabajo.
    await pool.query("UPDATE capability_grants SET expires_at = now() - interval '1 minute' WHERE user_id = $1", [u.id]);
    expect((await call("GET", `/admin/events/${EVENT}`, { token: u.token })).statusCode).toBe(403);
    expect(json(await call("GET", "/me/capability-grants", { token: u.token })).data).toEqual([]);
  });

  it("analítica de sólo lectura: ve agregados, no comentarios en texto libre ni exportaciones (95)", async () => {
    const u = await account();
    expect((await call("GET", "/admin/analytics/overview", { token: u.token })).statusCode).toBe(403);
    expect((await grant({ user_id: u.id, capability: "analytics.read", reason: `Consultor de datos ${tag}` })).statusCode).toBe(201);

    expect((await call("GET", "/admin/analytics/overview", { token: u.token })).statusCode).toBe(200);
    expect((await call("GET", "/admin/analytics/traffic", { token: u.token })).statusCode).toBe(200);
    const nps = json(await call("GET", "/admin/analytics/nps", { token: u.token })).data;
    expect(nps).toMatchObject({ comments: [], comments_hidden: true });
    expect(nps).toHaveProperty("score");
    // Administración sí ve los comentarios.
    expect(json(await call("GET", "/admin/analytics/nps", { token: admin.token })).data).not.toHaveProperty("comments_hidden");

    expect((await call("GET", "/admin/analytics/export.csv?report=traffic", { token: u.token })).statusCode).toBe(403);
    expect((await call("GET", "/admin/events", { token: u.token })).statusCode).toBe(403); // no da acceso al catálogo
    expect((await call("GET", "/admin/users", { token: u.token })).statusCode).toBe(403);
  });

  it("revocar corta el acceso al instante y queda auditado", async () => {
    const u = await account();
    const id = json(await grant({ user_id: u.id, capability: "catalog.manage", collections: ["events", "articles"], reason: `${REASON} ${tag}` })).data.id as string;
    expect((await call("GET", "/admin/articles", { token: u.token })).statusCode).toBe(200);
    expect(json(await call("GET", `/admin/capability-grants?user_id=${u.id}`, { token: admin.token })).data[0]).toMatchObject({ id, active: true, email: u.email });

    expect((await call("DELETE", `/admin/capability-grants/${id}`, { token: u.token })).statusCode).toBe(403);
    expect((await call("DELETE", `/admin/capability-grants/${id}`, { token: admin.token })).statusCode).toBe(204);
    expect((await call("DELETE", `/admin/capability-grants/${id}`, { token: admin.token })).statusCode).toBe(404);
    expect((await call("GET", "/admin/articles", { token: u.token })).statusCode).toBe(403);
    expect(json(await call("GET", `/admin/capability-grants?user_id=${u.id}`, { token: admin.token })).data).toEqual([]);
    expect(json(await call("GET", `/admin/capability-grants?user_id=${u.id}&active=false`, { token: admin.token })).data[0]).toMatchObject({ id, active: false });
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'capability.revoked' AND entity_id = $1", [u.id])).rowCount).toBe(1);
  });
});
