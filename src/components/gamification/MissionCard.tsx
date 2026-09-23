import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Zap, Crown, Star, Target, Clock, Flame, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Mission, UserMission } from "@/hooks/useGamification";

interface MissionCardProps {
  mission: Mission;
  progress?: UserMission;
  isLocked?: boolean;
  currentLevel?: number;
  onClick?: () => void;
}

const difficultyConfig: Record<number, { label: string; color: string; dots: number }> = {
  1: { label: "Fácil", color: "text-emerald-500", dots: 1 },
  2: { label: "Fácil", color: "text-emerald-500", dots: 1 },
  3: { label: "Medio", color: "text-amber-500", dots: 2 },
  4: { label: "Difícil", color: "text-orange-500", dots: 3 },
  5: { label: "Difícil", color: "text-orange-500", dots: 3 },
};

const categoryConfig: Record<string, { label: string; icon: string; gradient: string }> = {
  exploration: { label: "Exploración", icon: "🗺️", gradient: "from-blue-500/20 to-cyan-500/10" },
  social: { label: "Social", icon: "👥", gradient: "from-violet-500/20 to-purple-500/10" },
  gastronomy: { label: "Gastronomía", icon: "🍽️", gradient: "from-orange-500/20 to-amber-500/10" },
  planning: { label: "Planificación", icon: "📋", gradient: "from-teal-500/20 to-emerald-500/10" },
  commerce: { label: "Comercio", icon: "🛍️", gradient: "from-pink-500/20 to-rose-500/10" },
  referral: { label: "Referidos", icon: "🎁", gradient: "from-emerald-500/20 to-green-500/10" },
  engagement: { label: "Engagement", icon: "🔥", gradient: "from-red-500/20 to-orange-500/10" },
  culture: { label: "Cultura", icon: "🎭", gradient: "from-amber-500/20 to-yellow-500/10" },
};

const typeConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  daily: { label: "Diaria", icon: Clock, color: "text-emerald-500" },
  weekly: { label: "Semanal", icon: Flame, color: "text-orange-500" },
  one_time: { label: "Única", icon: Star, color: "text-primary" },
};

export const MissionCard = forwardRef<HTMLDivElement, MissionCardProps>(function MissionCard(
  { mission, progress, isLocked, currentLevel = 1, onClick },
  ref
) {
  const isCompleted = progress?.is_completed;
  const progressPct = progress ? Math.round((progress.progress / mission.target_count) * 100) : 0;
  const cat = categoryConfig[mission.category] || { label: mission.category, icon: "📌", gradient: "from-muted/30 to-muted/10" };
  const type = typeConfig[mission.mission_type] || typeConfig.one_time;
  const difficulty = difficultyConfig[mission.target_count <= 1 ? 1 : mission.target_count <= 3 ? 2 : mission.target_count <= 5 ? 3 : mission.target_count <= 10 ? 4 : 5];

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isLocked ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl border overflow-hidden transition-all cursor-pointer ${
        isLocked
          ? "border-border opacity-50 grayscale"
          : isCompleted
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      {/* Gradient header */}
      <div className={`relative h-28 bg-gradient-to-br ${cat.gradient} flex items-center justify-center overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-4 text-6xl opacity-30">{cat.icon}</div>
        </div>

        <motion.span
          className="text-5xl relative z-10"
          animate={isCompleted ? { scale: [1, 1.1, 1] } : undefined}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {isLocked ? "🔒" : mission.icon}
        </motion.span>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <Badge variant="secondary" className="text-[10px] bg-card/90 backdrop-blur-sm gap-1 px-2 py-0.5">
            {cat.icon} {cat.label}
          </Badge>
        </div>

        {/* Type badge */}
        <div className="absolute top-2.5 right-2.5">
          <Badge variant="outline" className={`text-[10px] bg-card/90 backdrop-blur-sm gap-1 px-2 py-0.5 ${type.color}`}>
            <type.icon className="h-3 w-3" /> {type.label}
          </Badge>
        </div>

        {/* Completed checkmark */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        {/* Reward pills */}
        <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
          <span className="text-[10px] font-bold bg-amber-500/90 text-white rounded-full px-2 py-0.5 flex items-center gap-1">
            <Zap className="h-3 w-3" /> {mission.xp_reward}
          </span>
          {mission.coin_reward > 0 && (
            <span className="text-[10px] font-bold bg-primary/90 text-primary-foreground rounded-full px-2 py-0.5 flex items-center gap-1">
              <Crown className="h-3 w-3" /> {mission.coin_reward}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {mission.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {mission.short_description || mission.description}
        </p>

        {/* Difficulty dots */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-medium ${difficulty.color}`}>{difficulty.label}</span>
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < difficulty.dots ? "bg-current " + difficulty.color : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground ml-auto">
            Meta: {mission.target_count}
          </span>
        </div>

        {/* Progress or status */}
        {isLocked ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> Nivel {mission.min_level} requerido
          </div>
        ) : isCompleted ? (
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <Star className="h-3.5 w-3.5 fill-current" /> ¡Completado!
            {progress?.completed_at && (
              <span className="text-muted-foreground font-normal ml-auto">
                {new Date(progress.completed_at).toLocaleDateString("es-DO")}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-primary">{progress?.progress || 0}/{mission.target_count}</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Featured indicator */}
      {mission.is_featured && !isLocked && (
        <div className="absolute -top-px -right-px">
          <div className="w-0 h-0 border-t-[24px] border-r-[24px] border-t-transparent border-r-primary rounded-bl-sm" />
          <Star className="absolute top-0.5 right-0.5 h-3 w-3 text-primary-foreground fill-current" />
        </div>
      )}
    </motion.div>
  );
});
