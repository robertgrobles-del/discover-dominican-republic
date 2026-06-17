import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Star, Target, Flame, Crown, Map, Compass, Zap,
  Award, Gift, Users, Gamepad2, BookOpen, Camera, Route,
  ChevronRight, Play, Shield, Sparkles, TrendingUp, Medal,
  Clock, Calendar, ArrowRight, Gem
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { useActionTracker } from "@/hooks/useActionTracker";
import { MissionCard } from "@/components/gamification/MissionCard";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { LeagueWidget } from "@/components/gamification/LeagueWidget";
import { OnboardingQuest } from "@/components/gamification/OnboardingQuest";
import { PhotoChallenge } from "@/components/gamification/PhotoChallenge";
import { FloatingXPBar } from "@/components/gamification/FloatingXPBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialFeed } from "@/components/gamification/SocialFeed";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: Target, title: "Retos Turísticos", desc: "Completa misiones de exploración, gastronomía y cultura", link: "/retos-turisticos", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Map, title: "Mapa de Misiones", desc: "Descubre retos cercanos en el mapa interactivo", link: "/mapa-misiones", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: BookOpen, title: "Trivia Turística", desc: "Pon a prueba tus conocimientos del país", link: "/trivia-turistica", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Award, title: "Insignias", desc: "Colecciona badges explorando destinos", link: "/badges", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Gem, title: "Coleccionables", desc: "Desbloquea souvenirs digitales únicos", link: "/souvenirs-digitales", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Gift, title: "Recompensas", desc: "Canjea monedas por experiencias exclusivas", link: "/club-recompensas", color: "text-primary", bg: "bg-primary/10" },
];

const howItWorks = [
  { step: 1, icon: Compass, title: "Explora", desc: "Visita destinos, playas, restaurantes y museos en toda RD" },
  { step: 2, icon: Target, title: "Completa Retos", desc: "Activa misiones de exploración, gastronomía, cultura y fotografía" },
  { step: 3, icon: Zap, title: "Gana XP y Monedas", desc: "Cada acción te da puntos de experiencia y monedas virtuales" },
  { step: 4, icon: TrendingUp, title: "Sube de Nivel", desc: "Desbloquea nuevos retos, insignias y descuentos exclusivos" },
  { step: 5, icon: Gift, title: "Canjea Premios", desc: "Usa tus monedas para obtener experiencias y beneficios reales" },
];

