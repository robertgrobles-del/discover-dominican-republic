import { useCallback, useEffect, useMemo, useState } from "react";
import type { AccessSpace } from "@/lib/capabilities";

/**
 * Espacio activo de una cuenta multi-perfil (Plan de accesos y paneles por perfil, puntos 43 y 78).
 *
 * Una misma cuenta puede ser viajero, empresa, creador y embajador a la vez. El espacio activo es solo
 * contexto de interfaz: se conserva durante la sesión (y entre recargas) para no perder dónde estaba la
 * persona, pero **no concede ni quita permisos**: cada panel y cada endpoint vuelven a comprobar el acceso
 * contra el servidor. La organización activa se conserva por separado, porque la membresía es lo que
 * autoriza dentro del panel de empresa.
 */

const SPACE_KEY = "dr_active_space";
const ORG_KEY = "dr_active_org";

export interface OrganizationContext {
  id: string;
  name: string | null;
  role: string;
}

function readStored(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeStored(key: string, value: string | null): void {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* almacenamiento no disponible */ }
}

/** Lee las organizaciones del contexto del espacio de empresa sin confiar en la forma del JSON. */
export function organizationsOf(space: AccessSpace | undefined): { organizations: OrganizationContext[]; requiresChoice: boolean } {
  const ctx = space?.context as { organizations?: unknown; requires_choice?: unknown } | null | undefined;
  const list = Array.isArray(ctx?.organizations) ? ctx!.organizations : [];
  const organizations = list.flatMap((item) => {
    const o = item as { id?: unknown; name?: unknown; role?: unknown };
    if (typeof o?.id !== "string") return [];
    return [{ id: o.id, name: typeof o.name === "string" ? o.name : null, role: typeof o.role === "string" ? o.role : "miembro" }];
  });
  return { organizations, requiresChoice: ctx?.requires_choice === true || organizations.length > 1 };
}

export interface UseActiveSpaceResult {
  spaces: AccessSpace[];
  active: AccessSpace | null;
  activeKey: string | null;
  setActiveSpace: (key: string) => void;
  organizations: OrganizationContext[];
  activeOrg: OrganizationContext | null;
  setActiveOrg: (id: string) => void;
  requiresChoice: boolean;
  /** Texto corto del contexto activo, para el indicador persistente. */
  contextLabel: string;
}

export function useActiveSpace(spaces: AccessSpace[]): UseActiveSpaceResult {
  const [activeKey, setActiveKey] = useState<string | null>(() => readStored(SPACE_KEY));
  const [activeOrgId, setActiveOrgId] = useState<string | null>(() => readStored(ORG_KEY));

  // El espacio guardado puede haber dejado de existir (se retiró la membresía, se suspendió el perfil de
  // creador): en ese caso se cae al primer espacio disponible en lugar de mostrar un contexto fantasma.
  useEffect(() => {
    if (spaces.length === 0) return;
    if (activeKey && spaces.some((s) => s.key === activeKey)) return;
    const first = spaces[0];
    setActiveKey(first.key);
    writeStored(SPACE_KEY, first.key);
  }, [spaces, activeKey]);

  const active = useMemo(() => spaces.find((s) => s.key === activeKey) ?? spaces[0] ?? null, [spaces, activeKey]);
  const { organizations, requiresChoice } = useMemo(() => organizationsOf(active), [active]);

  useEffect(() => {
    if (organizations.length === 0) { setActiveOrgId(null); return; }
    if (activeOrgId && organizations.some((o) => o.id === activeOrgId)) return;
    setActiveOrgId(organizations[0].id);
    writeStored(ORG_KEY, organizations[0].id);
  }, [organizations, activeOrgId]);

  const setActiveSpace = useCallback((key: string) => {
    setActiveKey(key);
    writeStored(SPACE_KEY, key);
  }, []);

  const setActiveOrg = useCallback((id: string) => {
    setActiveOrgId(id);
    writeStored(ORG_KEY, id);
  }, []);

  const activeOrg = organizations.find((o) => o.id === activeOrgId) ?? organizations[0] ?? null;
  const contextLabel = active
    ? [active.label, activeOrg?.name ?? null].filter(Boolean).join(" · ")
    : "";

  return { spaces, active, activeKey: active?.key ?? null, setActiveSpace, organizations, activeOrg, setActiveOrg, requiresChoice, contextLabel };
}
