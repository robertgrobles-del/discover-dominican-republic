import { API_BASE_URL } from "@/lib/apiBase";
import { isAnalyticsAllowed } from "@/lib/privacy-consent";

export type AnalyticsEventType =
  | "page_view"
  | "click"
  | "search"
  | "favorite"
  | "share"
  | "booking_start"
  | "booking_complete"
  | "signup"
  | "login"
  | "add_to_cart"
  | "checkout_start"
  | "purchase"
  | "ad_click"
  | "outbound_link"
  | "error"
  | "free_ticket_registered";

/** Réplica exacta del filtro del servidor: aquí descarta antes de viajar; allá vuelve a limpiar. */
const SENSITIVE_KEY = /(mail|phone|tel|pass|token|secret|card|dni|cedula|passport|address|direccion|name|nombre|ticket.?id|user.?id|uuid|(^|[_-])id($|[_-]))/i;
let sessionId: string | null = null;

/** Defense in depth for components that call this before the backend cleans the event again. */
export function cleanAnalyticsMetadata(metadata: Record<string, unknown> = {}): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata).slice(0, 20)) {
    if (SENSITIVE_KEY.test(key) || key.length > 40) continue;
    if (typeof value === "string" && value.length <= 100 && !["@", ":", "/", "?", "\\"].some((char) => value.includes(char))) clean[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "boolean" || value === null) clean[key] = value;
  }
  try { return JSON.stringify(clean).length <= 2000 ? clean : {}; } catch { return {}; }
}

export function cleanAnalyticsPage(page: string): string | null {
  const path = page.split(/[?#]/, 1)[0].slice(0, 200);
  return /^\/(admin|login|registro|reset-password|perfil|reservas|checkout|panel|partner)(\/|$)/i.test(path) ? null : path;
}

export function getAnalyticsSessionId(): string | null {
  if (!isAnalyticsAllowed()) return null;
  return sessionId ??= crypto.randomUUID();
}

export function clearAnalyticsSessionId(): void {
  sessionId = null;
}

/**
 * Envía un evento anónimo y se olvida. Usa `fetch` directo (no el transporte de la app)
 * para que un fallo de analítica jamás se reporte a sí mismo en bucle.
 *
 * `opts.internalPanel` mide adopción de un panel interno (punto 67 del plan de accesos): esas rutas se
 * excluyen de la analítica de navegación pública, así que se envían con una página sintética
 * `panel/<tipo>` y sin ningún dato de la persona (el filtro de `props` sigue aplicándose). Sin este
 * parámetro nada cambia: las páginas privadas siguen fuera del `page_view`.
 */
export function sendAnalyticsEvent(
  type: AnalyticsEventType,
  page: string,
  props: Record<string, unknown> = {},
  opts: { internalPanel?: string } = {},
): void {
  if (!isAnalyticsAllowed() || typeof window === "undefined") return;
  const safePage = opts.internalPanel ? `panel/${opts.internalPanel.slice(0, 40)}` : cleanAnalyticsPage(page);
  if (!safePage) return;
  void fetch(`${API_BASE_URL}/analytics/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consent: true,
      events: [{
        type,
        page: safePage,
        session_id: getAnalyticsSessionId()!,
        props: cleanAnalyticsMetadata(props),
      }],
    }),
  }).catch(() => undefined);
}
