import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { slugify } from "../../lib/slug.js";
import { isIsoDate } from "./domain/dates.js";
import type { Extra } from "./domain/quote.js";

export type OrgRole = "owner" | "admin" | "recepcion" | "guia";
export interface OrgRow {
  id: string; business_name: string; slug: string; business_type: string; email: string; phone: string | null; description: string | null;
  province: string | null; logo_url: string | null; cover_url: string | null; verification: string; commission_rate: number; payout_method: string | null; website_enabled: boolean; created_at: string;
}
export interface Membership { org_id: string; role: OrgRole; listing_ids: string[]; verification: string; business_name: string; slug: string }

export const CATEGORIES = ["experiencia", "voluntariado", "alojamiento", "transporte", "paquete"] as const;
const ORG_COLUMNS = "id, business_name, slug, business_type, email, phone, description, province, logo_url, cover_url, verification, commission_rate, payout_method, website_enabled, created_at";
const LISTING_COLS = ["id", "org_id", "category", "title", "slug", "summary", "description", "destination", "price", "currency", "duration", "capacity", "min_age", "languages", "includes", "meeting_point",
  "cancellation_policy", "images", "time_slots", "status", "rating", "reviews_count", "deposit_percent", "extras", "child_price", "infants_free", "min_guests", "days", "itinerary", "components", "created_at", "updated_at"];
const LISTING_COLUMNS = LISTING_COLS.join(", ");

export interface ListingInput {
  category: (typeof CATEGORIES)[number]; title: string; summary?: string; description?: string; destination?: string | null;
  price?: number; currency?: "USD" | "DOP"; duration?: string | null; capacity?: number; min_age?: number | null; languages?: string[]; includes?: string[];
  meeting_point?: string | null; cancellation_policy?: "flexible" | "moderada" | "estricta"; images?: string[]; time_slots?: string[];
  deposit_percent?: number | null; child_price?: number | null; infants_free?: boolean; min_guests?: number | null; days?: number | null;
  itinerary?: { day: number; title: string; description?: string }[]; components?: string[]; extras?: Extra[];
}
export interface RoomInput { name: string; price: number; guests: number; quantity: number; beds?: string | null; amenities?: string[]; image?: string | null; min_nights?: number; weekend_price?: number | null }

export interface RoomDto {
  id: string; name: string; price: number; weekend_price: number | null; min_nights: number; guests: number; quantity: number; beds: string | null;
  amenities: string[]; image: string | null; position: number;
  seasons: { id: string; name: string; from: string; to: string; price: number }[];
  blocks: { id: string; from: string; to: string; reason: string | null; imported: boolean }[];
}
export interface ListingDto {
  id: string; org_id: string; category: ListingInput["category"]; title: string; slug: string; summary: string; description: string; destination: string | null;
  price: number; currency: "USD" | "DOP"; duration: string | null; capacity: number; min_age: number | null; languages: string[]; includes: string[]; meeting_point: string | null;
  cancellation_policy: "flexible" | "moderada" | "estricta"; images: string[]; time_slots: string[]; status: "draft" | "published" | "paused"; rating: number | null; reviews_count: number;
  deposit_percent: number | null; extras: Extra[]; child_price: number | null; infants_free: boolean; min_guests: number | null; days: number | null;
  itinerary: { day: number; title: string; description?: string }[]; components: string[]; created_at: string; updated_at: string; rooms: RoomDto[];
}

const numeric = (v: unknown) => (v === null || v === undefined ? null : Number(v));

