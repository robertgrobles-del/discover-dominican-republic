import type { Locale } from "../../lib/i18n.js";

// Plantillas del catálogo de correos (docs §5.13). Por ahora es/en; los demás idiomas caen a español
// hasta que se carguen en la tabla de plantillas del admin (Fase 3).

export interface TemplateData {
  "auth.verify_email": { name: string; url: string; hours: number };
  "auth.welcome": { name: string; url: string };
  "auth.reset_password": { name: string; url: string; minutes: number };
  "auth.password_changed": { name: string };
  "booking.confirmation": BookingMail & { paid: string; balance: string };
  "booking.request_received": BookingMail;
  "booking.cancelled": { name: string; reference: string; service: string; refund: string; operator: string };
  "operator.new_booking": { operator: string; traveler: string; reference: string; service: string; dates: string; guests: string; total: string; url: string };
}
interface BookingMail { name: string; reference: string; service: string; operator: string; dates: string; guests: string; total: string; url: string }
export type TemplateKey = keyof TemplateData;
export interface Rendered { subject: string; text: string; html: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const layout = (title: string, body: string, cta?: { label: string; url: string }, footer = "Descubre RD · República Dominicana") => `<!doctype html>
<html lang="es"><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:100%">
<tr><td style="background:#0b5cab;padding:20px 28px;color:#fff;font-size:20px;font-weight:bold">Descubre RD</td></tr>
<tr><td style="padding:28px"><h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>${body}
${cta ? `<p style="margin:24px 0"><a href="${esc(cta.url)}" style="background:#0b5cab;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:bold">${esc(cta.label)}</a></p><p style="font-size:12px;color:#6b7280;word-break:break-all">${esc(cta.url)}</p>` : ""}
</td></tr><tr><td style="padding:16px 28px;background:#f9fafb;font-size:12px;color:#6b7280">${esc(footer)}</td></tr></table></td></tr></table></body></html>`;
const p = (s: string) => `<p style="line-height:1.5;margin:0 0 12px">${s}</p>`;

type Builder<K extends TemplateKey> = (d: TemplateData[K]) => Rendered;
const T = {
  "auth.verify_email": {
    es: (d) => ({
      subject: "Confirma tu correo en Descubre RD",
      text: `Hola ${d.name},\n\nConfirma tu correo para activar todas las funciones de tu cuenta:\n${d.url}\n\nEl enlace vence en ${d.hours} horas. Si no creaste la cuenta, ignora este mensaje.`,
      html: layout("Confirma tu correo", p(`Hola ${esc(d.name)},`) + p(`Confirma tu correo para activar reservas, compras y todas las funciones de tu cuenta. El enlace vence en ${d.hours} horas.`) + p("Si no creaste la cuenta, ignora este mensaje."), { label: "Confirmar mi correo", url: d.url }),
    }),
    en: (d) => ({
      subject: "Confirm your email on Descubre RD",
      text: `Hi ${d.name},\n\nConfirm your email to unlock bookings, purchases and all account features:\n${d.url}\n\nThe link expires in ${d.hours} hours. If you did not create this account, ignore this message.`,
      html: layout("Confirm your email", p(`Hi ${esc(d.name)},`) + p(`Confirm your email to unlock bookings, purchases and all account features. The link expires in ${d.hours} hours.`) + p("If you did not create this account, ignore this message."), { label: "Confirm my email", url: d.url }),
    }),
  },
  "auth.welcome": {
    es: (d) => ({
      subject: "¡Bienvenido a Descubre RD!",
      text: `Hola ${d.name},\n\nTu correo quedó confirmado. Empieza a explorar: ${d.url}`,
      html: layout("¡Bienvenido a Descubre RD!", p(`Hola ${esc(d.name)}, tu correo quedó confirmado.`) + p("Guarda tus favoritos, planifica tu viaje y gana puntos explorando la República Dominicana."), { label: "Empezar a explorar", url: d.url }),
    }),
    en: (d) => ({
      subject: "Welcome to Descubre RD!",
      text: `Hi ${d.name},\n\nYour email is confirmed. Start exploring: ${d.url}`,
      html: layout("Welcome to Descubre RD!", p(`Hi ${esc(d.name)}, your email is confirmed.`) + p("Save favorites, plan your trip and earn points exploring the Dominican Republic."), { label: "Start exploring", url: d.url }),
    }),
  },
  "auth.reset_password": {
    es: (d) => ({
      subject: "Restablece tu contraseña",
      text: `Hola ${d.name},\n\nRecibimos una solicitud para restablecer tu contraseña:\n${d.url}\n\nEl enlace vence en ${d.minutes} minutos. Si no fuiste tú, ignora este mensaje: tu contraseña no cambiará.`,
      html: layout("Restablece tu contraseña", p(`Hola ${esc(d.name)},`) + p(`Recibimos una solicitud para restablecer tu contraseña. El enlace vence en ${d.minutes} minutos.`) + p("Si no fuiste tú, ignora este mensaje: tu contraseña no cambiará."), { label: "Crear nueva contraseña", url: d.url }),
    }),
    en: (d) => ({
      subject: "Reset your password",
      text: `Hi ${d.name},\n\nWe received a request to reset your password:\n${d.url}\n\nThe link expires in ${d.minutes} minutes. If this was not you, ignore this message: your password will not change.`,
      html: layout("Reset your password", p(`Hi ${esc(d.name)},`) + p(`We received a request to reset your password. The link expires in ${d.minutes} minutes.`) + p("If this was not you, ignore this message: your password will not change."), { label: "Create a new password", url: d.url }),
    }),
  },
  "auth.password_changed": {
    es: (d) => ({
      subject: "Tu contraseña fue cambiada",
      text: `Hola ${d.name},\n\nTu contraseña de Descubre RD acaba de cambiar y se cerraron tus otras sesiones. Si no fuiste tú, restablécela de inmediato y contacta a soporte.`,
      html: layout("Tu contraseña fue cambiada", p(`Hola ${esc(d.name)},`) + p("Tu contraseña de Descubre RD acaba de cambiar y se cerraron tus otras sesiones.") + p("Si no fuiste tú, restablécela de inmediato y contacta a soporte.")),
    }),
    en: (d) => ({
      subject: "Your password was changed",
      text: `Hi ${d.name},\n\nYour Descubre RD password was just changed and your other sessions were signed out. If this was not you, reset it immediately and contact support.`,
      html: layout("Your password was changed", p(`Hi ${esc(d.name)},`) + p("Your Descubre RD password was just changed and your other sessions were signed out.") + p("If this was not you, reset it immediately and contact support.")),
    }),
  },
} as { [K in TemplateKey]: Record<"es" | "en", Builder<K>> };

const row = (label: string, value: string) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">${esc(label)}</td><td style="padding:4px 0"><b>${esc(value)}</b></td></tr>`;
const table = (rows: [string, string][]) => `<table role="presentation" style="margin:12px 0;font-size:14px">${rows.map(([l, v]) => row(l, v)).join("")}</table>`;

T["booking.confirmation"] = {
  es: (d) => ({
    subject: `Reserva confirmada ${d.reference} — ${d.service}`,
    text: `Hola ${d.name},\n\nTu reserva con ${d.operator} está confirmada.\n\n${d.service}\nFechas: ${d.dates}\nPersonas: ${d.guests}\nTotal: ${d.total}\nPagado: ${d.paid}\nSaldo: ${d.balance}\nReferencia: ${d.reference}\n\nVer o gestionar tu reserva: ${d.url}`,
    html: layout("¡Reserva confirmada!", p(`Hola ${esc(d.name)}, tu reserva con <b>${esc(d.operator)}</b> está confirmada.`) + table([["Servicio", d.service], ["Fechas", d.dates], ["Personas", d.guests], ["Total", d.total], ["Pagado", d.paid], ["Saldo pendiente", d.balance], ["Referencia", d.reference]]), { label: "Ver mi reserva", url: d.url }),
  }),
  en: (d) => ({
    subject: `Booking confirmed ${d.reference} — ${d.service}`,
    text: `Hi ${d.name},\n\nYour booking with ${d.operator} is confirmed.\n\n${d.service}\nDates: ${d.dates}\nGuests: ${d.guests}\nTotal: ${d.total}\nPaid: ${d.paid}\nBalance: ${d.balance}\nReference: ${d.reference}\n\nView or manage your booking: ${d.url}`,
    html: layout("Booking confirmed!", p(`Hi ${esc(d.name)}, your booking with <b>${esc(d.operator)}</b> is confirmed.`) + table([["Service", d.service], ["Dates", d.dates], ["Guests", d.guests], ["Total", d.total], ["Paid", d.paid], ["Balance due", d.balance], ["Reference", d.reference]]), { label: "View my booking", url: d.url }),
  }),
};
T["booking.request_received"] = {
  es: (d) => ({
    subject: `Solicitud recibida ${d.reference} — ${d.service}`,
    text: `Hola ${d.name},\n\nRecibimos tu solicitud para ${d.service} con ${d.operator}. Te confirmarán pronto.\nFechas: ${d.dates}\nPersonas: ${d.guests}\nTotal: ${d.total}\nReferencia: ${d.reference}\n\n${d.url}`,
    html: layout("Solicitud recibida", p(`Hola ${esc(d.name)}, <b>${esc(d.operator)}</b> confirmará tu reserva y te contactará pronto.`) + table([["Servicio", d.service], ["Fechas", d.dates], ["Personas", d.guests], ["Total a pagar", d.total], ["Referencia", d.reference]]), { label: "Ver mi solicitud", url: d.url }),
  }),
  en: (d) => ({
    subject: `Request received ${d.reference} — ${d.service}`,
    text: `Hi ${d.name},\n\nWe received your request for ${d.service} with ${d.operator}. They will confirm soon.\nDates: ${d.dates}\nGuests: ${d.guests}\nTotal: ${d.total}\nReference: ${d.reference}\n\n${d.url}`,
    html: layout("Request received", p(`Hi ${esc(d.name)}, <b>${esc(d.operator)}</b> will confirm your booking and contact you soon.`) + table([["Service", d.service], ["Dates", d.dates], ["Guests", d.guests], ["Total due", d.total], ["Reference", d.reference]]), { label: "View my request", url: d.url }),
  }),
};
T["booking.cancelled"] = {
  es: (d) => ({
    subject: `Reserva cancelada ${d.reference}`,
    text: `Hola ${d.name},\n\nTu reserva ${d.reference} de ${d.service} con ${d.operator} fue cancelada.\nReembolso: ${d.refund}.`,
    html: layout("Reserva cancelada", p(`Hola ${esc(d.name)}, tu reserva <b>${esc(d.reference)}</b> de ${esc(d.service)} con ${esc(d.operator)} fue cancelada.`) + p(`Reembolso: <b>${esc(d.refund)}</b>.`)),
  }),
  en: (d) => ({
    subject: `Booking cancelled ${d.reference}`,
    text: `Hi ${d.name},\n\nYour booking ${d.reference} for ${d.service} with ${d.operator} was cancelled.\nRefund: ${d.refund}.`,
    html: layout("Booking cancelled", p(`Hi ${esc(d.name)}, your booking <b>${esc(d.reference)}</b> for ${esc(d.service)} with ${esc(d.operator)} was cancelled.`) + p(`Refund: <b>${esc(d.refund)}</b>.`)),
  }),
};
T["operator.new_booking"] = {
  es: (d) => ({
    subject: `Nueva reserva ${d.reference}: ${d.service}`,
    text: `${d.operator}: ${d.traveler} reservó ${d.service}.\nFechas: ${d.dates}\nPersonas: ${d.guests}\nTotal: ${d.total}\nReferencia: ${d.reference}\n\nGestionar: ${d.url}`,
    html: layout("Nueva reserva", p(`<b>${esc(d.traveler)}</b> reservó en ${esc(d.operator)}.`) + table([["Servicio", d.service], ["Fechas", d.dates], ["Personas", d.guests], ["Total", d.total], ["Referencia", d.reference]]), { label: "Gestionar en mi panel", url: d.url }),
  }),
  en: (d) => ({
    subject: `New booking ${d.reference}: ${d.service}`,
    text: `${d.operator}: ${d.traveler} booked ${d.service}.\nDates: ${d.dates}\nGuests: ${d.guests}\nTotal: ${d.total}\nReference: ${d.reference}\n\nManage: ${d.url}`,
    html: layout("New booking", p(`<b>${esc(d.traveler)}</b> booked with ${esc(d.operator)}.`) + table([["Service", d.service], ["Dates", d.dates], ["Guests", d.guests], ["Total", d.total], ["Reference", d.reference]]), { label: "Manage in my panel", url: d.url }),
  }),
};

export function renderTemplate<K extends TemplateKey>(key: K, locale: Locale, data: TemplateData[K]): Rendered & { locale: "es" | "en" } {
  const l = locale === "en" ? "en" : "es"; // los demás idiomas usan español hasta tener plantilla propia
  return { ...(T[key][l] as Builder<K>)(data), locale: l };
}
