import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Destination } from "@/data/destinations";

interface ProvinceDestinationsProps {
  provinceName: string;
  provinceSlug: string;
  destinations: Destination[];
}

export function ProvinceDestinations({ 
  provinceName, 
  provinceSlug,
  destinations 
}: ProvinceDestinationsProps) {
  if (destinations.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary">
              <MapPin className="h-3 w-3 mr-1" />
              Destinos
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Lugares de {provinceName}
            </h2>
            <p className="text-muted-foreground mt-2">
              {destinations.length} destinos por descubrir
            </p>
          </div>
          <Link to={`/destinos?provincia=${provinceSlug}`}>
            <Button variant="outline" className="hidden md:flex gap-2">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/destino/${destination.slug}`} className="block group">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={destination.imageUrl || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Type Badge */}
                    <Badge 
                      className="absolute top-3 left-3" 
                      variant={destination.type === "municipio" ? "secondary" : "default"}
                    >
                      {destination.type === "municipio" ? "Municipio" : "Destino"}
                    </Badge>

                    {/* Popular Badge */}
                    {destination.isPopular && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-900">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    )}

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-xl font-bold text-white mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-white/80 text-sm line-clamp-2">
                        {destination.shortDescription}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center text-primary text-sm font-medium group-hover:underline">
                      Explorar <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {destinations.length > 6 && (
          <div className="mt-8 text-center md:hidden">
            <Link to={`/destinos?provincia=${provinceSlug}`}>
              <Button variant="outline" className="gap-2">
                Ver todos los destinos <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
