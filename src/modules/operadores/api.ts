// Capa de datos del módulo Operadores RD.
// Con sesión real (`HAS_BACKEND_SESSION`) se comunica directamente con la API REST de Fastify
// (`/api/v1/orgs`, `/api/v1/org/*`); con sesión simulada utiliza el cliente Supabase local.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { slugify } from "./constants";
import type {
  Booking, BookingStatus, Listing, OperatorMessage, OperatorOrg, OperatorReview, Promotion,
} from "./types";

// Cliente simulado (modo demo): tablas sin tipos generados, así que se describe sólo la cadena que se usa aquí.
type MockResult = { data: unknown; error: { message?: string } | null };
interface MockQuery extends PromiseLike<MockResult> {
  select(cols: string): MockQuery; eq(col: string, v: unknown): MockQuery; order(col: string, o?: { ascending: boolean }): MockQuery;
  insert(row: unknown): MockQuery; update(patch: unknown): MockQuery; delete(): MockQuery;
}
const from = (t: string) => (supabase as unknown as { from(t: string): MockQuery }).from(t);

/** `OrgRow` de backend/src/modules/operators/catalog.ts (`/orgs/me`, `POST /orgs`, `GET /operators`). */
interface ApiOrg {
  id: string; business_name: string; slug: string; business_type: string; email: string; phone: string | null; description: string | null;
  province: string | null; logo_url: string | null; cover_url: string | null; verification: string; commission_rate: number; payout_method: string | null; website_enabled: boolean; created_at: string;
}
/** `publicSite` de catalog.ts (`GET /operators/:slug`): el sitio público no expone el id ni los datos de contacto. */
interface ApiPublicSite { operator: Pick<ApiOrg, "business_name" | "slug" | "description" | "province" | "logo_url" | "cover_url">; listings: Listing[] }
/** `BookingDto` de backend/src/modules/operators/bookings.ts. No trae `org_id`: es la organización de quien consulta. */
interface ApiBooking {
  id: string; reference: string; status: string; payment_status: string; source: string;
  listing: { id: string; title: string; category: string }; operator: { name: string; slug: string }; room_name: string | null;
  date: string; check_out: string | null; time: string | null; guests: number; adults: number; children: number; infants: number;
  currency: string; total_price: number; amount_paid: number; promo_code: string | null; extras: unknown[];
  contact: { name: string; email: string; phone?: string }; notes: string | null; review_pending: boolean; created_at: string;
}
/** Fila de `reservations` del modo demo. */
type MockReservation = Partial<Omit<Booking, "status">> & { id: string; status?: string; check_in?: string; adults?: number; children?: number };
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const iso = () => new Date().toISOString();

async function rows<T>(q: PromiseLike<MockResult>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw new Error(error.message || "Error de datos");
  return (data || []) as T[];
}

// ---------- Organizaciones (partner_profiles / orgs) ----------
export async function fetchOrgByUser(userId: string, email?: string | null): Promise<OperatorOrg | null> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: { org: ApiOrg; role: string; listing_ids?: string[] } }>("/orgs/me");
      if (res?.data?.org) {
        return normalizeOrg(res.data.org);
      }
    } catch {
      return null;
    }
  }

  const list = await rows<OperatorOrg>(from("partner_profiles").select("*").eq("id", userId));
  if (list[0]) return normalizeOrg(list[0]);
  // Miembro de equipo: la organización que lo invitó por correo.
  const e = (email || "").trim().toLowerCase();
  if (!e) return null;
  const all = await rows<OperatorOrg>(from("partner_profiles").select("*"));
  const hit = all.find((o) => Array.isArray(o.team) && o.team.some((m) => (m.email || "").toLowerCase() === e));
  return hit ? normalizeOrg(hit) : null;
}

