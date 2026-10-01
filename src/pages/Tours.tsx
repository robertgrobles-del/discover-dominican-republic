import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, Users, MapPin, Star, ChevronRight, Filter, Compass, 
  Mountain, Heart, Sparkles, ShieldCheck, CheckCircle2, Calendar, PhoneCall, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BetweenSectionsAd } from "@/components/promo";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { useTranslation } from "@/hooks/useI18n";
import heroBeach from "@/assets/hero-beach.jpg";
import { toast } from "sonner";

const categoryConfig: Record<string, { label: string; icon: typeof Compass; color: string }> = {
  adventure: { label: "Aventura Extrema", icon: Mountain, color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  cultural: { label: "Patrimonio & Cultura", icon: Compass, color: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  wellness: { label: "Bienestar & Relax", icon: Heart, color: "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30" },
  nature: { label: "Ecoturismo & Mar", icon: Sparkles, color: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" },
  gastronomic: { label: "Circuitos del Sabor", icon: Sparkles, color: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30" },
};

const difficultyColors: Record<string, string> = {
  'fácil': 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  'moderado': 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  'difícil': 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
};

// Paquetes curados enriquecidos para garantizar contenido de alta calidad y conversión
const CURATED_FALLBACK_PACKAGES = [
  {
    id: "expedicion-bahia-aguilas-glamping",
    slug: "expedicion-bahia-aguilas",
    name: "Expedición Safari Bahía de las Águilas & Glamping",
    category: "nature",
    difficulty: "moderado",
    duration: "3 Días / 2 Noches",
    max_group_size: 12,
    rating: 4.95,
    price_from: 295,
    price_currency: "USD",
    short_description: "Travesía completa al Sur Profundo: lancha rápida hacia Bahía de las Águilas, noche bajo las estrellas en glamping ecológico, Laguna de Oviedo y pozos de Romeo.",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    is_featured: true,
    is_sponsored: true,
    highlights: ["Transporte 4x4 todo incluido", "Noche en carpas safari frente al mar", "Comida típica sureña y chivo liniero", "Guía biólogo certificado"]
  },
  {
    id: "cumbre-pico-duarte-express",
    slug: "cumbre-pico-duarte",
    name: "Conquista del Pico Duarte (El Techo del Caribe - 3,087m)",
    category: "adventure",
    difficulty: "difícil",
    duration: "4 Días / 3 Noches",
    max_group_size: 10,
    rating: 4.98,
    price_from: 340,
    price_currency: "USD",
    short_description: "Asciende la montaña más alta de las Antillas partiendo desde Jarabacoa / Manabao con mulas de apoyo, refugios de montaña y guías de rescate certificados.",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    is_featured: true,
    is_sponsored: false,
    highlights: ["Mulas de carga y arrieros locales", "Fogatas nocturnas en La Compartición", "Permisos del Parque Nacional Armando Bermúdez", "Alimentación energética completa"]
  },
  {
    id: "samana-ballenas-salto-limon",
    slug: "samana-ballenas-salto-limon",
    name: "Samaná Total: Ballenas Jorobadas, Cayo Levantado y Salto El Limón",
    category: "nature",
    difficulty: "fácil",
    duration: "Día Completo (10h)",
    max_group_size: 15,
    rating: 4.9,
    price_from: 110,
    price_currency: "USD",
    short_description: "La excursión ecológica #1 de la isla: avistamiento de cetáceos en catamarán, cabalgata o senderismo por selva hasta la cascada de 50 metros y almuerzo frente al mar.",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    is_sponsored: true,
    highlights: ["Catamarán con biólogo marino a bordo", "Almuerzo buffet campestre dominicano", "Acceso exclusivo a Cayo Levantado (Isla Bacardí)", "Seguro médico de accidentes incluido"]
  },
  {
    id: "circuito-colonial-alta-cocina",
    slug: "circuito-colonial-alta-cocina",
    name: "Santo Domingo Histórico & Ruta Culinaria Colonial",
    category: "cultural",
    difficulty: "fácil",
    duration: "6 Horas",
    max_group_size: 8,
    rating: 4.88,
    price_from: 75,
    price_currency: "USD",
    short_description: "Recorrido a pie por la Ciudad Primada de América guiado por historiadores, cata privada de rones en bodega colonial del siglo XVI y cena de 4 tiempos.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    is_sponsored: false,
    highlights: ["Entradas VIP sin filas al Alcázar y Casas Reales", "Cata dirigida de 3 rones premium", "Cena gourmet de autor dominicano", "Grupos reducidos para máxima atención"]
  }
];

export default function Tours() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedTourName, setSelectedTourName] = useState("");

  const { data: dbPackages, isLoading } = useQuery({
    queryKey: ['tour-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .eq('is_active', true)
        .order('is_sponsored', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  const allPackages = useMemo(() => {
    const list = [...(dbPackages || [])];
    const existingSlugs = new Set(list.map(p => p.slug || p.id));
    
    CURATED_FALLBACK_PACKAGES.forEach(fallback => {
      if (!existingSlugs.has(fallback.slug)) {
        list.push(fallback as any);
      }
    });

    return list;
  }, [dbPackages]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return allPackages;
    return allPackages.filter(p => p.category === activeCategory);
  }, [allPackages, activeCategory]);

  const handleQuickLead = (tourTitle: string) => {
    setSelectedTourName(tourTitle);
    setLeadModalOpen(true);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Tours y Paquetes Turísticos en República Dominicana | Descubre RD"
        description="Encuentra las mejores excursiones y paquetes organizados: Bahía de las Águilas, Ascenso al Pico Duarte, Avistamiento de Ballenas en Samaná y Ciudad Colonial."
        keywords="tours republica dominicana, paquetes excursiones rd, bahia de las aguilas tour, pico duarte excursion, tours samana ballenas"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white">
        <Header />

        {/* HERO EDITORIAL DE TOURS */}
        <section className="relative h-[60vh] min-h-[480px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroBeach} alt="Tours y Paquetes Turísticos en República Dominicana" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/40" />
          </div>
          <div className="relative container mx-auto px-4 pb-16 max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-4 py-1.5 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                🗺️ OPERADORES CERTIFICADOS MITUR
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight">
                Tours & <span className="text-gradient">Expediciones</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl font-light leading-relaxed">
                Circuitos organizados con guías expertos, seguro médico, transporte oficial y logística impecable en los 4 puntos cardinales de la isla.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FILTROS INTERACTIVOS */}
        <section className="sticky top-16 bg-background/95 backdrop-blur-md border-b border-border z-30 py-3">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Todos los Paquetes ({allPackages.length})
              </button>
              {Object.entries(categoryConfig).map(([key, { label, icon: Icon }]) => {
                const count = allPackages.filter(p => p.category === key).length;
                const isSelected = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* LISTADO DE TOURS CON BENTO CARDS */}
        <main className="container mx-auto px-4 py-12 max-w-6xl flex-1 space-y-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[420px] rounded-3xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border max-w-md mx-auto">
              <Compass className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No hay tours en esta categoría</h2>
              <p className="text-muted-foreground text-sm mb-6">Prueba seleccionando otra categoría o contacta a un asesor.</p>
              <Button onClick={() => setActiveCategory("all")}>Ver todos los tours</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filtered.map((pkg, i) => {
                const cat = categoryConfig[pkg.category || 'adventure'] || categoryConfig.adventure;
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.08, 0.4) }}
                    className="surface-commercial rounded-card border border-border overflow-hidden shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* IMAGEN Y BADGES */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={pkg.image_url || heroBeach}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <Badge className={`${cat.color} backdrop-blur-md bg-black/40 text-xs`}>
                            <CatIcon className="h-3 w-3 mr-1" /> {cat.label}
                          </Badge>
                          {pkg.difficulty && (
                            <Badge className={`${difficultyColors[pkg.difficulty] || 'bg-muted text-muted-foreground'} text-xs uppercase font-bold tracking-wider`}>
                              {pkg.difficulty}
                            </Badge>
                          )}
                        </div>

                        {pkg.is_sponsored && (
                          <SponsoredBadge label="Patrocinado oficial" className="absolute top-4 right-4 text-xs" />
                        )}

                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                          {pkg.duration && (
                            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
                              <Clock className="h-3.5 w-3.5 text-primary" /> {pkg.duration}
                            </span>
                          )}
                          {pkg.rating && (
                            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md font-bold">
                              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {pkg.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CONTENIDO Y HIGHLIGHTS */}
                      <div className="p-6 sm:p-8">
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                          {pkg.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                          {pkg.short_description}
                        </p>

                        {/* QUÉ INCLUYE (HIGHLIGHTS) */}
                        {pkg.highlights && (
                          <div className="space-y-2 mb-6 bg-muted/30 p-4 rounded-2xl border border-border/60">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Servicios destacados:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {pkg.highlights.map((h: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground font-medium">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{h}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PRECIO Y ACCIONES DE RESERVA / LEAD */}
                    <div className="p-6 sm:p-8 pt-0 border-t border-border/50 mt-auto bg-card">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                        <div>
                          <span className="text-xs text-muted-foreground block">Precio por persona desde</span>
                          <p className="text-3xl font-black text-foreground">
                            ${pkg.price_from}{" "}
                            <span className="text-xs font-normal text-muted-foreground">{pkg.price_currency || "USD"}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleQuickLead(pkg.name)}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold py-5 px-6 rounded-xl shadow-lg shadow-primary/20 gap-2 flex-1 sm:flex-initial"
                          >
                            <Calendar className="h-4 w-4" /> Solicitar Disponibilidad
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* BANNER DE ASESORÍA PERSONALIZADA */}
          <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-card rounded-3xl p-8 sm:p-12 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                PLANES PRIVADOS Y A MEDIDA
              </Badge>
              <h3 className="font-display text-2xl sm:text-3xl font-bold">
                ¿Viajas en grupo familiar o corporativo?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Diseñamos expediciones privadas exclusivas con chofer particular, chef de campo y guías certificados por el Ministerio de Turismo.
              </p>
            </div>
            <Button
              onClick={() => handleQuickLead("Tour Privado a Medida")}
              size="lg"
              className="bg-primary text-white font-semibold px-8 py-6 rounded-xl shadow-xl shadow-primary/25 shrink-0"
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Hablar con un Especialista
            </Button>
          </div>

        </main>

        <BetweenSectionsAd position="tours-footer" />

        {/* MODAL / FORMULARIO RÁPIDO DE LEAD Y CONVERSIÓN */}
        {leadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl space-y-6"
            >
              <div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  CONFIRMACIÓN INMEDIATA
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Solicitar Plaza
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTourName}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLeadModalOpen(false);
                  toast.success("¡Solicitud recibida! Un asesor turístico se comunicará contigo vía WhatsApp.");
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Nombre Completo</label>
                  <input
                    required
                    placeholder="Ej. Carlos Rodríguez"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">WhatsApp / Teléfono</label>
                  <input
                    required
                    type="tel"
                    placeholder="+1 (809) 000-0000"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Fecha Deseada</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Viajeros</label>
                    <select className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>2 Personas</option>
                      <option>1 Persona</option>
                      <option>4 Personas</option>
                      <option>6+ Personas</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full py-5 rounded-xl bg-primary text-white font-semibold">
                  Confirmar y Recibir Itinerario
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setLeadModalOpen(false)}
                  className="w-full text-xs text-muted-foreground"
                >
                  Cancelar
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
