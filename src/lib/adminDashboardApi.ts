import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de API para el Dashboard Administrativo (/api/v1/admin/dashboard)
 */

export interface AdminDashboardPending {
  reviews: number;
  ugc_reports: number;
  reported_posts: number;
  ugc_media: number;
  support_tickets: number;
  operators_to_verify: number;
  payouts: number;
  establishment_requests: number;
  content_in_review: Array<{ path: string; n: number }>;
}

export interface AdminDashboardData {
  users: {
    active: number;
    new_7d: number;
  };
  bookings: {
    last_30d: number;
    collected_usd_30d: number;
  };
  totals?: {
    reviews: number;
    posts: number;
    banners: number;
    low_stock_rewards: number;
  };
  pending: AdminDashboardPending;
  health: {
    failed_jobs: number;
  };
  content: Record<string, Record<string, number>>;
}

export interface AdminRecentArticle {
  id: string;
  title: string;
  status: string;
  created_at: string;
  category?: string;
  author?: string;
  slug?: string;
}

export interface AdminRecentReview {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  rating: number;
  title?: string;
  content: string;
  status: string;
  created_at: string;
  author_name?: string;
}

export const adminDashboardApi = {
  /** Obtiene las estadísticas maestras, contadores y pendientes de moderación */
  async getDashboard(): Promise<AdminDashboardData> {
    const res = await fetchApi<{ data: AdminDashboardData }>("/admin/dashboard");
    return res.data;
  },

  /** Obtiene los artículos más recientes */
  async getRecentArticles(perPage = 5): Promise<AdminRecentArticle[]> {
    const res = await fetchApi<{ data: AdminRecentArticle[] }>(`/admin/articles?per_page=${perPage}`);
    return res.data;
  },

  /** Obtiene las reseñas pendientes de moderación */
  async getPendingReviews(perPage = 5): Promise<AdminRecentReview[]> {
    const res = await fetchApi<{ data: AdminRecentReview[] }>(`/admin/reviews?status=pending&per_page=${perPage}`);
    return res.data;
  },
};
