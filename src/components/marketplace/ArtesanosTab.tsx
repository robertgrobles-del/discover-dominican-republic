import { MapPin, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { type Artesano } from "@/data/marketplaceData";

interface ArtesanosTabProps {
  artesanos: Artesano[];
  onChat: (artesano: Artesano) => void;
}

export function ArtesanosTab({ artesanos, onChat }: ArtesanosTabProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {artesanos.map((art) => (
        <Card key={art.id} className="group overflow-hidden border-border hover:shadow-xl transition-all bg-card/45 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img src={art.imagen} alt={art.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs gap-1">
                <CheckCircle className="h-3 w-3" /> Taller Verificado
              </Badge>
              <Badge className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm border-white/10 text-[9px] uppercase font-bold tracking-wider">
                {art.especialidad}
              </Badge>
            </div>

            <div className="p-5 pt-0 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{art.ubicacion}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">{art.nombre}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{art.bio}</p>
            </div>
          </div>

          <div className="p-5 pt-0">
            <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => onChat(art)}>
              <Phone className="h-4 w-4" /> Chat Directo
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
