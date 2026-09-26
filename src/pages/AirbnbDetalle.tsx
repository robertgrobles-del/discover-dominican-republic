import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Users, Bed, Bath, Home, Heart, Share2, 
  Calendar, Clock, Shield, Wifi, Car, Wind, Waves, 
  UtensilsCrossed, Tv, Coffee, ChevronLeft, ChevronRight,
  X, Check, AlertCircle, MessageCircle, Award, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useLightbox } from "@/hooks/useLightbox";
import { SEOHead } from "@/components/SEOHead";

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

  const getCancellationBadge = () => {
    switch (property.cancellation_policy) {
      case 'flexible': return { label: 'Flexible', color: 'bg-green-500' };
      case 'moderate': return { label: 'Moderada', color: 'bg-yellow-500' };
      case 'strict': return { label: 'Estricta', color: 'bg-red-500' };
      default: return { label: 'Moderada', color: 'bg-yellow-500' };
    }
  };

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
      />
      <Header />

      <main className="pt-20">
        {/* Gallery Section */}
        <section className="relative">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] max-w-7xl mx-auto px-4">
            <div 
              className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden rounded-l-xl"
              onClick={() => openLightbox(0)}
            >
              <img 
                src={images[0]} 
                alt={property.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            {images.slice(1, 5).map((img, idx) => (
              <div 
                key={idx}
                className={`relative cursor-pointer overflow-hidden ${idx === 1 ? 'rounded-tr-xl' : ''} ${idx === 3 ? 'rounded-br-xl' : ''}`}
                onClick={() => openLightbox(idx + 1)}
              >
                <img 
                  src={img} 
                  alt={`${property.name} ${idx + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
            <Button 
              variant="secondary" 
              className="absolute bottom-4 right-8"
              onClick={() => openLightbox(currentImageIndex)}
            >
              Mostrar todas las fotos
            </Button>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-8 flex gap-2">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur">
              <Share2 className="h-5 w-5" />
            </Button>
            <FavoriteButton
              id={property.id}
              type="airbnb"
              name={property.name}
              image={property.image_url || ""}
              location={property.address}
            />
          </div>
        </section>

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
                <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
                
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

              {/* Host Info */}
              <div className="flex items-start gap-4">
                <img 
                  src={property.host_image || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"} 
                  alt={property.host_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Anfitrión: {property.host_name}</h3>
                    {property.is_superhost && (
                      <Badge className="bg-primary">
                        <Award className="h-3 w-3 mr-1" /> Superanfitrión
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" /> {property.host_response_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4" /> {property.host_response_rate}% tasa de respuesta
                    </span>
                    {property.host_languages && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" /> {property.host_languages.join(", ")}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2">{property.host_description}</p>
                </div>
              </div>

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

              {/* Tabs for Policies */}
              <Tabs defaultValue="rules" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rules">Reglas de la casa</TabsTrigger>
                  <TabsTrigger value="safety">Seguridad</TabsTrigger>
                  <TabsTrigger value="cancellation">Cancelación</TabsTrigger>
                </TabsList>
                
                <TabsContent value="rules" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Check-in</p>
                            <p className="text-sm text-muted-foreground">{property.check_in_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Check-out</p>
                            <p className="text-sm text-muted-foreground">{property.check_out_time}</p>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <ul className="space-y-2">
                        {(property.house_rules || []).map((rule, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="safety" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        {(property.safety_features || []).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cancellation" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={getCancellationBadge().color}>
                          {getCancellationBadge().label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Política de cancelación</span>
                      </div>
                      <p className="text-muted-foreground">{property.cancellation_details}</p>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Estadía mínima:</strong> {property.min_nights} noches
                          {property.max_nights && <> • <strong>Estadía máxima:</strong> {property.max_nights} noches</>}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
              <Card className="sticky top-24 shadow-lg">
                <CardHeader>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold">${property.price_per_night || 450}</span>
                      <span className="text-muted-foreground"> /noche</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{property.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">CHECK-IN</label>
                      <Input 
                        type="date" 
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">CHECK-OUT</label>
                      <Input 
                        type="date" 
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">HUÉSPEDES</label>
                    <Input 
                      type="number" 
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      min={1}
                      max={property.guests || 8}
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    {property.instant_book ? "Reservar ahora" : "Solicitar reserva"}
                  </Button>

                  {totals && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="underline">${property.price_per_night} x {totals.nights} noches</span>
                        <span>${totals.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="underline">Tarifa de limpieza</span>
                        <span>${totals.cleaning}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="underline">Tarifa de servicio</span>
                        <span>${totals.service}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${totals.total}</span>
                      </div>
                    </div>
                  )}

                  {property.instant_book && (
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Check className="h-4 w-4 text-primary" />
                      Reserva instantánea disponible
                    </p>
                  )}
                </CardContent>
              </Card>
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
