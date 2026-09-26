import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Landmark, MapPin, Clock, Star, Search, ChevronRight,
  Calendar, Eye, Ticket, Globe, ArrowRight
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const museums = [
  {
    id: "1",
    name: "Museo del Hombre Dominicano",
    image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=500&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&fit=crop&q=80",
    category: "Historia",
    categoryColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    location: "Santo Domingo",
    rating: 4.7,
    reviews: 856,
    price: 100,
    currency: "RD$",
    hours: "Mar-Dom 10:00–17:00",
    description: "El museo más importante del país dedicado a la antropología y arqueología dominicana. Alberga la mayor colección de objetos taínos del Caribe.",
    highlights: ["Colección Taína", "Historia Colonial", "Arte Precolombino"],
    featured: true,
  },
  {
    id: "2",
    name: "Museo de las Casas Reales",
    image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&h=500&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1490718687940-96b8d4e2db16?w=1400&fit=crop&q=80",
    category: "Historia",
    categoryColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    location: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 1234,
    price: 75,
    currency: "RD$",
    hours: "Mar-Dom 9:00–17:00",
    description: "Ubicado en el antiguo palacio de la Real Audiencia, muestra la historia colonial del primer asentamiento europeo en América.",
    highlights: ["Armaduras Españolas", "Arte Colonial", "Historia Virreinal"],
    featured: true,
  },
  {
    id: "3",
    name: "Museo Bellapart",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1601637408555-e8c5e6ed6aca?w=1400&fit=crop&q=80",
    category: "Arte",
    categoryColor: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25",
    location: "Piantini, Santo Domingo",
    rating: 4.6,
    reviews: 432,
    price: 0,
    currency: "RD$",
    hours: "Lun-Vie 9:00–18:00",
    description: "Importante colección privada de arte dominicano del siglo XIX y XX. Obras de Cándido Bidó, Jaime Colson y Celeste Woss y Gil.",
    highlights: ["Pintura Dominicana", "Esculturas", "Exposiciones Temporales"],
    featured: false,
  },
  {
    id: "4",
    name: "Museo del Ámbar",
    image: "https://images.unsplash.com/photo-1584799235813-aaf50775698c?w=800&h=500&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1532094349884-543559875b74?w=1400&fit=crop&q=80",
    category: "Ciencias",
    categoryColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    location: "Puerto Plata",
    rating: 4.5,
    reviews: 678,
    price: 250,
    currency: "RD$",
    hours: "Lun-Sáb 9:00–18:00",
    description: "Explora la fascinante historia del ámbar dominicano, considerado el más puro del mundo, con inclusiones prehistóricas de más de 30 millones de años.",
    highlights: ["Ámbar con Insectos", "Historia Geológica", "Tienda de Ámbar"],
    featured: true,
  },
  {
    id: "5",
    name: "Museo de Arte Moderno",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=500&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?w=1400&fit=crop&q=80",
    category: "Arte",
    categoryColor: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25",
    location: "Plaza de la Cultura, Santo Domingo",
    rating: 4.4,
    reviews: 321,
    price: 50,
    currency: "RD$",
    hours: "Mar-Dom 10:00–18:00",
    description: "Arte contemporáneo dominicano y latinoamericano en un espacio moderno dentro de la Plaza de la Cultura Juan Pablo Duarte.",
    highlights: ["Arte Contemporáneo", "Exposiciones Itinerantes", "Talleres"],
    featured: false,
  },
];

const monuments = [
  {
    id: 1,
    name: "Faro a Colón",
    location: "Santo Domingo Este",
    image: "https://images.unsplash.com/photo-1548574505-5e239809f769?w=800&h=600&fit=crop&q=80",
    description: "Monumento cruciforme dedicado a Cristóbal Colón que alberga los supuestos restos del almirante. Su faro proyecta una cruz de luz sobre el cielo de Santo Domingo.",
    year: 1992,
    architect: "Joseph Lea Gleave",
    type: "Monumento Nacional",
    accent: "from-amber-600 to-orange-700",
  },
  {
    id: 2,
    name: "Monumento a los Héroes de la Restauración",
    location: "Santiago de los Caballeros",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&q=80",
    description: "Obelisco de 67 metros de altura que domina el skyline de Santiago. Símbolo de la victoria dominicana sobre el imperialismo español en la Guerra de Restauración (1863–1865).",
    year: 1944,
    architect: "Henry Gazón Bona",
    type: "Patrimonio Cultural",
    accent: "from-blue-600 to-indigo-700",
  },
  {
    id: 3,
    name: "Altar de la Patria",
    location: "Parque de la Independencia, Santo Domingo",
    image: "https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=800&h=600&fit=crop&q=80",
    description: "Mausoleo neoclásico que custodia los restos de los Padres de la Patria: Juan Pablo Duarte, Francisco del Rosario Sánchez y Ramón Matías Mella.",
    year: 1976,
    architect: "Guillermo González Sánchez",
    type: "Monumento Histórico",
    accent: "from-emerald-600 to-teal-700",
  },
];

