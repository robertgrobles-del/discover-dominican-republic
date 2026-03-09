import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  Star, MapPin, Share2, ChevronRight, Waves, Dumbbell, Wifi, Car, Utensils,
  Coffee, Sparkles, Phone, Check, AirVent, Bath, Tv, Bike, Music, Umbrella,
  PartyPopper, Anchor, Users, CreditCard, Baby, PawPrint, UsersRound,
  Sailboat, CircleDot, Facebook, Instagram, Twitter, Globe, Wine,
  UtensilsCrossed, Loader2, ExternalLink, Bed, TreePine, Gem, Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AccommodationGallery } from "@/components/AccommodationGallery";
import { DetailPageSidebarAd, MobileStickyFooterAd, InlineAd } from "@/components/ads";
import { SEOHead } from "@/components/SEOHead";
import { getHotelBySlug, Hotel as StaticHotel } from "@/data/hotels";

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
  "Spa": Sparkles, "Spa de lujo": Sparkles, "Spa premiado": Sparkles,
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
  "9 restaurantes": Utensils, "7 restaurantes": Utensils,
  "Bares": Coffee, "Múltiples bares": Coffee, "Bar de coctelería": Coffee,
  "Room service 24h": Car, "Butler service": Star, "Concierge": Star,
  "Parking": Car, "Parking Valet": Car, "Parking gratis": Car,
  "Marina": Sailboat, "Polo": CircleDot, "Tours históricos": Globe,
  "Tours personalizados": Globe, "Tour de café": Coffee,
  "Rafting": Waves, "Canyoning": TreePine, "Senderismo": TreePine,
  "Cabalgatas": Bike, "Buceo": Anchor, "Centro de buceo": Anchor,
  "Villas privadas": Bed, "Suites con jacuzzi": Bath,
  "Tiro al plato": CircleDot, "Junto al río": Waves,
  "Cabañas privadas": Bed, "Shows nocturnos": Music, "Shows": Music,
  "Teatro": Music, "Discoteca": Music, "Pool parties": PartyPopper,
  "DJs residentes": Music, "Star Camp (kids)": Baby,
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
    "resort": "Resort", "boutique": "Boutique", "all-inclusive": "Todo Incluido",
    "business": "Business", "eco-lodge": "Eco-Lodge",
  };
  return labels[cat] || cat;
}

function generatePolicies(hotel: StaticHotel | null) {
  const isAdultsOnly = hotel?.amenities?.some(a => a.toLowerCase().includes("solo adultos"));
  return {
    checkIn: "3:00 PM",
    checkOut: "12:00 PM",
    cancellation: "Cancelación gratuita hasta 48 horas antes de la llegada",
    children: isAdultsOnly ? "Este es un resort exclusivo para adultos (18+)" : "Niños de todas las edades son bienvenidos",
    pets: "Consulte con el hotel sobre la política de mascotas",
    groups: "Grupos de más de 8 personas deben contactar directamente al hotel",
    paymentMethods: ["Visa", "Mastercard", "American Express", "PayPal"],
  };
}

function generateRooms(hotel: StaticHotel | null) {
  const priceBase = hotel?.priceRange === '$$$$$' ? 600 : hotel?.priceRange === '$$$$' ? 400 : hotel?.priceRange === '$$$' ? 250 : hotel?.priceRange === '$$' ? 120 : 80;
  return [
    { name: "Habitación Superior", size: "35 m²", view: "Vista al Jardín", bed: "Cama King o 2 Queens", amenities: ["A/C", "Smart TV", "Minibar"], price: priceBase, breakfast: false, image: hotelRoomSuiteImg, description: "Habitación cómoda con todas las amenidades para una estadía placentera." },
    { name: "Suite Premium", size: "55 m²", view: "Vista Panorámica", bed: "Cama King", amenities: ["Vista Mar", "Bañera", "Cafetera"], price: Math.round(priceBase * 1.5), breakfast: true, image: heroBeachImg, description: "Suite espaciosa con área de estar y vistas espectaculares." },
    { name: "Suite Presidencial", size: "90 m²", view: "Vista al Mar", bed: "Cama King + Sofá Cama", amenities: ["Piscina Privada", "Minibar Premium", "Butler"], price: Math.round(priceBase * 2.5), breakfast: true, image: puntaCanaImg, description: "La mejor suite con servicio personalizado y amenidades exclusivas." },
  ];
}

