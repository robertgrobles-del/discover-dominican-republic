import React from "react";
import { Shirt, Car, Users, Utensils, HelpCircle } from "lucide-react";

interface EventTips {
  dressCode?: string;
  parking?: string;
  familyFriendly?: string;
  gastronomy?: string;
}

interface EventTipsCardProps {
  tips?: EventTips;
}

export const EventTipsCard: React.FC<EventTipsCardProps> = ({ tips }) => {
  if (!tips) return null;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
      <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" /> Información Práctica & Consejos
      </h3>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        {tips.dressCode && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Shirt className="h-4 w-4 text-amber-500" /> Código de Vestimenta
            </h4>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {tips.dressCode}
            </p>
          </div>
        )}

        {tips.parking && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Car className="h-4 w-4 text-emerald-500" /> Parqueos & Transporte
            </h4>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {tips.parking}
            </p>
          </div>
        )}

        {tips.familyFriendly && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-500" /> Ambiente & Familias
            </h4>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {tips.familyFriendly}
            </p>
          </div>
        )}

        {tips.gastronomy && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-pink-500" /> Gastronomía & Bebidas
            </h4>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {tips.gastronomy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
