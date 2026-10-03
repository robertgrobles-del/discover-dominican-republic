import type { Db } from "../../db/pool.js";
import { auditInsert } from "../../lib/audit.js";
import { addDays, todayInSantoDomingo } from "../../lib/dates.js";
import { AppError } from "../../lib/errors.js";

/** Hasta cuántas semanas por delante se puede pujar. */
const MAX_WEEKS_AHEAD = 8;

/** Lunes de la semana a la que pertenece `day`. */
export function mondayOf(day: string): string {
  return addDays(day, -((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7));
}

/**
 * Subasta semanal de posiciones patrocinadas (plan de 150 mejoras, punto 28). Reglas, todas SUPUESTOS por validar:
 *  - Se subasta cada espacio habilitado por semanas completas (lunes a domingo), sólo semanas futuras.
 *  - Puja a sobre cerrado: cada anunciante ve sólo sus pujas y el precio mínimo del espacio.
 *  - Una puja por campaña, espacio y semana; puede subirse mientras la subasta esté abierta, nunca bajarse.
 *  - Sólo pujan campañas ya aprobadas, con una creatividad propia de ese espacio.
 *  - Al cerrar ganan las N pujas más altas (N = cupo del espacio); en empate, la que se presentó primero.
 *  - Primer precio: cada ganador debe lo que pujó. El cobro no se automatiza; queda como monto por facturar.
 */
export class AuctionService {
  constructor(private readonly db: Db) {}

  async setSlotAuction(slotId: string, input: { enabled: boolean; reserve: number }) {
    const upd = await this.db.query("UPDATE sponsorship_slots SET auction_enabled = $2, auction_reserve = $3 WHERE id = $1 RETURNING id, name, auction_enabled, auction_reserve", [slotId, input.enabled, input.reserve]);
    if (!upd.rows[0]) throw AppError.notFound("Espacio de patrocinio");
    return { ...upd.rows[0], auction_reserve: Number(upd.rows[0].auction_reserve) };
  }

  async placeBid(userId: string, input: { slot_id: string; creative_id: string; period_start: string; amount: number }, now = new Date()) {
    const today = todayInSantoDomingo(now);
    if (mondayOf(input.period_start) !== input.period_start) throw AppError.validation("La semana debe empezar en lunes");
    if (input.period_start <= today) throw AppError.validation("Sólo se puede pujar por semanas futuras");
    if (input.period_start > addDays(mondayOf(today), MAX_WEEKS_AHEAD * 7)) throw AppError.validation(`Sólo se puede pujar hasta ${MAX_WEEKS_AHEAD} semanas por delante`);

    const slot = (await this.db.query<{ auction_enabled: boolean; auction_reserve: string }>("SELECT auction_enabled, auction_reserve FROM sponsorship_slots WHERE id = $1 AND is_active", [input.slot_id])).rows[0];
    if (!slot?.auction_enabled) throw new AppError("BUSINESS_RULE", "Ese espacio no se subasta");
    if (input.amount < Number(slot.auction_reserve)) throw new AppError("BUSINESS_RULE", `La puja mínima para este espacio es ${Number(slot.auction_reserve)}`, { code: "BELOW_RESERVE", reserve: Number(slot.auction_reserve) });
    if ((await this.db.query("SELECT 1 FROM sponsorship_auction_results WHERE slot_id = $1 AND period_start = $2", [input.slot_id, input.period_start])).rowCount) throw new AppError("CONFLICT", "La subasta de esa semana ya se cerró");

    // Una creatividad ajena o de otro espacio responde igual que una inexistente.
    const creative = (await this.db.query<{ campaign_id: string; status: string }>(
      `SELECT c.campaign_id, camp.status FROM sponsorship_creatives c JOIN sponsorship_campaigns camp ON camp.id = c.campaign_id
        WHERE c.id = $1 AND c.slot_id = $2 AND camp.created_by = $3`, [input.creative_id, input.slot_id, userId],
    )).rows[0];
    if (!creative) throw AppError.notFound("Creatividad");
    if (creative.status !== "active") throw new AppError("BUSINESS_RULE", "La campaña debe estar aprobada antes de pujar");

    const bid = (await this.db.query(
      `INSERT INTO sponsorship_bids (slot_id, campaign_id, creative_id, bidder_id, period_start, amount) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slot_id, period_start, campaign_id) DO UPDATE SET amount = EXCLUDED.amount, creative_id = EXCLUDED.creative_id, status = 'open', updated_at = now()
        WHERE sponsorship_bids.status IN ('open', 'withdrawn') AND (sponsorship_bids.status = 'withdrawn' OR EXCLUDED.amount > sponsorship_bids.amount)
       RETURNING id, slot_id, campaign_id, creative_id, period_start::text AS period_start, amount, currency, status`,
      [input.slot_id, creative.campaign_id, input.creative_id, userId, input.period_start, input.amount],
    )).rows[0];
    if (!bid) throw new AppError("BUSINESS_RULE", "Una puja sólo puede subirse", { code: "BID_NOT_HIGHER" });
    return { ...bid, amount: Number(bid.amount) };
  }

  async myBids(userId: string) {
    const { rows } = await this.db.query(
      `SELECT b.id, b.slot_id, s.name AS slot_name, s.auction_reserve, b.campaign_id, b.creative_id, b.period_start::text AS period_start, b.amount, b.currency, b.status, b.updated_at
         FROM sponsorship_bids b JOIN sponsorship_slots s ON s.id = b.slot_id WHERE b.bidder_id = $1 ORDER BY b.period_start DESC, b.updated_at DESC LIMIT 100`, [userId],
    );
    return rows.map((r) => ({ ...r, amount: Number(r.amount), auction_reserve: Number(r.auction_reserve) }));
  }

  async withdraw(userId: string, bidId: string) {
    const upd = await this.db.query("UPDATE sponsorship_bids SET status = 'withdrawn', updated_at = now() WHERE id = $1 AND bidder_id = $2 AND status = 'open'", [bidId, userId]);
    if (!upd.rowCount) throw AppError.notFound("Puja abierta");
  }

  /** Vista de administración: todas las pujas de un espacio y semana, de mayor a menor. */
  async board(slotId: string, periodStart: string) {
    const slot = (await this.db.query<{ name: string; max_active_creatives: number; auction_reserve: string; auction_enabled: boolean }>("SELECT name, max_active_creatives, auction_reserve, auction_enabled FROM sponsorship_slots WHERE id = $1", [slotId])).rows[0];
    if (!slot) throw AppError.notFound("Espacio de patrocinio");
    const closed = (await this.db.query<{ closed_at: Date; winners: number }>("SELECT closed_at, winners FROM sponsorship_auction_results WHERE slot_id = $1 AND period_start = $2", [slotId, periodStart])).rows[0] ?? null;
    const { rows } = await this.db.query(
      `SELECT b.id, b.campaign_id, camp.campaign_name, camp.advertiser_name, b.creative_id, c.title AS creative_title, b.amount, b.currency, b.status, b.created_at
         FROM sponsorship_bids b JOIN sponsorship_campaigns camp ON camp.id = b.campaign_id JOIN sponsorship_creatives c ON c.id = b.creative_id
        WHERE b.slot_id = $1 AND b.period_start = $2 AND b.status <> 'withdrawn' ORDER BY b.amount DESC, b.created_at, b.id`, [slotId, periodStart],
    );
    return {
      slot: { id: slotId, name: slot.name, positions: slot.max_active_creatives, reserve: Number(slot.auction_reserve), auction_enabled: slot.auction_enabled },
      period: { start: periodStart, end: addDays(periodStart, 6) }, closed,
      bids: rows.map((r, i) => ({ ...r, amount: Number(r.amount), rank: i + 1 })),
    };
  }

  /** Cierra la subasta: ganan las N pujas más altas. La fila de resultado impide cerrarla dos veces. */
  async close(actorId: string, slotId: string, periodStart: string, ip?: string) {
    if (mondayOf(periodStart) !== periodStart) throw AppError.validation("La semana debe empezar en lunes");
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const slot = (await c.query<{ max_active_creatives: number }>("SELECT max_active_creatives FROM sponsorship_slots WHERE id = $1 AND auction_enabled FOR UPDATE", [slotId])).rows[0];
      if (!slot) throw AppError.notFound("Espacio en subasta");
      const winners = (await c.query<{ id: string; campaign_id: string; amount: string }>(
        `UPDATE sponsorship_bids SET status = 'won', updated_at = now() WHERE id IN (
           SELECT id FROM sponsorship_bids WHERE slot_id = $1 AND period_start = $2 AND status = 'open' ORDER BY amount DESC, created_at, id LIMIT $3
         ) RETURNING id, campaign_id, amount`, [slotId, periodStart, slot.max_active_creatives],
      )).rows;
      await c.query("UPDATE sponsorship_bids SET status = 'lost', updated_at = now() WHERE slot_id = $1 AND period_start = $2 AND status = 'open'", [slotId, periodStart]);
      const ins = await c.query("INSERT INTO sponsorship_auction_results (slot_id, period_start, winners, closed_by) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING", [slotId, periodStart, winners.length, actorId]);
      if (!ins.rowCount) throw new AppError("CONFLICT", "La subasta de esa semana ya se cerró");
      await auditInsert(c, { actor: actorId, action: "sponsorship.auction_close", entity: "sponsorship_slot", id: slotId, meta: { period_start: periodStart, winners: winners.map((w) => ({ bid: w.id, amount: Number(w.amount) })) }, ip });
      await c.query("COMMIT");
      return { slot_id: slotId, period_start: periodStart, winners: winners.length, amount_due: winners.reduce((n, w) => n + Number(w.amount), 0) };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  /** Creatividades ganadoras de la semana en curso para un espacio, de mayor a menor puja; vacío si no hubo subasta. */
  async winningCreativeIds(slotId: string, now = new Date()): Promise<string[]> {
    const { rows } = await this.db.query<{ creative_id: string }>(
      "SELECT creative_id FROM sponsorship_bids WHERE slot_id = $1 AND period_start = $2 AND status = 'won' ORDER BY amount DESC, created_at, id", [slotId, mondayOf(todayInSantoDomingo(now))],
    );
    return rows.map((r) => r.creative_id);
  }
}
