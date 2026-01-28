import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Destination {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  short_description: string | null;
  highlights?: string[] | null;
}

interface Municipality {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  municipality_type: string | null;
}

interface SubDestinationsSectionProps {
  parentName: string;
  destinations: Destination[];
  municipalities: Municipality[];
}

export function SubDestinationsSection({ 
  parentName, 
  destinations, 
  municipalities 
}: SubDestinationsSectionProps) {
  const hasContent = (destinations && destinations.length > 0) || (municipalities && municipalities.length > 0);
  
  if (!hasContent) return null;

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Dentro de {parentName}</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Otros Destinos en <span className="text-gradient">{parentName}</span>
          </h2>
        </motion.div>

        {/* Destinations */}
        {destinations && destinations.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Destinos Turísticos
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {destinations.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/destino/${dest.slug || dest.id}`}
                    className="group block relative rounded-xl overflow-hidden aspect-video cursor-pointer"
                  >
                    <img
                      src={dest.image_url || "/placeholder.svg"}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">
                        {dest.name}
                      </h4>
                      {dest.highlights && dest.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dest.highlights.slice(0, 2).map((h, i) => (
                            <Badge key={i} className="bg-white/20 text-white text-[10px]">
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
        )}

        {/* Municipalities */}
        {municipalities && municipalities.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Municipios y Distritos
            </h3>
            <div className="flex flex-wrap gap-3">
              {municipalities.map((muni) => (
                <Link
                  key={muni.id}
                  to={`/municipio/${muni.slug || muni.id}`}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {muni.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
