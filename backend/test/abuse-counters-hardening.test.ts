import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const tag = Date.now().toString(36);
const uniq = () => `ab${tag}${n++}@test.local`;

/** Contadores públicos (videos, anuncios) y presupuestos compartidos (IA) frente a llamadas repetidas o anónimas. */
describe("contadores y presupuestos frente a abuso", () => {
  let app: FastifyInstance, aiApp: FastifyInstance;
  let pool: pg.Pool;
  let admin: { id: string; token: string };
  const call = (a: FastifyInstance, method: "GET" | "POST" | "PATCH", url: string, opts: { token?: string; payload?: unknown; ip?: string } = {}) =>
    a.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, remoteAddress: opts.ip, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call(app, "POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    const id = reg.data.user.id as string;
    if (!role) return { id, token: reg.data.tokens.access_token as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, token: json(await call(app, "POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string };
  };

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    app = await makeApp();
    aiApp = await makeApp({ AI_PROVIDER: "fake", AI_DAILY_LIMIT_USER: "3", AI_DAILY_BUDGET_USD: "100" });
    admin = await account("admin");
  });
  afterAll(async () => { await pool.end(); await Promise.all([app.close(), aiApp.close()]); });

  describe("eventos de video", () => {
    let creatorId: string, published: string, pending: string;
    beforeAll(async () => {
      creatorId = (await account()).id;
      await pool.query("INSERT INTO creator_profiles (id, handle, display_name, status, approved_at) VALUES ($1, $2, 'Creadora', 'approved', now())", [creatorId, `ab${tag}`]);
      const video = async (status: string) => (await pool.query<{ id: string }>(
        "INSERT INTO creator_videos (creator_id, title, slug, video_url, duration_seconds, file_size_bytes, status) VALUES ($1, 'Video', $2, 'https://cdn.example/v.mp4', 30, 1000, $3) RETURNING id",
        [creatorId, `v-${tag}-${status}-${n++}`, status],
      )).rows[0]!.id;
      published = await video("published");
      pending = await video("pending_review");
    });
    const counters = async (id: string) => (await pool.query("SELECT views_count::int AS views, likes_count AS likes, shares_count AS shares FROM creator_videos WHERE id = $1", [id])).rows[0];

    it("un mismo visitante suma una vez aunque repita la llamada", async () => {
      for (let i = 0; i < 5; i++) {
        expect((await call(app, "POST", `/creators/videos/${published}/events`, { ip: "203.0.113.10", payload: { event_type: "like", session_id: `sess-${i}xxxx` } })).statusCode).toBe(200);
        await call(app, "POST", `/creators/videos/${published}/events`, { ip: "203.0.113.10", payload: { event_type: "view_start" } });
      }
      await call(app, "POST", `/creators/videos/${published}/events`, { ip: "203.0.113.11", payload: { event_type: "like" } });
      expect(await counters(published)).toMatchObject({ views: 1, likes: 2 });
    });

    it("no acepta 'conversion' del cliente, tiempos absurdos ni videos sin publicar", async () => {
      expect((await call(app, "POST", `/creators/videos/${published}/events`, { payload: { event_type: "conversion" } })).statusCode).toBe(400);
      expect((await call(app, "POST", `/creators/videos/${published}/events`, { payload: { event_type: "view_start", watch_time_seconds: 3_000_000_000 } })).statusCode).toBe(400);
      expect((await call(app, "POST", `/creators/videos/${pending}/events`, { payload: { event_type: "like" } })).statusCode).toBe(404);
      expect(await counters(pending)).toMatchObject({ views: 0, likes: 0 });
    });

    it("las transacciones paralelas no dejan conexiones a medias", async () => {
      const res = await Promise.all(Array.from({ length: 12 }, (_, i) => call(app, "POST", `/creators/videos/${published}/events`, { ip: `198.51.100.${i}`, payload: { event_type: "share" } })));
      expect(res.every((r) => r.statusCode === 200)).toBe(true);
      expect((await counters(published)).shares).toBe(12);
    });

    it("los enlaces del creador sólo admiten http(s)", async () => {
      const u = await account();
      const res = await call(app, "POST", "/creators/onboarding", { token: u.token, payload: { handle: `abx${tag}`, display_name: "Prueba", avatar_url: "javascript:alert(1)" } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("patrocinio", () => {
    const slot = "home_hero_banner";
    const campaign = async (token: string, extra: object = {}) => json(await call(app, "POST", "/sponsorship/campaigns", { token, payload: {
      advertiser_name: "Anunciante", advertiser_email: "ads@test.local", campaign_name: `Campaña ${n++}`, billing_type: "cpc", budget_total: 10, cpc_rate: 5,
      starts_at: new Date(Date.now() - 86_400_000).toISOString(), ends_at: new Date(Date.now() + 86_400_000).toISOString(), ...extra,
    } })).data.id as string;
    const creative = async (token: string, id: string) => call(app, "POST", `/sponsorship/campaigns/${id}/creatives`, { token, payload: { slot_id: slot, title: "Anuncio de prueba", target_url: "https://anunciante.example", badge_label: "Oficial" } });
    const approve = (id: string) => call(app, "PATCH", `/admin/sponsorship/campaigns/${id}/status`, { token: admin.token, payload: { status: "active" } });
    const status = async (id: string) => (await pool.query("SELECT status FROM sponsorship_campaigns WHERE id = $1", [id])).rows[0].status;

    it("un anuncio añadido tras la aprobación devuelve la campaña a revisión", async () => {
      const owner = await account();
      const id = await campaign(owner.token);
      expect((await creative(owner.token, id)).statusCode).toBe(201);
      await approve(id);
      expect(await status(id)).toBe("active");
      expect((await creative(owner.token, id)).statusCode).toBe(201);
      expect(await status(id)).toBe("pending_approval");
    });

    it("los clics repetidos de un mismo visitante no gastan presupuesto", async () => {
      const owner = await account();
      const id = await campaign(owner.token);
      const cr = json(await creative(owner.token, id)).data.id as string;
      const click = (ip: string, slot_id = slot) => call(app, "POST", "/sponsorship/telemetry", { ip, payload: { creative_id: cr, slot_id, event_type: "click", session_id: "aaaaaaaa" } });
      // Campaña sin aprobar: no se cobra nada.
      expect((await click("192.0.2.1")).statusCode).toBe(404);
      await approve(id);
      expect((await click("192.0.2.1", "search_top")).statusCode).toBe(404);
      expect(json(await click("192.0.2.1")).data.recorded).toBe(true);
      expect(json(await click("192.0.2.1")).data.recorded).toBe(false);
      const spent = async () => Number((await pool.query("SELECT budget_spent FROM sponsorship_campaigns WHERE id = $1", [id])).rows[0].budget_spent);
      expect(await spent()).toBe(5);
      expect((await pool.query("SELECT count(*)::int AS n FROM sponsorship_events WHERE creative_id = $1", [cr])).rows[0].n).toBe(1);
    });
  });

  describe("chat de IA sin sesión", () => {
    let seeded: number;
    afterAll(async () => { await pool.query("DELETE FROM ai_usage WHERE id = $1", [seeded]); });

    it("el uso anónimo tiene su propio techo y no deja sin servicio a las cuentas", async () => {
      // Gasto anónimo de hoy por encima de su parte (25 % de 100 USD).
      seeded = (await pool.query<{ id: number }>("INSERT INTO ai_usage (user_id, kind, model, status, cost_usd) VALUES (NULL, 'chat', 'fake', 'ok', 30) RETURNING id")).rows[0]!.id;
      const body = { messages: [{ role: "user", content: "hola" }] };
      const anon = await call(aiApp, "POST", "/ai/chat", { payload: body });
      expect(anon.statusCode).toBe(429);
      expect(json(anon).error.details.code).toBe("AI_ANON_BUDGET");
      const user = json(await call(aiApp, "POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } })).data.tokens.access_token as string;
      expect((await call(aiApp, "POST", "/ai/chat", { token: user, payload: body })).statusCode).toBe(200);
    });
  });
});
