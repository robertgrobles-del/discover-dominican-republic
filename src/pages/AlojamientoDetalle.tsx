import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  Star, MapPin, Share2, ChevronRight, Waves, Dumbbell, Wifi, Car, Utensils,
  Coffee, Phone, Check, AirVent, Bath, Tv, Bike, Music, Umbrella,
  PartyPopper, Anchor, Users, CreditCard, Baby, PawPrint,
  Sailboat, CircleDot, Globe, Wine, UtensilsCrossed, Loader2, ExternalLink,
  Bed, TreePine, Gem, Heart, ShieldCheck, Clock, Calendar, CheckCircle2,
  HelpCircle, ChevronDown, ChevronUp, Plane, Info, MessageSquare,
  Crown, Award, HeartPulse, Disc, Flame
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AccommodationGallery } from "@/components/AccommodationGallery";
import { DetailPageSidebarAd, MobileStickyFooterAd, InlineAd, PanoramaAd } from "@/components/promo";
import { SEOHead } from "@/components/SEOHead";
import { AccommodationRooms } from "@/components/accommodation/AccommodationRooms";
import { AccommodationPolicies } from "@/components/accommodation/AccommodationPolicies";
import { HotelHeroSlider } from "@/components/hotel/HotelHeroSlider";
import { getHotelBySlug, Hotel as StaticHotel } from "@/data/hotels";
import { getRestaurantsByDestination } from "@/data/restaurants";
import { getExperiencesByDestination } from "@/data/experiences";
import { toast } from "sonner";

import hotelEdenRocImg from "@/assets/hotel-eden-roc.jpg";
import hotelRoomSuiteImg from "@/assets/hotel-room-suite.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const fallbackImages = [hotelEdenRocImg, hotelRoomSuiteImg, heroBeachImg, puntaCanaImg, laRomanaImg];

// ─── Amenity icon mapping ───
const amenityIcons: Record<string, typeof Waves> = {
  "Piscina": Waves, "Piscinas": Waves, "Piscina infinita": Waves, "Piscina infinity": Waves,
  "Piscinas infinitas": Waves, "Múltiples piscinas": Waves, "Piscina rooftop": Waves,
  "5 piscinas": Waves, "6 piscinas": Waves, "4 piscinas": Waves,
  "Spa": HeartPulse, "Spa de lujo": HeartPulse, "Spa premiado": HeartPulse,
  "Gimnasio": Dumbbell, "Gimnasio 24/7": Dumbbell,
  "Wifi": Wifi, "Wifi gratuito": Wifi, "Wifi de Alta Velocidad": Wifi,
  "Golf": CircleDot, "3 campos de golf": CircleDot,
  "Casino": Gem, "Kids Club": Baby, "Yoga": TreePine,
  "Playa privada": Umbrella, "Playa": Umbrella, "Playa Dorada": Umbrella,
  "Playa Juanillo": Umbrella, "Playa Dominicus": Umbrella, "Playa Minitas": Umbrella,
  "Deportes acuáticos": Anchor, "Deportes": Anchor,
  "Restaurante": Utensils, "Restaurante gourmet": Utensils, "Restaurante orgánico": Utensils,
  "Múltiples restaurantes": Utensils, "Restaurantes gourmet": Utensils,
  "Restaurantes temáticos": Utensils, "10 restaurantes": Utensils,
  "9 restaurantes": Utensils, "7 restaurantes": Utensils, "6 restaurantes": Utensils,
  "Bares": Coffee, "Múltiples bares": Coffee, "Bar de coctelería": Coffee, "5 bares": Coffee,
  "Room service 24h": Car, "Butler service": Star, "Concierge": Star,
  "Parking": Car, "Parking Valet": Car, "Parking gratis": Car,
  "Marina": Sailboat, "Polo": CircleDot, "Tours históricos": Globe,
  "Tours personalizados": Globe, "Tour de café": Coffee,
  "Rafting": Waves, "Canyoning": TreePine, "Senderismo": TreePine,
  "Cabalgatas": Bike, "Buceo": Anchor, "Centro de buceo": Anchor,
  "Villas privadas": Bed, "Suites con jacuzzi": Bath,
  "Tiro al plato": CircleDot, "Junto al río": Waves,
  "Cabañas privadas": Bed, "Shows nocturnos": Music, "Shows": Music,
  "Teatro": Music, "Discoteca": Disc, "Pool parties": PartyPopper,
  "DJs residentes": Disc, "Star Camp (kids)": Baby,
  "Solo adultos": Heart, "Lounge de cigarros": Coffee,
  "Vista al mar": Waves, "Vista al río": Waves,
  "Centro de negocios": Globe, "Salones de eventos": Users,
  "Tours de ballenas": Anchor, "Vistas al valle": TreePine,
  "Edificio histórico": Globe, "Altos de Chavón": Globe,
};

