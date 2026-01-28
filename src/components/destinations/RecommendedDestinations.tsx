import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Destination {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  short_description: string | null;
  highlights?: string[] | null;
  best_time_to_visit?: string | null;
}

interface RecommendedDestinationsProps {
  destinations: Destination[];
}

export function RecommendedDestinations({ destinations }: RecommendedDestinationsProps) {
  if (!destinations || destinations.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Recomendados para Ti</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Destinos <span className="text-gradient">Imperdibles</span>
            </h2>
          </div>
        </motion.div>

        {/* Horizontal scrolling cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-[300px]"
            >
              <Link to={`/destino/${dest.slug || dest.id}`} className="block">
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer group h-full">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={dest.image_url || "/placeholder.svg"}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Recommendation badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Recomendado
                      </Badge>
                    </div>

                    <CardContent className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {dest.name}
                      </h3>
                      {dest.short_description && (
                        <p className="text-white/70 text-sm mt-2 line-clamp-2">
                          {dest.short_description}
                        </p>
                      )}
                      {dest.best_time_to_visit && (
                        <div className="flex items-center gap-1 text-white/60 text-xs mt-3">
                          <Clock className="h-3 w-3" />
                          <span>Mejor época: {dest.best_time_to_visit}</span>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
