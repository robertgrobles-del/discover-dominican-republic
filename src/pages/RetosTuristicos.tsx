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
  Star, Calendar, TrendingUp, Award, Search, Compass, CheckCircle2,
  ArrowRight, ShieldCheck, Gift
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { MissionCard } from "@/components/gamification/MissionCard";
import { Input } from "@/components/ui/input";
import { BannerAd, PanoramaAd } from "@/components/promo";
import { TreasureHuntMode } from "@/components/gamification/TreasureHuntMode";

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
  one_time: { label: "Únicas & Épicas", icon: Star },
};

export default function RetosTuristicos() {
  const { user } = useAuth();
  const { missions, userMissions, userGamification, loading } = useGamification();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "xp" | "progress">("featured");

  const categories = ["all", ...Array.from(new Set(missions.map(m => m.category).filter(Boolean)))];
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
        title="Retos Turísticos y Misiones de Exploración | Descubre RD"
        description="Completa misiones de exploración por las 32 provincias, gana puntos XP, medallas y recompensas exclusivas mientras recorres República Dominicana."
        keywords="retos turisticos rd, misiones gamificacion dominicana, pasaporte digital misiones, puntos xp turismo"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hub Breadcrumb Navigation Bar */}
        <div className="border-b border-border/60 bg-muted/20 py-2.5">
          <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/gamificacion-turistica" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
                <Compass className="h-3.5 w-3.5 text-primary" /> Gamificación Turística
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-bold">Retos & Misiones</span>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/gamificacion-turistica/mapa" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Mapa 3D
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/gamificacion-turistica/trivia" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" /> Trivia
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-10 pb-12 relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-3 py-1 font-semibold">
                  <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" /> Sistema de Misiones Oficial
                </Badge>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                  Retos Turísticos & <br />
                  <span className="text-primary">Misiones de Temporada</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Completa retos fotográficos, rutas gastronómicas, visitas a reservas protegidas y senderos ecológicos. Gana puntos de experiencia (XP) para subir de nivel en tu Pasaporte Digital.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-10 px-5 text-xs shadow-sm">
                    <Link to="/gamificacion-turistica/mapa">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" /> Ver en el Mapa de Misiones
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl h-10 px-5 text-xs bg-card border-border">
                    <Link to="/gamificacion-turistica">
                      <Compass className="h-3.5 w-3.5 mr-1.5 text-primary" /> Volver al Pasaporte
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Metrics Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl p-5 bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="text-xs font-bold text-foreground">Tu Estado de Expedición</span>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                      Nivel {userGamification?.current_level || 1}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-xl font-black text-primary">{missions.length}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Disponibles</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Completadas</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-xl font-black text-amber-500">{totalXp.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">XP en Juego</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Racha actual:</span>
                    <strong className="text-orange-500 font-bold flex items-center gap-1 text-xs">
                      <Flame className="h-3.5 w-3.5 fill-orange-500" /> {userGamification?.streak_days || 0} Días Consecutivos
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Sticky Bar */}
        <section className="sticky top-16 z-30 bg-card/90 backdrop-blur-md border-b border-border py-3">
          <div className="container mx-auto px-4 max-w-6xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar misiones por nombre o lugar..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
                />
              </div>
              <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
                {(["featured", "xp", "progress"] as const).map(s => (
                  <Button
                    key={s}
                    variant={sortBy === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(s)}
                    className="text-xs h-8 rounded-xl px-3"
                  >
                    {s === "featured" ? "Destacadas" : s === "xp" ? "Mayor XP" : "Mi Progreso"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {categories.map((cat) => {
                const cfg = categoryConfig[cat];
                return (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className="text-xs rounded-xl h-8 px-3 whitespace-nowrap gap-1.5"
                  >
                    {cat === "all" ? "🎯 Todos" : `${cfg?.icon || "📌"} ${cfg?.label || cat}`}
                  </Button>
                );
              })}
              <div className="w-px bg-border mx-1 shrink-0" />
              {types.filter(t => t !== "all").map(t => {
                const tc = missionTypeLabels[t];
                return (
                  <Button
                    key={t}
                    variant={activeType === t ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveType(activeType === t ? "all" : t)}
                    className="text-xs rounded-xl h-8 px-3 whitespace-nowrap gap-1"
                  >
                    {tc && <tc.icon className="h-3 w-3" />}
                    {tc?.label || t}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Missions Grid */}
        <main className="container mx-auto px-4 max-w-6xl py-10 flex-1 space-y-10">
          {/* Speed-run 48h Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border-2 border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500 text-black font-black text-[10px] animate-pulse">
                  ⚡ SPEED-RUN DE FIN DE SEMANA
                </Badge>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                  Multiplicador +2.5x XP Activo
                </span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                Ruta del Cacao Orgánico & Cascadas de San Francisco a Samaná
              </h3>
              <p className="text-xs text-muted-foreground">
                Visita y acredita 2 senderos antes del domingo a medianoche para ganar +250 monedas extra.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 bg-background/80 px-4 py-2 rounded-2xl border border-border">
              <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-foreground">36h : 42m restantes</span>
            </div>
          </div>

          {/* GPS Treasure Hunt Interactive Mode */}
          <TreasureHuntMode />

          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-foreground">
              Misiones Disponibles ({filtered.length})
            </h2>
          </div>

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
            <div className="text-center py-16 bg-card rounded-2xl border border-border max-w-md mx-auto">
              <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-foreground">No encontramos retos con estos filtros</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Intenta restablecer la búsqueda o explorar otra categoría.</p>
              <Button size="sm" variant="outline" onClick={() => { setActiveCategory("all"); setActiveType("all"); setSearchQuery(""); }}>
                Ver todos los retos
              </Button>
            </div>
          )}

          {/* Sponsoring Panorama Ad */}
          <div className="mt-14">
            <PanoramaAd showDemo />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
