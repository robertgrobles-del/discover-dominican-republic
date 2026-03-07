import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Landmark, MapPin, Calendar, ChevronRight, Users,
  Share2, ArrowLeft, AlertTriangle, BookOpen,
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

function useHistoricalEvent(slug: string | undefined) {
  return useQuery({
    queryKey: ["historical-event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historical_events")
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

function useRelatedEvents(era: string | null, currentId: string | undefined) {
  return useQuery({
    queryKey: ["related-events", era],
    queryFn: async () => {
      const { data } = await supabase
        .from("historical_events")
        .select("id, name, slug, event_date, year, image_url, era")
        .eq("is_active", true)
        .eq("era", era!)
        .neq("id", currentId!)
        .limit(3);
      return data || [];
    },
    enabled: !!era && !!currentId,
  });
}

export default function EventoHistorico() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading } = useHistoricalEvent(slug);
  const { data: related } = useRelatedEvents(event?.era, event?.id);

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

  if (!event) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Landmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Evento no encontrado</h1>
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
        title={`${event.name} (${event.year}) | Historia de RD`}
        description={event.short_description || ""}
        keywords={`${event.name}, ${event.year}, historia dominicana`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border mt-16">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/historia" className="hover:text-primary transition-colors">Historia</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{event.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Image */}
        <section className="relative h-[40vh] overflow-hidden">
          <img src={event.image_url || "/placeholder.svg"} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-3">
                {event.era && <Badge className={eraColors[event.era] || "bg-muted"}>{event.era}</Badge>}
                {event.is_featured && <Badge className="bg-primary/20 text-primary border-primary/30">⭐ Destacado</Badge>}
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {event.event_date}</span>
                {event.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              <section>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">¿Qué sucedió?</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{event.description}</p>
              </section>

              {/* Significance */}
              {event.significance && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Significado Histórico
                  </h2>
                  <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
                    <p className="text-muted-foreground leading-relaxed">{event.significance}</p>
                  </div>
                </section>
              )}

              {/* Key Figures */}
              {event.key_figures && event.key_figures.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Figuras Clave
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {event.key_figures.map((f) => (
                      <Badge key={f} variant="secondary" className="text-sm py-2 px-4">{f}</Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Consequences */}
              {event.consequences && event.consequences.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" /> Consecuencias
                  </h2>
                  <ul className="space-y-3">
                    {event.consequences.map((c, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{c}</span>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-32 space-y-6">
                <Button variant="outline" className="w-full gap-2" onClick={() => navigator.share?.({ title: event.name, url: window.location.href })}>
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4">Datos del Evento</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span className="font-medium text-foreground">{event.event_date}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Año</span><span className="font-medium text-foreground">{event.year}</span></div>
                    {event.location && <div className="flex justify-between"><span className="text-muted-foreground">Lugar</span><span className="font-medium text-foreground text-right max-w-[160px]">{event.location}</span></div>}
                    {event.era && <div className="flex justify-between"><span className="text-muted-foreground">Época</span><Badge className={`text-xs ${eraColors[event.era] || ""}`}>{event.era}</Badge></div>}
                  </div>
                </motion.div>

                {related && related.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4">Eventos Relacionados</h3>
                    <div className="space-y-3">
                      {related.map((r) => (
                        <Link key={r.id} to={`/historia/evento/${r.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                            <img src={r.image_url || "/placeholder.svg"} alt={r.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.event_date}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
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
