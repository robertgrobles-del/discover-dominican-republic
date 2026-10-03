import { afterEach, describe, expect, it, vi } from "vitest";
import { haptic } from "@/lib/haptics";

describe("respuesta háptica", () => {
  const original = Object.getOwnPropertyDescriptor(navigator, "vibrate");
  const stub = (fn: unknown) => Object.defineProperty(navigator, "vibrate", { value: fn, configurable: true, writable: true });
  const motion = (reduce: boolean) => vi.stubGlobal("matchMedia", (q: string) => ({ matches: reduce && q.includes("reduce") }));
  afterEach(() => { vi.unstubAllGlobals(); if (original) Object.defineProperty(navigator, "vibrate", original); else delete (navigator as { vibrate?: unknown }).vibrate; });

  it("vibra con un patrón distinto según el tipo de acción", () => {
    const vibrate = vi.fn(); stub(vibrate); motion(false);
    haptic(); haptic("success"); haptic("warning");
    expect(vibrate.mock.calls.map((c) => c[0])).toEqual([10, [12, 40, 18], [30, 50, 30]]);
  });

  it("no vibra si la persona pidió menos movimiento", () => {
    const vibrate = vi.fn(); stub(vibrate); motion(true);
    haptic("success");
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("no falla donde no existe la vibración ni si el navegador la bloquea", () => {
    stub(undefined); motion(false);
    expect(() => haptic()).not.toThrow();
    stub(() => { throw new Error("bloqueado"); });
    expect(() => haptic()).not.toThrow();
  });
});
