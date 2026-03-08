import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Compass, Mountain, Waves, Palmtree, Music, Heart, Utensils, Users, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useI18n";

import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puntaCana from "@/assets/punta-cana.jpg";

const categories = [
  { id: "todos", label: "Todos", icon: Compass },
  { id: "naturaleza", label: "Naturaleza", icon: Palmtree },
  { id: "aventura", label: "Aventura", icon: Mountain },
  { id: "cultura", label: "Cultura", icon: Music },
  { id: "acuaticos", label: "Acuáticos", icon: Waves },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "bienestar", label: "Bienestar", icon: Heart },
  { id: "familia", label: "Familia", icon: Users },
];

const staticExperiencias = [
  { id: "ecoturismo", nombre: "Ecoturismo", imagen: whaleSamana, desc: "Conecta con la naturaleza virgen de RD", cat: "naturaleza" },
  { id: "aventura", nombre: "Aventura", imagen: adventure, desc: "Adrenalina en el paraíso caribeño", cat: "aventura" },
  { id: "parques-tematicos", nombre: "Parques Temáticos", imagen: puntaCana, desc: "Diversión extrema y emociones para todos", link: "/parques-tematicos", cat: "aventura" },
  { id: "cultura", nombre: "Cultura", imagen: santoDomingo, desc: "500 años de historia viva", cat: "cultura" },
  { id: "romance", nombre: "Romance", imagen: relaxBeach, desc: "Amor en el Caribe", cat: "bienestar" },
  { id: "golf", nombre: "Golf", imagen: hotelEdenRoc, desc: "Campos de clase mundial", cat: "aventura" },
  { id: "gastronomia", nombre: "Gastronomía", imagen: gastronomy, desc: "Sabores del Caribe", cat: "gastronomia" },
  { id: "familia", nombre: "Familia", imagen: puntaCana, desc: "Diversión para todas las edades", cat: "familia" },
  { id: "deportes", nombre: "Deportes", imagen: adventure, desc: "Recreación al aire libre", cat: "aventura" },
  { id: "acuaticos", nombre: "Deportes Acuáticos", imagen: diving, desc: "Aventura en el mar", cat: "acuaticos" },
  { id: "museos", nombre: "Museos", imagen: santoDomingo, desc: "Historia y arte", cat: "cultura" },
  { id: "bienestar", nombre: "Bienestar y Salud", imagen: relaxBeach, desc: "Tu refugio de paz y sanación", link: "/wellness", cat: "bienestar" },
  { id: "turismo-medico", nombre: "Turismo Médico", imagen: hotelEdenRoc, desc: "Salud de clase mundial a precios accesibles", link: "/turismo-medico", cat: "bienestar" },
  { id: "nomadas", nombre: "Nómadas Digitales", imagen: puntaCana, desc: "Trabaja desde el paraíso caribeño", link: "/nomadas-digitales", cat: "bienestar" },
  { id: "lujo", nombre: "Lujo", imagen: hotelEdenRoc, desc: "Experiencias exclusivas", cat: "bienestar" },
  { id: "compras", nombre: "Compras", imagen: merengue, desc: "Tesoros del Caribe", cat: "cultura" },
];

export default function Experiencias() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const { t } = useTranslation();

  const { data: dbExperiences } = useQuery({
    queryKey: ['experiences-list'],
    queryFn: async () => {
      const { data } = await supabase.from('experiences').select('*').eq('is_active', true).order('is_sponsored', { ascending: false }).order('is_featured', { ascending: false });
      return data || [];
    },
  });

  const experiencias = useMemo(() => {
    const items = [...staticExperiencias];
    const ids = new Set(items.map(e => e.id));
    (dbExperiences || []).forEach(e => {
      const slug = e.slug || e.id;
      if (!ids.has(slug)) {
        items.push({
          id: slug,
          nombre: e.name,
          imagen: e.image_url || adventure,
          desc: e.short_description || '',
          cat: e.category || 'aventura',
        });
        ids.add(slug);
      }
    });
    return items;
  }, [dbExperiences]);

  const filteredExperiencias = experiencias.filter(exp => {
    const matchSearch = !search || exp.nombre.toLowerCase().includes(search.toLowerCase()) || exp.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "todos" || (exp as any).cat === activeCategory;
    return matchSearch && matchCat;
  });

  const experienciasSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Experiencias en República Dominicana",
    description: "Descubre las mejores experiencias turísticas en República Dominicana",
    itemListElement: experiencias.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "TouristAttraction", name: e.nombre, description: e.desc, image: e.imagen }
    }))
  };

  return (
    <PageTransition>
      <SEOHead
        title={t("experiencias.seoTitle")}
        description={t("experiencias.seoDesc")}
        keywords="experiencias República Dominicana, ecoturismo RD, aventura Caribe, turismo cultural"
        jsonLd={experienciasSchema}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" /> {experiencias.length}+ Experiencias
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              {t("experiencias.title")} <span className="text-primary italic">{t("experiencias.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("experiencias.subtitle")}
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("experiencias.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-4 border-b border-border sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => {
                const Icon = cat.icon;
                const count = cat.id === "todos" ? experiencias.length : experiencias.filter(e => (e as any).cat === cat.id).length;
                return (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className="gap-1.5 flex-shrink-0"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                    <span className="text-xs opacity-60">({count})</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <CompactInlineAd showDemo />

        {/* Grid de Experiencias */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {activeCategory === "todos" ? "Todas las Experiencias" : categories.find(c => c.id === activeCategory)?.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredExperiencias.length} experiencias disponibles
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredExperiencias.map((exp, i) => (
                <div
                  key={exp.id}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                >
                  <Link to={(exp as any).link || `/experiencia/${exp.id}`} className="block h-full">
                    <img
                      src={exp.imagen}
                      alt={exp.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/40 backdrop-blur-sm text-white border-white/20 text-xs">
                        {categories.find(c => c.id === (exp as any).cat)?.label || "Experiencia"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-display text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {exp.nombre}
                      </h3>
                      <p className="text-white/80 text-sm mb-3 line-clamp-2">{exp.desc}</p>
                      <span className="inline-flex items-center text-primary text-sm font-medium">
                        {t("experiencias.explore")} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                  <FavoriteButton
                    id={exp.id}
                    type="experiencia"
                    name={exp.nombre}
                    image={exp.imagen}
                    className="absolute top-4 right-4 z-10"
                  />
                </div>
              ))}
            </div>

            {filteredExperiencias.length === 0 && (
              <div className="text-center py-16">
                <Compass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t("experiencias.noResults")} "{search}"</p>
                <Button variant="outline" onClick={() => { setSearch(""); setActiveCategory("todos"); }}>
                  {t("experiencias.clearSearch")}
                </Button>
              </div>
            )}
          </div>
        </section>

        <BetweenSectionsAd showDemo />

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12 text-center">
              <Compass className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t("experiencias.ctaTitle")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                {t("experiencias.ctaDesc")}
              </p>
              <Link to="/herramientas">
                <Button size="lg" className="gap-2">
                  {t("experiencias.planMyTrip")} <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
