import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cleanProps } from "../src/modules/analytics/routes.js";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `an${Date.now().toString(36)}${n++}@test.local`;
const day = (k: number) => addDays(todayInSantoDomingo(), k); // la fecha de referencia es la de RD (UTC-4), como en el servidor
const DEST = "d1000000-0000-4000-8000-000000000001";

describe("saneamiento de propiedades", () => {
  it("descarta campos que parecen datos personales y valores complejos", () => {
    expect(cleanProps({ plan: "gold", count: 3, ok: true, email: "a@b.c", user_name: "Ana", phoneNumber: "809", token: "x", nested: { a: 1 }, list: [1], text: "x".repeat(500) })).toEqual({ plan: "gold", count: 3, ok: true, text: "x".repeat(200) });
    expect(cleanProps(undefined)).toEqual({});
    expect(cleanProps({ [`k${"x".repeat(50)}`]: 1 })).toEqual({});
  });
});

describe("analítica", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string;
  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    if (!role) return { token: reg.data.tokens.access_token as string, id: reg.data.user.id as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return { token: json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string, id: reg.data.user.id as string };
  };
  const send = (events: object[], opts: { headers?: Record<string, string>; consent?: boolean } = {}) => call("POST", "/analytics/events", { payload: { events, ...(opts.consent === undefined ? {} : { consent: opts.consent }) }, headers: opts.headers });
  const view = (page: string, session: string, over: object = {}) => ({ type: "page_view", page, session_id: session, ...over });
  const rows = async (page: string) => (await pool.query("SELECT * FROM analytics_events WHERE page = $1", [page])).rows;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account("admin")).token; editor = (await account("editor")).token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("ingesta", () => {
    it("guarda los eventos sin datos personales: sin query, sin IP, sólo host de origen y país", async () => {
      const page = `/lugares/${tag}-a`;
      const res = await send([view(`${page}?email=ana@test.com&token=abc#frag`, "sesion-uno-0001", { source: "https://www.google.com/search?q=secreto", props: { plan: "gold", email: "ana@test.com", nombre: "Ana" } })], { headers: { "cf-ipcountry": "us" } });
      expect(res.statusCode).toBe(204);
      const [row] = await rows(page);
      expect(row).toMatchObject({ event_type: "page_view", page, session_id: "sesion-uno-0001", country: "US", source: "www.google.com" });
      expect(row.metadata).toEqual({ plan: "gold" });
      expect(JSON.stringify(row)).not.toMatch(/ana@test|secreto|token/);
      const cols = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'analytics_events'")).rows.map((c) => c.column_name);
      expect(cols.some((c) => /ip/i.test(c) && c !== "description")).toBe(false);
    });

    it("respeta Do-Not-Track, Global Privacy Control y el consentimiento", async () => {
      const page = `/privado/${tag}`;
      expect((await send([view(page, "sesion-dnt-0001")], { headers: { dnt: "1" } })).statusCode).toBe(204);
      expect((await send([view(page, "sesion-gpc-0001")], { headers: { "sec-gpc": "1" } })).statusCode).toBe(204);
      expect((await send([view(page, "sesion-nocon-01")], { consent: false })).statusCode).toBe(204);
      expect(await rows(page)).toHaveLength(0);
      await send([view(page, "sesion-si-consiente")]);
      expect(await rows(page)).toHaveLength(1);
    });

    it("valida el lote: tipos permitidos, máximo 50, sesión obligatoria y una hora de cliente absurda se reemplaza", async () => {
      expect((await send([{ type: "hackeo", page: "/x", session_id: "sesion-xxxx-01" }])).statusCode).toBe(400);
      expect((await send([{ type: "click", page: "/x", session_id: "corta" }])).statusCode).toBe(400);
      expect((await send([])).statusCode).toBe(400);
      expect((await send(Array.from({ length: 51 }, (_, i) => view(`/lote/${i}`, "sesion-lote-0001")))).statusCode).toBe(400);
      const page = `/lote/${tag}`;
      expect((await send(Array.from({ length: 50 }, () => view(page, "sesion-lote-0002")))).statusCode).toBe(204);
      expect(await rows(page)).toHaveLength(50);
      const p2 = `/reloj/${tag}`;
      await send([view(p2, "sesion-reloj-001", { ts: "2001-01-01T00:00:00Z" })]);
      expect(new Date((await rows(p2))[0].created_at).getFullYear()).toBeGreaterThan(2020);
    });
  });

  describe("paneles", () => {
    it("sólo el admin los ve", async () => {
      for (const url of ["overview", "traffic", "top-content", "funnels/reserva", "nps", "search-terms", "export.csv?report=traffic"]) {
        expect((await call("GET", `/admin/analytics/${url}`)).statusCode, url).toBe(401);
        expect((await call("GET", `/admin/analytics/${url}`, { token: editor })).statusCode, url).toBe(403);
      }
    });

    it("tráfico por página, origen, país y día; y contenido más visto", async () => {
      const base = `/trafico/${tag}`;
      await send([view(`${base}/a`, "t-sesion-0001", { source: "https://facebook.com/x" }), view(`${base}/a`, "t-sesion-0001"), view(`${base}/a`, "t-sesion-0002"), view(`${base}/b`, "t-sesion-0003")], { headers: { "x-country": "DO" } });
      const byPage = json(await call("GET", "/admin/analytics/traffic?group=page", { token: admin })).data.rows as { key: string; views: number; sessions: number }[];
      expect(byPage.find((x) => x.key === `${base}/a`)).toEqual({ key: `${base}/a`, views: 3, sessions: 2 });
      expect(byPage.find((x) => x.key === `${base}/b`)).toMatchObject({ views: 1, sessions: 1 });
      expect(json(await call("GET", "/admin/analytics/traffic?group=source", { token: admin })).data.rows.some((x: { key: string }) => x.key === "facebook.com")).toBe(true);
      expect(json(await call("GET", "/admin/analytics/traffic?group=country", { token: admin })).data.rows.some((x: { key: string }) => x.key === "DO")).toBe(true);
      const byDay = json(await call("GET", "/admin/analytics/traffic?group=day", { token: admin })).data.rows as { key: string }[];
      expect(byDay.length).toBeGreaterThan(0);
      expect((await call("GET", `/admin/analytics/traffic?from=${day(0)}&to=${day(-5)}`, { token: admin })).statusCode).toBe(400);
      const top = json(await call("GET", "/admin/analytics/top-content?limit=100", { token: admin })).data as { page: string; views: number }[];
      expect(top.find((x) => x.page === `${base}/a`)!.views).toBe(3);
      for (let i = 1; i < top.length; i++) expect(top[i - 1]!.views).toBeGreaterThanOrEqual(top[i]!.views);
    });

    it("lo más guardado resuelve el nombre de la entidad", async () => {
      const u = await account();
      await call("PUT", `/me/favorites/destination/${DEST}`, { token: u.token });
      const top = json(await call("GET", "/admin/analytics/top-content?metric=favorites&type=destination", { token: admin })).data as { entity_id: string; title: string; favorites: number }[];
      expect(top.find((x) => x.entity_id === DEST)).toMatchObject({ title: "Punta Cana" });
    });

    it("resumen general con serie diaria", async () => {
      const page = `/resumen/${tag}`;
      await send([view(page, "r-sesion-0001"), view(page, "r-sesion-0002")]);
      const o = json(await call("GET", `/admin/analytics/overview?from=${day(-1)}&to=${day(1)}`, { token: admin })).data;
      expect(o.page_views).toBeGreaterThanOrEqual(2);
      expect(o.sessions).toBeGreaterThanOrEqual(2);
      expect(o.users_new).toBeGreaterThanOrEqual(2);
      expect(o).toHaveProperty("booking_revenue_usd");
      expect(o.daily.reduce((s: number, d: { views: number }) => s + d.views, 0)).toBe(o.page_views);
    });

    it("embudos calculados con datos reales y porcentajes coherentes", async () => {
      for (const name of ["reserva", "registro", "tienda"]) {
        const f = json(await call("GET", `/admin/analytics/funnels/${name}?from=${day(-1)}&to=${day(1)}`, { token: admin })).data;
        expect(f.steps.length).toBe(4);
        expect(f.steps[0].pct_of_first).toBe(f.steps[0].count ? 100 : 0);
        for (let i = 1; i < f.steps.length; i++) expect(f.steps[i].pct_of_first).toBeLessThanOrEqual(100);
      }
      const reg = json(await call("GET", `/admin/analytics/funnels/registro?from=${day(-1)}&to=${day(1)}`, { token: admin })).data;
      expect(reg.steps[0].count).toBeGreaterThanOrEqual(2);
      expect(reg.steps[1].count).toBeLessThanOrEqual(reg.steps[0].count); // verificados ≤ creadas
      expect((await call("GET", "/admin/analytics/funnels/nada", { token: admin })).statusCode).toBe(400);
    });

    it("NPS con comentarios de las encuestas", async () => {
      const slug = `nps-an-${tag}`;
      await call("POST", "/admin/surveys", { token: admin, payload: { slug, title: "NPS analítica", kind: "nps", questions: [{ id: "rec", type: "nps", label: "¿Nos recomendarías?", required: true }, { id: "why", type: "text", label: "¿Por qué?" }] } });
      for (const [score, why] of [[10, `Excelente ${tag}`], [9, "Muy bien"], [2, "Malo"]] as const) await call("POST", `/surveys/${slug}/responses`, { payload: { answers: { rec: score, why } } });
      const res = json(await call("GET", `/admin/analytics/nps?from=${day(-1)}&to=${day(1)}`, { token: admin })).data;
      expect(res.count).toBeGreaterThanOrEqual(3);
      expect(res.comments.some((c: { comment: string; score: number }) => c.comment === `Excelente ${tag}` && c.score === 10)).toBe(true);
      expect(res.promoters).toBeGreaterThanOrEqual(2);
      expect(res.detractors).toBeGreaterThanOrEqual(1);
    });

    it("términos buscados sin resultados", async () => {
      const term = `zzqq${tag}`;
      await call("GET", `/search?q=${term}`); await call("GET", `/search?q=${term}`);
      await new Promise((r) => setTimeout(r, 300));
      const terms = json(await call("GET", "/admin/analytics/search-terms", { token: admin })).data as { term: string; searches: number }[];
      expect(terms.find((t) => t.term === term)).toMatchObject({ searches: 2 });
    });

    it("exporta CSV neutralizando fórmulas, y queda auditado", async () => {
      const page = `=cmd${tag}`;
      await send([view(page, "e-sesion-0001")]);
      const res = await call("GET", "/admin/analytics/export.csv?report=traffic&group=page", { token: admin });
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.body.split("\r\n")[0]).toBe("key,views,sessions");
      expect(res.body).toContain(`'${page}`);
      expect((await call("GET", "/admin/analytics/export.csv?report=inventado", { token: admin })).statusCode).toBe(400);
      expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'analytics.export'")).rowCount).toBeGreaterThan(0);
    });
  });

  it("estadísticas públicas: cifras del equipo y del portal", async () => {
    await call("PUT", "/admin/settings/statistics.public", { token: admin, payload: { value: { arrivals_2025: 11_000_000 }, is_public: true } });
    const res = json(await call("GET", "/statistics/public")).data;
    expect(res.official).toEqual({ arrivals_2025: 11_000_000 });
    expect(res.portal.destinations).toBeGreaterThanOrEqual(2);
    await app.inject({ method: "DELETE", url: "/api/v1/admin/settings/statistics.public", headers: { authorization: `Bearer ${admin}` } });
  });

  it("retención: los eventos de más de 13 meses se agregan por día y se purgan; el tráfico antiguo sale del agregado", async () => {
    const old = `/antiguo/${tag}`;
    await pool.query("INSERT INTO analytics_events (event_type, page, session_id, created_at) VALUES ('page_view', $1, 's-old-0001', now() - interval '14 months'), ('page_view', $1, 's-old-0001', now() - interval '14 months'), ('page_view', $1, 's-old-0002', now() - interval '14 months')", [old]);
    const run = await app.jobs.runNow("analytics.rollup");
    expect(run.status).toBe("success");
    expect(await rows(old)).toHaveLength(0);
    const agg = (await pool.query("SELECT day::text, events, sessions FROM analytics_daily WHERE page = $1", [old])).rows[0];
    expect(agg).toMatchObject({ events: 3, sessions: 2 });
    const t = json(await call("GET", `/admin/analytics/traffic?group=page&from=${agg.day}&to=${agg.day}`, { token: admin })).data.rows as { key: string; views: number }[];
    expect(t.find((x) => x.key === old)).toMatchObject({ views: 3, sessions: 2 });
    // Repetir no duplica lo ya agregado (no queda nada crudo que sumar).
    await app.jobs.runNow("analytics.rollup");
    expect((await pool.query("SELECT events FROM analytics_daily WHERE page = $1", [old])).rows[0].events).toBe(3);
  });
});
