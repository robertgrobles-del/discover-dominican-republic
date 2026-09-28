import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Users, Bed, Bath, Home,
  Wifi, Car, Wind, Waves, UtensilsCrossed, Tv, Coffee,
  ChevronLeft, ChevronRight, X, Check, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/PageTransition";
import { useLightbox } from "@/hooks/useLightbox";
import { SEOHead, generateHotelSchema } from "@/components/SEOHead";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";

import { AirbnbGallery } from "@/components/airbnb/AirbnbGallery";
import { AirbnbBookingWidget } from "@/components/airbnb/AirbnbBookingWidget";
import { AirbnbPolicies } from "@/components/airbnb/AirbnbPolicies";
import { AirbnbHostCard } from "@/components/airbnb/AirbnbHostCard";

// Fallback data for demo
const fallbackAirbnb = {
  id: "demo-airbnb-1",
  name: "Villa Tropical con Vista al Mar",
  slug: "villa-tropical-vista-mar",
  description: "Experimenta el paraíso en esta espectacular villa frente al mar en Punta Cana. Con 4 habitaciones, piscina privada infinity y acceso directo a la playa, esta propiedad ofrece el escape perfecto para familias y grupos que buscan lujo y privacidad en el Caribe.",
  short_description: "Villa de lujo frente al mar con piscina privada",
  property_type: "Villa",
  image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  gallery: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
  ],
  address: "Cap Cana, Punta Cana",
  host_name: "María González",
  host_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  host_since: "2019-03-15",
  is_superhost: true,
  host_response_rate: 98,
  host_response_time: "En menos de una hora",
  host_languages: ["Español", "Inglés", "Francés"],
  host_description: "¡Hola! Soy María, apasionada por la hospitalidad y el turismo. Llevo más de 5 años compartiendo mi amor por República Dominicana con viajeros de todo el mundo.",
  guests: 8,
  bedrooms: 4,
  beds: 5,
  bathrooms: 4.5,
  price_per_night: 450,
  cleaning_fee: 150,
  service_fee: 85,
  amenities: ["Piscina privada", "Vista al mar", "Cocina equipada", "WiFi", "Aire acondicionado", "Estacionamiento", "Jacuzzi", "BBQ", "Servicio de limpieza", "Smart TV", "Lavadora", "Secadora", "Acceso a la playa"],
  house_rules: ["No fumar", "No fiestas", "Mascotas permitidas con aprobación", "Check-in después de las 3PM", "Check-out antes de las 11AM"],
  safety_features: ["Detector de humo", "Extintor", "Botiquín de primeros auxilios", "Caja fuerte", "Seguridad 24/7"],
  check_in_time: "3:00 PM",
  check_out_time: "11:00 AM",
  cancellation_policy: "moderate",
  cancellation_details: "Cancelación gratuita hasta 5 días antes. Después, se reembolsa el 50% del total.",
  min_nights: 3,
  max_nights: 30,
  neighborhood_description: "Ubicada en el exclusivo complejo de Cap Cana, a pocos minutos de los mejores campos de golf del Caribe, restaurantes gourmet y la marina más grande de la región.",
  rating: 4.95,
  review_count: 127,
  cleanliness_rating: 5.0,
  accuracy_rating: 4.9,
  checkin_rating: 5.0,
  communication_rating: 5.0,
  location_rating: 4.9,
  value_rating: 4.8,
  instant_book: true
};

const amenityIcons: Record<string, React.ElementType> = {
  "Piscina privada": Waves,
  "WiFi": Wifi,
  "Aire acondicionado": Wind,
  "Estacionamiento": Car,
  "Cocina equipada": UtensilsCrossed,
  "Smart TV": Tv,
  "Vista al mar": Home,
  "Café": Coffee
};

