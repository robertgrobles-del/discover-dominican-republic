import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/** Cliente del anunciante (campañas, anuncios y pujas) y del catálogo público de imágenes licenciables (mejoras 28 y 40). */

export interface MyCreative { id: string; slot_id: string; title: string; target_url: string; status: string; impressions: number; clicks: number }
export interface MyCampaign { id: string; campaign_name: string; advertiser_name: string; status: "draft" | "pending_approval" | "active" | "paused" | "completed" | "cancelled"; starts_at: string; ends_at: string; creatives: MyCreative[] }
export interface MyBid { id: string; slot_id: string; slot_name: string; auction_reserve: number; creative_id: string; period_start: string; amount: number; currency: string; status: "open" | "won" | "lost" | "withdrawn" }
export interface AuctionSlot { id: string; name: string; max_active_creatives: number; auction_enabled: boolean; auction_reserve: number | string; closed_weeks?: string[] }

export const CAMPAIGN_STATUS_LABEL: Record<MyCampaign["status"], string> = { draft: "Borrador", pending_approval: "En revisión", active: "Aprobada", paused: "En pausa", completed: "Finalizada", cancelled: "Cancelada" };
export const MY_BID_STATUS_LABEL: Record<MyBid["status"], string> = { open: "Abierta", won: "Ganaste", lost: "No ganó", withdrawn: "Retirada" };

export interface LicensableImage { id: string; asset_id: string; title: string; description: string | null; price_editorial: number; price_commercial: number; currency: string; width: number; height: number; credit: string | null; alt: string | null; preview_url: string }
export interface MyLicense { id: string; title: string; license_type: "editorial" | "commercial"; price: number; currency: string; status: "requested" | "approved" | "rejected"; decision_note: string | null; expires_at: string | null; download_url: string | null }

/**
 * El backend arma las direcciones de los archivos con su propio dominio, pero la política de seguridad de
 * contenido del sitio sólo admite imágenes y conexiones del mismo origen. La API se sirve bajo `/api` del
 * sitio, así que basta con quedarse con la ruta.
 */
export function sameOriginPath(url: string): string {
  try { const u = new URL(url, "http://local.invalid"); return `${u.pathname}${u.search}`; } catch { return url; }
}

export function advertiserErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    const body = (error.details as { error?: { message?: string; details?: { code?: string; reserve?: number } } } | null)?.error;
    if (body?.details?.code === "BELOW_RESERVE") return `La puja mínima para este espacio es ${body.details.reserve}.`;
    if (body?.details?.code === "BID_NOT_HIGHER") return "Una puja sólo puede subirse: indica un monto mayor al actual.";
    if (error.status === 401) return "Inicia sesión para continuar.";
    return body?.message ?? error.message;
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

const send = <T,>(method: "POST" | "DELETE", url: string, body?: unknown) => fetchApi<T>(url, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const advertiserApi = {
  slots: async () => (await fetchApi<{ data: AuctionSlot[] }>("/sponsorship/slots")).data.filter((s) => s.auction_enabled),
  campaigns: () => fetchApi<{ data: MyCampaign[] }>("/sponsorship/campaigns/mine"),
  /** Campaña de tarifa fija por 90 días: lo que se paga es la puja ganada, no clics ni impresiones. */
  createCampaign: (input: { advertiser_name: string; advertiser_email: string; campaign_name: string; sponsor_id?: string }, now = new Date()) =>
    send<{ data: { id: string } }>("POST", "/sponsorship/campaigns", { ...input, billing_type: "flat", starts_at: now.toISOString(), ends_at: new Date(now.getTime() + 90 * 86_400_000).toISOString() }),
  createCreative: (campaignId: string, input: { slot_id: string; title: string; target_url: string; image_url?: string }) => send<{ data: { id: string } }>("POST", `/sponsorship/campaigns/${campaignId}/creatives`, input),
  bids: () => fetchApi<{ data: MyBid[] }>("/sponsorship/bids/mine"),
  bid: (input: { slot_id: string; creative_id: string; period_start: string; amount: number }) => send<{ data: MyBid }>("POST", "/sponsorship/bids", input),
  withdraw: (id: string) => send<null>("DELETE", `/sponsorship/bids/${id}`),

  catalog: async () => { const res = await fetchApi<{ data: LicensableImage[] }>("/media/licenses/catalog?per_page=48"); return { data: res.data.map((i) => ({ ...i, preview_url: sameOriginPath(i.preview_url) })) }; },
  requestLicense: (input: { offer_id: string; license_type: "editorial" | "commercial"; licensee_name: string; intended_use: string }) => send<{ data: { id: string } }>("POST", "/media/licenses/requests", input),
  myLicenses: async () => { const res = await fetchApi<{ data: MyLicense[] }>("/media/licenses/mine"); return { data: res.data.map((l) => ({ ...l, download_url: l.download_url && sameOriginPath(l.download_url) })) }; },
};
