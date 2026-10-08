import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente para las estadísticas globales de gamificación en el backend (/api/v1/admin/gamification/stats)
 */

export interface AdminGamificationStatsData {
  players: number;
  active_7d: number;
  xp_issued_30d: number;
  coins_issued_30d: number;
  redemptions: {
    total: number;
    pending_shipments: number;
  };
  flagged_users: number;
  levels: Array<{
    level: number;
    players: number;
  }>;
}

export const adminGamificationStatsApi = {
  /** Obtiene las estadísticas agregadas de jugadores, XP, monedas y niveles */
  async getStats(): Promise<AdminGamificationStatsData> {
    const res = await fetchApi<{ data: AdminGamificationStatsData }>("/admin/gamification/stats");
    return res.data;
  },
};
