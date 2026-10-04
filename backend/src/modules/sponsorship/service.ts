import { createHash } from "node:crypto";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { AuctionService } from "./auctions.js";

export interface SponsorshipSlotRow {
  id: string;
  name: string;
  slot_type: string;
  max_active_creatives: number;
  recommended_dimensions: string | null;
  is_active: boolean;
}

export interface CreativeRow {
  id: string;
  campaign_id: string;
  slot_id: string;
  title: string;
  headline: string | null;
  body_text: string | null;
  target_url: string;
  image_url: string | null;
  badge_label: string;
  category_target: string | null;
  destination_target: string | null;
  weight: number;
  daily_cap_impressions: number | null;
  daily_cap_clicks: number | null;
  status: string;
  impressions_count: number;
  clicks_count: number;
}

export interface ServeSlotQuery {
  slot_id: string;
  category?: string;
  destination?: string;
  limit?: number;
}

export interface RecordTelemetryInput {
  creative_id: string;
  slot_id: string;
  event_type: "impression" | "click" | "conversion";
  session_id?: string;
  user_id?: string | null;
  page?: string;
  ip?: string;
}

/** Motor de Patrocinios y Ad Server (Docs §Fase 2B) */
export class SponsorshipService {
  constructor(private readonly db: Db) {}

  /** Entrega las creatividades publicitarias activas para un slot aplicando targeting y rotación con peso */
  async serveSlot(params: ServeSlotQuery): Promise<CreativeRow[]> {
    const limit = Math.min(params.limit ?? 1, 10);
    const sqlParams: unknown[] = [params.slot_id];
    let whereClause = `
      WHERE c.slot_id = $1
        AND c.status = 'active'
        AND camp.status = 'active'
        AND now() >= camp.starts_at
        AND now() <= camp.ends_at
        AND (camp.budget_total = 0 OR camp.budget_spent < camp.budget_total)
    `;

    if (params.category) {
      sqlParams.push(params.category);
      whereClause += ` AND (c.category_target IS NULL OR c.category_target = $${sqlParams.length})`;
    }
    if (params.destination) {
      sqlParams.push(params.destination);
      whereClause += ` AND (c.destination_target IS NULL OR lower(c.destination_target) = lower($${sqlParams.length}))`;
    }

    // Si la semana en curso tuvo subasta, el espacio es de los ganadores, en el orden de sus pujas.
    const winners = await new AuctionService(this.db).winningCreativeIds(params.slot_id);
    let order = "(random() * c.weight) DESC";
    if (winners.length) {
      sqlParams.push(winners);
      whereClause += ` AND c.id = ANY($${sqlParams.length}::uuid[])`;
      order = `array_position($${sqlParams.length}::uuid[], c.id)`;
    }

    const { rows } = await this.db.query<CreativeRow>(
      `SELECT c.id, c.campaign_id, c.slot_id, c.title, c.headline, c.body_text,
              c.target_url, c.image_url, c.badge_label, c.category_target, c.destination_target,
              c.weight, c.daily_cap_impressions, c.daily_cap_clicks, c.status,
              c.impressions_count, c.clicks_count
         FROM sponsorship_creatives c
         JOIN sponsorship_campaigns camp ON camp.id = c.campaign_id
         ${whereClause}
        ORDER BY ${order}
        LIMIT ${limit}`,
      sqlParams,
    );

    return rows;
  }

  /** Registra evento de telemetría (impresión, clic o conversión) y actualiza contadores y gasto */
  async recordEvent(input: RecordTelemetryInput): Promise<{ recorded: boolean }> {
    const ipHash = input.ip ? createHash("sha256").update(input.ip).digest("hex").slice(0, 16) : null;

    // Obtener información de la creatividad y de la campaña
    const creativeInfo = (await this.db.query<{ campaign_id: string; billing_type: string; cpc_rate: number; cpm_rate: number }>(
      `SELECT c.campaign_id, camp.billing_type, camp.cpc_rate, camp.cpm_rate
         FROM sponsorship_creatives c
         JOIN sponsorship_campaigns camp ON camp.id = c.campaign_id
        WHERE c.id = $1`,
      [input.creative_id],
    )).rows[0];

    if (!creativeInfo) throw AppError.notFound("Creatividad publicitaria");

    // Evento, contador y gasto van en una misma conexión: con el pool cada consulta podía caer en una distinta.
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query(
        `INSERT INTO sponsorship_events (creative_id, slot_id, event_type, session_id, user_id, page, ip_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [input.creative_id, input.slot_id, input.event_type, input.session_id ?? null, input.user_id ?? null, input.page ?? null, ipHash],
      );

      // Actualizar contadores en la creatividad
      if (input.event_type === "impression") {
        await c.query("UPDATE sponsorship_creatives SET impressions_count = impressions_count + 1 WHERE id = $1", [input.creative_id]);
        if (creativeInfo.billing_type === "cpm" && Number(creativeInfo.cpm_rate) > 0) {
          const cost = Number(creativeInfo.cpm_rate) / 1000;
          await c.query("UPDATE sponsorship_campaigns SET budget_spent = budget_spent + $1 WHERE id = $2", [cost, creativeInfo.campaign_id]);
        }
      } else if (input.event_type === "click") {
        await c.query("UPDATE sponsorship_creatives SET clicks_count = clicks_count + 1 WHERE id = $1", [input.creative_id]);
        if (creativeInfo.billing_type === "cpc" && Number(creativeInfo.cpc_rate) > 0) {
          const cost = Number(creativeInfo.cpc_rate);
          await c.query("UPDATE sponsorship_campaigns SET budget_spent = budget_spent + $1 WHERE id = $2", [cost, creativeInfo.campaign_id]);
        }
      }

      await c.query("COMMIT");
      return { recorded: true };
    } catch (e) {
      await c.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally { c.release(); }
  }

  /** Consulta los slots de patrocinio disponibles */
  async listSlots(): Promise<SponsorshipSlotRow[]> {
    // `closed_weeks`: semanas futuras cuya subasta ya se cerró, para que la interfaz no las ofrezca al pujar.
    const { rows } = await this.db.query<SponsorshipSlotRow>(
      `SELECT s.*, coalesce((SELECT array_agg(r.period_start::text ORDER BY r.period_start) FROM sponsorship_auction_results r WHERE r.slot_id = s.id AND r.period_start > current_date), '{}') AS closed_weeks
         FROM sponsorship_slots s WHERE s.is_active ORDER BY s.id`,
    );
    return rows;
  }
}
