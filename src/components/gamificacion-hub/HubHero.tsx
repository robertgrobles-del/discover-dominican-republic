import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Flame, Play, Award, Zap, Crown, Target, Medal, Trophy } from "lucide-react";
import type { GamificationLevel, UserGamification } from "@/hooks/useGamification";

interface HubHeroProps {
  user: { id: string } | null | undefined;
  userGamification: UserGamification | null | undefined;
  currentLevel: GamificationLevel | null | undefined;
  nextLevel: GamificationLevel | null | undefined;
  xpProgress: number;
  activeCount: number;
  completedCount: number;
}

export function HubHero({ user, userGamification, currentLevel, nextLevel, xpProgress, activeCount, completedCount }: HubHeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-amber-500/10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 gap-2 px-4 py-2">
              <Gamepad2 className="h-4 w-4" /> Explora y suma puntos
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Recorre el país,{" "}
              <span className="text-gradient">sube de nivel</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Visita playas, museos y restaurantes reales, completa retos y junta puntos
              que puedes cambiar por descuentos con negocios turísticos aliados.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Button size="lg" asChild className="gap-2">
                  <Link to="/retos-turisticos"><Flame className="h-5 w-5" /> Explorar Retos</Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="gap-2">
                  <Link to="/registro"><Play className="h-5 w-5" /> Crear Cuenta</Link>
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Empieza a sumar puntos hoy</h3>
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
  );
}
