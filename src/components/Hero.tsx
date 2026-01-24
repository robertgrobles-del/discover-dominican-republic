import { motion } from "framer-motion";
import { Play, ChevronRight, Sun, Ruler, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/whale-samana.jpg";

const stats = [
  { icon: Sun, value: "300+", label: "Días de sol" },
  { icon: Ruler, value: "1,600 km", label: "De costas" },
  { icon: Landmark, value: "29", label: "Parques nacionales" },
  { icon: Users, value: "10M+", label: "Visitantes" },
];

export function Hero() {
  return (
    <section className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear" }}
          className="h-full w-full"
        >
          <img
            src={heroImage}
            alt="Ballena jorobada en Bahía de Samaná"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 lg:px-8 pt-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <span className="w-8 h-px bg-primary" />
              El paraíso del Caribe
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="text-foreground">Samaná</span>
            <br />
            <span className="text-gradient">El Santuario de la Naturaleza</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-8 max-w-lg"
          >
            Donde las montañas besan el mar y las ballenas jorobadas danzan cada invierno. Descubre un paraíso ecológico sin igual.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button size="lg" className="gap-2 font-display">
              Explorar Destinos
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 font-display">
              <Play className="h-4 w-4" />
              Ver Video
            </Button>
          </motion.div>
        </div>

        {/* Destination Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4"
        >
          {["Samaná", "Punta Cana", "Sto. Domingo"].map((dest, i) => (
            <button
              key={dest}
              className={`text-right text-sm transition-all ${
                i === 0 ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dest}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 py-8"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
