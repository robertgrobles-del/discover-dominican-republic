import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";
import { AMBER_STORY_STEPS } from "@/data/gamificacionHubData";

interface StoryQuestSectionProps {
  storyStage: number;
  storyCompleted: boolean;
  onAdvanceStory: () => void;
}

export function StoryQuestSection({ storyStage, storyCompleted, onAdvanceStory }: StoryQuestSectionProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background p-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 mb-2">
              📖 Cadena de Misiones (Story Quest)
            </Badge>
            <h2 className="text-2xl font-bold font-display text-foreground">El Misterio del Ámbar Dominicano</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Sigue la leyenda popular que narra la existencia de una resina prehistórica de valor incalculable. Completa las 5 etapas para revelar el secreto.
            </p>
          </div>
          {!storyCompleted ? (
            <Button
              onClick={onAdvanceStory}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2 font-semibold shadow-md shrink-0"
            >
              <Sparkles className="h-4 w-4" /> Avanzar Misión
            </Button>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-sm py-1.5 px-3">
              ✨ ¡Historia Completada!
            </Badge>
          )}
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {AMBER_STORY_STEPS.map((s) => {
            const isActive = storyStage === s.step && !storyCompleted;
            const isCompleted = storyStage > s.step || storyCompleted;

            return (
              <div
                key={s.step}
                className={`p-4 rounded-xl border transition-all ${
                  isActive ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/30 shadow-sm" :
                  isCompleted ? "bg-emerald-500/5 border-emerald-500/20 opacity-80" :
                  "bg-card/50 border-border opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <Badge
                    variant={isCompleted ? "default" : isActive ? "secondary" : "outline"}
                    className={`text-[9px] ${
                      isCompleted ? "bg-emerald-500 text-white border-none" :
                      isActive ? "bg-amber-500/20 text-amber-600 border-none" : ""
                    }`}
                  >
                    {isCompleted ? "Completado" : isActive ? "Activo" : "Bloqueado"}
                  </Badge>
                </div>
                <h4 className="font-bold text-xs text-foreground mb-1 leading-tight">{s.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-normal mb-3">{s.desc}</p>
                <Badge variant="outline" className="text-[9px] gap-0.5 border-none bg-muted px-1.5 py-0">
                  <Zap className="h-2.5 w-2.5 text-amber-500" /> +{s.xp} XP
                </Badge>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
