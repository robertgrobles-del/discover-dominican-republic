import { CATALOG_SOURCE } from "@/lib/catalogSource";
import { fetchApi } from "@/lib/fastifyClient";

/**
 * Avisos por proximidad: cuando la persona está a menos de 2 km de una oferta activa, de un monumento, de un
 * restaurante o de una playa, se le avisa.
 *
 * Alcance: funcionan mientras el sitio está abierto (en primer plano o en una pestaña en segundo plano). El
 * aviso con el sitio cerrado necesita un service worker con Push API, y el sitio no registra ninguno por
 * decisión documentada (`src/test/service-worker-removal.test.ts`). Cuando se reactive, el servidor ya tiene
 * el registro de dispositivos (`/me/push-subscriptions`); esta lógica de cercanía y de no repetir se reutiliza.
 *
 * Privacidad: es opcional y está apagado por defecto. La posición no se guarda ni se asocia a la cuenta; al
 * backend sólo viaja redondeada a tres decimales (unos 110 m) para pedir lo que hay cerca.
 */

export const PROXIMITY_KEY = "dr_proximity_alerts";
const SEEN_KEY = "dr_proximity_seen";
const LAST_ALERT = "_last";
export const RADIUS_M = 2000;
/** No se vuelve a consultar hasta moverse esta distancia o pasar este tiempo. */
const RECHECK_DISTANCE_M = 250, RECHECK_MS = 5 * 60_000;
/** Como mucho un aviso cada diez minutos, y cada lugar una vez al día. */
const MIN_GAP_MS = 10 * 60_000, REPEAT_MS = 24 * 60 * 60_000;

export interface Point { lat: number; lng: number }
export interface NearbyPlace extends Point { id: string; kind: "oferta" | "monumento" | "restaurante" | "playa"; name: string; url: string; detail?: string }
export interface ProximityAlert { place: NearbyPlace; distance: number; title: string; body: string }

/** Distancia en metros entre dos puntos (haversine). */
export function distanceMeters(a: Point, b: Point): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

export function isProximityEnabled(): boolean {
  try { return localStorage.getItem(PROXIMITY_KEY) === "on"; } catch { return false; }
}
export function setProximityEnabled(on: boolean): void {
  try { if (on) localStorage.setItem(PROXIMITY_KEY, "on"); else { localStorage.removeItem(PROXIMITY_KEY); localStorage.removeItem(SEEN_KEY); } } catch { /* sin almacenamiento, queda apagado */ }
}

type Seen = Record<string, number>;
function readSeen(now: number): Seen {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") as Seen;
    return Object.fromEntries(Object.entries(seen).filter(([, at]) => typeof at === "number" && now - at < REPEAT_MS));
  } catch { return {}; }
}
function writeSeen(seen: Seen): void {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* sin almacenamiento el aviso podría repetirse; el tope por tiempo sigue valiendo */ }
}

const meters = (m: number) => (m < 950 ? `${Math.max(50, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1)} km`);
const KIND_LABEL: Record<NearbyPlace["kind"], string> = { oferta: "Oferta", monumento: "Monumento", restaurante: "Restaurante", playa: "Playa" };

/**
 * El aviso que toca dar en esta posición, o `null`. Prefiere las ofertas a los lugares y, dentro de cada grupo,
 * lo más cercano; descarta lo que ya se avisó hoy.
 */
export function pickAlert(position: Point, places: NearbyPlace[], seen: Seen): ProximityAlert | null {
  const candidates = places
    .map((place) => ({ place, distance: distanceMeters(position, place) }))
    .filter(({ place, distance }) => distance <= RADIUS_M && !seen[`${place.kind}:${place.id}`])
    .sort((a, b) => Number(b.place.kind === "oferta") - Number(a.place.kind === "oferta") || a.distance - b.distance);
  const best = candidates[0];
  if (!best) return null;
  return { ...best, title: `${KIND_LABEL[best.place.kind]} a ${meters(best.distance)} de ti`, body: best.place.detail ? `${best.place.name} · ${best.place.detail}` : best.place.name };
}

type Row = Record<string, unknown>;
const num = (v: unknown) => (typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN);

/** Lo que hay cerca según el backend: ofertas vigentes y lugares con coordenadas. */
async function nearbyFromApi(position: Point): Promise<NearbyPlace[]> {
  const near = `${position.lat.toFixed(3)},${position.lng.toFixed(3)}`;
  const ask = async (collection: string, kind: NearbyPlace["kind"], title: string, url: (row: Row) => string, detail: (row: Row) => string | undefined): Promise<NearbyPlace[]> => {
    try {
      const res = await fetchApi<{ data: Row[] }>(`/${collection}?near=${near}&radius=${RADIUS_M}&per_page=5`);
      return res.data.flatMap((row) => {
        const lat = num(row.latitude), lng = num(row.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng) && typeof row[title] === "string" ? [{ id: String(row.id), kind, name: row[title] as string, lat, lng, url: url(row), detail: detail(row) }] : [];
      });
    } catch { return []; }
  };
  const lists = await Promise.all([
    ask("offers", "oferta", "title", () => "/ofertas", (row) => (num(row.discount_percentage) > 0 ? `${Math.round(num(row.discount_percentage))}% de descuento` : undefined)),
    ask("monuments", "monumento", "name", () => "/museos-monumentos", () => undefined),
    ask("restaurants", "restaurante", "name", (row) => `/restaurante/${row.slug}`, () => undefined),
    ask("beaches", "playa", "name", (row) => `/playa/${row.slug}`, () => undefined),
  ]);
  return lists.flat();
}

