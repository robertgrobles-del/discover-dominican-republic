import { Link } from "react-router-dom";
import { Music, Clock, ChevronRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NightlifeVenue {
  id: string;
  nombre: string;
  tipo: string;
  horario: string;
  ambiente: string;
  imagen?: string;
}

interface DestinationNightlifeProps {
  venues: NightlifeVenue[];
  destinoNombre: string;
}

const defaultImages: Record<string, string> = {
  "Discoteca": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=300&fit=crop",
  "Club en Cueva": "https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&h=300&fit=crop",
  "Discoteca VIP": "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=400&h=300&fit=crop",
  "Beach Club": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=300&fit=crop",
  "Club VIP": "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=400&h=300&fit=crop",
  "Rooftop Bar": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop",
  "Bar Cultural": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
  "Bar Bohemio": "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=400&h=300&fit=crop",
  "Bar Lounge": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop",
  "Bar de Playa": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=300&fit=crop",
};

const ambienteColors: Record<string, string> = {
  "Fiesta total con shows": "bg-pink-500/20 text-pink-400",
  "Club único en cuevas naturales": "bg-purple-500/20 text-purple-400",
  "Premium y exclusivo": "bg-amber-500/20 text-amber-400",
  "Pool parties y música en vivo": "bg-cyan-500/20 text-cyan-400",
  "Exclusivo y elegante": "bg-amber-500/20 text-amber-400",
  "Cócteles con vista panorámica": "bg-rose-500/20 text-rose-400",
  "Jazz y arte alternativo": "bg-indigo-500/20 text-indigo-400",
  "Música en vivo": "bg-green-500/20 text-green-400",
  "Casual y animado": "bg-blue-500/20 text-blue-400",
  "Música latina": "bg-red-500/20 text-red-400",
  "Pool party diurna": "bg-sky-500/20 text-sky-400",
  "Relajado": "bg-teal-500/20 text-teal-400",
  "Tropical": "bg-emerald-500/20 text-emerald-400",
};

export function DestinationNightlife({ venues, destinoNombre }: DestinationNightlifeProps) {
  if (!venues || venues.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-card/50 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Music className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Entretenimiento</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Vida Nocturna en {destinoNombre}
            </h2>
          </div>
          <Link to="/vida-nocturna">
            <Button variant="outline" size="sm" className="gap-1">
              Ver guía completa <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {venues.map((venue) => {
            const venueImage = venue.imagen || defaultImages[venue.tipo] || defaultImages["Discoteca"];
            
            return (
              <div 
                key={venue.id} 
                className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={venueImage}
                    alt={venue.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm text-foreground">
                    {venue.tipo}
                  </Badge>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {venue.nombre}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{venue.horario}</span>
                  </div>
                  
                  <Badge className={`text-xs ${ambienteColors[venue.ambiente] || "bg-primary/20 text-primary"}`}>
                    {venue.ambiente}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
