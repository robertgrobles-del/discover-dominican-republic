import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BY_PATH, COLLECTIONS } from "../src/contracts/content-collections.js";
import { readManifest } from "../src/modules/content/manifest-reader.js";
import { contentManifest as manifest } from "../src/contracts/content-schema.js";
import { json, makeApp } from "./helpers.js";

const slugs = (res: { body: string }) => json(res).data.map((x: { slug: string }) => x.slug);
const names = (res: { body: string }) => json(res).data.map((x: { name: string }) => x.name);

describe("registro de colecciones", () => {
  it("cada columna referenciada existe en el esquema real", () => {
    const problems: string[] = [];
    for (const d of COLLECTIONS) {
      const has = (c: string) => c in (manifest[d.table] ?? {});
      if (!manifest[d.table] || Object.keys(manifest[d.table]!).length === 0) { problems.push(`${d.path}: tabla ${d.table} sin columnas`); continue; }
      const need: [string, string[]][] = [
        ["title", [d.title]], ["search", d.search], ["filters", Object.keys(d.filters)], ["sort", d.sort],
        ["defaultSort", d.defaultSort.map((s) => s.column)], ["related", d.related],
        ["relations", Object.values(d.relations).map((r) => r.column)], ["geo", d.geo ? [d.geo.lat, d.geo.lng] : []],
      ];
      for (const [what, list] of need) for (const c of list) if (!has(c)) problems.push(`${d.path}.${what}: falta la columna ${c}`);
      for (const r of Object.values(d.relations)) for (const f of r.fields) if (!(f in (manifest[r.table] ?? {}))) problems.push(`${d.path}.relation ${r.table}: falta ${f}`);
    }
    expect(problems).toEqual([]);
  });

  it("rutas y tablas son únicas y toda colección relacionada está registrada", () => {
    expect(new Set(COLLECTIONS.map((c) => c.path)).size).toBe(COLLECTIONS.length);
    expect(new Set(COLLECTIONS.map((c) => c.table)).size).toBe(COLLECTIONS.length);
    for (const d of COLLECTIONS) for (const r of Object.values(d.relations)) expect(COLLECTIONS.some((c) => c.table === r.table), `${d.path} → ${r.table}`).toBe(true);
    expect(COLLECTIONS.length).toBeGreaterThanOrEqual(43);
  });

  it("manifest.json coincide con la base migrada (si falla: npm run db:gen-manifest)", async () => {
    const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    try { expect(await readManifest(pool)).toEqual(manifest); } finally { await pool.end(); }
  });

  it("nunca se exponen datos personales ni internos", () => {
    const hidden = ["rut", "numero_identificacion", "telefono", "correo", "discount_code", "verification_notes"];
    for (const d of COLLECTIONS) for (const c of hidden) if (d.table === "establecimientos" || d.table === "offers" || d.table.startsWith("travel") || d.table.startsWith("tour_op")) {
      if (c in (manifest[d.table] ?? {})) {
        const exposed = c in (manifest[d.table] ?? {}) && !d.exclude.includes(c);
        if (["rut", "numero_identificacion", "telefono", "correo"].includes(c) && d.table === "establecimientos") expect(exposed, `${d.path}.${c}`).toBe(false);
        if (c === "discount_code" && d.table === "offers") expect(exposed).toBe(false);
        if (c === "verification_notes") expect(exposed, `${d.path}.${c}`).toBe(false);
      }
    }
  });
});

