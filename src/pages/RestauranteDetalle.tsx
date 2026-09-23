import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Clock, Phone, Globe, Mail, Users, ChevronRight,
  Utensils, DollarSign, Home, Camera, Share2, Compass, Info,
  Wine, ShieldCheck, CheckCircle2, Heart, Award, UtensilsCrossed,
  Flame, Leaf, Calendar, ExternalLink, HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbox } from "@/components/ui/lightbox";
import { getRestaurantBySlug, type Restaurant } from "@/data/restaurants";
import { getDestinationById } from "@/data/destinations";
import { getHotelsByDestination } from "@/data/hotels";
import { getExperiencesByDestination } from "@/data/experiences";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DetailPageSidebarAd, InlineAd, MobileStickyFooterAd } from "@/components/promo";
import { RestaurantHeroSlider } from "@/components/restaurant/RestaurantHeroSlider";

const categoryLabels: Record<string, string> = {
  'fine-dining': 'Alta Cocina & Autor',
  'casual': 'Cocina Casual Chic',
  'local': 'Gastronomía Criolla Dominicana',
  'seafood': 'Marisquería & Pescados del Día',
  'international': 'Cocina Internacional',
  'fusion': 'Fusión Caribeña Contemporánea',
};

function useRestaurantData(slug: string | undefined) {
  const staticRestaurant = slug ? getRestaurantBySlug(slug) : null;
  const { data: dbRestaurant, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (error || !data) return null;
      return {
        id: data.id, slug: data.slug || data.id, name: data.name,
        destinationId: data.destination_id || '', destinationName: '', province: '',
        cuisineType: data.cuisine_type ? [data.cuisine_type] : [],
        category: (data.category as Restaurant['category']) || 'casual',
        shortDescription: data.short_description || '', description: data.description || '',
        imageUrl: data.image_url || '/placeholder.svg', gallery: data.gallery || [],
        signatureDishes: data.signature_dishes || [],
        priceRange: (data.price_range as Restaurant['priceRange']) || '$$',
        rating: Number(data.rating) || 0, reviewCount: data.review_count || 0,
        address: data.address || '', phone: data.phone || undefined,
        email: data.email || undefined, website: data.website || undefined,
        openingHours: data.opening_hours || '', services: data.services || [],
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        isFeatured: data.is_featured || false,
      } as Restaurant;
    },
    enabled: !staticRestaurant && !!slug,
  });
  return { restaurant: staticRestaurant || dbRestaurant, isLoading: !staticRestaurant && isLoading };
}