export async function fetchOrgBySlug(slug: string): Promise<OperatorOrg | null> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: ApiPublicSite }>(`/operators/${encodeURIComponent(slug)}`);
      // Sólo los operadores verificados con sitio activo tienen página pública; el slug hace de id en ella.
      if (res?.data) return normalizeOrg({ ...res.data.operator, id: res.data.operator.slug, verification: "verified", website_enabled: true });
    } catch {
      // continuar a fallback si aplica
    }
  }
  const list = await rows<OperatorOrg>(from("partner_profiles").select("*").eq("slug", slug));
  return list[0] ? normalizeOrg(list[0]) : null;
}

export async function fetchOrgs(): Promise<OperatorOrg[]> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: ApiOrg[] }>("/operators?per_page=100");
      if (Array.isArray(res?.data)) return res.data.map(normalizeOrg);
    } catch {
      // fallback
    }
  }
  return (await rows<OperatorOrg>(from("partner_profiles").select("*"))).map(normalizeOrg);
}

/** Organización de la API (campos `null`) o del modo demo, en la forma que usan las pantallas. */
type OrgSource = OperatorOrg | ApiOrg | (ApiPublicSite["operator"] & Pick<ApiOrg, "id" | "verification" | "website_enabled">);
function normalizeOrg(r: OrgSource): OperatorOrg {
  return {
    ...(r as unknown as OperatorOrg),
    slug: r.slug || slugify(r.business_name || r.id),
    verification: (r.verification || "unverified") as OperatorOrg["verification"],
    commission_rate: Number(("commission_rate" in r ? r.commission_rate : null) ?? 8),
    website_enabled: r.website_enabled ?? false,
  };
}

export async function createOrg(userId: string, input: { business_name: string; email?: string; business_type?: string }) {
  if (HAS_BACKEND_SESSION) {
    const res = await fetchApi<{ data: ApiOrg }>("/orgs", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return normalizeOrg(res.data);
  }

  const slugBase = slugify(input.business_name) || "operador";
  const existing = await fetchOrgBySlug(slugBase);
  const org = {
    id: userId,
    business_name: input.business_name,
    slug: existing ? `${slugBase}-${Math.random().toString(36).slice(2, 5)}` : slugBase,
    email: input.email || "",
    business_type: input.business_type || "tour_operator",
    verification: "unverified" as const,
    commission_rate: 8,
    website_enabled: false,
    created_at: iso(),
  };
  const { error } = await from("partner_profiles").insert(org);
  if (error) throw new Error(error.message);
  return normalizeOrg(org);
}

export async function updateOrg(id: string, patch: Partial<OperatorOrg>) {
  if (HAS_BACKEND_SESSION) {
    await fetchApi("/orgs/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return;
  }
  const { error } = await from("partner_profiles").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Servicios (listings) ----------
export async function fetchListings(orgId: string): Promise<Listing[]> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: Listing[] }>("/org/listings");
      if (Array.isArray(res?.data)) return res.data;
    } catch {
      // fallback
    }
  }
  return rows<Listing>(from("operator_listings").select("*").eq("org_id", orgId).order("created_at", { ascending: false }));
}

export async function fetchPublishedListings(): Promise<Listing[]> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: Listing[] }>("/org/listings?status=published");
      if (Array.isArray(res?.data)) return res.data;
    } catch {
      // fallback
    }
  }
  const [listings, orgs] = await Promise.all([
    rows<Listing>(from("operator_listings").select("*").eq("status", "published")),
    fetchOrgs(),
  ]);
  const ok = new Set(orgs.filter((o) => o.verification === "verified").map((o) => o.id));
  return listings.filter((l) => ok.has(l.org_id));
}

export async function fetchListingBySlug(orgId: string, slug: string): Promise<Listing | null> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: Listing }>(`/org/listings/${encodeURIComponent(slug)}`);
      if (res?.data) return res.data;
    } catch {
      // fallback
    }
  }
  const list = await rows<Listing>(from("operator_listings").select("*").eq("org_id", orgId).eq("slug", slug));
  return list[0] || null;
}

