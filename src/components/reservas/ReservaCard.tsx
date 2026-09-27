import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Link } from "react-router-dom";
import { MapPin, Star, Users, Clock, ChevronRight } from "lucide-react";
import { ReservaNatural } from "@/data/reservasData";

interface ReservaCardProps {
  reserva: ReservaNatural;
}

export function ReservaCard({ reserva }: ReservaCardProps) {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-xl transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={reserva.imagen}
          alt={reserva.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {reserva.destacado && (
          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">Destacado</Badge>
        )}
        <Badge variant="secondary" className="absolute top-3 right-12">{reserva.tipo}</Badge>
        <FavoriteButton
          id={reserva.id}
          type="reserva-natural"
          name={reserva.nombre}
          image={reserva.imagen}
          className="absolute top-3 right-3"
        />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white">{reserva.nombre}</h3>
          <p className="text-white/80 text-sm flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {reserva.ubicacion}
          </p>
        </div>
      </div>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{reserva.descripcion}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {reserva.actividades.map((a) => (
            <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {reserva.rating}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {reserva.reviews.toLocaleString()} reseñas</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {reserva.horario}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-600">{reserva.precio} entrada</span>
          <Link to={`/destino/${reserva.id}`}>
            <Button size="sm" variant="outline" className="gap-1">
              Explorar <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
