import { fetchApi } from "@/lib/fastifyClient";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";

/** Anuncios nativos del directorio (mejora 26 del plan de arquitectura): se entregan y miden desde el backend. */

export interface NativeCreative { id: string; slot_id: string; title: string; headline: string | null; body_text: string | null; target_url: string; image_url: string | null; badge_label: string }

export const NATIVE_DIRECTORY_SLOT = "directory_native";

/** Sólo enlaces http(s) o rutas internas: una creatividad nunca debe poder inyectar `javascript:` u otro esquema. */
export function safeAdUrl(url: string): string | null {
  if (/^\/(?!\/)/.test(url)) return url;
  try { const u = new URL(url); return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null; } catch { return null; }
}

export async function serveNative(slot: string, opts: { category?: string; limit?: number } = {}, enabled = HAS_BACKEND_SESSION): Promise<NativeCreative[]> {
  if (!enabled) return [];
  const q = new URLSearchParams({ limit: String(opts.limit ?? 1), ...(opts.category ? { category: opts.category } : {}) });
  const res = await fetchApi<{ data: NativeCreative[] }>(`/sponsorship/serve/${encodeURIComponent(slot)}?${q}`);
  return res.data.filter((c) => safeAdUrl(c.target_url) !== null);
}

/** La medición nunca interrumpe la navegación ni muestra errores. */
export function trackAd(creative: Pick<NativeCreative, "id" | "slot_id">, event: "impression" | "click", page: string): void {
  void fetchApi("/sponsorship/telemetry", { method: "POST", keepalive: true, body: JSON.stringify({ creative_id: creative.id, slot_id: creative.slot_id, event_type: event, page: page.slice(0, 300) }) }).catch(() => undefined);
}
