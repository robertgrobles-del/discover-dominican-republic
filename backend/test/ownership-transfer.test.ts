import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

describe("transferencia de propiedad de una organización (plan de accesos, punto 82)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let owner: Account, heir: Account, staff: Account, outsider: Account;
  let orgId: string;

  const call = (method: "GET" | "POST", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (): Promise<Account> => {
    const email = `ot${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Propiedad Prueba" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    return { id: reg.data.user.id, email, token: reg.data.tokens.access_token };
  };
  const roleOf = async (userId: string) => (await pool.query<{ role: string }>("SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, userId])).rows[0]?.role;
  const owners = async () => (await pool.query<{ n: number }>("SELECT count(*)::int AS n FROM org_members WHERE org_id = $1 AND role = 'owner'", [orgId])).rows[0]!.n;
  const propose = (token: string, body: object) => call("POST", "/org/ownership-transfer", { token, payload: body });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  // Cada prueba parte de una organización nueva con propietario, una administradora heredera y recepción.
  beforeEach(async () => {
    [owner, heir, staff, outsider] = [await account(), await account(), await account(), await account()];
    orgId = crypto.randomUUID();
    await pool.query("INSERT INTO partner_profiles (id, business_name, business_type, email) VALUES ($1, $2, 'operador', $3)", [orgId, `Org ${tag} ${n}`, `org${tag}${n}@test.local`]);
    await pool.query("INSERT INTO org_members (org_id, user_id, role, expires_at) VALUES ($1, $2, 'owner', NULL), ($1, $3, 'admin', now() + interval '30 days'), ($1, $4, 'recepcion', NULL)", [orgId, owner.id, heir.id, staff.id]);
  });
  afterAll(async () => {
    await pool.query("DELETE FROM partner_profiles WHERE business_name LIKE $1", [`Org ${tag}%`]);
    await pool.end();
    await app.close();
  });

  it("sólo el propietario propone, volviendo a identificarse, y sólo a alguien del equipo", async () => {
    expect((await propose(heir.token, { user_id: staff.id, password: PW })).statusCode).toBe(403);                  // no es propietaria
    const wrong = await propose(owner.token, { user_id: heir.id, password: "otra-contraseña" });
    expect(wrong.statusCode).toBe(403);
    expect(json(wrong).error.details.code).toBe("REAUTH_FAILED");
    expect(json(await propose(owner.token, { user_id: outsider.id, password: PW })).error.details.code).toBe("NOT_A_MEMBER");
    expect((await propose(owner.token, { user_id: owner.id, password: PW })).statusCode).toBe(400);

    const res = await propose(owner.token, { user_id: heir.id, password: PW });
    expect(res.statusCode).toBe(201);
    expect(json(res).data).toMatchObject({ org_id: orgId, from_user_id: owner.id, to_user_id: heir.id, status: "pending" });
    expect((await propose(owner.token, { user_id: staff.id, password: PW })).statusCode).toBe(409);                 // una sola abierta

    // Proponer no cambia nada todavía.
    expect(await roleOf(owner.id)).toBe("owner");
    expect(await roleOf(heir.id)).toBe("admin");
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND data->>'org_id' = $2", [heir.id, orgId])).rowCount).toBe(1);
  });

  it("con 2FA activo exige una sesión verificada con el segundo factor", async () => {
    await pool.query("UPDATE users SET totp_enabled_at = now(), totp_secret_enc = 'x' WHERE id = $1", [owner.id]);
    const res = await propose(owner.token, { user_id: heir.id, password: PW }); // el token de registro no pasó por 2FA
    expect(res.statusCode).toBe(403);
    expect(json(res).error.details.code).toBe("MFA_REQUIRED");
  });

  it("al aceptar, los roles cambian juntos: nunca hay cero ni dos propietarios", async () => {
    const id = json(await propose(owner.token, { user_id: heir.id, password: PW })).data.id as string;

    expect(json(await call("GET", "/org/ownership-transfer", { token: heir.token })).data).toMatchObject({ id, can_accept: true });
    expect(json(await call("GET", "/org/ownership-transfer", { token: owner.token })).data).toMatchObject({ id, can_accept: false });
    expect(json(await call("GET", "/org/ownership-transfer", { token: staff.token })).data).toBeNull();           // no le concierne

    expect((await call("POST", `/org/ownership-transfer/${id}/accept`, { token: staff.token })).statusCode).toBe(404); // no es la persona elegida
    expect((await call("POST", `/org/ownership-transfer/${id}/accept`, { token: owner.token })).statusCode).toBe(404);
    expect(await owners()).toBe(1);

    const accepted = await call("POST", `/org/ownership-transfer/${id}/accept`, { token: heir.token });
    expect(accepted.statusCode).toBe(200);
    expect(await roleOf(heir.id)).toBe("owner");
    expect(await roleOf(owner.id)).toBe("admin");
    expect(await owners()).toBe(1);
    // El nuevo propietario no puede conservar una fecha de fin de acceso.
    expect((await pool.query("SELECT expires_at FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, heir.id])).rows[0].expires_at).toBeNull();

    expect((await call("POST", `/org/ownership-transfer/${id}/accept`, { token: heir.token })).statusCode).toBe(422); // ya aceptada
    // Los permisos siguen al rol: la nueva propietaria gestiona el equipo y el anterior ya no puede proponer.
    expect((await call("GET", "/org/team", { token: heir.token })).statusCode).toBe(200);
    expect((await propose(owner.token, { user_id: staff.id, password: PW })).statusCode).toBe(403);

    const log = (await pool.query<{ action: string; actor_id: string }>("SELECT action, actor_id FROM audit_log WHERE org_id = $1 AND action LIKE 'org.ownership%' ORDER BY id", [orgId])).rows;
    expect(log).toEqual([{ action: "org.ownership_transfer_proposed", actor_id: owner.id }, { action: "org.ownership_transferred", actor_id: heir.id }]);
  });

  it("rechazar o retirar la cierra sin cambiar roles y deja proponer otra", async () => {
    const first = json(await propose(owner.token, { user_id: heir.id, password: PW })).data.id as string;
    expect(json(await call("POST", `/org/ownership-transfer/${first}/close`, { token: heir.token })).data.status).toBe("declined");
    expect(await roleOf(owner.id)).toBe("owner");

    const second = json(await propose(owner.token, { user_id: staff.id, password: PW })).data.id as string;
    expect((await call("POST", `/org/ownership-transfer/${second}/close`, { token: heir.token })).statusCode).toBe(404); // ajena
    expect(json(await call("POST", `/org/ownership-transfer/${second}/close`, { token: owner.token })).data.status).toBe("cancelled");
    expect((await call("POST", `/org/ownership-transfer/${second}/accept`, { token: staff.token })).statusCode).toBe(422);
    expect(await owners()).toBe(1);
  });

  it("una propuesta vencida, o hecha antes de que cambiara el equipo, no se puede aceptar", async () => {
    const expired = json(await propose(owner.token, { user_id: heir.id, password: PW })).data.id as string;
    await pool.query("UPDATE org_ownership_transfers SET expires_at = now() - interval '1 minute' WHERE id = $1", [expired]);
    expect((await call("POST", `/org/ownership-transfer/${expired}/accept`, { token: heir.token })).statusCode).toBe(422);
    expect((await pool.query("SELECT status FROM org_ownership_transfers WHERE id = $1", [expired])).rows[0].status).toBe("expired");

    // La persona elegida salió del equipo antes de aceptar: ya no es miembro y no puede entrar al panel.
    const stale = json(await propose(owner.token, { user_id: staff.id, password: PW })).data.id as string;
    await pool.query("DELETE FROM org_members WHERE org_id = $1 AND user_id = $2", [orgId, staff.id]);
    expect((await call("POST", `/org/ownership-transfer/${stale}/accept`, { token: staff.token })).statusCode).toBe(403);
    expect(await roleOf(owner.id)).toBe("owner");
    expect(await owners()).toBe(1);
  });
});
