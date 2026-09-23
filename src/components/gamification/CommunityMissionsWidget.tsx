import { useState } from "react";
import { Users, Target, Clock, Sparkles, Gift, Trophy, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export interface CommunityMission {
  id: string;
  title: string;
  description: string;
  currentCount: number;
  targetCount: number;
  rewardDescription: string;
  daysRemaining: number;
  category: string;
  icon: string;
  boostMultiplier: string;
}

const defaultCommunityMissions: CommunityMission[] = [
  {
    id: "cm-1",
    title: "Gran Conquista del Suroeste Profundo",
    description: "La comunidad debe registrar colectivamente 500 visitas acreditadas en Barahona y Pedernales este mes.",
    currentCount: 384,
    targetCount: 500,
    rewardDescription: "+150 Monedas extra para todos los participantes y 15% de descuento en eco-lodges de Bahía de las Águilas.",
    daysRemaining: 8,
    category: "Ecoturismo",
    icon: "🌵",
    boostMultiplier: "+2.0x XP"
  },
  {
    id: "cm-2",
    title: "Ruta Patrimonial de la Restauración (Cibao)",
    description: "Completar 1,000 visitas a monumentos históricos en Santiago, Dajabón y Montecristi.",
    currentCount: 820,
    targetCount: 1000,
    rewardDescription: "Desbloqueo de Insignia Especial de Oro y sorteo de 5 pases VIP a la Fortaleza San Felipe.",
    daysRemaining: 14,
    category: "Historia & Monumentos",
    icon: "🏛️",
    boostMultiplier: "+2.5x XP"
  }
];

export function CommunityMissionsWidget() {
  const [missions] = useState<CommunityMission[]>(defaultCommunityMissions);

  return (
    <div className="rounded-3xl p-6 bg-gradient-to-br from-card via-card to-primary/10 border border-border shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold">
              <Users className="h-3 w-3 mr-1" /> META NACIONAL COLECTIVA
            </Badge>
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
              Temporada 2026
            </Badge>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground">
            Misiones Comunitarias & Metas Globales
          </h3>
          <p className="text-xs text-muted-foreground">
            Suma tus visitas a las de miles de viajeros dominicanos e internacionales para desbloquear recompensas para todos.
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 self-start sm:self-auto bg-background">
          <Link to="/gamificacion-turistica/retos">
            <Target className="h-3.5 w-3.5 text-emerald-500" /> Ver Todos los Retos
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {missions.map((m) => {
          const progressPercent = Math.min(100, Math.round((m.currentCount / m.targetCount) * 100));
          return (
            <div 
              key={m.id}
              className="p-5 rounded-2xl bg-background border border-border/80 space-y-3 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{m.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{m.category}</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-bold">
                    {m.boostMultiplier}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {m.description}
                </p>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-foreground flex items-center gap-2">
                  <Gift className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span><strong>Recompensa Global:</strong> {m.rewardDescription}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Quedan {m.daysRemaining} días
                  </span>
                  <span className="text-primary font-bold">
                    {m.currentCount.toLocaleString()} / {m.targetCount.toLocaleString()} visitas ({progressPercent}%)
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-muted" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
