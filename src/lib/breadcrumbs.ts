/**
 * Fase 10.19: migas de pan (Schema.org `BreadcrumbList`) generadas automáticamente por ruta, en vez de escribirlas
 * a mano en cada una de las ~216 páginas. Una página puede:
 *  - no aparecer en `HIDDEN_PREFIXES` → se le generan solas a partir de la URL.
 *  - aparecer en `HIDDEN_PREFIXES` → nunca se generan (portada, login, checkout, paneles internos, 404, etc.:
 *    no tiene sentido una jerarquía de navegación ahí, o cambia demasiado rápido para mantenerla a mano).
 *  - pasar su propio `breadcrumbs` a `<SEOHead>` cuando la ruta lo amerita (p. ej. quiere mostrar la provincia
 *    real del destino en vez del slug de la URL) — esa prop explícita siempre gana sobre lo automático.
 */

const SITE_URL = "https://descubrerd.com";

/** Prefijos de ruta donde NO se muestran migas de pan (ver razones arriba). */
const HIDDEN_PREFIXES = [
  "/", // portada: es la raíz, no tiene "padre" que mostrar
  "/login", "/registro", "/reset-password", "/verificar-email",
  "/checkout", "/carrito", "/pago",
  "/perfil", "/mi-viaje", "/reservas", "/pasaporte-digital",
  "/panel-empresa", "/admin", "/panel",
  "/404", "/not-found",
];

/** "punta-cana" -> "Punta Cana"; deja intactos los segmentos que parecen IDs (uuid, numéricos). */
function humanizeSegment(segment: string): string {
  const decoded = decodeURIComponent(segment);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded) || /^\d+$/.test(decoded)) return decoded;
  return decoded.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isBreadcrumbHidden(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)));
}

/**
 * Genera la miga de pan a partir de los segmentos de la URL. El último segmento usa `currentTitle` (el `title` que
 * la página ya le pasa a `<SEOHead>`, normalmente más legible que el slug) en vez de humanizar la URL.
 */
export function autoBreadcrumbs(pathname: string, currentTitle?: string): { name: string; url: string }[] | null {
  if (isBreadcrumbHidden(pathname)) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const items: { name: string; url: string }[] = [{ name: "Inicio", url: `${SITE_URL}/` }];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    items.push({ name: isLast && currentTitle ? currentTitle.split(" - ")[0]!.split(" | ")[0]! : humanizeSegment(seg), url: `${SITE_URL}${acc}` });
  });
  return items;
}
