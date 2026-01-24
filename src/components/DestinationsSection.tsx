import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";

const destinations = [
  {
    name: "Punta Cana",
    description: "Playas de arena blanca y aguas cristalinas con resorts de clase mundial.",
    image: puntaCanaImg,
  },
  {
    name: "Santo Domingo",
    description: "La ciudad colonial más antigua de América, rica en historia y cultura.",
    image: santoDomingoImg,
  },
  {
    name: "Samaná",
    description: "Naturaleza virgen, ballenas jorobadas y cascadas impresionantes.",
    image: samanaImg,
  },
];

export function DestinationsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              Destinos Populares
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Sumérgete en nuestros{" "}
              <span className="text-gradient">paraísos</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Desde playas de arenas blancas hasta las cimas más altas del Caribe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="link" className="text-primary gap-2">
              Ver todos los destinos
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Destination Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={destination.image}
                alt={destination.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {destination.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {destination.description}
                </p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Explorar destino</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
