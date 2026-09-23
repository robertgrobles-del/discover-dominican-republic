import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import type { GamificationLevel } from "@/hooks/useGamification";

interface LevelsPreviewProps {
  levels: GamificationLevel[];
  currentLevelNumber: number | undefined;
}

export function LevelsPreview({ levels, currentLevelNumber }: LevelsPreviewProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-2"><Shield className="h-3 w-3" /> Progresión</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Niveles del <span className="text-gradient">Explorador</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Sube de nivel y desbloquea beneficios exclusivos
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {levels.map((level, i) => {
            const isCurrentLevel = currentLevelNumber === level.level_number;
            const isUnlocked = (currentLevelNumber || 0) >= level.level_number;
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                className={`p-5 rounded-2xl text-center border transition-all ${
                  isCurrentLevel ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20" :
                  isUnlocked ? "bg-card border-primary/20" :
                  "bg-card border-border opacity-60"
                }`}
              >
                <motion.span
                  className="text-4xl mb-3 block"
                  animate={isCurrentLevel ? { scale: [1, 1.15, 1] } : undefined}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {level.icon}
                </motion.span>
                <p className="font-bold text-sm text-foreground">{level.title}</p>
                <p className="text-xs text-muted-foreground mb-2">{level.xp_required.toLocaleString()} XP</p>
                {level.marketplace_discount > 0 && (
                  <Badge variant="secondary" className="text-xs">-{level.marketplace_discount}%</Badge>
                )}
                {isCurrentLevel && (
                  <Badge className="mt-2 text-xs bg-primary text-primary-foreground">Actual</Badge>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
