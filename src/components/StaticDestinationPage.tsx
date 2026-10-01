// Componente reutilizable para mostrar la página de detalle de un destino estático
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Thermometer, Utensils, Star, ChevronRight, Hotel, UtensilsCrossed, Wine, Compass, Users } from "lucide-react";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { DestinationLocalGastronomy } from "@/components/destination/DestinationLocalGastronomy";
import { DestinationHeroSlider } from "@/components/destination/DestinationHeroSlider";
import { DestinationArrivalGuide } from "@/components/destination/DestinationArrivalGuide";
import { DestinationConsultantBanner } from "@/components/destination/DestinationConsultantBanner";
import { DestinationHighlightCards } from "@/components/destination/DestinationHighlightCards";
import { DestinationEssentials } from "@/components/destination/DestinationEssentials";
import { DestinationMustSee } from "@/components/destination/DestinationMustSee";
import { DestinationZonesGrid } from "@/components/destination/DestinationZonesGrid";
import { DestinationEditorialSections } from "@/components/destination/DestinationEditorialSections";
import { RelatedBlogPosts } from "@/components/destination/RelatedBlogPosts";
import { ParticipationInvite } from "@/components/gamificacion/ParticipationInvite";
import { Link } from "react-router-dom";
import { DetailPageSidebarAd } from "@/components/promo/DetailPageSidebarAd";
import { BetweenSectionsAd } from "@/components/promo/BannerAd";
import { Destination, getDestinationsByProvince } from "@/data/destinations";
import { hotels as allHotels, getHotelsByDestination, getHotelsByProvince } from "@/data/hotels";
import { restaurants as allRestaurants, getRestaurantsByDestination, getRestaurantsByProvince } from "@/data/restaurants";
import { bars as allBars, getBarsByDestination, getBarsByProvince } from "@/data/bars";
import { experiences as allExperiences, getExperiencesByDestination, getExperiencesByProvince } from "@/data/experiences";

interface StaticDestinationPageProps {
  destination: Destination;
}

