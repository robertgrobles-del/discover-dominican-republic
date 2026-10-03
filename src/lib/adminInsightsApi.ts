import { fetchApi } from "@/lib/fastifyClient";

/** Cliente de los indicadores del equipo: rebote, satisfacción, mapa de calor y conciliación (mejoras 103, 106, 112 y 115). */

export interface BounceReport {
  sessions: number; bounced: number; bounce_rate: number; threshold_pct: number; min_sessions: number; alert: boolean;
  daily: { day: string; sessions: number; bounced: number; bounce_rate: number }[];
  landing_pages: { page: string; sessions: number; bounced: number; bounce_rate: number }[];
}
interface SatisfactionScore { reviews: number; verified_reviews: number; average_rating: number | null; average_verified_rating: number | null; index: number | null }
export interface SatisfactionReport extends SatisfactionScore {
  verified_weight: number;
  by_entity_type: ({ entity_type: string } & SatisfactionScore)[];
  by_month: ({ month: string } & SatisfactionScore)[];
}
export type HeatmapMetric = "page_view" | "click" | "outbound_link" | "favorite" | "share" | "all";
export interface HeatmapReport { total_events: number; peak: { weekday: number; hour: number; events: number } | null; cells: { weekday: number; hour: number; events: number; sessions: number }[] }
export type DiscrepancyKind = "paid_without_invoice" | "invoice_mismatch" | "invoice_without_payment" | "unsettled_booking";
export interface ReconciliationReport {
  collected: { source: string; currency: string; provider: string; payments: number; charges: number; refunds: number; net: number }[];
  failed_payments: number;
  invoiced: { reference_type: string; currency: string; invoices: number; subtotal: number; itbis: number; total: number }[];
  payouts: { status: string; currency: string; payouts: number; gross: number; commission: number; net: number }[];
  discrepancy_counts: Record<DiscrepancyKind, number>;
  discrepancies: { kind: DiscrepancyKind; reference_type: string; reference_id: string; label: string; currency: string; collected: number; invoiced: number }[];
  notes: { unsettled_after_days: number; list_limit: number };
}

export const HEATMAP_METRIC_LABEL: Record<HeatmapMetric, string> = { page_view: "Vistas de página", click: "Clics", outbound_link: "Enlaces salientes", favorite: "Favoritos", share: "Compartidos", all: "Toda la actividad" };
export const DISCREPANCY_LABEL: Record<DiscrepancyKind, string> = {
  paid_without_invoice: "Cobro sin comprobante", invoice_mismatch: "Comprobante por otro monto",
  invoice_without_payment: "Comprobante sin cobro", unsettled_booking: "Reserva completada sin liquidar",
};
export const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Matriz de 7 días por 24 horas con los eventos de cada celda; las celdas sin actividad quedan en 0. */
export function heatmapGrid(cells: HeatmapReport["cells"]): number[][] {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const c of cells) if (c.weekday >= 1 && c.weekday <= 7 && c.hour >= 0 && c.hour <= 23) grid[c.weekday - 1]![c.hour] = c.events;
  return grid;
}

/** Rango de los últimos `days` días en la fecha de Santo Domingo. */
export function lastDays(days: number, now = new Date()): { from: string; to: string } {
  const iso = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });
  return { from: iso(new Date(now.getTime() - (days - 1) * 86_400_000)), to: iso(now) };
}

const q = (r: { from: string; to: string }) => `from=${r.from}&to=${r.to}`;
export const adminInsightsApi = {
  bounce: (r: { from: string; to: string }) => fetchApi<{ data: BounceReport }>(`/admin/analytics/bounce?${q(r)}`),
  satisfaction: (r: { from: string; to: string }) => fetchApi<{ data: SatisfactionReport }>(`/admin/analytics/satisfaction?${q(r)}`),
  heatmap: (r: { from: string; to: string }, metric: HeatmapMetric) => fetchApi<{ data: HeatmapReport }>(`/admin/analytics/heatmap?${q(r)}&metric=${metric}`),
  reconciliation: (r: { from: string; to: string }) => fetchApi<{ data: ReconciliationReport }>(`/admin/finance/reconciliation?${q(r)}`),
};
