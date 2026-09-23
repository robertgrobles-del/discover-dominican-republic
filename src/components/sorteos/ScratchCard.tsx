import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Gift, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getStoredJSON } from "@/lib/safeStorage";

interface ScratchCardProps {
  onRewardClaimed?: (reward: { title: string; xp: number; coins: number }) => void;
}

const REWARDS_POOL = [
  { title: "¡Bono de 50 XP para tu perfil!", xp: 50, coins: 10, icon: "✨", rarity: "Común" },
  { title: "¡Cupón 10% de descuento en Restaurantes aliados!", xp: 100, coins: 25, icon: "🍽️", rarity: "Raro" },
  { title: "¡Bono Madrugador +200 XP!", xp: 200, coins: 50, icon: "⚡", rarity: "Épico" },
  { title: "¡Ticket Extra para el Sorteo Mensual!", xp: 150, coins: 30, icon: "🎟️", rarity: "Especial" },
  { title: "¡Pase VIP Digital +500 XP!", xp: 500, coins: 100, icon: "👑", rarity: "Legendario" },
];

export const ScratchCard: React.FC<ScratchCardProps> = ({ onRewardClaimed }) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    return localStorage.getItem("sorteo_scratch_revealed") === "true";
  });
  const [reward, setReward] = useState(() =>
    getStoredJSON("sorteo_scratch_reward", REWARDS_POOL[0])
  );
  const [isScratching, setIsScratching] = useState(false);

  const handleReveal = () => {
    if (isRevealed) return;
    setIsScratching(true);

    setTimeout(() => {
      // Pick a random reward
      const randomReward = REWARDS_POOL[Math.floor(Math.random() * REWARDS_POOL.length)];
      setReward(randomReward);
      setIsRevealed(true);
      setIsScratching(false);

      localStorage.setItem("sorteo_scratch_revealed", "true");
      localStorage.setItem("sorteo_scratch_reward", JSON.stringify(randomReward));

      toast.success(`🎉 ¡Felicidades! Has desbloqueado: ${randomReward.title}`, {
        description: `+${randomReward.xp} XP y +${randomReward.coins} monedas añadidas.`
      });

      if (onRewardClaimed) {
        onRewardClaimed(randomReward);
      }
    }, 600);
  };

  const handleResetCard = () => {
    setIsRevealed(false);
    localStorage.removeItem("sorteo_scratch_revealed");
    localStorage.removeItem("sorteo_scratch_reward");
    toast.info("Tarjeta de raspadito reiniciada para demostración.");
  };

  return (
    <Card className="max-w-md mx-auto border-2 border-primary/20 bg-gradient-to-b from-card to-card/80 shadow-xl overflow-hidden">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <CardTitle className="text-xl font-display font-bold">Raspa y Gana Turístico</CardTitle>
        <CardDescription>
          Descubre tu premio instantáneo diario y suma tickets y experiencia.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 text-center">
        <div
          onClick={handleReveal}
          className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none overflow-hidden ${
            isRevealed
              ? "bg-gradient-to-br from-amber-500/10 via-primary/10 to-indigo-500/10 border-amber-500/40"
              : "bg-gradient-to-br from-slate-800 to-slate-950 border-slate-700 hover:border-primary/50"
          }`}
        >
          {isRevealed ? (
            <div className="space-y-2 animate-in zoom-in-90 duration-300 px-4">
              <span className="text-4xl">{reward.icon}</span>
              <h4 className="font-bold text-foreground text-sm leading-tight">{reward.title}</h4>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  +{reward.xp} XP
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                  +{reward.coins} Monedas
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {reward.rarity}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-slate-300">
              <Gift className="w-8 h-8 mx-auto text-primary animate-bounce" />
              <p className="text-sm font-semibold tracking-wide uppercase">
                {isScratching ? "Raspando tarjeta..." : "Haz clic o toca para raspar"}
              </p>
              <p className="text-[11px] text-slate-400">Premios garantizados todos los días</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Válido 1 vez al día
          </span>
          {isRevealed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCard}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Probar de nuevo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
