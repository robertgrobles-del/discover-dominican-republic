import { MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FestivalMusicalItem } from "@/data/eventosData";

interface FestivalesTabContentProps {
  festivales: FestivalMusicalItem[];
  generosMusicales: string[];
  selectedGenero: string;
  onSelectGenero: (genero: string) => void;
  labels: {
    musicRhythm: string;
    musicRhythmDesc: string;
    buy: string;
    stageMaps: string;
    stageMapsDesc: string;
    concertAlerts: string;
    concertAlertsDesc: string;
    subscribe: string;
  };
}

export function FestivalesTabContent({
  festivales,
  generosMusicales,
  selectedGenero,
  onSelectGenero,
  labels
}: FestivalesTabContentProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {labels.musicRhythm}
        </h2>
        <p className="text-muted-foreground">
          {labels.musicRhythmDesc}
        </p>
      </div>

      {/* Filtro por género */}
      <div className="flex flex-wrap gap-2 mb-8">
        {generosMusicales.map((genero) => (
          <Button
            key={genero}
            variant={selectedGenero === genero ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectGenero(genero)}
          >
            {genero}
          </Button>
        ))}
      </div>

      {/* Grid de Festivales */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {festivales.map((festival) => (
          <div key={festival.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group">
            <div className="relative h-48">
              <img 
                src={festival.imagen} 
                alt={festival.nombre}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                {festival.genero}
              </Badge>
              <Badge className="absolute top-3 right-3 bg-background/80 text-foreground">
                {festival.fecha}
              </Badge>
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-foreground mb-2">{festival.nombre}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                {festival.ubicacion}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{festival.descripcion}</p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold">{festival.precio}</span>
                <Button size="sm" className="gap-1">
                  <Ticket className="h-3 w-3" /> {labels.buy}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mapa de Escenarios */}
      <div className="bg-card rounded-xl border border-border p-6 mb-12">
        <h3 className="font-display font-bold text-lg text-foreground mb-4">{labels.stageMaps}</h3>
        <p className="text-muted-foreground mb-6">{labels.stageMapsDesc}</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-muted-foreground font-medium">Escenario</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Zona</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Capacidad</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 text-foreground">Escenario Principal</td>
                <td className="py-3 text-muted-foreground">Zona Norte</td>
                <td className="py-3 text-muted-foreground">10k</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 text-foreground">Carpa Electrónica</td>
                <td className="py-3 text-muted-foreground">Zona Playa</td>
                <td className="py-3 text-muted-foreground">2k</td>
              </tr>
              <tr>
                <td className="py-3 text-foreground">VIP Lounge & Bar</td>
                <td className="py-3 text-muted-foreground">Acceso Exclusivo</td>
                <td className="py-3 text-muted-foreground">500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
