import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/** Cliente de administración para la subasta de posiciones patrocinadas y las licencias de imágenes (mejoras 28 y 40). */

export interface SponsorshipSlot { id: string; name: string; slot_type: string; max_active_creatives: number; auction_enabled: boolean; auction_reserve: number | string }
export interface AuctionBid { id: string; campaign_name: string; advertiser_name: string; creative_title: string; amount: number; currency: string; status: "open" | "won" | "lost"; rank: number; created_at: string }
export interface AuctionBoard {
  slot: { id: string; name: string; positions: number; reserve: number; auction_enabled: boolean };
  period: { start: string; end: string };
  closed: { closed_at: string; winners: number } | null;
  bids: AuctionBid[];
}
export const BID_STATUS_LABEL: Record<AuctionBid["status"], string> = { open: "Abierta", won: "Ganadora", lost: "No ganó" };

export interface LicenseRequest {
  id: string; title: string; licensee_name: string; license_type: "editorial" | "commercial"; intended_use: string; price: number; currency: string;
  status: "requested" | "approved" | "rejected"; payment_reference: string | null; decision_note: string | null; expires_at: string | null; created_at: string;
}
export const LICENSE_TYPE_LABEL: Record<LicenseRequest["license_type"], string> = { editorial: "Editorial", commercial: "Comercial" };
export const LICENSE_STATUS_LABEL: Record<LicenseRequest["status"], string> = { requested: "Por revisar", approved: "Aprobada", rejected: "Rechazada" };

/** Lunes de las próximas `count` semanas (sin incluir la actual), en la fecha de Santo Domingo. */
export function upcomingMondays(count: number, now = new Date()): string[] {
  const today = now.toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });
  const base = new Date(`${today}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() - ((base.getUTCDay() + 6) % 7));
  return Array.from({ length: count }, (_, i) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() + 7 * (i + 1)); return d.toISOString().slice(0, 10); });
}

export function commerceErrorMessage(error: unknown): string {
  if (error instanceof HttpError) return (error.details as { error?: { message?: string } } | null)?.error?.message ?? error.message;
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

const send = <T,>(method: "POST" | "PUT" | "DELETE", url: string, body?: unknown) => fetchApi<T>(url, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const adminCommerceApi = {
  slots: () => fetchApi<{ data: SponsorshipSlot[] }>("/sponsorship/slots"),
  setSlotAuction: (slotId: string, enabled: boolean, reserve: number) => send<{ data: { auction_enabled: boolean; auction_reserve: number } }>("PUT", `/admin/sponsorship/slots/${encodeURIComponent(slotId)}/auction`, { enabled, reserve }),
  board: (slotId: string, periodStart: string) => fetchApi<{ data: AuctionBoard }>(`/admin/sponsorship/auctions?slot_id=${encodeURIComponent(slotId)}&period_start=${periodStart}`),
  closeAuction: (slotId: string, periodStart: string) => send<{ data: { winners: number; amount_due: number } }>("POST", "/admin/sponsorship/auctions/close", { slot_id: slotId, period_start: periodStart }),

  licenseRequests: (status?: LicenseRequest["status"]) => fetchApi<{ data: LicenseRequest[] }>(`/admin/media/licenses/requests?per_page=100${status ? `&status=${status}` : ""}`),
  decideLicense: (id: string, input: { approve: boolean; payment_reference?: string; note?: string }) => send<{ data: { status: string } }>("POST", `/admin/media/licenses/requests/${id}/decide`, input),
  createOffer: (input: { asset_id: string; title: string; price_editorial: number; price_commercial: number }) => send<{ data: { id: string } }>("POST", "/admin/media/licenses/offers", input),
};
