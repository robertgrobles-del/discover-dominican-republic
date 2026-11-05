import { fetchApi } from "@/lib/fastifyClient";
import { uploadMedia } from "@/lib/mediaApi";
import { HttpError } from "@/lib/httpClient";
import type { PageMeta } from "@/lib/adminStoreApi";

/**
 * Productos de la tienda, sus tipos y la subida de fotos, contra el backend (`/admin/store/products…`,
 * `/admin/store_product_categories…`, `/media/…`). Los tipos copian la respuesta real de cada ruta.
 */

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  /** Slug del tipo de producto. */
  category: string;
  price: number;
  currency: string;
  stock: number;
  active: boolean;
  featured: boolean;
  sizes: string[];
  colors: string[];
  tagline: string | null;
  description: string | null;
  includes: string[];
  images: string[];
  sort_order: number;
  created_at: string;
}

export type AdminProductInput = Pick<AdminProduct, "slug" | "name" | "category" | "price" | "stock" | "active" | "featured" | "sizes" | "colors" | "tagline" | "description" | "images">;

export const MAX_PRODUCT_IMAGES = 30;

export async function listProducts(params: { q?: string; page?: number }): Promise<{ data: AdminProduct[]; meta: PageMeta }> {
  const query = new URLSearchParams({ per_page: "100", page: String(params.page ?? 1) });
  if (params.q) query.set("q", params.q);
  return fetchApi<{ data: AdminProduct[]; meta: PageMeta }>(`/admin/store/products?${query}`);
}

export async function saveProduct(id: string | null, input: Partial<AdminProductInput>): Promise<AdminProduct> {
  const res = await fetchApi<{ data: AdminProduct }>(id ? `/admin/store/products/${id}` : "/admin/store/products", { method: id ? "PATCH" : "POST", body: JSON.stringify(input) });
  return res.data;
}

/** Retira el producto del catálogo. Los pedidos ya hechos conservan su copia. */
export async function deleteProduct(id: string): Promise<void> {
  await fetchApi(`/admin/store/products/${id}`, { method: "DELETE" });
}

// ---------- Tipos de producto ----------

export interface ProductType { id: string; slug: string; name: string; sort_order: number; is_active: boolean }

export async function listProductTypes(): Promise<ProductType[]> {
  return (await fetchApi<{ data: ProductType[] }>("/admin/store_product_categories?per_page=200")).data;
}

export async function saveProductType(id: string | null, input: Partial<Omit<ProductType, "id">>): Promise<ProductType> {
  const res = await fetchApi<{ data: ProductType }>(id ? `/admin/store_product_categories/${id}` : "/admin/store_product_categories", { method: id ? "PATCH" : "POST", body: JSON.stringify(input) });
  return res.data;
}

export async function deleteProductType(id: string): Promise<void> {
  await fetchApi(`/admin/store_product_categories/${id}`, { method: "DELETE" });
}

/** `true` cuando el servidor rechaza un borrado porque el registro todavía se usa. */
export const isInUseError = (error: unknown): boolean => error instanceof HttpError && error.status === 409;

// ---------- Fotos ----------

export { ACCEPTED_IMAGE_TYPES } from "@/lib/mediaApi";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Sube una foto del catálogo y devuelve su dirección pública. */
export async function uploadProductImage(file: File): Promise<string> {
  const done = await uploadMedia(file, "cms");
  if (!done.url) throw new Error(`«${file.name}» quedó en estado «${done.status}» y no se puede usar todavía.`);
  return done.url;
}

/**
 * Las fotos subidas viven en la API. Cuando esa dirección apunta a otro origen que el del sitio (desarrollo:
 * puerto 3000 frente a 8080), se usa su ruta, que el sitio reenvía a la API y que la política de seguridad permite.
 */
export function displayImageUrl(url: string): string {
  const at = url.indexOf("/api/v1/media/files/");
  return at >= 0 ? url.slice(at) : url;
}

/** Slug a partir de un nombre: minúsculas, sin acentos y con guiones. */
export function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
