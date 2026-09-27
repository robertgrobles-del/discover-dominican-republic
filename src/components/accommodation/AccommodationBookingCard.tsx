import { useState } from "react";
import { Calendar, Users, ShieldCheck, Check, Sparkles, Phone, ExternalLink, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RoomSelection {
  name: string;
  pricePerNight?: number;
  price?: number;
}

interface AccommodationBookingCardProps {
  hotelName: string;
  selectedRoom: RoomSelection;
  phone?: string;
  website?: string;
  nightsCount?: number;
}

export function AccommodationBookingCard({
  hotelName,
  selectedRoom,
  phone,
  website,
}: AccommodationBookingCardProps) {
  const today = new Date();
  const defaultIn = new Date(today.setDate(today.getDate() + 7)).toISOString().split("T")[0];
  const defaultOut = new Date(today.setDate(today.getDate() + 4)).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [guests, setGuests] = useState(2);
  const [isBooked, setIsBooked] = useState(false);

  // Calculate nights
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const diffTime = Math.max(1, dOut.getTime() - dIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const roomPrice = selectedRoom.pricePerNight ?? selectedRoom.price ?? 150;
  const totalPrice = roomPrice * nights;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("La fecha de salida debe ser posterior a la de entrada");
      return;
    }
    setIsBooked(true);
    toast.success("¡Solicitud de Reserva Registrada!", {
      description: `Has reservado ${nights} noche(s) en ${selectedRoom.name} para ${guests} huéspedes en ${hotelName}. Total estimado: $${totalPrice} USD.`
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border rounded-3xl shadow-xl bg-card overflow-hidden sticky top-24">
        {/* Top Tag */}
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Todo Incluido Premium
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Bed className="h-3.5 w-3.5 text-primary" /> {selectedRoom.name}
          </span>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-primary">US$ {roomPrice}</span>
              <span className="text-muted-foreground text-xs sm:text-sm font-medium"> / noche</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                aprox. RD$ {(roomPrice * 60).toLocaleString("es-DO")}
              </p>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border-emerald-500/20">
              Mejor Tarifa Directa
            </Badge>
          </div>

          {isBooked ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-6 rounded-2xl text-center space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">¡Estadía Apartada!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Hemos registrado tu solicitud para <strong>{nights} noche(s)</strong> ({checkIn} al {checkOut}) para <strong>{guests} huéspedes</strong>.
              </p>
              <Button 
                className="w-full mt-2" 
                variant="outline" 
                onClick={() => setIsBooked(false)}
              >
                Modificar Fechas
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              
              {/* Check-in & Check-out */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="hotel-checkin" className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Entrada
                  </label>
                  <input
                    type="date"
                    id="hotel-checkin"
                    aria-label="Fecha de entrada"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-muted/40 border border-border rounded-xl px-2.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="hotel-checkout" className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Salida
                  </label>
                  <input
                    type="date"
                    id="hotel-checkout"
                    aria-label="Fecha de salida"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="w-full bg-muted/40 border border-border rounded-xl px-2.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
              </div>

              {/* Number of guests */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" /> Huéspedes
                </label>
                <div className="flex items-center justify-between border border-border rounded-xl p-1 bg-muted/40">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    disabled={guests <= 1}
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="h-7 w-7 rounded-lg"
                  >
                    -
                  </Button>
                  <span className="font-bold text-xs sm:text-sm text-foreground">{guests} {guests === 1 ? 'adulto' : 'adultos'}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    disabled={guests >= 8}
                    onClick={() => setGuests(guests + 1)}
                    className="h-7 w-7 rounded-lg"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 pb-1 border-t border-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>US$ {selectedRoom.pricePerNight} × {nights} noche(s)</span>
                  <span className="font-medium text-foreground">US$ {totalPrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Régimen Todo Incluido (Comidas & Bebidas)</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Gratis</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/40">
                  <div>
                    <span>Total Estimado</span>
                    <p className="text-[11px] text-muted-foreground font-normal">
                      aprox. RD$ {(totalPrice * 60).toLocaleString("es-DO")}
                    </p>
                  </div>
                  <span className="text-primary text-lg">US$ {totalPrice}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full font-bold shadow-lg text-sm rounded-xl py-6">
                Verificar & Reservar Estadía
              </Button>

              {/* Direct WhatsApp Contact Button (★ Mejora 79) */}
              <a
                href={`https://wa.me/18095550198?text=${encodeURIComponent(`Hola, vi su ficha en Descubre República Dominicana y deseo consultar disponibilidad para ${hotelName} (${nights} noche(s) para ${guests} huéspedes del ${checkIn} al ${checkOut}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
              >
                <Phone className="h-4 w-4 fill-current" />
                Contactar por WhatsApp Directo
              </a>
            </form>
          )}

          {/* Direct Hotel Contacts */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/40">
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Recepción Directa
                </span>
                <span className="font-medium text-foreground">{phone}</span>
              </a>
            )}
            {website && (
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/40"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" /> Sitio Web Oficial
                </span>
                <span className="text-primary font-semibold">Visitar</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>Cancelación gratuita hasta 48h antes del check-in</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