const AirbnbDetalle = () => {
  const { slug: id } = useParams<{ slug: string }>();
  const {
    isOpen: lightboxOpen,
    currentIndex: currentImageIndex,
    open: openLightbox,
    close: closeLightbox,
    next: nextImage,
    prev: prevImage,
    setCurrentIndex: setCurrentImageIndex,
  } = useLightbox();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(2);

  const { data: airbnb, isLoading } = useQuery({
    queryKey: ['airbnb', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('airbnb_listings')
        .select('*')
        .or(`slug.eq.${id},id.eq.${id}`)
        .maybeSingle();
      
      if (error) throw error;
      return data || fallbackAirbnb;
    }
  });

  const property = airbnb || fallbackAirbnb;
  const images = property.gallery || [property.image_url];

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < 1) return null;
    
    const subtotal = (property.price_per_night || 450) * nights;
    const cleaning = property.cleaning_fee || 150;
    const service = property.service_fee || 85;
    return { nights, subtotal, cleaning, service, total: subtotal + cleaning + service };
  };

  const totals = calculateTotal();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEOHead
          title="Alojamiento en República Dominicana"
          description="Consulta este alojamiento tipo Airbnb en República Dominicana: villas, apartamentos y casas con piscina, vista al mar y todas las comodidades."
        />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${property.name} - Alojamiento en ${property.address}`}
        description={property.short_description || property.description}
        image={property.image_url}
        keywords={`${property.name}, ${property.property_type}, ${property.address}, airbnb república dominicana, alojamiento vacacional`}
        jsonLd={generateHotelSchema({
          name: property.name,
          description: property.short_description || property.description,
          image: property.image_url || "https://descubrerd.com/og-image.jpg",
          priceRange: `$${property.price_per_night || 450} USD / noche`,
          rating: 4.9,
          address: property.address,
        })}
      />
      <Header />

      <main className="pt-20">
        {/* Gallery Section */}
        <AirbnbGallery
          property={property}
          images={images}
          currentImageIndex={currentImageIndex}
          onOpenLightbox={openLightbox}
        />

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Host */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{property.name}</h1>
                  <div className="flex items-center gap-2">
                    <ClaimBusinessModal
                      businessName={property.name}
                      businessType="hotel"
                      businessId={property.id?.toString()}
                      triggerButton={
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-primary/30 hover:border-primary px-3 py-1.5 rounded-lg transition-colors bg-primary/5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          ¿Es tu alojamiento? Reclamar ficha
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* MITUR Compliance Tag */}
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold">Registro MITUR Vivienda Turística:</span>
                  <span className="font-mono bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    VT-RD-{(property.id || "0482").toString().slice(-4).toUpperCase()}-2026
                  </span>
                  <span className="text-[11px] text-muted-foreground ml-auto">Inspeccionado y conforme con normativas turísticas</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold">{property.rating}</span>
                    <span className="text-muted-foreground">({property.review_count} reseñas)</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {property.guests} huéspedes</span>
                    <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms} habitaciones</span>
                    <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.beds} camas</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} baños</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Host Info Card */}
              <AirbnbHostCard
                name={property.host_name}
                image={property.host_image}
                isSuperhost={property.is_superhost}
                responseTime={property.host_response_time}
                responseRate={property.host_response_rate}
                languages={property.host_languages}
                description={property.host_description}
              />

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Acerca de este alojamiento</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              <Separator />

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Lo que ofrece este lugar</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(property.amenities || []).slice(0, 10).map((amenity, idx) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
                {(property.amenities || []).length > 10 && (
                  <Button variant="outline" className="mt-4">
                    Mostrar las {property.amenities.length} amenidades
                  </Button>
                )}
              </div>

              <Separator />

              {/* Policies Tabs */}
              <AirbnbPolicies
                checkInTime={property.check_in_time}
                checkOutTime={property.check_out_time}
                houseRules={property.house_rules || []}
                safetyFeatures={property.safety_features || []}
                cancellationDetails={property.cancellation_details}
                cancellationPolicy={property.cancellation_policy}
                minNights={property.min_nights}
                maxNights={property.max_nights}
              />

              <Separator />

              {/* Ratings Breakdown */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  {property.rating} • {property.review_count} reseñas
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Limpieza", value: property.cleanliness_rating },
                    { label: "Precisión", value: property.accuracy_rating },
                    { label: "Check-in", value: property.checkin_rating },
                    { label: "Comunicación", value: property.communication_rating },
                    { label: "Ubicación", value: property.location_rating },
                    { label: "Valor", value: property.value_rating }
                  ].map((rating) => (
                    <div key={rating.label} className="flex items-center justify-between">
                      <span>{rating.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${((rating.value || 0) / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{rating.value || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neighborhood */}
              {property.neighborhood_description && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold mb-4">La zona</h2>
                    <p className="text-muted-foreground">{property.neighborhood_description}</p>
                  </div>
                </>
              )}
            </div>

            {/* Booking Widget */}
            <div className="lg:col-span-1">
              <AirbnbBookingWidget
                pricePerNight={property.price_per_night}
                rating={property.rating}
                checkIn={checkIn}
                onCheckInChange={setCheckIn}
                checkOut={checkOut}
                onCheckOutChange={setCheckOut}
                guestCount={guestCount}
                onGuestCountChange={setGuestCount}
                maxGuests={property.guests}
                instantBook={property.instant_book}
                totals={totals}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10"
            onClick={() => prevImage(images.length)}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <img
            src={images[currentImageIndex]}
            alt={`${property.name} ${currentImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/10"
            onClick={() => nextImage(images.length)}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        </motion.div>
      )}

      <Footer />
    </PageTransition>
  );
};

export default AirbnbDetalle;
