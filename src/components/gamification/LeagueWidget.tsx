import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trophy, Clock, ChevronRight, Crown, TrendingUp, Flame, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const LEAGUE_CONFIG: Record<string, { icon: string; color: string; gradient: string; glow: string }> = {
  bronze:   { icon: "🥉", color: "text-amber-700", gradient: "from-amber-700/20 to-amber-600/10", glow: "shadow-amber-700/20" },
  silver:   { icon: "🥈", color: "text-gray-400",  gradient: "from-gray-400/20 to-gray-300/10",  glow: "shadow-gray-400/20" },
  gold:     { icon: "🥇", color: "text-amber-400", gradient: "from-amber-400/25 to-yellow-300/10", glow: "shadow-amber-400/30" },
  platinum: { icon: "💎", color: "text-cyan-400",  gradient: "from-cyan-400/20 to-cyan-300/10",  glow: "shadow-cyan-400/20" },
  diamond:  { icon: "👑", color: "text-purple-400", gradient: "from-purple-400/25 to-violet-300/10", glow: "shadow-purple-400/30" },
};

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp_season: number;
  league_slug: string;
  level_icon: string;
  missions: number;
}

interface Season {
  id: string;
  name: string;
  ends_at: string;
  top_rewards: Array<{ rank: string | number; prize: string; icon: string; coins: number }>;
}

function useTimeUntil(dateStr: string) {
  const end = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours, ended: diff <= 0 };
}

export function LeagueWidget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"league" | "season">("league");

  const { data: season } = useQuery<Season>({
    queryKey: ["active-season"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gamification_seasons" as any)
        .select("*")
        .eq("is_active", true)
        .single();
      return data as Season;
    },
    staleTime: 300_000,
  });

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["season-leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_season_leaderboard" as any, { p_limit: 10 });
      return (data || []) as LeaderboardEntry[];
    },
    staleTime: 60_000,
  });

  const { data: myStats } = useQuery({
    queryKey: ["my-league-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_league_stats" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("season_id", season?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!season,
    staleTime: 60_000,
  });

  const seasonEnd = useTimeUntil(season?.ends_at || new Date(Date.now() + 86400000 * 30).toISOString());
  const myLeague = (myStats as any)?.league_slug || "bronze";
  const myLCfg = LEAGUE_CONFIG[myLeague] || LEAGUE_CONFIG.bronze;
  const myRank = leaderboard.findIndex(e => e.user_id === user?.id) + 1;
  const myEntry = leaderboard.find(e => e.user_id === user?.id);

  const leagues = Object.entries(LEAGUE_CONFIG);

  return (
    <div className={`rounded-2xl border border-border overflow-hidden bg-gradient-to-br ${myLCfg.gradient} shadow-xl ${myLCfg.glow}`}>
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{myLCfg.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Liga actual</p>
              <p className={`font-bold text-base capitalize ${myLCfg.color}`}>{myLeague}</p>
            </div>
          </div>
          {myRank > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tu posición</p>
              <p className={`text-2xl font-black ${myLCfg.color}`}>#{myRank}</p>
            </div>
          )}
        </div>

        {/* Season countdown */}
        {season && !seasonEnd.ended && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Temporada termina en <strong>{seasonEnd.days}d {seasonEnd.hours}h</strong></span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        {[
          { id: "league" as const, label: "Liga", icon: <Crown className="h-3 w-3" /> },
          { id: "season" as const, label: "Temporada", icon: <Trophy className="h-3 w-3" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "league" && (
          <div className="space-y-2">
            {/* League progression visual */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              {leagues.map(([slug, cfg]) => (
                <div
                  key={slug}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs transition-all ${
                    slug === myLeague
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border/50 bg-card/50 opacity-60"
                  }`}
                >
                  <span className="text-lg">{cfg.icon}</span>
                  <span className={`font-semibold capitalize ${slug === myLeague ? cfg.color : "text-muted-foreground"}`}>
                    {slug}
                  </span>
                </div>
              ))}
            </div>

            {/* Top 5 leaderboard */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Clasificación</p>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)
              : leaderboard.slice(0, 5).map((entry, idx) => {
                  const isMe = entry.user_id === user?.id;
                  const lCfg = LEAGUE_CONFIG[entry.league_slug] || LEAGUE_CONFIG.bronze;
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                        isMe ? "bg-primary/10 border border-primary/30" : "bg-card/50 hover:bg-card"
                      }`}
                    >
                      <span className={`w-6 text-center font-black text-sm ${idx < 3 ? lCfg.color : "text-muted-foreground"}`}>
                        #{idx + 1}
                      </span>
                      <span className="text-lg flex-shrink-0">{entry.level_icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {entry.display_name} {isMe && <Badge className="text-[9px] bg-primary text-primary-foreground ml-1">Tú</Badge>}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{lCfg.icon} {entry.league_slug}</p>
                      </div>
                      <p className="text-xs font-bold text-foreground">{entry.xp_season.toLocaleString()} <span className="text-muted-foreground font-normal">XP</span></p>
                    </motion.div>
                  );
                })
            }
          </div>
        )}

        {activeTab === "season" && (
          <div>
            <p className="text-sm font-bold text-foreground mb-1">{season?.name || "Temporada Activa"}</p>
            <p className="text-xs text-muted-foreground mb-4">Termina en {seasonEnd.days}d {seasonEnd.hours}h</p>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Premios de Temporada</p>
              {(season?.top_rewards || []).map((reward, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/50">
                  <span className="text-xl flex-shrink-0">{reward.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">Top {reward.rank}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{reward.prize}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-500 flex-shrink-0">🪙 {reward.coins}</span>
                </div>
              ))}
            </div>

            {myEntry && (
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Tu XP de temporada</p>
                <p className="text-2xl font-black text-primary">{myEntry.xp_season.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Posición #{myRank} en la temporada</p>
              </div>
            )}

            <Button asChild size="sm" className="w-full mt-4 gap-2" variant="outline">
              <Link to="/gamificacion-turistica?tab=ranking">
                <TrendingUp className="h-3.5 w-3.5" /> Ver ranking completo
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
