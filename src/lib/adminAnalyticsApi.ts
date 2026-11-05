import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de API para analíticas y métricas (/api/v1/admin/analytics/*)
 * Contrato estricto según backend/src/modules/analytics/routes.ts
 */

export interface AnalyticsDailyPoint {
  day: string;
  views: number;
  sessions: number;
}

export interface AnalyticsOverview {
  range: { from: string; to: string };
  users_new: number;
  reviews: number;
  favorites: number;
  social_posts: number;
  establishment_requests: number;
  bookings: number;
  booking_revenue_usd: number;
  store_orders: number;
  page_views: number;
  sessions: number;
  daily: AnalyticsDailyPoint[];
}

export interface AnalyticsTrafficRow {
  key: string;
  views: number;
  sessions: number;
}

export interface AnalyticsTraffic {
  range: { from: string; to: string };
  group: "page" | "source" | "country" | "day";
  rows: AnalyticsTrafficRow[];
}

export interface AnalyticsTopContentItem {
  page: string;
  views: number;
  sessions: number;
}

export interface AnalyticsNpsComment {
  score: number;
  survey: string;
  comment: string;
  created_at: string;
}

export interface AnalyticsNpsData {
  range: { from: string; to: string };
  count: number;
  score: number | null;
  promoters: number;
  detractors: number;
  passives: number;
  comments: AnalyticsNpsComment[];
}

/** Paso de un embudo de `GET /admin/analytics/funnels/:name`. */
export interface AnalyticsFunnelStep {
  step: string;
  count: number;
  pct_of_first: number;
  pct_of_previous: number | null;
}

export interface AnalyticsFunnel {
  name: "reserva" | "registro" | "tienda";
  range: { from: string; to: string };
  steps: AnalyticsFunnelStep[];
}

export const adminAnalyticsApi = {
  /** Embudo calculado con datos reales del periodo (por omisión, los últimos 30 días). */
  async getFunnel(name: AnalyticsFunnel["name"]): Promise<AnalyticsFunnel> {
    const res = await fetchApi<{ data: AnalyticsFunnel }>(`/admin/analytics/funnels/${name}`);
    return res.data;
  },

  /** Obtiene KPIs agregados de la plataforma y serie diaria en un rango */
  async getOverview(params?: { from?: string; to?: string }): Promise<AnalyticsOverview> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetchApi<{ data: AnalyticsOverview }>(`/admin/analytics/overview${query}`);
    return res.data;
  },

  /** Obtiene vistas y sesiones agrupadas por página, origen, país o día */
  async getTraffic(params?: {
    from?: string;
    to?: string;
    group?: "page" | "source" | "country" | "day";
  }): Promise<AnalyticsTraffic> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.group) qs.set("group", params.group);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetchApi<{ data: AnalyticsTraffic }>(`/admin/analytics/traffic${query}`);
    return res.data;
  },

  /** Obtiene las páginas más vistas */
  async getTopContent(limit = 10, params?: { from?: string; to?: string }): Promise<AnalyticsTopContentItem[]> {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    qs.set("metric", "views");
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const res = await fetchApi<{ data: AnalyticsTopContentItem[] }>(`/admin/analytics/top-content?${qs.toString()}`);
    return res.data;
  },

  /** Obtiene puntuaciones, grupos de satisfacción y comentarios NPS */
  async getNps(params?: { from?: string; to?: string }): Promise<AnalyticsNpsData> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetchApi<{ data: AnalyticsNpsData }>(`/admin/analytics/nps${query}`);
    return res.data;
  },
};
