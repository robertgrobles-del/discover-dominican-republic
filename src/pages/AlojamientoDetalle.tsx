import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Bed, Crown, CheckCircle2, ShieldCheck, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccommodationGallery } from "@/components/AccommodationGallery";
import { SEOHead, generateHotelSchema } from "@/components/SEOHead";
import { AccommodationRooms } from "@/components/accommodation/AccommodationRooms";
import { AccommodationPolicies } from "@/components/accommodation/AccommodationPolicies";
import { AccommodationDining } from "@/components/accommodation/AccommodationDining";
import { AccommodationPools } from "@/components/accommodation/AccommodationPools";
import { AccommodationNightlife } from "@/components/accommodation/AccommodationNightlife";
import { AccommodationSpa } from "@/components/accommodation/AccommodationSpa";
import { AccommodationBookingCard } from "@/components/accommodation/AccommodationBookingCard";
import { HotelHeroSlider } from "@/components/hotel/HotelHeroSlider";
import { HotelHighlights } from "@/components/hotel/HotelHighlights";
import { HotelFaqSection } from "@/components/hotel/HotelFaqSection";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";
import { useHotelData } from "@/hooks/useHotelData";
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
} from "@/data/hotelDetailData";

export default function AlojamientoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug;
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  const { staticHotel, dbHotel, loading } = useHotelData(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const hotelName = staticHotel?.name || dbHotel?.name || "Hotel";
  const hotelLocation = staticHotel
    ? `${staticHotel.destinationName}, ${staticHotel.province}`
    : dbHotel?.address || dbHotel?.destinations?.name || "";
  const hotelRating = staticHotel?.rating || dbHotel?.rating || 4.8;
  const hotelDescription = staticHotel?.description || dbHotel?.description || "";
  const hotelShortDesc = staticHotel?.shortDescription || dbHotel?.short_description || "";
  const hotelStars = staticHotel?.stars || dbHotel?.stars || 5;
  const hotelCategory = staticHotel?.category || dbHotel?.category || "resort";
  const destinationSlug = staticHotel?.destinationId || dbHotel?.destinations?.slug || "punta-cana";
  const destinationName = staticHotel?.destinationName || dbHotel?.destinations?.name || "Punta Cana";

  // Gallery
  const hotelImages = useMemo(() => {
    const fromDb = dbHotel?.gallery_urls?.length
      ? [dbHotel.image_url, ...dbHotel.gallery_urls]
      : [];
    const fromStatic = staticHotel?.gallery?.length
      ? [staticHotel.imageUrl, ...staticHotel.gallery]
      : [];
    const fallback = [
      staticHotel?.imageUrl ||
        dbHotel?.image_url ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop",
    ];
    return Array.from(new Set([...fromDb, ...fromStatic, ...fallback].filter(Boolean)));
  }, [dbHotel, staticHotel]);

  // Derived mock features
  const policies = useMemo(() => generatePolicies(staticHotel || null), [staticHotel]);
  const rooms = useMemo(() => generateRooms(staticHotel || null), [staticHotel]);
  const restaurants = useMemo(() => generateRestaurants(staticHotel || null), [staticHotel]);
  const bars = useMemo(() => generateBars(staticHotel || null), [staticHotel]);
  const nightlife = useMemo(() => generateNightlife(staticHotel || null), [staticHotel]);
  const spa = useMemo(() => generateSpa(staticHotel || hotelName), [staticHotel, hotelName]);
  const pools = useMemo(() => generatePools(staticHotel || null), [staticHotel]);

  const selectedRoom = rooms[selectedRoomIndex] || rooms[0];

  const tags = [
    "Playa de Arena Blanca",
    "Régimen Todo Incluido",
    "Servicio de Mayordomo 24/7",
    "Piscinas Climatizadas",
    "Spa & Wellness de Autor",
    "Deportes Acuáticos No Motorizados",
    "Kids Club & Teens Lounge",
    "WiFi de Alta Velocidad",
  ];

  if (!loading && !staticHotel && !dbHotel) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Alojamiento no encontrado</h1>
          <p className="text-muted-foreground mb-6">
            No pudimos encontrar el hotel o resort solicitado.
          </p>
          <Button asChild className="rounded-xl">
            <Link to="/alojamientos">Explorar todos los alojamientos</Link>
          </Button>
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
        image={hotelImages[0]}
        jsonLd={generateHotelSchema({
          name: hotelName,
          description: hotelShortDesc || hotelDescription,
          image: hotelImages[0] || "https://descubrerd.com/og-image.jpg",
          priceRange: staticHotel?.priceRange || "$$$",
          rating: hotelRating,
          address: hotelLocation,
        })}
      />
      <Header hasHero />

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

      {/* Highlights Bar Strip & Day Pass Info */}
      <HotelHighlights
        poolsCount={pools.length}
        restaurantsCount={restaurants.length}
        barsCount={bars.length}
        spaName={spa.name}
      />

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
                {hotelDescription ||
                  "Disfruta de una estadía de ensueño en este exclusivo complejo caribeño, donde el confort de clase mundial, la hospitalidad dominicana y paisajes inolvidables se unen para brindarte unas vacaciones perfectas."}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-muted/70 text-foreground/80 hover:bg-primary/20 hover:text-primary transition-colors py-1.5 px-3"
                  >
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
            <HotelFaqSection />

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

      {/* Full Photo Grid Gallery */}
      {hotelImages.length > 1 && (
        <section className="container mx-auto px-4 lg:px-8 py-12 border-t border-border/60">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Galería Fotográfica de {hotelName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explora las instalaciones, habitaciones, piscinas y áreas comunes.
            </p>
          </div>
          <AccommodationGallery images={hotelImages} name={hotelName} />
        </section>
      )}

      {/* Mobile Floating Bar */}
      <DetailFloatingBar
        priceLabel="Desde"
        priceValue={`US$ ${selectedRoom.price} / noche`}
        primaryActionLabel="Reservar Habitación"
        onPrimaryAction={() => {
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
