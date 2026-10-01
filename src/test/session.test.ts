import { describe, expect, it } from "vitest";
import { isSessionExpired, safeReturnTo } from "@/lib/session";

describe("isSessionExpired", () => {
  const now = 1_700_000_000_000;

  it("vence cuando expires_at quedó en el pasado", () => {
    expect(isSessionExpired({ expires_at: now / 1000 - 60 }, now)).toBe(true);
  });

  it("sigue vigente con expires_at en el futuro", () => {
    expect(isSessionExpired({ expires_at: now / 1000 + 60 }, now)).toBe(false);
  });

  it("considera vigente una sesión sin expires_at", () => {
    expect(isSessionExpired({}, now)).toBe(false);
    expect(isSessionExpired(null, now)).toBe(false);
    expect(isSessionExpired(undefined, now)).toBe(false);
  });

  it("ignora valores no numéricos", () => {
    expect(isSessionExpired({ expires_at: Number.NaN }, now)).toBe(false);
  });
});

describe("safeReturnTo", () => {
  it("acepta rutas internas con parámetros", () => {
    expect(safeReturnTo("/reservas?tab=activas")).toBe("/reservas?tab=activas");
    expect(safeReturnTo("/tienda/checkout")).toBe("/tienda/checkout");
  });

  it("rechaza destinos externos y protocol-relative", () => {
    expect(safeReturnTo("https://evil.example")).toBe("/");
    expect(safeReturnTo("//evil.example")).toBe("/");
    expect(safeReturnTo("/\\evil.example")).toBe("/");
    expect(safeReturnTo("javascript:alert(1)")).toBe("/");
  });

  it("cae al fallback con entradas vacías", () => {
    expect(safeReturnTo(null)).toBe("/");
    expect(safeReturnTo("")).toBe("/");
    expect(safeReturnTo(undefined, "/inicio")).toBe("/inicio");
  });

  it("recorta espacios antes de validar", () => {
    expect(safeReturnTo("  /perfil  ")).toBe("/perfil");
    expect(safeReturnTo("  //evil.example")).toBe("/");
  });
});
