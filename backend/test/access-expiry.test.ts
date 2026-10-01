import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

describe("accesos con vencimiento (plan de accesos, puntos 86, 98 y 100)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: { id: string; token: string; email: string };
  const orgId = crypto.randomUUID();

  const call = (method: "GET" | "POST" | "PATCH", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const account = async (role?: string) => {
    const email = `ax${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Acceso Prueba" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, email, token: role ? await login(email) : (reg.data.tokens.access_token as string) };
  };
  const rolesInToken = async (email: string) => json(await call("GET", "/auth/me", { token: await login(email) })).data.roles as string[];

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin");
    await pool.query("INSERT INTO partner_profiles (id, business_name, business_type, email) VALUES ($1, $2, 'operador', $3)", [orgId, `Org ${tag}`, `org${tag}@test.local`]);
  });
  afterAll(async () => {
    await pool.query("DELETE FROM partner_profiles WHERE id = $1", [orgId]);
    await pool.end();
    await app.close();
  });

  it("concede un rol temporal con motivo, lo incluye en el token y queda auditado", async () => {
    const u = await account();
    const grant = (payload: object, token = admin.token) => call("POST", `/admin/users/${u.id}/roles/temporary`, { token, payload });

    expect((await grant({ role: "moderator", hours: 4, reason: "corto" })).statusCode).toBe(400);              // motivo insuficiente
    expect((await grant({ role: "admin", hours: 4, reason: "Cobertura de guardia de fin de semana" })).statusCode).toBe(400); // admin exige doble aprobación
    expect((await grant({ role: "moderator", hours: 4, reason: "Cobertura de guardia de fin de semana" }, u.token)).statusCode).toBe(403);
    expect((await call("POST", `/admin/users/${admin.id}/roles/temporary`, { token: admin.token, payload: { role: "editor", hours: 1, reason: "Intento de autoconcesión" } })).statusCode).toBe(403);

    const res = await grant({ role: "moderator", hours: 4, reason: "Cobertura de guardia de fin de semana" });
    expect(res.statusCode).toBe(201);
    expect(new Date(json(res).data.expires_at).getTime()).toBeGreaterThan(Date.now() + 3.9 * 3_600_000);
    expect(await rolesInToken(u.email)).toEqual(["moderator", "user"]);

    const row = (await pool.query("SELECT granted_by, grant_reason FROM user_roles WHERE user_id = $1 AND role = 'moderator'", [u.id])).rows[0];
    expect(row).toMatchObject({ granted_by: admin.id, grant_reason: "Cobertura de guardia de fin de semana" });
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'user.role_granted_temporary' AND entity_id = $1", [u.id])).rowCount).toBe(1);
  });

  it("no convierte en temporal un rol que ya era permanente", async () => {
    const u = await account("editor");
    const res = await call("POST", `/admin/users/${u.id}/roles/temporary`, { token: admin.token, payload: { role: "editor", hours: 2, reason: "No debería tocar el rol permanente" } });
    expect(res.statusCode).toBe(409);
    expect((await pool.query("SELECT expires_at FROM user_roles WHERE user_id = $1 AND role = 'editor'", [u.id])).rows[0].expires_at).toBeNull();
  });

  it("un rol vencido deja de entrar en el token al instante; el trabajo lo retira, cierra sesiones y avisa", async () => {
    const u = await account();
    await call("POST", `/admin/users/${u.id}/roles/temporary`, { token: admin.token, payload: { role: "editor", hours: 30, reason: "Apoyo temporal a la redacción" } });
    const session = await login(u.email);

    // A menos de 24 h del vencimiento se avisa, una sola vez.
    await pool.query("UPDATE user_roles SET expires_at = now() + interval '2 hours' WHERE user_id = $1 AND role = 'editor'", [u.id]);
    expect((await app.jobs.runNow("access.roles.expire")).result).toMatchObject({ expired: 0 });
    await app.jobs.runNow("access.roles.expire");
    const warnings = await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND title LIKE '%vence pronto%'", [u.id]);
    expect(warnings.rowCount).toBe(1);

    // Vencido pero aún sin limpiar: ya no entra en un token nuevo.
    await pool.query("UPDATE user_roles SET expires_at = now() - interval '1 minute' WHERE user_id = $1 AND role = 'editor'", [u.id]);
    expect(await rolesInToken(u.email)).toEqual(["user"]);

    const run = await app.jobs.runNow("access.roles.expire");
    expect(run.status).toBe("success");
    expect((await pool.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'editor'", [u.id])).rowCount).toBe(0);
    expect((await pool.query("SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL", [u.id])).rowCount).toBe(0);
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'user.role_expired' AND entity_id = $1", [u.id])).rowCount).toBe(1);
    expect((await call("GET", "/auth/me", { token: session })).statusCode).toBe(401); // la sesión anterior quedó cerrada
  });

  it("una membresía vencida pierde el acceso al panel al instante y el trabajo la retira; el propietario nunca vence", async () => {
    const owner = await account(), guide = await account(), stays = await account();
    await pool.query("INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner'), ($1, $3, 'recepcion'), ($1, $4, 'recepcion')", [orgId, owner.id, guide.id, stays.id]);
    expect((await call("GET", "/org/bookings?per_page=1", { token: guide.token })).statusCode).toBe(200);

    // El dueño fija un fin de contrato; una fecha pasada se rechaza.
    expect((await call("PATCH", `/org/team/members/${guide.id}`, { token: owner.token, payload: { expires_at: new Date(Date.now() - 1000).toISOString() } })).statusCode).toBe(400);
    expect((await call("PATCH", `/org/team/members/${guide.id}`, { token: owner.token, payload: { expires_at: new Date(Date.now() + 86_400_000).toISOString() } })).statusCode).toBe(204);
    expect((await call("GET", "/org/bookings?per_page=1", { token: guide.token })).statusCode).toBe(200);

    await pool.query("UPDATE org_members SET expires_at = now() - interval '1 minute' WHERE org_id = $1 AND user_id = $2", [orgId, guide.id]);
    expect((await call("GET", "/org/bookings?per_page=1", { token: guide.token })).statusCode).toBe(403);
    await expect(pool.query("UPDATE org_members SET expires_at = now() WHERE org_id = $1 AND user_id = $2", [orgId, owner.id])).rejects.toThrow(/chk_org_owner_never_expires/);

    await pool.query("INSERT INTO org_invitations (org_id, email, role, token_hash, expires_at) VALUES ($1, $2, 'recepcion', $3, now() - interval '1 day')", [orgId, `inv${tag}@test.local`, `hash-${tag}`]);
    const run = await app.jobs.runNow("org.access.expire");
    expect(run.status).toBe("success");
    const left = (await pool.query<{ user_id: string }>("SELECT user_id FROM org_members WHERE org_id = $1", [orgId])).rows.map((r) => r.user_id).sort();
    expect(left).toEqual([owner.id, stays.id].sort());
    expect((await pool.query("SELECT revoked_at FROM org_invitations WHERE token_hash = $1", [`hash-${tag}`])).rows[0].revoked_at).not.toBeNull();
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'org.member_expired' AND entity_id = $1", [guide.id])).rowCount).toBe(1);
  });

  it("la línea de tiempo muestra accesos vigentes y los cambios de acceso de la persona, sólo a administradores", async () => {
    const u = await account();
    await pool.query("INSERT INTO org_members (org_id, user_id, role, expires_at) VALUES ($1, $2, 'recepcion', now() + interval '10 days')", [orgId, u.id]);
    await call("POST", `/admin/users/${u.id}/roles/temporary`, { token: admin.token, payload: { role: "ambassador", hours: 48, reason: "Campaña de temporada alta" } });
    await call("POST", `/admin/users/${u.id}/suspend`, { token: admin.token, payload: { reason: "Revisión de actividad sospechosa" } });

    expect((await call("GET", `/admin/users/${u.id}/access-timeline`, { token: u.token })).statusCode).not.toBe(200);
    const t = json(await call("GET", `/admin/users/${u.id}/access-timeline`, { token: admin.token })).data;
    expect(t.roles.map((r: { role: string }) => r.role)).toEqual(["ambassador", "user"]);
    expect(t.roles.find((r: { role: string }) => r.role === "ambassador")).toMatchObject({ grant_reason: "Campaña de temporada alta", granted_by: admin.id });
    expect(t.roles.find((r: { role: string }) => r.role === "user").expires_at).toBeNull();
    expect(t.organizations).toHaveLength(1);
    expect(t.organizations[0]).toMatchObject({ org_id: orgId, role: "recepcion" });
    expect(t.organizations[0].expires_at).not.toBeNull();
    expect(t.events.map((e: { action: string }) => e.action)).toEqual(["user.suspended", "user.role_granted_temporary"]);
    expect(t.events[1].meta).toMatchObject({ role: "ambassador", reason: "Campaña de temporada alta" });
  });
});
