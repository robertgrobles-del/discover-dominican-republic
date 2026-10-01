// Etapa 7: correos y WhatsApp automáticos (confirmación, recordatorio 24 h y solicitud de reseña).
// En este entorno el envío es simulado: cada mensaje queda registrado en la bandeja del operador
// (operator_messages) y en la reserva (`notified`). Con un backend real, aquí se llamaría al proveedor de correo/WhatsApp.
import { balanceDue, fetchAllBookings, sendMessage, updateBooking } from "./api";
import { formatMoney } from "./constants";
import type { AutomationChannel, AutomationConfig, AutomationKind, Booking, OperatorOrg } from "./types";

export const AUTOMATION_META: Record<AutomationKind, { label: string; when: string }> = {
  confirmation: { label: "Confirmación de reserva", when: "Al recibir una reserva en tu sitio web." },
  reminder: { label: "Recordatorio 24 h antes", when: "El día anterior a la fecha de la reserva." },
  review: { label: "Solicitud de reseña", when: "Cuando marcas la reserva como completada." },
};

export const TEMPLATE_VARS = ["{nombre}", "{servicio}", "{fecha}", "{hora}", "{personas}", "{saldo}", "{referencia}", "{operador}", "{enlace}"];

export const DEFAULT_AUTOMATION: AutomationConfig = {
  confirmation: {
    enabled: true, channels: ["email"],
    subject: "Tu reserva en {operador} está registrada",
    body: "Hola {nombre},\n\nRecibimos tu reserva de {servicio} para el {fecha}{hora} ({personas}). Saldo pendiente: {saldo}.\nReferencia: {referencia}.\n\nGracias por elegir {operador}.",
  },
  reminder: {
    enabled: true, channels: ["email", "whatsapp"],
    subject: "Mañana: {servicio}",
    body: "Hola {nombre}, te recordamos tu reserva de {servicio} mañana {fecha}{hora}. Saldo a pagar: {saldo}. ¡Te esperamos! — {operador}",
  },
  review: {
    enabled: true, channels: ["email"],
    subject: "¿Cómo estuvo {servicio}?",
    body: "Hola {nombre}, esperamos que hayas disfrutado {servicio}. Cuéntanos tu experiencia y ayuda a otros viajeros: {enlace}\n\nGracias, {operador}.",
  },
};

export const getAutomation = (org: Pick<OperatorOrg, "automation">): AutomationConfig => {
  const saved = org.automation || ({} as Partial<AutomationConfig>);
  return {
    confirmation: { ...DEFAULT_AUTOMATION.confirmation, ...saved.confirmation },
    reminder: { ...DEFAULT_AUTOMATION.reminder, ...saved.reminder },
    review: { ...DEFAULT_AUTOMATION.review, ...saved.review },
  };
};

export function renderTemplate(text: string, org: Pick<OperatorOrg, "business_name" | "slug">, b: Booking) {
  const vars: Record<string, string> = {
    "{nombre}": b.contact_name.split(" ")[0] || "viajero",
    "{servicio}": b.listing_title || "tu servicio",
    "{fecha}": b.check_out && b.check_out > b.date ? `${b.date} al ${b.check_out}` : b.date,
    "{hora}": b.time ? ` a las ${b.time}` : "",
    "{personas}": `${b.guests} ${b.guests === 1 ? "persona" : "personas"}`,
    "{saldo}": formatMoney(balanceDue(b), b.currency),
    "{referencia}": b.id,
    "{operador}": org.business_name,
    "{enlace}": `${typeof window !== "undefined" ? window.location.origin : ""}/operador/${org.slug}`,
  };
  return Object.entries(vars).reduce((t, [k, v]) => t.split(k).join(v), text);
}

const CHANNEL_LABEL: Record<AutomationChannel, string> = { email: "Correo", whatsapp: "WhatsApp" };

/** Envía (simulado) una automatización para una reserva, una sola vez por tipo. */
export async function runAutomation(kind: AutomationKind, org: OperatorOrg, bookingId: string): Promise<boolean> {
  const rule = getAutomation(org)[kind];
  if (!rule.enabled || rule.channels.length === 0) return false;
  const b = (await fetchAllBookings()).find((x) => x.id === bookingId);
  if (!b || b.org_id !== org.id || b.status === "cancelled" || b.notified?.[kind]) return false;
  const now = new Date().toISOString();
  for (const ch of rule.channels) {
    const subject = renderTemplate(rule.subject, org, b);
    const body = renderTemplate(rule.body, org, b);
    await sendMessage({
      org_id: org.id, thread_id: `web-${b.id}`, traveler_name: b.contact_name, sender: "operator", channel: ch, booking_id: b.id, read: true,
      body: `[Automático · ${CHANNEL_LABEL[ch]} · ${AUTOMATION_META[kind].label}]${ch === "email" ? ` ${subject}` : ""}\n${body}`,
    });
  }
  await updateBooking(b.id, { notified: { ...b.notified, [kind]: now } });
  return true;
}

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Envía los recordatorios pendientes de reservas de mañana. Devuelve cuántos envió. */
export async function sendDueReminders(org: OperatorOrg): Promise<number> {
  if (!getAutomation(org).reminder.enabled) return 0;
  const t = tomorrow();
  const due = (await fetchAllBookings()).filter((b) => b.org_id === org.id && b.date === t && b.status !== "cancelled" && b.status !== "completed" && !b.notified?.reminder);
  let n = 0;
  for (const b of due) if (await runAutomation("reminder", org, b.id)) n++;
  return n;
}
