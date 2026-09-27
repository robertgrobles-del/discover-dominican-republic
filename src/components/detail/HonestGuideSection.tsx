import { AlertTriangle, Lightbulb, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HonestGuideSectionProps {
  destinationName: string;
  loQueNadieTeDice: string[];
  consejoLocal: {
    nombre: string;
    rol: string;
    residencia: string;
    consejo: string;
  };
  pronunciacion?: {
    fonetica: string;
    nota?: string;
  };
}

export function HonestGuideSection({
  destinationName,
  loQueNadieTeDice,
  consejoLocal,
  pronunciacion
}: HonestGuideSectionProps) {
  return (
    <div className="space-y-6 my-8">
      {/* 1. Lo que nadie te dice (Contras honestos para máxima credibilidad) */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Lo que nadie te dice de {destinationName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Transparencia total: detalles honestos que ningún folleto turístico convencional incluye
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
            Consejos Sin Filtro
          </Badge>
        </div>

        <ul className="grid sm:grid-cols-2 gap-3 pt-2">
          {loQueNadieTeDice.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground bg-background/60 p-3 rounded-2xl border border-border"
            >
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Consejo de un Local Auténtico */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Consejo de un Residente Local
            </h3>
            <p className="text-xs text-muted-foreground">
              Recomendación de primera mano firmada por un vecino de {destinationName}
            </p>
          </div>
        </div>

        <div className="bg-background/80 rounded-2xl p-5 border border-border space-y-3">
          <p className="text-sm italic text-foreground leading-relaxed">
            "{consejoLocal.consejo}"
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <span className="font-bold text-foreground">
              {consejoLocal.nombre} <span className="font-normal text-muted-foreground">({consejoLocal.rol})</span>
            </span>
            <span className="text-primary font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Residente en {consejoLocal.residencia}
            </span>
          </div>
        </div>

        {/* Pronunciación en audio/fonética para extranjeros */}
        {pronunciacion && (
          <div className="p-3.5 bg-background/50 rounded-2xl border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">¿Cómo se pronuncia?</span>
              <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {pronunciacion.fonetica}
              </span>
            </div>
            {pronunciacion.nota && (
              <span className="text-muted-foreground italic text-[11px] hidden sm:inline">
                {pronunciacion.nota}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
