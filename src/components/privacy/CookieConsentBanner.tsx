import { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("dr_privacy_consent");
    if (!consent) {
      // Delay slightly for smooth non-blocking entry
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("dr_privacy_consent", "accepted");
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem("dr_privacy_consent", "essential_only");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl p-5 shadow-2xl shadow-black/40 text-foreground relative">
        <button 
          onClick={handleDecline} 
          className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground p-1 rounded-full"
          aria-label="Cerrar banner de privacidad"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5 mb-1">
              Privacidad & Experiencia de Viaje
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilizamos cookies propias y de análisis ético para recordar tus preferencias de destinos y ofrecerte recomendaciones personalizadas sin vender tus datos.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border/60">
          <Link to="/terminos" className="text-[11px] text-muted-foreground hover:text-primary underline">
            Política de Privacidad
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDecline}
              className="text-xs h-8 rounded-xl"
            >
              Solo Esenciales
            </Button>
            <Button 
              size="sm" 
              onClick={handleAccept}
              className="text-xs h-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Aceptar Todo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
