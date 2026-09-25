import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { Mailer } from "../mailer/mailer.js";
import { audit } from "./team.js";
import { fromCents, toCents } from "./domain/money.js";

const PAYOUT_COLS = "id, org_id, currency, gross, commission, net, status, method, reference, created_at, paid_at";
const dto = (r: Record<string, unknown>) => ({ ...r, gross: Number(r.gross), commission: Number(r.commission), net: Number(r.net) });

/**
 * Liquidaciones a operadores (docs §5.10/§5.18). Sólo se liquida lo cobrado en línea (el operador ya tiene el efectivo de sus
 * cobros manuales) de reservas `completed`, menos reembolsos y la comisión. Cada reserva entra en un solo lote (`payout_items.booking_id` único).
 */
export class PayoutService {
  constructor(private readonly db: Db, private readonly mailer: Mailer) {}

  /** Genera un lote por organización y moneda con todo lo liquidable. Idempotente: lo ya liquidado no se repite. */
  async generate(opts: { orgId?: string } = {}) {
    const { rows } = await this.db.query<{ id: string; org_id: string; currency: string; net: string; rate: string; method: string | null }>(
      `SELECT b.id, b.org_id, b.currency, p.commission_rate AS rate, p.payout_method AS method,
              coalesce(sum(CASE WHEN pay.kind = 'refund' THEN -pay.amount ELSE pay.amount END), 0) AS net
         FROM bookings b JOIN partner_profiles p ON p.id = b.org_id JOIN booking_payments pay ON pay.booking_id = b.id AND pay.status = 'succeeded' AND pay.provider <> 'manual'
        WHERE b.status = 'completed' AND b.source = 'web' AND ($1::uuid IS NULL OR b.org_id = $1)
          AND NOT EXISTS (SELECT 1 FROM payout_items i WHERE i.booking_id = b.id)
        GROUP BY b.id, p.commission_rate, p.payout_method HAVING coalesce(sum(CASE WHEN pay.kind = 'refund' THEN -pay.amount ELSE pay.amount END), 0) > 0`, [opts.orgId ?? null],
    );
    const groups = new Map<string, { org_id: string; currency: string; method: string | null; items: { booking_id: string; gross: number; commission: number }[] }>();
    for (const r of rows) {
      const gross = toCents(Number(r.net));
      const g = groups.get(`${r.org_id}|${r.currency}`) ?? { org_id: r.org_id, currency: r.currency, method: r.method, items: [] };
      g.items.push({ booking_id: r.id, gross, commission: Math.round((gross * Number(r.rate)) / 100) });
      groups.set(`${r.org_id}|${r.currency}`, g);
    }
    const created: string[] = [];
    for (const g of groups.values()) {
      const gross = g.items.reduce((s, i) => s + i.gross, 0), commission = g.items.reduce((s, i) => s + i.commission, 0);
      if (gross - commission <= 0) continue;
      const c = await this.db.connect();
      try {
        await c.query("BEGIN");
        const p = await c.query<{ id: string }>("INSERT INTO payouts (org_id, currency, gross, commission, net, method) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [g.org_id, g.currency, fromCents(gross), fromCents(commission), fromCents(gross - commission), g.method]);
        for (const i of g.items) await c.query("INSERT INTO payout_items (payout_id, booking_id, gross, commission, net) VALUES ($1,$2,$3,$4,$5)", [p.rows[0]!.id, i.booking_id, fromCents(i.gross), fromCents(i.commission), fromCents(i.gross - i.commission)]);
        await c.query("COMMIT");
        created.push(p.rows[0]!.id);
      } catch (e) {
        await c.query("ROLLBACK");
        // Otra instancia liquidó alguna de estas reservas a la vez: se omite este grupo, la próxima corrida lo reintenta.
        if ((e as { code?: string }).code !== "23505") throw e;
      } finally { c.release(); }
    }
    return { payouts: created.length, ids: created };
  }

  async listForOrg(orgId: string, opts: { status?: string; page: number; per_page: number }) {
    const p: unknown[] = [orgId];
    let w = "org_id = $1";
    if (opts.status) { p.push(opts.status); w += ` AND status = $${p.length}`; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM payouts WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${PAYOUT_COLS} FROM payouts WHERE ${w} ORDER BY created_at DESC LIMIT ${opts.per_page} OFFSET ${(opts.page - 1) * opts.per_page}`, p);
    const pending = (await this.db.query("SELECT currency, coalesce(sum(net), 0) AS net FROM payouts WHERE org_id = $1 AND status = 'pending' GROUP BY currency", [orgId])).rows;
    return { rows: rows.map(dto), total, pending: pending.map((r) => ({ currency: r.currency, net: Number(r.net) })) };
  }

  async items(id: string, orgId?: string) {
    const { rows } = await this.db.query(
      `SELECT i.booking_id, b.reference, b.listing_title, b.date::text AS date, i.gross, i.commission, i.net FROM payout_items i JOIN payouts p ON p.id = i.payout_id JOIN bookings b ON b.id = i.booking_id
        WHERE i.payout_id = $1 AND ($2::uuid IS NULL OR p.org_id = $2) ORDER BY b.date`, [id, orgId ?? null],
    );
    if (!rows.length) throw AppError.notFound("Liquidación");
    return rows.map((r) => ({ ...r, gross: Number(r.gross), commission: Number(r.commission), net: Number(r.net) }));
  }

  async listAll(opts: { status?: string; org_id?: string; page: number; per_page: number }) {
    const p: unknown[] = [];
    const w = ["true"];
    if (opts.status) { p.push(opts.status); w.push(`p.status = $${p.length}`); }
    if (opts.org_id) { p.push(opts.org_id); w.push(`p.org_id = $${p.length}`); }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM payouts p WHERE ${w.join(" AND ")}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT p.id, p.org_id, o.business_name, p.currency, p.gross, p.commission, p.net, p.status, p.method, p.reference, p.created_at, p.paid_at FROM payouts p JOIN partner_profiles o ON o.id = p.org_id WHERE ${w.join(" AND ")} ORDER BY p.created_at DESC LIMIT ${opts.per_page} OFFSET ${(opts.page - 1) * opts.per_page}`, p);
    return { rows: rows.map(dto), total };
  }

  async markPaid(id: string, adminId: string, input: { reference: string }, ip?: string) {
    const r = await this.db.query<{ org_id: string; net: string; currency: string; email: string; name: string }>(
      "UPDATE payouts p SET status = 'paid', paid_at = now(), paid_by = $2, reference = $3 FROM partner_profiles o WHERE p.id = $1 AND p.status = 'pending' AND o.id = p.org_id RETURNING p.org_id, p.net, p.currency, o.email, o.business_name AS name",
      [id, adminId, input.reference.trim()],
    );
    if (!r.rows[0]) {
      const exists = await this.db.query("SELECT status FROM payouts WHERE id = $1", [id]);
      if (!exists.rowCount) throw AppError.notFound("Liquidación");
      throw new AppError("BUSINESS_RULE", "La liquidación ya no está pendiente", { code: "INVALID_STATE" });
    }
    const x = r.rows[0];
    await audit(this.db, { actor: adminId, action: "payout.paid", entity: "payout", id, org: x.org_id, meta: { reference: input.reference, net: Number(x.net) }, ip });
    await this.mailer.send({ to: x.email, template: "operator.payout_sent", locale: "es", data: { operator: x.name, amount: `${x.currency === "USD" ? "US$ " : "RD$ "}${Number(x.net).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, reference: input.reference.trim() } });
  }
}
