import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

export interface CreatorProfile { id: string; handle: string; display_name: string; tier: string; total_views: number; total_earnings: number | string; balance_available: number | string; balance_pending: number | string; commission_rate: number | string; status: string }
export interface CreatorDashboard {
  profile: CreatorProfile;
  videos: Array<{ id: string; title: string; destination_name: string | null; views_count: number; status: string; created_at: string; moderation_rule?: string | null; review_notes?: string | null }>;
  payouts: Array<{ id: string; amount: number | string; status: string; created_at: string }>;
}

export const CREATOR_DASHBOARD_KEY = ["creator-dashboard"] as const;

/**
 * Panel privado del creador (`GET /creators/me`). `data` es null cuando la persona tiene sesión pero aún no se registró
 * como creadora (el backend responde 404); sin sesión la consulta no se hace.
 */
export function useCreatorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const query = useQuery({
    queryKey: [...CREATOR_DASHBOARD_KEY, user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      try { return (await fetchApi<{ data: CreatorDashboard }>("/creators/me")).data; }
      catch (error) { if (error instanceof HttpError && error.status === 404) return null; throw error; }
    },
  });
  return { ...query, user, loading: authLoading || (!!user && query.isLoading) };
}
