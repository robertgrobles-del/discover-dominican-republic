import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, Users, Star, ChevronRight, Check, X, MapPin,
  Globe, Mountain, Heart, Compass, Award, CalendarDays,
  Shield, Loader2, Phone, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { TourPhysicalEffort } from "@/components/tour/TourPhysicalEffort";
import { supabase } from "@/integrations/supabase/client";
import heroBeach from "@/assets/hero-beach.jpg";

const categoryLabels: Record<string, string> = {
  adventure: "Aventura", cultural: "Cultural", wellness: "Bienestar",
  nature: "Naturaleza", gastronomic: "Gastronómico",
};

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export default function TourDetalle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour-package', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12 space-y-8">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold mb-4">Tour no encontrado</h1>
            <p className="text-muted-foreground mb-8">El paquete que buscas no existe o ha sido removido.</p>
            <Link to="/tours"><Button>Ver todos los tours</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const itinerary: ItineraryDay[] = Array.isArray(tour.itinerary) ? (tour.itinerary as unknown as ItineraryDay[]) : [];

  return (
    <PageTransition>
      <SEOHead
        title={`${tour.name} - Tours República Dominicana`}
        description={tour.short_description || tour.description?.slice(0, 160) || ''}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[55vh] min-h-[450px] flex items-end">
          <div className="absolute inset-0">
            <img src={tour.image_url || heroBeach} alt={tour.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          <div className="relative container mx-auto px-4 pb-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/tours" className="hover:text-primary">Tours</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{tour.name}</span>
            </nav>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/20 text-primary">
                  {categoryLabels[tour.category || 'adventure'] || tour.category}
                </Badge>
                {tour.difficulty && (
                  <Badge variant="secondary">{tour.difficulty}</Badge>
                )}
                {tour.is_sponsored && (
                  <SponsoredBadge />
                )}
                <FavoriteButton id={tour.id} type="tour" name={tour.name} image={tour.image_url || heroBeach} variant="button" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{tour.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {tour.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> {tour.duration}</span>}
                {tour.max_group_size && <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> Máx. {tour.max_group_size} personas</span>}
                {tour.rating && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {tour.rating}</span>}
                {tour.languages && tour.languages.length > 0 && (
                  <span className="flex items-center gap-1"><Globe className="h-4 w-4 text-primary" /> {tour.languages.join(', ')}</span>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre este Tour</h2>
                <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
              </section>

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <section className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Lo Más Destacado
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {tour.highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {h}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Itinerary */}
              {itinerary.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <CalendarDays className="h-6 w-6 text-primary" /> Itinerario
                  </h2>
                  <div className="space-y-6">
                    {itinerary.map((day, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pl-8 border-l-2 border-primary/30"
                      >
                        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {day.day}
                        </div>
                        <div className="bg-card rounded-xl border border-border p-6">
                          <h3 className="font-display text-lg font-bold text-foreground mb-3">
                            Día {day.day}: {day.title}
                          </h3>
                          <ul className="space-y-2">
                            {day.activities.map((act: string, j: number) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Mejora 634: Iconos de Esfuerzo Físico (Caminata, Nado, Escalones, Altitud) */}
              <TourPhysicalEffort
                difficulty={tour.difficulty || "moderado"}
                caminataKm={tour.duration?.includes("Día") ? "4 - 7" : "2.5"}
                escalones={tour.name.toLowerCase().includes("damajagua") || tour.name.toLowerCase().includes("cascada") ? "140" : undefined}
                nadoRequerido={tour.name.toLowerCase().includes("saona") || tour.name.toLowerCase().includes("cayo") || tour.name.toLowerCase().includes("charcos")}
                altitudM={tour.name.toLowerCase().includes("duarte") ? 3098 : tour.name.toLowerCase().includes("constanza") ? 1200 : undefined}
              />

              {/* Included / Not Included */}
              <div className="grid sm:grid-cols-2 gap-6">
                {tour.included && tour.included.length > 0 && (
                  <section className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" /> Incluido
                    </h3>
                    <ul className="space-y-2">
                      {tour.included.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {tour.not_included && tour.not_included.length > 0 && (
                  <section className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" /> No Incluido
                    </h3>
                    <ul className="space-y-2">
                      {tour.not_included.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="sticky top-32 space-y-6">
                <div className="bg-card rounded-2xl border border-border p-6">
                  {tour.price_from ? (
                    <div className="mb-6">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Tarifa Oficial Desde</span>
                      <p className="text-3xl sm:text-4xl font-black text-primary">
                        US$ {tour.price_from} <span className="text-sm font-normal text-muted-foreground">/ persona</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        aprox. RD$ {(tour.price_from * 60).toLocaleString("es-DO")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-foreground mb-6">Consultar precio personalizado</p>
                  )}

                  <a
                    href={`https://wa.me/18092214660?text=${encodeURIComponent(`Hola, vi el paquete turístico "${tour.name}" en Descubre República Dominicana (${window.location.href}) y deseo reservar cupos para mi grupo.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mb-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-5 px-4 rounded-xl transition-all shadow-md"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Reservar Ahora
                  </a>
                  <p className="text-[11px] text-center text-muted-foreground mb-3">
                    💬 Te atiende directamente el equipo de asistencia y conserjería del portal (+1 809-221-4660).
                  </p>

                  <a
                    href={`mailto:info@descubrerd.do?subject=${encodeURIComponent(`Consulta sobre Tour: ${tour.name}`)}&body=${encodeURIComponent(`Hola equipo de Descubre República Dominicana,\n\nDeseo solicitar más información sobre el paquete turístico "${tour.name}".\n\n- Número de viajeros:\n- Fecha aproximada:\n- Preguntas específicas:\n\nGracias.`)}`}
                    className="w-full inline-flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-semibold py-3 px-4 rounded-xl text-sm transition-all"
                  >
                    <Phone className="h-4 w-4" />
                    Solicitar Información
                  </a>

                  <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                    {tour.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{tour.duration}</span>
                      </div>
                    )}
                    {tour.max_group_size && (
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Máximo {tour.max_group_size} personas</span>
                      </div>
                    )}
                    {tour.difficulty && (
                      <div className="flex items-center gap-3">
                        <Mountain className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Dificultad: {tour.difficulty}</span>
                      </div>
                    )}
                    {tour.min_age && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Edad mínima: {tour.min_age} años</span>
                      </div>
                    )}
                  </div>
                </div>

                {tour.languages && tour.languages.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" /> Idiomas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.languages.map((lang: string) => (
                        <Badge key={lang} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {tour.meeting_point && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Punto de Encuentro
                    </h3>
                    <p className="text-sm text-muted-foreground">{tour.meeting_point}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
