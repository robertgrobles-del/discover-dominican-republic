import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

describe("sistema", () => {
  let app: FastifyInstance;
  beforeAll(async () => { app = await makeApp(); });
  afterAll(async () => { await app.close(); });

  it("GET /health responde ok en la raíz y en /api/v1", async () => {
    for (const url of ["/health", "/api/v1/health"]) {
      const res = await app.inject({ url });
      expect(res.statusCode).toBe(200);
      expect(json(res)).toEqual({ status: "ok" });
    }
  });

  it("GET /api/v1/health/ready confirma la base de datos", async () => {
    const res = await app.inject({ url: "/api/v1/health/ready" });
    expect(res.statusCode).toBe(200);
    expect(json(res)).toEqual({ status: "ready", checks: { database: "up" } });
  });

  it("GET /health/ready devuelve 503 si la base de datos no responde", async () => {
    const broken = await makeApp({ DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:1/nada" });
    const res = await broken.inject({ url: "/health/ready" });
    expect(res.statusCode).toBe(503);
    expect(json(res).checks.database).toBe("down");
    await broken.close();
  });

  it("GET /api/v1/version informa versión y entorno", async () => {
    const body = json((await app.inject({ url: "/api/v1/version" })));
    expect(body).toMatchObject({ name: "descubre-rd-api", environment: "test" });
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("propaga X-Request-Id y genera uno si falta", async () => {
    const a = await app.inject({ url: "/health", headers: { "x-request-id": "abc-123" } });
    expect(a.headers["x-request-id"]).toBe("abc-123");
    const b = await app.inject({ url: "/health" });
    expect(b.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("las rutas inexistentes usan el envoltorio de error con request_id", async () => {
    const res = await app.inject({ url: "/api/v1/nada" });
    expect(res.statusCode).toBe(404);
    const body = json(res);
    expect(body.error).toMatchObject({ code: "NOT_FOUND" });
    expect(body.error.request_id).toBe(res.headers["x-request-id"]);
  });

  it("aplica cabeceras de seguridad (helmet)", async () => {
    const res = await app.inject({ url: "/health" });
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("CORS: permite el origen del portal y no otros", async () => {
    const ok = await app.inject({ url: "/api/v1/version", headers: { origin: "http://localhost:8080" } });
    expect(ok.headers["access-control-allow-origin"]).toBe("http://localhost:8080");
    const bad = await app.inject({ url: "/api/v1/version", headers: { origin: "https://evil.example" } });
    expect(bad.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("limita la tasa de solicitudes por IP (429 con el envoltorio de error)", async () => {
    const limited = await makeApp({ RATE_LIMIT_MAX: "3" });
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await limited.inject({ url: "/api/v1/version" })).statusCode);
    expect(codes.slice(0, 3)).toEqual([200, 200, 200]);
    expect(codes.slice(3)).toEqual([429, 429]);
    const last = await limited.inject({ url: "/api/v1/version" });
    expect(json(last).error.code).toBe("RATE_LIMITED");
    // /health nunca se limita (balanceadores)
    expect((await limited.inject({ url: "/health" })).statusCode).toBe(200);
    await limited.close();
  });

  it("expone el contrato OpenAPI 3.1 con las rutas registradas", async () => {
    const spec = json((await app.inject({ url: "/openapi.json" })));
    expect(spec.openapi).toBe("3.1.0");
    expect(Object.keys(spec.paths)).toEqual(expect.arrayContaining(["/api/v1/provinces", "/api/v1/provinces/{idOrSlug}", "/api/v1/config", "/api/v1/health/ready"]));
  });
});
