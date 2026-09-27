import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MapPin, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface FavoriteItem {
  id: string;
  name: string;
  type: string;
  image?: string;
  location?: string;
}

interface ProfileFavoritesTabProps {
  favorites: FavoriteItem[];
  favLoading: boolean;
  onRemoveFavorite: (id: string, type: string) => void;
}

export function ProfileFavoritesTab({
  favorites,
  favLoading,
  onRemoveFavorite,
}: ProfileFavoritesTabProps) {
  if (favLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No tienes favoritos guardados</h3>
          <p className="text-muted-foreground mb-4">
            Explora destinos, hoteles y experiencias para guardar tus favoritos.
          </p>
          <Link to="/destinos">
            <Button>Explorar Destinos</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav, index) => (
        <motion.div
          key={fav.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden group">
            <div className="relative aspect-video">
              <img
                src={fav.image || "/placeholder.svg"}
                alt={fav.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 left-3 capitalize">{fav.type}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{fav.name}</h3>
              {fav.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {fav.location}
                </p>
              )}
              <div className="flex items-center justify-between mt-4">
                <Link
                  to={
                    fav.type === "hotel"
                      ? `/alojamiento/${fav.id}`
                      : fav.type === "guia"
                      ? `/guias-locales`
                      : fav.type === "reserva-natural"
                      ? `/reservas-naturales`
                      : fav.type === "parque-nacional"
                      ? `/parque-nacional/${fav.id}`
                      : fav.type === "destino-religioso"
                      ? `/destino-religioso/${fav.id}`
                      : `/${fav.type}/${fav.id}`
                  }
                >
                  <Button variant="outline" size="sm" className="gap-1">
                    Ver <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onRemoveFavorite(fav.id, fav.type)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
