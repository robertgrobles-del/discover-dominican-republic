import type { FastifyInstance } from "fastify";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { BookingPaymentsPort, OrderPaymentsPort, PaymentGateway } from "../../contracts/payments.js";
import { verifyStripeSignature } from "../../lib/stripe-signature.js";
import { audit } from "../../lib/audit.js";

type StripeEvent = { id: string; type: string; data: { object: Record<string, any> } };
const cents = (n: unknown) => Math.round(Number(n ?? 0)) / 100;

/**
 * Concilia los eventos de la pasarela con nuestros libros. El cobro directo ya se registra en la respuesta de `charge()`;
 * el webhook cubre lo que esa respuesta no pudo garantizar: el proceso cayó tras cobrar, hubo un corte de red, o alguien
 * reembolsó desde el panel del proveedor. Cada evento se procesa una sola vez (`payment_events`) y el registro es idempotente.
 */
export class PaymentReconciler {
  constructor(private readonly db: Db, private readonly bookings: BookingPaymentsPort, private readonly gateway: PaymentGateway, private readonly store: OrderPaymentsPort, private readonly marketplace: OrderPaymentsPort) {}

  /** Devuelve el resultado del procesamiento; lanza si falla para que el proveedor reintente. */
  async handle(provider: string, event: StripeEvent): Promise<string> {
    const ins = await this.db.query("INSERT INTO payment_events (provider, id, type, payload) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING", [provider, event.id, event.type, JSON.stringify(event)]);
    if (!ins.rowCount) {
      const seen = (await this.db.query("SELECT processed_at, outcome FROM payment_events WHERE provider = $1 AND id = $2", [provider, event.id])).rows[0];
      if (seen?.processed_at) return "duplicate"; // ya procesado; un evento con error previo sí se reintenta
    }
    try {
      const outcome = await this.process(provider, event);
      await this.db.query("UPDATE payment_events SET processed_at = now(), outcome = $3, error = NULL WHERE provider = $1 AND id = $2", [provider, event.id, outcome]);
      return outcome;
    } catch (e) {
      await this.db.query("UPDATE payment_events SET error = $3 WHERE provider = $1 AND id = $2", [provider, event.id, String((e as Error).message).slice(0, 500)]);
      throw e;
    }
  }

  private async process(provider: string, event: StripeEvent): Promise<string> {
    const o = event.data.object;
    switch (event.type) {
      case "payment_intent.succeeded": return this.paymentSucceeded(provider, o);
      case "charge.refunded": return this.chargeRefunded(provider, o);
      case "charge.dispute.created": {
        const pay = await this.db.query<{ booking_id: string; org_id: string }>("SELECT p.booking_id, b.org_id FROM booking_payments p JOIN bookings b ON b.id = p.booking_id WHERE p.provider = $1 AND p.provider_ref = $2", [provider, o.payment_intent]);
        await audit(this.db, { action: "payment.dispute", entity: "booking", id: pay.rows[0]?.booking_id ?? null, org: pay.rows[0]?.org_id ?? null, meta: { provider, dispute: o.id, amount: cents(o.amount), reason: o.reason } });
        return "dispute_logged";
      }
      default: return "ignored";
    }
  }

