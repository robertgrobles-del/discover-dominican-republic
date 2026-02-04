import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, ChevronRight, Clock, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NightlifeVenue {
  id: string;
  slug?: string;
  name: string;
  imageUrl?: string;
  barType?: string;
  musicStyle?: string;
  priceRange?: string;
  rating?: number;
  address?: string;
  openingHours?: string;
}

interface ProvinceNightlifeProps {
  provinceName: string;
  provinceSlug: string;
  venues: NightlifeVenue[];
}

export function ProvinceNightlife({ 
  provinceName, 
  provinceSlug,
  venues 
}: ProvinceNightlifeProps) {
  if (venues.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Music className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Vida Nocturna</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Dónde Salir en {provinceName}
            </h2>
            <p className="text-muted-foreground mt-2">
              Bares, discotecas y entretenimiento nocturno
            </p>
          </div>
          <Link to={`/vida-nocturna?provincia=${provinceSlug}`}>
            <Button variant="outline" className="hidden md:flex gap-2">
              Ver todo <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {venues.slice(0, 4).map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/bar/${venue.slug || venue.id}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full bg-card/50 backdrop-blur-sm">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={venue.imageUrl || "/placeholder.svg"}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {venue.barType && (
                      <Badge className="absolute top-3 left-3 bg-primary/90">
                        {venue.barType}
                      </Badge>
                    )}
                    
                    {venue.priceRange && (
                      <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                        {venue.priceRange}
                      </Badge>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display font-bold text-white text-lg mb-1">
                        {venue.name}
                      </h3>
                      {venue.musicStyle && (
                        <p className="text-white/70 text-sm flex items-center gap-1">
                          <Music className="h-3 w-3" />
                          {venue.musicStyle}
                        </p>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {venue.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{venue.rating}</span>
                        </div>
                      )}
                      {venue.openingHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">{venue.openingHours}</span>
                        </div>
                      )}
                    </div>
                    {venue.address && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{venue.address}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {venues.length > 4 && (
          <div className="mt-8 text-center md:hidden">
            <Link to={`/vida-nocturna?provincia=${provinceSlug}`}>
              <Button variant="outline" className="gap-2">
                Ver más <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
