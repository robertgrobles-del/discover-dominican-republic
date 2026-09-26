import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star, MapPin, Clock, DollarSign, Share2,
  Utensils, CheckCircle2, UtensilsCrossed, HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { getRestaurantBySlug, type Restaurant } from "@/data/restaurants";
import { getEnrichedRestaurantBySlug } from "@/data/provinceEnrichment";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RestaurantHeroSlider } from "@/components/restaurant/RestaurantHeroSlider";
import { RestaurantDishesGrid, SignatureDishDetail } from "@/components/restaurant/RestaurantDishesGrid";
import { RestaurantReservationCard } from "@/components/restaurant/RestaurantReservationCard";
import { RestaurantAmbienceCard } from "@/components/restaurant/RestaurantAmbienceCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";
import { calculateOpenStatus } from "@/lib/openStatus";

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
  const enrichedRestaurant = (!staticRestaurant && slug) ? getEnrichedRestaurantBySlug(slug) : null;

  const enrichedFallback: Restaurant | null = enrichedRestaurant ? {
    id: enrichedRestaurant.id,
    slug: enrichedRestaurant.slug,
    name: enrichedRestaurant.name,
    destinationId: "republica-dominicana",
    destinationName: enrichedRestaurant.address.split(",").pop()?.trim() || "República Dominicana",
    province: enrichedRestaurant.address.split(",").pop()?.trim() || "República Dominicana",
    cuisineType: [enrichedRestaurant.category || "Dominicana", "Criolla", "Mariscos & Parrilla"],
    category: "local",
    shortDescription: enrichedRestaurant.shortDescription,
    description: `${enrichedRestaurant.shortDescription} Ubicado en ${enrichedRestaurant.address}, este reconocido restaurante deleita a locales y viajeros con las recetas más emblemáticas de la cocina dominicana, ingredientes frescos de productores regionales y una cálida atención criolla.`,
    imageUrl: enrichedRestaurant.imageUrl,
    gallery: [
      enrichedRestaurant.imageUrl,
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
    ],
    signatureDishes: [
      {
        name: "Plato Especial de la Casa",
        description: "Elaborado con sazón tradicional, hierbas frescas del huerto y guarnición de tostones dorados.",
        price: "RD$ 650",
        imageUrl: enrichedRestaurant.imageUrl
      },
      {
        name: "Chivo Liniero al Ron Dominicano",
        description: "Guisado lentamente con orégano silvestre, ajíes gustosos y toque de ron añejo de la isla.",
        price: "RD$ 850",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80"
      },
      {
        name: "Pescado Fresco al Coco Samaná",
        description: "Filete del día bañado en suave salsa de leche de coco natural y cilantro fresco.",
        price: "RD$ 790",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
      }
    ],
    priceRange: (enrichedRestaurant.priceRange as Restaurant['priceRange']) || '$$',
    rating: enrichedRestaurant.rating || 4.8,
    reviewCount: 94,
    address: enrichedRestaurant.address,
    phone: "+1 809-555-0198",
    email: "reservas@descubrerd.com",
    website: "https://descubrerd.com",
    openingHours: "Lunes a Domingo: 11:30 AM - 11:00 PM",
    services: ["Aire Acondicionado", "Terraza al Aire Libre", "Estacionamiento Privado", "Wi-Fi Gratuito", "Menú Infantil", "Música Dominicana"],
    isFeatured: true,
  } : null;

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
    enabled: !staticRestaurant && !enrichedFallback && !!slug,
  });
  return { restaurant: staticRestaurant || enrichedFallback || dbRestaurant, isLoading: !staticRestaurant && !enrichedFallback && isLoading };
}

