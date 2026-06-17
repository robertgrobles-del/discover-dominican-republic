import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  MapPin, Trophy, Star, Award, Zap, Crown, Flame,
  Target, Map, Users, CheckCircle2, Lock, TrendingUp,
  Compass, Mountain, Waves, Utensils, Ship, Camera,
  BookOpen, Gift, ChevronRight, Globe2, Medal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { BadgeAlbum, BadgeItem, BadgeRarity } from "@/components/gamification/BadgeAlbum";

// All 32 provinces of Dominican Republic
const PROVINCES = [
  { name: "Azua", region: "Sur", emoji: "🌵" },
  { name: "Bahoruco", region: "Sur", emoji: "🏔️" },
  { name: "Barahona", region: "Sur", emoji: "🌊" },
  { name: "Dajabón", region: "Norte", emoji: "🌿" },
  { name: "Duarte", region: "Cibao", emoji: "🌾" },
  { name: "Elías Piña", region: "Sur", emoji: "🦅" },
  { name: "El Seibo", region: "Este", emoji: "🌴" },
  { name: "Espaillat", region: "Cibao", emoji: "☕" },
  { name: "Hato Mayor", region: "Este", emoji: "🐄" },
  { name: "Hermanas Mirabal", region: "Cibao", emoji: "🌸" },
  { name: "Independencia", region: "Sur", emoji: "🏞️" },
  { name: "La Altagracia", region: "Este", emoji: "⛪" },
  { name: "La Romana", region: "Este", emoji: "🎭" },
  { name: "La Vega", region: "Cibao", emoji: "🎪" },
  { name: "María Trinidad Sánchez", region: "Norte", emoji: "🏖️" },
  { name: "Monseñor Nouel", region: "Cibao", emoji: "💧" },
  { name: "Monte Cristi", region: "Norte", emoji: "🗿" },
  { name: "Monte Plata", region: "Este", emoji: "🌳" },
  { name: "Pedernales", region: "Sur", emoji: "🦜" },
  { name: "Peravia", region: "Sur", emoji: "🏛️" },
  { name: "Puerto Plata", region: "Norte", emoji: "🚡" },
  { name: "Samaná", region: "Norte", emoji: "🐋" },
  { name: "San Cristóbal", region: "Sur", emoji: "⚓" },
  { name: "San José de Ocoa", region: "Sur", emoji: "🍃" },
  { name: "San Juan", region: "Sur", emoji: "🌄" },
  { name: "San Pedro de Macorís", region: "Este", emoji: "⚾" },
  { name: "Sánchez Ramírez", region: "Cibao", emoji: "🏺" },
  { name: "Santiago", region: "Cibao", emoji: "🏙️" },
  { name: "Santiago Rodríguez", region: "Cibao", emoji: "🌲" },
  { name: "Valverde", region: "Cibao", emoji: "🌺" },
  { name: "Santo Domingo", region: "Sur", emoji: "🏛️" },
  { name: "Distrito Nacional", region: "Sur", emoji: "🌆" },
];

const TOURISM_BADGES = [
  {
    key: "beaches",
    icon: "🏖️",
    name: "Amante de Playas",
    desc: "Explora playas paradisíacas de RD",
    detail: "Visita Punta Cana, Samaná, Barahona y más",
    xp: 150,
    link: "/playas",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
  },
  {
    key: "culture",
    icon: "🏛️",
    name: "Explorador Cultural",
    desc: "Descubre la historia dominicana",
    detail: "Museos, monumentos, zona colonial",
    xp: 150,
    link: "/cultura",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
  },
  {
    key: "food",
    icon: "🍽️",
    name: "Foodie RD",
    desc: "Gastronomía dominicana auténtica",
    detail: "Reseña restaurantes y platos típicos",
    xp: 150,
    link: "/guia-gastronomica",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
  },
  {
    key: "adventure",
    icon: "⛰️",
    name: "Aventurero Nacional",
    desc: "Conquista la naturaleza dominicana",
    detail: "Senderismo, rafting, ecoturismo",
    xp: 250,
    link: "/ecoturismo",
    color: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
  },
  {
    key: "cruises",
    icon: "🚢",
    name: "Crucerista",
    desc: "Mares y puertos dominicanos",
    detail: "Puertos, marinas y cruceros",
    xp: 100,
    link: "/nautica-cruceros",
    color: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/30",
  },
];

