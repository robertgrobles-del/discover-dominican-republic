import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Zap, Crown, Compass, Calendar, Target, Award } from "lucide-react";

interface SocialActivity {
  id: string;
  xp_amount: number | null;
  coin_amount: number | null;
  description: string | null;
  source_type: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function SocialFeed() {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalActivity = async () => {
      try {
        const { data, error } = await supabase
          .from("gamification_transactions")
          .select(`
            id,
            xp_amount,
            coin_amount,
            description,
            source_type,
            created_at,
            user_id,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) setActivities(data as unknown as SocialActivity[]);
      } catch (error) {
        console.error("Error fetching global activity feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalActivity();
  }, []);

  const getSourceIcon = (source: string | null) => {
    switch (source) {
      case "province_visit":
        return <Compass className="h-3.5 w-3.5 text-blue-500" />;
      case "mission":
        return <Target className="h-3.5 w-3.5 text-emerald-500" />;
      case "daily_checkin":
        return <Calendar className="h-3.5 w-3.5 text-orange-500" />;
      case "achievement":
        return <Award className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Zap className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-border rounded-xl">
        <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No hay actividad social reciente en la plataforma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {activities.map((act, i) => {
          const name = act.profiles?.display_name || "Viajero Anónimo";
          const avatar = act.profiles?.avatar_url;
          const initials = name.substring(0, 2).toUpperCase();
          
          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/20 transition-all group"
            >
              <Link to={`/explorador/${act.user_id}`} className="shrink-0">
                <Avatar className="h-9 w-9 border border-border group-hover:border-primary/30 transition-all">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link 
                    to={`/explorador/${act.user_id}`}
                    className="font-bold text-xs text-foreground hover:text-primary truncate block"
                  >
                    {name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {getFormattedDate(act.created_at)}
                  </span>
                </div>
                
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {act.description || "Completó una acción en Descubre RD"}
                </p>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center justify-center p-1 rounded-md bg-muted shrink-0" aria-hidden="true" role="presentation">
                    {getSourceIcon(act.source_type)}
                  </span>
                  {act.xp_amount && act.xp_amount > 0 && (
                    <Badge variant="secondary" className="text-[9px] font-medium px-1.5 py-0 bg-amber-500/10 text-amber-600 border-none">
                      <Zap className="h-2.5 w-2.5 mr-0.5" /> +{act.xp_amount} XP
                    </Badge>
                  )}
                  {act.coin_amount && act.coin_amount > 0 && (
                    <Badge variant="secondary" className="text-[9px] font-medium px-1.5 py-0 bg-primary/10 text-primary border-none">
                      <Crown className="h-2.5 w-2.5 mr-0.5" /> +{act.coin_amount}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
