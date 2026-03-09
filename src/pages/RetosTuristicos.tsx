import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target, Flame, Zap, Crown, Clock, ChevronRight, MapPin, Users, Filter,
  Star, Calendar, TrendingUp, Award, Search
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { MissionCard } from "@/components/gamification/MissionCard";
import { Input } from "@/components/ui/input";

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

const missionTypeLabels: Record<string, { label: string; icon: typeof Clock }> = {
  daily: { label: "Diarias", icon: Clock },
  weekly: { label: "Semanales", icon: Calendar },
  one_time: { label: "Únicas", icon: Star },
};

export default function RetosTuristicos() {
  const { user } = useAuth();
  const { missions, userMissions, userGamification, loading } = useGamification();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "xp" | "progress">("featured");

  const categories = ["all", ...Array.from(new Set(missions.map(m => m.category)))];
  const types = ["all", "daily", "weekly", "one_time"];

  const getMissionProgress = (missionId: string) =>
    userMissions.find(um => um.mission_id === missionId);

  const filtered = missions
    .filter(m => {
      if (activeCategory !== "all" && m.category !== activeCategory) return false;
      if (activeType !== "all" && m.mission_type !== activeType) return false;
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !m.short_description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "xp") return b.xp_reward - a.xp_reward;
      if (sortBy === "progress") {
        const pa = getMissionProgress(a.id);
        const pb = getMissionProgress(b.id);
        const pctA = pa ? pa.progress / a.target_count : 0;
        const pctB = pb ? pb.progress / b.target_count : 0;
        return pctB - pctA;
      }
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

  const activeCount = userMissions.filter(um => !um.is_completed && um.progress > 0).length;
  const completedCount = userMissions.filter(um => um.is_completed).length;
  const totalXp = missions.reduce((s, c) => s + c.xp_reward, 0);

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
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <Badge className="bg-primary/10 text-primary mb-4 text-sm border-primary/20 gap-2">
                <Flame className="h-4 w-4" /> {activeCount} retos activos
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Retos Turísticos
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Completa misiones, gana puntos y desbloquea recompensas mientras exploras la isla
              </p>
              <div className="flex justify-center gap-8 text-center">
                {[
                  { value: missions.length, label: "Disponibles", color: "text-primary" },
                  { value: completedCount, label: "Completados", color: "text-emerald-500" },
                  { value: totalXp.toLocaleString(), label: "XP Totales", color: "text-amber-500" },
                ].map(stat => (
                  <motion.div key={stat.label} whileHover={{ scale: 1.05 }}>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-lg border-b border-border py-3">
          <div className="container mx-auto px-4 space-y-3">
            {/* Search + Sort */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar retos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex gap-1.5">
                {(["featured", "xp", "progress"] as const).map(s => (
                  <Button
                    key={s}
                    variant={sortBy === s ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy(s)}
                    className="text-xs"
                  >
                    {s === "featured" ? "Destacados" : s === "xp" ? "Más XP" : "Mi progreso"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category & Type filters */}
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
              {types.filter(t => t !== "all").map(t => {
                const tc = missionTypeLabels[t];
                return (
                  <Button
                    key={t}
                    variant={activeType === t ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveType(activeType === t ? "all" : t)}
                    className="flex-shrink-0 gap-1"
                  >
                    {tc && <tc.icon className="h-3.5 w-3.5" />}
                    {tc?.label || t}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} retos encontrados</p>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filtered.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      progress={getMissionProgress(mission.id)}
                      isLocked={(userGamification?.current_level || 1) < mission.min_level}
                      currentLevel={userGamification?.current_level || 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No se encontraron retos</h3>
                <p className="text-muted-foreground mb-4">Ajusta los filtros o intenta otra búsqueda</p>
                <Button variant="outline" onClick={() => { setActiveCategory("all"); setActiveType("all"); setSearchQuery(""); }}>
                  Limpiar filtros
                </Button>
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
