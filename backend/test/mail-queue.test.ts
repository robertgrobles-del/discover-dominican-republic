import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Mailer } from "../src/modules/mailer/mailer.js";
import { makeApp, testEnv } from "./helpers.js";

describe("cola de correo durable", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const mk = (over: Record<string, string> = {}) => new Mailer(testEnv(over), pool, app.log);
  const enqueue = (m: Mailer, to: string, n = 1) => Promise.all(Array.from({ length: n }, (_, i) =>
    m.send({ to: `${to}${i}@queue.test`, template: "auth.password_changed", locale: "es", data: { name: `N${i}` } })));

  beforeAll(async () => { app = await makeApp(); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("guarda el mensaje antes de enviarlo y otra instancia (tras un reinicio) lo entrega", async () => {
    const before = mk();
    await enqueue(before, "reinicio");
    const row = (await pool.query("SELECT status, attempts, payload FROM email_log WHERE to_email = 'reinicio0@queue.test'")).rows[0];
    expect(row).toMatchObject({ status: "queued", attempts: 0 });
    expect(row.payload.data.name).toBe("N0");

    const after = mk(); // "proceso nuevo": sólo conoce lo que hay en la base
    await after.drain();
    expect(after.last("reinicio0@queue.test", "auth.password_changed")!.subject).toContain("contraseña");
    const sent = (await pool.query("SELECT status, attempts, sent_at FROM email_log WHERE to_email = 'reinicio0@queue.test'")).rows[0];
    expect(sent).toMatchObject({ status: "sent", attempts: 1 });
    expect(sent.sent_at).not.toBeNull();
  });

  it("varias instancias en paralelo entregan cada correo exactamente una vez", async () => {
    const [a, b, c] = [mk(), mk(), mk()] as [Mailer, Mailer, Mailer];
    await enqueue(a, "paralelo", 45);
    await Promise.all([a.drain(), b.drain(), c.drain()]);
    const all = [...a.outbox, ...b.outbox, ...c.outbox].filter((m) => m.to.startsWith("paralelo"));
    expect(all).toHaveLength(45);
    expect(new Set(all.map((m) => m.to)).size).toBe(45);
    const rows = (await pool.query("SELECT DISTINCT status, attempts FROM email_log WHERE to_email LIKE 'paralelo%@queue.test'")).rows;
    expect(rows).toEqual([{ status: "sent", attempts: 1 }]);
  });

  it("reintenta con espera creciente y descarta tras agotar los intentos", async () => {
    const failing = new Mailer(testEnv({ MAIL_TRANSPORT: "smtp", SMTP_HOST: "127.0.0.1", SMTP_PORT: "1", MAIL_MAX_ATTEMPTS: "3" }), pool, app.log);
    await enqueue(failing, "reintento");
    const state = async () => (await pool.query("SELECT status, attempts, EXTRACT(EPOCH FROM (next_attempt_at - now()))::int AS wait FROM email_log WHERE to_email = 'reintento0@queue.test'")).rows[0];
    await failing.drain();
    let s = await state();
    expect(s).toMatchObject({ status: "queued", attempts: 1 });
    expect(s.wait).toBeGreaterThan(50); // ~1 minuto
    await pool.query("UPDATE email_log SET next_attempt_at = now() WHERE to_email = 'reintento0@queue.test'");
    await failing.drain();
    s = await state();
    expect(s).toMatchObject({ status: "queued", attempts: 2 });
    expect(s.wait).toBeGreaterThan(250); // ~5 minutos: más que el anterior
    await pool.query("UPDATE email_log SET next_attempt_at = now() WHERE to_email = 'reintento0@queue.test'");
    await failing.drain();
    expect(await state()).toMatchObject({ status: "failed", attempts: 3 });
    await failing.drain(); // un correo fallido no se vuelve a intentar
    expect((await state()).attempts).toBe(3);
  });

  it("recupera mensajes que quedaron 'sending' por un proceso caído", async () => {
    const m = mk();
    await enqueue(m, "abandonado");
    await pool.query("UPDATE email_log SET status = 'sending', locked_at = now() - interval '10 minutes', attempts = 1 WHERE to_email = 'abandonado0@queue.test'");
    await m.drain();
    expect(m.last("abandonado0@queue.test")).toBeDefined();
    expect((await pool.query("SELECT status, attempts FROM email_log WHERE to_email = 'abandonado0@queue.test'")).rows[0]).toMatchObject({ status: "sent", attempts: 2 });
  });

  it("no toca los que otro proceso está enviando ahora mismo", async () => {
    const m = mk();
    await enqueue(m, "enviando");
    await pool.query("UPDATE email_log SET status = 'sending', locked_at = now(), attempts = 1 WHERE to_email = 'enviando0@queue.test'");
    await m.drain();
    expect(m.last("enviando0@queue.test")).toBeUndefined();
  });

  it("es un outbox transaccional: si la transacción se revierte, el correo no existe", async () => {
    const m = mk();
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      await m.send({ to: "revertido@queue.test", template: "auth.password_changed", locale: "es", data: { name: "X" } }, c);
      await c.query("ROLLBACK");
    } finally { c.release(); }
    expect((await pool.query("SELECT count(*)::int AS n FROM email_log WHERE to_email = 'revertido@queue.test'")).rows[0].n).toBe(0);
  });

  it("el registro guarda cuenta y correo juntos; si la cuenta no se crea, tampoco hay correo", async () => {
    const email = `atomico${Date.now()}@queue.test`;
    const payload = { email, password: "Correcta-Clave-2026!", accept_terms: true };
    expect((await app.inject({ method: "POST", url: "/api/v1/auth/register", payload })).statusCode).toBe(201);
    expect((await app.inject({ method: "POST", url: "/api/v1/auth/register", payload })).statusCode).toBe(409);
    const n = (await pool.query("SELECT count(*)::int AS n FROM email_log WHERE to_email = $1 AND template = 'auth.verify_email'", [email])).rows[0].n;
    expect(n).toBe(1);
  });

  it("el trabajador periódico entrega sin intervención y se detiene al cerrar", async () => {
    const live = await makeApp({ MAIL_WORKER_ENABLED: "true", MAIL_POLL_MS: "200" });
    const email = `auto${Date.now()}@queue.test`;
    expect((await live.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: "Correcta-Clave-2026!", accept_terms: true } })).statusCode).toBe(201);
    for (let i = 0; i < 40 && !live.mailer.last(email, "auth.verify_email"); i++) await new Promise((r) => setTimeout(r, 100));
    expect(live.mailer.last(email, "auth.verify_email")).toBeDefined();
    await live.close();
  });
});
