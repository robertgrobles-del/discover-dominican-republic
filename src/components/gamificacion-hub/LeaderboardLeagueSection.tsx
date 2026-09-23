import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Crown, Target, Users, ArrowRight } from "lucide-react";
import { LeagueWidget } from "@/components/gamification/LeagueWidget";
import { MissionCard } from "@/components/gamification/MissionCard";
import { SocialFeed } from "@/components/gamification/SocialFeed";
import type { LeaderboardEntry, Mission, UserMission } from "@/hooks/useGamification";

interface LeaderboardLeagueSectionProps {
  leaderboard: LeaderboardEntry[];
  featuredMissions: Mission[];
  getMissionProgress: (missionId: string) => UserMission | undefined;
  currentLevel: number;
}

export function LeaderboardLeagueSection({ leaderboard, featuredMissions, getMissionProgress, currentLevel }: LeaderboardLeagueSectionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-500" />
                <h2 className="font-display text-2xl font-bold text-foreground">Top Exploradores</h2>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link to="/club-recompensas">Ver todos <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 8).map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                    i < 3 ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? "bg-amber-500 text-white" :
                    i === 1 ? "bg-gray-400 text-white" :
                    i === 2 ? "bg-amber-700 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{entry.display_name}</p>
                    <p className="text-xs text-muted-foreground">Nivel {entry.current_level} • Racha: {entry.streak_days}d</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground text-sm">{entry.total_xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sé el primero en el ranking</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* League Widget (#35) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Liga y Temporada</h2>
            </div>
            <LeagueWidget />
          </motion.div>

          {/* Tabs: Featured Challenges or Social Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Tabs defaultValue="featured" className="w-full">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <TabsList className="bg-transparent h-auto p-0 gap-4">
                  <TabsTrigger
                    value="featured"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-sm font-bold gap-2"
                  >
                    <Target className="h-4 w-4 text-primary" /> Retos Destacados
                  </TabsTrigger>
                  <TabsTrigger
                    value="social"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-sm font-bold gap-2"
                  >
                    <Users className="h-4 w-4 text-primary" /> Actividad Global
                  </TabsTrigger>
                </TabsList>

                <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                  <Link to="/retos-turisticos">Ver todos <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>

              <TabsContent value="featured" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {featuredMissions.slice(0, 4).map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      progress={getMissionProgress(mission.id)}
                      isLocked={currentLevel < mission.min_level}
                      currentLevel={currentLevel}
                    />
                  ))}
                </div>
                {featuredMissions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                    <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Próximamente: misiones emocionantes</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="social" className="mt-0">
                <SocialFeed />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
