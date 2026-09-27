import type { Locale } from "../../lib/i18n.js";
import { EXTRA_LOCALES, renderExtra, type ExtraLocale } from "./templates-extra.js";
import { htmlToText, sanitizeHtml, substitute, type TemplateOverride } from "./templates-meta.js";

// Plantillas del catálogo de correos (docs §5.13). Por ahora es/en; los demás idiomas caen a español
// hasta que se carguen en la tabla de plantillas del admin (Fase 3).

export interface TemplateData {
  "auth.verify_email": { name: string; url: string; hours: number };
  "auth.welcome": { name: string; url: string };
  "auth.reset_password": { name: string; url: string; minutes: number };
  "auth.password_changed": { name: string };
  "booking.confirmation": BookingMail & { paid: string; balance: string };
  "booking.request_received": BookingMail;
  "booking.date_changed": BookingMail;
  "booking.cancelled": { name: string; reference: string; service: string; refund: string; operator: string };
  "booking.balance_due": { name: string; reference: string; service: string; operator: string; date: string; balance: string; url: string };
  "operator.min_guests": { operator: string; service: string; date: string; booked: number; min: number; url: string };
  "operator.payout_sent": { operator: string; amount: string; reference: string };
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
export type TemplateKey = keyof TemplateData;
export interface Rendered { subject: string; text: string; html: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const layout = (title: string, body: string, cta?: { label: string; url: string }, footer = "Descubre RD · República Dominicana", lang = "es") => `<!doctype html>
<html lang="${lang}"><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
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
T["booking.date_changed"] = {
  es: (d) => ({
    subject: `Nueva fecha de tu reserva ${d.reference} — ${d.service}`,
    text: `Hola ${d.name},\n\nLa fecha de tu reserva con ${d.operator} cambió.\n\n${d.service}\nNueva fecha: ${d.dates}\nPersonas: ${d.guests}\nTotal: ${d.total}\nReferencia: ${d.reference}\n\nVer o gestionar tu reserva: ${d.url}`,
    html: layout("La fecha de tu reserva cambió", p(`Hola ${esc(d.name)}, la reserva con <b>${esc(d.operator)}</b> quedó en una nueva fecha.`) + table([["Servicio", d.service], ["Nueva fecha", d.dates], ["Personas", d.guests], ["Total", d.total], ["Referencia", d.reference]]), { label: "Ver mi reserva", url: d.url }),
  }),
  en: (d) => ({
    subject: `New date for your booking ${d.reference} — ${d.service}`,
    text: `Hi ${d.name},\n\nThe date of your booking with ${d.operator} changed.\n\n${d.service}\nNew date: ${d.dates}\nGuests: ${d.guests}\nTotal: ${d.total}\nReference: ${d.reference}\n\nView or manage your booking: ${d.url}`,
    html: layout("Your booking date changed", p(`Hi ${esc(d.name)}, your booking with <b>${esc(d.operator)}</b> has a new date.`) + table([["Service", d.service], ["New date", d.dates], ["Guests", d.guests], ["Total", d.total], ["Reference", d.reference]]), { label: "View my booking", url: d.url }),
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

T["org.invitation"] = {
  es: (d) => ({
    subject: `${d.inviter} te invitó a ${d.operator}`,
    text: `${d.inviter} te invitó a unirte al equipo de ${d.operator} como ${d.role}.

Acepta la invitación (vence en ${d.days} días): ${d.url}`,
    html: layout("Te invitaron a un equipo", p(`<b>${esc(d.inviter)}</b> te invitó a unirte al equipo de <b>${esc(d.operator)}</b> como <b>${esc(d.role)}</b>.`) + p(`La invitación vence en ${d.days} días.`), { label: "Aceptar invitación", url: d.url }),
  }),
  en: (d) => ({
    subject: `${d.inviter} invited you to ${d.operator}`,
    text: `${d.inviter} invited you to join ${d.operator} as ${d.role}.

Accept (expires in ${d.days} days): ${d.url}`,
    html: layout("You were invited to a team", p(`<b>${esc(d.inviter)}</b> invited you to join <b>${esc(d.operator)}</b> as <b>${esc(d.role)}</b>.`) + p(`The invitation expires in ${d.days} days.`), { label: "Accept invitation", url: d.url }),
  }),
};
T["booking.reminder"] = {
  es: (d) => ({
    subject: `Recordatorio: ${d.service} — ${d.dates}`,
    text: `Hola ${d.name},

Te recordamos tu reserva ${d.reference} con ${d.operator}.
${d.service}
Fechas: ${d.dates}
Personas: ${d.guests}

${d.url}`,
    html: layout("Tu reserva se acerca", p(`Hola ${esc(d.name)}, te recordamos tu reserva con <b>${esc(d.operator)}</b>.`) + table([["Servicio", d.service], ["Fechas", d.dates], ["Personas", d.guests], ["Referencia", d.reference]]), { label: "Ver mi reserva", url: d.url }),
  }),
  en: (d) => ({
    subject: `Reminder: ${d.service} — ${d.dates}`,
    text: `Hi ${d.name},

A reminder of your booking ${d.reference} with ${d.operator}.
${d.service}
Dates: ${d.dates}
Guests: ${d.guests}

${d.url}`,
    html: layout("Your booking is coming up", p(`Hi ${esc(d.name)}, a reminder of your booking with <b>${esc(d.operator)}</b>.`) + table([["Service", d.service], ["Dates", d.dates], ["Guests", d.guests], ["Reference", d.reference]]), { label: "View my booking", url: d.url }),
  }),
};
T["booking.review_request"] = {
  es: (d) => ({
    subject: `¿Cómo estuvo ${d.service}?`,
    text: `Hola ${d.name},

Gracias por viajar con ${d.operator}. Cuéntanos cómo te fue: ${d.url}`,
    html: layout("¿Cómo te fue?", p(`Hola ${esc(d.name)}, gracias por viajar con <b>${esc(d.operator)}</b>. Tu opinión sobre <b>${esc(d.service)}</b> ayuda a otros viajeros.`), { label: "Dejar mi reseña", url: d.url }),
  }),
  en: (d) => ({
    subject: `How was ${d.service}?`,
    text: `Hi ${d.name},

Thanks for traveling with ${d.operator}. Tell us how it went: ${d.url}`,
    html: layout("How was it?", p(`Hi ${esc(d.name)}, thanks for traveling with <b>${esc(d.operator)}</b>. Your review of <b>${esc(d.service)}</b> helps other travelers.`), { label: "Leave my review", url: d.url }),
  }),
};
T["auth.two_factor_reset"] = {
  es: (d) => ({
    subject: "Se restableció tu verificación en dos pasos",
    text: `Hola ${d.name},

Un administrador desactivó tu verificación en dos pasos y cerró tus sesiones. Vuelve a activarla al iniciar sesión. Si no lo esperabas, contacta a soporte.`,
    html: layout("Verificación en dos pasos restablecida", p(`Hola ${esc(d.name)},`) + p("Un administrador desactivó tu verificación en dos pasos y cerró tus sesiones. Vuelve a activarla al iniciar sesión.") + p("Si no lo esperabas, contacta a soporte.")),
  }),
  en: (d) => ({
    subject: "Your two-factor authentication was reset",
    text: `Hi ${d.name},

An administrator disabled your two-factor authentication and signed you out. Re-enable it when you sign in. If unexpected, contact support.`,
    html: layout("Two-factor authentication reset", p(`Hi ${esc(d.name)},`) + p("An administrator disabled your two-factor authentication and signed you out. Re-enable it when you sign in.") + p("If unexpected, contact support.")),
  }),
};

T["booking.balance_due"] = {
  es: (d) => ({
    subject: `Saldo pendiente de tu reserva ${d.reference}`,
    text: `Hola ${d.name},\n\nTu salida ${d.service} con ${d.operator} es el ${d.date} y tienes un saldo pendiente de ${d.balance}.\n\nPágalo o coordina con el operador: ${d.url}`,
    html: layout("Saldo pendiente", p(`Hola ${esc(d.name)}, tu salida <b>${esc(d.service)}</b> con ${esc(d.operator)} es el <b>${esc(d.date)}</b> y tienes un saldo pendiente de <b>${esc(d.balance)}</b>.`), { label: "Ver mi reserva", url: d.url }),
  }),
  en: (d) => ({
    subject: `Balance due for booking ${d.reference}`,
    text: `Hi ${d.name},\n\nYour ${d.service} with ${d.operator} is on ${d.date} and you have a balance of ${d.balance}.\n\n${d.url}`,
    html: layout("Balance due", p(`Hi ${esc(d.name)}, your <b>${esc(d.service)}</b> with ${esc(d.operator)} is on <b>${esc(d.date)}</b> and you have a balance of <b>${esc(d.balance)}</b>.`), { label: "View my booking", url: d.url }),
  }),
};
T["operator.min_guests"] = {
  es: (d) => ({
    subject: `Salida sin el mínimo de personas: ${d.service} (${d.date})`,
    text: `${d.operator}: la salida de ${d.service} del ${d.date} lleva ${d.booked} de ${d.min} personas mínimas. Decide si la mantienes, la cambias de fecha o reembolsas.\n\n${d.url}`,
    html: layout("Salida bajo el mínimo", p(`La salida de <b>${esc(d.service)}</b> del <b>${esc(d.date)}</b> lleva <b>${d.booked}</b> de ${d.min} personas mínimas.`) + p("Decide si la mantienes, la cambias de fecha o reembolsas."), { label: "Ir a mis reservas", url: d.url }),
  }),
  en: (d) => ({
    subject: `Departure below minimum: ${d.service} (${d.date})`,
    text: `${d.operator}: the ${d.service} departure on ${d.date} has ${d.booked} of ${d.min} minimum guests.\n\n${d.url}`,
    html: layout("Departure below minimum", p(`The <b>${esc(d.service)}</b> departure on <b>${esc(d.date)}</b> has <b>${d.booked}</b> of ${d.min} minimum guests.`), { label: "Go to my bookings", url: d.url }),
  }),
};
T["operator.payout_sent"] = {
  es: (d) => ({
    subject: `Liquidación enviada: ${d.amount}`,
    text: `${d.operator}: te enviamos una liquidación de ${d.amount}. Comprobante: ${d.reference}.`,
    html: layout("Liquidación enviada", p(`<b>${esc(d.operator)}</b>, te enviamos una liquidación de <b>${esc(d.amount)}</b>.`) + p(`Comprobante: ${esc(d.reference)}`)),
  }),
  en: (d) => ({
    subject: `Payout sent: ${d.amount}`,
    text: `${d.operator}: we sent you a payout of ${d.amount}. Reference: ${d.reference}.`,
    html: layout("Payout sent", p(`<b>${esc(d.operator)}</b>, we sent you a payout of <b>${esc(d.amount)}</b>.`) + p(`Reference: ${esc(d.reference)}`)),
  }),
};

T["newsletter.confirm"] = {
  es: (d) => ({
    subject: "Confirma tu suscripción a Descubre RD",
    text: `Confirma tu suscripción al boletín de Descubre RD: ${d.url}\n\nSi no fuiste tú, ignora este correo.`,
    html: layout("Confirma tu suscripción", p("Un paso más para recibir novedades de Descubre RD.") + p("Si no fuiste tú, ignora este correo."), { label: "Confirmar suscripción", url: d.url }),
  }),
  en: (d) => ({
    subject: "Confirm your Descubre RD subscription",
    text: `Confirm your Descubre RD newsletter subscription: ${d.url}\n\nIf this was not you, ignore this email.`,
    html: layout("Confirm your subscription", p("One more step to get Descubre RD news.") + p("If this was not you, ignore this email."), { label: "Confirm subscription", url: d.url }),
  }),
};
T["support.received"] = {
  es: (d) => ({
    subject: `Recibimos tu mensaje (${d.reference})`,
    text: `Hola ${d.name},\n\nRecibimos tu mensaje "${d.subject}". Tu referencia es ${d.reference}. Te responderemos lo antes posible.`,
    html: layout("Recibimos tu mensaje", p(`Hola ${esc(d.name)}, recibimos tu mensaje <b>${esc(d.subject)}</b>.`) + p(`Referencia: <b>${esc(d.reference)}</b>. Te responderemos lo antes posible.`)),
  }),
  en: (d) => ({
    subject: `We received your message (${d.reference})`,
    text: `Hi ${d.name},\n\nWe received your message "${d.subject}". Your reference is ${d.reference}. We will reply as soon as possible.`,
    html: layout("We received your message", p(`Hi ${esc(d.name)}, we received your message <b>${esc(d.subject)}</b>.`) + p(`Reference: <b>${esc(d.reference)}</b>. We will reply as soon as possible.`)),
  }),
};
T["establishment.received"] = {
  es: (d) => ({
    subject: `Recibimos la solicitud de ${d.establishment}`,
    text: `Hola ${d.name},\n\nRecibimos la solicitud de alta de ${d.establishment}. La revisaremos y te avisaremos. Consulta el estado aquí: ${d.url}`,
    html: layout("Solicitud recibida", p(`Hola ${esc(d.name)}, recibimos la solicitud de alta de <b>${esc(d.establishment)}</b>. La revisaremos y te avisaremos.`), { label: "Ver el estado", url: d.url }),
  }),
  en: (d) => ({
    subject: `We received the request for ${d.establishment}`,
    text: `Hi ${d.name},\n\nWe received the listing request for ${d.establishment}. We will review it and let you know. Check the status: ${d.url}`,
    html: layout("Request received", p(`Hi ${esc(d.name)}, we received the listing request for <b>${esc(d.establishment)}</b>. We will review it and let you know.`), { label: "Check the status", url: d.url }),
  }),
};

T["support.reply"] = {
  es: (d) => ({
    subject: `Respuesta a tu ticket ${d.reference}`,
    text: `Hola ${d.name},\n\nTe respondimos en tu ticket ${d.reference}:\n\n${d.message}\n\nVer la conversación: ${d.url}`,
    html: layout("Respondimos a tu ticket", p(`Hola ${esc(d.name)}, esto es lo que nos escribió el equipo de soporte (ticket <b>${esc(d.reference)}</b>):`) + p(esc(d.message).replace(/\n/g, "<br>")), { label: "Ver la conversación", url: d.url }),
  }),
  en: (d) => ({
    subject: `Reply to your ticket ${d.reference}`,
    text: `Hi ${d.name},\n\nWe replied to your ticket ${d.reference}:\n\n${d.message}\n\nView the conversation: ${d.url}`,
    html: layout("We replied to your ticket", p(`Hi ${esc(d.name)}, here is what our support team wrote (ticket <b>${esc(d.reference)}</b>):`) + p(esc(d.message).replace(/\n/g, "<br>")), { label: "View the conversation", url: d.url }),
  }),
};
T["store.order_confirmation"] = {
  es: (d) => ({
    subject: `Pedido ${d.reference} confirmado`,
    text: `Hola ${d.name},

Recibimos tu pedido ${d.reference}: ${d.items}.
Total pagado: ${d.total}.

Síguelo aquí: ${d.url}`,
    html: layout("¡Gracias por tu compra!", p(`Hola ${esc(d.name)}, recibimos tu pedido <b>${esc(d.reference)}</b>.`) + table([["Artículos", d.items], ["Total pagado", d.total], ["Pedido", d.reference]]), { label: "Ver mi pedido", url: d.url }),
  }),
  en: (d) => ({
    subject: `Order ${d.reference} confirmed`,
    text: `Hi ${d.name},

We received your order ${d.reference}: ${d.items}.
Total paid: ${d.total}.

Track it here: ${d.url}`,
    html: layout("Thanks for your purchase!", p(`Hi ${esc(d.name)}, we received your order <b>${esc(d.reference)}</b>.`) + table([["Items", d.items], ["Total paid", d.total], ["Order", d.reference]]), { label: "View my order", url: d.url }),
  }),
};
T["store.order_update"] = {
  es: (d) => ({
    subject: `${d.title} · ${d.reference}`,
    text: `Hola ${d.name},

${d.title}. ${d.message}

${d.url}`,
    html: layout(d.title, p(`Hola ${esc(d.name)}, ${esc(d.message)}`), { label: "Ver mi pedido", url: d.url }),
  }),
  en: (d) => ({
    subject: `${d.title} · ${d.reference}`,
    text: `Hi ${d.name},

${d.title}. ${d.message}

${d.url}`,
    html: layout(d.title, p(`Hi ${esc(d.name)}, ${esc(d.message)}`), { label: "View my order", url: d.url }),
  }),
};

T["vendor.approved"] = {
  es: (d) => ({ subject: `Tu tienda ${d.shop} fue aprobada`, text: `Tu tienda ${d.shop} ya está activa en el marketplace de Descubre RD. Publica tus productos: ${d.url}`, html: layout("¡Tu tienda fue aprobada!", p(`Tu tienda <b>${esc(d.shop)}</b> ya está activa en el marketplace. Ya puedes publicar tus productos (se revisan antes de mostrarse).`), { label: "Ver mi tienda", url: d.url }) }),
  en: (d) => ({ subject: `Your shop ${d.shop} was approved`, text: `Your shop ${d.shop} is now live on the Descubre RD marketplace: ${d.url}`, html: layout("Your shop was approved!", p(`Your shop <b>${esc(d.shop)}</b> is now live on the marketplace. You can publish your products (they are reviewed before showing).`), { label: "View my shop", url: d.url }) }),
};
T["vendor.new_order"] = {
  es: (d) => ({ subject: `Nuevo pedido ${d.reference} en ${d.shop}`, text: `Tienes un pedido pagado (${d.reference}): ${d.items}. Tu venta: ${d.total}. Prepáralo y registra el envío: ${d.url}`, html: layout("Nuevo pedido pagado", p(`Tienes un pedido pagado en <b>${esc(d.shop)}</b>.`) + table([["Pedido", d.reference], ["Artículos", d.items], ["Tu venta", d.total]]), { label: "Ver pedidos", url: d.url }) }),
  en: (d) => ({ subject: `New order ${d.reference} at ${d.shop}`, text: `You have a paid order (${d.reference}): ${d.items}. Your sale: ${d.total}. Prepare it and register the shipment: ${d.url}`, html: layout("New paid order", p(`You have a paid order at <b>${esc(d.shop)}</b>.`) + table([["Order", d.reference], ["Items", d.items], ["Your sale", d.total]]), { label: "View orders", url: d.url }) }),
};
T["ambassador.approved"] = {
  es: (d) => ({ subject: "Ya eres embajador de Descubre RD", text: `Hola ${d.name}, tu código es ${d.code}. Compártelo y gana comisión por cada compra: ${d.url}`, html: layout("¡Bienvenido al programa de embajadores!", p(`Hola ${esc(d.name)}, tu solicitud fue aprobada.`) + table([["Tu código", d.code]]), { label: "Ir a mi panel", url: d.url }) }),
  en: (d) => ({ subject: "You are now a Descubre RD ambassador", text: `Hi ${d.name}, your code is ${d.code}. Share it and earn commission on every purchase: ${d.url}`, html: layout("Welcome to the ambassador program!", p(`Hi ${esc(d.name)}, your application was approved.`) + table([["Your code", d.code]]), { label: "Go to my dashboard", url: d.url }) }),
};
T["ambassador.payout"] = {
  es: (d) => ({ subject: `Te enviamos tu pago de ${d.amount}`, text: `Hola ${d.name}, enviamos tu pago de comisiones por ${d.amount}. Referencia: ${d.reference}.`, html: layout("Pago de comisiones enviado", p(`Hola ${esc(d.name)}, enviamos tu pago de comisiones.`) + table([["Monto", d.amount], ["Referencia", d.reference]])) }),
  en: (d) => ({ subject: `We sent your ${d.amount} payout`, text: `Hi ${d.name}, we sent your commission payout of ${d.amount}. Reference: ${d.reference}.`, html: layout("Commission payout sent", p(`Hi ${esc(d.name)}, we sent your commission payout.`) + table([["Amount", d.amount], ["Reference", d.reference]])) }),
};

const campaignHtml = (d: { subject: string; body: string; unsubscribe_url: string }, lang: "es" | "en") =>
  layout(d.subject, d.body.split(/\n{2,}/).map((x) => p(esc(x).replace(/\n/g, "<br>"))).join(""), undefined, `Descubre RD · ${lang === "en" ? "Unsubscribe" : "Darte de baja"}: ${d.unsubscribe_url}`);
T["marketing.campaign"] = {
  es: (d) => ({ subject: d.subject, text: `${d.body}\n\n---\nDarte de baja: ${d.unsubscribe_url}`, html: campaignHtml(d, "es") }),
  en: (d) => ({ subject: d.subject, text: `${d.body}\n\n---\nUnsubscribe: ${d.unsubscribe_url}`, html: campaignHtml(d, "en") }),
};

/** Correo armado con una plantilla editada desde el panel: contenido saneado, variables escapadas en el HTML y texto plano alterno. */
export function renderOverride(o: TemplateOverride, data: Record<string, unknown>, locale: Locale): Rendered & { locale: Locale } {
  const body = substitute(sanitizeHtml(o.body_html), data, esc);
  const text = o.body_text ? substitute(o.body_text, data) : htmlToText(substitute(sanitizeHtml(o.body_html), data));
  const cta = o.cta_label && o.cta_var && data[o.cta_var] ? { label: substitute(o.cta_label, data), url: String(data[o.cta_var]) } : undefined;
  const title = substitute(o.title, data);
  return {
    subject: substitute(o.subject, data).replace(/\s*[\r\n]+\s*/g, " ").trim(),
    text: cta ? `${text}\n\n${cta.label}: ${cta.url}` : text,
    html: layout(title, body, cta, undefined, locale),
    locale,
  };
}

export function renderTemplate<K extends TemplateKey>(key: K, locale: Locale, data: TemplateData[K]): Rendered & { locale: Locale } {
  // fr/de/pt/it existen para los correos al viajero; el resto (operadores, vendedores, embajadores) y lo que falte cae al español.
  if ((EXTRA_LOCALES as readonly string[]).includes(locale)) {
    const r = renderExtra(key, locale as ExtraLocale, data, { layout, p, table, esc });
    if (r) return r;
  }
  const l = locale === "en" ? "en" : "es";
  return { ...(T[key][l] as Builder<K>)(data), locale: l };
}
