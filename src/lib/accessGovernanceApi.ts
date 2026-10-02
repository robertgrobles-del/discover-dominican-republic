import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/** Cliente de la consola para la gobernanza de accesos: aprobaciones, revisiones periódicas y accesos por persona. */

export type ApprovalKind = "grant_admin" | "reset_2fa" | "payout_mark_paid";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired" | "failed";

export interface ApprovalRequest {
  id: string; kind: ApprovalKind; target_id: string; payload: Record<string, unknown>; reason: string; status: ApprovalStatus;
  requested_by: string; decided_by: string | null; decided_at: string | null; decision_note: string | null; expires_at: string; created_at: string;
  can_decide: boolean;
}

export interface AccessReviewSummary {
  id: string; status: "open" | "closed"; due_at: string; created_at: string; closed_at: string | null; overdue: boolean;
  items: number; pending: number; revoked: number;
}
export interface AccessReviewItem {
  id: string; subject_user_id: string; email: string; display_name: string | null; role: string; expires_at: string | null;
  decision: "keep" | "revoke" | null; justification: string | null; decided_by: string | null; decided_at: string | null; last_session_at: string | null;
}
export interface AccessReview extends Omit<AccessReviewSummary, "items" | "pending" | "revoked" | "overdue"> { items: AccessReviewItem[] }

export interface AccessTimeline {
  roles: { role: string; expires_at: string | null; grant_reason: string | null; granted_by: string | null }[];
  organizations: { org_id: string; role: string; expires_at: string | null; since: string; business_name: string | null }[];
  events: { at: string; action: string; actor_id: string | null; org_id: string | null; meta: Record<string, unknown> }[];
}

export interface StaffInvitation { id: string; email: string; role: "editor" | "moderator"; status: "open" | "accepted" | "revoked" | "expired"; expires_at: string; created_at: string }
export interface CapabilityGrant { id: string; user_id: string; email: string; capability: "catalog.manage" | "analytics.read"; collections: string[]; record_ids: string[]; reason: string; expires_at: string | null; active: boolean }

export const APPROVAL_KIND_LABEL: Record<ApprovalKind, string> = {
  grant_admin: "Conceder administración",
  reset_2fa: "Restablecer verificación en dos pasos",
  payout_mark_paid: "Marcar liquidación como pagada",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada", cancelled: "Retirada", expired: "Vencida", failed: "No se pudo aplicar",
};

/** Nombre legible de un evento de la auditoría de accesos. */
export const ACCESS_EVENT_LABEL: Record<string, string> = {
  "user.roles_changed": "Cambio de roles",
  "user.role_granted_temporary": "Rol temporal concedido",
  "user.role_expired": "Rol temporal vencido",
  "user.admin_granted": "Administración concedida",
  "user.suspended": "Cuenta suspendida",
  "user.unsuspended": "Cuenta reactivada",
  "user.2fa_reset": "Verificación en dos pasos restablecida",
  "user.deletion_requested": "Solicitó eliminar su cuenta",
  "user.deletion_cancelled": "Canceló la eliminación de su cuenta",
  "user.consent_update": "Cambió sus consentimientos",
  "org.join": "Se unió a una organización",
  "org.member_update": "Cambio de rol en una organización",
  "org.member_remove": "Salió de una organización",
  "org.member_expired": "Venció su acceso a una organización",
  "access_review.keep": "Acceso confirmado en revisión",
  "access_review.revoke": "Acceso retirado en revisión",
};
export const accessEventLabel = (action: string): string => ACCESS_EVENT_LABEL[action] ?? action;

