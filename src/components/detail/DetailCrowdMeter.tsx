import { Users, Clock, Flame, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DetailCrowdMeterProps {
  placeName?: string;
  category?: "playa" | "monumento" | "parque" | "general";
}

export function DetailCrowdMeter({
  placeName = "este atractivo",
  category = "playa"
}: DetailCrowdMeterProps) {
  // Horas típicas de visita de 8:00 AM a 8:00 PM
  const hourlyData = [
    { hour: "8 AM", pct: 15, label: "Muy Despejado" },
    { hour: "10 AM", pct: 45, label: "Moderado" },
    { hour: "12 PM", pct: 85, label: "Pico de Afluencia" },
    { hour: "2 PM", pct: 95, label: "Muy Concurrido" },
    { hour: "4 PM", pct: 75, label: "Afluencia Alta" },
    { hour: "6 PM", pct: 40, label: "Tranquilo / Atardecer" },
  ];

  // Cálculo de hora actual
  const currentHour = new Date().getHours();
  let currentLevel = "Moderado";
  let currentPct = 50;

  if (currentHour < 10) {
    currentLevel = "Tranquilo & Despejado";
    currentPct = 25;
  } else if (currentHour >= 11 && currentHour <= 15) {
    currentLevel = "Alta Concurrencia (Hora Pico)";
    currentPct = 90;
  } else if (currentHour > 15 && currentHour <= 18) {
    currentLevel = "Afluencia Moderada";
    currentPct = 60;
  } else {
    currentLevel = "Baja Afluencia";
    currentPct = 20;
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-foreground">
              Termómetro de Multitud en Vivo
            </h4>
            <p className="text-xs text-muted-foreground">
              Patrón de afluencia típica por hora del día
            </p>
          </div>
        </div>

        <Badge
          className={
            currentPct > 70
              ? "bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 text-xs"
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 text-xs"
          }
        >
          <Clock className="h-3 w-3" /> Ahora: {currentLevel}
        </Badge>
      </div>

      {/* Gráfico de barras de ocupación */}
      <div className="space-y-2 pt-2">
        <div className="grid grid-cols-6 gap-2 items-end h-20 px-1">
          {hourlyData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
              <div
                className={`w-full rounded-t-md transition-all ${
                  d.pct > 80
                    ? "bg-amber-500/80 group-hover:bg-amber-500"
                    : d.pct > 50
                    ? "bg-primary/70 group-hover:bg-primary"
                    : "bg-primary/30 group-hover:bg-primary/50"
                }`}
                style={{ height: `${d.pct}%` }}
                title={`${d.hour}: ${d.label} (${d.pct}%)`}
              />
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {d.hour}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-muted/60 border border-border rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
        <Flame className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Mejor hora recomendada:</strong> Para disfrutar de {placeName} con calma y tomar las mejores fotos sin aglomeraciones, te recomendamos llegar antes de las <strong>10:30 AM</strong> o después de las <strong>4:30 PM</strong>.
        </span>
      </div>
    </div>
  );
}
