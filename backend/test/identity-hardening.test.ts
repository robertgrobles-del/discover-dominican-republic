import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `ih${Date.now().toString(36)}${n++}@test.local`;
const REASON = "Revisión de seguridad solicitada por el equipo";

describe("endurecimiento de identidad (regresiones de auditoría)", () => {
  let app: FastifyInstance, dual: FastifyInstance;
  let pool: pg.Pool;
  const call = (a: FastifyInstance, method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    a.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string, a: FastifyInstance = app) => {
    const email = uniq();
    const reg = json(await call(a, "POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona" } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call(a, "POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string, email };
  };
  const plant = async (userId: string) => {
    await pool.query("INSERT INTO oauth_identities (user_id, provider, subject, email) VALUES ($1, 'google', $2, 'otro@test.local')", [userId, `sub-${userId}`]);
    await pool.query("UPDATE users SET totp_secret_enc = 'x', totp_enabled_at = now(), totp_recovery_hashes = '{a}' WHERE id = $1", [userId]);
  };
  const planted = async (userId: string) => ({
    identities: (await pool.query("SELECT 1 FROM oauth_identities WHERE user_id = $1", [userId])).rowCount,
    totp: (await pool.query("SELECT totp_enabled_at FROM users WHERE id = $1", [userId])).rows[0].totp_enabled_at,
  });

  beforeAll(async () => {
    app = await makeApp({ LOGIN_MAX_FAILURES: "5" });
    dual = await makeApp({ DUAL_APPROVAL_REQUIRED: "true" });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  afterAll(async () => { await pool.end(); await Promise.all([app.close(), dual.close()]); });

  it("anular una cuenta sin verificar elimina el proveedor y el 2FA que dejó su creador", async () => {
    const u = await account();
    await plant(u.id);
    await app.auth.neutralizeUnverifiedAccount(u.id);
    expect(await planted(u.id)).toEqual({ identities: 0, totp: null });
  });

  it("restablecer la contraseña de una cuenta sin verificar elimina credenciales plantadas; con correo verificado las conserva", async () => {
    const reset = async (email: string) => {
      await app.mailer.drain();
      await call(app, "POST", "/auth/forgot-password", { payload: { email } });
      await app.mailer.drain();
      const mail = [...app.mailer.outbox].reverse().find((m) => m.to === email && m.template === "auth.reset_password")!;
      const token = /token=([^\s&"]+)/.exec(mail.text)![1]!;
      expect((await call(app, "POST", "/auth/reset-password", { payload: { token: decodeURIComponent(token), password: "Otra-Clave-Segura-2026!" } })).statusCode).toBeLessThan(300);
    };
    const u = await account();
    await plant(u.id);
    await reset(u.email);
    expect(await planted(u.id)).toEqual({ identities: 0, totp: null });

    const v = await account();
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [v.id]);
    await plant(v.id);
    await reset(v.email);
    expect((await planted(v.id)).identities).toBe(1);
    expect((await planted(v.id)).totp).not.toBeNull();
  });

  it("los fallos concurrentes cuentan todos y bloquean la cuenta", async () => {
    const u = await account();
    await Promise.all(Array.from({ length: 20 }, () => call(app, "POST", "/auth/login", { payload: { email: u.email, password: "Incorrecta-123456!" } })));
    const row = (await pool.query("SELECT locked_until FROM users WHERE id = $1", [u.id])).rows[0];
    expect(row.locked_until).not.toBeNull();
  });

  it("el payload con enlaces de un solo uso se borra al entregar el correo", async () => {
    const u = await account();
    await call(app, "POST", "/auth/forgot-password", { payload: { email: u.email } });
    await app.mailer.drain();
    const row = (await pool.query("SELECT status, payload FROM email_log WHERE to_email = $1 AND template = 'auth.reset_password' ORDER BY created_at DESC LIMIT 1", [u.email])).rows[0];
    expect(row).toEqual({ status: "sent", payload: null });
  });

  it("si la auditoría del restablecimiento de 2FA falla, el 2FA y las sesiones quedan intactos", async () => {
    const a = await account("admin");
    const u = await account();
    await pool.query("UPDATE users SET totp_secret_enc = 'x', totp_enabled_at = now() WHERE id = $1", [u.id]);
    const res = await app.inject({ method: "POST", url: `/api/v1/admin/users/${u.id}/2fa/reset`, headers: { authorization: `Bearer ${a.token}`, "content-type": "application/json" }, payload: '{"reason":"abcde\\u0000"}' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect((await pool.query("SELECT totp_enabled_at FROM users WHERE id = $1", [u.id])).rows[0].totp_enabled_at).not.toBeNull();
    expect((await pool.query("SELECT count(*)::int AS n FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL", [u.id])).rows[0].n).toBeGreaterThan(0);
    // Control: un motivo válido sí restablece y deja la auditoría.
    expect((await call(app, "POST", `/admin/users/${u.id}/2fa/reset`, { token: a.token, payload: { reason: REASON } })).statusCode).toBe(204);
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'user.2fa_reset' AND entity_id = $1", [u.id])).rowCount).toBe(1);
  });

  it("degradar a un admin cierra las sesiones de soporte que abrió", async () => {
    const a = await account("admin"), b = await account("admin"), u = await account();
    const s = json(await call(app, "POST", `/admin/users/${u.id}/impersonate`, { token: a.token, payload: { reason: REASON } })).data.access_token as string;
    expect((await call(app, "GET", "/auth/me", { token: s })).statusCode).toBe(200);
    expect((await call(app, "PUT", `/admin/users/${a.id}/roles`, { token: b.token, payload: { roles: ["user"] } })).statusCode).toBe(200);
    expect((await call(app, "GET", "/auth/me", { token: s })).statusCode).toBe(401);
    expect((await pool.query("SELECT count(*)::int AS n FROM support_sessions WHERE admin_id = $1 AND ended_at IS NULL", [a.id])).rows[0].n).toBe(0);
  });

  it("con doble aprobación, convertir un admin temporal (o vencido) en permanente exige aprobación", async () => {
    const a = await account("admin", dual), u = await account(), w = await account();
    await pool.query("INSERT INTO user_roles (user_id, role, expires_at) VALUES ($1, 'admin', now() + interval '1 hour')", [u.id]);
    await pool.query("INSERT INTO user_roles (user_id, role, expires_at) VALUES ($1, 'admin', now() - interval '1 hour')", [w.id]);
    for (const t of [u, w]) {
      const res = await call(dual, "PUT", `/admin/users/${t.id}/roles`, { token: a.token, payload: { roles: ["admin", "user"] } });
      expect(json(res).error?.details?.code, res.body).toBe("DUAL_APPROVAL_REQUIRED");
      expect((await pool.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'admin' AND expires_at IS NULL", [t.id])).rowCount).toBe(0);
    }
  });
});
