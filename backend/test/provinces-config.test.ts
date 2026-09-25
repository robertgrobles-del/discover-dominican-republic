import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

describe("GET /api/v1/config", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  beforeAll(async () => { app = await makeApp({ DEFAULT_USD_DOP: "59.8", FEATURE_CHECKOUT: "false" }); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.query("DELETE FROM exchange_rates"); await pool.end(); await app.close(); });

  it("devuelve idiomas, monedas y banderas de funciones", async () => {
    const res = await app.inject({ url: "/api/v1/config" });
    expect(res.statusCode).toBe(200);
    const { data } = json(res);
    expect(data.locales.map((l: { code: string }) => l.code)).toEqual(["es", "en", "fr", "de", "pt", "it"]);
    expect(data.locales.find((l: { default: boolean }) => l.default).code).toBe("es");
    expect(data.currencies).toEqual(["USD", "DOP"]);
    expect(data.features).toMatchObject({ checkout: false, operators: true });
    expect(data.api.base_url).toMatch(/\/api\/v1$/);
  });

  it("usa la tasa de respaldo y luego la de exchange_rates cuando existe", async () => {
    expect(json(await app.inject({ url: "/api/v1/config?x=1" })).data.usd_dop).toEqual({ rate: 59.8, source: "default", rate_date: null });
    await pool.query("INSERT INTO exchange_rates (rate_date, currency_code, buy_rate, sell_rate) VALUES ('2026-09-24','USD',59.10,60.25),('2026-09-25','USD',59.20,60.40)");
    const { data } = json(await app.inject({ url: "/api/v1/config?x=2" }));
    expect(data.usd_dop).toEqual({ rate: 60.4, source: "exchange_rates", rate_date: "2026-09-25" });
  });

  it("es cacheable: ETag y 304 con If-None-Match", async () => {
    const first = await app.inject({ url: "/api/v1/config?x=3" });
    expect(first.headers["cache-control"]).toContain("public");
    const etag = first.headers.etag as string;
    expect(etag).toMatch(/^W\//);
    const second = await app.inject({ url: "/api/v1/config?x=3", headers: { "if-none-match": etag } });
    expect(second.statusCode).toBe(304);
    expect(second.body).toBe("");
  });
});

describe("provincias (contenido CMS público)", () => {
  let app: FastifyInstance;
  beforeAll(async () => { app = await makeApp(); });
  afterAll(async () => { await app.close(); });

  it("lista sólo las publicadas y no eliminadas, ordenadas por nombre", async () => {
    const res = await app.inject({ url: "/api/v1/provinces" });
    expect(res.statusCode).toBe(200);
    const body = json(res);
    expect(body.data.map((p: { slug: string }) => p.slug)).toEqual(["la-altagracia", "samana", "santiago"]);
    expect(body.meta).toMatchObject({ page: 1, per_page: 24, total: 3, total_pages: 1, locale: "es" });
    expect(body.data[0]).toHaveProperty("seo");
  });

  it("pagina y ordena en sentido inverso", async () => {
    const res = await app.inject({ url: "/api/v1/provinces?per_page=2&page=2&sort=-name" });
    const body = json(res);
    expect(body.data.map((p: { slug: string }) => p.slug)).toEqual(["la-altagracia"]);
    expect(body.meta).toMatchObject({ page: 2, per_page: 2, total: 3, total_pages: 2 });
  });

  it("filtra por región y busca sin distinguir acentos", async () => {
    expect(json(await app.inject({ url: "/api/v1/provinces?filter[region]=este" })).data.map((p: { slug: string }) => p.slug)).toEqual(["la-altagracia"]);
    expect(json(await app.inject({ url: "/api/v1/provinces?q=samana" })).data.map((p: { slug: string }) => p.slug)).toEqual(["samana"]);
    expect(json(await app.inject({ url: "/api/v1/provinces?q=ballenas" })).meta.total).toBe(1);
    expect(json(await app.inject({ url: "/api/v1/provinces?q=zzzz" })).data).toEqual([]);
  });

  it("valida los parámetros con errores 400 uniformes", async () => {
    for (const url of ["/api/v1/provinces?per_page=101", "/api/v1/provinces?page=0", "/api/v1/provinces?lang=xx", "/api/v1/provinces?sort=password", "/api/v1/provinces?sort=-drop_table"]) {
      const res = await app.inject({ url });
      expect(res.statusCode, url).toBe(400);
      expect(json(res).error.code).toBe("VALIDATION_ERROR");
      expect(json(res).error.request_id).toBeTruthy();
    }
  });

  it("no es vulnerable a inyección SQL en q ni en filtros", async () => {
    const evil = encodeURIComponent("'; DROP TABLE provinces; --");
    expect((await app.inject({ url: `/api/v1/provinces?q=${evil}` })).statusCode).toBe(200);
    expect((await app.inject({ url: `/api/v1/provinces?filter[region]=${evil}` })).statusCode).toBe(200);
    expect(json(await app.inject({ url: "/api/v1/provinces" })).meta.total).toBe(3);
  });

  it("traduce con ?lang= o Accept-Language y avisa del idioma de respaldo", async () => {
    const en = json(await app.inject({ url: "/api/v1/provinces?lang=en" }));
    const samana = en.data.find((p: { slug: string }) => p.slug === "samana");
    expect(samana).toMatchObject({ name: "Samana", description: "Peninsula of beaches and whales" });
    expect(en.meta).toMatchObject({ locale: "en", fallback_locale: "es" }); // otras provincias aún sin traducir
    const header = await app.inject({ url: "/api/v1/provinces/samana", headers: { "accept-language": "en-US,en;q=0.9" } });
    expect(json(header).data.name).toBe("Samana");
    expect(header.headers["content-language"]).toBe("en");
    const fallback = json(await app.inject({ url: "/api/v1/provinces/santiago?lang=fr" }));
    expect(fallback.data.name).toBe("Santiago");
  });

  it("detalle por slug y por id; 404 para borradores, eliminadas e inexistentes", async () => {
    const bySlug = json(await app.inject({ url: "/api/v1/provinces/samana" }));
    expect(bySlug.data).toMatchObject({ name: "Samaná", region: "Noreste", slug: "samana" });
    const byId = json(await app.inject({ url: "/api/v1/provinces/11111111-1111-4111-8111-111111111111" }));
    expect(byId.data.slug).toBe("samana");
    for (const id of ["borrador", "eliminada", "no-existe", "44444444-4444-4444-8444-444444444444"]) {
      const res = await app.inject({ url: `/api/v1/provinces/${id}` });
      expect(res.statusCode, id).toBe(404);
      expect(json(res).error.code).toBe("NOT_FOUND");
    }
  });

  it("las respuestas públicas son cacheables", async () => {
    const res = await app.inject({ url: "/api/v1/provinces/samana" });
    expect(res.headers["cache-control"]).toContain("s-maxage=300");
    expect(res.headers.etag).toBeDefined();
  });
});
