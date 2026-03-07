import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen, Crown, Sword, Landmark, Calendar, MapPin,
  ChevronRight, Quote, Users, Star, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const categoryIcons: Record<string, typeof Crown> = {
  politica: Crown,
  militar: Sword,
  cultura: BookOpen,
  fundacion: Landmark,
  social: Users,
};

const eraColors: Record<string, string> = {
  Colonial: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Independencia: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  Restauración: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  República: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  "Era de Trujillo": "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "Post-Trujillo": "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
};

function useFigures() {
  return useQuery({
    queryKey: ["historical-figures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historical_figures")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

function useHistoricalEvents() {
  return useQuery({
    queryKey: ["historical-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historical_events")
        .select("*")
        .eq("is_active", true)
        .order("year", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export default function HistoriaRD() {
  const { data: figures, isLoading: loadingFigures } = useFigures();
  const { data: events, isLoading: loadingEvents } = useHistoricalEvents();
  const [activeTab, setActiveTab] = useState("timeline");

  const featuredFigures = figures?.filter((f) => f.is_featured) || [];

  return (
    <PageTransition>
      <SEOHead
        title="Historia de República Dominicana | Personajes y Eventos Históricos"
        description="Descubre la rica historia de República Dominicana: biografías de héroes nacionales, eventos históricos y momentos que forjaron la nación."
        keywords="historia dominicana, Duarte, Mirabal, independencia, Restauración, historia RD"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <BookOpen className="h-3 w-3 mr-1" /> Patrimonio Histórico
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Historia de <span className="text-primary italic">República Dominicana</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Más de 500 años de historia, heroísmo y cultura. Conoce los personajes y eventos
                que forjaron la identidad de nuestra nación caribeña.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Figures */}
        {featuredFigures.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" /> Figuras Destacadas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFigures.map((figure, i) => (
                <motion.div
                  key={figure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/historia/personaje/${figure.slug}`}>
                    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={figure.image_url || "/placeholder.svg"}
                          alt={figure.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                        {figure.era && (
                          <Badge className={`absolute top-3 right-3 text-xs ${eraColors[figure.era] || "bg-muted"}`}>
                            {figure.era}
                          </Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{figure.title}</p>
                        <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {figure.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{figure.short_description}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{figure.birth_date}</span>
                          {figure.death_date && (
                            <>
                              <span>—</span>
                              <span>{figure.death_date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Tabs: Timeline / Personajes / Eventos */}
        <section className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="h-4 w-4" /> Línea del Tiempo
              </TabsTrigger>
              <TabsTrigger value="personajes" className="gap-2">
                <Users className="h-4 w-4" /> Personajes
              </TabsTrigger>
              <TabsTrigger value="eventos" className="gap-2">
                <Landmark className="h-4 w-4" /> Eventos
              </TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              {loadingEvents ? (
                <div className="space-y-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {events?.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="relative pl-16 pb-12 last:pb-0"
                    >
                      {i < (events?.length || 0) - 1 && (
                        <div className="absolute left-[27px] top-14 w-0.5 h-[calc(100%-40px)] bg-border" />
                      )}
                      <div className={`absolute left-0 top-2 w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xs font-bold ${
                        event.is_featured ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                      }`}>
                        {event.year}
                      </div>
                      <Link to={`/historia/evento/${event.slug}`} className="block group">
                        <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {event.era && (
                                <Badge className={`text-xs mb-2 ${eraColors[event.era] || "bg-muted"}`}>{event.era}</Badge>
                              )}
                              <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                {event.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> {event.event_date}
                                {event.location && (
                                  <><span>·</span><MapPin className="h-3 w-3" /> {event.location}</>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.short_description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-2" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Personajes Tab */}
            <TabsContent value="personajes">
              {loadingFigures ? (
                <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {figures?.map((figure, i) => {
                    const Icon = categoryIcons[figure.category || "politica"] || Crown;
                    return (
                      <motion.div
                        key={figure.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link to={`/historia/personaje/${figure.slug}`}>
                          <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all group flex gap-5">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                              <img src={figure.image_url || "/placeholder.svg"} alt={figure.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4 text-primary" />
                                <span className="text-xs text-primary font-semibold uppercase">{figure.title}</span>
                              </div>
                              <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{figure.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{figure.short_description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {figure.birth_place}
                                <span>·</span>
                                <Calendar className="h-3 w-3" /> {figure.birth_date}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Eventos Tab */}
            <TabsContent value="eventos">
              {loadingEvents ? (
                <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {events?.map((event, i) => {
                    const Icon = categoryIcons[event.category || "politica"] || Landmark;
                    return (
                      <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Link to={`/historia/evento/${event.slug}`}>
                          <div className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="relative h-40">
                              <img src={event.image_url || "/placeholder.svg"} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                              <div className="absolute bottom-3 left-4 right-4">
                                {event.era && <Badge className={`text-xs mb-1 ${eraColors[event.era] || "bg-muted"}`}>{event.era}</Badge>}
                                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{event.name}</h3>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-muted-foreground line-clamp-2">{event.short_description}</p>
                              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.event_date}</span>
                                {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12 text-center">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Vive la historia en persona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Visita la Zona Colonial de Santo Domingo, Patrimonio de la Humanidad, y camina por las calles donde comenzó la historia del Nuevo Mundo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/destino/zona-colonial">
                <Button size="lg">Explorar Zona Colonial</Button>
              </Link>
              <Link to="/museos">
                <Button size="lg" variant="outline">Visitar Museos</Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