const categories = ["Todos", "Historia", "Arte", "Ciencias", "Arqueología"];

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { label: "Museos Registrados", value: "60+", icon: Landmark },
  { label: "Monumentos Nacionales", value: "18", icon: Globe },
  { label: "Sitios UNESCO", value: "3", icon: Star },
  { label: "Visitantes al Año", value: "500K+", icon: Eye },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MuseosMonumentos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeTab, setActiveTab] = useState<"museos" | "monumentos">("museos");

  const filteredMuseums = museums.filter((museum) => {
    const matchesSearch =
      museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      museum.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "Todos" || museum.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Museos y Monumentos de República Dominicana | Descubre RD"
        description="Explora los museos y monumentos históricos de RD: arte taíno, historia colonial, ámbar dominicano, obeliscos y los mausoleos de los Padres de la Patria."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <section className="relative h-[68vh] min-h-[480px] flex items-end overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop&q=80"
              alt="Museos y Monumentos de República Dominicana"
              className="absolute inset-0 w-full h-full object-cover scale-105"
              style={{ filter: "brightness(0.55)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className="relative container mx-auto px-4 lg:px-8 pb-12 md:pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  <Landmark className="h-3.5 w-3.5" />
                  Patrimonio Cultural
                </span>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-3">
                  Museos &amp;<br className="hidden md:block" /> Monumentos
                </h1>
                <p className="text-white/75 text-lg max-w-xl leading-relaxed">
                  Cinco siglos de historia taína, colonial y moderna al alcance de tu visita.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── STATS STRIP ──────────────────────────────────────────────── */}
          <section className="border-b border-border bg-card/60 backdrop-blur-sm">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3 py-5 px-4 md:px-6">
                    <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-2xl font-black text-foreground leading-none">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TAB SWITCHER ─────────────────────────────────────────────── */}
          <section className="py-12 container mx-auto px-4 lg:px-8">
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-2xl bg-secondary/60 border border-border p-1.5 gap-1">
                {(["museos", "monumentos"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                      activeTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "museos" ? "🏛️ Museos" : "🗿 Monumentos"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── MUSEOS ─────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {activeTab === "museos" && (
                <motion.div
                  key="museos"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar museo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card border-border"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                            activeCategory === cat
                              ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                              : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Museums Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredMuseums.map((museum, index) => (
                        <motion.article
                          key={museum.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ delay: index * 0.07 }}
                          className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                        >
                          {/* Image */}
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <img
                              src={museum.image}
                              alt={museum.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {museum.featured && (
                              <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                                ⭐ Destacado
                              </span>
                            )}
                            <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${museum.categoryColor}`}>
                              {museum.category}
                            </span>
                            {/* Price badge over image bottom (★ Mejora 108) */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                              {museum.price === 0 ? (
                                <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                                  Entrada Libre / Gratis
                                </span>
                              ) : (
                                <>
                                  <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                                    Nac: RD$ {museum.price} • Ext: $5 USD
                                  </span>
                                  <span className="bg-emerald-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    Domingos Gratis
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="font-display font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors mb-2">
                              {museum.name}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                {museum.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                {museum.rating} <span className="text-muted-foreground/60">({museum.reviews})</span>
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                              {museum.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {museum.highlights.slice(0, 3).map((h, i) => (
                                <span key={i} className="text-[10px] bg-secondary text-foreground/70 font-medium px-2 py-0.5 rounded-md border border-border/50">
                                  {h}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/60">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" /> {museum.hours}
                              </span>
                              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-primary hover:text-primary px-2">
                                Ver más <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredMuseums.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                      <Landmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No se encontraron museos con ese filtro.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── MONUMENTOS ──────────────────────────────────────────── */}
              {activeTab === "monumentos" && (
                <motion.div
                  key="monumentos"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {monuments.map((monument, index) => (
                    <motion.article
                      key={monument.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group grid md:grid-cols-[2fr_3fr] rounded-3xl overflow-hidden border border-border bg-card hover:shadow-xl hover:border-primary/25 transition-all duration-300"
                    >
                      {/* Photo */}
                      <div className="relative h-64 md:h-auto min-h-[260px] overflow-hidden">
                        <img
                          src={monument.image}
                          alt={monument.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${monument.accent} opacity-30`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 hidden md:block" />
                        {/* Year pill */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {monument.year}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 md:p-8 flex flex-col justify-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                          <Landmark className="h-3 w-3" />
                          {monument.type}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                          {monument.name}
                        </h3>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          {monument.location}
                        </p>
                        <p className="text-muted-foreground leading-relaxed text-sm mb-5">
                          {monument.description}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full border border-border">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            Inaugurado: {monument.year}
                          </span>
                          {monument.architect && (
                            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full border border-border">
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              {monument.architect}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── CTA STRIP ────────────────────────────────────────────────── */}
          <section className="py-16 bg-gradient-to-r from-primary/10 via-amber-500/8 to-primary/10 border-t border-border">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-black text-foreground mb-3">
                Planifica tu visita cultural
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm mb-6">
                Compra entradas, descarga guías de audio y personaliza tu recorrido histórico en la Ciudad Colonial más antigua del Nuevo Mundo.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/20">
                  <Link to="/audio-guias">
                    <Ticket className="h-4 w-4" />
                    Audio Guías Oficiales
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full gap-2">
                  <Link to="/patrimonio">
                    <Globe className="h-4 w-4" />
                    Patrimonio UNESCO
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
