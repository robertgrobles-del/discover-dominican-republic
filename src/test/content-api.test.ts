import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { beaches as localBeaches } from "@/data/beaches";
import { hotels as localHotels } from "@/data/hotels";
import { clearAccessToken } from "@/lib/accessToken";
import { resolveCatalogSource } from "@/lib/catalogSource";
import { beachPatch, buildPlaceIndex, destinationPatch, hasCardBasics, hotelPatch, overlay, type ApiRow } from "@/services/contentMappers";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const PROVINCES: ApiRow[] = [{ id: "p-1", slug: "pedernales", name: "Pedernales" }, { id: "p-2", slug: null, name: "Santo Domingo" }];
const DESTINATIONS: ApiRow[] = [{ id: "d-1", slug: "zona-colonial", name: "Zona Colonial de Santo Domingo", province_id: "p-2", description: "Ciudad primada", image_url: "https://img.test/zc.jpg" }];
const places = buildPlaceIndex(PROVINCES, DESTINATIONS);

describe("origen del catálogo", () => {
  it("por defecto son los archivos locales; un valor desconocido falla en vez de degradar en silencio", () => {
    expect(resolveCatalogSource(undefined)).toBe("static");
    // Vacío sigue al origen de datos: un despliegue real lee el catálogo del backend sin configurarlo aparte.
    expect(resolveCatalogSource("", "api")).toBe("api");
    expect(resolveCatalogSource("static", "api")).toBe("static");
    expect(resolveCatalogSource(" API ")).toBe("api");
    expect(() => resolveCatalogSource("strapi")).toThrow(/VITE_CATALOG_SOURCE/);
  });
});

describe("conversión de filas del backend", () => {
  it("una playa toma sus campos y resuelve la provincia por su id", () => {
    const patch = beachPatch({ id: "uuid-1", slug: "bahia-de-las-aguilas", name: "Bahía de las Águilas", province_id: "p-1", beach_type: "virgen", rating: "5.00", latitude: 17.85, parking_available: false, activities: ["Snorkel"], gallery: null, water_color: "" }, places);
    expect(patch).toMatchObject({ id: "bahia-de-las-aguilas", slug: "bahia-de-las-aguilas", province: "Pedernales", provinceSlug: "pedernales", beachType: "virgen", rating: 5, latitude: 17.85, parkingAvailable: false, activities: ["Snorkel"] });
    // Lo que la API no trae (nulo o vacío) no aparece: así no pisa el valor local.
    expect(patch).not.toHaveProperty("gallery");
    expect(patch).not.toHaveProperty("waterColor");
  });

  it("una provincia antigua sin slug guardado lo deriva de su nombre, sin acentos", () => {
    expect(hotelPatch({ slug: "h", name: "H", destination_id: "d-1" }, places)).toMatchObject({ destinationId: "zona-colonial", province: "Santo Domingo", provinceId: "santo-domingo" });
  });

  it("un destino sólo actualiza lo que la base almacena: ni valoración ni destacado", () => {
    const patch = destinationPatch({ slug: "zona-colonial", name: "Zona Colonial", province_id: "p-2", rating: 4.9, is_featured: true, typical_dishes: ["Sancocho"] }, places);
    expect(patch).toMatchObject({ slug: "zona-colonial", typicalDishes: ["Sancocho"], provinceSlug: "santo-domingo" });
    expect(patch).not.toHaveProperty("rating");
    expect(patch).not.toHaveProperty("isFeatured");
  });
});

