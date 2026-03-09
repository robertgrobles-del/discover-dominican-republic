import { Trophy, Lock, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  short_description: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  badge_color: string;
  xp_reward: number;
  coin_reward: number;
  unlocked?: boolean;
  progress?: number;
  unlocked_at?: string;
}

interface AchievementsTabProps {
  achievements: Achievement[];
  userAchievements: Array<{ achievement_id: string; unlocked_at: string; progress: number }>;
}

const rarityConfig = {
  common: { color: "hsl(var(--muted-foreground))", label: "Común", glow: "hsl(var(--muted))" },
  rare: { color: "hsl(210, 100%, 60%)", label: "Raro", glow: "hsl(210, 100%, 70%)" },
  epic: { color: "hsl(270, 100%, 65%)", label: "Épico", glow: "hsl(270, 100%, 75%)" },
  legendary: { color: "hsl(45, 100%, 55%)", label: "Legendario", glow: "hsl(45, 100%, 65%)" }
};

const categoryIcons = {
  exploration: "🗺️",
  social: "👥",
  collection: "💎",
  challenge: "🎯",
  special: "⭐"
};

export function AchievementsTab({ achievements, userAchievements }: AchievementsTabProps) {
  const achievementsWithProgress = achievements.map(achievement => {
    const userAch = userAchievements.find(ua => ua.achievement_id === achievement.id);
    return {
      ...achievement,
      unlocked: !!userAch,
      progress: userAch?.progress || 0,
      unlocked_at: userAch?.unlocked_at
    };
  });

  const unlockedCount = achievementsWithProgress.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Logros Desbloqueados
              </CardTitle>
              <CardDescription className="mt-2">
                {unlockedCount} de {totalCount} logros completados
              </CardDescription>
            </div>
            <div className="text-4xl font-bold text-primary">
              {completionPercentage}%
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3 mt-4" />
        </CardHeader>
      </Card>

      {/* Achievements by Category */}
      {categories.map(category => {
        const categoryAchievements = achievementsWithProgress.filter(a => a.category === category);
        const categoryUnlocked = categoryAchievements.filter(a => a.unlocked).length;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons] || "🏆"}</span>
              <h3 className="text-xl font-bold capitalize">{category}</h3>
              <Badge variant="secondary" className="ml-auto">
                {categoryUnlocked}/{categoryAchievements.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement, index) => {
                const rarity = rarityConfig[achievement.rarity as keyof typeof rarityConfig] || rarityConfig.common;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        "relative overflow-hidden transition-all hover:scale-[1.02]",
                        achievement.unlocked 
                          ? "border-2 shadow-lg" 
                          : "opacity-60 grayscale"
                      )}
                      style={{
                        borderColor: achievement.unlocked ? rarity.color : undefined,
                        boxShadow: achievement.unlocked ? `0 0 20px ${rarity.glow}` : undefined
                      }}
                    >
                      {achievement.unlocked && (
                        <div className="absolute top-2 right-2">
                          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{achievement.icon || "🏆"}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">
                                {achievement.unlocked ? achievement.name : "???"}
                              </CardTitle>
                              {!achievement.unlocked && <Lock className="w-4 h-4" />}
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: rarity.color,
                                color: rarity.color 
                              }}
                            >
                              {rarity.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {achievement.unlocked 
                            ? achievement.short_description 
                            : "Logro bloqueado. Sigue explorando para descubrirlo."}
                        </p>

                        {achievement.unlocked && achievement.unlocked_at && (
                          <p className="text-xs text-muted-foreground">
                            Desbloqueado: {new Date(achievement.unlocked_at).toLocaleDateString('es-DO')}
                          </p>
                        )}

                        {!achievement.unlocked && achievement.progress > 0 && (
                          <div className="space-y-1">
                            <Progress value={achievement.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">
                              {achievement.progress}% completado
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs font-medium pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-primary" />
                            <span>+{achievement.xp_reward} XP</span>
                          </div>
                          {achievement.coin_reward > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">💰</span>
                              <span>+{achievement.coin_reward}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {achievements.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg text-muted-foreground">
            No hay logros disponibles por el momento
          </p>
        </Card>
      )}
    </div>
  );
}
