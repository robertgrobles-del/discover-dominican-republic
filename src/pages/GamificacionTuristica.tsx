import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MapPin, Trophy, Award, Zap, Map as MapIcon, Users, Compass, Gift, Shield,
  Sparkles, Flame, CheckCircle2, ChevronRight, Bookmark, ArrowRight,
  TrendingUp, Star, Crown, Target, Layers, PlayCircle, Coins, Brain,
  Video, Link2, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { BadgeAlbum, BadgeItem, BadgeRarity } from "@/components/gamification/BadgeAlbum";
import { ExplorerGuilds } from "@/components/gamification/ExplorerGuilds";
import { BannerAd, PanoramaAd, BetweenSectionsAd, MobileStickyFooterAd } from "@/components/promo";
import { PROVINCE_MILESTONES, PROVINCES } from "@/data/gamificacionTuristicaData";
import { PasaporteTab } from "@/components/gamificacion-turistica/PasaporteTab";
import { ProvinciasTab } from "@/components/gamificacion-turistica/ProvinciasTab";
import { RankingTab } from "@/components/gamificacion-turistica/RankingTab";
import { RecompensasTab } from "@/components/gamificacion-turistica/RecompensasTab";
import { GamificationSoundEngine, MACROREGIONES_RD } from "@/services/gamificationEngine";
import { CertificateModal } from "@/components/gamification/CertificateModal";
import { CommunityMissionsWidget } from "@/components/gamification/CommunityMissionsWidget";
import { ComoGanarPuntosModal } from "@/components/gamificacion/ComoGanarPuntosModal";
import { ComoGanarPuntosSection } from "@/components/gamificacion/ComoGanarPuntosSection";

const REGIONS = ["all", "Norte", "Sur", "Este", "Cibao"];

const gamificationHubSubroutes = [
  {
    title: "Retos & Misiones",
    desc: "Misiones diarias y expediciones por las 32 provincias",
    icon: Target,
    link: "/gamificacion-turistica/retos",
    tag: "Misiones Activas",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Programa de Creadores",
    desc: "Matchmaking con hoteles (estancias 100% gratis) y afiliados",
    icon: Video,
    link: "/gamificacion-turistica/creadores",
    tag: "Patrocinios POP & Samaná",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Trivia Dominicana",
    desc: "Demuestra tu conocimiento en geografía, historia y cultura",
    icon: Brain,
    link: "/gamificacion-turistica/trivia",
    tag: "+50 XP por ronda",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20"
  },
  {
    title: "Mapa 3D de Misiones",
    desc: "Ubica geográficamente todos los retos en el mapa satelital",
    icon: MapPin,
    link: "/gamificacion-turistica/mapa",
    tag: "Interactivo",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Perfil de Jugador",
    desc: "Consulta tu tarjeta de explorador, insignias e historial",
    icon: Crown,
    link: "/gamificacion-turistica/perfil",
    tag: "Nivel & Racha",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20"
  },
  {
    title: "Club de Recompensas",
    desc: "Canjea puntos XP por pases y descuentos exclusivos",
    icon: Gift,
    link: "/gamificacion-turistica/recompensas",
    tag: "Beneficios VIP",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20"
  },
  {
    title: "14 Formas de Ganar Puntos",
    desc: "Registro, referidos, boletín, check-ins GPS, blog, fotos y ecoturismo",
    icon: Sparkles,
    link: "/gamificacion-turistica?tab=formas",
    tag: "+2,500 XP Potenciales",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Reglamento & Normas",
    desc: "Lineamientos de acreditación GPS, RNC empresarial y políticas anti-fraude",
    icon: Trophy,
    link: "/gamificacion-turistica/reglas",
    tag: "Normativa Oficial",
    color: "text-teal-500",
    bg: "bg-teal-500/10 border-teal-500/20"
  }
];

