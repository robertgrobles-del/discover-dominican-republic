import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/lib/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `rc${Date.now().toString(36)}${n++}@test.local`;

interface Item { kind: string; reference_id: string; label: string; collected: number; invoiced: number }

describe("conciliación para finanzas", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, owner: string;
  let tour: string;
  let key = 0;
  const today = todayInSantoDomingo();

  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    if (!role) return reg.data.tokens.access_token as string;
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  /** Reserva con pago posterior y un cobro manual por `amount`. */
  const paidBooking = async (amount: number) => {
    const b = json(await call("POST", "/bookings", { headers: { "idempotency-key": `rc-key-${Date.now()}-${key++}` }, payload: { request: { listing_id: tour, date: addDays(today, 40 + key), time: "09:00", adults: 2 }, contact: { name: "Rosa Viajera", email: "rosa@test.local" }, payment_mode: "pay_later" } })).data.booking as { id: string; reference: string };
    expect((await call("POST", `/org/bookings/${b.id}/payments`, { token: owner, payload: { amount, method: "cash" } })).statusCode).toBe(200);
    return b;
  };
  const invoice = (referenceId: string, subtotal: number) => call("POST", "/invoices/issue", { token: admin, payload: { ncf_type: "B02", buyer_name: "Rosa Viajera", subtotal, itbis: 0, currency: "USD", reference_type: "booking", reference_id: referenceId } });
  const report = async () => json(await call("GET", `/admin/finance/reconciliation?from=${today}&to=${today}`, { token: admin })).data;
  const find = async (ref: string) => ((await report()).discrepancies as Item[]).filter((d) => d.reference_id === ref || d.label === ref);

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); owner = await account();
    const orgId = json(await call("POST", "/orgs", { token: owner, payload: { business_name: `Conciliación ${Date.now()}` } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner, payload: { category: "experiencia", title: "Tour Finanzas", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 500, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("un cobro sin comprobante aparece como pendiente de facturar y desaparece al emitirlo por el mismo monto", async () => {
    const b = await paidBooking(200);
    expect(await find(b.id)).toEqual([expect.objectContaining({ kind: "paid_without_invoice", label: b.reference, collected: 200, invoiced: 0 })]);
    expect((await invoice(b.id, 200)).statusCode).toBe(201);
    expect(await find(b.id)).toEqual([]);
  });

  it("detecta un comprobante por un monto distinto al cobrado, también si se emitió con la referencia legible", async () => {
    const b = await paidBooking(200);
    expect((await invoice(b.reference, 150)).statusCode).toBe(201);
    expect(await find(b.id)).toEqual([expect.objectContaining({ kind: "invoice_mismatch", collected: 200, invoiced: 150 })]);
  });

  it("detecta un comprobante de una reserva que nunca se cobró", async () => {
    const b = json(await call("POST", "/bookings", { headers: { "idempotency-key": `rc-key-${Date.now()}-sin-cobro` }, payload: { request: { listing_id: tour, date: addDays(today, 90), time: "09:00", adults: 1 }, contact: { name: "Rosa Viajera", email: "rosa@test.local" }, payment_mode: "pay_later" } })).data.booking as { id: string };
    await invoice(b.id, 100);
    expect(await find(b.id)).toEqual([expect.objectContaining({ kind: "invoice_without_payment", collected: 0, invoiced: 100 })]);
  });

  it("resume cobros, comprobantes y conteos, y deja constancia de la consulta", async () => {
    const r = await report();
    const usd = (r.collected as { source: string; currency: string; charges: number; refunds: number; net: number }[]).filter((c) => c.source === "booking" && c.currency === "USD");
    expect(usd.reduce((s, c) => s + c.charges, 0)).toBeGreaterThanOrEqual(400);
    for (const c of usd) expect(c.net).toBeCloseTo(c.charges - c.refunds, 2);
    expect((r.invoiced as { reference_type: string; total: number }[]).find((i) => i.reference_type === "booking")!.total).toBeGreaterThanOrEqual(450);
    expect(r.discrepancy_counts.invoice_mismatch).toBeGreaterThanOrEqual(1);
    expect(r.discrepancy_counts.invoice_without_payment).toBeGreaterThanOrEqual(1);
    const seen = await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action = 'finance.reconciliation_view' AND entity_id = $1", [`${today}:${today}`]);
    expect(seen.rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it("sólo administración, y con un rango válido", async () => {
    expect((await call("GET", "/admin/finance/reconciliation")).statusCode).toBe(401);
    expect((await call("GET", "/admin/finance/reconciliation", { token: owner })).statusCode).toBe(403);
    expect((await call("GET", `/admin/finance/reconciliation?from=${today}&to=${addDays(today, -1)}`, { token: admin })).statusCode).toBe(400);
    expect((await call("GET", `/admin/finance/reconciliation?from=${addDays(today, -500)}&to=${today}`, { token: admin })).statusCode).toBe(400);
  });
});