function getAmenityIcon(amenity: string) {
  return amenityIcons[amenity] || Check;
}

// ─── Generate category-based data ───
function getCategoryLabel(cat: string) {
  const labels: Record<string, string> = {
    "resort": "Resort de Lujo", "boutique": "Hotel Boutique", "all-inclusive": "Todo Incluido Premium",
    "business": "Business & Confort", "eco-lodge": "Eco-Lodge & Naturaleza",
  };
  return labels[cat] || cat;
}

function generatePolicies(hotel: StaticHotel | null) {
  const isAdultsOnly = hotel?.amenities?.some(a => a.toLowerCase().includes("solo adultos"));
  return {
    checkIn: "3:00 PM (15:00)",
    checkOut: "12:00 PM (Mediodía)",
    cancellation: "Cancelación 100% gratuita hasta 48 horas antes de la llegada.",
    children: isAdultsOnly ? "Exclusivo para adultos mayores de 18 años. Ambiente de total tranquilidad y privacidad." : "Familia amigable. Cunas disponibles bajo solicitud previa y acceso al club infantil.",
    pets: "Se admiten mascotas de hasta 10kg en habitaciones designadas (pueden aplicar cargos adicionales).",
    deposit: "Se requiere un depósito reembolsable en tarjeta de crédito al momento del check-in para gastos incidentales.",
    transfers: "Servicio de traslado privado aeropuerto-hotel disponible las 24 horas con reservación previa.",
    paymentMethods: ["Visa", "Mastercard", "American Express", "Apple Pay", "Efectivo USD/DOP"],
  };
}

function generateRooms(hotel: StaticHotel | null) {
  const priceBase = hotel?.priceRange === '$$$$$' ? 650 : hotel?.priceRange === '$$$$' ? 420 : hotel?.priceRange === '$$$' ? 260 : hotel?.priceRange === '$$' ? 140 : 85;
  return [
    { 
      id: "deluxe",
      name: "Habitación Deluxe Garden View", 
      size: "42 m²", 
      view: "Vista a Jardines Tropicales", 
      bed: "1 Cama King o 2 Queen", 
      capacity: "2-3 Adultos",
      amenities: ["A/C Climatizado", "Smart TV 55\"", "Minibar Incluido", "WiFi 6", "Balcón Privado", "Cafetera Nespresso"], 
      price: priceBase, 
      breakfast: true, 
      image: hotelRoomSuiteImg, 
      description: "Elegante habitación con mobiliario contemporáneo en maderas nobles, terraza privada amueblada y baño de mármol con ducha tipo lluvia." 
    },
    { 
      id: "ocean-suite",
      name: "Master Suite Frente al Mar", 
      size: "68 m²", 
      view: "Vista Frontal al Mar Caribe", 
      bed: "1 Cama King Plush", 
      capacity: "2 Adultos",
      amenities: ["Vista Mar Directa", "Bañera de Hidromasaje", "Minibar Premium", "Room Service 24h", "Terraza con Camastros"], 
      price: Math.round(priceBase * 1.55), 
      breakfast: true, 
      image: heroBeachImg, 
      description: "Amplia suite con salón independiente, balcón panorámico con vistas directas al mar turquesa y amenidades de baño de diseñador." 
    },
    { 
      id: "presidential-villa",
      name: "Villa Presidencial con Piscina Privada", 
      size: "140 m²", 
      view: "Vista Panorámica al Océano", 
      bed: "2 Camas King + Sala", 
      capacity: "4-5 Personas",
      amenities: ["Piscina Infinity Privada", "Mayordomo (Butler) 24h", "Bar Abierto de Lujo", "Parrilla BBQ", "Acceso VIP"], 
      price: Math.round(priceBase * 2.8), 
      breakfast: true, 
      image: puntaCanaImg, 
      description: "Máxima exclusividad caribeña: residencia de doble nivel con piscina plunge privada, comedor exterior y servicio de mayordomo personalizado." 
    },
  ];
}

