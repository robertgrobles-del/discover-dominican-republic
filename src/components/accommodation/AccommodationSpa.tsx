import { HeartPulse, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SpaInfo {
  name?: string;
  concept?: string;
  size?: string;
  hours?: string;
  schedule?: string;
  treatments?: string[];
  hydrotherapy?: string[];
  facilities?: { name: string; desc: string }[];
}

interface AccommodationSpaProps {
  spa?: SpaInfo | null;
}

export function AccommodationSpa({ spa }: AccommodationSpaProps) {
  if (!spa) return null;

  const treatments = spa.treatments && spa.treatments.length > 0 
    ? spa.treatments 
    : spa.facilities?.map(f => `${f.name}: ${f.desc}`) || [
        "Masajes terapéuticos caribeños con aceites esenciales",
        "Envoltura corporal con barros minerales",
        "Tratamiento facial hidratante de luminosidad marina",
        "Ritual sensorial de aromaterapia"
      ];

  const hydrotherapy = spa.hydrotherapy && spa.hydrotherapy.length > 0
    ? spa.hydrotherapy
    : [
        "Piscina de contrastes frío y calor",
        "Circuito de chorros y cascadas cervicales",
        "Sauna seco tradicional y baño de vapor turco",
        "Área de relajación con tumbonas térmicas"
      ];

  const hours = spa.hours || spa.schedule || "08:00 AM - 20:00 PM";
  const concept = spa.concept || "Centro de relajación, hidroterapia y bienestar integral";
  const size = spa.size || "1,800 m² de Instalaciones";
  const name = spa.name || "Spa & Centro de Bienestar";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
          <HeartPulse className="h-6 w-6 text-primary" />
          {name}
        </h2>
        <p className="text-sm text-muted-foreground">{concept} ({size})</p>
      </div>

      <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-6 md:p-8 border border-border shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Horario de Atención</span>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Clock className="h-4 w-4 text-primary" /> {hours}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Circuito de Hidroterapia Incluido
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Tratamientos Exclusivos
            </h4>
            <div className="grid gap-2">
              {treatments.map((t, idx) => (
                <div key={idx} className="p-3 bg-muted/40 rounded-xl text-xs font-medium text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" /> Circuito Termal & Aguas
            </h4>
            <div className="grid gap-2">
              {hydrotherapy.map((h, idx) => (
                <div key={idx} className="p-3 bg-muted/40 rounded-xl text-xs font-medium text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
