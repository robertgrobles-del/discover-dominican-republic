import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, MapPin, Building2, Utensils, Calendar, Compass, 
  FileText, Sparkles, Clock, TrendingUp, Loader2, SlidersHorizontal,
  Waves, Mountain, Landmark, Palmtree, ArrowRight, Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResultsAd } from "@/components/promo";
import { supabase } from "@/integrations/supabase/client";

import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import samana from "@/assets/samana.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

// Curated regions of Dominican Republic
const regions = [
  { id: "todos", name: "Todas las regiones" },
  { id: "este", name: "Región Este (Punta Cana, La Romana, Bayahíbe)" },
  { id: "norte", name: "Costa Norte (Puerto Plata, Samaná, Cabarete)" },
  { id: "sur", name: "Sur Profundo (Barahona, Pedernales, Baní)" },
  { id: "santo-domingo", name: "Santo Domingo (Distrito Nacional)" },
  { id: "central", name: "Cordillera Central (Jarabacoa, Constanza)" },
];

const experienceCategories = [
  { id: "todos", name: "Todas", icon: Compass },
  { id: "playas", name: "Playas y Costas", icon: Waves, path: "/playas" },
  { id: "aventura", name: "Ecoturismo y Montaña", icon: Mountain, path: "/ecoturismo" },
  { id: "cultura", name: "Patrimonio e Historia", icon: Landmark, path: "/cultura" },
  { id: "gastronomia", name: "Gastronomía", icon: Utensils, path: "/guia-gastronomica" },
  { id: "hoteles", name: "Alojamientos", icon: Building2, path: "/alojamientos" },
];

const quickDestinationPills = [
  { label: "Punta Cana y Bávaro", href: "/destino/punta-cana" },
  { label: "Santuario de Samaná", href: "/destino/samana" },
  { label: "Ciudad Colonial", href: "/patrimonio" },
  { label: "Jarabacoa y Constanza", href: "/montanas" },
  { label: "Cabarete y Costa Norte", href: "/destino/puerto-plata" },
  { label: "Bahía de las Águilas", href: "/playas" },
  { label: "Ruta Gastronómica", href: "/guia-gastronomica" },
];

