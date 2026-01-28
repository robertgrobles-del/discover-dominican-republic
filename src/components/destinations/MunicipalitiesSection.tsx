import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Municipality {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  short_description: string | null;
  municipality_type: string | null;
  province_id: string | null;
}

interface MunicipalitiesSectionProps {
  municipalities: Municipality[];
}

export function MunicipalitiesSection({ municipalities }: MunicipalitiesSectionProps) {
  if (!municipalities || municipalities.length === 0) return null;

  // Group by type
  const municipios = municipalities.filter(m => m.municipality_type === 'municipio');
  const distritos = municipalities.filter(m => m.municipality_type === 'distrito_municipal');

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Home className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Municipios y Distritos</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comunidades <span className="text-gradient">Locales</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora la auténtica vida dominicana en sus municipios
          </p>
        </motion.div>

        {/* Masonry-like grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {municipios.slice(0, 8).map((muni, index) => (
            <motion.div
              key={muni.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}
            >
              <Link
                to={`/municipio/${muni.slug || muni.id}`}
                className="group block relative rounded-2xl overflow-hidden h-full min-h-[200px] cursor-pointer"
              >
                <img
                  src={muni.image_url || "/placeholder.svg"}
                  alt={muni.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white/60 text-xs uppercase tracking-wider">
                    {muni.municipality_type === 'municipio' ? 'Municipio' : 'Distrito Municipal'}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {muni.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Distritos as chips */}
        {distritos.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Distritos Municipales</h4>
            <div className="flex flex-wrap gap-2">
              {distritos.slice(0, 12).map((distrito) => (
                <Link
                  key={distrito.id}
                  to={`/municipio/${distrito.slug || distrito.id}`}
                  className="px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  {distrito.name}
                </Link>
              ))}
              {distritos.length > 12 && (
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  +{distritos.length - 12} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
