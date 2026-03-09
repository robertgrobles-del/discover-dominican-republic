import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Medal, Lock, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const rarityConfig: Record<string, { gradient: string; label: string; color: string }> = {
  common: { gradient: "from-slate-400 to-slate-500", label: "Común", color: "bg-muted-foreground" },
  rare: { gradient: "from-blue-400 to-blue-600", label: "Raro", color: "bg-blue-500" },
  epic: { gradient: "from-purple-400 to-purple-600", label: "Épico", color: "bg-purple-500" },
  legendary: { gradient: "from-amber-400 to-yellow-600", label: "Legendario", color: "bg-yellow-500" },
};

export default function Badges() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: achData } = await supabase
        .from("achievements")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (achData) setAchievements(achData);

      if (user) {
        const { data: uaData } = await supabase
          .from("user_achievements")
          .select("*")
          .eq("user_id", user.id);
        if (uaData) setUserAchievements(uaData);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const enriched = achievements.map(a => {
    const ua = userAchievements.find(u => u.achievement_id === a.id);
    return { ...a, earned: !!ua, progress: ua?.progress || 0, unlocked_at: ua?.unlocked_at };
  });

  const earnedBadges = enriched.filter(b => b.earned);
  const inProgressBadges = enriched.filter(b => !b.earned);

  return (
    <PageTransition>
      <SEOHead
        title="Badges y Logros - República Dominicana"
        description="Colecciona badges exclusivos explorando República Dominicana. Desbloquea logros y compite con otros viajeros."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-primary/10 to-amber-500/10">
            <div className="container mx-auto px-4 text-center">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Badges y Logros</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Colecciona insignias explorando el país
              </p>
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{earnedBadges.length}</div>
                  <div className="text-sm text-muted-foreground">Badges obtenidos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Total disponibles</div>
                </div>
                {achievements.length > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {Math.round((earnedBadges.length / achievements.length) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Completado</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {loading ? (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Earned Badges */}
              <section className="py-16">
                <div className="container mx-auto px-4">
                  <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                    <Star className="h-6 w-6 text-amber-500" />
                    Badges Obtenidos ({earnedBadges.length})
                  </h2>
                  {earnedBadges.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">Aún no has desbloqueado badges. ¡Comienza a explorar!</p>
                      <Button className="mt-4" asChild><Link to="/club-recompensas">Ver Misiones</Link></Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {earnedBadges.map((badge, i) => {
                        const rarity = rarityConfig[badge.rarity] || rarityConfig.common;
                        return (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Card className="border-2 border-primary/30 bg-primary/5 relative overflow-hidden">
                              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${rarity.gradient}`} />
                              {badge.rarity !== "common" && (
                                <div className="absolute top-3 right-3">
                                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                </div>
                              )}
                              <CardHeader>
                                <div className="flex items-center gap-4">
                                  <div className={`w-16 h-16 rounded-full bg-gradient-to-b ${rarity.gradient} flex items-center justify-center`}>
                                    <span className="text-2xl">{badge.icon || "🏆"}</span>
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg text-foreground">{badge.name}</CardTitle>
                                    <Badge className={`${rarity.color} text-white text-xs`}>{rarity.label}</Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground mb-2">{badge.short_description || badge.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-primary font-medium">+{badge.xp_reward || 0} XP</span>
                                  {badge.unlocked_at && (
                                    <span className="text-xs text-muted-foreground">
                                      ✓ {new Date(badge.unlocked_at).toLocaleDateString("es-DO")}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* In Progress / Locked */}
              <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                  <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                    <Medal className="h-6 w-6 text-muted-foreground" />
                    Por Desbloquear ({inProgressBadges.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressBadges.map((badge, i) => {
                      const rarity = rarityConfig[badge.rarity] || rarityConfig.common;
                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className="opacity-80 hover:opacity-100 transition-opacity">
                            <CardHeader>
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                  {badge.is_hidden ? (
                                    <Lock className="h-6 w-6 text-muted-foreground" />
                                  ) : (
                                    <span className="text-2xl opacity-50">{badge.icon || "🏆"}</span>
                                  )}
                                </div>
                                <div>
                                  <CardTitle className="text-lg text-muted-foreground">
                                    {badge.is_hidden ? "???" : badge.name}
                                  </CardTitle>
                                  <Badge variant="outline" className="text-xs">{rarity.label}</Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground">
                                {badge.is_hidden
                                  ? "Logro secreto. Sigue explorando para descubrirlo."
                                  : badge.short_description || badge.description}
                              </p>
                              {badge.progress > 0 && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progreso</span>
                                    <span>{badge.progress}%</span>
                                  </div>
                                  <Progress value={badge.progress} className="h-2" />
                                </div>
                              )}
                              {badge.progress === 0 && !badge.is_hidden && (
                                <p className="text-xs text-muted-foreground italic">
                                  Aún no has comenzado este logro
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-primary">+{badge.xp_reward || 0} XP</span>
                                {badge.coin_reward > 0 && (
                                  <span className="text-yellow-500">+{badge.coin_reward} 🪙</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
