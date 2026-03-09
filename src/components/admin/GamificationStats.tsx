import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Gift, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function GamificationStats() {
  // Obtener conteos
  const { data: counts } = useQuery({
    queryKey: ["gamification-counts"],
    queryFn: async () => {
      const [achievements, missions, prizes, routes, seasons] = await Promise.all([
        supabase.from("achievements").select("id", { count: "exact", head: true }),
        supabase.from("gamification_missions").select("id", { count: "exact", head: true }),
        supabase.from("gamification_prizes").select("id", { count: "exact", head: true }),
        supabase.from("gamified_routes").select("id", { count: "exact", head: true }),
        supabase.from("gamification_seasons").select("id", { count: "exact", head: true }),
      ]);

      return {
        achievements: achievements.count || 0,
        missions: missions.count || 0,
        prizes: prizes.count || 0,
        routes: routes.count || 0,
        seasons: seasons.count || 0,
      };
    },
  });

  // Distribución de logros por rareza
  const { data: achievementsByRarity } = useQuery({
    queryKey: ["achievements-by-rarity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("achievements")
        .select("rarity")
        .eq("is_active", true);

      const distribution = data?.reduce((acc: Record<string, number>, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution || {}).map(([name, value]) => ({ name, value }));
    },
  });

  // Misiones por tipo
  const { data: missionsByType } = useQuery({
    queryKey: ["missions-by-type"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gamification_missions")
        .select("mission_type")
        .eq("is_active", true);

      const distribution = data?.reduce((acc: Record<string, number>, item) => {
        acc[item.mission_type] = (acc[item.mission_type] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution || {}).map(([name, value]) => ({ name, value }));
    },
  });

  // Top usuarios por XP
  const { data: topUsers } = useQuery({
    queryKey: ["top-users-xp"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, total_xp, level")
        .order("total_xp", { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  // Canjes recientes de premios
  const { data: recentRedemptions } = useQuery({
    queryKey: ["recent-redemptions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_prize_redemptions")
        .select(`
          id,
          coins_spent,
          status,
          redeemed_at,
          prize_id
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{counts?.achievements || 0}</span>
            <span className="text-xs text-muted-foreground">Logros</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Target className="h-6 w-6 text-accent-foreground" />
            <span className="text-2xl font-bold">{counts?.missions || 0}</span>
            <span className="text-xs text-muted-foreground">Misiones</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Gift className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{counts?.prizes || 0}</span>
            <span className="text-xs text-muted-foreground">Premios</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <TrendingUp className="h-6 w-6 text-accent-foreground" />
            <span className="text-2xl font-bold">{counts?.routes || 0}</span>
            <span className="text-xs text-muted-foreground">Rutas</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{counts?.seasons || 0}</span>
            <span className="text-xs text-muted-foreground">Temporadas</span>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y datos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribución de logros por rareza */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribución de Logros por Rareza</CardTitle>
          </CardHeader>
          <CardContent>
            {achievementsByRarity && achievementsByRarity.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={achievementsByRarity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {achievementsByRarity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay datos disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* Misiones por tipo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Misiones por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {missionsByType && missionsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={missionsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay datos disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top usuarios */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top Jugadores por XP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUsers && topUsers.length > 0 ? (
              topUsers.map((user: any, index: number) => (
                <div key={user.id || index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{user.display_name || "Usuario"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Nivel {user.level || 1}</span>
                    <span className="font-bold text-primary">{user.total_xp || 0} XP</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Canjes recientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-500" />
              Canjes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRedemptions && recentRedemptions.length > 0 ? (
              recentRedemptions.map((redemption: any) => (
                <div key={redemption.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Premio #{redemption.prize_id?.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {redemption.coins_spent} monedas
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      redemption.status === "completed"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : redemption.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {redemption.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay canjes recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
