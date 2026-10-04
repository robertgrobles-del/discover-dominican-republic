import { isAnalyticsAllowed } from "@/lib/privacy-consent";

/**
 * Píxeles de publicidad (Meta y TikTok) para campañas de retargeting.
 *
 * - Sólo existen si el build trae `VITE_META_PIXEL_ID` o `VITE_TIKTOK_PIXEL_ID`; `main.tsx` ni siquiera
 *   descarga este módulo sin ellos, y `scripts/postbuild.mjs` sólo abre la política de seguridad de contenido
 *   a sus dominios en ese caso.
 * - No se carga ningún script de terceros hasta que la persona acepta la analítica, y una señal de privacidad
 *   del navegador (GPC, Do Not Track) lo impide aunque haya aceptado. Si retira el consentimiento, se revoca.
 * - No reciben datos personales: escuchan los eventos de la analítica propia (`dr:analytics-event`), que ya
 *   salen sin páginas privadas ni campos sensibles, y de ellos sólo pasan el tipo de contenido, la categoría
 *   y, en una compra, el importe y la moneda.
 */

export const ANALYTICS_EVENT = "dr:analytics-event";
export interface AnalyticsEventDetail { type: string; props: Record<string, unknown> }

type Queue = ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...args: unknown[]) => void; loaded?: boolean; version?: string; push?: unknown };
interface TikTokQueue extends Array<unknown> { load?: (id: string) => void; page?: () => void; track?: (event: string, params?: object) => void; grantConsent?: () => void; revokeConsent?: () => void; _i?: Record<string, unknown[]>; methods?: string[] }
declare global { interface Window { fbq?: Queue; _fbq?: Queue; ttq?: TikTokQueue; TiktokAnalyticsObject?: string } }

export interface PixelIds { meta?: string; tiktok?: string }
/** Identificadores válidos: sólo dígitos (Meta) o letras y dígitos (TikTok). Otra cosa se descarta. */
export function readPixelIds(env: { VITE_META_PIXEL_ID?: string; VITE_TIKTOK_PIXEL_ID?: string }): PixelIds {
  const meta = env.VITE_META_PIXEL_ID?.trim(), tiktok = env.VITE_TIKTOK_PIXEL_ID?.trim();
  return { meta: meta && /^\d{5,20}$/.test(meta) ? meta : undefined, tiktok: tiktok && /^[A-Z0-9]{10,40}$/i.test(tiktok) ? tiktok : undefined };
}

export interface PixelEvent { meta: string; tiktok: string; params: Record<string, string | number> }

/** Evento estándar de cada plataforma para un evento de la analítica propia, o `null` si no interesa. */
export function toPixelEvent({ type, props }: AnalyticsEventDetail): PixelEvent | null {
  const text = (key: string) => (typeof props[key] === "string" ? (props[key] as string).slice(0, 60) : undefined);
  const value = typeof props.value === "number" && props.value > 0 ? props.value : typeof props.amount === "number" && props.amount > 0 ? props.amount : undefined;
  const params: Record<string, string | number> = {};
  const contentType = text("entity_type") ?? text("content_type");
  const category = text("category");
  if (contentType) params.content_type = contentType;
  if (category) params.content_category = category;
  const withValue = () => { if (value !== undefined) { params.value = value; params.currency = /^[A-Z]{3}$/.test(text("currency") ?? "") ? text("currency")! : "DOP"; } };
  switch (type) {
    case "page_view": return { meta: "PageView", tiktok: "Pageview", params: {} };
    case "search": return { meta: "Search", tiktok: "Search", params };
    case "favorite": return { meta: "AddToWishlist", tiktok: "AddToWishlist", params };
    case "add_to_cart": withValue(); return { meta: "AddToCart", tiktok: "AddToCart", params };
    case "booking_start": case "checkout_start": withValue(); return { meta: "InitiateCheckout", tiktok: "InitiateCheckout", params };
    case "signup": return { meta: "CompleteRegistration", tiktok: "CompleteRegistration", params };
    case "free_ticket_registered": return { meta: "Lead", tiktok: "SubmitForm", params };
    case "booking_complete": case "purchase":
      withValue();
      // Sin importe no es una compra medible: se cuenta como contacto conseguido.
      return value !== undefined ? { meta: "Purchase", tiktok: "CompletePayment", params } : { meta: "Lead", tiktok: "SubmitForm", params };
    case "outbound_link": return props.channel === "whatsapp" ? { meta: "Contact", tiktok: "Contact", params } : null;
    default: return null;
  }
}

function loadScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function loadMeta(id: string): void {
  if (window.fbq) return;
  const fbq: Queue = (...args: unknown[]) => { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue!.push(args); };
  fbq.queue = []; fbq.loaded = true; fbq.version = "2.0"; fbq.push = fbq;
  window.fbq = fbq; window._fbq = fbq;
  loadScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("consent", "grant");
  fbq("init", id);
}

function loadTikTok(id: string): void {
  if (window.ttq) return;
  const ttq: TikTokQueue = [];
  window.TiktokAnalyticsObject = "ttq";
  window.ttq = ttq;
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  for (const method of ttq.methods) (ttq as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => { ttq.push([method, ...args]); };
  ttq._i = { [id]: [] };
  loadScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`);
  ttq.grantConsent?.();
}

let started = false;
let active = false;
let lastPageView: { path: string; at: number } | null = null;

function send(event: PixelEvent, ids: PixelIds): void {
  if (event.meta === "PageView") {
    // La vista que se envía al aceptar y la que emite la aplicación para la misma página son una sola.
    const path = window.location.pathname, at = Date.now();
    if (lastPageView && lastPageView.path === path && at - lastPageView.at < 3000) return;
    lastPageView = { path, at };
  }
  if (ids.meta && window.fbq) window.fbq("track", event.meta, event.params);
  if (ids.tiktok && window.ttq) { if (event.tiktok === "Pageview") window.ttq.page?.(); else window.ttq.track?.(event.tiktok, event.params); }
}

/** Carga o detiene los píxeles según el consentimiento vigente. */
function sync(ids: PixelIds): void {
  const allowed = isAnalyticsAllowed();
  if (allowed && !active) {
    if (ids.meta) { if (window.fbq) window.fbq("consent", "grant"); else loadMeta(ids.meta); }
    if (ids.tiktok) { if (window.ttq) window.ttq.grantConsent?.(); else loadTikTok(ids.tiktok); }
    active = true;
    send({ meta: "PageView", tiktok: "Pageview", params: {} }, ids); // la vista en la que se aceptó
  } else if (!allowed && active) {
    window.fbq?.("consent", "revoke");
    window.ttq?.revokeConsent?.();
    active = false;
  }
}

/**
 * Activa los píxeles configurados. Sin identificadores válidos no hace nada. Devuelve cuáles quedaron
 * configurados (no necesariamente cargados: eso depende del consentimiento).
 */
export function initMarketingPixels(env: { VITE_META_PIXEL_ID?: string; VITE_TIKTOK_PIXEL_ID?: string } = import.meta.env): PixelIds {
  const ids = readPixelIds(env);
  if (started || typeof window === "undefined" || (!ids.meta && !ids.tiktok)) return ids;
  started = true;
  window.addEventListener("dr:privacy-consent-change", () => sync(ids));
  window.addEventListener(ANALYTICS_EVENT, (e) => {
    if (!active || !isAnalyticsAllowed()) return;
    const event = toPixelEvent((e as CustomEvent<AnalyticsEventDetail>).detail);
    if (event) send(event, ids);
  });
  sync(ids);
  return ids;
}

/** Sólo para pruebas: olvida el estado del módulo. */
export function resetMarketingPixels(): void {
  started = false;
  active = false;
  lastPageView = null;
}
