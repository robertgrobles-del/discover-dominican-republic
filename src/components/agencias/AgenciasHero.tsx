import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AgenciasHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function AgenciasHero({ searchQuery, onSearchChange }: AgenciasHeroProps) {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=1920&h=600&fit=crop"
          alt="Turismo RD"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full mb-4 shadow-sm">
            <Check className="h-3 w-3" />
            Verificado por Descubre República Dominicana
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Conectando Profesionales
          </h1>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
            Del Turismo Dominicano
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Accede al directorio oficial de operadores verificados, catálogos de excursiones
            exclusivas y recursos de marketing para agencias globales.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-xl mx-auto bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar agencia por nombre, RNT o región..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-transparent border-0 focus-visible:ring-0"
              />
            </div>
            <Button>Buscar</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
