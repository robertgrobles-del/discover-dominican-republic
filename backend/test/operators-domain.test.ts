import { describe, expect, it } from "vitest";
import { refundFor } from "../src/modules/operators/domain/cancellation.js";
import { addDays, isIsoDate, nightsBetween, startsAt, todayInSantoDomingo, weekday } from "../src/modules/operators/domain/dates.js";
import { fromCents, pctOf, toCents } from "../src/modules/operators/domain/money.js";
import { nightRate, quoteStay, type RoomSnap } from "../src/modules/operators/domain/pricing.js";
import { computeQuote, type ListingSnap, type QuoteRequest } from "../src/modules/operators/domain/quote.js";

const TODAY = "2026-09-25"; // viernes

describe("fechas y dinero", () => {
  it("opera con fechas de calendario sin desfases de zona horaria", () => {
    expect(addDays("2026-02-27", 2)).toBe("2026-03-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(nightsBetween("2026-10-01", "2026-10-05")).toBe(4);
    expect(weekday("2026-09-25")).toBe(5); // viernes
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("26-9-25")).toBe(false);
  });

  it("el día actual es el de República Dominicana (UTC-4)", () => {
    expect(todayInSantoDomingo(new Date("2026-09-26T02:30:00Z"))).toBe("2026-09-25"); // 22:30 del 25 en RD
    expect(todayInSantoDomingo(new Date("2026-09-26T04:00:00Z"))).toBe("2026-09-26");
    expect(startsAt("2026-10-01", "08:30").toISOString()).toBe("2026-10-01T12:30:00.000Z");
  });

  it("los importes se redondean por centavo sin errores de coma flotante", () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(fromCents(toCents(33.33) * 3)).toBe(99.99);
    expect(pctOf(toCents(99.99), 15)).toBe(1500);
    expect(pctOf(toCents(100), 30)).toBe(3000);
  });
});

const suite: RoomSnap = {
  id: "r1", name: "Suite con balcón", price: 140, weekend_price: 165, min_nights: 2, guests: 3, quantity: 2,
  seasons: [{ name: "Navidad", from: "2026-12-20", to: "2027-01-05", price: 210 }],
  blocks: [{ from: "2026-11-10", to: "2026-11-12", reason: "Mantenimiento" }],
};

describe("tarifas de habitación (etapa 1)", () => {
  it("prioriza temporada > fin de semana (vie y sáb) > tarifa base", () => {
    expect(nightRate(suite, "2026-10-01")).toMatchObject({ price: 140, kind: "base" }); // jueves
    expect(nightRate(suite, "2026-10-02")).toMatchObject({ price: 165, kind: "weekend" }); // viernes
    expect(nightRate(suite, "2026-10-03")).toMatchObject({ price: 165, kind: "weekend" }); // sábado
    expect(nightRate(suite, "2026-10-04")).toMatchObject({ price: 140, kind: "base" }); // domingo
    expect(nightRate(suite, "2026-12-25")).toMatchObject({ price: 210, kind: "season", label: "Navidad" }); // gana a un fin de semana
    expect(nightRate(suite, "2026-12-26")).toMatchObject({ price: 210, kind: "season" }); // sábado en temporada
  });

  it("suma noche por noche y agrupa las líneas iguales", () => {
    const q = quoteStay(suite, "2026-10-01", "2026-10-05"); // jue, vie, sáb, dom
    expect(q.nights).toBe(4);
    expect(q.total_cents).toBe(61000);
    expect(q.lines).toEqual([
      { kind: "base", label: "Tarifa base", nights: 2, unit_price: 140, amount_cents: 28000 },
      { kind: "weekend", label: "Fin de semana", nights: 2, unit_price: 165, amount_cents: 33000 },
    ]);
    expect(q.issue).toBeNull();
    expect(quoteStay(suite, "2026-12-23", "2026-12-25").total_cents).toBe(42000);
  });

  it("detecta noches bloqueadas y estadía mínima; la noche de salida no cuenta", () => {
    expect(quoteStay(suite, "2026-11-09", "2026-11-11").issue?.code).toBe("DATE_BLOCKED");
    expect(quoteStay(suite, "2026-11-08", "2026-11-10").issue).toBeNull(); // sale el 10: esa noche no se duerme
    expect(quoteStay(suite, "2026-11-13", "2026-11-15").issue).toBeNull();
    expect(quoteStay(suite, "2026-10-01", "2026-10-02").issue?.code).toBe("MIN_NIGHTS");
  });
});

