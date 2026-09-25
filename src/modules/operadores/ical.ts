// Etapa 6: sincronización de calendarios iCal (.ics) con Booking, Airbnb, Google Calendar, etc.
import { addDays } from "./pricing";
import type { Booking } from "./types";

export interface IcsRange { from: string; to: string; summary: string } // rango inclusivo de noches ocupadas

const unfold = (t: string) => t.replace(/\r?\n[ \t]/g, "");
const toIso = (v: string) => {
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
};

/** Convierte el texto de un .ics en rangos ocupados (DTEND es exclusivo en eventos de día completo). */
export function parseIcs(text: string): IcsRange[] {
  const out: IcsRange[] = [];
  const events = unfold(text).split(/BEGIN:VEVENT/i).slice(1);
  for (const ev of events) {
    const body = ev.split(/END:VEVENT/i)[0];
    if (/^STATUS:CANCELLED/im.test(body)) continue;
    const s = body.match(/^DTSTART[^:\n]*:(.+)$/im)?.[1]?.trim();
    const e = body.match(/^DTEND[^:\n]*:(.+)$/im)?.[1]?.trim();
    const summary = body.match(/^SUMMARY[^:\n]*:(.+)$/im)?.[1]?.trim() || "Reservado";
    const from = s ? toIso(s) : "";
    if (!from) continue;
    const end = e ? toIso(e) : "";
    const to = end && end > from ? addDays(end, -1) : from;
    out.push({ from, to, summary: summary.slice(0, 60) });
  }
  return out;
}

const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Genera un .ics con las reservas activas (para importarlo en Booking, Airbnb o Google Calendar). */
export function buildIcs(calName: string, bookings: Pick<Booking, "id" | "date" | "check_out" | "listing_title" | "room_name" | "contact_name" | "status">[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Descubre RD//Operadores RD//ES", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${esc(calName)}`];
  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    const end = b.check_out && b.check_out > b.date ? b.check_out : addDays(b.date, 1);
    lines.push("BEGIN:VEVENT", `UID:${b.id}@descubre-rd`, `DTSTAMP:${stamp()}`, `DTSTART;VALUE=DATE:${b.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${end.replace(/-/g, "")}`,
      `SUMMARY:${esc(`Reservado – ${b.room_name || b.listing_title || "Servicio"}`)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
