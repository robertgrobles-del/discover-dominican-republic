import { Utensils, DollarSign, Clock, Star, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@/data/restaurants";

interface RestaurantOverviewSectionProps {
  restaurant: Restaurant;
}

export function RestaurantOverviewSection({ restaurant }: RestaurantOverviewSectionProps) {
  return (
    <div className="space-y-10">
      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
          <Utensils className="h-5 w-5 text-primary mx-auto mb-1.5" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Tipo de Cocina</p>
          <p className="text-sm font-bold text-foreground truncate">{restaurant.cuisineType[0] || 'Gourmet'}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
          <DollarSign className="h-5 w-5 text-primary mx-auto mb-1.5" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Rango de Precio</p>
          <p className="text-sm font-bold text-foreground">{restaurant.priceRange} Premium</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
          <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Horario</p>
          <p className="text-sm font-bold text-foreground truncate">{restaurant.openingHours || '12:00 - 23:00'}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400 mx-auto mb-1.5" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Calificación</p>
          <p className="text-sm font-bold text-foreground">{restaurant.rating} / 5.0</p>
        </div>
      </div>

      {/* Description & Culinary Philosophy */}
      <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          Experiencia y Filosofía Culinaria
        </h2>
        <p className="text-muted-foreground leading-relaxed text-base md:text-lg whitespace-pre-line">
          {restaurant.description ||
            "Una propuesta gastronómica excepcional que resalta lo mejor de la cocina dominicana e internacional con ingredientes frescos de la más alta calidad y un servicio impecable."}
        </p>

        {restaurant.services.length > 0 && (
          <div className="pt-4 border-t border-border/60">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Servicios & Amenidades del Restaurante
            </p>
            <div className="flex flex-wrap gap-2">
              {restaurant.services.map((service, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-muted/70 text-foreground py-1 px-3 rounded-lg text-xs font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
