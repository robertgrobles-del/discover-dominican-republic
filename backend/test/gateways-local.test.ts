import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { createGateway, type FetchLike } from "../src/modules/operators/gateway.js";
import { AzulGateway, CardNetGateway } from "../src/modules/operators/gateway-local.js";

/**
 * Estas pruebas fijan cómo se traduce `PaymentGateway` a cada proveedor y cómo se interpretan sus respuestas
 * TAL COMO LAS ASUME EL CÓDIGO. No prueban que Azul o CardNET respondan así: eso sólo lo confirma su sandbox.
 */
const recorder = (...responses: { status: number; body: unknown }[]) => {
  const calls: { url: string; headers: Record<string, string>; body: any }[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, headers: init.headers, body: init.body ? JSON.parse(init.body) : null });
    const next = responses.shift()!;
    return { status: next.status, json: async () => next.body };
  };
  return { calls, fetchImpl };
};
const charge = { amount: 1250.5, currency: "DOP", token: "tok-proveedor", reference: "RES-2026-0001", idempotencyKey: "idem-1" };

describe("pasarela Azul (preliminar)", () => {
  const config = { baseUrl: "https://azul.test/json", merchantId: "39038540035", auth1: "a1", auth2: "a2" };

  it("cobra con el token de DataVault, en centavos y sin datos de tarjeta", async () => {
    const { calls, fetchImpl } = recorder({ status: 200, body: { IsoCode: "00", ResponseMessage: "APROBADA", AzulOrderId: "44411" } });
    const res = await new AzulGateway(config, fetchImpl).charge(charge);
    expect(res.ok && res.providerRef).toMatch(/^44411:\d{8}$/);
    expect(calls[0]!.headers).toMatchObject({ Auth1: "a1", Auth2: "a2" });
    expect(calls[0]!.body).toMatchObject({ Store: "39038540035", TrxType: "Sale", Amount: "125050", DataVaultToken: "tok-proveedor", CustomOrderId: "idem-1" });
    expect(JSON.stringify(calls[0]!.body)).not.toMatch(/CardNumber|CVC|Expiration/i);
  });

  it("distingue rechazo del emisor, error del proveedor y moneda no soportada", async () => {
    const declined = recorder({ status: 200, body: { IsoCode: "51", ResponseMessage: "DECLINADA" } });
    expect(await new AzulGateway(config, declined.fetchImpl).charge(charge)).toEqual({ ok: false, reason: "declined_51" });
    const error = recorder({ status: 200, body: { ResponseCode: "Error", ErrorDescription: "INVALID_TOKEN" } });
    expect(await new AzulGateway(config, error.fetchImpl).charge(charge)).toEqual({ ok: false, reason: "INVALID_TOKEN" });
    const usd = recorder();
    expect(await new AzulGateway(config, usd.fetchImpl).charge({ ...charge, currency: "USD" })).toEqual({ ok: false, reason: "unsupported_currency" });
    expect(usd.calls).toHaveLength(0);
  });

  it("un fallo del servidor se propaga para que la reserva no quede en estado incierto", async () => {
    const { fetchImpl } = recorder({ status: 503, body: null });
    await expect(new AzulGateway(config, fetchImpl).charge(charge)).rejects.toThrow("Azul respondió 503");
  });

  it("la devolución usa la orden y la fecha originales guardadas en la referencia", async () => {
    const { calls, fetchImpl } = recorder({ status: 200, body: { IsoCode: "00", AzulOrderId: "44999" } });
    const gateway = new AzulGateway(config, fetchImpl);
    expect(await gateway.refund({ providerRef: "44411:20261001", amount: 250, currency: "DOP", reference: "RES-2026-0001" })).toEqual({ ok: true, providerRef: "44999" });
    expect(calls[0]!.body).toMatchObject({ TrxType: "Refund", AzulOrderId: "44411", OriginalDate: "20261001", Amount: "25000" });
    expect(await gateway.refund({ providerRef: null, amount: 1, currency: "DOP", reference: "x" })).toEqual({ ok: false, reason: "missing_payment_reference" });
  });
});

describe("pasarela CardNET (preliminar)", () => {
  const config = { baseUrl: "https://cardnet.test/v1", privateKey: "llave-privada-123" };

  it("cobra con el TrxToken y envía la clave de idempotencia", async () => {
    const { calls, fetchImpl } = recorder({ status: 200, body: { Response: { PurchaseId: 9912, Transaction: { Status: "Approved", ApprovalCode: "A1" } } } });
    expect(await new CardNetGateway(config, fetchImpl).charge(charge)).toEqual({ ok: true, providerRef: "9912" });
    expect(calls[0]!.url).toBe("https://cardnet.test/v1/api/Purchase");
    expect(calls[0]!.headers).toMatchObject({ authorization: "Basic llave-privada-123", "idempotency-key": "idem-1" });
    expect(calls[0]!.body).toMatchObject({ TrxToken: "tok-proveedor", Amount: 125050, Currency: "DOP", Capture: true });
  });

  it("rechazo y devolución", async () => {
    const declined = recorder({ status: 200, body: { Response: { PurchaseId: 1, Transaction: { Status: "Rejected", ResponseCode: "05" } } } });
    expect(await new CardNetGateway(config, declined.fetchImpl).charge(charge)).toEqual({ ok: false, reason: "declined_05" });
    const refund = recorder({ status: 200, body: { Response: { RefundId: 77 } } });
    expect(await new CardNetGateway(config, refund.fetchImpl).refund({ providerRef: "9912", amount: 100, currency: "DOP", reference: "r" })).toEqual({ ok: true, providerRef: "77" });
    expect(refund.calls[0]!.url).toBe("https://cardnet.test/v1/api/Purchase/9912/Refund");
  });
});

describe("configuración de pasarelas locales", () => {
  const base = { NODE_ENV: "test", DATABASE_URL: "postgres://u:p@localhost:5432/db" };
  const env = (over: Record<string, string>) => loadEnv({ ...base, ...over } as NodeJS.ProcessEnv);

  it("exige las credenciales de cada proveedor", () => {
    expect(() => env({ PAYMENT_PROVIDER: "cardnet" })).toThrow(/CARDNET_PRIVATE_KEY/);
    expect(() => env({ PAYMENT_PROVIDER: "azul", AZUL_MERCHANT_ID: "123", AZUL_AUTH1: "abc", AZUL_AUTH2: "abc" })).toThrow(/AZUL_CERT_PATH/);
    expect(createGateway(env({ PAYMENT_PROVIDER: "cardnet", CARDNET_PRIVATE_KEY: "llave-privada-123" })).name).toBe("cardnet");
  });
});
