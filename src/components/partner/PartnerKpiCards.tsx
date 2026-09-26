import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Star, PhoneCall, MessageCircle, Navigation, ShieldCheck } from "lucide-react";

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

      {/* Direct Leads Generation Metrics (Item 14) */}
      <div className="sm:col-span-2 lg:col-span-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Captación Directa de Leads (Mes Actual)</h4>
            <p className="text-xs text-muted-foreground">Turistas que interactuaron directamente con tu ficha en Descubre RD sin comisión por intermediación.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 divide-x divide-border/60">
          <div className="text-center px-3">
            <div className="flex items-center justify-center gap-1 text-emerald-500 font-bold text-lg">
              <MessageCircle className="w-4 h-4" /> 148
            </div>
            <span className="text-[11px] text-muted-foreground">Clics a WhatsApp</span>
          </div>

          <div className="text-center px-3">
            <div className="flex items-center justify-center gap-1 text-primary font-bold text-lg">
              <PhoneCall className="w-4 h-4" /> 62
            </div>
            <span className="text-[11px] text-muted-foreground">Llamadas Directas</span>
          </div>

          <div className="text-center px-3">
            <div className="flex items-center justify-center gap-1 text-sky-500 font-bold text-lg">
              <Navigation className="w-4 h-4" /> 210
            </div>
            <span className="text-[11px] text-muted-foreground">Rutas en GPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
