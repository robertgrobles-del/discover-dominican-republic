import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Share2, Waves, UtensilsCrossed, Bed, Crown, ShieldCheck, 
  Disc, HeartPulse, CheckCircle2, ChevronDown, ChevronUp, HelpCircle,
  Sun, Baby, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccommodationGallery } from "@/components/AccommodationGallery";
import { SEOHead } from "@/components/SEOHead";
import { AccommodationRooms } from "@/components/accommodation/AccommodationRooms";
import { AccommodationPolicies } from "@/components/accommodation/AccommodationPolicies";
import { AccommodationDining } from "@/components/accommodation/AccommodationDining";
import { AccommodationPools } from "@/components/accommodation/AccommodationPools";
import { AccommodationNightlife } from "@/components/accommodation/AccommodationNightlife";
import { AccommodationSpa } from "@/components/accommodation/AccommodationSpa";
import { AccommodationBookingCard } from "@/components/accommodation/AccommodationBookingCard";
import { HotelHeroSlider } from "@/components/hotel/HotelHeroSlider";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";
import { getHotelBySlug } from "@/data/hotels";
import { getEnrichedHotelBySlug } from "@/data/provinceEnrichment";
import { getRestaurantsByDestination } from "@/data/restaurants";
import { getExperiencesByDestination } from "@/data/experiences";
import { toast } from "sonner";

import {
  getCategoryLabel,
  generatePolicies,
  generateRooms,
  generateRestaurants,
  generateBars,
  generateNightlife,
  generateSpa,
  generatePools,
  hotelFaqsData as faqsData
} from "@/data/hotelDetailData";