const PROVINCE_MILESTONES = [
  { count: 1,  icon: "📍", label: "Visitante",          rarity: "common",    xp: 50  },
  { count: 5,  icon: "🗺️", label: "Explorador Regional", rarity: "uncommon",  xp: 100 },
  { count: 15, icon: "🧭", label: "Gran Explorador",    rarity: "rare",      xp: 200 },
  { count: 32, icon: "🌟", label: "Embajador",          rarity: "legendary", xp: 500 },
];

const REGION_COLORS: Record<string, string> = {
  "Norte":  "bg-blue-500/10 text-blue-600 border-blue-200",
  "Sur":    "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "Este":   "bg-amber-500/10 text-amber-600 border-amber-200",
  "Cibao":  "bg-purple-500/10 text-purple-600 border-purple-200",
};

export default function GamificacionTuristica() {
  const { user } = useAuth();
  const { userGamification, loading } = useGamification();

  const [activeTab, setActiveTab] = useState("pasaporte");
  const [visitedProvinces, setVisitedProvinces] = useState<Set<string>>(new Set());
  const [totalProvinces, setTotalProvinces] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [recordingVisit, setRecordingVisit] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeRegion, setActiveRegion] = useState("all");

  const [activeRankingRegion, setActiveRankingRegion] = useState("all");
  const [localLeaderboard, setLocalLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

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

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const { data: levels } = await supabase
          .from("gamification_levels")
          .select("level_number, icon, title");
        const levelMap = new Map(levels?.map(l => [l.level_number, l]) || []);

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
    if (!user) { setLoadingData(false); return; }
    setLoadingData(true);
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
    } finally {
      setLoadingData(false);
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

  const currentMilestone = PROVINCE_MILESTONES.filter(m => totalProvinces >= m.count).at(-1);
  const nextMilestone = PROVINCE_MILESTONES.find(m => totalProvinces < m.count);
  const progressToNext = nextMilestone
    ? Math.round((totalProvinces / nextMilestone.count) * 100)
    : 100;

  const filteredProvinces = activeRegion === "all"
    ? PROVINCES
    : PROVINCES.filter(p => p.region === activeRegion);

  const regions = ["all", "Norte", "Sur", "Este", "Cibao"];

  const tourismAchievements = achievements.filter(a => a.category === "tourism_type");
  const provinceAchievements = achievements.filter(a => a.category === "provinces");
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
      link: "/retos"
    };
  });

  return (
    <PageTransition>
      <SEOHead
        title="Gamificación Turística - Descubre RD"
        description="Pasaporte digital de destinos, insignias por provincias, retos turísticos y ranking de exploradores de República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-amber-500/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
              <Badge className="bg-primary/10 text-primary mb-4 text-sm border-primary/20 gap-2">
                <Compass className="h-4 w-4" /> Gamificación Turística
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Explora · Colecciona · Conquista
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Tu pasaporte digital para descubrir las 32 provincias, ganar insignias turísticas y competir con exploradores de todo el país.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  { icon: MapPin, value: `${totalProvinces}/32`, label: "Provincias visitadas", color: "text-primary" },
                  { icon: Award, value: userAchievements.length, label: "Insignias ganadas", color: "text-amber-500" },
                  { icon: Zap, value: `${(userGamification?.total_xp || 0).toLocaleString()}`, label: "XP Total", color: "text-emerald-500" },
                  { icon: Users, value: leaderboard.length, label: "Exploradores activos", color: "text-purple-500" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="text-center">
                    <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 pb-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto mb-8 h-auto flex-wrap gap-1">
              <TabsTrigger value="pasaporte" className="gap-2"><Map className="h-4 w-4" />Pasaporte Digital</TabsTrigger>
              <TabsTrigger value="insignias" className="gap-2"><Award className="h-4 w-4" />Insignias Turísticas</TabsTrigger>
              <TabsTrigger value="provincias" className="gap-2"><MapPin className="h-4 w-4" />Provincias</TabsTrigger>
              <TabsTrigger value="ranking" className="gap-2"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>
              <TabsTrigger value="recompensas" className="gap-2"><Gift className="h-4 w-4" />Recompensas</TabsTrigger>
            </TabsList>

            {/* ===================== PASAPORTE DIGITAL ===================== */}
            <TabsContent value="pasaporte">
              <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                {/* Main passport card */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8"
                  >
                    {/* Passport decorative dots */}
                    <div className="absolute top-4 right-4 grid grid-cols-4 gap-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                      ))}
                    </div>

                    <div className="flex items-start gap-6 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl border-2 border-primary/20">
                        {currentMilestone?.icon || "🌱"}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">República Dominicana</p>
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          {user ? (currentMilestone?.label || "Explorador Nuevo") : "Pasaporte Turístico"}
                        </h2>
                        <p className="text-primary font-medium">{userGamification?.total_xp?.toLocaleString() || 0} XP acumulados</p>
                      </div>
                    </div>

                    {/* Province Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Provincias Visitadas</span>
                        <span className="text-sm font-bold text-primary">{totalProvinces} / 32</span>
                      </div>
                      <Progress value={(totalProvinces / 32) * 100} className="h-3" />
                      {nextMilestone && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {nextMilestone.count - totalProvinces} provincias más para "{nextMilestone.label}" (+{nextMilestone.xp} XP)
                        </p>
                      )}
                    </div>

                    {/* Milestone badges */}
                    <div className="grid grid-cols-4 gap-3">
                      {PROVINCE_MILESTONES.map(milestone => {
                        const achieved = totalProvinces >= milestone.count;
                        return (
                          <div key={milestone.count} className={`rounded-xl p-3 text-center border transition-all ${
                            achieved
                              ? "bg-primary/10 border-primary/30"
                              : "bg-muted/30 border-border opacity-50"
                          }`}>
                            <span className={`text-2xl block mb-1 ${!achieved && "grayscale"}`}>{milestone.icon}</span>
                            <p className="text-xs font-medium text-foreground">{milestone.label}</p>
                            <p className="text-xs text-muted-foreground">{milestone.count} prov.</p>
                            {achieved && <CheckCircle2 className="h-3 w-3 text-primary mx-auto mt-1" />}
                          </div>
                        );
                      })}
                    </div>

                    {!user && (
                      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                        <p className="text-sm text-muted-foreground mb-3">Inicia sesión para activar tu pasaporte digital</p>
                        <div className="flex gap-2 justify-center">
                          <Button asChild size="sm"><Link to="/login">Iniciar Sesión</Link></Button>
                          <Button asChild size="sm" variant="outline"><Link to="/registro">Registrarse</Link></Button>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Quick links */}
                  <div className="grid sm:grid-cols-3 gap-4 mt-6">
                    {[
                      { icon: MapPin, label: "Ver mapa de misiones", href: "/mapa-misiones", color: "text-blue-500" },
                      { icon: Target, label: "Ir a retos turísticos", href: "/retos", color: "text-emerald-500" },
                      { icon: BookOpen, label: "Club de recompensas", href: "/club-recompensas", color: "text-amber-500" },
                    ].map(link => (
                      <Button key={link.href} asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                        <Link to={link.href}>
                          <link.icon className={`h-5 w-5 ${link.color}`} />
                          <span className="text-xs">{link.label}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sidebar: Recent activity & top provinces */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-primary" /> Tu Mapa de Conquistas
                    </h3>
                    {visitedProvinces.size === 0 ? (
                      <div className="text-center py-6">
                        <Map className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Aún no has visitado ninguna provincia</p>
                        <Button size="sm" className="mt-3" onClick={() => setActiveTab("provincias")}>
                          Explorar provincias
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {[...visitedProvinces].map(p => {
                          const prov = PROVINCES.find(pr => pr.name === p);
                          return (
                            <span key={p} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 border border-primary/20">
                              {prov?.emoji} {p}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                    <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" /> Racha Actual
                    </h3>
                    <p className="text-3xl font-bold text-orange-500 mb-1">
                      {userGamification?.streak_days || 0} <span className="text-sm font-normal text-muted-foreground">días</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Entra todos los días para mantener tu racha</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ===================== INSIGNIAS TURÍSTICAS ===================== */}
            <TabsContent value="insignias">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Álbum de Insignias Turísticas</h2>
                <p className="text-muted-foreground text-sm">Colecciona logros explorando las provincias de República Dominicana, visitando patrimonios, participando en eventos y completando misiones.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <BadgeAlbum 
                  badges={mappedBadges} 
                  columns={4}
                />
              </div>
            </TabsContent>

            {/* ===================== MAPA DE PROVINCIAS ===================== */}
            <TabsContent value="provincias">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Mapa de Provincias</h2>
                  <p className="text-muted-foreground text-sm">Marca las provincias que has visitado y gana 25 XP por cada una</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Visitada</span>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30 ml-3" />
                  <span className="text-muted-foreground">Sin visitar</span>
                </div>
              </div>

              {/* Region filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {regions.map(r => (
                  <Button
                    key={r}
                    variant={activeRegion === r ? "default" : "outline"}
                    size="sm"
                    className="rounded-full flex-shrink-0"
                    onClick={() => setActiveRegion(r)}
                  >
                    {r === "all" ? "🗺️ Todas" : r}
                  </Button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="p-4 rounded-xl bg-card border border-border mb-6">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium text-foreground">Progreso total</span>
                  <span className="text-primary font-bold">{totalProvinces} / 32 provincias</span>
                </div>
                <Progress value={(totalProvinces / 32) * 100} className="h-2" />
              </div>

              {/* Province grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredProvinces.map((prov, i) => {
                    const visited = visitedProvinces.has(prov.name);
                    const isRecording = recordingVisit === prov.name;
                    return (
                      <motion.button
                        key={prov.name}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleVisitProvince(prov.name)}
                        disabled={visited || isRecording || !user}
                        className={`relative rounded-xl p-3 text-center border-2 transition-all text-left w-full ${
                          visited
                            ? "bg-primary/10 border-primary/40 shadow-sm"
                            : "bg-card border-border hover:border-primary/30 hover:bg-primary/5"
                        } disabled:cursor-default`}
                      >
                        {visited && (
                          <div className="absolute top-1.5 right-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <span className="text-xl block mb-1">{prov.emoji}</span>
                        <p className="text-xs font-semibold text-foreground leading-tight">{prov.name}</p>
                        <Badge className={`text-[9px] mt-1 px-1.5 py-0.5 ${REGION_COLORS[prov.region]}`}>
                          {prov.region}
                        </Badge>
                        {isRecording && (
                          <div className="absolute inset-0 rounded-xl bg-primary/20 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {!visited && !isRecording && user && (
                          <p className="text-[9px] text-muted-foreground mt-1">+25 XP</p>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {!user && (
                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-muted-foreground mb-4">Inicia sesión para registrar tus visitas y ganar XP</p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild><Link to="/login">Iniciar Sesión</Link></Button>
                    <Button asChild variant="outline"><Link to="/registro">Crear Cuenta</Link></Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ===================== RANKING DE EXPLORADORES ===================== */}
            <TabsContent value="ranking">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Ranking de Exploradores</h2>
                  <p className="text-muted-foreground">Los mejores descubridores de República Dominicana</p>
                </div>

                {/* Region Filter Buttons */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-1 justify-center">
                  {regions.map(r => (
                    <Button
                      key={r}
                      variant={activeRankingRegion === r ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-shrink-0"
                      onClick={() => setActiveRankingRegion(r)}
                    >
                      {r === "all" ? "🗺️ Todas las Regiones" : r}
                    </Button>
                  ))}
                </div>

                {/* Top 3 podium */}
                {!loadingLeaderboard && localLeaderboard.length >= 3 && (
                  <div className="grid grid-cols-3 gap-4 mb-8 items-end">
                    {[localLeaderboard[1], localLeaderboard[0], localLeaderboard[2]].map((entry, idx) => {
                      const positions = [2, 1, 3];
                      const pos = positions[idx];
                      const heights = ["h-28", "h-36", "h-24"];
                      const colors = [
                        "from-gray-400 to-gray-300",
                        "from-amber-400 to-yellow-300",
                        "from-orange-400 to-amber-300"
                      ];
                      const medals = ["🥈", "🥇", "🥉"];
                      if (!entry) return <div key={idx} />;
                      return (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-2xl mb-2">{medals[idx]}</span>
                          <Link to={`/explorador/${entry.user_id}`} className="hover:scale-105 transition-transform">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-2 border-2 border-primary/20">
                              {entry.level_icon || "🌱"}
                            </div>
                          </Link>
                          <Link 
                            to={`/explorador/${entry.user_id}`}
                            className="font-bold text-xs text-foreground text-center truncate w-full px-1 hover:text-primary"
                          >
                            {entry.display_name}
                          </Link>
                          <p className="text-xs text-muted-foreground mb-2">{entry.total_xp.toLocaleString()} XP</p>
                          <div className={`w-full ${heights[idx]} rounded-t-xl bg-gradient-to-t ${colors[idx]} flex items-start justify-center pt-2`}>
                            <span className="text-lg font-black text-white">#{pos}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Full ranking list */}
                <div className="space-y-2">
                  {loadingLeaderboard ? (
                    Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
                  ) : localLeaderboard.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-2xl">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground text-sm">No hay exploradores registrados en esta región todavía.</p>
                    </div>
                  ) : (
                    localLeaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.user_id === user?.id;
                      const rankColors = idx === 0 ? "text-amber-500" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-orange-600" : "text-muted-foreground";
                      return (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                            isCurrentUser
                              ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                              : "bg-card border-border hover:border-primary/20"
                          }`}
                        >
                          <span className={`w-8 text-center font-black text-lg ${rankColors}`}>
                            #{idx + 1}
                          </span>
                          <Link to={`/explorador/${entry.user_id}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0 hover:scale-105 transition-transform">
                              {entry.level_icon || "🌱"}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/explorador/${entry.user_id}`}
                                className="font-semibold text-foreground text-sm truncate hover:text-primary"
                              >
                                {entry.display_name}
                              </Link>
                              {isCurrentUser && <Badge className="text-xs bg-primary text-primary-foreground">Tú</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{entry.level_title}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-foreground text-sm">{entry.total_xp.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">XP</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-primary text-sm">{entry.total_missions_completed}</p>
                            <p className="text-xs text-muted-foreground">misiones</p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {!user && (
                  <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                    <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <p className="font-bold text-foreground mb-2">¡Únete al ranking!</p>
                    <p className="text-muted-foreground text-sm mb-4">Regístrate, completa retos y escala posiciones</p>
                    <Button asChild><Link to="/registro">Crear Cuenta Gratis</Link></Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ===================== RECOMPENSAS CULTURALES ===================== */}
            <TabsContent value="recompensas">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Recompensas Culturales</h2>
                <p className="text-muted-foreground">Gana recompensas especiales por descubrir la cultura dominicana</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cultural categories */}
                <div className="lg:col-span-2 space-y-6">
                  {[
                    {
                      title: "Patrimonio Histórico",
                      icon: "🏛️",
                      desc: "Visita sitios declarados patrimonio y deja reseñas",
                      actions: [
                        { label: "Ver museos y monumentos", href: "/cultura", xp: 25 },
                        { label: "Zona Colonial", href: "/destino/zona-colonial", xp: 30 },
                        { label: "Fortaleza Ozama", href: "/destinos", xp: 30 },
                      ],
                    },
                    {
                      title: "Gastronomía y Tradiciones",
                      icon: "🍽️",
                      desc: "Descubre la cocina y tradiciones dominicanas",
                      actions: [
                        { label: "Guía gastronómica", href: "/guia-gastronomica", xp: 20 },
                        { label: "Cultura del café", href: "/cultura-cafe", xp: 25 },
                        { label: "Cultura del tabaco", href: "/cultura-tabaco", xp: 25 },
                      ],
                    },
                    {
                      title: "Arte y Música",
                      icon: "🎭",
                      desc: "Sumérgete en el merengue, el arte y la cultura viva",
                      actions: [
                        { label: "Escuela de ritmos", href: "/escuela-ritmos", xp: 20 },
                        { label: "Historia de RD", href: "/historia-rd", xp: 20 },
                        { label: "Pasaporte digital", href: "/pasaporte-digital", xp: 15 },
                      ],
                    },
                  ].map(category => (
                    <div key={category.title} className="p-6 rounded-2xl bg-card border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h3 className="font-bold text-foreground">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">{category.desc}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {category.actions.map(action => (
                          <Link
                            key={action.href}
                            to={action.href}
                            className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-primary/5 border border-border hover:border-primary/20 transition-all group"
                          >
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                              {action.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Zap className="h-2.5 w-2.5" /> +{action.xp} XP
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sidebar: All cultural achievements */}
                <div className="space-y-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Medal className="h-4 w-4 text-amber-500" /> Insignias Culturales
                  </h3>
                  {cultureAchievements.length === 0
                    ? [
                        { icon: "🏺", name: "Guardián del Patrimonio", desc: "Reseña 3 sitios históricos", xp: 175 },
                        { icon: "✍️", name: "Cronista Dominicano", desc: "10 comentarios en el feed", xp: 120 },
                        { icon: "👨‍🍳", name: "Coleccionista de Sabores", desc: "5 tipos de gastronomía", xp: 150 },
                      ].map(ach => (
                        <div key={ach.name} className="p-4 rounded-xl bg-card border border-border">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl grayscale">{ach.icon}</span>
                            <div>
                              <p className="font-medium text-foreground text-sm">{ach.name}</p>
                              <p className="text-xs text-muted-foreground">{ach.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs gap-1">
                              <Zap className="h-2.5 w-2.5" /> {ach.xp} XP
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-2.5 w-2.5 mr-1" /> Bloqueado
                            </Badge>
                          </div>
                        </div>
                      ))
                    : cultureAchievements.map(ach => {
                        const earned = isUnlocked(ach.id);
                        return (
                          <div key={ach.id} className={`p-4 rounded-xl border transition-all ${
                            earned ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border"
                          }`}>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-2xl ${!earned && "grayscale opacity-60"}`}>{ach.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium text-foreground text-sm">{ach.name}</p>
                                <p className="text-xs text-muted-foreground">{ach.short_description}</p>
                              </div>
                              {earned && <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0" />}
                            </div>
                            {!earned && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Zap className="h-2.5 w-2.5" /> {ach.xp_reward} XP al completar
                              </Badge>
                            )}
                          </div>
                        );
                      })
                  }

                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link to="/club-recompensas">
                      <Gift className="h-4 w-4" /> Ver todas las recompensas
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
