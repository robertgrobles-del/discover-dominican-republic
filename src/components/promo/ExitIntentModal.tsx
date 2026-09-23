import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, X, Compass, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface ExitPopupConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badgeText: string;
  giftText: string;
  xpReward: number;
}

const DEFAULT_EXIT_CONFIG: ExitPopupConfig = {
  enabled: true,
  badgeText: "¡ESPERA, NO TE VAYAS CON LAS MANOS VACÍAS!",
  title: "Regístrate hoy y recibe 100 Monedas + Guía Oficial de Playas VIP",
  subtitle: "Crea tu Pasaporte Digital gratis para desbloquear descuentos en hoteles, sellos coleccionables de las 32 provincias y ofertas flash.",
  giftText: "+100 Puntos XP y Guía PDF Exclusiva",
  xpReward: 100
};

export const EXIT_POPUP_STORAGE_KEY = "descubrerd_exit_popup_config";
const EXIT_POPUP_SHOWN_KEY = "descubrerd_exit_popup_shown_session";

export function getExitPopupConfig(): ExitPopupConfig {
  try {
    const saved = localStorage.getItem(EXIT_POPUP_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_EXIT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading exit popup config", e);
  }
  return DEFAULT_EXIT_CONFIG;
}

export function saveExitPopupConfig(config: ExitPopupConfig) {
  try {
    localStorage.setItem(EXIT_POPUP_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("descubrerd_exit_popup_updated"));
  } catch (e) {
    console.error("Error saving exit popup config", e);
  }
}

export function ExitIntentModal() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ExitPopupConfig>(getExitPopupConfig);
  
  // Registration mini-form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successRegistered, setSuccessRegistered] = useState(false);

  useEffect(() => {
    const handleConfigUpdate = () => {
      setConfig(getExitPopupConfig());
    };
    window.addEventListener("descubrerd_exit_popup_updated", handleConfigUpdate);
    return () => window.removeEventListener("descubrerd_exit_popup_updated", handleConfigUpdate);
  }, []);

  useEffect(() => {
    // Only activate for visitors who are not logged in
    if (user || !config.enabled) return;

    // Check if shown in current browser session
    const hasBeenShown = sessionStorage.getItem(EXIT_POPUP_SHOWN_KEY) === "true";
    if (hasBeenShown) return;

    let timer: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves viewport near top (navigating to address bar or tabs)
      if (e.clientY <= 10 && !sessionStorage.getItem(EXIT_POPUP_SHOWN_KEY)) {
        setOpen(true);
        sessionStorage.setItem(EXIT_POPUP_SHOWN_KEY, "true");
      }
    };

    // Mobile fallback: trigger after 45 seconds of interaction if still guest
    timer = setTimeout(() => {
      if (!sessionStorage.getItem(EXIT_POPUP_SHOWN_KEY) && !user) {
        setOpen(true);
        sessionStorage.setItem(EXIT_POPUP_SHOWN_KEY, "true");
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [user, config.enabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    if (!acceptTerms) {
      toast.error("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, name.trim());
      if (error) {
        toast.error(`Error: ${error.message}`);
      } else {
        setSuccessRegistered(true);
        toast.success(`🎉 ¡Felicidades ${name}! Has ganado ${config.xpReward} XP y acceso completo a Descubre RD.`);
        setTimeout(() => {
          setOpen(false);
          navigate("/gamificacion-turistica");
        }, 2200);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  if (!config.enabled || user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden border-border/80 rounded-3xl shadow-2xl bg-card">
        {/* Header Visual Banner */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-amber-600 p-6 text-white text-center overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-xl" />
          
          <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold px-3 py-1 mb-3 backdrop-blur-md uppercase tracking-wider mx-auto">
            <Sparkles className="h-3 w-3 mr-1 text-amber-300" />
            {config.badgeText}
          </Badge>

          <DialogTitle className="text-xl sm:text-2xl font-black font-display tracking-tight text-white leading-tight">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/90 mt-2 max-w-md mx-auto leading-relaxed">
            {config.subtitle}
          </DialogDescription>

          <div className="mt-4 inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 shadow-inner">
            <Gift className="h-4 w-4" />
            <span>Recompensa Instantánea: {config.giftText}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {successRegistered ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">¡Pasaporte Creado con Éxito!</h3>
              <p className="text-sm text-muted-foreground">
                Te estamos redirigiendo a la sala de exploradores y tus sellos...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="exit-name" className="text-xs font-medium">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="exit-name"
                    placeholder="Ej. Carlos Martínez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="exit-email" className="text-xs font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="exit-email"
                    type="email"
                    placeholder="carlos@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="exit-pass" className="text-xs font-medium">Crear Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="exit-pass"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Mandatory Checkbox 1: Terms */}
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="exit-terms"
                  checked={acceptTerms}
                  onCheckedChange={(c) => setAcceptTerms(c as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="exit-terms" className="text-[11px] text-muted-foreground leading-tight">
                  Acepto los{" "}
                  <Link to="/terminos" target="_blank" className="text-primary underline font-medium">
                    Términos y Condiciones
                  </Link>{" "}
                  y la Política de Privacidad de Datos.
                </Label>
              </div>

              {/* Mandatory Checkbox 2: Newsletter */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="exit-newsletter"
                  checked={subscribeNewsletter}
                  onCheckedChange={(c) => setSubscribeNewsletter(c as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="exit-newsletter" className="text-[11px] text-muted-foreground leading-tight">
                  Deseo suscribirme al boletín oficial con promociones y ofertas turísticas exclusivas.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-10 mt-2 gap-2 shadow-md"
                disabled={loading}
              >
                {loading ? "Generando Pasaporte..." : "Reclamar Mis 100 Monedas y Guía VIP"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-4 text-[10px] text-muted-foreground border-t border-border mt-4">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Datos 100% protegidos bajo directrices oficiales del Ministerio de Turismo.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
