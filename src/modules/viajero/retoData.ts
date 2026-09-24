// Reto "Top 100 destinos": lista curada a partir de los datos estáticos del portal
// y progreso del viajero (visitados / deseados) guardado en el mock persistente.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { destinations } from "@/data/destinations";
import { beaches } from "@/data/beaches";
import { mountains } from "@/data/mountains";
import { rivers } from "@/data/rivers";

export type SpotKind = "destino" | "playa" | "montaña" | "río";
export interface Spot {
  id: string; // `${kind}:${slug}`
  kind: SpotKind;
  slug: string;
  name: string;
  province: string;
  image: string;
  href: string;
  favoriteType: "destino" | "playa" | "rio";
}

const pick = (o: any): { name: string; province: string; image: string } => ({
  name: o.name,
  province: o.provinceName || (Array.isArray(o.provinces) ? o.provinces.join(", ") : o.province) || "",
  image: o.imageUrl || o.image_url || "",
});

export const TOP_100: Spot[] = [
  ...destinations.map((d: any): Spot => ({ id: `destino:${d.slug}`, kind: "destino", slug: d.slug, ...pick(d), href: `/destino/${d.slug}`, favoriteType: "destino" })),
  ...beaches.map((b: any): Spot => ({ id: `playa:${b.slug}`, kind: "playa", slug: b.slug, ...pick(b), href: `/playa/${b.slug}`, favoriteType: "playa" })),
  ...mountains.slice(0, 18).map((m: any): Spot => ({ id: `montaña:${m.slug}`, kind: "montaña", slug: m.slug, ...pick(m), href: `/montana/${m.slug}`, favoriteType: "destino" })),
  ...rivers.slice(0, 30).map((r: any): Spot => ({ id: `río:${r.slug}`, kind: "río", slug: r.slug, ...pick(r), href: `/rio/${r.slug}`, favoriteType: "rio" })),
].slice(0, 100);

export const MILESTONES = [
  { at: 10, xp: 100, label: "Explorador" },
  { at: 25, xp: 250, label: "Trotamundos" },
  { at: 50, xp: 500, label: "Gran viajero" },
  { at: 100, xp: 1500, label: "Viajero legendario" },
];

const from = (t: string) => (supabase as any).from(t);

export interface SpotRow { id: string; user_id: string; spot_id: string; created_at: string }

export async function fetchSpots(table: "traveler_spots" | "traveler_wishlist", userId: string): Promise<SpotRow[]> {
  const { data, error } = await from(table).select("*").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function toggleSpot(table: "traveler_spots" | "traveler_wishlist", userId: string, spotId: string, on: boolean) {
  if (on) {
    const { error } = await from(table).insert({ id: `${table}-${userId}-${spotId}`, user_id: userId, spot_id: spotId, created_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await from(table).delete().eq("user_id", userId).eq("spot_id", spotId);
    if (error) throw new Error(error.message);
  }
}

export const useSpots = (table: "traveler_spots" | "traveler_wishlist", userId?: string) =>
  useQuery({ queryKey: ["viajero", table, userId], queryFn: () => fetchSpots(table, userId!), enabled: !!userId });
