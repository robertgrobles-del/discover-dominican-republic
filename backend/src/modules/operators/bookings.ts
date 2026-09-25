import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { Locale } from "../../lib/i18n.js";
import type { Mailer } from "../mailer/mailer.js";
import { POLICIES, refundFor, type CancellationPolicy } from "./domain/cancellation.js";
import { addDays, isIsoDate, nightsBetween, todayInSantoDomingo } from "./domain/dates.js";
import { fromCents, toCents } from "./domain/money.js";
import type { RoomSnap } from "./domain/pricing.js";
import { computeQuote, type ListingSnap, type Quote, type QuoteRequest } from "./domain/quote.js";
import type { PaymentGateway } from "./gateway.js";
import type { PromotionService } from "./promotions.js";

export type PaymentMode = "pay_now" | "deposit" | "pay_later";
export interface BookingRequest {
  listing_id: string; room_id?: string; date: string; check_out?: string; time?: string;
  adults: number; children?: number; infants?: number; extras?: string[]; promo_code?: string;
}
export interface Contact { name: string; email: string; phone?: string }
export interface CreateInput { request: BookingRequest; contact: Contact; notes?: string; payment_mode: PaymentMode; payment_token?: string; idempotency_key?: string; locale?: Locale }
export interface Actor { userId?: string; source: "web" | "manual"; orgId?: string }

interface Loaded {
  listing: ListingSnap & { org_id: string; title: string; slug: string; status: string; cancellation_policy: CancellationPolicy; category: ListingSnap["category"] };
  room: (RoomSnap & { name: string }) | null;
  org: { id: string; business_name: string; slug: string; verification: string; email: string; commission_rate: number };
}

