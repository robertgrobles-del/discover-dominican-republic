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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Globe,
  Sparkles,
  Award,
  Navigation,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Car,
  ShieldCheck,
  Shirt,
  Utensils,
  ArrowRight,
  PlusCircle,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RegistroEventoModal } from "@/components/forms/RegistroEventoModal";
import { FreeTicketModal } from "@/components/events/FreeTicketModal";
import { DetailPageSidebarAd, MobileStickyFooterAd, PreFooterPresidenteBanner } from "@/components/promo";
import { useGamification } from "@/hooks/useGamification";

// Catálogo amplio de eventos dominicanos oficiales y destacados
export const eventosEstaticosCompletos = [
  {
    id: "1",
    name: "Carnaval Vegano",
    slug: "carnaval-la-vega",
    event_type: "Tradición & Cultura",
    province: "La Vega",
    region: "Cibao Central",
    description: `El Carnaval de La Vega es la máxima expresión folclórica y festiva de la República Dominicana, declarado Patrimonio Cultural de la Nación. Cada domingo del mes de febrero, las calles del centro histórico se inundan de color, ritmo y algarabía con la salida de más de 150 grupos de los tradicionales "Diablos Cojuelos".

Estas fascinantes figuras visten trajes multicolores de seda y satín adornados con cascabeles, espejos, lentejuelas y vejigas de toro infladas, luciendo espectaculares máscaras grotescas esculpidas artesanalmente en papel maché por maestros artesanos veganos.

La fiesta culmina cada domingo al atardecer en el Parque de las Flores y la Avenida de los Flamboyanes con multitudinarios conciertos en vivo protagonizados por las principales estrellas nacionales e internacionales de merengue, bachata y música urbana.`,
    short_description: "El carnaval más antiguo y multitudinario del Caribe con los legendarios Diablos Cojuelos.",
    image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop&q=80"
    ],
    start_date: "2026-02-01",
    end_date: "2026-02-28",
    start_time: "14:00",
    end_time: "23:30",
    venue: "Zona de Carnaval - Calle Padre Adolfo",
    address: "Centro Histórico de La Vega, República Dominicana",
    coordinates: { lat: 19.2220, lng: -70.5296 },
    price_range: "Entrada General Gratis / VIP RD$ 2,500",
    ticket_url: "https://carnavalvegano.com.do",
    organizer: "UCAVE & Alcaldía de La Vega",
    is_recurring: true,
    recurrence_pattern: "Todos los domingos de febrero",
    is_featured: true,
    expected_attendees: "100,000+ por fin de semana",
    agenda: [
      { hora: "02:00 PM", titulo: "Apertura del Vallado y Zonas VIP", desc: "Ingreso ordenado a tarimas y áreas de patrocinadores oficiales." },
      { hora: "03:30 PM", titulo: "Desfile Oficial de Comparsas y Diablos Cojuelos", desc: "Recorrido de comparsas tradicionales por la Calle Padre Adolfo." },
      { hora: "07:00 PM", titulo: "Gran Concierto de Cierre LIDOM / Presidente", desc: "Música en vivo con orquestas de merengue y artistas urbanos." }
    ],
    tips: {
      dressCode: "Ropa ligera, tenis cómodos y gorra. Protección para vejigazos en zonas no valladas.",
      parking: "Parqueos vigilados disponibles en las entradas de la ciudad con transporte en minibuses.",
      familyFriendly: "Zonas familiares señalizadas en las primeras cuadras de la Avenida de las Flores.",
      gastronomy: "Puestos de lechón asado, chivo liniero, empanadas y bebidas dominicanas."
    }
  },
  {
    id: "2",
    name: "DR Jazz Festival Cabarete",
    slug: "dr-jazz-festival",
    event_type: "Música & Festivales",
    province: "Puerto Plata",
    region: "Costa Norte",
    description: `El Dominican Republic Jazz Festival es el evento de jazz al aire libre más prestigioso del Caribe. Durante tres noches mágicas a la orilla del mar, virtuosos exponentes internacionales y dominicanos del jazz latino, contemporáneo y fusión ofrecen conciertos gratuitos y galas de beneficencia bajo el cielo estrellado de Playa Cabarete.

Además de los conciertos principales, el festival ofrece clases magistrales gratuitas para jóvenes músicos a través de la Fundación FEDUJAZZ, promoviendo la educación artística en las comunidades de la costa norte dominicana.`,
    short_description: "Noches de jazz de clase mundial sobre la arena dorada de Playa Cabarete.",
    image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop&q=80"
    ],
    start_date: "2026-11-06",
    end_date: "2026-11-08",
    start_time: "19:00",
    end_time: "00:00",
    venue: "Escenario Principal Playa Cabarete",
    address: "Playa Cabarete, Puerto Plata, República Dominicana",
    coordinates: { lat: 19.7505, lng: -70.4077 },
    price_range: "Entrada General Libre / Área VIP Donación FEDUJAZZ US$ 100",
    ticket_url: "https://drjazzfestival.com",
    organizer: "Fundación Educativa FEDUJAZZ & Ministerio de Turismo",
    is_recurring: true,
    recurrence_pattern: "Anual - Noviembre",
    is_featured: true,
    expected_attendees: "15,000 amantes del jazz",
    agenda: [
      { hora: "02:00 PM", titulo: "Talleres y Masterclasses Gratuitas FEDUJAZZ", desc: "Clínicas musicales con profesores del Berklee College of Music." },
      { hora: "07:30 PM", titulo: "Apertura con Ensambles Juveniles Dominicanos", desc: "Presentación de los talentos emergentes de la costa norte." },
      { hora: "09:00 PM", titulo: "Conciertos Estelares de Jazz Latino & Grammys", desc: "Presentaciones estelares frente al mar." }
    ],
    tips: {
      dressCode: "Estilo playero chic / casual elegante. Calzado adecuado para caminar en la arena.",
      parking: "Estacionamiento disponible a lo largo de la vía principal de Cabarete.",
      familyFriendly: "Ambiente muy seguro y amigable para familias y melómanos de todas las edades.",
      gastronomy: "Bares y restaurantes frente a la playa con mariscos frescos y cócteles tropicales."
    }
  },
  {
    id: "3",
    name: "Festival Presidente de Música Latina",
    slug: "festival-presidente",
    event_type: "Macro Concierto",
    province: "Santo Domingo",
    region: "Distrito Nacional",
    description: `El Festival Presidente es el espectáculo musical más grande y multitudinario de todo el Caribe. Producido por la Cervecería Nacional Dominicana en el icónico Estadio Olímpico Félix Sánchez, reúne durante tres días consecutivos a las superestrellas más grandes de la música latina e internacional frente a más de 50,000 personas por noche.

Desde reggaetón, pop latino, merengue y bachata hasta salsa y música electrónica, el festival ofrece una experiencia inmersiva con tecnología visual de última generación, zonas gastronómicas y activaciones exclusivas.`,
    short_description: "El mega festival más emblemático del Caribe en el Estadio Olímpico de Santo Domingo.",
    image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=800&fit=crop&q=80"
    ],
    start_date: "2026-11-20",
    end_date: "2026-11-22",
    start_time: "17:00",
    end_time: "02:00",
    venue: "Estadio Olímpico Félix Sánchez",
    address: "Av. 27 de Febrero esq. Máximo Gómez, Santo Domingo, RD",
    coordinates: { lat: 18.4795, lng: -69.9192 },
    price_range: "RD$ 3,500 - RD$ 18,000",
    ticket_url: "https://presidente.com.do",
    organizer: "Cervecería Nacional Dominicana",
    is_recurring: true,
    recurrence_pattern: "Edición Especial",
    is_featured: true,
    expected_attendees: "150,000+ espectadores",
    agenda: [
      { hora: "05:00 PM", titulo: "Apertura de Puertas & Experiencia Fan Village", desc: "Zonas interactivas, food trucks y DJs invitados." },
      { hora: "07:00 PM", titulo: "Artistas Nacionales de Apertura", desc: "Lo mejor del merengue, bachata y talento criollo." },
      { hora: "09:30 PM", titulo: "Headliners Internacionales", desc: "Conciertos estelares con show de luces y pirotecnia." }
    ],
    tips: {
      dressCode: "Ropa fresca y calzado cómodo. Se recomienda usar transporte público (Metro L1/L2).",
      parking: "Uso recomendado del Metro de Santo Domingo (Estación Juan Bosch / Casandra Damirón).",
      familyFriendly: "Para mayores de 18 años en áreas de venta de bebidas alcohólicas.",
      gastronomy: "Gran patio de comidas con más de 30 restaurantes y cervezas Presidente bien frías."
    }
  },
  {
    id: "4",
    name: "Feria Gastronómica Santo Domingo",
    slug: "feria-gastronomica-sd",
    event_type: "Gastronomía",
    province: "Santo Domingo",
    region: "Distrito Nacional",
    description: `La Feria Gastronómica es la gran fiesta del sabor dominicano que reúne a los chefs más laureados del país, restaurantes de alta cocina, productores artesanales de cacao, café, queso y ron, junto a cocineros tradicionales de las 32 provincias.

Durante tres días se desarrollan talleres de cocina en vivo, catas maridadas, concursos culinarios y degustaciones de la rica herencia gastronómica taína, española y afrocaribeña.`,
    short_description: "Sabores auténticos, cocina de autor y productos autóctonos en la capital gastronómica del Caribe.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&q=80"
    ],
    start_date: "2026-10-15",
    end_date: "2026-10-18",
    start_time: "10:00",
    end_time: "22:00",
    venue: "Centro de Convenciones Sans Soucí",
    address: "Av. España, Puerto de Santo Domingo Este, RD",
    coordinates: { lat: 18.4735, lng: -69.8789 },
    price_range: "RD$ 600 (Incluye copa de degustación)",
    ticket_url: "https://saboresdominicanos.org",
    organizer: "Asociación Dominicana de Restaurantes (ADERES)",
    is_recurring: true,
    recurrence_pattern: "Anual - Octubre",
    is_featured: true,
    expected_attendees: "25,000 comensales",
    agenda: [
      { hora: "11:00 AM", titulo: "Masterclass de Cocina Dominicana de Autor", desc: "Demostración culinaria con chefs galardonados." },
      { hora: "03:00 PM", titulo: "Cata Guiada de Rones Premium & Chocolates Orgánicos", desc: "Maridaje con sommeliers certificados." },
      { hora: "07:00 PM", titulo: "Cena de Gala a Cuatro Manos", desc: "Menú degustación de 7 tiempos con ingredientes locales." }
    ],
    tips: {
      dressCode: "Casual caribeño.",
      parking: "Estacionamiento privado vigilado en las instalaciones de Sans Soucí.",
      familyFriendly: "Zonas infantiles con talleres de mini chefs.",
      gastronomy: "Más de 50 estaciones de degustación dulce y salada."
    }
  },
  {
    id: "5",
    name: "Temporada de Avistamiento de Ballenas Jorobadas",
    slug: "avistamiento-ballenas-samana",
    event_type: "Ecoturismo & Naturaleza",
    province: "Samaná",
    region: "Península de Samaná",
    description: `Cada año, entre los meses de enero y marzo, más de 3,000 ballenas jorobadas viajan miles de kilómetros desde el Atlántico Norte hasta las cálidas y protegidas aguas de la Bahía de Samaná y el Banco de la Plata para aparearse y dar a luz a sus crías.

Declarado Santuario de Mamíferos Marinos, es considerado uno de los mejores lugares del planeta para la observación responsable de cetáceos con capitanes certificados por el Ministerio de Medio Ambiente.`,
    short_description: "El mayor espectáculo natural del Caribe en el Santuario de Mamíferos Marinos de Samaná.",
    image_url: "https://images.unsplash.com/photo-1568430467585-4d3080e729a6?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568430467585-4d3080e729a6?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&q=80"
    ],
    start_date: "2026-01-15",
    end_date: "2026-03-31",
    start_time: "08:00",
    end_time: "17:00",
    venue: "Puerto y Bahía de Santa Bárbara de Samaná",
    address: "Malecón de Samaná, Santa Bárbara de Samaná, RD",
    coordinates: { lat: 19.2056, lng: -69.3369 },
    price_range: "Excursión en Catamarán US$ 65 - US$ 95",
    ticket_url: "/actividades",
    organizer: "Ministerio de Medio Ambiente & Guías de Samaná",
    is_recurring: true,
    recurrence_pattern: "Enero a Marzo",
    is_featured: true,
    expected_attendees: "60,000 visitantes ecológicos",
    agenda: [
      { hora: "08:30 AM", titulo: "Embarque en Catamaranes Oficiales", desc: "Charla de biólogos marinos sobre el comportamiento de las ballenas." },
      { hora: "10:00 AM", titulo: "Avistamiento en Bahía Abierta", desc: "Observación de saltos y cantos de cortejo." },
      { hora: "01:00 PM", titulo: "Almuerzo Típico en Cayo Levantado", desc: "Comida caribeña con coco y descanso en playa de arena blanca." }
    ],
    tips: {
      dressCode: "Traje de baño, protector solar biodegradable, lentes oscuros y pastillas antimareo.",
      parking: "Parqueo municipal frente a la marina de Samaná.",
      familyFriendly: "Ideal para todas las edades; chalecos salvavidas obligatorios para niños.",
      gastronomy: "Pescado al coco, camarones y tostones en los quioscos del malecón."
    }
  },
  {
    id: "6",
    name: "Corales Puntacana Championship PGA TOUR",
    slug: "pga-tour-corales",
    event_type: "Deportes de Élite",
    province: "La Altagracia",
    region: "Punta Cana",
    description: `El Corales Puntacana Championship es la única parada oficial del PGA TOUR en la República Dominicana. Disputado en el prestigioso campo de golf Corales diseñado por Tom Fazio, enfrenta a más de 130 golfistas de élite mundial en un recorrido desafiante con espectaculares hoyos frente a los acantilados del Mar Caribe.`,
    short_description: "El torneo de golf profesional más importante del Caribe en el campo Corales PGA.",
    image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=800&fit=crop&q=80"
    ],
    start_date: "2026-04-16",
    end_date: "2026-04-19",
    start_time: "07:00",
    end_time: "18:00",
    venue: "Corales Golf Club - Puntacana Resort & Club",
    address: "Puntacana Resort & Club, Punta Cana, RD",
    coordinates: { lat: 18.5284, lng: -68.3712 },
    price_range: "Pase de Día US$ 35 / Abono Fin de Semana US$ 80",
    ticket_url: "https://puntacana.com/coraleschampionship",
    organizer: "Grupo Puntacana & PGA TOUR",
    is_recurring: true,
    recurrence_pattern: "Anual - Abril",
    is_featured: true,
    expected_attendees: "20,000 espectadores de golf",
    agenda: [
      { hora: "07:00 AM", titulo: "Primeras Salidas al Tee del Hoyo 1 y 10", desc: "Ronda competitiva de golfistas internacionales." },
      { hora: "01:00 PM", titulo: "Paso por el Famoso 'Codo del Diablo' (Hoyos 16, 17 y 18)", desc: "El tramo más emocionante frente a los acantilados marinos." },
      { hora: "05:00 PM", titulo: "Ceremonia de Premiación en el Green del 18", desc: "Entrega del trofeo y sombrero tradicional de campeón." }
    ],
    tips: {
      dressCode: "Código de vestimenta de golf / smart casual. Zapatos deportivos o sin tacos de metal.",
      parking: "Estacionamiento oficial del resort con carritos de golf de cortesía.",
      familyFriendly: "Zonas de hospitalidad y food trucks para toda la familia.",
      gastronomy: "Restaurantes del resort, cócteles de autor y cervezas artesanales."
    }
  }
];

