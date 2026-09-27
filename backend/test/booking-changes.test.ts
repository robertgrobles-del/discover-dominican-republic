import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo, weekday } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0, k = 0;
const uniq = () => `bc${Date.now().toString(36)}${n++}@test.local`;
const today = todayInSantoDomingo();
/** Próximo día de la semana `wd` (0 = domingo … 6 = sábado) a partir de `from`. */
const nextWd = (wd: number, from: string) => { let d = from; while (weekday(d) !== wd) d = addDays(d, 1); return d; };
const BASE = addDays(today, 60);
const day = (i: number) => addDays(BASE, i);

describe("cambio de fecha y voucher de reservas", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string; id: string };
  let orgId: string, tour: string, stay: string, room: string;
  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async () => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Viajero Cambio" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  /** Crea una reserva y devuelve la reserva y el token de acceso del invitado. */
  const book = async (listing: string, request: Record<string, unknown>, o: { token?: string; mode?: string; email?: string } = {}) => {
    const res = await app.inject({
      method: "POST", url: "/api/v1/bookings", headers: { "idempotency-key": `bc-key-${Date.now()}-${k++}`, ...(o.token ? { authorization: `Bearer ${o.token}` } : {}) },
      payload: { request: { listing_id: listing, adults: 1, ...request }, contact: { name: "Luis Viajero", email: o.email ?? uniq() }, payment_mode: o.mode ?? "pay_later" },
    });
    expect(res.statusCode, res.body).toBe(201);
    const d = json(res).data;
    return { id: d.booking.id as string, reference: d.booking.reference as string, access: d.access_token as string, booking: d.booking };
  };
  const change = (id: string, payload: object, opts: { token?: string; access?: string } = {}) =>
    call("POST", `/bookings/${id}/change-date${opts.access ? `?token=${opts.access}` : ""}`, { token: opts.token, payload });
  const row = async (id: string) => (await pool.query("SELECT date::text AS date, check_out::text AS check_out, time, total_price, date_changes, original_date::text AS original_date, notified, status, payment_status FROM bookings WHERE id = $1", [id])).rows[0];

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Cambios SRL ${Date.now().toString(36)}` } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour de cambios", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 2, time_slots: ["09:00"], cancellation_policy: "flexible", images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } });
    stay = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "alojamiento", title: "Hotel de cambios", summary: "s", description: "d", destination: "Samaná", images: ["h.jpg"], cancellation_policy: "moderada" } })).data.id;
    room = json(await call("POST", `/org/listings/${stay}/rooms`, { token: owner.token, payload: { name: "Doble", price: 100, guests: 2, quantity: 1, weekend_price: 150, min_nights: 1 } })).data.id;
    await call("PUT", `/org/listings/${stay}/status`, { token: owner.token, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("cambio de fecha", () => {
    it("mueve la reserva, guarda el historial, reinicia los recordatorios y avisa al viajero y al operador", async () => {
      const u = await signup();
      const b = await book(tour, { date: day(0), time: "09:00" }, { token: u.token, email: u.email });
      await pool.query("UPDATE bookings SET status = 'confirmed', notified = '{\"reminder\": true}' WHERE id = $1", [b.id]);
      // Vista previa: no cambia nada.
      const prev = json(await change(b.id, { date: day(3), dry_run: true }, { token: u.token })).data;
      expect(prev).toMatchObject({ dry_run: true, allowed: true, date: day(3), old_total: 100, new_total: 100, price_difference: 0, changes_left: 2 });
      expect((await row(b.id)).date).toBe(day(0));
      const res = await change(b.id, { date: day(3) }, { token: u.token });
      expect(res.statusCode).toBe(200);
      const d = json(res).data;
      expect(d.booking).toMatchObject({ date: day(3), status: "confirmed" });
      expect(await row(b.id)).toMatchObject({ date: day(3), date_changes: 1, original_date: day(0), notified: {} });
      await app.mailer.drain();
      expect(app.mailer.last(u.email, "booking.date_changed")!.subject).toContain("Nueva fecha");
      expect((await pool.query("SELECT body FROM operator_messages WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1", [b.id])).rows[0].body).toContain(`de ${day(0)} a ${day(3)}`);
      const inbox = json(await call("GET", "/me/notifications", { token: u.token })).data as { title: string }[];
      expect(inbox.some((x) => x.title === "Cambiamos la fecha de tu reserva")).toBe(true);
    });

    it("valida: fecha futura, misma fecha, salida sólo en alojamientos, estado, y que sea del titular", async () => {
      const u = await signup(), other = await signup();
      const b = await book(tour, { date: day(5), time: "09:00" }, { token: u.token });
      for (const payload of [{ date: today }, { date: addDays(today, -3) }, { date: day(5) }, { date: day(6), check_out: day(7) }, { date: "mañana" }, { date: addDays(today, 400) }]) {
        expect((await change(b.id, payload, { token: u.token })).statusCode, JSON.stringify(payload)).toBe(400);
      }
      expect((await change(b.id, { date: day(6) }, { token: other.token })).statusCode).toBe(404);          // no es suya
      expect((await change(b.id, { date: day(6) })).statusCode).toBe(404);                                   // sin sesión ni token
      expect((await change(b.id, { date: day(6) }, { access: b.access })).statusCode).toBe(200);            // el invitado, con su token
      const room1 = await book(stay, { room_id: room, date: day(10), check_out: day(11) });
      expect((await change(room1.id, { date: day(12) }, { access: room1.access })).statusCode).toBe(400);    // el alojamiento exige salida
      await call("POST", `/bookings/${b.id}/cancel?token=${b.access}`, { payload: {} });
      const cancelled = await change(b.id, { date: day(9) }, { access: b.access });
      expect(cancelled.statusCode).toBe(422);
      expect(json(cancelled).error.details.code).toBe("INVALID_STATE");
    });

    it("respeta el cupo de la nueva fecha sin contar la propia reserva", async () => {
      // Cupo de 2 personas por salida.
      const a = await book(tour, { date: day(20), time: "09:00", adults: 2 });
      const b = await book(tour, { date: day(21), time: "09:00", adults: 1 });
      const full = await change(b.id, { date: day(20) }, { access: b.access });
      expect(full.statusCode).toBe(422);
      expect(json(full).error.details.issues[0].code).toBeTruthy();
      expect((await row(b.id)).date).toBe(day(21));
      // A puede moverse a un día libre, y entonces B sí cabe en su lugar.
      expect((await change(a.id, { date: day(22) }, { access: a.access })).statusCode).toBe(200);
      expect((await change(b.id, { date: day(20) }, { access: b.access })).statusCode).toBe(200);
      // Una reserva de 2 personas no se bloquea a sí misma al cambiar de hora dentro de la misma fecha (misma fecha y hora: rechazado por igual).
      expect((await change(a.id, { date: day(22) }, { access: a.access })).statusCode).toBe(400);
    });

    it("dos personas que compiten por la última plaza: sólo una se mueve", async () => {
      const x = await book(tour, { date: day(30), time: "09:00", adults: 1 });
      const y = await book(tour, { date: day(31), time: "09:00", adults: 1 });
      await book(tour, { date: day(32), time: "09:00", adults: 1 });             // deja una sola plaza libre el día 32
      const res = await Promise.all([change(x.id, { date: day(32) }, { access: x.access }), change(y.id, { date: day(32) }, { access: y.access })]);
      expect(res.map((r) => r.statusCode).sort()).toEqual([200, 422]);
    });

    it("el total nunca baja: si la nueva fecha cuesta más, la diferencia queda como saldo", async () => {
      const mon = nextWd(1, day(40)), fri = nextWd(5, day(50));
      const weekday1 = await book(stay, { room_id: room, date: mon, check_out: addDays(mon, 1) }, { mode: "pay_later" });
      expect(weekday1.booking.total_price).toBe(100);
      await pool.query("INSERT INTO booking_payments (booking_id, kind, amount, currency, provider, method) VALUES ($1, 'manual', 100, $2, 'manual', 'efectivo')", [weekday1.id, weekday1.booking.currency]);
      await pool.query("UPDATE bookings SET amount_paid = 100, payment_status = 'paid', status = 'confirmed' WHERE id = $1", [weekday1.id]);
      const up = json(await change(weekday1.id, { date: fri, check_out: addDays(fri, 1) }, { access: weekday1.access })).data;
      expect(up).toMatchObject({ old_total: 100, quoted_total: 150, new_total: 150, price_difference: 50, new_balance_due: 50 });
      expect(up.booking).toMatchObject({ total_price: 150, amount_paid: 100, balance_due: 50, payment_status: "partial", date: fri });
      // Volver a una fecha barata: el total se conserva (sin crédito ni reembolso).
      const mon2 = nextWd(1, day(70));
      const down = json(await change(weekday1.id, { date: mon2, check_out: addDays(mon2, 1) }, { access: weekday1.access })).data;
      expect(down).toMatchObject({ old_total: 150, quoted_total: 100, new_total: 150, price_difference: 0 });
      expect((await row(weekday1.id)).total_price).toBe(150);
    });

    it("el viajero tiene 2 cambios y hasta 48 h antes; el operador no tiene esos límites", async () => {
      const b = await book(tour, { date: day(80), time: "09:00" });
      expect((await change(b.id, { date: day(81) }, { access: b.access })).statusCode).toBe(200);
      expect((await change(b.id, { date: day(82) }, { access: b.access })).statusCode).toBe(200);
      const third = await change(b.id, { date: day(83) }, { access: b.access });
      expect(third.statusCode).toBe(422);
      expect(json(third).error.details).toMatchObject({ code: "CHANGE_LIMIT", max: 2 });
      // El operador sí puede, y el viajero recibe el aviso.
      expect((await call("POST", `/org/bookings/${b.id}/change-date`, { token: owner.token, payload: { date: day(83) } })).statusCode).toBe(200);
      expect((await row(b.id)).date_changes).toBe(3);
      const stranger = await signup();
      expect((await call("POST", `/org/bookings/${b.id}/change-date`, { token: stranger.token, payload: { date: day(84) } })).statusCode).toBe(403);
      expect((await call("POST", `/org/bookings/${b.id}/change-date`, { payload: { date: day(84) } })).statusCode).toBe(401);
      // Con menos de 48 h de aviso, el viajero debe contactar al operador.
      const soon = await book(tour, { date: addDays(today, 1), time: "09:00" });
      const late = await change(soon.id, { date: day(85) }, { access: soon.access });
      expect(late.statusCode).toBe(422);
      expect(json(late).error.details.code).toBe("CHANGE_TOO_LATE");
      expect((await call("POST", `/org/bookings/${soon.id}/change-date`, { token: owner.token, payload: { date: day(85) } })).statusCode).toBe(200);
    });
  });

  describe("voucher en PDF", () => {
    it("sólo para reservas confirmadas; el titular, su token o el operador lo descargan; nadie más", async () => {
      const u = await signup(), other = await signup();
      const b = await book(tour, { date: day(90), time: "09:00", adults: 2 }, { token: u.token });
      const pending = await call("GET", `/bookings/${b.id}/voucher.pdf`, { token: u.token });
      expect(pending.statusCode).toBe(422);
      expect(json(pending).error.details.code).toBe("VOUCHER_NOT_AVAILABLE");
      await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [b.id]);
      const pdf = await call("GET", `/bookings/${b.id}/voucher.pdf`, { token: u.token });
      expect(pdf.statusCode).toBe(200);
      expect(pdf.headers["content-type"]).toBe("application/pdf");
      expect(pdf.headers["content-disposition"]).toContain(`voucher-${b.reference}.pdf`);
      expect(pdf.headers["cache-control"]).toBe("private, no-store");
      expect(pdf.rawPayload.subarray(0, 5).toString()).toBe("%PDF-");
      expect(pdf.rawPayload.length).toBeGreaterThan(2000);
      expect(pdf.rawPayload.subarray(-6).toString()).toContain("%%EOF");
      expect((await call("GET", `/bookings/${b.id}/voucher.pdf?token=${b.access}`)).statusCode).toBe(200);   // el token de acceso de la reserva también sirve
      expect((await call("GET", `/bookings/${b.id}/voucher.pdf`, { token: other.token })).statusCode).toBe(404);
      expect((await call("GET", `/bookings/${b.id}/voucher.pdf`)).statusCode).toBe(404);
      const org = await call("GET", `/org/bookings/${b.id}/voucher.pdf`, { token: owner.token });
      expect(org.statusCode).toBe(200);
      expect(org.rawPayload.subarray(0, 5).toString()).toBe("%PDF-");
      expect((await call("GET", `/org/bookings/${b.id}/voucher.pdf`, { token: other.token })).statusCode).toBe(403);
      // Reserva de invitado: con su token.
      const g = await book(stay, { room_id: room, date: day(95), check_out: day(97) });
      await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [g.id]);
      const guest = await call("GET", `/bookings/${g.id}/voucher.pdf?token=${g.access}`);
      expect(guest.statusCode).toBe(200);
      expect(guest.rawPayload.subarray(0, 5).toString()).toBe("%PDF-");
      // Cancelada: ya no hay voucher.
      await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [g.id]);
      expect((await call("GET", `/bookings/${g.id}/voucher.pdf?token=${g.access}`)).statusCode).toBe(422);
    });

    it("el código QR del voucher es la referencia que el personal valida en /tickets/verify", async () => {
      const b = await book(tour, { date: day(100), time: "09:00" });
      await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [b.id]);
      const scan = await call("POST", "/tickets/verify", { token: owner.token, payload: { code: b.reference } });
      expect(scan.statusCode).toBe(200);
      expect(json(scan).data).toMatchObject({ valid: true, kind: "booking", reference: b.reference, date: day(100) });
    });
  });

  describe("alta de proveedor", () => {
    it("crea la cuenta y su organización en un solo paso, con sesión iniciada y pendiente de verificación", async () => {
      const email = uniq();
      const res = await call("POST", "/auth/partner/register", { payload: { email, password: PW, accept_terms: true, display_name: "Dueña Aventuras", business_name: "Aventuras Nuevas SRL", business_type: "tour", phone: "8095550000", province: "Samaná" } });
      expect(res.statusCode).toBe(201);
      const d = json(res).data;
      expect(d.user.email).toBe(email);
      expect(d.organization).toMatchObject({ business_name: "Aventuras Nuevas SRL" });
      const me = json(await call("GET", "/orgs/me", { token: d.tokens.access_token })).data;
      expect(me).toMatchObject({ role: "owner", org: { business_name: "Aventuras Nuevas SRL", verification: "unverified" } });
      // Todavía no puede publicar hasta que el equipo la verifique.
      const listing = json(await call("POST", "/org/listings", { token: d.tokens.access_token, payload: { category: "experiencia", title: "Tour nuevo", summary: "s", description: "d", destination: "Samaná", price: 50, capacity: 5, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
      expect((await call("PUT", `/org/listings/${listing}/status`, { token: d.tokens.access_token, payload: { status: "published" } })).statusCode).toBe(422);
    });

    it("valida el cuerpo y rechaza un correo ya registrado", async () => {
      const email = uniq();
      const ok = { email, password: PW, accept_terms: true, business_name: "Otra Empresa SRL" };
      expect((await call("POST", "/auth/partner/register", { payload: { ...ok, business_name: "x" } })).statusCode).toBe(400);
      expect((await call("POST", "/auth/partner/register", { payload: { ...ok, accept_terms: false } })).statusCode).toBe(400);
      const { business_name: _b, ...noBusiness } = ok;
      expect((await call("POST", "/auth/partner/register", { payload: noBusiness })).statusCode).toBe(400);
      expect((await call("POST", "/auth/partner/register", { payload: ok })).statusCode).toBe(201);
      expect((await call("POST", "/auth/partner/register", { payload: ok })).statusCode).toBe(409);
    });
  });
});
