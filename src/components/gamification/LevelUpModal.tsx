import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  levelTitle: string;
  levelIcon: string;
  levelColor?: string;
  perks?: string[];
  onClose: () => void;
}

export function LevelUpModal({
  isOpen,
  newLevel,
  levelTitle,
  levelIcon,
  levelColor = "#8B5CF6",
  perks = [],
  onClose,
}: LevelUpModalProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !firedRef.current) {
      firedRef.current = true;
      // Burst confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ["#FFD700", "#FF6B6B", "#4CAF50", "#2196F3", "#9C27B0"];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Center burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors,
        });
      }, 300);
    }
    if (!isOpen) firedRef.current = false;
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.7)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="relative w-full max-w-sm bg-card border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background glow — decorative, aria-hidden */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none bg-level-glow"
              role="presentation"
              aria-hidden="true"
            />

            {/* Shimmer bar at top — decorative, aria-hidden */}
            <motion.div
              className="h-1.5 w-full bg-primary/60"
              role="presentation"
              aria-hidden="true"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            <div className="p-8 text-center relative z-10">
              {/* LEVEL UP label */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <span className="text-xs font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                  ¡Subiste de Nivel!
                </span>
              </motion.div>

              {/* Icon with rings */}
              <div className="relative inline-block mb-6">
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                    animate={{ scale: [1, 1 + ring * 0.3], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: ring * 0.3, ease: "easeOut" }}
                  />
                ))}
                <motion.div
                  className="relative w-28 h-28 rounded-full flex items-center justify-center text-6xl border-4 border-primary shadow-2xl bg-primary/20 shadow-primary/40"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {levelIcon}
                </motion.div>
              </div>

              {/* Level number */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              >
                <p className="text-6xl font-black text-foreground mb-1">
                  <span className="text-primary">Nivel</span> {newLevel}
                </p>
                <p className="text-xl font-bold text-foreground mb-2">{levelTitle}</p>
              </motion.div>

              {/* Perks */}
              {perks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 space-y-1.5"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Nuevos beneficios</p>
                  {perks.slice(0, 3).map((perk, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-foreground bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-base">✨</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="mt-6 w-full py-3 rounded-2xl font-bold text-sm text-white transition-all bg-primary"
                aria-label="Continuar explorando"
              >
                ¡A seguir explorando! 🚀
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
