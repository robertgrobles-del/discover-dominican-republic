import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MapPin, Trophy, Award, Zap, Map as MapIcon, Users, Compass, Gift, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { BadgeAlbum, BadgeItem, BadgeRarity } from "@/components/gamification/BadgeAlbum";
import { ExplorerGuilds } from "@/components/gamification/ExplorerGuilds";
import { BetweenSectionsAd, PanoramaAd, MobileStickyFooterAd } from "@/components/promo";
import { PROVINCE_MILESTONES } from "@/data/gamificacionTuristicaData";
import { PasaporteTab } from "@/components/gamificacion-turistica/PasaporteTab";
import { ProvinciasTab } from "@/components/gamificacion-turistica/ProvinciasTab";
import { RankingTab } from "@/components/gamificacion-turistica/RankingTab";
import { RecompensasTab } from "@/components/gamificacion-turistica/RecompensasTab";

const REGIONS = ["all", "Norte", "Sur", "Este", "Cibao"];

export default function GamificacionTuristica() {
  const { user } = useAuth();
  const { userGamification } = useGamification();

  const [activeTab, setActiveTab] = useState("pasaporte");
  const [visitedProvinces, setVisitedProvinces] = useState<Set<string>>(new Set());
  const [totalProvinces, setTotalProvinces] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [recordingVisit, setRecordingVisit] = useState<string | null>(null);
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
                <Compass className="h-4 w-4" /> Pasaporte Digital
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                32 provincias, un mapa por completar
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
                  { icon: Users, value: localLeaderboard.length, label: "Exploradores activos", color: "text-purple-500" },
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
              <TabsTrigger value="pasaporte" className="gap-2"><MapIcon className="h-4 w-4" />Pasaporte Digital</TabsTrigger>
              <TabsTrigger value="gremios" className="gap-2"><Shield className="h-4 w-4" />Gremios & Clanes</TabsTrigger>
              <TabsTrigger value="insignias" className="gap-2"><Award className="h-4 w-4" />Insignias Turísticas</TabsTrigger>
              <TabsTrigger value="provincias" className="gap-2"><MapPin className="h-4 w-4" />Provincias</TabsTrigger>
              <TabsTrigger value="ranking" className="gap-2"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>
              <TabsTrigger value="recompensas" className="gap-2"><Gift className="h-4 w-4" />Recompensas</TabsTrigger>
            </TabsList>

            <TabsContent value="pasaporte">
              <PasaporteTab
                user={user}
                userGamification={userGamification}
                totalProvinces={totalProvinces}
                visitedProvinces={visitedProvinces}
                currentMilestone={currentMilestone}
                nextMilestone={nextMilestone}
                onGoToProvincias={() => setActiveTab("provincias")}
              />
            </TabsContent>

            <TabsContent value="gremios">
              <ExplorerGuilds />
            </TabsContent>

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

            <TabsContent value="provincias">
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

            <TabsContent value="ranking">
              <RankingTab
                user={user}
                regions={REGIONS}
                activeRankingRegion={activeRankingRegion}
                onActiveRankingRegionChange={setActiveRankingRegion}
                loadingLeaderboard={loadingLeaderboard}
                localLeaderboard={localLeaderboard}
              />
            </TabsContent>

            <TabsContent value="recompensas">
              <RecompensasTab cultureAchievements={cultureAchievements} isUnlocked={isUnlocked} />
            </TabsContent>
          </Tabs>
        </div>

        {/* High Impact Gamification & Sponsoring Banner */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <BetweenSectionsAd showDemo />
        <MobileStickyFooterAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
