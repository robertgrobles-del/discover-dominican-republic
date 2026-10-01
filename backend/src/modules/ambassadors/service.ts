import { randomBytes } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type { PoolClient } from "pg";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { MailerPort } from "../../contracts/email.js";
import type { NotifyFn } from "../../contracts/notifications.js";
import type { IdentityAdminPort } from "../../contracts/identity.js";
import { fromCents, toCents } from "../../lib/money.js";

export const HOLD_DAYS = 7;                 // la comisión queda en espera por si hay devolución
export const MIN_PAYOUT = 1000;             // RD$
export const COOKIE_DAYS = 30;
export const TIERS = [
  { tier: "bronze", from: 0, rate: 5 },
  { tier: "silver", from: 10, rate: 7 },
  { tier: "gold", from: 30, rate: 10 },
] as const;
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newCode = () => "EMB-" + Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
const money = (n: number) => `RD$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const tierFor = (sales: number) => [...TIERS].reverse().find((t) => sales >= t.from)!;

export type SourceType = "store" | "marketplace";
type Db_ = Db | PoolClient;

/**
 * Programa de embajadores (docs §5.11). La comisión no la informa el navegador: se calcula en el servidor a partir del pedido pagado
 * (`syncOrder`, idempotente por pedido) y se ajusta sola si el pedido se reembolsa o cancela. Flujo de cada comisión:
 * pending (en espera) → approved (disponible) → requested (en una solicitud de pago) → paid; o reversed.
 */
export class AmbassadorService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly mailer: MailerPort, private readonly log: FastifyBaseLogger, private readonly identity: Pick<IdentityAdminPort, "grantRole" | "revokeRole">) {}

  /** Aviso en la bandeja del embajador (lo asigna el arranque de la app). */
  notifyUser?: NotifyFn;

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  // ---------- Atribución ----------
  /** Valida el código de un enlace. Sólo cuenta el clic si el embajador está aprobado. */
  async track(ref: string) {
    const r = await this.db.query("UPDATE ambassadors SET clicks = clicks + 1 WHERE upper(referral_code) = upper($1) AND status = 'approved' AND is_active RETURNING referral_code", [ref.trim()]);
    return r.rows[0] ? { valid: true, ref: r.rows[0].referral_code as string, cookie_days: COOKIE_DAYS } : { valid: false, ref: null, cookie_days: 0 };
  }

  /** Código que se puede guardar en un pedido: existe, está aprobado y no es una autocompra. Un código inválido se ignora sin bloquear la compra. */
  async resolve(code: string | null | undefined, buyer: { userId?: string | null; email?: string | null }): Promise<string | null> {
    if (!code) return null;
    const a = (await this.db.query<{ id: string; referral_code: string; email: string }>("SELECT a.id, a.referral_code, u.email FROM ambassadors a JOIN users u ON u.id = a.id WHERE upper(a.referral_code) = upper($1) AND a.status = 'approved' AND a.is_active", [code.trim()])).rows[0];
    if (!a) return null;
    if (buyer.userId && buyer.userId === a.id) return null;
    if (buyer.email && buyer.email.trim().toLowerCase() === a.email.toLowerCase()) return null;
    return a.referral_code;
  }

  // ---------- Comisiones ----------
  private async rateOf(c: Db_, ambassadorId: string): Promise<number> {
    const a = (await c.query<{ commission_override: string | null; sales_count: number }>("SELECT commission_override, sales_count FROM ambassadors WHERE id = $1", [ambassadorId])).rows[0];
    if (!a) return 0;
    return a.commission_override !== null ? Number(a.commission_override) : tierFor(a.sales_count).rate;
  }

  /** Base comisionable y estado de un pedido, leídos del propio pedido. */
  private async orderBase(c: Db_, type: SourceType, id: string): Promise<{ ref: string | null; email: string; base: number; currency: string; live: boolean } | null> {
    if (type === "store") {
      const o = (await c.query("SELECT ref_code, customer_email, amount_paid, refund_amount, shipping, status FROM store_orders WHERE id = $1", [id])).rows[0];
      if (!o) return null;
      const net = toCents(Number(o.amount_paid)) - toCents(Number(o.refund_amount)) - toCents(Number(o.shipping));
      return { ref: o.ref_code, email: o.customer_email, base: fromCents(Math.max(0, net)), currency: "DOP", live: !["cancelled", "refunded"].includes(o.status) && Number(o.amount_paid) > 0 };
    }
    const o = (await c.query("SELECT ref_code, customer_email, amount_paid, status FROM marketplace_orders WHERE id = $1", [id])).rows[0];
    if (!o) return null;
    const sum = (await c.query<{ n: string }>("SELECT coalesce(sum(line_total), 0) AS n FROM marketplace_order_items WHERE order_id = $1 AND NOT refunded AND fulfillment_status <> 'cancelled'", [id])).rows[0]!.n;
    return { ref: o.ref_code, email: o.customer_email, base: Number(sum), currency: "DOP", live: !["cancelled", "refunded", "pending"].includes(o.status) && Number(o.amount_paid) > 0 };
  }

  /** Crea o ajusta la comisión de un pedido según su estado actual. Se llama tras un cobro, un reembolso o una cancelación. */
  async syncOrder(type: SourceType, orderId: string): Promise<void> {
    try {
      await this.tx(async (c) => {
        const o = await this.orderBase(c, type, orderId);
        if (!o?.ref) return;
        const amb = (await c.query<{ id: string }>("SELECT id FROM ambassadors WHERE upper(referral_code) = upper($1) FOR UPDATE", [o.ref])).rows[0];
        if (!amb) return;
        const cur = (await c.query<{ id: string; status: string; rate: string | null }>("SELECT id, status, rate FROM ambassador_referrals WHERE source_type = $1 AND source_id = $2 FOR UPDATE", [type, orderId])).rows[0];
        if (cur && ["requested", "paid"].includes(cur.status)) return;   // ya en una solicitud de pago: no se toca (un contracargo posterior se ve en el panel)
        if (!o.live || o.base <= 0) {
          if (cur && cur.status !== "reversed") await c.query("UPDATE ambassador_referrals SET status = 'reversed', sale_amount = $2, commission_earned = 0, updated_at = now() WHERE id = $1", [cur.id, o.base]);
        } else {
          const rate = cur?.rate !== null && cur?.rate !== undefined ? Number(cur.rate) : await this.rateOf(c, amb.id);
          const commission = fromCents(Math.round((toCents(o.base) * rate) / 100));
          if (cur) await c.query("UPDATE ambassador_referrals SET sale_amount = $2, commission_earned = $3, status = CASE WHEN status = 'reversed' THEN 'pending' ELSE status END, updated_at = now() WHERE id = $1", [cur.id, o.base, commission]);
          else await c.query("INSERT INTO ambassador_referrals (ambassador_id, referred_email, sale_amount, commission_earned, status, source_type, source_id, rate, hold_until) VALUES ($1,$2,$3,$4,'pending',$5,$6,$7, now() + make_interval(days => $8))", [amb.id, o.email.toLowerCase(), o.base, commission, type, orderId, rate, HOLD_DAYS]);
        }
        await this.recompute(c, amb.id);
      });
    } catch (err) { this.log.error({ err, type, orderId }, "No se pudo registrar la comisión del embajador"); }
  }

  /** Recalcula los contadores del embajador a partir de sus comisiones (no se llevan sumas incrementales). */
  private async recompute(c: Db_, ambassadorId: string) {
    await c.query(
      `UPDATE ambassadors a SET sales_count = s.sales, total_earned = s.earned, pending_payout = s.available, tier = CASE WHEN s.sales >= 30 THEN 'gold' WHEN s.sales >= 10 THEN 'silver' ELSE 'bronze' END, updated_at = now()
         FROM (SELECT count(*) FILTER (WHERE status IN ('approved','requested','paid'))::int AS sales,
                      coalesce(sum(commission_earned) FILTER (WHERE status IN ('approved','requested','paid')), 0) AS earned,
                      coalesce(sum(commission_earned) FILTER (WHERE status = 'approved'), 0) AS available
                 FROM ambassador_referrals WHERE ambassador_id = $1) s WHERE a.id = $1`, [ambassadorId],
    );
  }

  /** Libera las comisiones cuya espera terminó (trabajo `ambassadors.settle`). */
  async settle(): Promise<{ approved: number }> {
    // UPDATE + recompute en un solo tx: los contadores del embajador nunca quedan a mitad de la liberación.
    return this.tx(async (c) => {
      const { rows } = await c.query<{ ambassador_id: string }>("UPDATE ambassador_referrals SET status = 'approved', updated_at = now() WHERE status = 'pending' AND hold_until <= now() AND commission_earned > 0 RETURNING ambassador_id");
      for (const id of new Set(rows.map((r) => r.ambassador_id))) await this.recompute(c, id);
      return { approved: rows.length };
    });
  }

  // ---------- Solicitud y panel del embajador ----------
  async apply(userId: string, input: { motivation: string; audience?: string; social_links?: Record<string, string> }) {
    const u = (await this.db.query<{ email_verified_at: Date | null }>("SELECT email_verified_at FROM users WHERE id = $1", [userId])).rows[0];
    if (!u?.email_verified_at) throw new AppError("FORBIDDEN", "Verifica tu correo para solicitar ser embajador", { code: "EMAIL_NOT_VERIFIED" });
    const prev = (await this.db.query<{ status: string }>("SELECT status FROM ambassadors WHERE id = $1", [userId])).rows[0];
    if (prev && prev.status !== "rejected") throw new AppError("CONFLICT", prev.status === "approved" ? "Ya eres embajador" : "Ya tienes una solicitud en curso", { reason: "ALREADY_APPLIED", status: prev.status });
    if (prev) await this.db.query("UPDATE ambassadors SET status = 'pending', motivation = $2, audience = $3, social_links = $4, status_note = NULL, updated_at = now() WHERE id = $1", [userId, input.motivation, input.audience ?? null, input.social_links ?? {}]);
    else {
      for (let i = 0; i < 5; i++) {
        try { await this.db.query("INSERT INTO ambassadors (id, referral_code, status, is_active, motivation, audience, social_links) VALUES ($1,$2,'pending',false,$3,$4,$5)", [userId, newCode(), input.motivation, input.audience ?? null, input.social_links ?? {}]); break; }
        catch (e) { if ((e as { code?: string; constraint?: string }).code !== "23505" || (e as { constraint?: string }).constraint?.includes("pkey")) throw e; }
      }
    }
    return { status: "pending" };
  }

  async me(userId: string) {
    const a = (await this.db.query("SELECT id, referral_code, status, status_note, tier, sales_count, total_earned, pending_payout, clicks, commission_override, payout_method, payout_details, social_links, approved_at, created_at FROM ambassadors WHERE id = $1", [userId])).rows[0];
    if (!a) throw AppError.notFound("Solicitud de embajador");
    const agg = (await this.db.query("SELECT coalesce(sum(commission_earned) FILTER (WHERE status = 'pending'), 0) AS in_hold, coalesce(sum(commission_earned) FILTER (WHERE status = 'requested'), 0) AS requested, coalesce(sum(commission_earned) FILTER (WHERE status = 'paid'), 0) AS paid FROM ambassador_referrals WHERE ambassador_id = $1", [userId])).rows[0];
    const sales = a.sales_count as number;
    const cur = tierFor(sales), next = TIERS.find((t) => t.from > sales) ?? null;
    return {
      status: a.status, status_note: a.status_note, referral_code: a.referral_code, tier: cur.tier, commission_rate: a.commission_override !== null ? Number(a.commission_override) : cur.rate,
      next_tier: next ? { tier: next.tier, rate: next.rate, sales_needed: next.from - sales } : null,
      sales_count: sales, clicks: a.clicks, total_earned: Number(a.total_earned), available: Number(a.pending_payout), in_hold: Number(agg.in_hold), requested: Number(agg.requested), paid: Number(agg.paid),
      min_payout: MIN_PAYOUT, hold_days: HOLD_DAYS, payout_method: a.payout_method, payout_details: a.payout_details, social_links: a.social_links, approved_at: a.approved_at,
    };
  }

  private async approvedOnly(userId: string) {
    const a = (await this.db.query<{ status: string }>("SELECT status FROM ambassadors WHERE id = $1", [userId])).rows[0];
    if (!a || a.status !== "approved") throw new AppError("FORBIDDEN", "Necesitas ser embajador aprobado", { code: "NOT_AMBASSADOR" });
  }

  async updateProfile(userId: string, input: { payout_method?: string | null; payout_details?: string | null; social_links?: Record<string, string> }) {
    await this.approvedOnly(userId);
    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    await this.db.query(`UPDATE ambassadors SET ${entries.map(([k], i) => `${k} = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1`, [userId, ...entries.map(([, v]) => v)]);
    return this.me(userId);
  }

  async referrals(userId: string, page: number, perPage: number) {
    await this.approvedOnly(userId);
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM ambassador_referrals WHERE ambassador_id = $1", [userId])).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT id, referred_email, source_type, sale_amount, commission_earned, rate, status, hold_until, created_at FROM ambassador_referrals WHERE ambassador_id = $1 ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, [userId]);
    // El comprador aparece enmascarado: el embajador no necesita su correo completo.
    const mask = (e: string) => { const [u = "", d = ""] = e.split("@"); return `${u.slice(0, 2)}***@${d}`; };
    return { rows: rows.map((r) => ({ id: r.id, buyer: mask(r.referred_email), source_type: r.source_type, sale_amount: Number(r.sale_amount), commission: Number(r.commission_earned), rate: r.rate === null ? null : Number(r.rate), status: r.status, hold_until: r.hold_until, created_at: r.created_at })), total };
  }

  async payouts(userId: string) {
    await this.approvedOnly(userId);
    return (await this.db.query("SELECT id, amount, status, payout_method, reference, processed_at, created_at FROM ambassador_payouts WHERE ambassador_id = $1 ORDER BY created_at DESC LIMIT 100", [userId])).rows.map((p) => ({ ...p, amount: Number(p.amount) }));
  }

  /** Agrupa todo lo disponible en una solicitud de pago. Un solo pago abierto a la vez no hace falta: cada comisión entra en una solicitud como máximo. */
  async requestPayout(userId: string, input: { method?: string; details?: string }) {
    await this.approvedOnly(userId);
    const out = await this.tx(async (c) => {
      const a = (await c.query<{ payout_method: string | null; payout_details: string | null }>("SELECT payout_method, payout_details FROM ambassadors WHERE id = $1 FOR UPDATE", [userId])).rows[0]!;
      const method = input.method ?? a.payout_method, details = input.details ?? a.payout_details;
      if (!method || !details) throw new AppError("BUSINESS_RULE", "Indica cómo quieres recibir tu pago", { code: "PAYOUT_METHOD_REQUIRED" });
      const refs = (await c.query<{ id: string; commission_earned: string }>("SELECT id, commission_earned FROM ambassador_referrals WHERE ambassador_id = $1 AND status = 'approved' ORDER BY created_at FOR UPDATE", [userId])).rows;
      const total = refs.reduce((s, r) => s + toCents(Number(r.commission_earned)), 0);
      if (total < toCents(MIN_PAYOUT)) throw new AppError("BUSINESS_RULE", `El mínimo para solicitar un pago es ${money(MIN_PAYOUT)}`, { code: "BELOW_MINIMUM", available: fromCents(total), minimum: MIN_PAYOUT });
      const p = (await c.query<{ id: string }>("INSERT INTO ambassador_payouts (ambassador_id, amount, status, payout_method, payout_details) VALUES ($1,$2,'pending',$3,$4) RETURNING id", [userId, fromCents(total), method, details])).rows[0]!;
      await c.query("UPDATE ambassador_referrals SET status = 'requested', payout_id = $2, updated_at = now() WHERE id = ANY($1)", [refs.map((r) => r.id), p.id]);
      await c.query("UPDATE ambassadors SET payout_method = $2, payout_details = $3 WHERE id = $1", [userId, method, details]);
      await this.recompute(c, userId);
      return { id: p.id, amount: fromCents(total), commissions: refs.length };
    });
    return out;
  }

  // ---------- Administración ----------
  async adminList(f: { status?: string; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [], where = ["true"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.status) where.push(`a.status = ${bind(f.status)}`);
    if (f.q) { const ph = bind(`%${f.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(u.email ILIKE ${ph} OR a.referral_code ILIKE ${ph} OR p.display_name ILIKE ${ph})`); }
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ambassadors a JOIN users u ON u.id = a.id LEFT JOIN profiles p ON p.id = u.id WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT a.id, u.email, p.display_name, a.referral_code, a.status, a.tier, a.sales_count, a.total_earned, a.pending_payout, a.clicks, a.commission_override, a.created_at FROM ambassadors a JOIN users u ON u.id = a.id LEFT JOIN profiles p ON p.id = u.id WHERE ${w} ORDER BY a.created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    return { rows: rows.map((r) => ({ ...r, total_earned: Number(r.total_earned), pending_payout: Number(r.pending_payout), commission_override: r.commission_override === null ? null : Number(r.commission_override) })), total };
  }
  async adminGet(id: string) {
    const a = (await this.db.query("SELECT a.*, u.email, p.display_name FROM ambassadors a JOIN users u ON u.id = a.id LEFT JOIN profiles p ON p.id = u.id WHERE a.id = $1", [id])).rows[0];
    if (!a) throw AppError.notFound("Embajador");
    const recent = (await this.db.query("SELECT id, referred_email, source_type, source_id, sale_amount, commission_earned, status, created_at FROM ambassador_referrals WHERE ambassador_id = $1 ORDER BY created_at DESC LIMIT 50", [id])).rows.map((r) => ({ ...r, sale_amount: Number(r.sale_amount), commission_earned: Number(r.commission_earned) }));
    return { ...a, total_earned: Number(a.total_earned), pending_payout: Number(a.pending_payout), referrals: recent };
  }

  async adminSetStatus(id: string, input: { status?: "approved" | "rejected" | "suspended"; commission_override?: number | null; note?: string }) {
    const cur = (await this.db.query<{ status: string; referral_code: string; email: string; display_name: string | null }>("SELECT a.status, a.referral_code, u.email, p.display_name FROM ambassadors a JOIN users u ON u.id = a.id LEFT JOIN profiles p ON p.id = u.id WHERE a.id = $1", [id])).rows[0];
    if (!cur) throw AppError.notFound("Embajador");
    if (input.status === "approved" && cur.status === "rejected") throw new AppError("BUSINESS_RULE", "La solicitud fue rechazada; la persona debe volver a solicitarlo", { code: "INVALID_TRANSITION" });
    const sets: string[] = ["updated_at = now()"], p: unknown[] = [id];
    const bind = (v: unknown) => { p.push(v); return `$${p.length}`; };
    if (input.status) {
      sets.push(`status = ${bind(input.status)}`, `is_active = ${input.status === "approved"}`);
      if (input.status === "approved" && cur.status !== "approved") sets.push("approved_at = now()");
    }
    if (input.commission_override !== undefined) sets.push(`commission_override = ${bind(input.commission_override)}`);
    if (input.note !== undefined) sets.push(`status_note = ${bind(input.note)}`);
    await this.db.query(`UPDATE ambassadors SET ${sets.join(", ")} WHERE id = $1`, p);
    if (input.status === "approved" && cur.status !== "approved") {
      await this.notifyUser?.(id, { type: "system", title: "¡Ya eres embajador!", message: `Tu código es ${cur.referral_code}`, link: "/embajadores" });
      await this.identity.grantRole(id, "ambassador");
      await this.mailer.send({ to: cur.email, template: "ambassador.approved", locale: "es", data: { name: (cur.display_name ?? "").split(" ")[0] || "amigo", code: cur.referral_code, url: `${this.env.WEB_BASE_URL}/embajadores` } }).catch((err) => this.log.error({ err }, "No se pudo avisar la aprobación del embajador"));
    }
    if (input.status && input.status !== "approved" && cur.status === "approved") await this.identity.revokeRole(id, "ambassador");
    return this.adminGet(id);
  }

  async adminPayouts(f: { status?: string; page: number; per_page: number }) {
    const p: unknown[] = [];
    let w = "true";
    if (f.status) { p.push(f.status); w = "p.status = $1"; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ambassador_payouts p WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT p.id, p.ambassador_id, u.email, p.amount, p.status, p.payout_method, p.payout_details, p.reference, p.note, p.processed_at, p.created_at FROM ambassador_payouts p JOIN users u ON u.id = p.ambassador_id WHERE ${w} ORDER BY p.created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, p);
    return { rows: rows.map((r) => ({ ...r, amount: Number(r.amount) })), total };
  }

  /** Marca el pago como enviado, o como fallido (las comisiones vuelven a estar disponibles para pedirlas de nuevo). */
  async adminSettlePayout(id: string, input: { status: "paid" | "failed"; reference?: string; note?: string }) {
    const done = await this.tx(async (c) => {
      const p = (await c.query<{ ambassador_id: string; status: string; amount: string }>("SELECT ambassador_id, status, amount FROM ambassador_payouts WHERE id = $1 FOR UPDATE", [id])).rows[0];
      if (!p) throw AppError.notFound("Pago");
      if (p.status !== "pending") throw new AppError("BUSINESS_RULE", `El pago ya está en estado "${p.status}"`, { code: "INVALID_STATE" });
      if (input.status === "paid" && !input.reference) throw AppError.validation("Falta la referencia del pago");
      await c.query("UPDATE ambassador_payouts SET status = $2, reference = $3, note = $4, processed_at = now() WHERE id = $1", [id, input.status, input.reference ?? null, input.note ?? null]);
      await c.query("UPDATE ambassador_referrals SET status = $2, payout_id = CASE WHEN $2 = 'paid' THEN payout_id ELSE NULL END, updated_at = now() WHERE payout_id = $1 AND status = 'requested'", [id, input.status === "paid" ? "paid" : "approved"]);
      await this.recompute(c, p.ambassador_id);
      return { ambassador_id: p.ambassador_id, amount: Number(p.amount) };
    });
    if (input.status === "paid") {
      await this.notifyUser?.(done.ambassador_id, { type: "system", title: "Te enviamos tu pago de comisiones", message: `${money(done.amount)} · ref. ${input.reference}`, link: "/embajadores" });
      const u = (await this.db.query<{ email: string; display_name: string | null }>("SELECT u.email, p.display_name FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [done.ambassador_id])).rows[0];
      if (u) await this.mailer.send({ to: u.email, template: "ambassador.payout", locale: "es", data: { name: (u.display_name ?? "").split(" ")[0] || "amigo", amount: money(done.amount), reference: input.reference! } }).catch((err) => this.log.error({ err }, "No se pudo avisar el pago al embajador"));
    }
    return (await this.db.query("SELECT id, ambassador_id, amount, status, reference, note, processed_at FROM ambassador_payouts WHERE id = $1", [id])).rows.map((r) => ({ ...r, amount: Number(r.amount) }))[0];
  }
}
