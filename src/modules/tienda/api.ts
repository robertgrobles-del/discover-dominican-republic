// Datos de la Tienda oficial de Descubre RD (tablas store_products / store_orders del mock).
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: "poster" | "ropa" | "accesorios" | "hogar" | "bolsos";
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
  poster: "Pósters", ropa: "Ropa", accesorios: "Accesorios", hogar: "Hogar", bolsos: "Bolsos",
};
export const ORDER_STATUS_LABEL: Record<StoreOrder["status"], string> = {
  pending: "Pendiente", paid: "Pagado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado",
};

export const formatDop = (n: number) => `RD$ ${n.toLocaleString("es-DO", { maximumFractionDigits: 0 })}`;
export const dopToUsd = (n: number) => Math.round((n / DOP_PER_USD) * 100) / 100;

const from = (t: string) => (supabase as any).from(t);

export async function fetchProducts(): Promise<StoreProduct[]> {
  const { data, error } = await from("store_products").select("*");
  if (error) throw new Error(error.message);
  return ((data || []) as StoreProduct[]).filter((p) => p.active);
}

export async function fetchProduct(slug: string): Promise<StoreProduct | null> {
  const { data, error } = await from("store_products").select("*").eq("slug", slug);
  if (error) throw new Error(error.message);
  return (data || [])[0] || null;
}

export async function fetchOrders(): Promise<StoreOrder[]> {
  const { data, error } = await from("store_orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createOrder(o: Omit<StoreOrder, "id" | "created_at" | "status"> & { status?: StoreOrder["status"] }) {
  const id = `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await from("store_orders").insert({ ...o, id, status: o.status || "paid", created_at: new Date().toISOString() });
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

export const useProducts = () => useQuery({ queryKey: ["store", "products"], queryFn: fetchProducts });
export const useProduct = (slug?: string) => useQuery({ queryKey: ["store", "product", slug], queryFn: () => fetchProduct(slug!), enabled: !!slug });
export const useOrders = () => useQuery({ queryKey: ["store", "orders"], queryFn: fetchOrders });
