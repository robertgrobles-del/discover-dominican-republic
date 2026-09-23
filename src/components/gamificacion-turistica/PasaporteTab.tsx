import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, CheckCircle2, Target, Map as MapIcon, BookOpen, Globe2, Flame,
} from "lucide-react";
import { PROVINCES, PROVINCE_MILESTONES } from "@/data/gamificacionTuristicaData";

interface PasaporteTabProps {
  user: { id: string } | null | undefined;
  userGamification: { total_xp?: number; streak_days?: number } | null | undefined;
  totalProvinces: number;
  visitedProvinces: Set<string>;
  currentMilestone: (typeof PROVINCE_MILESTONES)[number] | undefined;
  nextMilestone: (typeof PROVINCE_MILESTONES)[number] | undefined;
  onGoToProvincias: () => void;
}

export function PasaporteTab({
  user, userGamification, totalProvinces, visitedProvinces, currentMilestone, nextMilestone, onGoToProvincias,
}: PasaporteTabProps) {
  return (
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
              <MapIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aún no has visitado ninguna provincia</p>
              <Button size="sm" className="mt-3" onClick={onGoToProvincias}>
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
  );
}
