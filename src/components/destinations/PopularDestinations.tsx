import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Destination {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  short_description: string | null;
  highlights?: string[] | null;
}

interface PopularDestinationsProps {
  destinations: Destination[];
}

export function PopularDestinations({ destinations }: PopularDestinationsProps) {
  if (!destinations || destinations.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-sm font-semibold uppercase tracking-wider">Los Más Visitados</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Destinos Más <span className="text-gradient">Populares</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre los rincones más emblemáticos de República Dominicana
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/destino/${dest.slug || dest.id}`}
                className="group block relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={dest.image_url || "/placeholder.svg"}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Ranking badge */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-lg">
                  #{index + 1}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>República Dominicana</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white group-hover:text-primary transition-colors">
                    {dest.name}
                  </h3>
                  {dest.short_description && (
                    <p className="text-white/70 text-sm mt-2 line-clamp-2">
                      {dest.short_description}
                    </p>
                  )}
                  {dest.highlights && dest.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {dest.highlights.slice(0, 2).map((h, i) => (
                        <Badge key={i} className="bg-white/20 text-white text-xs">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