/** Mensaje para la persona a partir de un error del API; reconoce los casos propios de este módulo. */
export function governanceErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    const details = (error.details as { error?: { message?: string; details?: { code?: string; reason?: string } } } | null)?.error;
    const code = details?.details?.code ?? details?.details?.reason;
    if (code === "SELF_APPROVAL") return "No puedes decidir tu propia solicitud: debe hacerlo otra persona administradora.";
    if (code === "SELF_REVIEW") return "No puedes revisar tus propios accesos: debe hacerlo otra persona.";
    if (code === "LAST_ADMIN") return "No se puede retirar al último administrador.";
    if (code === "REVIEW_INCOMPLETE") return "Aún quedan accesos sin revisar.";
    if (code === "APPROVAL_ALREADY_PENDING") return "Ya hay una solicitud pendiente para esa operación.";
    if (code === "REVIEW_ALREADY_OPEN") return "Ya hay una revisión de accesos abierta.";
    if (code === "ROLE_ALREADY_PERMANENT") return "La persona ya tiene ese rol de forma permanente.";
    if (code === "INVITATION_OPEN") return "Ya hay una invitación abierta para ese correo.";
    if (code === "ALREADY_HAS_ROLE") return "Esa persona ya tiene ese rol.";
    if (code === "DUAL_APPROVAL_REQUIRED") return "Esta operación requiere doble aprobación: crea una solicitud.";
    if (error.status === 403) return "Tu sesión no tiene permiso para esta operación.";
    if (error.status === 404) return "No se encontró el registro.";
    return details?.message ?? error.message;
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

const post = <T,>(url: string, body?: unknown) => fetchApi<T>(url, { method: "POST", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const accessGovernanceApi = {
  listApprovals: (status?: ApprovalStatus) =>
    fetchApi<{ data: ApprovalRequest[]; meta: { total: number; dual_approval_required: boolean } }>(`/admin/approvals${status ? `?status=${status}` : ""}`),
  requestApproval: (input: { kind: ApprovalKind; target_id: string; reason: string; payload?: Record<string, unknown> }) =>
    post<{ data: ApprovalRequest }>("/admin/approvals", { payload: {}, ...input }),
  approve: (id: string, note?: string) => post<{ data: ApprovalRequest }>(`/admin/approvals/${id}/approve`, note ? { note } : {}),
  reject: (id: string, note: string) => post<{ data: ApprovalRequest }>(`/admin/approvals/${id}/reject`, { note }),
  cancelApproval: (id: string) => post<null>(`/admin/approvals/${id}/cancel`),

  listReviews: () => fetchApi<{ data: AccessReviewSummary[] }>("/admin/access-reviews"),
  openReview: () => post<{ data: AccessReview }>("/admin/access-reviews"),
  getReview: (id: string) => fetchApi<{ data: AccessReview }>(`/admin/access-reviews/${id}`),
  decideItem: (reviewId: string, itemId: string, decision: "keep" | "revoke", justification: string) =>
    post<{ data: { decision: string } }>(`/admin/access-reviews/${reviewId}/items/${itemId}/decide`, { decision, justification }),
  closeReview: (id: string) => post<null>(`/admin/access-reviews/${id}/close`),

  listStaffInvitations: () => fetchApi<{ data: StaffInvitation[] }>("/admin/staff-invitations"),
  inviteStaff: (email: string, role: "editor" | "moderator") => post<{ data: { email: string } }>("/admin/staff-invitations", { email, role }),
  revokeStaffInvitation: (id: string) => fetchApi<null>(`/admin/staff-invitations/${id}`, { method: "DELETE" }),

  listGrants: (userId?: string) => fetchApi<{ data: CapabilityGrant[] }>(`/admin/capability-grants${userId ? `?user_id=${userId}` : ""}`),
  grantCapability: (input: { user_id: string; capability: "catalog.manage" | "analytics.read"; reason: string; collections?: string[]; record_ids?: string[]; hours?: number }) =>
    post<{ data: { id: string } }>("/admin/capability-grants", input),
  revokeGrant: (id: string) => fetchApi<null>(`/admin/capability-grants/${id}`, { method: "DELETE" }),

  timeline: (userId: string) => fetchApi<{ data: AccessTimeline }>(`/admin/users/${userId}/access-timeline`),
  grantTemporaryRole: (userId: string, input: { role: string; hours: number; reason: string }) =>
    post<{ data: { role: string; expires_at: string } }>(`/admin/users/${userId}/roles/temporary`, input),
};

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
