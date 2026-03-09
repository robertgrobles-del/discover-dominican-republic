import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Award, Star, Lock, Share2,
  Sparkles, Filter
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const rarityConfig: Record<string, { color: string; label: string; glow: string; gradient: string }> = {
  common: { color: "hsl(var(--muted-foreground))", label: "Común", glow: "hsl(var(--muted) / 0.3)", gradient: "from-slate-400 to-slate-500" },
  rare: { color: "hsl(210, 100%, 60%)", label: "Raro", glow: "hsl(210, 100%, 70% / 0.3)", gradient: "from-blue-400 to-blue-600" },
  epic: { color: "hsl(270, 100%, 65%)", label: "Épico", glow: "hsl(270, 100%, 75% / 0.3)", gradient: "from-purple-400 to-purple-600" },
  legendary: { color: "hsl(45, 100%, 55%)", label: "Legendario", glow: "hsl(45, 100%, 65% / 0.3)", gradient: "from-amber-400 to-yellow-600" },
};

const categoryIcons: Record<string, string> = {
  exploration: "🗺️",
  social: "👥",
  collection: "💎",
  challenge: "🎯",
  special: "⭐",
};

export default function MisLogros() {
  const { user } = useAuth();
  const { userGamification, getCurrentLevel, getNextLevel, getXpProgress } = useGamification();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState("Todos");

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

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const categories = ["Todos", ...Array.from(new Set(achievements.map(a => a.category)))];
  const filterOptions = ["Todos", "Desbloqueados", "Por Descubrir"];

  const enriched = achievements.map(a => {
    const ua = userAchievements.find(u => u.achievement_id === a.id);
    return { ...a, unlocked: !!ua, progress: ua?.progress || 0, unlocked_at: ua?.unlocked_at };
  });

  const filtered = enriched.filter(a => {
    if (activeFilter === "Desbloqueados" && !a.unlocked) return false;
    if (activeFilter === "Por Descubrir" && a.unlocked) return false;
    if (activeCategory !== "Todos" && a.category !== activeCategory) return false;
    return true;
  });

  const unlockedCount = enriched.filter(a => a.unlocked).length;

  return (
    <PageTransition>
      <SEOHead
        title="Mis Logros - Colección de Insignias | DescubreRD"
        description="Tu colección de logros e insignias ganadas explorando República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-card rounded-xl p-6 border border-border flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary/60">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-5xl">
                    {currentLevel?.icon || "🌱"}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1.5 border border-border shadow-md">
                  <div className="bg-primary size-8 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-center sm:text-left z-10">
                <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                  Mis Logros
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <p className="text-primary font-bold text-lg">
                    Nivel {userGamification?.current_level || 1}: {currentLevel?.title || "Viajero"}
                  </p>
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  {unlockedCount} de {achievements.length} logros desbloqueados. ¡Sigue explorando para desbloquear más!
                </p>
                <div className="mt-4 flex gap-3 justify-center sm:justify-start">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link to="/club-recompensas"><Trophy className="h-4 w-4" /> Club Recompensas</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link to="/badges"><Award className="h-4 w-4" /> Insignias</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              {nextLevel && (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-muted-foreground text-sm font-medium">Siguiente: {nextLevel.title}</span>
                    <span className="text-foreground font-bold text-xl">
                      {userGamification?.total_xp || 0} <span className="text-muted-foreground text-sm font-normal">/ {nextLevel.xp_required} XP</span>
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-3 mb-4" />
                </>
              )}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex flex-col text-center">
                  <span className="text-2xl font-bold text-foreground">{unlockedCount}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Logros</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-2xl font-bold text-foreground">{userGamification?.total_missions_completed || 0}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Misiones</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-2xl font-bold text-foreground">{userGamification?.coins || 0}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Monedas</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-500" />
                Tu Colección de Tesoros
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {filterOptions.map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className="whitespace-nowrap"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setActiveCategory(cat)}
                >
                  {categoryIcons[cat] || ""} {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((achievement, index) => {
                const rarity = rarityConfig[achievement.rarity] || rarityConfig.common;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      achievement.unlocked
                        ? "border-border hover:border-primary/50"
                        : "border-border opacity-60"
                    }`}
                  >
                    {achievement.unlocked && (
                      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${rarity.gradient}`} />
                    )}
                    {achievement.rarity !== "common" && achievement.unlocked && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wide"
                          style={{ borderColor: rarity.color, color: rarity.color }}
                        >
                          {rarity.label}
                        </Badge>
                      </div>
                    )}
                    {achievement.unlocked && (
                      <div className="absolute top-3 left-3">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col items-center text-center">
                      <div
                        className={`size-24 rounded-full ${
                          achievement.unlocked
                            ? `bg-gradient-to-b ${rarity.gradient}`
                            : "bg-muted"
                        } flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 border-4 border-border`}
                      >
                        {achievement.unlocked ? (
                          <span className="text-4xl drop-shadow-md">{achievement.icon || "🏆"}</span>
                        ) : (
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className={`font-bold text-lg mb-2 transition-colors ${
                        achievement.unlocked ? "text-foreground group-hover:text-primary" : "text-muted-foreground"
                      }`}>
                        {achievement.unlocked ? achievement.name : "???"}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                        {achievement.unlocked
                          ? achievement.short_description || achievement.description
                          : "Logro bloqueado. Sigue explorando para descubrirlo."}
                      </p>

                      {!achievement.unlocked && achievement.progress > 0 && (
                        <div className="w-full mb-3">
                          <Progress value={achievement.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{achievement.progress}%</p>
                        </div>
                      )}

                      <div className="w-full mt-auto pt-4 border-t border-border flex justify-between items-center">
                        <span className="text-primary text-xs font-bold">+{achievement.xp_reward || 0} XP</span>
                        {achievement.unlocked && achievement.unlocked_at ? (
                          <span className="text-muted-foreground text-xs">
                            {new Date(achievement.unlocked_at).toLocaleDateString("es-DO")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Sin desbloquear</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay logros que coincidan con tus filtros.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
