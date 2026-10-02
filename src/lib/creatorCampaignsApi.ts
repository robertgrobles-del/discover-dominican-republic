import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/** Cliente de campañas con creadores, derechos por pieza, ingresos y disputas (plan de accesos, puntos 87 a 93). */

export interface CampaignTerms {
  brief: string;
  deliverables: { type: "video" | "foto" | "publicacion" | "historia"; quantity: number; due_date?: string }[];
  schedule: { starts_on: string; ends_on: string };
  compensation: { type: "fixed"; amount: number; currency: "DOP" | "USD" } | { type: "commission"; commission_pct: number } | { type: "none" };
  disclosure: string;
  metrics: string[];
  rights: { media: string[]; territory: string; duration_days: number; exclusive: boolean; approved_uses: string[] };
}

export interface OpenCampaign { id: string; title: string; sponsor: string | null; version: number; terms: CampaignTerms; terms_hash: string; accepted_version: number | null; needs_acceptance: boolean }
export interface AdminCampaign { id: string; title: string; sponsor: string | null; status: "draft" | "open" | "closed"; current_version: number; created_at: string; closed_at: string | null; accepted_current: number; deliverables_pending: number }
export interface Deliverable { id: string; creator_id: string; handle: string; video_id: string; video_title: string; video_url: string; accepted_version: number; status: "submitted" | "approved" | "rejected"; review_note: string | null; created_at: string }
export interface Acceptance { creator_id: string; handle: string; version: number; terms_hash: string; accepted_at: string; ip: string | null }

export type LedgerSource = "affiliate_commission" | "content_payment" | "creator_fund" | "bonus" | "tip" | "reversal" | "adjustment";
export interface LedgerEntry {
  id: string; source: LedgerSource; amount: number; currency: string; status: "estimated" | "confirmed" | "reversed"; origin: string;
  attribution_window_days: number | null; reverses_entry_id: string | null; reason: string | null; created_at: string; confirms_at: string | null;
}
export interface Earnings {
  by_source: { source: LedgerSource; label: string; currency: string; estimated: number; confirmed: number }[];
  entries: LedgerEntry[];
  notes: { attribution_window_days: number; estimated: string; dispute_window_days: number };
}

export interface License { id: string; license_type: "platform" | "campaign"; campaign_title: string | null; media: string[]; territory: string; exclusive: boolean; approved_uses: string[]; expires_at: string | null; status: "active" | "expired" | "revoked"; revoked_reason: string | null }
export interface Dispute { id: string; subject_type: "campaign" | "ledger_entry"; subject_id: string; reason: string; evidence: { label: string; url?: string; text?: string }[]; status: "open" | "resolved_accepted" | "resolved_rejected" | "withdrawn"; due_at: string; resolution_note: string | null; created_at: string; handle?: string; overdue?: boolean }

export const DISPUTE_STATUS_LABEL: Record<Dispute["status"], string> = { open: "En revisión", resolved_accepted: "Resuelta a tu favor", resolved_rejected: "No procedió", withdrawn: "Retirada" };
export const LEDGER_STATUS_LABEL: Record<LedgerEntry["status"], string> = { estimated: "Estimado", confirmed: "Confirmado", reversed: "Revertido" };
export const DELIVERABLE_LABEL: Record<CampaignTerms["deliverables"][number]["type"], string> = { video: "video", foto: "foto", publicacion: "publicación", historia: "historia" };

/** Compensación en una frase, para que el creador la lea antes de aceptar. */
export function describeCompensation(c: CampaignTerms["compensation"]): string {
  if (c.type === "fixed") return `Pago fijo de ${money(c.amount, c.currency)} por entrega aprobada`;
  if (c.type === "commission") return `Comisión del ${c.commission_pct} % sobre ventas atribuidas`;
  return "Sin compensación económica";
}

export function money(amount: number, currency: string): string {
  try { return new Intl.NumberFormat("es-DO", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount)); }
  catch { return `${Number(amount).toFixed(2)} ${currency}`; }
}

