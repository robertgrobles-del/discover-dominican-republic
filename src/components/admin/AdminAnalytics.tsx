import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Eye, MousePointer, Calendar, MapPin, Heart, Star, FileText, Building2 } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

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
        { name: "Establecimientos", table: "establecimientos" as const },
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
        .limit(200);
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
      const { count: totalEstablecimientos } = await supabase.from("establecimientos").select("id", { count: "exact", head: true });
      return {
        users: totalUsers || 0,
        reviews: totalReviews || 0,
        favorites: totalFavs || 0,
        posts: totalPosts || 0,
        establecimientos: totalEstablecimientos || 0,
      };
    },
    staleTime: 60_000,
  });

  // Page views over last 7 days
  const { data: pageViews } = useQuery({
    queryKey: ["admin-page-views-7d"],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data } = await supabase
        .from("analytics_events")
        .select("created_at, event_type, page")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true })
        .limit(1000);
      if (!data) return { daily: [], topPages: [], totalViews: 0, uniqueSessions: 0 };

      // Group by day
      const dayMap: Record<string, number> = {};
      const pageMap: Record<string, number> = {};
      const sessions = new Set<string>();

      for (let i = 6; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "dd MMM", { locale: es });
        dayMap[day] = 0;
      }

      data.forEach((e) => {
        const day = format(new Date(e.created_at), "dd MMM", { locale: es });
        if (dayMap[day] !== undefined) dayMap[day]++;
        else dayMap[day] = 1;

        if (e.page) {
          const pageName = e.page === "/" ? "Inicio" : e.page.replace(/^\//, "").split("/")[0];
          pageMap[pageName] = (pageMap[pageName] || 0) + 1;
        }
      });

      const topPages = Object.entries(pageMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, views]) => ({ name, views }));

      return {
        daily: Object.entries(dayMap).map(([name, views]) => ({ name, views })),
        topPages,
        totalViews: data.length,
        uniqueSessions: sessions.size,
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

  const totalContent = entityCounts?.reduce((sum, e) => sum + e.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <div className="p-2 rounded-lg bg-accent/50">
              <Eye className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pageViews?.totalViews || 0}</p>
              <p className="text-xs text-muted-foreground">Visitas 7d</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Calendar className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentReservations?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Reservas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
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
              <Star className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userStats?.reviews || 0}</p>
              <p className="text-xs text-muted-foreground">Reseñas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Building2 className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalContent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Contenido total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart + Top Pages */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" /> Tráfico últimos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={pageViews?.daily || []}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Páginas más visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(pageViews?.topPages || []).map((page, i) => (
                <div key={page.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-sm capitalize truncate max-w-[140px]">{page.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{page.views}</Badge>
                </div>
              ))}
              {(!pageViews?.topPages || pageViews.topPages.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin datos de tráfico aún</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content + Reservations Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Contenido por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={entityCounts || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={60} />
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
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Reservas por estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReservations?.byStatus && recentReservations.byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={recentReservations.byStatus.map((s) => ({ ...s, name: statusLabels[s.name] || s.name }))}
                    cx="50%" cy="50%"
                    outerRadius={100}
                    innerRadius={50}
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
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" /> Actividad de usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Usuarios registrados", value: userStats?.users || 0, icon: Users },
              { label: "Reseñas publicadas", value: userStats?.reviews || 0, icon: Star },
              { label: "Favoritos guardados", value: userStats?.favorites || 0, icon: Heart },
              { label: "Posts sociales", value: userStats?.posts || 0, icon: FileText },
              { label: "Establecimientos", value: userStats?.establecimientos || 0, icon: Building2 },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-lg bg-secondary/50">
                <item.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{item.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
