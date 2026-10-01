import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import type { MailerPort } from "../../contracts/email.js";
import type { AutomationService } from "./automations.js";
import { addDays, todayInSantoDomingo } from "./domain/dates.js";
import type { IcalService } from "./ical.js";
import type { PayoutService } from "./payouts.js";
import { auditInsert } from "../../lib/audit.js";

const PENDING_PAYMENT_MINUTES = 30;

interface Deps { db: Db; env: Env; mailer: MailerPort; runner: JobRegistrar; automations: AutomationService; ical: IcalService; payouts: PayoutService }

/** Registra los trabajos de Operadores RD (docs §9). Cada uno es idempotente. */
export function registerOperatorJobs(d: Deps) {
  const { db, runner } = d;

  runner.register({ name: "bookings.reminders", description: "Recordatorio 24 h antes (una vez por reserva)", everySeconds: 900, run: async ({ now }) => ({ sent: await d.automations.reminders(now) }) });
  runner.register({ name: "bookings.review_requests", description: "Solicitud de reseña a reservas completadas", everySeconds: 3600, run: async () => ({ sent: await d.automations.reviewRequests() }) });
  runner.register({ name: "ical.sync", description: "Sincroniza calendarios externos con más de 1 h", everySeconds: 900, run: async () => ({ synced: await d.ical.syncDue() }) });

  // Reservas con pago en línea que nunca se cobraron (por ejemplo, el proceso cayó entre reservar y cobrar): liberan cupo y código promocional.
  runner.register({
    name: "bookings.expire_pending", description: `Cancela reservas con pago en línea sin cobrar tras ${PENDING_PAYMENT_MINUTES} min y libera el cupo`, everySeconds: 900,
    run: async () => {
      const { rows } = await db.query<{ id: string; promo_code: string | null; org_id: string }>(
        `UPDATE bookings SET status = 'cancelled', cancelled_at = now(), cancelled_by = 'system', cancel_reason = 'payment_timeout'
          WHERE status = 'pending' AND payment_status = 'unpaid' AND payment_mode IN ('pay_now', 'deposit') AND created_at < now() - make_interval(mins => $1)
          RETURNING id, promo_code, org_id`, [PENDING_PAYMENT_MINUTES],
      );
      for (const r of rows) if (r.promo_code) await db.query("UPDATE operator_promotions SET uses = GREATEST(0, uses - 1) WHERE org_id = $1 AND upper(code) = upper($2)", [r.org_id, r.promo_code]);
      return { cancelled: rows.length };
    },
  });

  // Saldo pendiente a 3 días o menos de la salida: un aviso por reserva.
  runner.register({
    name: "bookings.balance_due", description: "Aviso de saldo pendiente a 3 días de la salida", everySeconds: 3600,
    run: async ({ now }) => {
      const today = todayInSantoDomingo(now);
      const { rows } = await db.query(
        `SELECT b.id, b.reference, b.contact_name, b.contact_email, b.listing_title, b.date::text AS date, b.total_price, b.amount_paid, b.currency, p.business_name, p.slug
           FROM bookings b JOIN partner_profiles p ON p.id = b.org_id
          WHERE b.status = 'confirmed' AND b.amount_paid > 0 AND b.amount_paid < b.total_price AND b.date BETWEEN $1::date AND $2::date AND NOT (b.notified ? 'balance_due') LIMIT 200`, [today, addDays(today, 3)],
      );
      let sent = 0;
      for (const r of rows) {
        const claimed = await db.query("UPDATE bookings SET notified = notified || jsonb_build_object('balance_due', true) WHERE id = $1 AND NOT (notified ? 'balance_due')", [r.id]);
        if (!claimed.rowCount) continue;
        const cur = r.currency === "USD" ? "US$ " : "RD$ ";
        const bal = Math.round((Number(r.total_price) - Number(r.amount_paid)) * 100) / 100;
        await d.mailer.send({ to: r.contact_email, template: "booking.balance_due", locale: "es", data: { name: String(r.contact_name).split(" ")[0]!, reference: r.reference, service: r.listing_title, operator: r.business_name, date: r.date, balance: `${cur}${bal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, url: `${d.env.WEB_BASE_URL}/operador/${r.slug}` } });
        sent++;
      }
      return { sent };
    },
  });

  // Salidas de paquetes/tours con mínimo de personas que no lo alcanzan a 7 días: se avisa al operador una sola vez por salida.
  runner.register({
    name: "bookings.min_guests_check", description: "Avisa al operador de salidas que no alcanzan el mínimo de personas a 7 días", everySeconds: 6 * 3600,
    run: async ({ now }) => {
      const today = todayInSantoDomingo(now);
      const { rows } = await db.query(
        `SELECT l.id AS listing_id, l.title, l.min_guests, b.date::text AS date, sum(b.guests)::int AS booked, p.email, p.business_name
           FROM bookings b JOIN operator_listings l ON l.id = b.listing_id JOIN partner_profiles p ON p.id = l.org_id
          WHERE l.min_guests IS NOT NULL AND b.status IN ('pending', 'confirmed') AND b.date BETWEEN $1::date AND $2::date
          GROUP BY l.id, l.title, l.min_guests, b.date, p.email, p.business_name HAVING sum(b.guests) < l.min_guests`, [today, addDays(today, 7)],
      );
      let notified = 0;
      for (const r of rows) {
        const mark = await db.query("INSERT INTO job_marks (key) VALUES ($1) ON CONFLICT DO NOTHING", [`min_guests:${r.listing_id}:${r.date}`]);
        if (!mark.rowCount) continue;
        await d.mailer.send({ to: r.email, template: "operator.min_guests", locale: "es", data: { operator: r.business_name, service: r.title, date: r.date, booked: r.booked, min: r.min_guests, url: `${d.env.WEB_BASE_URL}/operadores/panel/reservas` } });
        notified++;
      }
      return { notified };
    },
  });

  runner.register({
    name: "promotions.expire", description: "Desactiva promociones vencidas", everySeconds: 86_400,
    run: async ({ now }) => ({ deactivated: (await db.query("UPDATE operator_promotions SET active = false WHERE active AND ends_at IS NOT NULL AND ends_at < $1::date", [todayInSantoDomingo(now)])).rowCount }),
  });

  // Plan de accesos, punto 86: al vencer un contrato o una invitación el acceso se retira solo y queda auditado.
  runner.register({
    name: "org.access.expire", description: "Retira membresías vencidas y cierra invitaciones caducadas", everySeconds: 900,
    run: async () => {
      const c = await db.connect();
      try {
        await c.query("BEGIN");
        const members = (await c.query<{ org_id: string; user_id: string; role: string }>("DELETE FROM org_members WHERE expires_at IS NOT NULL AND expires_at <= now() AND role <> 'owner' RETURNING org_id, user_id, role")).rows;
        for (const m of members) await auditInsert(c, { actor: null, action: "org.member_expired", entity: "user", id: m.user_id, org: m.org_id, meta: { role: m.role } });
        const invitations = (await c.query("UPDATE org_invitations SET revoked_at = now() WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at <= now()")).rowCount ?? 0;
        await c.query("COMMIT");
        return { members_removed: members.length, invitations_closed: invitations };
      } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
    },
  });

  runner.register({ name: "payouts.generate", description: "Lote de liquidaciones a operadores (reservas completadas no liquidadas)", everySeconds: 7 * 86_400, run: async () => d.payouts.generate() });
}
