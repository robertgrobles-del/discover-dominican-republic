import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Building2, Utensils, Music, MapPin, Users, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ProvinceActivities } from "@/components/province/ProvinceActivities";
import { ProvinceFeaturedSection } from "@/components/province/ProvinceFeaturedSection";
import { InlineAd, BetweenSectionsAd } from "@/components/ads";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { RelatedBlogPosts } from "@/components/destination/RelatedBlogPosts";

import { destinations, getDestinationBySlug } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { restaurants } from "@/data/restaurants";
import { bars } from "@/data/bars";

export default function MunicipioDetalle() {
  const { slug } = useParams<{ slug: string }>();
  
  // Find municipality data from static destinations
  const municipality = getDestinationBySlug(slug || "");
  
  // Also check if it's a municipality type in destinations
  const isMunicipality = municipality?.type === "municipio";
  
  if (!municipality) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Municipio no encontrado</h1>
            <Link to="/destinos" className="text-primary hover:underline">
              Volver a destinos
            </Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  // Get destinations within this municipality
  const municipalityDestinations = destinations.filter(
    d => d.municipalityId === municipality.id
  );

  // Get related content
  const municipalityHotels = hotels.filter(
    h => h.municipalityId === municipality.id ||
         h.destinationId === municipality.id
  ).slice(0, 4).map(h => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    imageUrl: h.imageUrl,
    shortDescription: h.shortDescription,
    rating: h.rating,
    priceRange: h.priceRange,
    category: h.category,
    address: h.address,
  }));

  const municipalityRestaurants = restaurants.filter(
    r => r.municipalityId === municipality.id ||
         r.destinationId === municipality.id
  ).slice(0, 4).map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    imageUrl: r.imageUrl,
    shortDescription: r.shortDescription,
    rating: r.rating,
    priceRange: r.priceRange,
    category: Array.isArray(r.cuisineType) ? r.cuisineType[0] : (r.cuisineType || r.category),
    address: r.address,
  }));

  return (
    <PageTransition>
      <SEOHead
        title={`${municipality.name} - Turismo República Dominicana`}
        description={municipality.description || municipality.shortDescription}
        keywords={`${municipality.name}, turismo, República Dominicana, ${municipality.province || ""}`}
      />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-primary flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/destinos" className="hover:text-primary">Destinos</Link>
            {municipality.provinceSlug && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link to={`/provincia/${municipality.provinceSlug}`} className="hover:text-primary">
                  {municipality.province}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{municipality.name}</span>
          </nav>
        </div>

        {/* Hero Section - Simpler than Province */}
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Badge className="mb-4 bg-primary/10 text-primary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {isMunicipality ? "Municipio" : "Destino"} • {municipality.province}
                </Badge>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                  {municipality.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {municipality.description}
                </p>
                
                {/* Quick Info */}
                <div className="flex flex-wrap gap-3">
                  {municipality.categories?.map(cat => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
              >
                <img
                  src={municipality.imageUrl || "/placeholder.svg"}
                  alt={municipality.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {municipality.bestTimeToVisit && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">🗓️ Mejor época</h3>
                    <p className="text-sm text-muted-foreground">{municipality.bestTimeToVisit}</p>
                  </CardContent>
                </Card>
              )}
              {municipality.howToGetThere && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">✈️ Cómo llegar</h3>
                    <p className="text-sm text-muted-foreground">{municipality.howToGetThere}</p>
                  </CardContent>
                </Card>
              )}
              {municipality.weatherInfo && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">🌤️ Clima</h3>
                    <p className="text-sm text-muted-foreground">{municipality.weatherInfo}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Highlights */}
        {municipality.highlights && municipality.highlights.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold mb-6">Lo más destacado</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {municipality.highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-2xl">✨</span>
                        <span className="font-medium">{highlight}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Distances from cities */}
        <DistancesFromCities
          latitude={municipality.latitude}
          longitude={municipality.longitude}
          destinationName={municipality.name}
        />

        {/* Banner Ad */}
        <InlineAd showDemo />

        {/* Activities */}
        <ProvinceActivities
          provinceName={municipality.name}
          provinceSlug={municipality.slug}
          categories={municipality.categories}
        />

        {/* Hotels */}
        {municipalityHotels.length > 0 && (
          <ProvinceFeaturedSection
            title={`Dónde hospedarse en ${municipality.name}`}
            subtitle="Alojamiento"
            icon={<Building2 className="h-5 w-5" />}
            items={municipalityHotels}
            linkPrefix="/alojamiento"
            viewAllLink={`/alojamientos?destino=${municipality.slug}`}
          />
        )}

        {/* Restaurants */}
        {municipalityRestaurants.length > 0 && (
          <div className="bg-muted/30">
            <ProvinceFeaturedSection
              title={`Dónde comer en ${municipality.name}`}
              subtitle="Gastronomía"
              icon={<Utensils className="h-5 w-5" />}
              items={municipalityRestaurants}
              linkPrefix="/restaurante"
              viewAllLink={`/guia-gastronomica?destino=${municipality.slug}`}
            />
          </div>
        )}

        {/* Typical Dishes */}
        {municipality.typicalDishes && municipality.typicalDishes.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold mb-6">🍽️ Platos típicos</h2>
              <div className="flex flex-wrap gap-3">
                {municipality.typicalDishes.map((dish, index) => (
                  <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                    {dish}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">
              ¿Listo para explorar {municipality.name}?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Planifica tu viaje y descubre todo lo que este destino tiene para ofrecer
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/mi-viaje">
                <Button size="lg">Agregar a mi viaje</Button>
              </Link>
              <Link to={`/actividades?destino=${municipality.slug}`}>
                <Button size="lg" variant="outline">Ver actividades</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ad before footer */}
        <BetweenSectionsAd showDemo />
      </main>

      <Footer />
    </PageTransition>
  );
}
