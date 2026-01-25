import { Link } from "react-router-dom";
import { Music, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NightlifeVenue {
  id: string;
  nombre: string;
  tipo: string;
  horario: string;
  ambiente: string;
}

interface DestinationNightlifeProps {
  venues: NightlifeVenue[];
  destinoNombre: string;
}

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
          {venues.map((venue) => (
            <div 
              key={venue.id} 
              className="group bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {venue.tipo}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {venue.nombre}
              </h3>
              
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                <Clock className="h-3 w-3" />
                <span>{venue.horario}</span>
              </div>
              
              <Badge className={`text-xs ${ambienteColors[venue.ambiente] || "bg-primary/20 text-primary"}`}>
                {venue.ambiente}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
