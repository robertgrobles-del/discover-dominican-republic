import React from "react";
import { Droplets, Thermometer, ShieldAlert, Mountain, Clock, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RiverConditionsCardProps {
  riverType?: string;
  difficulty?: "facil" | "moderado" | "dificil" | "experto";
  waterTemperature?: "fria" | "templada" | "fresca";
  hikingTime?: string;
  familyFriendly?: boolean;
}

const riverTypeLabels: Record<string, string> = {
  montaña: "Río de Montaña",
  cascada: "Cascada / Salto",
  charco: "Charcos & Pozas Cristalinas",
  cañon: "Cañón & Canyoning",
  manantial: "Manantial Subterráneo",
  río: "Río Caudaloso",
};

const difficultyLabels: Record<string, { label: string; color: string; desc: string }> = {
  facil: {
    label: "Fácil / Familiar",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    desc: "Apto para todas las edades con senderos planos y acceso directo sin esfuerzo.",
  },
  moderado: {
    label: "Moderado",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    desc: "Caminata de 15 a 35 min con terreno natural y cruces de agua poco profundos.",
  },
  dificil: {
    label: "Aventura Exigente",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    desc: "Sendero rocoso empinado, saltos naturales y rocas resbaladizas. Requiere calzado de agua.",
  },
  experto: {
    label: "Extremo / Guía Obligatorio",
    color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    desc: "Cañonismo técnico, rápel en cascadas y nado continuo. Uso obligatorio de casco y chaleco.",
  },
};

const tempLabels: Record<string, { label: string; desc: string }> = {
  fria: { label: "Fría de Montaña (18°C - 21°C)", desc: "Agua cristalina que baja directamente de la cordillera." },
  templada: { label: "Templada (24°C - 26°C)", desc: "Temperatura muy agradable para nadar durante horas." },
  fresca: { label: "Fresca & Revitalizante (21°C - 24°C)", desc: "Perfecta para refrescarse tras la caminata." },
};

export const RiverConditionsCard: React.FC<RiverConditionsCardProps> = ({
  riverType = "cascada",
  difficulty = "moderado",
  waterTemperature = "fresca",
  hikingTime = "20 min",
  familyFriendly = true,
}) => {
  const diff = difficultyLabels[difficulty] || difficultyLabels.moderado;
  const temp = tempLabels[waterTemperature] || tempLabels.fresca;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Droplets className="h-5 w-5 text-emerald-500" /> Características Fluviales & Acceso
        </h3>
        <Badge className={`${diff.color} font-bold text-xs border`}>
          Nivel: {diff.label}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Tipo de Río */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Mountain className="h-3.5 w-3.5 text-emerald-500" /> Formación Fluvial
          </span>
          <p className="font-bold text-sm text-foreground">{riverTypeLabels[riverType] || riverType}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">Pozas y saltos de origen cordillerano.</p>
        </div>

        {/* Nivel de Dificultad */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Dificultad del Sendero
          </span>
          <p className="font-bold text-sm text-foreground">{diff.label}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{diff.desc}</p>
        </div>

        {/* Temperatura del Agua */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5 text-cyan-500" /> Temperatura del Agua
          </span>
          <p className="font-bold text-sm text-foreground">{temp.label}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{temp.desc}</p>
        </div>

        {/* Tiempo de Caminata */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-blue-500" /> Tiempo de Senderismo
          </span>
          <p className="font-bold text-sm text-foreground">{hikingTime}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">Desde el punto de parqueo hasta el primer charco.</p>
        </div>

        {/* Familiar */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-indigo-500" /> Apto para Niños & Familia
          </span>
          <p className="font-bold text-sm text-foreground">
            {familyFriendly ? "✓ Recomendado para Familias" : "⚠️ Exclusivo para Adultos / Aventura"}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {familyFriendly ? "Pozas de poca profundidad en las orillas." : "Corrientes rápidas o saltos altos."}
          </p>
        </div>

        {/* Tips de Seguridad */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Consejo Ecoturístico
          </span>
          <p className="font-bold text-sm text-foreground">Calzado de Agua Obligatorio</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">Usa 'water shoes' o tenis con buen agarre para rocas húmedas.</p>
        </div>
      </div>
    </div>
  );
};
