import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Cloud, Calendar, Play, ChevronRight, Users, Map, ArrowLeft, Bed, Utensils, GlassWater, Compass, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead, generateDestinationSchema } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { DestinationActivities } from "@/components/destination/DestinationActivities";
import { DestinationHotels } from "@/components/destination/DestinationHotels";
import { DestinationRestaurants } from "@/components/destination/DestinationRestaurants";
import { DestinationNightlife } from "@/components/destination/DestinationNightlife";
import { HowToGetThere } from "@/components/destination/HowToGetThere";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { SubDestinationsSection } from "@/components/destinations/SubDestinationsSection";
import { CommentSection } from "@/components/comments/CommentSection";

import { destinosData, provinceToDestinationMap } from "@/data/destinosData";
import { getDestinationBySlug } from "@/data/destinations";
import { PanoramaAd } from "@/components/promo";
import { getSafeCoverImage } from "@/lib/imageCovers";

export default function DestinoDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Check for static data first - this allows immediate render
  const staticDestino = destinosData[id || ""] || (id ? destinosData[provinceToDestinationMap[id] || ""] : null);

  // Check if id is a valid UUID format
  const isUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

  // Only query DB if no static data exists
  const shouldQueryDb = !staticDestino;

  // First try to find in database (destinations table)
  const { data: dbDestination, isLoading: loadingDestination } = useQuery({
    queryKey: ["destination-detail", id],
    queryFn: async () => {
      let query = supabase.from("destinations").select(`
        *,
        province:provinces(id, name, slug, region, capital, population, area_km2, highlights, image_url)
      `);
      
      if (isUUID) {
        query = query.or(`slug.eq.${id},id.eq.${id}`);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && shouldQueryDb,
  });

  // Also check if this is a province (only if not a destination and querying DB)
  const { data: dbProvince, isLoading: loadingProvince } = useQuery({
    queryKey: ["province-as-destination", id],
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
    enabled: !!id && shouldQueryDb && !loadingDestination && !dbDestination,
  });

  // Get related data for province view
  const provinceId = dbProvince?.id || dbDestination?.province_id;
  const destinationIds = dbDestination ? [dbDestination.id] : [];

  const { data: destinations } = useQuery({
    queryKey: ["province-destinations", provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("province_id", provinceId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!provinceId && !!dbProvince,
  });

  const { data: municipalities } = useQuery({
    queryKey: ["province-municipalities", provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const { data, error } = await supabase
        .from("municipalities")
        .select("*")
        .eq("province_id", provinceId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!provinceId && !!dbProvince,
  });

  const allDestinationIds = dbProvince && destinations ? destinations.map(d => d.id) : destinationIds;

  const { data: hotels } = useQuery({
    queryKey: ["destination-hotels", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  const { data: restaurants } = useQuery({
    queryKey: ["destination-restaurants", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  const { data: bars } = useQuery({
    queryKey: ["destination-bars", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  const { data: experiences } = useQuery({
    queryKey: ["destination-experiences", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  // Determine which view to show
  const isProvinceView = !!dbProvince && !dbDestination;
  const hasDbData = !!dbDestination || !!dbProvince;

  // Show loading only if we don't have static data AND we're still loading
  const showLoading = !staticDestino && (loadingDestination || loadingProvince);

  // Loading state (only when no static data available)
  if (showLoading) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-[50vh] rounded-xl mb-8" />
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  // 404 state - only if both static and DB data are missing (and not loading)
  if (!staticDestino && !hasDbData && !loadingDestination && !loadingProvince) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Destino no encontrado</h1>
            <Link to="/destinos">
              <Button>Ver todos los destinos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  // Build display data
  const displayData = staticDestino ? {
    name: staticDestino.nombre,
    subtitle: staticDestino.subtitulo,
    description: staticDestino.descripcion,
    image: staticDestino.heroImage,
    region: "República Dominicana",
    clima: staticDestino.clima,
    temporada: staticDestino.temporada,
    galeria: staticDestino.galeria,
    highlights: [] as string[],
    population: null as number | null,
    area: null as number | null,
    capital: null as string | null,
  } : {
    name: dbProvince?.name || dbDestination?.name || "",
    subtitle: isProvinceView ? (dbProvince?.region || "Provincia") : "Destino Turístico",
    description: dbProvince?.description || dbDestination?.description || "",
    image: getSafeCoverImage(dbProvince?.image_url || dbDestination?.image_url, isProvinceView ? "province" : "destination", id),
    region: dbProvince?.region || dbDestination?.province?.region || "República Dominicana",
    clima: { temp: 28, condicion: "Tropical" },
    temporada: { meses: "Todo el año", evento: "Turismo" },
    galeria: (dbDestination?.gallery || []).map((src: string) => ({ src, alt: dbDestination?.name || "" })),
    highlights: dbProvince?.highlights || dbDestination?.highlights || [],
    population: dbProvince?.population || null,
    area: dbProvince?.area_km2 || null,
    capital: dbProvince?.capital || null,
  };

  const municipios = municipalities?.filter(m => m.municipality_type === 'municipio') || [];
  const distritos = municipalities?.filter(m => m.municipality_type === 'distrito_municipal') || [];

  return (
    <PageTransition>
      <SEOHead
        title={`${displayData.name} - ${displayData.subtitle}`}
        description={displayData.description}
        keywords={`${displayData.name}, República Dominicana, turismo, vacaciones, playas, hoteles`}
        image={displayData.image}
        jsonLd={generateDestinationSchema({
          name: displayData.name,
          description: displayData.description,
          image: displayData.image,
          url: `https://descubrerd.com/destino/${id}`,
        })}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={displayData.image}
            alt={displayData.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Link to={isProvinceView ? "/provincias" : "/destinos"} className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isProvinceView ? "Volver a Provincias" : "Volver a Destinos"}
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  {isProvinceView ? displayData.region : "DESTINO PREMIUM"}
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                  {displayData.name}
                  {displayData.subtitle && (
                    <>
                      <br />
                      <span className="text-gradient">{displayData.subtitle}</span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-white/90 max-w-xl mb-6">
                  {displayData.description}
                </p>
                
                {/* Province stats */}
                {isProvinceView && (
                  <div className="flex flex-wrap gap-4 text-white/90 mb-6">
                    {displayData.capital && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Capital: {displayData.capital}
                      </span>
                    )}
                    {displayData.population && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {displayData.population.toLocaleString()} habitantes
                      </span>
                    )}
                    {displayData.area && (
                      <span className="flex items-center gap-1">
                        <Map className="h-4 w-4" />
                        {displayData.area.toLocaleString()} km²
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2">
                    <Play className="h-4 w-4" /> Ver Video
                  </Button>
                  <FavoriteButton
                    id={id || ""}
                    type={isProvinceView ? "provincia" : "destino"}
                    name={displayData.name}
                    image={displayData.image}
                    location={displayData.region}
                    variant="button"
                    size="lg"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  />
                </div>
              </div>

              {/* Weather & Season Info */}
              <div className="flex gap-4">
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Cloud className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Clima</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{displayData.clima.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{displayData.clima.condicion}</p>
                </div>
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Temporada</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{displayData.temporada.meses}</p>
                  <p className="text-sm text-muted-foreground">{displayData.temporada.evento}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        {displayData.highlights && displayData.highlights.length > 0 && (
          <section className="py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2">
                {displayData.highlights.map((highlight: string, i: number) => (
                  <Badge key={i} variant="secondary">{highlight}</Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Static destination rich content */}
        {staticDestino && (
          <>
            {/* Gallery */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <DestinationGallery images={staticDestino.galeria} />
              </div>
            </section>

            {/* Description & Cultural Context */}
            <section className="py-12 bg-card/30">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Sobre {staticDestino.nombre}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {staticDestino.descripcion} Este destino ofrece una combinación única de naturaleza, cultura y aventura 
                    que lo convierte en uno de los lugares más especiales de República Dominicana.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" /> {displayData.region}
                    </Badge>
                    <Badge variant="secondary">Mejor época: {staticDestino.temporada.meses}</Badge>
                    <Badge variant="secondary">{staticDestino.temporada.evento}</Badge>
                  </div>
                </div>
              </div>
            </section>

            {/* Rich About Data Tabs if available */}
            {(() => {
              const matchedDest = getDestinationBySlug(id || "");
              if (matchedDest?.about) {
                return <DestinationAboutTabs name={staticDestino.nombre} data={matchedDest.about} />;
              }
              return null;
            })()}

            {/* Activities */}
            <DestinationActivities activities={staticDestino.actividades} destinoId={id || ""} />

            {/* Hotels */}
            <DestinationHotels hotels={staticDestino.hoteles} destinoId={id || ""} />

            {/* Restaurants */}
            <DestinationRestaurants restaurantes={staticDestino.restaurantes} destinoId={id || ""} />

            {/* Nightlife */}
            <DestinationNightlife venues={staticDestino.vidaNocturna} destinoNombre={staticDestino.nombre} />

            {/* How to Get There */}
            <HowToGetThere 
              aeropuertoCercano={staticDestino.aeropuerto}
              opciones={staticDestino.transporte}
            />

            {/* Suggested Route */}
            <section className="py-16 bg-card/30">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                  Ruta Sugerida: {staticDestino.rutaSugerida.length} Días en {staticDestino.nombre}
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-0">
                    {staticDestino.rutaSugerida.map((dia, index) => (
                      <div key={dia.dia} className="relative pl-8 pb-8 last:pb-0">
                        {index < staticDestino.rutaSugerida.length - 1 && (
                          <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-24px)] bg-border" />
                        )}
                        <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          index === 0 ? "border-primary bg-primary/20" : "border-border bg-background"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                        </div>
                        <div>
                          <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                            DÍA {dia.dia}: {dia.titulo}
                          </span>
                          <h3 className="font-display font-bold text-lg text-foreground mt-1 mb-2">{dia.lugar}</h3>
                          <p className="text-sm text-muted-foreground">{dia.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                    <img 
                      src={staticDestino.galeria[1]?.src || staticDestino.heroImage} 
                      alt="Ruta sugerida" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link to="/mi-viaje">
                    <Button size="lg" className="gap-2">
                      Crear mi Itinerario Personalizado <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Dynamic database content with tabs */}
        {hasDbData && !staticDestino && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Tabs defaultValue={isProvinceView ? "destinos" : "hoteles"} className="space-y-8">
                <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0">
                  {isProvinceView && (
                    <TabsTrigger value="destinos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      Destinos ({destinations?.length || 0})
                    </TabsTrigger>
                  )}
                  {isProvinceView && (
                    <TabsTrigger value="municipios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      Municipios ({municipios.length})
                    </TabsTrigger>
                  )}
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
                  <TabsTrigger value="actividades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Compass className="h-4 w-4 mr-2" />
                    Actividades ({experiences?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Destinos Tab */}
                {isProvinceView && (
                  <TabsContent value="destinos">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {destinations?.map((destination) => (
                        <Link
                          key={destination.id}
                          to={`/destino/${destination.slug || destination.id}`}
                          className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <img
                              src={getSafeCoverImage(destination.image_url, "destination", destination.slug)}
                              alt={destination.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <h3 className="font-semibold text-lg">{destination.name}</h3>
                              <p className="text-xs text-white/80 line-clamp-1">{destination.short_description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {(!destinations || destinations.length === 0) && (
                        <p className="text-muted-foreground col-span-full text-center py-12">
                          No hay destinos registrados.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Municipios Tab */}
                {isProvinceView && (
                  <TabsContent value="municipios">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {municipios.map((municipio) => (
                        <Link
                          key={municipio.id}
                          to={`/municipio/${municipio.slug || municipio.id}`}
                          className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                              {municipio.name}
                            </h3>
                            {municipio.is_capital && (
                              <Badge variant="secondary">Capital</Badge>
                            )}
                          </div>
                          {municipio.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {municipio.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {municipio.population && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {municipio.population.toLocaleString()} hab.
                              </span>
                            )}
                            {municipio.area_km2 && (
                              <span className="flex items-center gap-1">
                                <Map className="h-3.5 w-3.5" />
                                {municipio.area_km2} km²
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                      {municipios.length === 0 && (
                        <p className="text-muted-foreground col-span-full text-center py-12">
                          No hay municipios registrados.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                )}

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
                            src={getSafeCoverImage(hotel.image_url, "hotel", hotel.slug)}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {hotel.category && (
                            <Badge className="absolute top-3 left-3 bg-primary/90">
                              {hotel.category}
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
                        No hay hoteles registrados.
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
                            src={getSafeCoverImage(restaurant.image_url, "restaurant", restaurant.slug)}
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
                        No hay restaurantes registrados.
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
                            src={getSafeCoverImage(bar.image_url, "bar", bar.slug)}
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
                        No hay bares registrados.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Actividades Tab */}
                <TabsContent value="actividades">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {experiences?.map((exp) => (
                      <Link
                        key={exp.id}
                        to={`/experiencia/${exp.slug || exp.id}`}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={getSafeCoverImage(exp.image_url, "experience", exp.slug)}
                            alt={exp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {exp.category && (
                            <Badge className="absolute top-3 left-3 bg-primary/90">
                              {exp.category}
                            </Badge>
                          )}
                          {exp.difficulty && (
                            <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                              {exp.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {exp.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {exp.duration && (
                              <span className="text-xs text-muted-foreground">{exp.duration}</span>
                            )}
                            {exp.price_range && (
                              <span className="text-xs text-primary font-medium">{exp.price_range}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {(!experiences || experiences.length === 0) && (
                      <p className="text-muted-foreground col-span-full text-center py-12">
                        No hay actividades registradas.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        )}

        {/* High-Impact Panorama Destination Banner Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        {/* Sub-destinations for provinces */}
        {isProvinceView && destinations && destinations.length > 0 && (
          <SubDestinationsSection
            parentName={displayData.name}
            destinations={destinations}
            municipalities={municipalities || []}
          />
        )}

        {/* Sección de Comentarios y UGC */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <CommentSection
              contentId={id || "destino-default"}
              contentType="destination"
              title={`Experiencias y Consejos sobre ${displayData.name}`}
            />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}