/** Catálogo del operador: organizaciones, anuncios, habitaciones, tarifas y bloqueos (docs §5.10). */
export class CatalogService {
  constructor(private readonly db: Db, private readonly env: Env, private readonly log: FastifyBaseLogger) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK"); throw e; }
    finally { c.release(); }
  }

  // ---------- Organizaciones ----------
  private orgDto(r: Record<string, unknown>): OrgRow {
    return { ...(r as unknown as OrgRow), commission_rate: Number(r.commission_rate), created_at: new Date(r.created_at as string).toISOString() };
  }

  async createOrg(userId: string, userEmail: string, input: { business_name: string; business_type?: string; email?: string; phone?: string; province?: string; description?: string }) {
    return this.tx(async (c) => {
      const existing = await c.query("SELECT 1 FROM org_members WHERE user_id = $1 AND role = 'owner'", [userId]);
      if (existing.rowCount) throw new AppError("CONFLICT", "Ya eres propietario de una organización", { reason: "ORG_EXISTS" });
      const base = slugify(input.business_name) || "operador";
      let slug = base;
      for (let i = 2; (await c.query("SELECT 1 FROM partner_profiles WHERE slug = $1", [slug])).rowCount; i++) slug = `${base}-${i}`;
      const id = randomUUID();
      await c.query(
        `INSERT INTO partner_profiles (id, business_name, business_type, email, phone, province, description, slug, verification, commission_rate, website_enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'unverified', 8, false)`,
        [id, input.business_name.trim(), input.business_type ?? "tour_operator", (input.email ?? userEmail).toLowerCase(), input.phone ?? null, input.province ?? null, input.description ?? null, slug],
      );
      await c.query("INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner')", [id, userId]);
      const { rows } = await c.query(`SELECT ${ORG_COLUMNS} FROM partner_profiles WHERE id = $1`, [id]);
      return this.orgDto(rows[0]);
    });
  }

  async membership(userId: string, orgId?: string): Promise<Membership | null> {
    const { rows } = await this.db.query<Membership>(
      `SELECT m.org_id, m.role, m.listing_ids, p.verification, p.business_name, p.slug FROM org_members m JOIN partner_profiles p ON p.id = m.org_id
        WHERE m.user_id = $1 AND ($2::uuid IS NULL OR m.org_id = $2) ORDER BY (m.role = 'owner') DESC, m.created_at LIMIT 1`, [userId, orgId ?? null],
    );
    return rows[0] ?? null;
  }

  async orgById(id: string): Promise<OrgRow> {
    const { rows } = await this.db.query(`SELECT ${ORG_COLUMNS} FROM partner_profiles WHERE id = $1`, [id]);
    if (!rows[0]) throw AppError.notFound("Organización");
    return this.orgDto(rows[0]);
  }

  async updateOrg(id: string, patch: Partial<Pick<OrgRow, "business_name" | "phone" | "description" | "province" | "logo_url" | "cover_url" | "payout_method" | "website_enabled" | "email">>) {
    const keys = Object.keys(patch) as (keyof typeof patch)[];
    if (!keys.length) return this.orgById(id);
    const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
    await this.db.query(`UPDATE partner_profiles SET ${sets.join(", ")} WHERE id = $1`, [id, ...keys.map((k) => patch[k])]);
    return this.orgById(id);
  }

  /** Directorio público: sólo organizaciones verificadas con sitio activo y al menos un anuncio publicado. */
  async directory(q: { q?: string; category?: string; destination?: string; page: number; per_page: number }) {
    const params: unknown[] = [];
    const where = ["p.verification = 'verified'", "p.website_enabled", "EXISTS (SELECT 1 FROM operator_listings l WHERE l.org_id = p.id AND l.status = 'published')"];
    if (q.q) { params.push(`%${q.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(lower(f_unaccent(p.business_name)) LIKE lower(f_unaccent($${params.length})) ESCAPE '\\' OR lower(f_unaccent(coalesce(p.description, ''))) LIKE lower(f_unaccent($${params.length})) ESCAPE '\\')`); }
    if (q.category) { params.push(q.category); where.push(`EXISTS (SELECT 1 FROM operator_listings l WHERE l.org_id = p.id AND l.status = 'published' AND l.category = $${params.length})`); }
    if (q.destination) { params.push(q.destination); where.push(`EXISTS (SELECT 1 FROM operator_listings l WHERE l.org_id = p.id AND l.status = 'published' AND lower(f_unaccent(l.destination)) = lower(f_unaccent($${params.length})))`); }
    const w = where.join(" AND ");
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM partner_profiles p WHERE ${w}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(
      `SELECT p.id, p.business_name, p.slug, p.description, p.province, p.logo_url, p.cover_url,
              (SELECT count(*)::int FROM operator_listings l WHERE l.org_id = p.id AND l.status = 'published') AS listings,
              (SELECT array_agg(DISTINCT l.category) FROM operator_listings l WHERE l.org_id = p.id AND l.status = 'published') AS categories
         FROM partner_profiles p WHERE ${w} ORDER BY p.business_name, p.id LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, params,
    );
    return { rows, total };
  }

  /** Sitio público del operador: perfil y servicios publicados (sin datos de pago ni comisión). */
  async publicSite(slug: string) {
    const o = await this.db.query("SELECT id, business_name, slug, description, province, logo_url, cover_url FROM partner_profiles WHERE slug = $1 AND verification = 'verified' AND website_enabled", [slug]);
    if (!o.rows[0]) throw AppError.notFound("Operador");
    const { rows } = await this.db.query(
      "SELECT id, category, title, slug, summary, destination, price, currency, duration, images, rating, reviews_count FROM operator_listings WHERE org_id = $1 AND status = 'published' ORDER BY created_at DESC", [o.rows[0].id],
    );
    const { id: _id, ...operator } = o.rows[0];
    return { operator, listings: rows.map((r) => ({ ...r, price: Number(r.price), rating: numeric(r.rating) })) };
  }

  async adminListOrgs(q: { verification?: string; q?: string; page: number; per_page: number }) {
    const params: unknown[] = [];
    const where = ["true"];
    if (q.verification) { params.push(q.verification); where.push(`verification = $${params.length}`); }
    if (q.q) { params.push(`%${q.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(business_name ILIKE $${params.length} OR email ILIKE $${params.length})`); }
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM partner_profiles WHERE ${where.join(" AND ")}`, params)).rows[0]!.n;
    const { rows } = await this.db.query(`SELECT ${ORG_COLUMNS} FROM partner_profiles WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, params);
    return { rows: rows.map((r) => this.orgDto(r)), total };
  }

  async setVerification(id: string, verification: "verified" | "rejected" | "pending" | "unverified") {
    const r = await this.db.query("UPDATE partner_profiles SET verification = $2 WHERE id = $1", [id, verification]);
    if (!r.rowCount) throw AppError.notFound("Organización");
    return this.orgById(id);
  }

  // ---------- Anuncios ----------
  private listingDto(r: Record<string, unknown>, rooms: RoomDto[] = []): ListingDto {
    return {
      ...r, price: Number(r.price), child_price: numeric(r.child_price), rating: numeric(r.rating),
      created_at: new Date(r.created_at as string).toISOString(), updated_at: new Date(r.updated_at as string).toISOString(),
      extras: (r.extras as Extra[] | null) ?? [], itinerary: (r.itinerary as unknown[] | null) ?? [], components: (r.components as string[] | null) ?? [],
      rooms,
    } as unknown as ListingDto;
  }

  private async roomsOf(listingIds: string[], client: Db | PoolClient = this.db) {
    if (!listingIds.length) return new Map<string, RoomDto[]>();
    const { rows } = await client.query(
      `SELECT r.id, r.listing_id, r.name, r.price, r.weekend_price, r.min_nights, r.guests, r.quantity, r.beds, r.amenities, r.image, r.position,
              COALESCE((SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'from', s.from_date, 'to', s.to_date, 'price', s.price) ORDER BY s.from_date) FROM room_rate_seasons s WHERE s.room_id = r.id), '[]') AS seasons,
              COALESCE((SELECT jsonb_agg(jsonb_build_object('id', b.id, 'from', b.from_date, 'to', b.to_date, 'reason', b.reason, 'imported', b.link_id IS NOT NULL) ORDER BY b.from_date) FROM room_blocks b WHERE b.room_id = r.id), '[]') AS blocks
         FROM operator_rooms r WHERE r.listing_id = ANY($1) ORDER BY r.position, r.created_at`, [listingIds],
    );
    const map = new Map<string, RoomDto[]>();
    for (const r of rows) {
      const room = { ...r, price: Number(r.price), weekend_price: numeric(r.weekend_price), seasons: (r.seasons as RoomDto["seasons"]).map((x) => ({ ...x, price: Number(x.price) })) };
      delete (room as Record<string, unknown>).listing_id;
      (map.get(r.listing_id) ?? map.set(r.listing_id, []).get(r.listing_id)!).push(room as unknown as RoomDto);
    }
    return map;
  }

  async listListings(orgId: string, opts: { status?: string; only?: string[] } = {}) {
    const { rows } = await this.db.query(
      `SELECT ${LISTING_COLUMNS} FROM operator_listings WHERE org_id = $1 AND ($2::text IS NULL OR status = $2) AND ($3::text[] IS NULL OR id = ANY($3)) ORDER BY created_at DESC`,
      [orgId, opts.status ?? null, opts.only ?? null],
    );
    const rooms = await this.roomsOf(rows.map((r) => r.id));
    return rows.map((r) => this.listingDto(r, rooms.get(r.id) ?? []));
  }

  async getListing(orgId: string, id: string) {
    const { rows } = await this.db.query(`SELECT ${LISTING_COLUMNS} FROM operator_listings WHERE id = $1 AND org_id = $2`, [id, orgId]);
    if (!rows[0]) throw AppError.notFound("Anuncio");
    return this.listingDto(rows[0], (await this.roomsOf([id])).get(id) ?? []);
  }

  /** Reglas por categoría que no dependen de si se publica (se validan al guardar). */
  private validateListing(l: Partial<ListingInput> & { category: string }) {
    const problems: { field: string; issue: string }[] = [];
    const stay = l.category === "alojamiento";
    if (l.extras) {
      const ids = new Set<string>();
      for (const e of l.extras) {
        if (ids.has(e.id)) problems.push({ field: "extras", issue: `id de extra repetido: ${e.id}` });
        ids.add(e.id);
        if (e.unit === "night" && !stay) problems.push({ field: "extras", issue: `"${e.name}": el cobro por noche sólo aplica a alojamientos` });
      }
    }
    if (l.deposit_percent != null && (l.deposit_percent < 1 || l.deposit_percent > 90)) problems.push({ field: "deposit_percent", issue: "Debe estar entre 1 y 90" });
    if (l.time_slots?.some((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))) problems.push({ field: "time_slots", issue: "Formato HH:MM" });
    if (l.category === "paquete") {
      if (l.days != null && (l.days < 2 || l.days > 30)) problems.push({ field: "days", issue: "Un paquete dura entre 2 y 30 días" });
      if (l.days != null && l.itinerary && l.itinerary.length !== l.days) problems.push({ field: "itinerary", issue: "El itinerario debe tener un día por cada día del paquete" });
    } else if (l.days) problems.push({ field: "days", issue: "Sólo los paquetes tienen días" });
    if (stay && (l.child_price != null || l.min_guests != null || l.infants_free)) problems.push({ field: "child_price", issue: "Precios por tipo de persona y mínimo de personas no aplican a alojamientos" });
    if (problems.length) throw AppError.validation("El anuncio tiene datos inválidos", problems);
  }

  async createListing(orgId: string, input: ListingInput) {
    this.validateListing(input);
    const stay = input.category === "alojamiento";
    return this.tx(async (c) => {
      const base = slugify(input.title) || "servicio";
      let slug = base;
      for (let i = 2; (await c.query("SELECT 1 FROM operator_listings WHERE org_id = $1 AND slug = $2", [orgId, slug])).rowCount; i++) slug = `${base}-${i}`;
      if (input.components?.length) await this.assertOwnListings(c, orgId, input.components);
      const id = `lst_${randomUUID()}`;
      await c.query(
        `INSERT INTO operator_listings (id, org_id, category, title, slug, summary, description, destination, price, currency, duration, capacity, min_age, languages, includes, meeting_point,
           cancellation_policy, images, time_slots, status, deposit_percent, extras, child_price, infants_free, min_guests, days, itinerary, components)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'draft',$20,$21,$22,$23,$24,$25,$26,$27)`,
        [id, orgId, input.category, input.title.trim(), slug, input.summary ?? "", input.description ?? "", input.destination ?? null, stay ? 0 : input.price ?? 0, input.currency ?? "USD", input.duration ?? null,
          stay ? 1 : input.capacity ?? 1, input.min_age ?? 0, input.languages ?? ["Español"], input.includes ?? [], input.meeting_point ?? null, input.cancellation_policy ?? "flexible", input.images ?? [],
          stay ? [] : input.time_slots ?? [], input.deposit_percent ?? null, JSON.stringify(input.extras ?? []), input.child_price ?? null, input.infants_free ?? false, input.min_guests ?? null,
          input.days ?? null, JSON.stringify(input.itinerary ?? []), JSON.stringify(input.components ?? [])],
      );
      return id;
    }).then((id) => this.getListing(orgId, id));
  }

  private async assertOwnListings(c: PoolClient | Db, orgId: string, ids: string[]) {
    const { rows } = await c.query<{ id: string }>("SELECT id FROM operator_listings WHERE org_id = $1 AND id = ANY($2) AND category <> 'paquete'", [orgId, ids]);
    const found = new Set(rows.map((r) => r.id));
    const missing = ids.filter((x) => !found.has(x));
    if (missing.length) throw AppError.validation("Los servicios incluidos deben ser anuncios propios que no sean paquetes", { missing });
  }

  async updateListing(orgId: string, id: string, patch: Partial<ListingInput>) {
    const current = await this.getListing(orgId, id);
    if (patch.category && patch.category !== current.category) throw AppError.validation("La categoría no se puede cambiar; crea un anuncio nuevo");
    const merged = { ...(current as unknown as ListingInput), ...patch, category: current.category as ListingInput["category"] };
    this.validateListing(merged);
    if (patch.components?.length) await this.assertOwnListings(this.db, orgId, patch.components);
    const stay = current.category === "alojamiento";
    const map: [string, unknown][] = [
      ["title", patch.title?.trim()], ["summary", patch.summary], ["description", patch.description], ["destination", patch.destination], ["price", stay ? undefined : patch.price], ["currency", patch.currency],
      ["duration", patch.duration], ["capacity", stay ? undefined : patch.capacity], ["min_age", patch.min_age], ["languages", patch.languages], ["includes", patch.includes], ["meeting_point", patch.meeting_point],
      ["cancellation_policy", patch.cancellation_policy], ["images", patch.images], ["time_slots", stay ? undefined : patch.time_slots], ["deposit_percent", patch.deposit_percent], ["child_price", patch.child_price],
      ["infants_free", patch.infants_free], ["min_guests", patch.min_guests], ["days", patch.days],
      ["extras", patch.extras === undefined ? undefined : JSON.stringify(patch.extras)], ["itinerary", patch.itinerary === undefined ? undefined : JSON.stringify(patch.itinerary)], ["components", patch.components === undefined ? undefined : JSON.stringify(patch.components)],
    ];
    const set = map.filter(([, v]) => v !== undefined);
    if (set.length) {
      const cast = (k: string) => (["extras", "itinerary", "components"].includes(k) ? "::jsonb" : "");
      await this.db.query(`UPDATE operator_listings SET ${set.map(([k], i) => `"${k}" = $${i + 3}${cast(k)}`).join(", ")} WHERE id = $1 AND org_id = $2`, [id, orgId, ...set.map(([, v]) => v)]);
    }
    return this.getListing(orgId, id);
  }

  /** Publicar exige organización verificada y un anuncio completo; pausar y volver a borrador no exigen nada. */
  async setListingStatus(orgId: string, id: string, status: "published" | "paused" | "draft") {
    const l = await this.getListing(orgId, id);
    if (status === "published") {
      const org = await this.orgById(orgId);
      if (org.verification !== "verified") throw new AppError("BUSINESS_RULE", "Tu organización aún no está verificada: no puedes publicar", { code: "ORG_NOT_VERIFIED" });
      const problems: { field: string; issue: string }[] = [];
      if (String(l.title).trim().length < 5) problems.push({ field: "title", issue: "El título necesita al menos 5 caracteres" });
      if (!l.destination) problems.push({ field: "destination", issue: "Elige un destino" });
      if (l.category === "alojamiento") { if (!l.rooms.length) problems.push({ field: "rooms", issue: "Agrega al menos una habitación" }); }
      else {
        if (!(Number(l.price) > 0)) problems.push({ field: "price", issue: "El precio debe ser mayor que 0" });
        if (!(l.time_slots as string[]).length) problems.push({ field: "time_slots", issue: "Agrega al menos un horario" });
        if (!(Number(l.capacity) >= 1)) problems.push({ field: "capacity", issue: "Indica los cupos" });
      }
      if (l.category === "paquete") {
        const it = l.itinerary as { title?: string }[];
        if (!l.days || it.length !== l.days || it.some((d) => !d.title?.trim())) problems.push({ field: "itinerary", issue: "Completa el itinerario: un título por cada día" });
      }
      if (problems.length) throw new AppError("BUSINESS_RULE", "El anuncio no está listo para publicarse", { code: "LISTING_INCOMPLETE", problems });
    }
    await this.db.query("UPDATE operator_listings SET status = $3 WHERE id = $1 AND org_id = $2", [id, orgId, status]);
    return this.getListing(orgId, id);
  }

  async deleteListing(orgId: string, id: string) {
    await this.getListing(orgId, id);
    const used = (await this.db.query("SELECT 1 FROM bookings WHERE listing_id = $1 LIMIT 1", [id])).rowCount;
    if (used) throw new AppError("CONFLICT", "El anuncio tiene reservas: pausa el anuncio en lugar de eliminarlo", { reason: "HAS_BOOKINGS" });
    await this.db.query("DELETE FROM operator_listings WHERE id = $1 AND org_id = $2", [id, orgId]);
  }

  /** Ficha pública de un anuncio publicado de una organización verificada. */
  async publicListing(orgSlug: string, listingSlug: string) {
    const { rows } = await this.db.query(
      `SELECT ${LISTING_COLS.map((c) => `l.${c}`).join(", ")} FROM operator_listings l JOIN partner_profiles p ON p.id = l.org_id
        WHERE p.slug = $1 AND l.slug = $2 AND l.status = 'published' AND p.verification = 'verified'`, [orgSlug, listingSlug],
    );
    if (!rows[0]) throw AppError.notFound("Servicio");
    const org = await this.db.query("SELECT business_name, slug, logo_url FROM partner_profiles WHERE slug = $1", [orgSlug]);
    const rooms = (await this.roomsOf([rows[0].id])).get(rows[0].id) ?? [];
    const dto = this.listingDto(rows[0], rooms) as unknown as Record<string, unknown>;
    delete dto.org_id;
    // El público no necesita ver el número de unidades ni los bloqueos importados: sólo lo que puede reservar.
    dto.rooms = rooms.map((r) => ({ id: r.id, name: r.name, price: r.price, weekend_price: r.weekend_price, min_nights: r.min_nights, guests: r.guests, beds: r.beds, amenities: r.amenities, image: r.image, seasons: r.seasons }));
    return { listing: dto, operator: org.rows[0] };
  }

  // ---------- Habitaciones, tarifas y bloqueos ----------
  private async stayOf(c: PoolClient | Db, orgId: string, listingId: string) {
    const { rows } = await c.query<{ category: string }>("SELECT category FROM operator_listings WHERE id = $1 AND org_id = $2", [listingId, orgId]);
    if (!rows[0]) throw AppError.notFound("Anuncio");
    if (rows[0].category !== "alojamiento") throw new AppError("BUSINESS_RULE", "Sólo los alojamientos tienen habitaciones");
  }
  private async roomOwner(c: PoolClient | Db, orgId: string, roomId: string): Promise<string> {
    const { rows } = await c.query<{ listing_id: string }>("SELECT r.listing_id FROM operator_rooms r JOIN operator_listings l ON l.id = r.listing_id WHERE r.id = $1 AND l.org_id = $2", [roomId, orgId]);
    if (!rows[0]) throw AppError.notFound("Habitación");
    return rows[0].listing_id;
  }
  /** El precio "desde" y la capacidad del anuncio se derivan de sus habitaciones. */
  private async syncListingFromRooms(c: PoolClient, listingId: string) {
    await c.query(
      `UPDATE operator_listings l SET price = COALESCE((SELECT min(price) FROM operator_rooms WHERE listing_id = l.id), 0),
              capacity = GREATEST(1, COALESCE((SELECT sum(quantity * guests) FROM operator_rooms WHERE listing_id = l.id), 1))::int WHERE l.id = $1`, [listingId],
    );
  }

  async createRoom(orgId: string, listingId: string, input: RoomInput) {
    return this.tx(async (c) => {
      await this.stayOf(c, orgId, listingId);
      const pos = (await c.query<{ n: number }>("SELECT coalesce(max(position), -1) + 1 AS n FROM operator_rooms WHERE listing_id = $1", [listingId])).rows[0]!.n;
      const { rows } = await c.query<{ id: string }>(
        `INSERT INTO operator_rooms (listing_id, name, price, weekend_price, min_nights, guests, quantity, beds, amenities, image, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [listingId, input.name.trim(), input.price, input.weekend_price ?? null, input.min_nights ?? 1, input.guests, input.quantity, input.beds ?? null, input.amenities ?? [], input.image ?? null, pos],
      );
      await this.syncListingFromRooms(c, listingId);
      return rows[0]!.id;
    }).then(async (id) => (await this.roomsOf([listingId])).get(listingId)!.find((r) => r.id === id)!);
  }

  async updateRoom(orgId: string, roomId: string, patch: Partial<RoomInput>) {
    const listingId = await this.tx(async (c) => {
      const listingId = await this.roomOwner(c, orgId, roomId);
      const cols: [string, unknown][] = [["name", patch.name?.trim()], ["price", patch.price], ["weekend_price", patch.weekend_price], ["min_nights", patch.min_nights], ["guests", patch.guests], ["quantity", patch.quantity], ["beds", patch.beds], ["amenities", patch.amenities], ["image", patch.image]];
      const set = cols.filter(([, v]) => v !== undefined);
      if (set.length) await c.query(`UPDATE operator_rooms SET ${set.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")} WHERE id = $1`, [roomId, ...set.map(([, v]) => v)]);
      await this.syncListingFromRooms(c, listingId);
      return listingId;
    });
    return (await this.roomsOf([listingId])).get(listingId)!.find((r) => r.id === roomId)!;
  }

  async deleteRoom(orgId: string, roomId: string) {
    await this.tx(async (c) => {
      const listingId = await this.roomOwner(c, orgId, roomId);
      const active = await c.query("SELECT 1 FROM bookings WHERE room_id = $1 AND status <> 'cancelled' AND coalesce(check_out, date) >= CURRENT_DATE LIMIT 1", [roomId]);
      if (active.rowCount) throw new AppError("CONFLICT", "La habitación tiene reservas vigentes", { reason: "HAS_BOOKINGS" });
      await c.query("DELETE FROM operator_rooms WHERE id = $1", [roomId]);
      await this.syncListingFromRooms(c, listingId);
    });
  }

  /** Reemplaza temporadas, precio de fin de semana y estadía mínima. Las temporadas no pueden solaparse (precedencia sin ambigüedad). */
  async setRates(orgId: string, roomId: string, input: { weekend_price?: number | null; min_nights?: number; seasons?: { name: string; from: string; to: string; price: number }[] }) {
    const listingId = await this.tx(async (c) => {
      const listingId = await this.roomOwner(c, orgId, roomId);
      if (input.seasons) {
        const sorted = [...input.seasons].sort((a, b) => a.from.localeCompare(b.from));
        for (const s of sorted) if (!isIsoDate(s.from) || !isIsoDate(s.to) || s.to < s.from) throw AppError.validation(`Temporada "${s.name}": fechas inválidas`);
        for (let i = 1; i < sorted.length; i++) if (sorted[i]!.from <= sorted[i - 1]!.to) throw AppError.validation(`Las temporadas "${sorted[i - 1]!.name}" y "${sorted[i]!.name}" se solapan`);
        await c.query("DELETE FROM room_rate_seasons WHERE room_id = $1", [roomId]);
        for (const s of sorted) await c.query("INSERT INTO room_rate_seasons (room_id, name, from_date, to_date, price) VALUES ($1,$2,$3,$4,$5)", [roomId, s.name.trim(), s.from, s.to, s.price]);
      }
      const sets: string[] = []; const args: unknown[] = [roomId];
      if (input.weekend_price !== undefined) { args.push(input.weekend_price); sets.push(`weekend_price = $${args.length}`); }
      if (input.min_nights !== undefined) { args.push(input.min_nights); sets.push(`min_nights = $${args.length}`); }
      if (sets.length) await c.query(`UPDATE operator_rooms SET ${sets.join(", ")} WHERE id = $1`, args);
      return listingId;
    });
    return (await this.roomsOf([listingId])).get(listingId)!.find((r) => r.id === roomId)!;
  }

  /** Reemplaza los bloqueos manuales (los importados de calendarios externos no se tocan). */
  async setBlocks(orgId: string, roomId: string, blocks: { from: string; to: string; reason?: string }[]) {
    const listingId = await this.tx(async (c) => {
      const listingId = await this.roomOwner(c, orgId, roomId);
      for (const b of blocks) if (!isIsoDate(b.from) || !isIsoDate(b.to) || b.to < b.from) throw AppError.validation("Bloqueo con fechas inválidas");
      await c.query("DELETE FROM room_blocks WHERE room_id = $1 AND link_id IS NULL", [roomId]);
      for (const b of blocks) await c.query("INSERT INTO room_blocks (room_id, from_date, to_date, reason) VALUES ($1,$2,$3,$4)", [roomId, b.from, b.to, b.reason ?? null]);
      return listingId;
    });
    return (await this.roomsOf([listingId])).get(listingId)!.find((r) => r.id === roomId)!;
  }
}
