import { randomUUID } from "node:crypto";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { BookingService } from "./bookings.js";

/** Mensajes con viajeros y reseñas verificadas (docs §5.10). */
export class EngagementService {
  constructor(private readonly db: Db, private readonly bookings: BookingService) {}

  // ---------- Mensajes ----------
  async threads(orgId: string, opts: { unread?: boolean; page: number; per_page: number }) {
    const where = opts.unread ? "HAVING bool_or(NOT read AND sender = 'traveler')" : "";
    const { rows } = await this.db.query(
      `SELECT thread_id, max(traveler_name) AS traveler_name, max(channel) AS channel, max(booking_id) AS booking_id, max(created_at) AS last_at,
              (array_agg(body ORDER BY created_at DESC))[1] AS last_message, count(*) FILTER (WHERE NOT read AND sender = 'traveler')::int AS unread
         FROM operator_messages WHERE org_id = $1 GROUP BY thread_id ${where} ORDER BY max(created_at) DESC LIMIT ${opts.per_page} OFFSET ${(opts.page - 1) * opts.per_page}`, [orgId],
    );
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM (SELECT 1 FROM operator_messages WHERE org_id = $1 GROUP BY thread_id ${where}) t`, [orgId])).rows[0]!.n;
    return { rows, total };
  }

  async thread(orgId: string, threadId: string) {
    const { rows } = await this.db.query("SELECT id, thread_id, traveler_name, sender, channel, body, booking_id, read, created_at FROM operator_messages WHERE org_id = $1 AND thread_id = $2 ORDER BY created_at, id", [orgId, threadId]);
    if (!rows.length) throw AppError.notFound("Conversación");
    await this.db.query("UPDATE operator_messages SET read = true WHERE org_id = $1 AND thread_id = $2 AND sender = 'traveler' AND NOT read", [orgId, threadId]);
    return rows;
  }

  async reply(orgId: string, threadId: string, body: string) {
    const last = (await this.db.query("SELECT traveler_name, channel, booking_id FROM operator_messages WHERE org_id = $1 AND thread_id = $2 ORDER BY created_at DESC LIMIT 1", [orgId, threadId])).rows[0];
    if (!last) throw AppError.notFound("Conversación");
    const id = `msg_${randomUUID()}`;
    await this.db.query("INSERT INTO operator_messages (id, org_id, thread_id, traveler_name, sender, channel, booking_id, read, body) VALUES ($1,$2,$3,$4,'operator',$5,$6,true,$7)", [id, orgId, threadId, last.traveler_name, last.channel, last.booking_id, body.trim()]);
    return { id };
  }

  /** El viajero escribe al operador desde su reserva (token de invitado o su sesión). */
  async travelerMessage(bookingId: string, access: { token?: string; userId?: string }, body: string) {
    const b = await this.bookings.getForTraveler(bookingId, access);
    const org = (await this.db.query<{ org_id: string }>("SELECT org_id FROM bookings WHERE id = $1", [bookingId])).rows[0]!.org_id;
    const id = `msg_${randomUUID()}`;
    await this.db.query("INSERT INTO operator_messages (id, org_id, thread_id, traveler_name, sender, channel, booking_id, read, body) VALUES ($1,$2,$3,$4,'traveler','web',$5,false,$6)", [id, org, `web-${bookingId}`, b.contact.name, bookingId, body.trim()]);
    return { id };
  }

  // ---------- Reseñas ----------
  private async refreshRating(listingId: string | null) {
    if (!listingId) return;
    await this.db.query(
      "UPDATE operator_listings SET rating = (SELECT round(avg(rating)::numeric, 1) FROM operator_reviews WHERE listing_id = $1), reviews_count = (SELECT count(*) FROM operator_reviews WHERE listing_id = $1) WHERE id = $1", [listingId],
    );
  }

  /** Reseña verificada: sólo la persona que reservó, una vez y cuando el servicio ya se completó. */
  async review(bookingId: string, access: { token?: string; userId?: string }, input: { rating: number; comment?: string }) {
    const b = await this.bookings.getForTraveler(bookingId, access);
    if (b.status !== "completed") throw new AppError("BUSINESS_RULE", "Sólo puedes opinar cuando el servicio se haya completado", { code: "NOT_COMPLETED" });
    const org = (await this.db.query<{ org_id: string }>("SELECT org_id FROM bookings WHERE id = $1", [bookingId])).rows[0]!.org_id;
    const id = `rev_${randomUUID()}`;
    try {
      await this.db.query("INSERT INTO operator_reviews (id, org_id, listing_id, author, rating, comment, booking_id) VALUES ($1,$2,$3,$4,$5,$6,$7)", [id, org, b.listing.id, b.contact.name.split(" ")[0], input.rating, input.comment?.trim() || null, bookingId]);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya dejaste una reseña para esta reserva", { reason: "ALREADY_REVIEWED" });
      throw e;
    }
    await this.db.query("UPDATE bookings SET review_pending = false WHERE id = $1", [bookingId]);
    await this.refreshRating(b.listing.id);
    return { id };
  }

  async publicReviews(listingId: string, page: number, per_page: number) {
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM operator_reviews WHERE listing_id = $1", [listingId])).rows[0]!.n;
    const { rows } = await this.db.query("SELECT id, author, rating, comment, reply, created_at FROM operator_reviews WHERE listing_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", [listingId, per_page, (page - 1) * per_page]);
    return { rows, total };
  }

  async orgReviews(orgId: string, opts: { unanswered?: boolean; only?: string[]; page: number; per_page: number }) {
    const params: unknown[] = [orgId];
    let w = "org_id = $1";
    if (opts.unanswered) w += " AND reply IS NULL";
    if (opts.only) { params.push(opts.only); w += ` AND listing_id = ANY($${params.length})`; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM operator_reviews WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT id, listing_id, author, rating, comment, reply, replied_at, created_at FROM operator_reviews WHERE ${w} ORDER BY created_at DESC LIMIT ${opts.per_page} OFFSET ${(opts.page - 1) * opts.per_page}`, params);
    return { rows, total };
  }

  async replyReview(orgId: string, reviewId: string, reply: string) {
    const r = await this.db.query("UPDATE operator_reviews SET reply = $3, replied_at = now() WHERE id = $1 AND org_id = $2", [reviewId, orgId, reply.trim()]);
    if (!r.rowCount) throw AppError.notFound("Reseña");
  }
}
