export interface VerificationAuditFilters {
  status?: "pending" | "approved" | "rejected" | "expired";
  businessType?: "hotel" | "restaurante" | "bar" | "operador" | "agencia" | "guia" | "otro";
  page: number;
  perPage: number;
}

export interface VerificationAuditPage { rows: unknown[]; total: number }
export interface VerificationAuditSubject { business_id: string; business_type: string }

/** Read projection consumed by recommendations; writes remain in the verification owner. */
export interface BusinessVerificationReaderPort {
  listApprovedBusinessIds(): Promise<string[]>;
}

/** Use-case boundary between the admin HTTP surface and the verification data owner. Decisions write their own audit trail atomically. */
export interface BusinessVerificationPort extends BusinessVerificationReaderPort {
  listAudits(filters: VerificationAuditFilters): Promise<VerificationAuditPage>;
  approveAudit(input: { id: string; actorId: string; notes: string; badgeNotes: string; expiresAt: string; ip?: string }): Promise<VerificationAuditSubject | null>;
  rejectAudit(input: { id: string; actorId: string; reason: string; ip?: string }): Promise<Pick<VerificationAuditSubject, "business_id"> | null>;
}