interface EventDetailType {
  id: string;
  name: string;
  slug?: string;
  event_type?: string;
  province?: string;
  region?: string;
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
  coordinates?: { lat: number; lng: number };
  price_range?: string;
  ticket_url?: string | null;
  organizer?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  is_featured?: boolean;
  expected_attendees?: string;
  agenda?: Array<{ hora: string; titulo: string; desc: string }>;
  tips?: {
    dressCode?: string;
    parking?: string;
    familyFriendly?: string;
    gastronomy?: string;
  };
}

export default function EventoDetalle() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const eventIdentifier = slug || id || "carnaval-la-vega";

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isFreeTicketModalOpen, setIsFreeTicketModalOpen] = useState(false);
  const [isRegisterEventModalOpen, setIsRegisterEventModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState("1");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
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
            recurrence_pattern: data.recurrence_pattern
          });
        } else {
          // Fallback al primer evento si no encuentra nada
          setEvent(eventosEstaticosCompletos[0]);
        }
      } catch (err) {
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-DO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event?.name} - Descubre RD`,
          text: event?.short_description || `Conoce los detalles de ${event?.name} en República Dominicana.`,
          url: window.location.href,
        });
        toast.success("¡Enlace compartido!");
      } catch (e) {
        // Cancelado por el usuario
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles 📋");
    }
  };

  const handleToggleFavorite = () => {
    setIsSaved(!isSaved);
    toast.success(
      !isSaved
        ? `⭐ Evento "${event?.name}" guardado en tus favoritos`
        : `Evento eliminado de tus favoritos`
    );
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.short_description || event.description || "");
    const location = encodeURIComponent(`${event.venue || ""}, ${event.address || "República Dominicana"}`);
    const startDate = event.start_date ? event.start_date.replace(/-/g, "") : "20261101";
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}T140000Z/${startDate}T230000Z`;

    window.open(googleCalendarUrl, "_blank", "noopener,noreferrer");
    toast.success("Abriendo Google Calendar...");
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpEmail) {
      toast.error("Por favor completa tu nombre y correo electrónico");
      return;
    }

    setRsvpSubmitted(true);
    awardXp(50, 0, `RSVP a evento: ${event?.name || "evento"}`, "event_rsvp", event?.id);
    toast.success("¡Registro confirmado! Has ganado +50 puntos de explorador 🇩🇴🎉", {
      description: `Te hemos enviado los recordatorios de "${event?.name}" a ${rsvpEmail}.`
    });

    setTimeout(() => {
      setIsRsvpOpen(false);
      setRsvpSubmitted(false);
    }, 1500);
  };

  if (loading) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Skeleton className="h-[420px] w-full rounded-3xl mb-8" />
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-96 w-full rounded-2xl" />
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
        <main className="min-h-screen bg-background pt-28 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-foreground mb-3">Evento no encontrado</h1>
            <p className="text-muted-foreground mb-6">El evento que buscas no existe o ha sido trasladado.</p>
            <Link to="/eventos">
              <Button className="rounded-xl px-6">Ver Calendario de Eventos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const relatedEvents = eventosEstaticosCompletos.filter((e) => e.id !== event.id).slice(0, 3);

  return (
    <PageTransition>
      <SEOHead
        title={`${event.name} | Eventos República Dominicana`}
        description={event.short_description || event.description?.slice(0, 160)}
        image={event.image_url}
      />
      
      <Header />

      <main className="min-h-screen bg-background pt-20">
        
        {/* Hero Banner Section */}
        <section className="relative min-h-[500px] lg:min-h-[560px] flex items-end overflow-hidden">
          {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
          <img
            src={event.image_url || "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&auto=format&fit=crop&q=80"}
            alt={event.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

          {/* Breadcrumbs */}
          <div className="absolute top-6 left-0 right-0 z-20">
            <div className="container mx-auto px-4 lg:px-8">
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit border border-white/10">
                <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to="/eventos" className="hover:text-primary transition-colors">Eventos & Festivales</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-white font-medium truncate max-w-[200px]">{event.name}</span>
              </nav>
            </div>
          </div>

          {/* Hero Content Overlay */}
          <div className="container mx-auto px-4 lg:px-8 pb-10 relative z-10 text-white w-full">
            <div className="max-w-4xl space-y-4">
              
              <div className="flex flex-wrap items-center gap-2">
                {event.event_type && (
                  <Badge className="bg-primary text-slate-950 font-extrabold text-xs px-3 py-1 shadow-md">
                    {event.event_type}
                  </Badge>
                )}
                {event.province && (
                  <Badge variant="outline" className="bg-white/15 text-white border-white/30 backdrop-blur-md text-xs px-3 py-1 gap-1">
                    <MapPin className="h-3 w-3 text-amber-400" />
                    {event.province} • {event.region}
                  </Badge>
                )}
                {event.is_featured && (
                  <Badge className="bg-amber-500 text-slate-950 font-bold text-xs gap-1 px-3 py-1">
                    <Sparkles className="h-3 w-3" /> Evento Destacado
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                {event.name}
              </h1>

              {event.short_description && (
                <p className="text-base sm:text-xl text-slate-200/95 max-w-3xl leading-relaxed drop-shadow-md">
                  {event.short_description}
                </p>
              )}

              {/* Quick Info Strip */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span className="capitalize">{formatDate(event.start_date)}</span>
                </div>
                {event.start_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>{formatTime(event.start_time)} {event.end_time && `- ${formatTime(event.end_time)}`}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.venue}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Live Event Countdown Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-primary/20 to-slate-900 border-y border-border/60 py-4">
          <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Cuenta Regresiva para el Evento:</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 text-center">
              <div className="bg-card/80 border border-border/80 px-3 py-1.5 rounded-xl shadow-xs min-w-[55px]">
                <span className="font-mono text-lg font-black text-primary">{countdown.days}</span>
                <span className="block text-[10px] text-muted-foreground uppercase font-medium">Días</span>
              </div>
              <span className="font-bold text-muted-foreground">:</span>
              <div className="bg-card/80 border border-border/80 px-3 py-1.5 rounded-xl shadow-xs min-w-[55px]">
                <span className="font-mono text-lg font-black text-primary">{countdown.hours}</span>
                <span className="block text-[10px] text-muted-foreground uppercase font-medium">Horas</span>
              </div>
              <span className="font-bold text-muted-foreground">:</span>
              <div className="bg-card/80 border border-border/80 px-3 py-1.5 rounded-xl shadow-xs min-w-[55px]">
                <span className="font-mono text-lg font-black text-primary">{countdown.minutes}</span>
                <span className="block text-[10px] text-muted-foreground uppercase font-medium">Min</span>
              </div>
              <span className="font-bold text-muted-foreground">:</span>
              <div className="bg-card/80 border border-border/80 px-3 py-1.5 rounded-xl shadow-xs min-w-[55px]">
                <span className="font-mono text-lg font-black text-primary">{countdown.seconds}</span>
                <span className="block text-[10px] text-muted-foreground uppercase font-medium">Seg</span>
              </div>
            </div>

            <Button 
              size="sm" 
              onClick={() => {
                const isFree = !event.ticket_url || event.price_range?.toLowerCase().includes("gratis") || event.price_range?.toLowerCase().includes("libre");
                if (isFree) {
                  setIsFreeTicketModalOpen(true);
                } else {
                  setIsRsvpOpen(true);
                }
              }}
              className="bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl gap-1.5 shadow-md shadow-primary/20"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>
                {!event.ticket_url || event.price_range?.toLowerCase().includes("gratis") || event.price_range?.toLowerCase().includes("libre")
                  ? "Entrada Gratis (Pase QR)"
                  : "RSVP & Ganar +50 Pts"}
              </span>
            </Button>
          </div>
        </section>

        {/* Main Content & Sidebar Layout */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Content Column (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Description & Overview */}
                <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Acerca de este Evento
                      </h2>
                      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4 text-base">
                        {event.description?.split("\n\n").map((par, i) => (
                          <p key={i}>{par}</p>
                        ))}
                      </div>
                    </div>

                    {event.expected_attendees && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground">
                        <Users className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm font-medium">
                          <strong>Afluencia estimada:</strong> {event.expected_attendees}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Agenda / Schedule Breakdown */}
                {event.agenda && event.agenda.length > 0 && (
                  <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
                    <CardContent className="p-6 sm:p-8">
                      <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Programa de Actividades & Horarios
                      </h2>

                      <div className="relative border-l-2 border-primary/30 ml-3 space-y-6 pl-6">
                        {event.agenda.map((item, idx) => (
                          <div key={idx} className="relative group">
                            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-xs group-hover:scale-125 transition-transform" />
                            <span className="inline-block font-mono font-bold text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full mb-1">
                              {item.hora}
                            </span>
                            <h3 className="font-display font-bold text-lg text-foreground">{item.titulo}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Practical Tips & Attendees Guide */}
                {event.tips && (
                  <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
                    <CardContent className="p-6 sm:p-8">
                      <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        Guía Práctica para Asistentes
                      </h2>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {event.tips.dressCode && (
                          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                              <Shirt className="h-4 w-4 text-primary" />
                              <span>Vestimenta Sugerida</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{event.tips.dressCode}</p>
                          </div>
                        )}

                        {event.tips.parking && (
                          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                              <Car className="h-4 w-4 text-primary" />
                              <span>Parqueos & Movilidad</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{event.tips.parking}</p>
                          </div>
                        )}

                        {event.tips.familyFriendly && (
                          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span>Seguridad & Familias</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{event.tips.familyFriendly}</p>
                          </div>
                        )}

                        {event.tips.gastronomy && (
                          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                              <Utensils className="h-4 w-4 text-primary" />
                              <span>Oferta Gastronómica</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{event.tips.gastronomy}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Location & Interactive Route Map */}
                <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Ubicación y Cómo Llegar
                    </h2>

                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-foreground text-base">{event.venue}</h4>
                        <p className="text-sm text-muted-foreground">{event.address}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${event.venue || ""} ${event.address || ""}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold">
                            <Navigation className="h-3.5 w-3.5 text-primary" />
                            Google Maps
                          </Button>
                        </a>
                        <a
                          href={`https://waze.com/ul?q=${encodeURIComponent(`${event.venue || ""} ${event.address || ""}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold">
                            <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                            Waze
                          </Button>
                        </a>
                      </div>
                    </div>

                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border/60 relative bg-muted flex items-center justify-center">
                      <iframe
                        title={`Mapa de ubicación para ${event.name}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          `${event.venue || ""} ${event.address || "Republica Dominicana"}`
                        )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Gallery */}
                {event.gallery && event.gallery.length > 0 && (
                  <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
                    <CardContent className="p-6 sm:p-8">
                      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Galería Fotográfica Oficial</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {event.gallery.map((img, i) => (
                          <div key={i} className="aspect-video rounded-2xl overflow-hidden group relative border border-border/50">
                            <img
                              src={img}
                              alt={`${event.name} foto ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* Sticky Sidebar Column (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Main Action & Booking Card */}
                <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card sticky top-24">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    
                    {/* Price Range */}
                    <div className="pb-4 border-b border-border/80 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Acceso / Entradas</span>
                      <span className="text-lg sm:text-xl font-extrabold text-foreground">{event.price_range}</span>
                    </div>

                    {/* Primary CTA Buttons */}
                    <div className="space-y-3">
                      {/* If event is free or has free access */}
                      {(!event.ticket_url || event.price_range?.toLowerCase().includes("gratis") || event.price_range?.toLowerCase().includes("libre")) ? (
                        <Button 
                          onClick={() => setIsFreeTicketModalOpen(true)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-xl text-sm shadow-lg shadow-emerald-600/25 gap-2"
                        >
                          <Ticket className="h-5 w-5 text-emerald-200" />
                          <span>Obtener Entrada Gratis (Pase QR)</span>
                        </Button>
                      ) : null}

                      {/* If event has paid tickets / VIP website */}
                      {event.ticket_url ? (
                        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                          <Button 
                            variant={(!event.price_range?.toLowerCase().includes("gratis") && !event.price_range?.toLowerCase().includes("libre")) ? "default" : "outline"}
                            className={`w-full font-extrabold h-12 rounded-xl text-sm shadow-md gap-2 ${
                              (!event.price_range?.toLowerCase().includes("gratis") && !event.price_range?.toLowerCase().includes("libre"))
                                ? "bg-primary hover:bg-primary/90 text-slate-950 shadow-primary/20"
                                : "border-border/80"
                            }`}
                          >
                            <Ticket className="h-4 w-4" />
                            <span>Comprar Entradas VIP / Taquillas</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                          </Button>
                        </a>
                      ) : null}

                      <Button 
                        onClick={() => setIsRsvpOpen(true)}
                        variant="outline"
                        className="w-full font-bold h-11 rounded-xl text-xs gap-2 border-border/80"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Confirmar Asistencia (RSVP)</span>
                      </Button>

                      <Button 
                        onClick={handleAddToCalendar}
                        variant="outline"
                        className="w-full rounded-xl h-11 text-xs font-semibold gap-2 border-border/80"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Añadir a Google Calendar / iCal</span>
                      </Button>
                    </div>

                    {/* Quick Utility Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={handleToggleFavorite}
                        className={`rounded-xl h-10 text-xs font-semibold gap-1.5 ${
                          isSaved ? "border-amber-400 text-amber-400 bg-amber-400/10" : ""
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isSaved ? "fill-amber-400 text-amber-400" : ""}`} />
                        <span>{isSaved ? "Guardado" : "Guardar"}</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="rounded-xl h-10 text-xs font-semibold gap-1.5"
                      >
                        <Share2 className="h-4 w-4 text-primary" />
                        <span>Compartir</span>
                      </Button>
                    </div>

                    {/* Organizer & Official Seal */}
                    {event.organizer && (
                      <div className="pt-4 border-t border-border/80 text-xs space-y-1.5 text-muted-foreground">
                        <span className="block uppercase font-bold text-[10px] tracking-wider text-primary">Organizado por</span>
                        <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-amber-400" />
                          {event.organizer}
                        </p>
                      </div>
                    )}

                    {/* B2B Event Submission Link */}
                    <div className="pt-3 border-t border-border/70 text-center">
                      <button
                        type="button"
                        onClick={() => setIsRegisterEventModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
                      >
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>¿Organizas un evento? Publícalo aquí</span>
                      </button>
                    </div>

                  </CardContent>
                </Card>

                {/* Industry Promo Sidebar Ad */}
                <DetailPageSidebarAd showDemo />

              </div>

            </div>
          </div>
        </section>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <section className="py-16 bg-secondary/30 border-t border-border/60">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    Otros Eventos Imperdibles en RD
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Explora la agenda cultural, festivales y deportes del país.</p>
                </div>
                <Link to="/eventos">
                  <Button variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold">
                    <span>Ver Todos</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {relatedEvents.map((item) => (
                  <Link
                    key={item.id}
                    to={`/evento/${item.slug}`}
                    className="group block rounded-3xl overflow-hidden bg-card border border-border/70 hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-white/20 text-[10px]">
                          {item.event_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(item.start_date)}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.short_description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pre-Footer Presidente Banner */}
        <PreFooterPresidenteBanner />

      </main>

      {/* RSVP Modal with Gamification Points */}
      <Dialog open={isRsvpOpen} onOpenChange={setIsRsvpOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              Confirmar Asistencia (RSVP)
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Regístrate para recibir recordatorios exclusivos y gana <strong>+50 Puntos de Explorador RD</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRsvpSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rsvp-name" className="text-xs font-semibold">Nombre Completo</Label>
              <Input
                id="rsvp-name"
                placeholder="Ej. Juan Pérez"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rsvp-email" className="text-xs font-semibold">Correo Electrónico</Label>
              <Input
                id="rsvp-email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={rsvpEmail}
                onChange={(e) => setRsvpEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rsvp-guests" className="text-xs font-semibold">Número de Acompañantes</Label>
              <Input
                id="rsvp-guests"
                type="number"
                min="1"
                max="10"
                value={rsvpGuests}
                onChange={(e) => setRsvpGuests(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Recibirás una insignia digital en tu Pasaporte Turístico.</span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={rsvpSubmitted}
                className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl h-11"
              >
                {rsvpSubmitted ? "¡Confirmando...!" : "Confirmar Mi Registro (+50 Pts)"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileStickyFooterAd />

      {/* Free Ticket QR Pass Modal */}
      {event && (
        <FreeTicketModal
          open={isFreeTicketModalOpen}
          onClose={() => setIsFreeTicketModalOpen(false)}
          event={event}
        />
      )}

      {/* Registro Evento Modal Dialog */}
      <RegistroEventoModal 
        open={isRegisterEventModalOpen} 
        onClose={() => setIsRegisterEventModalOpen(false)} 
      />
    </PageTransition>
  );
}
