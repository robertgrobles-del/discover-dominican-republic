import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import type { FakeGateway } from "../src/modules/operators/gateway.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `op${Date.now().toString(36)}${n++}@test.local`;
const FUTURE = addDays(todayInSantoDomingo(), 40);
const day = (k: number) => addDays(FUTURE, k);

describe("motor de reservas de operadores", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string; id: string };
  let orgId: string;
  let tour: string;
  let key = 0;

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const signup = async () => {
    const res = json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string };
  };
  const book = (listing: string, over: Record<string, unknown> = {}, mode = "pay_later", extra: Record<string, unknown> = {}, k = `key-${Date.now()}-${key++}`) =>
    call("POST", "/bookings", {
      headers: { "idempotency-key": k },
      payload: { request: { listing_id: listing, date: day(0), time: "09:00", adults: 1, ...over }, contact: { name: "Luis Viajero", email: "luis@test.local" }, payment_mode: mode, ...extra },
    });
  const gateway = () => app.gateway as FakeGateway;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await signup();
    const org = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: "Aventuras del Caribe" } }));
    orgId = org.data.id;
    const l = json(await call("POST", "/org/listings", { token: owner.token, payload: {
      category: "experiencia", title: "Tour de ballenas", summary: "Sale de Samaná", description: "Avistamiento", destination: "Samaná", price: 100, capacity: 10, time_slots: ["09:00", "14:00"],
      deposit_percent: 30, child_price: 50, infants_free: true, cancellation_policy: "flexible", images: ["a.jpg"], extras: [{ id: "foto", name: "Fotos", price: 20, unit: "booking" }],
    } }));
    tour = l.data.id;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("no se puede publicar hasta que el operador sea verificado por un administrador", async () => {
    const blocked = await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } });
    expect(blocked.statusCode).toBe(422);
    expect(json(blocked).error.details.code).toBe("ORG_NOT_VERIFIED");

    const admin = await signup();
    expect((await call("PUT", `/admin/orgs/${orgId}/verification`, { token: admin.token, payload: { verification: "verified" } })).statusCode).toBe(403);
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [admin.id]);
    const relog = json(await call("POST", "/auth/login", { payload: { email: (await pool.query("SELECT email FROM users WHERE id = $1", [admin.id])).rows[0].email, password: PW } }));
    const ok = await call("PUT", `/admin/orgs/${orgId}/verification`, { token: relog.data.tokens.access_token, payload: { verification: "verified" } });
    expect(ok.statusCode).toBe(200);
    expect((await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } })).statusCode).toBe(200);
  });

  it("cotiza en el servidor: adultos, niños, bebés gratis y extras", async () => {
    const res = await call("POST", "/bookings/quote", { payload: { listing_id: tour, date: day(0), time: "09:00", adults: 2, children: 1, infants: 1, extras: ["foto"] } });
    const q = json(res).data;
    expect(res.statusCode).toBe(200);
    expect(q).toMatchObject({ bookable: true, subtotal: 270, total: 270, deposit_amount: 81, seats: 3, remaining: 10 });
  });

  it("informa por qué no se puede reservar sin fallar la cotización", async () => {
    const q = json(await call("POST", "/bookings/quote", { payload: { listing_id: tour, date: day(0), time: "09:00", adults: 11 } })).data;
    expect(q.bookable).toBe(false);
    expect(q.issues[0].code).toBe("CAPACITY_EXCEEDED");
    const past = json(await call("POST", "/bookings/quote", { payload: { listing_id: tour, date: "2020-01-01", time: "09:00", adults: 1 } })).data;
    expect(past.issues[0].code).toBe("PAST_DATE");
  });

  it("exige Idempotency-Key y deja la reserva de invitado accesible sólo con su token", async () => {
    const noKey = await call("POST", "/bookings", { payload: { request: { listing_id: tour, date: day(1), time: "09:00", adults: 1 }, contact: { name: "Ana", email: "a@test.local" }, payment_mode: "pay_later" } });
    expect(noKey.statusCode).toBe(400);

    const res = await book(tour, { date: day(1), adults: 2 });
    expect(res.statusCode).toBe(201);
    const { booking, access_token } = json(res).data;
    expect(booking).toMatchObject({ status: "pending", payment_status: "unpaid", total_price: 200, balance_due: 200 });
    expect(booking.reference).toMatch(/^DRD-/);

    expect((await call("GET", `/bookings/${booking.id}`)).statusCode).toBe(404);
    expect((await call("GET", `/bookings/${booking.id}?token=incorrecto`)).statusCode).toBe(404);
    expect((await call("GET", `/bookings/${booking.id}?token=${access_token}`)).statusCode).toBe(200);
    // Se avisó al viajero (solicitud recibida) y al operador (mensaje interno).
    await app.mailer.drain?.();
    expect((await pool.query("SELECT 1 FROM operator_messages WHERE booking_id = $1", [booking.id])).rowCount).toBe(1);
  });

  it("un reintento con la misma llave devuelve la misma reserva y no duplica", async () => {
    const k = "reintento-estable-1";
    const a = await book(tour, { date: day(2) }, "pay_later", {}, k);
    const b = await book(tour, { date: day(2) }, "pay_later", {}, k);
    expect(a.statusCode).toBe(201);
    expect(b.statusCode).toBe(200);
    expect(json(b).data.replayed).toBe(true);
    expect(json(b).data.booking.id).toBe(json(a).data.booking.id);
    expect((await pool.query("SELECT 1 FROM bookings WHERE idempotency_key = $1", [k])).rowCount).toBe(1);
    const other = await book(tour, { date: day(3) }, "pay_later", {}, k);
    expect(other.statusCode).toBe(409);
  });

  it("nunca sobrevende: 20 reservas simultáneas para 10 cupos → exactamente 10", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => book(tour, { date: day(5), time: "14:00" })));
    const okCount = results.filter((r) => r.statusCode === 201).length;
    expect(okCount).toBe(10);
    const rejected = results.filter((r) => r.statusCode !== 201);
    for (const r of rejected) expect(r.statusCode).toBe(422);
    expect(["CAPACITY_EXCEEDED", "SOLD_OUT"]).toContain(json(rejected[0]!).error.details.code);
    const { rows } = await pool.query("SELECT coalesce(sum(guests), 0)::int AS n FROM bookings WHERE listing_id = $1 AND date = $2 AND time = '14:00' AND status <> 'cancelled'", [tour, day(5)]);
    expect(rows[0].n).toBe(10);
  });

  it("depósito: cobra el porcentaje, confirma y luego se paga el saldo", async () => {
    const res = await book(tour, { date: day(6), adults: 2 }, "deposit", { payment_method_token: "tok_test_ok" });
    expect(res.statusCode).toBe(201);
    const { booking, access_token } = json(res).data;
    expect(booking).toMatchObject({ status: "confirmed", payment_status: "partial", total_price: 200, amount_paid: 60, balance_due: 140 });
    expect(gateway().charges.at(-1)).toMatchObject({ amount: 60, currency: "USD" });

    const declined = await call("POST", `/bookings/${booking.id}/pay-balance?token=${access_token}`, { payload: { payment_method_token: "tok_test_declined" } });
    expect(declined.statusCode).toBe(402);
    const paid = json(await call("POST", `/bookings/${booking.id}/pay-balance?token=${access_token}`, { payload: { payment_method_token: "tok_test_ok" } })).data;
    expect(paid).toMatchObject({ payment_status: "paid", amount_paid: 200, balance_due: 0 });
  });

  it("un pago rechazado no deja reserva activa ni consume cupos", async () => {
    const before = (await pool.query("SELECT count(*)::int AS n FROM bookings WHERE listing_id = $1 AND status <> 'cancelled'", [tour])).rows[0].n;
    const declined = await book(tour, { date: day(7) }, "pay_now", { payment_method_token: "tok_test_declined" });
    expect(declined.statusCode).toBe(402);
    expect(json(declined).error.code).toBe("PAYMENT_FAILED");
    const down = await book(tour, { date: day(7) }, "pay_now", { payment_method_token: "tok_test_error" });
    expect(down.statusCode).toBe(502);
    const after = (await pool.query("SELECT count(*)::int AS n FROM bookings WHERE listing_id = $1 AND status <> 'cancelled'", [tour])).rows[0].n;
    expect(after).toBe(before);
    const q = json(await call("POST", "/bookings/quote", { payload: { listing_id: tour, date: day(7), time: "09:00", adults: 1 } })).data;
    expect(q.remaining).toBe(10);
  });

  it("cancelar con política flexible reembolsa todo y libera el cupo", async () => {
    const res = json(await book(tour, { date: day(8), adults: 3 }, "pay_now", { payment_method_token: "tok_test_ok" })).data;
    expect(res.booking).toMatchObject({ status: "confirmed", payment_status: "paid", amount_paid: 300 });
    const cancelled = json(await call("POST", `/bookings/${res.booking.id}/cancel?token=${res.access_token}`, { payload: { reason: "Cambio de planes" } })).data;
    expect(cancelled).toMatchObject({ status: "cancelled", refund_amount: 300, payment_status: "refunded" });
    expect(gateway().refunds.at(-1)?.amount).toBe(300);
    expect((await call("POST", `/bookings/${res.booking.id}/cancel?token=${res.access_token}`)).statusCode).toBe(422);
  });

  it("promociones: el código aplica descuento y respeta el máximo de usos", async () => {
    const created = await call("POST", "/org/promotions", { token: owner.token, payload: { code: "sol10", type: "percent", value: 10, max_uses: 1 } });
    expect(created.statusCode).toBe(201);
    expect(json(created).data.code).toBe("SOL10");
    expect((await call("POST", "/org/promotions", { token: owner.token, payload: { code: "SOL10", type: "fixed", value: 5 } })).statusCode).toBe(409);
    const ok = json(await book(tour, { date: day(9), adults: 1, promo_code: "sol10" })).data.booking;
    expect(ok).toMatchObject({ discount: 10, total_price: 90, promo_code: "SOL10" });
    const valid = json(await call("POST", "/promotions/validate", { payload: { listing_id: tour, code: "SOL10" } })).data;
    expect(valid.valid).toBe(false); // agotado
  });

  it("el operador ve sus reservas, cobra manualmente y ve ingresos con comisión sólo de las web", async () => {
    const list = json(await call("GET", "/org/bookings?per_page=100", { token: owner.token }));
    expect(list.meta.total).toBeGreaterThan(5);
    const manual = await call("POST", "/org/bookings", { token: owner.token, payload: { request: { listing_id: tour, date: day(10), time: "09:00", adults: 2 }, contact: { name: "Cliente Mostrador", email: "m@test.local" } } });
    expect(manual.statusCode).toBe(201);
    const mb = json(manual).data;
    expect(mb).toMatchObject({ status: "confirmed", source: "manual", total_price: 200 });
    const paid = json(await call("POST", `/org/bookings/${mb.id}/payments`, { token: owner.token, payload: { amount: 200, method: "cash" } })).data;
    expect(paid.payment_status).toBe("paid");
    expect((await call("POST", `/org/bookings/${mb.id}/payments`, { token: owner.token, payload: { amount: 1 } })).statusCode).toBe(422);
    expect(json(await call("PUT", `/org/bookings/${mb.id}/status`, { token: owner.token, payload: { status: "completed" } })).data.status).toBe("completed");

    const income = json(await call("GET", "/org/income", { token: owner.token })).data;
    expect(income.commission_rate).toBe(8);
    expect(income.gross).toBeGreaterThan(income.commission);
    expect(income.commission).toBeGreaterThan(0);
    // La reserva manual (200) no paga comisión: la comisión es el 8 % de lo cobrado en la web, nunca de todo.
    expect(income.commission).toBeLessThan(income.gross * 0.08);
  });

  it("aislamiento: otra cuenta no ve ni toca las reservas de este operador", async () => {
    const stranger = await signup();
    expect((await call("GET", "/org/bookings", { token: stranger.token })).statusCode).toBe(403);
    const other = json(await call("POST", "/orgs", { token: stranger.token, payload: { business_name: "Otra Agencia" } })).data;
    expect(other.id).not.toBe(orgId);
    const mine = json(await call("GET", "/org/bookings?per_page=1", { token: owner.token })).data[0];
    expect((await call("GET", `/org/bookings/${mine.id}`, { token: stranger.token })).statusCode).toBe(404);
    expect((await call("PUT", `/org/bookings/${mine.id}/status`, { token: stranger.token, payload: { status: "cancelled" } })).statusCode).toBe(404);
  });

  describe("alojamientos", () => {
    let stay: string;
    let room: string;
    beforeAll(async () => {
      stay = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "alojamiento", title: "Hotel Brisa", summary: "Frente al mar", description: "Playa", destination: "Samaná", images: ["h.jpg"], cancellation_policy: "moderada" } })).data.id;
      room = json(await call("POST", `/org/listings/${stay}/rooms`, { token: owner.token, payload: { name: "Doble", price: 100, guests: 2, quantity: 1, weekend_price: 150, min_nights: 2 } })).data.id;
      await call("PUT", `/org/listings/${stay}/status`, { token: owner.token, payload: { status: "published" } });
    });
    const stayReq = (over: Record<string, unknown> = {}) => ({ listing_id: stay, room_id: room, date: day(20), check_out: day(22), adults: 2, ...over });

    it("respeta noches mínimas y no permite reservar la misma habitación dos veces", async () => {
      const one = json(await call("POST", "/bookings/quote", { payload: stayReq({ check_out: day(21) }) })).data;
      expect(one.issues.map((i: { code: string }) => i.code)).toContain("MIN_NIGHTS");
      const [a, b] = await Promise.all([
        call("POST", "/bookings", { headers: { "idempotency-key": "stay-a-key-1" }, payload: { request: stayReq(), contact: { name: "A B", email: "a@test.local" }, payment_mode: "pay_later" } }),
        call("POST", "/bookings", { headers: { "idempotency-key": "stay-b-key-1" }, payload: { request: stayReq(), contact: { name: "C D", email: "c@test.local" }, payment_mode: "pay_later" } }),
      ]);
      expect([a.statusCode, b.statusCode].sort()).toEqual([201, 422]);
      const overlap = json(await call("POST", "/bookings/quote", { payload: stayReq({ date: day(21), check_out: day(23) }) })).data;
      expect(overlap.issues.map((i: { code: string }) => i.code)).toContain("SOLD_OUT");
      const free = json(await call("POST", "/bookings/quote", { payload: stayReq({ date: day(22), check_out: day(24) }) })).data;
      expect(free.issues.map((i: { code: string }) => i.code)).not.toContain("SOLD_OUT");
    });

    it("el bloqueo manual y la disponibilidad reflejan las fechas ocupadas", async () => {
      await call("PUT", `/org/rooms/${room}/blocks`, { token: owner.token, payload: { blocks: [{ from: day(30), to: day(31), reason: "Mantenimiento" }] } });
      const q = json(await call("POST", "/bookings/quote", { payload: stayReq({ date: day(30), check_out: day(32) }) })).data;
      expect(q.issues.map((i: { code: string }) => i.code)).toContain("DATE_BLOCKED");
      const av = json(await call("GET", `/listings/${stay}/availability?from=${day(19)}&to=${day(23)}`)).data;
      const nights = av.rooms[0].nights as { date: string; free: number }[];
      expect(nights.find((x) => x.date === day(20))!.free).toBe(0);
      expect(nights.find((x) => x.date === day(19))!.free).toBe(1);
    });
  });
});
