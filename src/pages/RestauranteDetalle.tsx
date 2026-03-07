import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, MapPin, Clock, Phone, Globe, Mail, Users, ChevronRight,
  Utensils, DollarSign, Home, Camera, Share2, Compass, Info
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const categoryLabels: Record<string, string> = {
  'fine-dining': 'Alta Cocina',
  'casual': 'Casual',
  'local': 'Comida Local',
  'seafood': 'Mariscos',
  'international': 'Internacional',
  'fusion': 'Fusión',
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [selectedGuests, setSelectedGuests] = useState("2");

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32">
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
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
          <div className="container mx-auto px-4 py-32 text-center">
            <Utensils className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-8">El restaurante que buscas no existe o ha sido removido.</p>
            <Link to="/restaurante"><Button>Ver todos los restaurantes</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const parentDestination = getDestinationById(restaurant.destinationId);
  const allImages = [restaurant.imageUrl, ...restaurant.gallery].filter(Boolean);

  return (
    <PageTransition>
      <SEOHead
        title={`${restaurant.name} - Restaurantes de República Dominicana`}
        description={restaurant.shortDescription || restaurant.description?.slice(0, 160)}
        keywords={`restaurante, ${restaurant.name}, ${restaurant.cuisineType.join(', ')}, República Dominicana`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border mt-16">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="h-3 w-3" /> Inicio
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/restaurante" className="hover:text-primary transition-colors">Restaurantes</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{restaurant.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Gallery Grid */}
        <section className="relative">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] min-h-[400px] rounded-2xl overflow-hidden">
              <div
                className="col-span-2 row-span-2 relative cursor-pointer group"
                onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
              >
                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                      <Utensils className="h-3 w-3 mr-1" /> {categoryLabels[restaurant.category] || restaurant.category}
                    </Badge>
                    {restaurant.isFeatured && (
                      <Badge className="bg-accent/20 text-accent-foreground border-accent/30 backdrop-blur-sm">⭐ Destacado</Badge>
                    )}
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">{restaurant.name}</h1>
                </div>
              </div>
              {allImages.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="relative cursor-pointer group overflow-hidden"
                  onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                >
                  <img src={img} alt={`${restaurant.name} ${i + 2}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {i === 3 && allImages.length > 5 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="text-foreground font-bold text-lg flex items-center gap-2">
                        <Camera className="h-5 w-5" /> +{allImages.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {allImages.length < 5 && [...Array(5 - allImages.length)].map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted/50 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {restaurant.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="font-medium text-foreground">{restaurant.rating}</span>
                  <span>({restaurant.reviewCount} reseñas)</span>
                </div>
              )}
              <span>·</span>
              <span>{restaurant.cuisineType.join(', ')}</span>
              <span>·</span>
              <span className="text-primary font-semibold">{restaurant.priceRange}</span>
              {restaurant.address && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {restaurant.address}</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <FavoriteButton id={restaurant.id} type="restaurante" name={restaurant.name} image={restaurant.imageUrl} location={restaurant.destinationName} variant="button" size="md" />
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" /> Compartir
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Quick Stats */}
              <section>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                    <Utensils className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Cocina</p>
                    <p className="text-sm font-semibold text-foreground">{restaurant.cuisineType[0] || 'Variada'}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                    <DollarSign className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Precio</p>
                    <p className="text-sm font-semibold text-foreground">{restaurant.priceRange}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                    <Clock className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Horario</p>
                    <p className="text-sm font-semibold text-foreground truncate">{restaurant.openingHours || 'Consultar'}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                    <Star className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Calificación</p>
                    <p className="text-sm font-semibold text-foreground">{restaurant.rating}/5</p>
                  </motion.div>
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre {restaurant.name}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{restaurant.description}</p>
              </section>

              {/* Signature Dishes */}
              {restaurant.signatureDishes.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" /> Platos Destacados
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {restaurant.signatureDishes.map((dish, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Utensils className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{dish}</span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Services */}
              {restaurant.services.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" /> Servicios
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-2 px-4 hover:bg-primary/20 transition-colors cursor-default">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {restaurant.gallery.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Galería</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {restaurant.gallery.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        viewport={{ once: true }}
                        className={`rounded-xl overflow-hidden cursor-pointer group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                        onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                      >
                        <img
                          src={img}
                          alt={`${restaurant.name} - ${i + 1}`}
                          className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-32 space-y-6">
                {/* Info Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" /> Información
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Dirección</p>
                        <p className="font-medium text-foreground">{restaurant.address}</p>
                      </div>
                    </div>
                    {restaurant.openingHours && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Horario</p>
                          <p className="font-medium text-foreground">{restaurant.openingHours}</p>
                        </div>
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Teléfono</p>
                          <a href={`tel:${restaurant.phone}`} className="font-medium text-primary hover:underline">{restaurant.phone}</a>
                        </div>
                      </div>
                    )}
                    {restaurant.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <a href={`mailto:${restaurant.email}`} className="font-medium text-primary hover:underline">{restaurant.email}</a>
                        </div>
                      </div>
                    )}
                    {restaurant.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Web</p>
                          <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Visitar sitio</a>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Reservation Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4">Reservar Mesa</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Fecha</label>
                      <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-background" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Hora</label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="13:00">13:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="19:00">19:00</SelectItem>
                            <SelectItem value="20:00">20:00</SelectItem>
                            <SelectItem value="21:00">21:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Personas</label>
                        <Select value={selectedGuests} onValueChange={setSelectedGuests}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 persona</SelectItem>
                            <SelectItem value="2">2 personas</SelectItem>
                            <SelectItem value="3">3 personas</SelectItem>
                            <SelectItem value="4">4 personas</SelectItem>
                            <SelectItem value="5">5 personas</SelectItem>
                            <SelectItem value="6">6+ personas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <Users className="h-4 w-4 mr-2" /> Reservar Ahora
                    </Button>
                  </div>
                </motion.div>

                {/* Location */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Ubicación
                  </h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Compass className="h-4 w-4" /> Ver en Google Maps
                  </Button>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl border border-border p-6 space-y-3">
                  <Button className="w-full">Agregar al Plan de Viaje</Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="h-4 w-4" /> Compartir este Restaurante
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
