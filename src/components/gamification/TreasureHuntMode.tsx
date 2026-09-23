import { useState } from "react";
import { Compass, Key, MapPin, CheckCircle2, Lock, ArrowRight, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GamificationSoundEngine } from "@/services/gamificationEngine";

export interface TreasureClue {
  step: number;
  locationName: string;
  riddle: string;
  hint: string;
  xpReward: number;
  coinReward: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

const colonialTreasureHunts: TreasureClue[] = [
  {
    step: 1,
    locationName: "Catedral Primada de América",
    riddle: "En la primera plaza donde descansó la campana del Nuevo Mundo, busca la fachada de piedra caliza que mira hacia el este.",
    hint: "Ubicada en la Calle Arzobispo Meriño, frente al Parque Colón.",
    xpReward: 100,
    coinReward: 30,
    isUnlocked: true,
    isCompleted: true
  },
  {
    step: 2,
    locationName: "Alcázar de Diego Colón",
    riddle: "Camina hacia el río Ozama donde el virrey levantó su morada con 55 habitaciones de roca coralina sin un solo clavo de hierro.",
    hint: "Al final de la histórica Calle Las Damas.",
    xpReward: 150,
    coinReward: 45,
    isUnlocked: true,
    isCompleted: false
  },
  {
    step: 3,
    locationName: "Fortaleza Ozama & Torre del Homenaje",
    riddle: "En el bastión militar más antiguo de América, sube donde ondeó por primera vez el estandarte que protegía el puerto de piratas.",
    hint: "Calle Las Damas, torre almenada de piedra.",
    xpReward: 200,
    coinReward: 60,
    isUnlocked: false,
    isCompleted: false
  },
  {
    step: 4,
    locationName: "Panteón de la Patria",
    riddle: "Donde una llama eterna arde vigilada por la guardia de honor en memoria de los próceres de la independencia.",
    hint: "Antigua iglesia jesuita, Calle Las Damas.",
    xpReward: 300,
    coinReward: 100,
    isUnlocked: false,
    isCompleted: false
  }
];

export function TreasureHuntMode() {
  const [clues, setClues] = useState<TreasureClue[]>(colonialTreasureHunts);
  const [activeStep, setActiveStep] = useState(2);

  const handleValidateClue = (step: number) => {
    GamificationSoundEngine.playStampSound();
    GamificationSoundEngine.playCoinSound();
    setClues(prev => prev.map(c => {
      if (c.step === step) return { ...c, isCompleted: true };
      if (c.step === step + 1) return { ...c, isUnlocked: true };
      return c;
    }));
    toast.success(`🎉 ¡Pista ${step} descifrada! Has ganado +${clues[step - 1].coinReward} monedas.`);
    if (step < clues.length) setActiveStep(step + 1);
  };

  return (
    <div className="rounded-3xl p-6 bg-gradient-to-br from-card via-card to-amber-500/10 border-2 border-amber-500/30 space-y-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-[10px] font-bold">
              <Key className="h-3 w-3 mr-1" /> MODO CASERÍA DEL TESORO GPS
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
              Zona Colonial • Santo Domingo
            </Badge>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground">
            El Secreto de la Primada de América
          </h3>
          <p className="text-xs text-muted-foreground">
            Sigue las pistas secuenciales geolocalizadas para descubrir los tesoros ocultos de la primera ciudad del continente.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Progreso del Circuito</span>
          <p className="text-base font-black text-amber-500">
            {clues.filter(c => c.isCompleted).length} / {clues.length} Pistas
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {clues.map((clue) => (
          <div
            key={clue.step}
            className={`p-4 rounded-2xl border transition-all ${
              clue.isCompleted ? "bg-emerald-500/10 border-emerald-500/30" :
              clue.isUnlocked ? "bg-background border-amber-500/40 shadow-sm" :
              "bg-muted/30 border-border opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  clue.isCompleted ? "bg-emerald-500 text-white" :
                  clue.isUnlocked ? "bg-amber-500 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {clue.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : clue.isUnlocked ? clue.step : <Lock className="h-3.5 w-3.5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">
                      Pista #{clue.step}: {clue.isUnlocked ? clue.locationName : "Ubicación Bloqueada"}
                    </h4>
                    {clue.isCompleted && (
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-none text-[9px]">Completada</Badge>
                    )}
                  </div>

                  {clue.isUnlocked ? (
                    <>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "{clue.riddle}"
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Pista geográfica: {clue.hint}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Debes completar la pista anterior para descifrar este enigma histórico.
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-black text-amber-500">+{clue.coinReward} monedas</div>
                <div className="text-[10px] text-muted-foreground">+{clue.xpReward} XP</div>
                {clue.isUnlocked && !clue.isCompleted && (
                  <Button
                    size="sm"
                    onClick={() => handleValidateClue(clue.step)}
                    className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-[10px] h-7 px-3 shadow-xs"
                  >
                    Acreditar GPS
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