// Local Search Data
const searchData = {
  destinos: [
    { id: "punta-cana", nombre: "Punta Cana", desc: "Playas de arena blanca y resorts de clase mundial", image: puntaCana, href: "/destino/punta-cana", region: "este", type: "playas" },
    { id: "santo-domingo", nombre: "Santo Domingo", desc: "Ciudad Primada de América y centro financiero", image: santoDomingo, href: "/destino/santo-domingo", region: "santo-domingo", type: "cultura" },
    { id: "samana", nombre: "Samaná", desc: "Santuario de ballenas jorobadas y cascadas vírgenes", image: samana, href: "/destino/samana", region: "norte", type: "aventura" },
    { id: "puerto-plata", nombre: "Puerto Plata", desc: "Costa del Ámbar, teleférico y deportes de viento", image: puertoPlata, href: "/destino/puerto-plata", region: "norte", type: "aventura" },
    { id: "la-romana", nombre: "La Romana", desc: "Altos de Chavón, campos de golf PGA y lujo costero", href: "/destino/la-romana", region: "este", type: "playas" },
    { id: "barahona", nombre: "Barahona", desc: "Costa virgen del Caribe Sur y ríos de agua cristalina", href: "/destino/barahona", region: "sur", type: "aventura" },
  ],
  hoteles: [
    { id: "eden-roc", nombre: "Eden Roc Cap Cana", desc: "Resort 5 estrellas Relais & Châteaux", href: "/alojamiento/eden-roc", region: "este", type: "hoteles" },
    { id: "billini", nombre: "Billini Hotel", desc: "Boutique histórico en la Ciudad Colonial", href: "/alojamiento/billini", region: "santo-domingo", type: "hoteles" },
    { id: "casa-colonial", nombre: "Casa Colonial Beach & Spa", desc: "Lujo clásico en Playa Dorada", href: "/alojamiento/casa-colonial", region: "norte", type: "hoteles" },
    { id: "paradisus", nombre: "Paradisus Palma Real", desc: "All-inclusive premium frente al mar en Bávaro", href: "/alojamiento/paradisus", region: "este", type: "hoteles" },
  ],
  restaurantes: [
    { id: "la-yola", nombre: "La Yola", desc: "Mariscos frescos sobre la Marina de Cap Cana", href: "/restaurante/la-yola", region: "este", type: "gastronomia" },
    { id: "pat-e-palo", nombre: "Pat'e Palo", desc: "Primera taberna de América en la Plaza España", href: "/restaurante/pat-e-palo", region: "santo-domingo", type: "gastronomia" },
    { id: "mesón-de-bari", nombre: "Mesón de Barí", desc: "Auténtica comida criolla gourmet en Santo Domingo", href: "/restaurante/meson-de-bari", region: "santo-domingo", type: "gastronomia" },
    { id: "kaffe-jarabacoa", nombre: "Kaffe Café Jarabacoa", desc: "Café de altura cultivado en la Cordillera Central", href: "/restaurante/kaffe-cafe-jarabacoa", region: "central", type: "gastronomia" },
  ],
  experiencias: [
    { id: "ecoturismo", nombre: "Ecoturismo y Parques Nacionales", desc: "Los Haitises, Jarabacoa y senderos protegidos", href: "/experiencia/ecoturismo", region: "todos", type: "aventura" },
    { id: "aventura", nombre: "Aventura y Deportes Acuáticos", desc: "Kitesurf en Cabarete, kayak y rafting", href: "/experiencia/aventura", region: "norte", type: "aventura" },
    { id: "patrimonio", nombre: "Patrimonio Histórico y Monumentos", desc: "Alcázar de Colón, museos y fortalezas", href: "/patrimonio", region: "santo-domingo", type: "cultura" },
    { id: "gastronomia-rd", nombre: "Ruta del Cacao y Sabores Criollos", desc: "Experiencias culinarias y catas sensoriales", href: "/guia-gastronomica", region: "todos", type: "gastronomia" },
  ],
  eventos: [
    { id: "jazz-festival", nombre: "Festival de Jazz de la Costa Norte", desc: "Cabarete - Octubre", href: "/eventos#jazz", region: "norte", type: "cultura" },
    { id: "carnaval", nombre: "Carnaval Dominicano", desc: "La Vega y Santo Domingo - Febrero", href: "/eventos#carnaval", region: "todos", type: "cultura" },
    { id: "whale-season", nombre: "Temporada de Ballenas Jorobadas", desc: "Santuario Marino de Samaná - Enero a Marzo", href: "/eventos#ballenas", region: "norte", type: "aventura" },
  ],
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("todos");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute Search + Filter
  useEffect(() => {
    const q = debouncedQuery.toLowerCase().trim();
    const hasFilter = selectedRegion !== "todos" || selectedCategory !== "todos";

    if (q.length < 2 && !hasFilter) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const matchesRegion = (itemRegion?: string) => {
      if (selectedRegion === "todos") return true;
      return itemRegion === selectedRegion || itemRegion === "todos";
    };

    const matchesCategory = (itemCategory?: string) => {
      if (selectedCategory === "todos") return true;
      return itemCategory === selectedCategory;
    };

    const matchesQuery = (name: string, desc?: string) => {
      if (!q) return true;
      return name.toLowerCase().includes(q) || (desc && desc.toLowerCase().includes(q));
    };

    // Filter static database
    const localResults = [
      ...searchData.destinos
        .filter(d => matchesRegion(d.region) && matchesCategory(d.type) && matchesQuery(d.nombre, d.desc))
        .map(d => ({ ...d, category: "Destinos", icon: MapPin })),
      ...searchData.hoteles
        .filter(h => matchesRegion(h.region) && matchesCategory(h.type) && matchesQuery(h.nombre, h.desc))
        .map(h => ({ ...h, category: "Hoteles", icon: Building2 })),
      ...searchData.restaurantes
        .filter(r => matchesRegion(r.region) && matchesCategory(r.type) && matchesQuery(r.nombre, r.desc))
        .map(r => ({ ...r, category: "Restaurantes", icon: Utensils })),
      ...searchData.experiencias
        .filter(e => matchesRegion(e.region) && matchesCategory(e.type) && matchesQuery(e.nombre, e.desc))
        .map(e => ({ ...e, category: "Experiencias", icon: Compass })),
      ...searchData.eventos
        .filter(ev => matchesRegion(ev.region) && matchesCategory(ev.type) && matchesQuery(ev.nombre, ev.desc))
        .map(ev => ({ ...ev, category: "Eventos", icon: Calendar })),
    ];

    // Query Supabase live database if query present
    const searchDb = async () => {
      if (!q) {
        setResults(localResults);
        setIsSearching(false);
        return;
      }

      try {
        const [destRes, hotelRes, beachRes] = await Promise.all([
          supabase.from("destinations").select("id, name, slug, image_url").ilike("name", `%${q}%`).limit(5),
          supabase.from("hotels").select("id, name, slug, image_url").ilike("name", `%${q}%`).eq("is_active", true).limit(5),
          supabase.from("beaches").select("id, name, slug, image_url").ilike("name", `%${q}%`).eq("is_active", true).limit(5),
        ]);

        const dbResults: any[] = [];
        destRes.data?.forEach(d => {
          if (!localResults.some(lr => lr.nombre.toLowerCase() === d.name.toLowerCase())) {
            dbResults.push({ id: d.id, nombre: d.name, desc: "Destino turístico oficial", image: d.image_url, href: `/destino/${d.slug || d.id}`, category: "Destinos", icon: MapPin });
          }
        });
        hotelRes.data?.forEach(h => {
          if (!localResults.some(lr => lr.nombre.toLowerCase() === h.name.toLowerCase())) {
            dbResults.push({ id: h.id, nombre: h.name, desc: "Establecimiento de hospedaje", image: h.image_url, href: `/alojamiento/${h.slug || h.id}`, category: "Hoteles", icon: Building2 });
          }
        });
        beachRes.data?.forEach(b => {
          if (!localResults.some(lr => lr.nombre.toLowerCase() === b.name.toLowerCase())) {
            dbResults.push({ id: b.id, nombre: b.name, desc: "Playa de República Dominicana", image: b.image_url, href: `/playa/${b.slug || b.id}`, category: "Playas", icon: Waves });
          }
        });

        setResults([...localResults, ...dbResults]);
      } catch {
        setResults(localResults);
      } finally {
        setIsSearching(false);
      }
    };

    searchDb();
  }, [debouncedQuery, selectedRegion, selectedCategory]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
    setQuery("");
  };

  const handleDirectSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/destinos?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const resetFilters = () => {
    setSelectedRegion("todos");
    setSelectedCategory("todos");
    setQuery("");
  };

  // Group results by category
  const groupedResults = results.reduce((acc: Record<string, any[]>, result: any) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, any[]>);

  const hasActiveFilters = selectedRegion !== "todos" || selectedCategory !== "todos" || query.length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/85 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-4 top-16 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-50"
          >
            <div className="bg-card border border-border/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              
              {/* Header & Main Search Input */}
              <form onSubmit={handleDirectSearch} className="flex items-center gap-3 p-4 md:p-5 border-b border-border/80 bg-card">
                <Search className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="¿A dónde deseas ir en República Dominicana? (Destinos, hoteles, experiencias...)"
                  className="border-0 focus-visible:ring-0 text-base md:text-lg bg-transparent text-foreground placeholder:text-muted-foreground/70"
                  aria-label="Buscar en Descubre República Dominicana"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuery("")}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                    aria-label="Limpiar término de búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 rounded-full bg-secondary/60 hover:bg-secondary shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar ventana de búsqueda"
                >
                  <X className="h-5 w-5" />
                </Button>
              </form>

              {/* Advanced Filter Bar (Region & Experience Categories) */}
              <div className="px-4 py-3 bg-secondary/30 border-b border-border/60 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
                
                {/* Region Selector */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    aria-label="Filtrar por región geográfica"
                    className="w-full text-xs font-medium bg-card border border-border/80 rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer focus:border-primary"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] py-0.5">
                  {experienceCategories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(isActive && cat.id !== "todos" ? "todos" : cat.id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
                        }`}
                      >
                        <CatIcon className="h-3 w-3" aria-hidden="true" />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap self-end md:self-auto"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Modal Body Content */}
              <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-6">
                
                {!hasActiveFilters ? (
                  /* Initial State: Curated Recommendations & Shortcuts */
                  <div className="space-y-6">
                    {/* Destination Quick Pills */}
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3 text-xs uppercase tracking-wider font-semibold">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <span>Destinos destacados</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickDestinationPills.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleSelect(item.href)}
                            className="px-3.5 py-1.5 text-xs font-medium bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border/80 rounded-full transition-all text-foreground"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Access Top Destinations Cards */}
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3 text-xs uppercase tracking-wider font-semibold">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Polos turísticos principales</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchData.destinos.slice(0, 4).map((destino) => (
                          <button
                            key={destino.id}
                            type="button"
                            onClick={() => handleSelect(destino.href)}
                            className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/60 bg-card hover:bg-secondary/60 hover:border-primary/30 transition-all text-left group"
                          >
                            {destino.image && (
                              <img 
                                src={destino.image} 
                                alt={destino.nombre}
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {destino.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {destino.desc}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  /* Dynamic Results View */
                  <div className="space-y-5">
                    {/* Search Ad banner when multiple results */}
                    {results.length >= 3 && (
                      <SearchResultsAd showDemo className="mb-2" />
                    )}

                    {Object.entries(groupedResults).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <Badge variant="secondary" className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5">
                            {category} ({(items as any[]).length})
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(items as any[]).map((item: any) => {
                            const ItemIcon = item.icon || MapPin;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item.href)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card hover:bg-secondary/70 border border-border/70 hover:border-primary/40 transition-all text-left group shadow-2xs"
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.nombre}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border/40"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                                    <ItemIcon className="h-5 w-5" aria-hidden="true" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                    {item.nombre}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Zero Results */
                  <div className="py-12 text-center">
                    <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" aria-hidden="true" />
                    <p className="font-display font-semibold text-foreground text-base">
                      No encontramos coincidencias para los filtros seleccionados
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Intenta seleccionar "Todas las regiones" o prueba con una búsqueda más amplia.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-4 text-xs font-semibold"
                    >
                      Restablecer filtros
                    </Button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 border-t border-border/80 bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
                <span className="hidden sm:inline">
                  Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px]">ESC</kbd> para cerrar
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                  <span className="font-medium text-foreground">
                    {results.length > 0 ? `${results.length} resultados encontrados` : "Explorador Turístico"}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