export async function saveListing(input: Partial<Listing> & { org_id: string; title: string }) {
  if (HAS_BACKEND_SESSION) {
    if (input.id) {
      const { id, ...patch } = input;
      const res = await fetchApi<{ data: Pick<Listing, "id"> }>(`/org/listings/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      return res.data?.id || id;
    }
    const res = await fetchApi<{ data: Pick<Listing, "id"> }>("/org/listings", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data?.id || uid("lst");
  }

  if (input.id) {
    const { id, ...patch } = input;
    const { error } = await from("operator_listings").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return input.id;
  }
  const id = uid("lst");
  const row = {
    currency: "USD", languages: ["Español"], includes: [], images: [], time_slots: [], capacity: 10,
    cancellation_policy: "flexible", status: "draft", summary: "", description: "", destination: "", price: 0,
    duration: "", ...input, id, slug: input.slug || slugify(input.title), created_at: iso(),
  };
  const { error } = await from("operator_listings").insert(row);
  if (error) throw new Error(error.message);
  return id;
}

export async function deleteListing(id: string) {
  if (HAS_BACKEND_SESSION) {
    await fetchApi(`/org/listings/${encodeURIComponent(id)}`, { method: "DELETE" });
    return;
  }
  const { error } = await from("operator_listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Reservas (reservations) ----------
/** La API agrupa servicio y contacto; aquí se aplanan y se les asigna la organización consultada. */
function apiBooking(r: ApiBooking, orgId: string | undefined): Booking {
  return toBooking({
    ...r, org_id: orgId, listing_id: r.listing.id, listing_title: r.listing.title, contact_name: r.contact.name, contact_email: r.contact.email, contact_phone: r.contact.phone,
    room_name: r.room_name ?? undefined, check_out: r.check_out ?? undefined, time: r.time ?? undefined, promo_code: r.promo_code ?? undefined, notes: r.notes ?? undefined,
    currency: r.currency as Booking["currency"], payment_status: r.payment_status as Booking["payment_status"], source: r.source as Booking["source"], extras: r.extras as Booking["extras"],
  });
}

function toBooking(r: MockReservation): Booking {
  return {
    id: r.id,
    org_id: r.org_id,
    listing_id: r.listing_id || "",
    listing_title: r.listing_title || "Servicio Turístico",
    contact_name: r.contact_name || "Viajero",
    contact_email: r.contact_email || "",
    contact_phone: r.contact_phone,
    date: r.date || (r.check_in ? String(r.check_in).split("T")[0] : ""),
    time: r.time,
    guests: Number(r.guests ?? (r.adults ? r.adults + (r.children || 0) : 1)),
    total_price: Number(r.total_price ?? 0),
    currency: r.currency || "USD",
    status: (["pending", "confirmed", "in_progress", "completed", "cancelled"].includes(r.status) ? r.status : "pending") as BookingStatus,
    extras: Array.isArray(r.extras) ? r.extras : undefined,
    guest_mix: r.guest_mix || undefined,
    notified: r.notified || undefined,
    payment_status: r.payment_status || "unpaid",
    amount_paid: r.amount_paid != null ? Number(r.amount_paid) : undefined,
    promo_code: r.promo_code,
    notes: r.notes,
    room_id: r.room_id,
    room_name: r.room_name,
    check_out: r.check_out ? String(r.check_out).split("T")[0] : undefined,
    source: r.source || "web",
    review_pending: r.review_pending,
    created_at: r.created_at || iso(),
  };
}

/** Monto realmente cobrado de una reserva. */
export const paidAmount = (b: Pick<Booking, "payment_status" | "amount_paid" | "total_price">) =>
  b.payment_status === "paid" ? b.total_price : b.payment_status === "partial" ? Math.min(b.total_price, b.amount_paid || 0) : 0;
export const balanceDue = (b: Pick<Booking, "payment_status" | "amount_paid" | "total_price" | "status">) =>
  b.status === "cancelled" ? 0 : Math.max(0, b.total_price - paidAmount(b));

export async function fetchBookings(orgId: string): Promise<Booking[]> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: ApiBooking[] }>("/org/bookings?per_page=100");
      if (Array.isArray(res?.data)) return res.data.map((b) => apiBooking(b, orgId));
    } catch {
      // fallback
    }
  }
  const list = await rows<MockReservation>(from("reservations").select("*").eq("org_id", orgId).order("created_at", { ascending: false }));
  return list.map(toBooking);
}

export async function fetchAllBookings(): Promise<Booking[]> {
  if (HAS_BACKEND_SESSION) {
    try {
      // Con sesión real sólo se ven las reservas de la organización propia; su id lo da /orgs/me.
      const [res, me] = await Promise.all([
        fetchApi<{ data: ApiBooking[] }>("/org/bookings?per_page=100"),
        fetchApi<{ data: { org: ApiOrg } }>("/orgs/me").catch(() => null),
      ]);
      if (Array.isArray(res?.data)) return res.data.map((b) => apiBooking(b, me?.data.org.id));
    } catch {
      // fallback
    }
  }
  const list = await rows<MockReservation>(from("reservations").select("*"));
  return list.filter((r) => r.org_id).map(toBooking);
}

export async function createBooking(input: Omit<Booking, "id" | "created_at" | "status" | "payment_status"> & Partial<Pick<Booking, "status" | "payment_status">>) {
  if (HAS_BACKEND_SESSION) {
    const payload = {
      request: {
        listing_id: input.listing_id,
        room_id: input.room_id,
        date: input.date,
        check_out: input.check_out,
        time: input.time,
        adults: input.guests || 1,
        children: 0,
        extras: input.extras?.map((e) => (typeof e === "string" ? e : e.id)) ?? [],
        promo_code: input.promo_code,
      },
      contact: {
        name: input.contact_name,
        email: input.contact_email,
        phone: input.contact_phone,
      },
      notes: input.notes,
    };
    const res = await fetchApi<{ data: Pick<ApiBooking, "id"> }>("/org/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data?.id || uid("bk");
  }

  const row = {
    ...input,
    id: uid("bk"),
    status: input.status || "pending",
    payment_status: input.payment_status || "unpaid",
    check_in: input.date,
    check_out: input.check_out || input.date,
    created_at: iso(),
  };
  const { error } = await from("reservations").insert(row);
  if (error) throw new Error(error.message);
  return row.id as string;
}

export async function updateBooking(id: string, patch: Partial<Booking>) {
  if (HAS_BACKEND_SESSION) {
    if (patch.status && ["confirmed", "in_progress", "completed", "cancelled"].includes(patch.status)) {
      await fetchApi(`/org/bookings/${encodeURIComponent(id)}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: patch.status }),
      });
    }
    if (patch.notes !== undefined) {
      await fetchApi(`/org/bookings/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ notes: patch.notes }),
      });
    }
    return;
  }
  const { error } = await from("reservations").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export function availableSpots(listing: Listing, bookings: Booking[], date: string, time?: string) {
  const taken = bookings
    .filter((b) => b.listing_id === listing.id && b.date === date && b.status !== "cancelled" && (!time || b.time === time))
    .reduce((n, b) => n + b.guests, 0);
  return Math.max(0, listing.capacity - taken);
}

export const nightsBetween = (from: string, to: string) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 86400000));

// Unidades libres de una habitación en [checkIn, checkOut): descuenta reservas que se solapan.
export function availableRooms(listing: Listing, roomId: string, bookings: Booking[], checkIn: string, checkOut: string) {
  const room = listing.rooms?.find((r) => r.id === roomId);
  if (!room) return 0;
  const taken = bookings.filter((b) => b.listing_id === listing.id && b.room_id === roomId && b.status !== "cancelled" && b.date < checkOut && (b.check_out || b.date) > checkIn).length;
  return Math.max(0, room.quantity - taken);
}

// ---------- Mensajes ----------
export async function fetchMessages(orgId: string): Promise<OperatorMessage[]> {
  return rows<OperatorMessage>(from("operator_messages").select("*").eq("org_id", orgId).order("created_at", { ascending: true }));
}

export async function sendMessage(m: Omit<OperatorMessage, "id" | "created_at" | "read"> & { read?: boolean }) {
  const { error } = await from("operator_messages").insert({ ...m, id: uid("msg"), read: m.read ?? m.sender === "operator", created_at: iso() });
  if (error) throw new Error(error.message);
}

export async function markThreadRead(orgId: string, threadId: string) {
  await from("operator_messages").update({ read: true }).eq("org_id", orgId).eq("thread_id", threadId);
}

// ---------- Promociones ----------
export async function fetchPromotions(orgId: string): Promise<Promotion[]> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: Promotion[] }>("/org/promotions");
      if (Array.isArray(res?.data)) return res.data;
    } catch {
      // fallback
    }
  }
  return rows<Promotion>(from("operator_promotions").select("*").eq("org_id", orgId).order("created_at", { ascending: false }));
}

export async function findPromotion(orgId: string, code: string): Promise<Promotion | null> {
  const list = await fetchPromotions(orgId);
  const p = list.find((x) => x.code.toLowerCase() === code.trim().toLowerCase() && x.active);
  if (!p) return null;
  if (p.max_uses && p.uses >= p.max_uses) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (p.ends_at && p.ends_at < today) return null;
  return p;
}

export async function savePromotion(p: Partial<Promotion> & { org_id: string; code: string }) {
  if (HAS_BACKEND_SESSION) {
    if (p.id) {
      const { id, ...patch } = p;
      await fetchApi(`/org/promotions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      return;
    }
    await fetchApi("/org/promotions", {
      method: "POST",
      body: JSON.stringify(p),
    });
    return;
  }

  if (p.id) {
    const { id, ...patch } = p;
    const { error } = await from("operator_promotions").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await from("operator_promotions").insert({ type: "percent", value: 10, uses: 0, active: true, ...p, id: uid("promo"), created_at: iso() });
  if (error) throw new Error(error.message);
}