export function campaignErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    const body = (error.details as { error?: { message?: string; details?: { code?: string; reason?: string } } } | null)?.error;
    const code = body?.details?.code ?? body?.details?.reason;
    if (code === "TERMS_VERSION_MISMATCH") return "Los términos cambiaron mientras los leías. Revisa la versión vigente antes de aceptar.";
    if (code === "TERMS_NOT_ACCEPTED") return "Acepta los términos vigentes de la campaña antes de entregar.";
    if (code === "CREATOR_NOT_APPROVED") return "Tu perfil de creador todavía no está aprobado.";
    if (code === "ALREADY_SUBMITTED") return "Esa pieza ya fue entregada a esta campaña.";
    if (code === "CAMPAIGN_LICENSE") return "Una licencia de campaña sólo se revoca con el equipo. Puedes abrir una disputa.";
    if (code === "DISPUTE_WINDOW_CLOSED") return "El plazo para disputar ese caso ya venció.";
    if (code === "DISPUTE_ALREADY_OPEN") return "Ya tienes una disputa abierta sobre ese caso.";
    if (code === "LICENSE_ALREADY_ACTIVE") return "La pieza ya tiene una licencia de plataforma vigente.";
    if (code === "TERMS_UNCHANGED") return "Los términos no cambiaron respecto a la versión vigente.";
    return body?.message ?? error.message;
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

const send = <T,>(method: "POST" | "PUT", url: string, body?: unknown) => fetchApi<T>(url, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const creatorCampaignsApi = {
  // Creador
  open: () => fetchApi<{ data: OpenCampaign[] }>("/creators/campaigns"),
  accept: (id: string, version: number) => send<{ data: { version: number; already_accepted: boolean } }>("POST", `/creators/campaigns/${id}/accept`, { version }),
  deliver: (id: string, videoId: string) => send<{ data: { id: string } }>("POST", `/creators/campaigns/${id}/deliverables`, { video_id: videoId }),
  earnings: () => fetchApi<{ data: Earnings }>("/creators/me/earnings"),
  rights: (videoId: string) => fetchApi<{ data: { video_id: string; holder_creator_id: string; licenses: License[] } }>(`/creators/videos/${videoId}/rights`),
  grantPlatformLicense: (videoId: string) => send<{ data: { id: string } }>("POST", `/creators/videos/${videoId}/platform-license`),
  revokeRight: (rightId: string, reason: string) => send<null>("POST", `/creators/rights/${rightId}/revoke`, { reason }),
  myDisputes: () => fetchApi<{ data: Dispute[] }>("/creators/me/disputes"),
  openDispute: (input: { subject_type: Dispute["subject_type"]; subject_id: string; reason: string; evidence: Dispute["evidence"] }) => send<{ data: { id: string; due_at: string } }>("POST", "/creators/disputes", input),
  withdrawDispute: (id: string) => send<null>("POST", `/creators/disputes/${id}/withdraw`),

  // Personal
  adminList: () => fetchApi<{ data: AdminCampaign[] }>("/admin/creator-campaigns"),
  adminCreate: (input: { title: string; sponsor?: string; terms: CampaignTerms }) => send<{ data: { id: string } }>("POST", "/admin/creator-campaigns", input),
  adminReviseTerms: (id: string, terms: CampaignTerms) => send<{ data: { version: number } }>("PUT", `/admin/creator-campaigns/${id}/terms`, { terms }),
  adminSetStatus: (id: string, status: "open" | "closed") => send<null>("POST", `/admin/creator-campaigns/${id}/status`, { status }),
  adminAcceptances: (id: string) => fetchApi<{ data: Acceptance[] }>(`/admin/creator-campaigns/${id}/acceptances`),
  adminDeliverables: (id: string) => fetchApi<{ data: Deliverable[] }>(`/admin/creator-campaigns/${id}/deliverables`),
  adminReview: (deliverableId: string, decision: "approved" | "rejected", note?: string) => send<{ data: { status: string } }>("POST", `/admin/creator-deliverables/${deliverableId}/review`, { decision, ...(note ? { note } : {}) }),
  adminDisputes: (status: Dispute["status"] = "open") => fetchApi<{ data: Dispute[] }>(`/admin/creator-disputes?status=${status}`),
  adminResolveDispute: (id: string, decision: "resolved_accepted" | "resolved_rejected", note: string) => send<null>("POST", `/admin/creator-disputes/${id}/resolve`, { decision, note }),
  adminLedgerEntry: (input: { creator_id: string; source: "bonus" | "adjustment" | "creator_fund" | "tip"; amount: number; currency: "DOP" | "USD"; reason: string }) => send<{ data: { id: string } }>("POST", "/admin/creator-ledger", input),
  adminReverse: (entryId: string, reason: string) => send<{ data: { reversal_id: string } }>("POST", `/admin/creator-ledger/${entryId}/reverse`, { reason }),
};
