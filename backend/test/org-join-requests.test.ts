import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

describe("solicitudes para unirse a una organización (plan de accesos, puntos 81 y 86)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let owner: Account, orgAdmin: Account;
  const orgId = crypto.randomUUID();

  const call = (method: "GET" | "POST" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (verified = true): Promise<Account> => {
    const email = `jr${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: `Solicitante ${n}` } }));
    if (verified) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    return { id: reg.data.user.id, email, token: reg.data.tokens.access_token };
  };
  const ask = (token: string, body: object, org = orgId) => call("POST", `/orgs/${org}/join-requests`, { token, payload: body });
  const roleOf = async (userId: string) => (await pool.query<{ role: string; listing_ids: string[] }>("SELECT role, listing_ids FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0];

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await account();
    orgAdmin = await account();
    await pool.query("INSERT INTO partner_profiles (id, business_name, business_type, email) VALUES ($1, $2, 'operador', $3)", [orgId, `Org JR ${tag}`, `orgjr${tag}@test.local`]);
    await pool.query("INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner'), ($1, $3, 'admin')", [orgId, owner.id, orgAdmin.id]);
  });
  afterAll(async () => {
    await pool.query("DELETE FROM partner_profiles WHERE id = $1", [orgId]);
    await pool.end();
    await app.close();
  });

  it("pedir acceso exige sesión y correo verificado; no admite duplicados ni a quien ya es miembro", async () => {
    expect((await call("POST", `/orgs/${orgId}/join-requests`, { payload: { role: "recepcion" } })).statusCode).toBe(401);
    const unverified = await account(false);
    expect(json(await ask(unverified.token, { role: "recepcion" })).error.details.reason).toBe("EMAIL_NOT_VERIFIED");
    const u = await account();
    expect((await ask(u.token, { role: "owner" })).statusCode).toBe(400);                         // la propiedad no se pide
    expect((await ask(u.token, { role: "recepcion" }, crypto.randomUUID())).statusCode).toBe(404); // organización inexistente
    expect((await ask(orgAdmin.token, { role: "recepcion" })).statusCode).toBe(409);               // ya es miembro

    const res = await ask(u.token, { role: "recepcion", message: "Trabajé tres años en recepción de hoteles" });
    expect(res.statusCode).toBe(201);
    expect(json(res).data).toMatchObject({ org_id: orgId, requested_role: "recepcion", status: "pending" });
    expect((await ask(u.token, { role: "guia" })).statusCode).toBe(409);                           // una abierta por organización

    // Pedir no da acceso, y avisa a quien gestiona el equipo.
    expect(await roleOf(u.id)).toBeUndefined();
    expect((await call("GET", "/org/bookings?per_page=1", { token: u.token })).statusCode).toBe(403);
    for (const manager of [owner, orgAdmin]) expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND data->>'join_request_id' = $2", [manager.id, json(res).data.id])).rowCount).toBe(1);
    expect(json(await call("GET", "/me/org-join-requests", { token: u.token })).data[0]).toMatchObject({ org_id: orgId, status: "pending", business_name: `Org JR ${tag}` });
  });

  it("quien gestiona el equipo ve la identidad de quien pide y aprueba creando la membresía", async () => {
    const u = await account();
    const id = json(await ask(u.token, { role: "recepcion", message: "Disponible fines de semana" })).data.id as string;

    expect((await call("GET", "/org/join-requests", { token: u.token })).statusCode).toBe(403); // no es del equipo
    const listed = json(await call("GET", "/org/join-requests", { token: orgAdmin.token })).data.find((r: { id: string }) => r.id === id);
    expect(listed).toMatchObject({ requested_role: "recepcion", message: "Disponible fines de semana", applicant_email: u.email, email_verified: true });
    expect(listed.account_created_at).toBeTruthy();
    expect(listed).not.toHaveProperty("password_hash");

    const approved = await call("POST", `/org/join-requests/${id}/approve`, { token: orgAdmin.token, payload: { note: "Bienvenida" } });
    expect(approved.statusCode).toBe(200);
    expect(json(approved).data).toMatchObject({ status: "approved", granted_role: "recepcion" });
    expect(await roleOf(u.id)).toMatchObject({ role: "recepcion" });
    expect((await call("GET", "/org/bookings?per_page=1", { token: u.token })).statusCode).toBe(200);
    expect((await call("POST", `/org/join-requests/${id}/approve`, { token: owner.token, payload: {} })).statusCode).toBe(422); // ya decidida

    const log = (await pool.query<{ action: string; actor_id: string }>("SELECT action, actor_id FROM audit_log WHERE org_id = $1 AND meta->>'request_id' = $2 ORDER BY id", [orgId, id])).rows;
    expect(log).toEqual([{ action: "org.join_requested", actor_id: u.id }, { action: "org.join_request_approved", actor_id: orgAdmin.id }]);
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND title LIKE 'Aceptaron tu solicitud%'", [u.id])).rowCount).toBe(1);
  });

  it("se puede conceder un rol distinto del pedido; incorporar administradores es sólo del propietario; un guía necesita servicios", async () => {
    const wantsAdmin = await account();
    const adminReq = json(await ask(wantsAdmin.token, { role: "admin" })).data.id as string;
    expect((await call("POST", `/org/join-requests/${adminReq}/approve`, { token: orgAdmin.token, payload: {} })).statusCode).toBe(403);
    expect(await roleOf(wantsAdmin.id)).toBeUndefined();
    // La administradora sí puede admitirlo con un rol menor.
    expect(json(await call("POST", `/org/join-requests/${adminReq}/approve`, { token: orgAdmin.token, payload: { role: "recepcion" } })).data.granted_role).toBe("recepcion");
    expect(await roleOf(wantsAdmin.id)).toMatchObject({ role: "recepcion" });

    const promoted = await account();
    const second = json(await ask(promoted.token, { role: "admin" })).data.id as string;
    expect((await call("POST", `/org/join-requests/${second}/approve`, { token: owner.token, payload: {} })).statusCode).toBe(200);
    expect(await roleOf(promoted.id)).toMatchObject({ role: "admin" });

    const guide = await account();
    const guideReq = json(await ask(guide.token, { role: "guia" })).data.id as string;
    expect((await call("POST", `/org/join-requests/${guideReq}/approve`, { token: owner.token, payload: {} })).statusCode).toBe(400);
    expect((await call("POST", `/org/join-requests/${guideReq}/approve`, { token: owner.token, payload: { listing_ids: ["servicio-de-otra-org"] } })).statusCode).toBe(400);
    expect(await roleOf(guide.id)).toBeUndefined();
  });

  it("rechazar exige motivo y no da acceso; la persona puede retirar la suya y volver a pedir", async () => {
    const u = await account();
    const id = json(await ask(u.token, { role: "recepcion" })).data.id as string;
    expect((await call("POST", `/org/join-requests/${id}/reject`, { token: owner.token, payload: {} })).statusCode).toBe(400);
    expect((await call("POST", `/org/join-requests/${id}/reject`, { token: owner.token, payload: { note: "No hay vacantes por ahora" } })).statusCode).toBe(200);
    expect(await roleOf(u.id)).toBeUndefined();
    expect(json(await call("GET", "/me/org-join-requests", { token: u.token })).data[0]).toMatchObject({ status: "rejected", decision_note: "No hay vacantes por ahora" });

    const again = json(await ask(u.token, { role: "recepcion" })).data.id as string;
    const other = await account();
    expect((await call("DELETE", `/me/org-join-requests/${again}`, { token: other.token })).statusCode).toBe(404); // ajena
    expect((await call("DELETE", `/me/org-join-requests/${again}`, { token: u.token })).statusCode).toBe(204);
    expect((await call("POST", `/org/join-requests/${again}/approve`, { token: owner.token, payload: {} })).statusCode).toBe(422);
    expect(await roleOf(u.id)).toBeUndefined();
  });

  it("el listado del equipo señala a los miembros que llevan más de 90 días sin entrar (punto 86)", async () => {
    const ownerLogin = json(await call("POST", "/auth/login", { payload: { email: owner.email, password: PW } })).data.tokens.access_token as string;
    await pool.query("UPDATE refresh_tokens SET created_at = now() - interval '120 days' WHERE user_id = $1", [orgAdmin.id]);
    const team = json(await call("GET", "/org/team", { token: ownerLogin })).data as { inactive_after_days: number; members: { user_id: string; inactive: boolean; last_session_at: string | null }[] };
    expect(team.inactive_after_days).toBe(90);
    expect(team.members.find((m) => m.user_id === owner.id)).toMatchObject({ inactive: false });
    expect(team.members.find((m) => m.user_id === orgAdmin.id)).toMatchObject({ inactive: true });
    expect(team.members.find((m) => m.user_id === orgAdmin.id)!.last_session_at).toBeTruthy();
  });
});
