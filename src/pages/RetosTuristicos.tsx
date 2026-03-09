import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target, Flame, Zap, Crown, Lock, CheckCircle2,
  Clock, ChevronRight, MapPin, Users
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const categoryConfig: Record<string, { label: string; icon: string }> = {
  exploration: { label: "Exploración", icon: "🗺️" },
  social: { label: "Social", icon: "👥" },
  gastronomy: { label: "Gastronomía", icon: "🍽️" },
  planning: { label: "Planificación", icon: "📋" },
  commerce: { label: "Comercio", icon: "🛍️" },
  referral: { label: "Referidos", icon: "🎁" },
  engagement: { label: "Engagement", icon: "🔥" },
  culture: { label: "Cultura", icon: "🎭" },
};

const missionTypeLabels: Record<string, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  one_time: "Única",
};

export default function RetosTuristicos() {
  const { user } = useAuth();
  const { missions, userMissions, userGamification, loading } = useGamification();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");

  const categories = ["all", ...Array.from(new Set(missions.map(m => m.category)))];
  const types = ["all", "daily", "weekly", "one_time"];

  const filtered = missions.filter(m => {
    if (activeCategory !== "all" && m.category !== activeCategory) return false;
    if (activeType !== "all" && m.mission_type !== activeType) return false;
    return true;
  });

  const getMissionProgress = (missionId: string) =>
    userMissions.find(um => um.mission_id === missionId);

  const activeCount = userMissions.filter(um => !um.is_completed && um.progress > 0).length;
  const completedCount = userMissions.filter(um => um.is_completed).length;

  return (
    <PageTransition>
      <SEOHead
        title="Retos Turísticos - Descubre RD Jugando"
        description="Completa retos de exploración, cultura, gastronomía y más mientras descubres República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <Badge className="bg-primary/10 text-primary mb-4 text-sm border-primary/20">
                <Flame className="h-4 w-4 mr-1" /> {activeCount} retos activos
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Retos Turísticos
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Completa misiones, gana puntos y desbloquea recompensas mientras exploras la isla
              </p>
              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{missions.length}</p>
                  <p className="text-sm text-muted-foreground">Retos disponibles</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {missions.reduce((s, c) => s + c.xp_reward, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">XP totales</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border py-3">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => {
                const cfg = categoryConfig[cat];
                return (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className="flex-shrink-0 gap-1.5"
                  >
                    {cat === "all" ? "🎯 Todos" : `${cfg?.icon || "📌"} ${cfg?.label || cat}`}
                  </Button>
                );
              })}
              <div className="w-px bg-border mx-1 flex-shrink-0" />
              {types.filter(t => t !== "all").map(t => (
                <Button
                  key={t}
                  variant={activeType === t ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveType(activeType === t ? "all" : t)}
                  className="flex-shrink-0"
                >
                  {missionTypeLabels[t] || t}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} retos encontrados</p>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filtered.map((mission, i) => {
                    const progress = getMissionProgress(mission.id);
                    const isLocked = (userGamification?.current_level || 1) < mission.min_level;
                    const isCompleted = progress?.is_completed;
                    const progressPct = progress ? (progress.progress / mission.target_count) * 100 : 0;
                    const cfg = categoryConfig[mission.category];

                    return (
                      <motion.div
                        key={mission.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-card rounded-xl border overflow-hidden transition-all group ${
                          isLocked
                            ? "border-border opacity-60"
                            : isCompleted
                            ? "border-primary/30 bg-primary/5"
                            : "border-border hover:border-primary/30 hover:shadow-lg"
                        }`}
                      >
                        {/* Header bar */}
                        <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-5xl">{isLocked ? "🔒" : mission.icon}</span>
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {cfg?.icon || "📌"} {cfg?.label || mission.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-card/80">
                              {missionTypeLabels[mission.mission_type] || mission.mission_type}
                            </Badge>
                          </div>
                          {isCompleted && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <Badge className="bg-amber-500/90 text-white text-xs">
                              <Zap className="h-3 w-3 mr-1" /> {mission.xp_reward} XP
                            </Badge>
                            {mission.coin_reward > 0 && (
                              <Badge className="bg-primary/90 text-primary-foreground text-xs">
                                <Crown className="h-3 w-3 mr-1" /> {mission.coin_reward}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                            {mission.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {mission.description || mission.short_description}
                          </p>

                          {isLocked ? (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Requiere nivel {mission.min_level}
                            </p>
                          ) : isCompleted ? (
                            <div className="flex items-center gap-2 text-sm text-primary font-medium">
                              <CheckCircle2 className="h-4 w-4" /> ¡Completado!
                              {progress?.completed_at && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(progress.completed_at).toLocaleDateString("es-DO")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progreso</span>
                                <span className="font-medium text-primary">
                                  {progress?.progress || 0}/{mission.target_count}
                                </span>
                              </div>
                              <Progress value={progressPct} className="h-2" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay retos que coincidan con tus filtros.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="py-12 bg-card border-t border-border">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">¿Listo para la aventura?</h2>
              <p className="text-muted-foreground mb-6">Regístrate para empezar a completar retos y ganar recompensas.</p>
              <div className="flex gap-4 justify-center">
                <Button asChild><Link to="/registro">Crear Cuenta</Link></Button>
                <Button variant="outline" asChild><Link to="/login">Iniciar Sesión</Link></Button>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
