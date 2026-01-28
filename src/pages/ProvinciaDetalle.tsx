import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  MapPin, Users, ChevronRight, Building2, Utensils, 
  Bed, GlassWater, Calendar, Map, ArrowLeft 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/PageTransition";

export default function ProvinciaDetalle() {
  const { id } = useParams<{ id: string }>();

  // Check if id is a valid UUID format
  const isUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

  const { data: province, isLoading: loadingProvince } = useQuery({
    queryKey: ["province", id],
    queryFn: async () => {
      let query = supabase.from("provinces").select("*");
      
      if (isUUID) {
        query = query.or(`slug.eq.${id},id.eq.${id}`);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: municipalities } = useQuery({
    queryKey: ["municipalities", province?.id],
    queryFn: async () => {
      if (!province?.id) return [];
      const { data, error } = await supabase
        .from("municipalities")
        .select("*")
        .eq("province_id", province.id)
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!province?.id,
  });

  const { data: destinations } = useQuery({
    queryKey: ["destinations-province", province?.id],
    queryFn: async () => {
      if (!province?.id) return [];
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("province_id", province.id)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!province?.id,
  });

  const { data: hotels } = useQuery({
    queryKey: ["hotels-province", province?.id],
    queryFn: async () => {
      if (!province?.id) return [];
      const destinationIds = destinations?.map(d => d.id) || [];
      if (destinationIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .in("destination_id", destinationIds)
        .eq("is_active", true)
        .limit(8);
      
      if (error) throw error;
      return data;
    },
    enabled: !!destinations && destinations.length > 0,
  });

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants-province", province?.id],
    queryFn: async () => {
      if (!province?.id) return [];
      const destinationIds = destinations?.map(d => d.id) || [];
      if (destinationIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .in("destination_id", destinationIds)
        .eq("is_active", true)
        .limit(8);
      
      if (error) throw error;
      return data;
    },
    enabled: !!destinations && destinations.length > 0,
  });

  const { data: bars } = useQuery({
    queryKey: ["bars-province", province?.id],
    queryFn: async () => {
      if (!province?.id) return [];
      const destinationIds = destinations?.map(d => d.id) || [];
      if (destinationIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .in("destination_id", destinationIds)
        .eq("is_active", true)
        .limit(8);
      
      if (error) throw error;
      return data;
    },
    enabled: !!destinations && destinations.length > 0,
  });

  if (loadingProvince) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-96 rounded-xl mb-8" />
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  if (!province) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Provincia no encontrada</h1>
            <Link to="/provincias">
              <Button>Volver a Provincias</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  const municipios = municipalities?.filter(m => m.municipality_type === 'municipio') || [];
  const distritos = municipalities?.filter(m => m.municipality_type === 'distrito_municipal') || [];

  return (
    <PageTransition>
      <SEOHead
        title={`${province.name} | Provincias de República Dominicana`}
        description={province.description || `Descubre ${province.name}: destinos turísticos, municipios, hoteles, restaurantes y actividades.`}
        keywords={`${province.name}, turismo ${province.name}, hoteles ${province.name}, restaurantes ${province.name}`}
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px]">
          <img
            src={province.image_url || "/placeholder.svg"}
            alt={province.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Link to="/provincias" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Provincias
              </Link>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge className="mb-3 bg-primary/90">{province.region || "República Dominicana"}</Badge>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                  {province.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/90">
                  {province.capital && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Capital: {province.capital}
                    </span>
                  )}
                  {province.population && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {province.population.toLocaleString()} habitantes
                    </span>
                  )}
                  {province.area_km2 && (
                    <span className="flex items-center gap-1">
                      <Map className="h-4 w-4" />
                      {province.area_km2.toLocaleString()} km²
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Description */}
        {province.description && (
          <section className="py-12 border-b border-border">
            <div className="container mx-auto px-4">
              <p className="text-lg text-muted-foreground max-w-4xl">
                {province.description}
              </p>
              {province.highlights && province.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {province.highlights.map((highlight: string, i: number) => (
                    <Badge key={i} variant="secondary">{highlight}</Badge>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tabs Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="destinos" className="space-y-8">
              <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0">
                <TabsTrigger value="destinos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  Destinos ({destinations?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="municipios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  Municipios ({municipios.length})
                </TabsTrigger>
                <TabsTrigger value="hoteles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bed className="h-4 w-4 mr-2" />
                  Hoteles ({hotels?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="restaurantes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Utensils className="h-4 w-4 mr-2" />
                  Restaurantes ({restaurants?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="bares" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <GlassWater className="h-4 w-4 mr-2" />
                  Bares ({bars?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Destinos Tab */}
              <TabsContent value="destinos">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations?.map((destination) => (
                    <Link
                      key={destination.id}
                      to={`/destino/${destination.slug || destination.id}`}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={destination.image_url || "/placeholder.svg"}
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {destination.name}
                        </h3>
                        {destination.short_description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {destination.short_description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                  {(!destinations || destinations.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center py-12">
                      No hay destinos registrados para esta provincia.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Municipios Tab */}
              <TabsContent value="municipios">
                <div className="space-y-8">
                  {municipios.length > 0 && (
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-4">
                        Municipios ({municipios.length})
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {municipios.map((municipio) => (
                          <div
                            key={municipio.id}
                            className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                          >
                            <h4 className="font-semibold text-foreground">{municipio.name}</h4>
                            {municipio.population && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <Users className="h-3 w-3 inline mr-1" />
                                {municipio.population.toLocaleString()} hab.
                              </p>
                            )}
                            {municipio.is_tourist_destination && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                Destino Turístico
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {distritos.length > 0 && (
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-4">
                        Distritos Municipales ({distritos.length})
                      </h3>
                      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {distritos.map((distrito) => (
                          <div
                            key={distrito.id}
                            className="bg-muted/50 rounded-lg p-3"
                          >
                            <p className="text-sm font-medium text-foreground">{distrito.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {municipios.length === 0 && distritos.length === 0 && (
                    <p className="text-muted-foreground text-center py-12">
                      No hay municipios registrados para esta provincia.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Hoteles Tab */}
              <TabsContent value="hoteles">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {hotels?.map((hotel) => (
                    <Link
                      key={hotel.id}
                      to={`/alojamiento/${hotel.slug || hotel.id}`}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={hotel.image_url || "/placeholder.svg"}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {hotel.stars && (
                          <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                            {"★".repeat(hotel.stars)}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                        {hotel.price_range && (
                          <p className="text-sm text-primary font-medium mt-1">{hotel.price_range}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                  {(!hotels || hotels.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center py-12">
                      No hay hoteles registrados para esta provincia.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Restaurantes Tab */}
              <TabsContent value="restaurantes">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {restaurants?.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      to={`/restaurante/${restaurant.slug || restaurant.id}`}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={restaurant.image_url || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {restaurant.cuisine_type && (
                          <Badge className="absolute top-3 left-3 bg-primary/90">
                            {restaurant.cuisine_type}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {restaurant.name}
                        </h3>
                        {restaurant.price_range && (
                          <p className="text-sm text-muted-foreground mt-1">{restaurant.price_range}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                  {(!restaurants || restaurants.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center py-12">
                      No hay restaurantes registrados para esta provincia.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Bares Tab */}
              <TabsContent value="bares">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bars?.map((bar) => (
                    <Link
                      key={bar.id}
                      to={`/bar/${bar.slug || bar.id}`}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={bar.image_url || "/placeholder.svg"}
                          alt={bar.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {bar.bar_type && (
                          <Badge className="absolute top-3 left-3 bg-primary/90">
                            {bar.bar_type}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {bar.name}
                        </h3>
                        {bar.music_style && (
                          <p className="text-sm text-muted-foreground mt-1">{bar.music_style}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                  {(!bars || bars.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center py-12">
                      No hay bares registrados para esta provincia.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
