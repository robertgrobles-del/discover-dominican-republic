import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle2, ChevronRight, Gift, Award, Share2,
  Users, MapPin, ArrowRight, PartyPopper, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useActionTracker } from "@/hooks/useActionTracker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ONBOARDING_STEPS = [
  {
    id: "register",
    icon: "🎉",
    title: "¡Bienvenido a Descubre RD!",
    desc: "Tu cuenta está activa. Eres parte de la comunidad de exploradores dominicanos.",
    xp: 25,
    action: "auto",
    cta: "Continuar",
    link: null,
  },
  {
    id: "profile",
    icon: "👤",
    title: "Completa tu perfil",
    desc: "Agrega tu foto y nombre de explorador para aparecer en el ranking.",
    xp: 25,
    action: "link",
    cta: "Ir a mi perfil",
    link: "/perfil",
  },
  {
    id: "explore",
    icon: "🗺️",
    title: "Explora tu primera provincia",
    desc: "Visita el mapa de provincias y registra la primera provincia que hayas visitado.",
    xp: 25,
    action: "link",
    cta: "Explorar provincias",
    link: "/gamificacion-turistica?tab=provincias",
  },
  {
    id: "mission",
    icon: "🎯",
    title: "Completa tu primera misión",
    desc: "Elige una misión del Centro de Gamificación y comienza a ganar XP.",
    xp: 25,
    action: "link",
    cta: "Ver misiones",
    link: "/gamificacion",
  },
  {
    id: "share",
    icon: "📣",
    title: "Comparte con tus amigos",
    desc: "Invita a alguien con tu enlace de referido y gana 100 XP extra.",
    xp: 25,
    action: "share",
    cta: "Copiar enlace de referido",
    link: null,
  },
];

const STORAGE_KEY = "onboarding_completed_steps";

interface OnboardingQuestProps {
  referralCode?: string | null;
}

export function OnboardingQuest({ referralCode }: OnboardingQuestProps) {
  const { user } = useAuth();
  const { trackAction } = useActionTracker();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      setCompletedSteps(new Set(parsed));
      // Auto-mark first step
      if (!parsed.includes("register")) {
        markComplete("register");
      }
    } else {
      markComplete("register");
    }
  }, [user]);

  const markComplete = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set([...prev, stepId]);
      if (user) {
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify([...next]));
      }
      return next;
    });
  };

  const handleStepAction = async (step: typeof ONBOARDING_STEPS[0]) => {
    if (step.action === "share" && referralCode) {
      const url = `${window.location.origin}/registro?ref=${referralCode}`;
      await navigator.clipboard.writeText(url);
      toast.success("¡Enlace copiado!", { description: "Comparte con tus amigos para ganar 100 XP" });
      await trackAction({ actionType: "share_content", metadata: { source: "onboarding" } });
      markComplete(step.id);
    } else if (step.action === "auto") {
      markComplete(step.id);
    }
  };

  const allDone = ONBOARDING_STEPS.every(s => completedSteps.has(s.id));
  const totalXp = ONBOARDING_STEPS.reduce((sum, s) => sum + s.xp, 0);
  const earnedXp = ONBOARDING_STEPS.filter(s => completedSteps.has(s.id)).reduce((sum, s) => sum + s.xp, 0);

  if (!user || dismissed || (allDone && earnedXp === totalXp)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6"
    >
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl border border-primary/20">
              🗺️
            </div>
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Misión de Inicio
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">+{totalXp} XP</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Completa los pasos y desbloquea tu recompensa</p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{completedSteps.size}/{ONBOARDING_STEPS.length} completados</span>
            <span className="text-primary font-bold">+{earnedXp} / {totalXp} XP</span>
          </div>
          <Progress value={(completedSteps.size / ONBOARDING_STEPS.length) * 100} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {ONBOARDING_STEPS.map((step, i) => {
            const done = completedSteps.has(step.id);
            return (
              <motion.div
                key={step.id}
                initial={false}
                animate={done ? { opacity: 1 } : {}}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? "bg-emerald-500/5 border-emerald-200"
                    : i === currentStep || (!completedSteps.has(ONBOARDING_STEPS[i - 1]?.id || "register") === false)
                    ? "bg-card border-primary/30"
                    : "bg-muted/30 border-border opacity-60"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  done ? "bg-emerald-100" : "bg-muted"
                }`}>
                  {done ? "✅" : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {step.title}
                  </p>
                  {!done && <p className="text-xs text-muted-foreground truncate">{step.desc}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Zap className="h-2.5 w-2.5" /> +{step.xp}
                  </Badge>
                  {!done && (
                    step.link ? (
                      <Link
                        to={step.link}
                        onClick={() => markComplete(step.id)}
                        className="text-xs bg-primary text-primary-foreground rounded-lg px-2.5 py-1 font-semibold hover:bg-primary/90 transition-colors"
                      >
                        {step.cta}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleStepAction(step)}
                        className="text-xs bg-primary text-primary-foreground rounded-lg px-2.5 py-1 font-semibold hover:bg-primary/90 transition-colors"
                      >
                        {step.cta}
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion reward */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-200 text-center"
          >
            <PartyPopper className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-foreground">¡Misión de inicio completada!</p>
            <p className="text-sm text-muted-foreground">Ganaste {totalXp} XP de bienvenida 🎉</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
