import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/** Cliente del panel del operador para webhooks, Sello Verificado con su contrato y el reporte trimestral (mejoras 30, 31 y 139). */

export const WEBHOOK_EVENTS = ["booking.created", "booking.cancelled"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
export const WEBHOOK_EVENT_LABEL: Record<WebhookEvent, string> = { "booking.created": "Reserva creada", "booking.cancelled": "Reserva cancelada" };

export interface Webhook { id: string; url: string; events: WebhookEvent[]; active: boolean; consecutive_failures: number; disabled_reason: string | null; last_delivery_at: string | null; created_at: string }
export interface WebhookDelivery { id: string; event: string; status: "pending" | "delivered" | "failed"; attempts: number; response_status: number | null; created_at: string; delivered_at: string | null }

export const BUSINESS_TYPES = ["operador", "agencia", "guia"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];
export interface VerificationApplication { id: string; business_name: string; business_type: string; status: "pending" | "approved" | "rejected" | "expired"; audit_notes: string | null; badge_expires_at: string | null; created_at: string; contract_id: string | null; contract_accepted_at: string | null }
export interface BusinessContract { id: string; audit_id: string | null; business_name: string; terms_version: string; body: string; body_hash: string; issued_at: string; accepted_at: string | null }
export const VERIFICATION_STATUS_LABEL: Record<VerificationApplication["status"], string> = { pending: "En revisión", approved: "Aprobada", rejected: "Rechazada", expired: "Vencida" };

export interface DemandReport {
  quarter: string; compared_to: string; generated_by: string; findings: string[];
  totals: { bookings: number; cancelled: number; cancellation_rate: number; guests: number; average_party_size: number; average_lead_days: number | null; contact_clicks: number; revenue: { currency: string; booked_value: number }[] };
  previous: { bookings: number; guests: number; growth_pct: number | null };
  by_weekday: { weekday: number; name: string; bookings: number; guests: number }[];
  top_listings: { listing_id: string; title: string; bookings: number; guests: number }[];
}

/** Trimestre `AAAA-Tn` anterior al de la fecha dada: el último que ya terminó. */
export function lastFinishedQuarter(now = new Date()): string {
  const [year, month] = now.toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" }).split("-").map(Number) as [number, number];
  const q = Math.ceil(month / 3);
  return q === 1 ? `${year - 1}-T4` : `${year}-T${q - 1}`;
}
/** Los `count` trimestres terminados más recientes, del más nuevo al más antiguo. */
export function recentQuarters(count: number, now = new Date()): string[] {
  const out: string[] = [];
  let [year, q] = lastFinishedQuarter(now).split("-T").map(Number) as [number, number];
  for (let i = 0; i < count; i++) { out.push(`${year}-T${q}`); if (q === 1) { year--; q = 4; } else q--; }
  return out;
}

export function toolsErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    const body = (error.details as { error?: { message?: string } } | null)?.error;
    if (error.status === 403) return body?.message ?? "Tu rol o tu plan no permiten esta acción.";
    return body?.message ?? error.message;
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

const send = <T,>(method: "POST" | "DELETE", url: string, body?: unknown) => fetchApi<T>(url, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const operatorToolsApi = {
  /** La organización real del backend: el panel aún lee su organización de los datos simulados. */
  myOrg: () => fetchApi<{ data: { org: { id: string; business_name: string }; role: string } }>("/orgs/me"),

  webhooks: () => fetchApi<{ data: Webhook[] }>("/org/webhooks"),
  createWebhook: (url: string, events: WebhookEvent[]) => send<{ data: Webhook & { secret: string } }>("POST", "/org/webhooks", { url, events }),
  deleteWebhook: (id: string) => send<null>("DELETE", `/org/webhooks/${id}`),
  enableWebhook: (id: string) => send<{ data: Webhook }>("POST", `/org/webhooks/${id}/enable`),
  testWebhook: (id: string) => send<{ data: { delivery_id: string } }>("POST", `/org/webhooks/${id}/test`),
  deliveries: (id: string) => fetchApi<{ data: WebhookDelivery[] }>(`/org/webhooks/${id}/deliveries`),

  applications: () => fetchApi<{ data: VerificationApplication[] }>("/verifications/mine"),
  apply: (input: { business_id: string; business_type: BusinessType; business_name: string; rnc?: string; mitur_license?: string }) => send<{ data: { id: string } }>("POST", "/verifications", { ...input, documents: [] }),
  contracts: () => fetchApi<{ data: BusinessContract[] }>("/verifications/contracts"),
  acceptContract: (id: string, bodyHash: string) => send<{ data: { accepted_at: string; already_accepted: boolean } }>("POST", `/verifications/contracts/${id}/accept`, { body_hash: bodyHash }),

  demand: (quarter: string) => fetchApi<{ data: DemandReport }>(`/org/reports/demand?quarter=${quarter}`),
};
