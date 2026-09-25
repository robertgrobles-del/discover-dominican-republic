import { addDays, isIsoDate, nightsBetween, todayInSantoDomingo } from "./dates.js";
import { fromCents, pctOf, toCents } from "./money.js";
import { quoteStay, type RoomSnap } from "./pricing.js";

export type Category = "experiencia" | "voluntariado" | "alojamiento" | "transporte" | "paquete";
export interface Extra { id: string; name: string; price: number; unit: "person" | "booking" | "night" }

export interface ListingSnap {
  id: string; category: Category; price: number; currency: "USD" | "DOP"; capacity: number; time_slots: string[];
  deposit_percent: number | null; child_price: number | null; infants_free: boolean; min_guests: number | null; days: number | null; extras: Extra[];
}
export interface QuoteRequest {
  date: string; check_out?: string; time?: string;
  adults: number; children: number; infants: number;
  extras: string[]; promo_code?: string;
}
export interface PromoSnap { code: string; type: "percent" | "fixed"; value: number }

export type IssueCode =
  | "PAST_DATE" | "INVALID_DATES" | "ROOM_REQUIRED" | "MAX_NIGHTS" | "OVER_CAPACITY" | "SOLD_OUT" | "CAPACITY_EXCEEDED"
  | "INVALID_TIME" | "INFANTS_NOT_ALLOWED" | "UNKNOWN_EXTRA" | "DATE_BLOCKED" | "MIN_NIGHTS";
export interface Issue { code: IssueCode; message: string }
export interface QuoteLine { code: "base" | "weekend" | "season" | "adults" | "children" | "extra" | "discount"; label: string; quantity: number; unit_price: number; amount: number }

export interface Quote {
  bookable: boolean;
  issues: Issue[];
  currency: "USD" | "DOP";
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  total: number;
  deposit_amount: number | null;
  nights: number | null;
  seats: number;            // plazas que ocupa (adultos + niños)
  time: string | null;
  end_date: string | null;  // salida (alojamiento) o último día (paquete)
  remaining: number | null; // cupos o habitaciones libres antes de esta reserva
  promo: { code: string; applied: boolean; reason?: string } | null;
  departure: { booked: number; min_guests: number | null; confirmed: boolean } | null;
  extras: { id: string; name: string; quantity: number; unit_price: number; amount: number }[];
}

export const MAX_NIGHTS = 60;
export const MAX_GUESTS_PER_BOOKING = 60;

/**
 * Cotización de una reserva. Función pura: recibe el anuncio, la habitación, lo ya ocupado y la promoción ya resuelta.
 * Es la única fuente de precios (docs §5.8): el total que envíe un cliente se ignora.
 * `occupied`: plazas tomadas en esa salida (tours) o unidades de la habitación ocupadas en esas noches (alojamientos).
 */