describe("colecciones públicas", () => {
  let app: FastifyInstance;
  const get = (url: string, headers: Record<string, string> = {}) => app.inject({ url: `/api/v1${url}`, headers });
  beforeAll(async () => { app = await makeApp(); });
  afterAll(async () => { await app.close(); });

  describe("visibilidad", () => {
    it("oculta borradores, eliminados, inactivos y contenido programado a futuro", async () => {
      const res = await get("/beaches?per_page=100");
      expect(slugs(res).sort()).toEqual(["playa-bavaro", "playa-macao", "playa-rincon"]);
      for (const s of ["playa-borrador", "playa-oculta", "playa-futura"]) expect((await get(`/beaches/${s}`)).statusCode, s).toBe(404);
    });

    it("aplica reglas propias: artículos no publicados, vacantes vencidas y ofertas fuera de vigencia", async () => {
      expect(slugs(await get("/articles"))).toEqual(["guia-de-playas"]);
      expect(slugs(await get("/job-vacancies")).sort()).toEqual(["guia-remoto", "recepcionista"]);
      expect(slugs(await get("/offers"))).toEqual(["oferta-activa"]);
      expect((await get("/mountains/monte-oculto")).statusCode).toBe(404);
    });

    it("no expone columnas internas del CMS ni datos protegidos", async () => {
      const b = json(await get("/beaches/playa-bavaro")).data;
      for (const k of ["status", "deleted_at", "version", "created_by", "slug_history", "seo_title"]) expect(b, k).not.toHaveProperty(k);
      expect(b.seo).toEqual({ title: null, description: null, og_image: null, canonical_url: null, noindex: false });
      const offer = json(await get("/offers/oferta-activa")).data;
      expect(offer).not.toHaveProperty("discount_code");
    });
  });

  describe("listados", () => {
    it("ordena por defecto (destacados primero), pagina y devuelve el resumen de la página", async () => {
      const res = await get("/beaches");
      expect(names(res)).toEqual(["Playa Bávaro", "Playa Rincón", "Playa Macao"]);
      expect(json(res).meta).toMatchObject({ page: 1, per_page: 24, total: 3, total_pages: 1, locale: "es" });
      const p2 = json(await get("/beaches?per_page=2&page=2"));
      expect(p2.data).toHaveLength(1);
      expect(p2.meta).toMatchObject({ total: 3, total_pages: 2 });
    });

    it("pagina por cursor (keyset) sin repetir ni saltar filas, en el mismo orden que page/per_page", async () => {
      // sort=name es una sola columna NOT NULL (a diferencia del orden por defecto, que empieza por is_featured
      // — esa sí admite NULL en el esquema real aunque en la práctica siempre tenga true/false), así que sí admite cursor.
      const p1 = json(await get("/beaches?sort=name&per_page=1"));
      expect(p1.meta.next_cursor).toBeTruthy();
      expect(p1.data.map((x: { name: string }) => x.name)).toEqual(["Playa Bávaro"]); // orden alfabético: Bávaro < Macao < Rincón

      const p2 = json(await get(`/beaches?sort=name&per_page=1&cursor=${encodeURIComponent(p1.meta.next_cursor)}`));
      expect(p2.meta.next_cursor).toBeTruthy();
      expect(p2.data.map((x: { name: string }) => x.name)).toEqual(["Playa Macao"]);
      // El total sigue reflejando la colección completa (no sólo lo que queda por delante del cursor).
      expect(p2.meta).toMatchObject({ total: 3 });

      const p3 = json(await get(`/beaches?sort=name&per_page=1&cursor=${encodeURIComponent(p2.meta.next_cursor)}`));
      expect(p3.data.map((x: { name: string }) => x.name)).toEqual(["Playa Rincón"]);
      // Última página: no hay más filas después de esta, así que no debe ofrecer un próximo cursor.
      expect(p3.meta.next_cursor).toBeFalsy();
    });

    it("no ofrece cursor en el orden por defecto (is_featured admite NULL en el esquema) ni en sort=rating (también nullable); un cursor forzado ahí se rechaza con 400", async () => {
      expect(json(await get("/beaches?per_page=1")).meta.next_cursor).toBeUndefined();
      const noCursor = json(await get("/beaches?sort=rating&per_page=1"));
      expect(noCursor.meta.next_cursor).toBeUndefined();
      const rejected = await get("/beaches?sort=rating&per_page=1&cursor=" + Buffer.from(JSON.stringify(["4.90", "b1000000-0000-4000-8000-000000000003"])).toString("base64url"));
      expect(rejected.statusCode).toBe(400);
    });

    it("un cursor con formato inválido (no es el base64 de un array JSON) se rechaza con 400", async () => {
      expect((await get("/beaches?cursor=esto-no-es-un-cursor-valido")).statusCode).toBe(400);
    });

    it("el listado omite los campos pesados; el detalle los incluye", async () => {
      const item = json(await get("/beaches")).data[0];
      expect(item).not.toHaveProperty("description");
      expect(item).not.toHaveProperty("gallery");
      expect(item).toHaveProperty("short_description");
      expect(json(await get("/beaches/playa-bavaro")).data.description).toBe("Descripción larga de Bávaro");
    });

    it("fields devuelve sólo lo pedido (más id) y permite pedir el SEO", async () => {
      const item = json(await get("/beaches?fields=name,rating")).data[0];
      expect(Object.keys(item).sort()).toEqual(["id", "name", "rating"]);
      expect(json(await get("/beaches?fields=name,seo")).data[0]).toHaveProperty("seo");
      expect((await get("/beaches?fields=name,password")).statusCode).toBe(400);
      // `fields=*` entrega en el listado todas las columnas públicas, como el detalle.
      const full = json(await get("/beaches?fields=*")).data[0];
      for (const column of ["name", "description", "gallery", "seo"]) expect(full).toHaveProperty(column);
      expect(full).not.toHaveProperty("created_by");
      expect((await get("/beaches?fields=*,password")).statusCode).toBe(400);
    });

    it("include resuelve relaciones (destino y provincia) en una sola llamada", async () => {
      const list = json(await get("/beaches?include=destination,province&sort=name")).data;
      expect(list[0]).toMatchObject({ name: "Playa Bávaro", destination: { slug: "punta-cana", name: "Punta Cana" }, province: { slug: "la-altagracia" } });
      expect(Object.keys(list[0].destination).sort()).toEqual(["id", "name", "slug"]);
      const one = json(await get("/beaches/playa-rincon?include=destination&fields=name")).data;
      expect(one.destination.slug).toBe("samana-destino");
      expect((await get("/beaches?include=galaxia")).statusCode).toBe(400);
    });

    it("busca sin distinguir acentos ni mayúsculas y trata % y _ como texto literal", async () => {
      expect(slugs(await get("/beaches?q=BAVARO"))).toEqual(["playa-bavaro"]);
      expect(slugs(await get("/beaches?q=rincon"))).toEqual(["playa-rincon"]);
      expect(slugs(await get("/beaches?q=surfistas"))).toEqual(["playa-macao"]); // en short_description
      expect(json(await get(`/beaches?q=${encodeURIComponent("%")}`)).data).toEqual([]);
      expect(json(await get(`/beaches?q=${encodeURIComponent("Playa_")}`)).data).toEqual([]);
    });

    it("es inmune a la inyección SQL en q, filtros y orden", async () => {
      const evil = encodeURIComponent("'; DROP TABLE beaches; --");
      for (const url of [`/beaches?q=${evil}`, `/beaches?filter[beach_type]=${evil}`]) expect((await get(url)).statusCode).toBe(200);
      expect((await get(`/beaches?sort=${evil}`)).statusCode).toBe(400);
      expect(json(await get("/beaches")).meta.total).toBe(3);
    });
  });

  describe("filtros", () => {
    it("igualdad de texto sin acentos, uuid, booleano y lista 'cualquiera de'", async () => {
      expect(slugs(await get("/beaches?filter[beach_type]=ARENA-BLANCA&sort=name"))).toEqual(["playa-bavaro", "playa-rincon"]);
      expect(slugs(await get("/beaches?filter[destination_id]=d1000000-0000-4000-8000-000000000002"))).toEqual(["playa-rincon"]);
      expect(slugs(await get("/beaches?filter[parking_available]=true&sort=name"))).toEqual(["playa-bavaro", "playa-rincon"]);
      expect(slugs(await get("/beaches?filter[wave_intensity]=calma,fuerte&sort=name"))).toEqual(["playa-bavaro", "playa-macao"]);
    });

    it("rangos numéricos y de fecha", async () => {
      expect(slugs(await get("/beaches?filter[rating][gte]=4.5&sort=name"))).toEqual(["playa-bavaro", "playa-rincon"]);
      expect(slugs(await get("/beaches?filter[rating][lt]=4.5"))).toEqual(["playa-macao"]);
      expect(slugs(await get("/beaches?filter[rating][gte]=4&filter[rating][lte]=4.8&sort=name"))).toEqual(["playa-bavaro", "playa-macao"]);
      expect(slugs(await get("/hotels?filter[stars]=4,5&sort=name"))).toEqual(["hotel-caribe", "hotel-malecon"]);
      expect(slugs(await get("/events?filter[start_date][gte]=2026-09-01"))).toEqual(["festival-del-merengue", "carnaval"]);
    });

    it("listas JSON y arreglos: coincide con cualquiera de los valores", async () => {
      expect(slugs(await get("/hotels?filter[amenities]=spa&sort=name"))).toEqual(["hotel-caribe"]);
      expect(slugs(await get("/hotels?filter[amenities]=pool,wifi&sort=name"))).toEqual(["hostal-sol", "hotel-caribe", "hotel-malecon"]);
      expect(slugs(await get("/restaurants?filter[cuisine_type]=mariscos&sort=name"))).toEqual(["la-terraza", "mar-y-sol"]);
      expect(slugs(await get("/tour-guides?filter[languages]=fr"))).toEqual(["ana"]);
      expect(slugs(await get("/articles?filter[tags]=guia"))).toEqual(["guia-de-playas"]);
    });

    it("combina filtros y búsqueda con AND", async () => {
      expect(slugs(await get("/beaches?filter[beach_type]=arena-blanca&filter[is_featured]=true&filter[rating][gte]=4.85"))).toEqual(["playa-rincon"]);
      expect(slugs(await get("/hotels?q=hotel&filter[stars][gte]=4&filter[amenities]=pool&sort=name"))).toEqual(["hotel-caribe", "hotel-malecon"]);
    });

    it("rechaza parámetros y valores no válidos con 400", async () => {
      const bad = [
        "/beaches?filter[password]=x", "/beaches?filter[beach_type][gte]=a", "/beaches?filter[rating][gte]=abc",
        "/beaches?filter[destination_id]=no-es-uuid", "/beaches?filter[parking_available]=quizas", "/events?filter[start_date]=ayer",
        "/beaches?colores=rojo", "/beaches?page=0", "/beaches?per_page=500", "/beaches?sort=color", "/beaches?filter[beach_type]=",
        "/beaches?filter[beach_type]=a&filter[beach_type]=b", "/beaches?lang=xx",
      ];
      for (const url of bad) {
        const res = await get(url);
        expect(res.statusCode, url).toBe(400);
        expect(json(res).error.code, url).toBe("VALIDATION_ERROR");
      }
    });

    it("ordena ascendente y descendente con nulos al final", async () => {
      expect(names(await get("/beaches?sort=-rating"))).toEqual(["Playa Rincón", "Playa Bávaro", "Playa Macao"]);
      expect(names(await get("/beaches?sort=rating"))).toEqual(["Playa Macao", "Playa Bávaro", "Playa Rincón"]);
      expect(names(await get("/beaches?sort=-review_count,name"))).toEqual(["Playa Rincón", "Playa Bávaro", "Playa Macao"]);
    });
  });

  describe("cercanía", () => {
    it("near filtra por radio, ordena por distancia y devuelve distance_m", async () => {
      const res = json(await get("/beaches?near=18.68,-68.42&radius=20000"));
      expect(res.data.map((x: { slug: string }) => x.slug)).toEqual(["playa-bavaro", "playa-macao"]);
      expect(res.data[0].distance_m).toBeLessThan(res.data[1].distance_m);
      expect(res.data[0].distance_m).toBeLessThan(500);
      const wide = json(await get("/beaches?near=18.68,-68.42&radius=200000"));
      expect(wide.data).toHaveLength(3);
      expect((await get("/beaches?near=18.68,-68.42&radius=1")).statusCode).toBe(200);
    });

    it("valida near y radius", async () => {
      for (const url of ["/beaches?near=abc", "/beaches?near=95,10", "/beaches?near=18,-68&radius=0", "/beaches?near=18,-68&radius=999999", "/beaches?radius=100", "/provinces?near=18,-68"]) {
        expect((await get(url)).statusCode, url).toBe(400);
      }
    });
  });

  describe("facetas", () => {
    it("cuenta por valor y ordena por frecuencia", async () => {
      const f = json(await get("/beaches/facets?fields=beach_type,is_featured")).data;
      expect(f.beach_type).toEqual([{ value: "arena-blanca", count: 2 }, { value: "salvaje", count: 1 }]);
      expect(f.is_featured).toEqual(expect.arrayContaining([{ value: "true", count: 2 }, { value: "false", count: 1 }]));
    });

    it("respeta los demás filtros pero no el de la propia faceta", async () => {
      const f = json(await get("/beaches/facets?fields=beach_type,wave_intensity&filter[beach_type]=salvaje")).data;
      expect(f.beach_type).toHaveLength(2); // sigue mostrando las alternativas de su propio campo
      expect(f.wave_intensity).toEqual([{ value: "fuerte", count: 1 }]);
    });

    it("cuenta elementos de listas JSON", async () => {
      const f = json(await get("/restaurants/facets?fields=cuisine_type")).data.cuisine_type;
      expect(f).toEqual([{ value: "mariscos", count: 2 }, { value: "criolla", count: 1 }, { value: "italiana", count: 1 }]);
      expect(json(await get("/hotels/facets?fields=amenities")).data.amenities[0]).toEqual({ value: "pool", count: 2 });
    });

    it("valida los campos pedidos y devuelve el total", async () => {
      expect((await get("/beaches/facets?fields=rating")).statusCode).toBe(400);
      expect((await get("/beaches/facets?fields=password")).statusCode).toBe(400);
      expect(json(await get("/beaches/facets?filter[beach_type]=salvaje")).meta.total).toBe(1);
    });
  });

  describe("detalle", () => {
    it("por slug y por uuid; 404 uniforme para lo inexistente o no visible", async () => {
      expect(json(await get("/beaches/playa-bavaro")).data).toMatchObject({ name: "Playa Bávaro", rating: 4.8, review_count: 120, beach_type: "arena-blanca" });
      expect(json(await get("/beaches/b1000000-0000-4000-8000-000000000001")).data.slug).toBe("playa-bavaro");
      for (const k of ["nada", "b1000000-0000-4000-8000-000000000099", "b1000000-0000-4000-8000-000000000005"]) {
        const res = await get(`/beaches/${k}`);
        expect(res.statusCode, k).toBe(404);
        expect(json(res).error.code).toBe("NOT_FOUND");
      }
    });

    it("traduce campos con ?lang= y con Accept-Language", async () => {
      expect(json(await get("/beaches/playa-bavaro?lang=en")).data).toMatchObject({ name: "Bavaro Beach", short_description: "Long white sand beach", description: "Descripción larga de Bávaro" });
      expect(json(await get("/beaches/playa-bavaro", { "accept-language": "en-US,en;q=0.8" })).data.name).toBe("Bavaro Beach");
      expect(json(await get("/beaches/playa-macao?lang=en")).data.name).toBe("Playa Macao");
      const list = json(await get("/beaches?lang=en&sort=name"));
      expect(list.data.map((b: { name: string }) => b.name)).toEqual(["Bavaro Beach", "Playa Macao", "Playa Rincón"]);
      expect(list.meta).toMatchObject({ locale: "en", fallback_locale: "es" });
    });

    it("tiene ETag y responde 304", async () => {
      const first = await get("/beaches/playa-bavaro");
      expect(first.headers["cache-control"]).toContain("s-maxage=300");
      const again = await get("/beaches/playa-bavaro", { "if-none-match": first.headers.etag as string });
      expect(again.statusCode).toBe(304);
    });
  });

  describe("relacionados y cercanos", () => {
    it("related: mismo destino, sin el propio elemento, destacados primero", async () => {
      const res = await get("/beaches/playa-bavaro/related");
      expect(slugs(res)).toEqual(["playa-rincon", "playa-macao"]); // mismo tipo de playa (Rincón, destacada) o mismo destino/provincia (Macao)
      expect(slugs(await get("/beaches/playa-rincon/related"))).toEqual(["playa-bavaro"]); // mismo beach_type
      expect((await get("/beaches/no-existe/related")).statusCode).toBe(404);
      expect(json(await get("/beaches/playa-bavaro/related?limit=1")).data).toHaveLength(1);
    });

    it("nearby: agrupa otras colecciones dentro del radio, sin incluir el propio elemento", async () => {
      const res = json(await get("/beaches/playa-bavaro/nearby?radius=5000"));
      expect(res.meta).toMatchObject({ radius: 5000, center: { lat: 18.68, lng: -68.42 } });
      expect(res.data.hotels.map((h: { slug: string }) => h.slug)).toEqual(["hotel-caribe"]);
      expect(res.data.restaurants.map((h: { slug: string }) => h.slug)).toEqual(["la-terraza"]);
      expect(res.data.beaches).toEqual([]); // Macao queda fuera de 5 km y Bávaro no se lista a sí misma
      expect(res.data.hotels[0].distance_m).toBeLessThan(500);
      const only = json(await get("/beaches/playa-bavaro/nearby?types=beaches&radius=20000"));
      expect(Object.keys(only.data)).toEqual(["beaches"]);
      expect(only.data.beaches.map((b: { slug: string }) => b.slug)).toEqual(["playa-macao"]);
    });

    it("nearby valida tipos y radio", async () => {
      expect((await get("/beaches/playa-bavaro/nearby?types=provinces")).statusCode).toBe(400);
      expect((await get("/beaches/playa-bavaro/nearby?radius=0")).statusCode).toBe(400);
      expect((await get("/beaches/no-existe/nearby")).statusCode).toBe(404);
    });
  });

  describe("reseñas", () => {
    it("sólo las aprobadas de esa entidad, con resumen y autor abreviado", async () => {
      const res = json(await get("/beaches/playa-bavaro/reviews"));
      expect(res.data.map((r: { comment: string }) => r.comment)).toEqual(["Regular", "Muy buena", "Increíble", "Espectacular"]);
      expect(res.meta.summary).toEqual({ average: 4.25, count: 4, distribution: { "1": 0, "2": 0, "3": 1, "4": 1, "5": 2 } });
      const authors = res.data.map((r: { author: string }) => r.author);
      expect(authors).toContain("Ana P.");
      expect(authors).toContain("Viajero"); // perfil sin nombre
      expect(JSON.stringify(res)).not.toMatch(/Gómez|@|user_id/); // no se filtran apellidos ni identificadores
    });

    it("pagina y devuelve un resumen vacío cuando no hay reseñas", async () => {
      const p = json(await get("/beaches/playa-bavaro/reviews?per_page=2&page=2"));
      expect(p.data).toHaveLength(2);
      expect(p.meta).toMatchObject({ page: 2, per_page: 2, total: 4, total_pages: 2 });
      const none = json(await get("/beaches/playa-macao/reviews"));
      expect(none.data).toEqual([]);
      expect(none.meta.summary).toEqual({ average: null, count: 0, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } });
      expect((await get("/beaches/no-existe/reviews")).statusCode).toBe(404);
    });
  });

  it("humo: todas las colecciones responden en listado, facetas, detalle, relacionados, cercanos y reseñas sin errores SQL", async () => {
    for (const d of COLLECTIONS) {
      const list = await get(`/${d.path}?per_page=5&q=a`);
      expect(list.statusCode, `${d.path} list: ${list.body.slice(0, 200)}`).toBe(200);
      const facets = await get(`/${d.path}/facets`);
      expect([200, 404], `${d.path} facets`).toContain(facets.statusCode);
      if (facets.statusCode === 200) expect(json(facets)).toHaveProperty("data");
      expect((await get(`/${d.path}/no-existe`)).statusCode, `${d.path} detail`).toBe(404);
      if (d.related.length) expect((await get(`/${d.path}/no-existe/related`)).statusCode, `${d.path} related`).toBe(404);
      if (d.geo) {
        expect((await get(`/${d.path}/no-existe/nearby`)).statusCode, `${d.path} nearby`).toBe(404);
        const near = await get(`/${d.path}?near=18.5,-69.9&radius=50000&per_page=3`);
        expect(near.statusCode, `${d.path} near: ${near.body.slice(0, 200)}`).toBe(200);
      }
      if (d.reviewable) expect((await get(`/${d.path}/no-existe/reviews`)).statusCode, `${d.path} reviews`).toBe(404);
      for (const [c, kind] of Object.entries(d.filters).slice(0, 3)) {
        const type = manifest[d.table]![c]!.type;
        const val = type === "uuid" ? "d1000000-0000-4000-8000-000000000001" : type === "boolean" ? "true" : type === "integer" || type === "numeric" ? "1" : type === "date" ? "2026-01-01" : "x";
        const url = kind === "range" ? `/${d.path}?filter[${c}][gte]=${val}` : `/${d.path}?filter[${c}]=${val}`;
        const f = await get(url);
        expect(f.statusCode, `${d.path} filter ${c}: ${f.body.slice(0, 200)}`).toBe(200);
      }
    }
  });

  describe("colecciones nuevas y contrato", () => {
    it("mountains (colección nueva) responde con filtros por altitud y dificultad", async () => {
      expect(slugs(await get("/mountains"))).toEqual(["pico-duarte"]);
      expect(slugs(await get("/mountains?filter[altitude_m][gte]=3000&filter[difficulty]=experto"))).toEqual(["pico-duarte"]);
      expect(json(await get("/mountains/pico-duarte?include=province")).data.province.slug).toBe("santiago");
    });

    it("los eventos se ordenan por fecha de inicio", async () => {
      expect(slugs(await get("/events"))).toEqual(["feria-pasada", "festival-del-merengue", "carnaval"]);
    });

    it("el contrato OpenAPI describe cada colección con su esquema y parámetros", async () => {
      const spec = json(await app.inject({ url: "/openapi.json" }));
      const paths = Object.keys(spec.paths);
      expect(paths.length).toBeGreaterThan(200);
      for (const p of ["/api/v1/beaches", "/api/v1/beaches/facets", "/api/v1/beaches/{idOrSlug}/nearby", "/api/v1/hotels/{idOrSlug}/reviews", "/api/v1/mountains", "/api/v1/tours", "/api/v1/job-vacancies"]) expect(paths, p).toContain(p);
      const params = spec.paths["/api/v1/beaches"].get.parameters.map((x: { name: string }) => x.name);
      expect(params).toEqual(expect.arrayContaining(["filter[beach_type]", "filter[rating][gte]", "near", "radius", "include", "sort"]));
      expect(BY_PATH.get("tours")!.table).toBe("tour_packages");
    });
  });
});
