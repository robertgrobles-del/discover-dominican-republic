/**
 * Historial local de fichas vistas, para volver rápido a ellas. Vive sólo en este navegador
 * (localStorage): no se envía al servidor ni contiene datos personales, sólo ruta y título.
 */
export interface RecentItem { path: string; title: string; viewedAt: number }

const KEY = "dr:recently-viewed";
const MAX_ITEMS = 12;
/** Fichas de detalle: una sección conocida seguida de un identificador. */
const DETAIL = /^\/(destino|playa|alojamiento|airbnb|restaurante|bar|experiencia|tour|evento|provincia|municipio|parque|parque-nacional|montana|rio|cueva|articulo|receta|spa|teatro|estadio|operador|marina|puerto|aeropuerto)\/[^/]+$/;

export const isDetailPath = (path: string): boolean => DETAIL.test(path);

export function listRecentlyViewed(): RecentItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is RecentItem => typeof item?.path === "string" && typeof item?.title === "string" && typeof item?.viewedAt === "number");
  } catch {
    return [];
  }
}

/** Registra la visita a una ficha; la más reciente va primero y no se repiten rutas. */
export function recordRecentlyViewed(path: string, title: string, now = Date.now()): void {
  if (!isDetailPath(path) || !title.trim()) return;
  const cleanTitle = title.split("|")[0]!.trim().slice(0, 120);
  const next = [{ path, title: cleanTitle, viewedAt: now }, ...listRecentlyViewed().filter((item) => item.path !== path)].slice(0, MAX_ITEMS);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* almacenamiento lleno o no disponible */ }
}

export function clearRecentlyViewed(): void {
  try { localStorage.removeItem(KEY); } catch { /* almacenamiento no disponible */ }
}
