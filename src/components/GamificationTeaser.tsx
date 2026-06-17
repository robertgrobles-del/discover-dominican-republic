import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Zap, MapPin, Award, Star, Flame,
  ChevronRight, Gift, Target, Crown, ArrowRight, Sparkles
} from "lucide-react";

const features = [
  {
    icon: "🗺️",
    title: "Pasaporte Digital",
    desc: "Registra las 32 provincias que visitas y acumula sellos de cada destino.",
    xp: "+25 XP",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    link: "/gamificacion-turistica",
  },
  {
    icon: "🏅",
    title: "Insignias Turísticas",
    desc: "Colecciona 5 insignias: Playas, Cultura, Foodie, Aventurero y Crucerista.",
    xp: "+150 XP",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
    link: "/gamificacion-turistica#insignias",
  },
  {
    icon: "🎯",
    title: "Retos & Misiones",
    desc: "Completa misiones diarias y semanales explorando la isla.",
    xp: "+50 XP",
    color: "from-emerald-500/20 to-green-500/10",
    border: "border-emerald-500/20",
    link: "/retos",
  },
  {
    icon: "🏆",
    title: "Ranking de Exploradores",
    desc: "Compite con viajeros de todo el mundo y sube posiciones.",
    xp: "Top 10",
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/20",
    link: "/club-recompensas",
  },
  {
    icon: "🎁",
    title: "Rifas & Premios Reales",
    desc: "Canjea tus puntos por daypass, cenas, tours y más.",
    xp: "Canjear",
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
    link: "/sorteos",
  },
  {
    icon: "👥",
    title: "Programa de Referidos",
    desc: "Invita amigos y gana 100 puntos por cada registro exitoso.",
    xp: "+100 XP",
    color: "from-teal-500/20 to-cyan-500/10",
    border: "border-teal-500/20",
    link: "/club-recompensas",
  },
];

const levels = [
  { icon: "🌱", title: "Curioso", xp: "0 XP" },
  { icon: "🗺️", title: "Viajero", xp: "500 XP" },
  { icon: "⛵", title: "Aventurero", xp: "1.5k XP" },
  { icon: "🏝️", title: "Explorador", xp: "3k XP" },
  { icon: "👑", title: "Embajador", xp: "7k XP" },
];

const floatAnim = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
};

export function GamificationTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="relative py-20 overflow-hidden bg-background">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-2 mb-4 text-sm">
            <Sparkles className="h-4 w-4" />
            Nuevo · Gamificación Turística
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explora y{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              Gana Recompensas
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Descubre República Dominicana de forma interactiva. Acumula XP, 
            desbloquea insignias y canjea premios reales mientras viajas.
          </p>
        </motion.div>

        {/* Main visual + Features grid */}
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 items-start mb-16">

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link
                  to={feat.link}
                  className={`block h-full p-5 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.border} hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{feat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm">{feat.title}</h3>
                        <Badge variant="secondary" className="text-xs flex-shrink-0 gap-1">
                          <Zap className="h-2.5 w-2.5" />{feat.xp}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium">Explorar</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Visual card — level progression */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            {/* Main gamification card */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 p-7 shadow-2xl">
              {/* Decorative dots */}
              <div className="absolute top-4 right-4 grid grid-cols-5 gap-1">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-primary/20" />
                ))}
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div animate={floatAnim} className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl border border-primary/20">
                  👑
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Tu Nivel Actual</p>
                  <p className="font-display text-xl font-bold text-foreground">Embajador RD</p>
                </div>
                <Badge className="ml-auto bg-primary text-primary-foreground">Nivel 5</Badge>
              </div>

              {/* XP bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progreso XP</span>
                  <span className="text-primary font-bold">7,240 / 10,000 XP</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "72%" } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: MapPin, value: "18/32", label: "Provincias", color: "text-primary" },
                  { icon: Award, value: "8", label: "Insignias", color: "text-amber-500" },
                  { icon: Flame, value: "14 días", label: "Racha", color: "text-orange-500" },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-background border border-border">
                    <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                    <p className="font-bold text-foreground text-sm">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Level progression */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Escala de niveles</p>
                <div className="flex items-end justify-between gap-1">
                  {levels.map((level, i) => {
                    const active = i <= 3; // simulated
                    return (
                      <div key={level.title} className="flex-1 text-center">
                        <motion.span
                          className={`text-xl block mb-1.5 ${!active && "grayscale opacity-40"}`}
                          animate={active && i === 3 ? floatAnim : {}}
                        >
                          {level.icon}
                        </motion.span>
                        <div className={`h-1.5 rounded-full ${active ? "bg-primary" : "bg-muted"}`} />
                        <p className={`text-[9px] mt-1 font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                          {level.title}
                        </p>
                        <p className="text-[8px] text-muted-foreground">{level.xp}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent achievements */}
              <div className="bg-background rounded-xl p-4 mb-6 border border-border">
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Últimas insignias ganadas
                </p>
                <div className="flex gap-2 flex-wrap">
                  {["🏖️", "🏛️", "🍽️", "📍", "🔥", "🎯"].map((badge, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                      className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg"
                    >
                      {badge}
                    </motion.span>
                  ))}
                  <span className="w-9 h-9 rounded-xl bg-muted border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                    +12
                  </span>
                </div>
              </div>

              {/* CTA inside card */}
              <div className="flex gap-3">
                <Button asChild className="flex-1 gap-2">
                  <Link to="/registro">
                    <Trophy className="h-4 w-4" /> Empezar Gratis
                  </Link>
                </Button>
                <Button asChild variant="outline" size="icon">
                  <Link to="/gamificacion">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-amber-500/10 border border-primary/20 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">¿Ya eres miembro?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Inicia sesión y revisa tus puntos, misiones pendientes y próximas rifas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/login"><Crown className="h-4 w-4" />Iniciar Sesión</Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to="/gamificacion-turistica">
                  <Target className="h-4 w-4" />Ver Gamificación
                </Link>
              </Button>
              <Button asChild variant="ghost" className="gap-2">
                <Link to="/sorteos">
                  <Gift className="h-4 w-4" />Ver Rifas
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