function generateRestaurants(hotel: StaticHotel | null) {
  return [
    { 
      name: "El Palmar Buffet Internacional & Show Cooking", 
      cuisine: "Internacional & Caribeña", 
      hours: "07:00 - 11:00 / 12:30 - 16:00 / 18:30 - 22:30", 
      description: "Estaciones gourmet en vivo con cortes a la parrilla, pastas frescas, mariscos locales, panadería artesanal y opciones sin gluten.", 
      dressCode: "Casual", 
      reservations: false,
      tag: "Buffet Todo Incluido"
    },
    { 
      name: "La Cava de Autor", 
      cuisine: "Fusión Mediterránea & Alta Cocina", 
      hours: "18:30 - 23:00", 
      description: "Propuesta de alta cocina con maridajes guiados por sommelier y una selecta bodega de más de 300 etiquetas de vino.", 
      dressCode: "Elegante / Smart Casual", 
      reservations: true,
      tag: "Cena a la Carta"
    },
    { 
      name: "Breeze Beach Club & Raw Bar", 
      cuisine: "Mariscos, Ceviches & Grill de Playa", 
      hours: "11:00 - 18:30", 
      description: "Ubicado directamente sobre la arena: langosta a la brasa, tiraditos, aguachiles y cócteles tropicales con vista al mar.", 
      dressCode: "Casual de Playa", 
      reservations: false,
      tag: "Frente al Mar"
    },
    {
      name: "Samurai Teppanyaki & Sushi Bar",
      cuisine: "Cocina Japonesa & Asiática",
      hours: "18:30 - 22:30",
      description: "Mesas teppanyaki interactivas con show cooking de chefs, rollos de autor, tempuras y gyozas al vapor.",
      dressCode: "Casual Elegante",
      reservations: true,
      tag: "Especialidad Asiática"
    },
    {
      name: "Trattoria Bella Italia",
      cuisine: "Cocina Italiana Tradicional",
      hours: "18:30 - 22:30",
      description: "Pizzas al horno de leña, risottos cremosos, carpaccios y pastas frescas con salsas tradicionales italianas.",
      dressCode: "Casual",
      reservations: false,
      tag: "Italiano"
    },
    {
      name: "Fuego Criollo Dominican Grill",
      cuisine: "Gastronomía Dominicana Contemporánea",
      hours: "19:00 - 23:00",
      description: "Sabores auténticos de la isla reinterpretados: chivo liniero confitado, sancocho de mariscos y mofongo gourmet.",
      dressCode: "Casual Elegante",
      reservations: true,
      tag: "Sabores Locales"
    }
  ];
}

function generateBars(hotel: StaticHotel | null) {
  return [
    { 
      name: "Sky Lounge & Cocktail Rooftop", 
      type: "Mixología en Azotea", 
      hours: "17:00 - 01:00", 
      description: "Terraza panorámica con vistas al atardecer, cócteles de autor con rones añejos dominicanos y música chillout.", 
      specialty: "Ron Punch Infusionado & Mamajuana Signature" 
    },
    { 
      name: "Swim-up Oasis Wet Bar", 
      type: "Bar Acuático en Piscina", 
      hours: "10:00 - 18:00", 
      description: "Bebidas heladas, frappés naturales, cervezas locales y piñas coladas servidas dentro de la piscina infinita.", 
      specialty: "Piña Colada en Coco Natural" 
    },
    {
      name: "Lobby Bar & Rum Experience",
      type: "Lobby & Degustación",
      hours: "09:00 - 00:00",
      description: "Elegante salón central con piano en vivo y catas dirigidas de los mejores rones dominicanos.",
      specialty: "Old Fashioned con Ron Dominicano"
    },
    {
      name: "Coco Beach Bar",
      type: "Bar de Playa",
      hours: "10:00 - 19:00",
      description: "Kiosco rústico en la arena sirviendo cocos fríos, mojitos de maracuyá y snacks ligeros.",
      specialty: "Coco Loco & Mojito Caribeño"
    },
    {
      name: "Sports Bar & Lounge 24 Horas",
      type: "Sports Bar 24h",
      hours: "24 Horas (Todo Incluido)",
      description: "Retransmisión de partidos en vivo, mesas de billar y servicio ininterrumpido de snacks calientes.",
      specialty: "Cerveza Presidente Helada & Snacks"
    }
  ];
}

