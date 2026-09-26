import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LevelItem {
  id: string;
  level_number: number;
  title: string;
  icon: string;
  xp_required: number;
  marketplace_discount: number;
  perks: string[];
}

interface ExplorerLevelsRoadmapTabProps {
  levels: LevelItem[];
  currentLevelNumber: number;
  userTotalXp: number;
}

export const ExplorerLevelsRoadmapTab: React.FC<ExplorerLevelsRoadmapTabProps> = ({
  levels,
  currentLevelNumber,
  userTotalXp,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-card border border-border space-y-2">
        <h3 className="font-display text-xl font-bold text-foreground">
          Jerarquía de Niveles & Beneficios Exclusivos
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
          A medida que exploras provincias y completas misiones, acumulas XP para ascender de nivel y desbloquear mayores porcentajes de descuento en tiendas, reservas de hoteles y acceso a eventos exclusivos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {levels.map((level) => {
          const isCurrent = level.level_number === currentLevelNumber;
          const isUnlocked = userTotalXp >= level.xp_required;

          return (
            <div
              key={level.id}
              className={`p-6 rounded-3xl border transition-all ${
                isCurrent
                  ? "bg-primary/10 border-primary/50 ring-2 ring-primary/20 shadow-md"
                  : isUnlocked
                  ? "bg-card border-border"
                  : "bg-muted/20 border-border opacity-75"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{level.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-foreground">
                      {level.title}
                    </h4>
                    {isCurrent && (
                      <Badge className="bg-primary text-primary-foreground text-[10px]">
                        Tu Nivel
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {level.xp_required.toLocaleString()} XP requeridos
                  </span>
                </div>
              </div>

              {level.marketplace_discount > 0 && (
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-primary mb-3">
                  🎁 {level.marketplace_discount}% Descuento en Marketplace y Tiendas Aliadas
                </div>
              )}

              {level.perks && level.perks.length > 0 && (
                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  {level.perks.map((perk, pi) => (
                    <div key={pi} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
