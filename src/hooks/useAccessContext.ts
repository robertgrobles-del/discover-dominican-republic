import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import {
  EMPTY_ACCESS_CONTEXT,
  loadAccessContext,
  type AccessContext,
  type AccessSpace,
  type CapabilityGrant,
} from "@/lib/capabilities";

/**
 * Contexto de acceso del usuario autenticado (puntos 43, 55, 58, 66 y 78).
 *
 * Devuelve los espacios disponibles, las capacidades efectivas y si la sesión es de soporte en modo
 * lectura. La navegación y los paneles se construyen a partir de esto, nunca de un booleano local.
 */
export interface UseAccessContextResult {
  context: AccessContext;
  spaces: AccessSpace[];
  capabilities: CapabilityGrant[];
  loading: boolean;
  /** `true` cuando los permisos provienen del contexto de demostración (datos simulados). */
  demo: boolean;
  can: (capabilityKey: string) => boolean;
  hasSpace: (spaceKey: string) => boolean;
  refetch: () => void;
}

export function useAccessContext(): UseAccessContextResult {
  const { user, session, loading: authLoading } = useAuth();
  const token = session?.access_token ?? null;
  const query = useQuery({
    queryKey: ["access-context", user?.id ?? "anon", token ? "auth" : "no-auth"],
    queryFn: () => loadAccessContext(token),
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5,
  });

  const context = query.data ?? EMPTY_ACCESS_CONTEXT;
  const capabilities = useMemo(() => context.capabilities, [context]);
  const spaces = useMemo(() => context.spaces.filter((s) => s.available), [context]);

  return {
    context,
    spaces,
    capabilities,
    loading: authLoading || query.isLoading,
    demo: context.demo || IS_MOCK_DATA,
    can: (key: string) => capabilities.some((c) => c.key === key),
    hasSpace: (key: string) => spaces.some((s) => s.key === key),
    refetch: () => { void query.refetch(); },
  };
}
