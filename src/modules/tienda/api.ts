// Datos de la Tienda oficial de Descubre RD (tablas store_products / store_orders del mock).
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryStaleTime } from "@/lib/queryPolicy";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { fetchApi } from "@/lib/fastifyClient";
import { getAffiliateRef } from "@/lib/affiliateRef";
import type { AdminStoreOrder } from "@/lib/adminStoreApi";

export interface BackendProductDto {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Nombre visible del tipo de producto. */
  category_name?: string;
  price: number;
  currency: string;
  price_usd: number;
  in_stock: boolean;
  low_stock: number | null;
  featured: boolean;
  emoji: string | null;
  tone: "sand" | "cream" | "sea" | "forest" | null;
  sizes: string[];
  colors: string[];
  tagline: string | null;
  description: string | null;
  includes: string[];
  images: string[];
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Nombre visible del tipo; lo envía el servidor. */
  categoryName?: string;
  price: number; // DOP
  currency: "DOP";
  price_usd?: number;
  in_stock: boolean;
  low_stock?: number | null;
  stock?: number;
  active: boolean;
  featured: boolean;
  emoji: string;
  tone: "sand" | "cream" | "sea" | "forest";
  sizes: string[];
  colors: string[];
  tagline: string;
  description: string;
  includes: string[];
  images?: string[];
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
  payment_method?: "card" | "transfer" | string;
  payment_status?: "unpaid" | "paid" | "refunded" | string;
  created_at: string;
}

