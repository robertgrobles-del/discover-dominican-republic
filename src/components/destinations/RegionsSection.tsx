import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Region {
  name: string;
  slug: string;
  description: string;
  image: string;
  provinceCount: number;
  color: string;
}

const regions: Region[] = [
  {
    name: "Región Norte",
    slug: "norte",
    description: "Montañas, ríos y playas doradas del Atlántico",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80",
    provinceCount: 14,
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Región Este",
    slug: "este",
    description: "El Caribe cristalino y resorts de clase mundial",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
    provinceCount: 6,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Región Sur",
    slug: "sur",
    description: "Bahías vírgenes, dunas y naturaleza salvaje",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    provinceCount: 8,
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Santo Domingo",
    slug: "santo-domingo",
    description: "La capital histórica y cultural del Caribe",
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80",
    provinceCount: 2,
    color: "from-purple-500 to-indigo-600",
  },
];

export function RegionsSection() {
  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Compass className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Explora por Región</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Las <span className="text-gradient">Regiones</span> de RD
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada región tiene su propia personalidad y atractivos únicos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {regions.map((region, index) => (
            <motion.div
              key={region.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/destinos/region/${region.slug}`}
                className="group block relative rounded-3xl overflow-hidden aspect-[16/9] cursor-pointer"
              >
                <img
                  src={region.image}
                  alt={region.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-white/70 text-sm font-medium">
                        {region.provinceCount} provincias
                      </span>
                      <h3 className="font-display text-3xl font-bold text-white mt-1">
                        {region.name}
                      </h3>
                      <p className="text-white/80 text-sm mt-2 max-w-xs">
                        {region.description}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 group-hover:translate-x-1 transition-transform"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
