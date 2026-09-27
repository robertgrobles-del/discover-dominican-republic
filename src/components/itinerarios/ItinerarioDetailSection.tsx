import { ChevronRight, Hotel, Star, Sun } from "lucide-react";
import { Itinerario } from "@/data/itinerariosData";

interface ItinerarioDetailSectionProps {
  itinerario: Itinerario;
}

export function ItinerarioDetailSection({ itinerario }: ItinerarioDetailSectionProps) {
  return (
    <section className="py-12 bg-card/50 border-t border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
          📋 {itinerario.titulo} — Día a Día
        </h2>

        <div className="space-y-4">
          {itinerario.dias.map((dia) => (
            <div key={dia.dia} className="bg-background rounded-xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  {dia.dia}
                </div>
                <h3 className="font-semibold text-foreground">{dia.titulo}</h3>
              </div>
              <ul className="space-y-1 ml-11">
                {dia.actividades.map((act) => (
                  <li key={act} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-3 w-3 text-primary shrink-0" /> {act}
                  </li>
                ))}
              </ul>
              {dia.noche !== "—" && (
                <p className="ml-11 mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Hotel className="h-3 w-3" /> Noche en: {dia.noche}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-background rounded-xl p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-2 text-sm">✅ Incluye</h4>
            <ul className="space-y-1">
              {itinerario.incluye.map((i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <Star className="h-3 w-3 text-primary" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background rounded-xl p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-2 text-sm">💡 Tips</h4>
            <ul className="space-y-1">
              {itinerario.tips.map((t) => (
                <li key={t} className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sun className="h-3 w-3 text-amber-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