export interface StoreQuote {
  lines: Array<{
    product_id: string;
    name: string;
    size?: string | null;
    color?: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  tax_included: number;
  total: number;
  total_usd: number;
  usd_rate: number;
  free_shipping_remaining: number;
  coupon?: { code: string; applied: boolean; reason?: string } | null;
  valid: boolean;
  issues: Array<{ code: string; product_id: string; name: string; available: number }>;
}

export const DOP_PER_USD = 59.8;
export const FREE_SHIPPING_FROM = 2500; // RD$
export const SHIPPING_FLAT = 250; // RD$
export const CATEGORY_LABEL: Record<string, string> = {
  poster: "Pósters", ropa: "Ropa", accesorios: "Accesorios", hogar: "Hogar", bolsos: "Bolsos", playa: "Playa & Aventura",
};

/** Nombre de un tipo de producto: el que envía el servidor; si no, el de la lista local o el propio identificador. */
export function categoryLabel(product: Pick<StoreProduct, "category" | "categoryName">): string {
  if (product.categoryName) return product.categoryName;
  if (CATEGORY_LABEL[product.category]) return CATEGORY_LABEL[product.category];
  const text = product.category.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Las fotos subidas al panel viven en la API; se sirven por su ruta para que carguen desde el mismo origen que el sitio. */
const sameOriginMedia = (url: string) => { const at = url.indexOf("/api/v1/media/files/"); return at >= 0 ? url.slice(at) : url; };
export const ORDER_STATUS_LABEL: Record<StoreOrder["status"], string> = {
  pending: "Pendiente", paid: "Pagado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado",
};

/** Pesos dominicanos; los centavos solo se muestran cuando el monto los tiene. */
export const formatDop = (n: number) => `RD$ ${n.toLocaleString("es-DO", Number.isInteger(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const dopToUsd = (n: number) => Math.round((n / DOP_PER_USD) * 100) / 100;

export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  "poster": "/tienda/poster-rayable.jpg",
  "ropa": "/tienda/camiseta-rd.jpg",
  "gorra": "/tienda/gorra-palma.jpg",
  "bolsos": "/tienda/bolso-canvas.jpg",
  "accesorios": "/tienda/pulseras-larimar.jpg",
  "hogar": "/tienda/mug-tropical.jpg",
};

export function resolveProductImage(p: { imageUrl?: string; slug?: string; category?: string }): string {
  if (p.imageUrl) return p.imageUrl;
  if (p.slug && p.slug.includes("gorra")) return DEFAULT_PRODUCT_IMAGES["gorra"];
  if (p.slug && p.slug.includes("poster")) return DEFAULT_PRODUCT_IMAGES["poster"];
  if (p.slug && p.slug.includes("bolso") || p.category === "bolsos") return DEFAULT_PRODUCT_IMAGES["bolsos"];
  if (p.category && DEFAULT_PRODUCT_IMAGES[p.category]) return DEFAULT_PRODUCT_IMAGES[p.category];
  return DEFAULT_PRODUCT_IMAGES["poster"];
}

export function mapBackendProduct(p: BackendProductDto): StoreProduct {
  const images = Array.isArray(p.images) ? p.images.map(sameOriginMedia) : [];
  const primaryImage = images[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    categoryName: p.category_name,
    price: p.price ?? 0,
    currency: "DOP",
    price_usd: p.price_usd,
    in_stock: !!p.in_stock,
    low_stock: p.low_stock,
    active: true,
    featured: !!p.featured,
    emoji: p.emoji || "🛍️",
    tone: p.tone || "sea",
    sizes: p.sizes || [],
    colors: p.colors || [],
    tagline: p.tagline || "",
    description: p.description || "",
    includes: p.includes || [],
    images,
    imageUrl: primaryImage || resolveProductImage(p),
    created_at: new Date().toISOString(),
  };
}

const from = (t: string) => supabase.from(t);

export async function fetchProducts(): Promise<StoreProduct[]> {
  if (HAS_BACKEND_SESSION) {
    const all: BackendProductDto[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await fetchApi<{ data: BackendProductDto[]; meta?: { total_pages?: number } }>(`/store/products?per_page=100&page=${page}`);
      all.push(...(res.data || []));
      if (page >= (res.meta?.total_pages ?? 1)) break;
    }
    return all.map(mapBackendProduct);
  }
  const { data, error } = await from("store_products").select("*");
  if (error) throw new Error(error.message);
  return (((data || []) as (StoreProduct & { stock?: number })[]).filter((p) => p.active)).map((p) => ({
    ...p,
    in_stock: p.in_stock ?? (p.stock !== undefined ? p.stock > 0 : true),
    imageUrl: p.imageUrl || resolveProductImage(p),
  }));
}

export async function fetchProduct(slug: string): Promise<StoreProduct | null> {
  if (HAS_BACKEND_SESSION) {
    const res = await fetchApi<{ data: BackendProductDto }>(`/store/products/${slug}`);
    if (!res.data) return null;
    return mapBackendProduct(res.data);
  }
  const { data, error } = await from("store_products").select("*").eq("slug", slug);
  if (error) throw new Error(error.message);
  const prod = (data || [])[0] as (StoreProduct & { stock?: number }) | undefined;
  if (!prod) return null;
  return {
    ...prod,
    in_stock: prod.in_stock ?? (prod.stock !== undefined ? prod.stock > 0 : true),
    imageUrl: prod.imageUrl || resolveProductImage(prod),
  };
}

export async function fetchOrders(): Promise<StoreOrder[]> {
  if (HAS_BACKEND_SESSION) {
    const res = await fetchApi<{ data: StoreOrder[] }>("/me/orders");
    return res.data || [];
  }
  const { data, error } = await from("store_orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchQuote(couponCode?: string): Promise<StoreQuote> {
  const res = await fetchApi<{ data: StoreQuote }>("/checkout/quote", {
    method: "POST",
    body: JSON.stringify(couponCode ? { coupon_code: couponCode } : {}),
  });
  return res.data;
}

/** Cómo pagar un pedido por depósito o transferencia, tal como lo devuelve el servidor. */
export interface BankAccount { id: string; bank_name: string; account_type: string; account_number: string; holder_name: string; holder_document: string | null; currency: string; notes: string | null }
export interface TransferPayment { accounts: BankAccount[]; instructions: string | null; reference: string; amount: number; currency: string; expires_at: string | null }

/** Cuentas activas donde se puede depositar el pago de un pedido. Sin ninguna, la transferencia no está disponible. */
export async function fetchBankAccounts(): Promise<BankAccount[]> {
  return (await fetchApi<{ data: BankAccount[] }>("/store/bank-accounts")).data;
}

/**
 * Crea el pedido desde el carrito del servidor para pagarlo por depósito o transferencia: no hay cobro en línea,
 * el stock queda reservado y un administrador confirma el pago. El total lo calcula el servidor.
 */
export async function createTransferOrder(input: { name: string; email: string; phone: string; address: string; city: string }): Promise<{ id: string; transfer: TransferPayment | null }> {
  const res = await fetchApi<{ data: { order: { id: string; transfer: TransferPayment | null } } }>("/orders", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      contact: { name: input.name, email: input.email, phone: input.phone },
      shipping: { address: input.address, city: input.city },
      payment_method: "transfer",
      ref_code: getAffiliateRef(),
    }),
  });
  return { id: res.data.order.id, transfer: res.data.order.transfer };
}

export async function createOrder(o: Omit<StoreOrder, "id" | "created_at" | "status"> & { status?: StoreOrder["status"] }) {
  if (HAS_BACKEND_SESSION) {
    const res = await createTransferOrder({
      name: o.customer_name,
      email: o.customer_email,
      phone: o.phone,
      address: o.address,
      city: o.city,
    });
    return res.id;
  }

  // Fallback en memoria / modo demo si no hay sesión backend
  const id = `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await from("store_orders").insert({ ...o, id, status: o.status || "pending", created_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  // descuenta stock local
  for (const it of o.items) {
    const base = it.product_id.split(":")[0];
    const { data } = await from("store_products").select("*").eq("id", base);
    const p = (data || [])[0];
    if (p) await from("store_products").update({ stock: Math.max(0, (p.stock ?? 0) - it.qty) }).eq("id", base);
  }
  return id;
}

export async function updateProduct(id: string, patch: Partial<StoreProduct>) {
  if (HAS_BACKEND_SESSION) {
    const res = await fetchApi<{ data: StoreProduct }>(`/admin/store/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return res.data;
  }
  const { error } = await from("store_products").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export const useProducts = () => useQuery({ queryKey: queryKeys.store.products, queryFn: fetchProducts, staleTime: queryStaleTime.catalog });
export const useProduct = (slug?: string) => useQuery({ queryKey: queryKeys.store.product(slug), queryFn: () => fetchProduct(slug!), enabled: !!slug, staleTime: queryStaleTime.catalog });
export const useOrders = () => useQuery({ queryKey: queryKeys.store.orders, queryFn: fetchOrders, staleTime: queryStaleTime.orders });

export async function adminFetchOrders(status?: string): Promise<StoreOrder[]> {
  if (HAS_BACKEND_SESSION) {
    const q = status ? `?status=${status}` : "";
    const res = await fetchApi<{ data: AdminStoreOrder[] }>(`/admin/store/orders${q}`);
    // La API no expone el usuario del pedido; los productos retirados llegan con `product_id` nulo.
    return res.data.map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      phone: o.phone ?? undefined,
      address: o.address,
      city: o.city,
      items: o.items.map((it) => ({ product_id: it.product_id ?? "", name: it.name, qty: it.quantity, unit_price: it.unit_price })),
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      status: o.status as StoreOrder["status"],
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      created_at: o.created_at,
    }));
  }
  const { data, error } = await from("store_orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminConfirmTransfer(orderId: string, reference: string, amount?: number) {
  if (HAS_BACKEND_SESSION) {
    const res = await fetchApi<{ data: AdminStoreOrder }>(`/admin/store/orders/${orderId}/confirm-transfer`, {
      method: "POST",
      body: JSON.stringify({ reference, amount }),
    });
    return res.data;
  }
  const { error } = await from("store_orders").update({ status: "paid" }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function adminUpdateOrderStatus(
  id: string,
  status: StoreOrder["status"] | "processing" | "refunded" | "return_requested",
  opts?: { courier_name?: string; tracking_number?: string; reason?: string }
) {
  if (HAS_BACKEND_SESSION) {
    const res = await fetchApi<{ data: AdminStoreOrder }>(`/admin/store/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, ...opts }),
    });
    return res.data;
  }
  const { error } = await from("store_orders").update({ status: status as StoreOrder["status"] }).eq("id", id);
  if (error) throw new Error(error.message);
}

export const useAdminOrders = (status?: string) =>
  useQuery({
    queryKey: [...queryKeys.store.orders, "admin", status || "all"],
    queryFn: () => adminFetchOrders(status),
    staleTime: queryStaleTime.orders,
  });
