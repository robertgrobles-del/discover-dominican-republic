import React, { useState, useEffect } from "react";
import { MapPin, Users, Sparkles, CheckCircle2, ShieldCheck, X, Bed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SocialActivity {
  id: string;
  avatarText: string;
  actor: string;
  action: string;
  target: string;
  timeAgo: string;
  icon: typeof Bed;
  link?: string;
  badge?: string;
}

const ACTIVITIES: SocialActivity[] = [
  {
    id: "act-1",
    avatarText: "🇩🇴",
    actor: "Carlos M. (Santo Domingo)",
    action: "reservó estadía directa en",
    target: "Boutique Eco-Lodge Las Terrenas",
    timeAgo: "Hace 4 minutos",
    icon: Bed,
    link: "/alojamiento/eco-lodge-las-terrenas",
    badge: "Reserva Directa",
  },
  {
    id: "act-2",
    avatarText: "🇪🇸",
    actor: "Elena R. (Madrid)",
    action: "consultó la guía oficial de",
    target: "Bahía de las Águilas & Pedernales",
    timeAgo: "Hace 8 minutos",
    icon: MapPin,
    link: "/destinos/pedernales",
    badge: "Explorando",
  },
  {
    id: "act-3",
    avatarText: "🇺🇸",
    actor: "David S. (Miami)",
    action: "activó su eSIM Turista",
    target: "5G Caribe Ilimitado",
    timeAgo: "Hace 12 minutos",
    icon: Sparkles,
    link: "/conectividad#esim",
    badge: "Conectividad",
  },
  {
    id: "act-4",
    avatarText: "🇩🇴",
    actor: "Operador Turístico",
    action: "completó certificación con",
    target: "Sello Verificado MITUR en Jarabacoa",
    timeAgo: "Hace 19 minutos",
    icon: ShieldCheck,
    link: "/operadores",
    badge: "Verificado",
  },
  {
    id: "act-5",
    avatarText: "🇨🇦",
    actor: "Sophie L. (Montreal)",
    action: "completó el reto de exploración",
    target: "Ruta del Cacao en San Francisco",
    timeAgo: "Hace 26 minutos",
    icon: CheckCircle2,
    link: "/gamificacion-turistica/retos",
    badge: "+150 XP",
  },
];

export function SocialProofNotifications() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show first toast after 8 seconds of browsing
    const initialTimer = setTimeout(() => {
      if (!isDismissed) setIsVisible(true);
    }, 8000);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    // Keep visible for 6 seconds, then hide and switch
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // Re-appear after 22 seconds with next item
      const nextTimer = setTimeout(() => {
        if (!isDismissed) {
          setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
          setIsVisible(true);
        }
      }, 22000);

      return () => clearTimeout(nextTimer);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed]);

  if (isDismissed) return null;

  const current = ACTIVITIES[currentIndex];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-xs sm:max-w-sm pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3.5 shadow-2xl shadow-slate-950/20 flex items-start gap-3 relative group"
          >
            {/* Close / Dismiss Button */}
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setIsDismissed(true);
              }}
              className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Avatar / Flag */}
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0 shadow-xs">
              {current.avatarText}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-2xs font-bold text-foreground leading-tight">{current.actor}</span>
                {current.badge && (
                  <span className="text-3xs font-extrabold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full border border-primary/20 uppercase">
                    {current.badge}
                  </span>
                )}
              </div>
              <p className="text-2xs text-muted-foreground leading-tight">
                {current.action}{" "}
                {current.link ? (
                  <Link to={current.link} className="font-semibold text-foreground hover:text-primary transition-colors underline decoration-dotted">
                    {current.target}
                  </Link>
                ) : (
                  <strong className="text-foreground">{current.target}</strong>
                )}
              </p>
              <div className="flex items-center gap-1 text-3xs text-muted-foreground/70 pt-0.5">
                <Icon className="h-3 w-3 text-primary" />
                <span>{current.timeAgo}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verificado</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