const saona: ListingSnap = {
  id: "l1", category: "experiencia", price: 75, currency: "USD", capacity: 40, time_slots: ["08:00"], deposit_percent: 30, child_price: 45, infants_free: true, min_guests: 12, days: null,
  extras: [{ id: "tr", name: "Traslado", price: 20, unit: "person" }, { id: "fo", name: "Fotos", price: 35, unit: "booking" }, { id: "de", name: "Desayuno", price: 12, unit: "night" }],
};
const req = (over: Partial<QuoteRequest> = {}): QuoteRequest => ({ date: "2026-10-10", adults: 2, children: 0, infants: 0, extras: [], ...over });

describe("cotización de excursiones (etapas 2-4)", () => {
  it("adultos, niños a su precio y bebés gratis sin ocupar cupo", () => {
    const q = computeQuote({ listing: saona, request: req({ adults: 2, children: 2, infants: 1 }), occupied: 0, today: TODAY });
    expect(q).toMatchObject({ bookable: true, seats: 4, subtotal: 240, total: 240, currency: "USD", time: "08:00", end_date: null, remaining: 40 });
    expect(q.lines.map((l) => [l.code, l.label, l.quantity, l.amount])).toEqual([["adults", "Adultos", 2, 150], ["children", "Niños", 2, 90]]);
  });

  it("los niños pagan como adultos si el anuncio no define precio de niños", () => {
    const q = computeQuote({ listing: { ...saona, child_price: null }, request: req({ adults: 1, children: 2 }), occupied: 0, today: TODAY });
    expect(q.total).toBe(225);
  });

  it("extras por persona (adultos + niños, no bebés), por reserva y sus cantidades", () => {
    const q = computeQuote({ listing: saona, request: req({ adults: 2, children: 1, infants: 1, extras: ["tr", "fo"] }), occupied: 0, today: TODAY });
    expect(q.extras).toEqual([{ id: "tr", name: "Traslado", quantity: 3, unit_price: 20, amount: 60 }, { id: "fo", name: "Fotos", quantity: 1, unit_price: 35, amount: 35 }]);
    expect(q.total).toBe(195 + 60 + 35);
    expect(computeQuote({ listing: saona, request: req({ extras: ["tr", "tr", "fo"] }), occupied: 0, today: TODAY }).extras).toHaveLength(2); // sin duplicar
  });

  it("promoción porcentual o fija (nunca deja el total negativo) y depósito sobre el total con descuento", () => {
    const pct = computeQuote({ listing: saona, request: req({ promo_code: "BIEN10" }), occupied: 0, promo: { code: "BIEN10", type: "percent", value: 10 }, today: TODAY });
    expect(pct).toMatchObject({ subtotal: 150, discount: 15, total: 135, deposit_amount: 40.5, promo: { code: "BIEN10", applied: true } });
    expect(pct.lines.at(-1)).toMatchObject({ code: "discount", amount: -15 });
    const fixed = computeQuote({ listing: saona, request: req({ promo_code: "BIG" }), occupied: 0, promo: { code: "BIG", type: "fixed", value: 500 }, today: TODAY });
    expect(fixed).toMatchObject({ discount: 150, total: 0, deposit_amount: null });
    const none = computeQuote({ listing: saona, request: req({ promo_code: "NOEXISTE" }), occupied: 0, promo: null, today: TODAY });
    expect(none.promo).toEqual({ code: "NOEXISTE", applied: false, reason: "Código no válido o vencido" });
    expect(none.total).toBe(150); // el código inválido no bloquea la reserva
    expect(computeQuote({ listing: { ...saona, deposit_percent: null }, request: req(), occupied: 0, today: TODAY }).deposit_amount).toBeNull();
  });

  it("cupos: agotado, insuficiente y aviso de mínimo de personas para que salga", () => {
    expect(computeQuote({ listing: saona, request: req({ adults: 4 }), occupied: 38, today: TODAY }).issues[0]).toMatchObject({ code: "CAPACITY_EXCEEDED", message: "Solo quedan 2 cupos." });
    expect(computeQuote({ listing: saona, request: req(), occupied: 40, today: TODAY }).issues[0]!.code).toBe("SOLD_OUT");
    expect(computeQuote({ listing: saona, request: req({ adults: 2 }), occupied: 38, today: TODAY }).bookable).toBe(true); // justo el cupo restante
    expect(computeQuote({ listing: saona, request: req({ adults: 2 }), occupied: 4, today: TODAY }).departure).toEqual({ booked: 4, min_guests: 12, confirmed: false });
    expect(computeQuote({ listing: saona, request: req({ adults: 2 }), occupied: 10, today: TODAY }).departure!.confirmed).toBe(true);
  });

  it("valida horario, bebés, extras y fecha", () => {
    expect(computeQuote({ listing: saona, request: req({ time: "15:00" }), occupied: 0, today: TODAY }).issues[0]!.code).toBe("INVALID_TIME");
    expect(computeQuote({ listing: { ...saona, infants_free: false }, request: req({ infants: 1 }), occupied: 0, today: TODAY }).issues[0]!.code).toBe("INFANTS_NOT_ALLOWED");
    expect(computeQuote({ listing: saona, request: req({ extras: ["nada"] }), occupied: 0, today: TODAY }).issues[0]!.code).toBe("UNKNOWN_EXTRA");
    expect(computeQuote({ listing: saona, request: req({ date: "2026-09-24" }), occupied: 0, today: TODAY }).issues[0]!.code).toBe("PAST_DATE");
    expect(computeQuote({ listing: saona, request: req({ date: TODAY }), occupied: 0, today: TODAY }).bookable).toBe(true); // hoy sí
    expect(computeQuote({ listing: saona, request: req({ date: "2026-02-30" }), occupied: 0, today: TODAY }).issues[0]!.code).toBe("INVALID_DATES");
  });

  it("paquetes de varios días: fecha de término y precio por persona", () => {
    const pkg: ListingSnap = { ...saona, category: "paquete", price: 320, child_price: 220, days: 3, min_guests: 4 };
    const q = computeQuote({ listing: pkg, request: req({ adults: 2, children: 1 }), occupied: 0, today: TODAY });
    expect(q).toMatchObject({ end_date: "2026-10-12", total: 860, seats: 3 });
  });

  it("sin horarios definidos no exige hora", () => {
    const q = computeQuote({ listing: { ...saona, time_slots: [] }, request: req(), occupied: 0, today: TODAY });
    expect(q).toMatchObject({ bookable: true, time: null });
  });
});

