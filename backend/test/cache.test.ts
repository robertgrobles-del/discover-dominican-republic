import { afterEach, describe, expect, it, vi } from "vitest";
import { TtlCache } from "../src/lib/cache.js";

describe("caché con vuelo único", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("muchas peticiones idénticas a la vez ejecutan una sola carga", async () => {
    const c = new TtlCache<number>(1000);
    let calls = 0;
    const load = async () => { calls++; await new Promise((r) => setTimeout(r, 20)); return 42; };
    const res = await Promise.all(Array.from({ length: 40 }, () => c.wrap("k", load)));
    expect(res.every((x) => x === 42)).toBe(true);
    expect(calls).toBe(1);
    expect(await c.wrap("k", load)).toBe(42);
    expect(calls).toBe(1);        // y luego sale de la caché
  });

  it("vence a los TTL ms y vuelve a cargar", async () => {
    vi.useFakeTimers();
    const c = new TtlCache<string>(5000);
    let n = 0;
    const load = async () => `v${++n}`;
    expect(await c.wrap("a", load)).toBe("v1");
    vi.advanceTimersByTime(4999);
    expect(await c.wrap("a", load)).toBe("v1");
    vi.advanceTimersByTime(2);
    expect(await c.wrap("a", load)).toBe("v2");
  });

  it("un error no queda guardado (el siguiente intento vuelve a cargar) y llaves distintas no se mezclan", async () => {
    const c = new TtlCache<number>(1000);
    let n = 0;
    await expect(c.wrap("x", async () => { n++; throw new Error("falló"); })).rejects.toThrow("falló");
    expect(await c.wrap("x", async () => { n++; return 7; })).toBe(7);
    expect(n).toBe(2);
    expect(await c.wrap("y", async () => 8)).toBe(8);
    expect(await c.wrap("x", async () => 0)).toBe(7);
  });

  it("no crece sin límite: descarta lo más antiguo", async () => {
    const c = new TtlCache<number>(60_000, 3);
    for (let i = 0; i < 10; i++) await c.wrap(`k${i}`, async () => i);
    expect(c.size).toBe(3);
    let reloaded = 0;
    await c.wrap("k0", async () => { reloaded++; return 0; });   // ya fue descartada
    await c.wrap("k9", async () => { reloaded++; return 9; });   // sigue en caché
    expect(reloaded).toBe(1);
  });
});
