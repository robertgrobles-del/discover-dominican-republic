import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DemandReportService, lastFinishedQuarter, quarterRange } from "../src/modules/operators/demand-report.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `dr${Date.now().toString(36)}${n++}@test.local`;

describe("trimestres", () => {
  it("calcula el rango y el trimestre anterior, también al cruzar de año", () => {
    expect(quarterRange("2026-T3")).toEqual({ from: "2026-07-01", to: "2026-09-30", previous: "2026-T2" });
    expect(quarterRange("2026-T1")).toEqual({ from: "2026-01-01", to: "2026-03-31", previous: "2025-T4" });
    expect(quarterRange("2028-T4")).toEqual({ from: "2028-10-01", to: "2028-12-31", previous: "2028-T3" });
    expect(() => quarterRange("2026-Q3")).toThrow(/AAAA-Tn/);
  });
  it("el último trimestre terminado cruza de año en enero", () => {
    expect(lastFinishedQuarter("2026-10-04")).toBe("2026-T3");
    expect(lastFinishedQuarter("2027-01-02")).toBe("2026-T4");
    expect(lastFinishedQuarter("2027-04-01")).toBe("2027-T1");
  });
});

describe("reporte trimestral de demanda", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: string, orgId: string, tour: string;
  let key = 0;
  // Un trimestre futuro lejano: sólo contiene las reservas de esta prueba.
  const QUARTER = "2031-T2", PREVIOUS_DAY = "2031-02-12";

  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const book = async (date: string, adults: number) => json(await call("POST", "/bookings", { headers: { "idempotency-key": `dr-key-${Date.now()}-${key++}` }, payload: { request: { listing_id: tour, date, time: "09:00", adults }, contact: { name: "Rosa Viajera", email: "rosa@test.local" }, payment_mode: "pay_later" } })).data.booking as { id: string };
  const report = () => call("GET", `/org/reports/demand?quarter=${QUARTER}`, { token: owner });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } })).data.tokens.access_token;
    orgId = json(await call("POST", "/orgs", { token: owner, payload: { business_name: `Demanda ${Date.now()}` } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner, payload: { category: "experiencia", title: "Tour Demanda", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 500, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("sólo lo reciben los planes Premium y Corporativo con suscripción vigente", async () => {
    expect((await report()).statusCode).toBe(403);
    await pool.query("INSERT INTO operator_subscriptions (org_id, plan_tier, price, current_period_end) VALUES ($1, 'destacado', 0, now() + interval '30 days')", [orgId]);
    expect((await report()).statusCode).toBe(403);
    await pool.query("UPDATE operator_subscriptions SET plan_tier = 'premium_partner' WHERE org_id = $1", [orgId]);
    expect((await report()).statusCode).toBe(200);
    expect((await call("GET", "/org/reports/demand?quarter=2031-5", { token: owner })).statusCode).toBe(400);
  });

  it("sin reservas lo dice en vez de inventar hallazgos", async () => {
    const data = json(await report()).data;
    expect(data.totals).toMatchObject({ bookings: 0, guests: 0, cancellation_rate: 0 });
    expect(data.findings).toEqual(["No hubo reservas con fecha de servicio en este trimestre."]);
  });

  it("resume el trimestre, lo compara con el anterior y redacta hallazgos comprobables", async () => {
    await book(PREVIOUS_DAY, 2);                       // trimestre anterior: 1 reserva
    await book("2031-04-05", 2); await book("2031-04-12", 4); // dos sábados
    await book("2031-05-06", 1);                       // un martes
    const cancelled = await book("2031-06-10", 3);
    expect((await call("PUT", `/org/bookings/${cancelled.id}/status`, { token: owner, payload: { status: "cancelled" } })).statusCode).toBe(200);
    await pool.query("INSERT INTO org_contact_daily (org_id, listing_id, channel, day, clicks) VALUES ($1, '', 'whatsapp', '2031-04-01', 9)", [orgId]);

    const data = json(await report()).data;
    expect(data.compared_to).toBe("2031-T1");
    expect(data.totals).toMatchObject({ bookings: 3, cancelled: 1, cancellation_rate: 25, guests: 7, average_party_size: 2.3, contact_clicks: 9 });
    expect(data.totals.revenue).toEqual([{ currency: "USD", booked_value: 700 }]);
    expect(data.previous).toEqual({ bookings: 1, guests: 2, growth_pct: 200 });
    expect(data.by_month.map((m: { month: string }) => m.month)).toEqual(["2031-04", "2031-05"]);
    expect(data.by_weekday.find((d: { weekday: number }) => d.weekday === 6)).toMatchObject({ name: "sábado", bookings: 2, guests: 6 });
    expect(data.top_listings[0]).toMatchObject({ listing_id: tour, guests: 7 });
    expect(data.findings).toEqual(expect.arrayContaining([
      "Las reservas subieron un 200 % frente al trimestre anterior (3 frente a 1).",
      "El día con más viajeros fue el sábado (6 personas).",
      "Se canceló el 25 % de las reservas; conviene revisar la política de cancelación o los recordatorios.",
      "\"Tour Demanda\" concentró el 100 % de los viajeros.",
      "Por cada reserva hubo 3 clics de contacto (WhatsApp, llamada, ruta o sitio web).",
    ]));
    expect(data.generated_by).toContain("sin IA");
  });

  it("al cerrar el trimestre lo envía por correo una sola vez, con cifras y hallazgos", async () => {
    const svc = new DemandReportService(app.db);
    const email = (await pool.query("SELECT email FROM partner_profiles WHERE id = $1", [orgId])).rows[0].email as string;
    const mine = () => app.mailer.outbox.filter((m) => m.to === email && m.subject.includes("2031-T2"));
    const july = new Date("2031-07-02T16:00:00Z");
    // El envío no depende de que la suscripción siga vigente hoy, sino el día en que se ejecuta.
    await pool.query("UPDATE operator_subscriptions SET current_period_end = '2032-01-01' WHERE org_id = $1", [orgId]);
    expect((await svc.sendQuarterly(app.mailer, "https://sitio.test", july)).quarter).toBe("2031-T2");
    await app.mailer.drain();
    expect(mine()).toHaveLength(1);
    expect(mine()[0]!.text).toContain("Reservas: 3 (+200 % frente al trimestre anterior)");
    expect(mine()[0]!.text).toContain("El día con más viajeros fue el sábado (6 personas).");
    expect(mine()[0]!.text).toContain("https://sitio.test/operadores/panel/reportes");
    await svc.sendQuarterly(app.mailer, "https://sitio.test", july);
    await app.mailer.drain();
    expect(mine()).toHaveLength(1);
  });
});
