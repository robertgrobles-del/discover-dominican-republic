import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Phone, Globe, Mail, Users, ChevronRight, Utensils, DollarSign, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DetailPageSidebarAd, MobileStickyFooterAd } from "@/components/ads";
import { getRestaurantBySlug, type Restaurant } from "@/data/restaurants";
import { getDestinationBySlug, getDestinationById } from "@/data/destinations";
import { supabase } from "@/integrations/supabase/client";

function useRestaurantBySlug(slug?: string) {
  const [dbRestaurant, setDbRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const staticRestaurant = slug ? getRestaurantBySlug(slug) : null;

  useEffect(() => {
    if (staticRestaurant || !slug) return;
    setLoading(true);
    supabase.from('restaurants').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDbRestaurant({
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
          });
        }
        setLoading(false);
      });
  }, [slug, staticRestaurant]);

  return { restaurant: staticRestaurant || dbRestaurant, loading };
}

export default function RestauranteDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, loading } = useRestaurantBySlug(slug);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [selectedGuests, setSelectedGuests] = useState("2");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Restaurante no encontrado</h1>
          <p className="text-muted-foreground mb-8">El restaurante que buscas no existe o ha sido removido.</p>
          <Link to="/restaurante">
            <Button>Ver todos los restaurantes</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Obtener destino padre para breadcrumbs
  const parentDestination = getDestinationById(restaurant.destinationId);

  // Generar breadcrumbs
  const breadcrumbs = [
    { label: "Inicio", href: "/" },
    { label: "Restaurantes", href: "/restaurante" },
    { label: restaurant.province, href: `/destino/${restaurant.provinceId || restaurant.destinationId}` },
  ];

  if (parentDestination && parentDestination.slug !== restaurant.provinceId) {
    breadcrumbs.push({
      label: parentDestination.name,
      href: `/destino/${parentDestination.slug}`
    });
  }

  breadcrumbs.push({ label: restaurant.name, href: "#" });

  // Mapear categoría a español
  const categoryLabels: Record<string, string> = {
    'fine-dining': 'Alta Cocina',
    'casual': 'Casual',
    'local': 'Comida Local',
    'seafood': 'Mariscos',
    'international': 'Internacional',
    'fusion': 'Fusión'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] mt-16">
        <div className="absolute inset-0">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                ) : (
                  <Link to={crumb.href} className="hover:text-primary transition-colors flex items-center gap-1">
                    {index === 0 && <Home className="h-3 w-3" />}
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary">
                {categoryLabels[restaurant.category] || restaurant.category}
              </Badge>
              {restaurant.isFeatured && (
                <Badge className="bg-yellow-500/20 text-yellow-600">
                  Destacado
                </Badge>
              )}
              <FavoriteButton
                id={restaurant.id}
                type="restaurante"
                name={restaurant.name}
                image={restaurant.imageUrl}
                location={restaurant.destinationName}
                variant="button"
              />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">{restaurant.rating}</span>
                <span>({restaurant.reviewCount} Reseñas)</span>
              </div>
              <span>·</span>
              <span>{restaurant.cuisineType.join(', ')}</span>
              <span>·</span>
              <span className="text-primary font-medium">{restaurant.priceRange}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.destinationName}, {restaurant.province}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="border-b border-border sticky top-16 bg-background z-30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger value="info" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Información
              </TabsTrigger>
              <TabsTrigger value="menu" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Especialidades
              </TabsTrigger>
              <TabsTrigger value="galeria" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Galería
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Sobre el Restaurante
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {restaurant.description}
              </p>
            </section>

            {/* Signature Dishes */}
            {restaurant.signatureDishes.length > 0 && (
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  Platos Destacados
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {restaurant.signatureDishes.map((dish, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Utensils className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{dish}</span>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {restaurant.gallery.length > 0 && (
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Galería</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.gallery.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className={`rounded-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                    >
                      <img
                        src={img}
                        alt={`${restaurant.name} - ${i + 1}`}
                        className="w-full h-full object-cover aspect-[4/3]"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            {restaurant.services.length > 0 && (
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Servicios</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {service}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Reservation Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Info Card */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground">Información</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Dirección</p>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Horario</p>
                      <p className="text-sm text-muted-foreground">{restaurant.openingHours}</p>
                    </div>
                  </div>

                  {restaurant.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Teléfono</p>
                        <a href={`tel:${restaurant.phone}`} className="text-sm text-primary hover:underline">
                          {restaurant.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {restaurant.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <a href={`mailto:${restaurant.email}`} className="text-sm text-primary hover:underline">
                          {restaurant.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Sitio Web</p>
                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          Visitar sitio
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Rango de Precios</p>
                      <p className="text-sm text-muted-foreground">{restaurant.priceRange}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Reservar Mesa</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Fecha</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Hora</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
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
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
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
                    <Users className="h-4 w-4 mr-2" />
                    Reservar Ahora
                  </Button>
                </div>
              </div>

              {/* Map Preview */}
              {restaurant.latitude && restaurant.longitude && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Ver en mapa</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ad Sidebar */}
              <DetailPageSidebarAd showDemo variant="square" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer sticky ad para móvil */}
      <MobileStickyFooterAd showDemo />

      <Footer />
    </div>
  );
}
