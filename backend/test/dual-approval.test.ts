import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const REASON = "Necesita administrar el portal durante el lanzamiento";

describe("doble aprobación de operaciones críticas (plan de accesos, puntos 17, 53 y 97)", () => {
  let app: FastifyInstance;      // con DUAL_APPROVAL_REQUIRED=true
  let relaxed: FastifyInstance;  // configuración por omisión
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let alice: Account, bob: Account;

  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; on?: FastifyInstance } = {}) =>
    (opts.on ?? app).inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const account = async (role?: string): Promise<Account> => {
    const email = `da${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Aprobación Prueba" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, email, token: role ? await login(email) : (reg.data.tokens.access_token as string) };
  };
  const roles = async (id: string) => (await pool.query<{ role: string }>("SELECT role::text FROM user_roles WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now()) ORDER BY role", [id])).rows.map((r) => r.role);
  const request = (token: string, body: object) => call("POST", "/admin/approvals", { token, payload: body });

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    app = await makeApp({ DUAL_APPROVAL_REQUIRED: "true" });
    relaxed = await makeApp();
    alice = await account("admin");
    bob = await account("admin");
  });
  afterAll(async () => {
    await pool.query("DELETE FROM approval_requests WHERE reason LIKE $1", [`%${tag}%`]);
    await pool.end();
    await app.close();
    await relaxed.close();
  });

  it("con la doble aprobación activa, las rutas directas se niegan", async () => {
    const u = await account();
    const direct = await call("PUT", `/admin/users/${u.id}/roles`, { token: alice.token, payload: { roles: ["user", "admin"] } });
    expect(direct.statusCode).toBe(422);
    expect(json(direct).error.details).toMatchObject({ code: "DUAL_APPROVAL_REQUIRED", kind: "grant_admin" });
    expect(await roles(u.id)).toEqual(["user"]);
    // Otros roles no son críticos y siguen su curso normal.
    expect((await call("PUT", `/admin/users/${u.id}/roles`, { token: alice.token, payload: { roles: ["user", "editor"] } })).statusCode).toBe(200);

    expect(json(await call("POST", `/admin/users/${u.id}/2fa/reset`, { token: alice.token, payload: { reason: "Perdió el teléfono" } })).error.details.code).toBe("DUAL_APPROVAL_REQUIRED");
    expect(json(await call("POST", `/admin/payouts/${crypto.randomUUID()}/mark-paid`, { token: alice.token, payload: { reference: "TRX-1" } })).error.details.code).toBe("DUAL_APPROVAL_REQUIRED");
  });

  it("sin activarla, todo sigue como antes", async () => {
    const u = await account();
    // Cada instancia firma con sus propias claves de desarrollo: se inicia sesión contra la que se va a usar.
    const token = json(await call("POST", "/auth/login", { payload: { email: alice.email, password: PW }, on: relaxed })).data.tokens.access_token as string;
    expect((await call("PUT", `/admin/users/${u.id}/roles`, { token, payload: { roles: ["user", "admin"] }, on: relaxed })).statusCode).toBe(200);
    expect(await roles(u.id)).toEqual(["admin", "user"]);
  });

  it("conceder administración exige que otra persona apruebe; quien solicita no puede aprobarse", async () => {
    const u = await account();
    const session = await login(u.email);
    expect((await request(u.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}` })).statusCode).toBe(403);       // no es admin
    expect((await request(alice.token, { kind: "grant_admin", target_id: alice.id, reason: `${REASON} ${tag}` })).statusCode).toBe(403); // sobre sí misma
    expect((await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: "corto" })).statusCode).toBe(400);
    expect((await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}`, payload: { cualquier: "cosa" } })).statusCode).toBe(400);

    const created = await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}` });
    expect(created.statusCode).toBe(201);
    const id = json(created).data.id as string;
    expect((await request(bob.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}` })).statusCode).toBe(409); // ya hay una abierta

    // La otra administradora recibe el aviso y la ve como decidible; la solicitante no.
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND data->>'approval_id' = $2", [bob.id, id])).rowCount).toBe(1);
    const seenByAlice = json(await call("GET", "/admin/approvals?status=pending", { token: alice.token }));
    expect(seenByAlice.data.find((x: { id: string }) => x.id === id).can_decide).toBe(false);
    expect(seenByAlice.meta.dual_approval_required).toBe(true);
    expect(json(await call("GET", "/admin/approvals?status=pending", { token: bob.token })).data.find((x: { id: string }) => x.id === id).can_decide).toBe(true);

    const self = await call("POST", `/admin/approvals/${id}/approve`, { token: alice.token, payload: {} });
    expect(self.statusCode).toBe(403);
    expect(json(self).error.details.code).toBe("SELF_APPROVAL");
    expect(await roles(u.id)).toEqual(["user"]);

    expect((await call("POST", `/admin/approvals/${id}/approve`, { token: bob.token, payload: { note: "Verificado con el equipo" } })).statusCode).toBe(200);
    expect(await roles(u.id)).toEqual(["admin", "user"]);
    expect((await call("GET", "/auth/me", { token: session })).statusCode).toBe(401); // sus sesiones se cerraron al cambiar el rol
    expect((await call("POST", `/admin/approvals/${id}/approve`, { token: bob.token, payload: {} })).statusCode).toBe(422); // no se decide dos veces

    const log = (await pool.query<{ action: string; actor_id: string }>("SELECT action, actor_id FROM audit_log WHERE (entity_type = 'approval_request' AND entity_id = $1) OR (action = 'user.admin_granted' AND entity_id = $2) ORDER BY id", [id, u.id])).rows;
    expect(log.map((l) => l.action)).toEqual(["approval.requested", "approval.approved", "user.admin_granted"]);
    expect(log[0]!.actor_id).toBe(alice.id);
    expect(log[1]!.actor_id).toBe(bob.id);
  });

  it("la administración temporal también pasa por aprobación y vence sola", async () => {
    const u = await account();
    const id = json(await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: `Guardia de fin de semana ${tag}`, payload: { hours: 12 } })).data.id;
    expect((await call("POST", `/admin/approvals/${id}/approve`, { token: bob.token, payload: {} })).statusCode).toBe(200);
    const row = (await pool.query<{ expires_at: Date; granted_by: string }>("SELECT expires_at, granted_by FROM user_roles WHERE user_id = $1 AND role = 'admin'", [u.id])).rows[0]!;
    expect(row.granted_by).toBe(alice.id);
    expect(row.expires_at.getTime()).toBeGreaterThan(Date.now() + 11 * 3_600_000);
    expect(row.expires_at.getTime()).toBeLessThan(Date.now() + 13 * 3_600_000);
  });

  it("rechazar exige motivo y no ejecuta nada; cancelar sólo lo hace quien solicitó", async () => {
    const u = await account();
    const id = json(await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}` })).data.id;
    expect((await call("POST", `/admin/approvals/${id}/reject`, { token: bob.token, payload: {} })).statusCode).toBe(400);
    expect((await call("POST", `/admin/approvals/${id}/reject`, { token: bob.token, payload: { note: "No corresponde a su función" } })).statusCode).toBe(200);
    expect(await roles(u.id)).toEqual(["user"]);
    expect((await pool.query("SELECT status, decision_note FROM approval_requests WHERE id = $1", [id])).rows[0]).toMatchObject({ status: "rejected", decision_note: "No corresponde a su función" });

    const again = json(await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}` })).data.id;
    expect((await call("POST", `/admin/approvals/${again}/cancel`, { token: bob.token })).statusCode).toBe(404);
    expect((await call("POST", `/admin/approvals/${again}/cancel`, { token: alice.token })).statusCode).toBe(204);
    expect((await call("POST", `/admin/approvals/${again}/approve`, { token: bob.token, payload: {} })).statusCode).toBe(422);
  });

  it("una solicitud vencida ya no se puede aprobar", async () => {
    const u = await account();
    const id = json(await request(alice.token, { kind: "grant_admin", target_id: u.id, reason: `${REASON} ${tag}` })).data.id;
    await pool.query("UPDATE approval_requests SET expires_at = now() - interval '1 minute' WHERE id = $1", [id]);
    expect((await call("POST", `/admin/approvals/${id}/approve`, { token: bob.token, payload: {} })).statusCode).toBe(422);
    expect((await pool.query("SELECT status FROM approval_requests WHERE id = $1", [id])).rows[0].status).toBe("expired");
    expect(await roles(u.id)).toEqual(["user"]);
  });

  it("restablecer 2FA por aprobación desactiva el segundo factor y cierra sesiones", async () => {
    const u = await account();
    expect((await request(alice.token, { kind: "reset_2fa", target_id: u.id, reason: `Perdió el teléfono ${tag}` })).statusCode).toBe(422); // no tiene 2FA
    await pool.query("UPDATE users SET totp_enabled_at = now(), totp_secret_enc = 'x' WHERE id = $1", [u.id]);
    const id = json(await request(alice.token, { kind: "reset_2fa", target_id: u.id, reason: `Perdió el teléfono ${tag}` })).data.id;
    expect((await call("POST", `/admin/approvals/${id}/approve`, { token: bob.token, payload: {} })).statusCode).toBe(200);
    expect((await pool.query("SELECT totp_enabled_at, totp_secret_enc FROM users WHERE id = $1", [u.id])).rows[0]).toEqual({ totp_enabled_at: null, totp_secret_enc: null });
    expect((await pool.query("SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL", [u.id])).rowCount).toBe(0);
  });

  it("la base de datos impide que la misma persona figure como solicitante y aprobadora", async () => {
    const u = await account();
    await expect(pool.query("INSERT INTO approval_requests (kind, target_id, reason, requested_by, decided_by, status) VALUES ('grant_admin', $1, $2, $3, $3, 'approved')", [u.id, `directo ${tag}`, alice.id]))
      .rejects.toThrow(/chk_approval_distinct_people/);
  });
});
