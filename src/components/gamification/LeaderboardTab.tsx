import { Trophy, Medal, Award, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  display_name?: string;
  total_xp: number;
  current_level: number;
  coins: number;
  streak_days: number;
  total_missions_completed: number;
  avatar_url?: string;
}

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-amber-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-400" />;
    case 3:
      return <Award className="w-5 h-5 text-orange-700" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBadgeColor = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400/50";
  if (rank === 2) return "bg-gradient-to-r from-slate-400 to-slate-500 text-white border-slate-300/50";
  if (rank === 3) return "bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-500/50";
  return "";
};

export function LeaderboardTab({ leaderboard, currentUserId }: LeaderboardTabProps) {
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {topThree.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user_id === currentUserId;
            
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "order-1",
                  rank === 1 && "md:order-2",
                  rank === 2 && "md:order-1",
                  rank === 3 && "md:order-3"
                )}
              >
                <Card 
                  className={cn(
                    "relative overflow-hidden border-2",
                    getRankBadgeColor(rank),
                    rank === 1 && "md:scale-110 shadow-2xl",
                    isCurrentUser && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <CardHeader className="pb-3 text-center">
                    <div className="flex justify-center mb-2">
                      {getRankIcon(rank)}
                    </div>
                    <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-background">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback className="text-xl bg-primary/10">
                        {entry.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">
                      {entry.display_name || "Viajero Anónimo"}
                    </CardTitle>
                    <CardDescription>
                      Nivel {entry.current_level}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {entry.total_xp.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Experiencia Total</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-center text-xs">
                      <div>
                        <div className="font-semibold">{entry.coins}</div>
                        <div className="text-muted-foreground">Monedas</div>
                      </div>
                      <div>
                        <div className="font-semibold">{entry.total_missions_completed}</div>
                        <div className="text-muted-foreground">Misiones</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of Leaderboard */}
      {rest.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Clasificación General
            </CardTitle>
            <CardDescription>
              Top jugadores del portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rest.map((entry, index) => {
              const rank = index + 4;
              const isCurrentUser = entry.user_id === currentUserId;
              
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "transition-all hover:shadow-md",
                      isCurrentUser && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-8 text-center font-bold text-muted-foreground">
                        #{rank}
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={entry.avatar_url} />
                        <AvatarFallback className="bg-primary/10">
                          {entry.display_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {entry.display_name || "Viajero Anónimo"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Nivel {entry.current_level}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {entry.total_xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>

                      <div className="hidden md:flex items-center gap-4 text-sm">
                        <Badge variant="secondary">
                          💰 {entry.coins}
                        </Badge>
                        <Badge variant="outline">
                          🎯 {entry.total_missions_completed}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {leaderboard.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg text-muted-foreground">
            No hay datos de clasificación disponibles
          </p>
        </Card>
      )}
    </div>
  );
}