export default function RestauranteDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, isLoading } = useRestaurantData(slug);
  const nearbyHotels = useMemo(
    () => (restaurant?.destinationId ? getHotelsByDestination(restaurant.destinationId) : []),
    [restaurant?.destinationId]
  );
  const nearbyExperiences = useMemo(
    () => (restaurant?.destinationId ? getExperiencesByDestination(restaurant.destinationId) : []),
    [restaurant?.destinationId]
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Reservation Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [selectedGuests, setSelectedGuests] = useState("2");
  const [reservationName, setReservationName] = useState("");
  const [specialRequest, setSpecialRequest] = useState("Sin preferencias");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 space-y-6">
            <Skeleton className="h-[450px] w-full rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!restaurant) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Utensils className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-6 text-sm">El restaurante que buscas no se encuentra disponible o ha sido actualizado.</p>
            <Button asChild className="rounded-xl"><Link to="/restaurante">Ver Guía Gastronómica</Link></Button>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const allImages = [restaurant.imageUrl, ...restaurant.gallery].filter(Boolean);

  const signatureDishesDetailed = restaurant.signatureDishes.map((dish, i) => {
    const descriptions = [
      "Preparado con pesca artesanal fresca, reducción de coco criollo y toques cítricos de naranja agria de monte.",
      "Corte premium a la parrilla de leña con chimichurri dominicano de hierbas silvestres y puré rústico de yautía.",
      "Elaboración de autor que fusiona técnicas de alta cocina europea con ingredientes autóctonos de la cordillera central.",
      "Postre emblemático reinventado con chocolate orgánico de San Francisco de Macorís y frutos del bosque caribeño."
    ];
    const tagsList = [
      ["Pesca del Día", "Sin Gluten", "Recomendación del Chef"],
      ["A las Brasas", "Corte Angus", "Firma de la Casa"],
      ["Orgánico Local", "Plato Estrella"],
      ["Repostería de Autor", "Cacao Dominicano"]
    ];
    const pairings = [
      "Maridaje sugerido: Vino blanco Albariño o Sauvignon Blanc fresco",
      "Maridaje sugerido: Cabernet Sauvignon Reserva o Ron Dominicano Imperial",
      "Maridaje sugerido: Chardonnay con paso por barrica o Cóctel Cítrico",
      "Maridaje sugerido: Ron Añejo Dominicano Gran Reserva o Café de Altura"
    ];

    return {
      title: dish,
      desc: descriptions[i % descriptions.length],
      tags: tagsList[i % tagsList.length],
      pairing: pairings[i % pairings.length],
      priceEst: restaurant.priceRange === '$$$$' ? `$${32 + i * 8} USD` : restaurant.priceRange === '$$$' ? `$${22 + i * 5} USD` : `$${14 + i * 3} USD`
    };
  });

  const faqs = [
    {
      q: "¿Es necesario reservar con anticipación?",
      a: "Para turnos de cena y fines de semana recomendamos reservar con al menos 24 a 48 horas de anticipación para asegurar mesa en terraza o salón principal."
    },
    {
      q: "¿Cuentan con código de vestimenta?",
      a: restaurant.category === 'fine-dining' 
        ? "El código de vestimenta es Smart Casual / Elegante. No se permite el acceso en trajes de baño o sandalias de playa para el servicio de cena."
        : "El código de vestimenta es Casual. Se requiere vestimenta adecuada y calzado para ingresar al salón."
    },
    {
      q: "¿Disponen de opciones para vegetarianos y celíacos?",
      a: "Sí, la carta cuenta con opciones vegetarianas y sin gluten claramente señalizadas. Además, el equipo de cocina puede adaptar platos a intolerancias alimentarias."
    },
    {
      q: "¿Ofrecen servicio de Valet Parking?",
      a: "Sí, el establecimiento cuenta con estacionamiento privado vigilado y servicio de Valet Parking para la comodidad de los comensales."
    }
  ];

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationName.trim()) {
      toast.error("Por favor ingresa tu nombre para la reserva");
      return;
    }
    toast.success("¡Mesa Reservada con Éxito!", {
      description: `Confirmación enviada a nombre de ${reservationName} para ${selectedGuests} personas el ${selectedDate} a las ${selectedTime}. ¡Buen provecho!`
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${restaurant.name} - Menú, Reservas y Opiniones en RD`}
        description={restaurant.shortDescription || restaurant.description?.slice(0, 160)}
        keywords={`restaurante, ${restaurant.name}, ${restaurant.cuisineType.join(', ')}, gastronomía dominicana`}
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header hasHero />

        {/* Hero Slider */}
        <RestaurantHeroSlider
          images={allImages}
          name={restaurant.name}
          location={restaurant.destinationName || restaurant.address}
          destinationSlug={restaurant.destinationId}
          destinationName={restaurant.destinationName}
          rating={restaurant.rating}
          categoryLabel={categoryLabels[restaurant.category] || restaurant.category}
          isFeatured={restaurant.isFeatured}
          favoriteId={restaurant.id}
          hotels={nearbyHotels}
          experiences={nearbyExperiences}
        />

        {/* Action / Meta Bar */}
        <section className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{restaurant.cuisineType.join(', ')}</span>
              <span>•</span>
              <span className="text-primary font-bold">{restaurant.priceRange} (Gama de Precio)</span>
              {restaurant.address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {restaurant.address}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => {
                  if (navigator.share) navigator.share({ title: restaurant.name, url: window.location.href });
                  else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Enlace copiado al portapapeles");
                  }
                }}
              >
                <Share2 className="h-4 w-4" /> Compartir
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Layout */}
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* Left Column (Story, Signature Dishes, Menu Highlights, Experience, FAQ) */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Utensils className="h-6 w-6 text-primary mx-auto mb-1.5" />
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Tipo de Cocina</p>
                  <p className="text-sm font-bold text-foreground truncate">{restaurant.cuisineType[0] || 'Gourmet'}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <DollarSign className="h-6 w-6 text-primary mx-auto mb-1.5" />
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Rango de Precio</p>
                  <p className="text-sm font-bold text-foreground">{restaurant.priceRange} Premium</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-1.5" />
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Horario de Servicio</p>
                  <p className="text-sm font-bold text-foreground truncate">{restaurant.openingHours || '12:00 - 23:00'}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Star className="h-6 w-6 text-amber-400 fill-amber-400 mx-auto mb-1.5" />
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Calificación</p>
                  <p className="text-sm font-bold text-foreground">{restaurant.rating} / 5.0</p>
                </div>
              </div>

              {/* Description & Culinary Philosophy */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                  Experiencia y Filosofía Culinaria
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-6 whitespace-pre-line">
                  {restaurant.description || "Una propuesta gastronómica excepcional que resalta lo mejor de la cocina dominicana e internacional con ingredientes frescos de la más alta calidad y un servicio impecable."}
                </p>
                
                {restaurant.services.length > 0 && (
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Servicios & Amenidades del Restaurante</p>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="bg-muted/70 text-foreground py-1 px-3 rounded-lg text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Signature Dishes Cards */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                    <Flame className="h-6 w-6 text-primary" />
                    Platos Estrella y Creaciones del Chef
                  </h3>
                  <p className="text-sm text-muted-foreground">Especialidades icónicas recomendadas para tu visita</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {signatureDishesDetailed.map((dish, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="bg-card rounded-3xl p-6 border border-border hover:border-primary/40 transition-all duration-300 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <Utensils className="h-5 w-5" />
                          </div>
                          <span className="font-black text-foreground text-sm bg-muted/60 px-2.5 py-1 rounded-lg">
                            {dish.priceEst}
                          </span>
                        </div>
                        
                        <h4 className="font-display text-lg font-bold text-foreground mb-1.5">{dish.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{dish.desc}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-1.5">
                          {dish.tags.map((t, ti) => (
                            <span key={ti} className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/90 italic">
                          <Wine className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{dish.pairing}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Atmosphere & Ambience Info */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <Wine className="h-6 w-6 text-primary" />
                  Ambiente, Coctelería & Cava
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
                    <p className="text-xs font-bold text-primary uppercase mb-1">Música & Clima</p>
                    <p className="text-sm font-bold text-foreground">Ambiente Lounge & Acústico</p>
                    <p className="text-xs text-muted-foreground mt-1">Música suave seleccionada para veladas gastronómicas íntimas.</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
                    <p className="text-xs font-bold text-primary uppercase mb-1">Cava de Vinos</p>
                    <p className="text-sm font-bold text-foreground">Selección Internacional</p>
                    <p className="text-xs text-muted-foreground mt-1">Etiquetas del Viejo y Nuevo Mundo con sommelier en sala.</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
                    <p className="text-xs font-bold text-primary uppercase mb-1">Mixología</p>
                    <p className="text-sm font-bold text-foreground">Cócteles Botánicos</p>
                    <p className="text-xs text-muted-foreground mt-1">Tragos de autor con rones añejos dominicanos y botánicos frescos.</p>
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  Preguntas Frecuentes sobre el Restaurante
                </h3>
                
                <div className="space-y-3">
                  {faqs.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div key={idx} className="border border-border rounded-2xl overflow-hidden">
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

            </div>

            {/* Right Column (Reservation Card & Details Sidebar) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-6">
                
                {/* Interactive Table Booking Card */}
                <div className="bg-card rounded-3xl border border-border p-6 shadow-xl ring-1 ring-border/50">
                  <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground">Reservar Mesa</h3>
                      <p className="text-xs text-muted-foreground">Confirmación instantánea sin cargos</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>

                  <form onSubmit={handleReservation} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Nombre Completo</label>
                      <Input 
                        placeholder="Ej. Roberto Guzmán"
                        value={reservationName}
                        onChange={(e) => setReservationName(e.target.value)}
                        className="bg-background rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Fecha</label>
                      <Input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        className="bg-background rounded-xl text-xs font-medium" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Turno / Hora</label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger className="bg-background rounded-xl text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12:30">12:30 PM (Almuerzo)</SelectItem>
                            <SelectItem value="13:30">01:30 PM (Almuerzo)</SelectItem>
                            <SelectItem value="19:00">07:00 PM (Cena)</SelectItem>
                            <SelectItem value="20:00">08:00 PM (Cena)</SelectItem>
                            <SelectItem value="21:00">09:00 PM (Cena)</SelectItem>
                            <SelectItem value="22:00">10:00 PM (Cena)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Comensales</label>
                        <Select value={selectedGuests} onValueChange={setSelectedGuests}>
                          <SelectTrigger className="bg-background rounded-xl text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Persona</SelectItem>
                            <SelectItem value="2">2 Personas (Pareja)</SelectItem>
                            <SelectItem value="3">3 Personas</SelectItem>
                            <SelectItem value="4">4 Personas</SelectItem>
                            <SelectItem value="5">5 Personas</SelectItem>
                            <SelectItem value="6">6+ Personas (Grupo)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Ubicación Preferida</label>
                      <Select value={specialRequest} onValueChange={setSpecialRequest}>
                        <SelectTrigger className="bg-background rounded-xl text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sin preferencias">Sin preferencia</SelectItem>
                          <SelectItem value="Terraza al aire libre">Terraza al aire libre</SelectItem>
                          <SelectItem value="Salón Climatizado">Salón Climatizado</SelectItem>
                          <SelectItem value="Celebración de Cumpleaños">Celebración de Cumpleaños</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full py-5 text-sm font-bold rounded-xl shadow-md">
                      <Users className="h-4 w-4 mr-2" /> Confirmar Reserva de Mesa
                    </Button>
                  </form>
                </div>

                {/* Practical Contact Info Card */}
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                  <h4 className="font-display font-bold text-foreground mb-4 text-sm uppercase tracking-wider">
                    Contacto Directo
                  </h4>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Dirección</p>
                        <p className="text-muted-foreground">{restaurant.address || "República Dominicana"}</p>
                      </div>
                    </div>

                    {restaurant.openingHours && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Horario</p>
                          <p className="text-muted-foreground">{restaurant.openingHours}</p>
                        </div>
                      </div>
                    )}

                    {restaurant.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Teléfono de Reservas</p>
                          <a href={`tel:${restaurant.phone}`} className="text-primary font-bold hover:underline">
                            {restaurant.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {restaurant.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Sitio Web & Carta</p>
                          <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1">
                            Ver Menú Completo <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Action */}
                <div className="bg-card rounded-3xl border border-border p-5 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2">
                    <Compass className="h-6 w-6 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-foreground mb-1">¿Cómo llegar?</p>
                  <p className="text-[11px] text-muted-foreground mb-3">{restaurant.address}</p>
                  
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl gap-1.5 text-xs font-semibold">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.name + " " + restaurant.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Abrir en Google Maps <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </Button>
                </div>

                {/* Ad Banner */}
                <DetailPageSidebarAd showDemo />
              </div>
            </div>

          </div>
        </div>

        {/* Lightbox for gallery images */}
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        <InlineAd showDemo variant="large" />
        <MobileStickyFooterAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
