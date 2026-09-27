import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Star, Check } from "lucide-react";

interface AirbnbBookingWidgetProps {
  pricePerNight: number;
  rating: number;
  checkIn: string;
  onCheckInChange: (val: string) => void;
  checkOut: string;
  onCheckOutChange: (val: string) => void;
  guestCount: number;
  onGuestCountChange: (val: number) => void;
  maxGuests: number;
  instantBook?: boolean;
  totals: {
    nights: number;
    subtotal: number;
    cleaning: number;
    service: number;
    total: number;
  } | null;
}

export function AirbnbBookingWidget({
  pricePerNight,
  rating,
  checkIn,
  onCheckInChange,
  checkOut,
  onCheckOutChange,
  guestCount,
  onGuestCountChange,
  maxGuests,
  instantBook,
  totals,
}: AirbnbBookingWidgetProps) {
  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">${pricePerNight || 450}</span>
            <span className="text-muted-foreground"> /noche</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">CHECK-IN</label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">CHECK-OUT</label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">HUÉSPEDES</label>
          <Input
            type="number"
            value={guestCount}
            onChange={(e) => onGuestCountChange(parseInt(e.target.value) || 1)}
            min={1}
            max={maxGuests || 8}
          />
        </div>

        <Button className="w-full" size="lg">
          {instantBook ? "Reservar ahora" : "Solicitar reserva"}
        </Button>

        {totals && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="underline">
                ${pricePerNight} x {totals.nights} noches
              </span>
              <span>${totals.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Tarifa de limpieza</span>
              <span>${totals.cleaning}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Tarifa de servicio</span>
              <span>${totals.service}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${totals.total}</span>
            </div>
          </div>
        )}

        {instantBook && (
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Check className="h-4 w-4 text-primary" />
            Reserva instantánea disponible
          </p>
        )}
      </CardContent>
    </Card>
  );
}
