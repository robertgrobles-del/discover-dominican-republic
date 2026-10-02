import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

describe("invitaciones de personal interno (plan de accesos, punto 17)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let admin: Account;

  const call = (method: "GET" | "POST" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const account = async (opts: { role?: string; verified?: boolean; email?: string } = {}): Promise<Account> => {
    const email = opts.email ?? `si${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Invitada Prueba" } }));
    const id = reg.data.user.id as string;
    if (opts.verified !== false) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (opts.role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, opts.role]);
    return { id, email, token: opts.role ? await login(email) : (reg.data.tokens.access_token as string) };
  };
  const invite = (email: string, role: string, token = admin.token) => call("POST", "/admin/staff-invitations", { token, payload: { email, role } });
  const hasRole = async (id: string, role: string) => !!(await pool.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = $2::app_role", [id, role])).rowCount;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account({ role: "admin" });
  });
  afterAll(async () => {
    await pool.query("DELETE FROM staff_invitations WHERE email LIKE $1", [`%${tag}%`]);
    await pool.end();
    await app.close();
  });

  it("sólo un administrador invita, y sólo a editor o moderador", async () => {
    const editor = await account({ role: "editor" });
    expect((await invite(`nueva${tag}@test.local`, "moderator", editor.token)).statusCode).toBe(403);
    expect((await invite(`nueva${tag}@test.local`, "admin")).statusCode).toBe(400); // admin exige doble aprobación
    expect((await invite("no-es-correo", "editor")).statusCode).toBe(400);

    const res = await invite(`Nueva${tag}@Test.Local`, "moderator");
    expect(res.statusCode).toBe(201);
    expect(json(res).data).toMatchObject({ email: `nueva${tag}@test.local`, role: "moderator", expires_in_days: 7 });
    expect((await invite(`nueva${tag}@test.local`, "editor")).statusCode).toBe(409); // ya hay una abierta para ese correo
    expect((await invite(editor.email, "editor")).statusCode).toBe(409);             // ya tiene el rol

    // Invitar no concede nada y el token no se guarda en claro.
    const row = (await pool.query("SELECT token_hash, invited_by FROM staff_invitations WHERE email = $1", [`nueva${tag}@test.local`])).rows[0];
    expect(row.invited_by).toBe(admin.id);
    expect(row.token_hash).not.toBe(json(res).data.token);
    expect((await pool.query("SELECT 1 FROM email_log WHERE to_email = $1", [`nueva${tag}@test.local`])).rowCount).toBe(1);
  });

  it("la vista previa muestra el rol; aceptar exige la cuenta del correo invitado y con correo verificado", async () => {
    const email = `acepta${tag}@test.local`;
    const token = json(await invite(email, "editor")).data.token as string;
    expect(json(await call("GET", `/staff-invitations/${token}`)).data).toMatchObject({ email, role: "editor" });
    expect((await call("GET", "/staff-invitations/token-inventado")).statusCode).toBe(404);
    expect((await call("POST", `/staff-invitations/${token}/accept`)).statusCode).toBe(401);

    const other = await account();
    const wrong = await call("POST", `/staff-invitations/${token}/accept`, { token: other.token });
    expect(wrong.statusCode).toBe(403);
    expect(json(wrong).error.details.reason).toBe("EMAIL_MISMATCH");

    const invited = await account({ email, verified: false });
    const unverified = await call("POST", `/staff-invitations/${token}/accept`, { token: invited.token });
    expect(unverified.statusCode).toBe(403);
    expect(json(unverified).error.details.reason).toBe("EMAIL_NOT_VERIFIED");
    expect(await hasRole(invited.id, "editor")).toBe(false);

    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [invited.id]);
    const accepted = await call("POST", `/staff-invitations/${token}/accept`, { token: invited.token });
    expect(accepted.statusCode).toBe(200);
    expect(await hasRole(invited.id, "editor")).toBe(true);
    // El rol entra en un token nuevo.
    expect(json(await call("GET", "/auth/me", { token: await login(email) })).data.roles).toEqual(["editor", "user"]);

    expect((await call("POST", `/staff-invitations/${token}/accept`, { token: invited.token })).statusCode).toBe(404); // de un solo uso
    const log = (await pool.query<{ action: string; actor_id: string }>("SELECT action, actor_id FROM audit_log WHERE action LIKE 'staff.%' AND (meta->>'email' = $1 OR entity_id = $2) ORDER BY id", [email, invited.id])).rows;
    expect(log).toEqual([{ action: "staff.invited", actor_id: admin.id }, { action: "staff.invitation_accepted", actor_id: invited.id }]);
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND title LIKE $2", [admin.id, `${email} aceptó%`])).rowCount).toBe(1);
  });

  it("una invitación revocada o vencida no se puede aceptar; tras vencer se puede invitar de nuevo", async () => {
    const revokedEmail = `revocada${tag}@test.local`;
    const revokedToken = json(await invite(revokedEmail, "moderator")).data.token as string;
    const listed = json(await call("GET", "/admin/staff-invitations", { token: admin.token })).data.find((i: { email: string }) => i.email === revokedEmail);
    expect(listed.status).toBe("open");
    expect((await call("DELETE", `/admin/staff-invitations/${listed.id}`, { token: admin.token })).statusCode).toBe(204);
    expect((await call("DELETE", `/admin/staff-invitations/${listed.id}`, { token: admin.token })).statusCode).toBe(404);
    const person = await account({ email: revokedEmail });
    expect((await call("POST", `/staff-invitations/${revokedToken}/accept`, { token: person.token })).statusCode).toBe(404);
    expect(await hasRole(person.id, "moderator")).toBe(false);

    const expiredEmail = `vencida${tag}@test.local`;
    const expiredToken = json(await invite(expiredEmail, "editor")).data.token as string;
    await pool.query("UPDATE staff_invitations SET expires_at = now() - interval '1 minute' WHERE email = $1", [expiredEmail]);
    const late = await account({ email: expiredEmail });
    expect((await call("POST", `/staff-invitations/${expiredToken}/accept`, { token: late.token })).statusCode).toBe(404);
    expect(json(await call("GET", "/admin/staff-invitations", { token: admin.token })).data.find((i: { email: string }) => i.email === expiredEmail).status).toBe("expired");
    expect((await invite(expiredEmail, "editor")).statusCode).toBe(201);
  });
});
