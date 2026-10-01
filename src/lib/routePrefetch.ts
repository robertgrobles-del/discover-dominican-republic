/**
 * Precarga del código de las páginas principales cuando la persona muestra intención de ir a ellas
 * (pasa el cursor, enfoca con teclado o toca el enlace). Los `import()` usan la misma ruta que los `lazy()`
 * de `App.tsx`, así que Vite reutiliza el mismo fragmento: no se descarga nada dos veces.
 */
const ROUTES: Record<string, () => Promise<unknown>> = {
  "/destinos": () => import("@/pages/Destinos"),
  "/playas": () => import("@/pages/Playas"),
  "/restaurantes": () => import("@/pages/Restaurantes"),
  "/eventos": () => import("@/pages/Eventos"),
  "/experiencias": () => import("@/pages/Experiencias"),
  "/ofertas": () => import("@/pages/Ofertas"),
  "/provincias": () => import("@/pages/Provincias"),
  "/cultura": () => import("@/pages/Cultura"),
  "/herramientas": () => import("@/pages/Herramientas"),
  "/galeria": () => import("@/pages/Galeria"),
  "/blog": () => import("@/pages/Blog"),
  "/tienda": () => import("@/modules/tienda/pages/TiendaHome"),
};

const requested = new Set<string>();

/** Con ahorro de datos o conexión lenta no se adelanta ninguna descarga. */
function shouldSkip(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
}

export function prefetchRoute(pathname: string): boolean {
  const load = ROUTES[pathname];
  if (!load || requested.has(pathname) || shouldSkip()) return false;
  requested.add(pathname);
  void load().catch(() => { requested.delete(pathname); });
  return true;
}

function onIntent(event: Event): void {
  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!anchor || anchor.target === "_blank" || anchor.origin !== window.location.origin) return;
  prefetchRoute(anchor.pathname.replace(/\/+$/, "") || "/");
}

/** Un solo juego de escuchas delegadas para todo el documento; devuelve la función que las retira. */
export function installRoutePrefetch(target: Document = document): () => void {
  const events = ["mouseover", "focusin", "touchstart"] as const;
  for (const name of events) target.addEventListener(name, onIntent, { passive: true });
  return () => { for (const name of events) target.removeEventListener(name, onIntent); };
}