export default function RestauranteDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, isLoading } = useRestaurantData(slug);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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

  const signatureDishesDetailed: SignatureDishDetail[] = (restaurant.signatureDishes.length > 0 ? restaurant.signatureDishes : ["Chillo Boca Chica al Coco", "Filete Mignon Criollo", "Risotto de Yautía con Mariscos", "Cacao Bombón Dominicano"]).map((dish, i) => {
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

  return (
    <PageTransition>
      <SEOHead
        title={`${restaurant.name} - Menú, Reservas y Opiniones en RD`}
        description={restaurant.shortDescription || restaurant.description?.slice(0, 160)}
        keywords={`restaurante, ${restaurant.name}, ${restaurant.cuisineType.join(', ')}, gastronomía dominicana`}
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header hasHero />

        {/* Hero Slider with ONLY restaurant images */}
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
        />

        {/* Action / Meta Bar */}
        <section className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{restaurant.cuisineType.join(', ')}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl text-xs font-bold text-primary">
                <span>Consumo promedio: {restaurant.priceRange === '$$$$' ? 'RD$ 2,800 – 4,500 (~$45–$75 USD)' : restaurant.priceRange === '$$$' ? 'RD$ 1,600 – 2,800 (~$25–$45 USD)' : 'RD$ 750 – 1,500 (~$12–$25 USD)'} / pers.</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20">🌱 Opciones Veganas</span>
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md border border-amber-500/20">🌾 Sin Gluten</span>
              </div>
              <span>•</span>
              {(() => {
                const status = calculateOpenStatus(restaurant.openingHours);
                return (
                  <Badge variant="outline" className={`text-[11px] font-bold gap-1 ${status.badgeClass}`}>
                    <Clock className="h-3 w-3" />
                    {status.statusLabel}
                  </Badge>
                );
              })()}
              {restaurant.address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-xs"><MapPin className="h-3.5 w-3.5 text-primary" /> {restaurant.address}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ClaimBusinessModal
                businessName={restaurant.name}
                businessType="restaurante"
                businessId={restaurant.id}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl w-fit"
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
        <main className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Utensils className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Tipo de Cocina</p>
                  <p className="text-sm font-bold text-foreground truncate">{restaurant.cuisineType[0] || 'Gourmet'}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <DollarSign className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Rango de Precio</p>
                  <p className="text-sm font-bold text-foreground">{restaurant.priceRange} Premium</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Horario</p>
                  <p className="text-sm font-bold text-foreground truncate">{restaurant.openingHours || '12:00 - 23:00'}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400 mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Calificación</p>
                  <p className="text-sm font-bold text-foreground">{restaurant.rating} / 5.0</p>
                </div>
              </div>

              {/* Description & Culinary Philosophy */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                  Experiencia y Filosofía Culinaria
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg whitespace-pre-line">
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

              {/* Signature Dishes Grid */}
              <RestaurantDishesGrid dishes={signatureDishesDetailed} />

              {/* Ambience, Wine & Cocktails */}
              <RestaurantAmbienceCard />

              {/* FAQs Accordion */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  Preguntas Frecuentes
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

              {/* User Reviews & Comments */}
              <div className="pt-4">
                <CommentSection
                  contentId={restaurant.id}
                  contentType="restaurant"
                  title={`Opiniones sobre ${restaurant.name}`}
                />
              </div>

            </div>

            {/* Right Column (4 cols - Reservation Card) */}
            <div className="lg:col-span-4">
              <RestaurantReservationCard 
                restaurantName={restaurant.name}
                phone={restaurant.phone}
                website={restaurant.website}
                email={restaurant.email}
                address={restaurant.address}
                openingHours={restaurant.openingHours}
              />
            </div>

          </div>
        </main>

        {/* Full Photo Grid Gallery al final de la ficha */}
        {allImages.length > 1 && (
          <section className="container mx-auto px-4 lg:px-8 py-12 border-t border-border/60">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Galería y Ambiente de {restaurant.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Conoce los espacios gastronómicos, salón principal, terraza y presentación de platos.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allImages.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted group">
                  <img
                    src={img}
                    alt={`${restaurant.name} foto ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mobile Sticky Floating Bar */}
        <DetailFloatingBar 
          title={restaurant.name}
          price={restaurant.priceRange}
          pricePeriod="consumo prom."
          rating={restaurant.rating}
          ctaText="Reservar Mesa"
          onCtaClick={() => {
            const resElement = document.getElementById("res-name");
            if (resElement) {
              resElement.scrollIntoView({ behavior: "smooth", block: "center" });
              resElement.focus();
            }
          }}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
