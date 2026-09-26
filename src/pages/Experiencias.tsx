import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/promo";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useI18n";
import { 
  experienceCategories, 
  staticExperiencias, 
  StaticExperienceItem 
} from "@/data/experienciasData";
import { ExperienciaCard } from "@/components/experiences/ExperienciaCard";

export default function Experiencias() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const { t } = useTranslation();

  // Fetch experiences from DB to merge
  const { data: dbExperiences } = useQuery({
    queryKey: ["all-experiences-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("experiences")
        .select("id, name, description, image_url, category, slug")
        .limit(20);
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Merge static + dynamic DB experiences
  const experiencias: StaticExperienceItem[] = useMemo(() => {
    if (!dbExperiences || dbExperiences.length === 0) return staticExperiencias;
    const dbMapped: StaticExperienceItem[] = dbExperiences.map(e => ({
      id: e.slug || e.id,
      nombre: e.name,
      imagen: e.image_url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
      desc: e.description || "Descubre esta increíble experiencia en República Dominicana.",
      cat: e.category ? e.category.toLowerCase() : "aventura",
      link: `/experiencia/${e.slug || e.id}`
    }));
    const staticIds = new Set(staticExperiencias.map(s => s.id));
    const uniqueDb = dbMapped.filter(d => !staticIds.has(d.id));
    return [...staticExperiencias, ...uniqueDb];
  }, [dbExperiences]);

  const filteredExperiencias = useMemo(() => {
    return experiencias.filter((exp) => {
      const matchesCategory = activeCategory === "todos" || exp.cat === activeCategory;
      const matchesSearch =
        exp.nombre.toLowerCase().includes(search.toLowerCase()) ||
        exp.desc.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [experiencias, activeCategory, search]);

  return (
    <PageTransition>
      <SEOHead
        title={t("experiencias.seoTitle")}
        description={t("experiencias.seoDesc")}
        keywords="experiencias República Dominicana, actividades RD, qué hacer en RD, ecoturismo, aventura, deportes acuáticos, cultura dominicana, turismo"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-[48vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop"
              alt="Experiencias en República Dominicana"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/50" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl py-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> {t("experiencias.badge")}
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              {t("experiencias.heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("experiencias.heroDesc")}
            </p>

            {/* Buscador */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("experiencias.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 h-12 rounded-xl bg-card/90 backdrop-blur-md border-border shadow-lg text-base"
              />
            </div>
          </div>
        </section>

        {/* Categorías Pills */}
        <section className="py-6 border-y border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {experienceCategories.map(cat => {
                const Icon = cat.icon;
                const count = cat.id === "todos" ? experiencias.length : experiencias.filter(e => e.cat === cat.id).length;
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
                  {activeCategory === "todos" ? "Todas las Experiencias" : experienceCategories.find(c => c.id === activeCategory)?.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredExperiencias.length} experiencias disponibles
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredExperiencias.map((exp, i) => (
                <ExperienciaCard
                  key={exp.id}
                  exp={exp}
                  categoryLabel={experienceCategories.find(c => c.id === exp.cat)?.label || "Experiencia"}
                  index={i}
                  exploreText={t("experiencias.explore")}
                />
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
