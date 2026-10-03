import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/lib/dates.js";
import { verifyStripeSignature } from "../src/lib/stripe-signature.js";
import { signWebhook } from "../src/lib/webhook-signature.js";
import { WebhookService } from "../src/modules/operators/webhooks.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `wh${Date.now().toString(36)}${n++}@test.local`;
const URL_OK = "https://8.8.8.8/descubre-hook";

describe("firma de webhooks", () => {
  it("la firma se verifica con el secreto correcto y caduca con el tiempo", () => {
    const sig = signWebhook("whsec_a", '{"a":1}', 1_000);
    expect(sig).toMatch(/^t=1000,v1=[0-9a-f]{64}$/);
    expect(verifyStripeSignature('{"a":1}', sig, "whsec_a", 1_010)).toBe(true);
    expect(verifyStripeSignature('{"a":2}', sig, "whsec_a", 1_010)).toBe(false);
    expect(verifyStripeSignature('{"a":1}', sig, "whsec_b", 1_010)).toBe(false);
    expect(verifyStripeSignature('{"a":1}', sig, "whsec_a", 2_000)).toBe(false);
  });
});

describe("webhooks salientes del operador", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: string, orgId: string, tour: string;
  let key = 0;
  const sent: { url: string; init: RequestInit }[] = [];
  let respond = 200;
  let svc: WebhookService;

  const call = (method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const signup = async () => json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } })).data.tokens.access_token as string;
  const book = async () => json(await call("POST", "/bookings", { headers: { "idempotency-key": `wh-key-${Date.now()}-${key++}` }, payload: { request: { listing_id: tour, date: addDays(todayInSantoDomingo(), 50 + key), time: "09:00", adults: 2 }, contact: { name: "Rosa Viajera", email: "rosa@test.local", phone: "8095550123" }, payment_mode: "pay_later" } })).data.booking as { id: string; reference: string };
  const later = (seconds: number) => new Date(Date.now() + seconds * 1000);

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    svc = new WebhookService(app.db, async (url, init) => { sent.push({ url, init }); return { status: respond }; });
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner, payload: { business_name: `Webhooks ${Date.now()}` } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner, payload: { category: "experiencia", title: "Tour Webhook", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 500, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.query("DELETE FROM org_webhooks WHERE org_id = $1", [orgId]); await pool.end(); await app.close(); });

  it("sólo admite destinos https públicos y muestra el secreto una sola vez", async () => {
    for (const url of ["http://8.8.8.8/hook", "https://127.0.0.1/hook", "https://localhost/hook", "https://169.254.169.254/latest"]) {
      expect((await call("POST", "/org/webhooks", { token: owner, payload: { url, events: ["booking.created"] } })).statusCode, url).toBe(400);
    }
    expect((await call("POST", "/org/webhooks", { token: owner, payload: { url: URL_OK, events: ["booking.borrada"] } })).statusCode).toBe(400);
    const created = await call("POST", "/org/webhooks", { token: owner, payload: { url: URL_OK, events: ["booking.created", "booking.cancelled"] } });
    expect(created.statusCode).toBe(201);
    expect(json(created).data.secret).toMatch(/^whsec_/);
    const list = json(await call("GET", "/org/webhooks", { token: owner })).data;
    expect(list).toHaveLength(1);
    expect(list[0]).not.toHaveProperty("secret");
    expect((await call("GET", "/org/webhooks", { token: await signup() })).statusCode).toBe(403);
  });

  it("entrega la reserva nueva firmada, sin datos de contacto del viajero, y no la repite", async () => {
    const hook = (await pool.query("SELECT id, secret FROM org_webhooks WHERE org_id = $1", [orgId])).rows[0];
    const b = await book();
    expect(await svc.collect(later(1))).toBe(1);
    expect(await svc.collect(later(2))).toBe(0);
    const now = later(3);
    expect(await svc.deliverDue(now)).toEqual({ delivered: 1, retried: 0, failed: 0 });
    const { url, init } = sent.at(-1)!;
    const headers = init.headers as Record<string, string>;
    const body = String(init.body);
    expect(url).toBe(URL_OK);
    expect(init.redirect).toBe("manual");
    expect(headers["x-webhook-event"]).toBe("booking.created");
    expect(verifyStripeSignature(body, headers["x-signature"], hook.secret, Math.floor(now.getTime() / 1000))).toBe(true);
    expect(JSON.parse(body)).toMatchObject({ event: "booking.created", data: { booking_id: b.id, reference: b.reference, guests: 2, status: "pending" } });
    expect(body).not.toContain("rosa@test.local");
    expect(body).not.toContain("8095550123");
    expect(await svc.deliverDue(later(4))).toEqual({ delivered: 0, retried: 0, failed: 0 });
    const log = json(await call("GET", `/org/webhooks/${hook.id}/deliveries`, { token: owner })).data;
    expect(log[0]).toMatchObject({ event: "booking.created", status: "delivered", attempts: 1, response_status: 200 });
  });

  it("reintenta con espera creciente, da la entrega por fallida al agotar intentos y avisa de la cancelación", async () => {
    const hook = (await pool.query("SELECT id FROM org_webhooks WHERE org_id = $1", [orgId])).rows[0];
    const b = await book();
    await svc.collect(later(5));
    respond = 500;
    let at = later(6);
    expect(await svc.deliverDue(at)).toEqual({ delivered: 0, retried: 1, failed: 0 });
    expect(await svc.deliverDue(new Date(at.getTime() + 30_000))).toEqual({ delivered: 0, retried: 0, failed: 0 }); // aún no toca
    for (let i = 0; i < 4; i++) { at = new Date(at.getTime() + 7 * 3_600_000); expect((await svc.deliverDue(at)).retried).toBe(1); }
    at = new Date(at.getTime() + 7 * 3_600_000);
    expect(await svc.deliverDue(at)).toEqual({ delivered: 0, retried: 0, failed: 1 });
    expect((await pool.query("SELECT consecutive_failures, active FROM org_webhooks WHERE id = $1", [hook.id])).rows[0]).toEqual({ consecutive_failures: 6, active: true });

    respond = 200;
    expect((await call("PUT", `/org/bookings/${b.id}/status`, { token: owner, payload: { status: "cancelled" } })).statusCode).toBe(200);
    expect(await svc.collect(new Date(at.getTime() + 1000))).toBe(1);
    expect((await svc.deliverDue(new Date(at.getTime() + 2000))).delivered).toBe(1);
    expect((sent.at(-1)!.init.headers as Record<string, string>)["x-webhook-event"]).toBe("booking.cancelled");
    expect((await pool.query("SELECT consecutive_failures FROM org_webhooks WHERE id = $1", [hook.id])).rows[0].consecutive_failures).toBe(0);
  });

  it("se desactiva solo tras fallos repetidos, se puede reactivar, probar y eliminar", async () => {
    const hook = (await pool.query("SELECT id FROM org_webhooks WHERE org_id = $1", [orgId])).rows[0];
    await pool.query("UPDATE org_webhooks SET consecutive_failures = 19 WHERE id = $1", [hook.id]);
    expect((await call("POST", `/org/webhooks/${hook.id}/test`, { token: owner })).statusCode).toBe(200);
    respond = 503;
    const far = new Date(Date.now() + 400 * 86_400_000);
    await svc.deliverDue(far);
    expect(json(await call("GET", "/org/webhooks", { token: owner })).data[0]).toMatchObject({ active: false, consecutive_failures: 20 });
    expect(json(await call("POST", `/org/webhooks/${hook.id}/enable`, { token: owner })).data).toMatchObject({ active: true, consecutive_failures: 0, disabled_reason: null });
    expect((await call("DELETE", `/org/webhooks/${hook.id}`, { token: owner })).statusCode).toBe(204);
    expect((await pool.query("SELECT count(*)::int AS n FROM org_webhook_deliveries WHERE webhook_id = $1", [hook.id])).rows[0].n).toBe(0);
    expect((await call("DELETE", `/org/webhooks/${hook.id}`, { token: owner })).statusCode).toBe(404);
  });
});