export function StaticDestinationPage({ destination }: StaticDestinationPageProps) {
  // Query by destination first, enrich with province or top-rated if less than 3
  const destHotels = getHotelsByDestination(destination.id);
  const provHotels = destination.province ? getHotelsByProvince(destination.province) : [];
  const combinedHotels = Array.from(new Set([...destHotels, ...provHotels]));
  const hotels = combinedHotels.length >= 3 ? combinedHotels : Array.from(new Set([...combinedHotels, ...allHotels.slice(0, 4)]));

  const destRestaurants = getRestaurantsByDestination(destination.id);
  const provRestaurants = destination.province ? getRestaurantsByProvince(destination.province) : [];
  const combinedRestaurants = Array.from(new Set([...destRestaurants, ...provRestaurants]));
  const restaurants = combinedRestaurants.length >= 3 ? combinedRestaurants : Array.from(new Set([...combinedRestaurants, ...allRestaurants.slice(0, 4)]));

  const destBars = getBarsByDestination(destination.id);
  const provBars = destination.province ? getBarsByProvince(destination.province) : [];
  const combinedBars = Array.from(new Set([...destBars, ...provBars]));
  const bars = combinedBars.length >= 3 ? combinedBars : Array.from(new Set([...combinedBars, ...allBars.slice(0, 4)]));

  const destExperiences = getExperiencesByDestination(destination.id);
  const provExperiences = destination.province ? getExperiencesByProvince(destination.province) : [];
  const combinedExperiences = Array.from(new Set([...destExperiences, ...provExperiences]));
  const experiences = combinedExperiences.length >= 3 ? combinedExperiences : Array.from(new Set([...combinedExperiences, ...allExperiences.slice(0, 4)]));

  const subDestinations = destination.type === 'provincia' ? getDestinationsByProvince(destination.slug) : [];

  return (
    <PageTransition>
      <SEOHead 
        title={`${destination.name} - Turismo República Dominicana`}
        description={destination.shortDescription}
      />
      <Header />

      {/* Hero Section */}
      <DestinationHeroSlider destination={destination} hotels={hotels} restaurants={restaurants} />

      {/* 1. SOBRE EL DESTINO & LO MÁS DESTACADO (PRIMERA SECCIÓN VISIBLE TRAS EL HERO) */}
      <section className="py-14 bg-background border-b border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Main Editorial Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                Destino Estrella del Caribe
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                Donde la arena de coral nunca quema y el mar es un santuario turquesa.
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg md:text-xl font-normal">
                {destination.description}
              </p>

              {/* Lo más destacado Grid con Cards Clickleables */}
              {destination.highlights && destination.highlights.length > 0 && (
                <DestinationHighlightCards
                  destinationSlug={destination.slug}
                  destinationName={destination.name}
                  highlights={destination.highlights}
                />
              )}
            </div>

            {/* Right Column: Practical Info Card + Sidebar Promo Ad */}
            <div className="space-y-6">
              {/* Quick Practical Info Card */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-md space-y-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Información Práctica
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recomendaciones oficiales para tu estancia
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Mejor época para visitar</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{destination.bestTimeToVisit}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Thermometer className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Clima y Temperatura</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{destination.weatherInfo}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Aeropuerto Internacional &amp; Acceso</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{destination.howToGetThere}</p>
                    </div>
                  </div>
                </div>

                {destination.typicalDishes && destination.typicalDishes.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Utensils className="h-4 w-4 text-primary" /> Platos Recomendados
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {destination.typicalDishes.map((dish, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2.5 py-1 rounded-md text-foreground font-medium">
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Publicitario Oficial 1 (Hoteles & Resorts de Lujo) */}
              <div className="rounded-3xl overflow-hidden shadow-sm border border-border/60">
                <DetailPageSidebarAd showDemo={true} variant="standard" industry="hotels" />
              </div>

              {/* Banner Publicitario Oficial 2 (Vuelos & Aerolíneas Internacionales) */}
              <div className="rounded-3xl overflow-hidden shadow-sm border border-border/60">
                <DetailPageSidebarAd showDemo={true} variant="standard" industry="airlines" />
              </div>

              {/* Banner Publicitario Oficial 3 (Transporte, Rent a Car & Movilidad - Mitad de altura / Compacto) */}
              <div className="rounded-2xl overflow-hidden shadow-sm border border-border/60">
                <DetailPageSidebarAd showDemo={true} variant="compact" industry="rentcar" />
              </div>
            </div>
          </div>
          <div className="mt-10"><ParticipationInvite placeName={destination.name} /></div>
        </div>
      </section>

      {/* 2. LO ESENCIAL PARA EL VIAJERO */}
      <DestinationEssentials
        destinoNombre={destination.name}
        region={destination.province || destination.region || "República Dominicana"}
        aeropuertoCercano={destination.howToGetThere}
      />

      {/* 3. LO QUE NO TE PUEDES PERDER */}
      <DestinationMustSee destinoNombre={destination.name} />

      {/* 4. PLANIFICA TU LLEGADA & RUTAS TERRESTRES */}
      <DestinationArrivalGuide
        destinationName={destination.name}
        provinceName={destination.province}
        airportInfo={destination.howToGetThere}
      />

      {/* 5. EXPLORA POR ZONAS Y MICRO-DESTINOS */}
      <DestinationZonesGrid slug={destination.slug} destinoNombre={destination.name} />

      {/* BANNER PUBLICITARIO HORIZONTAL 1 (Entre Secciones - Patrocinador Oficial) */}
      <div className="my-6">
        <BetweenSectionsAd showDemo={true} section="destination-mid-1" industry="hotels" />
      </div>

      {/* 6. SECCIONES EDITORIALES COMPLETAS: HOTELES, RESTAURANTES Y BARES */}
      <div className="container mx-auto px-4">
        <DestinationEditorialSections
          destinoNombre={destination.name}
          hotels={hotels}
          restaurants={restaurants}
          bars={bars}
          experiences={experiences}
        />
      </div>

      {/* 7. BANNER DE CONSULTOR LOCAL & GARANTÍA OFICIAL */}
      <DestinationConsultantBanner destinoNombre={destination.name} />

      {/* BANNER PUBLICITARIO HORIZONTAL 2 (Entre Secciones - Gastronomía & Experiencias) */}
      <div className="my-6">
        <BetweenSectionsAd showDemo={true} section="destination-mid-2" industry="restaurants" />
      </div>

      {/* Main Content Extra Sections */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {/* Sub-destinations for provinces */}
          {subDestinations.length > 0 && (
            <section className="bg-card rounded-3xl p-8 border border-border">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Destinos y Municipios en {destination.name}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subDestinations.map(sub => (
                  <Link 
                    key={sub.id}
                    to={`/destino/${sub.slug}`}
                    className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md"
                  >
                    <img 
                      src={sub.imageUrl}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{sub.name}</h4>
                      <p className="text-white/80 text-xs line-clamp-2 mt-1">{sub.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Gastronomía Local: Chivo guisado, Pescado frito, Casabe con enlace a recetas */}
          <DestinationLocalGastronomy destinoNombre={destination.name} />

          {/* About Tabs */}
          {destination.about && (
            <DestinationAboutTabs name={destination.name} data={destination.about} />
          )}

          {/* Related Blog Posts */}
          <RelatedBlogPosts destinationName={destination.name} destinationSlug={destination.slug} />

          {/* Call to Action Bar */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-black">
                ¿Listo para explorar {destination.name}?
              </h3>
              <p className="text-primary-foreground/90 text-sm md:text-base mt-2 max-w-xl">
                Crea tu itinerario inteligente con IA hora por hora o descarga la guía oficial de viaje.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" className="rounded-xl font-bold" asChild>
                <Link to="/itinerario-ia">
                  Itinerario con IA <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-bold bg-white/10 hover:bg-white/20 border-white/30 text-white" asChild>
                <Link to="/planifica">
                  Planificador Manual
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
}
