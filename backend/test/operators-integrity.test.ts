import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

// Regresiones de integridad del motor de operadores: cancelación concurrente, ventana de reembolso tras cambio de fecha,
// recompensas de reservas manuales, tope de personas por reserva y prioridad de suscripción vencida.
const PW = "Correcta-Clave-2026!";
let n = 0, k = 0;
const uniq = () => `oi${Date.now().toString(36)}${n++}@test.local`;
const today = todayInSantoDomingo();

describe("integridad de reservas y directorio", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string; id: string };
  let orgId: string, tour: string, big: string;
  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async () => {
    const res = json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true, display_name: "Prueba Integridad" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string };
  };
  const book = (listing: string, request: Record<string, unknown>) => app.inject({
    method: "POST", url: "/api/v1/bookings", headers: { "idempotency-key": `oi-key-${Date.now()}-${k++}` },
    payload: { request: { listing_id: listing, adults: 1, time: "09:00", ...request }, contact: { name: "Ana Viajera", email: uniq() }, payment_mode: "pay_later" },
  });
  /** Reserva confirmada y pagada (cobro manual registrado directamente para no depender de la pasarela). */
  const paidBooking = async (date: string) => {
    const res = await book(tour, { date });
    expect(res.statusCode, res.body).toBe(201);
    const d = json(res).data;
    await pool.query("INSERT INTO booking_payments (booking_id, kind, amount, currency, provider, method) VALUES ($1, 'manual', 100, $2, 'manual', 'cash')", [d.booking.id, d.booking.currency]);
    await pool.query("UPDATE bookings SET status = 'confirmed', amount_paid = 100 WHERE id = $1", [d.booking.id]);
    return { id: d.booking.id as string, access: d.access_token as string };
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Integridad SRL ${Date.now().toString(36)}` } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour moderado", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 20, time_slots: ["09:00"], cancellation_policy: "moderada", images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } });
    big = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour grande", summary: "s", description: "d", destination: "Samaná", price: 10, capacity: 500, time_slots: ["09:00"], images: ["b.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${big}/status`, { token: owner.token, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("dos cancelaciones simultáneas sólo reembolsan una vez", async () => {
    const b = await paidBooking(addDays(today, 30));
    const [a, c] = await Promise.all([
      call("POST", `/bookings/${b.id}/cancel?token=${b.access}`, { payload: {} }),
      call("PUT", `/org/bookings/${b.id}/status`, { token: owner.token, payload: { status: "cancelled" } }),
    ]);
    expect([a.statusCode, c.statusCode].filter((s) => s === 200)).toHaveLength(1);
    const refunds = (await pool.query("SELECT count(*)::int AS n FROM booking_payments WHERE booking_id = $1 AND kind = 'refund'", [b.id])).rows[0].n;
    expect(refunds).toBe(1);
  });

  it("mover la fecha no reabre la ventana de reembolso de la política", async () => {
    const b = await paidBooking(addDays(today, 3));      // 'moderada' a 3 días: 0 %
    const moved = await call("POST", `/bookings/${b.id}/change-date?token=${b.access}`, { payload: { date: addDays(today, 30) } });
    expect(moved.statusCode, moved.body).toBe(200);
    const res = await call("POST", `/bookings/${b.id}/cancel?token=${b.access}`, { payload: {} });
    expect(res.statusCode, res.body).toBe(200);
    expect(Number((await pool.query("SELECT refund_amount FROM bookings WHERE id = $1", [b.id])).rows[0].refund_amount)).toBe(0);
  });

  it("una reserva manual completada por el propio equipo no da recompensas", async () => {
    const res = await call("POST", "/org/bookings", { token: owner.token, payload: { request: { listing_id: tour, date: addDays(today, 10), time: "09:00", adults: 1 }, contact: { name: "Yo Mismo", email: uniq() } } });
    expect(res.statusCode, res.body).toBe(201);
    const id = json(res).data.id ?? json(res).data.booking?.id;
    await pool.query("UPDATE bookings SET date = current_date - 1, check_out = CASE WHEN check_out IS NULL THEN NULL ELSE current_date END WHERE id = $1", [id]); // ya pasó la fecha del servicio
    const done = await call("PUT", `/org/bookings/${id}/status`, { token: owner.token, payload: { status: "completed" } });
    expect(done.statusCode, done.body).toBe(200);
    const g = (await pool.query("SELECT count(*)::int AS n FROM gamification_transactions WHERE user_id = $1 AND action = 'booking_completed'", [owner.id])).rows[0].n;
    expect(g).toBe(0);
  });

  it("rechaza más de 60 personas en una sola reserva", async () => {
    const res = await book(big, { date: addDays(today, 15), adults: 61 });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toContain("MAX_GUESTS");
    expect((await book(big, { date: addDays(today, 15), adults: 60 })).statusCode).toBe(201);
  });

  it("el directorio ignora la prioridad de una suscripción vencida", async () => {
    await pool.query("UPDATE partner_profiles SET subscription_tier = 'corporativo', subscription_status = 'active', priority_score = 300, subscription_expires_at = now() - interval '1 day' WHERE id = $1", [orgId]);
    const rows = json(await call("GET", `/operators?q=${encodeURIComponent("Integridad SRL")}&per_page=50`)).data as { id: string; subscription_tier: string; priority_score: number }[];
    const me = rows.find((r) => r.id === orgId)!;
    expect(me).toMatchObject({ subscription_tier: "free", priority_score: 0 });
    await pool.query("UPDATE partner_profiles SET subscription_expires_at = now() + interval '1 day' WHERE id = $1", [orgId]);
    const again = (json(await call("GET", `/operators?q=${encodeURIComponent("Integridad SRL")}&per_page=50`)).data as typeof rows).find((r) => r.id === orgId)!;
    expect(again).toMatchObject({ subscription_tier: "corporativo", priority_score: 300 });
  });
});