const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newReference = () => "DRD-" + Array.from(randomBytes(8), (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
const money = (n: number, cur: string) => `${cur === "USD" ? "US$ " : "RD$ "}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface BookingDto {
  id: string; reference: string; status: string; payment_status: string; source: string;
  listing: { id: string; title: string; category: string }; operator: { name: string; slug: string }; room_name: string | null;
  date: string; check_out: string | null; time: string | null; guests: number; adults: number; children: number; infants: number;
  currency: string; subtotal: number; discount: number; total_price: number; deposit_amount: number | null; amount_paid: number; balance_due: number; refund_amount: number;
  promo_code: string | null; extras: unknown[]; lines: unknown[]; contact: Contact; notes: string | null;
  cancellation: { policy: string; description: string; cancelled_at: string | null; cancelled_by: string | null; reason: string | null };
  review_pending: boolean; created_at: string;
}

const BOOKING_SELECT = `b.id, b.reference, b.status, b.payment_status, b.source, b.listing_id, b.listing_title, b.category, b.room_name, b.date::text AS date, b.check_out::text AS check_out, b.time, b.guests, b.adults,
  b.children, b.infants, b.currency, b.subtotal, b.discount, b.total_price, b.deposit_amount, b.amount_paid, b.refund_amount, b.promo_code, b.extras, b.quote, b.contact_name, b.contact_email,
  b.contact_phone, b.notes, b.cancellation_policy, b.cancelled_at, b.cancelled_by, b.cancel_reason, b.review_pending, b.created_at, b.org_id, b.user_id, b.access_hash, p.business_name AS org_name, p.slug AS org_slug`;

const toBookingDto = (r: Record<string, unknown>): BookingDto => {
  const total = Number(r.total_price), paid = Number(r.amount_paid), refund = Number(r.refund_amount);
  const cancelled = r.status === "cancelled";
  const policy = String(r.cancellation_policy) as CancellationPolicy;
  return {
    id: String(r.id), reference: String(r.reference), status: String(r.status), payment_status: String(r.payment_status), source: String(r.source),
    listing: { id: String(r.listing_id), title: String(r.listing_title), category: String(r.category) }, operator: { name: String(r.org_name), slug: String(r.org_slug) }, room_name: (r.room_name as string) ?? null,
    date: String(r.date), check_out: (r.check_out as string) ?? null, time: (r.time as string) ?? null, guests: Number(r.guests), adults: Number(r.adults), children: Number(r.children), infants: Number(r.infants),
    currency: String(r.currency), subtotal: Number(r.subtotal), discount: Number(r.discount), total_price: total, deposit_amount: r.deposit_amount === null ? null : Number(r.deposit_amount),
    amount_paid: paid, balance_due: cancelled ? 0 : Math.max(0, fromCents(toCents(total) - toCents(paid))), refund_amount: refund,
    promo_code: (r.promo_code as string) ?? null, extras: (r.extras as unknown[]) ?? [], lines: ((r.quote as { lines?: unknown[] })?.lines) ?? [],
    contact: { name: String(r.contact_name), email: String(r.contact_email), ...(r.contact_phone ? { phone: String(r.contact_phone) } : {}) }, notes: (r.notes as string) ?? null,
    cancellation: { policy, description: (POLICIES[policy] ?? POLICIES.flexible).description, cancelled_at: r.cancelled_at ? new Date(r.cancelled_at as string).toISOString() : null, cancelled_by: (r.cancelled_by as string) ?? null, reason: (r.cancel_reason as string) ?? null },
    review_pending: !!r.review_pending, created_at: new Date(r.created_at as string).toISOString(),
  };
};

/**
 * Motor de reservas (docs §5.8). La cotización, la disponibilidad y los cobros los decide siempre el servidor:
 * cada reserva bloquea la fila del anuncio (o de la habitación) dentro de una transacción, vuelve a calcular la ocupación
 * y sólo entonces inserta, así dos solicitudes simultáneas nunca sobrepasan los cupos.
 */
export class BookingService {
  constructor(
    private readonly db: Db, private readonly env: Env, private readonly promos: PromotionService, private readonly gateway: PaymentGateway,
    private readonly mailer: Mailer, private readonly log: FastifyBaseLogger,
  ) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK"); throw e; }
    finally { c.release(); }
  }

  // ---------- Carga y ocupación ----------
  private async load(c: Db | PoolClient, listingId: string, roomId?: string, opts: { lock?: boolean } = {}): Promise<Loaded> {
    const lock = opts.lock ? " FOR UPDATE OF l" : "";
    const { rows } = await c.query(
      `SELECT l.id, l.org_id, l.category, l.title, l.slug, l.status, l.price, l.currency, l.capacity, l.time_slots, l.deposit_percent, l.child_price, l.infants_free, l.min_guests, l.days, l.extras, l.cancellation_policy,
              p.business_name, p.slug AS org_slug, p.verification, p.email, p.commission_rate
         FROM operator_listings l JOIN partner_profiles p ON p.id = l.org_id WHERE l.id = $1${lock}`, [listingId],
    );
    const r = rows[0];
    if (!r) throw AppError.notFound("Servicio");
    const listing = {
      id: r.id, org_id: r.org_id, category: r.category, title: r.title, slug: r.slug, status: r.status, price: Number(r.price), currency: r.currency, capacity: r.capacity, time_slots: r.time_slots ?? [],
      deposit_percent: r.deposit_percent, child_price: r.child_price === null ? null : Number(r.child_price), infants_free: !!r.infants_free, min_guests: r.min_guests, days: r.days,
      extras: r.extras ?? [], cancellation_policy: r.cancellation_policy,
    };
    let room: Loaded["room"] = null;
    if (roomId) {
      if (opts.lock) await c.query("SELECT 1 FROM operator_rooms WHERE id = $1 FOR UPDATE", [roomId]);
      const rr = await c.query(
        `SELECT r.id, r.name, r.price, r.weekend_price, r.min_nights, r.guests, r.quantity,
                COALESCE((SELECT jsonb_agg(jsonb_build_object('name', s.name, 'from', s.from_date, 'to', s.to_date, 'price', s.price)) FROM room_rate_seasons s WHERE s.room_id = r.id), '[]') AS seasons,
                COALESCE((SELECT jsonb_agg(jsonb_build_object('from', b.from_date, 'to', b.to_date, 'reason', b.reason)) FROM room_blocks b WHERE b.room_id = r.id), '[]') AS blocks
           FROM operator_rooms r WHERE r.id = $1 AND r.listing_id = $2`, [roomId, listingId],
      );
      if (!rr.rows[0]) throw AppError.notFound("Habitación");
      const x = rr.rows[0];
      room = { id: x.id, name: x.name, price: Number(x.price), weekend_price: x.weekend_price === null ? null : Number(x.weekend_price), min_nights: x.min_nights, guests: x.guests, quantity: x.quantity,
        seasons: x.seasons.map((s: { name: string; from: string; to: string; price: string | number }) => ({ ...s, price: Number(s.price) })), blocks: x.blocks };
    }
    return { listing, room, org: { id: r.org_id, business_name: r.business_name, slug: r.org_slug, verification: r.verification, email: r.email, commission_rate: Number(r.commission_rate) } };
  }

  private async occupied(c: Db | PoolClient, l: Loaded, req: QuoteRequest, time: string | null): Promise<number> {
    if (l.listing.category === "alojamiento") {
      if (!l.room || !req.check_out || !isIsoDate(req.date) || !isIsoDate(req.check_out)) return 0;
      const { rows } = await c.query<{ n: number }>(
        "SELECT count(*)::int AS n FROM bookings WHERE room_id = $1 AND status <> 'cancelled' AND date < $3::date AND check_out > $2::date", [l.room.id, req.date, req.check_out],
      );
      return rows[0]!.n;
    }
    if (!isIsoDate(req.date)) return 0;
    const { rows } = await c.query<{ n: number }>(
      "SELECT coalesce(sum(guests), 0)::int AS n FROM bookings WHERE listing_id = $1 AND date = $2::date AND coalesce(time, '') = coalesce($3::text, '') AND status <> 'cancelled'", [l.listing.id, req.date, time],
    );
    return rows[0]!.n;
  }

  private toQuoteRequest(r: BookingRequest): QuoteRequest {
    return { date: r.date, check_out: r.check_out, time: r.time, adults: r.adults, children: r.children ?? 0, infants: r.infants ?? 0, extras: r.extras ?? [], promo_code: r.promo_code };
  }

  private assertPublic(l: Loaded) {
    if (l.listing.status !== "published" || l.org.verification !== "verified") throw new AppError("BUSINESS_RULE", "Este servicio no está disponible para reservas", { code: "LISTING_UNAVAILABLE" });
  }

  // ---------- Cotización ----------
  async quote(request: BookingRequest, opts: { requirePublic?: boolean } = { requirePublic: true }) {
    const l = await this.load(this.db, request.listing_id, request.room_id);
    if (opts.requirePublic !== false) this.assertPublic(l);
    if (l.listing.category !== "alojamiento" && request.room_id) throw AppError.validation("Este servicio no tiene habitaciones");
    const qr = this.toQuoteRequest(request);
    const time = l.listing.category === "alojamiento" ? null : (qr.time ?? l.listing.time_slots[0] ?? null);
    const promo = qr.promo_code ? await this.promos.findValid(this.db, l.org.id, l.listing.id, qr.promo_code) : null;
    const quote = computeQuote({ listing: l.listing, room: l.room, request: qr, occupied: await this.occupied(this.db, l, qr, time), promo });
    return { quote, listing: l.listing, org: l.org };
  }

  // ---------- Crear ----------
  async create(input: CreateInput, actor: Actor) {
    const { request } = input;
    const manual = actor.source === "manual";
    if (input.payment_mode !== "pay_later" && !manual && !input.payment_token) throw AppError.validation("Falta payment_method_token para pagar en línea");
    if (input.payment_mode !== "pay_later" && !manual && this.gateway.name === "none") throw new AppError("SERVICE_UNAVAILABLE", "Los pagos en línea no están habilitados todavía; elige \"pagar después\"");

    // Reintento idempotente: la misma llave devuelve la reserva ya creada.
    if (input.idempotency_key) {
      const prev = await this.findByIdempotency(request.listing_id, input.idempotency_key);
      if (prev) {
        if (prev.date !== request.date || prev.listing.id !== request.listing_id || prev.contact.email.toLowerCase() !== input.contact.email.toLowerCase()) {
          throw new AppError("CONFLICT", "Esa Idempotency-Key ya se usó con otra solicitud", { reason: "IDEMPOTENCY_CONFLICT" });
        }
        return { booking: prev, accessToken: null as string | null, replayed: true };
      }
    }

    const accessToken = randomBytes(24).toString("base64url");
    let quote!: Quote;
    let loaded!: Loaded;
    let bookingId!: string;
    let promoId: string | null = null;

    try {
      await this.tx(async (c) => {
        // Serializa las reservas concurrentes del mismo anuncio/habitación.
        loaded = await this.load(c, request.listing_id, request.room_id, { lock: true });
        if (manual) { if (actor.orgId !== loaded.org.id) throw AppError.notFound("Servicio"); } else this.assertPublic(loaded);
        if (loaded.listing.category !== "alojamiento" && request.room_id) throw AppError.validation("Este servicio no tiene habitaciones");
        const qr = this.toQuoteRequest(request);
        const time = loaded.listing.category === "alojamiento" ? null : (qr.time ?? loaded.listing.time_slots[0] ?? null);
        const promo = qr.promo_code ? await this.promos.findValid(c, loaded.org.id, loaded.listing.id, qr.promo_code) : null;
        quote = computeQuote({ listing: loaded.listing, room: loaded.room, request: qr, occupied: await this.occupied(c, loaded, qr, time), promo });
        const issue = quote.issues[0];
        if (issue) throw new AppError("BUSINESS_RULE", issue.message, { code: issue.code, issues: quote.issues });
        if (input.payment_mode === "deposit" && quote.deposit_amount === null) throw new AppError("BUSINESS_RULE", "Este servicio no admite reservar con depósito", { code: "DEPOSIT_NOT_AVAILABLE" });
        if (promo && quote.promo?.applied) {
          const used = await c.query("UPDATE operator_promotions SET uses = uses + 1 WHERE id = $1 AND (max_uses IS NULL OR uses < max_uses)", [promo.id]);
          if (!used.rowCount) throw new AppError("BUSINESS_RULE", "El código promocional ya no tiene usos disponibles", { code: "PROMO_EXHAUSTED" });
          promoId = promo.id;
        }
        const guests = quote.seats;
        let reference = newReference();
        for (let i = 0; i < 5 && (await c.query("SELECT 1 FROM bookings WHERE reference = $1", [reference])).rowCount; i++) reference = newReference();
        bookingId = randomUUID();
        await c.query(
          `INSERT INTO bookings (id, reference, org_id, listing_id, room_id, user_id, contact_name, contact_email, contact_phone, access_hash, listing_title, room_name, category, date, check_out, time, guests, adults, children, infants,
             currency, subtotal, discount, total_price, deposit_amount, promo_code, quote, extras, status, payment_status, amount_paid, source, cancellation_policy, notes, idempotency_key, payment_mode)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,'unpaid',0,$30,$31,$32,$33,$34)`,
          [bookingId, reference, loaded.org.id, loaded.listing.id, loaded.room?.id ?? null, actor.userId ?? null, input.contact.name.trim(), input.contact.email.trim().toLowerCase(), input.contact.phone?.trim() ?? null, hashToken(accessToken),
            loaded.listing.title, loaded.room?.name ?? null, loaded.listing.category, request.date, quote.end_date, quote.time, guests, request.adults, request.children ?? 0, request.infants ?? 0,
            quote.currency, quote.subtotal, quote.discount, quote.total, input.payment_mode === "deposit" ? quote.deposit_amount : null, quote.promo?.applied ? quote.promo.code : null,
            JSON.stringify({ lines: quote.lines, promo: quote.promo, departure: quote.departure }), JSON.stringify(quote.extras), manual ? "confirmed" : "pending", actor.source, loaded.listing.cancellation_policy, input.notes?.trim() || null, input.idempotency_key ?? null, manual ? "manual" : input.payment_mode],
        );
      });
    } catch (e) {
      // Dos solicitudes con la misma llave a la vez: gana la primera, la otra devuelve esa reserva.
      if ((e as { code?: string }).code === "23505" && input.idempotency_key) {
        const prev = await this.findByIdempotency(request.listing_id, input.idempotency_key);
        if (prev) return { booking: prev, accessToken: null as string | null, replayed: true };
      }
      throw e;
    }

    // ----- Cobro (fuera de la transacción: llama a un proveedor externo) -----
    let charged = 0;
    const chargeNow = quote.total > 0 && !manual && input.payment_mode !== "pay_later";
    if (chargeNow) {
      const amount = input.payment_mode === "deposit" ? quote.deposit_amount! : quote.total;
      let result;
      try {
        const kind = input.payment_mode === "deposit" ? "deposit" : "full";
        result = await this.gateway.charge({ amount, currency: quote.currency, token: input.payment_token!, reference: (await this.reference(bookingId)), idempotencyKey: `${bookingId}:${kind}:${hashToken(input.payment_token!).slice(0, 12)}`, metadata: { booking_id: bookingId, kind } });
      } catch (err) {
        await this.abandon(bookingId, promoId, "payment_provider_error");
        this.log.error({ err, bookingId }, "Falló la pasarela de pago");
        throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el pago. No se realizó ningún cobro; intenta de nuevo.");
      }
      if (!result.ok) {
        await this.abandon(bookingId, promoId, `payment_${result.reason}`);
        throw new AppError("PAYMENT_FAILED", "El pago fue rechazado. No se realizó ningún cobro.", { reason: result.reason });
      }
      charged = amount;
      await this.recordOnlinePayment(bookingId, { kind: input.payment_mode === "deposit" ? "deposit" : "full", amount, currency: quote.currency, provider: this.gateway.name, ref: result.providerRef });
    } else if (quote.total === 0 && !manual) {
      await this.db.query("UPDATE bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = $1", [bookingId]);
    }

    const booking = (await this.get(bookingId))!;
    await this.notifyCreated(booking, loaded, input, charged).catch((err) => this.log.error({ err, bookingId }, "No se pudieron enviar las notificaciones de la reserva"));
    return { booking, accessToken, replayed: false };
  }

  /**
   * Registra un cobro en línea ya confirmado por el proveedor. Es idempotente por (proveedor, referencia): si el webhook llegó primero
   * que la respuesta del cobro (o al revés), el segundo intento no duplica el pago.
   */
  async recordOnlinePayment(bookingId: string, p: { kind: "full" | "deposit" | "balance"; amount: number; currency: string; provider: string; ref: string }): Promise<"recorded" | "duplicate"> {
    try {
      await this.tx(async (c) => {
        await c.query("INSERT INTO booking_payments (booking_id, kind, amount, currency, provider, provider_ref) VALUES ($1, $2, $3, $4, $5, $6)", [bookingId, p.kind, p.amount, p.currency, p.provider, p.ref]);
        await this.applyPaymentTotals(c, bookingId);
        await c.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1 AND status = 'pending'", [bookingId]);
      });
      return "recorded";
    } catch (e) {
      if ((e as { code?: string }).code === "23505") return "duplicate";
      throw e;
    }
  }

  /** Reembolso hecho fuera de este flujo (panel del proveedor, disputa): se refleja en los libros sin volver a llamar al proveedor. */
  async recordExternalRefund(bookingId: string, p: { amount: number; currency: string; provider: string; ref: string }): Promise<"recorded" | "duplicate"> {
    try {
      await this.tx(async (c) => {
        await c.query("INSERT INTO booking_payments (booking_id, kind, amount, currency, provider, provider_ref) VALUES ($1, 'refund', $2, $3, $4, $5)", [bookingId, p.amount, p.currency, p.provider, p.ref]);
        await this.applyPaymentTotals(c, bookingId);
      });
      return "recorded";
    } catch (e) {
      if ((e as { code?: string }).code === "23505") return "duplicate";
      throw e;
    }
  }

  private async reference(id: string) { return (await this.db.query<{ reference: string }>("SELECT reference FROM bookings WHERE id = $1", [id])).rows[0]!.reference; }

  /** Anula una reserva cuyo cobro falló y libera su cupo y su uso de promoción. */
  private async abandon(bookingId: string, promoId: string | null, reason: string) {
    await this.tx(async (c) => {
      await c.query("UPDATE bookings SET status = 'cancelled', cancelled_at = now(), cancelled_by = 'system', cancel_reason = $2 WHERE id = $1", [bookingId, reason]);
      if (promoId) await c.query("UPDATE operator_promotions SET uses = GREATEST(0, uses - 1) WHERE id = $1", [promoId]);
    });
  }

  /** Recalcula amount_paid y payment_status desde los pagos registrados (fuente de verdad). */
  private async applyPaymentTotals(c: PoolClient, bookingId: string) {
    await c.query(
      `WITH s AS (
         SELECT coalesce(sum(amount) FILTER (WHERE kind <> 'refund' AND status = 'succeeded'), 0) AS paid, coalesce(sum(amount) FILTER (WHERE kind = 'refund' AND status = 'succeeded'), 0) AS refunded
           FROM booking_payments WHERE booking_id = $1)
       UPDATE bookings b SET amount_paid = s.paid,
              payment_status = CASE WHEN s.paid > 0 AND s.refunded >= s.paid THEN 'refunded' WHEN s.paid - s.refunded >= b.total_price AND b.total_price > 0 THEN 'paid' WHEN s.paid > 0 THEN 'partial' ELSE 'unpaid' END
         FROM s WHERE b.id = $1`, [bookingId],
    );
  }

  private async findByIdempotency(listingId: string, key: string): Promise<BookingDto | null> {
    const { rows } = await this.db.query(`SELECT ${BOOKING_SELECT} FROM bookings b JOIN partner_profiles p ON p.id = b.org_id WHERE b.idempotency_key = $2 AND b.org_id = (SELECT org_id FROM operator_listings WHERE id = $1)`, [listingId, key]);
    return rows[0] ? toBookingDto(rows[0]) : null;
  }

  // ---------- Notificaciones ----------
  private async notifyCreated(b: BookingDto, l: Loaded, input: CreateInput, charged: number) {
    const dates = b.check_out && b.check_out !== b.date ? `${b.date} → ${b.check_out}` : `${b.date}${b.time ? ` ${b.time}` : ""}`;
    const guests = `${b.adults + b.children}${b.infants ? ` (+${b.infants} bebé${b.infants > 1 ? "s" : ""})` : ""}`;
    const url = `${this.env.WEB_BASE_URL}/operador/${b.operator.slug}`;
    await this.db.query(
      "INSERT INTO operator_messages (id, org_id, thread_id, traveler_name, sender, channel, booking_id, read, body) VALUES ($1, $2, $3, $4, 'traveler', 'web', $5, false, $6)",
      [`msg_${randomUUID()}`, l.org.id, `web-${b.id}`, b.contact.name, b.id, `Nueva reserva ${b.reference} de ${guests} persona(s) para ${b.listing.title}${b.room_name ? ` (${b.room_name})` : ""}: ${dates}.${b.notes ? ` Nota: ${b.notes}` : ""}`],
    );
    if (b.source === "manual") return;
    const locale = input.locale ?? "es";
    const common = { name: b.contact.name.split(" ")[0]!, reference: b.reference, service: b.listing.title, operator: b.operator.name, dates, guests, total: money(b.total_price, b.currency), url };
    if (b.status === "confirmed") await this.mailer.send({ to: b.contact.email, template: "booking.confirmation", locale, data: { ...common, paid: money(b.amount_paid, b.currency), balance: money(b.balance_due, b.currency) } });
    else await this.mailer.send({ to: b.contact.email, template: "booking.request_received", locale, data: common });
    await this.mailer.send({ to: l.org.email, template: "operator.new_booking", locale: "es", data: { operator: b.operator.name, traveler: b.contact.name, reference: b.reference, service: b.listing.title, dates, guests, total: money(b.total_price, b.currency), url: `${this.env.WEB_BASE_URL}/operadores/panel/reservas` } });
    void charged;
  }

  // ---------- Lectura ----------
  async get(id: string): Promise<BookingDto | null> {
    const { rows } = await this.db.query(`SELECT ${BOOKING_SELECT} FROM bookings b JOIN partner_profiles p ON p.id = b.org_id WHERE b.id = $1`, [id]);
    return rows[0] ? toBookingDto(rows[0]) : null;
  }

  /** Reserva visible para el viajero: con su token de invitado, o si es su cuenta. */
  async getForTraveler(id: string, access: { token?: string; userId?: string }): Promise<BookingDto> {
    const { rows } = await this.db.query(`SELECT ${BOOKING_SELECT} FROM bookings b JOIN partner_profiles p ON p.id = b.org_id WHERE b.id = $1`, [id]);
    const r = rows[0];
    const ok = r && ((access.token && r.access_hash && r.access_hash === hashToken(access.token)) || (access.userId && r.user_id === access.userId));
    if (!ok) throw AppError.notFound("Reserva"); // no se distingue "no existe" de "no es tuya"
    return toBookingDto(r);
  }

  async listForUser(userId: string, opts: { status?: string; page: number; per_page: number }) {
    const params: unknown[] = [userId];
    let where = "b.user_id = $1";
    if (opts.status) { params.push(opts.status); where += ` AND b.status = $${params.length}`; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM bookings b WHERE ${where}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${BOOKING_SELECT} FROM bookings b JOIN partner_profiles p ON p.id = b.org_id WHERE ${where} ORDER BY b.created_at DESC LIMIT ${opts.per_page} OFFSET ${(opts.page - 1) * opts.per_page}`, params);
    return { rows: rows.map(toBookingDto), total };
  }

  async listForOrg(orgId: string, f: { status?: string; from?: string; to?: string; listing_id?: string; q?: string; source?: string; only?: string[]; page: number; per_page: number }) {
    const params: unknown[] = [orgId];
    const where = ["b.org_id = $1"];
    const add = (sql: string, v: unknown) => { params.push(v); where.push(sql.replace("?", `$${params.length}`)); };
    if (f.status) add("b.status = ?", f.status);
    if (f.source) add("b.source = ?", f.source);
    if (f.listing_id) add("b.listing_id = ?", f.listing_id);
    if (f.from) add("coalesce(b.check_out, b.date) >= ?::date", f.from);
    if (f.to) add("b.date <= ?::date", f.to);
    if (f.only) add("b.listing_id = ANY(?)", f.only);
    if (f.q) add("(b.contact_name ILIKE ? OR b.contact_email ILIKE ? OR b.reference ILIKE ?)".replace(/\?/g, "$" + (params.length + 1)), `%${f.q.replace(/[\\%_]/g, "\\$&")}%`);
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM bookings b WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${BOOKING_SELECT} FROM bookings b JOIN partner_profiles p ON p.id = b.org_id WHERE ${w} ORDER BY b.date DESC, b.created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    return { rows: rows.map(toBookingDto), total };
  }

  async getForOrg(orgId: string, id: string, only?: string[]): Promise<BookingDto> {
    const b = await this.get(id);
    const { rows } = await this.db.query("SELECT org_id FROM bookings WHERE id = $1", [id]);
    if (!b || rows[0]?.org_id !== orgId || (only && !only.includes(b.listing.id))) throw AppError.notFound("Reserva");
    return b;
  }

  // ---------- Estado, pagos y cancelación ----------
  private static readonly TRANSITIONS: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"], confirmed: ["in_progress", "completed", "cancelled"], in_progress: ["completed", "cancelled"], completed: [], cancelled: [],
  };

  async setStatus(orgId: string, id: string, status: "confirmed" | "in_progress" | "completed" | "cancelled", opts: { reason?: string } = {}) {
    const cur = await this.getForOrg(orgId, id);
    if (status === "cancelled") return this.cancel(id, { by: "operator", orgId, reason: opts.reason });
    if (!BookingService.TRANSITIONS[cur.status]!.includes(status)) throw new AppError("BUSINESS_RULE", `No se puede pasar de "${cur.status}" a "${status}"`, { code: "INVALID_TRANSITION" });
    await this.db.query("UPDATE bookings SET status = $2, review_pending = ($2 = 'completed') WHERE id = $1", [id, status]);
    return (await this.get(id))!;
  }

  async updateNotes(orgId: string, id: string, notes: string | null) {
    await this.getForOrg(orgId, id);
    await this.db.query("UPDATE bookings SET notes = $2 WHERE id = $1", [id, notes]);
    return (await this.get(id))!;
  }

  /** El operador registra un cobro (efectivo, transferencia, saldo al llegar). */
  async addManualPayment(orgId: string, id: string, input: { amount: number; method?: string }, userId: string) {
    const b = await this.getForOrg(orgId, id);
    if (b.status === "cancelled") throw new AppError("BUSINESS_RULE", "La reserva está cancelada", { code: "INVALID_STATE" });
    if (toCents(input.amount) > toCents(b.balance_due)) throw new AppError("BUSINESS_RULE", `El cobro supera el saldo pendiente (${money(b.balance_due, b.currency)})`, { code: "OVERPAYMENT" });
    await this.tx(async (c) => {
      await c.query("INSERT INTO booking_payments (booking_id, kind, amount, currency, method, provider, created_by) VALUES ($1, $2, $3, $4, $5, 'manual', $6)", [id, b.amount_paid > 0 ? "balance" : "manual", input.amount, b.currency, input.method ?? "cash", userId]);
      await this.applyPaymentTotals(c, id);
    });
    return (await this.get(id))!;
  }

  /** El viajero paga el saldo de una reserva con depósito. */
  async payBalance(id: string, access: { token?: string; userId?: string }, paymentToken: string) {
    const b = await this.getForTraveler(id, access);
    if (b.status === "cancelled") throw new AppError("BUSINESS_RULE", "La reserva está cancelada", { code: "INVALID_STATE" });
    if (b.balance_due <= 0) throw new AppError("BUSINESS_RULE", "La reserva no tiene saldo pendiente", { code: "NO_BALANCE" });
    if (this.gateway.name === "none") throw new AppError("SERVICE_UNAVAILABLE", "Los pagos en línea no están habilitados todavía");
    let result;
    try { result = await this.gateway.charge({ amount: b.balance_due, currency: b.currency, token: paymentToken, reference: b.reference, idempotencyKey: `${id}:balance:${toCents(b.balance_due)}:${hashToken(paymentToken).slice(0, 12)}`, metadata: { booking_id: id, kind: "balance" } }); }
    catch (err) { this.log.error({ err, id }, "Falló la pasarela de pago"); throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el pago. No se realizó ningún cobro."); }
    if (!result.ok) throw new AppError("PAYMENT_FAILED", "El pago fue rechazado. No se realizó ningún cobro.", { reason: result.reason });
    await this.recordOnlinePayment(id, { kind: "balance", amount: b.balance_due, currency: b.currency, provider: this.gateway.name, ref: result.providerRef });
    return (await this.get(id))!;
  }

  /** Cancelación con reembolso según la política (si cancela el operador, se devuelve todo). */
  async cancel(id: string, who: { by: "traveler" | "operator"; token?: string; userId?: string; orgId?: string; reason?: string; now?: Date }) {
    const b = who.by === "operator" ? await this.getForOrg(who.orgId!, id) : await this.getForTraveler(id, { token: who.token, userId: who.userId });
    if (!["pending", "confirmed"].includes(b.status)) throw new AppError("BUSINESS_RULE", `No se puede cancelar una reserva en estado "${b.status}"`, { code: "INVALID_STATE" });
    const { percent, refund } = refundFor(b.cancellation.policy as CancellationPolicy, b.date, b.time, b.amount_paid, who.now ?? new Date(), who.by === "operator");
    let providerRef: string | null = null;
    if (refund > 0) {
      const last = await this.db.query<{ provider_ref: string | null }>("SELECT provider_ref FROM booking_payments WHERE booking_id = $1 AND kind <> 'refund' AND status = 'succeeded' AND provider <> 'manual' ORDER BY created_at DESC LIMIT 1", [id]);
      const manualOnly = !last.rows[0];
      if (!manualOnly) {
        let res;
        try { res = await this.gateway.refund({ providerRef: last.rows[0]!.provider_ref, amount: refund, currency: b.currency, reference: b.reference, idempotencyKey: `${id}:refund:${toCents(refund)}` }); }
        catch (err) { this.log.error({ err, id }, "Falló el reembolso"); throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el reembolso; la reserva no se canceló. Intenta de nuevo."); }
        if (!res.ok) throw new AppError("UPSTREAM_ERROR", "El proveedor rechazó el reembolso; la reserva no se canceló.", { reason: res.reason });
        providerRef = res.providerRef;
      }
    }
    await this.tx(async (c) => {
      if (refund > 0) await c.query("INSERT INTO booking_payments (booking_id, kind, amount, currency, provider, provider_ref) VALUES ($1, 'refund', $2, $3, $4, $5)", [id, refund, b.currency, providerRef ? this.gateway.name : "manual", providerRef]);
      await c.query(
        "UPDATE bookings SET status = 'cancelled', cancelled_at = now(), cancelled_by = $2, cancel_reason = $3, refund_amount = $4 WHERE id = $1 AND status IN ('pending', 'confirmed')",
        [id, who.by, who.reason ?? null, refund],
      );
      await this.applyPaymentTotals(c, id);
    });
    const after = (await this.get(id))!;
    await this.mailer.send({ to: after.contact.email, template: "booking.cancelled", locale: "es", data: { name: after.contact.name.split(" ")[0]!, reference: after.reference, service: after.listing.title, operator: after.operator.name, refund: refund > 0 ? `${money(refund, after.currency)} (${percent} %)` : "sin reembolso según la política" } });
    return after;
  }

  // ---------- Disponibilidad ----------
  async availability(listingId: string, from: string, to: string) {
    if (!isIsoDate(from) || !isIsoDate(to) || to < from) throw AppError.validation("Rango de fechas inválido");
    if (nightsBetween(from, to) > 62) throw AppError.validation("El rango máximo es de 62 días");
    const l = await this.load(this.db, listingId);
    this.assertPublic(l);
    const today = todayInSantoDomingo();
    if (l.listing.category !== "alojamiento") {
      const { rows } = await this.db.query<{ date: string; time: string | null; n: number }>(
        "SELECT date::text AS date, time, sum(guests)::int AS n FROM bookings WHERE listing_id = $1 AND date BETWEEN $2::date AND $3::date AND status <> 'cancelled' GROUP BY date, time", [listingId, from, to],
      );
      const taken = new Map(rows.map((r) => [`${r.date}|${r.time ?? ""}`, r.n]));
      const slots = l.listing.time_slots.length ? l.listing.time_slots : [null];
      const days: { date: string; time: string | null; capacity: number; taken: number; remaining: number; bookable: boolean }[] = [];
      for (let d = from; d <= to; d = addDays(d, 1)) for (const t of slots) {
        const n = taken.get(`${d}|${t ?? ""}`) ?? 0;
        days.push({ date: d, time: t, capacity: l.listing.capacity, taken: n, remaining: Math.max(0, l.listing.capacity - n), bookable: d >= today && n < l.listing.capacity });
      }
      return { kind: "slots" as const, days };
    }
    const rooms = await this.db.query<{ id: string; name: string; quantity: number }>("SELECT id, name, quantity FROM operator_rooms WHERE listing_id = $1 ORDER BY position, created_at", [listingId]);
    const ids = rooms.rows.map((r) => r.id);
    const bk = ids.length ? (await this.db.query<{ room_id: string; date: string; check_out: string }>("SELECT room_id, date::text AS date, check_out::text AS check_out FROM bookings WHERE room_id = ANY($1) AND status <> 'cancelled' AND date <= $3::date AND check_out > $2::date", [ids, from, to])).rows : [];
    const blocks = ids.length ? (await this.db.query<{ room_id: string; f: string; t: string }>("SELECT room_id, from_date::text AS f, to_date::text AS t FROM room_blocks WHERE room_id = ANY($1) AND from_date <= $3::date AND to_date >= $2::date", [ids, from, to])).rows : [];
    return {
      kind: "rooms" as const,
      rooms: rooms.rows.map((r) => {
        const nights: { date: string; free: number; blocked: boolean }[] = [];
        for (let d = from; d <= to; d = addDays(d, 1)) {
          const used = bk.filter((x) => x.room_id === r.id && x.date <= d && x.check_out > d).length;
          const blocked = blocks.some((x) => x.room_id === r.id && x.f <= d && x.t >= d);
          nights.push({ date: d, free: blocked ? 0 : Math.max(0, r.quantity - used), blocked });
        }
        return { room_id: r.id, name: r.name, nights };
      }),
    };
  }

  // ---------- Calendario e ingresos del operador ----------
  async calendar(orgId: string, from: string, to: string, only?: string[], listingId?: string) {
    if (!isIsoDate(from) || !isIsoDate(to) || to < from) throw AppError.validation("Rango de fechas inválido");
    if (nightsBetween(from, to) > 93) throw AppError.validation("El rango máximo es de 93 días");
    return this.listForOrg(orgId, { from, to, only, listing_id: listingId, page: 1, per_page: 100, status: undefined }).then((r) => ({ bookings: r.rows.filter((b) => b.status !== "cancelled"), total: r.total }));
  }

  /**
   * Ingresos: lo cobrado (menos reembolsos) de reservas hechas en el sitio del operador paga comisión; las manuales no.
   * "Liquidable" es lo de reservas completadas; el resto queda retenido hasta entonces (docs §5.10).
   */
  async income(orgId: string, from?: string, to?: string) {
    const { rows } = await this.db.query<{ id: string; source: string; status: string; month: string; net: string }>(
      `SELECT b.id, b.source, b.status, to_char(b.date, 'YYYY-MM') AS month,
              coalesce(sum(CASE WHEN p.kind = 'refund' THEN -p.amount ELSE p.amount END) FILTER (WHERE p.status = 'succeeded'), 0) AS net
         FROM bookings b LEFT JOIN booking_payments p ON p.booking_id = b.id
        WHERE b.org_id = $1 AND ($2::date IS NULL OR b.date >= $2) AND ($3::date IS NULL OR b.date <= $3)
        GROUP BY b.id`, [orgId, from ?? null, to ?? null],
    );
    const rate = (await this.db.query<{ commission_rate: string }>("SELECT commission_rate FROM partner_profiles WHERE id = $1", [orgId])).rows[0]!.commission_rate;
    const pct = Number(rate);
    let gross = 0, commission = 0, settled = 0;
    const byMonth = new Map<string, number>();
    for (const r of rows) {
      const net = toCents(Number(r.net));
      if (net <= 0) continue;
      const fee = r.source === "web" ? Math.round((net * pct) / 100) : 0;
      gross += net; commission += fee;
      if (r.status === "completed") settled += net - fee;
      byMonth.set(r.month, (byMonth.get(r.month) ?? 0) + net);
    }
    return {
      commission_rate: pct, gross: fromCents(gross), commission: fromCents(commission), net: fromCents(gross - commission),
      settled: fromCents(settled), pending: fromCents(gross - commission - settled),
      by_month: [...byMonth].sort().map(([month, total]) => ({ month, total: fromCents(total) })),
    };
  }
}
