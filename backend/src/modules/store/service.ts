import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type { PoolClient } from "pg";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { MailerPort } from "../../contracts/email.js";
import type { NotifyFn } from "../../contracts/notifications.js";
import { fromCents, pctOf, toCents } from "../../lib/money.js";
import type { PaymentGateway } from "../../contracts/payments.js";

export const FREE_SHIPPING_FROM = 2500;   // RD$
export const SHIPPING_FEE = 250;          // RD$
export const ITBIS_PCT = 18;              // los precios ya incluyen ITBIS; se informa el desglose
export const RETURN_WINDOW_HOURS = 72;
const MAX_LINE_QTY = 20;

const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newOrderId = () => "ORD-" + Array.from(randomBytes(8), (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
const money = (n: number) => `RD$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface Actor { userId?: string | null; cartToken?: string | null }
interface Product { id: string; slug: string; name: string; category: string; price: number; currency: string; stock: number; active: boolean; featured: boolean; emoji: string | null; tone: string | null; sizes: string[]; colors: string[]; tagline: string | null; description: string | null; includes: string[]; images: string[]; sort_order: number }
interface Line { item_id?: string; product: Product; size: string; color: string; quantity: number }
export interface Quote {
  lines: { product_id: string; name: string; size: string; color: string; quantity: number; unit_price: number; line_total: number }[];
  subtotal: number; discount: number; shipping: number; tax_included: number; total: number; total_usd: number; usd_rate: number; free_shipping_remaining: number;
  coupon: { code: string; applied: boolean; reason?: string } | null;
}
type CouponRow = { id: string; code: string; discount_percentage: number | null; discount_amount: number | null; expires_at: Date | null; max_uses: number | null; uses_count: number; min_subtotal: number | null; per_user_limit: number };

const PRODUCT_COLS = "id, slug, name, category, price, currency, stock, active AS active, featured, emoji, tone, sizes, colors, tagline, description, includes, images, sort_order";
const toProduct = (r: Record<string, unknown>): Product => ({ ...(r as unknown as Product), price: Number(r.price) });

/** Tienda oficial: catálogo, carrito, cotización, pedidos con stock bloqueado, pagos y devoluciones (docs §5.9). */
export class StoreService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly gateway: PaymentGateway, private readonly mailer: MailerPort, private readonly log: FastifyBaseLogger) {}

  /** Aviso de que un pedido cambió su dinero (cobro, reembolso, cancelación); lo usa el programa de embajadores. */
  onMoneyChange?: (orderId: string) => Promise<void>;

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  async usdRate(c: Db | PoolClient = this.db): Promise<number> {
    const r = (await c.query<{ sell_rate: string }>("SELECT sell_rate FROM exchange_rates WHERE currency_code = 'USD' ORDER BY rate_date DESC LIMIT 1")).rows[0];
    return r ? Number(r.sell_rate) : this.env.DEFAULT_USD_DOP;
  }

  // ---------- Catálogo ----------
  dto(p: Product, rate: number) {
    return { id: p.id, slug: p.slug, name: p.name, category: p.category, price: p.price, currency: p.currency, price_usd: Math.round((p.price / rate) * 100) / 100, in_stock: p.stock > 0, low_stock: p.stock > 0 && p.stock <= 5 ? p.stock : null, featured: p.featured, emoji: p.emoji, tone: p.tone, sizes: p.sizes, colors: p.colors, tagline: p.tagline, description: p.description, includes: p.includes, images: p.images };
  }

  async products(f: { category?: string; featured?: boolean; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [], where = ["active", "deleted_at IS NULL"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.category) where.push(`category = ${bind(f.category)}`);
    if (f.featured) where.push("featured");
    if (f.q) { const ph = bind(`%${f.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(lower(f_unaccent(name)) LIKE lower(f_unaccent(${ph})) ESCAPE '\\' OR lower(f_unaccent(coalesce(tagline, ''))) LIKE lower(f_unaccent(${ph})) ESCAPE '\\')`); }
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM store_products WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${PRODUCT_COLS} FROM store_products WHERE ${w} ORDER BY featured DESC, sort_order, name LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    const rate = await this.usdRate();
    return { rows: rows.map((r) => this.dto(toProduct(r), rate)), total };
  }
  async product(slug: string) {
    const r = (await this.db.query(`SELECT ${PRODUCT_COLS} FROM store_products WHERE slug = $1 AND active AND deleted_at IS NULL`, [slug])).rows[0];
    if (!r) throw AppError.notFound("Producto");
    return this.dto(toProduct(r), await this.usdRate());
  }
  async categories() {
    return (await this.db.query("SELECT category, count(*)::int AS products FROM store_products WHERE active AND deleted_at IS NULL GROUP BY category ORDER BY category")).rows;
  }

  // ---------- Carrito ----------
  /** Carrito de la cuenta o del invitado (token en `X-Cart-Token`). Con `create` lo crea si falta. */
  private async cartFor(actor: Actor, create: boolean, c: Db | PoolClient = this.db): Promise<{ id: string; coupon_code: string | null; token?: string } | null> {
    if (actor.userId) {
      let row = (await c.query<{ id: string; coupon_code: string | null }>("SELECT id, coupon_code FROM store_carts WHERE user_id = $1", [actor.userId])).rows[0];
      if (!row && create) row = (await c.query<{ id: string; coupon_code: string | null }>("INSERT INTO store_carts (user_id) VALUES ($1) ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO UPDATE SET updated_at = now() RETURNING id, coupon_code", [actor.userId])).rows[0];
      return row ?? null;
    }
    if (actor.cartToken) {
      const row = (await c.query<{ id: string; coupon_code: string | null }>("SELECT id, coupon_code FROM store_carts WHERE guest_hash = $1", [sha(actor.cartToken)])).rows[0];
      if (row) return row;
    }
    if (!create) return null;
    const token = randomBytes(24).toString("base64url");
    const row = (await c.query<{ id: string }>("INSERT INTO store_carts (guest_hash) VALUES ($1) RETURNING id", [sha(token)])).rows[0]!;
    return { id: row.id, coupon_code: null, token };
  }

  private async linesOf(cartId: string, c: Db | PoolClient = this.db, lock = false): Promise<Line[]> {
    const { rows } = await c.query(
      `SELECT ci.id AS item_id, ci.size, ci.color, ci.quantity, ${PRODUCT_COLS.split(", ").map((x) => x === "active AS active" ? "p.active AS active" : `p.${x}`).join(", ")}
         FROM store_cart_items ci JOIN store_products p ON p.id = ci.product_id WHERE ci.cart_id = $1 AND p.deleted_at IS NULL ORDER BY ci.created_at, ci.id${lock ? " FOR UPDATE OF p" : ""}`, [cartId],
    );
    return rows.map((r) => ({ item_id: r.item_id, size: r.size, color: r.color, quantity: r.quantity, product: toProduct(r) }));
  }

  async cart(actor: Actor) {
    const cart = await this.cartFor(actor, false);
    if (!cart) return { items: [], count: 0, subtotal: 0, coupon_code: null };
    const lines = await this.linesOf(cart.id);
    const rate = await this.usdRate();
    const items = lines.map((l) => ({ id: l.item_id, product: this.dto(l.product, rate), size: l.size || null, color: l.color || null, quantity: l.quantity, unit_price: l.product.price, line_total: fromCents(toCents(l.product.price) * l.quantity), available: l.product.active && l.product.stock >= l.quantity, max_quantity: Math.min(MAX_LINE_QTY, l.product.stock) }));
    return { items, count: items.reduce((s, i) => s + i.quantity, 0), subtotal: fromCents(items.reduce((s, i) => s + toCents(i.line_total), 0)), coupon_code: cart.coupon_code };
  }

  private checkVariant(p: Product, size: string, color: string) {
    if (p.sizes.length && !p.sizes.includes(size)) throw AppError.validation(`Elige una talla: ${p.sizes.join(", ")}`, { field: "size" });
    if (!p.sizes.length && size) throw AppError.validation("Este producto no tiene tallas", { field: "size" });
    if (p.colors.length && !p.colors.includes(color)) throw AppError.validation(`Elige un color: ${p.colors.join(", ")}`, { field: "color" });
    if (!p.colors.length && color) throw AppError.validation("Este producto no tiene colores", { field: "color" });
  }

  async addItem(actor: Actor, input: { product_id: string; size?: string; color?: string; quantity: number }) {
    const p = (await this.db.query(`SELECT ${PRODUCT_COLS} FROM store_products WHERE id = $1 AND active AND deleted_at IS NULL`, [input.product_id])).rows[0];
    if (!p) throw AppError.notFound("Producto");
    const prod = toProduct(p), size = input.size ?? "", color = input.color ?? "";
    this.checkVariant(prod, size, color);
    const cart = (await this.cartFor(actor, true))!;
    const cur = (await this.db.query<{ quantity: number }>("SELECT quantity FROM store_cart_items WHERE cart_id = $1 AND product_id = $2 AND size = $3 AND color = $4", [cart.id, prod.id, size, color])).rows[0]?.quantity ?? 0;
    const next = cur + input.quantity;
    if (next > MAX_LINE_QTY) throw new AppError("BUSINESS_RULE", `Máximo ${MAX_LINE_QTY} unidades por producto`, { code: "MAX_QUANTITY" });
    if (next > prod.stock) throw new AppError("BUSINESS_RULE", prod.stock ? `Sólo quedan ${prod.stock} unidades` : "Producto agotado", { code: "STOCK_INSUFFICIENT", available: prod.stock });
    await this.db.query("INSERT INTO store_cart_items (cart_id, product_id, size, color, quantity) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (cart_id, product_id, size, color) DO UPDATE SET quantity = $5", [cart.id, prod.id, size, color, next]);
    await this.db.query("UPDATE store_carts SET updated_at = now() WHERE id = $1", [cart.id]);
    return { cart: await this.cart(actor.userId ? actor : { cartToken: cart.token ?? actor.cartToken }), cart_token: cart.token ?? null };
  }

  async setQuantity(actor: Actor, itemId: string, quantity: number) {
    const cart = await this.cartFor(actor, false);
    const row = cart ? (await this.db.query<{ stock: number }>("SELECT p.stock FROM store_cart_items ci JOIN store_products p ON p.id = ci.product_id WHERE ci.id = $1 AND ci.cart_id = $2", [itemId, cart.id])).rows[0] : null;
    if (!cart || !row) throw AppError.notFound("Artículo del carrito");
    if (quantity > Math.min(MAX_LINE_QTY, row.stock)) throw new AppError("BUSINESS_RULE", row.stock ? `Sólo quedan ${row.stock} unidades` : "Producto agotado", { code: "STOCK_INSUFFICIENT", available: row.stock });
    await this.db.query("UPDATE store_cart_items SET quantity = $2 WHERE id = $1", [itemId, quantity]);
    return this.cart(actor);
  }
  async removeItem(actor: Actor, itemId: string) {
    const cart = await this.cartFor(actor, false);
    if (!cart || !(await this.db.query("DELETE FROM store_cart_items WHERE id = $1 AND cart_id = $2", [itemId, cart.id])).rowCount) throw AppError.notFound("Artículo del carrito");
    return this.cart(actor);
  }
  async clear(actor: Actor) {
    const cart = await this.cartFor(actor, false);
    if (cart) { await this.db.query("DELETE FROM store_cart_items WHERE cart_id = $1", [cart.id]); await this.db.query("UPDATE store_carts SET coupon_code = NULL WHERE id = $1", [cart.id]); }
  }

  /** Al iniciar sesión se fusiona el carrito de invitado con el de la cuenta (sumando cantidades hasta el tope y el stock). */
  async merge(userId: string, guestToken: string) {
    return this.tx(async (c) => {
      const guest = (await c.query<{ id: string; coupon_code: string | null }>("SELECT id, coupon_code FROM store_carts WHERE guest_hash = $1 FOR UPDATE", [sha(guestToken)])).rows[0];
      if (!guest) return { merged: 0 };
      const mine = (await this.cartFor({ userId }, true, c))!;
      const { rows } = await c.query<{ product_id: string; size: string; color: string; quantity: number; stock: number; active: boolean }>("SELECT ci.product_id, ci.size, ci.color, ci.quantity, p.stock, p.active FROM store_cart_items ci JOIN store_products p ON p.id = ci.product_id WHERE ci.cart_id = $1 AND p.deleted_at IS NULL", [guest.id]);
      let merged = 0;
      for (const r of rows) {
        if (!r.active || r.stock <= 0) continue;
        await c.query(
          `INSERT INTO store_cart_items (cart_id, product_id, size, color, quantity) VALUES ($1,$2,$3,$4,LEAST($5::int, $6::int, $7::int))
           ON CONFLICT (cart_id, product_id, size, color) DO UPDATE SET quantity = LEAST(store_cart_items.quantity + $5::int, $6::int, $7::int)`, [mine.id, r.product_id, r.size, r.color, r.quantity, MAX_LINE_QTY, r.stock],
        );
        merged++;
      }
      if (guest.coupon_code && !mine.coupon_code) await c.query("UPDATE store_carts SET coupon_code = $2 WHERE id = $1", [mine.id, guest.coupon_code]);
      await c.query("DELETE FROM store_carts WHERE id = $1", [guest.id]);
      return { merged };
    });
  }

  // ---------- Cupones y cotización ----------
  private async findCoupon(c: Db | PoolClient, code: string, lock = false): Promise<CouponRow | null> {
    const r = (await c.query(`SELECT id, code, discount_percentage, discount_amount, expires_at, max_uses, uses_count, min_subtotal, per_user_limit FROM discount_coupons WHERE upper(code) = upper($1) AND is_active${lock ? " FOR UPDATE" : ""}`, [code.trim()])).rows[0];
    return r ? { ...r, discount_percentage: r.discount_percentage === null ? null : Number(r.discount_percentage), discount_amount: r.discount_amount === null ? null : Number(r.discount_amount), min_subtotal: r.min_subtotal === null ? null : Number(r.min_subtotal) } : null;
  }

  /** Devuelve el descuento en centavos o el motivo por el que no aplica. */
  private async couponDiscount(c: Db | PoolClient, code: string, subtotalCents: number, userKey: string | null, lock = false): Promise<{ coupon: CouponRow | null; cents: number; reason?: string }> {
    const coupon = await this.findCoupon(c, code, lock);
    if (!coupon) return { coupon: null, cents: 0, reason: "El cupón no existe o no está activo" };
    if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) return { coupon, cents: 0, reason: "El cupón venció" };
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) return { coupon, cents: 0, reason: "El cupón ya no tiene usos disponibles" };
    if (coupon.min_subtotal !== null && subtotalCents < toCents(coupon.min_subtotal)) return { coupon, cents: 0, reason: `Compra mínima de ${money(coupon.min_subtotal)}` };
    if (userKey) {
      const used = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM coupon_redemptions WHERE coupon_id = $1 AND user_key = $2", [coupon.id, userKey])).rows[0]!.n;
      if (used >= coupon.per_user_limit) return { coupon, cents: 0, reason: "Ya usaste este cupón" };
    }
    const cents = coupon.discount_percentage ? pctOf(subtotalCents, coupon.discount_percentage) : Math.min(subtotalCents, toCents(coupon.discount_amount ?? 0));
    return { coupon, cents };
  }

  private async price(c: Db | PoolClient, lines: Line[], couponCode: string | null, userKey: string | null, lock = false): Promise<Quote & { _coupon: CouponRow | null; _discountCents: number }> {
    if (!lines.length) throw new AppError("BUSINESS_RULE", "Tu carrito está vacío", { code: "EMPTY_CART" });
    const qLines = lines.map((l) => ({ product_id: l.product.id, name: l.product.name, size: l.size, color: l.color, quantity: l.quantity, unit_price: l.product.price, line_total: fromCents(toCents(l.product.price) * l.quantity) }));
    const subtotal = qLines.reduce((s, l) => s + toCents(l.line_total), 0);
    let discount = 0, coupon: Quote["coupon"] = null, couponRow: CouponRow | null = null;
    if (couponCode) {
      const r = await this.couponDiscount(c, couponCode, subtotal, userKey, lock);
      couponRow = r.cents > 0 ? r.coupon : null;
      discount = r.cents;
      coupon = { code: couponCode.trim().toUpperCase(), applied: r.cents > 0, ...(r.reason ? { reason: r.reason } : {}) };
    }
    const net = subtotal - discount;
    const shipping = net >= toCents(FREE_SHIPPING_FROM) ? 0 : toCents(SHIPPING_FEE);
    const total = net + shipping;
    const rate = await this.usdRate(c);
    return {
      lines: qLines, subtotal: fromCents(subtotal), discount: fromCents(discount), shipping: fromCents(shipping), tax_included: fromCents(Math.round((total * ITBIS_PCT) / (100 + ITBIS_PCT))), total: fromCents(total),
      total_usd: Math.round((fromCents(total) / rate) * 100) / 100, usd_rate: rate, free_shipping_remaining: fromCents(Math.max(0, toCents(FREE_SHIPPING_FROM) - net)), coupon, _coupon: couponRow, _discountCents: discount,
    };
  }

  async quote(actor: Actor, couponCode?: string) {
    const cart = await this.cartFor(actor, false);
    if (!cart) throw new AppError("BUSINESS_RULE", "Tu carrito está vacío", { code: "EMPTY_CART" });
    const lines = await this.linesOf(cart.id);
    const code = couponCode ?? cart.coupon_code;
    const q = await this.price(this.db, lines, code, actor.userId ?? null);
    const issues = lines.filter((l) => !l.product.active || l.product.stock < l.quantity).map((l) => ({ code: "STOCK_INSUFFICIENT", product_id: l.product.id, name: l.product.name, available: l.product.active ? l.product.stock : 0 }));
    const { _coupon, _discountCents, ...pub } = q;
    void _coupon; void _discountCents;
    return { ...pub, valid: issues.length === 0, issues };
  }

  async validateCoupon(code: string, subtotal: number, userId?: string | null) {
    const r = await this.couponDiscount(this.db, code, toCents(subtotal), userId ?? null);
    return r.cents > 0 ? { valid: true, code: r.coupon!.code, discount: fromCents(r.cents), type: r.coupon!.discount_percentage ? "percent" : "amount" } : { valid: false, reason: r.reason ?? "El cupón no aplica a esta compra" };
  }
  async applyCoupon(actor: Actor, code: string | null) {
    const cart = await this.cartFor(actor, true);
    if (code) { const cur = await this.cart(actor); const r = await this.couponDiscount(this.db, code, toCents(cur.subtotal), actor.userId ?? null); if (r.cents === 0) throw new AppError("BUSINESS_RULE", r.reason ?? "El cupón no aplica", { code: "COUPON_INVALID" }); }
    await this.db.query("UPDATE store_carts SET coupon_code = $2 WHERE id = $1", [cart!.id, code ? code.trim().toUpperCase() : null]);
  }

  // ---------- Pedidos ----------
  private orderSelect = "id, user_id, customer_name, customer_email, phone, address, city, province, notes, subtotal, discount, shipping, tax, total, currency, coupon_code, status, payment_status, amount_paid, refund_amount, courier_name, tracking_number, shipped_at, delivered_at, cancelled_at, cancel_reason, return_requested_at, return_reason, created_at, access_hash, fx_rate";
  private async orderDto(id: string, c: Db | PoolClient = this.db) {
    const o = (await c.query(`SELECT ${this.orderSelect} FROM store_orders WHERE id = $1`, [id])).rows[0];
    if (!o) return null;
    const items = (await c.query("SELECT product_id, name, size, color, unit_price, quantity, line_total FROM store_order_items WHERE order_id = $1 ORDER BY name", [id])).rows.map((i) => ({ ...i, unit_price: Number(i.unit_price), line_total: Number(i.line_total) }));
    const { access_hash: _h, user_id: _u, ...rest } = o;
    void _h; void _u;
    const n = (v: unknown) => Number(v);
    return { ...rest, subtotal: n(o.subtotal), discount: n(o.discount), shipping: n(o.shipping), tax: n(o.tax), total: n(o.total), amount_paid: n(o.amount_paid), refund_amount: n(o.refund_amount), fx_rate: o.fx_rate === null ? null : n(o.fx_rate), items, return_window_open: o.status === "delivered" && !!o.delivered_at && Date.now() - new Date(o.delivered_at).getTime() < RETURN_WINDOW_HOURS * 3_600_000 };
  }

  async createOrder(input: { actor: Actor; contact: { name: string; email: string; phone?: string }; shipping: { address: string; city: string; province?: string; notes?: string }; couponCode?: string; paymentToken?: string; idempotencyKey: string; locale?: "es" | "en"; refCode?: string | null }) {
    const email = input.contact.email.trim().toLowerCase();
    const idemScope = input.actor.userId ?? email;
    const prev = (await this.db.query<{ id: string; customer_email: string }>("SELECT id, customer_email FROM store_orders WHERE coalesce(user_id::text, lower(customer_email)) = $1 AND idempotency_key = $2", [idemScope, input.idempotencyKey])).rows[0];
    if (prev) return { order: (await this.orderDto(prev.id))!, accessToken: null as string | null, replayed: true };
    if (this.gateway.name === "none") throw new AppError("SERVICE_UNAVAILABLE", "Los pagos en línea no están habilitados todavía");
    if (!input.paymentToken) throw AppError.validation("Falta payment_method_token");

    const accessToken = randomBytes(24).toString("base64url");
    const orderId = newOrderId();
    const refCode = input.refCode ?? null;
    let priced!: Awaited<ReturnType<StoreService["price"]>>;
    try {
      await this.tx(async (c) => {
        const cart = await this.cartFor(input.actor, false, c);
        if (!cart) throw new AppError("BUSINESS_RULE", "Tu carrito está vacío", { code: "EMPTY_CART" });
        // Se bloquean los productos en orden de id (evita interbloqueos entre pedidos que comparten artículos).
        const lines = (await this.linesOf(cart.id, c, false));
        const ids = [...new Set(lines.map((l) => l.product.id))].sort();
        const locked = (await c.query(`SELECT ${PRODUCT_COLS} FROM store_products WHERE id = ANY($1) ORDER BY id FOR UPDATE`, [ids])).rows.map(toProduct);
        for (const l of lines) l.product = locked.find((p) => p.id === l.product.id) ?? l.product;
        const issues = lines.filter((l) => !l.product.active || l.product.stock < l.quantity);
        if (issues.length) throw new AppError("BUSINESS_RULE", "Algunos productos ya no tienen stock suficiente", { code: "STOCK_INSUFFICIENT", items: issues.map((l) => ({ product_id: l.product.id, name: l.product.name, available: l.product.active ? l.product.stock : 0 })) });
        for (const l of lines) this.checkVariant(l.product, l.size, l.color);
        priced = await this.price(c, lines, input.couponCode ?? cart.coupon_code, input.actor.userId ?? email, true);
        if (input.couponCode && !priced.coupon?.applied) throw new AppError("BUSINESS_RULE", priced.coupon?.reason ?? "El cupón no aplica", { code: "COUPON_INVALID" });
        await c.query(
          `INSERT INTO store_orders (id, user_id, customer_name, customer_email, phone, address, city, province, notes, subtotal, discount, shipping, tax, total, coupon_code, status, payment_status, fx_rate, access_hash, idempotency_key, items, ref_code)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending','unpaid',$16,$17,$18,'[]',$19)`,
          [orderId, input.actor.userId ?? null, input.contact.name.trim(), email, input.contact.phone?.trim() ?? null, input.shipping.address.trim(), input.shipping.city.trim(), input.shipping.province?.trim() ?? null, input.shipping.notes?.trim() ?? null,
            priced.subtotal, priced.discount, priced.shipping, priced.tax_included, priced.total, priced._coupon ? priced._coupon.code : null, priced.usd_rate, sha(accessToken), input.idempotencyKey, refCode],
        );
        for (const l of priced.lines) {
          await c.query("INSERT INTO store_order_items (order_id, product_id, name, size, color, unit_price, quantity, line_total) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [orderId, l.product_id, l.name, l.size || null, l.color || null, l.unit_price, l.quantity, l.line_total]);
          const dec = await c.query("UPDATE store_products SET stock = stock - $2, updated_at = now() WHERE id = $1 AND stock >= $2", [l.product_id, l.quantity]);
          if (!dec.rowCount) throw new AppError("BUSINESS_RULE", "Un producto se agotó mientras comprabas", { code: "STOCK_INSUFFICIENT", product_id: l.product_id });
        }
        if (priced._coupon) {
          await c.query("UPDATE discount_coupons SET uses_count = uses_count + 1 WHERE id = $1", [priced._coupon.id]);
          await c.query("INSERT INTO coupon_redemptions (coupon_id, order_id, user_key) VALUES ($1,$2,$3)", [priced._coupon.id, orderId, input.actor.userId ?? email]);
        }
      });
    } catch (e) {
      // Dos envíos con la misma llave a la vez: gana el primero, el otro devuelve ese pedido.
      if ((e as { code?: string }).code === "23505") {
        const again = (await this.db.query<{ id: string }>("SELECT id FROM store_orders WHERE coalesce(user_id::text, lower(customer_email)) = $1 AND idempotency_key = $2", [idemScope, input.idempotencyKey])).rows[0];
        if (again) return { order: (await this.orderDto(again.id))!, accessToken: null as string | null, replayed: true };
      }
      throw e;
    }

    // ----- Cobro (fuera de la transacción) -----
    const charge = this.chargeAmounts(priced.total, priced.usd_rate);
    if (priced.total > 0) {
      let result;
      try {
        result = await this.gateway.charge({ amount: charge.amount, currency: charge.currency, token: input.paymentToken, reference: orderId, idempotencyKey: `${orderId}:full:${sha(input.paymentToken).slice(0, 12)}`, metadata: { order_id: orderId, kind: "full" } });
      } catch (err) {
        await this.abandon(orderId, "payment_provider_error");
        this.log.error({ err, orderId }, "Falló la pasarela de pago de la tienda");
        throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el pago. No se realizó ningún cobro; intenta de nuevo.");
      }
      if (!result.ok) {
        await this.abandon(orderId, `payment_${result.reason}`);
        throw new AppError("PAYMENT_FAILED", "El pago fue rechazado. No se realizó ningún cobro.", { reason: result.reason });
      }
      await this.recordPayment(orderId, { amount: priced.total, chargedAmount: charge.amount, chargedCurrency: charge.currency, provider: this.gateway.name, ref: result.providerRef });
    } else {
      await this.db.query("UPDATE store_orders SET status = 'paid', payment_status = 'paid', updated_at = now() WHERE id = $1", [orderId]);
    }
    await this.onMoneyChange?.(orderId);
    // Con el pago confirmado se vacía el carrito (si el cobro falla, el cliente conserva su carrito para reintentar).
    const cart = await this.cartFor(input.actor, false);
    if (cart) { await this.db.query("DELETE FROM store_cart_items WHERE cart_id = $1", [cart.id]); await this.db.query("UPDATE store_carts SET coupon_code = NULL, updated_at = now() WHERE id = $1", [cart.id]); }
    const order = (await this.orderDto(orderId))!;
    await this.mailer.send({ to: email, template: "store.order_confirmation", locale: input.locale ?? "es", data: { name: input.contact.name.split(" ")[0]!, reference: orderId, total: money(priced.total), items: priced.lines.map((l) => `${l.quantity} × ${l.name}${l.size ? ` (${l.size})` : ""}`).join(", "), url: `${this.env.WEB_BASE_URL}/tienda/pedido/${orderId}` } }).catch((err) => this.log.error({ err, orderId }, "No se pudo enviar la confirmación del pedido"));
    return { order, accessToken, replayed: false };
  }

  /** Con Stripe se cobra en USD (Stripe no procesa DOP); con el resto de pasarelas, en la moneda del pedido. */
  private chargeAmounts(totalDop: number, rate: number) {
    return this.gateway.name === "stripe" ? { amount: Math.round((totalDop / rate) * 100) / 100, currency: "USD" } : { amount: totalDop, currency: "DOP" };
  }

  /** Registra un cobro confirmado (idempotente por proveedor y referencia: el webhook y la respuesta directa pueden competir). */
  async recordPayment(orderId: string, p: { amount: number; chargedAmount: number; chargedCurrency: string; provider: string; ref: string }): Promise<"recorded" | "duplicate"> {
    try {
      await this.tx(async (c) => {
        await c.query("INSERT INTO store_payments (order_id, kind, amount, charged_amount, charged_currency, provider, provider_ref) VALUES ($1,'full',$2,$3,$4,$5,$6)", [orderId, p.amount, p.chargedAmount, p.chargedCurrency, p.provider, p.ref]);
        await this.syncPaid(c, orderId);
        await c.query("UPDATE store_orders SET status = 'paid' WHERE id = $1 AND status = 'pending'", [orderId]);
      });
      await this.onMoneyChange?.(orderId);
      return "recorded";
    } catch (e) { if ((e as { code?: string }).code === "23505") return "duplicate"; throw e; }
  }
  async recordExternalRefund(orderId: string, p: { amount: number; provider: string; ref: string }): Promise<"recorded" | "duplicate"> {
    try {
      await this.tx(async (c) => {
        await c.query("INSERT INTO store_payments (order_id, kind, amount, provider, provider_ref) VALUES ($1,'refund',$2,$3,$4)", [orderId, p.amount, p.provider, p.ref]);
        await this.syncPaid(c, orderId);
      });
      await this.onMoneyChange?.(orderId);
      return "recorded";
    } catch (e) { if ((e as { code?: string }).code === "23505") return "duplicate"; throw e; }
  }
  async orderStatus(orderId: string) { return (await this.db.query<{ status: string; total: string }>("SELECT status, total FROM store_orders WHERE id = $1", [orderId])).rows[0] ?? null; }

  private async syncPaid(c: PoolClient, orderId: string) {
    await c.query(
      `WITH s AS (SELECT coalesce(sum(amount) FILTER (WHERE kind = 'full' AND status = 'succeeded'), 0) AS paid, coalesce(sum(amount) FILTER (WHERE kind = 'refund' AND status = 'succeeded'), 0) AS refunded FROM store_payments WHERE order_id = $1)
       UPDATE store_orders o SET amount_paid = s.paid, refund_amount = s.refunded, updated_at = now(),
              payment_status = CASE WHEN s.paid > 0 AND s.refunded >= s.paid THEN 'refunded' WHEN s.paid - s.refunded >= o.total AND o.total > 0 THEN 'paid' WHEN s.paid > 0 THEN 'partial' ELSE 'unpaid' END FROM s WHERE o.id = $1`, [orderId],
    );
  }

  /** Devuelve stock y cupón de un pedido y lo marca cancelado (cobro fallido, vencimiento o cancelación). */
  private async release(c: PoolClient, orderId: string, reason: string, restock = true) {
    const o = (await c.query<{ status: string }>("SELECT status FROM store_orders WHERE id = $1 FOR UPDATE", [orderId])).rows[0];
    if (!o || o.status === "cancelled") return false;
    if (restock) for (const i of (await c.query<{ product_id: string | null; quantity: number }>("SELECT product_id, quantity FROM store_order_items WHERE order_id = $1", [orderId])).rows) if (i.product_id) await c.query("UPDATE store_products SET stock = stock + $2, updated_at = now() WHERE id = $1", [i.product_id, i.quantity]);
    const red = (await c.query<{ coupon_id: string }>("DELETE FROM coupon_redemptions WHERE order_id = $1 RETURNING coupon_id", [orderId])).rows[0];
    if (red) await c.query("UPDATE discount_coupons SET uses_count = GREATEST(0, uses_count - 1) WHERE id = $1", [red.coupon_id]);
    await c.query("UPDATE store_orders SET status = 'cancelled', cancelled_at = now(), cancel_reason = $2, updated_at = now() WHERE id = $1", [orderId, reason]);
    return true;
  }
  private abandon(orderId: string, reason: string) { return this.tx((c) => this.release(c, orderId, reason)); }

  /** Pedidos sin cobrar pasado el plazo: liberan stock y cupón (trabajo `orders.auto_cancel`). */
  async cancelUnpaid(olderThanMinutes = 60) {
    const { rows } = await this.db.query<{ id: string }>("SELECT id FROM store_orders WHERE status = 'pending' AND payment_status = 'unpaid' AND created_at < now() - make_interval(mins => $1) LIMIT 200", [olderThanMinutes]);
    let n = 0;
    for (const r of rows) if (await this.abandon(r.id, "payment_timeout")) n++;
    return n;
  }

  // ---------- Consulta y acciones del cliente ----------
  async getForCustomer(id: string, access: { token?: string; userId?: string }) {
    const row = (await this.db.query<{ user_id: string | null; access_hash: string | null }>("SELECT user_id, access_hash FROM store_orders WHERE id = $1", [id])).rows[0];
    const ok = row && ((access.token && row.access_hash === sha(access.token)) || (access.userId && row.user_id === access.userId));
    if (!ok) throw AppError.notFound("Pedido");
    return (await this.orderDto(id))!;
  }
  async listMine(userId: string, page: number, perPage: number) {
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM store_orders WHERE user_id = $1", [userId])).rows[0]!.n;
    const { rows } = await this.db.query<{ id: string }>(`SELECT id FROM store_orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, [userId]);
    return { rows: await Promise.all(rows.map((r) => this.orderDto(r.id))), total };
  }

  /** El cliente cancela mientras no se haya enviado; se reembolsa todo lo cobrado. */
  async cancel(id: string, access: { token?: string; userId?: string }, reason?: string) {
    const o = await this.getForCustomer(id, access);
    if (!["pending", "paid"].includes(o.status)) throw new AppError("BUSINESS_RULE", `No se puede cancelar un pedido en estado "${o.status}"`, { code: "INVALID_STATE" });
    return this.cancelAndRefund(id, reason ?? "customer_request");
  }

  private async cancelAndRefund(id: string, reason: string) {
    await this.refundPayments(id, null);
    await this.tx(async (c) => { await this.release(c, id, reason); await this.syncPaid(c, id); });
    await this.onMoneyChange?.(id);
    const o = (await this.orderDto(id))!;
    await this.notify(o, "El pedido fue cancelado", o.refund_amount > 0 ? `Te devolvimos ${money(o.refund_amount)}.` : "No se realizó ningún cobro.");
    return o;
  }

  /** Reembolsa `amount` (o todo lo pendiente de devolver) contra el cobro original; en Stripe se devuelve la parte proporcional en USD. */
  private async refundPayments(id: string, amount: number | null) {
    const o = (await this.db.query<{ total: string; amount_paid: string; refund_amount: string; fx_rate: string | null }>("SELECT total, amount_paid, refund_amount, fx_rate FROM store_orders WHERE id = $1", [id])).rows[0]!;
    const refundable = toCents(Number(o.amount_paid)) - toCents(Number(o.refund_amount));
    const wanted = amount === null ? refundable : toCents(amount);
    if (wanted > refundable) throw new AppError("BUSINESS_RULE", "El reembolso supera lo cobrado", { code: "REFUND_TOO_HIGH", refundable: fromCents(refundable) });
    if (wanted <= 0) return 0;
    const pay = (await this.db.query<{ provider: string; provider_ref: string | null; amount: string; charged_amount: string | null }>("SELECT provider, provider_ref, amount, charged_amount FROM store_payments WHERE order_id = $1 AND kind = 'full' AND status = 'succeeded' ORDER BY created_at DESC LIMIT 1", [id])).rows[0];
    if (!pay) return 0;
    const ratio = wanted / toCents(Number(pay.amount));
    const providerAmount = pay.charged_amount ? Math.round(Number(pay.charged_amount) * ratio * 100) / 100 : fromCents(wanted);
    let res;
    try { res = await this.gateway.refund({ providerRef: pay.provider_ref, amount: providerAmount, currency: this.gateway.name === "stripe" ? "USD" : "DOP", reference: id, idempotencyKey: `${id}:refund:${wanted}:${toCents(Number(o.refund_amount))}` }); }
    catch (err) { this.log.error({ err, id }, "Falló el reembolso de la tienda"); throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el reembolso; intenta de nuevo."); }
    if (!res.ok) throw new AppError("UPSTREAM_ERROR", "El proveedor rechazó el reembolso", { reason: res.reason });
    await this.tx(async (c) => { await c.query("INSERT INTO store_payments (order_id, kind, amount, charged_amount, provider, provider_ref) VALUES ($1,'refund',$2,$3,$4,$5)", [id, fromCents(wanted), providerAmount, pay.provider, res.providerRef]); await this.syncPaid(c, id); });
    return fromCents(wanted);
  }

  async requestReturn(id: string, access: { token?: string; userId?: string }, reason: string) {
    const o = await this.getForCustomer(id, access);
    if (o.status !== "delivered") throw new AppError("BUSINESS_RULE", "Sólo se pueden devolver pedidos entregados", { code: "INVALID_STATE" });
    if (!o.return_window_open) throw new AppError("BUSINESS_RULE", `El plazo de devolución (${RETURN_WINDOW_HOURS} h) venció`, { code: "RETURN_WINDOW_CLOSED" });
    await this.db.query("UPDATE store_orders SET status = 'return_requested', return_requested_at = now(), return_reason = $2, updated_at = now() WHERE id = $1", [id, reason]);
    return (await this.orderDto(id))!;
  }

  /** Aviso en la bandeja del comprador (lo asigna el arranque de la app). */
  notifyUser?: NotifyFn;

  private async notify(o: { customer_email: string; customer_name: string; id: string }, title: string, message: string) {
    const uid = (await this.db.query<{ user_id: string | null }>("SELECT user_id FROM store_orders WHERE id = $1", [o.id])).rows[0]?.user_id;
    await this.notifyUser?.(uid, { type: "booking", title, message, link: `/tienda/pedido/${o.id}`, data: { order_id: o.id } });
    await this.mailer.send({ to: o.customer_email, template: "store.order_update", locale: "es", data: { name: o.customer_name.split(" ")[0]!, reference: o.id, title, message, url: `${this.env.WEB_BASE_URL}/tienda/pedido/${o.id}` } }).catch((err) => this.log.error({ err }, "No se pudo enviar el aviso del pedido"));
  }

  // ---------- Administración ----------
  async adminList(f: { status?: string; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [], where = ["true"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.status) where.push(`status = ${bind(f.status)}`);
    if (f.q) { const ph = bind(`%${f.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(id ILIKE ${ph} OR customer_email ILIKE ${ph} OR customer_name ILIKE ${ph})`); }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM store_orders WHERE ${where.join(" AND ")}`, params)).rows[0]!.n;
    const { rows } = await this.db.query<{ id: string }>(`SELECT id FROM store_orders WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    return { rows: await Promise.all(rows.map((r) => this.orderDto(r.id))), total };
  }
  async adminGet(id: string) { const o = await this.orderDto(id); if (!o) throw AppError.notFound("Pedido"); return o; }

  async adminSetStatus(id: string, status: "processing" | "shipped" | "delivered" | "cancelled", opts: { courier_name?: string; tracking_number?: string; reason?: string }) {
    const cur = (await this.db.query<{ status: string }>("SELECT status FROM store_orders WHERE id = $1", [id])).rows[0];
    if (!cur) throw AppError.notFound("Pedido");
    const ALLOWED: Record<string, string[]> = { processing: ["paid"], shipped: ["paid", "processing"], delivered: ["shipped"], cancelled: ["pending", "paid", "processing"] };
    if (!ALLOWED[status]!.includes(cur.status)) throw new AppError("BUSINESS_RULE", `No se puede pasar de "${cur.status}" a "${status}"`, { code: "INVALID_TRANSITION" });
    if (status === "cancelled") return this.cancelAndRefund(id, opts.reason ?? "cancelled_by_store");
    if (status === "shipped" && !opts.tracking_number) throw AppError.validation("Falta el número de guía");
    await this.db.query(
      `UPDATE store_orders SET status = $2, courier_name = coalesce($3, courier_name), tracking_number = coalesce($4, tracking_number),
              shipped_at = CASE WHEN $2 = 'shipped' THEN now() ELSE shipped_at END, delivered_at = CASE WHEN $2 = 'delivered' THEN now() ELSE delivered_at END, updated_at = now() WHERE id = $1`, [id, status, opts.courier_name ?? null, opts.tracking_number ?? null],
    );
    const o = (await this.orderDto(id))!;
    if (status === "shipped") await this.notify(o, "Tu pedido va en camino", `Guía ${o.tracking_number}${o.courier_name ? ` (${o.courier_name})` : ""}.`);
    if (status === "delivered") await this.notify(o, "Tu pedido fue entregado", `Tienes ${RETURN_WINDOW_HOURS} horas para solicitar una devolución si algo no está bien.`);
    return o;
  }

  /** Reembolso total o parcial decidido por la tienda (devoluciones, ajustes). Si es total y el pedido no salió, devuelve el stock. */
  async adminRefund(id: string, input: { amount?: number; restock?: boolean }) {
    const o = await this.orderDto(id);
    if (!o) throw AppError.notFound("Pedido");
    if (!["paid", "processing", "shipped", "delivered", "return_requested"].includes(o.status)) throw new AppError("BUSINESS_RULE", `No se puede reembolsar un pedido en estado "${o.status}"`, { code: "INVALID_STATE" });
    const refunded = await this.refundPayments(id, input.amount ?? null);
    await this.tx(async (c) => {
      if (input.restock) for (const i of (await c.query<{ product_id: string | null; quantity: number }>("SELECT product_id, quantity FROM store_order_items WHERE order_id = $1", [id])).rows) if (i.product_id) await c.query("UPDATE store_products SET stock = stock + $2, updated_at = now() WHERE id = $1", [i.product_id, i.quantity]);
      await c.query("UPDATE store_orders SET status = CASE WHEN payment_status = 'refunded' THEN 'refunded' ELSE status END, updated_at = now() WHERE id = $1", [id]);
    });
    await this.onMoneyChange?.(id);
    const after = (await this.orderDto(id))!;
    if (refunded > 0) await this.notify(after, "Reembolso realizado", `Te devolvimos ${money(refunded)}.`);
    return after;
  }
}

void randomUUID;
