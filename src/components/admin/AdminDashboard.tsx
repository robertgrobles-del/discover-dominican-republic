import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Hotel, UtensilsCrossed, MapPin, Waves, Calendar, Users,
  Eye, TrendingUp, Star, FileText, ShoppingBag, MessageCircle
} from "lucide-react";

interface StatCard {
  label: string;
  value: number;
  icon: typeof Hotel;
  color: string;
}

export function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
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
        destinations: counts[0].count || 0,
        hotels: counts[1].count || 0,
        restaurants: counts[2].count || 0,
        beaches: counts[3].count || 0,
        events: counts[4].count || 0,
        articles: counts[5].count || 0,
        reviews: counts[6].count || 0,
        posts: counts[7].count || 0,
        users: counts[8].count || 0,
        banners: counts[9].count || 0,
      };
    },
    staleTime: 60_000,
  });

  const { data: recentReviews } = useQuery({
    queryKey: ["admin-recent-reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
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
    { label: "Reseñas", value: stats?.reviews || 0, icon: Star, color: "text-yellow-500" },
    { label: "Posts Social", value: stats?.posts || 0, icon: MessageCircle, color: "text-pink-500" },
    { label: "Usuarios", value: stats?.users || 0, icon: Users, color: "text-teal-500" },
    { label: "Banners", value: stats?.banners || 0, icon: ShoppingBag, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

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
            {recentReviews?.map((r: any) => (
              <div key={r.id} className="flex items-start gap-2 text-sm">
                <div className="flex gap-0.5 shrink-0 mt-0.5">
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">por {r.author_name} · {r.category}</p>
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
            {recentArticles?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.category}</p>
                </div>
                <Badge variant={a.is_published ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {a.is_published ? "Publicado" : "Borrador"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
