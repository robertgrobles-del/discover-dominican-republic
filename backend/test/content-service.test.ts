import Fastify, { type FastifyInstance } from "fastify";
import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COLLECTIONS } from "../src/contracts/content-collections.js";
import type { ContentReaderPort } from "../src/contracts/content-reader.js";
import { HttpContentReader } from "../src/modules/content/http-reader.js";
import { contentInternalRoutes } from "../src/modules/content/internal-routes.js";
import { PostgresContentReader } from "../src/modules/content/reader.js";
import { registerErrorHandling } from "../src/plugins/errors.js";
import { json, makeApp } from "./helpers.js";

const TOKEN = "content-service-token-for-tests-0123456789";
const BEACH = "b1000000-0000-4000-8000-000000000001"; // Playa Bávaro (fixtures)
const SAMANA = "11111111-1111-4111-8111-111111111111";
const quiet = { warn: () => undefined } as never;

describe("servicio de contenido: lecturas por HTTP", () => {
  let service: FastifyInstance;
  let pool: pg.Pool;
  let url: string;
  let direct: ContentReaderPort, remote: ContentReaderPort;

  const post = (method: string, body: unknown, token = TOKEN) =>
    service.inject({ method: "POST", url: `/internal/content/read/${method}`, payload: body as object, headers: { authorization: `Bearer ${token}` } });

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    await makeApp().then((app) => app.close()); // aplica los parsers de tipos del pool, igual que services/content/server.ts
    direct = new PostgresContentReader(pool);
    service = Fastify();
    registerErrorHandling(service);
    contentInternalRoutes(service, direct, TOKEN);
    url = await service.listen({ host: "127.0.0.1", port: 0 });
    remote = new HttpContentReader(url, TOKEN, quiet);
  });
  afterAll(async () => { await service.close(); await pool.end(); });

  it("cada lectura devuelve lo mismo por HTTP que directo a PostgreSQL", async () => {
    const calls: { [M in keyof ContentReaderPort]: Parameters<ContentReaderPort[M]> } = {
      getPublicPlace: ["beach", BEACH],
      countPublicProvinces: [],
      listPublicProvinces: [],
      getPublicProvince: ["samana"],
      getPublicProvinceById: [SAMANA],
      listProvinceVerificationPoints: [SAMANA],
      findPublicCandidates: [{ paths: ["beaches", "hotels"], keywords: ["playa"], perType: 5, exclude: [BEACH], verifiedIds: [BEACH] }],
      searchPublicContent: [["beaches", "hotels", "restaurants"], "playa", 5, false],
      listPublicMapLayers: [["beaches", "hotels"]],
      listPublicMapFeatures: [["beaches"], [-70, 18, -68, 20], 50],
      findNearbyPublicPlaces: [["beaches", "hotels"], 18.68, -68.42, 10_000, 10],
      reverseGeocode: [18.68, -68.42],
      listPublicSectionItems: ["events", 5, { upcomingFrom: "2026-01-01" }],
    };
    for (const [method, args] of Object.entries(calls) as [keyof ContentReaderPort, unknown[]][]) {
      const run = (reader: ContentReaderPort) => (reader[method] as (...a: unknown[]) => Promise<unknown>).apply(reader, args);
      const expected = await run(direct);
      expect(await run(remote), method).toEqual(JSON.parse(JSON.stringify(expected ?? null)));
    }
    expect((await direct.searchPublicContent(["beaches"], "playa", 5, false)).hits.length).toBeGreaterThan(0); // la comparación no es entre vacíos
  });

  it("los argumentos opcionales omitidos y los resultados nulos sobreviven al transporte", async () => {
    expect(await remote.listPublicMapFeatures(["beaches"], undefined, 10)).toEqual(await direct.listPublicMapFeatures(["beaches"], undefined, 10));
    expect(await remote.listPublicSectionItems("beaches", 3)).toEqual(await direct.listPublicSectionItems("beaches", 3));
    expect(await remote.getPublicPlace("beach", "b1000000-0000-4000-8000-000000000005")).toBeNull(); // borrador: no es público
    expect(await remote.getPublicProvince("no-existe")).toBeNull();
  });

  it("exige el secreto de servicio", async () => {
    expect((await service.inject({ method: "POST", url: "/internal/content/read/countPublicProvinces", payload: { args: [] } })).statusCode).toBe(401);
    expect((await post("countPublicProvinces", { args: [] }, "otro-secreto-distinto-0123456789abcdef")).statusCode).toBe(401);
    await expect(new HttpContentReader(url, "secreto-equivocado-0123456789abcdefgh", quiet).countPublicProvinces()).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("rechaza lecturas desconocidas y argumentos fuera de contrato", async () => {
    expect((await post("constructor", { args: [] })).statusCode).toBe(404);
    expect((await post("dropEverything", { args: [] })).statusCode).toBe(404);
    // Los límites se interpolan en el SQL: nunca deben llegar como texto ni fuera de rango.
    expect((await post("listPublicSectionItems", { args: ["beaches", "1; DROP TABLE beaches"] })).statusCode).toBe(400);
    expect((await post("listPublicSectionItems", { args: ["beaches", 100_000] })).statusCode).toBe(400);
    expect((await post("findPublicCandidates", { args: [{ paths: ["beaches"], keywords: [], perType: "5 UNION SELECT 1" }] })).statusCode).toBe(400);
    expect((await post("findPublicCandidates", { args: [{ paths: ["beaches"], keywords: [], perType: 5, exclude: ["no-uuid"] }] })).statusCode).toBe(400);
    expect((await post("reverseGeocode", { args: [200, 0] })).statusCode).toBe(400);
    expect((await post("getPublicPlace", { args: ["beach"] })).statusCode).toBe(400);
    expect(json(await post("countPublicProvinces", {})).data).toBe(await direct.countPublicProvinces());
  });

  it("un servicio caído se traduce en SERVICE_UNAVAILABLE", async () => {
    await expect(new HttpContentReader("http://127.0.0.1:9", TOKEN, quiet, 500).countPublicProvinces()).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("content-tables.txt lista exactamente las tablas de COLLECTIONS", () => {
    const listed = readFileSync(new URL("../services/content/content-tables.txt", import.meta.url), "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#"));
    expect(listed).toEqual([...new Set(COLLECTIONS.map((c) => c.table))].sort());
  });
});
