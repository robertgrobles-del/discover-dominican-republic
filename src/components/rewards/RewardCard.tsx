import React from "react";
import { motion } from "framer-motion";
import { MapPin, Check, Lock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogReward } from "@/data/rewardsData";

interface RewardCardProps {
  prize: CatalogReward;
  index: number;
  userCoins: number;
  userLevel: number;
  onPreview: (prize: CatalogReward) => void;
  onRedeem: (prize: CatalogReward) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  prize,
  index,
  userCoins,
  userLevel,
  onPreview,
  onRedeem,
}) => {
  const canAfford = userCoins >= prize.coin_cost;
  const meetsLevel = userLevel >= prize.min_level;
  const remaining = prize.quantity_available - prize.quantity_redeemed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-3xl overflow-hidden bg-card border ${
        prize.isPartnerCustom
          ? "border-emerald-500/40 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
          : "border-border"
      } hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group`}
    >
      <div>
        {/* Image Thumbnail with badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={prize.image_url}
            alt={prize.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {prize.is_featured && (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold shadow-md">
                ⭐ Destacado
              </Badge>
            )}
            {prize.isPartnerCustom && (
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                ✓ Empresa Verificada
              </Badge>
            )}
          </div>

          <Badge className="absolute top-3 right-3 bg-black/60 text-white backdrop-blur-md text-[10px] border-none font-medium">
            <MapPin className="h-3 w-3 mr-1 text-primary" /> {prize.location}
          </Badge>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
            <span className="font-semibold truncate max-w-[200px]">{prize.sponsor}</span>
            <span className="bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Valor: ~RD$ {prize.estimated_value_dop.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {prize.name}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {prize.description}
          </p>

          {/* Quick Includes Tags */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            {prize.includes.slice(0, 2).map((inc, ii) => (
              <span
                key={ii}
                className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <Check className="h-2.5 w-2.5 text-emerald-500" /> {inc}
              </span>
            ))}
          </div>

          {/* Level & Availability status */}
          <div className="flex items-center gap-2 pt-2 text-[10px]">
            {prize.min_level > 1 && (
              <Badge
                variant={meetsLevel ? "secondary" : "destructive"}
                className="text-[10px] gap-1 font-semibold"
              >
                {meetsLevel ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                Requiere Nivel {prize.min_level}+
              </Badge>
            )}
            <span className="text-muted-foreground">
              {remaining > 0 ? `Quedan ${remaining} disponibles` : "Agotado"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 pt-3 border-t border-border/60 mt-2 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground">{prize.coin_cost}</span>
            <span className="text-xs text-amber-500 font-bold">monedas</span>
          </div>
          {prize.original_coin_cost && (
            <span className="text-[10px] text-muted-foreground line-through">
              {prize.original_coin_cost} monedas
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(prize)}
            className="rounded-xl text-xs h-9 px-2.5 text-muted-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            disabled={!canAfford || !meetsLevel || remaining <= 0}
            onClick={() => onRedeem(prize)}
            className="rounded-xl text-xs font-bold px-4 h-9 shadow-sm"
          >
            {!meetsLevel
              ? "Nivel Insuficiente"
              : !canAfford
              ? "Monedas Insuficientes"
              : prize.prize_type === "product"
              ? "Pedir Envío"
              : "Canjear Ahora"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
