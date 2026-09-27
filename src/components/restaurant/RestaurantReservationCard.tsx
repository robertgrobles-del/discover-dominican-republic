import { useState } from "react";
import { Calendar, Users, Clock, ShieldCheck, CheckCircle2, Phone, Globe, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RestaurantReservationCardProps {
  restaurantName: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  openingHours?: string;
}

export function RestaurantReservationCard({
  restaurantName,
  phone,
  website,
  email,
  address,
  openingHours,
}: RestaurantReservationCardProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [selectedGuests, setSelectedGuests] = useState("2");
  const [reservationName, setReservationName] = useState("");
  const [specialRequest, setSpecialRequest] = useState("Sin preferencias");

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationName.trim()) {
      toast.error("Por favor ingresa tu nombre para la reserva");
      return;
    }
    toast.success("¡Mesa Reservada con Éxito!", {
      description: `Confirmación enviada a nombre de ${reservationName} para ${selectedGuests} comensales el ${selectedDate} a las ${selectedTime}. ¡Buen provecho!`
    });
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-xl ring-1 ring-border/50 sticky top-28 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-border/70">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Reservar Mesa</h3>
          <p className="text-xs text-muted-foreground">Confirmación instantánea sin cargos</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
          🍽️
        </div>
      </div>

      <form onSubmit={handleReservation} className="space-y-4">
        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="res-date" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Fecha
          </label>
          <Input 
            type="date"
            id="res-date"
            aria-label="Fecha de la reserva"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-xl bg-muted/30 border-border"
            required
          />
        </div>

        {/* Time & Guests */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Hora
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger aria-label="Hora de la reserva" className="rounded-xl bg-muted/30 border-border">
                <SelectValue placeholder="Hora" />
              </SelectTrigger>
              <SelectContent>
                {["12:30", "13:00", "13:30", "14:00", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Personas
            </label>
            <Select value={selectedGuests} onValueChange={setSelectedGuests}>
              <SelectTrigger aria-label="Cantidad de personas" className="rounded-xl bg-muted/30 border-border">
                <SelectValue placeholder="Personas" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'persona' : 'personas'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="res-name" className="text-xs font-semibold text-muted-foreground uppercase">Nombre Completo</label>
          <Input 
            placeholder="Ej: Lic. Roberto Guzmán"
            id="res-name"
            aria-label="Nombre completo para la reserva"
            value={reservationName}
            onChange={(e) => setReservationName(e.target.value)}
            className="rounded-xl bg-muted/30 border-border"
            required
          />
        </div>

        {/* Special Requests */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Área Preferida</label>
          <Select value={specialRequest} onValueChange={setSpecialRequest}>
            <SelectTrigger aria-label="Preferencia de área" className="rounded-xl bg-muted/30 border-border">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sin preferencias">Sin preferencias (Cualquiera)</SelectItem>
              <SelectItem value="Terraza al aire libre">Terraza al aire libre</SelectItem>
              <SelectItem value="Salón principal climatizado">Salón principal climatizado</SelectItem>
              <SelectItem value="Mesa romántica / rincón privado">Mesa romántica / rincón íntimo</SelectItem>
              <SelectItem value="Cerca del bar / lounge">Cerca del bar / lounge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-xl font-bold py-6 shadow-md mt-2">
          Confirmar Reserva de Mesa
        </Button>

        {/* Direct WhatsApp Contact Button (★ Mejora 79) */}
        <a
          href={`https://wa.me/18095550198?text=${encodeURIComponent(`Hola, vi su ficha en Descubre República Dominicana y deseo consultar disponibilidad de mesa en ${restaurantName} (Fecha: ${selectedDate}, Turno: ${selectedTime}, Personas: ${selectedGuests}).`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
        >
          <Phone className="h-4 w-4 fill-current" />
          Contactar / Reservar por WhatsApp
        </a>
      </form>

      {/* Direct Contact Info */}
      <div className="pt-4 border-t border-border/70 space-y-2.5 text-xs text-muted-foreground">
        {address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            <a href={`tel:${phone}`} className="hover:text-primary transition-colors font-medium text-foreground">{phone}</a>
          </div>
        )}
        {openingHours && (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{openingHours}</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Sin penalidad por cancelación. Notifícanos con 2h de anticipación.</span>
      </div>
    </div>
  );
}
