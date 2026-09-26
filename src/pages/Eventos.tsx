import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Music, PlusCircle, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { BetweenSectionsAd } from "@/components/promo";
import { RegistroEventoModal } from "@/components/forms/RegistroEventoModal";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useI18n";
import { 
  categoriasEventos, 
  generosMusicales, 
  staticEventos, 
  eventoDestacado, 
  festivalesMusicales,
  EventoItem 
} from "@/data/eventosData";
import { CalendarioGeneralTabContent } from "@/components/events/CalendarioGeneralTabContent";
import { EventoDestacadoSection } from "@/components/events/EventoDestacadoSection";
import { FestivalesTabContent } from "@/components/events/FestivalesTabContent";

import carnival from "@/assets/carnival.jpg";
import jazzFestival from "@/assets/jazz-festival.jpg";
import gastronomy from "@/assets/gastronomy.jpg";

export default function Eventos() {
  const { t } = useTranslation();
  const [selectedCategoria, setSelectedCategoria] = useState("Todo");
  const [selectedGenero, setSelectedGenero] = useState("Todos");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("calendario");
  const [isRegisterEventModalOpen, setIsRegisterEventModalOpen] = useState(false);
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("start_date", { ascending: true })
      .then(({ data }) => {
        if (data) setDbEvents(data);
      });
  }, []);

  // Merge static + DB events, DB first, dedup by slug-like id
  const staticSlugs = new Set(staticEventos.map(e => e.id));
  const mergedEventos: EventoItem[] = [
    ...dbEvents
      .filter(e => !staticSlugs.has(e.slug))
      .map(e => ({
        id: e.slug || e.id,
        titulo: e.name,
        fecha: e.start_date ? new Date(e.start_date).toLocaleDateString("es-DO", { day: "numeric", month: "short" }).toUpperCase() : "",
        categoria: e.event_type || "Evento",
        imagen: e.image_url || carnival,
        descripcion: e.short_description || e.description || "",
        ubicacion: e.address || "",
      })),
    ...staticEventos,
  ];

  const eventosSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Eventos en República Dominicana",
    description: "Calendario de eventos culturales, festivales y ferias en República Dominicana",
    itemListElement: staticEventos.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: e.titulo,
        description: e.descripcion,
        image: e.imagen,
        location: {
          "@type": "Place",
          name: e.ubicacion,
          address: {
            "@type": "PostalAddress",
            addressLocality: e.ubicacion,
            addressCountry: "DO"
          }
        }
      }
    }))
  };

  const festivalesFiltrados = selectedGenero === "Todos" 
    ? festivalesMusicales 
    : festivalesMusicales.filter(f => f.genero === selectedGenero);

  const labels = {
    upcoming: t("eventos.upcoming"),
    exploreByCategory: t("eventos.exploreByCategory"),
    filterByLocation: t("eventos.filterByLocation"),
    viewDetails: t("eventos.viewDetails"),
    featuredEvent: t("eventos.featuredEvent"),
    aboutEvent: t("eventos.aboutEvent"),
    dayAgenda: t("eventos.dayAgenda"),
    watchVideo: t("eventos.watchVideo"),
    viewOnMap: t("eventos.viewOnMap"),
    interested: t("eventos.interested"),
    interestedDesc: t("eventos.interestedDesc"),
    imInterested: t("eventos.imInterested"),
    musicRhythm: t("eventos.musicRhythm"),
    musicRhythmDesc: t("eventos.musicRhythmDesc"),
    buy: t("eventos.buy"),
    stageMaps: t("eventos.stageMaps"),
    stageMapsDesc: t("eventos.stageMapsDesc"),
    concertAlerts: t("eventos.concertAlerts"),
    concertAlertsDesc: t("eventos.concertAlertsDesc"),
    subscribe: t("eventos.subscribe")
  };

  return (
    <PageTransition>
      <SEOHead
        title={t("eventos.seoTitle")}
        description={t("eventos.seoDesc")}
        keywords="eventos República Dominicana, carnaval La Vega, festivales RD, ferias dominicanas, jazz festival, merengue"
        jsonLd={eventosSchema}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden pt-16">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={carnival}
            alt={t("eventos.heroAlt")}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          <div className="relative z-10 text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 italic">
              {t("eventos.heroTitle")}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              {t("eventos.heroSubtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" /> {t("eventos.viewCalendar")}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setIsRegisterEventModalOpen(true)}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md"
              >
                <PlusCircle className="h-5 w-5 text-primary" /> Registrar mi Evento
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs Principal */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto gap-2 bg-transparent mb-8">
                <TabsTrigger 
                  value="calendario" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Calendar className="h-4 w-4" />
                  {t("eventos.generalCalendar")}
                </TabsTrigger>
                <TabsTrigger 
                  value="festivales" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Music className="h-4 w-4" />
                  {t("eventos.musicFestivals")}
                </TabsTrigger>
              </TabsList>

              {/* ========== TAB: CALENDARIO GENERAL ========== */}
              <TabsContent value="calendario">
                <CalendarioGeneralTabContent
                  categorias={categoriasEventos}
                  selectedCategoria={selectedCategoria}
                  onSelectCategoria={setSelectedCategoria}
                  eventos={mergedEventos}
                  labels={labels}
                />

                {/* Evento Destacado */}
                <EventoDestacadoSection
                  evento={eventoDestacado}
                  labels={labels}
                />
              </TabsContent>

              {/* ========== TAB: FESTIVALES MUSICALES ========== */}
              <TabsContent value="festivales">
                <FestivalesTabContent
                  festivales={festivalesFiltrados}
                  generosMusicales={generosMusicales}
                  selectedGenero={selectedGenero}
                  onSelectGenero={setSelectedGenero}
                  labels={labels}
                />

                {/* CTA Newsletter */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 text-center">
                  <Music className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{t("eventos.concertAlerts")}</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    {t("eventos.concertAlertsDesc")}
                  </p>
                  <Button size="lg" className="gap-2">
                    {t("eventos.subscribe")} <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Memorias */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">{t("eventos.memories")}</h2>
              <Link to="/galeria" className="text-primary text-sm font-medium hover:underline">
                {t("eventos.viewFullGallery")}
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[carnival, jazzFestival, gastronomy].map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-[4/3]">
                  <img src={img} alt={`Memoria ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* B2B Event Organizer Banner Section */}
        <section className="py-12 bg-card/60 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl p-8 md:p-10 bg-gradient-to-r from-primary/10 via-card to-purple-500/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5" /> Productoras & Organizadores de Eventos
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  ¿Organizas un concierto, festival o evento en RD?
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Publica tu evento en la agenda oficial de Descubre RD. Conecta con miles de turistas y dominicanos, redirige hacia tu boletería oficial o activa la venta de taquillas.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setIsRegisterEventModalOpen(true)}
                className="shrink-0 rounded-2xl h-12 px-6 font-bold text-xs gap-2 shadow-lg shadow-primary/20"
              >
                <PlusCircle className="h-4 w-4" />
                Registrar mi Evento Gratis
              </Button>
            </div>
          </div>
        </section>

        {/* Ad before footer */}
        <BetweenSectionsAd showDemo />

        <Footer />

        {/* Registro Evento Modal Dialog */}
        <RegistroEventoModal 
          open={isRegisterEventModalOpen} 
          onClose={() => setIsRegisterEventModalOpen(false)} 
        />
      </div>
    </PageTransition>
  );
}