const stayListing: ListingSnap = { id: "h1", category: "alojamiento", price: 85, currency: "USD", capacity: 5, time_slots: [], deposit_percent: 30, child_price: null, infants_free: false, min_guests: null, days: null, extras: [{ id: "de", name: "Desayuno", price: 12, unit: "night" }, { id: "tras", name: "Traslado", price: 40, unit: "booking" }] };

describe("cotización de alojamientos", () => {
  it("noches × tarifas, extras por noche y por reserva, y el desglose por tipo de noche", () => {
    const q = computeQuote({ listing: stayListing, room: suite, request: { date: "2026-10-01", check_out: "2026-10-05", adults: 2, children: 0, infants: 0, extras: ["de", "tras"] }, occupied: 0, today: TODAY });
    expect(q).toMatchObject({ bookable: true, nights: 4, end_date: "2026-10-05", remaining: 2 });
    expect(q.subtotal).toBe(610 + 48 + 40);
    expect(q.lines.map((l) => [l.code, l.quantity])).toEqual([["base", 2], ["weekend", 2], ["extra", 4], ["extra", 1]]);
    expect(q.deposit_amount).toBe(209.4);
  });

  it("aplica las reglas de la habitación: mínimo de noches, bloqueos, capacidad y unidades", () => {
    const base = { listing: stayListing, room: suite, today: TODAY };
    const one = { date: "2026-10-01", check_out: "2026-10-02", adults: 2, children: 0, infants: 0, extras: [] };
    expect(computeQuote({ ...base, request: one, occupied: 0 }).issues.map((i) => i.code)).toEqual(["MIN_NIGHTS"]);
    expect(computeQuote({ ...base, request: { ...one, date: "2026-11-09", check_out: "2026-11-11" }, occupied: 0 }).issues.map((i) => i.code)).toEqual(["DATE_BLOCKED"]);
    expect(computeQuote({ ...base, request: { ...one, check_out: "2026-10-04", adults: 3, children: 1 }, occupied: 0 }).issues.map((i) => i.code)).toEqual(["OVER_CAPACITY"]);
    expect(computeQuote({ ...base, request: { ...one, check_out: "2026-10-04" }, occupied: 2 }).issues.map((i) => i.code)).toEqual(["SOLD_OUT"]);
    expect(computeQuote({ ...base, request: { ...one, check_out: "2026-10-04" }, occupied: 1 }).bookable).toBe(true); // queda 1 de 2
  });

  it("exige habitación y fechas coherentes", () => {
    const r = { date: "2026-10-01", check_out: "2026-10-04", adults: 2, children: 0, infants: 0, extras: [] };
    expect(computeQuote({ listing: stayListing, room: null, request: r, occupied: 0, today: TODAY }).issues[0]!.code).toBe("ROOM_REQUIRED");
    expect(computeQuote({ listing: stayListing, room: suite, request: { ...r, check_out: "2026-10-01" }, occupied: 0, today: TODAY }).issues[0]!.code).toBe("INVALID_DATES");
    expect(computeQuote({ listing: stayListing, room: suite, request: { ...r, check_out: undefined }, occupied: 0, today: TODAY }).issues[0]!.code).toBe("INVALID_DATES");
    expect(computeQuote({ listing: stayListing, room: suite, request: { ...r, check_out: "2027-01-01" }, occupied: 0, today: TODAY }).issues.map((i) => i.code)).toContain("MAX_NIGHTS");
  });
});

