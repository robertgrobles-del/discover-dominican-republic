import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { JobRunner } from "../src/modules/jobs/runner.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `job${Date.now().toString(36)}${n++}@test.local`;
const soon = (k: number) => addDays(todayInSantoDomingo(), k);

describe("ejecutor de trabajos", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  beforeAll(async () => { app = await makeApp(); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); await app.close(); });

  const row = async (name: string) => (await pool.query("SELECT * FROM system_cron_jobs WHERE job_name = $1", [name])).rows[0];

  it("ejecuta los vencidos, guarda el resultado y agenda el siguiente", async () => {
    const runner = new JobRunner(app.db, app.log);
    let calls = 0;
    runner.register({ name: "t.ok", description: "prueba", everySeconds: 3600, run: async () => { calls++; return { done: 3 }; } });
    runner.register({ name: "t.fail", description: "falla", everySeconds: 3600, run: async () => { throw new Error("boom"); } });
    expect((await runner.tick()).sort()).toEqual(["t.fail", "t.ok"]);
    expect(await runner.tick()).toEqual([]); // aún no vence
    expect(calls).toBe(1);
    expect(await row("t.ok")).toMatchObject({ status: "success", last_result: { done: 3 }, error_log: null });
    expect(await row("t.fail")).toMatchObject({ status: "failed", error_log: "boom" });
    expect(new Date((await row("t.ok")).next_run_at).getTime()).toBeGreaterThan(Date.now() + 3_000_000);
  });

  it("no corre desactivados, y dos instancias no ejecutan el mismo trabajo a la vez", async () => {
    let calls = 0;
    const mk = () => { const r = new JobRunner(app.db, app.log); r.register({ name: "t.once", description: "una vez", everySeconds: 60, run: async () => { calls++; await new Promise((res) => setTimeout(res, 150)); } }); return r; };
    const [a, b] = [mk(), mk()];
    await a.sync();
    await Promise.all([a.tick(), b.tick()]);
    expect(calls).toBe(1);
    await a.update("t.once", { enabled: false });
    await pool.query("UPDATE system_cron_jobs SET next_run_at = now() - interval '1 hour' WHERE job_name = 't.once'");
    expect(await a.tick()).toEqual([]);
    await a.update("t.once", { enabled: true });
    expect(await a.tick()).toEqual(["t.once"]);
    expect(calls).toBe(2);
    await pool.query("UPDATE system_cron_jobs SET status = 'running', started_at = now() WHERE job_name = 't.once'");
    await expect(a.runNow("t.once")).rejects.toMatchObject({ code: "CONFLICT" });
    await pool.query("UPDATE system_cron_jobs SET started_at = now() - interval '2 hours' WHERE job_name = 't.once'"); // huérfano
    expect((await a.runNow("t.once")).status).toBe("success");
  });

  describe("trabajos de Operadores RD y liquidaciones", () => {
    let owner: { token: string; id: string };
    let admin: string;
    let orgId: string, tour: string, pkg: string;
    let k = 0;
    const call = (method: "GET" | "POST" | "PUT" | "PATCH", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
      app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
    const signup = async () => {
      const email = uniq();
      const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
      return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
    };
    const book = (over: Record<string, unknown>, mode: string, listing = tour, email = "cli@test.local") =>
      call("POST", "/bookings", { headers: { "idempotency-key": `job-key-${Date.now()}-${k++}` }, payload: { request: { listing_id: listing, date: soon(20), time: "09:00", adults: 2, ...over }, contact: { name: "Cliente Job", email }, payment_mode: mode, ...(mode === "pay_later" ? {} : { payment_method_token: "tok_test_ok" }) } });
    const status = (id: string, s: string) => call("PUT", `/org/bookings/${id}/status`, { token: owner.token, payload: { status: s } });

    beforeAll(async () => {
      const a = await signup();
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
      admin = json(await call("POST", "/auth/login", { payload: { email: a.email, password: PW } })).data.tokens.access_token;
      owner = await signup();
      orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: "Jobs Tours" } })).data.id;
      await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
      const mk = async (payload: object) => { const id = json(await call("POST", "/org/listings", { token: owner.token, payload })).data.id as string; await call("PUT", `/org/listings/${id}/status`, { token: owner.token, payload: { status: "published" } }); return id; };
      const base = { summary: "s", description: "d", destination: "Samaná", images: ["a.jpg"], time_slots: ["09:00"] };
      tour = await mk({ ...base, category: "experiencia", title: "Tour Jobs", price: 100, capacity: 10, deposit_percent: 50 });
      pkg = await mk({ ...base, category: "paquete", title: "Paquete Jobs", price: 300, capacity: 12, days: 2, min_guests: 4, itinerary: [{ day: 1, title: "Llegada" }, { day: 2, title: "Playa" }] });
    });

    it("expire_pending libera el cupo de reservas en línea nunca cobradas, no las de pagar después", async () => {
      const stuck = json(await book({ date: soon(21), adults: 3 }, "pay_later")).data.booking;
      const request = json(await book({ date: soon(21), adults: 1 }, "pay_later")).data.booking;
      await pool.query("UPDATE bookings SET payment_mode = 'pay_now', created_at = now() - interval '2 hours' WHERE id = $1", [stuck.id]);
      await pool.query("UPDATE bookings SET created_at = now() - interval '2 hours' WHERE id = $1", [request.id]);
      const res = (await app.jobs.runNow("bookings.expire_pending")) as { result: { cancelled: number } };
      expect(res.result.cancelled).toBeGreaterThanOrEqual(1);
      expect(json(await call("GET", `/org/bookings/${stuck.id}`, { token: owner.token })).data).toMatchObject({ status: "cancelled", cancellation: { reason: "payment_timeout", cancelled_by: "system" } });
      expect(json(await call("GET", `/org/bookings/${request.id}`, { token: owner.token })).data.status).toBe("pending");
    });

    it("balance_due y min_guests avisan una sola vez", async () => {
      const dep = json(await book({ date: soon(2) }, "deposit")).data.booking;
      expect(dep.balance_due).toBe(100);
      const kr = await book({ date: soon(3), adults: 2 }, "pay_later", pkg, "pkg@test.local");
      await app.jobs.runNow("bookings.balance_due");
      await app.jobs.runNow("bookings.min_guests_check");
      await app.mailer.drain();
      const count = () => app.mailer.outbox.filter((m) => m.to === "cli@test.local" && m.subject.includes("Saldo pendiente")).length;
      const minCount = () => app.mailer.outbox.filter((m) => m.subject.includes("Salida sin el mínimo") && m.subject.includes("Paquete Jobs")).length;
      expect(count()).toBe(1);
      expect(minCount()).toBe(1);
      await app.jobs.runNow("bookings.balance_due");
      await app.jobs.runNow("bookings.min_guests_check");
      await app.mailer.drain();
      expect(count()).toBe(1);
      expect(minCount()).toBe(1);
    });

    it("liquida sólo lo cobrado en línea de reservas completadas, una sola vez, y el admin la marca pagada", async () => {
      const pr = await book({ date: soon(30), adults: 2 }, "pay_now");
      const paid = json(pr).data.booking; // 200 cobrado en línea
      const notDone = json(await book({ date: soon(31), adults: 1 }, "pay_now")).data.booking; // sin completar
      const mr = await call("POST", "/org/bookings", { token: owner.token, payload: { request: { listing_id: tour, date: soon(32), time: "09:00", adults: 1 }, contact: { name: "Mostrador", email: "m@test.local" } } });
      const manual = json(mr).data;
      await call("POST", `/org/bookings/${manual.id}/payments`, { token: owner.token, payload: { amount: 100 } });
      for (const id of [paid.id, manual.id]) await status(id, "completed");

      expect(json(await call("GET", "/org/payouts", { token: owner.token })).data).toEqual([]);
      const first = json(await call("POST", "/admin/payouts", { token: admin, payload: { org_id: orgId } })).data;
      expect(first.payouts).toBe(1);
      const second = json(await call("POST", "/admin/payouts", { token: admin, payload: { org_id: orgId } })).data;
      expect(second.payouts).toBe(0);

      const mine = json(await call("GET", "/org/payouts", { token: owner.token }));
      expect(mine.data).toHaveLength(1);
      expect(mine.data[0]).toMatchObject({ currency: "USD", gross: 200, commission: 16, net: 184, status: "pending" });
      expect(mine.meta.pending).toEqual([{ currency: "USD", net: 184 }]);
      const items = json(await call("GET", `/org/payouts/${mine.data[0].id}/items`, { token: owner.token })).data;
      expect(items).toHaveLength(1);
      expect(items[0].booking_id).toBe(paid.id); // ni la pendiente ni la manual

      await status(notDone.id, "confirmed");
      await status(notDone.id, "completed");
      expect(json(await call("POST", "/admin/payouts", { token: admin })).data.payouts).toBe(1);

      const id = mine.data[0].id;
      expect((await call("POST", `/admin/payouts/${id}/mark-paid`, { token: owner.token, payload: { reference: "TRF-1" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/payouts/${id}/mark-paid`, { token: admin, payload: { reference: "x" } })).statusCode).toBe(400);
      expect((await call("POST", `/admin/payouts/${id}/mark-paid`, { token: admin, payload: { reference: "TRF-2026-001" } })).statusCode).toBe(204);
      expect((await call("POST", `/admin/payouts/${id}/mark-paid`, { token: admin, payload: { reference: "TRF-2026-001" } })).statusCode).toBe(422);
      await app.mailer.drain();
      expect(app.mailer.outbox.some((m) => m.subject.startsWith("Liquidación enviada") && m.text.includes("TRF-2026-001"))).toBe(true);
      expect(json(await call("GET", "/org/payouts?status=paid", { token: owner.token })).data[0].reference).toBe("TRF-2026-001");
    });

    it("el panel lista los trabajos, los ejecuta y los configura (sólo admin)", async () => {
      expect((await call("GET", "/admin/jobs", { token: owner.token })).statusCode).toBe(403);
      const jobs = json(await call("GET", "/admin/jobs", { token: admin })).data as { name: string }[];
      expect(jobs.map((j) => j.name)).toEqual(expect.arrayContaining(["bookings.expire_pending", "bookings.balance_due", "bookings.min_guests_check", "payouts.generate", "promotions.expire", "ical.sync"]));
      const run = await call("POST", "/admin/jobs/promotions.expire/run", { token: admin });
      expect(run.statusCode).toBe(200);
      expect(json(run).data.status).toBe("success");
      expect((await call("POST", "/admin/jobs/no.existe/run", { token: admin })).statusCode).toBe(404);
      expect((await call("PATCH", "/admin/jobs/promotions.expire", { token: admin, payload: { interval_seconds: 5 } })).statusCode).toBe(400);
      expect((await call("PATCH", "/admin/jobs/promotions.expire", { token: admin, payload: { enabled: false, interval_seconds: 7200 } })).statusCode).toBe(204);
      expect(await row("promotions.expire")).toMatchObject({ enabled: false, interval_seconds: 7200 });
    });
  });
});
