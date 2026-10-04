import { afterEach, describe, expect, it } from "vitest";
import { resolveAssetsDeep, setAssetResolver } from "@/services/assetPaths";
import { planCollections, type CollectionSpec } from "@/services/catalogCollections";
import { withExtras } from "@/services/contentMappers";
import { hydrateDatasets, mergeInPlace } from "@/services/datasetHydration";

const Icon = () => null;

describe("documentos de contenido", () => {
  afterEach(() => setAssetResolver(() => undefined));

  it("vuelca el documento sobre los datos locales en su sitio y conserva lo que el backend no guarda", () => {
    const options = [
      { id: "bus", name: "Autobús", icon: Icon, tips: ["Compra antes"], price: 5 },
      { id: "taxi", name: "Taxi", icon: Icon, tips: [], price: 20 },
    ];
    const first = options[0]!;
    const changes = mergeInPlace(options, [
      { id: "taxi", name: "Taxi oficial", tips: ["Pide recibo"], price: 25 },
      { id: "bus", name: "Autobús", tips: ["Compra antes"], price: "cinco" },
      { id: "metro", name: "Metro", tips: [], price: 1 },
    ]);
    expect(changes).toBeGreaterThan(0);
    expect(options.map((o) => o.id)).toEqual(["taxi", "bus", "metro"]); // el orden es el del documento
    expect(options[1]).toBe(first); // mismo objeto: quien lo tenía ve el cambio
    expect(options[0]).toMatchObject({ name: "Taxi oficial", tips: ["Pide recibo"], price: 25, icon: Icon });
    expect(first.price).toBe(5); // un texto no sustituye a un número
  });

  it("un documento igual a los datos locales no cambia nada", () => {
    const data = { rates: { usd: 59.5, eur: 64 }, tips: [{ title: "Cambia en bancos", icon: Icon }], labels: ["a", "b"] };
    const copy = { rates: { eur: 64, usd: 59.5 }, tips: [{ title: "Cambia en bancos" }], labels: ["a", "b"] };
    expect(mergeInPlace(data, copy, false)).toBe(0);
    expect(mergeInPlace(data, { ...copy, labels: ["a"] }, false)).toBe(1);
    expect(data.labels).toEqual(["a", "b"]); // sin aplicar, sólo cuenta
  });

  it("traduce las imágenes empaquetadas y no toca el dato si alguna no existe", () => {
    setAssetResolver((name) => (name === "playa.jpg" ? "/assets/playa-abc123.jpg" : undefined));
    const data = { hero: "/assets/playa-abc123.jpg", gallery: ["x"], other: "/assets/otra-999.jpg" };
    expect(mergeInPlace(data, { hero: "/assets/playa.jpg", gallery: ["/assets/playa.jpg"], other: "/assets/no-existe.jpg" })).toBe(1);
    expect(data).toEqual({ hero: "/assets/playa-abc123.jpg", gallery: ["/assets/playa-abc123.jpg"], other: "/assets/otra-999.jpg" });
    expect(resolveAssetsDeep({ a: ["/assets/no-existe.jpg"] }).ok).toBe(false);
  });

  it("sólo descarga los documentos editados en el CMS", async () => {
    const tasas = { staticTasas: { usd: 59 } };
    const requested: string[] = [];
    const source = {
      index: async () => [{ key: "moneda-data", revision: 2 }, { key: "transporte-data", revision: 0 }, { key: "sin-archivo", revision: 3 }],
      get: async (key: string) => { requested.push(key); return { staticTasas: { usd: 61 } }; },
    };
    const loaders = { "moneda-data": async () => tasas, "transporte-data": async () => { throw new Error("no debería cargarse"); } };
    expect(await hydrateDatasets(source, loaders)).toEqual(["moneda-data"]);
    expect(requested).toEqual(["moneda-data"]);
    expect(tasas.staticTasas.usd).toBe(61);
  });
});

describe("ficha completa en extras", () => {
  it("los campos sin columna llegan por extras y las columnas mandan sobre su copia", () => {
    const patch = withExtras<{ name: string; tips: string[]; region: string }>({ extras: { name: "Nombre viejo", tips: ["Lleva agua"], region: "Norte" } }, { name: "Nombre de la columna" });
    expect(patch).toEqual({ name: "Nombre de la columna", tips: ["Lleva agua"], region: "Norte" });
    expect(withExtras({ extras: null }, { name: "x" })).toEqual({ name: "x" });
  });

  const spec = (items: Record<string, unknown>[]): CollectionSpec => ({ name: "rios", path: "rivers", load: async () => items, keyOf: (r) => String(r.id), fields: { nombre: "name", rating: "rating" } });

  it("en las colecciones secundarias, extras actualiza los campos sin columna de un registro existente", () => {
    const items = [{ id: "yaque", nombre: "Yaque", rating: 4.5, tipo: "Aventura", actividades: ["Rafting"] }];
    const [plan] = planCollections([spec(items)], [items], [{ slug: "yaque", name: "Yaque", rating: "4.50", extras: { id: "yaque", nombre: "copia vieja", tipo: "Familiar", actividades: ["Rafting", "Kayak"] } }]);
    expect(plan!.changes.map((c) => [c.field, c.to])).toEqual([["tipo", "Familiar"], ["actividades", ["Rafting", "Kayak"]]]);
  });

  it("una fila nueva con ficha en extras se añade completa; sin ficha y sin regla para completarla, no", () => {
    const items = [{ id: "yaque", nombre: "Yaque", rating: 4.5, tipo: "Aventura", actividades: ["Rafting"] }];
    const [plan] = planCollections([spec(items)], [items], [
      { slug: "nizao", name: "Río Nizao", rating: 4.2, extras: { id: "nizao", nombre: "Nizao", tipo: "Familiar", actividades: [] } },
      { slug: "sin-ficha", name: "Sin ficha", rating: 3 },
    ]);
    expect(plan!.added).toEqual([{ id: "nizao", nombre: "Río Nizao", rating: 4.2, tipo: "Familiar", actividades: [] }]);
  });
});
