import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Compass, MapPin, Trophy, Gift, ArrowRight, CheckCircle2, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TOUR_STEPS = [
  {
    step: 1,
    title: "¡Bienvenido a Gamificación RD!",
    desc: "Descubre cómo convertir tus viajes y exploraciones por República Dominicana en recompensas, niveles y premios exclusivos.",
    icon: "🌴",
  },
  {
    step: 2,
    title: "Misiones y Retos Diarios",
    desc: "Visita destinos, lee artículos sobre historia y gastronomía o haz check-in diario para acumular Puntos de Experiencia (XP) y Monedas.",
    icon: "🎯",
  },
  {
    step: 3,
    title: "Retos Fotográficos con GPS",
    desc: "Sube tus mejores capturas en los destinos emblemáticos de la isla y compite contra otros exploradores por el voto popular.",
    icon: "📸",
  },
  {
    step: 4,
    title: "Club de Recompensas y Sorteos",
    desc: "Canjea tus monedas por cupones de descuento, pases de hotel, y suma boletos automáticos para el gran sorteo mensual.",
    icon: "🎁",
  },
];

export const GuidedOnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem("gamificacion_tour_completed") !== "true";
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("gamificacion_tour_completed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-card border border-border/80 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 gap-1">
              <Sparkles className="w-3 h-3" /> Tour Guiado ({currentStep + 1}/{TOUR_STEPS.length})
            </Badge>
            <button
              onClick={handleComplete}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center space-y-4 py-2">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
              {current.icon}
            </div>

            <h3 className="text-xl font-display font-bold text-foreground">{current.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {current.desc}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-center gap-1.5 py-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-xs text-muted-foreground"
            >
              Omitir
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="flex-1 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> ¡Empezar a Explorar!
                </>
              ) : (
                <>
                  Siguiente <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