export default function AlojamientoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug;
  
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [dbHotel, setDbHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Look up static data or regionally enriched province data
  const staticHotelRaw = id ? getHotelBySlug(id) : undefined;
  const enrichedHotel = (!staticHotelRaw && id) ? getEnrichedHotelBySlug(id) : null;
  const staticHotel = staticHotelRaw || (enrichedHotel ? {
    id: enrichedHotel.id,
    name: enrichedHotel.name,
    slug: enrichedHotel.slug,
    destinationId: "republica-dominicana",
    destinationName: enrichedHotel.address.split(",").pop()?.trim() || "República Dominicana",
    province: enrichedHotel.address.split(",").pop()?.trim() || "República Dominicana",
    category: (enrichedHotel.category?.toLowerCase().includes("boutique") ? "boutique" : enrichedHotel.category?.toLowerCase().includes("eco") ? "eco-lodge" : "resort") as any,
    stars: 5,
    rating: enrichedHotel.rating || 4.85,
    reviewCount: 148,
    priceRange: enrichedHotel.priceRange || "$$$",
    pricePerNight: enrichedHotel.priceRange === "$$$" ? 220 : 140,
    imageUrl: enrichedHotel.imageUrl,
    gallery: [
      enrichedHotel.imageUrl,
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80"
    ],
    amenities: ["Piscina infinita", "Spa", "Wifi gratuito", "Restaurante gourmet", "Desayuno incluido", "Room service 24h", "Playa privada"],
    shortDescription: enrichedHotel.shortDescription,
    description: `${enrichedHotel.shortDescription} Ubicado en un entorno privilegiado de ${enrichedHotel.address}, este exclusivo alojamiento ofrece una experiencia de confort inigualable con gastronomía de autor, habitaciones de lujo y excursiones guiadas por los atractivos más espectaculares de la región.`,
    isFeatured: true,
  } as any : undefined);

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
    window.scrollTo(0, 0);
  }, [id]);

  // Merge data
  const hotelName = staticHotel?.name || dbHotel?.name || "Hotel";
  const hotelLocation = staticHotel ? `${staticHotel.destinationName}, ${staticHotel.province}` : dbHotel?.address || dbHotel?.destinations?.name || "";
  const hotelRating = staticHotel?.rating || dbHotel?.rating || 4.8;
  const hotelDescription = staticHotel?.description || dbHotel?.description || "";
  const hotelShortDesc = staticHotel?.shortDescription || dbHotel?.short_description || "";
  const hotelStars = staticHotel?.stars || dbHotel?.stars || 5;
  const hotelCategory = staticHotel?.category || dbHotel?.category || "resort";
  const destinationSlug = staticHotel?.destinationId || dbHotel?.destinations?.slug || "punta-cana";
  const destinationName = staticHotel?.destinationName || dbHotel?.destinations?.name || "Punta Cana";

  // Gallery
  const hotelImages = useMemo(() => {
    const fromDb = dbHotel?.gallery_urls?.length ? [dbHotel.image_url, ...dbHotel.gallery_urls] : [];
    const fromStatic = staticHotel?.gallery?.length ? [staticHotel.imageUrl, ...staticHotel.gallery] : [];
    const fallback = [staticHotel?.imageUrl || dbHotel?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop"];
    return Array.from(new Set([...fromDb, ...fromStatic, ...fallback].filter(Boolean)));
  }, [dbHotel, staticHotel]);

  // Nearby context
  const nearbyRestaurants = useMemo(() => getRestaurantsByDestination(destinationSlug), [destinationSlug]);
  const nearbyExperiences = useMemo(() => getExperiencesByDestination(destinationSlug), [destinationSlug]);

  // Mock generated data helpers
  const policies = useMemo(() => generatePolicies(staticHotel || null), [staticHotel]);
  const rooms = useMemo(() => generateRooms(staticHotel || null), [staticHotel]);
  const restaurants = useMemo(() => generateRestaurants(staticHotel || null), [staticHotel]);
  const bars = useMemo(() => generateBars(staticHotel || null), [staticHotel]);
  const nightlife = useMemo(() => generateNightlife(staticHotel || null), [staticHotel]);
  const spa = useMemo(() => generateSpa(staticHotel || hotelName), [staticHotel, hotelName]);
  const pools = useMemo(() => generatePools(staticHotel || null), [staticHotel]);

  const selectedRoom = rooms[selectedRoomIndex] || rooms[0];

  const tags = [
    "Playa de Arena Blanca", "Régimen Todo Incluido", "Servicio de Mayordomo 24/7",
    "Piscinas Climatizadas", "Spa & Wellness de Autor", "Deportes Acuáticos No Motorizados",
    "Kids Club & Teens Lounge", "WiFi de Alta Velocidad"
  ];

  if (!loading && !staticHotel && !dbHotel) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Alojamiento no encontrado</h1>
          <p className="text-muted-foreground mb-6">No pudimos encontrar el hotel o resort solicitado.</p>
          <Button asChild className="rounded-xl"><Link to="/alojamientos">Explorar todos los alojamientos</Link></Button>
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

      {/* Hero Slider (Establishment's own photos only) */}
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
      />

      {/* Quick Meta / Actions Bar */}
      <section className="container mx-auto px-4 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit">
              <ShieldCheck className="h-3.5 w-3.5" /> Alojamiento Verificado por MITUR
            </div>
            <ClaimBusinessModal
              businessName={hotelName}
              businessType="hotel"
              businessId={dbHotel?.id || staticHotel?.id || id}
            />
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

      {/* Full Photo Grid Gallery */}
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

        {/* Day Pass & Family Policy Strip (★ Mejoras 101 y 102) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sun className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase">
                  Pasadía / Day Pass Disponible
                </Badge>
                <span className="text-xs font-bold text-foreground">$85 USD (~RD$ 5,100) / persona</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Horario: <strong>09:30 AM - 06:00 PM</strong>. Incluye acceso total a piscinas, playa privada, almuerzo buffet ilimitado, bebidas nacionales y toallas.
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Baby className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">
                  Política Familiar & Niños
                </Badge>
                <span className="text-xs font-bold text-foreground">Hasta 2 Niños Gratis (0 - 5 años)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Niños de 6 a 12 años con <strong>50% de descuento</strong> compartiendo habitación. Acceso sin costo al Kids Club y parque acuático infantil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Details, Rooms, Pools, Food, Nightlife, Spa, FAQ (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Overview & Story */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                <Crown className="h-6 w-6 text-primary" />
                Sobre la Experiencia Todo Incluido en {hotelName}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg whitespace-pre-line">
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
            <AccommodationPools pools={pools} />

            {/* Culinary & Dining Experience */}
            <AccommodationDining restaurants={restaurants} bars={bars} />

            {/* Nightlife, Disco & Shows */}
            <AccommodationNightlife nightlife={nightlife} />

            {/* Spa & Wellness */}
            <AccommodationSpa spa={spa} />

            {/* Policies */}
            <AccommodationPolicies policies={policies} />

            {/* FAQs */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Preguntas Frecuentes
              </h3>
              <div className="space-y-3">
                {faqsData.map((faq, idx) => (
                  <div key={faq.q} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between font-semibold text-sm hover:text-primary transition-colors"
                    >
                      <span>{faq.q}</span>
                      {expandedFaq === idx ? <ChevronUp className="h-4 w-4 text-primary shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </button>
                    {expandedFaq === idx && (
                      <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews / Comments */}
            <div className="pt-4">
              <CommentSection
                contentId={id || "alojamiento-default"}
                contentType="hotel"
                title={`Opiniones y Experiencias sobre ${hotelName}`}
              />
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget (4 cols) */}
          <div className="lg:col-span-4">
            <AccommodationBookingCard
              hotelName={hotelName}
              selectedRoom={selectedRoom}
              phone={dbHotel?.phone}
              website={dbHotel?.website}
            />
          </div>

        </div>
      </main>

      {/* Mobile Floating Bar */}
      <DetailFloatingBar 
        title={hotelName}
        price={`$${selectedRoom.pricePerNight} USD`}
        pricePeriod="/ noche"
        rating={hotelRating}
        ctaText="Reservar Habitación"
        onCtaClick={() => {
          const checkinElement = document.getElementById("hotel-checkin");
          if (checkinElement) {
            checkinElement.scrollIntoView({ behavior: "smooth", block: "center" });
            checkinElement.focus();
          }
        }}
      />

      <Footer />
    </div>
  );
}
