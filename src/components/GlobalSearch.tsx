import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, MapPin, Building2, Utensils, Calendar, Compass, 
  FileText, Sparkles, Clock, TrendingUp, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResultsAd } from "@/components/ads";
import { supabase } from "@/integrations/supabase/client";

import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import samana from "@/assets/samana.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

// Search data
const searchData = {
  destinos: [
    { id: "punta-cana", nombre: "Punta Cana", desc: "Playas paradisíacas", image: puntaCana, href: "/destino/punta-cana" },
    { id: "santo-domingo", nombre: "Santo Domingo", desc: "La Cuna de América", image: santoDomingo, href: "/destino/santo-domingo" },
    { id: "samana", nombre: "Samaná", desc: "Ballenas y naturaleza", image: samana, href: "/destino/samana" },
    { id: "puerto-plata", nombre: "Puerto Plata", desc: "Costa del Ámbar", image: puertoPlata, href: "/destino/puerto-plata" },
    { id: "la-romana", nombre: "La Romana", desc: "Golf y lujo", href: "/destino/la-romana" },
    { id: "barahona", nombre: "Barahona", desc: "Naturaleza virgen", href: "/destino/barahona" },
  ],
  hoteles: [
    { id: "eden-roc", nombre: "Eden Roc Cap Cana", desc: "Resort 5 estrellas en Punta Cana", href: "/alojamiento/eden-roc" },
    { id: "billini", nombre: "Billini Hotel", desc: "Boutique en Zona Colonial", href: "/alojamiento/billini" },
    { id: "casa-colonial", nombre: "Casa Colonial Beach & Spa", desc: "Lujo en Puerto Plata", href: "/alojamiento/casa-colonial" },
    { id: "paradisus", nombre: "Paradisus Palma Real", desc: "All-inclusive en Bávaro", href: "/alojamiento/paradisus" },
    { id: "secrets", nombre: "Secrets Royal Beach", desc: "Solo adultos en Punta Cana", href: "/alojamiento/secrets" },
  ],
  restaurantes: [
    { id: "la-yola", nombre: "La Yola", desc: "Mariscos en Punta Cana", href: "/restaurante/la-yola" },
    { id: "pat-e-palo", nombre: "Pat'e Palo", desc: "Cocina europea en Zona Colonial", href: "/restaurante/pat-e-palo" },
    { id: "mesón-de-bari", nombre: "Mesón de Barí", desc: "Comida criolla tradicional", href: "/restaurante/meson-de-bari" },
    { id: "pepperoni", nombre: "Pepperoni Grill", desc: "Carnes y pastas", href: "/restaurante/pepperoni" },
  ],
  experiencias: [
    { id: "ecoturismo", nombre: "Ecoturismo", desc: "Naturaleza y aventura", href: "/experiencia/ecoturismo" },
    { id: "aventura", nombre: "Aventura", desc: "Adrenalina pura", href: "/experiencia/aventura" },
    { id: "golf", nombre: "Golf", desc: "Campos de clase mundial", href: "/experiencia/golf" },
    { id: "romance", nombre: "Romance", desc: "Escapadas en pareja", href: "/experiencia/romance" },
    { id: "gastronomia", nombre: "Gastronomía", desc: "Sabores dominicanos", href: "/experiencia/gastronomia" },
    { id: "bienestar", nombre: "Bienestar", desc: "Spa y wellness", href: "/experiencia/bienestar" },
    { id: "lujo", nombre: "Luxury", desc: "Experiencias exclusivas", href: "/experiencia/lujo" },
  ],
  eventos: [
    { id: "jazz-festival", nombre: "Festival de Jazz", desc: "Cabarete - Octubre", href: "/eventos#jazz" },
    { id: "merengue-fest", nombre: "Festival de Merengue", desc: "Santo Domingo - Julio", href: "/eventos#merengue" },
    { id: "carnaval", nombre: "Carnaval Dominicano", desc: "Febrero - Todo el país", href: "/eventos#carnaval" },
    { id: "whale-season", nombre: "Temporada de Ballenas", desc: "Samaná - Enero a Marzo", href: "/eventos#ballenas" },
  ],
  paginas: [
    { id: "wellness", nombre: "Wellness & Spa", desc: "Retiros de bienestar", href: "/wellness", icon: Sparkles },
    { id: "bodas", nombre: "Bodas Destino", desc: "Cásate en el Caribe", href: "/bodas", icon: Sparkles },
    { id: "cruceros", nombre: "Cruceros", desc: "Guía para cruceristas", href: "/cruceros", icon: Sparkles },
    { id: "mice", nombre: "MICE & Eventos", desc: "Turismo de negocios", href: "/mice", icon: Building2 },
    { id: "inversion", nombre: "Inversión Turística", desc: "Oportunidades de negocio", href: "/inversion", icon: TrendingUp },
    { id: "patrimonio", nombre: "Patrimonio Cultural", desc: "Historia y monumentos", href: "/patrimonio", icon: Building2 },
    { id: "playas", nombre: "Guía de Playas", desc: "Las mejores playas", href: "/playas", icon: MapPin },
    { id: "vida-nocturna", nombre: "Vida Nocturna", desc: "Bares y discotecas", href: "/vida-nocturna", icon: Sparkles },
    { id: "gastronomia", nombre: "Guía Gastronómica", desc: "Restaurantes y chefs", href: "/guia-gastronomica", icon: Utensils },
  ],
  blog: [
    { id: "articulo-1", nombre: "10 Playas Secretas en RD", desc: "Descubre paraísos escondidos", href: "/articulo/playas-secretas" },
    { id: "articulo-2", nombre: "Guía del Viajero 2024", desc: "Todo lo que necesitas saber", href: "/articulo/guia-viajero" },
    { id: "articulo-3", nombre: "Gastronomía Dominicana", desc: "Platos típicos imperdibles", href: "/articulo/gastronomia" },
  ],
};

