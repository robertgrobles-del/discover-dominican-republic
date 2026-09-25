import nodemailer, { type Transporter } from "nodemailer";
import type { FastifyBaseLogger } from "fastify";
import type { PoolClient } from "pg";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import type { Locale } from "../../lib/i18n.js";
import { renderTemplate, type TemplateData, type TemplateKey } from "./templates.js";

export interface SentMessage { to: string; subject: string; text: string; html: string; template: string; at: Date }

export interface SendInput<K extends TemplateKey> {
  to: string;
  template: K;
  data: TemplateData[K];
  locale: Locale;
  userId?: string | null;
}

interface QueuedRow { id: string; to_email: string; template: TemplateKey; locale: Locale; payload: { data: TemplateData[TemplateKey] }; attempts: number }

/** Espera antes de reintentar, en segundos, según el número de intentos ya hechos (1.º fallo → 1 min …). */
const BACKOFF_SECONDS = [60, 300, 1800, 7200, 43_200];
const STUCK_AFTER = "5 minutes";

/**
 * Servicio de correo (docs §5.13). Ningún módulo envía correo directo: llama a `send()`, que guarda el mensaje en la
 * cola durable `email_log` (estado `queued`, dentro de la misma transacción si se pasa un cliente) y vuelve enseguida.
 * Un trabajador —en este proceso o en otro— toma los pendientes con `FOR UPDATE SKIP LOCKED`, los renderiza y los entrega
 * por el transporte configurado (log, SMTP o memoria). Si falla, reintenta con espera creciente hasta `MAIL_MAX_ATTEMPTS`
 * y luego lo marca `failed`. Un mensaje `sending` abandonado por un proceso caído se vuelve a poner en cola.
 */
export class Mailer {
  /** Mensajes entregados por el transporte de memoria (sólo NODE_ENV=test). */
  readonly outbox: SentMessage[] = [];
  private readonly transport: Transporter | null;
  private timer: NodeJS.Timeout | null = null;
  private running: Promise<number> | null = null;

  constructor(private readonly env: Env, private readonly db: Db, private readonly log: FastifyBaseLogger) {
    this.transport = env.MAIL_TRANSPORT === "smtp"
      ? nodemailer.createTransport({
          host: env.SMTP_HOST ?? "localhost", port: env.SMTP_PORT, secure: env.SMTP_SECURE,
          auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
        })
      : null;
  }

  /**
   * Encola un correo. Con `client` se une a esa transacción (outbox transaccional: el correo existe si y sólo si el cambio
   * que lo originó se confirma) y los errores se propagan para que la transacción falle entera. Sin `client` es de mejor
   * esfuerzo: si no se pudo guardar se registra y no interrumpe el flujo del usuario.
   */
  async send<K extends TemplateKey>(input: SendInput<K>, client?: PoolClient): Promise<void> {
    const insert = async () => {
      const r = renderTemplate(input.template, input.locale, input.data);
      await (client ?? this.db).query(
        "INSERT INTO email_log (user_id, to_email, template, locale, subject, payload, status, next_attempt_at) VALUES ($1, $2, $3, $4, $5, $6, 'queued', now())",
        [input.userId ?? null, input.to.toLowerCase(), input.template, r.locale, r.subject, JSON.stringify({ data: input.data })],
      );
    };
    if (client) { await insert(); return; }
    try { await insert(); this.kick(); } catch (err) { this.log.error({ err, template: input.template }, "No se pudo encolar el correo"); }
  }

  /** Inicia el trabajador periódico. */
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.kick(), this.env.MAIL_POLL_MS);
    this.timer.unref();
    this.kick();
  }

  /** Detiene el trabajador y procesa una última vez lo que ya estaba vencido. */
  async stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    try { await this.drain(); } catch (err) { this.log.warn({ err }, "No se pudo vaciar la cola de correo al cerrar"); }
  }

  /** Dispara un ciclo sin esperar (si ya hay uno en curso no hace nada). */
  private kick() {
    if (!this.timer) return; // sin trabajador propio (pruebas, o procesado por otra instancia) no se dispara nada
    void this.processDue().catch((err) => this.log.error({ err }, "Error en el trabajador de correo"));
  }

  /** Procesa todos los correos vencidos hasta vaciar la cola (los reintentos futuros no cuentan). Útil en pruebas y al cerrar. */
  async drain(): Promise<void> {
    for (let i = 0; i < 100; i++) if ((await this.processDue()) === 0) return;
  }

  /** Un ciclo: recupera abandonados y entrega hasta 20 vencidos. Devuelve cuántos tomó. */
  processDue(): Promise<number> {
    this.running ??= this.cycle().finally(() => { this.running = null; });
    return this.running;
  }

  private async cycle(): Promise<number> {
    await this.db.query(`UPDATE email_log SET status = 'queued', locked_at = NULL WHERE status = 'sending' AND locked_at < now() - interval '${STUCK_AFTER}'`);
    const { rows } = await this.db.query<QueuedRow>(
      `WITH picked AS (
         SELECT id FROM email_log WHERE status = 'queued' AND next_attempt_at <= now() AND payload IS NOT NULL
          ORDER BY next_attempt_at, created_at LIMIT 20 FOR UPDATE SKIP LOCKED)
       UPDATE email_log e SET status = 'sending', locked_at = now(), attempts = e.attempts + 1
         FROM picked WHERE e.id = picked.id
       RETURNING e.id, e.to_email, e.template, e.locale, e.payload, e.attempts`,
    );
    await Promise.all(rows.map((row) => this.deliver(row)));
    return rows.length;
  }

  private async deliver(row: QueuedRow) {
    try {
      const r = renderTemplate(row.template, row.locale, row.payload.data as never);
      let providerId: string | null = null;
      if (this.env.MAIL_TRANSPORT === "memory") {
        this.outbox.push({ to: row.to_email, subject: r.subject, text: r.text, html: r.html, template: row.template, at: new Date() });
      } else if (this.transport) {
        const info = await this.transport.sendMail({ from: this.env.MAIL_FROM, to: row.to_email, subject: r.subject, text: r.text, html: r.html });
        providerId = info.messageId ?? null;
      } else {
        // Transporte "log": el cuerpo de texto incluye los enlaces, útil en desarrollo sin servidor SMTP.
        this.log.info({ to: row.to_email, subject: r.subject, template: row.template }, `📧 ${r.subject}\n${r.text}`);
      }
      await this.db.query("UPDATE email_log SET status = 'sent', sent_at = now(), locked_at = NULL, provider_id = $2, error = NULL WHERE id = $1", [row.id, providerId]);
    } catch (err) {
      const message = (err as Error).message.slice(0, 300);
      const final = row.attempts >= this.env.MAIL_MAX_ATTEMPTS;
      const wait = BACKOFF_SECONDS[Math.min(row.attempts - 1, BACKOFF_SECONDS.length - 1)]!;
      this.log.warn({ id: row.id, template: row.template, attempt: row.attempts, final, err: message }, final ? "Correo descartado tras agotar los intentos" : "Falló el envío; se reintentará");
      await this.db.query(
        "UPDATE email_log SET status = $2, locked_at = NULL, error = $3, next_attempt_at = now() + make_interval(secs => $4) WHERE id = $1",
        [row.id, final ? "failed" : "queued", message, wait],
      );
    }
  }

  /** Último mensaje enviado a `to` (pruebas). */
  last(to: string, template?: string): SentMessage | undefined {
    return [...this.outbox].reverse().find((m) => m.to === to.toLowerCase() && (!template || m.template === template));
  }
}
