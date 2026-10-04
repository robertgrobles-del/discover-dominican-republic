import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { AppError } from "../src/lib/errors.js";
import type { ErrorContext } from "../src/lib/error-reporter.js";
import { json, testEnv } from "./helpers.js";

/** Qué llega al monitoreo desde una petición real: sólo lo inesperado, y sin datos de la persona. */
describe("reporte de errores de las peticiones", () => {
  let app: FastifyInstance;
  const captured: { err: unknown; ctx?: ErrorContext }[] = [];

  beforeAll(async () => {
    app = await buildApp({ env: testEnv(), errorReporter: { capture: async (err, ctx) => { captured.push({ err, ctx }); } } });
    app.get("/api/v1/__prueba/reservas/:id/falla", async () => { throw new TypeError("No se pudo leer 'total'"); });
    app.get("/api/v1/__prueba/negocio", async () => { throw AppError.validation("Fecha inválida"); });
    await app.ready();
  });
  afterAll(async () => { await app.close(); });

  it("un error inesperado responde 500 sin detalles y se reporta con la ruta declarada, no con la URL real", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/__prueba/reservas/8f14e45f/falla?correo=ana@ejemplo.do", headers: { "x-request-id": "req-prueba-1" } });
    expect(res.statusCode).toBe(500);
    expect(json(res).error).toEqual({ code: "INTERNAL", message: "Error interno", request_id: "req-prueba-1" });
    expect(captured).toHaveLength(1);
    expect((captured[0]!.err as Error).message).toBe("No se pudo leer 'total'");
    expect(captured[0]!.ctx).toMatchObject({ source: "petición", requestId: "req-prueba-1", method: "GET", route: "/api/v1/__prueba/reservas/:id/falla" });
    expect(JSON.stringify(captured[0]!.ctx)).not.toMatch(/8f14e45f|ana@ejemplo/);
  });

  it("los errores de validación, de negocio y las rutas inexistentes no llegan al monitoreo", async () => {
    expect((await app.inject({ method: "GET", url: "/api/v1/__prueba/negocio" })).statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: "/api/v1/no-existe" })).statusCode).toBe(404);
    expect((await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: "no-es-correo" } })).statusCode).toBe(400);
    expect(captured).toHaveLength(1);
  });
});
