import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Ticket, 
  Share2, 
  Heart, 
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DetailPageSidebarAd, MobileStickyFooterAd } from "@/components/ads";

// Datos estáticos para eventos
const eventosEstaticos = [
  {
    id: "1",
    name: "Carnaval de La Vega",
    slug: "carnaval-la-vega",
    event_type: "Cultural",
    description: `El Carnaval de La Vega es uno de los carnavales más antiguos y famosos de República Dominicana. Cada domingo de febrero, las calles se llenan de los tradicionales "Diablos Cojuelos", personajes con disfraces elaborados y máscaras impresionantes que son verdaderas obras de arte.

Este evento cultural reúne a miles de visitantes nacionales e internacionales que vienen a disfrutar de la tradición, la música y el colorido de esta celebración única en el Caribe.

Los Diablos Cojuelos son el elemento más distintivo del carnaval vegano. Estas figuras llevan trajes de satín brillante adornados con espejos, cascabeles y lentejuelas, junto con máscaras grotescas de papel maché que representan demonios y criaturas fantásticas.`,
    short_description: "La manifestación cultural más vibrante del Caribe con los tradicionales Diablos Cojuelos.",
    image_url: "/placeholder.svg",
    gallery: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    start_date: "2025-02-02",
    end_date: "2025-02-28",
    start_time: "10:00",
    end_time: "22:00",
    venue: "Centro Histórico de La Vega",
    address: "Calle Padre Adolfo, La Vega, República Dominicana",
    price_range: "Gratis",
    ticket_url: null,
    organizer: "Comité Organizador del Carnaval Vegano",
    is_recurring: true,
    recurrence_pattern: "Cada domingo de febrero",
    is_featured: true
  },
  {
    id: "2",
    name: "DR Jazz Festival",
    slug: "dr-jazz-festival",
    event_type: "Música",
    description: `El Dominican Republic Jazz Festival es el evento de jazz más importante del Caribe, celebrado anualmente en las playas de Cabarete, Puerto Plata.

Durante tres noches mágicas, artistas internacionales y locales se reúnen para ofrecer conciertos al aire libre con el mar Caribe como escenario. El festival ha presentado a leyendas del jazz como Michel Camilo, Chucho Valdés y muchos otros.

El ambiente único de Cabarete, conocido mundialmente por sus deportes acuáticos, se transforma en un paraíso para los amantes del jazz, combinando música de clase mundial con la belleza natural del Atlántico dominicano.`,
    short_description: "Noches de jazz bajo las estrellas con artistas internacionales en la playa de Cabarete.",
    image_url: "/placeholder.svg",
    gallery: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    start_date: "2025-11-10",
    end_date: "2025-11-12",
    start_time: "18:00",
    end_time: "23:00",
    venue: "Playa Cabarete",
    address: "Cabarete, Puerto Plata, República Dominicana",
    price_range: "RD$ 2,500 - RD$ 8,000",
    ticket_url: "https://drjazzfestival.com",
    organizer: "Fundación Festival de Jazz",
    is_recurring: true,
    recurrence_pattern: "Anual - Noviembre",
    is_featured: true
  },
  {
    id: "3",
    name: "Feria Gastronómica",
    slug: "feria-gastronomica-sd",
    event_type: "Gastronomía",
    description: `La Feria Gastronómica de Santo Domingo es el evento culinario más importante del país, reuniendo a los mejores chefs, restaurantes y productores locales en un solo lugar.

Durante tres días, los visitantes pueden degustar platillos tradicionales dominicanos, fusiones innovadoras y productos artesanales de todas las regiones del país. También hay demostraciones de cocina en vivo, catas de vinos y ron, y talleres gastronómicos.

Este evento celebra la riqueza de la cocina dominicana y su fusión con influencias taínas, españolas, africanas y del Medio Oriente.`,
    short_description: "Sabores auténticos de nuestra tierra en el evento culinario más importante del país.",
    image_url: "/placeholder.svg",
    gallery: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    start_date: "2025-10-15",
    end_date: "2025-10-17",
    start_time: "09:00",
    end_time: "21:00",
    venue: "Centro de Convenciones",
    address: "Av. Anacaona, Santo Domingo, República Dominicana",
    price_range: "RD$ 500 - RD$ 1,500",
    ticket_url: "https://feriagastronomica.do",
    organizer: "Asociación Dominicana de Restaurantes",
    is_recurring: true,
    recurrence_pattern: "Anual - Octubre",
    is_featured: false
  }
];

