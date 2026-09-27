import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign, MapPin } from "lucide-react";
import { Itinerario } from "@/data/itinerariosData";

interface ItinerarioCardProps {
  itinerario: Itinerario;
  isSelected: boolean;
  onSelect: () => void;
}

export function ItinerarioCard({ itinerario, isSelected, onSelect }: ItinerarioCardProps) {
  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="relative h-40">
        <img
          src={itinerario.imagen}
          alt={itinerario.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-1">
            <Clock className="h-3 w-3 mr-1" /> {itinerario.duracion}
          </Badge>
          <h3 className="font-display text-lg font-bold text-white">
            {itinerario.titulo}
          </h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {itinerario.perfil}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" /> {itinerario.presupuesto}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{itinerario.descripcion}</p>
        <div className="flex flex-wrap gap-1">
          {itinerario.destinos.map((d) => (
            <Badge key={d} variant="outline" className="text-[10px]">
              <MapPin className="h-2.5 w-2.5 mr-0.5" /> {d}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
