import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, Zap, Crown } from "lucide-react";
import type { Mission, UserMission } from "@/hooks/useGamification";

interface DailyWeeklyChallengesProps {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  getMissionProgress: (missionId: string) => UserMission | undefined;
}

export function DailyWeeklyChallenges({ dailyMissions, weeklyMissions, getMissionProgress }: DailyWeeklyChallengesProps) {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Daily */}
          {dailyMissions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Retos Diarios</h2>
                  <p className="text-xs text-muted-foreground">Se reinician cada 24 horas</p>
                </div>
              </div>
              <div className="space-y-3">
                {dailyMissions.map((m) => {
                  const prog = getMissionProgress(m.id);
                  const pct = prog ? (prog.progress / m.target_count) * 100 : 0;
                  return (
                    <motion.div
                      key={m.id}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        prog?.is_completed ? "bg-primary/5 border-primary/20" : "bg-background border-border"
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{m.name}</p>
                        {!prog?.is_completed && <Progress value={pct} className="h-1 mt-1.5" />}
                      </div>
                      <Badge variant={prog?.is_completed ? "default" : "secondary"} className="text-xs gap-1 shrink-0">
                        <Zap className="h-3 w-3" /> {m.xp_reward}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly */}
          {weeklyMissions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Retos Semanales</h2>
                  <p className="text-xs text-muted-foreground">Más desafiantes, mejores recompensas</p>
                </div>
              </div>
              <div className="space-y-3">
                {weeklyMissions.map((m) => {
                  const prog = getMissionProgress(m.id);
                  const pct = prog ? (prog.progress / m.target_count) * 100 : 0;
                  return (
                    <motion.div
                      key={m.id}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        prog?.is_completed ? "bg-primary/5 border-primary/20" : "bg-background border-border"
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{m.name}</p>
                        {!prog?.is_completed && <Progress value={pct} className="h-1 mt-1.5" />}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant={prog?.is_completed ? "default" : "secondary"} className="text-xs gap-1">
                          <Zap className="h-3 w-3" /> {m.xp_reward}
                        </Badge>
                        {m.coin_reward > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Crown className="h-3 w-3" /> {m.coin_reward}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
