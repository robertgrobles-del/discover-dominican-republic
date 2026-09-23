import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Compass, MapPin, Sparkles, Search, SlidersHorizontal, 
  Palmtree, Mountain, Utensils, Landmark, Waves, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const quickPills = [
  { label: "Punta Cana y Bávaro", path: "/destinos/punta-cana" },
  { label: "Santuario de Samaná", path: "/destinos/samana" },
  { label: "Ciudad Colonial", path: "/patrimonio" },
  { label: "Jarabacoa y Constanza", path: "/montanas" },
  { label: "Cabarete y Costa Norte", path: "/actividades" },
  { label: "Ruta Gastronómica Criolla", path: "/guia-gastronomica" },
  { label: "Bahía de las Águilas", path: "/playas" },
];

const regions = [
  { id: "todos", name: "Todas las regiones" },
  { id: "este", name: "Región Este (Punta Cana, La Romana, Bayahíbe)" },
  { id: "norte", name: "Costa Norte (Puerto Plata, Samaná, Cabarete)" },
  { id: "sur", name: "Sur Profundo (Barahona, Pedernales, Baní)" },
  { id: "santo-domingo", name: "Santo Domingo (Distrito Nacional)" },
  { id: "central", name: "Cordillera Central (Jarabacoa, Constanza)" },
];

const experienceTypes = [
  { id: "playas", name: "Playas y Costas", icon: Waves, path: "/playas" },
  { id: "aventura", name: "Ecoturismo y Montaña", icon: Mountain, path: "/ecoturismo" },
  { id: "cultura", name: "Historia, Museos y Patrimonio", icon: Landmark, path: "/cultura" },
  { id: "gastronomia", name: "Gastronomía y Sabores Dominicanos", icon: Utensils, path: "/guia-gastronomica" },
  { id: "relax", name: "Resorts, Hoteles y Bienestar", icon: Palmtree, path: "/wellness" },
];

export function QuickDestinationFinder() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("todos");
  const [selectedExperience, setSelectedExperience] = useState("playas");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinos?q=${encodeURIComponent(searchQuery.trim())}`);
      return;
    }

    const exp = experienceTypes.find((item) => item.id === selectedExperience);
    if (exp) {
      if (selectedRegion !== "todos") {
        navigate(`${exp.path}?region=${selectedRegion}`);
      } else {
        navigate(exp.path);
      }
    } else {
      navigate("/destinos");
    }
  };

  return (
    <section className="relative z-20 -mt-10 mb-12 container mx-auto px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl bg-card/90 backdrop-blur-xl border border-primary/20 p-6 lg:p-8 shadow-2xl shadow-primary/5"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                Buscador de Destinos
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Filtra por región geográfica o tipo de experiencia
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-foreground">
              Encuentra tu próximo destino en República Dominicana
            </h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/itinerario-ia")}
            aria-label="Ir al planificador de Itinerario con Inteligencia Artificial"
            className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-2 text-xs font-semibold"
          >
            <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Planificador de Itinerarios
          </Button>
        </div>

        {/* Search & Filter Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4 items-center">
          {/* Destination Search / Region */}
          <div className="md:col-span-4 relative">
            <label htmlFor="quick-region-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Región o Provincia
            </label>
            <div className="relative">
              <select
                id="quick-region-select"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                aria-label="Selecciona una región de República Dominicana"
                className="w-full h-12 bg-background/80 border border-border/80 focus:border-primary rounded-xl px-3.5 pr-8 text-sm text-foreground appearance-none outline-none transition-all cursor-pointer hover:border-primary/40"
              >
                {regions.map((reg) => (
                  <option key={reg.id} value={reg.id} className="bg-card text-foreground">
                    {reg.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs" aria-hidden="true">
                ▼
              </div>
            </div>
          </div>

          {/* Experience Category */}
          <div className="md:col-span-4 relative">
            <label htmlFor="quick-experience-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Categoría de Experiencia
            </label>
            <div className="relative">
              <select
                id="quick-experience-select"
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                aria-label="Selecciona la categoría de experiencia"
                className="w-full h-12 bg-background/80 border border-border/80 focus:border-primary rounded-xl px-3.5 pr-8 text-sm text-foreground appearance-none outline-none transition-all cursor-pointer hover:border-primary/40"
              >
                {experienceTypes.map((item) => (
                  <option key={item.id} value={item.id} className="bg-card text-foreground">
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs" aria-hidden="true">
                ▼
              </div>
            </div>
          </div>

          {/* Quick Keyword / Action */}
          <div className="md:col-span-4 relative">
            <label htmlFor="quick-search-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Búsqueda por palabra clave
            </label>
            <div className="flex gap-2">
              <input
                id="quick-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Campo de búsqueda libre de destinos y actividades"
                placeholder="Ej. Cayo Arena, Las Terrenas, Buceo..."
                className="w-full h-12 bg-background/80 border border-border/80 focus:border-primary rounded-xl px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
              />
              <Button type="submit" aria-label="Buscar destinos" className="h-12 px-6 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20 shrink-0">
                <span>Buscar</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </form>

        {/* Popular shortcut tags */}
        <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
            Destinos populares:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => navigate(pill.path)}
              aria-label={`Explorar ${pill.label}`}
              className="text-xs py-1 px-3 rounded-full bg-secondary/50 hover:bg-primary/20 hover:text-primary border border-border/50 transition-all font-medium text-foreground"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
