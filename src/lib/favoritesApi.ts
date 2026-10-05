import { fetchApi } from "@/lib/fastifyClient";

/**
 * Favoritos de la cuenta en el backend (`/me/favorites`). El sitio distingue más clases de ficha que tipos
 * tiene el backend (una clínica o una cueva se guardan como "experience"), así que junto al favorito viaja lo
 * que hace falta para volver a pintarlo: la clase original, el nombre, la imagen y el lugar.
 */

export interface FavoriteRecord { id: string; type: string; name: string; image: string; location?: string; addedAt: number }

/** Clase de ficha del sitio → tipo del backend. */
const BACKEND_TYPE: Record<string, string> = {
  destino: "destination", hotel: "hotel", experiencia: "experience", restaurante: "restaurant", playa: "beach", bar: "bar",
  rio: "river", montana: "mountain", evento: "event", airbnb: "airbnb", tour: "tour", parque: "park", "parque-nacional": "park",
  "reserva-natural": "park", articulo: "article", agencia: "tour", guia: "tour", clinica: "experience", puerto: "destination",
  estadio: "experience", cueva: "experience", "destino-religioso": "destination", provincia: "destination", spa: "experience",
};
/** Tipo del backend → clase del sitio, para favoritos guardados sin su clase original. */
const SITE_TYPE: Record<string, string> = {
  destination: "destino", hotel: "hotel", experience: "experiencia", restaurant: "restaurante", beach: "playa", bar: "bar",
  river: "rio", event: "evento", airbnb: "airbnb", tour: "tour", park: "parque",
};

export const backendTypeOf = (siteType: string) => BACKEND_TYPE[siteType] ?? "destination";

/** Imagen que el backend acepta: una ruta del propio sitio o una dirección https. Otra cosa no se envía. */
const safeImage = (image: string | undefined) => (image && (image.startsWith("/") || image.startsWith("https://")) && image.length <= 500 ? image : undefined);

interface ApiFavorite { entity_type: string; entity_id: string; created_at: string; meta?: { name?: string; image?: string; location?: string; kind?: string } | null }

const path = (item: { id: string; type: string }) => `/me/favorites/${backendTypeOf(item.type)}/${encodeURIComponent(item.id)}`;

export const favoritesApi = {
  /** Todos los favoritos de la cuenta, del más reciente al más antiguo. */
  async list(): Promise<FavoriteRecord[]> {
    const out: FavoriteRecord[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await fetchApi<{ data: ApiFavorite[]; meta: { total_pages: number } }>(`/me/favorites?per_page=100&page=${page}`);
      for (const f of res.data) {
        const kind = f.meta?.kind && f.meta.kind in BACKEND_TYPE ? f.meta.kind : SITE_TYPE[f.entity_type] ?? "destino";
        out.push({ id: f.entity_id, type: kind, name: f.meta?.name || f.entity_id, image: f.meta?.image || "", location: f.meta?.location || undefined, addedAt: new Date(f.created_at).getTime() });
      }
      if (page >= (res.meta?.total_pages ?? 1)) break;
    }
    return out;
  },
  add(item: Omit<FavoriteRecord, "addedAt">): Promise<unknown> {
    const meta = { name: item.name.slice(0, 160) || undefined, image: safeImage(item.image), location: item.location?.slice(0, 160) || undefined, kind: /^[a-z][a-z-]{1,30}$/.test(item.type) ? item.type : undefined };
    return fetchApi(path(item), { method: "PUT", body: JSON.stringify(meta) });
  },
  remove(item: { id: string; type: string }): Promise<unknown> {
    return fetchApi(path(item), { method: "DELETE" });
  },
  /**
   * Sube a la cuenta los favoritos guardados en este navegador antes de iniciar sesión, sin duplicar los que ya
   * tiene. Devuelve la lista completa resultante.
   */
  async mergeLocal(local: FavoriteRecord[]): Promise<FavoriteRecord[]> {
    const remote = await this.list();
    const known = new Set(remote.map((f) => `${backendTypeOf(f.type)}:${f.id}`));
    const pending = local.filter((f) => !known.has(`${backendTypeOf(f.type)}:${f.id}`)).slice(0, 100);
    if (pending.length === 0) return remote;
    await Promise.all(pending.map((f) => this.add(f).catch(() => undefined)));
    return this.list();
  },
};