function generateNightlife(hotel: StaticHotel | null) {
  return [
    {
      name: "Discoteca & Club 'Neon Caribe'",
      type: "Discoteca & Nightclub",
      hours: "22:30 - 03:00 AM",
      description: "Sonido de alta fidelidad, iluminación robótica, DJs residentes, barra libre de cócteles premium y ritmos latinos e internacionales.",
      dressCode: "Elegante Casual (+18)"
    },
    {
      name: "Teatro Principal & Gran Escenario",
      type: "Shows en Vivo & Musicales",
      hours: "21:00 - 22:30",
      description: "Producciones escénicas diarias, tributos musicales internacionales, ballet folclórico dominicano y noches de circo caribeño.",
      dressCode: "Casual"
    },
    {
      name: "Fiestas Temáticas & Beach Party",
      type: "Fiestas en la Playa",
      hours: "Noches Semanales",
      description: "Fogata en la arena, Fiesta Blanca (White Party), orquesta de merengue en directo y estaciones de comida nocturna.",
      dressCode: "White / Tropical"
    }
  ];
}

function generateSpa(hotel: StaticHotel | null) {
  return {
    name: "Sanctuary Spa & Centro de Bienestar",
    size: "1,800 m² de Instalaciones",
    facilities: [
      { name: "Circuito Hidrotermal", desc: "Piscina de contrastes frío/calor, cascadas cervicales y camas de hidromasaje." },
      { name: "Sauna Finlandés & Baño de Vapor", desc: "Aromaterapia con eucalipto silvestre y cromoterapia relajante." },
      { name: "Cabinas de Masaje frente al Mar", desc: "Palapas privadas sobre la arena con brisa marina y sonido de olas." },
      { name: "Tratamientos Autóctonos", desc: "Envolturas corporales con cacao orgánico dominicano y sales minerales de Montecristi." },
      { name: "Salón de Belleza & Estética", desc: "Manicura spa, peinados para ocasiones especiales y tratamientos faciales antiedad." }
    ],
    schedule: "08:00 AM - 20:00 PM",
    bookingPolicy: "Reservación recomendada en recepción del Spa"
  };
}

function generatePools(hotel: StaticHotel | null) {
  return [
    {
      name: "Piscina Infinity Panorámica Oceanfront",
      type: "Frente al Mar",
      depth: "1.20m - 1.60m",
      features: "Efecto infinito sobre el Mar Caribe, camas balinesas sumergidas y servicio de toallas premium.",
      vibe: "Vistas & Relajación"
    },
    {
      name: "Piscina Laguna Central con Bar Acuático",
      type: "Piscina Central",
      depth: "1.40m",
      features: "Swim-up wet bar, hidromasaje integrado y actividades de aquagym diurnas.",
      vibe: "Animación & Cócteles"
    },
    {
      name: "Piscina Oasis 'Solo Adultos' (Zen Pool)",
      type: "Solo Adultos",
      depth: "1.30m",
      features: "Ambiente de máxima serenidad, tumbonas acolchadas privadas y menú de aguas aromatizadas.",
      vibe: "Tranquilidad Total"
    },
    {
      name: "Parque Acuático Splash con Toboganes",
      type: "Familiar & Niños",
      depth: "0.30m - 0.60m",
      features: "Toboganes acuáticos, juegos interactivos de agua y socorristas certificados.",
      vibe: "Diversión Familiar"
    },
    {
      name: "Piscina de Hidroterapia & Jacuzzis",
      type: "Spa & Termal",
      depth: "1.00m",
      features: "Cuellos de cisne, cascadas de agua tibia e hidrojets para relajación muscular profunda.",
      vibe: "Bienestar Terapéutico"
    }
  ];
}

const faqsData = [
  {
    q: "¿A qué distancia está el hotel del aeropuerto más cercano?",
    a: "El alojamiento cuenta con servicio de transfer privado coordinable con anticipación. El tiempo estimado de traslado oscila entre 15 y 30 minutos dependiendo de la ubicación del destino."
  },
  {
    q: "¿Qué incluye la tarifa de hospedaje?",
    a: "Todas las tarifas reservadas a través de nuestro portal incluyen desayuno gourmet diario, acceso a piscinas, Wi-Fi de alta velocidad en todo el complejo, toallas de playa y uso del gimnasio."
  },
  {
    q: "¿Cuáles son las condiciones de cancelación?",
    a: "Ofrecemos cancelación sin penalidad hasta 48 horas antes del check-in. Para cancelaciones posteriores se cobrará la primera noche de estancia."
  },
  {
    q: "¿Tienen opciones gastronómicas para dietas especiales?",
    a: "Sí, todos los restaurantes del complejo disponen de menús adaptados para comensales celíacos (sin gluten), vegetarianos, veganos o con alergias alimentarias señalizadas."
  }
];

