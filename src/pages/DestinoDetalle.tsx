import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Cloud, Calendar, Play, ChevronRight, Users, Map, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead, generateDestinationSchema } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useI18n";

import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { DestinationActivities } from "@/components/destination/DestinationActivities";
import { DestinationHotels } from "@/components/destination/DestinationHotels";
import { DestinationRestaurants } from "@/components/destination/DestinationRestaurants";
import { DestinationNightlife } from "@/components/destination/DestinationNightlife";
import { HowToGetThere } from "@/components/destination/HowToGetThere";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { DestinationAboutInfo } from "@/components/destination/DestinationAboutInfo";
import { DestinationDbEntitiesTabs } from "@/components/destination/DestinationDbEntitiesTabs";
import { DestinationLocalGastronomy } from "@/components/destination/DestinationLocalGastronomy";
import { DestinationEssentials } from "@/components/destination/DestinationEssentials";
import { DestinationMustSee } from "@/components/destination/DestinationMustSee";
import { DestinationZonesGrid } from "@/components/destination/DestinationZonesGrid";
import { SubDestinationsSection } from "@/components/destinations/SubDestinationsSection";
import { CommentSection } from "@/components/comments/CommentSection";

import { DestinationHighlightCards } from "@/components/destination/DestinationHighlightCards";
import { DestinationArrivalGuide } from "@/components/destination/DestinationArrivalGuide";
import { DestinationConsultantBanner } from "@/components/destination/DestinationConsultantBanner";
import { destinosData, provinceToDestinationMap } from "@/data/destinosData";
import { getDestinationBySlug } from "@/data/destinations";
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { PanoramaAd, BillboardAd, BetweenSectionsAd } from "@/components/promo/BannerAd";

