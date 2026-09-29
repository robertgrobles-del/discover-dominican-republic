import { randomUUID } from "node:crypto";
import { type Pool } from "pg";
import { AppError } from "../../lib/errors.js";

export interface MembershipPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_annual: number;
  currency: string;
  points_multiplier: number;
  benefits: string[];
  is_active: boolean;
}

export interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  valid_from: string;
  valid_until: string;
  auto_renew: boolean;
  payment_reference: string | null;
  vip_badge_code: string;
}

export interface EventTicket {
  id: string;
  event_id: string;
  user_id: string;
  tier_name: string;
  price_paid: number;
  currency: string;
  qr_code_hash: string;
  status: "ISSUED" | "CHECKED_IN" | "CANCELLED";
  checked_in_at: string | null;
  metadata: Record<string, unknown>;
}

export class MembershipsAndTicketingService {
  constructor(private pool: Pool) {}

  async listActivePlans(): Promise<MembershipPlan[]> {
    const res = await this.pool.query(
      `SELECT id, slug, name, description, price_annual::float, currency, points_multiplier::float, benefits, is_active
       FROM membership_plans
       WHERE is_active = TRUE
       ORDER BY price_annual ASC`
    );
    return res.rows;
  }

  async subscribeUserToPlan(
    userId: string,
    planSlugOrId: string,
    paymentRef?: string
  ): Promise<UserMembership> {
    const planRes = await this.pool.query(
      `SELECT * FROM membership_plans WHERE id = $1 OR slug = $1 LIMIT 1`,
      [planSlugOrId]
    );

    if (planRes.rows.length === 0) {
      throw new AppError("NOT_FOUND", "Plan de membresía no encontrado.");
    }
    const plan = planRes.rows[0];

    const membershipId = `mem_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Cancelar membresías activas previas si existen
    await this.pool.query(
      `UPDATE user_memberships SET status = 'CANCELLED', updated_at = NOW() WHERE user_id = $1 AND status = 'ACTIVE'`,
      [userId]
    );

    const insertRes = await this.pool.query(
      `INSERT INTO user_memberships (
        id, user_id, plan_id, status, valid_from, valid_until, auto_renew, payment_reference, vip_badge_code
      ) VALUES ($1, $2, $3, 'ACTIVE', $4, $5, TRUE, $6, 'PASAPORTE_VIP')
      RETURNING *`,
      [
        membershipId,
        userId,
        plan.id,
        now.toISOString(),
        oneYearLater.toISOString(),
        paymentRef || `sim_pay_${randomUUID().slice(0, 8)}`,
      ]
    );

    // Bono de bienvenida en puntos (#18)
    const pointsBonus = 500;
    await this.creditLoyaltyPoints(userId, pointsBonus, "VIP_BONUS", membershipId);

    return insertRes.rows[0];
  }

  async getUserMembership(userId: string): Promise<{
    membership: UserMembership | null;
    plan: MembershipPlan | null;
    points_balance: number;
  }> {
    const memRes = await this.pool.query(
      `SELECT m.*, p.name as plan_name, p.points_multiplier::float, p.benefits, p.slug as plan_slug
       FROM user_memberships m
       JOIN membership_plans p ON m.plan_id = p.id
       WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND m.valid_until > NOW()
       ORDER BY m.created_at DESC
       LIMIT 1`,
      [userId]
    );

    const balanceRes = await this.pool.query(
      `SELECT COALESCE(SUM(points_delta), 0)::int as balance FROM loyalty_points_ledger WHERE user_id = $1`,
      [userId]
    );
    const balance = balanceRes.rows[0]?.balance || 0;

    if (memRes.rows.length === 0) {
      return { membership: null, plan: null, points_balance: balance };
    }

    const row = memRes.rows[0];
    return {
      membership: {
        id: row.id,
        user_id: row.user_id,
        plan_id: row.plan_id,
        status: row.status,
        valid_from: row.valid_from,
        valid_until: row.valid_until,
        auto_renew: row.auto_renew,
        payment_reference: row.payment_reference,
        vip_badge_code: row.vip_badge_code,
      },
      plan: {
        id: row.plan_id,
        slug: row.plan_slug,
        name: row.plan_name,
        description: null,
        price_annual: 0,
        currency: "USD",
        points_multiplier: row.points_multiplier,
        benefits: row.benefits,
        is_active: true,
      },
      points_balance: balance,
    };
  }

  async creditLoyaltyPoints(
    userId: string,
    points: number,
    reason: string,
    referenceId?: string
  ): Promise<number> {
    const id = `pt_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    
    // Obtener balance previo
    const curRes = await this.pool.query(
      `SELECT COALESCE(SUM(points_delta), 0)::int as balance FROM loyalty_points_ledger WHERE user_id = $1`,
      [userId]
    );
    const currentBalance = curRes.rows[0]?.balance || 0;
    const newBalance = currentBalance + points;

    await this.pool.query(
      `INSERT INTO loyalty_points_ledger (id, user_id, points_delta, balance_after, reason, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, points, newBalance, reason, referenceId || null]
    );

    return newBalance;
  }

  // --- Ticketing (#20) ---
  async purchaseTicket(params: {
    eventId: string;
    userId: string;
    tierName?: string;
    price?: number;
    currency?: string;
  }): Promise<EventTicket> {
    const ticketId = `tkt_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const qrHash = `DR-TKT-${randomUUID().replace(/-/g, "").toUpperCase()}`;
    const tier = params.tierName || "GENERAL";
    const price = params.price ?? 25.0;
    const curr = params.currency || "USD";

    const insertRes = await this.pool.query(
      `INSERT INTO live_event_tickets (
        id, event_id, user_id, tier_name, price_paid, currency, qr_code_hash, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ISSUED', $8)
      RETURNING *`,
      [
        ticketId,
        params.eventId,
        params.userId,
        tier,
        price,
        curr,
        qrHash,
        JSON.stringify({ purchase_channel: "web_app", tier }),
      ]
    );

    // Otorgar puntos de lealtad por compra de ticket
    const earnedPoints = Math.round(price * 10);
    await this.creditLoyaltyPoints(params.userId, earnedPoints, "PURCHASE_REWARD", ticketId);

    return insertRes.rows[0];
  }

  async verifyAndCheckInTicket(qrCodeHash: string): Promise<EventTicket> {
    const res = await this.pool.query(
      `SELECT * FROM live_event_tickets WHERE qr_code_hash = $1 LIMIT 1`,
      [qrCodeHash]
    );

    if (res.rows.length === 0) {
      throw new AppError("NOT_FOUND", "Entrada no encontrada o código QR no válido.");
    }

    const ticket = res.rows[0];
    if (ticket.status === "CHECKED_IN") {
      throw new AppError("CONFLICT", `La entrada ya fue utilizada en: ${ticket.checked_in_at}`);
    }

    if (ticket.status !== "ISSUED") {
      throw new AppError("VALIDATION_ERROR", `Estado de entrada no válido: ${ticket.status}`);
    }

    const updateRes = await this.pool.query(
      `UPDATE live_event_tickets 
       SET status = 'CHECKED_IN', checked_in_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [ticket.id]
    );

    return updateRes.rows[0];
  }
}
