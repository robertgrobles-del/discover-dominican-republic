import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

// Sin integración de cobro, lo que se vende no puede quedar activo: sólo el proveedor de pruebas lo permite.
describe("activaciones de pago sin cobro", () => {
  let app: FastifyInstance;
  beforeAll(async () => { app = await makeApp({ PAYMENT_PROVIDER: "none" }); });
  afterAll(async () => { await app.close(); });

  it("la emisión de seguros y la reserva de traslados responden 503 sin proveedor de cobro", async () => {
    const insurance = await app.inject({ method: "POST", url: "/api/v1/insurance/quote-and-issue", payload: { plan_tier: "basico_medico", traveler_name: "Ana Prueba", traveler_passport_or_id: "X1234567", starts_on: "2030-01-01", ends_on: "2030-01-10" } });
    expect(insurance.statusCode).toBe(503);
    expect(json(insurance).error.code).toBe("SERVICE_UNAVAILABLE");
    const transport = await app.inject({ method: "POST", url: "/api/v1/transport/book", payload: { service_type: "airport_transfer", pickup_location: "Aeropuerto PUJ", dropoff_location: "Bávaro", pickup_datetime: "2030-01-01T10:00:00Z", vehicle_category: "sedan", price: 0 } });
    expect(transport.statusCode).toBe(503);
  });
});