function generateRestaurants(hotel: StaticHotel | null) {
  const restaurantCount = hotel?.amenities?.find(a => a.match(/\d+ restaurantes/i));
  const items = [
    { name: "Restaurante Principal", cuisine: "Internacional & Buffet", hours: "7:00 AM - 10:30 PM", description: "Amplio buffet con cocina internacional y estaciones en vivo.", dressCode: "Smart Casual", reservations: false },
    { name: "Restaurante Gourmet", cuisine: "Mediterránea & Mariscos", hours: "6:00 PM - 10:30 PM", description: "Cocina de autor con los mejores ingredientes locales e internacionales.", dressCode: "Elegante", reservations: true },
  ];
  if (hotel?.category === 'all-inclusive' || hotel?.stars === 5) {
    items.push({ name: "Beach Bar & Grill", cuisine: "BBQ & Caribeña", hours: "12:00 PM - 6:00 PM", description: "Parrillada frente al mar con opciones caribeñas y cócteles.", dressCode: "Casual", reservations: false });
  }
  return items;
}

function generateBars(hotel: StaticHotel | null) {
  return [
    { name: "Lobby Bar", type: "Cocktail Bar", hours: "10:00 AM - 12:00 AM", description: "Cócteles artesanales y selección de licores premium.", specialty: "Cócteles dominicanos" },
    ...(hotel?.category === 'all-inclusive' ? [{ name: "Pool Bar", type: "Tropical Bar", hours: "10:00 AM - 6:00 PM", description: "Bebidas refrescantes junto a la piscina.", specialty: "Piña Colada" }] : []),
  ];
}

