import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, Car, UtensilsCrossed, Dumbbell, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Hotel {
  id: string;
  nombre: string;
  imagen: string;
  rating: number;
  reviews: number;
  precio: number;
  distancia: string;
  amenities: string[];
  categoria: string;
}

interface DestinationHotelsProps {
  hotels: Hotel[];
  destinoId: string;
}

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Parking: Car,
  Restaurante: UtensilsCrossed,
  Gym: Dumbbell,
};

export function DestinationHotels({ hotels, destinoId }: DestinationHotelsProps) {
  return (
    <section id="destination-hotels" className="scroll-mt-32 py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Hoteles Cercanos
            </h2>
            <p className="text-muted-foreground">
              Encuentra el alojamiento perfecto para tu estadía
            </p>
          </div>
          <Link to={`/alojamientos?destino=${destinoId}`}>
            <Button variant="outline" className="gap-2">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              to={`/alojamiento/${hotel.id}`}
              className="flex flex-col md:flex-row bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="md:w-72 h-48 md:h-auto relative flex-shrink-0 overflow-hidden">
                <img
                  src={hotel.imagen}
                  alt={hotel.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-secondary text-foreground">
                  {hotel.categoria}
                </Badge>
              </div>
              
              <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {hotel.nombre}
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{hotel.rating}</span>
                      <span className="text-sm text-muted-foreground">({hotel.reviews} reseñas)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.distancia} del centro</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 4).map((amenity) => {
                      const Icon = amenityIcons[amenity] || Wifi;
                      return (
                        <span
                          key={amenity}
                          className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded"
                        >
                          <Icon className="h-3 w-3" />
                          {amenity}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-1">Desde</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${hotel.precio}
                    <span className="text-sm font-normal text-muted-foreground">/noche</span>
                  </p>
                  <Button size="sm" className="mt-3">Ver Disponibilidad</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
