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

  it("las colecciones secundarias toman del backend sólo valores del mismo tipo y nunca una imagen empaquetada", async () => {
    const { mountains } = await import("@/data/mountains");
    const { parquesData } = await import("@/data/parquesData");
    const mountain = mountains[0]!;
    const park = Object.values(parquesData)[0]!;
    const before = { imageUrl: mountain.imageUrl, activities: mountain.activities, count: mountains.length };
    const slug = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    fetchMock.mockImplementation((url: string) => {
      const collection = collectionOf(url);
      if (collection === "mountains") return Promise.resolve(page([
        { slug: mountain.slug, name: "Pico del backend", altitude_m: "3098.00", image_url: "/assets/pico.jpg", activities: "senderismo", },
        { slug: "sin-ficha", name: "Montaña incompleta" },
      ]));
      if (collection === "theme-parks") return Promise.resolve(page([{ slug: slug(park.nombre), name: park.nombre, price_adult: "99.50", attractions: [{ nombre: "Sin descripción" }] }]));
      return Promise.resolve(page([]));
    });
    const { hydrateCatalog, secondaryCatalogReady } = await import("@/services/catalogHydration");
    await hydrateCatalog({ source: "api" });
    expect(await secondaryCatalogReady()).toEqual(expect.arrayContaining(["mountains", "parquesData"]));
    expect(mountain).toMatchObject({ name: "Pico del backend", altitude: 3098 });
    expect(mountain.imageUrl).toBe(before.imageUrl); // `/assets/…` no existe en el sitio compilado
    expect(mountain.activities).toBe(before.activities); // un texto no sustituye a una lista
    expect(mountains).toHaveLength(before.count); // una fila sin lo imprescindible no se muestra
    expect(park.precioAdulto).toBe(99.5);
    expect(park.atracciones[0]).toHaveProperty("descripcion"); // la lista del backend no traía las claves que lee la pantalla
  });

  it("una fila que sólo existe en el backend se añade con la forma del resto de la colección", async () => {
    const { mountains } = await import("@/data/mountains");
    const before = mountains.length;
    fetchMock.mockImplementation((url: string) => {
      const collection = collectionOf(url);
      if (collection === "provinces") return Promise.resolve(page([{ id: "p1", slug: "la-vega", name: "La Vega" }]));
      if (collection === "mountains") return Promise.resolve(page([{ slug: "loma-nueva", name: "Loma Nueva", description: "Sólo en el backend", image_url: "https://img.test/m.jpg", province_id: "p1", altitude_m: 1200, activities: ["Senderismo"] }]));
      return Promise.resolve(page([]));
    });
    const { hydrateCatalog, secondaryCatalogReady } = await import("@/services/catalogHydration");
    await hydrateCatalog({ source: "api" });
    await secondaryCatalogReady();
    expect(mountains).toHaveLength(before + 1);
    expect(mountains.at(-1)).toMatchObject({ id: "loma-nueva", slug: "loma-nueva", name: "Loma Nueva", provinceId: "la-vega", provinceName: "La Vega", altitude: 1200, activities: ["Senderismo"], gallery: [], safetyTips: [] });
  });

  it("al cambiar de idioma vuelve a pedir el catálogo en ese idioma y avisa de que hay que repintar", async () => {
    const { hotels } = await import("@/data/hotels");
    const first = hotels[0]!;
    const langs: string[] = [];
    fetchMock.mockImplementation((url: string) => {
      const lang = new URL(url, "http://x").searchParams.get("lang")!;
      if (lang) langs.push(lang); // el índice de documentos no depende del idioma
      return Promise.resolve(collectionOf(url) === "hotels" ? page([{ slug: first.slug, name: lang === "en" ? "English name" : "Nombre en español" }]) : page([]));
    });
    const { hydrateCatalog, rehydrateCatalog, secondaryCatalogReady } = await import("@/services/catalogHydration");
    await hydrateCatalog({ source: "api", locale: "es" });
    const nameNow = () => hotels.find((h) => h.slug === first.slug)!.name; // la superposición crea registros nuevos
    expect(nameNow()).toBe("Nombre en español");
    expect(await rehydrateCatalog("es", "api")).toBe(false); // mismo idioma: nada que pedir
    await secondaryCatalogReady(); // la tanda secundaria en español aún estaba pidiendo
    const requested = langs.length;
    expect(await rehydrateCatalog("en", "api")).toBe(true);
    expect(nameNow()).toBe("English name");
    expect(langs.slice(requested).every((lang) => lang === "en")).toBe(true);
    expect(await rehydrateCatalog("fr", "static")).toBe(false);
  });
});
