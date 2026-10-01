// Etapa 1: tarifas por temporada, fin de semana, noches mínimas y fechas bloqueadas por habitación.
import type { Room } from "./types";

const DAY = 86400000;
const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
const toStr = (d: Date) => d.toISOString().slice(0, 10);
const isValidDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = toDate(value);
  return !Number.isNaN(date.getTime()) && toStr(date) === value;
};
export const addDays = (s: string, n: number) => toStr(new Date(toDate(s).getTime() + n * DAY));

/** Fecha bloqueada por el operador (rango inclusivo). */
export function blockedReason(room: Room, date: string): string | null {
  const b = room.blocked?.find((x) => date >= x.from && date <= x.to);
  return b ? b.reason || "No disponible" : null;
}

/** Noche de viernes o sábado (la noche que empieza ese día). */
const isWeekendNight = (date: string) => [5, 6].includes(toDate(date).getUTCDay());

export type RateKind = "base" | "weekend" | "season";

/** Precio de la noche que empieza en `date`: temporada > fin de semana > base. */
export function nightRate(room: Room, date: string): { price: number; kind: RateKind; label?: string } {
  const season = room.seasons?.find((s) => date >= s.from && date <= s.to);
  if (season) return { price: season.price, kind: "season", label: season.name };
  if (room.weekend_price && isWeekendNight(date)) return { price: room.weekend_price, kind: "weekend", label: "Fin de semana" };
  return { price: room.price, kind: "base" };
}

export interface StayQuote {
  nights: number;
  total: number;
  average: number;
  lines: { label: string; nights: number; price: number }[];
  issue: string | null; // motivo por el que no se puede reservar
}

export function quoteStay(room: Room, checkIn: string, checkOut: string): StayQuote {
  if (!isValidDateOnly(checkIn) || !isValidDateOnly(checkOut)) {
    return { nights: 0, total: 0, average: room.price, lines: [], issue: "Las fechas de entrada y salida deben ser válidas." };
  }

  const nights = (toDate(checkOut).getTime() - toDate(checkIn).getTime()) / DAY;
  if (nights <= 0) {
    return { nights: 0, total: 0, average: room.price, lines: [], issue: "La fecha de salida debe ser posterior a la fecha de entrada." };
  }

  const groups = new Map<string, { label: string; nights: number; price: number }>();
  let total = 0;
  let issue: string | null = null;
  for (let i = 0; i < nights; i++) {
    const d = addDays(checkIn, i);
    const blocked = blockedReason(room, d);
    if (blocked && !issue) issue = `La noche del ${d} no está disponible (${blocked}).`;
    const r = nightRate(room, d);
    total += r.price;
    const key = `${r.kind}:${r.label || ""}:${r.price}`;
    const g = groups.get(key) || { label: r.label || "Tarifa base", nights: 0, price: r.price };
    g.nights += 1;
    groups.set(key, g);
  }
  const min = Math.max(1, room.min_nights || 1);
  if (!issue && nights > 0 && nights < min) issue = `Esta habitación requiere una estadía mínima de ${min} noches.`;
  return { nights, total, average: nights ? total / nights : room.price, lines: [...groups.values()], issue };
}

/** Precio mínimo de una noche (para "desde ...") considerando temporadas y fin de semana. */
export const minRoomPrice = (room: Room) => Math.min(room.price, ...(room.seasons || []).map((s) => s.price), ...(room.weekend_price ? [room.weekend_price] : []));
