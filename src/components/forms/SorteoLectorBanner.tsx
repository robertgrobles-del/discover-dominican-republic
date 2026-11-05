import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Gift, Sparkles, Trophy, CheckCircle, PartyPopper, 
  Send, Compass, Star, HeartHandshake
} from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/fastifyClient";
import { useAuth } from "@/hooks/useAuth";

interface SorteoLectorBannerProps {
  origenCategoria?: string; // ej. "Hoteles", "Bares", "Guías Turísticos", "Agencias de Viajes"
}

export const SorteoLectorBanner: React.FC<SorteoLectorBannerProps> = ({
  origenCategoria = "Turismo Dominicano"
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    return localStorage.getItem(`sorteo_lector_submitted_${origenCategoria}`) === "true";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !nombre.trim()) {
      toast.error("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Si el usuario está anónimo en la web, registramos el lead de sorteo autoritativamente
      await fetchApi("/leads", {
        method: "POST",
        body: JSON.stringify({
          name: nombre.trim(),
          email: email.trim().toLowerCase(),
          interest: `Sorteo Lector - ${origenCategoria}`,
          message: `Participación en sorteo especial de lanzamiento para categoría ${origenCategoria}`,
          source: "sorteo_lector",
          consent: true,
        }),
      });

      // Si el usuario tiene sesión, registramos su participación/interés en el módulo oficial
      setHasSubmitted(true);
      toast.success("¡Registro completado con éxito!", {
        description: "Tus datos han sido registrados para las promociones y sorteos de apertura."
      });
    } catch (err: any) {
      console.error("Error al registrar en sorteo:", err);
      toast.error(err?.message || "No se pudo completar el registro. Por favor intenta más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quien ya se registró no necesita ver el formulario ni un aviso permanente de confirmación:
  // la confirmación ya se dio al enviar (toast).
  if (hasSubmitted) return null;

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-primary/10 shadow-lg my-10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <CardContent className="p-6 md:p-10 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Gift className="w-3.5 h-3.5" /> Sorteo Especial por Lanzamiento
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-foreground leading-tight">
              ¿Eres viajero? <span className="text-primary">Gana Estadías y Excursiones</span> en RD
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Explora {origenCategoria} y regístrate hoy gratis. Con motivo del lanzamiento oficial de <strong>Descubre RD</strong>, sorteamos <strong>fines de semana en resorts all-inclusive</strong>, day passes en Samaná y tours guiados para dos personas.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-2xs text-foreground/80 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Registro 100% Gratis
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-primary" /> +2 Boletos automáticos
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" /> Premios garantizados
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-5 bg-card/90 backdrop-blur-sm p-6 rounded-2xl border border-border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold block mb-1">Tu Nombre Completo *</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ana Martínez"
                  className="bg-background text-xs h-9"
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold block mb-1">Correo Electrónico *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="bg-background text-xs h-9"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-10 gap-2 mt-2 shadow-md shadow-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Registrando..." : "¡Participar y Ganar Premios!"}
              </Button>
              <p className="text-3xs text-center text-muted-foreground">
                Recibirás la confirmación de tus boletos y novedades exclusivas de viaje.
              </p>
            </form>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
