import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { fromCents, toCents } from "../../lib/money.js";
import { ATTRIBUTION_WINDOW_DAYS } from "./campaigns.js";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newCode = () => "CR-" + Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("");
export const MAX_ACTIVE_LINKS = 50;
type Db_ = Db | PoolClient;

/** Ruta interna del sitio a la que lleva un enlace: sin dominio, sin `//` y sin el propio `ref`. */
export function normalizeTarget(raw: string): string {
  const v = raw.trim();
  if (!/^\/(?!\/)/.test(v) || /[\s<>"']/.test(v)) throw AppError.validation("El destino debe ser una página de Descubre RD, por ejemplo /tienda o /destino/samana", [{ field: "target_path", issue: "invalid_path" }]);
  const url = new URL(v, "https://descubre.local");
  url.searchParams.delete("ref");
  return url.pathname + (url.search || "") + (url.hash || "");
}

export interface OrderBase { ref: string | null; email: string; base: number; live: boolean }

/**
 * Enlaces de afiliado de los creadores (docs §5.11). Comparten el `?ref=` de los embajadores: `track` cuenta el clic, `resolve`
 * decide si el código puede guardarse en un pedido y `syncOrder` deja la comisión en el libro del creador (`creator_ledger`),
 * estimada hasta que pasa la ventana de atribución. Todo se calcula con el pedido pagado; el navegador no aporta cifras.
 */
export class CreatorAffiliateService {
  constructor(private readonly db: Db) {}

  private async approvedCreator(userId: string) {
    const p = (await this.db.query<{ id: string; handle: string; commission_rate: string }>("SELECT id, handle, commission_rate FROM creator_profiles WHERE id = $1 AND status = 'approved'", [userId])).rows[0];
    if (!p) throw new AppError("FORBIDDEN", "Necesitas un perfil de creador aprobado", { code: "NOT_A_CREATOR" });
    return p;
  }

  // ---------- Panel del creador ----------
  async overview(userId: string) {
    const p = await this.approvedCreator(userId);
    const links = (await this.db.query(
      `SELECT l.id, l.code, l.target_path, l.label, l.clicks, l.signups, l.created_at,
              count(e.id) FILTER (WHERE e.source = 'affiliate_commission' AND e.status <> 'reversed')::int AS orders,
              coalesce(sum(e.amount) FILTER (WHERE e.status = 'estimated'), 0) AS estimated,
              coalesce(sum(e.amount) FILTER (WHERE e.status = 'confirmed'), 0) AS confirmed
         FROM creator_affiliate_links l LEFT JOIN creator_ledger e ON e.affiliate_link_id = l.id
        WHERE l.creator_id = $1 AND l.archived_at IS NULL
        GROUP BY l.id ORDER BY l.created_at DESC`, [userId],
    )).rows.map((l) => ({ ...l, estimated: Number(l.estimated), confirmed: Number(l.confirmed) }));
    const totals = links.reduce((t, l) => ({ clicks: t.clicks + l.clicks, signups: t.signups + l.signups, orders: t.orders + l.orders, estimated: t.estimated + l.estimated, confirmed: t.confirmed + l.confirmed }), { clicks: 0, signups: 0, orders: 0, estimated: 0, confirmed: 0 });
    return { commission_rate: Number(p.commission_rate), attribution_window_days: ATTRIBUTION_WINDOW_DAYS, max_links: MAX_ACTIVE_LINKS, totals, links };
  }

  async createLink(userId: string, input: { target_path: string; label?: string }) {
    await this.approvedCreator(userId);
    const target = normalizeTarget(input.target_path);
    const active = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM creator_affiliate_links WHERE creator_id = $1 AND archived_at IS NULL", [userId])).rows[0]!.n;
    if (active >= MAX_ACTIVE_LINKS) throw new AppError("BUSINESS_RULE", `Puedes tener hasta ${MAX_ACTIVE_LINKS} enlaces activos; archiva alguno para crear otro`, { code: "TOO_MANY_LINKS" });
    const existing = (await this.db.query("SELECT id, code, target_path, label, clicks, created_at FROM creator_affiliate_links WHERE creator_id = $1 AND target_path = $2 AND archived_at IS NULL", [userId, target])).rows[0];
    if (existing) return { ...existing, created: false };
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const row = (await this.db.query(
          "INSERT INTO creator_affiliate_links (creator_id, code, target_path, label) VALUES ($1,$2,$3,$4) RETURNING id, code, target_path, label, clicks, created_at",
          [userId, newCode(), target, input.label?.trim() || null],
        )).rows[0];
        return { ...row, created: true };
      } catch (err) { if ((err as { code?: string }).code !== "23505") throw err; }
    }
    throw new AppError("INTERNAL", "No se pudo generar un código único");
  }

  /** Archivar no borra: los pedidos ya atribuidos conservan su enlace, pero el código deja de atribuir compras nuevas. */
  async archiveLink(userId: string, linkId: string) {
    const r = await this.db.query("UPDATE creator_affiliate_links SET archived_at = now() WHERE id = $1 AND creator_id = $2 AND archived_at IS NULL", [linkId, userId]);
    if (!r.rowCount) throw AppError.notFound("Enlace");
  }

  // ---------- Atribución (la llama el programa de embajadores con los códigos que no son suyos) ----------
  async track(code: string): Promise<boolean> {
    const r = await this.db.query(
      `UPDATE creator_affiliate_links l SET clicks = clicks + 1 FROM creator_profiles p
        WHERE p.id = l.creator_id AND p.status = 'approved' AND upper(l.code) = upper($1) AND l.archived_at IS NULL RETURNING l.code`, [code.trim()],
    );
    return !!r.rowCount;
  }

  /** Código que puede guardarse en un pedido: enlace activo de un creador aprobado y sin autocompra. */
  async resolve(code: string, buyer: { userId?: string | null; email?: string | null }): Promise<string | null> {
    const l = (await this.db.query<{ code: string; creator_id: string; email: string }>(
      `SELECT l.code, l.creator_id, u.email FROM creator_affiliate_links l JOIN creator_profiles p ON p.id = l.creator_id JOIN users u ON u.id = l.creator_id
        WHERE upper(l.code) = upper($1) AND l.archived_at IS NULL AND p.status = 'approved'`, [code.trim()],
    )).rows[0];
    if (!l) return null;
    if (buyer.userId && buyer.userId === l.creator_id) return null;
    if (buyer.email && buyer.email.trim().toLowerCase() === l.email.toLowerCase()) return null;
    return l.code;
  }

  /**
   * Crea o ajusta la comisión del creador por un pedido. Idempotente (una fila por pedido): mientras está estimada se recalcula
   * con el importe vigente; si el pedido se reembolsa entero, la estimada se revierte y una ya confirmada recibe un reverso.
   * Devuelve false si el código no es de un creador (el llamador sigue con lo suyo).
   */
  async syncOrder(c: PoolClient, type: string, orderId: string, o: OrderBase): Promise<boolean> {
    if (!o.ref) return false;
    // El enlace archivado sigue contando para pedidos que ya lo llevaban: la atribución se decidió al comprar.
    const link = (await c.query<{ id: string; creator_id: string; target_path: string }>("SELECT id, creator_id, target_path FROM creator_affiliate_links WHERE upper(code) = upper($1)", [o.ref])).rows[0];
    if (!link) return false;
    const ref = `${type}:${orderId}`;
    const cur = (await c.query<{ id: string; amount: string; status: string }>("SELECT id, amount, status FROM creator_ledger WHERE source_ref = $1 FOR UPDATE", [ref])).rows[0];
    const rate = Number((await c.query<{ r: string }>("SELECT commission_rate AS r FROM creator_profiles WHERE id = $1", [link.creator_id])).rows[0]?.r ?? 0);
    const commission = o.live && o.base > 0 ? fromCents(Math.round((toCents(o.base) * rate) / 100)) : 0;
    const origin = `Enlace ${link.target_path} · pedido ${type === "store" ? "de la tienda" : "del marketplace"}`;

    if (!cur) {
      if (commission <= 0) return true;
      await c.query(
        "INSERT INTO creator_ledger (creator_id, source, amount, status, origin, attribution_window_days, affiliate_link_id, source_ref) VALUES ($1,'affiliate_commission',$2,'estimated',$3,$4,$5,$6)",
        [link.creator_id, commission, origin, ATTRIBUTION_WINDOW_DAYS, link.id, ref],
      );
      await this.bumpBalance(c, link.creator_id, commission);
      return true;
    }
    const before = Number(cur.amount);
    if (cur.status === "estimated") {
      if (commission <= 0) {
        await c.query("UPDATE creator_ledger SET status = 'reversed', reason = 'Pedido reembolsado o cancelado' WHERE id = $1", [cur.id]);
        await this.bumpBalance(c, link.creator_id, -before);
      } else if (commission !== before) {
        await c.query("UPDATE creator_ledger SET amount = $2 WHERE id = $1", [cur.id, commission]);
        await this.bumpBalance(c, link.creator_id, commission - before);
      }
    } else if (cur.status === "confirmed" && commission < before) {
      // Ya confirmada: no se reescribe; la diferencia queda como reverso visible para el creador (uno por pedido).
      const ins = await c.query(
        `INSERT INTO creator_ledger (creator_id, source, amount, status, origin, reverses_entry_id, reason, affiliate_link_id, source_ref)
         VALUES ($1,'reversal',$2,'confirmed',$3,$4,'Pedido reembolsado después de confirmarse la comisión',$5,$6) ON CONFLICT (source_ref) WHERE source_ref IS NOT NULL DO NOTHING`,
        [link.creator_id, -(before - commission), origin, cur.id, link.id, `${ref}:reversal`],
      );
      if (ins.rowCount) await this.bumpBalance(c, link.creator_id, -(before - commission));
    }
    return true;
  }

  // ---------- Reservas de operadores (hoteles, tours, rutas, agencias) ----------
  /** Vincula una reserva al enlace del creador si el anuncio participa en afiliados; guarda el % vigente al reservar. */
  async attachBooking(bookingId: string, code: string, buyer: { userId?: string | null; email?: string | null }) {
    const ref = await this.resolve(code, buyer);
    if (!ref) return;
    await this.db.query(
      `UPDATE bookings b SET affiliate_link_id = l.id, affiliate_rate = ol.affiliate_commission_percent
         FROM creator_affiliate_links l, operator_listings ol
        WHERE b.id = $1 AND upper(l.code) = upper($2) AND ol.id = b.listing_id AND ol.affiliate_commission_percent IS NOT NULL AND b.affiliate_link_id IS NULL`, [bookingId, ref],
    );
  }

  /**
   * Al liquidar una reserva afiliada: la parte del creador sobre lo que paga el negocio. Una sola vez por reserva.
   * shortcut: se abona ya confirmada al liquidar (pasado el plazo de retención); un ajuste posterior de la reserva no la reversa todavía.
   */
  async creditBooking(c: PoolClient, bookingId: string, grossCents: number) {
    const b = (await c.query<{ link: string; creator_id: string; rate: string; title: string }>(
      "SELECT b.affiliate_link_id AS link, l.creator_id, b.affiliate_rate AS rate, b.listing_title AS title FROM bookings b JOIN creator_affiliate_links l ON l.id = b.affiliate_link_id WHERE b.id = $1 AND b.affiliate_rate IS NOT NULL", [bookingId],
    )).rows[0];
    if (!b) return;
    const share = Number((await c.query<{ v: unknown }>("SELECT value AS v FROM site_settings WHERE key = 'creator_affiliate_share_percent'")).rows[0]?.v ?? 70);
    const amount = fromCents(Math.round((grossCents * Number(b.rate) * share) / 10_000));
    if (amount <= 0) return;
    const ins = await c.query(
      `INSERT INTO creator_ledger (creator_id, source, amount, status, origin, affiliate_link_id, source_ref, confirmed_at)
       VALUES ($1,'affiliate_commission',$2,'confirmed',$3,$4,$5, now()) ON CONFLICT (source_ref) WHERE source_ref IS NOT NULL DO NOTHING`,
      [b.creator_id, amount, `Reserva: ${b.title}`, b.link, `booking:${bookingId}`],
    );
    if (ins.rowCount) await this.bumpBalance(c, b.creator_id, amount);
  }

  private async bumpBalance(c: Db_, creatorId: string, delta: number) {
    if (!delta) return;
    await c.query("UPDATE creator_profiles SET balance_pending = GREATEST(0, balance_pending + $2), total_earnings = GREATEST(0, total_earnings + $2), updated_at = now() WHERE id = $1", [creatorId, delta]);
  }

  // ---------- Admin ----------
  /** Directorio de creadores para el equipo: perfil, contenido y rendimiento de sus enlaces. */
  async adminDirectory(f: { q?: string; status?: string; page: number; per_page: number }) {
    const where: string[] = [], params: unknown[] = [];
    if (f.q) { params.push(`%${f.q.toLowerCase()}%`); where.push(`(lower(p.handle) LIKE $${params.length} OR lower(p.display_name) LIKE $${params.length})`); }
    if (f.status) { params.push(f.status); where.push(`p.status = $${params.length}`); }
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM creator_profiles p ${w}`, params)).rows[0]!.n;
    params.push(f.per_page, (f.page - 1) * f.per_page);
    const rows = (await this.db.query(
      `SELECT p.id, p.handle, p.display_name, p.tier, p.status, p.total_views, p.total_earnings, p.balance_pending, p.commission_rate, p.social_channels, p.created_at,
              (SELECT count(*)::int FROM creator_videos v WHERE v.creator_id = p.id) AS videos,
              (SELECT count(*)::int FROM creator_affiliate_links l WHERE l.creator_id = p.id AND l.archived_at IS NULL) AS links,
              (SELECT coalesce(sum(l.clicks), 0)::int FROM creator_affiliate_links l WHERE l.creator_id = p.id) AS clicks,
              (SELECT count(*)::int FROM creator_ledger e WHERE e.creator_id = p.id AND e.affiliate_link_id IS NOT NULL AND e.source = 'affiliate_commission' AND e.status <> 'reversed') AS affiliate_orders
         FROM creator_profiles p ${w} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params,
    )).rows;
    return { rows, total };
  }
}
