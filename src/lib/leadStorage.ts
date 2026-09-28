/**
 * Almacenamiento y sincronización de leads, reclamos y altas de establecimientos.
 * Garantiza persistencia local offline (localStorage) y cola de sincronización.
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

const LEADS_STORAGE_KEY = "descubrerd_stored_leads";
const CLAIMS_STORAGE_KEY = "descubrerd_stored_claims";

export function saveLeadLocally(lead: Omit<StoredLead, "id" | "created_at" | "synced">): StoredLead {
  try {
    const existing: StoredLead[] = JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || "[]");
    const newLead: StoredLead = {
      ...lead,
      id: "lead-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
      synced: false,
    };
    existing.unshift(newLead);
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
    return newLead;
  } catch (e) {
    console.error("Error guardando lead localmente:", e);
    return {
      ...lead,
      id: "lead-" + Date.now(),
      created_at: new Date().toISOString(),
      synced: false,
    };
  }
}

export function saveClaimLocally(claim: Omit<StoredBusinessClaim, "id" | "created_at" | "status" | "synced">): StoredBusinessClaim {
  try {
    const existing: StoredBusinessClaim[] = JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || "[]");
    const newClaim: StoredBusinessClaim = {
      ...claim,
      id: "claim-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      status: "aprobado",
      created_at: new Date().toISOString(),
      synced: true,
    };
    existing.unshift(newClaim);
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
    return newClaim;
  } catch (e) {
    console.error("Error guardando reclamo localmente:", e);
    return {
      ...claim,
      id: "claim-" + Date.now(),
      status: "pendiente",
      created_at: new Date().toISOString(),
      synced: false,
    };
  }
}

export function getStoredLeads(): StoredLead[] {
  try {
    return JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getStoredClaims(): StoredBusinessClaim[] {
  try {
    return JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function updateClaimStatus(claimId: string, status: StoredBusinessClaim["status"]): boolean {
  try {
    const claims = getStoredClaims();
    const idx = claims.findIndex(c => c.id === claimId);
    if (idx !== -1) {
      claims[idx].status = status;
      localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error al actualizar estado del reclamo:", e);
    return false;
  }
}

/**
 * Auto-aprueba todas las solicitudes de negocios y reclamos pendientes
 */
export function autoApprovePendingClaims(): number {
  try {
    const claims = getStoredClaims();
    let approvedCount = 0;
    const updated = claims.map(c => {
      if (c.status === "pendiente" || c.status === "en_revision") {
        approvedCount++;
        return { ...c, status: "aprobado" as const, synced: true };
      }
      return c;
    });
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(updated));
    return approvedCount;
  } catch (e) {
    console.error("Error en auto-aprobación de reclamos:", e);
    return 0;
  }
}

