import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de API para consulta de bitácora de auditoría (/api/v1/admin/audit-logs)
 * Contrato estricto según backend/src/modules/admin/site.ts
 */

export interface AdminAuditPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface AdminAuditEntry {
  id: number;
  created_at: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  org_id?: string | null;
  ip?: string;
  meta?: Record<string, unknown> | null;
}

export const adminAuditApi = {
  /** Lista eventos de auditoría con filtros y paginación */
  async listLogs(params?: {
    actor?: string;
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: AdminAuditEntry[]; meta: AdminAuditPaginationMeta }> {
    const qs = new URLSearchParams();
    if (params?.actor) qs.set("actor", params.actor);
    if (params?.entity) qs.set("entity", params.entity);
    if (params?.action) qs.set("action", params.action);
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetchApi<{ data: AdminAuditEntry[]; meta: AdminAuditPaginationMeta }>(`/admin/audit-logs${query}`);
    return res;
  },
};
