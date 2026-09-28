import { useState } from "react";
import { Calendar, Users, Ticket, Phone, Instagram, ShieldCheck, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { saveLeadLocally } from "@/lib/leadStorage";

interface BarVipBookingCardProps {
  barName: string;
  phone?: string;
  instagram?: string;
  address?: string;
  openingHours?: string;
}

export function BarVipBookingCard({
  barName,
  phone,
  instagram,
  address,
  openingHours,
}: BarVipBookingCardProps) {
  const [vipZone, setVipZone] = useState("Mesa VIP Pista");
  const [guestCount, setGuestCount] = useState("4");
  const [vipName, setVipName] = useState("");
  const [vipPhone, setVipPhone] = useState("");
  const [vipDate, setVipDate] = useState(new Date().toISOString().split("T")[0]);

  const handleVipBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName.trim()) {
      toast.error("Por favor ingresa el nombre para la lista VIP");
      return;
    }

    await saveLeadLocally({
      name: vipName.trim(),
      phone: vipPhone.trim() || undefined,
      service: `Mesa VIP (${vipZone}, ${guestCount} personas, ${vipDate}) - ${barName}`,
      source: "bar-vip-booking"
    });

    toast.success("¡Solicitud VIP Registrada!", {
      description: `Mesa ${vipZone} solicitada para ${guestCount} personas el ${vipDate} a nombre de ${vipName}. Datos guardados correctamente.`
    });
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-xl ring-1 ring-border/50 sticky top-28 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-border/70">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Mesa VIP & Bottle Service</h3>
          <p className="text-xs text-muted-foreground">Acceso prioritario sin fila en puerta</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold">
          🍾
        </div>
      </div>

      <form onSubmit={handleVipBooking} className="space-y-4">
        {/* VIP Zone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 text-primary" /> Zona de Ubicación
          </label>
          <Select value={vipZone} onValueChange={setVipZone}>
            <SelectTrigger aria-label="Zona de mesa VIP" className="rounded-xl bg-muted/30 border-border">
              <SelectValue placeholder="Selecciona Zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mesa VIP Pista">Mesa VIP Pista (Cerca del DJ)</SelectItem>
              <SelectItem value="Zona Lounge Terraza">Zona Lounge Terraza / Rooftop</SelectItem>
              <SelectItem value="Balcón Exclusivo Ultra VIP">Balcón Exclusivo Ultra VIP</SelectItem>
              <SelectItem value="Barra Principal (Guestlist)">Barra Principal (Entrada sin mesa)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date & Guests */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="vip-date" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Fecha
            </label>
            <Input 
              type="date"
              id="vip-date"
              aria-label="Fecha de la visita"
              value={vipDate}
              onChange={(e) => setVipDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="rounded-xl bg-muted/30 border-border"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Personas
            </label>
            <Select value={guestCount} onValueChange={setGuestCount}>
              <SelectTrigger aria-label="Cantidad de personas" className="rounded-xl bg-muted/30 border-border">
                <SelectValue placeholder="Personas" />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 6, 8, 10, 15, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} personas</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Full Name & Phone */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="vip-lead-name" className="text-xs font-semibold text-muted-foreground uppercase">Nombre del Titular</label>
            <Input 
              placeholder="Ej: Lic. Roberto Guzmán"
              id="vip-lead-name"
              aria-label="Nombre del titular para lista VIP"
              value={vipName}
              onChange={(e) => setVipName(e.target.value)}
              className="rounded-xl bg-muted/30 border-border"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="vip-lead-phone" className="text-xs font-semibold text-muted-foreground uppercase">Teléfono / WhatsApp</label>
            <Input 
              placeholder="Ej: +1 809-555-0199"
              id="vip-lead-phone"
              aria-label="Teléfono o WhatsApp de contacto"
              value={vipPhone}
              onChange={(e) => setVipPhone(e.target.value)}
              className="rounded-xl bg-muted/30 border-border"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-xl font-bold py-6 shadow-md mt-2">
          Solicitar Mesa VIP & Acceso
        </Button>

        {/* Direct WhatsApp Contact Button (★ Mejora 79) */}
        <a
          href={`https://wa.me/18092214660?text=${encodeURIComponent(`Hola, vi su ficha en Descubre República Dominicana y deseo consultar disponibilidad para mesa VIP / reserva en ${barName} (Fecha: ${vipDate}, Área: ${vipZone}, Personas: ${guestCount}).`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
        >
          <Phone className="h-4 w-4 fill-current" />
          Contactar VIP por WhatsApp
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
        {instagram && (
          <div className="flex items-center gap-2">
            <Instagram className="h-3.5 w-3.5 text-pink-500 shrink-0" />
            <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium text-foreground">{instagram}</a>
          </div>
        )}
        {openingHours && (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{openingHours}</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Edad mínima 18+ obligatoria. Se solicita cédula/pasaporte en puerta.</span>
      </div>
    </div>
  );
}
