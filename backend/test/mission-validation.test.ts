import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `mv${Date.now().toString(36)}${n++}@test.local`;
const tag = Date.now().toString(36);

/** Retos patrocinados que la empresa valida escaneando el QR del viajero (panel de Operadores). */
describe("retos validados por el patrocinador", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  let owner: { token: string; id: string };
  let staff: { token: string; id: string };
  let rival: { token: string; id: string };
  let orgId: string;

  const call = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async () => {
    const res = json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true, display_name: "Viajero Prueba" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string };
  };
  const createMission = (payload: Record<string, unknown>) => call("POST", "/admin/gamification/missions", { token: admin, payload: { mission_type: "daily", xp_reward: 40, coin_reward: 5, ...payload } });
  const qrMission = async (extra: Record<string, unknown> = {}) =>
    json(await createMission({ name: `QR ${tag} ${n++}`, description: "Pide el jugo en caja", target_action: "sponsor_validated", requires_validation: true, sponsor_id: orgId, ...extra })).data.id as string;
  const codeFor = async (token: string, missionId: string) => json(await call("POST", `/gamification/missions/${missionId}/validation-code`, { token })).data.code as string;
  const validate = (token: string, code: string) => call("POST", "/org/missions/validate", { token, payload: { code } });
  const xpOf = async (userId: string) => Number((await pool.query("SELECT coalesce((SELECT total_xp FROM user_gamification WHERE user_id = $1), 0) AS xp", [userId])).rows[0].xp);

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email: (await pool.query("SELECT email FROM users WHERE id = $1", [a.id])).rows[0].email, password: PW } })).data.tokens.access_token;
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Jugos ${tag}` } })).data.id;
    staff = await signup();
    await pool.query("INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'recepcion')", [orgId, staff.id]);
    rival = await signup();
    await call("POST", "/orgs", { token: rival.token, payload: { business_name: `Rival ${tag}` } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("el admin crea el reto con la empresa y sus campos; sin empresa no se puede validar con QR", async () => {
    expect((await createMission({ name: `Sin empresa ${tag}`, target_action: "sponsor_validated", requires_validation: true })).statusCode).toBe(400);
    expect((await createMission({ name: `Fechas ${tag}`, target_action: "spot_visited", starts_on: "2026-05-10", ends_on: "2026-05-01" })).statusCode).toBe(400);
    const res = json(await createMission({ name: `Completo ${tag}`, description: "x", target_action: "sponsor_validated", requires_validation: true, sponsor_id: orgId, max_completions: 5, place_name: "Malecón", province: "Puerto Plata", difficulty: "facil", estimated_minutes: 20 }));
    expect(res.data).toMatchObject({ requires_validation: true, is_sponsored: true, sponsor_name: `Jugos ${tag}`, target_action: "sponsor_validated", max_completions: 5, difficulty: "facil" });
    const orgs = json(await call("GET", "/admin/gamification/sponsor-orgs", { token: admin })).data as { id: string }[];
    expect(orgs.some((o) => o.id === orgId)).toBe(true);
  });

  it("el equipo de la empresa valida el QR, el viajero recibe los puntos y el código no se reutiliza", async () => {
    const mission = await qrMission();
    const traveler = await signup();
    const code = await codeFor(traveler.token, mission);
    expect(code).toMatch(/^[A-Z2-9]{10}$/);
    expect(await codeFor(traveler.token, mission)).toBe(code); // sigue vigente: el mismo

    expect((await validate(rival.token, code)).statusCode).toBe(404); // otra empresa no lo ve
    const before = await xpOf(traveler.id);
    const ok = json(await validate(staff.token, `DRRETO:${code}`));
    expect(ok.data).toMatchObject({ traveler: "Viajero P.", xp: 40, coins: 5 });
    expect(await xpOf(traveler.id)).toBe(before + 40);
    expect((await validate(staff.token, code)).statusCode).toBe(409);

    const list = json(await call("GET", "/gamification/missions", { token: traveler.token })).data as { id: string; completed: boolean }[];
    expect(list.find((m) => m.id === mission)?.completed).toBe(true);
    expect((await call("POST", `/gamification/missions/${mission}/validation-code`, { token: traveler.token })).statusCode).toBe(409);
    const own = json(await call("GET", "/org/missions", { token: owner.token })).data as { id: string; completions_count: number; validated_today: number }[];
    expect(own.find((m) => m.id === mission)).toMatchObject({ completions_count: 1, validated_today: 1 });
  });

  it("nadie del equipo valida su propio reto, y un código caducado no sirve", async () => {
    const mission = await qrMission();
    expect((await validate(staff.token, await codeFor(staff.token, mission))).statusCode).toBe(403);

    const traveler = await signup();
    const code = await codeFor(traveler.token, mission);
    await pool.query("UPDATE mission_validation_codes SET expires_at = now() - interval '1 second' WHERE code = $1", [code]);
    expect((await validate(staff.token, code)).statusCode).toBe(422);
    const fresh = await codeFor(traveler.token, mission);
    expect(fresh).not.toBe(code);
    expect((await validate(staff.token, fresh)).statusCode).toBe(200);
  });

  it("respeta el cupo y la vigencia, y un reto con QR no avanza con acciones de la app", async () => {
    const mission = await qrMission({ max_completions: 1 });
    const [a, b] = [await signup(), await signup()];
    const codeB = await codeFor(b.token, mission);
    expect((await validate(staff.token, await codeFor(a.token, mission))).statusCode).toBe(200);
    expect((await validate(staff.token, codeB)).statusCode).toBe(422); // cupo agotado
    expect((await call("POST", `/gamification/missions/${mission}/validation-code`, { token: (await signup()).token })).statusCode).toBe(422);
    const visible = json(await call("GET", "/gamification/missions", { token: b.token })).data as { id: string }[];
    expect(visible.some((m) => m.id === mission)).toBe(false);

    const future = await qrMission({ starts_on: "2099-01-01" });
    expect((await call("POST", `/gamification/missions/${future}/validation-code`, { token: a.token })).statusCode).toBe(404);

    // Misión automática con cupo: el cupo también se respeta al completarse sola.
    const auto = json(await createMission({ name: `Auto ${tag}`, target_action: "share", max_completions: 1 })).data.id as string;
    const [c, d] = [await signup(), await signup()];
    await call("POST", "/gamification/actions", { token: c.token, payload: { action: "share" } });
    await call("POST", "/gamification/actions", { token: d.token, payload: { action: "share" } });
    const done = (await pool.query("SELECT count(*)::int AS n FROM user_missions WHERE mission_id = $1 AND is_completed", [auto])).rows[0].n;
    expect(done).toBe(1);
  });
});
