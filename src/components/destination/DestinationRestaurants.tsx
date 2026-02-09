import { Link } from "react-router-dom";
import { Star, ChevronRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Restaurant {
  id: string;
  slug?: string;
  nombre: string;
  imagen: string;
  tipo: string;
  rating: number;
  precio: string;
  especialidad: string;
}

interface DestinationRestaurantsProps {
  restaurantes: Restaurant[];
  destinoId: string;
}

export function DestinationRestaurants({ restaurantes, destinoId }: DestinationRestaurantsProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Utensils className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Gastronomía</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Dónde Comer
            </h2>
          </div>
          <Link to="/restaurante">
            <Button variant="outline" size="sm" className="gap-1">
              Ver más <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurantes.map((rest) => (
            <Link 
              key={rest.id} 
              to={`/restaurante/${rest.slug || rest.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[4/3]">
                <img 
                  src={rest.imagen} 
                  alt={rest.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                  {rest.precio}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-primary mb-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{rest.rating}</span>
                  <span className="text-xs text-muted-foreground">• {rest.tipo}</span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {rest.nombre}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {rest.especialidad}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
