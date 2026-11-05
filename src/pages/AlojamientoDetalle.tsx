import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Bed, CalendarCheck, Crown, CheckCircle2, ShieldCheck, Share2 } from "lucide-react";
import { PlaceActions, scrollToSection } from "@/components/detail/PlaceActions";
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
import { HotelExperienceBento } from "@/components/hotel/HotelExperienceBento";
import { HotelFaqSection } from "@/components/hotel/HotelFaqSection";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";
import { SelloVerificadoBadge } from "@/components/ui/SelloVerificadoBadge";
import { WhatsAppPulseButton } from "@/components/ui/WhatsAppPulseButton";
import { SocialShareBar } from "@/components/social/SocialShareBar";
import { ParticipationInvite } from "@/components/gamificacion/ParticipationInvite";
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
import { usePageContent } from "@/lib/pageContent";

export default function AlojamientoDetalle() {
  const pc = usePageContent("alojamiento-detalle");
  const { slug } = useParams<{ slug: string }>();
  const id = slug;
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  const { staticHotel, dbHotel, loading } = useHotelData(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const hotelName = staticHotel?.name || dbHotel?.name || "Hotel";
  const hotelLocation = staticHotel
    ? [...new Set([staticHotel.destinationName, staticHotel.province].filter(Boolean))].join(", ") // sin repetir cuando destino y provincia se llaman igual
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

  // Secciones de la ficha. Con ficha del backend se muestra lo que hay en la base (lo que edita el panel): una
  // sección vacía no se muestra. Los generadores locales quedan para cuando no hay backend, y ponen la foto de
  // muestra a los elementos que no traen la suya.
  const db = dbHotel as Record<string, any> | null;
  const section = <T extends object>(value: unknown, sample: T[]): T[] =>
    !db ? sample : Array.isArray(value) ? (value as T[]).map((item, i) => ({ ...item, image: (item as any).image || (sample[i % sample.length] as any)?.image })) : [];
  const policies = useMemo(() => { const g = generatePolicies(staticHotel || null); return db?.policies && !Array.isArray(db.policies) ? { ...g, ...db.policies } as typeof g : g; }, [staticHotel, db]);
  const rooms = useMemo(() => { const g = generateRooms(staticHotel || null); const r = section(db?.room_types, g); return r.length ? r : g; }, [staticHotel, db]);
  const restaurants = useMemo(() => section(db?.dining, generateRestaurants(staticHotel || null)), [staticHotel, db]);
  const bars = useMemo(() => section(db?.bars_lounges, generateBars(staticHotel || null)), [staticHotel, db]);
  const nightlife = useMemo(() => section(db?.nightlife, generateNightlife(staticHotel || null)), [staticHotel, db]);
  const spa = useMemo(() => { const g = generateSpa(staticHotel || hotelName); return !db ? g : db.spa_info ? { ...g, ...db.spa_info } as typeof g : null; }, [staticHotel, hotelName, db]);
  const pools = useMemo(() => section(db?.pools, generatePools(staticHotel || null)), [staticHotel, db]);
  const faqs: { q: string; a: string }[] | undefined = db ? (Array.isArray(db.faqs) ? db.faqs : []) : undefined;
  const hotelExtras = (db?.extras ?? {}) as { day_pass?: { price?: string; hours?: string; includes?: string }; kids_policy?: { title?: string; text?: string }; nightlife_summary?: string; experience_tags?: string[] };

  const selectedRoom = rooms[selectedRoomIndex] || rooms[0];
  // WhatsApp sólo con el teléfono del propio hotel: nunca un número genérico.
  const hotelPhone = String(dbHotel?.phone ?? "").replace(/\D/g, "");
  const hotelWhatsapp = hotelPhone.length >= 10 ? `https://wa.me/${hotelPhone}?text=${encodeURIComponent(`Hola, vi ${hotelName} en Descubre República Dominicana y quisiera consultar disponibilidad.`)}` : undefined;

  const tags = db ? hotelExtras.experience_tags ?? [] : [
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
          <h1 className="text-3xl font-bold text-foreground mb-4">{pc.tx("h1.1", "Alojamiento no encontrado")}</h1>
          <p className="text-muted-foreground mb-6">{pc.tx("p.1", "No pudimos encontrar el hotel o resort solicitado.")}</p>
          <Button asChild className="rounded-xl">
            <Link to="/alojamientos">{pc.tx("Link.1", "Explorar todos los alojamientos")}</Link>
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

      {/* Información y acciones: las mismas que en restaurantes y bares */}
      <section aria-label={`Información y acciones de ${hotelName}`} className="border-b border-border/60 bg-card/60 backdrop-blur-sm mb-8">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <SelloVerificadoBadge variant="full" size="sm" licenseNumber="MITUR-HOT-2026" />
          </div>
          <PlaceActions
            primary={{ label: "Reservar", icon: CalendarCheck, onClick: () => scrollToSection("hotel-booking") }}
            secondary={[{ label: "Habitaciones", icon: Bed, onClick: () => scrollToSection("hotel-rooms") }]}
            whatsappUrl={hotelWhatsapp}
            shareTitle={hotelName}
            claim={{ name: hotelName, type: "hotel", id: dbHotel?.id || staticHotel?.id || id }}
          />
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Details, Rooms, Pools, Food, Nightlife, Spa, FAQ (8 cols) */}
          <div className="lg:col-span-8 space-y-12 order-2 lg:order-1">
            {/* Overview & Story */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                <Crown className="h-6 w-6 text-primary" />{pc.tx("h2.1", "Sobre la Experiencia Todo Incluido en")}{" "}{hotelName}
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

            {/* Resumen de instalaciones, pasadía y política de niños */}
            <HotelHighlights
              poolsCount={pools.length}
              restaurantsCount={restaurants.length}
              barsCount={bars.length}
              spaName={spa?.name}
              nightlifeSummary={db ? hotelExtras.nightlife_summary : "Discoteca, Teatro & Shows"}
              dayPass={db ? hotelExtras.day_pass : undefined}
              kidsPolicy={db ? hotelExtras.kids_policy : undefined}
              fromBackend={!!db}
            />

            {/* Experiencia Inmersiva Bento & Cronograma de Huésped */}
            <HotelExperienceBento
              hotelName={hotelName}
              tour360Url={(dbHotel as any)?.tour_360_url || undefined}
              images={hotelImages}
              guestTimeline={(dbHotel as any)?.guest_timeline?.length ? (dbHotel as any).guest_timeline : undefined}
              ecoGuidelines={(dbHotel as any)?.eco_guidelines?.length ? (dbHotel as any).eco_guidelines : undefined}
            />

            {/* Room & Suite Selector */}
            <div id="hotel-rooms" className="scroll-mt-24">
            <AccommodationRooms
              rooms={rooms}
              selectedRoomIndex={selectedRoomIndex}
              onSelectRoom={setSelectedRoomIndex}
            />
            </div>

            {/* Pools & Aquatic Complex */}
            {pools.length > 0 && <AccommodationPools pools={pools} />}

            {/* Culinary & Dining Experience */}
            {restaurants.length + bars.length > 0 && <AccommodationDining restaurants={restaurants} bars={bars} />}

            {/* Nightlife, Disco & Shows */}
            {nightlife.length > 0 && <AccommodationNightlife nightlife={nightlife} />}

            {/* Spa & Wellness */}
            {spa && <AccommodationSpa spa={spa} />}

            {/* Policies */}
            <AccommodationPolicies policies={policies} />

            {/* FAQs */}
            <HotelFaqSection faqs={faqs} />

            {/* Pasaporte y comunidad: después de la información del hotel, no antes */}
            <ParticipationInvite placeName={hotelName} />

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
          <div className="lg:col-span-4 scroll-mt-24 order-1 lg:order-2" id="hotel-booking">
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
            <h2 className="text-2xl font-bold text-foreground">{pc.tx("h2.2", "Galería Fotográfica de")}{" "}{hotelName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{pc.tx("p.2", "Explora las instalaciones, habitaciones, piscinas y áreas comunes.")}</p>
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