  private async paymentSucceeded(provider: string, pi: Record<string, any>): Promise<string> {
    if (pi.metadata?.order_id) return this.storePaymentSucceeded(provider, pi);
    if (pi.metadata?.mp_order_id) return this.marketplacePaymentSucceeded(provider, pi);
    const bookingId: string | undefined = pi.metadata?.booking_id;
    const kind = ["full", "deposit", "balance"].includes(pi.metadata?.kind) ? pi.metadata.kind : "full";
    if (!bookingId) return "ignored_no_booking";
    if ((await this.db.query("SELECT 1 FROM booking_payments WHERE provider = $1 AND provider_ref = $2", [provider, pi.id])).rowCount) return "already_recorded";
    const b = (await this.db.query<{ status: string; currency: string }>("SELECT status, currency FROM bookings WHERE id = $1", [bookingId])).rows[0];
    if (!b) return "ignored_unknown_booking";
    const amount = cents(pi.amount_received ?? pi.amount);
    const currency = String(pi.currency ?? b.currency).toUpperCase();

    if (b.status === "cancelled") {
      // Cobrada pero la reserva ya no existe (se abandonó tras un corte): se registra y se devuelve todo, sin dejar dinero retenido.
      await this.bookings.recordOnlinePayment(bookingId, { kind, amount, currency, provider, ref: pi.id });
      const refund = await this.gateway.refund({ providerRef: pi.id, amount, currency, reference: `orphan:${bookingId}`, idempotencyKey: `${bookingId}:orphan:${pi.id}` });
      if (!refund.ok) throw new AppError("UPSTREAM_ERROR", `No se pudo reembolsar el cobro huérfano ${pi.id}: ${refund.reason}`);
      await this.bookings.recordExternalRefund(bookingId, { amount, currency, provider, ref: refund.providerRef });
      await audit(this.db, { action: "payment.orphan_refunded", entity: "booking", id: bookingId, meta: { provider, payment_intent: pi.id, amount } });
      return "orphan_refunded";
    }
    const r = await this.bookings.recordOnlinePayment(bookingId, { kind, amount, currency, provider, ref: pi.id });
    return r === "recorded" ? "reconciled" : "already_recorded";
  }

  /** Cobros de pedidos de la tienda: misma conciliación que las reservas (se anota lo que falte y se devuelve lo huérfano). */
  private async storePaymentSucceeded(provider: string, pi: Record<string, any>): Promise<string> {
    const orderId: string = pi.metadata.order_id;
    if ((await this.db.query("SELECT 1 FROM store_payments WHERE provider = $1 AND provider_ref = $2", [provider, pi.id])).rowCount) return "already_recorded";
    const o = (await this.db.query<{ status: string; total: string }>("SELECT status, total FROM store_orders WHERE id = $1", [orderId])).rows[0];
    if (!o) return "ignored_unknown_order";
    const charged = cents(pi.amount_received ?? pi.amount), currency = String(pi.currency ?? "usd").toUpperCase();
    const amount = Number(o.total);
    if (o.status === "cancelled") {
      await this.store.recordPayment(orderId, { amount, chargedAmount: charged, chargedCurrency: currency, provider, ref: pi.id });
      const refund = await this.gateway.refund({ providerRef: pi.id, amount: charged, currency, reference: `orphan:${orderId}`, idempotencyKey: `${orderId}:orphan:${pi.id}` });
      if (!refund.ok) throw new AppError("UPSTREAM_ERROR", `No se pudo reembolsar el cobro huérfano ${pi.id}: ${refund.reason}`);
      await this.store.recordExternalRefund(orderId, { amount, provider, ref: refund.providerRef });
      await audit(this.db, { action: "payment.orphan_refunded", entity: "store_order", id: orderId, meta: { provider, payment_intent: pi.id, amount: charged } });
      return "orphan_refunded";
    }
    return (await this.store.recordPayment(orderId, { amount, chargedAmount: charged, chargedCurrency: currency, provider, ref: pi.id })) === "recorded" ? "reconciled" : "already_recorded";
  }