export default function GamificacionHub() {
  const { user } = useAuth();
  const {
    userGamification, levels, missions, userMissions, leaderboard, loading,
    getCurrentLevel, getNextLevel, getXpProgress, awardXp
  } = useGamification();
  const { trackDailyCheckin } = useActionTracker();
  const [checkedIn, setCheckedIn] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number | null>(null);

  // Story Quest State
  const [storyStage, setStoryStage] = useState<number>(() => {
    const saved = localStorage.getItem("amber_story_stage");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [storyCompleted, setStoryCompleted] = useState<boolean>(() => {
    return localStorage.getItem("amber_story_completed") === "true";
  });

  const handleAdvanceStory = async () => {
    if (!user) {
      toast.error("Inicia sesión para participar en la historia.");
      return;
    }
    
    const rewards = [
      { xp: 30, coins: 10, desc: "Rumor en Santiago completado" },
      { xp: 50, coins: 15, desc: "Búsqueda en mina de Puerto Plata completada" },
      { xp: 40, coins: 10, desc: "Pulido de la gema completado" },
      { xp: 60, coins: 20, desc: "Visita al Museo del Ámbar completada" },
      { xp: 100, coins: 50, desc: "¡Revelaste el secreto del Ámbar Dominicano!" },
    ];

    const currentReward = rewards[storyStage - 1];
    
    // Call awardXp
    await awardXp(currentReward.xp, currentReward.coins, `📖 Historia: ${currentReward.desc}`);

    if (storyStage < 5) {
      const next = storyStage + 1;
      setStoryStage(next);
      localStorage.setItem("amber_story_stage", next.toString());
      toast.success(`¡Misión completada! Siguiente paso: ${next}/5`);
    } else {
      setStoryCompleted(true);
      localStorage.setItem("amber_story_completed", "true");
      
      // Auto unlock 'Ámbar Dominicano' achievement
      try {
        const { data: ach } = await supabase
          .from("achievements")
          .select("id")
          .eq("name", "Ámbar Dominicano")
          .maybeSingle();
        
        if (ach) {
          await supabase.rpc("unlock_user_achievement", {
            target_achievement_id: ach.id
          });
          toast.success("🏆 ¡Desbloqueaste la insignia: Ámbar Dominicano!", {
            description: "Has completado la historia del Ámbar"
          });
        }
      } catch (err) {
        console.error("Error auto-unlocking amber badge:", err);
      }
    }
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();
  const featuredMissions = missions.filter(m => m.is_featured).slice(0, 6);

  // Daily missions
  const dailyMissions = useMemo(() => missions.filter(m => m.mission_type === "daily").slice(0, 3), [missions]);
  const weeklyMissions = useMemo(() => missions.filter(m => m.mission_type === "weekly").slice(0, 3), [missions]);

  // Auto daily check-in
  useEffect(() => {
    if (user && !checkedIn) {
      trackDailyCheckin().then(result => {
        if (result) setCheckedIn(true);
      });
    }
  }, [user, checkedIn, trackDailyCheckin]);

  // Detect level up (#49)
  useEffect(() => {
    if (!userGamification) return;
    const lv = userGamification.current_level;
    if (prevLevelRef.current !== null && lv > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = lv;
  }, [userGamification?.current_level]);

  // Streak multiplier
  const streakDays = userGamification?.streak_days || 0;
  const multiplier = streakDays >= 30 ? 2.0 : streakDays >= 14 ? 1.75 : streakDays >= 7 ? 1.5 : streakDays >= 3 ? 1.25 : 1.0;
  const hasMultiplier = multiplier > 1.0;

  const getMissionProgress = (missionId: string) =>
    userMissions.find(um => um.mission_id === missionId);

  // Stats
  const completedCount = userMissions.filter(um => um.is_completed).length;
  const activeCount = userMissions.filter(um => !um.is_completed && um.progress > 0).length;

  return (
    <PageTransition>
      <SEOHead
        title="Gamificación - Explora, Juega y Descubre RD"
        description="Sistema de gamificación turística: completa retos, gana puntos, colecciona insignias y canjea premios explorando República Dominicana."
      />

      {/* Level Up Modal (#49) */}
      <LevelUpModal
        isOpen={showLevelUp}
        newLevel={userGamification?.current_level || 1}
        levelTitle={currentLevel?.title || "Explorador"}
        levelIcon={currentLevel?.icon || "🌱"}
        levelColor={currentLevel?.color || "#8B5CF6"}
        perks={currentLevel?.perks || []}
        onClose={() => setShowLevelUp(false)}
      />

      <div className="min-h-screen bg-background pb-20">
        <Header />

        {/* Hero */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-amber-500/10" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="relative container mx-auto px-4 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 gap-2 px-4 py-2">
                  <Gamepad2 className="h-4 w-4" /> Sistema de Gamificación
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Explora, Juega y{" "}
                  <span className="text-gradient">Descubre</span>{" "}
                  el Destino
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Convierte cada viaje en una aventura épica. Completa retos, 
                  gana recompensas y conviértete en un verdadero embajador de República Dominicana.
                </p>
                <div className="flex flex-wrap gap-4">
                  {user ? (
                    <Button size="lg" asChild className="gap-2">
                      <Link to="/retos-turisticos"><Flame className="h-5 w-5" /> Explorar Retos</Link>
                    </Button>
                  ) : (
                    <Button size="lg" asChild className="gap-2">
                      <Link to="/registro"><Play className="h-5 w-5" /> Comenzar Aventura</Link>
                    </Button>
                  )}
                  <Button size="lg" variant="outline" asChild className="gap-2">
                    <Link to="/badges"><Award className="h-5 w-5" /> Ver Insignias</Link>
                  </Button>
                </div>
              </motion.div>

              {/* Right side: User progress or preview */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                {user && userGamification ? (
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl border-2 border-primary/30"
                      >
                        {currentLevel?.icon || "🌱"}
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{currentLevel?.title || "Viajero"}</h2>
                        <p className="text-sm text-muted-foreground">Nivel {userGamification.current_level}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { icon: Zap, value: userGamification.total_xp, label: "XP Total", color: "text-amber-500" },
                        { icon: Crown, value: userGamification.coins, label: "Monedas", color: "text-primary" },
                        { icon: Flame, value: userGamification.streak_days, label: "Racha", color: "text-orange-500" },
                      ].map((stat) => (
                        <motion.div
                          key={stat.label}
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-3 rounded-xl bg-background border border-border"
                        >
                          <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                          <p className="text-lg font-bold text-foreground">{stat.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {nextLevel && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progreso al siguiente nivel</span>
                          <span className="font-medium text-foreground">{xpProgress}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={xpProgress} className="h-3" />
                          <motion.div
                            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-primary/50 to-primary opacity-50"
                            style={{ width: `${xpProgress}%` }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                          {nextLevel.xp_required - userGamification.total_xp} XP para {nextLevel.title}
                        </p>
                      </div>
                    )}

                    {/* Quick stats row */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                        <Target className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-muted-foreground">{activeCount} retos activos</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                        <Medal className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-muted-foreground">{completedCount} completados</span>
                      </div>
                    </div>

                    <Button className="w-full mt-6 gap-2" asChild>
                      <Link to="/perfil-jugador"><Trophy className="h-4 w-4" /> Ver Mi Perfil</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-xl">
                    <div className="text-center">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6"
                      >
                        <Trophy className="h-12 w-12 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-foreground mb-2">¿Listo para la aventura?</h3>
                      <p className="text-muted-foreground mb-6">Crea tu cuenta y comienza a ganar puntos desde tu primera acción.</p>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["🏖️ Playas", "🍽️ Comida", "🏔️ Aventura"].map(item => (
                          <motion.div
                            key={item}
                            whileHover={{ scale: 1.05 }}
                            className="p-3 rounded-lg bg-background border border-border text-center"
                          >
                            <span className="text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Onboarding Quest (#47) */}
        {user && (
          <div className="container mx-auto px-4 py-6">
            <OnboardingQuest referralCode={null} />
          </div>
        )}

        {/* Story Quest Section (#29) */}
        {user && (
          <div className="container mx-auto px-4 py-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background p-8 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                <div>
                  <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 mb-2">
                    📖 Cadena de Misiones (Story Quest)
                  </Badge>
                  <h2 className="text-2xl font-bold font-display text-foreground">El Misterio del Ámbar Dominicano</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    Sigue la leyenda popular que narra la existencia de una resina prehistórica de valor incalculable. Completa las 5 etapas para revelar el secreto.
                  </p>
                </div>
                {!storyCompleted ? (
                  <Button 
                    onClick={handleAdvanceStory} 
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-2 font-semibold shadow-md shrink-0"
                  >
                    <Sparkles className="h-4 w-4" /> Avanzar Misión
                  </Button>
                ) : (
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-sm py-1.5 px-3">
                    ✨ ¡Historia Completada!
                  </Badge>
                )}
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {[
                  { step: 1, title: "Rumor en Santiago", desc: "Don Tomás te habla de una vieja veta en las colinas.", xp: 30, icon: "🗣️" },
                  { step: 2, title: "Mina de Puerto Plata", desc: "Explora las colinas del norte en busca de la resina.", xp: 50, icon: "⛰️" },
                  { step: 3, title: "Pulido de Gema", desc: "Limpia y trabaja la resina para revelar su brillo.", xp: 40, icon: "✨" },
                  { step: 4, title: "Museo del Ámbar", desc: "Presenta tu hallazgo ante arqueólogos expertos.", xp: 60, icon: "🏛️" },
                  { step: 5, title: "El Secreto Revelado", desc: "Descubre el insecto prehistórico fosilizado.", xp: 100, icon: "💎" },
                ].map((s) => {
                  const isActive = storyStage === s.step && !storyCompleted;
                  const isCompleted = storyStage > s.step || storyCompleted;
                  
                  return (
                    <div 
                      key={s.step} 
                      className={`p-4 rounded-xl border transition-all ${
                        isActive ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/30 shadow-sm" :
                        isCompleted ? "bg-emerald-500/5 border-emerald-500/20 opacity-80" :
                        "bg-card/50 border-border opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{s.icon}</span>
                        <Badge 
                          variant={isCompleted ? "default" : isActive ? "secondary" : "outline"}
                          className={`text-[9px] ${
                            isCompleted ? "bg-emerald-500 text-white border-none" :
                            isActive ? "bg-amber-500/20 text-amber-600 border-none" : ""
                          }`}
                        >
                          {isCompleted ? "Completado" : isActive ? "Activo" : "Bloqueado"}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-xs text-foreground mb-1 leading-tight">{s.title}</h4>
                      <p className="text-[10px] text-muted-foreground leading-normal mb-3">{s.desc}</p>
                      <Badge variant="outline" className="text-[9px] gap-0.5 border-none bg-muted px-1.5 py-0">
                        <Zap className="h-2.5 w-2.5 text-amber-500" /> +{s.xp} XP
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Streak Multiplier Banner (#1) */}
        {user && hasMultiplier && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-y border-amber-500/20"
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground text-sm">Multiplicador ×{multiplier} activo</span>
                  <span className="text-muted-foreground text-sm ml-2">— Racha de {streakDays} días</span>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs flex-shrink-0">
                {streakDays >= 30 ? "¡Racha Legendaria! 🔥" : streakDays >= 14 ? "¡Racha Élite! ⚡" : "¡Racha Activa! 🎯"}
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Daily & Weekly Challenges */}
        {user && (dailyMissions.length > 0 || weeklyMissions.length > 0) && (
          <section className="py-12 bg-card border-y border-border">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Daily */}
                {dailyMissions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="font-bold text-foreground">Retos Diarios</h2>
                        <p className="text-xs text-muted-foreground">Se reinician cada 24 horas</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {dailyMissions.map((m) => {
                        const prog = getMissionProgress(m.id);
                        const pct = prog ? (prog.progress / m.target_count) * 100 : 0;
                        return (
                          <motion.div
                            key={m.id}
                            whileHover={{ x: 4 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              prog?.is_completed ? "bg-primary/5 border-primary/20" : "bg-background border-border"
                            }`}
                          >
                            <span className="text-2xl">{m.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">{m.name}</p>
                              {!prog?.is_completed && <Progress value={pct} className="h-1 mt-1.5" />}
                            </div>
                            <Badge variant={prog?.is_completed ? "default" : "secondary"} className="text-xs gap-1 shrink-0">
                              <Zap className="h-3 w-3" /> {m.xp_reward}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weekly */}
                {weeklyMissions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="font-bold text-foreground">Retos Semanales</h2>
                        <p className="text-xs text-muted-foreground">Más desafiantes, mejores recompensas</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {weeklyMissions.map((m) => {
                        const prog = getMissionProgress(m.id);
                        const pct = prog ? (prog.progress / m.target_count) * 100 : 0;
                        return (
                          <motion.div
                            key={m.id}
                            whileHover={{ x: 4 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              prog?.is_completed ? "bg-primary/5 border-primary/20" : "bg-background border-border"
                            }`}
                          >
                            <span className="text-2xl">{m.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">{m.name}</p>
                              {!prog?.is_completed && <Progress value={pct} className="h-1 mt-1.5" />}
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <Badge variant={prog?.is_completed ? "default" : "secondary"} className="text-xs gap-1">
                                <Zap className="h-3 w-3" /> {m.xp_reward}
                              </Badge>
                              {m.coin_reward > 0 && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Crown className="h-3 w-3" /> {m.coin_reward}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge variant="outline" className="mb-4 gap-2"><Sparkles className="h-3 w-3" /> Cómo Funciona</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Tu aventura en <span className="text-gradient">5 pasos</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cada interacción con el destino te acerca a increíbles recompensas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-5 gap-6">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative"
                  >
                    <item.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </motion.div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {i < howItWorks.length - 1 && (
                    <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground/40 absolute top-8 -right-3" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Challenge Section (#27) */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 gap-2">
                  <Camera className="h-3 w-3" /> Reto Semanal
                </Badge>
                <h2 className="font-display text-2xl font-bold text-foreground">Reto Fotográfico</h2>
                <p className="text-muted-foreground text-sm">Comparte tu mejor foto y compite por XP</p>
              </div>
            </div>
            <PhotoChallenge />
          </div>
        </section>

        {/* Leaderboard + League + Featured Challenges */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Leaderboard */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    <h2 className="font-display text-2xl font-bold text-foreground">Top Exploradores</h2>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="gap-1">
                    <Link to="/club-recompensas">Ver todos <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  {leaderboard.slice(0, 8).map((entry, i) => (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                        i < 3 ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? "bg-amber-500 text-white" :
                        i === 1 ? "bg-gray-400 text-white" :
                        i === 2 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{entry.display_name}</p>
                        <p className="text-xs text-muted-foreground">Nivel {entry.current_level} • Racha: {entry.streak_days}d</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-sm">{entry.total_xp.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </motion.div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Sé el primero en el ranking</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* League Widget (#35) */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-6">
                  <Crown className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Liga y Temporada</h2>
                </div>
                <LeagueWidget />
              </motion.div>

              {/* Tabs: Featured Challenges or Social Activity Feed */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
                className="space-y-4"
              >
                <Tabs defaultValue="featured" className="w-full">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <TabsList className="bg-transparent h-auto p-0 gap-4">
                      <TabsTrigger 
                        value="featured"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-sm font-bold gap-2"
                      >
                        <Target className="h-4 w-4 text-primary" /> Retos Destacados
                      </TabsTrigger>
                      <TabsTrigger 
                        value="social"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-sm font-bold gap-2"
                      >
                        <Users className="h-4 w-4 text-primary" /> Actividad Global
                      </TabsTrigger>
                    </TabsList>
                    
                    <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                      <Link to="/retos-turisticos">Ver todos <ArrowRight className="h-3 w-3" /></Link>
                    </Button>
                  </div>

                  <TabsContent value="featured" className="mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      {featuredMissions.slice(0, 4).map((mission) => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          progress={getMissionProgress(mission.id)}
                          isLocked={(userGamification?.current_level || 1) < mission.min_level}
                          currentLevel={userGamification?.current_level || 1}
                        />
                      ))}
                    </div>
                    {featuredMissions.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                        <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Próximamente: misiones emocionantes</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="social" className="mt-0">
                    <SocialFeed />
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Todo un ecosistema de <span className="text-gradient">aventura</span>
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={f.link} className="block p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all group h-full">
                    <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                      <f.icon className={`h-6 w-6 ${f.color}`} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Levels Preview */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <Badge variant="outline" className="mb-4 gap-2"><Shield className="h-3 w-3" /> Progresión</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Niveles del <span className="text-gradient">Explorador</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Sube de nivel y desbloquea beneficios exclusivos
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {levels.map((level, i) => {
                const isCurrentLevel = userGamification?.current_level === level.level_number;
                const isUnlocked = (userGamification?.current_level || 0) >= level.level_number;
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.05 }}
                    className={`p-5 rounded-2xl text-center border transition-all ${
                      isCurrentLevel ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20" :
                      isUnlocked ? "bg-card border-primary/20" :
                      "bg-card border-border opacity-60"
                    }`}
                  >
                    <motion.span
                      className="text-4xl mb-3 block"
                      animate={isCurrentLevel ? { scale: [1, 1.15, 1] } : undefined}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {level.icon}
                    </motion.span>
                    <p className="font-bold text-sm text-foreground">{level.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{level.xp_required.toLocaleString()} XP</p>
                    {level.marketplace_discount > 0 && (
                      <Badge variant="secondary" className="text-xs">-{level.marketplace_discount}%</Badge>
                    )}
                    {isCurrentLevel && (
                      <Badge className="mt-2 text-xs bg-primary text-primary-foreground">Actual</Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¿Listo para empezar tu aventura?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Cada destino es un nuevo nivel, cada experiencia son puntos extra.
              </p>
              <div className="flex gap-4 justify-center">
                {user ? (
                  <Button size="lg" asChild className="gap-2">
                    <Link to="/club-recompensas"><Trophy className="h-5 w-5" /> Ir al Club de Recompensas</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="gap-2">
                      <Link to="/registro"><Play className="h-5 w-5" /> Crear Cuenta Gratis</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/login">Iniciar Sesión</Link>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Floating XP Bar (#45) */}
      <FloatingXPBar />
    </PageTransition>
  );
}
