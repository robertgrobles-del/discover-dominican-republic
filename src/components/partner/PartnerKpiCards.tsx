import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Star } from "lucide-react";

interface PartnerKpiCardsProps {
  totalEarned: number;
  totalCommission: number;
  activeBookings: number;
  rating?: number | string;
}

export function PartnerKpiCards({
  totalEarned,
  totalCommission,
  activeBookings,
  rating = "4.8"
}: PartnerKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">Ingresos Totales (Mes)</span>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono">${totalEarned.toLocaleString()}</span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +18.4%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total recaudado por reservas</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">Comisión Plataforma (10%)</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono">${totalCommission.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground font-normal">DOP/USD equiv.</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Retención automática por servicio</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">Reservas Activas</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{activeBookings}</span>
            <span className="text-xs text-blue-500 font-semibold">Confirmadas</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Clientes hospedados o en ruta</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">Valoración Media</span>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{rating}</span>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Basado en reseñas del perfil</p>
        </CardContent>
      </Card>
    </div>
  );
}