describe("superposición de la API sobre los datos locales", () => {
  type Card = { slug: string; name: string; description: string; imageUrl: string; destinationName?: string; extra?: string };
  const local: Card[] = [
    { slug: "a", name: "A local", description: "d", imageUrl: "i", destinationName: "Zona Colonial", extra: "sólo local" },
    { slug: "b", name: "B local", description: "d", imageUrl: "i" },
  ];

  it("lo común toma el valor de la API, conserva lo que sólo está en local y respeta la etiqueta local del destino", () => {
    const out = overlay(local, [{ slug: "a", name: "A de la API", destinationName: "Zona Colonial de Santo Domingo" }], hasCardBasics<Card>);
    expect(out[0]).toEqual({ slug: "a", name: "A de la API", description: "d", imageUrl: "i", destinationName: "Zona Colonial", extra: "sólo local" });
  });

  it("lo nuevo de la API entra sólo si trae lo mínimo de una ficha; lo que sólo está en local no se pierde", () => {
    const out = overlay(local, [{ slug: "c", name: "C", description: "d", imageUrl: "i" }, { slug: "incompleto", name: "Sin imagen", description: "d" }, { slug: "c", name: "C repetido" }], hasCardBasics<Card>);
    expect(out.map((x) => x.slug)).toEqual(["c", "a", "b"]);
    expect(out[0]!.name).toBe("C");
  });
});

describe("catálogo desde el backend", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const page = (data: ApiRow[], total_pages = 1) => json({ data, meta: { total_pages } });
  beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); vi.resetModules(); });
  afterEach(() => { vi.unstubAllGlobals(); });
  const respond = (handler: (collection: string, url: string) => Response) => fetchMock.mockImplementation((url: string) => Promise.resolve(handler(new URL(url, "http://x").pathname.split("/").pop()!, url)));

  it("pide cada colección por el mismo origen con sus columnas, y recorre todas las páginas", async () => {
    const first = localBeaches[0]!;
    respond((collection, url) => {
      if (collection === "provinces") return page(PROVINCES);
      if (collection === "destinations") return page(DESTINATIONS);
      return new URL(url, "http://x").searchParams.get("page") === "1" ? page([{ slug: first.slug, name: "Nombre actualizado" }], 2) : page([{ slug: "playa-nueva", name: "Playa Nueva", description: "Recién publicada", image_url: "https://img.test/nueva.jpg", province_id: "p-1" }], 2);
    });
    const { contentApi } = await import("@/services/contentApi");
    const out = await contentApi.beaches();
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.every((u) => u.startsWith("/api/v1/"))).toBe(true);
    expect(calls.filter((u) => u.startsWith("/api/v1/beaches?")).map((u) => new URL(u, "http://x").searchParams.get("page"))).toEqual(["1", "2"]);
    expect(calls.find((u) => u.startsWith("/api/v1/beaches?"))).toContain("fields=id,slug,name,destination_id,province_id,beach_type");
    expect(out.find((b) => b.slug === first.slug)).toMatchObject({ name: "Nombre actualizado", description: first.description });
    expect(out.find((b) => b.slug === "playa-nueva")).toMatchObject({ province: "Pedernales", imageUrl: "https://img.test/nueva.jpg" });
    expect(out).toHaveLength(localBeaches.length + 1);
  });

  it("provincias y destinos se piden una sola vez aunque se carguen varias colecciones", async () => {
    respond((collection) => (collection === "provinces" ? page(PROVINCES) : collection === "destinations" ? page(DESTINATIONS) : page([])));
    const { contentApi } = await import("@/services/contentApi");
    await Promise.all([contentApi.hotels(), contentApi.bars(), contentApi.restaurants()]);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.filter((u) => u.startsWith("/api/v1/provinces?"))).toHaveLength(1);
    expect(calls.filter((u) => u.startsWith("/api/v1/destinations?"))).toHaveLength(1);
  });

  it("si el backend no responde devuelve los datos locales, y vuelve a intentarlo la próxima vez", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const { contentApi } = await import("@/services/contentApi");
    expect(await contentApi.hotels()).toEqual(localHotels);
    respond((collection) => (collection === "provinces" ? page(PROVINCES) : collection === "destinations" ? page(DESTINATIONS) : page([{ slug: localHotels[0]!.slug, stars: 3 }])));
    expect((await contentApi.hotels()).find((h) => h.slug === localHotels[0]!.slug)!.stars).toBe(3);
  });
});