/** Sin backend: playas y restaurantes de los archivos con los que se compiló el sitio. */
async function nearbyFromLocal(): Promise<NearbyPlace[]> {
  const [{ beaches }, { restaurants }] = await Promise.all([import("@/data/beaches"), import("@/data/restaurants")]);
  const places: NearbyPlace[] = [];
  for (const b of beaches) if (typeof b.latitude === "number" && typeof b.longitude === "number") places.push({ id: b.slug, kind: "playa", name: b.name, lat: b.latitude, lng: b.longitude, url: `/playa/${b.slug}` });
  for (const r of restaurants) if (typeof r.latitude === "number" && typeof r.longitude === "number") places.push({ id: r.slug, kind: "restaurante", name: r.name, lat: r.latitude, lng: r.longitude, url: `/restaurante/${r.slug}` });
  return places;
}

export interface ProximityOptions {
  /** Cómo se muestra el aviso dentro del sitio. */
  notify: (alert: ProximityAlert) => void;
  /** De dónde salen los lugares cercanos; por defecto el backend o, sin él, los datos locales. */
  findNearby?: (position: Point) => Promise<NearbyPlace[]>;
  now?: () => number;
}

/** Con la pestaña oculta y permiso concedido se usa la notificación del sistema; si no, el aviso del sitio. */
function deliver(alert: ProximityAlert, notify: ProximityOptions["notify"]): void {
  if (typeof document !== "undefined" && document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      const notification = new Notification(alert.title, { body: alert.body, tag: `proximity:${alert.place.kind}:${alert.place.id}`, icon: "/pwa-192x192.png" });
      notification.onclick = () => { window.focus(); window.location.assign(alert.place.url); notification.close(); };
      return;
    } catch { /* Android exige un service worker para esto: se cae al aviso del sitio */ }
  }
  notify(alert);
}

/**
 * Evalúa una posición: consulta lo cercano si toca y da, como mucho, un aviso. Separado del GPS para poder
 * probarlo. Devuelve el aviso dado.
 */
export function createProximityChecker(options: ProximityOptions) {
  const now = options.now ?? Date.now;
  const findNearby = options.findNearby ?? ((position: Point) => (CATALOG_SOURCE === "api" ? nearbyFromApi(position) : nearbyFromLocal()));
  let lastCheck: { at: number; position: Point } | null = null;
  // El último aviso se recuerda entre recargas: navegar por el sitio no debe saltarse el tope de tiempo.
  let lastAlertAt = readSeen(now())[LAST_ALERT] ?? 0;
  let busy = false;
  return async (position: Point): Promise<ProximityAlert | null> => {
    const at = now();
    if (busy || at - lastAlertAt < MIN_GAP_MS) return null;
    if (lastCheck && at - lastCheck.at < RECHECK_MS && distanceMeters(lastCheck.position, position) < RECHECK_DISTANCE_M) return null;
    busy = true;
    lastCheck = { at, position };
    try {
      const seen = readSeen(at);
      const alert = pickAlert(position, await findNearby(position), seen);
      if (!alert) return null;
      writeSeen({ ...seen, [`${alert.place.kind}:${alert.place.id}`]: at, [LAST_ALERT]: at });
      lastAlertAt = at;
      deliver(alert, options.notify);
      return alert;
    } catch {
      return null;
    } finally {
      busy = false;
    }
  };
}

let stopCurrent: (() => void) | null = null;

/** Empieza a vigilar la posición. Devuelve cómo parar. Sin geolocalización en el navegador no hace nada. */
export function startProximityAlerts(options: ProximityOptions): () => void {
  stopCurrent?.();
  if (typeof navigator === "undefined" || !navigator.geolocation) return () => undefined;
  const check = createProximityChecker(options);
  const id = navigator.geolocation.watchPosition(
    (pos) => { void check({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
    (err) => { if (err.code === err.PERMISSION_DENIED) { setProximityEnabled(false); stop(); } },
    { enableHighAccuracy: false, maximumAge: 60_000, timeout: 30_000 },
  );
  const stop = () => { navigator.geolocation.clearWatch(id); if (stopCurrent === stop) stopCurrent = null; };
  stopCurrent = stop;
  return stop;
}

export function stopProximityAlerts(): void {
  stopCurrent?.();
}

/** Aviso dentro del sitio con el componente de avisos que ya usa la aplicación. */
export async function toastNotify(alert: ProximityAlert): Promise<void> {
  const { toast } = await import("sonner");
  toast(alert.title, { description: alert.body, duration: 12_000, action: { label: "Ver", onClick: () => window.location.assign(alert.place.url) } });
}

/** Reanuda los avisos al abrir el sitio si la persona los dejó encendidos. */
export function resumeProximityAlerts(): void {
  if (isProximityEnabled()) startProximityAlerts({ notify: (alert) => void toastNotify(alert) });
}
