import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
const page = (data: unknown[]) => json({ data, meta: { total_pages: 1 } });

describe("hidratación del catálogo", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); vi.resetModules(); });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
  const collectionOf = (url: string) => new URL(url, "http://x").pathname.split("/").pop()!;

  it("con el origen local no hace ninguna petición y no toca los datos", async () => {
    const { hydrateCatalog } = await import("@/services/catalogHydration");
    const { hotels } = await import("@/data/hotels");
    const before = hotels.length;
    expect(await hydrateCatalog({ source: "static" })).toEqual({ source: "static", hydrated: [], timedOut: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(hotels).toHaveLength(before);
  });

  it("con el backend actualiza los arreglos en su sitio, así las funciones de búsqueda de src/data ven los datos nuevos", async () => {
    const { hotels, getHotelBySlug, getFeaturedHotels } = await import("@/data/hotels");
    const { CatalogService } = await import("@/services/catalogService");
    const first = hotels[0]!;
    const sameArray = hotels;
    fetchMock.mockImplementation((url: string) => Promise.resolve(collectionOf(url) === "hotels"
      ? page([{ slug: first.slug, name: "Nombre del backend", is_featured: false }, { slug: "hotel-nuevo", name: "Hotel Nuevo", description: "Sólo en el backend", image_url: "https://img.test/h.jpg", is_featured: true }])
      : page([])));
    const { hydrateCatalog } = await import("@/services/catalogHydration");
    const result = await hydrateCatalog({ source: "api" });
    expect(result).toMatchObject({ source: "api", timedOut: false });
    expect(result.hydrated).toContain("hotels");
    expect(hotels).toBe(sameArray); // misma referencia: quien ya la importó ve el cambio
    expect(getHotelBySlug(first.slug)).toMatchObject({ name: "Nombre del backend", id: first.id, description: first.description });
    expect(getHotelBySlug("hotel-nuevo")).toMatchObject({ name: "Hotel Nuevo" });
    expect(getFeaturedHotels().some((h) => h.slug === "hotel-nuevo")).toBe(true);
    expect(getFeaturedHotels().some((h) => h.slug === first.slug)).toBe(false);
    expect((await CatalogService.getHotelBySlug("hotel-nuevo"))?.name).toBe("Hotel Nuevo");
  });

  it("si el backend no responde, los datos locales quedan intactos", async () => {
    const { beaches } = await import("@/data/beaches");
    const names = beaches.map((b) => b.name);
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const { hydrateCatalog } = await import("@/services/catalogHydration");
    expect(await hydrateCatalog({ source: "api" })).toEqual({ source: "api", hydrated: [], timedOut: false });
    expect(beaches.map((b) => b.name)).toEqual(names);
  });

  it("un backend lento no retrasa el arranque más del tope, y los datos llegan después", async () => {
    vi.useFakeTimers();
    const { bars } = await import("@/data/bars");
    const first = bars[0]!;
    fetchMock.mockImplementation((url: string) => new Promise((resolve) => setTimeout(() => resolve(collectionOf(url) === "bars" ? page([{ slug: first.slug, name: "Llegó tarde" }]) : page([])), 5000)));
    const { hydrateCatalog, catalogReady } = await import("@/services/catalogHydration");
    const started = hydrateCatalog({ source: "api", timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(await started).toEqual({ source: "api", hydrated: [], timedOut: true });
    expect(bars[0]!.name).toBe(first.name);
    await vi.advanceTimersByTimeAsync(10_000);
    await catalogReady();
    expect(bars.find((b) => b.slug === first.slug)!.name).toBe("Llegó tarde");
  });
});
