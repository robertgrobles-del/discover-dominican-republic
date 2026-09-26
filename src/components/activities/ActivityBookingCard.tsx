import { useState } from "react";
import { Calendar, Users, Check, Compass, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ActivityBookingCardProps {
  activityName: string;
  price: number;
  duration?: string;
  xpPoints?: number;
}

export function ActivityBookingCard({
  activityName,
  price,
  duration = "3 horas",
  xpPoints = 35,
}: ActivityBookingCardProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [numPeople, setNumPeople] = useState(2);
  const [isBooked, setIsBooked] = useState(false);

  const totalCost = price * numPeople;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha válida para la actividad.");
      return;
    }
    setIsBooked(true);
    toast.success("¡Reserva confirmada con éxito!", {
      description: `Has apartado ${numPeople} cupo(s) para "${activityName}" el ${selectedDate}. Total: $${totalCost} USD.`
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border rounded-3xl shadow-xl bg-card overflow-hidden sticky top-24">
        {/* Card Header Tag */}
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Mejor Precio Garantizado
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {duration}
          </span>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-primary">${price}</span>
              <span className="text-muted-foreground text-sm font-medium"> USD / persona</span>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border-emerald-500/20">
              Disponibilidad Hoy
            </Badge>
          </div>

          {isBooked ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-6 rounded-2xl text-center space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">¡Lugar Reservado!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Hemos registrado tu reserva para <strong>{numPeople} persona(s)</strong> el día <strong>{selectedDate}</strong>. Te enviamos la confirmación a tu correo.
              </p>
              <Button 
                className="w-full mt-2" 
                variant="outline" 
                onClick={() => setIsBooked(false)}
              >
                Modificar o Reservar Otra Fecha
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              
              {/* Date Picker */}
              <div className="space-y-2">
                <label 
                  htmlFor="booking-date"
                  className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Fecha de la Actividad
                </label>
                <input 
                  type="date"
                  id="booking-date"
                  aria-label="Fecha de la actividad"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  required
                />
              </div>

              {/* Number of people */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Cantidad de Personas
                </label>
                <div className="flex items-center justify-between border border-border rounded-xl p-1 bg-muted/40">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    disabled={numPeople <= 1}
                    onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                    className="h-8 w-8 rounded-lg"
                  >
                    -
                  </Button>
                  <span className="font-bold text-sm text-foreground">{numPeople} {numPeople === 1 ? 'persona' : 'personas'}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    disabled={numPeople >= 20}
                    onClick={() => setNumPeople(numPeople + 1)}
                    className="h-8 w-8 rounded-lg"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="pt-3 pb-1 border-t border-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>${price} USD × {numPeople} {numPeople === 1 ? 'persona' : 'personas'}</span>
                  <span className="font-medium text-foreground">${totalCost} USD</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Impuestos y tasas ecológicas</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Incluidos</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/40">
                  <span>Total a Pagar</span>
                  <span className="text-primary text-lg">${totalCost} USD</span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button type="submit" size="lg" className="w-full font-bold shadow-lg text-sm rounded-xl py-6">
                Reservar Actividad Ahora
              </Button>
            </form>
          )}

          {/* Guarantees */}
          <div className="space-y-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Cancelación gratuita hasta 24 horas antes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Confirmación inmediata y voucher móvil</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Tip Widget */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 rounded-2xl flex items-start gap-3 shadow-sm">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            Recompensa de Explorador <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">+{xpPoints} XP</Badge>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Completar esta actividad sumará puntos a tu <strong>Pasaporte Digital</strong> para desbloquear insignias y beneficios exclusivos.
          </p>
        </div>
      </div>
    </div>
  );
}
