import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de API para administración del sistema:
 * - Redirecciones SEO (D8)
 * - Tareas programadas (D10)
 * - Salud del sistema (D11)
 */

export interface SeoRedirection {
  id: string;
  source_path: string;
  target_path: string;
  redirect_type: 301 | 302;
  is_active: boolean;
  created_at?: string;
}

export interface SystemJob {
  name: string;
  description?: string;
  enabled: boolean;
  interval_seconds?: number;
  every_seconds?: number; // alias para compatibilidad
  status?: string;
  last_run_at?: string | null;
  next_run_at?: string | null;
  last_duration_ms?: number | null;
  last_result?: unknown;
  error_log?: string | null;
}

export interface SystemHealthData {
  database: {
    ok: boolean;
    latency_ms: number;
  };
  mail_queue: {
    last_7d: Record<string, number>;
    oldest_queued_seconds?: number | null;
  };
  jobs: Array<{
    name: string;
    status: string;
    enabled: boolean;
    last_run_at?: string | null;
    error?: string | null;
  }>;
  payments: {
    provider: string;
  };
  version?: string | null;
  node?: string;
  uptime_seconds?: number;
}

export const adminSystemApi = {
  // Redirecciones SEO (D8)
  async listRedirects(page = 1, perPage = 50): Promise<{ data: SeoRedirection[]; meta: { total: number } }> {
    return fetchApi<{ data: SeoRedirection[]; meta: { total: number } }>(
      `/admin/seo_redirections?page=${page}&per_page=${perPage}`
    );
  },

  async createRedirect(payload: { source_path: string; target_path: string; redirect_type?: 301 | 302; is_active?: boolean }): Promise<SeoRedirection> {
    const res = await fetchApi<{ data: SeoRedirection }>("/admin/seo_redirections", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateRedirect(id: string, payload: Partial<SeoRedirection>): Promise<SeoRedirection> {
    const res = await fetchApi<{ data: SeoRedirection }>(`/admin/seo_redirections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteRedirect(id: string): Promise<void> {
    await fetchApi(`/admin/seo_redirections/${id}`, {
      method: "DELETE",
    });
  },

  // Jobs / Tareas programadas (D10)
  async listJobs(): Promise<SystemJob[]> {
    const res = await fetchApi<{ data: SystemJob[] }>("/admin/jobs");
    return res.data || [];
  },

  async runJob(name: string): Promise<unknown> {
    const res = await fetchApi<{ data: unknown }>(`/admin/jobs/${encodeURIComponent(name)}/run`, {
      method: "POST",
    });
    return res.data;
  },

  async updateJob(name: string, payload: { enabled?: boolean; interval_seconds?: number }): Promise<void> {
    await fetchApi(`/admin/jobs/${encodeURIComponent(name)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Salud del sistema (D11)
  async getHealth(): Promise<SystemHealthData> {
    const res = await fetchApi<{ data: SystemHealthData }>("/admin/system/health");
    return res.data;
  },
};
