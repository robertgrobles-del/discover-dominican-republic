import { createContext, useContext } from "react";
import type { OperatorOrg } from "../types";

interface OrgContextValue {
  org: OperatorOrg;
  refetchOrg: () => void;
}

export const OrgContext = createContext<OrgContextValue | null>(null);

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg debe usarse dentro del panel de operador");
  return ctx;
}
