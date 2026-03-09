import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Gift, Star, Trophy, Award, Ticket, Crown,
  Target, Flame, Users, Copy, ChevronRight, 
  Search, Sparkles, ShoppingBag, Medal, Zap,
  TrendingUp, Lock, Check, ArrowRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AchievementsTab } from "@/components/gamification/AchievementsTab";
import { LeaderboardTab } from "@/components/gamification/LeaderboardTab";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const missionCategoryIcons: Record<string, React.ReactNode> = {
  exploration: <Target className="h-4 w-4" />,
  social: <Users className="h-4 w-4" />,
  gastronomy: <Sparkles className="h-4 w-4" />,
  planning: <TrendingUp className="h-4 w-4" />,
  commerce: <ShoppingBag className="h-4 w-4" />,
  referral: <Gift className="h-4 w-4" />,
  engagement: <Flame className="h-4 w-4" />,
  culture: <Medal className="h-4 w-4" />,
};

export default function ClubRecompensas() {
  const { user } = useAuth();
  const {
    userGamification, levels, missions, userMissions,
    prizes, leaderboard, referralCode, loading,
    getCurrentLevel, getNextLevel, getXpProgress, redeemPrize
  } = useGamification();
  const [activeTab, setActiveTab] = useState("overview");
  const [prizeFilter, setPrizeFilter] = useState("all");
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data: achData } = await supabase
          .from('achievements')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (achData) setAchievements(achData);

        if (user) {
          const { data: userAchData } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', user.id);
          
          if (userAchData) setUserAchievements(userAchData);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const getMissionProgress = (missionId: string) => {
    return userMissions.find(um => um.mission_id === missionId);
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success("¡Código copiado!");
    }
  };

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-24 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Club de Recompensas
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Inicia sesión para ganar XP, completar misiones y canjear premios increíbles.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild><Link to="/login">Iniciar Sesión</Link></Button>
                <Button variant="outline" asChild><Link to="/registro">Registrarse</Link></Button>
              </div>
            </motion.div>

            {/* Show levels preview */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Niveles del Programa</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {levels.map((level, i) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-card border border-border text-center"
                  >
                    <span className="text-3xl mb-2 block">{level.icon}</span>
                    <p className="font-bold text-sm text-foreground">{level.title}</p>
                    <p className="text-xs text-muted-foreground">{level.xp_required} XP</p>
                    {level.marketplace_discount > 0 && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        -{level.marketplace_discount}% Marketplace
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero - User Stats */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
              {/* Left: User info */}
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl" style={{ borderColor: currentLevel?.color, borderWidth: 3 }}>
                    {currentLevel?.icon || "🌱"}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                      {currentLevel?.title || "Viajero"}
                    </h1>
                    <p className="text-muted-foreground">Nivel {userGamification?.current_level || 1}</p>
                  </div>
                </motion.div>

                {/* XP & Coins bars */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">XP Total</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{(userGamification?.total_xp || 0).toLocaleString()}</p>
                    {nextLevel && (
                      <>
                        <Progress value={xpProgress} className="h-1.5 mt-2 mb-1" />
                        <p className="text-xs text-muted-foreground">{nextLevel.xp_required - (userGamification?.total_xp || 0)} XP para {nextLevel.title}</p>
                      </>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Monedas</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{(userGamification?.coins || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Canjea por premios</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Racha</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{userGamification?.streak_days || 0} <span className="text-sm font-medium text-muted-foreground">días</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{userGamification?.total_missions_completed || 0} misiones</p>
                  </motion.div>
                </div>
              </div>

              {/* Right: Referral */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="w-full lg:w-80 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Invita Amigos</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Gana 100 XP + 50 monedas por cada amigo que se registre.
                </p>
                {referralCode && (
                  <div className="flex gap-2">
                    <Input value={referralCode} readOnly className="font-mono text-center font-bold" />
                    <Button size="icon" variant="outline" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {userGamification?.total_referrals || 0} referidos
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto mb-8">
              <TabsTrigger value="overview" className="gap-2"><Star className="h-4 w-4" />Resumen</TabsTrigger>
              <TabsTrigger value="missions" className="gap-2"><Target className="h-4 w-4" />Misiones</TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2"><Award className="h-4 w-4" />Logros</TabsTrigger>
              <TabsTrigger value="prizes" className="gap-2"><Gift className="h-4 w-4" />Premios</TabsTrigger>
              <TabsTrigger value="levels" className="gap-2"><TrendingUp className="h-4 w-4" />Niveles</TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Featured Missions */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Misiones Destacadas
                  </h2>
                  <div className="space-y-3">
                    {missions.filter(m => m.is_featured).slice(0, 4).map((mission, i) => {
                      const progress = getMissionProgress(mission.id);
                      return (
                        <motion.div
                          key={mission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-4 rounded-xl border transition-all ${
                            progress?.is_completed 
                              ? "bg-primary/5 border-primary/30" 
                              : "bg-card border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{mission.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-foreground text-sm">{mission.name}</h3>
                                {progress?.is_completed && <Check className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{mission.short_description}</p>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Zap className="h-3 w-3" /> {mission.xp_reward} XP
                                </Badge>
                                {mission.coin_reward > 0 && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Crown className="h-3 w-3" /> {mission.coin_reward}
                                  </Badge>
                                )}
                              </div>
                              {!progress?.is_completed && (
                                <Progress value={((progress?.progress || 0) / mission.target_count) * 100} className="h-1 mt-2" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <Button variant="ghost" className="w-full gap-2" onClick={() => setActiveTab("missions")}>
                      Ver todas las misiones <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Featured Prizes */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" /> Premios Destacados
                  </h2>
                  <div className="space-y-3">
                    {prizes.filter(p => p.is_featured).slice(0, 4).map((prize, i) => (
                      <motion.div
                        key={prize.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                            {prize.prize_type === "experience" ? "🎫" : "🎁"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-sm truncate">{prize.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{prize.short_description}</p>
                            {prize.sponsor && (
                              <p className="text-xs text-primary mt-1">por {prize.sponsor}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground">{prize.coin_cost}</p>
                            <p className="text-xs text-muted-foreground">monedas</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <Button variant="ghost" className="w-full gap-2" onClick={() => setActiveTab("prizes")}>
                      Ver catálogo completo <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Discount Banner */}
              {currentLevel && currentLevel.marketplace_discount > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <ShoppingBag className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-bold text-foreground text-lg">
                        {currentLevel.marketplace_discount}% de descuento en el Marketplace
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tu nivel {currentLevel.title} te da descuentos exclusivos en todas las compras.
                      </p>
                    </div>
                    <Button asChild><Link to="/marketplace">Ir al Marketplace</Link></Button>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* MISSIONS TAB */}
            <TabsContent value="missions">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missions.map((mission, i) => {
                  const progress = getMissionProgress(mission.id);
                  const isLocked = (userGamification?.current_level || 1) < mission.min_level;
                  return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-5 rounded-xl border transition-all ${
                        isLocked ? "bg-muted/50 border-border opacity-60" :
                        progress?.is_completed ? "bg-primary/5 border-primary/30" :
                        "bg-card border-border hover:border-primary/30 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{isLocked ? "🔒" : mission.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground">{mission.name}</h3>
                            {progress?.is_completed && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                          
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <Badge variant="secondary" className="text-xs gap-1">
                              {missionCategoryIcons[mission.category]} {mission.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {mission.mission_type === "daily" ? "Diaria" : mission.mission_type === "weekly" ? "Semanal" : "Única"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-xs gap-1">
                                <Zap className="h-3 w-3" /> {mission.xp_reward} XP
                              </Badge>
                              {mission.coin_reward > 0 && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                                  <Crown className="h-3 w-3" /> {mission.coin_reward}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {!isLocked && !progress?.is_completed && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progreso</span>
                                <span>{progress?.progress || 0}/{mission.target_count}</span>
                              </div>
                              <Progress value={((progress?.progress || 0) / mission.target_count) * 100} className="h-1.5" />
                            </div>
                          )}

                          {isLocked && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Requiere nivel {mission.min_level}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* PRIZES TAB */}
            <TabsContent value="prizes">
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {["all", "experience", "product"].map(f => (
                  <Button key={f} variant={prizeFilter === f ? "default" : "outline"} size="sm" className="rounded-full"
                    onClick={() => setPrizeFilter(f)}>
                    {f === "all" ? "Todos" : f === "experience" ? "🎫 Experiencias" : "🎁 Productos"}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prizes.filter(p => prizeFilter === "all" || p.prize_type === prizeFilter).map((prize, i) => {
                  const canAfford = (userGamification?.coins || 0) >= prize.coin_cost;
                  const meetsLevel = (userGamification?.current_level || 1) >= prize.min_level;
                  return (
                    <motion.div
                      key={prize.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg hover:border-primary/30 transition-all"
                    >
                      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-6xl">{prize.prize_type === "experience" ? "🎫" : "🎁"}</span>
                        {prize.is_featured && (
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">⭐ Destacado</Badge>
                        )}
                        {prize.sponsor && (
                          <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                            {prize.sponsor}
                          </Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-foreground mb-1">{prize.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{prize.description}</p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {prize.min_level > 1 && (
                            <Badge variant={meetsLevel ? "secondary" : "destructive"} className="text-xs gap-1">
                              {meetsLevel ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              Nivel {prize.min_level}+
                            </Badge>
                          )}
                          {prize.quantity_available && (
                            <Badge variant="outline" className="text-xs">
                              {prize.quantity_available - prize.quantity_redeemed} disponibles
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <span className="text-2xl font-bold text-foreground">{prize.coin_cost}</span>
                            <span className="text-sm text-muted-foreground ml-1">monedas</span>
                          </div>
                          <Button 
                            size="sm" 
                            disabled={!canAfford || !meetsLevel}
                            onClick={() => redeemPrize(prize.id)}
                          >
                            {!meetsLevel ? "Nivel insuficiente" : !canAfford ? "Sin fondos" : "Canjear"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ACHIEVEMENTS TAB */}
            <TabsContent value="achievements">
              {loadingAchievements ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              ) : (
                <AchievementsTab 
                  achievements={achievements}
                  userAchievements={userAchievements}
                />
              )}
            </TabsContent>

            {/* LEVELS TAB */}
            <TabsContent value="levels">
              <div className="max-w-3xl mx-auto space-y-4">
                {levels.map((level, i) => {
                  const isCurrent = level.level_number === (userGamification?.current_level || 1);
                  const isUnlocked = (userGamification?.total_xp || 0) >= level.xp_required;
                  return (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-6 rounded-xl border transition-all ${
                        isCurrent ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20" :
                        isUnlocked ? "bg-card border-border" :
                        "bg-muted/30 border-border opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl" style={{ filter: isUnlocked ? "none" : "grayscale(100%)" }}>
                          {level.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-foreground">{level.title}</h3>
                            {isCurrent && <Badge className="bg-primary text-primary-foreground">Actual</Badge>}
                            {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground">Nivel {level.level_number} — {level.xp_required.toLocaleString()} XP requeridos</p>
                        </div>
                        {level.marketplace_discount > 0 && (
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{ color: level.color }}>-{level.marketplace_discount}%</p>
                            <p className="text-xs text-muted-foreground">Marketplace</p>
                          </div>
                        )}
                      </div>
                      {level.perks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {level.perks.map((perk, pi) => (
                            <Badge key={pi} variant="outline" className="text-xs">
                              {isUnlocked ? <Check className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                              {perk}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* LEADERBOARD TAB */}
            <TabsContent value="leaderboard">
              <LeaderboardTab 
                leaderboard={leaderboard}
                currentUserId={user?.id}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* How It Works */}
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-12">
              ¿Cómo funciona?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: "🎯", title: "Completa Misiones", desc: "Explora, reseña, compra y comparte para ganar XP y monedas." },
                { icon: "⬆️", title: "Sube de Nivel", desc: "Acumula XP para desbloquear niveles con más beneficios." },
                { icon: "🛍️", title: "Descuentos Marketplace", desc: "Cada nivel te da mayor descuento en el Marketplace." },
                { icon: "🎁", title: "Canjea Premios", desc: "Usa tus monedas para experiencias, daypass, cenas y más." },
              ].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} className="text-center">
                  <span className="text-4xl mb-3 block">{step.icon}</span>
                  <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
