export type ChargeResult = { ok: true; providerRef: string } | { ok: false; reason: string };

/**
 * Pasarela de pago (docs §5.8). El backend nunca recibe datos de tarjeta: el navegador obtiene un `payment_method_token`
 * directamente del proveedor y aquí sólo se confirma. Las implementaciones reales (Azul, CardNET, Stripe) se añaden como
 * clases con esta misma interfaz; `FakeGateway` es el simulador de desarrollo y pruebas.
 */
export interface ChargeInput { amount: number; currency: string; token: string; reference: string; idempotencyKey?: string; metadata?: Record<string, string> }
export interface RefundInput { providerRef: string | null; amount: number; currency: string; reference: string; idempotencyKey?: string }
export interface PaymentGateway {
  readonly name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(input: RefundInput): Promise<ChargeResult>;
}

type Recorded = Promise<"recorded" | "duplicate">;

/** Lo que la conciliación de pagos necesita del dueño de las reservas. */
export interface BookingPaymentsPort {
  recordOnlinePayment(bookingId: string, p: { kind: "full" | "deposit" | "balance"; amount: number; currency: string; provider: string; ref: string }): Recorded;
  recordExternalRefund(bookingId: string, p: { amount: number; currency: string; provider: string; ref: string }): Recorded;
}

/** Lo que la conciliación de pagos necesita del dueño de un tipo de pedido (tienda o marketplace). */
export interface OrderPaymentsPort {
  recordPayment(orderId: string, p: { amount: number; chargedAmount: number; chargedCurrency: string; provider: string; ref: string }): Recorded;
  recordExternalRefund(orderId: string, p: { amount: number; provider: string; ref: string }): Recorded;
  orderStatus(orderId: string): Promise<{ status: string; total: string } | null>;
}
