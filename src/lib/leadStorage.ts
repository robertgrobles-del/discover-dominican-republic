/**
 * Memoria temporal de formularios mock durante la sesión actual.
 * No guardar datos personales de leads/reclamos en localStorage: el backend debe
 * ser el almacenamiento duradero y aplicar autorización/retención.
 */
export interface StoredLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  interest?: string;
  budget?: string;
  message?: string;
  source: string;
  created_at: string;
  synced: boolean;
}

export interface StoredBusinessClaim {
  id: string;
  business_name: string;
  business_type: string;
  business_id?: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  role: string;
  mitur_license?: string | null;
  rnc?: string | null;
  notes?: string | null;
  status: "pendiente" | "en_revision" | "aprobado" | "rechazado";
  created_at: string;
  synced: boolean;
}

const leads: StoredLead[] = [];
const claims: StoredBusinessClaim[] = [];
// Remove legacy browser copies that may contain names, contact details or tax IDs.
try {
  localStorage.removeItem("descubrerd_stored_leads");
  localStorage.removeItem("descubrerd_stored_claims");
} catch {
  // Storage can be unavailable (private mode / restricted browser context).
}
const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`;

export function saveLeadLocally(lead: Omit<StoredLead, "id" | "created_at" | "synced">): StoredLead {
  const saved = { ...lead, id: makeId("lead"), created_at: new Date().toISOString(), synced: false };
  leads.unshift(saved);
  leads.length = Math.min(leads.length, 100);
  return saved;
}

export function saveClaimLocally(claim: Omit<StoredBusinessClaim, "id" | "created_at" | "status" | "synced">): StoredBusinessClaim {
  const saved: StoredBusinessClaim = {
    ...claim,
    id: makeId("claim"),
    status: "pendiente",
    created_at: new Date().toISOString(),
    synced: false,
  };
  claims.unshift(saved);
  claims.length = Math.min(claims.length, 100);
  return saved;
}

export function getStoredLeads(): StoredLead[] {
  return [...leads];
}

export function getStoredClaims(): StoredBusinessClaim[] {
  return [...claims];
}

export function updateClaimStatus(claimId: string, status: StoredBusinessClaim["status"]): boolean {
  const claim = claims.find((item) => item.id === claimId);
  if (!claim) return false;
  claim.status = status;
  return true;
}

/** Mock temporal: las aprobaciones masivas requieren flujo backend y auditoría. */
export function autoApprovePendingClaims(): number {
  return 0;
}
