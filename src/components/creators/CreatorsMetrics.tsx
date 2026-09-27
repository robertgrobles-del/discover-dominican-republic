import { Card, CardContent } from "@/components/ui/card";
import { Award, Hotel, Users } from "lucide-react";

interface CreatorsMetricsProps {
  balance: number;
  tier: string;
}

export function CreatorsMetrics({ balance, tier }: CreatorsMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Balance Retirable</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${balance.toFixed(2)} USD</h3>
          <span className="text-[10px] text-muted-foreground">+$140.00 de afiliados</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Nivel de Creador</p>
          <h3 className="text-2xl font-black text-primary mt-1 flex items-center gap-1.5">
            <Award className="h-6 w-6 text-primary" /> {tier}
          </h3>
          <span className="text-[10px] text-muted-foreground">Pago: $2.00 por cada 1K vistas</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Estadías Patrocinadas</p>
          <h3 className="text-2xl font-black text-foreground mt-1 flex items-center gap-1.5">
            <Hotel className="h-6 w-6 text-amber-500" /> 3 Asignadas
          </h3>
          <span className="text-[10px] text-muted-foreground">POP, Samaná, Santo Domingo</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Pool de Creadores</p>
          <h3 className="text-2xl font-black text-foreground mt-1 flex items-center gap-1.5">
            <Users className="h-6 w-6 text-blue-500" /> 100+ Activos
          </h3>
          <span className="text-[10px] text-muted-foreground">Verificados por MITUR & Hoteles</span>
        </CardContent>
      </Card>
    </div>
  );
}
