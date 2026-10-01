import { readFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import type { ChargeInput, ChargeResult, PaymentGateway, RefundInput } from "../../contracts/payments.js";
import type { FetchLike } from "./gateway.js";

/**
 * Pasarelas dominicanas. ESTADO: preliminar, sin validar. Se escribieron sin credenciales ni acceso al
 * sandbox de ningún proveedor, a partir de lo que se conoce de sus APIs públicas. Los nombres de campo,
 * rutas y códigos de respuesta deben contrastarse con la documentación y el sandbox de cada adquirente
 * antes de cobrar nada real; por eso `loadEnv` las rechaza en producción salvo confirmación explícita
 * (`PAYMENT_LOCAL_GATEWAY_VALIDATED=true`). Lo que sí es definitivo es el encaje con `PaymentGateway`:
 * el backend sólo recibe un token emitido por el proveedor, nunca datos de tarjeta.
 */

const cents = (amount: number) => String(Math.round(amount * 100));
const yyyymmdd = (d = new Date()) => d.toISOString().slice(0, 10).replaceAll("-", "");

/** `fetch` mínimo sobre TLS mutuo: Azul exige certificado de cliente además de las cabeceras de autenticación. */
export function mutualTlsFetch(certPath: string, keyPath: string): FetchLike {
  const cert = readFileSync(certPath), key = readFileSync(keyPath);
  return (url, init) => new Promise((resolve, reject) => {
    const req = httpsRequest(url, { method: init.method, headers: init.headers, cert, key, signal: init.signal }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, json: async () => JSON.parse(Buffer.concat(chunks).toString("utf8") || "null") }));
    });
    req.on("error", reject);
    if (init.body) req.write(init.body);
    req.end();
  });
}

export interface AzulConfig { baseUrl: string; merchantId: string; auth1: string; auth2: string }

/**
 * Azul (Servicios Digitales Popular), API JSON de comercio electrónico. El token es un `DataVaultToken`
 * que el comercio obtiene al tokenizar la tarjeta con Azul.
 *
 * Azul no acepta una clave de idempotencia: la referencia propia viaja en `CustomOrderId` y un reintento
 * tras un corte de red debe conciliarse consultando ese valor (pendiente de implementar con `VerifyPayment`).
 * La devolución necesita la fecha de la venta original, así que `providerRef` es `<AzulOrderId>:<AAAAMMDD>`.
 */
export class AzulGateway implements PaymentGateway {
  readonly name = "azul";
  constructor(private readonly config: AzulConfig, private readonly fetchImpl: FetchLike) {}

  private async post(payload: Record<string, string>) {
    const res = await this.fetchImpl(this.config.baseUrl, {
      method: "POST",
      headers: { "content-type": "application/json", Auth1: this.config.auth1, Auth2: this.config.auth2 },
      body: JSON.stringify({ Channel: "EC", Store: this.config.merchantId, PosInputMode: "E-Commerce", ...payload }),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.status >= 500 || res.status === 429) throw new Error(`Azul respondió ${res.status}`);
    return { status: res.status, body: await res.json() };
  }

  private result(body: any, ref: (b: any) => string): ChargeResult {
    if (body?.IsoCode === "00" && body?.AzulOrderId) return { ok: true, providerRef: ref(body) };
    if (body?.ResponseCode === "Error") return { ok: false, reason: String(body.ErrorDescription ?? "provider_error").slice(0, 80) };
    return { ok: false, reason: body?.IsoCode ? `declined_${body.IsoCode}` : "card_declined" };
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (input.currency.toUpperCase() !== "DOP") return { ok: false, reason: "unsupported_currency" };
    const { body } = await this.post({
      TrxType: "Sale", Amount: cents(input.amount), Itbis: "000", CurrencyPosCode: "$", Payments: "1", Plan: "0",
      AcquirerRefData: "1", OrderNumber: input.reference.slice(0, 15), CustomOrderId: input.idempotencyKey ?? input.reference,
      DataVaultToken: input.token, SaveToDataVault: "0",
    });
    return this.result(body, (b) => `${b.AzulOrderId}:${yyyymmdd()}`);
  }

  async refund(input: RefundInput): Promise<ChargeResult> {
    const [orderId, originalDate] = (input.providerRef ?? "").split(":");
    if (!orderId || !originalDate) return { ok: false, reason: "missing_payment_reference" };
    const { body } = await this.post({
      TrxType: "Refund", Amount: cents(input.amount), Itbis: "000", CurrencyPosCode: "$", Payments: "1", Plan: "0",
      AcquirerRefData: "1", OriginalDate: originalDate, AzulOrderId: orderId, CustomOrderId: input.idempotencyKey ?? input.reference,
    });
    return this.result(body, (b) => String(b.AzulOrderId));
  }
}

export interface CardNetConfig { baseUrl: string; privateKey: string }

/**
 * CardNET, API de tokenización. El token es el `TrxToken` de un solo uso que el navegador obtiene con el
 * formulario de CardNET. Importes en centavos; moneda DOP.
 */
export class CardNetGateway implements PaymentGateway {
  readonly name = "cardnet";
  constructor(private readonly config: CardNetConfig, private readonly fetchImpl: FetchLike = fetch as unknown as FetchLike) {}

  private async post(path: string, payload: Record<string, unknown>, idempotencyKey?: string) {
    const res = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Basic ${this.config.privateKey}`, ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.status >= 500 || res.status === 429) throw new Error(`CardNET respondió ${res.status}`);
    return { status: res.status, body: await res.json() };
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (input.currency.toUpperCase() !== "DOP") return { ok: false, reason: "unsupported_currency" };
    const { status, body } = await this.post("/api/Purchase", {
      TrxToken: input.token, Order: input.reference.slice(0, 30), Amount: Number(cents(input.amount)), Tip: 0, Currency: "DOP", Capture: true,
      DataDo: { Tax: 0, Invoice: input.reference.slice(0, 30) },
    }, input.idempotencyKey);
    const trx = body?.Response?.Transaction ?? body?.Transaction;
    const purchaseId = body?.Response?.PurchaseId ?? body?.PurchaseId;
    if (status < 300 && trx?.Status === "Approved" && purchaseId) return { ok: true, providerRef: String(purchaseId) };
    if (status === 400 && /token/i.test(String(body?.Errors?.[0]?.Message ?? ""))) return { ok: false, reason: "invalid_token" };
    return { ok: false, reason: trx?.ResponseCode ? `declined_${trx.ResponseCode}` : "card_declined" };
  }

  async refund(input: RefundInput): Promise<ChargeResult> {
    if (!input.providerRef) return { ok: false, reason: "missing_payment_reference" };
    const { status, body } = await this.post(`/api/Purchase/${encodeURIComponent(input.providerRef)}/Refund`, { Amount: Number(cents(input.amount)) }, input.idempotencyKey);
    const refundId = body?.Response?.RefundId ?? body?.RefundId ?? body?.Response?.PurchaseId;
    if (status < 300 && refundId) return { ok: true, providerRef: String(refundId) };
    return { ok: false, reason: "refund_failed" };
  }
}
