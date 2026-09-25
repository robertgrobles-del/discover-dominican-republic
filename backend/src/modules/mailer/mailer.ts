import nodemailer, { type Transporter } from "nodemailer";
import type { FastifyBaseLogger } from "fastify";
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

/**
 * Servicio de correo (docs §5.13). Ningún módulo envía correo directo: llama a `send()`, que renderiza la plantilla,
 * registra el intento en `email_log` y lo entrega por el transporte configurado (log, SMTP o memoria en pruebas).
 * El envío corre en segundo plano para no retrasar la respuesta HTTP; `drain()` espera a los pendientes (cierre y pruebas).
 * Con un volumen mayor se sustituye la cola en proceso por BullMQ sin cambiar esta interfaz.
 */
export class Mailer {
  /** Mensajes entregados por el transporte de memoria (sólo NODE_ENV=test). */
  readonly outbox: SentMessage[] = [];
  private readonly pending = new Set<Promise<unknown>>();
  private readonly transport: Transporter | null;

  constructor(private readonly env: Env, private readonly db: Db, private readonly log: FastifyBaseLogger) {
    this.transport = env.MAIL_TRANSPORT === "smtp"
      ? nodemailer.createTransport({
          host: env.SMTP_HOST ?? "localhost", port: env.SMTP_PORT, secure: env.SMTP_SECURE,
          auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
        })
      : null;
  }

  send<K extends TemplateKey>(input: SendInput<K>): Promise<void> {
    const job = this.deliver(input).catch((err) => this.log.error({ err, template: input.template }, "Fallo el envío de correo"));
    this.pending.add(job);
    void job.finally(() => this.pending.delete(job));
    return job;
  }

  async drain() { await Promise.allSettled([...this.pending]); }

  /** Último mensaje enviado a `to` (pruebas). */
  last(to: string, template?: string): SentMessage | undefined {
    return [...this.outbox].reverse().find((m) => m.to === to.toLowerCase() && (!template || m.template === template));
  }

  private async deliver<K extends TemplateKey>(input: SendInput<K>) {
    const to = input.to.toLowerCase();
    const r = renderTemplate(input.template, input.locale, input.data);
    const { rows } = await this.db.query<{ id: string }>(
      "INSERT INTO email_log (user_id, to_email, template, locale, subject) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [input.userId ?? null, to, input.template, r.locale, r.subject],
    );
    const logId = rows[0]!.id;
    try {
      let providerId: string | null = null;
      if (this.env.MAIL_TRANSPORT === "memory") {
        this.outbox.push({ to, subject: r.subject, text: r.text, html: r.html, template: input.template, at: new Date() });
      } else if (this.transport) {
        const info = await this.transport.sendMail({ from: this.env.MAIL_FROM, to, subject: r.subject, text: r.text, html: r.html });
        providerId = info.messageId ?? null;
      } else {
        // Transporte "log": el cuerpo de texto incluye los enlaces, útil en desarrollo sin servidor SMTP.
        this.log.info({ to, subject: r.subject, template: input.template }, `📧 ${r.subject}\n${r.text}`);
      }
      await this.db.query("UPDATE email_log SET status = 'sent', sent_at = now(), provider_id = $2 WHERE id = $1", [logId, providerId]);
    } catch (err) {
      await this.db.query("UPDATE email_log SET status = 'failed', error = $2 WHERE id = $1", [logId, (err as Error).message.slice(0, 300)]);
      throw err;
    }
  }
}
