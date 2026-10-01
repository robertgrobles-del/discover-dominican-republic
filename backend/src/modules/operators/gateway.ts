import type { Env } from "../../config/env.js";
import type { ChargeInput, ChargeResult, PaymentGateway, RefundInput } from "../../contracts/payments.js";

// Reexport temporal: los módulos vecinos aún pueden migrar imports sin alterar la API interna.
export type { ChargeInput, ChargeResult, PaymentGateway, RefundInput } from "../../contracts/payments.js";
export { verifyStripeSignature } from "../../lib/stripe-signature.js";

/**
 * Simulador: `tok_test_ok` cobra, `tok_test_declined` rechaza, `tok_test_error` falla como si el proveedor no respondiera,
 * cualquier otro token se considera inválido.
 */
export class FakeGateway implements PaymentGateway {
  readonly name = "fake";
  readonly charges: { amount: number; currency: string; reference: string; providerRef: string }[] = [];
  readonly refunds: { amount: number; providerRef: string | null }[] = [];
  private seq = 0;

  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (input.token === "tok_test_error") throw new Error("El proveedor de pagos no respondió");
    if (input.token === "tok_test_declined") return { ok: false, reason: "card_declined" };
    if (input.token !== "tok_test_ok") return { ok: false, reason: "invalid_token" };
    const providerRef = `fake_ch_${++this.seq}`;
    this.charges.push({ amount: input.amount, currency: input.currency, reference: input.reference, providerRef });
    return { ok: true, providerRef };
  }

  async refund(input: { providerRef: string | null; amount: number }): Promise<ChargeResult> {
    this.refunds.push({ amount: input.amount, providerRef: input.providerRef });
    return { ok: true, providerRef: `fake_re_${++this.seq}` };
  }
}

/** Sin proveedor configurado los cobros en línea se rechazan (falla cerrado); sólo se permiten reservas "pagar después". */
export class NoGateway implements PaymentGateway {
  readonly name = "none";
  async charge(): Promise<ChargeResult> { return { ok: false, reason: "no_provider" }; }
  async refund(): Promise<ChargeResult> { return { ok: false, reason: "no_provider" }; }
}

export function createGateway(env: Pick<Env, "PAYMENT_PROVIDER" | "STRIPE_SECRET_KEY">, fetchImpl?: FetchLike): PaymentGateway {
  if (env.PAYMENT_PROVIDER === "stripe") return new StripeGateway(env.STRIPE_SECRET_KEY!, fetchImpl);
  return env.PAYMENT_PROVIDER === "fake" ? new FakeGateway() : new NoGateway();
}

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body?: string; signal?: AbortSignal }) => Promise<{ status: number; json(): Promise<any> }>;

/**
 * Stripe por REST (sin SDK). El navegador crea un `PaymentMethod` (pm_…) con Stripe.js y manda ese id como token; aquí se confirma un
 * PaymentIntent sin redirecciones. Si el banco exige autenticación 3-D Secure (`requires_action`) el intento se cancela y se rechaza:
 * soportarlo requiere un flujo de cliente (client_secret) que se añade cuando el frontend esté conectado.
 * Toda llamada lleva `Idempotency-Key`, así un reintento por corte de red no cobra dos veces.
 */
export class StripeGateway implements PaymentGateway {
  readonly name = "stripe";
  constructor(private readonly secretKey: string, private readonly fetchImpl: FetchLike = fetch as unknown as FetchLike) {}

  private async post(path: string, form: Record<string, string>, idempotencyKey?: string) {
    const res = await this.fetchImpl(`https://api.stripe.com/v1${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.secretKey}`, "content-type": "application/x-www-form-urlencoded", ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) },
      body: new URLSearchParams(form).toString(),
      signal: AbortSignal.timeout(20_000),
    });
    return { status: res.status, body: await res.json() };
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    const form: Record<string, string> = {
      amount: String(Math.round(input.amount * 100)), currency: input.currency.toLowerCase(), payment_method: input.token, confirm: "true",
      "automatic_payment_methods[enabled]": "true", "automatic_payment_methods[allow_redirects]": "never", description: `Reserva ${input.reference}`,
      "metadata[reference]": input.reference,
    };
    for (const [k, v] of Object.entries(input.metadata ?? {})) form[`metadata[${k}]`] = v;
    const { status, body } = await this.post("/payment_intents", form, input.idempotencyKey);
    if (status === 402 || body?.error?.type === "card_error") return { ok: false, reason: String(body?.error?.decline_code ?? body?.error?.code ?? "card_declined") };
    if (status === 400 && body?.error?.code && /payment_method/.test(String(body.error.param ?? ""))) return { ok: false, reason: "invalid_token" };
    if (status >= 500 || status === 429 || !body?.id) throw new Error(`Stripe respondió ${status}`);
    if (body.status === "succeeded") return { ok: true, providerRef: body.id };
    // requires_action / requires_payment_method / processing: no se cobró todavía; se cancela para no dejar el intento abierto.
    await this.post(`/payment_intents/${body.id}/cancel`, {}).catch(() => undefined);
    return { ok: false, reason: body.status === "requires_action" ? "requires_action" : "not_succeeded" };
  }

  async refund(input: { providerRef: string | null; amount: number; currency: string; reference: string; idempotencyKey?: string }): Promise<ChargeResult> {
    if (!input.providerRef) return { ok: false, reason: "missing_payment_reference" };
    const { status, body } = await this.post("/refunds", { payment_intent: input.providerRef, amount: String(Math.round(input.amount * 100)), "metadata[reference]": input.reference }, input.idempotencyKey);
    if (status >= 500 || status === 429) throw new Error(`Stripe respondió ${status}`);
    if (status >= 400) return { ok: false, reason: String(body?.error?.code ?? "refund_failed") };
    return { ok: true, providerRef: body.id };
  }
}
