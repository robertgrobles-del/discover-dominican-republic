import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DATASETS, idOf } from "../scripts/static/mappers.js";
import { loadStatic } from "../scripts/static/loader.js";
import { backfillExtras, coerce, datasetKey, datasetOf, runDatasetImport, runImport, sanitize, type DatasetResult, type DocumentResult } from "../scripts/static/run.js";

/**
 * Carga real del contenido estático del frontend (src/data) dentro de una transacción que se revierte: comprueba que cada mapeo
 * cumple las restricciones de la base y que repetir la carga no duplica, sin dejar datos en la base compartida de pruebas.
 */
describe("carga del contenido estático del frontend", () => {
  let pool: pg.Pool;
  let c: pg.PoolClient;
  let first: DatasetResult[], second: DatasetResult[], docs: DocumentResult[];
  const DOC_FILES = ["transporteData.ts", "monedaData.ts", "mountains.ts", "hotels.ts", "rewardsData.ts", "partnerDashboardData.ts"];

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    c = await pool.connect();
    await c.query("BEGIN");
    first = await runImport(c);
    second = await runImport(c);
    docs = await runDatasetImport(c, DOC_FILES);
  }, 180_000);
  afterAll(async () => { await c.query("ROLLBACK"); c.release(); await pool.end(); });

  it("todos los mapeos cumplen los tipos y restricciones de sus tablas (sin errores)", () => {
    expect(first.flatMap((r) => r.errors.map((e) => `${r.key}: ${e}`))).toEqual([]);
    expect(first.map((r) => r.key)).toEqual(DATASETS.map((d) => d.key));
  });

  it("carga cientos de registros y cada colección trae lo que dice su archivo de origen", () => {
    const by = Object.fromEntries(first.map((r) => [r.key, r]));
    expect(first.reduce((s, r) => s + r.source, 0)).toBeGreaterThan(350);
    for (const k of ["beaches", "mountains", "hotels", "restaurants", "bars", "experiences", "destinations"]) expect(by[k]!.inserted + by[k]!.existing, k).toBe(by[k]!.source);
    expect(by.destinations!.source).toBe(48);
    expect(by.beaches!.source).toBe(15);
    expect(by.mountains!.source).toBe(39);
  });

  it("repetir la carga no duplica ni pisa nada", () => {
    expect(second.reduce((s, r) => s + r.inserted, 0)).toBe(0);
    expect(second.every((r) => r.errors.length === 0)).toBe(true);
    for (const r of second) expect(r.existing + r.skipped, r.key).toBe(r.source);
  });

  /** Elementos del archivo de origen cuyo id derivado quedó en la base (los que ya existían en las pruebas, con otro id, se respetan). */
  const loaded = async (file: string, key: string, table: string) => {
    const items = ((await loadStatic(file))[key] as { id: string }[]);
    const ids = items.map((i) => idOf(table, i.id));
    const present = new Set((await c.query(`SELECT id FROM ${table} WHERE id = ANY($1::uuid[])`, [ids])).rows.map((r) => r.id));
    return items.filter((i) => present.has(idOf(table, i.id)));
  };

  it("las referencias entre colecciones se resuelven: provincias de los destinos, destinos de playas y provincias de montañas", async () => {
    const dests = await loaded("destinations.ts", "destinations", "destinations");
    expect(dests.length).toBeGreaterThan(40);
    const noProv = (await c.query("SELECT slug FROM destinations WHERE id = ANY($1::uuid[]) AND province_id IS NULL", [dests.map((d) => idOf("destinations", d.id))])).rows;
    expect(noProv.map((r) => r.slug)).toEqual([]);
    const beaches = await loaded("beaches.ts", "beaches", "beaches");
    expect(beaches.length).toBeGreaterThan(5);
    const withDest = Number((await c.query("SELECT count(destination_id) AS n FROM beaches WHERE id = ANY($1::uuid[])", [beaches.map((b) => idOf("beaches", b.id))])).rows[0].n);
    expect(withDest).toBeGreaterThanOrEqual(Math.floor(beaches.length * 0.6));
    const mountains = await loaded("mountains.ts", "mountains", "mountains");
    expect(Number((await c.query("SELECT count(*) AS n FROM mountains WHERE id = ANY($1::uuid[]) AND province_id IS NULL", [mountains.map((m) => idOf("mountains", m.id))])).rows[0].n)).toBe(0);
  });

  it("lo cargado queda publicado, con slug único e imagen, y listo para la API pública", async () => {
    for (const t of ["beaches", "mountains", "hotels", "restaurants", "destinations"]) {
      const r = (await c.query(`SELECT count(*) FILTER (WHERE status = 'published' AND published_at IS NOT NULL)::int AS pub, count(slug)::int AS slugs, count(DISTINCT slug)::int AS uniq FROM ${t}`)).rows[0];
      expect(r.pub, t).toBeGreaterThanOrEqual(10);
      expect(r.slugs, t).toBe(r.uniq);
    }
    const [first] = await loaded("beaches.ts", "beaches", "beaches") as unknown as { id: string; name: string; beachType: string; latitude: number; gallery: string[]; isFeatured: boolean }[];
    const b = (await c.query("SELECT * FROM beaches WHERE id = $1", [idOf("beaches", first!.id)])).rows[0];
    expect(b).toMatchObject({ name: first!.name, beach_type: first!.beachType, status: "published" });
    expect(Number(b.latitude)).toBeCloseTo(first!.latitude, 3);
    expect(b.gallery).toHaveLength(first!.gallery.length);
    expect(b.image_url).toMatch(/^(https?:\/\/|\/)/);
    const [m] = await loaded("mountains.ts", "mountains", "mountains") as unknown as { id: string; altitude: number; guidesRequired: boolean }[];
    expect((await c.query("SELECT altitude_m, guides_required FROM mountains WHERE id = $1", [idOf("mountains", m!.id)])).rows[0]).toEqual({ altitude_m: m!.altitude, guides_required: m!.guidesRequired });
    expect((await c.query("SELECT port_type FROM ports_marinas WHERE id = $1", [idOf("ports_marinas", "sans-souci")])).rows[0]).toEqual({ port_type: "port" });
  });

  it("los ids son estables entre cargas y entornos (UUID v5) y las coordenadas de texto se convierten", async () => {
    expect(idOf("beaches", "x")).toBe(idOf("beaches", "x"));
    expect(idOf("beaches", "x")).not.toBe(idOf("hotels", "x"));
    const port = (await c.query("SELECT latitude, longitude FROM ports_marinas WHERE id = $1", [idOf("ports_marinas", "sans-souci")])).rows[0];
    expect(Number(port.latitude)).toBeCloseTo(18.4636, 3);
    expect(Number(port.longitude)).toBeCloseTo(-69.8827, 3);           // «69.8827° W» → negativo
  });

  it("cada fila guarda su ficha completa en extras: lo que no tiene columna no se pierde", async () => {
    const dests = await loaded("destinations.ts", "destinations", "destinations");
    const one = dests[0] as unknown as Record<string, unknown>;
    const row = (await c.query("SELECT extras FROM destinations WHERE id = $1", [idOf("destinations", String(one.id))])).rows[0];
    expect(row.extras).toEqual(sanitize(one));
    expect(Object.keys(row.extras).length).toBeGreaterThan(15);
    // Una fila cuyo extras ya editó el equipo no se pisa al repetir la carga.
    await c.query("UPDATE destinations SET extras = $2 WHERE id = $1", [idOf("destinations", String(one.id)), JSON.stringify({ editado: true })]);
    await runImport(c, { only: ["destinations"] });
    expect((await c.query("SELECT extras FROM destinations WHERE id = $1", [idOf("destinations", String(one.id))])).rows[0].extras).toEqual({ editado: true });
  });

  it("lo que no es una colección se guarda como documentos, uno por archivo; lo editado en el CMS no se pisa", async () => {
    const by = Object.fromEntries(docs.map((d) => [d.file, d]));
    expect(docs.filter((d) => d.error)).toEqual([]);
    expect(by["partnerDashboardData.ts"]).toBeUndefined(); // actividad simulada de un socio, no contenido del sitio
    expect(by["rewardsData.ts"]!.exports).toBeGreaterThan(0); // el catálogo de recompensas sí es contenido editable
    expect(by["hotels.ts"]!.state).toBe("vacío"); // su único bloque de datos ya es una colección
    expect(by["mountains.ts"]!.exports).toBe(1); // las etiquetas de cordillera, no las montañas
    expect(datasetKey("comoLlegarData.ts")).toBe("como-llegar-data");
    const stored = (await c.query("SELECT value, revision FROM content_datasets WHERE key = 'transporte-data'")).rows[0];
    expect(stored.revision).toBe(0);
    expect(stored.value).toEqual(datasetOf("transporteData.ts", await loadStatic("transporteData.ts")));
    expect((await runDatasetImport(c, ["transporteData.ts"]))[0]!.state).toBe("sin cambios");
    await c.query("UPDATE content_datasets SET value = '{\"routes\": []}', revision = 1 WHERE key = 'transporte-data'");
    expect((await runDatasetImport(c, ["transporteData.ts"]))[0]!.state).toBe("editado en el CMS");
    expect((await c.query("SELECT value FROM content_datasets WHERE key = 'transporte-data'")).rows[0].value).toEqual({ routes: [] });
  });

  it("una fila que no viene de src/data recibe su ficha a partir de sus columnas, y su destino si la dirección lo nombra", async () => {
    const tag = Date.now().toString(36);
    const insert = (slug: string, name: string, address: string) => c.query(
      "INSERT INTO hotels (id, slug, name, address, description, short_description, image_url, stars, rating, amenities, status, published_at) VALUES (gen_random_uuid(), $1, $2, $3, 'Descripción larga', 'Resumen', 'https://img.test/h.jpg', 5, 4.7, $4, 'published', now())",
      [slug, name, address, JSON.stringify(["Spa", "Playa privada"])]);
    await insert(`hotel-enlazable-${tag}`, "Hotel Enlazable", "Boulevard Cap Cana, Punta Cana");
    await insert(`hotel-ambiguo-${tag}`, "Hotel Ambiguo", "Playa Grande, Río San Juan");
    const report = await backfillExtras(c);
    expect(report.find((r) => r.table === "hotels")!.filled).toBeGreaterThanOrEqual(2);

    const row = async (slug: string) => (await c.query("SELECT h.extras, d.slug AS destination FROM hotels h LEFT JOIN destinations d ON d.id = h.destination_id WHERE h.slug = $1", [slug])).rows[0];
    const linked = await row(`hotel-enlazable-${tag}`);
    expect(linked.destination).toBe("punta-cana");
    expect(linked.extras).toMatchObject({ id: `hotel-enlazable-${tag}`, slug: `hotel-enlazable-${tag}`, name: "Hotel Enlazable", stars: 5, rating: 4.7, amenities: ["Spa", "Playa privada"], imageUrl: "https://img.test/h.jpg", shortDescription: "Resumen", destinationId: "punta-cana", destinationName: "Punta Cana", gallery: [] });
    expect(linked.extras.province).toBeTruthy();
    // "Río San Juan" no es la provincia de San Juan: sin coincidencia exacta la fila se queda sin destino.
    const ambiguous = await row(`hotel-ambiguo-${tag}`);
    expect(ambiguous.destination).toBeNull();
    expect(ambiguous.extras).toMatchObject({ name: "Hotel Ambiguo", destinationId: "" });

    // Repetirlo no toca nada: todas las filas tienen ya su ficha.
    await c.query("UPDATE hotels SET extras = extras || '{\"editado\": true}' WHERE slug = $1", [`hotel-enlazable-${tag}`]);
    expect(await backfillExtras(c)).toEqual([]);
    expect((await row(`hotel-enlazable-${tag}`)).extras.editado).toBe(true);
  }, 120_000);

  it("sanitize deja sólo lo que cabe en JSON", () => {
    expect(sanitize({ a: 1, icon: () => null, nested: [{ b: "x", render: { $$typeof: Symbol.for("react.forward_ref") } }], u: undefined })).toEqual({ a: 1, nested: [{ b: "x" }] });
  });

  it("coerce respeta el tipo de cada columna", () => {
    expect(coerce("jsonb", ["a"])).toBe('["a"]');
    expect(coerce("array", ["a", 1])).toEqual(["a", "1"]);
    expect(coerce("integer", "3.6")).toBe(4);
    expect(coerce("numeric", "abc")).toBeNull();
    expect(coerce("text", ["x", "y"])).toBe("x, y");
    expect(coerce("boolean", 1)).toBe(true);
    expect(coerce("text", undefined)).toBeNull();
  });
});
