import { describe, expect, it } from "vitest";
import { addDays, minRoomPrice, quoteStay } from "@/modules/operadores/pricing";
import type { Room } from "@/modules/operadores/types";

const room: Room = {
  id: "room-1",
  name: "Habitación estándar",
  price: 100,
  guests: 2,
  quantity: 3,
  amenities: [],
  weekend_price: 150,
  min_nights: 2,
  seasons: [{ id: "season-1", name: "Temporada alta", from: "2026-10-03", to: "2026-10-04", price: 200 }],
  blocked: [{ id: "block-1", from: "2026-10-02", to: "2026-10-02", reason: "Mantenimiento" }],
};

describe("pricing de alojamientos de operadores", () => {
  it("calcula noches, total y promedio con prioridad temporada > fin de semana > base", () => {
    const quote = quoteStay(room, "2026-10-01", "2026-10-05");

    expect(quote.nights).toBe(4);
    expect(quote.total).toBe(650);
    expect(quote.average).toBe(162.5);
    expect(quote.lines).toEqual([
      { label: "Tarifa base", nights: 1, price: 100 },
      { label: "Fin de semana", nights: 1, price: 150 },
      { label: "Temporada alta", nights: 2, price: 200 },
    ]);
  });

  it("detecta noches bloqueadas dentro de la estadía inclusiva", () => {
    const quote = quoteStay(room, "2026-10-01", "2026-10-03");

    expect(quote.issue).toContain("Mantenimiento");
    expect(quote.nights).toBe(2);
  });

  it("aplica la estadía mínima solo a rangos válidos", () => {
    const quote = quoteStay({ ...room, blocked: [] }, "2026-10-01", "2026-10-02");

    expect(quote.issue).toContain("mínima de 2 noches");
  });

  it.each([
    ["fecha mal formada", "2026-02-30", "2026-03-02"],
    ["salida anterior al ingreso", "2026-10-05", "2026-10-01"],
    ["mismo día", "2026-10-01", "2026-10-01"],
  ])("rechaza %s con un error de dominio controlado", (_case, checkIn, checkOut) => {
    const quote = quoteStay(room, checkIn, checkOut);

    expect(quote.nights).toBe(0);
    expect(quote.total).toBe(0);
    expect(quote.issue).toBeTruthy();
  });

  it("suma días de calendario correctamente al cruzar un año bisiesto", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
  });

  it("encuentra el menor precio entre tarifa base, fin de semana y temporadas", () => {
    expect(minRoomPrice(room)).toBe(100);
    expect(minRoomPrice({ ...room, price: 250, weekend_price: 150 })).toBe(150);
  });
});
