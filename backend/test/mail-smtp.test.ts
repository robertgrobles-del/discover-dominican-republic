import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

describe("correo por SMTP (mismo camino que Mailpit/SES)", () => {
  const received: ParsedMail[] = [];
  let smtp: SMTPServer;
  let port: number;
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    smtp = new SMTPServer({
      authOptional: true, disabledCommands: ["STARTTLS"],
      onData(stream, _session, cb) { simpleParser(stream).then((m) => { received.push(m); cb(); }, cb); },
    });
    await new Promise<void>((res) => smtp.listen(0, "127.0.0.1", () => res()));
    port = (smtp.server.address() as { port: number }).port;
  });
  afterAll(async () => { smtp.close(); await pool.end(); });

  it("entrega el correo de verificación con remitente, texto y HTML, y registra el proveedor", async () => {
    const app = await makeApp({ MAIL_TRANSPORT: "smtp", SMTP_HOST: "127.0.0.1", SMTP_PORT: String(port), MAIL_FROM: "Descubre RD <no-reply@descubre.test>" });
    const email = `smtp${Date.now()}@test.local`;
    const res = await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: "Correcta-Clave-2026!", accept_terms: true } });
    expect(res.statusCode).toBe(201);
    await app.mailer.drain();
    const mail = received.find((m) => m.to && "value" in m.to && m.to.value[0]?.address === email)!;
    expect(mail).toBeDefined();
    expect(mail.from?.value[0]?.address).toBe("no-reply@descubre.test");
    expect(mail.subject).toContain("Confirma tu correo");
    expect(mail.text).toMatch(/verificar-correo\?token=/);
    expect(mail.html).toContain("<a href=");
    const log = (await pool.query("SELECT status, provider_id FROM email_log WHERE to_email = $1", [email])).rows[0];
    expect(log.status).toBe("sent");
    expect(log.provider_id).toBeTruthy();
    await app.close();
  });

  it("si el servidor SMTP falla, el registro sigue funcionando y el fallo queda en la bitácora", async () => {
    const app = await makeApp({ MAIL_TRANSPORT: "smtp", SMTP_HOST: "127.0.0.1", SMTP_PORT: "1" });
    const email = `caido${Date.now()}@test.local`;
    const res = await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: "Correcta-Clave-2026!", accept_terms: true } });
    expect(res.statusCode).toBe(201);
    expect(json(res).data.tokens.access_token).toBeTruthy();
    await app.mailer.drain();
    // El primer fallo no descarta el correo: queda en cola con un reintento programado.
    const log = (await pool.query("SELECT status, error, attempts, next_attempt_at > now() + interval '30 seconds' AS later FROM email_log WHERE to_email = $1", [email])).rows[0];
    expect(log).toMatchObject({ status: "queued", attempts: 1, later: true });
    expect(log.error).toBeTruthy();
    await app.close();
  });
});
