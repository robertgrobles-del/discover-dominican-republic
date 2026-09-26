import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unsubscribeToken } from "../src/modules/forms/routes.js";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
const slot = `t_${tag}`;
let n = 0;
const uniq = () => `mk${Date.now().toString(36)}${n++}@test.local`;
const day = (k: number) => addDays(todayInSantoDomingo(), k); // la fecha de referencia es la de RD (UTC-4), como en el servidor

describe("publicidad, ofertas y campañas", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string, plain: string;
  const call = (method: "GET" | "POST" | "PATCH" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    if (!role) return reg.data.tokens.access_token as string;
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  const banner = async (over: object = {}) => json(await call("POST", "/admin/ad_banners", { token: editor, payload: { name: `Banner ${tag}-${Math.random().toString(36).slice(2, 6)}`, placement: slot, status: "published", is_active: true, priority: 0, image_url: "https://cdn.example.com/a.jpg", target_url: "https://anunciante.example.com/promo", sponsor: `Anunciante ${tag}`, ...over } })).data;
  const ads = async (q = "") => json(await call("GET", `/ads?placement=${slot}${q}`)).data as { id: string; click_url: string | null; target_url?: string }[];

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor"); plain = await account();
    expect((await call("POST", "/admin/ad_slots", { token: editor, payload: { placement: slot, label: "Espacio de prueba", max_items: 3 } })).statusCode).toBe(201);
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("servidor de anuncios", () => {
    it("los espacios son públicos y sólo el equipo edita banners", async () => {
      expect(json(await call("GET", "/ads/slots")).data.some((s: { placement: string }) => s.placement === "home_hero")).toBe(true);
      expect((await call("POST", "/admin/ad_banners", { token: plain, payload: { name: "Intruso", placement: slot } })).statusCode).toBe(403);
      expect((await call("POST", "/admin/ad_banners", { token: editor, payload: { name: "Mal enlace", placement: slot, target_url: "javascript:alert(1)" } })).statusCode).toBe(400);
      expect((await call("POST", "/admin/ad_banners", { token: editor, payload: { name: "Fechas mal", placement: slot, start_date: day(5), end_date: day(1) } })).statusCode).toBe(400);
    });

    it("sirve sólo lo vigente: publicado, activo, dentro de fechas y para su página y sección", async () => {
      const live = await banner();
      const drafted = await banner({ status: "draft" });
      const off = await banner({ is_active: false });
      const expired = await banner({ start_date: day(-10), end_date: day(-1) });
      const future = await banner({ start_date: day(2) });
      const inWindow = await banner({ start_date: day(-1), end_date: day(1) });
      const onlyHome = await banner({ page: "/home" });
      const list = await ads("&limit=10");
      const ids = list.map((b) => b.id);
      expect(ids).toEqual(expect.arrayContaining([live.id, inWindow.id]));
      for (const [name, hidden] of Object.entries({ drafted, off, expired, future, onlyHome })) expect(ids, name).not.toContain(hidden.id);
      expect(json(await call("GET", `/ads?placement=${slot}&page=/home&limit=10`)).data.map((b: { id: string }) => b.id)).toContain(onlyHome.id);
      expect((await call("GET", "/ads?placement=no_existe")).statusCode).toBe(404);
      expect((await call("GET", "/ads")).statusCode).toBe(400);
    });

    it("no expone el destino: el clic pasa por el servidor", async () => {
      const b = await banner();
      const item = (await ads("&limit=10")).find((x) => x.id === b.id)!;
      expect(item.click_url).toBe(`/api/v1/ads/${b.id}/click`);
      expect(JSON.stringify(item)).not.toContain("anunciante.example.com");
      const res = await app.inject({ url: `/api/v1/ads/${b.id}/click?s=sesion-de-prueba-1` });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("https://anunciante.example.com/promo");
    });

    it("la rotación favorece a los banners de más prioridad", async () => {
      const heavy = await banner({ priority: 200, placement: `${slot}` });
      const light = await banner({ priority: 0 });
      let heavyWins = 0;
      for (let i = 0; i < 60; i++) if ((await ads("&limit=1"))[0]!.id === heavy.id) heavyWins++;
      expect(heavyWins).toBeGreaterThan(40);
      void light;
    });

    it("cuenta vistas y clics una vez por sesión y hora, y ignora banners que no existen", async () => {
      const b = await banner();
      const stats = async () => (await pool.query("SELECT coalesce(sum(impressions), 0)::int AS i, coalesce(sum(clicks), 0)::int AS c FROM ad_stats WHERE banner_id = $1", [b.id])).rows[0];
      const imp = (session: string) => call("POST", `/ads/${b.id}/impression`, { payload: { session_id: session } });
      expect((await imp("sesion-a-0001")).statusCode).toBe(204);
      await imp("sesion-a-0001");
      await imp("sesion-b-0002");
      expect(await stats()).toEqual({ i: 2, c: 0 });
      expect((await call("POST", "/ads/impressions", { payload: { session_id: "sesion-c-0003", ids: [b.id, b.id, "99999999-9999-4999-8999-999999999999"] } })).statusCode).toBe(204);
      expect((await stats()).i).toBe(3);
      await app.inject({ url: `/api/v1/ads/${b.id}/click?s=sesion-a-0001` });
      await app.inject({ url: `/api/v1/ads/${b.id}/click?s=sesion-a-0001` });
      await app.inject({ url: `/api/v1/ads/${b.id}/click?s=sesion-b-0002` });
      expect((await stats()).c).toBe(2);
      expect((await call("POST", `/ads/${b.id}/impression`, { payload: { session_id: "x" } })).statusCode).toBe(400);
      expect((await app.inject({ url: "/api/v1/ads/99999999-9999-4999-8999-999999999999/click" })).statusCode).toBe(404);
    });

    it("nunca redirige a destinos peligrosos", async () => {
      const b = await banner();
      for (const bad of ["javascript:alert(1)", "//evil.example.com", "http://inseguro.example.com", "data:text/html,x"]) {
        await pool.query("UPDATE ad_banners SET target_url = $2 WHERE id = $1", [b.id, bad]);
        expect((await app.inject({ url: `/api/v1/ads/${b.id}/click?s=sesion-xyz-9999` })).statusCode, bad).toBe(404);
      }
      await pool.query("UPDATE ad_banners SET target_url = '/tienda' WHERE id = $1", [b.id]);
      expect((await app.inject({ url: `/api/v1/ads/${b.id}/click?s=sesion-xyz-9999` })).headers.location).toBe("/tienda");
    });

    it("el reporte resume vistas, clics y CTR por banner y por anunciante", async () => {
      const b = await banner({ sponsor: `Reporte ${tag}` });
      for (const s of ["r-sesion-001", "r-sesion-002", "r-sesion-003", "r-sesion-004"]) await call("POST", `/ads/${b.id}/impression`, { payload: { session_id: s } });
      await app.inject({ url: `/api/v1/ads/${b.id}/click?s=r-sesion-001` });
      expect((await call("GET", "/admin/ads/reports", { token: editor })).statusCode).toBe(403);
      const rep = json(await call("GET", "/admin/ads/reports", { token: admin })).data;
      expect(rep.banners.find((x: { id: string }) => x.id === b.id)).toMatchObject({ impressions: 4, clicks: 1, ctr: 25 });
      expect(rep.sponsors.find((x: { sponsor: string }) => x.sponsor === `Reporte ${tag}`)).toMatchObject({ impressions: 4, clicks: 1, ctr: 25 });
      expect((await call("GET", `/admin/ads/reports?from=${day(-100)}&to=${day(-90)}`, { token: admin })).statusCode).toBe(200);
    });

    it("solicitudes de publicidad: crean lead y ticket, exigen consentimiento y frenan bots", async () => {
      const mail = uniq();
      const req = (p: object) => call("POST", "/advertisers/requests", { payload: { company: `Empresa ${tag}`, contact_name: "Ana Anunciante", email: mail, message: "Queremos anunciar en el portal.", consent: true, ...p } });
      expect((await req({ consent: false })).statusCode).toBe(400);
      expect((await req({})).statusCode).toBe(202);
      expect((await pool.query("SELECT source, empresa, consent FROM marketing_leads WHERE email = $1", [mail])).rows[0]).toEqual({ source: "advertiser", empresa: `Empresa ${tag}`, consent: true });
      expect((await pool.query("SELECT category FROM support_tickets WHERE contact_email = $1", [mail])).rows[0].category).toBe("advertising");
      await app.mailer.drain();
      expect(app.mailer.last(mail, "support.received")).toBeTruthy();
      const bot = uniq();
      await call("POST", "/advertisers/requests", { payload: { company: "Bot", contact_name: "Bot Bot", email: bot, message: "mensaje de bot largo", consent: true, website: "http://spam" } });
      expect((await pool.query("SELECT 1 FROM marketing_leads WHERE email = $1", [bot])).rowCount).toBe(0);
    });
  });

  describe("ofertas", () => {
    it("se canjean una vez por persona sólo si están vigentes", async () => {
      const mk = async (over: object) => {
        const o = json(await call("POST", "/admin/offers", { token: editor, payload: { title: `Oferta ${tag}`, original_price: 100, price: 80, discount_code: `COD${tag}`, discount_percentage: 20, ...over } })).data;
        await call("POST", `/admin/offers/${o.id}/publish`, { token: admin });
        return o;
      };
      const ok = await mk({ start_time: new Date(Date.now() - 3_600_000).toISOString(), end_time: new Date(Date.now() + 3_600_000).toISOString() });
      const past = await mk({ title: `Vencida ${tag}`, start_time: new Date(Date.now() - 7_200_000).toISOString(), end_time: new Date(Date.now() - 3_600_000).toISOString() });
      const future = await mk({ title: `Futura ${tag}`, start_time: new Date(Date.now() + 3_600_000).toISOString(), end_time: new Date(Date.now() + 7_200_000).toISOString() });
      expect((await call("POST", `/offers/${ok.id}/redeem`)).statusCode).toBe(401);
      const res = await call("POST", `/offers/${ok.id}/redeem`, { token: plain });
      expect(res.statusCode).toBe(200);
      expect(json(res).data).toMatchObject({ code: `COD${tag}`, discount_percentage: 20 });
      expect((await call("POST", `/offers/${ok.id}/redeem`, { token: plain })).statusCode).toBe(409);
      expect((await call("POST", `/offers/${past.id}/redeem`, { token: plain })).statusCode).toBe(404);
      expect((await call("POST", `/offers/${future.id}/redeem`, { token: plain })).statusCode).toBe(404);
      // Las pruebas de contenido comparten la tabla `offers`: se limpia de inmediato.
      await pool.query("DELETE FROM offers WHERE id = ANY($1)", [[ok.id, past.id, future.id]]);
    });
  });

  describe("leads y campañas", () => {
    it("el admin ve los leads y cambia su estado", async () => {
      const mail = uniq();
      await call("POST", "/leads", { payload: { name: "Lead Prueba", email: mail, source: `src-${tag}`, consent: true } });
      const list = json(await call("GET", `/admin/marketing/leads?source=src-${tag}`, { token: admin }));
      expect(list.data).toHaveLength(1);
      expect((await call("PATCH", `/admin/marketing/leads/${list.data[0].id}`, { token: editor, payload: { status: "contactado" } })).statusCode).toBe(403);
      expect((await call("PATCH", `/admin/marketing/leads/${list.data[0].id}`, { token: admin, payload: { status: "ganado" } })).statusCode).toBe(400);
      expect((await call("PATCH", `/admin/marketing/leads/${list.data[0].id}`, { token: admin, payload: { status: "contactado" } })).statusCode).toBe(204);
      expect(json(await call("GET", `/admin/marketing/leads?status=contactado&source=src-${tag}`, { token: admin })).meta.total).toBe(1);
    });

    it("campaña: borrador, prueba, programación, cancelación y envío por lotes sin duplicar ni escribirle a quien no confirmó", async () => {
      const interest = `int${tag}`;
      const subs = { ok1: uniq(), ok2: uniq(), unconfirmed: uniq(), inactive: uniq(), other: uniq() };
      for (const [k, email] of Object.entries(subs)) {
        await pool.query("INSERT INTO newsletter_subscribers (email, nombre, is_active, confirmed_at, intereses, locale) VALUES ($1, $2, $3, $4, $5, 'es')", [email, `Persona ${k}`, k !== "inactive" && k !== "unconfirmed", k === "unconfirmed" ? null : new Date(), JSON.stringify(k === "other" ? ["otro"] : [interest])]);
      }
      const c = json(await call("POST", "/admin/marketing/campaigns", { token: admin, payload: { title: `Campaña ${tag}`, subject: "Novedades de verano", body_template: "Hola {{name}},\n\nMira lo nuevo en Descubre RD.", segment_interests: [interest] } })).data;
      expect((await call("POST", "/admin/marketing/campaigns", { token: editor, payload: { title: "Intento", subject: "Intento", body_template: "Cuerpo del intento" } })).statusCode).toBe(403);
      const edit = await call("PATCH", `/admin/marketing/campaigns/${c.id}`, { token: admin, payload: { subject: "Novedades de verano 2027" } });
      expect(json(edit).data.subject).toBe("Novedades de verano 2027");
      expect((await call("PATCH", `/admin/marketing/campaigns/${c.id}`, { token: admin, payload: { estado: "sent" } })).statusCode).toBe(400);

      expect((await call("POST", `/admin/marketing/campaigns/${c.id}/send-test`, { token: admin })).statusCode).toBe(204);
      await app.mailer.drain();
      const testMail = app.mailer.outbox.filter((m) => m.subject === "Novedades de verano 2027").at(-1)!;
      expect(testMail.text).toContain("Darte de baja:");
      expect(testMail.text).toContain("Hola Prueba");

      expect((await call("POST", `/admin/marketing/campaigns/${c.id}/schedule`, { token: admin, payload: { scheduled_for: new Date(Date.now() - 3_600_000).toISOString() } })).statusCode).toBe(400);
      const future = new Date(Date.now() + 3_600_000).toISOString();
      expect(json(await call("POST", `/admin/marketing/campaigns/${c.id}/schedule`, { token: admin, payload: { scheduled_for: future } })).data.status).toBe("scheduled");
      expect(json(await call("POST", `/admin/marketing/campaigns/${c.id}/cancel`, { token: admin })).data.status).toBe("draft");
      expect((await call("POST", `/admin/marketing/campaigns/${c.id}/cancel`, { token: admin })).statusCode).toBe(422);

      await call("POST", `/admin/marketing/campaigns/${c.id}/schedule`, { token: admin, payload: { scheduled_for: future } });
      expect((await app.jobs.runNow("newsletter.send")).result).toMatchObject({ sent: expect.any(Number) });
      expect((await pool.query("SELECT status FROM marketing_campaigns WHERE id = $1", [c.id])).rows[0].status).toBe("scheduled"); // aún no llega su hora
      await pool.query("UPDATE marketing_campaigns SET scheduled_for = now() - interval '1 minute' WHERE id = $1", [c.id]);
      await app.jobs.runNow("newsletter.send");
      await app.mailer.drain();
      const got = (email: string) => app.mailer.outbox.filter((m) => m.to === email && m.template === "marketing.campaign");
      expect(got(subs.ok1)).toHaveLength(1);
      expect(got(subs.ok2)).toHaveLength(1);
      for (const nope of [subs.unconfirmed, subs.inactive, subs.other]) expect(got(nope)).toHaveLength(0);
      expect(got(subs.ok1)[0]!.text).toContain("Hola Persona");
      expect(got(subs.ok1)[0]!.text).toContain(unsubscribeToken(app.env.APP_SECRET!, subs.ok1));
      const done = (await pool.query("SELECT status, sent_count, sent_at FROM marketing_campaigns WHERE id = $1", [c.id])).rows[0];
      expect(done).toMatchObject({ status: "sent", sent_count: 2 });
      expect(done.sent_at).toBeTruthy();
      await app.jobs.runNow("newsletter.send"); // repetir no duplica
      await app.mailer.drain();
      expect(got(subs.ok1)).toHaveLength(1);
      expect((await call("PATCH", `/admin/marketing/campaigns/${c.id}`, { token: admin, payload: { subject: "tarde" } })).statusCode).toBe(422);
    });
  });
});
