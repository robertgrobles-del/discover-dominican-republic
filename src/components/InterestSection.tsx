import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import adventureImg from "@/assets/adventure.jpg";
import beachImg from "@/assets/beach-category.jpg";
import historyImg from "@/assets/history.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";

const interests = [
  {
    title: "Aventura",
    description: "Ver más",
    image: adventureImg,
  },
  {
    title: "Playas",
    description: "Ver más",
    image: beachImg,
  },
  {
    title: "Historia",
    description: "Ver más",
    image: historyImg,
  },
  {
    title: "Gastronomía",
    description: "Ver más",
    image: gastronomyImg,
  },
];

export function InterestSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
            <span className="w-8 h-px bg-border" />
            Navegación
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Explora por <span className="text-gradient">Interés</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Diseña tu viaje ideal basándote en lo que más te apasiona.
          </p>
        </motion.div>

        {/* Interest Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {interests.map((interest, index) => (
            <motion.div
              key={interest.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={interest.image}
                alt={interest.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
                <h3 className="font-display text-lg lg:text-xl font-bold text-foreground mb-1">
                  {interest.title}
                </h3>
                <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  <span>{interest.description}</span>
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
