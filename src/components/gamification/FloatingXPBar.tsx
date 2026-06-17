import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Flame, ChevronUp, X, Trophy, Star } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";

const RARITY_STYLES: Record<string, { glow: string; badge: string; shimmer: boolean }> = {
  legendary: { glow: "shadow-[0_0_20px_rgba(251,191,36,0.5)]", badge: "bg-amber-500 text-white", shimmer: true },
  epic:      { glow: "shadow-[0_0_16px_rgba(139,92,246,0.4)]", badge: "bg-purple-500 text-white", shimmer: true },
  rare:      { glow: "shadow-[0_0_12px_rgba(59,130,246,0.4)]", badge: "bg-blue-500 text-white", shimmer: false },
  uncommon:  { glow: "shadow-[0_0_8px_rgba(34,197,94,0.3)]",  badge: "bg-emerald-500 text-white", shimmer: false },
  common:    { glow: "",                                        badge: "bg-muted text-muted-foreground", shimmer: false },
};

interface FloatingXPBarProps {
  /** Show in minimized mode by default on mobile */
  defaultMinimized?: boolean;
}

export function FloatingXPBar({ defaultMinimized = true }: FloatingXPBarProps) {
  const { user } = useAuth();
  const { userGamification, getCurrentLevel, getNextLevel, getXpProgress, loading } = useGamification();
  const [minimized, setMinimized] = useState(defaultMinimized);
  const [milestoneToast, setMilestoneToast] = useState<string | null>(null);
  const [prevXp, setPrevXp] = useState<number | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const streakDays = userGamification?.streak_days || 0;
  const coins = userGamification?.coins || 0;
  const totalXp = userGamification?.total_xp || 0;

  // Detect XP gain and show floating +XP indicator
  useEffect(() => {
    if (prevXp !== null && totalXp > prevXp) {
      const diff = totalXp - prevXp;
      setXpGain(diff);
      setTimeout(() => setXpGain(null), 2500);
    }
    if (totalXp > 0) setPrevXp(totalXp);
  }, [totalXp]);

  // Streak multiplier
  const multiplier = streakDays >= 30 ? 2.0 : streakDays >= 14 ? 1.75 : streakDays >= 7 ? 1.5 : streakDays >= 3 ? 1.25 : 1.0;
  const hasMultiplier = multiplier > 1.0;

  if (!user || loading) return null;

  return (
    <>
      {/* Floating XP gain indicator */}
      <AnimatePresence>
        {xpGain && (
          <motion.div
            initial={{ opacity: 0, y: 0, x: "-50%" }}
            animate={{ opacity: 1, y: -60, x: "-50%" }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed bottom-[88px] left-1/2 z-[150] pointer-events-none"
          >
            <span className="flex items-center gap-1 text-lg font-black text-emerald-400 drop-shadow-lg">
              <Zap className="h-5 w-5" /> +{xpGain} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className={`fixed bottom-0 left-0 right-0 z-[100] border-t border-border/50 backdrop-blur-xl transition-all duration-300 ${
          minimized ? "py-2" : "py-3"
        }`}
        style={{ background: "rgba(var(--background)/0.95)" }}
      >
        <div className="container mx-auto px-4 max-w-2xl">
          {minimized ? (
            /* Minimized view */
            <button
              onClick={() => setMinimized(false)}
              className="w-full flex items-center gap-3"
            >
              {/* Level badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border-2 border-primary/30 bg-primary/10"
                title={`Nivel ${currentLevel?.level_number}: ${currentLevel?.title}`}
              >
                {currentLevel?.icon || "🌱"}
              </div>

              {/* XP bar thin */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-foreground">Nv {currentLevel?.level_number}</span>
                  <span className="text-xs text-muted-foreground">{totalXp.toLocaleString()} XP</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className={`flex items-center gap-1 flex-shrink-0 ${streakDays >= 7 ? "text-orange-500" : "text-muted-foreground"}`}>
                <Flame className="h-4 w-4" />
                <span className="text-xs font-bold">{streakDays}d</span>
              </div>

              {/* Multiplier badge */}
              {hasMultiplier && (
                <span className="flex-shrink-0 text-xs font-black bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                  ×{multiplier}
                </span>
              )}

              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          ) : (
            /* Expanded view */
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border-2 border-primary/30 bg-primary/10">
                    {currentLevel?.icon || "🌱"}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm leading-tight">
                      {currentLevel?.title || "Explorador"}
                    </p>
                    <p className="text-xs text-muted-foreground">Nivel {currentLevel?.level_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Streak */}
                  <div className={`flex items-center gap-1 ${streakDays >= 7 ? "text-orange-500" : "text-muted-foreground"}`}>
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-bold">{streakDays} días</span>
                  </div>

                  {/* Coins */}
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-sm">🪙</span>
                    <span className="text-sm font-bold">{coins}</span>
                  </div>

                  <button
                    onClick={() => setMinimized(true)}
                    aria-label="Minimizar barra de XP"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{totalXp.toLocaleString()} XP</span>
                  <span className="text-muted-foreground">
                    {nextLevel ? `${nextLevel.xp_required.toLocaleString()} XP para Nv ${nextLevel.level_number}` : "¡Nivel máximo!"}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7))" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>

              {/* Multiplier info */}
              {hasMultiplier && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl px-3 py-2 mb-3"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>
                    <strong>Racha de {streakDays} días activa</strong> — Multiplicador ×{multiplier} en XP
                  </span>
                </motion.div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2">
                <Link
                  to="/gamificacion"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  onClick={() => setMinimized(true)}
                >
                  <Trophy className="h-3.5 w-3.5" /> Centro de Gamificación
                </Link>
                <Link
                  to="/gamificacion-turistica"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => setMinimized(true)}
                >
                  <Star className="h-3.5 w-3.5" /> Insignias
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
