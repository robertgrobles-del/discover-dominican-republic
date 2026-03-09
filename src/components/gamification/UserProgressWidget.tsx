import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Coins, Flame, ChevronRight, Star, Target, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

interface UserProgressWidgetProps {
  variant?: "compact" | "full";
  className?: string;
}

export function UserProgressWidget({ variant = "compact", className }: UserProgressWidgetProps) {
  const { 
    userGamification, 
    getCurrentLevel, 
    getNextLevel, 
    getXpProgress, 
    loading 
  } = useGamification();
  const [isOpen, setIsOpen] = useState(false);

  if (loading || !userGamification) return null;

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const levelColors: Record<number, string> = {
    1: "from-slate-400 to-slate-600",
    2: "from-emerald-400 to-emerald-600",
    3: "from-blue-400 to-blue-600",
    4: "from-purple-400 to-purple-600",
    5: "from-amber-400 to-amber-600",
    6: "from-rose-400 to-rose-600",
  };

  const levelIcons: Record<number, string> = {
    1: "🌱",
    2: "🧭",
    3: "⛰️",
    4: "🔭",
    5: "🏆",
    6: "👑",
  };

  if (variant === "full") {
    return (
      <div className={cn("bg-card rounded-xl border p-6", className)}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center text-3xl",
            levelColors[currentLevel?.level_number || 1]
          )}>
            {levelIcons[currentLevel?.level_number || 1]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{currentLevel?.title}</h3>
            <p className="text-sm text-muted-foreground">Nivel {currentLevel?.level_number}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {userGamification.total_xp.toLocaleString()} XP
              </span>
              {nextLevel && (
                <span className="text-muted-foreground">
                  {nextLevel.xp_required.toLocaleString()} XP
                </span>
              )}
            </div>
            <Progress value={xpProgress} className="h-3" />
            {nextLevel && (
              <p className="text-xs text-muted-foreground mt-1">
                {(nextLevel.xp_required - userGamification.total_xp).toLocaleString()} XP para nivel {nextLevel.level_number}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-3">
              <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{userGamification.coins}</p>
              <p className="text-xs text-muted-foreground">Monedas</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{userGamification.streak_days}</p>
              <p className="text-xs text-muted-foreground">Racha</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{userGamification.total_missions_completed}</p>
              <p className="text-xs text-muted-foreground">Misiones</p>
            </div>
          </div>

          <Link to="/club-recompensas">
            <Button className="w-full" variant="default">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Club de Recompensas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Compact variant (header button with popover)
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "gap-2 px-2 hover:bg-primary/10",
            className
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-sm",
            levelColors[currentLevel?.level_number || 1]
          )}>
            {levelIcons[currentLevel?.level_number || 1]}
          </div>
          <span className="hidden sm:inline text-sm font-medium">
            Nv. {currentLevel?.level_number}
          </span>
          <div className="hidden sm:flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
            <Coins className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{userGamification.coins}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl",
                levelColors[currentLevel?.level_number || 1]
              )}>
                {levelIcons[currentLevel?.level_number || 1]}
              </div>
              <div>
                <h4 className="font-semibold">{currentLevel?.title}</h4>
                <p className="text-xs text-muted-foreground">Nivel {currentLevel?.level_number}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span>{userGamification.total_xp.toLocaleString()} XP</span>
                {nextLevel && <span>{nextLevel.xp_required.toLocaleString()} XP</span>}
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-muted/50 rounded-lg p-2">
                <Coins className="w-4 h-4 text-yellow-500 mx-auto" />
                <p className="text-sm font-bold">{userGamification.coins}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <Flame className="w-4 h-4 text-orange-500 mx-auto" />
                <p className="text-sm font-bold">{userGamification.streak_days}d</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <Award className="w-4 h-4 text-green-500 mx-auto" />
                <p className="text-sm font-bold">{userGamification.total_missions_completed}</p>
              </div>
            </div>

            <Link to="/club-recompensas" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="w-full gap-2">
                <Trophy className="w-4 h-4" />
                Club de Recompensas
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
