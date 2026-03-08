import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Star, Target, Flame, Crown, Map, Compass, Zap,
  Award, Gift, Users, Gamepad2, BookOpen, Camera, Route,
  ChevronRight, Play, Shield, Sparkles, TrendingUp, Medal
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
import { CircularProgress } from "@/components/ui/progress-bar";

const features = [
  { icon: Target, title: "Retos Turísticos", desc: "Completa misiones de exploración, gastronomía y cultura", link: "/club-recompensas", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Map, title: "Mapa de Misiones", desc: "Descubre retos cercanos en el mapa interactivo", link: "/mapa-interactivo", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: BookOpen, title: "Trivia Turística", desc: "Pon a prueba tus conocimientos del país", link: "/club-recompensas", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Award, title: "Insignias", desc: "Colecciona badges explorando destinos", link: "/badges", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Route, title: "Rutas Gamificadas", desc: "Completa rutas temáticas y gana recompensas", link: "/club-recompensas", color: "text-rose-500", bg: "bg-rose-500/10" },
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
    userGamification, levels, missions, leaderboard, loading,
    getCurrentLevel, getNextLevel, getXpProgress
  } = useGamification();

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();
  const featuredMissions = missions.filter(m => m.is_featured).slice(0, 6);

  return (
    <PageTransition>
      <SEOHead
        title="Gamificación - Explora, Juega y Descubre RD"
        description="Sistema de gamificación turística: completa retos, gana puntos, colecciona insignias y canjea premios explorando República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-amber-500/10" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
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
                      <Link to="/club-recompensas"><Flame className="h-5 w-5" /> Continuar Aventura</Link>
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
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl border-2 border-primary/30">
                        {currentLevel?.icon || "🌱"}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{currentLevel?.title || "Viajero"}</h2>
                        <p className="text-sm text-muted-foreground">Nivel {userGamification.current_level}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 rounded-xl bg-background border border-border">
                        <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{userGamification.total_xp.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP Total</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-background border border-border">
                        <Crown className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{userGamification.coins.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Monedas</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-background border border-border">
                        <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{userGamification.streak_days}</p>
                        <p className="text-xs text-muted-foreground">Racha</p>
                      </div>
                    </div>

                    {nextLevel && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progreso al siguiente nivel</span>
                          <span className="font-medium text-foreground">{xpProgress}%</span>
                        </div>
                        <Progress value={xpProgress} className="h-3" />
                        <p className="text-xs text-muted-foreground text-right">
                          {nextLevel.xp_required - userGamification.total_xp} XP para {nextLevel.title}
                        </p>
                      </div>
                    )}

                    <Button className="w-full mt-6 gap-2" asChild>
                      <Link to="/club-recompensas"><Trophy className="h-4 w-4" /> Ver Mi Progreso Completo</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-xl">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <Trophy className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">¿Listo para la aventura?</h3>
                      <p className="text-muted-foreground mb-6">Crea tu cuenta y comienza a ganar puntos desde tu primera acción.</p>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["🏖️ Playas", "🍽️ Comida", "🏔️ Aventura"].map(item => (
                          <div key={item} className="p-3 rounded-lg bg-background border border-border text-center">
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

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
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                    <item.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
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

        {/* Quick Ranking */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Leaderboard */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Top Exploradores</h2>
                </div>
                <div className="space-y-3">
                  {leaderboard.slice(0, 8).map((entry, i) => (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
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
                        <p className="text-xs text-muted-foreground">Nivel {entry.current_level}</p>
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

              {/* Featured Challenges */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Retos Destacados</h2>
                </div>
                <div className="space-y-3">
                  {featuredMissions.map((mission, i) => (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{mission.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{mission.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{mission.short_description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs gap-1"><Zap className="h-3 w-3" /> {mission.xp_reward} XP</Badge>
                            {mission.coin_reward > 0 && (
                              <Badge variant="outline" className="text-xs gap-1"><Crown className="h-3 w-3" /> {mission.coin_reward}</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{mission.mission_type}</Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {featuredMissions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Próximamente: misiones emocionantes</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2" asChild>
                  <Link to="/club-recompensas">Ver todos los retos <ChevronRight className="h-4 w-4" /></Link>
                </Button>
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
                    className={`p-5 rounded-2xl text-center border transition-all ${
                      isCurrentLevel ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20" :
                      isUnlocked ? "bg-card border-primary/20" :
                      "bg-card border-border opacity-60"
                    }`}
                  >
                    <span className="text-4xl mb-3 block">{level.icon}</span>
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
    </PageTransition>
  );
}
