import { createHash, randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { ContentReaderPort } from "../../contracts/content-reader.js";
import { COLLECTIONS } from "../../contracts/content-collections.js";
import type { GameGrantPort } from "../../contracts/game.js";
import type { NotifyInTransaction } from "../../contracts/notifications.js";
import { addDays, nightsBetween, todayInSantoDomingo } from "../../lib/dates.js";

const Q = (c: string) => `"${c}"`;
const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const MAX_ITEMS = 300;
const INVITE_DAYS = 7;
const TOP100_MILESTONES = [10, 25, 50, 100] as const;
export const MAX_SPOTS = 100;

export type Need = "view" | "edit" | "owner";
export interface ItemInput { day: number; time?: string | null; entity_type?: string; entity_id?: string; title?: string; notes?: string | null; cost?: number }
export interface PackingItem { id: string; label: string; checked: boolean; category?: string }

const numeric = (r: Record<string, unknown>, ...keys: string[]) => { for (const k of keys) if (r[k] !== null && r[k] !== undefined) r[k] = Number(r[k]); return r; };

/** Mi viaje (docs §5.7): viajes con actividades por día, planificación en grupo, diario, lista de empaque, e-tickets y reto Top 100. */
export class TripService {
  constructor(private readonly db: Db, private readonly game: GameGrantPort, private readonly content: ContentReaderPort, private readonly notifyInTx: NotifyInTransaction) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  /** Quien no es ni dueño ni miembro ve "no encontrado" (no se revela que el viaje existe). */
  private async access(tripId: string, userId: string, need: Need) {
    const t = (await this.db.query("SELECT t.*, m.role AS member_role FROM trips t LEFT JOIN trip_members m ON m.trip_id = t.id AND m.user_id = $2 WHERE t.id = $1 AND (t.owner_id = $2 OR m.user_id IS NOT NULL)", [tripId, userId])).rows[0];
    if (!t) throw AppError.notFound("Viaje");
    const role: "owner" | "editor" | "viewer" = t.owner_id === userId ? "owner" : t.member_role;
    if (need === "owner" && role !== "owner") throw new AppError("FORBIDDEN", "Sólo el dueño del viaje puede hacer esto", { code: "NOT_OWNER" });
    if (need === "edit" && role === "viewer") throw new AppError("FORBIDDEN", "Sólo puedes ver este viaje", { code: "READ_ONLY" });
    return { trip: t as Record<string, unknown> & { id: string; owner_id: string; start_date: string | null; end_date: string | null }, role };
  }

  private tripDto(t: Record<string, unknown>) {
    return { id: t.id, title: t.title, start_date: t.start_date, end_date: t.end_date, party_size: t.party_size, budget: t.budget === null ? null : Number(t.budget), currency: t.currency, notes: t.notes, shared: !!t.share_hash, created_at: t.created_at, updated_at: t.updated_at };
  }

  // ---------- Viajes ----------
  async list(userId: string) {
    const { rows } = await this.db.query(
      `SELECT t.*, CASE WHEN t.owner_id = $1 THEN 'owner' ELSE m.role END AS role, (SELECT count(*)::int FROM trip_items i WHERE i.trip_id = t.id) AS item_count
         FROM trips t LEFT JOIN trip_members m ON m.trip_id = t.id AND m.user_id = $1 WHERE t.owner_id = $1 OR m.user_id IS NOT NULL ORDER BY coalesce(t.start_date, t.created_at::date) DESC, t.created_at DESC LIMIT 100`, [userId],
    );
    return rows.map((r) => ({ ...this.tripDto(r), role: r.role, items: r.item_count }));
  }

  async create(userId: string, b: { title: string; start_date?: string; end_date?: string; party_size?: number; budget?: number; currency?: "USD" | "DOP"; notes?: string }) {
    if ((await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM trips WHERE owner_id = $1", [userId])).rows[0]!.n >= 50) throw new AppError("BUSINESS_RULE", "Llegaste al máximo de 50 viajes", { code: "TRIP_LIMIT" });
    if (b.start_date && b.end_date && b.end_date < b.start_date) throw AppError.validation("La fecha de regreso no puede ser anterior a la de salida", { field: "end_date" });
    const row = (await this.db.query("INSERT INTO trips (owner_id, title, start_date, end_date, party_size, budget, currency, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [userId, b.title, b.start_date ?? null, b.end_date ?? null, b.party_size ?? 1, b.budget ?? null, b.currency ?? "USD", b.notes ?? null])).rows[0];
    return this.tripDto(row);
  }

  async update(tripId: string, userId: string, b: Record<string, unknown>) {
    await this.access(tripId, userId, "owner");
    const entries = Object.entries(b).filter(([, v]) => v !== undefined);
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    try { await this.db.query(`UPDATE trips SET ${entries.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1`, [tripId, ...entries.map(([, v]) => v)]); }
    catch (e) { if ((e as { code?: string }).code === "23514") throw AppError.validation("La fecha de regreso no puede ser anterior a la de salida"); throw e; }
    return this.tripDto((await this.access(tripId, userId, "view")).trip);
  }
  async remove(tripId: string, userId: string) { await this.access(tripId, userId, "owner"); await this.db.query("DELETE FROM trips WHERE id = $1", [tripId]); }

  private itemDto(r: Record<string, unknown>) { return numeric({ ...r }, "cost"); }

  async get(tripId: string, userId: string) {
    const { trip, role } = await this.access(tripId, userId, "view");
    const items = (await this.db.query(
      `SELECT i.id, i.day, i.position, i.time, i.entity_type, i.entity_id, i.title, i.notes, i.cost, i.image_url, i.lat, i.lng, coalesce(sum(v.value), 0)::int AS votes, max(v.value) FILTER (WHERE v.user_id = $2) AS my_vote
         FROM trip_items i LEFT JOIN trip_votes v ON v.item_id = i.id WHERE i.trip_id = $1 GROUP BY i.id ORDER BY i.day, i.position, i.created_at`, [tripId, userId],
    )).rows.map((r) => this.itemDto(r));
    const days = new Map<number, unknown[]>();
    for (const i of items) days.set(i.day as number, [...(days.get(i.day as number) ?? []), i]);
    const members = (await this.db.query("SELECT m.user_id, m.role, p.display_name FROM trip_members m LEFT JOIN profiles p ON p.id = m.user_id WHERE m.trip_id = $1 ORDER BY m.created_at", [tripId])).rows;
    const owner = (await this.db.query<{ display_name: string | null }>("SELECT display_name FROM profiles WHERE id = $1", [trip.owner_id])).rows[0];
    return { ...this.tripDto(trip), role, owner: { display_name: owner?.display_name ?? null }, members: members.map((m) => ({ user_id: m.user_id, role: m.role, display_name: m.display_name })), days: [...days.entries()].sort((a, b) => a[0] - b[0]).map(([day, list]) => ({ day, date: trip.start_date ? addDays(String(trip.start_date).slice(0, 10), day - 1) : null, items: list })) };
  }

  // ---------- Actividades ----------
  private async entity(type: string, id: string) {
    const d = COLLECTIONS.find((c) => c.entityType === type || c.path === type);
    if (!d) throw AppError.validation(`Tipo de lugar desconocido: ${type}`, { field: "entity_type" });
    const place = await this.content.getPublicPlace(d.entityType, id);
    if (!place) throw AppError.notFound("Lugar");
    return { type: place.entity_type, id: place.id, name: place.name, image: place.image, lat: place.lat, lng: place.lng };
  }

  private checkDay(trip: { start_date: string | null; end_date: string | null }, day: number) {
    if (trip.start_date && trip.end_date) {
      const span = nightsBetween(String(trip.start_date).slice(0, 10), String(trip.end_date).slice(0, 10)) + 1;
      if (day > span) throw AppError.validation(`El viaje dura ${span} días`, { field: "day" });
    }
  }

  private async insertItem(c: PoolClient | Db, tripId: string, userId: string, b: ItemInput) {
    let title = b.title?.trim() ?? "", e: Awaited<ReturnType<TripService["entity"]>> | null = null;
    if (b.entity_type && b.entity_id) { e = await this.entity(b.entity_type, b.entity_id); title = title || e.name; }
    else if (b.entity_type || b.entity_id) throw AppError.validation("Indica el tipo y el identificador del lugar", { field: "entity_id" });
    if (!title) throw AppError.validation("Indica un lugar o un título", { field: "title" });
    const pos = (await c.query<{ p: number }>("SELECT coalesce(max(position), -1) + 1 AS p FROM trip_items WHERE trip_id = $1 AND day = $2", [tripId, b.day])).rows[0]!.p;
    return (await c.query("INSERT INTO trip_items (trip_id, day, position, time, entity_type, entity_id, title, notes, cost, image_url, lat, lng, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, day, position, time, entity_type, entity_id, title, notes, cost, image_url, lat, lng", [tripId, b.day, pos, b.time ?? null, e?.type ?? null, e?.id ?? null, title, b.notes ?? null, b.cost ?? 0, e?.image ?? null, e?.lat ?? null, e?.lng ?? null, userId])).rows[0];
  }

  private async countItems(tripId: string) { return (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM trip_items WHERE trip_id = $1", [tripId])).rows[0]!.n; }

  async addItem(tripId: string, userId: string, b: ItemInput) {
    const { trip } = await this.access(tripId, userId, "edit");
    this.checkDay(trip, b.day);
    if ((await this.countItems(tripId)) >= MAX_ITEMS) throw new AppError("BUSINESS_RULE", `Un viaje admite hasta ${MAX_ITEMS} actividades`, { code: "ITEM_LIMIT" });
    return this.itemDto(await this.insertItem(this.db, tripId, userId, b));
  }

  async updateItem(tripId: string, itemId: string, userId: string, b: Partial<ItemInput>) {
    const { trip } = await this.access(tripId, userId, "edit");
    if (b.day !== undefined) this.checkDay(trip, b.day);
    const entries = Object.entries(b).filter(([k, v]) => v !== undefined && ["day", "time", "title", "notes", "cost"].includes(k));
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    const r = await this.db.query(`UPDATE trip_items SET ${entries.map(([k], i) => `"${k}" = $${i + 3}`).join(", ")} WHERE id = $1 AND trip_id = $2 RETURNING id, day, position, time, entity_type, entity_id, title, notes, cost, image_url, lat, lng`, [itemId, tripId, ...entries.map(([, v]) => v)]);
    if (!r.rows[0]) throw AppError.notFound("Actividad");
    return this.itemDto(r.rows[0]);
  }
  async removeItem(tripId: string, itemId: string, userId: string) {
    await this.access(tripId, userId, "edit");
    if (!(await this.db.query("DELETE FROM trip_items WHERE id = $1 AND trip_id = $2", [itemId, tripId])).rowCount) throw AppError.notFound("Actividad");
  }

  /** Reordena y mueve de día varias actividades a la vez (todas deben ser de este viaje). */
  async reorder(tripId: string, userId: string, items: { id: string; day: number; position: number }[]) {
    const { trip } = await this.access(tripId, userId, "edit");
    for (const i of items) this.checkDay(trip, i.day);
    await this.tx(async (c) => {
      const own = new Set((await c.query<{ id: string }>("SELECT id FROM trip_items WHERE trip_id = $1 AND id = ANY($2)", [tripId, items.map((i) => i.id)])).rows.map((r) => r.id));
      if (own.size !== new Set(items.map((i) => i.id)).size) throw AppError.validation("Alguna actividad no pertenece a este viaje");
      for (const i of items) await c.query("UPDATE trip_items SET day = $2, position = $3 WHERE id = $1", [i.id, i.day, i.position]);
    });
    return this.get(tripId, userId);
  }

  /** Copia un itinerario (prediseñado o generado por la IA). Lo que no se puede resolver a un lugar del catálogo queda como texto libre. */
  async fromItinerary(tripId: string, userId: string, days: { title?: string; items: { type?: string; ref?: string; title?: string; time?: string; notes?: string; cost?: number }[] }[]) {
    const { trip } = await this.access(tripId, userId, "edit");
    const total = days.reduce((s, d) => s + d.items.length, 0);
    if ((await this.countItems(tripId)) + total > MAX_ITEMS) throw new AppError("BUSINESS_RULE", `Un viaje admite hasta ${MAX_ITEMS} actividades`, { code: "ITEM_LIMIT" });
    if (days.length > 60) throw AppError.validation("Máximo 60 días");
    this.checkDay(trip, days.length);
    let linked = 0, free = 0;
    await this.tx(async (c) => {
      for (const [idx, d] of days.entries()) {
        for (const it of d.items) {
          let entity: { type: string; id: string } | null = null;
          if (it.type && it.ref) { try { const e = await this.entity(it.type, it.ref); entity = { type: e.type, id: e.id }; } catch { entity = null; } }
          const title = it.title?.trim() || (entity ? undefined : (it.type ? `${it.type}` : "Actividad"));
          await this.insertItem(c, tripId, userId, { day: idx + 1, time: it.time && /^([01]\d|2[0-3]):[0-5]\d$/.test(it.time) ? it.time : null, entity_type: entity?.type, entity_id: entity?.id, title, notes: it.notes ?? (d.title ? d.title : null), cost: it.cost });
          if (entity) linked++; else free++;
        }
      }
    });
    return { added: total, linked, free_text: free, trip: await this.get(tripId, userId) };
  }

  // ---------- Resumen ----------
  async summary(tripId: string, userId: string) {
    const { trip } = await this.access(tripId, userId, "view");
    const items = (await this.db.query("SELECT id, day, title, cost, entity_type, entity_id, lat, lng, image_url FROM trip_items WHERE trip_id = $1 ORDER BY day, position", [tripId])).rows;
    const perDay = new Map<number, number>();
    let total = 0;
    for (const i of items) { const c = Number(i.cost); total += c; perDay.set(i.day, (perDay.get(i.day) ?? 0) + c); }
    const budget = trip.budget === null ? null : Number(trip.budget);
    const features = items.filter((i) => i.lat !== null && i.lng !== null).map((i) => ({ type: "Feature", geometry: { type: "Point", coordinates: [i.lng, i.lat] }, properties: { id: i.id, day: i.day, title: i.title, entity_type: i.entity_type, entity_id: i.entity_id, image: i.image_url } }));
    let bookings: unknown[] = [];
    if (trip.owner_id === userId && trip.start_date && trip.end_date) {
      bookings = (await this.db.query("SELECT reference, listing_title AS title, date, check_out, status, total_price, currency FROM bookings WHERE user_id = $1 AND status <> 'cancelled' AND date <= $3 AND coalesce(check_out, date) >= $2 ORDER BY date", [userId, trip.start_date, trip.end_date])).rows.map((b) => ({ ...b, total_price: Number(b.total_price) }));
    }
    const pp = Number(trip.party_size) || 1;
    return {
      currency: trip.currency, estimated_cost: Math.round(total * 100) / 100, per_person: Math.round((total / pp) * 100) / 100, budget, remaining: budget === null ? null : Math.round((budget - total) * 100) / 100, over_budget: budget !== null && total > budget,
      per_day: [...perDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, cost]) => ({ day, cost: Math.round(cost * 100) / 100 })), map: { type: "FeatureCollection", features }, bookings,
    };
  }

  // ---------- Compartir ----------
  async share(tripId: string, userId: string) {
    await this.access(tripId, userId, "owner");
    const token = randomBytes(24).toString("base64url");
    await this.db.query("UPDATE trips SET share_hash = $2, shared_at = now(), updated_at = now() WHERE id = $1", [tripId, sha(token)]);
    return { token };
  }
  async unshare(tripId: string, userId: string) { await this.access(tripId, userId, "owner"); await this.db.query("UPDATE trips SET share_hash = NULL, shared_at = NULL WHERE id = $1", [tripId]); }

  /** Vista pública de sólo lectura: sin costos, presupuesto, notas privadas ni miembros. */
  async shared(token: string) {
    const t = (await this.db.query("SELECT t.id, t.title, t.start_date, t.end_date, t.party_size, p.display_name FROM trips t LEFT JOIN profiles p ON p.id = t.owner_id WHERE t.share_hash = $1", [sha(token)])).rows[0];
    if (!t) throw AppError.notFound("Viaje");
    const items = (await this.db.query("SELECT day, time, entity_type, entity_id, title, image_url, lat, lng FROM trip_items WHERE trip_id = $1 ORDER BY day, position", [t.id])).rows;
    const diary = (await this.db.query("SELECT entry_date, title, body, location, photos FROM trip_diary_entries WHERE trip_id = $1 AND is_public ORDER BY entry_date", [t.id])).rows;
    const days = new Map<number, unknown[]>();
    for (const i of items) days.set(i.day, [...(days.get(i.day) ?? []), i]);
    return { title: t.title, start_date: t.start_date, end_date: t.end_date, party_size: t.party_size, author: t.display_name, days: [...days.entries()].sort((a, b) => a[0] - b[0]).map(([day, list]) => ({ day, items: list })), diary };
  }

  // ---------- Planificador grupal ----------
  async invite(tripId: string, userId: string, role: "viewer" | "editor") {
    await this.access(tripId, userId, "owner");
    const token = randomBytes(24).toString("base64url");
    await this.db.query("INSERT INTO trip_invites (trip_id, token_hash, role, expires_at, created_by) VALUES ($1,$2,$3, now() + make_interval(days => $4), $5)", [tripId, sha(token), role, INVITE_DAYS, userId]);
    return { token, role, expires_in_days: INVITE_DAYS };
  }
  async join(userId: string, token: string) {
    return this.tx(async (c) => {
      const inv = (await c.query<{ id: string; trip_id: string; role: string; uses: number; max_uses: number; expires_at: Date }>("SELECT id, trip_id, role, uses, max_uses, expires_at FROM trip_invites WHERE token_hash = $1 FOR UPDATE", [sha(token)])).rows[0];
      if (!inv || inv.expires_at.getTime() < Date.now() || inv.uses >= inv.max_uses) throw new AppError("BUSINESS_RULE", "La invitación no es válida o venció", { code: "INVITE_INVALID" });
      const trip = (await c.query<{ owner_id: string }>("SELECT owner_id FROM trips WHERE id = $1", [inv.trip_id])).rows[0];
      if (!trip) throw AppError.notFound("Viaje");
      if (trip.owner_id === userId) throw new AppError("CONFLICT", "Ya eres el dueño de este viaje", { reason: "ALREADY_MEMBER" });
      const ins = await c.query("INSERT INTO trip_members (trip_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [inv.trip_id, userId, inv.role]);
      if (!ins.rowCount) throw new AppError("CONFLICT", "Ya eres miembro de este viaje", { reason: "ALREADY_MEMBER" });
      await c.query("UPDATE trip_invites SET uses = uses + 1 WHERE id = $1", [inv.id]);
      const who = (await c.query<{ display_name: string | null }>("SELECT display_name FROM profiles WHERE id = $1", [userId])).rows[0]?.display_name ?? "Alguien";
      const title = (await c.query<{ title: string }>("SELECT title FROM trips WHERE id = $1", [inv.trip_id])).rows[0]?.title ?? "tu viaje";
      await this.notifyInTx(c, trip.owner_id, { type: "social", title: `${who} se unió a tu viaje`, message: title, link: `/mi-viaje/${inv.trip_id}`, data: { trip_id: inv.trip_id } });
      return { trip_id: inv.trip_id, role: inv.role };
    });
  }
  async removeMember(tripId: string, actorId: string, memberId: string) {
    const { role } = await this.access(tripId, actorId, "view");
    if (role !== "owner" && actorId !== memberId) throw new AppError("FORBIDDEN", "Sólo el dueño puede quitar a otros miembros", { code: "NOT_OWNER" });
    if (!(await this.db.query("DELETE FROM trip_members WHERE trip_id = $1 AND user_id = $2", [tripId, memberId])).rowCount) throw AppError.notFound("Miembro");
    await this.db.query("DELETE FROM trip_votes WHERE user_id = $2 AND item_id IN (SELECT id FROM trip_items WHERE trip_id = $1)", [tripId, memberId]);
  }
  async vote(tripId: string, itemId: string, userId: string, value: -1 | 0 | 1) {
    await this.access(tripId, userId, "view");
    if (!(await this.db.query("SELECT 1 FROM trip_items WHERE id = $1 AND trip_id = $2", [itemId, tripId])).rowCount) throw AppError.notFound("Actividad");
    if (value === 0) await this.db.query("DELETE FROM trip_votes WHERE item_id = $1 AND user_id = $2", [itemId, userId]);
    else await this.db.query("INSERT INTO trip_votes (item_id, user_id, value) VALUES ($1,$2,$3) ON CONFLICT (item_id, user_id) DO UPDATE SET value = EXCLUDED.value", [itemId, userId, value]);
    const r = (await this.db.query<{ votes: number }>("SELECT coalesce(sum(value), 0)::int AS votes FROM trip_votes WHERE item_id = $1", [itemId])).rows[0]!;
    return { item_id: itemId, votes: r.votes, my_vote: value === 0 ? null : value };
  }

  // ---------- Diario ----------
  async diary(tripId: string, userId: string) {
    await this.access(tripId, userId, "owner");
    return (await this.db.query("SELECT id, entry_date, title, body, location, photos, is_public, created_at FROM trip_diary_entries WHERE trip_id = $1 ORDER BY entry_date, created_at", [tripId])).rows;
  }
  async addDiary(tripId: string, userId: string, b: { entry_date: string; title: string; body?: string; location?: string; photos?: string[]; is_public?: boolean }) {
    await this.access(tripId, userId, "owner");
    if ((await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM trip_diary_entries WHERE trip_id = $1", [tripId])).rows[0]!.n >= 500) throw new AppError("BUSINESS_RULE", "Máximo 500 entradas por viaje", { code: "DIARY_LIMIT" });
    return (await this.db.query("INSERT INTO trip_diary_entries (trip_id, author_id, entry_date, title, body, location, photos, is_public) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, entry_date, title, body, location, photos, is_public, created_at", [tripId, userId, b.entry_date, b.title, b.body ?? null, b.location ?? null, b.photos ?? [], b.is_public ?? false])).rows[0];
  }
  async updateDiary(tripId: string, entryId: string, userId: string, b: Record<string, unknown>) {
    await this.access(tripId, userId, "owner");
    const entries = Object.entries(b).filter(([, v]) => v !== undefined);
    if (!entries.length) throw AppError.validation("No hay cambios que guardar");
    const r = await this.db.query(`UPDATE trip_diary_entries SET ${entries.map(([k], i) => `"${k}" = $${i + 3}`).join(", ")}, updated_at = now() WHERE id = $1 AND trip_id = $2 RETURNING id, entry_date, title, body, location, photos, is_public`, [entryId, tripId, ...entries.map(([, v]) => v)]);
    if (!r.rows[0]) throw AppError.notFound("Entrada");
    return r.rows[0];
  }
  async removeDiary(tripId: string, entryId: string, userId: string) {
    await this.access(tripId, userId, "owner");
    if (!(await this.db.query("DELETE FROM trip_diary_entries WHERE id = $1 AND trip_id = $2", [entryId, tripId])).rowCount) throw AppError.notFound("Entrada");
  }

  // ---------- Lista de empaque ----------
  async packing(tripId: string, userId: string) {
    const { trip } = await this.access(tripId, userId, "view");
    return trip.packing as PackingItem[];
  }
  async setPacking(tripId: string, userId: string, items: PackingItem[]) {
    await this.access(tripId, userId, "edit");
    if (new Set(items.map((i) => i.id)).size !== items.length) throw AppError.validation("Hay elementos repetidos en la lista");
    await this.db.query("UPDATE trips SET packing = $2, updated_at = now() WHERE id = $1", [tripId, JSON.stringify(items)]);
    return items;
  }

  // ---------- Check-in digital ----------
  /** Confirma la llegada a una reserva propia el día que corresponde y suma XP una sola vez por reserva. */
  async checkIn(tripId: string, userId: string, bookingId: string) {
    await this.access(tripId, userId, "view");
    const b = (await this.db.query<{ status: string; date: string; check_out: string | null; listing_title: string }>("SELECT status, date::text, check_out::text, listing_title FROM bookings WHERE id = $1 AND user_id = $2", [bookingId, userId])).rows[0];
    if (!b) throw AppError.notFound("Reserva");
    if (!["confirmed", "in_progress"].includes(b.status)) throw new AppError("BUSINESS_RULE", "La reserva no está confirmada", { code: "BOOKING_NOT_CONFIRMED" });
    const today = todayInSantoDomingo();
    if (today < addDays(b.date, -1) || today > (b.check_out ?? b.date)) throw new AppError("BUSINESS_RULE", "El check-in se abre el día anterior a la llegada y cierra al terminar la reserva", { code: "OUTSIDE_WINDOW", date: b.date });
    const g = await this.game.grant({ userId, action: "trip_checkin", ref: bookingId, description: `Check-in: ${b.listing_title}` });
    if (g.reason === "duplicate") throw new AppError("CONFLICT", "Ya hiciste el check-in de esta reserva", { reason: "ALREADY_CHECKED_IN" });
    return { booking: b.listing_title, granted: g.granted, level_up: g.level_up };
  }

  // ---------- E-tickets ----------
  async tickets(userId: string) {
    const events = (await this.db.query("SELECT t.id, t.ticket_code AS code, t.status, t.scanned_at, r.start_date::text AS date, coalesce(e.title, 'Evento') AS title FROM event_tickets t JOIN reservations r ON r.id = t.reservation_id LEFT JOIN events e ON e.id = r.entity_id WHERE r.user_id = $1 ORDER BY r.start_date DESC LIMIT 100", [userId])).rows.map((r) => ({ ...r, kind: "event", status: r.status === "unused" ? "valid" : r.status }));
    const bookings = (await this.db.query("SELECT id, reference AS code, status, date::text AS date, listing_title AS title FROM bookings WHERE user_id = $1 AND status IN ('confirmed', 'in_progress', 'completed') ORDER BY date DESC LIMIT 100", [userId])).rows.map((r) => ({ ...r, kind: "booking", scanned_at: null, status: r.status === "confirmed" ? "valid" : r.status === "in_progress" ? "used" : "completed" }));
    return [...events, ...bookings].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  async ticket(userId: string, id: string) {
    const t = (await this.tickets(userId)).find((x) => x.id === id);
    if (!t) throw AppError.notFound("Ticket");
    return t;
  }

  /** Escáner: valida un código. Los tickets de eventos los marca como usados el personal; las reservas las consulta el personal del operador. */
  async verify(userId: string, roles: string[], code: string) {
    const c = code.trim();
    const staff = roles.some((r) => ["admin", "moderator", "editor"].includes(r));
    const ev = (await this.db.query<{ id: string; status: string; scanned_at: Date | null; title: string | null; date: string }>("SELECT t.id, t.status, t.scanned_at, e.title, r.start_date::text AS date FROM event_tickets t JOIN reservations r ON r.id = t.reservation_id LEFT JOIN events e ON e.id = r.entity_id WHERE t.ticket_code = $1", [c])).rows[0];
    if (ev) {
      if (!staff) throw new AppError("FORBIDDEN", "No tienes permiso para validar tickets", { code: "NOT_SCANNER" });
      if (ev.status === "cancelled") throw new AppError("BUSINESS_RULE", "El ticket fue cancelado", { code: "TICKET_CANCELLED" });
      const upd = await this.db.query("UPDATE event_tickets SET status = 'scanned', scanned_at = now() WHERE id = $1 AND status = 'unused'", [ev.id]);
      if (!upd.rowCount) throw new AppError("CONFLICT", "Este ticket ya fue usado", { reason: "ALREADY_SCANNED", scanned_at: ev.scanned_at });
      return { valid: true, kind: "event", title: ev.title, date: ev.date };
    }
    const b = (await this.db.query<{ org_id: string; reference: string; listing_title: string; date: string; status: string; guests: number; contact_name: string }>("SELECT org_id, reference, listing_title, date::text, status, guests, contact_name FROM bookings WHERE upper(reference) = upper($1)", [c])).rows[0];
    if (!b) throw AppError.notFound("Ticket");
    const member = staff || (await this.db.query("SELECT 1 FROM org_members WHERE org_id = $1 AND user_id = $2", [b.org_id, userId])).rowCount;
    if (!member) throw new AppError("FORBIDDEN", "No tienes permiso para validar tickets", { code: "NOT_SCANNER" });
    return { valid: ["confirmed", "in_progress"].includes(b.status), kind: "booking", reference: b.reference, title: b.listing_title, date: b.date, guests: b.guests, guest_name: b.contact_name, status: b.status };
  }

  // ---------- Reto Top 100 ----------
  async spots(userId: string) {
    const rows = (await this.db.query<{ spot_id: string; status: string; visited_at: Date | null; notes: string | null }>("SELECT spot_id, status, visited_at, notes FROM traveler_spots WHERE user_id = $1 ORDER BY coalesce(visited_at, updated_at) DESC", [userId])).rows;
    const visited = rows.filter((r) => r.status === "visited");
    const next = TOP100_MILESTONES.find((m) => m > visited.length) ?? null;
    return { visited, wishlist: rows.filter((r) => r.status === "wishlist"), totals: { visited: visited.length, wishlist: rows.length - visited.length, goal: MAX_SPOTS }, next_milestone: next ? { at: next, remaining: next - visited.length } : null };
  }
  async markVisited(userId: string, spotId: string, notes?: string) {
    return this.tx(async (c) => {
      await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`spots:${userId}`]);
      const cur = (await c.query<{ status: string }>("SELECT status FROM traveler_spots WHERE user_id = $1 AND spot_id = $2", [userId, spotId])).rows[0];
      if (cur?.status !== "visited") {
        const n = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM traveler_spots WHERE user_id = $1 AND status = 'visited'", [userId])).rows[0]!.n;
        if (n >= MAX_SPOTS) throw new AppError("BUSINESS_RULE", "Ya completaste los 100 lugares", { code: "TOP100_COMPLETE" });
      }
      await c.query("INSERT INTO traveler_spots (user_id, spot_id, status, visited_at, notes) VALUES ($1,$2,'visited',now(),$3) ON CONFLICT (user_id, spot_id) DO UPDATE SET status = 'visited', visited_at = coalesce(traveler_spots.visited_at, now()), notes = coalesce($3, traveler_spots.notes), updated_at = now()", [userId, spotId, notes ?? null]);
      const count = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM traveler_spots WHERE user_id = $1 AND status = 'visited'", [userId])).rows[0]!.n;
      const rewards: { milestone: number; xp: number; coins: number }[] = [];
      for (const m of TOP100_MILESTONES) {
        if (count < m) continue;
        const g = await this.game.grant({ userId, action: `top100_${m}`, ref: String(m), description: `Top 100: ${m} lugares` }, c);
        if (g.granted.xp || g.granted.coins) rewards.push({ milestone: m, ...g.granted });
      }
      return { spot_id: spotId, visited: count, rewards };
    });
  }
  async wish(userId: string, spotId: string) {
    const cur = (await this.db.query<{ status: string }>("SELECT status FROM traveler_spots WHERE user_id = $1 AND spot_id = $2", [userId, spotId])).rows[0];
    if (cur?.status === "visited") throw new AppError("CONFLICT", "Ya lo visitaste", { reason: "ALREADY_VISITED" });
    await this.db.query("INSERT INTO traveler_spots (user_id, spot_id, status) VALUES ($1,$2,'wishlist') ON CONFLICT DO NOTHING", [userId, spotId]);
    return { spot_id: spotId, status: "wishlist" };
  }
  /** Quita el lugar de la lista indicada (`visited` o `wishlist`). Lo ya premiado no se retira. */
  async unmark(userId: string, spotId: string, status: "visited" | "wishlist") {
    if (!(await this.db.query("DELETE FROM traveler_spots WHERE user_id = $1 AND spot_id = $2 AND status = $3", [userId, spotId, status])).rowCount) throw AppError.notFound("Lugar");
  }
}
