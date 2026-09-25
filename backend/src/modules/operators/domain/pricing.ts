import { addDays, nightsBetween, weekday } from "./dates.js";
import { toCents } from "./money.js";

export interface RoomSnap {
  id: string; name: string; price: number; weekend_price: number | null; min_nights: number; guests: number; quantity: number;
  seasons: { name: string; from: string; to: string; price: number }[];
  blocks: { from: string; to: string; reason?: string | null }[];
}

export type RateKind = "base" | "weekend" | "season";

export function blockedReason(room: Pick<RoomSnap, "blocks">, date: string): string | null {
  const b = room.blocks.find((x) => date >= x.from && date <= x.to);
  return b ? b.reason || "No disponible" : null;
}

/** Precio de la noche que empieza en `date`: temporada > fin de semana (viernes y sábado) > tarifa base. */
export function nightRate(room: Pick<RoomSnap, "price" | "weekend_price" | "seasons">, date: string): { price: number; kind: RateKind; label: string } {
  const season = room.seasons.find((s) => date >= s.from && date <= s.to);
  if (season) return { price: season.price, kind: "season", label: season.name };
  if (room.weekend_price && [5, 6].includes(weekday(date))) return { price: room.weekend_price, kind: "weekend", label: "Fin de semana" };
  return { price: room.price, kind: "base", label: "Tarifa base" };
}

export interface StayLine { kind: RateKind; label: string; nights: number; unit_price: number; amount_cents: number }
export interface StayQuote { nights: number; total_cents: number; lines: StayLine[]; issue: { code: "DATE_BLOCKED" | "MIN_NIGHTS"; message: string } | null }

/** Cotiza una estadía noche por noche agrupando las líneas iguales; detecta noches bloqueadas y estadía mínima. */
export function quoteStay(room: RoomSnap, checkIn: string, checkOut: string): StayQuote {
  const nights = Math.max(0, nightsBetween(checkIn, checkOut));
  const groups = new Map<string, StayLine>();
  let total = 0;
  let issue: StayQuote["issue"] = null;
  for (let i = 0; i < nights; i++) {
    const d = addDays(checkIn, i);
    const reason = blockedReason(room, d);
    if (reason && !issue) issue = { code: "DATE_BLOCKED", message: `La noche del ${d} no está disponible (${reason}).` };
    const r = nightRate(room, d);
    total += toCents(r.price);
    const key = `${r.kind}:${r.label}:${r.price}`;
    const g = groups.get(key) ?? { kind: r.kind, label: r.label, nights: 0, unit_price: r.price, amount_cents: 0 };
    g.nights += 1;
    g.amount_cents += toCents(r.price);
    groups.set(key, g);
  }
  if (!issue && nights > 0 && nights < room.min_nights) issue = { code: "MIN_NIGHTS", message: `Esta habitación requiere una estadía mínima de ${room.min_nights} noches.` };
  return { nights, total_cents: total, lines: [...groups.values()], issue };
}
