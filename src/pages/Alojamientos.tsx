import { useState, useEffect } from "react";
import { Header } from "@/components/Header";

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
import { BetweenSectionsAd, SidebarAd, CompactInlineAd, BannerAd, SuperLeaderboardAd, BillboardAd } from "@/components/promo";
import { useTranslation } from "@/hooks/useI18n";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";


import hotelRoomSuite from "@/assets/hotel-room-suite.jpg";

import { 
  Hotel, Airbnb, FALLBACK_HOTELS, FALLBACK_AIRBNBS 
} from "@/data/fallbackAccommodations";

export default function Alojamientos() {
  const [type, setType] = useState<AccommodationType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  const accommodationCategories = [
    { value: "all", label: "Todas las categorías" },
    { value: "resort", label: "Resorts All-Inclusive" },
    { value: "boutique", label: "Hoteles Boutique y Coloniales" },
    { value: "mountain", label: "Eco-Lodges y Cabañas de Montaña" },
    { value: "beachfront", label: "Villas y Penthouses de Playa" },
    { value: "urban", label: "Lofts y Apartamentos Urbanos" },
  ];

  useEffect(() => {
    async function fetchAccommodations() {
      setLoading(true);
      
      try {
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

        // Merge DB data with verified fallback datasets to ensure 3+ items per category
        const mergedHotels = hotelsRes.data && hotelsRes.data.length > 0 
          ? [...(hotelsRes.data as Hotel[]), ...FALLBACK_HOTELS.filter(fb => !(hotelsRes.data as Hotel[]).some(h => h.name.toLowerCase() === fb.name.toLowerCase()))]
          : FALLBACK_HOTELS;

        const mergedAirbnbs = airbnbsRes.data && airbnbsRes.data.length > 0
          ? [...(airbnbsRes.data as Airbnb[]), ...FALLBACK_AIRBNBS.filter(fb => !(airbnbsRes.data as Airbnb[]).some(a => a.name.toLowerCase() === fb.name.toLowerCase()))]
          : FALLBACK_AIRBNBS;

        setHotels(mergedHotels);
        setAirbnbs(mergedAirbnbs);
      } catch (err) {
        console.error("Error fetching accommodations, using complete fallback dataset:", err);
        setHotels(FALLBACK_HOTELS);
        setAirbnbs(FALLBACK_AIRBNBS);
      } finally {
        setLoading(false);
      }
    }

    fetchAccommodations();
  }, []);

  const [ratingFilter, setRatingFilter] = useState<number>(0);

  const filteredHotels = hotels.filter((hotel) => {
    if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(hotel.short_description || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priceRange !== "all" && hotel.price_range !== priceRange) return false;
    if (ratingFilter > 0 && (hotel.rating ?? 0) < ratingFilter) return false;
    
    // Category filtering
    if (categoryFilter !== "all") {
      const cat = (hotel.category || "").toLowerCase();
      if (categoryFilter === "resort" && !cat.includes("resort") && !cat.includes("all-inclusive")) return false;
      if (categoryFilter === "boutique" && !cat.includes("boutique") && !cat.includes("colonial")) return false;
      if (categoryFilter === "mountain" && !cat.includes("eco") && !cat.includes("montaña") && !cat.includes("lodge")) return false;
      if (categoryFilter === "beachfront" && !cat.includes("playa") && !cat.includes("resort")) return false;
      if (categoryFilter === "urban" && !cat.includes("ciudad") && !cat.includes("business")) return false;
    }

    if (selectedAmenities.length > 0 && hotel.amenities) {
      const hotelAmenities = hotel.amenities.map(a => a.toLowerCase());
      if (!selectedAmenities.every(sa => hotelAmenities.some(ha => ha.includes(sa)))) return false;
    }
    return true;
  });

  const filteredAirbnbs = airbnbs.filter((airbnb) => {
    if (searchQuery && !airbnb.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(airbnb.short_description || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (ratingFilter > 0 && (airbnb.rating ?? 0) < ratingFilter) return false;

    // Price range matching for Airbnbs
    if (priceRange !== "all") {
      const price = airbnb.price_per_night || 0;
      if (priceRange === "$" && price > 80) return false;
      if (priceRange === "$$" && (price < 80 || price > 150)) return false;
      if (priceRange === "$$$" && (price < 150 || price > 300)) return false;
      if (priceRange === "$$$$" && price < 300) return false;
    }

    // Category filtering for Airbnbs
    if (categoryFilter !== "all") {
      const propType = (airbnb.property_type || "").toLowerCase();
      const desc = (airbnb.short_description || "").toLowerCase();
      if (categoryFilter === "beachfront" && !propType.includes("playa") && !desc.includes("playa") && !desc.includes("mar")) return false;
      if (categoryFilter === "urban" && !propType.includes("loft") && !propType.includes("apartamento") && !desc.includes("colonial") && !desc.includes("urbano")) return false;
      if (categoryFilter === "mountain" && !propType.includes("cabaña") && !propType.includes("chalet") && !desc.includes("montaña") && !desc.includes("bosque")) return false;
      if (categoryFilter === "resort" && !propType.includes("villa")) return false;
      if (categoryFilter === "boutique" && !propType.includes("loft") && !desc.includes("colonial")) return false;
    }

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
    setCategoryFilter("all");
    setSelectedAmenities([]);
    setRatingFilter(0);
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
        <section className="relative h-[50vh] min-h-[400px] flex items-end">
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
        <section className="bg-background border-b border-border py-4">
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

              <div className="flex flex-wrap gap-2 items-center">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[190px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {accommodationCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-[140px]">
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

                {(searchQuery || priceRange !== "all" || categoryFilter !== "all" || selectedAmenities.length > 0 || ratingFilter > 0) && (
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
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-wrap items-center gap-2">
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating mínimo:</span>
                    {[3, 3.5, 4, 4.5].map((r) => (
                      <Button
                        key={r}
                        variant={ratingFilter === r ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)}
                        className="gap-1"
                      >
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {r}+
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Standard IAB Super Leaderboard */}
        <div className="pt-2">
          <SuperLeaderboardAd showDemo section="alojamientos" />
        </div>

        {/* Results with Sidebar Skyscraper Banner */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{totalResults}</span> {t("alojamientos.found")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Accommodations Grid (9 cols on lg/xl) */}
              <div className="lg:col-span-8 xl:col-span-9">
                {loading ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
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
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Hotels */}
                    {(type === "all" || type === "hotel") &&
                      filteredHotels.map((hotel) => (
                        <motion.div
                          key={hotel.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group h-full"
                        >
                      <Link to={`/alojamiento/${hotel.slug || hotel.id}`} className="block h-full">
                        <Card className={`h-full flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg ${hotel.is_sponsored ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
                          <div>
                            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                              <img
                                src={hotel.image_url || hotelRoomSuite}
                                alt={hotel.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute top-3 right-3 z-10">
                                <FavoriteButton
                                  id={hotel.id}
                                  type="hotel"
                                  name={hotel.name}
                                  image={hotel.image_url || ""}
                                  location={hotel.address || ""}
                                />
                              </div>
                              {hotel.is_sponsored ? (
                                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 text-[11px] shadow-sm">
                                  <Megaphone className="h-3 w-3" /> {t("alojamientos.sponsored")}
                                </Badge>
                              ) : hotel.stars ? (
                                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[11px] shadow-sm font-semibold">
                                  {hotel.stars} ★
                                </Badge>
                              ) : null}
                            </div>
                            <CardContent className="p-4 pb-2">
                              {/* Title & Rating */}
                              <div className="flex items-start justify-between gap-2 mb-1.5 min-h-[28px]">
                                <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                  {hotel.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs shrink-0 bg-secondary/80 px-2 py-0.5 rounded-md">
                                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  <span className="font-bold">{hotel.rating || 4.5}</span>
                                </div>
                              </div>

                              {/* Location Row (fixed height) */}
                              <div className="h-5 mb-2 flex items-center">
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate">{hotel.destinations?.name || hotel.address || "República Dominicana"}</span>
                                </p>
                              </div>

                              {/* Category / Info Row (fixed height) */}
                              <div className="h-5 flex items-center text-xs text-muted-foreground">
                                <span className="truncate">{hotel.category || "Hotel & Resort"}</span>
                              </div>
                            </CardContent>
                          </div>

                          {/* Uniform Bottom Footer */}
                          <div className="p-4 pt-3 border-t border-border/60 flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs font-medium">
                              <Building2 className="h-3 w-3 mr-1 text-primary" />
                              Hotel
                            </Badge>
                            <span className="text-sm font-bold text-primary">
                              {hotel.price_range || "$$$"}
                            </span>
                          </div>
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
                      className="group h-full"
                    >
                      <Link to={`/airbnb/${airbnb.slug || airbnb.id}`} className="block h-full">
                        <Card className={`h-full flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg ${airbnb.is_sponsored ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
                          <div>
                            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                              <img
                                src={airbnb.image_url || hotelRoomSuite}
                                alt={airbnb.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute top-3 right-3 z-10">
                                <FavoriteButton
                                  id={airbnb.id}
                                  type="airbnb"
                                  name={airbnb.name}
                                  image={airbnb.image_url || ""}
                                  location={airbnb.address || ""}
                                />
                              </div>
                              {airbnb.is_sponsored ? (
                                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 text-[11px] shadow-sm">
                                  <Megaphone className="h-3 w-3" /> {t("alojamientos.sponsored")}
                                </Badge>
                              ) : airbnb.is_superhost ? (
                                <Badge className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] shadow-sm font-semibold">
                                  Superhost
                                </Badge>
                              ) : null}
                            </div>
                            <CardContent className="p-4 pb-2">
                              {/* Title & Rating */}
                              <div className="flex items-start justify-between gap-2 mb-1.5 min-h-[28px]">
                                <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                  {airbnb.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs shrink-0 bg-secondary/80 px-2 py-0.5 rounded-md">
                                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  <span className="font-bold">{airbnb.rating || 4.8}</span>
                                </div>
                              </div>

                              {/* Location Row (fixed height) */}
                              <div className="h-5 mb-2 flex items-center">
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate">{airbnb.destinations?.name || airbnb.address || "República Dominicana"}</span>
                                </p>
                              </div>

                              {/* Category / Info Row (fixed height) */}
                              <div className="h-5 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {airbnb.guests || 2} huéspedes
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3 w-3" />
                                  {airbnb.bedrooms || 1} {t("alojamientos.rooms")}
                                </span>
                              </div>
                            </CardContent>
                          </div>

                          {/* Uniform Bottom Footer */}
                          <div className="p-4 pt-3 border-t border-border/60 flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs font-medium">
                              <Home className="h-3 w-3 mr-1 text-primary" />
                              {airbnb.property_type || "Airbnb"}
                            </Badge>
                            <span className="text-sm font-bold text-primary">
                              ${airbnb.price_per_night || 85}{t("alojamientos.perNight")}
                            </span>
                          </div>
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

              {/* Sidebar Skyscraper Column (3-4 cols) */}
              <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-card/90 rounded-3xl border border-border/80 p-4 shadow-xl flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Patrocinador Destacado
                    </span>
                    <BannerAd 
                      size="wide-skyscraper" 
                      placement="sidebar" 
                      showDemo 
                      industry="hotels" 
                      className="shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-8">
              {/* Banner de Sorteo para Lectores / Turistas */}
              <SorteoLectorBanner origenCategoria="Hoteles y Alojamientos" />

              {/* Formulario de Captación B2B para Establecimientos */}
              <CTARegistroEstablecimiento 
                tipo="hotel" 
                titulo="¿Administras un hotel o alojamiento?" 
                subtitulo="Publica tu hotel, resort o villa en Descubre RD de cara al gran lanzamiento del portal. Conecta con miles de viajeros buscando hospedaje."
              />
            </div>
          </div>
        </section>

        <BetweenSectionsAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