export default function GamificacionTuristica() {
  const { user } = useAuth();
  const { userGamification } = useGamification();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "pasaporte";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [visitedProvinces, setVisitedProvinces] = useState<Set<string>>(new Set());
  const [totalProvinces, setTotalProvinces] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [recordingVisit, setRecordingVisit] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState("all");

  const [activeRankingRegion, setActiveRankingRegion] = useState("all");
  const [localLeaderboard, setLocalLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [puntosModalOpen, setPuntosModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const fetchRegionalLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      let query = supabase
        .from("user_gamification")
        .select(`
          user_id,
          total_xp,
          current_level,
          coins,
          streak_days,
          total_missions_completed
        `)
        .order("total_xp", { ascending: false });

      if (activeRankingRegion !== "all") {
        const { data: guilds } = await supabase
          .from("explorer_guilds")
          .select("id")
          .eq("region", activeRankingRegion);
        const guildIds = guilds?.map(g => g.id) || [];

        if (guildIds.length > 0) {
          const { data: members } = await supabase
            .from("guild_members")
            .select("user_id")
            .in("guild_id", guildIds);
          const memberUserIds = members?.map(m => m.user_id) || [];
          query = query.in("user_id", memberUserIds);
        } else {
          query = query.in("user_id", []);
        }
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = data.map(d => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map<string, any>(profiles?.map((p: any) => [p.id, p]) || []);

        const { data: levels } = await supabase
          .from("gamification_levels")
          .select("level_number, icon, title");
        const levelMap = new Map<number, any>(levels?.map((l: any) => [l.level_number, l]) || []);

        setLocalLeaderboard(data.map(d => {
          const prof = profileMap.get(d.user_id);
          const lvl = levelMap.get(d.current_level);
          return {
            ...d,
            display_name: prof?.display_name || "Viajero Anónimo",
            avatar_url: prof?.avatar_url || null,
            level_icon: lvl?.icon || "🌱",
            level_title: lvl?.title || "Curioso"
          };
        }));
      } else {
        setLocalLeaderboard([]);
      }
    } catch (error) {
      console.error("Error fetching regional leaderboard:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [activeRankingRegion]);

  useEffect(() => {
    fetchRegionalLeaderboard();
  }, [fetchRegionalLeaderboard]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [statsRes, achRes, userAchRes] = await Promise.all([
        supabase.rpc("get_province_stats"),
        supabase.from("achievements").select("*").eq("is_active", true).order("display_order"),
        supabase.from("user_achievements").select("*").eq("user_id", user.id),
      ]);
      if (statsRes.data) {
        const stats = statsRes.data as { total: number; provinces: string[] };
        setTotalProvinces(stats.total);
        setVisitedProvinces(new Set(stats.provinces || []));
      }
      if (achRes.data) setAchievements(achRes.data);
      if (userAchRes.data) setUserAchievements(userAchRes.data);
    } catch {
      // silently ignore; UI falls back to defaults
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVisitProvince = async (province: string) => {
    if (!user) { toast.error("Inicia sesión para registrar visitas"); return; }
    if (visitedProvinces.has(province)) { toast.info(`Ya visitaste ${province}`); return; }
    setRecordingVisit(province);
    try {
      const { data, error } = await supabase.rpc("record_province_visit", { p_province: province });
      if (error) throw error;
      const result = data as { success: boolean; xp_awarded?: number; total_provinces?: number };
      if (result.success) {
        GamificationSoundEngine.playStampSound();
        GamificationSoundEngine.playCoinSound();
        setVisitedProvinces(prev => new Set([...prev, province]));
        setTotalProvinces(result.total_provinces ?? totalProvinces + 1);
        toast.success(`¡${province} registrada! +${result.xp_awarded} XP 🗺️`);
      } else {
        toast.info(`Ya registraste ${province}`);
      }
    } catch {
      toast.error("Error al registrar visita");
    } finally {
      setRecordingVisit(null);
    }
  };

  const currentMilestoneList = PROVINCE_MILESTONES.filter(m => totalProvinces >= m.count);
  const currentMilestone = currentMilestoneList[currentMilestoneList.length - 1];
  const nextMilestone = PROVINCE_MILESTONES.find(m => totalProvinces < m.count);

  const cultureAchievements = achievements.filter(a => a.category === "culture");
  const isUnlocked = (achId: string) => userAchievements.some(ua => ua.achievement_id === achId);

  const stats = {
    total_xp: userGamification?.total_xp || 0,
    current_level: userGamification?.current_level || 1,
    coins: userGamification?.coins || 0,
    streak_days: userGamification?.streak_days || 0,
    total_missions_completed: userGamification?.total_missions_completed || 0,
    total_purchases: userGamification?.total_purchases || 0,
    total_referrals: userGamification?.total_referrals || 0,
    favorites: 0,
    reviews: 0,
    missions_completed: userGamification?.total_missions_completed || 0,
    provinces: totalProvinces || 0
  };

  const mappedBadges: BadgeItem[] = achievements.map(ach => {
    const earned = isUnlocked(ach.id);
    const req = ach.unlock_requirement as Record<string, number> | null;

    let progress = 0;
    let progressLabel = "";

    if (!earned && req) {
      let minPct = 100;
      const progressDetails: string[] = [];

      Object.entries(req).forEach(([key, requiredVal]) => {
        const currentVal = stats[key as keyof typeof stats] || 0;
        const pct = Math.min(100, Math.round((currentVal / requiredVal) * 100));
        if (pct < minPct) minPct = pct;
        progressDetails.push(`${currentVal}/${requiredVal}`);
      });

      progress = minPct;
      progressLabel = progressDetails.join(", ");
    }

    return {
      key: ach.id,
      icon: ach.icon || "🏅",
      name: ach.name,
      desc: ach.short_description || ach.description || "",
      xp: ach.xp_reward || 0,
      earned,
      rarity: (ach.rarity || "common") as BadgeRarity,
      isSecret: ach.is_secret || false,
      progress,
      progressLabel,
      link: "/gamificacion-turistica/retos"
    };
  });

  return (
    <PageTransition>
      <SEOHead
        title="Pasaporte Digital y Gamificación Turística de RD | Descubre República Dominicana"
        description="Explora las 32 provincias de República Dominicana, desbloquea insignias oficiales, completa misiones turísticas y sube en el ranking nacional de exploradores."
        keywords="gamificacion turistica dominicana, pasaporte digital rd, 32 provincias republica dominicana, insignias de viaje, ranking exploradores rd"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Editorial Top Billboard Ad */}
        <div className="border-b border-border/40 bg-muted/20 py-3 hidden md:block">
          <div className="container mx-auto px-4 max-w-6xl flex justify-center">
            <BannerAd placement="header" size="billboard" showDemo className="w-full !max-w-none shadow-sm" />
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-14 relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/95 to-background" />
          <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1">
                    <Compass className="h-3.5 w-3.5 mr-1.5" /> Pasaporte Digital Oficial de RD
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs px-3 py-1">
                    <Flame className="h-3.5 w-3.5 mr-1.5 text-orange-500" /> Temporada de Expediciones 2026
                  </Badge>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
                  32 Provincias. <br />
                  <span className="text-primary">Un país entero</span> por conquistar.
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                  Registra tus visitas en cada rincón de Quisqueya, obtén sellos consulares digitales, compite en gremios regionales y canjea tus puntos por recompensas turísticas reales.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    onClick={() => handleTabChange("pasaporte")} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-12 px-6 gap-2 text-xs md:text-sm shadow-md"
                  >
                    <MapIcon className="h-4 w-4" /> Abrir Mi Pasaporte
                  </Button>
                  <Button 
                    onClick={() => setPuntosModalOpen(true)}
                    variant="outline"
                    className="rounded-2xl h-12 px-5 gap-2 text-xs md:text-sm border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/20"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" /> 14 Formas de Ganar Puntos
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="rounded-2xl h-12 px-6 gap-2 text-xs md:text-sm border-border bg-card"
                  >
                    <Link to="/gamificacion-turistica/retos">
                      <Target className="h-4 w-4 text-emerald-500" /> Ver Retos & Misiones
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setCertModalOpen(true)}
                    variant="ghost"
                    className="rounded-2xl h-12 px-4 gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10"
                  >
                    <Award className="h-4 w-4 text-amber-500" /> Diploma de Conquistador
                  </Button>
                </div>
              </div>

              {/* Right Column: Hero Live Passport Teaser Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl p-6 bg-gradient-to-br from-card via-card to-primary/10 border-2 border-primary/30 shadow-xl overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl border border-primary/30 shadow-inner">
                        {currentMilestone?.icon || "🇩🇴"}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Pasaporte Nacional</p>
                        <h3 className="font-bold text-base text-foreground">
                          {user ? (currentMilestone?.label || "Explorador Iniciado") : "Viajero Invitado"}
                        </h3>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                      Nivel {userGamification?.current_level || 1}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                        <span className="text-muted-foreground">Progreso de Provincias</span>
                        <span className="text-primary font-bold">{totalProvinces} de 32 ({(totalProvinces / 32 * 100).toFixed(0)}%)</span>
                      </div>
                      <Progress value={(totalProvinces / 32) * 100} className="h-2.5 bg-muted" />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Puntos XP</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {(userGamification?.total_xp || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Monedas</p>
                        <p className="text-sm font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                          <Coins className="h-3 w-3" /> {userGamification?.coins || 0}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Racha</p>
                        <p className="text-sm font-black text-orange-500 mt-0.5 flex items-center justify-center gap-0.5">
                          <Flame className="h-3 w-3 fill-orange-500" /> {userGamification?.streak_days || 0}d
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-muted-foreground text-[11px]">Gremio Activo:</span>
                        <strong className="text-foreground text-[11px]">Guardianes del Caribe</strong>
                      </div>
                      <Link to="/gamificacion-turistica/perfil" className="text-primary text-[11px] font-bold hover:underline flex items-center gap-0.5">
                        Perfil <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[
                { icon: MapPin, value: `${totalProvinces}/32`, label: "Provincias Conquistadas", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
                { icon: Award, value: `${userAchievements.length} Ganadas`, label: "Insignias y Trofeos", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
                { icon: Zap, value: `${(userGamification?.total_xp || 0).toLocaleString()} XP`, label: "Experiencia Acumulada", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { icon: Users, value: `${localLeaderboard.length > 0 ? localLeaderboard.length : '150+'} Activos`, label: "Exploradores en Ranking", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${stat.bg} bg-card/80 backdrop-blur-sm flex items-center gap-3.5 shadow-sm`}>
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-base md:text-lg font-black ${stat.color}`}>{stat.value}</h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-none mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gamification Subroutes Grid Hub */}
        <section className="py-10 bg-card/30 border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">
                  Módulos y Actividades de Gamificación
                </h3>
                <p className="text-xs text-muted-foreground">Accede directamente a todos los subsistemas turísticos interactivos.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gamificationHubSubroutes.map((sub, i) => {
                const IconComponent = sub.icon;
                return (
                  <Link
                    key={i}
                    to={sub.link}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${sub.bg} ${sub.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {sub.tag}
                        </Badge>
                      </div>
                      <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {sub.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {sub.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                      <span>Ingresar al módulo</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Tabs Area */}
        <main className="container mx-auto px-4 max-w-6xl py-10 flex-1 space-y-10">
          {/* Community Missions Widget */}
          <CommunityMissionsWidget />

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            {/* Standard Non-Sticky Modern Tab Navigation */}
            <div className="py-2 border-b border-border/60">
              <TabsList className="bg-card p-1.5 rounded-2xl border border-border flex overflow-x-auto scrollbar-none h-auto gap-1">
                <TabsTrigger value="pasaporte" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <MapIcon className="h-4 w-4" /> Pasaporte Digital
                </TabsTrigger>
                <TabsTrigger value="provincias" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <MapPin className="h-4 w-4" /> 32 Provincias ({totalProvinces}/32)
                </TabsTrigger>
                <TabsTrigger value="insignias" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Award className="h-4 w-4" /> Álbum de Insignias
                </TabsTrigger>
                <TabsTrigger value="gremios" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Shield className="h-4 w-4" /> Gremios & Clanes
                </TabsTrigger>
                <TabsTrigger value="ranking" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Trophy className="h-4 w-4" /> Ranking Nacional
                </TabsTrigger>
                <TabsTrigger value="recompensas" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Gift className="h-4 w-4" /> Recompensas
                </TabsTrigger>
                <TabsTrigger value="formas" className="rounded-xl text-xs md:text-sm font-semibold gap-2 py-2.5 px-4 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 shadow-sm border border-amber-500/20 bg-amber-500/5">
                  <Sparkles className="h-4 w-4 text-amber-500" /> 14 Formas de Ganar
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Pasaporte Digital */}
            <TabsContent value="pasaporte" className="space-y-8">
              <PasaporteTab
                user={user}
                userGamification={userGamification}
                totalProvinces={totalProvinces}
                visitedProvinces={visitedProvinces}
                currentMilestone={currentMilestone}
                nextMilestone={nextMilestone}
                onGoToProvincias={() => handleTabChange("provincias")}
              />

              {/* Contextual In-feed Sponsorship Banner */}
              <div className="pt-4">
                <BannerAd placement="between-sections" size="billboard" showDemo />
              </div>
            </TabsContent>

            {/* TAB 2: Provincias */}
            <TabsContent value="provincias" className="space-y-6">
              <ProvinciasTab
                user={user}
                totalProvinces={totalProvinces}
                visitedProvinces={visitedProvinces}
                recordingVisit={recordingVisit}
                activeRegion={activeRegion}
                onActiveRegionChange={setActiveRegion}
                onVisitProvince={handleVisitProvince}
                regions={REGIONS}
              />
            </TabsContent>

            {/* TAB 3: Insignias */}
            <TabsContent value="insignias" className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 mb-2">
                      <Award className="h-3.5 w-3.5 mr-1" /> Colección Oficial de Trofeos
                    </Badge>
                    <h2 className="font-display text-2xl font-bold text-foreground">Álbum de Insignias Turísticas</h2>
                    <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                      Desbloquea insignias explorando monumentos, asistiendo a festividades patrias, saboreando gastronomía autóctona y completando retos de expedición.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <BadgeAlbum
                  badges={mappedBadges}
                  columns={4}
                />
              </div>
            </TabsContent>

            {/* TAB 4: Gremios & Clanes */}
            <TabsContent value="gremios" className="space-y-6">
              <ExplorerGuilds />
            </TabsContent>

            {/* TAB 5: Ranking */}
            <TabsContent value="ranking" className="space-y-6">
              <RankingTab
                user={user}
                regions={REGIONS}
                activeRankingRegion={activeRankingRegion}
                onActiveRankingRegionChange={setActiveRankingRegion}
                loadingLeaderboard={loadingLeaderboard}
                localLeaderboard={localLeaderboard}
              />
            </TabsContent>

            {/* TAB 6: Recompensas */}
            <TabsContent value="recompensas" className="space-y-6">
              <RecompensasTab cultureAchievements={cultureAchievements} isUnlocked={isUnlocked} />
            </TabsContent>

            {/* TAB 7: 14 Formas de Ganar Puntos */}
            <TabsContent value="formas" className="space-y-6">
              <ComoGanarPuntosSection onOpenModal={() => setPuntosModalOpen(true)} />
            </TabsContent>
          </Tabs>

          {/* Bottom High-Impact Panorama Ad placement - Single Clean Placement */}
          <section className="mt-16 pt-8 border-t border-border">
            <PanoramaAd showDemo />
          </section>
        </main>

        <Footer />
      </div>

      <CertificateModal
        open={certModalOpen}
        onOpenChange={setCertModalOpen}
        userName={user?.email?.split("@")[0] || "Explorador Quisqueyano"}
        totalProvinces={totalProvinces}
        totalXp={userGamification?.total_xp || 0}
        levelTitle={currentMilestone?.label || "Explorador Nacional"}
      />

      <ComoGanarPuntosModal
        open={puntosModalOpen}
        onOpenChange={setPuntosModalOpen}
      />
    </PageTransition>
  );
}
