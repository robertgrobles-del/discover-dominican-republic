import { createContext, useContext } from "react";
import { useBookings } from "../api";
import type { PanelRole } from "../permissions";
import type { OperatorOrg } from "../types";

interface OrgContextValue {
  org: OperatorOrg;
  refetchOrg: () => void;
  role: PanelRole;
  readOnly: boolean; // los guías solo consultan
  scopeListingIds?: string[]; // guías: solo estas excursiones
}

export const OrgContext = createContext<OrgContextValue | null>(null);

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg debe usarse dentro del panel de operador");
  return ctx;
}

/** Reservas visibles para el rol actual (los guías solo ven sus excursiones asignadas). */
export function useScopedBookings() {
  const { org, scopeListingIds } = useOrg();
  const q = useBookings(org.id);
  const data = scopeListingIds ? (q.data || []).filter((b) => scopeListingIds.includes(b.listing_id)) : q.data;
  return { ...q, data };
}
