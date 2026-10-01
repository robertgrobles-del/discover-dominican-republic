import { createHash, randomBytes } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type { PoolClient } from "pg";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { MailerPort } from "../../contracts/email.js";
import type { NotifyFn } from "../../contracts/notifications.js";
import { fromCents, toCents } from "../../lib/money.js";
import type { PaymentGateway } from "../../contracts/payments.js";

export const CATEGORIES = [
  "artesania",
  "gastronomia",
  "cafe-cacao-ron",
  "moda",
  "arte",
  "joyeria",
  "bienestar",
  "experiencia",
  "tour-aventura",
  "tour-cultural",
  "deportes-acuaticos",
  "ecoturismo",
  "otros"
] as const;
export const PAYOUT_HOLD_DAYS = 3;          // días tras la entrega antes de liquidar al vendedor (ventana de devolución)
const MAX_LINE_QTY = 20;
const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const money = (n: number) => `RD$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "item";
const suffix = () => randomBytes(3).toString("hex");
type Db_ = Db | PoolClient;
export interface Actor { userId?: string | null }
interface OrderItem { id: string; product_id: string | null; name: string; kind: string; quantity: number; unit_price: number; line_total: number; fulfillment_status: string; courier_name: string | null; tracking_number: string | null; refunded: boolean; vendor_slug: string | null; vendor_name: string | null }
interface OrderDto { id: string; customer_name: string; customer_email: string; status: string; total: number; amount_paid: number; refund_amount: number; items: OrderItem[]; [k: string]: unknown }
interface Line { product_id: string; vendor_id: string; vendor_name: string; commission_rate: number; name: string; kind: string; price: number; stock: number; quantity: number }

const PRODUCT_SELECT = `p.id, p.slug, p.name, p.category, p.kind, p.description, p.price, p.currency, p.stock, p.images, p.status, p.review_note, p.created_at, v.slug AS vendor_slug, v.name AS vendor_name, v.logo_url AS vendor_logo, v.city AS vendor_city`;

/** Marketplace de vendedores locales (docs §5.9): vendedores, catálogo moderado, pedidos multivendedor, cobros y liquidaciones. */
export class MarketplaceService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly gateway: PaymentGateway, private readonly mailer: MailerPort, private readonly log: FastifyBaseLogger) {}

  /** Aviso de que un pedido cambió su dinero (cobro, reembolso, cancelación); lo usa el programa de embajadores. */
  onMoneyChange?: (orderId: string) => Promise<void>;
  /** Aviso en la bandeja de compradores y vendedores (lo asigna el arranque de la app). */
  notifyUser?: NotifyFn;

  private async notifyBuyer(orderId: string, title: string, message: string) {
    const uid = (await this.db.query<{ user_id: string | null }>("SELECT user_id FROM marketplace_orders WHERE id = $1", [orderId])).rows[0]?.user_id;
    await this.notifyUser?.(uid, { type: "booking", title, message, link: `/marketplace/pedido/${orderId}`, data: { order_id: orderId } });
  }

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }
  private async usdRate(c: Db_ = this.db): Promise<number> {
    const r = (await c.query<{ sell_rate: string }>("SELECT sell_rate FROM exchange_rates WHERE currency_code = 'USD' ORDER BY rate_date DESC LIMIT 1")).rows[0];
    return r ? Number(r.sell_rate) : this.env.DEFAULT_USD_DOP;
  }
  private async uniqueSlug(table: "marketplace_vendors" | "marketplace_products", base: string): Promise<string> {
    let s = slugify(base);
    if (s === "me") s = "me-tienda";
    for (let i = 0; i < 6; i++) {
      const candidate = i === 0 ? s : `${s}-${suffix()}`;
      if (!(await this.db.query(`SELECT 1 FROM ${table} WHERE slug = $1`, [candidate])).rowCount) return candidate;
    }
    return `${s}-${suffix()}${suffix()}`;
  }

  // ================= Vendedores =================
  async applyVendor(userId: string, input: { name: string; bio?: string; city?: string; phone?: string; province_id?: string; logo_url?: string }) {
    if (!(await this.db.query("SELECT 1 FROM users WHERE id = $1 AND email_verified_at IS NOT NULL", [userId])).rowCount) throw new AppError("FORBIDDEN", "Verifica tu correo para vender en el marketplace", { code: "EMAIL_NOT_VERIFIED" });
    const prev = (await this.db.query<{ status: string }>("SELECT status FROM marketplace_vendors WHERE id = $1", [userId])).rows[0];
    if (prev && prev.status !== "rejected") throw new AppError("CONFLICT", "Ya tienes una tienda o una solicitud en curso", { reason: "ALREADY_APPLIED", status: prev.status });
    if (input.province_id && !(await this.db.query("SELECT 1 FROM provinces WHERE id = $1", [input.province_id])).rowCount) throw AppError.validation("La provincia no existe", { field: "province_id" });
    if (prev) {
      await this.db.query("UPDATE marketplace_vendors SET status = 'pending', name = $2, bio = $3, city = $4, phone = $5, province_id = $6, logo_url = $7, status_note = NULL, updated_at = now() WHERE id = $1", [userId, input.name, input.bio ?? null, input.city ?? null, input.phone ?? null, input.province_id ?? null, input.logo_url ?? null]);
    } else {
      const slug = await this.uniqueSlug("marketplace_vendors", input.name);
      await this.db.query("INSERT INTO marketplace_vendors (id, slug, name, bio, city, phone, province_id, logo_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [userId, slug, input.name, input.bio ?? null, input.city ?? null, input.phone ?? null, input.province_id ?? null, input.logo_url ?? null]);
    }
    return this.myVendor(userId);
  }

  async myVendor(userId: string) {
    const v = (await this.db.query("SELECT id, slug, name, bio, logo_url, cover_url, province_id, city, phone, status, status_note, commission_rate, payout_method, payout_details, approved_at, created_at FROM marketplace_vendors WHERE id = $1", [userId])).rows[0];
    if (!v) throw AppError.notFound("Tienda");
    return { ...v, commission_rate: Number(v.commission_rate) };
  }
  async updateVendor(userId: string, input: Record<string, unknown>) {
    await this.myVendor(userId);
    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    await this.db.query(`UPDATE marketplace_vendors SET ${entries.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1`, [userId, ...entries.map(([, v]) => v)]);
    return this.myVendor(userId);
  }
  private async activeVendor(userId: string) {
    const v = (await this.db.query<{ status: string }>("SELECT status FROM marketplace_vendors WHERE id = $1", [userId])).rows[0];
    if (!v || v.status !== "active") throw new AppError("FORBIDDEN", v?.status === "suspended" ? "Tu tienda está suspendida" : "Necesitas una tienda aprobada", { code: "NOT_VENDOR" });
  }

  async publicVendors(page: number, perPage: number) {
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM marketplace_vendors WHERE status = 'active'")).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT v.slug, v.name, v.bio, v.logo_url, v.cover_url, v.city, (SELECT count(*)::int FROM marketplace_products p WHERE p.vendor_id = v.id AND p.status = 'published' AND p.deleted_at IS NULL) AS products FROM marketplace_vendors v WHERE v.status = 'active' ORDER BY v.name LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`);
    return { rows, total };
  }
  async publicVendor(slug: string) {
    const v = (await this.db.query("SELECT v.slug, v.name, v.bio, v.logo_url, v.cover_url, v.city, pr.name AS province FROM marketplace_vendors v LEFT JOIN provinces pr ON pr.id = v.province_id WHERE v.slug = $1 AND v.status = 'active'", [slug])).rows[0];
    if (!v) throw AppError.notFound("Vendedor");
    const products = await this.publicProducts({ vendor: slug, page: 1, per_page: 100 });
    return { ...v, products: products.rows };
  }

  async adminVendors(f: { status?: string; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [], where = ["true"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.status) where.push(`v.status = ${bind(f.status)}`);
    if (f.q) { const ph = bind(`%${f.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(v.name ILIKE ${ph} OR u.email ILIKE ${ph})`); }
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM marketplace_vendors v JOIN users u ON u.id = v.id WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT v.id, v.slug, v.name, u.email, v.city, v.status, v.status_note, v.commission_rate, v.created_at, (SELECT count(*)::int FROM marketplace_products p WHERE p.vendor_id = v.id AND p.deleted_at IS NULL) AS products FROM marketplace_vendors v JOIN users u ON u.id = v.id WHERE ${w} ORDER BY v.created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    return { rows: rows.map((r) => ({ ...r, commission_rate: Number(r.commission_rate) })), total };
  }
  async adminSetVendor(id: string, input: { status?: "active" | "suspended" | "rejected"; commission_rate?: number; note?: string }) {
    const cur = (await this.db.query<{ status: string; name: string; slug: string; email: string }>("SELECT v.status, v.name, v.slug, u.email FROM marketplace_vendors v JOIN users u ON u.id = v.id WHERE v.id = $1", [id])).rows[0];
    if (!cur) throw AppError.notFound("Vendedor");
    if (input.status === "active" && cur.status === "rejected") throw new AppError("BUSINESS_RULE", "La solicitud fue rechazada; la persona debe volver a solicitarlo", { code: "INVALID_TRANSITION" });
    const sets = ["updated_at = now()"], p: unknown[] = [id];
    const bind = (v: unknown) => { p.push(v); return `$${p.length}`; };
    if (input.status) { sets.push(`status = ${bind(input.status)}`); if (input.status === "active" && cur.status !== "active") sets.push("approved_at = now()"); }
    if (input.commission_rate !== undefined) sets.push(`commission_rate = ${bind(input.commission_rate)}`);
    if (input.note !== undefined) sets.push(`status_note = ${bind(input.note)}`);
    await this.db.query(`UPDATE marketplace_vendors SET ${sets.join(", ")} WHERE id = $1`, p);
    if (input.status === "active" && cur.status !== "active") await this.notifyUser?.(id, { type: "system", title: "Tu tienda fue aprobada", message: `${cur.name} ya está activa en el marketplace`, link: "/vendedor" });
    if (input.status === "active" && cur.status !== "active") await this.mailer.send({ to: cur.email, template: "vendor.approved", locale: "es", data: { shop: cur.name, url: `${this.env.WEB_BASE_URL}/marketplace/vendedores/${cur.slug}` } }).catch((err) => this.log.error({ err }, "No se pudo avisar la aprobación del vendedor"));
    return this.myVendor(id);
  }

  // ================= Catálogo =================
  private dto(r: Record<string, unknown>, rate: number, own = false) {
    const price = Number(r.price), stock = Number(r.stock);
    return {
      id: r.id, slug: r.slug, name: r.name, category: r.category, kind: r.kind, description: r.description, price, currency: r.currency, price_usd: Math.round((price / rate) * 100) / 100,
      in_stock: stock > 0, low_stock: stock > 0 && stock <= 5 ? stock : null, images: r.images, vendor: { slug: r.vendor_slug, name: r.vendor_name, logo_url: r.vendor_logo, city: r.vendor_city },
      ...(own ? { stock, status: r.status, review_note: r.review_note, created_at: r.created_at } : {}),
    };
  }

  async publicProducts(f: { vendor?: string; category?: string; kind?: string; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [], where = ["p.status = 'published'", "p.deleted_at IS NULL", "v.status = 'active'"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.vendor) where.push(`v.slug = ${bind(f.vendor)}`);
    if (f.category) where.push(`p.category = ${bind(f.category)}`);
    if (f.kind) where.push(`p.kind = ${bind(f.kind)}`);
    if (f.q) { const ph = bind(`%${f.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(lower(f_unaccent(p.name)) LIKE lower(f_unaccent(${ph})) ESCAPE '\\' OR lower(f_unaccent(coalesce(p.description, ''))) LIKE lower(f_unaccent(${ph})) ESCAPE '\\')`); }
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${PRODUCT_SELECT} FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE ${w} ORDER BY p.published_at DESC NULLS LAST, p.name LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    const rate = await this.usdRate();
    return { rows: rows.map((r) => this.dto(r, rate)), total };
  }
  async publicProduct(slug: string) {
    const r = (await this.db.query(`SELECT ${PRODUCT_SELECT} FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE p.slug = $1 AND p.status = 'published' AND p.deleted_at IS NULL AND v.status = 'active'`, [slug])).rows[0];
    if (!r) throw AppError.notFound("Producto");
    return this.dto(r, await this.usdRate());
  }
  async categories() {
    return (await this.db.query("SELECT p.category, count(*)::int AS products FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE p.status = 'published' AND p.deleted_at IS NULL AND v.status = 'active' GROUP BY p.category ORDER BY p.category")).rows;
  }

  // ---------- Productos del vendedor ----------
  async vendorProducts(userId: string, page: number, perPage: number, status?: string) {
    const p: unknown[] = [userId];
    let w = "p.vendor_id = $1 AND p.deleted_at IS NULL";
    if (status) { p.push(status); w += " AND p.status = $2"; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM marketplace_products p WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${PRODUCT_SELECT} FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE ${w} ORDER BY p.created_at DESC LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, p);
    const rate = await this.usdRate();
    return { rows: rows.map((r) => this.dto(r, rate, true)), total };
  }
  private async ownProduct(userId: string, id: string) {
    const r = (await this.db.query(`SELECT ${PRODUCT_SELECT} FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE p.id = $1 AND p.vendor_id = $2 AND p.deleted_at IS NULL`, [id, userId])).rows[0];
    if (!r) throw AppError.notFound("Producto");
    return r;
  }
  async createProduct(userId: string, b: { name: string; category: string; kind?: string; description?: string; price: number; stock?: number; images?: string[] }) {
    await this.activeVendor(userId);
    const slug = await this.uniqueSlug("marketplace_products", b.name);
    const row = (await this.db.query<{ id: string }>("INSERT INTO marketplace_products (vendor_id, slug, name, category, kind, description, price, stock, images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id", [userId, slug, b.name, b.category, b.kind ?? "product", b.description ?? null, b.price, b.stock ?? 0, b.images ?? []])).rows[0]!;
    return this.dto(await this.ownProduct(userId, row.id), await this.usdRate(), true);
  }
  /** Precio y existencias cambian al instante; el contenido (nombre, descripción, fotos, categoría) vuelve a revisión. */
  async updateProduct(userId: string, id: string, b: Record<string, unknown> & { archived?: boolean }) {
    await this.activeVendor(userId);
    const cur = await this.ownProduct(userId, id);
    const { archived, ...fields } = b;
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
    const content = entries.some(([k]) => ["name", "description", "images", "category", "kind"].includes(k));
    const sets = entries.map(([k], i) => `"${k}" = $${i + 2}`);
    const p: unknown[] = [id, ...entries.map(([, v]) => v)];
    if (archived === true) sets.push("status = 'archived'");
    else if (archived === false && cur.status === "archived") sets.push("status = 'pending_review'");
    else if (content && ["published", "rejected", "draft"].includes(cur.status as string)) sets.push("status = 'pending_review'", "review_note = NULL");
    if (!sets.length) throw AppError.validation("No hay cambios que guardar");
    await this.db.query(`UPDATE marketplace_products SET ${sets.join(", ")}, updated_at = now() WHERE id = $1`, p);
    return this.dto(await this.ownProduct(userId, id), await this.usdRate(), true);
  }
  async deleteProduct(userId: string, id: string) {
    await this.ownProduct(userId, id);
    await this.db.query("UPDATE marketplace_products SET deleted_at = now(), status = 'archived', updated_at = now() WHERE id = $1", [id]);
  }

  async adminProducts(f: { status?: string; page: number; per_page: number }) {
    const p: unknown[] = [];
    let w = "p.deleted_at IS NULL";
    if (f.status) { p.push(f.status); w += " AND p.status = $1"; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM marketplace_products p WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${PRODUCT_SELECT} FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE ${w} ORDER BY p.created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, p);
    const rate = await this.usdRate();
    return { rows: rows.map((r) => this.dto(r, rate, true)), total };
  }
  async adminReview(id: string, decision: "approve" | "reject", note?: string) {
    const cur = (await this.db.query<{ status: string }>("SELECT status FROM marketplace_products WHERE id = $1 AND deleted_at IS NULL", [id])).rows[0];
    if (!cur) throw AppError.notFound("Producto");
    if (cur.status !== "pending_review") throw new AppError("BUSINESS_RULE", `El producto está en estado "${cur.status}", no en revisión`, { code: "INVALID_STATE" });
    if (decision === "reject" && !note) throw AppError.validation("Explica el motivo del rechazo");
    await this.db.query("UPDATE marketplace_products SET status = $2, review_note = $3, published_at = CASE WHEN $2 = 'published' THEN coalesce(published_at, now()) ELSE published_at END, updated_at = now() WHERE id = $1", [id, decision === "approve" ? "published" : "rejected", note ?? null]);
    return { id, status: decision === "approve" ? "published" : "rejected" };
  }

  // ================= Pedidos =================
  private async loadLines(c: Db_, items: { product_id: string; quantity: number }[], lock: boolean): Promise<Line[]> {
    const merged = new Map<string, number>();
    for (const i of items) merged.set(i.product_id, (merged.get(i.product_id) ?? 0) + i.quantity);
    const ids = [...merged.keys()].sort();
    if (!ids.length) throw new AppError("BUSINESS_RULE", "No hay artículos", { code: "EMPTY_CART" });
    const { rows } = await c.query(`SELECT p.id, p.name, p.kind, p.price, p.stock, p.status, p.vendor_id, v.name AS vendor_name, v.commission_rate, v.status AS vendor_status FROM marketplace_products p JOIN marketplace_vendors v ON v.id = p.vendor_id WHERE p.id = ANY($1) AND p.deleted_at IS NULL ORDER BY p.id${lock ? " FOR UPDATE OF p" : ""}`, [ids]);
    const issues: { product_id: string; name?: string; available: number }[] = [];
    const lines: Line[] = [];
    for (const id of ids) {
      const r = rows.find((x) => x.id === id);
      const qty = merged.get(id)!;
      if (qty > MAX_LINE_QTY) throw new AppError("BUSINESS_RULE", `Máximo ${MAX_LINE_QTY} unidades por producto`, { code: "MAX_QUANTITY" });
      if (!r || r.status !== "published" || r.vendor_status !== "active") { issues.push({ product_id: id, name: r?.name, available: 0 }); continue; }
      if (r.stock < qty) { issues.push({ product_id: id, name: r.name, available: r.stock }); continue; }
      lines.push({ product_id: id, vendor_id: r.vendor_id, vendor_name: r.vendor_name, commission_rate: Number(r.commission_rate), name: r.name, kind: r.kind, price: Number(r.price), stock: r.stock, quantity: qty });
    }
    if (issues.length) throw new AppError("BUSINESS_RULE", "Algunos productos ya no están disponibles en esa cantidad", { code: "STOCK_INSUFFICIENT", items: issues });
    return lines;
  }

  async quote(items: { product_id: string; quantity: number }[]) {
    const lines = await this.loadLines(this.db, items, false);
    const rate = await this.usdRate();
    const out = lines.map((l) => ({ product_id: l.product_id, name: l.name, vendor: l.vendor_name, quantity: l.quantity, unit_price: l.price, line_total: fromCents(toCents(l.price) * l.quantity) }));
    const total = fromCents(out.reduce((s, l) => s + toCents(l.line_total), 0));
    return { lines: out, subtotal: total, total, total_usd: Math.round((total / rate) * 100) / 100, usd_rate: rate, needs_shipping: lines.some((l) => l.kind === "product") };
  }

  private itemsOf(orderId: string, c: Db_ = this.db) {
    return c.query("SELECT i.id, i.product_id, i.name, i.kind, i.quantity, i.price_unit AS unit_price, i.line_total, i.fulfillment_status, i.courier_name, i.tracking_number, i.shipped_at, i.delivered_at, i.refunded, v.slug AS vendor_slug, v.name AS vendor_name FROM marketplace_order_items i LEFT JOIN marketplace_vendors v ON v.id = i.vendor_id WHERE i.order_id = $1 ORDER BY i.name, i.id", [orderId]);
  }
  private async orderDto(id: string, c: Db_ = this.db): Promise<OrderDto | null> {
    const o = (await c.query("SELECT id, user_id, customer_name, customer_email, phone, address, city, province, notes, total_amount, currency, status, payment_status, amount_paid, refund_amount, fx_rate, cancel_reason, created_at, access_hash FROM marketplace_orders WHERE id = $1", [id])).rows[0];
    if (!o) return null;
    const items: OrderItem[] = (await this.itemsOf(id, c)).rows.map((i) => ({ ...i, unit_price: Number(i.unit_price), line_total: Number(i.line_total) }));
    const { access_hash: _h, user_id: _u, total_amount, ...rest } = o;
    void _h; void _u;
    return { ...rest, total: Number(total_amount), amount_paid: Number(o.amount_paid), refund_amount: Number(o.refund_amount), fx_rate: o.fx_rate === null ? null : Number(o.fx_rate), items };
  }

  async createOrder(input: { actor: Actor; contact: { name: string; email: string; phone?: string }; shipping?: { address: string; city: string; province?: string; notes?: string }; items: { product_id: string; quantity: number }[]; paymentToken?: string; idempotencyKey: string; refCode?: string | null; locale?: "es" | "en" }) {
    const email = input.contact.email.trim().toLowerCase();
    const idemScope = input.actor.userId ?? email;
    const findPrev = async () => (await this.db.query<{ id: string }>("SELECT id FROM marketplace_orders WHERE coalesce(user_id::text, lower(customer_email)) = $1 AND idempotency_key = $2", [idemScope, input.idempotencyKey])).rows[0];
    const prev = await findPrev();
    if (prev) return { order: (await this.orderDto(prev.id))!, accessToken: null as string | null, replayed: true };
    if (this.gateway.name === "none") throw new AppError("SERVICE_UNAVAILABLE", "Los pagos en línea no están habilitados todavía");
    if (!input.paymentToken) throw AppError.validation("Falta payment_method_token");

    const accessToken = randomBytes(24).toString("base64url");
    let orderId!: string, total = 0, rate = 0;
    let lines!: Line[];
    try {
      await this.tx(async (c) => {
        lines = await this.loadLines(c, input.items, true);
        if (lines.some((l) => l.kind === "product") && !input.shipping) throw AppError.validation("Falta la dirección de entrega", { field: "shipping" });
        rate = await this.usdRate(c);
        const totalCents = lines.reduce((s, l) => s + toCents(l.price) * l.quantity, 0);
        total = fromCents(totalCents);
        const o = (await c.query<{ id: string }>(
          `INSERT INTO marketplace_orders (user_id, customer_name, customer_email, phone, address, city, province, notes, total_amount, status, payment_status, fx_rate, access_hash, idempotency_key, ref_code)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','unpaid',$10,$11,$12,$13) RETURNING id`,
          [input.actor.userId ?? null, input.contact.name.trim(), email, input.contact.phone?.trim() ?? null, input.shipping?.address.trim() ?? null, input.shipping?.city.trim() ?? null, input.shipping?.province?.trim() ?? null, input.shipping?.notes?.trim() ?? null, total, rate, sha(accessToken), input.idempotencyKey, input.refCode ?? null],
        )).rows[0]!;
        orderId = o.id;
        for (const l of lines) {
          const lineCents = toCents(l.price) * l.quantity, commission = Math.round((lineCents * l.commission_rate) / 100);
          await c.query(
            `INSERT INTO marketplace_order_items (order_id, item_type, item_id, vendor_id, product_id, name, kind, quantity, price_unit, line_total, commission_rate, commission, vendor_net)
             VALUES ($1,NULL,$2,$3,$2,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [orderId, l.product_id, l.vendor_id, l.name, l.kind, l.quantity, l.price, fromCents(lineCents), l.commission_rate, fromCents(commission), fromCents(lineCents - commission)],
          );
          const dec = await c.query("UPDATE marketplace_products SET stock = stock - $2, updated_at = now() WHERE id = $1 AND stock >= $2", [l.product_id, l.quantity]);
          if (!dec.rowCount) throw new AppError("BUSINESS_RULE", "Un producto se agotó mientras comprabas", { code: "STOCK_INSUFFICIENT", product_id: l.product_id });
        }
      });
    } catch (e) {
      if ((e as { code?: string }).code === "23505") { const again = await findPrev(); if (again) return { order: (await this.orderDto(again.id))!, accessToken: null as string | null, replayed: true }; }
      throw e;
    }

    // ----- Cobro (fuera de la transacción) -----
    const charge = this.gateway.name === "stripe" ? { amount: Math.round((total / rate) * 100) / 100, currency: "USD" } : { amount: total, currency: "DOP" };
    let result;
    try {
      result = await this.gateway.charge({ amount: charge.amount, currency: charge.currency, token: input.paymentToken, reference: orderId, idempotencyKey: `${orderId}:full:${sha(input.paymentToken).slice(0, 12)}`, metadata: { mp_order_id: orderId, kind: "full" } });
    } catch (err) {
      await this.abandon(orderId, "payment_provider_error");
      this.log.error({ err, orderId }, "Falló la pasarela de pago del marketplace");
      throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el pago. No se realizó ningún cobro; intenta de nuevo.");
    }
    if (!result.ok) {
      await this.abandon(orderId, `payment_${result.reason}`);
      throw new AppError("PAYMENT_FAILED", "El pago fue rechazado. No se realizó ningún cobro.", { reason: result.reason });
    }
    await this.recordPayment(orderId, { amount: total, chargedAmount: charge.amount, chargedCurrency: charge.currency, provider: this.gateway.name, ref: result.providerRef });
    const order = (await this.orderDto(orderId))!;
    await this.mailer.send({ to: email, template: "store.order_confirmation", locale: input.locale ?? "es", data: { name: input.contact.name.split(" ")[0]!, reference: orderId.slice(0, 8).toUpperCase(), total: money(total), items: lines.map((l) => `${l.quantity} × ${l.name}`).join(", "), url: `${this.env.WEB_BASE_URL}/marketplace/pedido/${orderId}` } }).catch((err) => this.log.error({ err, orderId }, "No se pudo enviar la confirmación del pedido"));
    return { order, accessToken, replayed: false };
  }

  async recordPayment(orderId: string, p: { amount: number; chargedAmount: number; chargedCurrency: string; provider: string; ref: string }): Promise<"recorded" | "duplicate"> {
    try {
      await this.tx(async (c) => {
        await c.query("INSERT INTO marketplace_payments (order_id, kind, amount, charged_amount, charged_currency, provider, provider_ref) VALUES ($1,'full',$2,$3,$4,$5,$6)", [orderId, p.amount, p.chargedAmount, p.chargedCurrency, p.provider, p.ref]);
        await this.syncPaid(c, orderId);
        await c.query("UPDATE marketplace_orders SET status = 'paid', updated_at = now() WHERE id = $1 AND status = 'pending'", [orderId]);
      });
    } catch (e) { if ((e as { code?: string }).code === "23505") return "duplicate"; throw e; }
    await this.onMoneyChange?.(orderId);
    await this.notifyVendors(orderId);
    return "recorded";
  }
  async recordExternalRefund(orderId: string, p: { amount: number; provider: string; ref: string }): Promise<"recorded" | "duplicate"> {
    try {
      await this.tx(async (c) => {
        await c.query("INSERT INTO marketplace_payments (order_id, kind, amount, provider, provider_ref) VALUES ($1,'refund',$2,$3,$4)", [orderId, p.amount, p.provider, p.ref]);
        await this.syncPaid(c, orderId);
      });
    } catch (e) { if ((e as { code?: string }).code === "23505") return "duplicate"; throw e; }
    await this.onMoneyChange?.(orderId);
    return "recorded";
  }
  async orderStatus(orderId: string) { return (await this.db.query<{ status: string; total: string }>("SELECT status, total_amount AS total FROM marketplace_orders WHERE id = $1", [orderId])).rows[0] ?? null; }

  private async syncPaid(c: PoolClient, orderId: string) {
    await c.query(
      `WITH s AS (SELECT coalesce(sum(amount) FILTER (WHERE kind = 'full' AND status = 'succeeded'), 0) AS paid, coalesce(sum(amount) FILTER (WHERE kind = 'refund' AND status = 'succeeded'), 0) AS refunded FROM marketplace_payments WHERE order_id = $1)
       UPDATE marketplace_orders o SET amount_paid = s.paid, refund_amount = s.refunded, updated_at = now(),
              payment_status = CASE WHEN s.paid > 0 AND s.refunded >= s.paid THEN 'refunded' WHEN s.paid - s.refunded >= o.total_amount AND o.total_amount > 0 THEN 'paid' WHEN s.paid > 0 THEN 'partial' ELSE 'unpaid' END FROM s WHERE o.id = $1`, [orderId],
    );
  }

  private async notifyVendors(orderId: string) {
    try {
      const o = await this.orderDto(orderId);
      if (!o) return;
      const { rows } = await this.db.query<{ vendor_id: string; email: string; shop: string }>("SELECT DISTINCT i.vendor_id, u.email, v.name AS shop FROM marketplace_order_items i JOIN marketplace_vendors v ON v.id = i.vendor_id JOIN users u ON u.id = v.id WHERE i.order_id = $1", [orderId]);
      for (const v of rows) {
        const mine = o.items.filter((i) => i.vendor_name === v.shop);
        const sum = mine.reduce((s, i) => s + i.line_total, 0);
        await this.notifyUser?.(v.vendor_id, { type: "booking", title: "Nuevo pedido pagado", message: `${mine.map((i) => `${i.quantity} × ${i.name}`).join(", ")} · ${money(sum)}`, link: "/vendedor/pedidos", data: { order_id: orderId } });
        await this.mailer.send({ to: v.email, template: "vendor.new_order", locale: "es", data: { shop: v.shop, reference: orderId.slice(0, 8).toUpperCase(), items: mine.map((i) => `${i.quantity} × ${i.name}`).join(", "), total: money(sum), url: `${this.env.WEB_BASE_URL}/vendedor/pedidos` } });
      }
    } catch (err) { this.log.error({ err, orderId }, "No se pudo avisar a los vendedores del pedido"); }
  }

  /** Devuelve el stock de los artículos vivos y cierra el pedido (cobro fallido, vencimiento o cancelación). */
  private async release(c: PoolClient, orderId: string, reason: string) {
    const o = (await c.query<{ status: string }>("SELECT status FROM marketplace_orders WHERE id = $1 FOR UPDATE", [orderId])).rows[0];
    if (!o || o.status === "cancelled") return false;
    for (const i of (await c.query<{ product_id: string | null; quantity: number }>("SELECT product_id, quantity FROM marketplace_order_items WHERE order_id = $1 AND fulfillment_status <> 'cancelled' AND NOT refunded", [orderId])).rows) if (i.product_id) await c.query("UPDATE marketplace_products SET stock = stock + $2, updated_at = now() WHERE id = $1", [i.product_id, i.quantity]);
    await c.query("UPDATE marketplace_order_items SET fulfillment_status = 'cancelled' WHERE order_id = $1 AND fulfillment_status <> 'cancelled'", [orderId]);
    await c.query("UPDATE marketplace_orders SET status = 'cancelled', cancelled_at = now(), cancel_reason = $2, updated_at = now() WHERE id = $1", [orderId, reason]);
    return true;
  }
  private abandon(orderId: string, reason: string) { return this.tx((c) => this.release(c, orderId, reason)); }
  async cancelUnpaid(olderThanMinutes = 60) {
    const { rows } = await this.db.query<{ id: string }>("SELECT id FROM marketplace_orders WHERE status = 'pending' AND payment_status = 'unpaid' AND created_at < now() - make_interval(mins => $1) LIMIT 200", [olderThanMinutes]);
    let n = 0;
    for (const r of rows) if (await this.abandon(r.id, "payment_timeout")) n++;
    return n;
  }

  /** Recalcula el estado del pedido a partir de sus artículos. */
  private async refreshStatus(c: PoolClient, orderId: string) {
    const o = (await c.query<{ status: string }>("SELECT status FROM marketplace_orders WHERE id = $1 FOR UPDATE", [orderId])).rows[0];
    if (!o || !["paid", "processing", "completed"].includes(o.status)) return;
    const items = (await c.query<{ fulfillment_status: string; refunded: boolean }>("SELECT fulfillment_status, refunded FROM marketplace_order_items WHERE order_id = $1", [orderId])).rows;
    const live = items.filter((i) => i.fulfillment_status !== "cancelled" && !i.refunded);
    let status: string;
    if (!live.length) status = items.some((i) => i.fulfillment_status === "delivered" && i.refunded) ? "refunded" : "cancelled";
    else if (live.every((i) => i.fulfillment_status === "delivered")) status = "completed";
    else if (live.some((i) => i.fulfillment_status !== "pending")) status = "processing";
    else status = "paid";
    await c.query("UPDATE marketplace_orders SET status = $2, cancelled_at = CASE WHEN $2 = 'cancelled' THEN now() ELSE cancelled_at END, updated_at = now() WHERE id = $1", [orderId, status]);
  }

  /** Reembolsa un artículo completo contra el cobro original (en Stripe, la parte proporcional en USD). */
  private async refundAmount(orderId: string, amount: number, key: string) {
    const pay = (await this.db.query<{ provider: string; provider_ref: string | null; amount: string; charged_amount: string | null }>("SELECT provider, provider_ref, amount, charged_amount FROM marketplace_payments WHERE order_id = $1 AND kind = 'full' AND status = 'succeeded' ORDER BY created_at DESC LIMIT 1", [orderId])).rows[0];
    if (!pay) return;
    const ratio = toCents(amount) / toCents(Number(pay.amount));
    const providerAmount = pay.charged_amount ? Math.round(Number(pay.charged_amount) * ratio * 100) / 100 : amount;
    let res;
    try { res = await this.gateway.refund({ providerRef: pay.provider_ref, amount: providerAmount, currency: this.gateway.name === "stripe" ? "USD" : "DOP", reference: orderId, idempotencyKey: `${orderId}:refund:${key}` }); }
    catch (err) { this.log.error({ err, orderId }, "Falló el reembolso del marketplace"); throw new AppError("UPSTREAM_ERROR", "No se pudo procesar el reembolso; intenta de nuevo."); }
    if (!res.ok) throw new AppError("UPSTREAM_ERROR", "El proveedor rechazó el reembolso", { reason: res.reason });
    await this.tx(async (c) => { await c.query("INSERT INTO marketplace_payments (order_id, kind, amount, charged_amount, provider, provider_ref) VALUES ($1,'refund',$2,$3,$4,$5)", [orderId, amount, providerAmount, pay.provider, res.providerRef]); await this.syncPaid(c, orderId); });
  }

  private async refundItem(itemId: string, opts: { restock: boolean; onlyPending?: boolean }) {
    const it = (await this.db.query<{ order_id: string; product_id: string | null; quantity: number; line_total: string; fulfillment_status: string; refunded: boolean; payout_id: string | null; amount_paid: string }>("SELECT i.order_id, i.product_id, i.quantity, i.line_total, i.fulfillment_status, i.refunded, i.payout_id, o.amount_paid FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i.order_id WHERE i.id = $1", [itemId])).rows[0];
    if (!it) throw AppError.notFound("Artículo");
    if (it.refunded || it.fulfillment_status === "cancelled") throw new AppError("BUSINESS_RULE", "El artículo ya fue cancelado o reembolsado", { code: "INVALID_STATE" });
    if (it.payout_id) throw new AppError("BUSINESS_RULE", "El artículo ya se liquidó al vendedor", { code: "ITEM_ALREADY_SETTLED" });
    if (opts.onlyPending && it.fulfillment_status !== "pending") throw new AppError("BUSINESS_RULE", "El artículo ya salió; no se puede cancelar", { code: "INVALID_STATE" });
    if (Number(it.amount_paid) > 0) await this.refundAmount(it.order_id, Number(it.line_total), `item:${itemId}`);
    await this.tx(async (c) => {
      const restock = opts.restock && it.fulfillment_status !== "delivered";
      if (restock && it.product_id) await c.query("UPDATE marketplace_products SET stock = stock + $2, updated_at = now() WHERE id = $1", [it.product_id, it.quantity]);
      await c.query("UPDATE marketplace_order_items SET refunded = true, fulfillment_status = CASE WHEN fulfillment_status = 'delivered' THEN 'delivered' ELSE 'cancelled' END WHERE id = $1", [itemId]);
      await this.refreshStatus(c, it.order_id);
    });
    await this.onMoneyChange?.(it.order_id);
    return it.order_id;
  }

  // ---------- Consulta y acciones del cliente ----------
  async getForCustomer(id: string, access: { token?: string; userId?: string }) {
    const row = (await this.db.query<{ user_id: string | null; access_hash: string | null }>("SELECT user_id, access_hash FROM marketplace_orders WHERE id = $1", [id])).rows[0];
    const ok = row && ((access.token && row.access_hash === sha(access.token)) || (access.userId && row.user_id === access.userId));
    if (!ok) throw AppError.notFound("Pedido");
    return (await this.orderDto(id))!;
  }
  async listMine(userId: string, page: number, perPage: number) {
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM marketplace_orders WHERE user_id = $1", [userId])).rows[0]!.n;
    const { rows } = await this.db.query<{ id: string }>(`SELECT id FROM marketplace_orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, [userId]);
    return { rows: await Promise.all(rows.map((r) => this.orderDto(r.id))), total };
  }

  /** El cliente cancela mientras ningún vendedor haya enviado; se reembolsa todo y vuelve el stock. */
  async cancel(id: string, access: { token?: string; userId?: string }, reason?: string) {
    const o = await this.getForCustomer(id, access);
    if (o.status === "pending") { await this.abandon(id, reason ?? "customer_request"); return (await this.orderDto(id))!; }
    if (!["paid", "processing"].includes(o.status) || o.items.some((i) => i.fulfillment_status !== "pending" && i.fulfillment_status !== "cancelled")) throw new AppError("BUSINESS_RULE", "El pedido ya tiene artículos enviados; contacta al vendedor", { code: "INVALID_STATE" });
    for (const i of o.items) if (i.fulfillment_status === "pending" && !i.refunded) await this.refundItem(i.id, { restock: true, onlyPending: true });
    await this.db.query("UPDATE marketplace_orders SET cancel_reason = $2 WHERE id = $1", [id, reason ?? "customer_request"]);
    const after = (await this.orderDto(id))!;
    await this.mailer.send({ to: after.customer_email, template: "store.order_update", locale: "es", data: { name: after.customer_name.split(" ")[0]!, reference: id.slice(0, 8).toUpperCase(), title: "El pedido fue cancelado", message: after.refund_amount > 0 ? `Te devolvimos ${money(after.refund_amount)}.` : "No se realizó ningún cobro.", url: `${this.env.WEB_BASE_URL}/marketplace/pedido/${id}` } }).catch(() => undefined);
    return after;
  }

  // ---------- Pedidos del vendedor ----------
  async vendorOrders(userId: string, f: { status?: string; page: number; per_page: number }) {
    await this.activeVendor(userId);
    const p: unknown[] = [userId];
    let w = "i.vendor_id = $1 AND o.status IN ('paid','processing','completed','cancelled','refunded') AND o.amount_paid > 0";
    if (f.status) { p.push(f.status); w += ` AND i.fulfillment_status = $${p.length}`; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i.order_id WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT i.id, i.order_id, i.name, i.kind, i.quantity, i.price_unit AS unit_price, i.line_total, i.commission, i.vendor_net, i.fulfillment_status, i.refunded, i.courier_name, i.tracking_number, i.shipped_at, i.delivered_at, o.created_at AS ordered_at, o.customer_name, o.customer_email, o.phone, o.address, o.city, o.province, o.notes FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i.order_id WHERE ${w} ORDER BY o.created_at DESC, i.id LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, p);
    return { rows: rows.map((r) => ({ ...r, unit_price: Number(r.unit_price), line_total: Number(r.line_total), commission: Number(r.commission), vendor_net: Number(r.vendor_net) })), total };
  }

  async vendorSetItem(userId: string, itemId: string, status: "shipped" | "delivered", opts: { courier_name?: string; tracking_number?: string }) {
    await this.activeVendor(userId);
    const it = (await this.db.query<{ order_id: string; kind: string; fulfillment_status: string; refunded: boolean; order_status: string }>("SELECT i.order_id, i.kind, i.fulfillment_status, i.refunded, o.status AS order_status FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i.order_id WHERE i.id = $1 AND i.vendor_id = $2", [itemId, userId])).rows[0];
    if (!it) throw AppError.notFound("Artículo");
    if (!["paid", "processing"].includes(it.order_status) || it.refunded) throw new AppError("BUSINESS_RULE", "El pedido no está pagado o el artículo fue reembolsado", { code: "INVALID_STATE" });
    const allowed: Record<string, string[]> = { shipped: ["pending"], delivered: ["pending", "shipped"] };
    if (!allowed[status]!.includes(it.fulfillment_status)) throw new AppError("BUSINESS_RULE", `No se puede pasar de "${it.fulfillment_status}" a "${status}"`, { code: "INVALID_TRANSITION" });
    if (status === "shipped" && it.kind === "product" && !opts.tracking_number) throw AppError.validation("Falta el número de guía");
    await this.tx(async (c) => {
      await c.query(`UPDATE marketplace_order_items SET fulfillment_status = $2, courier_name = coalesce($3, courier_name), tracking_number = coalesce($4, tracking_number), shipped_at = CASE WHEN $2 = 'shipped' THEN now() ELSE coalesce(shipped_at, now()) END, delivered_at = CASE WHEN $2 = 'delivered' THEN now() ELSE delivered_at END WHERE id = $1`, [itemId, status, opts.courier_name ?? null, opts.tracking_number ?? null]);
      await this.refreshStatus(c, it.order_id);
    });
    const o = (await this.orderDto(it.order_id))!;
    const item = o.items.find((i) => i.id === itemId)!;
    await this.notifyBuyer(it.order_id, status === "shipped" ? "Tu pedido va en camino" : "Tu pedido fue entregado", status === "shipped" ? `${item.name}: guía ${opts.tracking_number ?? "—"}` : `${item.name} fue entregado`);
    await this.mailer.send({ to: o.customer_email, template: "store.order_update", locale: "es", data: { name: o.customer_name.split(" ")[0]!, reference: it.order_id.slice(0, 8).toUpperCase(), title: status === "shipped" ? "Tu pedido va en camino" : "Tu pedido fue entregado", message: status === "shipped" ? `${item.name}: guía ${opts.tracking_number ?? "—"}${opts.courier_name ? ` (${opts.courier_name})` : ""}.` : `${item.name} fue entregado.`, url: `${this.env.WEB_BASE_URL}/marketplace/pedido/${it.order_id}` } }).catch(() => undefined);
    return item;
  }

  /** El vendedor cancela un artículo que no puede surtir: se reembolsa y vuelve al stock. */
  async vendorCancelItem(userId: string, itemId: string) {
    await this.activeVendor(userId);
    if (!(await this.db.query("SELECT 1 FROM marketplace_order_items WHERE id = $1 AND vendor_id = $2", [itemId, userId])).rowCount) throw AppError.notFound("Artículo");
    const orderId = await this.refundItem(itemId, { restock: true, onlyPending: true });
    return (await this.orderDto(orderId))!;
  }

  // ---------- Administración de pedidos ----------
  async adminOrders(f: { status?: string; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [], where = ["true"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.status) where.push(`status = ${bind(f.status)}`);
    if (f.q) { const ph = bind(`%${f.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(id::text ILIKE ${ph} OR customer_email ILIKE ${ph} OR customer_name ILIKE ${ph})`); }
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM marketplace_orders WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query<{ id: string }>(`SELECT id FROM marketplace_orders WHERE ${w} ORDER BY created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, params);
    return { rows: await Promise.all(rows.map((r) => this.orderDto(r.id))), total };
  }
  async adminOrder(id: string) { const o = await this.orderDto(id); if (!o) throw AppError.notFound("Pedido"); return o; }

  /** Reembolsa un artículo o todo lo reembolsable del pedido (los ya liquidados al vendedor se rechazan). */
  async adminRefund(id: string, input: { item_id?: string; restock?: boolean }) {
    const o = await this.orderDto(id);
    if (!o) throw AppError.notFound("Pedido");
    if (!["paid", "processing", "completed"].includes(o.status)) throw new AppError("BUSINESS_RULE", `No se puede reembolsar un pedido en estado "${o.status}"`, { code: "INVALID_STATE" });
    const targets = input.item_id ? o.items.filter((i) => i.id === input.item_id) : o.items.filter((i) => !i.refunded && i.fulfillment_status !== "cancelled");
    if (!targets.length) throw AppError.notFound("Artículo");
    for (const i of targets) await this.refundItem(i.id, { restock: input.restock ?? false });
    return (await this.orderDto(id))!;
  }

  // ================= Liquidaciones a vendedores =================
  /** Agrupa por vendedor lo entregado, cobrado y sin devolución, pasada la ventana de espera. Cada artículo entra en un solo lote. */
  async generatePayouts(holdDays = PAYOUT_HOLD_DAYS): Promise<{ payouts: number; ids: string[] }> {
    return this.tx(async (c) => {
      const { rows } = await c.query<{ id: string; vendor_id: string; line_total: string; commission: string; vendor_net: string }>(
        `SELECT i.id, i.vendor_id, i.line_total, i.commission, i.vendor_net FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i.order_id
          WHERE i.fulfillment_status = 'delivered' AND NOT i.refunded AND i.payout_id IS NULL AND i.vendor_id IS NOT NULL AND o.payment_status IN ('paid','partial')
            AND i.delivered_at <= now() - make_interval(days => $1) ORDER BY i.id FOR UPDATE OF i SKIP LOCKED`, [holdDays],
      );
      const byVendor = new Map<string, typeof rows>();
      for (const r of rows) byVendor.set(r.vendor_id, [...(byVendor.get(r.vendor_id) ?? []), r]);
      const ids: string[] = [];
      for (const [vendor, items] of byVendor) {
        const sum = (k: "line_total" | "commission" | "vendor_net") => fromCents(items.reduce((s, i) => s + toCents(Number(i[k])), 0));
        const v = (await c.query<{ payout_method: string | null }>("SELECT payout_method FROM marketplace_vendors WHERE id = $1", [vendor])).rows[0];
        const p = (await c.query<{ id: string }>("INSERT INTO vendor_payments (partner_id, amount, gross, commission, item_count, status, payout_method) VALUES ($1,$2,$3,$4,$5,'pending',$6) RETURNING id", [vendor, sum("vendor_net"), sum("line_total"), sum("commission"), items.length, v?.payout_method ?? null])).rows[0]!;
        await c.query("UPDATE marketplace_order_items SET payout_id = $2 WHERE id = ANY($1)", [items.map((i) => i.id), p.id]);
        ids.push(p.id);
      }
      return { payouts: ids.length, ids };
    });
  }

  async vendorPayouts(userId: string) {
    await this.activeVendor(userId);
    const payouts = (await this.db.query("SELECT id, amount, gross, commission, item_count, status, payout_method, payout_reference AS reference, paid_at, created_at FROM vendor_payments WHERE partner_id = $1 ORDER BY created_at DESC LIMIT 100", [userId])).rows.map((r) => ({ ...r, amount: Number(r.amount), gross: Number(r.gross), commission: Number(r.commission) }));
    const b = (await this.db.query("SELECT coalesce(sum(vendor_net) FILTER (WHERE fulfillment_status = 'delivered' AND payout_id IS NULL), 0) AS to_settle, coalesce(sum(vendor_net) FILTER (WHERE fulfillment_status IN ('pending','shipped')), 0) AS in_progress FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i.order_id WHERE i.vendor_id = $1 AND NOT i.refunded AND o.payment_status IN ('paid','partial')", [userId])).rows[0];
    return { balance: { to_settle: Number(b.to_settle), in_progress: Number(b.in_progress), hold_days: PAYOUT_HOLD_DAYS }, payouts };
  }
  async adminPayouts(f: { status?: string; page: number; per_page: number }) {
    const p: unknown[] = [];
    let w = "true";
    if (f.status) { p.push(f.status); w = "vp.status = $1"; }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM vendor_payments vp WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT vp.id, vp.partner_id AS vendor_id, v.name AS vendor, vp.amount, vp.gross, vp.commission, vp.item_count, vp.status, vp.payout_method, vp.payout_reference AS reference, vp.paid_at, vp.created_at FROM vendor_payments vp LEFT JOIN marketplace_vendors v ON v.id = vp.partner_id WHERE ${w} ORDER BY vp.created_at DESC LIMIT ${f.per_page} OFFSET ${(f.page - 1) * f.per_page}`, p);
    return { rows: rows.map((r) => ({ ...r, amount: Number(r.amount), gross: r.gross === null ? null : Number(r.gross), commission: r.commission === null ? null : Number(r.commission) })), total };
  }
  async adminSettlePayout(id: string, input: { status: "paid" | "failed"; reference?: string }) {
    return this.tx(async (c) => {
      const p = (await c.query<{ status: string; partner_id: string; amount: string }>("SELECT status, partner_id, amount FROM vendor_payments WHERE id = $1 FOR UPDATE", [id])).rows[0];
      if (!p) throw AppError.notFound("Liquidación");
      if (p.status !== "pending") throw new AppError("BUSINESS_RULE", `La liquidación ya está en estado "${p.status}"`, { code: "INVALID_STATE" });
      if (input.status === "paid" && !input.reference) throw AppError.validation("Falta la referencia del pago");
      await c.query("UPDATE vendor_payments SET status = $2, payout_reference = $3, paid_at = CASE WHEN $2 = 'paid' THEN now() ELSE NULL END WHERE id = $1", [id, input.status, input.reference ?? null]);
      if (input.status === "failed") await c.query("UPDATE marketplace_order_items SET payout_id = NULL WHERE payout_id = $1", [id]);
      return { id, status: input.status, amount: Number(p.amount), reference: input.reference ?? null };
    });
  }
}
