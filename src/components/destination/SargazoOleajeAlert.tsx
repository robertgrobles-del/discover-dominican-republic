import React from "react";
import { Waves, AlertTriangle, ShieldCheck, Sun, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BeachCondition {
  sargazoLevel: "limpio" | "moderado" | "abundante";
  oleajeStatus: "calmo" | "moderado" | "precaucion";
  banderaColor: "verde" | "amarilla" | "roja";
  temperaturaAgua?: number; // Grados Celsius
  lastUpdated?: string;
  advisoryNote?: string;
}

interface SargazoOleajeAlertProps {
  beachName: string;
  condition?: BeachCondition;
  className?: string;
}

export function SargazoOleajeAlert({
  beachName,
  condition = {
    sargazoLevel: "limpio",
    oleajeStatus: "calmo",
    banderaColor: "verde",
    temperaturaAgua: 28,
    lastUpdated: "Hoy, actualizado 08:00 AM",
    advisoryNote: "Aguas cristalinas, excelentes condiciones para baño y snorkel recreativo.",
  },
  className,
}: SargazoOleajeAlertProps) {
  const banderaConfig = {
    verde: {
      label: "Bandera Verde — Baño Seguro",
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    amarilla: {
      label: "Bandera Amarilla — Precaución",
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
      dot: "bg-amber-500",
    },
    roja: {
      label: "Bandera Roja — Prohibido Baño",
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
      dot: "bg-rose-500",
    },
  };

  const sargazoConfig = {
    limpio: { label: "Playa Limpia / Sin Sargazo", color: "text-emerald-600 dark:text-emerald-400" },
    moderado: { label: "Presencia Moderada de Algas", color: "text-amber-600 dark:text-amber-400" },
    abundante: { label: "Presencia Abundante", color: "text-rose-600 dark:text-rose-400" },
  };

  const currentBandera = banderaConfig[condition.banderaColor];

  return (
    <div className={cn("p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          <h4 className="font-display font-bold text-xs sm:text-sm text-foreground">
            Estado de Mar & Playa ({beachName})
          </h4>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-bold border", currentBandera.bg)}>
          <span className={cn("h-2 w-2 rounded-full animate-pulse", currentBandera.dot)} />
          <span>{currentBandera.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Nivel de Sargazo</span>
          <span className={cn("font-bold text-xs", sargazoConfig[condition.sargazoLevel].color)}>
            {sargazoConfig[condition.sargazoLevel].label}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Condición Oleaje</span>
          <span className="font-bold text-xs text-foreground capitalize">
            {condition.oleajeStatus === "calmo" ? "Mar Calmo (0.5m)" : condition.oleajeStatus === "moderado" ? "Oleaje Moderado (1.2m)" : "Precaución / Corrientes"}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 col-span-2 sm:col-span-1">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Temp. Agua / Monitoreo</span>
          <span className="font-bold text-xs text-foreground font-mono">
            {condition.temperaturaAgua || 28}°C • {condition.lastUpdated || "Hoy"}
          </span>
        </div>
      </div>

      {condition.advisoryNote && (
        <p className="text-2xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/40">
          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{condition.advisoryNote}</span>
        </p>
      )}
    </div>
  );
}
