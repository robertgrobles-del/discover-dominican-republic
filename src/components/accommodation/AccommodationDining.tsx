import { UtensilsCrossed, Wine, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestaurantItem {
  name: string;
  cuisine: string;
  tag: string;
  description: string;
  hours: string;
  dressCode: string;
  reservations: boolean;
}

interface BarItem {
  name: string;
  type: string;
  specialty: string;
  hours: string;
  description: string;
}

interface AccommodationDiningProps {
  restaurants: RestaurantItem[];
  bars: BarItem[];
}

export function AccommodationDining({ restaurants, bars }: AccommodationDiningProps) {
  return (
    <div className="space-y-8">
      {/* Restaurants Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              Restaurantes & Buffets ({restaurants.length} Opciones)
            </h2>
            <p className="text-sm text-muted-foreground">Propuestas gourmet internacionales y gastronomía criolla de autor</p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">{restaurants.length} Restaurantes</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {restaurants.map((rest) => (
            <div key={rest.name} className="bg-card rounded-3xl p-6 border border-border hover:border-primary/40 transition-colors flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{rest.tag}</span>
                  {rest.reservations && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary border-primary/20">
                      Reserva Recomendada
                    </Badge>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{rest.name}</h3>
                <p className="text-xs font-semibold text-primary/90 mb-2.5">{rest.cuisine}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{rest.description}</p>
              </div>

              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {rest.hours}</span>
                <span className="flex items-center gap-1.5 font-medium"><Users className="h-3.5 w-3.5 text-primary" /> {rest.dressCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bars Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            Bares & Coctelería de Autor ({bars.length} Bares)
          </h3>
          <Badge variant="outline" className="text-xs">{bars.length} Bares Todo Incluido</Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bars.map((bar) => (
            <div key={bar.name} className="bg-gradient-to-br from-primary/5 via-card to-card rounded-3xl p-5 border border-primary/20 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase mb-1.5">
                  <Wine className="h-3.5 w-3.5" /> {bar.type}
                </div>
                <h4 className="font-display text-base font-bold text-foreground mb-1">{bar.name}</h4>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{bar.description}</p>
              </div>
              <div className="pt-2 border-t border-border/60 text-xs">
                <p className="text-primary font-semibold text-[11px]">Especialidad: {bar.specialty}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{bar.hours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
