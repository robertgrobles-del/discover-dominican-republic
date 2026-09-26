import React from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { CatalogReward } from "@/data/rewardsData";

interface RewardDetailDialogProps {
  prize: CatalogReward | null;
  onClose: () => void;
  onRedeem: (prize: CatalogReward) => void;
}

export const RewardDetailDialog: React.FC<RewardDetailDialogProps> = ({
  prize,
  onClose,
  onRedeem,
}) => {
  return (
    <Dialog open={!!prize} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl overflow-hidden p-0 border border-border">
        {prize && (
          <div>
            <div className="relative aspect-[16/9] w-full bg-muted">
              <img
                src={prize.image_url}
                alt={prize.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <Badge className="bg-primary text-primary-foreground text-[10px] mb-1">
                  {prize.sponsor}
                </Badge>
                <h3 className="font-display font-bold text-lg leading-tight">{prize.name}</h3>
                <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-primary" /> {prize.location}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                {prize.description}
              </p>

              <div className="space-y-2">
                <h5 className="font-bold text-foreground">¿Qué incluye este beneficio?</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {prize.includes.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-2xl border border-border text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Costo</span>
                  <p className="font-black text-amber-500 text-sm mt-0.5">{prize.coin_cost} monedas</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Valor Real</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">RD$ {prize.estimated_value_dop.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Vigencia</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{prize.validity_days} días</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
                  Cerrar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const selected = prize;
                    onClose();
                    onRedeem(selected);
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  Proceder al Canje
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
