import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users, MapPin, Star, ChevronRight, Filter, Compass, Mountain, Heart, Sparkles, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BetweenSectionsAd } from "@/components/ads";
import heroBeach from "@/assets/hero-beach.jpg";

const categoryConfig: Record<string, { label: string; icon: typeof Compass; color: string }> = {
  adventure: { label: "Aventura", icon: Mountain, color: "bg-emerald-500/20 text-emerald-400" },
  cultural: { label: "Cultural", icon: Compass, color: "bg-amber-500/20 text-amber-400" },
  wellness: { label: "Bienestar", icon: Heart, color: "bg-pink-500/20 text-pink-400" },
  nature: { label: "Naturaleza", icon: Sparkles, color: "bg-green-500/20 text-green-400" },
  gastronomic: { label: "Gastronómico", icon: Sparkles, color: "bg-orange-500/20 text-orange-400" },
};

const difficultyColors: Record<string, string> = {
  'fácil': 'bg-green-500/20 text-green-400',
  'moderado': 'bg-yellow-500/20 text-yellow-400',
  'difícil': 'bg-red-500/20 text-red-400',
};

export default function Tours() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: packages, isLoading } = useQuery({
    queryKey: ['tour-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .eq('is_active', true)
        .order('is_sponsored', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!packages) return [];
    if (activeCategory === "all") return packages;
    return packages.filter(p => p.category === activeCategory);
  }, [packages, activeCategory]);

  return (
    <PageTransition>
      <SEOHead
        title="Tours y Paquetes Turísticos - República Dominicana"
        description="Descubre los mejores tours y paquetes turísticos en República Dominicana: aventura, cultura, bienestar y gastronomía."
        keywords="tours República Dominicana, paquetes turísticos, excursiones, aventura caribe"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[450px] flex items-end">
          <div className="absolute inset-0">
            <img src={heroBeach} alt="Tours en República Dominicana" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          </div>
          <div className="relative container mx-auto px-4 pb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-primary/20 text-primary mb-4">🗺️ Experiencias Curadas</Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Tours y <span className="text-gradient">Paquetes</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Viajes diseñados por expertos locales con todo incluido. Desde aventuras épicas hasta retiros de bienestar.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30 py-4">
          <div className="container mx-auto px-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="bg-transparent h-auto flex-wrap gap-2">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-full px-4">
                  Todos
                </TabsTrigger>
                {Object.entries(categoryConfig).map(([key, { label, icon: Icon }]) => (
                  <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-full px-4 gap-1">
                    <Icon className="h-4 w-4" /> {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Listing */}
        <section className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Compass className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No hay tours disponibles</h2>
              <p className="text-muted-foreground">Pronto agregaremos más opciones en esta categoría.</p>
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
                    transition={{ delay: Math.min(i * 0.1, 0.4) }}
                  >
                    <Link to={`/tour/${pkg.slug}`}>
                      <div className={`group relative bg-card rounded-2xl border overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 ${pkg.is_sponsored ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'}`}>
                        {/* Image */}
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={pkg.image_url || heroBeach}
                            alt={pkg.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                          
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className={cat.color}>
                              <CatIcon className="h-3 w-3 mr-1" /> {cat.label}
                            </Badge>
                            {pkg.difficulty && (
                              <Badge className={difficultyColors[pkg.difficulty] || 'bg-muted text-muted-foreground'}>
                                {pkg.difficulty}
                              </Badge>
                            )}
                          </div>

                          {pkg.is_sponsored && (
                            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                              <Megaphone className="h-3 w-3 mr-1" /> Patrocinado
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {pkg.name}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {pkg.short_description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            {pkg.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" /> {pkg.duration}
                              </span>
                            )}
                            {pkg.max_group_size && (
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-primary" /> Máx. {pkg.max_group_size}
                              </span>
                            )}
                            {pkg.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {pkg.rating}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            {pkg.price_from ? (
                              <div>
                                <span className="text-xs text-muted-foreground">Desde</span>
                                <p className="text-2xl font-bold text-primary">${pkg.price_from} <span className="text-sm font-normal text-muted-foreground">{pkg.price_currency}</span></p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Consultar precio</span>
                            )}
                            <Button variant="outline" size="sm" className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              Ver detalles <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <BetweenSectionsAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