const trendingSearches = [
  "Punta Cana",
  "Playas",
  "Todo incluido",
  "Ballenas Samaná",
  "Zona Colonial",
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search local + DB when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const q = debouncedQuery.toLowerCase();
    setIsSearching(true);

    // Local static results
    const localResults = [
      ...searchData.destinos.filter(d => d.nombre.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)).map(d => ({ ...d, category: "Destinos", icon: MapPin })),
      ...searchData.hoteles.filter(h => h.nombre.toLowerCase().includes(q) || h.desc.toLowerCase().includes(q)).map(h => ({ ...h, category: "Hoteles", icon: Building2 })),
      ...searchData.restaurantes.filter(r => r.nombre.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)).map(r => ({ ...r, category: "Restaurantes", icon: Utensils })),
      ...searchData.experiencias.filter(e => e.nombre.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q)).map(e => ({ ...e, category: "Experiencias", icon: Compass })),
      ...searchData.eventos.filter(ev => ev.nombre.toLowerCase().includes(q) || ev.desc.toLowerCase().includes(q)).map(ev => ({ ...ev, category: "Eventos", icon: Calendar })),
      ...searchData.paginas.filter(p => p.nombre.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)).map(p => ({ ...p, category: "Páginas", icon: p.icon || FileText })),
      ...searchData.blog.filter(b => b.nombre.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q)).map(b => ({ ...b, category: "Blog", icon: FileText })),
    ];

    // Also search Supabase for DB results
    const searchDb = async () => {
      try {
        const [destRes, hotelRes, beachRes] = await Promise.all([
          supabase.from("destinations").select("id, name, slug, image_url").ilike("name", `%${debouncedQuery}%`).limit(5),
          supabase.from("hotels").select("id, name, slug, image_url").ilike("name", `%${debouncedQuery}%`).eq("is_active", true).limit(5),
          supabase.from("beaches").select("id, name, slug, image_url").ilike("name", `%${debouncedQuery}%`).eq("is_active", true).limit(5),
        ]);

        const dbResults: any[] = [];
        destRes.data?.forEach(d => {
          if (!localResults.some(lr => lr.nombre === d.name)) {
            dbResults.push({ id: d.id, nombre: d.name, desc: "Destino", image: d.image_url, href: `/destino/${d.slug || d.id}`, category: "Destinos", icon: MapPin });
          }
        });
        hotelRes.data?.forEach(h => {
          if (!localResults.some(lr => lr.nombre === h.name)) {
            dbResults.push({ id: h.id, nombre: h.name, desc: "Hotel", image: h.image_url, href: `/alojamiento/${h.slug || h.id}`, category: "Hoteles", icon: Building2 });
          }
        });
        beachRes.data?.forEach(b => {
          if (!localResults.some(lr => lr.nombre === b.name)) {
            dbResults.push({ id: b.id, nombre: b.name, desc: "Playa", image: b.image_url, href: `/playa/${b.slug || b.id}`, category: "Playas", icon: Compass });
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
  }, [debouncedQuery]);

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

  const handleTrendingClick = (term: string) => {
    setQuery(term);
  };

  // Group results by category
  const groupedResults = results.reduce((acc: Record<string, any[]>, result: any) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar destinos, hoteles, experiencias..."
                  className="border-0 focus-visible:ring-0 text-lg bg-transparent"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.length < 2 ? (
                  /* Trending Searches */
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Búsquedas populares</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTrendingClick(term)}
                          className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Acceso rápido</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {searchData.destinos.slice(0, 4).map((destino) => (
                          <button
                            key={destino.id}
                            onClick={() => handleSelect(destino.href)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                          >
                            {destino.image && (
                              <img 
                                src={destino.image} 
                                alt={destino.nombre}
                                className="w-12 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">{destino.nombre}</p>
                              <p className="text-xs text-muted-foreground">{destino.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  /* Search Results */
                  <div className="p-2">
                    {/* Ad en resultados de búsqueda */}
                    {results.length >= 3 && (
                      <SearchResultsAd showDemo className="mb-4" />
                    )}
                    
                    {Object.entries(groupedResults).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <div className="px-2 py-1">
                          <Badge variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        </div>
                        {items.slice(0, 3).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item.href)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{item.nombre}</p>
                              <p className="text-sm text-muted-foreground truncate">{item.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No Results */
                  <div className="p-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No se encontraron resultados para "{query}"
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">ESC</kbd> para cerrar</span>
                  <span>{isSearching ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}{results.length} resultados</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
