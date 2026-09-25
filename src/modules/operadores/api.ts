// Capa de datos del módulo Operadores RD. Habla con el cliente Supabase (mock en
// memoria + persistencia local para estas tablas) y mantiene la forma de las
// tablas alineada con el esquema SQL de supabase/migrations/…operator_hub.sql.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "./constants";
import type {
  Booking, BookingStatus, Listing, OperatorMessage, OperatorOrg, OperatorReview, Promotion,
} from "./types";

const from = (t: string) => (supabase as any).from(t);
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const iso = () => new Date().toISOString();

async function rows<T>(q: PromiseLike<{ data: any; error: any }>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw new Error(error.message || "Error de datos");
  return (data || []) as T[];
}

// ---------- Organizaciones (partner_profiles) ----------
export async function fetchOrgByUser(userId: string): Promise<OperatorOrg | null> {
  const list = await rows<any>(from("partner_profiles").select("*").eq("id", userId));
  return list[0] ? normalizeOrg(list[0]) : null;
}

export async function fetchOrgBySlug(slug: string): Promise<OperatorOrg | null> {
  const list = await rows<any>(from("partner_profiles").select("*").eq("slug", slug));
  return list[0] ? normalizeOrg(list[0]) : null;
}

export async function fetchOrgs(): Promise<OperatorOrg[]> {
  return (await rows<any>(from("partner_profiles").select("*"))).map(normalizeOrg);
}

function normalizeOrg(r: any): OperatorOrg {
  return {
    ...r,
    slug: r.slug || slugify(r.business_name || r.id),
    verification: r.verification || "unverified",
    commission_rate: Number(r.commission_rate ?? 8),
    website_enabled: r.website_enabled ?? false,
  };
}

export async function createOrg(userId: string, input: { business_name: string; email?: string; business_type?: string }) {
  const slugBase = slugify(input.business_name) || "operador";
  const existing = await fetchOrgBySlug(slugBase);
  const org = {
    id: userId,
    business_name: input.business_name,
    slug: existing ? `${slugBase}-${Math.random().toString(36).slice(2, 5)}` : slugBase,
    email: input.email || "",
    business_type: input.business_type || "tour_operator",
    verification: "unverified",
    commission_rate: 8,
    website_enabled: false,
    created_at: iso(),
  };
  const { error } = await from("partner_profiles").insert(org);
  if (error) throw new Error(error.message);
  return normalizeOrg(org);
}

export async function updateOrg(id: string, patch: Partial<OperatorOrg>) {
  const { error } = await from("partner_profiles").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Servicios ----------
export async function fetchListings(orgId: string): Promise<Listing[]> {
  return rows<Listing>(from("operator_listings").select("*").eq("org_id", orgId).order("created_at", { ascending: false }));
}

export async function fetchPublishedListings(): Promise<Listing[]> {
  const [listings, orgs] = await Promise.all([
    rows<Listing>(from("operator_listings").select("*").eq("status", "published")),
    fetchOrgs(),
  ]);
  const ok = new Set(orgs.filter((o) => o.verification === "verified").map((o) => o.id));
  return listings.filter((l) => ok.has(l.org_id));
}

export async function fetchListingBySlug(orgId: string, slug: string): Promise<Listing | null> {
  const list = await rows<Listing>(from("operator_listings").select("*").eq("org_id", orgId).eq("slug", slug));
  return list[0] || null;
}

export async function saveListing(input: Partial<Listing> & { org_id: string; title: string }) {
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
  const { error } = await from("operator_listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Reservas (reservations) ----------
function toBooking(r: any): Booking {
  return {
    id: r.id, org_id: r.org_id, listing_id: r.listing_id, listing_title: r.listing_title,
    contact_name: r.contact_name || "Viajero", contact_email: r.contact_email || "",
    contact_phone: r.contact_phone, date: r.date || (r.check_in ? String(r.check_in).split("T")[0] : ""),
    time: r.time, guests: Number(r.guests ?? 1), total_price: Number(r.total_price ?? 0),
    currency: r.currency || "USD", status: (["pending", "confirmed", "in_progress", "completed", "cancelled"].includes(r.status) ? r.status : "pending") as BookingStatus,
    extras: Array.isArray(r.extras) ? r.extras : undefined, guest_mix: r.guest_mix || undefined, notified: r.notified || undefined, payment_status: r.payment_status || "unpaid", amount_paid: r.amount_paid != null ? Number(r.amount_paid) : undefined, promo_code: r.promo_code, notes: r.notes,
    room_id: r.room_id, room_name: r.room_name, check_out: r.room_id && r.check_out ? String(r.check_out).split("T")[0] : undefined,
    source: r.source || "web", review_pending: r.review_pending, created_at: r.created_at || iso(),
  };
}

/** Monto realmente cobrado de una reserva. */
export const paidAmount = (b: Pick<Booking, "payment_status" | "amount_paid" | "total_price">) =>
  b.payment_status === "paid" ? b.total_price : b.payment_status === "partial" ? Math.min(b.total_price, b.amount_paid || 0) : 0;
export const balanceDue = (b: Pick<Booking, "payment_status" | "amount_paid" | "total_price" | "status">) =>
  b.status === "cancelled" ? 0 : Math.max(0, b.total_price - paidAmount(b));

export async function fetchBookings(orgId: string): Promise<Booking[]> {
  const list = await rows<any>(from("reservations").select("*").eq("org_id", orgId).order("created_at", { ascending: false }));
  return list.map(toBooking);
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const list = await rows<any>(from("reservations").select("*"));
  return list.filter((r) => r.org_id).map(toBooking);
}

export async function createBooking(input: Omit<Booking, "id" | "created_at" | "status" | "payment_status"> & Partial<Pick<Booking, "status" | "payment_status">>) {
  const row = {
    ...input,
    id: uid("bk"),
    status: input.status || "pending",
    payment_status: input.payment_status || "unpaid",
    check_in: input.date, // compatibilidad con PartnerDashboard existente
    check_out: input.check_out || input.date,
    created_at: iso(),
  };
  const { error } = await from("reservations").insert(row);
  if (error) throw new Error(error.message);
  return row.id as string;
}

export async function updateBooking(id: string, patch: Partial<Booking>) {
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
    } as any));
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

// ---------- Hooks ----------
export const opKeys = {
  org: (uid?: string) => ["op", "org", uid] as const,
  listings: (orgId?: string) => ["op", "listings", orgId] as const,
  bookings: (orgId?: string) => ["op", "bookings", orgId] as const,
  messages: (orgId?: string) => ["op", "messages", orgId] as const,
  promos: (orgId?: string) => ["op", "promos", orgId] as const,
  reviews: (orgId?: string) => ["op", "reviews", orgId] as const,
};

export const useMyOrg = (userId?: string) =>
  useQuery({ queryKey: opKeys.org(userId), queryFn: () => fetchOrgByUser(userId!), enabled: !!userId });
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