interface Event {
  id: string;
  name: string;
  slug?: string;
  event_type?: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  gallery?: string[];
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  address?: string;
  price_range?: string;
  ticket_url?: string;
  organizer?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  is_featured?: boolean;
}

export default function EventoDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      
      // Primero buscar en datos estáticos
      const staticEvent = eventosEstaticos.find(e => e.id === id || e.slug === id);
      if (staticEvent) {
        setEvent(staticEvent);
        setLoading(false);
        return;
      }

      // Si no está en estáticos, buscar en Supabase
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id}`)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-DO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (!event) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Evento no encontrado</h1>
            <p className="text-muted-foreground mb-6">El evento que buscas no existe o ya no está disponible.</p>
            <Link to="/eventos">
              <Button>Ver todos los eventos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.short_description || event.description,
    image: event.image_url,
    startDate: event.start_date,
    endDate: event.end_date,
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address,
        addressCountry: "DO"
      }
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer
    },
    offers: event.price_range ? {
      "@type": "Offer",
      price: event.price_range,
      priceCurrency: "DOP"
    } : undefined
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${event.name} | Eventos en República Dominicana`}
        description={event.short_description || event.description?.slice(0, 160)}
        image={event.image_url}
        jsonLd={eventSchema}
      />
      <Header />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px]">
          {!imageLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={event.image_url || '/placeholder.svg'}
            alt={event.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Breadcrumb */}
          <div className="absolute top-4 left-0 right-0 z-10">
            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-2 text-sm text-white/80">
                <Link to="/" className="hover:text-white">Inicio</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/eventos" className="hover:text-white">Eventos</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{event.name}</span>
              </nav>
            </div>
          </div>

          {/* Event Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="container mx-auto px-4 pb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.event_type && (
                  <Badge className="bg-primary text-primary-foreground">{event.event_type}</Badge>
                )}
                {event.is_featured && (
                  <Badge variant="secondary">Destacado</Badge>
                )}
                {event.is_recurring && (
                  <Badge variant="outline" className="bg-background/80">{event.recurrence_pattern}</Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
                {event.name}
              </h1>
              {event.short_description && (
                <p className="text-lg text-white/90 max-w-2xl">
                  {event.short_description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Date & Time */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-4">Fecha y Hora</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Fecha de inicio</p>
                          <p className="text-muted-foreground">{formatDate(event.start_date)}</p>
                        </div>
                      </div>
                      {event.end_date && event.end_date !== event.start_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Fecha de fin</p>
                            <p className="text-muted-foreground">{formatDate(event.end_date)}</p>
                          </div>
                        </div>
                      )}
                      {event.start_time && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Horario</p>
                            <p className="text-muted-foreground">
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-4">Sobre el evento</h2>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      {event.description?.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="text-muted-foreground mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-4">Ubicación</h2>
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        {event.venue && <p className="font-medium text-foreground">{event.venue}</p>}
                        {event.address && <p className="text-muted-foreground">{event.address}</p>}
                      </div>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Mapa interactivo próximamente</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Gallery */}
                {event.gallery && event.gallery.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="font-display text-xl font-bold text-foreground mb-4">Galería</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {event.gallery.map((img, i) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden">
                            <img 
                              src={img} 
                              alt={`${event.name} - Imagen ${i + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Action Card */}
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    {event.price_range && (
                      <div className="flex items-center justify-between pb-4 border-b border-border">
                        <span className="text-muted-foreground">Entrada</span>
                        <span className="text-xl font-bold text-foreground">{event.price_range}</span>
                      </div>
                    )}

                    {event.ticket_url ? (
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full gap-2">
                          <Ticket className="h-4 w-4" />
                          Comprar Entradas
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <Button className="w-full gap-2">
                        <Calendar className="h-4 w-4" />
                        Agregar al Calendario
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2">
                        <Heart className="h-4 w-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <Share2 className="h-4 w-4" />
                        Compartir
                      </Button>
                    </div>

                    {event.organizer && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">Organizado por</p>
                        <p className="font-medium text-foreground">{event.organizer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ad */}
                <DetailPageSidebarAd />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileStickyFooterAd />
    </PageTransition>
  );
}
