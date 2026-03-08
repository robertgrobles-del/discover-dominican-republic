import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, Users, Eye, MousePointer, Calendar } from "lucide-react";

const COLORS = [
  "hsl(193, 86%, 50%)", "hsl(45, 93%, 58%)", "hsl(160, 84%, 39%)",
  "hsl(0, 84%, 60%)", "hsl(270, 70%, 60%)", "hsl(30, 90%, 55%)"
];

export function AdminAnalytics() {
  const { data: entityCounts } = useQuery({
    queryKey: ["admin-entity-counts"],
    queryFn: async () => {
      const tables = [
        { name: "Destinos", table: "destinations" as const },
        { name: "Hoteles", table: "hotels" as const },
        { name: "Restaurantes", table: "restaurants" as const },
        { name: "Playas", table: "beaches" as const },
        { name: "Experiencias", table: "experiences" as const },
        { name: "Eventos", table: "events" as const },
        { name: "Tours", table: "tour_packages" as const },
        { name: "Bares", table: "bars" as const },
      ];
      const results = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t.table).select("id", { count: "exact", head: true });
          return { name: t.name, count: count || 0 };
        })
      );
      return results;
    },
    staleTime: 120_000,
  });

  const { data: recentReservations } = useQuery({
    queryKey: ["admin-reservations-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reservations")
        .select("status, created_at, total_price")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!data) return { byStatus: [], total: 0, revenue: 0 };
      const statusMap: Record<string, number> = {};
      let revenue = 0;
      data.forEach((r) => {
        statusMap[r.status || "pending"] = (statusMap[r.status || "pending"] || 0) + 1;
        if (r.status === "confirmed" || r.status === "completed") revenue += Number(r.total_price || 0);
      });
      return {
        byStatus: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
        total: data.length,
        revenue,
      };
    },
    staleTime: 60_000,
  });

  const { data: userStats } = useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: async () => {
      const { count: totalUsers } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      const { count: totalReviews } = await supabase.from("reviews").select("id", { count: "exact", head: true });
      const { count: totalFavs } = await supabase.from("favorites").select("id", { count: "exact", head: true });
      const { count: totalPosts } = await supabase.from("social_posts").select("id", { count: "exact", head: true });
      return {
        users: totalUsers || 0,
        reviews: totalReviews || 0,
        favorites: totalFavs || 0,
        posts: totalPosts || 0,
      };
    },
    staleTime: 60_000,
  });

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userStats?.users || 0}</p>
              <p className="text-xs text-muted-foreground">Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--gold))]/10">
              <Calendar className="h-5 w-5 text-[hsl(var(--gold))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentReservations?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Reservas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--emerald))]/10">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--emerald))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">${(recentReservations?.revenue || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Ingresos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <MousePointer className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userStats?.reviews || 0}</p>
              <p className="text-xs text-muted-foreground">Reseñas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contenido por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={entityCounts || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reservas por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReservations?.byStatus && recentReservations.byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={recentReservations.byStatus.map((s) => ({ ...s, name: statusLabels[s.name] || s.name }))}
                    cx="50%" cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {recentReservations.byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                Sin reservas aún
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User engagement */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividad de usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Usuarios registrados", value: userStats?.users || 0 },
              { label: "Reseñas publicadas", value: userStats?.reviews || 0 },
              { label: "Favoritos guardados", value: userStats?.favorites || 0 },
              { label: "Posts sociales", value: userStats?.posts || 0 },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
