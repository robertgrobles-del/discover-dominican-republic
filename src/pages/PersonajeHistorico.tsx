import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyImage } from "@/components/ui/lazy-image";
import {
  BookOpen, Crown, MapPin, Calendar, ChevronRight, Quote,
  Award, Share2, ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const eraColors: Record<string, string> = {
  Colonial: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Independencia: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  Restauración: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  República: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  "Era de Trujillo": "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "Post-Trujillo": "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
};

function useFigure(slug: string | undefined) {
  return useQuery({
    queryKey: ["historical-figure", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historical_figures")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!slug,
  });
}

function useRelatedFigures(category: string | null, currentId: string | undefined) {
  return useQuery({
    queryKey: ["related-figures", category],
    queryFn: async () => {
      const { data } = await supabase
        .from("historical_figures")
        .select("id, name, slug, title, image_url, birth_date")
        .eq("is_active", true)
        .eq("category", category!)
        .neq("id", currentId!)
        .limit(3);
      return data || [];
    },
    enabled: !!category && !!currentId,
  });
}

export default function PersonajeHistorico() {
  const { slug } = useParams<{ slug: string }>();
  const { data: figure, isLoading } = useFigure(slug);
  const { data: related } = useRelatedFigures(figure?.category, figure?.id);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!figure) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Personaje no encontrado</h1>
            <Link to="/historia"><Button>Ver Historia de RD</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${figure.name} - ${figure.title} | Historia de RD`}
        description={figure.short_description || ""}
        keywords={`${figure.name}, historia dominicana, ${figure.era}`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/historia" className="hover:text-primary transition-colors">Historia</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{figure.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <LazyImage
                src={figure.image_url || "/placeholder.svg"}
                alt={figure.name}
                className="w-full h-full object-cover"
                containerClassName="w-full md:w-72 h-72 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border"
              />
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  {figure.era && <Badge className={eraColors[figure.era] || "bg-muted"}>{figure.era}</Badge>}
                  {figure.is_featured && <Badge className="bg-primary/20 text-primary border-primary/30">⭐ Destacado</Badge>}
                </div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">{figure.title}</p>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{figure.name}</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">{figure.description}</p>
                <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {figure.birth_date}</span>
                  {figure.death_date && <span className="flex items-center gap-2">— {figure.death_date}</span>}
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {figure.birth_place}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {/* Biography */}
              {figure.biography && (
                <section className="animate-fade-in">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Biografía
                  </h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                    {figure.biography}
                  </div>
                </section>
              )}

              {/* Achievements */}
              {figure.achievements && figure.achievements.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Logros y Legado
                  </h2>
                  <ul className="space-y-3">
                    {figure.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{a}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Quotes */}
              {figure.quotes && figure.quotes.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Quote className="h-5 w-5 text-primary" /> Frases Célebres
                  </h2>
                  <div className="space-y-4">
                    {figure.quotes.map((q, i) => (
                      <div key={i} className="bg-card rounded-xl border border-border p-6 relative animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                        <Quote className="absolute top-4 left-4 h-6 w-6 text-primary/20" />
                        <p className="text-foreground font-display text-lg italic pl-8">{q}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {figure.gallery && figure.gallery.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    📷 Galería
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {figure.gallery.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                        <LazyImage
                          src={img}
                          alt={`${figure.name} - ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          containerClassName="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-32 space-y-6">
                <Button variant="outline" className="w-full gap-2" onClick={() => navigator.share?.({ title: figure.name, url: window.location.href })}>
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>

                {/* Info card */}
                <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
                  <h3 className="font-display font-bold text-foreground mb-4">Datos</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Nacimiento</span><span className="font-medium text-foreground">{figure.birth_date}</span></div>
                    {figure.death_date && <div className="flex justify-between"><span className="text-muted-foreground">Fallecimiento</span><span className="font-medium text-foreground">{figure.death_date}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Lugar</span><span className="font-medium text-foreground">{figure.birth_place}</span></div>
                    {figure.era && <div className="flex justify-between"><span className="text-muted-foreground">Época</span><Badge className={`text-xs ${eraColors[figure.era] || ""}`}>{figure.era}</Badge></div>}
                  </div>
                </div>

                {/* Related */}
                {related && related.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <h3 className="font-display font-bold text-foreground mb-4">Personajes Relacionados</h3>
                    <div className="space-y-3">
                      {related.map((r) => (
                        <Link key={r.id} to={`/historia/personaje/${r.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <LazyImage
                            src={r.image_url || "/placeholder.svg"}
                            alt={r.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-10 h-10 rounded-lg overflow-hidden bg-muted"
                          />
                          <div>
                            <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.title}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <Link to="/historia"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Ver toda la historia</Button></Link>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
