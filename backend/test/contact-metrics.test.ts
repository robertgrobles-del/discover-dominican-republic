import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { ContactMetricsService, previousWeek } from "../src/modules/operators/contact-metrics.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `cm${Date.now().toString(36)}${n++}@test.local`;

describe("semana anterior", () => {
  it("siempre es de lunes a domingo, también si hoy es lunes o domingo", () => {
    expect(previousWeek("2026-10-02")).toEqual({ from: "2026-09-21", to: "2026-09-27" }); // viernes
    expect(previousWeek("2026-10-05")).toEqual({ from: "2026-09-28", to: "2026-10-04" }); // lunes
    expect(previousWeek("2026-10-04")).toEqual({ from: "2026-09-21", to: "2026-09-27" }); // domingo
  });
});

describe("clics de contacto y reporte semanal del operador", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string; id: string; email: string };
  let orgId: string, slug: string, tour: string;
  const today = todayInSantoDomingo();

  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const signup = async () => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const click = (channel: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}, s = slug) => call("POST", `/operators/${s}/contact-click`, { payload: { channel, ...extra }, headers });
  const clicks = async () => json(await call("GET", `/org/reports/contact-clicks?from=${today}&to=${today}`, { token: owner.token })).data;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Contacto ${Date.now()}` } })).data.id;
    slug = (await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1 RETURNING slug", [orgId])).rows[0].slug;
    tour = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour Contacto", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 20, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("cuenta clics por canal y por servicio sin guardar nada de quien hizo clic", async () => {
    expect((await click("whatsapp")).statusCode).toBe(204);
    await click("whatsapp", { listing_id: tour });
    await click("call", { listing_id: tour });
    await click("directions");
    const data = await clicks();
    expect(data.totals).toEqual({ whatsapp: 2, call: 1, directions: 1, website: 0, total: 4 });
    expect(data.by_day).toEqual([{ day: today, whatsapp: 2, call: 1, directions: 1, website: 0, total: 4 }]);
    expect(data.by_listing.find((l: { listing_id: string | null }) => l.listing_id === tour)).toMatchObject({ title: "Tour Contacto", whatsapp: 1, call: 1, total: 2 });
    expect(data.by_listing.find((l: { listing_id: string | null }) => l.listing_id === null)).toMatchObject({ title: "Sitio del operador", total: 2 });
    const cols = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'org_contact_daily'")).rows.map((r) => r.column_name).sort();
    expect(cols).toEqual(["channel", "clicks", "day", "listing_id", "org_id"]);
  });

  it("respeta Do-Not-Track y Sec-GPC, y no cuenta operadores no públicos ni servicios ajenos", async () => {
    const before = (await clicks()).totals.total;
    expect((await click("whatsapp", {}, { dnt: "1" })).statusCode).toBe(204);
    expect((await click("whatsapp", {}, { "sec-gpc": "1" })).statusCode).toBe(204);
    expect((await click("whatsapp", {}, {}, "no-existe-este-operador")).statusCode).toBe(204);
    expect((await clicks()).totals.total).toBe(before);
    // Un servicio que no es de este operador cuenta para el sitio, no para ese servicio.
    await click("website", { listing_id: "servicio-de-otro" });
    const after = await clicks();
    expect(after.totals.website).toBe(1);
    expect(after.by_listing.some((l: { listing_id: string | null }) => l.listing_id === "servicio-de-otro")).toBe(false);
    expect((await click("fax")).statusCode).toBe(400);
  });

  it("el reporte de clics exige pertenecer a la organización y un rango válido", async () => {
    const other = await signup();
    expect((await call("GET", `/org/reports/contact-clicks?from=${today}&to=${today}`, { token: other.token })).statusCode).toBe(403);
    expect((await call("GET", `/org/reports/contact-clicks?from=${today}&to=${today}`)).statusCode).toBe(401);
    expect((await call("GET", `/org/reports/contact-clicks?from=${today}&to=${addDays(today, -1)}`, { token: owner.token })).statusCode).toBe(400);
    expect((await call("GET", `/org/reports/contact-clicks?from=${addDays(today, -400)}&to=${today}`, { token: owner.token })).statusCode).toBe(400);
  });

  it("envía el resumen semanal una sola vez, sólo con actividad, y se puede desactivar", async () => {
    const svc = new ContactMetricsService(app.db, app.env, app.mailer);
    const email = (await pool.query("SELECT email FROM partner_profiles WHERE id = $1", [orgId])).rows[0].email as string;
    const mine = () => app.mailer.outbox.filter((m) => m.to === email && m.subject.startsWith("Tu semana en Descubre RD"));
    // Los clics de hoy caen en la "semana anterior" si el reporte se ejecuta el lunes siguiente.
    const sinceMonday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
    const nextMonday = new Date(`${addDays(today, 7 - sinceMonday)}T16:00:00Z`);

    expect((await call("GET", "/org/reports/weekly-email", { token: owner.token })).json().data.enabled).toBe(true);
    expect((await call("PUT", "/org/reports/weekly-email", { token: owner.token, payload: { enabled: false } })).statusCode).toBe(200);
    await svc.sendWeeklyReports(nextMonday);
    await app.mailer.drain();
    expect(mine()).toHaveLength(0);

    await call("PUT", "/org/reports/weekly-email", { token: owner.token, payload: { enabled: true } });
    await svc.sendWeeklyReports(nextMonday);
    await app.mailer.drain();
    expect(mine()).toHaveLength(1);
    expect(mine()[0]!.text).toContain("Clics a WhatsApp: 2");
    expect(mine()[0]!.text).toContain("Clics para llamar: 1");

    await svc.sendWeeklyReports(nextMonday);
    await app.mailer.drain();
    expect(mine()).toHaveLength(1);

    // Una semana sin reservas ni clics no genera correo.
    await svc.sendWeeklyReports(new Date(nextMonday.getTime() + 7 * 86_400_000));
    await app.mailer.drain();
    expect(mine()).toHaveLength(1);
  });
});
