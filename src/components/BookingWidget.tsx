import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface BookingWidgetProps {
  itemType: string;
  itemId: string;
  itemName: string;
  itemImage?: string;
  priceRange?: string;
}

export function BookingWidget({ itemType, itemId, itemName, itemImage, priceRange }: BookingWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Inicia sesión", description: "Necesitas una cuenta para reservar." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("reservations").insert({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      item_image: itemImage,
      check_in: checkIn || null,
      check_out: checkOut || null,
      guests,
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setSuccess(true);
      toast({ title: "¡Reserva enviada!", description: "Te contactaremos para confirmar." });
    }
  };

  if (success) {
    return (
      <Card className="border-primary/30">
        <CardContent className="p-6 text-center space-y-3">
          <CheckCircle className="h-12 w-12 mx-auto text-[hsl(var(--emerald))]" />
          <h3 className="font-semibold text-lg">¡Reserva enviada!</h3>
          <p className="text-sm text-muted-foreground">Recibirás confirmación pronto.</p>
          <Button variant="outline" asChild><Link to="/reservas">Ver mis reservas</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Reservar {itemType === "hotel" ? "alojamiento" : itemType}
        </CardTitle>
        {priceRange && <p className="text-sm text-muted-foreground">{priceRange}</p>}
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">Inicia sesión para reservar</p>
            <Button asChild className="w-full"><Link to="/login">Iniciar Sesión</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Check-in</Label>
                <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Check-out</Label>
                <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Personas</Label>
              <Input type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div>
              <Label className="text-xs">Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 809..." />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Solicitar Reserva
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