export default function AlojamientoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug;
  
  // Date state (default: next week)
  const today = new Date();
  const defaultCheckIn = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
  const defaultCheckOut = new Date(today.setDate(today.getDate() + 4)).toISOString().split('T')[0];
  
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(2);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [dbHotel, setDbHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Look up static data first
  const staticHotel = id ? getHotelBySlug(id) : undefined;

  useEffect(() => {
    async function fetchHotel() {
      if (!id) { setLoading(false); return; }
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(id);
        const query = supabase.from("hotels").select("*, destinations(name, slug)");
        if (isUuid) {
          query.or(`slug.eq.${id},id.eq.${id}`);
        } else {
          query.eq("slug", id);
        }
        const { data } = await query.maybeSingle();
        setDbHotel(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchHotel();
  }, [id]);

  // Merge data
  const hotelName = staticHotel?.name || dbHotel?.name || "Hotel";
  const hotelLocation = staticHotel ? `${staticHotel.destinationName}, ${staticHotel.province}` : dbHotel?.address || dbHotel?.destinations?.name || "";
  const hotelRating = staticHotel?.rating || dbHotel?.rating || 4.8;
  const hotelReviews = staticHotel?.reviewCount || dbHotel?.review_count || 1240;
  const hotelDescription = staticHotel?.description || dbHotel?.description || "";
  const hotelShortDesc = staticHotel?.shortDescription || dbHotel?.short_description || "";
  const hotelStars = staticHotel?.stars || dbHotel?.stars || 5;
  const hotelCategory = staticHotel?.category || dbHotel?.category || "resort";
  const hotelAmenities = staticHotel?.amenities || (dbHotel?.amenities as string[]) || [
    "Piscina infinita", "Playa privada", "Spa de lujo", "Wifi gratuito", "Restaurantes gourmet", "Gimnasio 24/7", "Room service 24h"
  ];
  const hotelPhone = staticHotel?.phone || dbHotel?.phone || "+1 809-555-0199";
  const hotelWebsite = staticHotel?.website || dbHotel?.website || "";
  const hotelAddress = staticHotel?.address || dbHotel?.address || hotelLocation;
  
  const hotelImages = useMemo(() => {
    if (staticHotel?.gallery?.length && staticHotel.gallery[0] !== '/placeholder.svg') return staticHotel.gallery;
    if (dbHotel?.gallery?.length) return dbHotel.gallery;
    if (staticHotel?.imageUrl && staticHotel.imageUrl !== '/placeholder.svg') return [staticHotel.imageUrl, ...fallbackImages.slice(1)];
    if (dbHotel?.image_url) return [dbHotel.image_url, ...fallbackImages.slice(1)];
    return fallbackImages;
  }, [staticHotel, dbHotel]);

  const province = staticHotel?.province || "";
  const destinationName = staticHotel?.destinationName || dbHotel?.destinations?.name || "";
  const destinationSlug = dbHotel?.destinations?.slug || staticHotel?.destinationId || "";
  const destinationIdForSponsors = staticHotel?.destinationId || dbHotel?.destination_id || "";
  const nearbyRestaurants = useMemo(
    () => (destinationIdForSponsors ? getRestaurantsByDestination(destinationIdForSponsors) : []),
    [destinationIdForSponsors]
  );
  const nearbyExperiences = useMemo(
    () => (destinationIdForSponsors ? getExperiencesByDestination(destinationIdForSponsors) : []),
    [destinationIdForSponsors]
  );

  // Generated rich sections
  const policies = generatePolicies(staticHotel || null);
  const rooms = generateRooms(staticHotel || null);
  const restaurants = generateRestaurants(staticHotel || null);
  const bars = generateBars(staticHotel || null);
  const pools = generatePools(staticHotel || null);
  const spa = generateSpa(staticHotel || null);
  const nightlife = generateNightlife(staticHotel || null);

  const tags = useMemo(() => {
    const t: string[] = [];
    if (hotelCategory) t.push(getCategoryLabel(hotelCategory));
    if (hotelStars >= 5) t.push("Categoría 5 Estrellas");
    if (hotelAmenities.some(a => a.toLowerCase().includes("playa"))) t.push("Frente a Playa Exclusiva");
    if (hotelAmenities.some(a => a.toLowerCase().includes("spa"))) t.push("Spa & Wellness");
    if (hotelAmenities.some(a => a.toLowerCase().includes("golf"))) t.push("Campo de Golf");
    if (hotelAmenities.some(a => a.toLowerCase().includes("solo adultos"))) t.push("Adults Only 18+");
    else t.push("Familiar & Niños");
    return t.slice(0, 6);
  }, [hotelCategory, hotelStars, hotelAmenities]);

  // Calculate nights
  const nights = useMemo(() => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 3;
    }
  }, [checkIn, checkOut]);

  const currentRoom = rooms[selectedRoomIndex] || rooms[0];
  const pricePerNight = currentRoom.price;
  const basePrice = pricePerNight * nights;
  const itbisTaxes = Math.round(basePrice * 0.18); // ITBIS Dominicano 18%
  const legalService = Math.round(basePrice * 0.10); // 10% Ley de propina hotelera
  const total = basePrice + itbisTaxes + legalService;

  const handleBooking = () => {
    toast.success("¡Solicitud de Reserva Iniciada!", {
      description: `Has seleccionado: ${currentRoom.name} para ${guests} huéspedes (${nights} noches). Te redirigiremos al portal de confirmación directa.`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Header />
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Cargando detalles del alojamiento...</p>
      </div>
    );
  }

  if (!staticHotel && !dbHotel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Alojamiento no encontrado</h1>
          <p className="text-muted-foreground mb-6">No pudimos encontrar el hotel o resort solicitado.</p>
          <Button asChild><Link to="/alojamientos">Explorar todos los alojamientos</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${hotelName} - Reserva y Opiniones en República Dominicana`}
        description={hotelShortDesc || hotelDescription?.substring(0, 160)}
      />
      <Header variant="white" hasHero={false} />

      {/* Hero Slider */}
      <HotelHeroSlider
        images={hotelImages}
        name={hotelName}
        location={hotelLocation}
        destinationSlug={destinationSlug}
        destinationName={destinationName}
        rating={hotelRating}
        stars={hotelStars}
        categoryLabel={getCategoryLabel(hotelCategory)}
        favoriteId={dbHotel?.id || staticHotel?.id || id || ""}
        restaurants={nearbyRestaurants}
        experiences={nearbyExperiences}
      />

      {/* Quick Meta / Actions Bar */}
      <section className="container mx-auto px-4 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit">
            <ShieldCheck className="h-3.5 w-3.5" /> Alojamiento Verificado
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border/80 hover:border-primary/50 w-fit"
            onClick={() => {
              if (navigator.share) navigator.share({ title: hotelName, url: window.location.href });
              else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Enlace copiado al portapapeles");
              }
            }}
          >
            <Share2 className="h-4 w-4" /> Compartir
          </Button>
        </div>
      </section>

      {/* Full Photo Gallery */}
      <section className="container mx-auto px-4 lg:px-8 pb-8">
        <AccommodationGallery images={hotelImages} name={hotelName} />
      </section>

      {/* Highlights Bar Strip */}
      <section className="container mx-auto px-4 lg:px-8 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Zonas Acuáticas</p>
              <p className="text-sm font-bold text-foreground">{pools.length} Piscinas & Infinity</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gastronomía & Bares</p>
              <p className="text-sm font-bold text-foreground">{restaurants.length} Restaurantes • {bars.length} Bares</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Disc className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vida Nocturna</p>
              <p className="text-sm font-bold text-foreground">Discoteca, Teatro & Shows</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spa & Bienestar</p>
              <p className="text-sm font-bold text-foreground">{spa.name.split(" ")[0]} Wellness</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Left Column (Details, Rooms, Amenities, Food, Nightlife, Spa, Pools, FAQ) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Overview & Story */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <Crown className="h-6 w-6 text-primary" />
                Sobre la Experiencia Todo Incluido en {hotelName}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-6 whitespace-pre-line">
                {hotelDescription || "Disfruta de una estadía de ensueño en este exclusivo complejo caribeño, donde el confort de clase mundial, la hospitalidad dominicana y paisajes inolvidables se unen para brindarte unas vacaciones perfectas."}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-muted/70 text-foreground/80 hover:bg-primary/20 hover:text-primary transition-colors py-1.5 px-3">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Room & Suite Selector */}
            <AccommodationRooms 
              rooms={rooms}
              selectedRoomIndex={selectedRoomIndex}
              onSelectRoom={setSelectedRoomIndex}
            />

            {/* Pools & Aquatic Complex */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                    <Waves className="h-6 w-6 text-primary" />
                    Piscinas & Zonas Acuáticas ({pools.length} Piscinas)
                  </h2>
                  <p className="text-sm text-muted-foreground">Espacios de agua dulce y climatizada para cada momento del día</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">{pools.length} Áreas de Piscina</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {pools.map((p, idx) => (
                  <div key={p.name} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                          Piscina #{idx + 1} • {p.type}
                        </Badge>
                        <span className="text-xs font-bold text-primary">{p.vibe}</span>
                      </div>
                      <h3 className="font-display text-base font-bold text-foreground mb-1.5">{p.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.features}</p>
                    </div>
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span>Profundidad: <strong className="text-foreground">{p.depth}</strong></span>
                      <span className="text-primary font-semibold">Toallas & Camastros ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Culinary & Dining Experience */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    Restaurantes & Buffets ({restaurants.length} Opciones)
                  </h2>
                  <p className="text-sm text-muted-foreground">Propuestas gourmet internacionales y gastronomía criolla de autor</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">{restaurants.length} Restaurantes</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {restaurants.map((rest) => (
                  <div key={rest.name} className="bg-card rounded-3xl p-6 border border-border hover:border-primary/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{rest.tag}</span>
                        {rest.reservations && (
                          <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary border-primary/20">
                            Reserva Recomendada
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{rest.name}</h3>
                      <p className="text-xs font-semibold text-primary/90 mb-2.5">{rest.cuisine}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{rest.description}</p>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {rest.hours}</span>
                      <span className="flex items-center gap-1.5 font-medium"><Users className="h-3.5 w-3.5 text-primary" /> {rest.dressCode}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bars & Lounges */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    Bares & Coctelería de Autor ({bars.length} Bares)
                  </h3>
                  <Badge variant="outline" className="text-xs">{bars.length} Bares Todo Incluido</Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bars.map((bar) => (
                    <div key={bar.name} className="bg-gradient-to-br from-primary/5 via-card to-card rounded-3xl p-5 border border-primary/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase mb-1.5">
                          <Wine className="h-3.5 w-3.5" /> {bar.type}
                        </div>
                        <h4 className="font-display text-base font-bold text-foreground mb-1">{bar.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{bar.description}</p>
                      </div>
                      <div className="pt-2 border-t border-border/60 text-xs">
                        <p className="text-primary font-semibold text-[11px]">Especialidad: {bar.specialty}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">{bar.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nightlife, Disco & Shows */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                  <Disc className="h-6 w-6 text-primary" />
                  Discotecas, Teatro & Vida Nocturna
                </h2>
                <p className="text-sm text-muted-foreground">Entretenimiento nocturno diario con artistas en vivo y club con DJ</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {nightlife.map((n) => (
                  <div key={n.name} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-colors flex flex-col justify-between">
                    <div>
                      <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] mb-2">
                        {n.type}
                      </Badge>
                      <h3 className="font-display text-base font-bold text-foreground mb-1.5">{n.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{n.description}</p>
                    </div>
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> {n.hours}</span>
                      <span className="font-semibold text-foreground">{n.dressCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spa & Wellness Center */}
            <div className="bg-gradient-to-br from-emerald-500/5 via-card to-card rounded-3xl p-6 md:p-8 border border-emerald-500/20 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                    <HeartPulse className="h-6 w-6 text-emerald-500" />
                    {spa.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{spa.size} • {spa.schedule}</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1">
                  Circuito Hidrotermal Incluido
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {spa.facilities.map((fac) => (
                  <div key={fac.name} className="p-3.5 bg-background/80 rounded-2xl border border-border">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {fac.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{fac.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span>{spa.bookingPolicy}</span>
                <span className="font-bold">Tratamientos con Cacao & Sal Marina</span>
              </div>
            </div>

            {/* Amenities & Experiences Grid */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2.5">
                <Award className="h-6 w-6 text-primary" />
                Amenidades y Servicios Destacados
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Instalaciones de primer nivel para una experiencia sin preocupaciones</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hotelAmenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div 
                      key={amenity} 
                      className="flex flex-col items-center justify-center text-center gap-2 p-4 bg-muted/30 hover:bg-primary/5 rounded-2xl border border-border/70 hover:border-primary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground/90">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Hotel Policies */}
            <AccommodationPolicies policies={policies} />

            {/* Frequently Asked Questions */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2.5">
                <HelpCircle className="h-6 w-6 text-primary" />
                Preguntas Frecuentes
              </h2>
              
              <div className="space-y-3">
                {faqsData.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-border rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-primary shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed bg-muted/10 border-t border-border/40"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location & Map Section */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2.5">
                <MapPin className="h-6 w-6 text-primary" />
                Ubicación & Cómo Llegar
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{hotelAddress}</p>
              
              <div className="aspect-video bg-muted/40 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
                  <MapPin className="h-8 w-8 animate-bounce" />
                </div>
                <p className="font-bold text-foreground text-base mb-1">{hotelName}</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-sm">{hotelLocation} • República Dominicana</p>
                
                {(staticHotel?.latitude || dbHotel?.latitude) ? (
                  <Button asChild className="rounded-xl shadow-md gap-2">
                    <a 
                      href={`https://maps.google.com/?q=${staticHotel?.latitude || dbHotel?.latitude},${staticHotel?.longitude || dbHotel?.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Abrir en Google Maps <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild className="rounded-xl shadow-md gap-2">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(hotelName + " " + hotelLocation)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Buscar Ruta en Maps <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget & Concierge Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Interactive Booking Card */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-xl ring-1 ring-border/50">
                <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
                  <div>
                    <span className="text-3xl font-black text-foreground">${pricePerNight}</span>
                    <span className="text-xs font-semibold text-muted-foreground"> USD / noche</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/15 text-amber-500 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{hotelRating}</span>
                  </div>
                </div>

                {/* Selected Room Indicator */}
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-5">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">Habitación Elegida</p>
                  <p className="text-sm font-bold text-foreground truncate">{currentRoom.name}</p>
                </div>

                {/* Date Pickers */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Llegada</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={checkIn} 
                        onChange={(e) => setCheckIn(e.target.value)} 
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Salida</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={checkOut} 
                        onChange={(e) => setCheckOut(e.target.value)} 
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Guests count */}
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Huéspedes</label>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(Number(e.target.value))} 
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value={1}>1 Adulto</option>
                    <option value={2}>2 Adultos</option>
                    <option value={3}>3 Adultos</option>
                    <option value={4}>4 Personas (Familia)</option>
                    <option value={5}>5+ Personas (Grupo)</option>
                  </select>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">${pricePerNight} x {nights} {nights === 1 ? 'noche' : 'noches'}</span>
                    <span className="font-semibold text-foreground">${basePrice.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ITBIS Gubernamental (18%)</span>
                    <span className="font-semibold text-foreground">${itbisTaxes.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio Hotelero Ley (10%)</span>
                    <span className="font-semibold text-foreground">${legalService.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border/70 text-sm font-black">
                    <span className="text-foreground">Total Estimado</span>
                    <span className="text-primary text-base font-extrabold">${total.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Reserve Action Button */}
                <Button 
                  onClick={handleBooking}
                  className="w-full py-6 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                >
                  Confirmar Disponibilidad
                </Button>
                
                <p className="text-[11px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Sin cobros inmediatos • Cancelación gratuita
                </p>

                {/* Direct Contact & WhatsApp Concierge */}
                <div className="mt-6 pt-5 border-t border-border/70 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Asistencia Telefónica</p>
                      <a href={`tel:${hotelPhone}`} className="text-xs text-primary font-semibold hover:underline">
                        {hotelPhone}
                      </a>
                    </div>
                  </div>

                  {hotelWebsite && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Sitio Oficial del Hotel</p>
                        <a href={hotelWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                          Visitar portal web <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Promo Banner */}
              <DetailPageSidebarAd showDemo />
            </div>
          </div>

        </div>
      </section>

      {/* High-Impact Panorama Destination Banner Ad before footer */}
      <section className="py-8 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <PanoramaAd showDemo />
        </div>
      </section>

      <MobileStickyFooterAd showDemo />
      <Footer />
    </div>
  );
}

