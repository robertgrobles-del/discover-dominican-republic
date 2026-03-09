// Componente reutilizable para mostrar la página de detalle de un destino estático
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Thermometer, Utensils, Star, ChevronRight, Hotel, UtensilsCrossed, Wine, Compass, Users, Home } from "lucide-react";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { RelatedBlogPosts } from "@/components/destination/RelatedBlogPosts";
import { Link } from "react-router-dom";
import { Destination, getDestinationsByProvince, getDestinationById } from "@/data/destinations";
import { getHotelsByDestination } from "@/data/hotels";
import { getRestaurantsByDestination } from "@/data/restaurants";
import { getBarsByDestination } from "@/data/bars";
import { getExperiencesByDestination } from "@/data/experiences";

interface StaticDestinationPageProps {
  destination: Destination;
}

export function StaticDestinationPage({ destination }: StaticDestinationPageProps) {
  const hotels = getHotelsByDestination(destination.id);
  const restaurants = getRestaurantsByDestination(destination.id);
  const bars = getBarsByDestination(destination.id);
  const experiences = getExperiencesByDestination(destination.id);
  const subDestinations = destination.type === 'provincia' ? getDestinationsByProvince(destination.slug) : [];
  
  // Obtener jerarquía para breadcrumbs
  const province = destination.provinceId ? getDestinationById(destination.provinceId) : undefined;
  const municipality = destination.municipalityId ? getDestinationById(destination.municipalityId) : undefined;

  const categoryLabels: Record<string, string> = {
    playa: 'Playa',
    montaña: 'Montaña',
    ecoturismo: 'Ecoturismo',
    cultura: 'Cultura',
    aventura: 'Aventura',
    rios: 'Ríos',
    ciudad: 'Ciudad',
    lujo: 'Lujo'
  };

  return (
    <PageTransition>
      <SEOHead 
        title={`${destination.name} - Turismo República Dominicana`}
        description={destination.shortDescription}
      />
      <Header />
      
      {/* Breadcrumbs */}
      <nav className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                Inicio
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li>
              <Link to="/destinos" className="text-muted-foreground hover:text-primary transition-colors">
                Destinos
              </Link>
            </li>
            {province && destination.type !== 'provincia' && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <li>
                  <Link to={`/destino/${province.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {province.name}
                  </Link>
                </li>
              </>
            )}
            {municipality && destination.type === 'destino' && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <li>
                  <Link to={`/destino/${municipality.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {municipality.name}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">{destination.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${destination.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="flex items-center gap-2 mb-4">
            {destination.categories.map(cat => (
              <Badge key={cat} variant="secondary" className="bg-primary/90 text-primary-foreground">
                {categoryLabels[cat] || cat}
              </Badge>
            ))}
            {destination.type === 'provincia' && (
              <Badge variant="outline" className="border-white/50 text-white">
                Provincia
              </Badge>
            )}
            {destination.type === 'municipio' && (
              <Badge variant="outline" className="border-white/50 text-white">
                Municipio
              </Badge>
            )}
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {destination.name}
              </h1>
              {destination.province && (
                <Link 
                  to={`/destino/${destination.provinceSlug}`}
                  className="flex items-center gap-2 text-white/90 text-lg hover:text-white transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  {destination.province}
                </Link>
              )}
            </div>
            <FavoriteButton
              id={destination.id}
              type="destino"
              name={destination.name}
              image={destination.imageUrl}
              location={destination.province}
              className="text-white"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Sobre {destination.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {destination.description}
              </p>
            </section>

            {/* Highlights */}
            {destination.highlights && destination.highlights.length > 0 && (
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Lo más destacado
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {destination.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sub-destinations for provinces */}
            {subDestinations.length > 0 && (
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Destinos en {destination.name}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subDestinations.map(sub => (
                    <Link 
                      key={sub.id}
                      to={`/destino/${sub.slug}`}
                      className="group relative overflow-hidden rounded-xl aspect-[4/3]"
                    >
                      <img 
                        src={sub.imageUrl}
                        alt={sub.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="font-semibold text-white">{sub.name}</h4>
                        <p className="text-white/80 text-sm line-clamp-1">{sub.shortDescription}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Tabs for Hotels, Restaurants, Bars, Experiences */}
            <Tabs defaultValue="hotels" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="hotels" className="flex items-center gap-2">
                  <Hotel className="h-4 w-4" />
                  <span className="hidden sm:inline">Hoteles</span>
                  <Badge variant="secondary" className="ml-1">{hotels.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="restaurants" className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span className="hidden sm:inline">Restaurantes</span>
                  <Badge variant="secondary" className="ml-1">{restaurants.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="bars" className="flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  <span className="hidden sm:inline">Bares</span>
                  <Badge variant="secondary" className="ml-1">{bars.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="experiences" className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  <span className="hidden sm:inline">Experiencias</span>
                  <Badge variant="secondary" className="ml-1">{experiences.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hotels" className="mt-6">
                {hotels.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {hotels.map(hotel => (
                      <Link 
                        key={hotel.id}
                        to={`/alojamiento/${hotel.slug}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-[16/10]">
                            <img 
                              src={hotel.imageUrl}
                              alt={hotel.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className="absolute top-3 right-3 bg-card/90">
                              {hotel.priceRange}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1 text-primary mb-2">
                              {Array.from({ length: hotel.stars }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                              <span className="text-sm text-muted-foreground ml-2">
                                {hotel.rating} ({hotel.reviewCount})
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {hotel.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {hotel.shortDescription}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No hay hoteles registrados para este destino.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="restaurants" className="mt-6">
                {restaurants.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {restaurants.map(restaurant => (
                      <Link 
                        key={restaurant.id}
                        to={`/restaurante/${restaurant.slug}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-[16/10]">
                            <img 
                              src={restaurant.imageUrl}
                              alt={restaurant.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className="absolute top-3 right-3 bg-card/90">
                              {restaurant.priceRange}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-medium">{restaurant.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                • {restaurant.cuisineType.join(', ')}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {restaurant.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {restaurant.shortDescription}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No hay restaurantes registrados para este destino.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="bars" className="mt-6">
                {bars.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {bars.map(bar => (
                      <Link 
                        key={bar.id}
                        to={`/bar/${bar.slug}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-[16/10]">
                            <img 
                              src={bar.imageUrl}
                              alt={bar.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className="absolute top-3 right-3 bg-card/90">
                              {bar.priceRange}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-medium">{bar.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                • {bar.musicStyle.slice(0, 2).join(', ')}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {bar.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {bar.shortDescription}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No hay bares registrados para este destino.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="experiences" className="mt-6">
                {experiences.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {experiences.map(exp => (
                      <Link 
                        key={exp.id}
                        to={`/experiencia/${exp.slug}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-[16/10]">
                            <img 
                              src={exp.imageUrl}
                              alt={exp.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                              {exp.category}
                            </Badge>
                            <Badge className="absolute top-3 right-3 bg-card/90">
                              {exp.priceRange}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                              <span>{exp.duration}</span>
                              {exp.difficulty && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{exp.difficulty}</span>
                                </>
                              )}
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {exp.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {exp.shortDescription}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No hay experiencias registradas para este destino.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            {/* Distances from major cities */}
            <DistancesFromCities
              latitude={destination.latitude}
              longitude={destination.longitude}
              destinationName={destination.name}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">Información Práctica</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Mejor época para visitar</p>
                      <p className="text-muted-foreground text-sm">{destination.bestTimeToVisit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Thermometer className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Clima</p>
                      <p className="text-muted-foreground text-sm">{destination.weatherInfo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Cómo llegar</p>
                      <p className="text-muted-foreground text-sm">{destination.howToGetThere}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typical Dishes */}
            {destination.typicalDishes && destination.typicalDishes.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Gastronomía Local
                  </h3>
                  <div className="space-y-2">
                    {destination.typicalDishes.map((dish, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{dish}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="font-display text-lg font-semibold mb-2">
                  ¿Listo para explorar?
                </h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Planifica tu viaje a {destination.name}
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/planifica">
                    Comenzar a planificar
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
}
