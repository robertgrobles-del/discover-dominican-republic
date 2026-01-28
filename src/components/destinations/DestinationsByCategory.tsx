import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Waves, Mountain, TreePine, Droplets, Sun, Building, Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  gradient: string;
  destinations: string[];
}

const categories: Category[] = [
  {
    id: "playa",
    name: "Playas",
    icon: Waves,
    description: "Arena blanca y aguas cristalinas",
    color: "text-cyan-500",
    gradient: "from-cyan-500/20 to-blue-500/20",
    destinations: ["Punta Cana", "Samaná", "Puerto Plata", "Bayahíbe"],
  },
  {
    id: "montaña",
    name: "Montaña",
    icon: Mountain,
    description: "Picos nevados y climas frescos",
    color: "text-emerald-500",
    gradient: "from-emerald-500/20 to-green-500/20",
    destinations: ["Jarabacoa", "Constanza", "Valle Nuevo"],
  },
  {
    id: "ecoturismo",
    name: "Ecoturismo",
    icon: TreePine,
    description: "Parques nacionales y reservas",
    color: "text-green-500",
    gradient: "from-green-500/20 to-lime-500/20",
    destinations: ["Los Haitises", "Jaragua", "Sierra de Bahoruco"],
  },
  {
    id: "rios",
    name: "Ríos y Cascadas",
    icon: Droplets,
    description: "Aguas dulces y aventura extrema",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-indigo-500/20",
    destinations: ["27 Charcos", "Salto del Limón", "Río Chavón"],
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: Sun,
    description: "Spas, retiros y bienestar",
    color: "text-amber-500",
    gradient: "from-amber-500/20 to-orange-500/20",
    destinations: ["Casa de Campo", "Punta Cana Spas", "Samaná"],
  },
  {
    id: "cultural",
    name: "Cultural",
    icon: Building,
    description: "Historia, arte y patrimonio",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
    destinations: ["Zona Colonial", "Santiago", "La Vega"],
  },
  {
    id: "lujo",
    name: "Lujo",
    icon: Sparkles,
    description: "Experiencias exclusivas",
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-amber-500/20",
    destinations: ["Cap Cana", "Casa de Campo", "Puntacana Resort"],
  },
  {
    id: "vida-nocturna",
    name: "Vida Nocturna",
    icon: Music,
    description: "Clubs, bares y entretenimiento",
    color: "text-pink-500",
    gradient: "from-pink-500/20 to-rose-500/20",
    destinations: ["Santo Domingo", "Punta Cana", "Sosúa"],
  },
];

export function DestinationsByCategory() {
  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Destinos por <span className="text-gradient">Categoría</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra el tipo de experiencia que buscas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/destinos/categoria/${category.id}`}
                className="group block p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} mb-4`}>
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                </div>
                
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {category.destinations.slice(0, 3).map((dest, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {dest}
                    </span>
                  ))}
                  {category.destinations.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{category.destinations.length - 3}
                    </span>
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
