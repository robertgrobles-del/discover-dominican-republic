import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Tag, ArrowRight, X, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export interface TopBarPromoConfig {
  enabled: boolean;
  text: string;
  badge: string;
  couponCode?: string;
  ctaText: string;
  ctaUrl: string;
  bgGradient: string;
}

const DEFAULT_TOPBAR_CONFIG: TopBarPromoConfig = {
  enabled: true,
  badge: "PROMO FLASH 2026",
  text: "¡Hasta 35% de descuento en Hoteles & Excursiones Oficiales de República Dominicana!",
  couponCode: "QUISQUEYA26",
  ctaText: "Aprovechar Oferta",
  ctaUrl: "/alojamientos",
  bgGradient: "from-amber-600 via-orange-600 to-primary"
};

export const TOPBAR_STORAGE_KEY = "descubrerd_topbar_promo_config";
const TOPBAR_DISMISSED_KEY = "descubrerd_topbar_promo_dismissed_session";

export function getTopBarConfig(): TopBarPromoConfig {
  try {
    const saved = localStorage.getItem(TOPBAR_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_TOPBAR_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading topbar config", e);
  }
  return DEFAULT_TOPBAR_CONFIG;
}

export function saveTopBarConfig(config: TopBarPromoConfig) {
  try {
    localStorage.setItem(TOPBAR_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("descubrerd_topbar_updated"));
  } catch (e) {
    console.error("Error saving topbar config", e);
  }
}

export function TopBarPromo() {
  const [config, setConfig] = useState<TopBarPromoConfig>(getTopBarConfig);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if dismissed in this browser session
    const dismissed = sessionStorage.getItem(TOPBAR_DISMISSED_KEY) === "true";
    setIsDismissed(dismissed);

    const handleUpdate = () => {
      setConfig(getTopBarConfig());
    };

    window.addEventListener("descubrerd_topbar_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("descubrerd_topbar_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(TOPBAR_DISMISSED_KEY, "true");
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!config.couponCode) return;
    navigator.clipboard.writeText(config.couponCode);
    setCopied(true);
    toast.success(`¡Cupón "${config.couponCode}" copiado al portapapeles!`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!config.enabled || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full bg-gradient-to-r ${config.bgGradient || "from-amber-600 via-orange-600 to-primary"} text-white text-xs relative z-50 overflow-hidden shadow-sm`}
      >
        <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 md:gap-4">
          {/* Promo Message & Badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] text-white shadow-xs shrink-0">
              <Sparkles className="h-3 w-3 animate-pulse text-amber-300" />
              {config.badge}
            </span>
            <p className="font-medium truncate text-white/95 text-xs md:text-sm">
              {config.text}
            </p>
          </div>

          {/* Coupon Code & Action CTA */}
          <div className="flex items-center gap-2 justify-center shrink-0 w-full md:w-auto">
            {config.couponCode && (
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-amber-200 border border-amber-300/40 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all"
                title="Copiar cupón de descuento"
              >
                <Tag className="h-3 w-3" />
                <span>{config.couponCode}</span>
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 opacity-70" />}
              </button>
            )}

            <Link
              to={config.ctaUrl || "/alojamientos"}
              className="inline-flex items-center gap-1 bg-white text-slate-950 hover:bg-white/90 font-bold px-3 py-1 rounded-md text-[11px] transition-colors shadow-xs"
            >
              <span>{config.ctaText || "Ver Oferta"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors ml-1"
              aria-label="Cerrar barra promocional"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