function DestinoDetalleDynamic({ id }: { id?: string }) {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const { t } = useTranslation();

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
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!id && shouldQueryDb,
  });

  // Second try: check if it's a province
  const { data: dbProvince, isLoading: loadingProvince } = useQuery({
    queryKey: ["province-detail", id],
    queryFn: async () => {
      let query = supabase.from("provinces").select("*");
      
      if (isUUID) {
        query = query.or(`slug.eq.${id},id.eq.${id}`);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!id && !dbDestination && shouldQueryDb,
  });

  // Fetch hotels for this destination/province
  const { data: hotels } = useQuery({
    queryKey: ["hotels", id, dbDestination?.id, dbProvince?.id],
    queryFn: async () => {
      let query = supabase.from("hotels").select("*");
      if (dbDestination?.id) {
        query = query.eq("destination_id", dbDestination.id);
      } else if (dbProvince?.id) {
        query = query.eq("province_id", dbProvince.id);
      }
      const { data } = await query.limit(8);
      return data || [];
    },
    enabled: !!(dbDestination?.id || dbProvince?.id),
  });

  // Fetch restaurants for this destination/province
  const { data: restaurants } = useQuery({
    queryKey: ["restaurants", id, dbDestination?.id, dbProvince?.id],
    queryFn: async () => {
      let query = supabase.from("restaurants").select("*");
      if (dbDestination?.id) {
        query = query.eq("destination_id", dbDestination.id);
      } else if (dbProvince?.id) {
        query = query.eq("province_id", dbProvince.id);
      }
      const { data } = await query.limit(8);
      return data || [];
    },
    enabled: !!(dbDestination?.id || dbProvince?.id),
  });

  // Fetch bars for this destination/province
  const { data: bars } = useQuery({
    queryKey: ["bars", id, dbDestination?.id, dbProvince?.id],
    queryFn: async () => {
      let query = supabase.from("bars").select("*");
      if (dbDestination?.id) {
        query = query.eq("destination_id", dbDestination.id);
      } else if (dbProvince?.id) {
        query = query.eq("province_id", dbProvince.id);
      }
      const { data } = await query.limit(8);
      return data || [];
    },
    enabled: !!(dbDestination?.id || dbProvince?.id),
  });

  // Fetch experiences for this destination/province
  const { data: experiences } = useQuery({
    queryKey: ["experiences", id, dbDestination?.id, dbProvince?.id],
    queryFn: async () => {
      let query = supabase.from("experiences").select("*");
      if (dbDestination?.id) {
        query = query.eq("destination_id", dbDestination.id);
      } else if (dbProvince?.id) {
        query = query.eq("province_id", dbProvince.id);
      }
      const { data } = await query.limit(8);
      return data || [];
    },
    enabled: !!(dbDestination?.id || dbProvince?.id),
  });

  // Fetch destinations for a province view
  const { data: destinations } = useQuery({
    queryKey: ["province-destinations", dbProvince?.id],
    queryFn: async () => {
      if (!dbProvince?.id) return [];
      const { data } = await supabase
        .from("destinations")
        .select("*")
        .eq("province_id", dbProvince.id);
      return data || [];
    },
    enabled: !!dbProvince?.id,
  });

  // Fetch municipalities for a province view
  const { data: municipalities } = useQuery({
    queryKey: ["province-municipalities", dbProvince?.id],
    queryFn: async () => {
      if (!dbProvince?.id) return [];
      const { data } = await supabase
        .from("municipalities")
        .select("*")
        .eq("province_id", dbProvince.id);
      return data || [];
    },
    enabled: !!dbProvince?.id,
  });

  const isLoading = shouldQueryDb && (loadingDestination || loadingProvince);
  const isProvinceView = !!dbProvince && !dbDestination;
  const hasDbData = !!dbDestination || !!dbProvince;

  // Build display data
  const displayData = staticDestino ? {
    name: staticDestino.nombre,
    subtitle: staticDestino.subtitulo,
    description: staticDestino.descripcion,
    heroImage: staticDestino.heroImage,
    region: provinceToDestinationMap[id || ""] || "República Dominicana",
    clima: staticDestino.clima,
    temporada: staticDestino.temporada,
    highlights: staticDestino.galeria.map(g => g.alt).slice(0, 4),
  } : dbDestination ? {
    name: dbDestination.name,
    subtitle: dbDestination.short_description,
    description: dbDestination.description || dbDestination.short_description,
    heroImage: dbDestination.image_url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop",
    region: dbDestination.region || dbDestination.province?.region || "República Dominicana",
    clima: { temp: "28", condicion: "Tropical" },
    temporada: { meses: "Todo el año", evento: "Temporada alta: Dic - Abr" },
    highlights: dbDestination.highlights || [],
  } : dbProvince ? {
    name: dbProvince.name,
    subtitle: `Provincia de la Región ${dbProvince.region}`,
    description: dbProvince.description,
    heroImage: dbProvince.image_url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop",
    region: dbProvince.region,
    clima: { temp: "27", condicion: "Tropical cálido" },
    temporada: { meses: "Todo el año", evento: "Ideal para ecoturismo" },
    highlights: dbProvince.highlights || [],
    capital: dbProvince.capital,
    population: dbProvince.population,
    area: dbProvince.area_km2,
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[60vh] w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Destino no encontrado</h1>
          <p className="text-muted-foreground mb-8">El destino que buscas no existe o ha sido movido.</p>
          <Link to="/destinos">
            <Button>Ver todos los destinos</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const municipios = municipalities || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <SEOHead
          title={`${displayData.name} - Guía Turística Completa`}
          description={displayData.description?.slice(0, 155) || `Descubre ${displayData.name}: hoteles, restaurantes, actividades y consejos de viaje en República Dominicana.`}
          image={displayData.heroImage}
          url={typeof window !== "undefined" ? window.location.href : `/destino/${id}`}
          jsonLd={generateDestinationSchema({
            name: displayData.name,
            description: displayData.description || "",
            image: displayData.heroImage,
            url: typeof window !== "undefined" ? window.location.href : `https://descubrerd.com/destino/${id}`,
          })}
        />
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-end pb-12 overflow-hidden">
          <div className="absolute inset-0">
            {!heroLoaded && (
              <div className="w-full h-full bg-muted animate-pulse" />
            )}
            <img
              src={displayData.heroImage}
              alt={displayData.name}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                heroLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setHeroLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
              <Link to="/destinos" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Destinos
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white">{displayData.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="bg-primary text-primary-foreground mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  {displayData.region}
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
                        {t("destinoDetalle.capital")}: {displayData.capital}
                      </span>
                    )}
                    {displayData.population && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {displayData.population.toLocaleString()} {t("destinoDetalle.population")}
                      </span>
                    )}
                    {displayData.area && (
                      <span className="flex items-center gap-1">
                        <Map className="h-4 w-4" />
                        {displayData.area.toLocaleString()} {t("destinoDetalle.area")}
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
                    image={displayData.heroImage}
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
                    <span className="text-xs uppercase tracking-wider">{t("destinoDetalle.climate")}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{displayData.clima.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{displayData.clima.condicion}</p>
                </div>
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">{t("destinoDetalle.season")}</span>
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
          <section className="py-8 bg-background border-b border-border/60">
            <div className="container mx-auto px-4">
              <DestinationHighlightCards
                destinationSlug={id || ""}
                destinationName={displayData.name}
                highlights={displayData.highlights}
              />
            </div>
          </section>
        )}

        {/* Lo Esencial para el Viajero (Trip Essentials inspirado en Australia, Países Bajos y Suiza) */}
        <DestinationEssentials
          destinoNombre={displayData.name}
          region={displayData.region}
          aeropuertoCercano={staticDestino?.aeropuerto ? `${staticDestino.aeropuerto.nombre} (${staticDestino.aeropuerto.codigo}) - ${staticDestino.aeropuerto.distancia}` : undefined}
        />

        {/* Lo que no te puedes perder (Must-See Highlights inspirado en Francia y Colombia) */}
        <DestinationMustSee destinoNombre={displayData.name} />

        {/* Planifica tu Llegada & Rutas Terrestres */}
        <DestinationArrivalGuide
          destinationName={displayData.name}
          provinceName={displayData.region}
          airportInfo={staticDestino?.aeropuerto ? `${staticDestino.aeropuerto.nombre} (${staticDestino.aeropuerto.codigo})` : undefined}
        />

        {/* Micro-destinos y Zonas (Inspirado en Japón, Australia y Landing Punta Cana) */}
        <DestinationZonesGrid slug={id || ""} destinoNombre={displayData.name} />

        {/* BANNER PUBLICITARIO HORIZONTAL 1 (Entre Secciones) */}
        <div className="my-6">
          <BetweenSectionsAd showDemo={true} section="destination-mid-1" industry="hotels" />
        </div>

        {/* Banner de Consultor Local & Garantía Oficial */}
        <DestinationConsultantBanner destinoNombre={displayData.name} />

        {/* BANNER PUBLICITARIO HORIZONTAL 2 (Entre Secciones) */}
        <div className="my-6">
          <BetweenSectionsAd showDemo={true} section="destination-mid-2" industry="restaurants" />
        </div>

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
            <DestinationAboutInfo
              nombre={staticDestino.nombre}
              descripcion={staticDestino.descripcion}
              region={displayData.region}
              temporada={staticDestino.temporada}
            />

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

            {/* Gastronomía Local (Chivo Guisado, Pescado Frito, Casabe con enlaces a recetas) */}
            <DestinationLocalGastronomy destinoNombre={staticDestino.nombre} />

            {/* Nightlife */}
            <DestinationNightlife venues={staticDestino.vidaNocturna} destinoNombre={staticDestino.nombre} />

            {/* How to Get There */}
            <HowToGetThere 
              aeropuertoCercano={staticDestino.aeropuerto}
              opciones={staticDestino.transporte}
            />

            {/* Conectividad y Distancias desde Ciudades */}
            <DistancesFromCities
              destinationName={displayData.name}
              latitude={displayData.name.includes("Punta Cana") ? 18.5601 : displayData.name.includes("Samaná") ? 19.2058 : displayData.name.includes("Puerto Plata") ? 19.7934 : 18.4861}
              longitude={displayData.name.includes("Punta Cana") ? -68.3725 : displayData.name.includes("Samaná") ? -69.3322 : displayData.name.includes("Puerto Plata") ? -70.6884 : -69.9312}
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
              <DestinationDbEntitiesTabs
                isProvinceView={isProvinceView}
                destinations={destinations}
                municipios={municipios}
                hotels={hotels}
                restaurants={restaurants}
                bars={bars}
                experiences={experiences}
              />
            </div>

            {/* Gastronomía Local (Chivo Guisado, Pescado Frito, Casabe con enlaces a recetas) */}
            <DestinationLocalGastronomy destinoNombre={displayData.name} />
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

        {/* Standard IAB Billboard Ad */}
        <BillboardAd showDemo section="destino-detalle" />

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

export default function DestinoDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const staticCatalogDestination = id ? getDestinationBySlug(id) : null;

  if (staticCatalogDestination) {
    return <StaticDestinationPage destination={staticCatalogDestination} />;
  }

  return <DestinoDetalleDynamic id={id} />;
}