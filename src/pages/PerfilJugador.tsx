import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User, Trophy, Star, Zap, Crown, Flame, Target, Award,
  MapPin, Camera, Edit, Share2, ChevronRight, Calendar,
  Shield, Compass, Medal, TrendingUp, Heart, BookOpen
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CircularProgress } from "@/components/ui/progress-bar";

export default function PerfilJugador() {
  const { user } = useAuth();
  const {
    userGamification, levels, missions, userMissions, prizes, loading,
    getCurrentLevel, getNextLevel, getXpProgress
  } = useGamification();

  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null; bio: string | null; travel_interests: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data as any); });
  }, [user]);

  const completedMissions = userMissions.filter(um => um.is_completed);
  const activeMissions = userMissions.filter(um => !um.is_completed);

  const stats = [
    { icon: Zap, label: "XP Total", value: (userGamification?.total_xp || 0).toLocaleString(), color: "text-amber-500" },
    { icon: Crown, label: "Monedas", value: (userGamification?.coins || 0).toLocaleString(), color: "text-primary" },
    { icon: Flame, label: "Racha", value: `${userGamification?.streak_days || 0} días`, color: "text-orange-500" },
    { icon: Target, label: "Misiones", value: String(userGamification?.total_missions_completed || 0), color: "text-emerald-500" },
  ];

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-24 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Perfil del Jugador</h1>
            <p className="text-muted-foreground mb-8">Inicia sesión para ver tu perfil de explorador.</p>
            <div className="flex gap-4 justify-center">
              <Button asChild><Link to="/login">Iniciar Sesión</Link></Button>
              <Button variant="outline" asChild><Link to="/registro">Registrarse</Link></Button>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Mi Perfil Turístico - Gamificación RD"
        description="Tu perfil de explorador: nivel, puntos, insignias y logros en República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Profile Header */}
        <section className="bg-gradient-to-br from-primary/10 via-card to-amber-500/5 border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-5xl border-4" style={{ borderColor: currentLevel?.color || "hsl(var(--primary))" }}>
                  {currentLevel?.icon || "🌱"}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs">Nivel {userGamification?.current_level || 1}</Badge>
                </div>
              </motion.div>

              {/* Info */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                  {profile?.display_name || "Viajero"}
                </h1>
                <p className="text-lg text-primary font-medium mb-2">{currentLevel?.title || "Curioso"}</p>
                {profile?.bio && <p className="text-sm text-muted-foreground mb-4 max-w-md">{profile.bio}</p>}
                
                {profile?.travel_interests && profile.travel_interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                    {profile.travel_interests.slice(0, 5).map(interest => (
                      <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 justify-center md:justify-start">
                  <Button variant="outline" size="sm" asChild className="gap-2">
                    <Link to="/perfil"><Edit className="h-3 w-3" /> Editar Perfil</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-3 w-3" /> Compartir
                  </Button>
                </div>
              </motion.div>

              {/* XP Progress */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="w-full md:w-72 shrink-0"
              >
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <CircularProgress value={xpProgress} size={100} strokeWidth={10} />
                  <p className="text-sm font-medium text-foreground mt-3">{xpProgress}% al siguiente nivel</p>
                  {nextLevel && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {nextLevel.xp_required - (userGamification?.total_xp || 0)} XP para {nextLevel.title}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl border border-border p-4 text-center"
                >
                  <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto mb-8">
              <TabsTrigger value="overview" className="gap-2"><Star className="h-4 w-4" /> Resumen</TabsTrigger>
              <TabsTrigger value="badges" className="gap-2"><Award className="h-4 w-4" /> Insignias</TabsTrigger>
              <TabsTrigger value="missions" className="gap-2"><Target className="h-4 w-4" /> Misiones</TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><BookOpen className="h-4 w-4" /> Historial</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Level Progression */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Progresión de Nivel
                  </h2>
                  <div className="space-y-3">
                    {levels.map((level) => {
                      const isCurrentLevel = userGamification?.current_level === level.level_number;
                      const isUnlocked = (userGamification?.current_level || 0) >= level.level_number;
                      return (
                        <div key={level.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                          isCurrentLevel ? "bg-primary/5 border-primary/30" :
                          isUnlocked ? "bg-card border-border" :
                          "bg-muted/30 border-border opacity-50"
                        }`}>
                          <span className="text-2xl">{level.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground text-sm">{level.title}</p>
                              {isCurrentLevel && <Badge className="text-xs bg-primary text-primary-foreground">Actual</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{level.xp_required.toLocaleString()} XP</p>
                          </div>
                          {level.marketplace_discount > 0 && (
                            <Badge variant="secondary" className="text-xs">-{level.marketplace_discount}%</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Missions */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Misiones Activas
                  </h2>
                  {activeMissions.length > 0 ? (
                    <div className="space-y-3">
                      {activeMissions.slice(0, 5).map((um) => {
                        const mission = missions.find(m => m.id === um.mission_id);
                        if (!mission) return null;
                        const pct = Math.round((um.progress / mission.target_count) * 100);
                        return (
                          <div key={um.id} className="p-4 rounded-xl bg-card border border-border">
                            <div className="flex items-start gap-3">
                              <span className="text-xl">{mission.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium text-foreground text-sm">{mission.name}</p>
                                <p className="text-xs text-muted-foreground mb-2">{mission.short_description}</p>
                                <Progress value={pct} className="h-1.5 mb-1" />
                                <p className="text-xs text-muted-foreground">{um.progress}/{mission.target_count} ({pct}%)</p>
                              </div>
                              <div className="text-right shrink-0">
                                <Badge variant="secondary" className="text-xs gap-1"><Zap className="h-3 w-3" /> {mission.xp_reward}</Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No tienes misiones activas</p>
                      <Button asChild className="mt-4" variant="outline">
                        <Link to="/club-recompensas">Explorar Misiones</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Badges */}
            <TabsContent value="badges">
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Colección de Insignias</h2>
                <p className="text-muted-foreground mb-6">Tus insignias ganadas explorando República Dominicana</p>
                <Button asChild>
                  <Link to="/badges">Ver todas las insignias</Link>
                </Button>
              </div>
            </TabsContent>

            {/* Missions History */}
            <TabsContent value="missions">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-500" /> Misiones Completadas ({completedMissions.length})
              </h2>
              {completedMissions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {completedMissions.map((um) => {
                    const mission = missions.find(m => m.id === um.mission_id);
                    if (!mission) return null;
                    return (
                      <div key={um.id} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                        <span className="text-2xl">{mission.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{mission.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Completada {um.completed_at ? new Date(um.completed_at).toLocaleDateString('es-DO') : ''}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs gap-1"><Zap className="h-3 w-3" /> {mission.xp_reward} XP</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aún no has completado ninguna misión</p>
                </div>
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Historial de Actividad</h3>
                <p className="text-muted-foreground mb-4">Tu registro de exploración y logros</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-lg font-bold text-foreground">{userGamification?.total_missions_completed || 0}</p>
                    <p className="text-xs text-muted-foreground">Misiones</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-lg font-bold text-foreground">{userGamification?.total_purchases || 0}</p>
                    <p className="text-xs text-muted-foreground">Compras</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-lg font-bold text-foreground">{userGamification?.total_referrals || 0}</p>
                    <p className="text-xs text-muted-foreground">Referidos</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-lg font-bold text-foreground">{userGamification?.streak_days || 0}</p>
                    <p className="text-xs text-muted-foreground">Mejor racha</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA */}
        <section className="py-12 bg-gradient-to-r from-primary/10 to-amber-500/10 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">¿Listo para más aventuras?</h2>
            <div className="flex gap-4 justify-center">
              <Button asChild className="gap-2">
                <Link to="/gamificacion"><Compass className="h-4 w-4" /> Hub de Gamificación</Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/club-recompensas"><Trophy className="h-4 w-4" /> Club de Recompensas</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
