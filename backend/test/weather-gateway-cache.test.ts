import { afterEach, describe, expect, it, vi } from "vitest";
import { WeatherServiceGateway } from "../src/modules/weather/gateway.js";

const log = { warn: () => undefined } as never;
const SECRET = "x".repeat(48);

describe("WeatherServiceGateway: lecturas públicas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("muchas visitas públicas generan una sola llamada al servicio de clima por ventana", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { temp: 30 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    let now = 1_000_000;
    const g = new WeatherServiceGateway("http://weather.local", SECRET, log, () => now);
    const all = await Promise.all(Array.from({ length: 200 }, () => g.weather("santo-domingo")));
    expect(all.every((d) => d.temp === 30)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await g.forecast("santo-domingo", 5);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    now += 301_000;
    await g.weather("santo-domingo");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("un fallo no queda guardado", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: "RATE_LIMITED", message: "x" } }), { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { temp: 28 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const g = new WeatherServiceGateway("http://weather.local", SECRET, log);
    await expect(g.weather()).rejects.toThrow();
    expect(await g.weather()).toMatchObject({ temp: 28 });
  });
});
