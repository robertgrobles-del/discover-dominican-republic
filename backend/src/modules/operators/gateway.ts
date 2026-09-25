import type { Env } from "../../config/env.js";

export type ChargeResult = { ok: true; providerRef: string } | { ok: false; reason: string };

/**
 * Pasarela de pago (docs §5.8). El backend nunca recibe datos de tarjeta: el navegador obtiene un `payment_method_token`
 * directamente del proveedor y aquí sólo se confirma. Las implementaciones reales (Azul, CardNET, Stripe) se añaden como
 * clases con esta misma interfaz; `FakeGateway` es el simulador de desarrollo y pruebas.
 */
export interface PaymentGateway {
  readonly name: string;
  charge(input: { amount: number; currency: string; token: string; reference: string }): Promise<ChargeResult>;
  refund(input: { providerRef: string | null; amount: number; currency: string; reference: string }): Promise<ChargeResult>;
}

/**
 * Simulador: `tok_test_ok` cobra, `tok_test_declined` rechaza, `tok_test_error` falla como si el proveedor no respondiera,
 * cualquier otro token se considera inválido.
 */
export class FakeGateway implements PaymentGateway {
  readonly name = "fake";
  readonly charges: { amount: number; currency: string; reference: string; providerRef: string }[] = [];
  readonly refunds: { amount: number; providerRef: string | null }[] = [];
  private seq = 0;

  async charge(input: { amount: number; currency: string; token: string; reference: string }): Promise<ChargeResult> {
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

export function createGateway(env: Pick<Env, "PAYMENT_PROVIDER">): PaymentGateway {
  return env.PAYMENT_PROVIDER === "fake" ? new FakeGateway() : new NoGateway();
}
