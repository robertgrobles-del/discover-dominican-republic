import React from "react";
import { Footprints, Waves, Mountain, Flame, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PhysicalLevel = "bajo" | "moderado" | "exigente" | "extremo";

interface TourPhysicalEffortProps {
  difficulty?: PhysicalLevel | string;
  caminataKm?: number | string;
  escalones?: number | string;
  nadoRequerido?: boolean;
  altitudM?: number | string;
}

export function TourPhysicalEffort({
  difficulty = "moderado",
  caminataKm,
  escalones,
  nadoRequerido,
  altitudM,
}: TourPhysicalEffortProps) {
  const normDiff = (difficulty || "moderado").toLowerCase();

  const getDifficultyMeta = () => {
    switch (normDiff) {
      case "bajo":
        return {
          label: "Esfuerzo Ligero",
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          barWidth: "25%",
          barColor: "bg-emerald-500",
          desc: "Apto para todas las edades, senderos planos o paseos en vehículo.",
        };
      case "moderado":
        return {
          label: "Esfuerzo Moderado",
          color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
          barWidth: "55%",
          barColor: "bg-yellow-500",
          desc: "Requiere condición física estándar, caminata activa en terreno natural o escalinatas.",
        };
      case "exigente":
        return {
          label: "Exigencia Física Alta",
          color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
          barWidth: "80%",
          barColor: "bg-orange-500",
          desc: "Subidas prolongadas, terreno irregular de montaña o corrientes de agua.",
        };
      default:
        return {
          label: "Desafío Extremo",
          color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          barWidth: "100%",
          barColor: "bg-rose-500",
          desc: "Expedición técnica de alta montaña o cañonismo; requiere equipo y guía certificado.",
        };
    }
  };

  const meta = getDifficultyMeta();

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 ${meta.color}`}>
            <Flame className="w-3.5 h-3.5 mr-1" />
            {meta.label}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">Mejora 634</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Índice de Exigencia</span>
      </div>

      {/* Effort Progress Bar */}
      <div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
            style={{ width: meta.barWidth }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {meta.desc}
        </p>
      </div>

      {/* Grid of Physical Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50 text-xs">
        {/* Caminata */}
        <div className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-xl">
          <Footprints className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Caminata</p>
            <p className="font-semibold text-foreground">
              {caminataKm ? `${caminataKm} km aprox.` : "1.5 - 3 km"}
            </p>
          </div>
        </div>

        {/* Nado */}
        <div className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-xl">
          <Waves className="w-4 h-4 text-sky-500 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Nado</p>
            <p className="font-semibold text-foreground">
              {nadoRequerido ? "Requerido / Chaleco" : "Opcional / Aguas bajas"}
            </p>
          </div>
        </div>

        {/* Escalones / Desnivel */}
        <div className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-xl">
          <Mountain className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Desnivel / Pasos</p>
            <p className="font-semibold text-foreground">
              {escalones ? `${escalones} escalones` : "Moderado"}
            </p>
          </div>
        </div>

        {/* Altitud */}
        <div className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-xl">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Altitud</p>
            <p className="font-semibold text-foreground">
              {altitudM ? `${altitudM} msnm` : "Nivel del mar"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
