import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { isIsoDate, todayInSantoDomingo } from "./domain/dates.js";
import type { PromoSnap } from "./domain/quote.js";

export interface PromotionRow {
  id: string; org_id: string; code: string; type: "percent" | "fixed"; value: number; listing_id: string | null;
  starts_at: string | null; ends_at: string | null; max_uses: number | null; uses: number; active: boolean; created_at: string;
}
export interface PromotionInput { code: string; type: "percent" | "fixed"; value: number; listing_id?: string | null; starts_at?: string | null; ends_at?: string | null; max_uses?: number | null; active?: boolean }

const COLUMNS = "id, org_id, code, type, value, listing_id, starts_at, ends_at, max_uses, uses, active, created_at";
const dto = (r: Record<string, unknown>): PromotionRow => ({ ...(r as unknown as PromotionRow), value: Number(r.value), created_at: new Date(r.created_at as string).toISOString() });

/** Códigos promocionales del operador (docs §5.10). */
export class PromotionService {
  constructor(private readonly db: Db) {}

  async list(orgId: string) {
    const { rows } = await this.db.query(`SELECT ${COLUMNS} FROM operator_promotions WHERE org_id = $1 ORDER BY created_at DESC`, [orgId]);
    return rows.map(dto);
  }

  private check(input: Partial<PromotionInput>) {
    if (input.type === "percent" && input.value !== undefined && (input.value <= 0 || input.value > 100)) throw AppError.validation("Un descuento porcentual va de 0 a 100");
    for (const f of ["starts_at", "ends_at"] as const) if (input[f] && !isIsoDate(input[f]!)) throw AppError.validation(`${f} debe ser una fecha YYYY-MM-DD`);
    if (input.starts_at && input.ends_at && input.ends_at < input.starts_at) throw AppError.validation("La fecha final es anterior a la inicial");
  }

  private async assertListing(orgId: string, listingId?: string | null) {
    if (!listingId) return;
    if (!(await this.db.query("SELECT 1 FROM operator_listings WHERE id = $1 AND org_id = $2", [listingId, orgId])).rowCount) throw AppError.validation("El anuncio no pertenece a tu organización");
  }

  async create(orgId: string, input: PromotionInput) {
    this.check(input);
    await this.assertListing(orgId, input.listing_id);
    try {
      const { rows } = await this.db.query(
        `INSERT INTO operator_promotions (id, org_id, code, type, value, listing_id, starts_at, ends_at, max_uses, active)
         VALUES ('promo_' || gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ${COLUMNS}`,
        [orgId, input.code.trim().toUpperCase(), input.type, input.value, input.listing_id ?? null, input.starts_at ?? null, input.ends_at ?? null, input.max_uses ?? null, input.active ?? true],
      );
      return dto(rows[0]);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya tienes un código igual", { reason: "CODE_TAKEN" });
      throw e;
    }
  }

  async update(orgId: string, id: string, patch: Partial<PromotionInput>) {
    this.check(patch);
    await this.assertListing(orgId, patch.listing_id);
    const cols: [string, unknown][] = [["code", patch.code?.trim().toUpperCase()], ["type", patch.type], ["value", patch.value], ["listing_id", patch.listing_id], ["starts_at", patch.starts_at], ["ends_at", patch.ends_at], ["max_uses", patch.max_uses], ["active", patch.active]];
    const set = cols.filter(([, v]) => v !== undefined);
    if (set.length) {
      const r = await this.db.query(`UPDATE operator_promotions SET ${set.map(([k], i) => `"${k}" = $${i + 3}`).join(", ")} WHERE id = $1 AND org_id = $2`, [id, orgId, ...set.map(([, v]) => v)]);
      if (!r.rowCount) throw AppError.notFound("Promoción");
    }
    const { rows } = await this.db.query(`SELECT ${COLUMNS} FROM operator_promotions WHERE id = $1 AND org_id = $2`, [id, orgId]);
    if (!rows[0]) throw AppError.notFound("Promoción");
    return dto(rows[0]);
  }

  async remove(orgId: string, id: string) {
    const r = await this.db.query("DELETE FROM operator_promotions WHERE id = $1 AND org_id = $2", [id, orgId]);
    if (!r.rowCount) throw AppError.notFound("Promoción");
  }

  /** Promoción vigente y aplicable a ese anuncio, o null (código inexistente, vencido, agotado, de otro anuncio o inactivo). */
  async findValid(c: Db | PoolClient, orgId: string, listingId: string, code: string, today = todayInSantoDomingo()): Promise<(PromoSnap & { id: string }) | null> {
    const { rows } = await c.query<{ id: string; code: string; type: "percent" | "fixed"; value: string }>(
      `SELECT id, code, type, value FROM operator_promotions
        WHERE org_id = $1 AND upper(code) = upper($2) AND active AND (starts_at IS NULL OR starts_at <= $3::date) AND (ends_at IS NULL OR ends_at >= $3::date)
          AND (max_uses IS NULL OR uses < max_uses) AND (listing_id IS NULL OR listing_id = $4)`,
      [orgId, code.trim(), today, listingId],
    );
    return rows[0] ? { id: rows[0].id, code: rows[0].code, type: rows[0].type, value: Number(rows[0].value) } : null;
  }
}
