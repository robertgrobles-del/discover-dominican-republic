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
import { supabase } from "@/integrations/supabase/client";

interface SorteoLectorBannerProps {
  origenCategoria?: string; // ej. "Hoteles", "Bares", "Guías Turísticos", "Agencias de Viajes"
}

export const SorteoLectorBanner: React.FC<SorteoLectorBannerProps> = ({
  origenCategoria = "Turismo Dominicano"
}) => {
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
      await supabase.from("contest_registrations").insert({
        nombre: nombre.trim(),
        email: email.trim(),
        intereses: [origenCategoria, "Lanzamiento Portal 2026"],
      });
    } catch {
      // Offline fallback
    }

    // Update tickets count in localStorage
    const currentTickets = parseInt(localStorage.getItem("sorteo_tickets_count") || "1", 10);
    const newTotal = currentTickets + 2;
    localStorage.setItem("sorteo_tickets_count", newTotal.toString());
    localStorage.setItem(`sorteo_lector_submitted_${origenCategoria}`, "true");

    setIsSubmitting(false);
    setHasSubmitted(true);
    toast.success("🎉 ¡Felicidades! Estás participando por fines de semana y experiencias all-inclusive.", {
      description: "+2 Boletos añadidos a tu cuenta para el sorteo del gran lanzamiento."
    });
  };

  if (hasSubmitted) {
    return (
      <Card className="border border-emerald-500/30 bg-emerald-500/5 my-8 rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">¡Ya estás participando en el Gran Sorteo!</h4>
              <p className="text-xs text-muted-foreground">
                Tus boletos están asegurados para el sorteo de apertura de <strong>Descubre RD</strong>.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs px-3 py-1">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Boletos Activos (+2)
          </Badge>
        </CardContent>
      </Card>
    );
  }

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
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-foreground/80 font-medium">
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
              <p className="text-[10px] text-center text-muted-foreground">
                Recibirás la confirmación de tus boletos y novedades exclusivas de viaje.
              </p>
            </form>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
