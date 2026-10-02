import { fetchApi } from "@/lib/fastifyClient";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";

/** Clics de contacto hacia un operador y su resumen semanal (plan de 150 mejoras, puntos 23 y 102). */

export const CONTACT_CHANNELS = ["whatsapp", "call", "directions", "website"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];
export const CHANNEL_LABEL: Record<ContactChannel, string> = { whatsapp: "WhatsApp", call: "Llamadas", directions: "Cómo llegar", website: "Sitio web" };

export type ChannelCounts = Record<ContactChannel, number> & { total: number };
export interface ContactClicks {
  range: { from: string; to: string };
  totals: ChannelCounts;
  by_day: ({ day: string } & ChannelCounts)[];
  by_listing: ({ listing_id: string | null; title: string | null } & ChannelCounts)[];
}

/** Número para `wa.me`: sólo dígitos, con el prefijo 1 si es un número dominicano de 10 dígitos. */
export function whatsappNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

/**
 * Cuenta un clic sin retrasar la navegación ni mostrar errores: es un contador anónimo, y perder uno
 * nunca debe impedir que el visitante escriba o llame al operador. Sin backend no hay nada que contar.
 */
export function trackContactClick(slug: string, channel: ContactChannel, listingId?: string, enabled = HAS_BACKEND_SESSION): void {
  if (!enabled || !slug) return;
  void fetchApi(`/operators/${encodeURIComponent(slug)}/contact-click`, {
    method: "POST", keepalive: true, body: JSON.stringify({ channel, ...(listingId ? { listing_id: listingId } : {}) }),
  }).catch(() => undefined);
}

export const operatorContactApi = {
  clicks: (from: string, to: string) => fetchApi<{ data: ContactClicks }>(`/org/reports/contact-clicks?from=${from}&to=${to}`),
  weeklyEmail: () => fetchApi<{ data: { enabled: boolean } }>("/org/reports/weekly-email"),
  setWeeklyEmail: (enabled: boolean) => fetchApi<{ data: { enabled: boolean } }>("/org/reports/weekly-email", { method: "PUT", body: JSON.stringify({ enabled }) }),
};
