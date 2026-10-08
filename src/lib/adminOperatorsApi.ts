import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de API para administración de Operadores y Negocios (/api/v1/admin/orgs)
 * Contrato estricto según backend/src/modules/operators/routes.ts y catalog.ts
 */

export interface AdminPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface AdminOrganization {
  id: string;
  business_name: string;
  slug?: string;
  business_type?: string;
  email?: string;
  phone?: string | null;
  province?: string | null;
  description?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  verification: "unverified" | "pending" | "verified" | "rejected";
  commission_rate?: number;
  payout_method?: string | null;
  website_enabled?: boolean;
  created_at: string;
}

export const adminOperatorsApi = {
  /** Lista organizaciones con filtros y paginación */
  async listOrgs(params?: {
    page?: number;
    per_page?: number;
    verification?: "unverified" | "pending" | "verified" | "rejected";
    q?: string;
  }): Promise<{ data: AdminOrganization[]; meta: AdminPaginationMeta }> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.verification) qs.set("verification", params.verification);
    if (params?.q) qs.set("q", params.q);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetchApi<{ data: AdminOrganization[]; meta: AdminPaginationMeta }>(`/admin/orgs${query}`);
    return res;
  },

  /** Modifica el estado de verificación de un operador */
  async setVerification(id: string, verification: "unverified" | "pending" | "verified" | "rejected"): Promise<void> {
    await fetchApi(`/admin/orgs/${id}/verification`, {
      method: "PUT",
      body: JSON.stringify({ verification }),
    });
  },
};
