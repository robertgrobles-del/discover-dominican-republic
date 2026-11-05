import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { adminDashboardApi, type AdminRecentArticle, type AdminRecentReview } from "@/lib/adminDashboardApi";
import { adminListEntities } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Hotel, UtensilsCrossed, MapPin, Waves, Calendar, Users,
  Star, FileText, ShoppingBag, MessageCircle, AlertTriangle,
  ShieldCheck, MessageSquare, HelpCircle
} from "lucide-react";

interface StatCard {
  label: string;
  value: number;
  icon: typeof Hotel;
  color: string;
}

export function AdminDashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ["admin-dashboard-kpis"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        return await adminDashboardApi.getDashboard();
      }
      return null;
    },
    staleTime: 60_000,
    enabled: HAS_BACKEND_SESSION,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        const d = dashboardData ?? (await adminDashboardApi.getDashboard());
        const c = d?.content || {};
        const t = (d?.totals || {}) as Record<string, number>;
        return {
          destinations: c["destinations"]?.published ?? c["destinations"]?.active ?? 0,
          hotels: c["hotels"]?.published ?? c["hotels"]?.active ?? 0,
          restaurants: c["restaurants"]?.published ?? c["restaurants"]?.active ?? 0,
          beaches: c["beaches"]?.published ?? c["beaches"]?.active ?? 0,
          events: c["events"]?.published ?? c["events"]?.active ?? 0,
          articles: c["articles"]?.published ?? c["articles"]?.active ?? 0,
          reviews: t.reviews ?? 0,
          posts: t.posts ?? 0,
          users: d?.users?.active ?? 0,
          banners: t.banners ?? 0,
        };
      }

      const counts = await Promise.all([
        supabase.from("destinations").select("id", { count: "exact", head: true }),
        supabase.from("hotels").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("restaurants").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("beaches").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("social_posts").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("ad_banners").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      return {
        destinations: counts[0].count ?? 0,
        hotels: counts[1].count ?? 0,
        restaurants: counts[2].count ?? 0,
        beaches: counts[3].count ?? 0,
        events: counts[4].count ?? 0,
        articles: counts[5].count ?? 0,
        reviews: counts[6].count ?? 0,
        posts: counts[7].count ?? 0,
        users: counts[8].count ?? 0,
        banners: counts[9].count ?? 0,
      };
    },
    staleTime: 60_000,
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ["admin-low-stock-alert"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        const res = await adminListEntities<{ id: string; title: string; stock_quantity?: number; stock?: number }>("reward_inventory", { limit: 50 });
        return (res.data || [])
          .map((r) => ({
            id: r.id,
            title: r.title,
            stock_quantity: r.stock_quantity ?? r.stock ?? 0,
          }))
          .filter((r) => r.stock_quantity <= 5);
      }
      const { data } = await (supabase as any)
        .from("reward_inventory")
        .select("id, title, stock_quantity")
        .lte("stock_quantity", 5)
        .order("stock_quantity", { ascending: true })
        .limit(5);
      return data || [];
    },
    staleTime: 30_000,
  });

  const { data: recentReviews } = useQuery({
    queryKey: ["admin-recent-reviews"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        return await adminDashboardApi.getPendingReviews(5);
      }
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        return await adminDashboardApi.getRecentArticles(5);
      }
      const { data } = await supabase.from("articles").select("id, title, is_published, created_at, category").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const statCards: StatCard[] = [
    { label: "Destinos", value: stats?.destinations || 0, icon: MapPin, color: "text-green-500" },
    { label: "Hoteles", value: stats?.hotels || 0, icon: Hotel, color: "text-indigo-500" },
    { label: "Restaurantes", value: stats?.restaurants || 0, icon: UtensilsCrossed, color: "text-amber-500" },
    { label: "Playas", value: stats?.beaches || 0, icon: Waves, color: "text-cyan-500" },
    { label: "Eventos", value: stats?.events || 0, icon: Calendar, color: "text-purple-500" },
    { label: "Artículos", value: stats?.articles || 0, icon: FileText, color: "text-blue-500" },
    { label: "Reseñas", value: HAS_BACKEND_SESSION ? (dashboardData?.totals?.reviews ?? 0) : (stats?.reviews || 0), icon: Star, color: "text-yellow-500" },
    { label: "Posts Social", value: HAS_BACKEND_SESSION ? (dashboardData?.totals?.posts ?? 0) : (stats?.posts || 0), icon: MessageCircle, color: "text-pink-500" },
    { label: "Usuarios", value: stats?.users || 0, icon: Users, color: "text-teal-500" },
    { label: "Banners Activos", value: HAS_BACKEND_SESSION ? (dashboardData?.totals?.banners ?? 0) : (stats?.banners || 0), icon: ShoppingBag, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* ERP Master Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-border hover:shadow-sm transition-all rounded-xl">
            <CardContent className="p-3.5 flex flex-col items-center text-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">{s.value.toLocaleString()}</span>
              <span className="text-2xs font-medium text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas de Moderación y Operaciones Pendientes (GET /admin/dashboard) */}
      {HAS_BACKEND_SESSION && dashboardData?.pending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold">Reseñas Pendientes</p>
                  <p className="text-2xs text-muted-foreground">Esperando moderación</p>
                </div>
              </div>
              <Badge variant={dashboardData.pending.reviews > 0 ? "destructive" : "secondary"}>
                {dashboardData.pending.reviews}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-rose-500/30 bg-rose-500/5">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-xs font-semibold">Reportes UGC</p>
                  <p className="text-2xs text-muted-foreground">Contenido reportado</p>
                </div>
              </div>
              <Badge variant={dashboardData.pending.ugc_reports > 0 ? "destructive" : "secondary"}>
                {dashboardData.pending.ugc_reports}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold">Tickets de Soporte</p>
                  <p className="text-2xs text-muted-foreground">Casos abiertos</p>
                </div>
              </div>
              <Badge variant={dashboardData.pending.support_tickets > 0 ? "default" : "secondary"}>
                {dashboardData.pending.support_tickets}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold">Operadores por Verificar</p>
                  <p className="text-2xs text-muted-foreground">Solicitudes de alta</p>
                </div>
              </div>
              <Badge variant={dashboardData.pending.operators_to_verify > 0 ? "default" : "secondary"}>
                {dashboardData.pending.operators_to_verify}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Stock Alert Banner */}
      {((HAS_BACKEND_SESSION && (dashboardData?.totals?.low_stock_rewards ?? 0) > 0) || (!HAS_BACKEND_SESSION && lowStockItems && lowStockItems.length > 0)) && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Alerta de Stock Crítico en Recompensas</p>
                <p className="text-xs text-muted-foreground">
                  {HAS_BACKEND_SESSION 
                    ? `${dashboardData?.totals?.low_stock_rewards} ítems del inventario están en su nivel mínimo o agotados.`
                    : lowStockItems.map((item: any) => `${item.title} (${item.stock_quantity} disp.)`).join(" • ")
                  }
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-500/20 font-mono text-xs">
              {lowStockItems.length} artículos en riesgo
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Reseñas recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReviews?.length === 0 && <p className="text-sm text-muted-foreground">Sin reseñas aún</p>}
            {recentReviews?.map((r: AdminRecentReview) => (
              <div key={r.id} className="flex items-start gap-2 text-sm">
                <div className="flex gap-0.5 shrink-0 mt-0.5">
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.title || "Reseña de usuario"}</p>
                  <p className="text-xs text-muted-foreground">por {r.author_name || "Viajero"} · {r.target_type}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Artículos recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentArticles?.length === 0 && <p className="text-sm text-muted-foreground">Sin artículos aún</p>}
            {recentArticles?.map((a: AdminRecentArticle & { is_published?: boolean }) => {
              const isPub = a.status === "published" || Boolean(a.is_published);
              return (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.category || "Editorial"}</p>
                  </div>
                  <Badge variant={isPub ? "default" : "secondary"} className="text-3xs shrink-0">
                    {isPub ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
