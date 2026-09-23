import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, MapPin, Award, ArrowRight,
  Compass, ShieldCheck, CheckCircle2,
  Sparkles, Flame, Users, ChevronRight
} from "lucide-react";

export function GamificationTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative py-14 md:py-16 overflow-hidden bg-gradient-to-b from-background via-card/40 to-background border-y border-border/50">
      {/* Decorative ambient gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/25 p-6 sm:p-8 md:p-10 shadow-lg shadow-primary/5"
        >
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Punchy value proposition & registration CTA */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-3 py-1 font-semibold">
                  <Compass className="h-3.5 w-3.5 mr-1.5" /> Pasaporte Digital Oficial
                </Badge>
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                  <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> 32 Provincias
                </Badge>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
                Conquista las 32 provincias y{" "}
                <span className="text-primary">acredita tus viajes</span>
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Crea tu cuenta gratuita para desbloquear tu Pasaporte Digital Dominicano. Registra cada destino visitado, colecciona insignias turísticas oficiales y canjea tus puntos XP por beneficios exclusivos con hoteles y restaurantes aliados.
              </p>

              {/* Perks Checklist */}
              <div className="grid sm:grid-cols-2 gap-2.5 pt-1 text-xs font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Sellos consulares de 32 provincias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Insignias de mérito cultural & ecoturismo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Gremios y ranking nacional de exploradores</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Canje de descuentos y experiencias VIP</span>
                </div>
              </div>

              {/* Conversion Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md shadow-primary/20">
                  <Link to="/registro" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Crear Mi Pasaporte Gratis
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl h-11 px-5 text-xs sm:text-sm border-border bg-card hover:bg-muted">
                  <Link to="/gamificacion-turistica" className="flex items-center gap-1.5 font-semibold">
                    Explorar Hub de Gamificación <ArrowRight className="h-4 w-4 text-primary" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Col: Compact Visual Passport Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-background/80 backdrop-blur-md border border-border p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
                      🇩🇴
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">República Dominicana</p>
                      <h4 className="text-sm font-bold text-foreground">Pasaporte de Explorador</h4>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    Oficial MITUR
                  </Badge>
                </div>

                {/* Progress Mini Widget */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground text-[11px]">Provincias Descubiertas</span>
                    <span className="text-primary font-bold">0 de 32 (0%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary w-[8%]" />
                  </div>
                </div>

                {/* Badges preview row */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Insignias Desbloqueables
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { icon: "🏛️", name: "Zona Colonial", xp: "+50 XP" },
                      { icon: "🏖️", name: "Costas del Este", xp: "+75 XP" },
                      { icon: "⛰️", name: "Pico Duarte", xp: "+150 XP" },
                      { icon: "🐋", name: "Bahía Samaná", xp: "+100 XP" },
                    ].map((badge, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-muted/40 border border-border/50 flex flex-col items-center">
                        <span className="text-lg">{badge.icon}</span>
                        <span className="text-[9px] font-semibold text-foreground truncate w-full mt-0.5">{badge.name}</span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">{badge.xp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick login link */}
                <div className="pt-2 border-t border-border/50 text-center">
                  <span className="text-xs text-muted-foreground">¿Ya tienes cuenta? </span>
                  <Link to="/login" className="text-xs font-bold text-primary hover:underline">
                    Inicia sesión aquí
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
