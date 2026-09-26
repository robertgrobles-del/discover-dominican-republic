import React from "react";
import { Waves, Wind, Sun, Users, Droplets, ShieldCheck, Thermometer, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BeachConditionsCardProps {
  beachType?: string;
  waveIntensity?: string;
  crowdLevel?: string;
  sandType?: string;
  waterColor?: string;
  lifeguardOnDuty?: boolean;
  bestTimeToVisit?: string;
}

const waveLabels: Record<string, { label: string; color: string; desc: string }> = {
  calma: {
    label: "Oleaje Calmo",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    desc: "Ideal para familias, niños y nado tranquilo sin corrientes fuertes.",
  },
  moderada: {
    label: "Oleaje Moderado",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    desc: "Apto para natación con precaución, paddleboard y snorkel costero.",
  },
  fuerte: {
    label: "Oleaje Fuerte / Surf",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    desc: "Excelente para surfistas experimentados, kitesurf y bodyboard.",
  },
};

const crowdLabels: Record<string, { label: string; desc: string }> = {
  baja: { label: "Poca Afluencia", desc: "Ambiente virgen, tranquilo y de máxima desconexión." },
  media: { label: "Afluencia Media", desc: "Ambiente balanceado con bañistas y quioscos locales." },
  alta: { label: "Alta Afluencia", desc: "Zona concurrida y animada con beach clubs y música." },
};

export const BeachConditionsCard: React.FC<BeachConditionsCardProps> = ({
  waveIntensity = "calma",
  crowdLevel = "media",
  sandType = "Arena fina",
  waterColor = "Turquesa cristalino",
  lifeguardOnDuty = false,
  bestTimeToVisit,
}) => {
  const wave = waveLabels[waveIntensity] || waveLabels.calma;
  const crowd = crowdLabels[crowdLevel] || crowdLabels.media;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Waves className="h-5 w-5 text-cyan-500" /> Condiciones Marinas & Entorno
        </h3>
        <Badge className={`${wave.color} font-bold text-xs border`}>
          {wave.label}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Oleaje */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Waves className="h-3.5 w-3.5 text-cyan-500" /> Dinámica del Oleaje
          </span>
          <p className="font-bold text-sm text-foreground">{wave.label}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{wave.desc}</p>
        </div>

        {/* Tipo de Arena */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Sun className="h-3.5 w-3.5 text-amber-500" /> Tipo de Arena
          </span>
          <p className="font-bold text-sm text-foreground">{sandType}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">Textura suave ideal para caminatas y descanso.</p>
        </div>

        {/* Tonalidad del Agua */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5 text-blue-500" /> Color del Agua
          </span>
          <p className="font-bold text-sm text-foreground">{waterColor}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">Gran visibilidad para snorkel y fotografía acuática.</p>
        </div>

        {/* Afluencia de Visitantes */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-indigo-500" /> Nivel de Afluencia
          </span>
          <p className="font-bold text-sm text-foreground">{crowd.label}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{crowd.desc}</p>
        </div>

        {/* Seguridad / Salvavidas */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Salvavidas en Servicio
          </span>
          <p className="font-bold text-sm text-foreground">
            {lifeguardOnDuty ? "✓ Puesto de Guardavidas Activo" : "✕ No cuenta con salvavidas"}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {lifeguardOnDuty ? "Supervisión disponible en horarios diurnos." : "Se recomienda nadar con precaución y en grupo."}
          </p>
        </div>

        {/* Mejor Época */}
        {bestTimeToVisit && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Mejor Época para Visitar
            </span>
            <p className="font-bold text-sm text-foreground">Temporada Recomendada</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{bestTimeToVisit}</p>
          </div>
        )}
      </div>
    </div>
  );
};
