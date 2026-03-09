import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, MapPin, Star, Bed, Users, Home, Building2, 
  SlidersHorizontal, X, Wifi, Car, Waves, Utensils, Dumbbell, Megaphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FavoriteButton } from "@/components/FavoriteButton";
import { BetweenSectionsAd, SidebarAd, CompactInlineAd } from "@/components/ads";
import { useTranslation } from "@/hooks/useI18n";

import hotelRoomSuite from "@/assets/hotel-room-suite.jpg";

type AccommodationType = "all" | "hotel" | "airbnb";

interface Hotel {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  price_range: string | null;
  rating: number | null;
  stars: number | null;
  category: string | null;
  amenities: string[] | null;
  address: string | null;
  is_sponsored?: boolean | null;
  is_featured?: boolean | null;
  destinations?: { name: string } | null;
}

interface Airbnb {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  price_per_night: number | null;
  rating: number | null;
  guests: number | null;
  bedrooms: number | null;
  is_superhost: boolean | null;
  is_sponsored?: boolean | null;
  is_featured?: boolean | null;
  property_type: string | null;
  amenities: string[] | null;
  address: string | null;
  destinations?: { name: string } | null;
}

export default function Alojamientos() {
  const [type, setType] = useState<AccommodationType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [airbnbs, setAirbnbs] = useState<Airbnb[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const amenitiesOptions = [
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "parking", label: "Parking", icon: Car },
    { id: "pool", label: t("alojamientos.pool"), icon: Waves },
    { id: "restaurant", label: t("alojamientos.restaurant"), icon: Utensils },
    { id: "gym", label: t("alojamientos.gym"), icon: Dumbbell },
  ];

  const priceRanges = [
    { value: "all", label: t("alojamientos.allPrices") },
    { value: "$", label: t("alojamientos.budget") },
    { value: "$$", label: t("alojamientos.moderate") },
    { value: "$$$", label: t("alojamientos.premium") },
    { value: "$$$$", label: t("alojamientos.luxury") },
  ];

  useEffect(() => {
    async function fetchAccommodations() {
      setLoading(true);
      
      const [hotelsRes, airbnbsRes] = await Promise.all([
        supabase
          .from("hotels")
          .select("id, name, slug, short_description, image_url, price_range, rating, stars, category, amenities, address, is_sponsored, is_featured, destinations(name)")
          .eq("is_active", true)
          .order("is_sponsored", { ascending: false })
          .order("is_featured", { ascending: false })
          .limit(50),
        supabase
          .from("airbnb_listings")
          .select("id, name, slug, short_description, image_url, price_per_night, rating, guests, bedrooms, is_superhost, is_sponsored, is_featured, property_type, amenities, address, destinations(name)")
          .eq("is_active", true)
          .order("is_sponsored", { ascending: false })
          .order("is_featured", { ascending: false })
          .limit(50),
      ]);

      if (hotelsRes.data) setHotels(hotelsRes.data as Hotel[]);
      if (airbnbsRes.data) setAirbnbs(airbnbsRes.data as Airbnb[]);
      setLoading(false);
    }

    fetchAccommodations();
  }, []);

  const filteredHotels = hotels.filter((hotel) => {
    if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priceRange !== "all" && hotel.price_range !== priceRange) return false;
    return true;
  });

  const filteredAirbnbs = airbnbs.filter((airbnb) => {
    if (searchQuery && !airbnb.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange("all");
    setSelectedAmenities([]);
  };

  const totalResults =
    type === "all"
      ? filteredHotels.length + filteredAirbnbs.length
      : type === "hotel"
      ? filteredHotels.length
      : filteredAirbnbs.length;

  return (
    <PageTransition>
      <SEOHead
        title={t("alojamientos.seoTitle")}
        description={t("alojamientos.seoDesc")}
        keywords="hoteles República Dominicana, Airbnb Punta Cana, resorts Santo Domingo, alojamiento Caribe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-end mt-16">
          <div className="absolute inset-0">
            <img
              src={hotelRoomSuite}
              alt={t("alojamientos.seoTitle")}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              {t("alojamientos.findPerfectStay")}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-2xl">
              {t("alojamientos.title")} <span className="text-gradient">{t("alojamientos.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              {t("alojamientos.subtitle")}
            </p>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="sticky top-16 z-40 bg-background border-b border-border py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("alojamientos.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={type} onValueChange={(v) => setType(v as AccommodationType)}>
                  <TabsList className="bg-secondary/50">
                    <TabsTrigger value="all" className="gap-2">
                      <Bed className="h-4 w-4" />
                      {t("alojamientos.all")}
                    </TabsTrigger>
                    <TabsTrigger value="hotel" className="gap-2">
                      <Building2 className="h-4 w-4" />
                      {t("alojamientos.hotels")}
                    </TabsTrigger>
                    <TabsTrigger value="airbnb" className="gap-2">
                      <Home className="h-4 w-4" />
                      Airbnb
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-2 items-center">
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("common.price")} />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>

                {(searchQuery || priceRange !== "all" || selectedAmenities.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    {t("alojamientos.clear")}
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-4 border-t border-border mt-4"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground mr-2">{t("alojamientos.amenities")}</span>
                  {amenitiesOptions.map((amenity) => (
                    <Button
                      key={amenity.id}
                      variant={selectedAmenities.includes(amenity.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAmenity(amenity.id)}
                      className="gap-2"
                    >
                      <amenity.icon className="h-3 w-3" />
                      {amenity.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{totalResults}</span> {t("alojamientos.found")}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Hotels */}
                {(type === "all" || type === "hotel") &&
                  filteredHotels.map((hotel) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Link to={`/alojamiento/${hotel.slug || hotel.id}`}>
                        <Card className={`overflow-hidden transition-colors ${hotel.is_sponsored ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <img
                              src={hotel.image_url || hotelRoomSuite}
                              alt={hotel.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                              <FavoriteButton
                                id={hotel.id}
                                type="hotel"
                                name={hotel.name}
                                image={hotel.image_url || ""}
                                location={hotel.address || ""}
                              />
                            </div>
                            {hotel.is_sponsored ? (
                              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                                <Megaphone className="h-3 w-3" /> {t("alojamientos.sponsored")}
                              </Badge>
                            ) : hotel.stars ? (
                              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                                {hotel.stars} ★
                              </Badge>
                            ) : null}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {hotel.name}
                              </h3>
                              {hotel.rating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{hotel.rating}</span>
                                </div>
                              )}
                            </div>
                            {hotel.destinations?.name && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                <MapPin className="h-3 w-3" />
                                {hotel.destinations.name}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                <Building2 className="h-3 w-3 mr-1" />
                                Hotel
                              </Badge>
                              {hotel.price_range && (
                                <span className="text-sm font-semibold text-primary">{hotel.price_range}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}

                {/* Airbnbs */}
                {(type === "all" || type === "airbnb") &&
                  filteredAirbnbs.map((airbnb) => (
                    <motion.div
                      key={airbnb.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Link to={`/airbnb/${airbnb.slug || airbnb.id}`}>
                        <Card className={`overflow-hidden transition-colors ${airbnb.is_sponsored ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <img
                              src={airbnb.image_url || hotelRoomSuite}
                              alt={airbnb.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                              <FavoriteButton
                                id={airbnb.id}
                                type="airbnb"
                                name={airbnb.name}
                                image={airbnb.image_url || ""}
                                location={airbnb.address || ""}
                              />
                            </div>
                            {airbnb.is_sponsored ? (
                              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                                <Megaphone className="h-3 w-3" /> {t("alojamientos.sponsored")}
                              </Badge>
                            ) : airbnb.is_superhost ? (
                              <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                                Superhost
                              </Badge>
                            ) : null}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {airbnb.name}
                              </h3>
                              {airbnb.rating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{airbnb.rating}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                              {airbnb.guests && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {airbnb.guests}
                                </span>
                              )}
                              {airbnb.bedrooms && (
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3 w-3" />
                                  {airbnb.bedrooms} {t("alojamientos.rooms")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                <Home className="h-3 w-3 mr-1" />
                                {airbnb.property_type || "Airbnb"}
                              </Badge>
                              {airbnb.price_per_night && (
                                <span className="text-sm font-semibold text-primary">
                                  ${airbnb.price_per_night}{t("alojamientos.perNight")}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            )}

            {!loading && totalResults === 0 && (
              <div className="text-center py-16">
                <Bed className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t("alojamientos.noResults")}</h3>
                <p className="text-muted-foreground mb-4">{t("alojamientos.noResultsDesc")}</p>
                <Button onClick={clearFilters}>{t("alojamientos.clearFilters")}</Button>
              </div>
            )}
          </div>
        </section>

        <BetweenSectionsAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
