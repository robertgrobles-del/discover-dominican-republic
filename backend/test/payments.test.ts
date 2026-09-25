import { createHmac } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { verifyStripeSignature } from "../src/modules/operators/gateway.js";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp, testEnv } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const SECRET = "whsec_test_secret_123456";
let n = 0;
const uniq = () => `pay${Date.now().toString(36)}${n++}@test.local`;
const day = (k: number) => addDays(todayInSantoDomingo(), 90 + k);
const sign = (raw: string, secret = SECRET, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex")}`;

describe("firma de webhooks de Stripe", () => {
  const raw = '{"id":"evt_1"}';
  it("acepta la firma válida y rechaza secreto distinto, cuerpo alterado, reloj viejo y formato roto", () => {
    const now = 1_700_000_000;
    expect(verifyStripeSignature(raw, sign(raw, SECRET, now), SECRET, now)).toBe(true);
    expect(verifyStripeSignature(raw, sign(raw, "otro_secreto_largo", now), SECRET, now)).toBe(false);
    expect(verifyStripeSignature(raw + " ", sign(raw, SECRET, now), SECRET, now)).toBe(false);
    expect(verifyStripeSignature(raw, sign(raw, SECRET, now - 1000), SECRET, now)).toBe(false);
    for (const bad of [undefined, "", "t=abc,v1=zz", "v1=abcd", `t=${now}`]) expect(verifyStripeSignature(raw, bad, SECRET, now)).toBe(false);
  });
  it("Stripe exige claves en la configuración", () => {
    expect(() => loadEnv({ NODE_ENV: "test", DATABASE_URL: "postgres://x", PAYMENT_PROVIDER: "stripe" } as NodeJS.ProcessEnv)).toThrow(/STRIPE_SECRET_KEY/);
  });
});

describe("Stripe: cobros y conciliación", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string };
  let tour: string;
  let k = 0;
  const calls: { url: string; headers: Record<string, string>; form: URLSearchParams }[] = [];
  let seq = 0;

  const stripeMock = vi.fn(async (url: string, init: { headers: Record<string, string>; body?: string }) => {
    const form = new URLSearchParams(init.body ?? "");
    calls.push({ url, headers: init.headers, form });
    const send = (status: number, body: unknown) => ({ status, json: async () => body });
    if (url.endsWith("/payment_intents")) {
      const pm = form.get("payment_method");
      if (pm === "pm_declined") return send(402, { error: { type: "card_error", code: "card_declined", decline_code: "insufficient_funds" } });
      if (pm === "pm_down") return send(503, {});
      if (pm === "pm_3ds") return send(200, { id: "pi_3ds", status: "requires_action" });
      return send(200, { id: `pi_${++seq}`, status: "succeeded" });
    }
    if (url.endsWith("/cancel")) return send(200, { status: "canceled" });
    if (url.endsWith("/refunds")) return send(200, { id: `re_${++seq}` });
    return send(404, {});
  });

  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const book = (token: string, over: Record<string, unknown> = {}, mode = "pay_now") =>
    call("POST", "/bookings", { headers: { "idempotency-key": `pay-key-${Date.now()}-${k++}` }, payload: { request: { listing_id: tour, date: day(0), time: "09:00", adults: 2, ...over }, contact: { name: "Pago Prueba", email: "pago@test.local" }, payment_mode: mode, ...(mode === "pay_later" ? {} : { payment_method_token: token }) } });
  const webhook = (event: object, opts: { signature?: string } = {}) => {
    const raw = JSON.stringify(event);
    return app.inject({ method: "POST", url: "/api/v1/webhooks/payments/stripe", payload: raw, headers: { "content-type": "application/json", "stripe-signature": opts.signature ?? sign(raw) } });
  };
  const succeeded = (id: string, pi: string, bookingId: string, amountCents: number, kind = "full") => ({ id, type: "payment_intent.succeeded", data: { object: { id: pi, amount: amountCents, amount_received: amountCents, currency: "usd", metadata: { booking_id: bookingId, kind } } } });
  const booking = async (id: string) => (await pool.query("SELECT status, payment_status, amount_paid FROM bookings WHERE id = $1", [id])).rows[0];

  beforeAll(async () => {
    vi.stubGlobal("fetch", stripeMock);
    app = await makeApp({ PAYMENT_PROVIDER: "stripe", STRIPE_SECRET_KEY: "sk_test_123456789", STRIPE_WEBHOOK_SECRET: SECRET });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const res = json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } }));
    owner = { token: res.data.tokens.access_token };
    const orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: "Pagos SRL" } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour Pagos", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 50, time_slots: ["09:00"], images: ["a.jpg"], deposit_percent: 50 } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } });
  });
  afterAll(async () => { vi.unstubAllGlobals(); await pool.end(); await app.close(); });

  it("cobra con un PaymentIntent idempotente, en centavos y con la reserva en los metadatos", async () => {
    const res = await book("pm_ok");
    expect(res.statusCode).toBe(201);
    const b = json(res).data.booking;
    expect(b).toMatchObject({ status: "confirmed", payment_status: "paid", amount_paid: 200 });
    const c = calls.filter((x) => x.url.endsWith("/payment_intents")).at(-1)!;
    expect(c.form.get("amount")).toBe("20000");
    expect(c.form.get("currency")).toBe("usd");
    expect(c.form.get("confirm")).toBe("true");
    expect(c.form.get("metadata[booking_id]")).toBe(b.id);
    expect(c.headers.authorization).toBe("Bearer sk_test_123456789");
    expect(c.headers["idempotency-key"]).toMatch(new RegExp(`^${b.id}:full:`));
    expect((await pool.query("SELECT provider FROM booking_payments WHERE booking_id = $1", [b.id])).rows[0].provider).toBe("stripe");
  });

  it("rechazos, 3-D Secure y caídas del proveedor no dejan reserva ni cobro", async () => {
    const before = (await pool.query("SELECT count(*)::int AS n FROM bookings WHERE status <> 'cancelled'")).rows[0].n;
    const declined = await book("pm_declined");
    expect(declined.statusCode).toBe(402);
    expect(json(declined).error.details.reason).toBe("insufficient_funds");
    const threeDs = await book("pm_3ds");
    expect(threeDs.statusCode).toBe(402);
    expect(json(threeDs).error.details.reason).toBe("requires_action");
    expect(calls.some((x) => x.url.endsWith("/payment_intents/pi_3ds/cancel"))).toBe(true);
    expect((await book("pm_down")).statusCode).toBe(502);
    expect((await pool.query("SELECT count(*)::int AS n FROM bookings WHERE status <> 'cancelled'")).rows[0].n).toBe(before);
  });

  it("cancelar reembolsa por Stripe con el PaymentIntent original", async () => {
    const r = json(await book("pm_ok", { date: day(1) })).data;
    const cancelled = json(await call("POST", `/bookings/${r.booking.id}/cancel?token=${r.access_token}`)).data;
    expect(cancelled).toMatchObject({ status: "cancelled", refund_amount: 200, payment_status: "refunded" });
    const rf = calls.filter((x) => x.url.endsWith("/refunds")).at(-1)!;
    expect(rf.form.get("amount")).toBe("20000");
    expect(rf.form.get("payment_intent")).toMatch(/^pi_/);
    expect(rf.headers["idempotency-key"]).toBe(`${r.booking.id}:refund:20000`);
  });

  it("webhook: rechaza firmas malas y no reprocesa el mismo evento", async () => {
    const r = json(await book("pm_ok", { date: day(2) })).data.booking;
    const pi = (await pool.query("SELECT provider_ref FROM booking_payments WHERE booking_id = $1", [r.id])).rows[0].provider_ref;
    expect((await webhook(succeeded("evt_bad", pi, r.id, 20000), { signature: "t=1,v1=00" })).statusCode).toBe(401);
    expect((await app.inject({ method: "POST", url: "/api/v1/webhooks/payments/stripe", payload: "{}", headers: { "content-type": "application/json" } })).statusCode).toBe(401);
    const first = await webhook(succeeded("evt_same", pi, r.id, 20000));
    expect(first.statusCode).toBe(200);
    expect(json(first).outcome).toBe("already_recorded"); // el cobro directo ya lo había anotado
    expect(json(await webhook(succeeded("evt_same", pi, r.id, 20000))).outcome).toBe("duplicate");
    expect((await pool.query("SELECT count(*)::int AS n FROM booking_payments WHERE booking_id = $1", [r.id])).rows[0].n).toBe(1);
  });

  it("webhook concilia un cobro cuya respuesta se perdió (reserva pendiente → pagada)", async () => {
    const r = json(await book("", { date: day(3) }, "pay_later")).data.booking; // pendiente y sin pago anotado
    expect(await booking(r.id)).toMatchObject({ status: "pending", payment_status: "unpaid" });
    const res = await webhook(succeeded("evt_lost", "pi_lost_1", r.id, 20000));
    expect(json(res).outcome).toBe("reconciled");
    expect(await booking(r.id)).toMatchObject({ status: "confirmed", payment_status: "paid", amount_paid: 200 });
  });

  it("webhook devuelve automáticamente un cobro huérfano de una reserva ya cancelada", async () => {
    const r = json(await book("", { date: day(4) }, "pay_later")).data.booking;
    await pool.query("UPDATE bookings SET status = 'cancelled', cancelled_by = 'system' WHERE id = $1", [r.id]);
    const refundsBefore = calls.filter((x) => x.url.endsWith("/refunds")).length;
    expect(json(await webhook(succeeded("evt_orphan", "pi_orphan_1", r.id, 20000))).outcome).toBe("orphan_refunded");
    expect(calls.filter((x) => x.url.endsWith("/refunds")).length).toBe(refundsBefore + 1);
    expect(await booking(r.id)).toMatchObject({ status: "cancelled", payment_status: "refunded" });
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'payment.orphan_refunded' AND entity_id = $1", [r.id])).rowCount).toBe(1);
  });

  it("webhook refleja un reembolso hecho desde el panel de Stripe, una sola vez", async () => {
    const r = json(await book("pm_ok", { date: day(5) })).data.booking;
    const pi = (await pool.query("SELECT provider_ref FROM booking_payments WHERE booking_id = $1", [r.id])).rows[0].provider_ref;
    const ev = (id: string) => ({ id, type: "charge.refunded", data: { object: { id: "ch_1", payment_intent: pi, amount_refunded: 5000 } } });
    expect(json(await webhook(ev("evt_ref1"))).outcome).toBe("refund_recorded");
    expect(json(await webhook(ev("evt_ref2"))).outcome).toBe("already_recorded");
    expect(await booking(r.id)).toMatchObject({ payment_status: "partial", amount_paid: 200 });
    const net = (await pool.query("SELECT sum(CASE WHEN kind = 'refund' THEN -amount ELSE amount END) AS n FROM booking_payments WHERE booking_id = $1", [r.id])).rows[0].n;
    expect(Number(net)).toBe(150);
  });

  it("un evento desconocido se acepta y se ignora; una disputa queda auditada", async () => {
    expect(json(await webhook({ id: "evt_x", type: "customer.created", data: { object: {} } })).outcome).toBe("ignored");
    const r = json(await book("pm_ok", { date: day(6) })).data.booking;
    const pi = (await pool.query("SELECT provider_ref FROM booking_payments WHERE booking_id = $1", [r.id])).rows[0].provider_ref;
    expect(json(await webhook({ id: "evt_disp", type: "charge.dispute.created", data: { object: { id: "dp_1", payment_intent: pi, amount: 20000, reason: "fraudulent" } } })).outcome).toBe("dispute_logged");
    expect((await pool.query("SELECT meta FROM audit_log WHERE action = 'payment.dispute' AND entity_id = $1", [r.id])).rows[0].meta).toMatchObject({ dispute: "dp_1", reason: "fraudulent" });
  });
});

void testEnv;
