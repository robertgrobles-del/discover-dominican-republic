import { motion } from "framer-motion";
import { Plane, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VuelosHeroProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export function VuelosHero({ search, onSearchChange }: VuelosHeroProps) {
  return (
    <section className="relative py-20 bg-gradient-to-b from-primary/15 via-background to-background">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Plane className="w-3.5 h-3.5" />
            Guía Oficial de Conectividad Aérea RD 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Aerolíneas y Rutas Directas a <span className="text-primary">República Dominicana</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            Planifica tu llegada conociendo las rutas sin escalas, aerolíneas bandera, tiempos estimados de vuelo y aeropuertos internacionales de destino.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto flex items-center gap-2 bg-card p-2 rounded-2xl border border-border shadow-lg">
            <Search className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
            <Input
              type="text"
              placeholder="Buscar por aerolínea o ciudad de origen (ej: Miami, Madrid, Toronto)..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-none focus-visible:ring-0 shadow-none text-sm"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
