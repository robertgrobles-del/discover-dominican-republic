import { randomBytes } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { hashToken } from "../auth/tokens.js";
import type { Mailer } from "../mailer/mailer.js";
import { todayInSantoDomingo } from "./domain/dates.js";
import type { IcalService } from "./ical.js";

/**
 * Automatizaciones del operador: recordatorio ~24 h antes, solicitud de reseña tras completar y sincronización de calendarios.
 * Cada tarea es idempotente (marca `bookings.notified`) y el ciclo se toma con un candado consultivo,
 * así varias instancias del servidor no duplican correos.
 */
export class AutomationService {
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly db: Db, private readonly env: Env, private readonly mailer: Mailer, private readonly ical: IcalService, private readonly log: FastifyBaseLogger) {}

  start(everyMs = 5 * 60_000) {
    if (this.timer) return;
    this.timer = setInterval(() => void this.run().catch((err) => this.log.error({ err }, "Falló el ciclo de automatizaciones")), everyMs);
    this.timer.unref();
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }

  async run(now = new Date()) {
    const c = await this.db.connect();
    try {
      if (!(await c.query<{ ok: boolean }>("SELECT pg_try_advisory_lock(727001) AS ok")).rows[0]!.ok) return { reminders: 0, review_requests: 0, calendars: 0, skipped: true };
      try {
        const reminders = await this.reminders(now);
        const review_requests = await this.reviewRequests();
        const calendars = await this.ical.syncDue();
        return { reminders, review_requests, calendars, skipped: false };
      } finally { await c.query("SELECT pg_advisory_unlock(727001)"); }
    } finally { c.release(); }
  }

  private common(r: Record<string, string>): { name: string; reference: string; service: string; operator: string; dates: string; guests: string; total: string; url: string } {
    const dates = r.check_out && r.check_out !== r.date ? `${r.date} → ${r.check_out}` : `${r.date}${r.time ? ` ${r.time}` : ""}`;
    return { name: r.contact_name!.split(" ")[0]!, reference: r.reference!, service: r.listing_title!, operator: r.business_name!, dates, guests: String(r.guests), total: "", url: `${this.env.WEB_BASE_URL}/operador/${r.slug}` };
  }

  /** Reservas confirmadas que empiezan en las próximas 24 h y aún no recibieron recordatorio. */
  async reminders(now: Date) {
    const today = todayInSantoDomingo(now), tomorrow = todayInSantoDomingo(new Date(now.getTime() + 86_400_000));
    const { rows } = await this.db.query(
      `SELECT b.id, b.reference, b.contact_name, b.contact_email, b.listing_title, b.date::text AS date, b.check_out::text AS check_out, b.time, b.guests, p.business_name, p.slug
         FROM bookings b JOIN partner_profiles p ON p.id = b.org_id
        WHERE b.status = 'confirmed' AND b.date BETWEEN $1::date AND $2::date AND NOT (b.notified ? 'reminder')
          AND ((b.date::timestamp + coalesce(nullif(b.time, '')::time, '00:00'::time)) AT TIME ZONE 'America/Santo_Domingo') BETWEEN $3::timestamptz AND $4::timestamptz
        ORDER BY b.date LIMIT 200`,
      [today, tomorrow, now, new Date(now.getTime() + 24 * 3_600_000)],
    );
    let sent = 0;
    for (const r of rows) {
      const claimed = await this.db.query("UPDATE bookings SET notified = notified || jsonb_build_object('reminder', true) WHERE id = $1 AND NOT (notified ? 'reminder')", [r.id]);
      if (!claimed.rowCount) continue;
      await this.mailer.send({ to: r.contact_email, template: "booking.reminder", locale: "es", data: this.common(r) });
      sent++;
    }
    return sent;
  }

  /** Reservas completadas con reseña pendiente: un solo correo por reserva. */
  async reviewRequests() {
    const { rows } = await this.db.query(
      `SELECT b.id, b.reference, b.contact_name, b.contact_email, b.listing_title, b.date::text AS date, b.check_out::text AS check_out, b.time, b.guests, p.business_name, p.slug
         FROM bookings b JOIN partner_profiles p ON p.id = b.org_id WHERE b.status = 'completed' AND b.review_pending AND NOT (b.notified ? 'review_request') LIMIT 200`,
    );
    let sent = 0;
    for (const r of rows) {
      const claimed = await this.db.query("UPDATE bookings SET notified = notified || jsonb_build_object('review_request', true) WHERE id = $1 AND NOT (notified ? 'review_request')", [r.id]);
      if (!claimed.rowCount) continue;
      // El invitado sólo tiene el hash de su token: se emite uno nuevo para este enlace (reemplaza al anterior).
      const token = randomBytes(24).toString("base64url");
      await this.db.query("UPDATE bookings SET access_hash = $2 WHERE id = $1", [r.id, hashToken(token)]);
      const d = this.common(r);
      await this.mailer.send({ to: r.contact_email, template: "booking.review_request", locale: "es", data: { name: d.name, service: d.service, operator: d.operator, url: `${this.env.WEB_BASE_URL}/reserva/${r.id}/resena?token=${token}` } });
      sent++;
    }
    return sent;
  }
}