export function computeQuote(input: { listing: ListingSnap; room?: RoomSnap | null; request: QuoteRequest; occupied: number; promo?: PromoSnap | null; today?: string }): Quote {
  const { listing, room, request: r } = input;
  const today = input.today ?? todayInSantoDomingo();
  const issues: Issue[] = [];
  const add = (code: IssueCode, message: string) => issues.push({ code, message });
  const stay = listing.category === "alojamiento";
  const lines: QuoteLine[] = [];
  let baseCents = 0;
  let nights: number | null = null;
  let endDate: string | null = null;
  let remaining: number | null = null;
  let time: string | null = null;
  const seats = r.adults + r.children;

  if (!isIsoDate(r.date)) add("INVALID_DATES", "La fecha no es válida.");
  else if (r.date < today) add("PAST_DATE", "Elige una fecha futura.");

  if (stay) {
    // ---------- Alojamiento: habitación, noches, tarifas por noche ----------
    if (!room) add("ROOM_REQUIRED", "Elige una habitación.");
    else if (!r.check_out || !isIsoDate(r.check_out) || isIsoDate(r.date) === false || r.check_out <= r.date) add("INVALID_DATES", "La salida debe ser posterior a la llegada.");
    else {
      nights = nightsBetween(r.date, r.check_out);
      endDate = r.check_out;
      if (nights > MAX_NIGHTS) add("MAX_NIGHTS", `La estadía máxima es de ${MAX_NIGHTS} noches.`);
      if (seats > room.guests) add("OVER_CAPACITY", `Esta habitación admite hasta ${room.guests} huéspedes.`);
      const q = quoteStay(room, r.date, r.check_out);
      if (q.issue) add(q.issue.code, q.issue.message);
      baseCents = q.total_cents;
      for (const l of q.lines) lines.push({ code: l.kind, label: l.label, quantity: l.nights, unit_price: l.unit_price, amount: fromCents(l.amount_cents) });
      remaining = Math.max(0, room.quantity - input.occupied);
      if (remaining < 1 && !issues.some((i) => i.code === "DATE_BLOCKED")) add("SOLD_OUT", "Esta habitación no está disponible en esas fechas.");
    }
  } else {
    // ---------- Excursiones, voluntariados, transportes y paquetes: precio por persona ----------
    time = listing.time_slots.length ? (r.time ?? listing.time_slots[0]!) : (r.time ?? null);
    if (listing.time_slots.length && !listing.time_slots.includes(time!)) add("INVALID_TIME", `Horarios disponibles: ${listing.time_slots.join(", ")}.`);
    if (listing.category === "paquete" && listing.days && listing.days > 1) endDate = isIsoDate(r.date) ? addDays(r.date, listing.days - 1) : null;
    if (r.infants > 0 && !listing.infants_free) add("INFANTS_NOT_ALLOWED", "Este servicio no admite bebés sin costo: cuéntalos como niños.");
    const adultCents = toCents(listing.price) * r.adults;
    lines.push({ code: "adults", label: r.children || r.infants ? "Adultos" : "Personas", quantity: r.adults, unit_price: listing.price, amount: fromCents(adultCents) });
    baseCents = adultCents;
    if (r.children > 0) {
      const unit = listing.child_price ?? listing.price;
      const c = toCents(unit) * r.children;
      lines.push({ code: "children", label: "Niños", quantity: r.children, unit_price: unit, amount: fromCents(c) });
      baseCents += c;
    }
    remaining = Math.max(0, listing.capacity - input.occupied);
    if (remaining < 1) add("SOLD_OUT", "No hay cupos para esa fecha y horario.");
    else if (seats > remaining) add("CAPACITY_EXCEEDED", `Solo quedan ${remaining} cupos.`);
  }

  // ---------- Extras ----------
  const extraLines: Quote["extras"] = [];
  let extrasCents = 0;
  for (const id of new Set(r.extras)) {
    const ex = listing.extras.find((x) => x.id === id);
    if (!ex) { add("UNKNOWN_EXTRA", `El extra "${id}" no existe en este servicio.`); continue; }
    const quantity = ex.unit === "person" ? Math.max(1, seats) : ex.unit === "night" ? Math.max(1, nights ?? 1) : 1;
    const cents = toCents(ex.price) * quantity;
    extrasCents += cents;
    extraLines.push({ id: ex.id, name: ex.name, quantity, unit_price: ex.price, amount: fromCents(cents) });
    lines.push({ code: "extra", label: ex.name, quantity, unit_price: ex.price, amount: fromCents(cents) });
  }

  // ---------- Descuento y depósito ----------
  const subtotalCents = baseCents + extrasCents;
  let discountCents = 0;
  let promo: Quote["promo"] = null;
  if (r.promo_code) {
    if (input.promo) {
      discountCents = input.promo.type === "percent" ? pctOf(subtotalCents, input.promo.value) : Math.min(toCents(input.promo.value), subtotalCents);
      promo = { code: input.promo.code, applied: true };
      if (discountCents > 0) lines.push({ code: "discount", label: `Descuento ${input.promo.code}`, quantity: 1, unit_price: -fromCents(discountCents), amount: -fromCents(discountCents) });
    } else promo = { code: r.promo_code, applied: false, reason: "Código no válido o vencido" };
  }
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const deposit = listing.deposit_percent && totalCents > 0 ? fromCents(pctOf(totalCents, listing.deposit_percent)) : null;

  return {
    bookable: issues.length === 0, issues, currency: listing.currency, lines,
    subtotal: fromCents(subtotalCents), discount: fromCents(discountCents), total: fromCents(totalCents), deposit_amount: deposit,
    nights, seats, time, end_date: endDate, remaining, promo, extras: extraLines,
    departure: stay ? null : { booked: input.occupied, min_guests: listing.min_guests, confirmed: !listing.min_guests || input.occupied + seats >= listing.min_guests },
  };
}
