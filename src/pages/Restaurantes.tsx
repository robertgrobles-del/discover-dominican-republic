import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Star, Heart, Eye, Megaphone, MapPin, Clock, Utensils, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { BetweenSectionsAd } from "@/components/ads";
import { restaurants as staticRestaurants, type Restaurant } from "@/data/restaurants";
import { supabase } from "@/integrations/supabase/client";

const priceRanges = ["$", "$$", "$$$", "$$$$"];

const cuisineTypes = [
  { id: "criolla", label: "Criolla Dominicana" },
  { id: "mariscos", label: "Mariscos" },
  { id: "italiana", label: "Italiana" },
  { id: "francesa", label: "Francesa" },
  { id: "fusion", label: "Fusión" },
  { id: "saludable", label: "Saludable" },
];

const destinations = [
  { id: "all", label: "Todos los destinos" },
  { id: "zona-colonial", label: "Zona Colonial" },
  { id: "punta-cana", label: "Punta Cana" },
  { id: "cap-cana", label: "Cap Cana" },
  { id: "las-terrenas", label: "Las Terrenas" },
  { id: "puerto-plata", label: "Puerto Plata" },
  { id: "cabarete", label: "Cabarete" },
  { id: "jarabacoa", label: "Jarabacoa" },
  { id: "la-romana", label: "La Romana" },
];

const popularTags = [
  "Vista al Mar", "Romántico", "Familiar", "Terraza", "Reservaciones", "Música en vivo"
];

export default function Restaurantes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recomendados");
  const [dbRestaurants, setDbRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    supabase.from('restaurants').select('*').eq('is_active', true).then(({ data }) => {
      if (data) {
        const mapped: Restaurant[] = data.map(r => ({
          id: r.id,
          slug: r.slug || r.id,
          name: r.name,
          destinationId: r.destination_id || '',
          destinationName: '',
          province: '',
          cuisineType: r.cuisine_type ? [r.cuisine_type] : [],
          category: (r.category as Restaurant['category']) || 'casual',
          shortDescription: r.short_description || '',
          description: r.description || '',
          imageUrl: r.image_url || '/placeholder.svg',
          gallery: r.gallery || [],
          signatureDishes: r.signature_dishes || [],
          priceRange: (r.price_range as Restaurant['priceRange']) || '$$',
          rating: Number(r.rating) || 0,
          reviewCount: r.review_count || 0,
          address: r.address || '',
          phone: r.phone || undefined,
          email: r.email || undefined,
          website: r.website || undefined,
          openingHours: r.opening_hours || '',
          services: r.services || [],
          latitude: r.latitude ? Number(r.latitude) : undefined,
          longitude: r.longitude ? Number(r.longitude) : undefined,
          isFeatured: r.is_featured || false,
        }));
        setDbRestaurants(mapped);
      }
    });
  }, []);

  const allRestaurants = useMemo(() => {
    const staticSlugs = new Set(staticRestaurants.map(r => r.slug));
    const uniqueDb = dbRestaurants.filter(r => !staticSlugs.has(r.slug));
    return [...staticRestaurants, ...uniqueDb];
  }, [dbRestaurants]);

  const filteredRestaurants = useMemo(() => {
    let results = [...allRestaurants];

    // Sort sponsored first
    results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisineType.some(c => c.toLowerCase().includes(q)) ||
        r.destinationName.toLowerCase().includes(q)
      );
    }

    if (selectedPrice) {
      results = results.filter(r => r.priceRange === selectedPrice);
    }

    if (selectedDestination !== "all") {
      results = results.filter(r => r.destinationId === selectedDestination);
    }

    if (selectedTag) {
      results = results.filter(r =>
        r.services.some(s => s.toLowerCase().includes(selectedTag.toLowerCase()))
      );
    }

    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    }

    return results;
  }, [searchQuery, selectedPrice, selectedDestination, selectedTag, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 mt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=400&fit=crop"
            alt="Gastronomía RD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Restaurantes en República Dominicana
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Descubre los mejores restaurantes de la isla, desde cocina criolla tradicional hasta alta cocina internacional.
            </p>

            <div className="flex gap-2 max-w-xl mx-auto bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cocina o destino..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-0 focus-visible:ring-0"
                />
              </div>
              <Button>Buscar</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">Restaurantes</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-foreground">Filtros</h3>
                <Button
                  variant="link"
                  className="text-primary text-sm p-0"
                  onClick={() => {
                    setSelectedPrice(null);
                    setSelectedDestination("all");
                    setSelectedTag(null);
                    setSearchQuery("");
                  }}
                >
                  Limpiar todo
                </Button>
              </div>

              <Accordion type="multiple" defaultValue={["destino", "precio"]} className="space-y-4">
                <AccordionItem value="destino" className="border-0">
                  <AccordionTrigger className="bg-muted rounded-lg px-4 py-3 hover:no-underline">
                    Destino
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                      <SelectTrigger className="bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="precio" className="border-0">
                  <AccordionTrigger className="bg-muted rounded-lg px-4 py-3 hover:no-underline">
                    Precio
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="flex gap-2">
                      {priceRanges.map((price) => (
                        <Button
                          key={price}
                          variant={selectedPrice === price ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPrice(selectedPrice === price ? null : price)}
                        >
                          {price}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Popular Tags */}
              <div className="mt-6">
                <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Grid */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-2xl font-bold text-foreground">{filteredRestaurants.length}</span>
                <span className="text-muted-foreground ml-2">Restaurantes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recomendados">Recomendados</SelectItem>
                    <SelectItem value="rating">Mayor Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/restaurante/${restaurant.slug}`}
                    className="block bg-card rounded-xl overflow-hidden border border-border group hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {restaurant.isFeatured && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                          <Megaphone className="h-3 w-3" />
                          Destacado
                        </Badge>
                      )}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{restaurant.priceRange}</span>
                        <span>•</span>
                        <span>{restaurant.destinationName}</span>
                        <span>•</span>
                        <span>{restaurant.cuisineType[0]}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {restaurant.shortDescription}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-16">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No se encontraron restaurantes</h3>
                <p className="text-muted-foreground">Intenta cambiar los filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BetweenSectionsAd showDemo />
      <Footer />
    </div>
  );
}