export async function deletePromotion(id: string) {
  if (HAS_BACKEND_SESSION) {
    await fetchApi(`/org/promotions/${encodeURIComponent(id)}`, { method: "DELETE" });
    return;
  }
  await from("operator_promotions").delete().eq("id", id);
}

export async function bumpPromotionUse(id: string, uses: number) {
  await from("operator_promotions").update({ uses: uses + 1 }).eq("id", id);
}

// ---------- Reseñas ----------
export async function fetchReviews(orgId: string): Promise<OperatorReview[]> {
  return rows<OperatorReview>(from("operator_reviews").select("*").eq("org_id", orgId).order("created_at", { ascending: false }));
}

export async function replyReview(id: string, reply: string) {
  const { error } = await from("operator_reviews").update({ reply }).eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Datos de demostración para una organización nueva ----------
export async function seedDemoData(org: OperatorOrg) {
  const existing = await fetchListings(org.id);
  if (existing.length) return;
  const base = [
    { title: "Excursión en catamarán a Isla Saona", cat: "experiencia", price: 75, dest: "La Romana", dur: "8 horas", cap: 30 },
    { title: "Tour de café y cacao en Jarabacoa", cat: "experiencia", price: 40, dest: "Jarabacoa", dur: "4 horas", cap: 14 },
    { title: "Renta de vehículo 4x4 por día", cat: "transporte", price: 85, dest: "Punta Cana", dur: "Por día", cap: 5 },
  ] as const;
  const ids: string[] = [];
  for (const b of base) {
    ids.push(await saveListing({
      org_id: org.id, title: b.title, category: b.cat, price: b.price, destination: b.dest, duration: b.dur, capacity: b.cap,
      summary: `${b.title}, con atención personalizada.`, description: `${b.title}. Servicio de ejemplo generado para que explores el panel; edítalo o elimínalo cuando quieras.`,
      status: "published", time_slots: ["09:00", "14:00"], languages: ["Español", "Inglés"], includes: ["Guía local", "Seguro de viaje"],
      images: [], rating: 4.8, reviews_count: 12,
    } as Partial<Listing> & { org_id: string; title: string }));
  }
  const names = ["Sarah Connor", "Michael Torres", "Penélope Díaz", "Juan Almonte", "Alice Smith", "Lucas Martin", "Marie Dubois", "Pedro Santana"];
  const statuses: BookingStatus[] = ["confirmed", "pending", "completed", "completed", "in_progress", "confirmed", "cancelled", "pending"];
  const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  for (let i = 0; i < names.length; i++) {
    const idx = i % base.length;
    const guests = 1 + (i % 4);
    await createBooking({
      org_id: org.id, listing_id: ids[idx], listing_title: base[idx].title, contact_name: names[i],
      contact_email: `${slugify(names[i])}@example.com`, date: day(i * 2 - 6), time: "09:00", guests,
      total_price: base[idx].price * guests, currency: "USD", status: statuses[i],
      payment_status: statuses[i] === "completed" || statuses[i] === "confirmed" ? "paid" : statuses[i] === "cancelled" ? "refunded" : "unpaid",
      source: i % 3 === 0 ? "manual" : "web", review_pending: statuses[i] === "completed" && i === 2,
    });
  }
  const threads: [string, string, "whatsapp" | "web" | "instagram" | "email", string][] = [
    ["Sarah Connor", "web", "web", "Hola, ¿el tour incluye recogida en el hotel?"],
    ["Michael Torres", "wa", "whatsapp", "¿Tienen cupo para 6 personas el sábado?"],
    ["Marie Dubois", "ig", "instagram", "Bonjour ! Avez-vous des visites en français ?"],
  ];
  for (const [name, t, channel, body] of threads) {
    await sendMessage({ org_id: org.id, thread_id: `${t}-${slugify(name)}`, traveler_name: name, sender: "traveler", channel, body, read: false });
  }
  await savePromotion({ org_id: org.id, code: "BIENVENIDO10", type: "percent", value: 10, max_uses: 50 });
  await savePromotion({ org_id: org.id, code: "AMIGOS5", type: "fixed", value: 5 });
  const { error } = await from("operator_reviews").insert([
    { id: uid("rev"), org_id: org.id, listing_id: ids[0], author: "Juan Almonte", rating: 5, comment: "Excelente servicio, el personal muy atento.", created_at: iso() },
    { id: uid("rev"), org_id: org.id, listing_id: ids[1], author: "Alice Smith", rating: 4, comment: "Great tour, only the pickup was a bit late.", created_at: iso() },
  ]);
  if (error) throw new Error(error.message);
}

// ---------- Sitio público del operador (visitantes) ----------
// Con sesión real el visitante no es miembro de la organización: nada de /org/*; sólo rutas públicas.

/** Organización y servicios que ve un visitante; `isOwner` = vista previa de su propio sitio aún no publicado. */
export async function fetchStorefront(slug: string, userId?: string, email?: string | null): Promise<{ org: OperatorOrg; listings: Listing[]; isOwner: boolean } | null> {
  if (HAS_BACKEND_SESSION) {
    try {
      const res = await fetchApi<{ data: ApiPublicSite }>(`/operators/${encodeURIComponent(slug)}`);
      const org = normalizeOrg({ ...res.data.operator, id: res.data.operator.slug, verification: "verified", website_enabled: true });
      return { org, listings: res.data.listings, isOwner: false };
    } catch (e) {
      if (!(e instanceof HttpError && e.status === 404) || !userId) throw e;
      // No es público todavía: si es la organización de quien mira, se muestra como vista previa.
      const mine = await fetchOrgByUser(userId, email);
      if (!mine || mine.slug !== slug) return null;
      return { org: mine, listings: await fetchListings(mine.id), isOwner: true };
    }
  }
  const org = await fetchOrgBySlug(slug);
  if (!org) return null;
  return { org, listings: await fetchListings(org.id), isOwner: !!userId && userId === org.id };
}

/** `GET /operators/:slug/listings/:listing`: sólo servicios publicados de operadores verificados. */
export async function fetchPublicListing(slug: string, listingSlug: string): Promise<Listing | null> {
  try {
    const res = await fetchApi<{ data: { listing: Listing } }>(`/operators/${encodeURIComponent(slug)}/listings/${encodeURIComponent(listingSlug)}`);
    return res.data.listing;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}

/** Lo que el servidor necesita para cotizar o reservar (operators/routes.ts `bookingRequest`). */
export interface BookingRequest {
  listing_id: string; room_id?: string; date: string; check_out?: string; time?: string;
  adults: number; children: number; infants: number; extras: string[]; promo_code?: string;
}

/** `Quote` de backend/src/modules/operators/domain/quote.ts: precio final, cupos y motivos si no se puede reservar. */
export interface ServerQuote {
  bookable: boolean;
  issues: { code: string; message: string }[];
  currency: "USD" | "DOP";
  lines: { code: string; label: string; quantity: number; unit_price: number; amount: number }[];
  subtotal: number; discount: number; total: number;
  deposit_amount: number | null;
  nights: number | null;
  seats: number;
  time: string | null;
  end_date: string | null;
  /** Cupos o habitaciones libres antes de esta reserva. */
  remaining: number | null;
  promo: { code: string; applied: boolean; reason?: string } | null;
  departure: { booked: number; min_guests: number | null; confirmed: boolean } | null;
}

export async function quoteBooking(request: BookingRequest): Promise<ServerQuote> {
  return (await fetchApi<{ data: ServerQuote }>("/bookings/quote", { method: "POST", body: JSON.stringify(request) })).data;
}

/**
 * Reserva del visitante (`POST /bookings`): el servidor recalcula el precio, comprueba cupos y avisa al operador.
 * Sólo «pagar después»: el pago con tarjeta está en «Próximamente». La clave de idempotencia evita duplicados al reintentar.
 */
export async function createPublicBooking(input: { request: BookingRequest; contact: { name: string; email: string; phone?: string }; notes?: string; idempotencyKey: string }): Promise<{ id: string; reference: string; status: string }> {
  const res = await fetchApi<{ data: { booking: ApiBooking } }>("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({ request: input.request, contact: input.contact, notes: input.notes, payment_mode: "pay_later", locale: "es" }),
  });
  return { id: res.data.booking.id, reference: res.data.booking.reference, status: res.data.booking.status };
}

// ---------- Hooks ----------
export const opKeys = {
  org: (uid?: string) => ["op", "org", uid] as const,
  listings: (orgId?: string) => ["op", "listings", orgId] as const,
  bookings: (orgId?: string) => ["op", "bookings", orgId] as const,
  messages: (orgId?: string) => ["op", "messages", orgId] as const,
  promos: (orgId?: string) => ["op", "promos", orgId] as const,
  reviews: (orgId?: string) => ["op", "reviews", orgId] as const,
};

export const useMyOrg = (userId?: string, email?: string | null) =>
  useQuery({ queryKey: [...opKeys.org(userId), email || ""], queryFn: () => fetchOrgByUser(userId!, email), enabled: !!userId });
export const useListings = (orgId?: string) =>
  useQuery({ queryKey: opKeys.listings(orgId), queryFn: () => fetchListings(orgId!), enabled: !!orgId });
export const useBookings = (orgId?: string) =>
  useQuery({ queryKey: opKeys.bookings(orgId), queryFn: () => fetchBookings(orgId!), enabled: !!orgId });
export const useMessages = (orgId?: string) =>
  useQuery({ queryKey: opKeys.messages(orgId), queryFn: () => fetchMessages(orgId!), enabled: !!orgId });
export const usePromotions = (orgId?: string) =>
  useQuery({ queryKey: opKeys.promos(orgId), queryFn: () => fetchPromotions(orgId!), enabled: !!orgId });
export const useReviews = (orgId?: string) =>
  useQuery({ queryKey: opKeys.reviews(orgId), queryFn: () => fetchReviews(orgId!), enabled: !!orgId });

/** Mutación genérica que invalida una o varias claves al terminar. */
export function useOpMutation<TArgs>(fn: (a: TArgs) => Promise<unknown>, invalidate: (readonly unknown[])[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => invalidate.forEach((k) => qc.invalidateQueries({ queryKey: k as unknown[] })),
  });
}
