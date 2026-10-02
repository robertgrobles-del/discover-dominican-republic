import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { NotificationInput } from "../src/contracts/notifications.js";
import { addDays, todayInSantoDomingo } from "../src/lib/dates.js";
import { BounceService } from "../src/modules/analytics/bounce.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `bn${Date.now().toString(36)}${n++}@test.local`;

describe("tasa de rebote y su alerta", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, plain: string;
  // Días lejanos a los que ninguna otra prueba escribe: los conteos del día son globales.
  const busy = addDays(todayInSantoDomingo(), -250), quiet = addDays(todayInSantoDomingo(), -251);
  const entry = "/rebote/entrada";

  const call = (url: string, token?: string) => app.inject({ method: "GET", url: `/api/v1${url}`, headers: token ? { authorization: `Bearer ${token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } }));
    if (!role) return reg.data.tokens.access_token as string;
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  const seed = (day: string, session: string, types: string[]) =>
    Promise.all(types.map((type, i) => pool.query("INSERT INTO analytics_events (event_type, page, session_id, metadata, created_at) VALUES ($1, $2, $3, '{}', ($4::date + interval '16 hours' + make_interval(secs => $5)))", [type, entry, session, day, i])));

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); plain = await account();
    await pool.query("DELETE FROM analytics_events WHERE created_at >= $1::date AND created_at < ($2::date + 2)", [quiet, busy]);
    await pool.query("DELETE FROM job_marks WHERE key = ANY($1)", [[`bounce_alert:${busy}`, `bounce_alert:${quiet}`]]);
    await pool.query("DELETE FROM site_settings WHERE key = 'analytics.bounce_alert'");
    for (let i = 0; i < 50; i++) await seed(busy, `rebota-${i}`, ["page_view"]);
    for (let i = 0; i < 10; i++) await seed(busy, `navega-${i}`, ["page_view", "click"]);
    for (let i = 0; i < 10; i++) await seed(quiet, `pocos-${i}`, ["page_view"]);
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("calcula el rebote por día y por página de entrada, y marca la alerta sobre el umbral", async () => {
    const data = json(await call(`/admin/analytics/bounce?from=${busy}&to=${busy}`, admin)).data;
    expect(data).toMatchObject({ sessions: 60, bounced: 50, bounce_rate: 83.3, threshold_pct: 70, min_sessions: 50, alert: true });
    expect(data.daily).toEqual([{ day: busy, sessions: 60, bounced: 50, bounce_rate: 83.3 }]);
    expect(data.landing_pages[0]).toEqual({ page: entry, sessions: 60, bounced: 50, bounce_rate: 83.3 });
    expect(JSON.stringify(data)).not.toContain("rebota-");
  });

  it("con poco tráfico no hay alerta aunque todas las sesiones reboten", async () => {
    const data = json(await call(`/admin/analytics/bounce?from=${quiet}&to=${quiet}`, admin)).data;
    expect(data).toMatchObject({ sessions: 10, bounced: 10, bounce_rate: 100, alert: false });
  });

  it("sólo lo ve el equipo con acceso a analítica", async () => {
    expect((await call("/admin/analytics/bounce")).statusCode).toBe(401);
    expect((await call("/admin/analytics/bounce", plain)).statusCode).toBe(403);
  });

  it("avisa una sola vez por día y respeta el umbral que configure el equipo", async () => {
    const svc = new BounceService(app.db);
    const sent: NotificationInput[] = [];
    const notify = async (x: NotificationInput) => { sent.push(x); };

    expect((await svc.alertFor(quiet, notify)).alerted).toBe(false);
    await pool.query("INSERT INTO site_settings (key, value) VALUES ('analytics.bounce_alert', $1)", [JSON.stringify({ threshold_pct: 90, min_sessions: 20 })]);
    expect((await svc.alertFor(busy, notify)).alerted).toBe(false); // 83.3 % no supera 90 %
    await pool.query("DELETE FROM site_settings WHERE key = 'analytics.bounce_alert'");

    expect(await svc.alertFor(busy, notify)).toMatchObject({ alerted: true, bounce_rate: 83.3, sessions: 60 });
    expect((await svc.alertFor(busy, notify)).alerted).toBe(false);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.title).toContain("83.3 %");
    expect(sent[0]!.message).toContain(entry);
  });
});
