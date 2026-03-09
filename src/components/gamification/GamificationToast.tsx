import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Award, TrendingUp, Flame } from "lucide-react";

interface GamificationEvent {
  id: string;
  type: "level_up" | "achievement" | "mission_complete" | "xp_gain" | "streak";
  title: string;
  description?: string;
  icon?: string;
  xp?: number;
  coins?: number;
}

let eventQueue: GamificationEvent[] = [];
let listeners: Array<() => void> = [];

export function pushGamificationEvent(event: Omit<GamificationEvent, "id">) {
  const fullEvent = { ...event, id: crypto.randomUUID() };
  eventQueue.push(fullEvent);
  listeners.forEach(fn => fn());
}

export function GamificationToastOverlay() {
  const [activeEvent, setActiveEvent] = useState<GamificationEvent | null>(null);

  useEffect(() => {
    const check = () => {
      if (!activeEvent && eventQueue.length > 0) {
        const next = eventQueue.shift()!;
        setActiveEvent(next);
        setTimeout(() => setActiveEvent(null), 4000);
      }
    };
    listeners.push(check);
    return () => { listeners = listeners.filter(fn => fn !== check); };
  }, [activeEvent]);

  // Also check periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeEvent && eventQueue.length > 0) {
        const next = eventQueue.shift()!;
        setActiveEvent(next);
        setTimeout(() => setActiveEvent(null), 4000);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [activeEvent]);

  const getEventConfig = (type: GamificationEvent["type"]) => {
    switch (type) {
      case "level_up":
        return { bg: "from-primary via-primary/90 to-amber-500", Icon: TrendingUp, glow: "shadow-primary/40" };
      case "achievement":
        return { bg: "from-amber-500 via-amber-500/90 to-yellow-500", Icon: Award, glow: "shadow-amber-500/40" };
      case "mission_complete":
        return { bg: "from-emerald-500 via-emerald-500/90 to-teal-500", Icon: Trophy, glow: "shadow-emerald-500/40" };
      case "streak":
        return { bg: "from-orange-500 via-orange-500/90 to-red-500", Icon: Flame, glow: "shadow-orange-500/40" };
      default:
        return { bg: "from-blue-500 via-blue-500/90 to-cyan-500", Icon: Zap, glow: "shadow-blue-500/40" };
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence>
        {activeEvent && (() => {
          const cfg = getEventConfig(activeEvent.type);
          return (
            <motion.div
              key={activeEvent.id}
              initial={{ opacity: 0, y: -60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className={`pointer-events-auto bg-gradient-to-r ${cfg.bg} rounded-2xl px-6 py-4 shadow-2xl ${cfg.glow} min-w-[280px] max-w-[400px]`}
            >
              <div className="flex items-center gap-4">
                {/* Animated icon */}
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.15 }}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0"
                >
                  {activeEvent.icon ? (
                    <span className="text-2xl">{activeEvent.icon}</span>
                  ) : (
                    <cfg.Icon className="h-6 w-6 text-white" />
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.p
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white font-bold text-sm"
                  >
                    {activeEvent.title}
                  </motion.p>
                  {activeEvent.description && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/80 text-xs mt-0.5"
                    >
                      {activeEvent.description}
                    </motion.p>
                  )}
                  {(activeEvent.xp || activeEvent.coins) && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 mt-1"
                    >
                      {activeEvent.xp && activeEvent.xp > 0 && (
                        <span className="text-white/90 text-xs font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3" /> +{activeEvent.xp} XP
                        </span>
                      )}
                      {activeEvent.coins && activeEvent.coins > 0 && (
                        <span className="text-white/90 text-xs font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" /> +{activeEvent.coins}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Sparkle particles */}
                {activeEvent.type === "level_up" && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: (Math.random() - 0.5) * 120,
                          y: (Math.random() - 0.5) * 80,
                        }}
                        transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
                        style={{ left: "50%", top: "50%" }}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Progress bar that shrinks */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-white/40 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
