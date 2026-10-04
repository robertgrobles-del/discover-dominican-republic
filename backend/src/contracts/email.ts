import type { PoolClient } from "pg";
import type { Locale } from "../lib/i18n.js";

/** Versionable application contract for email commands; consumers do not depend on the mailer implementation. */
export interface EmailTemplateData {
  "auth.verify_email": { name: string; url: string; hours: number };
  "auth.welcome": { name: string; url: string };
  "auth.reset_password": { name: string; url: string; minutes: number };
  "auth.password_changed": { name: string };
  "booking.confirmation": BookingMail & { paid: string; balance: string };
  "booking.request_received": BookingMail;
  "booking.date_changed": BookingMail;
  "booking.cancelled": { name: string; reference: string; service: string; refund: string; operator: string };
  "booking.balance_due": { name: string; reference: string; service: string; operator: string; date: string; balance: string; url: string };
  "booking.claim": { name: string; organizer: string; dates: string; url: string; hours: number };
  "operator.min_guests": { operator: string; service: string; date: string; booked: number; min: number; url: string };
  "operator.payout_sent": { operator: string; amount: string; reference: string };
  "operator.quarterly_report": { operator: string; quarter: string; bookings: number; guests: number; growth: string; findings: string[]; url: string };
  "operator.weekly_report": { operator: string; period: string; bookings: number; revenue: string; whatsapp: number; calls: number; directions: number; website: number; url: string };
  "newsletter.confirm": { url: string };
  "support.received": { name: string; reference: string; subject: string };
  "establishment.received": { name: string; establishment: string; url: string };
  "support.reply": { name: string; reference: string; message: string; url: string };
  "store.order_confirmation": { name: string; reference: string; total: string; items: string; url: string };
  "store.order_update": { name: string; reference: string; title: string; message: string; url: string };
  "vendor.approved": { shop: string; url: string };
  "vendor.new_order": { shop: string; reference: string; items: string; total: string; url: string };
  "ambassador.approved": { name: string; code: string; url: string };
  "ambassador.payout": { name: string; amount: string; reference: string };
  "marketing.campaign": { subject: string; body: string; unsubscribe_url: string };
  "org.invitation": { operator: string; inviter: string; role: string; url: string; days: number };
  "booking.reminder": BookingMail;
  "booking.review_request": { name: string; service: string; operator: string; url: string };
  "auth.two_factor_reset": { name: string };
  "operator.new_booking": { operator: string; traveler: string; reference: string; service: string; dates: string; guests: string; total: string; url: string };
}

interface BookingMail { name: string; reference: string; service: string; operator: string; dates: string; guests: string; total: string; url: string }
export type EmailTemplateKey = keyof EmailTemplateData;

export interface SendEmailInput<K extends EmailTemplateKey> {
  to: string;
  template: K;
  data: EmailTemplateData[K];
  locale: Locale;
  userId?: string | null;
}

/** Port implemented by the in-process queue today and by the future communication service adapter. */
export interface MailerPort {
  send<K extends EmailTemplateKey>(input: SendEmailInput<K>, client?: PoolClient): Promise<void>;
}