export default function AlojamientoDetalle() {
  const { id } = useParams();
  const [checkIn, setCheckIn] = useState("2025-04-15");
  const [checkOut, setCheckOut] = useState("2025-04-20");
  const [guests, setGuests] = useState(2);
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

  // Merge data: static takes priority for rich fields, DB for metadata
  const hotelName = staticHotel?.name || dbHotel?.name || "Hotel";
  const hotelLocation = staticHotel ? `${staticHotel.destinationName}, ${staticHotel.province}` : dbHotel?.address || dbHotel?.destinations?.name || "";
  const hotelRating = staticHotel?.rating || dbHotel?.rating || 4.5;
  const hotelReviews = staticHotel?.reviewCount || dbHotel?.review_count || 0;
  const hotelDescription = staticHotel?.description || dbHotel?.description || "";
  const hotelShortDesc = staticHotel?.shortDescription || dbHotel?.short_description || "";
  const hotelStars = staticHotel?.stars || dbHotel?.stars || 5;
  const hotelCategory = staticHotel?.category || dbHotel?.category || "resort";
  const hotelPriceRange = staticHotel?.priceRange || dbHotel?.price_range || "$$$";
  const hotelAmenities = staticHotel?.amenities || (dbHotel?.amenities as string[]) || [];
  const hotelPhone = staticHotel?.phone || dbHotel?.phone || "";
  const hotelEmail = staticHotel?.email || dbHotel?.email || "";
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
  const destinationSlug = dbHotel?.destinations?.slug || "";

  // Generated data
  const policies = generatePolicies(staticHotel || null);
  const rooms = generateRooms(staticHotel || null);
  const restaurants = generateRestaurants(staticHotel || null);
  const bars = generateBars(staticHotel || null);
  const tags = useMemo(() => {
    const t: string[] = [];
    if (hotelCategory) t.push(getCategoryLabel(hotelCategory));
    if (hotelStars >= 5) t.push("Lujo");
    if (hotelAmenities.some(a => a.toLowerCase().includes("playa"))) t.push("Frente al mar");
    if (hotelAmenities.some(a => a.toLowerCase().includes("spa"))) t.push("Spa");
    if (hotelAmenities.some(a => a.toLowerCase().includes("golf"))) t.push("Golf");
    if (hotelAmenities.some(a => a.toLowerCase().includes("kids") || a.toLowerCase().includes("niños"))) t.push("Familia");
    if (hotelAmenities.some(a => a.toLowerCase().includes("solo adultos"))) t.push("Solo Adultos");
    return t.slice(0, 6);
  }, [hotelCategory, hotelStars, hotelAmenities]);

  // Price calculation
  const nights = 5;
  const pricePerNight = rooms[0]?.price || 300;
  const basePrice = pricePerNight * nights;
  const taxes = Math.round(basePrice * 0.15);
  const total = basePrice + taxes;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staticHotel && !dbHotel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Hotel no encontrado</h1>
          <p className="text-muted-foreground mb-6">No pudimos encontrar el alojamiento que buscas.</p>
          <Button asChild><Link to="/alojamientos">Ver todos los alojamientos</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${hotelName} - Alojamiento en República Dominicana`}
        description={hotelShortDesc || hotelDescription?.substring(0, 160)}
      />
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 pt-20 pb-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link to="/" className="hover:text-primary">Inicio</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/alojamientos" className="hover:text-primary">Alojamientos</Link>
          {province && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>{province}</span>
            </>
          )}
          {destinationName && (
            <>
              <ChevronRight className="h-4 w-4" />
              {destinationSlug ? (
                <Link to={`/destino/${destinationSlug}`} className="hover:text-primary">{destinationName}</Link>
              ) : (
                <span>{destinationName}</span>
              )}
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{hotelName}</span>
        </nav>
      </div>

      {/* Header */}
      <section className="container mx-auto px-4 lg:px-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {hotelName}
              </h1>
              <Badge variant="secondary" className="text-xs">{getCategoryLabel(hotelCategory)}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {hotelLocation}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(hotelStars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-foreground font-medium">{hotelRating}</span>
                {hotelReviews > 0 && (
                  <span className="text-muted-foreground">({hotelReviews.toLocaleString()} reseñas)</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <FavoriteButton
              id={dbHotel?.id || staticHotel?.id || id || ""}
              type="hotel"
              name={hotelName}
              image={hotelImages[0]}
              location={hotelLocation}
              variant="button"
              size="md"
            />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              if (navigator.share) navigator.share({ title: hotelName, url: window.location.href });
              else navigator.clipboard.writeText(window.location.href);
            }}>
              <Share2 className="h-4 w-4" /> Compartir
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto px-4 lg:px-8 pb-12">
        <AccommodationGallery images={hotelImages} name={hotelName} />
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre este alojamiento</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{hotelDescription}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-primary border-primary/30">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Amenities / Services */}
            {hotelAmenities.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Experiencia y Servicios</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hotelAmenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div key={amenity} className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-center text-muted-foreground">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Restaurants */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                <UtensilsCrossed className="inline h-6 w-6 mr-2 text-primary" />
                Restaurantes del Hotel
              </h2>
              <div className="space-y-4">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.name} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-bold text-foreground">{restaurant.name}</h3>
                          {restaurant.reservations && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Requiere Reserva</span>
                          )}
                        </div>
                        <p className="text-sm text-primary mb-2">{restaurant.cuisine}</p>
                        <p className="text-sm text-muted-foreground mb-3">{restaurant.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Coffee className="h-3 w-3" />{restaurant.hours}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{restaurant.dressCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bars */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                <Wine className="inline h-6 w-6 mr-2 text-primary" /> Bares y Lounges
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {bars.map((bar) => (
                  <div key={bar.name} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/50 transition-colors">
                    <h3 className="font-display font-bold text-foreground mb-1">{bar.name}</h3>
                    <p className="text-sm text-primary mb-2">{bar.type}</p>
                    <p className="text-sm text-muted-foreground mb-3">{bar.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Coffee className="h-3 w-3" />{bar.hours}</span>
                      <span className="flex items-center gap-1 text-primary font-medium">★ {bar.specialty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Habitaciones y Suites</h2>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.name} className="flex flex-col md:flex-row gap-4 bg-card rounded-2xl overflow-hidden border border-border">
                    <div className="md:w-48 h-32 md:h-auto">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-foreground">{room.name}</h3>
                            {room.breakfast && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Desayuno Incluido</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{room.size} • {room.view} • {room.bed}</p>
                          <p className="text-xs text-muted-foreground mb-2">{room.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {room.amenities.map((a) => (
                              <div key={a} className="flex items-center gap-1">
                                {a === "A/C" && <AirVent className="h-3 w-3" />}
                                {a === "Bañera" && <Bath className="h-3 w-3" />}
                                {a === "Smart TV" && <Tv className="h-3 w-3" />}
                                {a === "Vista Mar" && <Waves className="h-3 w-3" />}
                                {a === "Minibar" && <Coffee className="h-3 w-3" />}
                                {a === "Cafetera" && <Coffee className="h-3 w-3" />}
                                {a}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Desde</p>
                          <p className="text-xl font-bold text-foreground">${room.price} <span className="text-sm font-normal text-muted-foreground">USD</span></p>
                          <Button size="sm" variant="outline" className="mt-2">Seleccionar</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Social */}
            {(hotelWebsite || hotelPhone) && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Contacto</h2>
                <div className="flex flex-wrap gap-3 mb-4">
                  {hotelWebsite && (
                    <a href={hotelWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Sitio Web</span>
                    </a>
                  )}
                  {hotelPhone && (
                    <a href={`tel:${hotelPhone}`} className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{hotelPhone}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Ubicación</h2>
              <div className="bg-card rounded-2xl overflow-hidden border border-border">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{hotelAddress}</p>
                    <p className="text-sm text-muted-foreground">República Dominicana</p>
                  </div>
                  {(staticHotel?.latitude || dbHotel?.latitude) && (
                    <Button variant="link" className="text-primary" asChild>
                      <a href={`https://maps.google.com/?q=${staticHotel?.latitude || dbHotel?.latitude},${staticHotel?.longitude || dbHotel?.longitude}`} target="_blank" rel="noopener noreferrer">
                        Ver en Maps <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Policies */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Políticas del Hotel</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2"><Check className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Check-in</p></div>
                  <p className="font-semibold text-foreground">{policies.checkIn}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2"><Check className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Check-out</p></div>
                  <p className="font-semibold text-foreground">{policies.checkOut}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2"><Baby className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Niños</p></div>
                  <p className="font-semibold text-foreground text-sm">{policies.children}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2"><PawPrint className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Mascotas</p></div>
                  <p className="font-semibold text-foreground text-sm">{policies.pets}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2"><CreditCard className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Medios de pago</p></div>
                  <div className="flex flex-wrap gap-1">
                    {policies.paymentMethods.map((method) => (
                      <span key={method} className="text-xs bg-secondary px-2 py-0.5 rounded text-foreground">{method}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2"><Check className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Cancelación</p></div>
                  <p className="font-semibold text-foreground text-sm">{policies.cancellation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${pricePerNight}</span>
                    <span className="text-muted-foreground"> / noche</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold">{hotelRating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">CHECK-IN</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">CHECK-OUT</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs text-muted-foreground mb-1">HUÉSPEDES</label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    <option value={1}>1 Adulto</option>
                    <option value={2}>2 Adultos</option>
                    <option value={3}>3 Adultos</option>
                    <option value={4}>4 Adultos</option>
                  </select>
                </div>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">${pricePerNight} x {nights} noches</span>
                    <span className="text-foreground">${basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impuestos (15%)</span>
                    <span className="text-foreground">${taxes}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-border font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${total.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full mb-4">Reservar Ahora</Button>
                <p className="text-xs text-center text-muted-foreground">No se le cobrará nada todavía</p>

                {hotelPhone && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">¿Necesitas ayuda?</p>
                        <a href={`tel:${hotelPhone}`} className="text-primary text-sm hover:underline">{hotelPhone}</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DetailPageSidebarAd showDemo />
            </div>
          </div>
        </div>
      </section>

      <InlineAd showDemo variant="large" />
      <MobileStickyFooterAd showDemo />
      <Footer />
    </div>
  );
}