describe("cancelación y reembolso", () => {
  const start = "2026-10-10";
  it("flexible: total hasta 24 h antes; moderada: total hasta 5 días; estricta: 50 % hasta 7 días", () => {
    const at = (iso: string) => new Date(iso);
    expect(refundFor("flexible", start, "10:00", 100, at("2026-10-09T09:00:00-04:00"))).toMatchObject({ percent: 100, refund: 100 });
    expect(refundFor("flexible", start, "10:00", 100, at("2026-10-09T11:00:00-04:00"))).toMatchObject({ percent: 0, refund: 0 });
    expect(refundFor("moderada", start, "10:00", 100, at("2026-10-05T09:00:00-04:00"))).toMatchObject({ percent: 100 });
    expect(refundFor("moderada", start, "10:00", 100, at("2026-10-06T09:00:00-04:00"))).toMatchObject({ percent: 0 });
    expect(refundFor("estricta", start, null, 99.99, at("2026-10-01T00:00:00-04:00"))).toMatchObject({ percent: 50, refund: 50 });
    expect(refundFor("estricta", start, null, 100, at("2026-10-05T00:00:00-04:00"))).toMatchObject({ percent: 0 });
  });

  it("si cancela el operador, se devuelve todo siempre", () => {
    expect(refundFor("estricta", start, "10:00", 80, new Date("2026-10-10T09:00:00-04:00"), true)).toMatchObject({ percent: 100, refund: 80 });
  });
});
