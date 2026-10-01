// Datos de la Tienda oficial de Descubre RD (tablas store_products / store_orders del mock).
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryStaleTime } from "@/lib/queryPolicy";

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: "poster" | "ropa" | "accesorios" | "hogar" | "bolsos" | "playa";
  price: number; // DOP
  currency: "DOP";
  stock: number;
  active: boolean;
  featured: boolean;
  emoji: string;
  tone: "sand" | "cream" | "sea" | "forest";
  sizes: string[];
  colors: string[];
  tagline: string;
  description: string;
  includes: string[];
  imageUrl?: string;
  created_at: string;
}

export interface StoreOrderItem { product_id: string; name: string; qty: number; unit_price: number }
export interface StoreOrder {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  phone?: string;
  address: string;
  city: string;
  items: StoreOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export const DOP_PER_USD = 59.8;
export const FREE_SHIPPING_FROM = 2500; // RD$
export const SHIPPING_FLAT = 250; // RD$
export const CATEGORY_LABEL: Record<StoreProduct["category"], string> = {
  poster: "Pósters", ropa: "Ropa", accesorios: "Accesorios", hogar: "Hogar", bolsos: "Bolsos", playa: "Playa & Aventura",
};
export const ORDER_STATUS_LABEL: Record<StoreOrder["status"], string> = {
  pending: "Pendiente", paid: "Pagado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado",
};

export const formatDop = (n: number) => `RD$ ${n.toLocaleString("es-DO", { maximumFractionDigits: 0 })}`;
export const dopToUsd = (n: number) => Math.round((n / DOP_PER_USD) * 100) / 100;

export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  "poster": "/tienda/poster-rayable.jpg",
  "ropa": "/tienda/camiseta-rd.jpg",
  "gorra": "/tienda/gorra-palma.jpg",
  "bolsos": "/tienda/bolso-canvas.jpg",
  "accesorios": "/tienda/pulseras-larimar.jpg",
  "hogar": "/tienda/mug-tropical.jpg",
};

export function resolveProductImage(p: Partial<StoreProduct>): string {
  if (p.imageUrl) return p.imageUrl;
  if (p.slug && p.slug.includes("gorra")) return DEFAULT_PRODUCT_IMAGES["gorra"];
  if (p.slug && p.slug.includes("poster")) return DEFAULT_PRODUCT_IMAGES["poster"];
  if (p.slug && p.slug.includes("bolso") || p.category === "bolsos") return DEFAULT_PRODUCT_IMAGES["bolsos"];
  if (p.category && DEFAULT_PRODUCT_IMAGES[p.category]) return DEFAULT_PRODUCT_IMAGES[p.category];
  return DEFAULT_PRODUCT_IMAGES["poster"];
}

const from = (t: string) => supabase.from(t);

export async function fetchProducts(): Promise<StoreProduct[]> {
  const { data, error } = await from("store_products").select("*");
  if (error) throw new Error(error.message);
  return (((data || []) as StoreProduct[]).filter((p) => p.active)).map((p) => ({
    ...p,
    imageUrl: p.imageUrl || resolveProductImage(p),
  }));
}

export async function fetchProduct(slug: string): Promise<StoreProduct | null> {
  const { data, error } = await from("store_products").select("*").eq("slug", slug);
  if (error) throw new Error(error.message);
  const prod = (data || [])[0];
  if (!prod) return null;
  return {
    ...prod,
    imageUrl: prod.imageUrl || resolveProductImage(prod),
  };
}

export async function fetchOrders(): Promise<StoreOrder[]> {
  const { data, error } = await from("store_orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createOrder(o: Omit<StoreOrder, "id" | "created_at" | "status"> & { status?: StoreOrder["status"] }) {
  const id = `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await from("store_orders").insert({ ...o, id, status: o.status || "pending", created_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  // descuenta stock
  for (const it of o.items) {
    const base = it.product_id.split(":")[0];
    const { data } = await from("store_products").select("*").eq("id", base);
    const p = (data || [])[0];
    if (p) await from("store_products").update({ stock: Math.max(0, (p.stock ?? 0) - it.qty) }).eq("id", base);
  }
  return id;
}

export async function updateOrderStatus(id: string, status: StoreOrder["status"]) {
  const { error } = await from("store_orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateProduct(id: string, patch: Partial<StoreProduct>) {
  const { error } = await from("store_products").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export const useProducts = () => useQuery({ queryKey: queryKeys.store.products, queryFn: fetchProducts, staleTime: queryStaleTime.catalog });
export const useProduct = (slug?: string) => useQuery({ queryKey: queryKeys.store.product(slug), queryFn: () => fetchProduct(slug!), enabled: !!slug, staleTime: queryStaleTime.catalog });
export const useOrders = () => useQuery({ queryKey: queryKeys.store.orders, queryFn: fetchOrders, staleTime: queryStaleTime.orders });