  /** Cobros de pedidos del marketplace: se anota lo que falte y se devuelve lo huérfano. */
  private async marketplacePaymentSucceeded(provider: string, pi: Record<string, any>): Promise<string> {
    const orderId: string = pi.metadata.mp_order_id;
    if ((await this.db.query("SELECT 1 FROM marketplace_payments WHERE provider = $1 AND provider_ref = $2", [provider, pi.id])).rowCount) return "already_recorded";
    const o = await this.marketplace.orderStatus(orderId);
    if (!o) return "ignored_unknown_order";
    const charged = cents(pi.amount_received ?? pi.amount), currency = String(pi.currency ?? "usd").toUpperCase();
    const amount = Number(o.total);
    if (o.status === "cancelled") {
      await this.marketplace.recordPayment(orderId, { amount, chargedAmount: charged, chargedCurrency: currency, provider, ref: pi.id });
      const refund = await this.gateway.refund({ providerRef: pi.id, amount: charged, currency, reference: `orphan:${orderId}`, idempotencyKey: `${orderId}:orphan:${pi.id}` });
      if (!refund.ok) throw new AppError("UPSTREAM_ERROR", `No se pudo reembolsar el cobro huérfano ${pi.id}: ${refund.reason}`);
      await this.marketplace.recordExternalRefund(orderId, { amount, provider, ref: refund.providerRef });
      await audit(this.db, { action: "payment.orphan_refunded", entity: "marketplace_order", id: orderId, meta: { provider, payment_intent: pi.id, amount: charged } });
      return "orphan_refunded";
    }
    return (await this.marketplace.recordPayment(orderId, { amount, chargedAmount: charged, chargedCurrency: currency, provider, ref: pi.id })) === "recorded" ? "reconciled" : "already_recorded";
  }

  /** Reembolsos hechos en el panel del proveedor: se registra sólo la diferencia con lo que ya tenemos anotado. */
  private async chargeRefunded(provider: string, ch: Record<string, any>): Promise<string> {
    const pay = (await this.db.query<{ booking_id: string; currency: string }>("SELECT booking_id, currency FROM booking_payments WHERE provider = $1 AND provider_ref = $2 AND kind <> 'refund'", [provider, ch.payment_intent])).rows[0];
    if (!pay) return "ignored_unknown_payment";
    const refundedAtProvider = cents(ch.amount_refunded);
    const ours = Number((await this.db.query<{ n: string }>("SELECT coalesce(sum(amount), 0) AS n FROM booking_payments WHERE booking_id = $1 AND kind = 'refund' AND status = 'succeeded'", [pay.booking_id])).rows[0]!.n);
    const diff = Math.round((refundedAtProvider - ours) * 100) / 100;
    if (diff <= 0) return "already_recorded";
    await this.bookings.recordExternalRefund(pay.booking_id, { amount: diff, currency: pay.currency, provider, ref: `${ch.id}:${Math.round(refundedAtProvider * 100)}` });
    return "refund_recorded";
  }
}

/** Webhook de Stripe (docs §5.8): cuerpo crudo para verificar la firma; responde 200 sólo si el evento quedó procesado. */
export async function paymentWebhookRoutes(app: FastifyInstance) {
  const reconciler = new PaymentReconciler(app.db, app.bookings, app.gateway, app.store, app.marketplace);
  // Este plugin está encapsulado: su parser de JSON entrega el texto crudo y no afecta al resto de la API.
  app.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => done(null, body));

  app.post("/webhooks/payments/stripe", { config: { rateLimit: { max: 600, timeWindow: "1 minute" } }, schema: { tags: ["pagos"], summary: "Webhook de Stripe (firma Stripe-Signature)", hide: true } }, async (req, reply) => {
    const secret = app.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new AppError("NOT_FOUND", "Webhook no configurado");
    const raw = typeof req.body === "string" ? req.body : "";
    if (!verifyStripeSignature(raw, req.headers["stripe-signature"] as string | undefined, secret)) throw new AppError("UNAUTHENTICATED", "Firma inválida");
    let event: StripeEvent;
    try { event = JSON.parse(raw); } catch { throw AppError.validation("Cuerpo inválido"); }
    if (!event?.id || !event.type || !event.data?.object) throw AppError.validation("Evento inválido");
    const outcome = await reconciler.handle("stripe", event);
    reply.code(200);
    return { received: true, outcome };
  });
}
