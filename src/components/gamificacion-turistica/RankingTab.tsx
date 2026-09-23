import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  level_icon: string;
  level_title: string;
  total_xp: number;
  total_missions_completed: number;
}

interface RankingTabProps {
  user: { id: string } | null | undefined;
  regions: string[];
  activeRankingRegion: string;
  onActiveRankingRegionChange: (region: string) => void;
  loadingLeaderboard: boolean;
  localLeaderboard: LeaderboardEntry[];
}

export function RankingTab({
  user, regions, activeRankingRegion, onActiveRankingRegionChange, loadingLeaderboard, localLeaderboard,
}: RankingTabProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Ranking de Exploradores</h2>
        <p className="text-muted-foreground">Los mejores descubridores de República Dominicana</p>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 justify-center">
        {regions.map(r => (
          <Button
            key={r}
            variant={activeRankingRegion === r ? "default" : "outline"}
            size="sm"
            className="rounded-full flex-shrink-0"
            onClick={() => onActiveRankingRegionChange(r)}
          >
            {r === "all" ? "🗺️ Todas las Regiones" : r}
          </Button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loadingLeaderboard && localLeaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8 items-end">
          {[localLeaderboard[1], localLeaderboard[0], localLeaderboard[2]].map((entry, idx) => {
            const positions = [2, 1, 3];
            const pos = positions[idx];
            const heights = ["h-28", "h-36", "h-24"];
            const colors = [
              "from-gray-400 to-gray-300",
              "from-amber-400 to-yellow-300",
              "from-orange-400 to-amber-300"
            ];
            const medals = ["🥈", "🥇", "🥉"];
            if (!entry) return <div key={idx} />;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl mb-2">{medals[idx]}</span>
                <Link to={`/explorador/${entry.user_id}`} className="hover:scale-105 transition-transform">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-2 border-2 border-primary/20">
                    {entry.level_icon || "🌱"}
                  </div>
                </Link>
                <Link
                  to={`/explorador/${entry.user_id}`}
                  className="font-bold text-xs text-foreground text-center truncate w-full px-1 hover:text-primary"
                >
                  {entry.display_name}
                </Link>
                <p className="text-xs text-muted-foreground mb-2">{entry.total_xp.toLocaleString()} XP</p>
                <div className={`w-full ${heights[idx]} rounded-t-xl bg-gradient-to-t ${colors[idx]} flex items-start justify-center pt-2`}>
                  <span className="text-lg font-black text-white">#{pos}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full ranking list */}
      <div className="space-y-2">
        {loadingLeaderboard ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : localLeaderboard.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">No hay exploradores registrados en esta región todavía.</p>
          </div>
        ) : (
          localLeaderboard.map((entry, idx) => {
            const isCurrentUser = entry.user_id === user?.id;
            const rankColors = idx === 0 ? "text-amber-500" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-orange-600" : "text-muted-foreground";
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCurrentUser
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                <span className={`w-8 text-center font-black text-lg ${rankColors}`}>
                  #{idx + 1}
                </span>
                <Link to={`/explorador/${entry.user_id}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0 hover:scale-105 transition-transform">
                    {entry.level_icon || "🌱"}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/explorador/${entry.user_id}`}
                      className="font-semibold text-foreground text-sm truncate hover:text-primary"
                    >
                      {entry.display_name}
                    </Link>
                    {isCurrentUser && <Badge className="text-xs bg-primary text-primary-foreground">Tú</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.level_title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground text-sm">{entry.total_xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary text-sm">{entry.total_missions_completed}</p>
                  <p className="text-xs text-muted-foreground">misiones</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {!user && (
        <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="font-bold text-foreground mb-2">¡Únete al ranking!</p>
          <p className="text-muted-foreground text-sm mb-4">Regístrate, completa retos y escala posiciones</p>
          <Button asChild><Link to="/registro">Crear Cuenta Gratis</Link></Button>
        </div>
      )}
    </div>
  );
}
