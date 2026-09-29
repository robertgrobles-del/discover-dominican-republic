import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, MapPin, Clock, Users, Ticket,
  Share2, Heart, ExternalLink, Sparkles,
  Award, Navigation, PlusCircle, Building2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RegistroEventoModal } from "@/components/forms/RegistroEventoModal";
import { FreeTicketModal } from "@/components/events/FreeTicketModal";
import { DetailPageSidebarAd, MobileStickyFooterAd, PreFooterPresidenteBanner } from "@/components/promo";
import { useGamification } from "@/hooks/useGamification";

import {
  eventosEstaticosCompletos,
  type EventDetailType,
} from "@/data/eventosData";
import { DetailHeroHeader } from "@/components/detail/DetailHeroHeader";
import { DetailLocationMapCard } from "@/components/detail/DetailLocationMapCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { EventAgendaTimeline } from "@/components/events/EventAgendaTimeline";
import { EventTipsCard } from "@/components/events/EventTipsCard";
import { EventSidebarCard } from "@/components/events/EventSidebarCard";

export default function EventoDetalle() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const eventIdentifier = slug || id || "carnaval-la-vega";

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isFreeTicketModalOpen, setIsFreeTicketModalOpen] = useState(false);
  const [isRegisterEventModalOpen, setIsRegisterEventModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { awardXp } = useGamification();

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);

      // 1. Buscar en catálogo estático enriquecido
      const staticFound = eventosEstaticosCompletos.find(
        (e) => e.slug === eventIdentifier || e.id === eventIdentifier
      );

      if (staticFound) {
        setEvent(staticFound);
        setLoading(false);
        return;
      }

      // 2. Si no está en estático, buscar en Supabase
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .or(`id.eq.${eventIdentifier},slug.eq.${eventIdentifier}`)
          .maybeSingle();

        if (data && !error) {
          setEvent({
            id: data.id,
            name: data.name,
            slug: data.slug || data.id,
            event_type: data.event_type || "Evento Turístico",
            description: data.description || "Evento oficial en República Dominicana.",
            short_description: data.short_description,
            image_url: data.image_url,
            gallery: [data.image_url],
            start_date: data.start_date,
            end_date: data.end_date,
            start_time: data.start_time,
            end_time: data.end_time,
            venue: data.venue,
            address: data.address,
            price_range: data.price_range || "Consultar boletería",
            ticket_url: data.ticket_url,
            organizer: data.organizer || "Comité Organizador",
            is_featured: data.is_featured,
            is_recurring: data.is_recurring,
            recurrence_pattern: data.recurrence_pattern,
          });
        } else {
          setEvent(eventosEstaticosCompletos[0]);
        }
      } catch {
        setEvent(eventosEstaticosCompletos[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventIdentifier]);

  // Contador regresivo en tiempo real
  useEffect(() => {
    if (!event?.start_date) return;

    const updateCountdown = () => {
      const targetDate = new Date(`${event.start_date}T${event.start_time || "10:00"}:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event?.name} - Descubre RD`,
          text: event?.short_description || `Conoce los detalles de ${event?.name} en República Dominicana.`,
          url: window.location.href,
        });
        toast.success("¡Enlace compartido!");
      } catch {
        // Cancelado por el usuario
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success("Evento guardado en tus favoritos.");
      awardXp(15, 5, "Guardar evento favorito");
    } else {
      toast.info("Evento removido de favoritos.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-10 max-w-7xl space-y-6 flex-1">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) return null;

  return (
    <PageTransition>
      <SEOHead
        title={`${event.name} | Eventos & Festivales RD`}
        description={event.short_description || event.description?.substring(0, 160)}
        keywords={`${event.name}, eventos rd, fiestas patronales rd, festivales dominicanos, ${event.province}`}
      />

      <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
        <Header />

        {/* Hero Header Component */}
        <DetailHeroHeader
          title={event.name}
          subtitle={event.short_description}
          categoryBadge={event.event_type || "Evento Oficial"}
          categoryIcon={<Calendar className="h-3.5 w-3.5" />}
          breadcrumbs={[
            { label: "Inicio", to: "/" },
            { label: "Eventos", to: "/eventos" },
            { label: event.name },
          ]}
          imageUrl={event.image_url || "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=800&fit=crop&q=80"}
          location={`${event.venue ? event.venue + ", " : ""}${event.province || "República Dominicana"}`}
          metrics={[
            { label: "Fecha", value: event.start_date || "Por confirmar", icon: <Calendar className="h-3.5 w-3.5" /> },
            { label: "Hora", value: event.start_time || "18:00", icon: <Clock className="h-3.5 w-3.5" /> },
            { label: "Asistencia", value: event.expected_attendees || "Multitudinario", icon: <Users className="h-3.5 w-3.5" /> },
          ]}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
          rightAction={
            <Button
              onClick={() => setIsRegisterEventModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs h-10 px-4 font-bold border-white/20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md gap-1.5"
            >
              <PlusCircle className="h-4 w-4 text-emerald-400" /> Registrar Mi Evento
            </Button>
          }
        />

        {/* Main Content Layout */}
        <main className="container mx-auto px-4 max-w-7xl py-10 flex-1">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Details & Agenda (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Event Description Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Sobre el Evento
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-3">
                  {event.description}
                </div>
              </div>

              {/* Photo Gallery if present */}
              {event.gallery && event.gallery.length > 1 && (
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Galería del Evento
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {event.gallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted group">
                        <img
                          src={img}
                          alt={`${event.name} ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hour by Hour Agenda Timeline */}
              <EventAgendaTimeline agenda={event.agenda} />

              {/* Practical Tips Card */}
              <EventTipsCard tips={event.tips} />

              {/* Location & Maps Card */}
              <DetailLocationMapCard
                venue={event.venue}
                address={event.address}
                province={event.province}
                coordinates={event.coordinates}
                parkingNotes={event.tips?.parking}
              />
            </div>

            {/* Right Column: Sidebar & Actions (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <EventSidebarCard
                priceRange={event.price_range}
                startDate={event.start_date}
                endDate={event.end_date}
                startTime={event.start_time}
                endTime={event.end_time}
                venue={event.venue}
                organizer={event.organizer}
                ticketUrl={event.ticket_url}
                countdown={countdown}
                onOpenFreeTicketModal={() => setIsFreeTicketModalOpen(true)}
              />

              <DetailPageSidebarAd
                category="Eventos & Conciertos"
                location={event.province || "República Dominicana"}
              />
            </div>
          </div>

          {/* Pre-Footer Presidente Banner */}
          <div className="mt-14">
            <PreFooterPresidenteBanner />
          </div>
        </main>

        <Footer />

        {/* Mobile Sticky Floating CTA Bar */}
        <DetailFloatingBar
          priceLabel="Entrada"
          priceValue={event.price_range}
          primaryActionLabel="Solicitar Entrada"
          primaryActionIcon={<Ticket className="h-4 w-4" />}
          onPrimaryAction={() => {
            if (event.ticket_url) {
              window.open(event.ticket_url, "_blank");
            } else {
              setIsFreeTicketModalOpen(true);
            }
          }}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
        />

        <MobileStickyFooterAd />
      </div>

      {/* Modals */}
      <FreeTicketModal
        open={isFreeTicketModalOpen}
        onOpenChange={setIsFreeTicketModalOpen}
        eventName={event.name}
        eventDate={event.start_date}
      />

      <RegistroEventoModal
        open={isRegisterEventModalOpen}
        onOpenChange={setIsRegisterEventModalOpen}
      />
    </PageTransition>
  );
}
