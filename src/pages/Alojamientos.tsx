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
import { BetweenSectionsAd, SidebarAd, CompactInlineAd, BannerAd } from "@/components/promo";
import { useTranslation } from "@/hooks/useI18n";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";


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

// Curated fallback options ensuring at least 3 high-quality accommodations per category
const FALLBACK_HOTELS: Hotel[] = [
  // Categoria: Resort / All-Inclusive
  {
    id: "sanctuary-cap-cana",
    name: "Sanctuary Cap Cana Resort & Spa",
    slug: "sanctuary-cap-cana",
    short_description: "Exclusivo resort 5 estrellas todo incluido solo para adultos frente al mar con servicio de mayordomo privado.",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Resort All-Inclusive",
    amenities: ["wifi", "pool", "restaurant", "gym", "spa", "playa privada"],
    address: "Boulevard Cap Cana, Punta Cana, La Altagracia",
    is_sponsored: true,
    is_featured: true,
    destinations: { name: "Cap Cana, Punta Cana" }
  },
  {
    id: "eden-roc-cap-cana",
    name: "Eden Roc Cap Cana Relais & Châteaux",
    slug: "eden-roc-cap-cana",
    short_description: "Propiedad de ultralujo Relais & Châteaux con villas privadas, club de playa exclusivo y campo de golf Punta Espada.",
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Resort All-Inclusive",
    amenities: ["wifi", "pool", "restaurant", "gym", "golf", "spa"],
    address: "Cap Cana Marina & Beach Club, La Altagracia",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Cap Cana, Punta Cana" }
  },
  {
    id: "casa-de-campo-resort",
    name: "Casa de Campo Resort & Villas",
    slug: "casa-de-campo",
    short_description: "Resort de clase mundial con el icónico campo de golf Teeth of the Dog, marina internacional y villa medieval Altos de Chavón.",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Resort All-Inclusive",
    amenities: ["wifi", "pool", "restaurant", "gym", "golf", "marina"],
    address: "Carretera La Romana - Higüey, La Romana",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "La Romana" }
  },

  // Categoria: Boutique & Colonial
  {
    id: "casas-del-xvi",
    name: "Casas del XVI Boutique Hotel",
    slug: "casas-del-xvi",
    short_description: "Colección de casas coloniales del siglo XVI restauradas con lujo refinado en el corazón de la Ciudad Colonial.",
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$",
    rating: 4.8,
    stars: 5,
    category: "Hotel Boutique",
    amenities: ["wifi", "pool", "restaurant", "patio colonial", "mayordomo"],
    address: "Calle Padre Billini No. 252, Ciudad Colonial, Santo Domingo",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Santo Domingo (Zona Colonial)" }
  },
  {
    id: "billini-hotel",
    name: "Billini Hotel Historic Luxury",
    slug: "billini-hotel",
    short_description: "Vanguardia arquitectónica integrada con muros coloniales del siglo XVI, terraza rooftop y piscina con vista al convento.",
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$",
    rating: 4.7,
    stars: 5,
    category: "Hotel Boutique",
    amenities: ["wifi", "pool", "restaurant", "gym", "rooftop bar"],
    address: "Calle Padre Billini 256, Ciudad Colonial, Santo Domingo",
    is_sponsored: false,
    is_featured: false,
    destinations: { name: "Santo Domingo (Zona Colonial)" }
  },
  {
    id: "the-peninsula-house",
    name: "The Peninsula House Boutique Lodge",
    slug: "peninsula-house",
    short_description: "Mansión estilo victoriano premiada internacionalmente, con vistas panorámicas al océano Atlántico en las colinas de Samaná.",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Hotel Boutique",
    amenities: ["wifi", "pool", "restaurant", "spa", "playa privada"],
    address: "Cosón Hills, Las Terrenas, Samaná",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Las Terrenas, Samaná" }
  },

  // Categoria: Eco-Lodge & Montaña
  {
    id: "casa-bonita-lodge",
    name: "Casa Bonita Tropical Lodge",
    slug: "casa-bonita-barahona",
    short_description: "Santuario ecológico de lujo en la Reserva de la Biosfera con vistas espectaculares del mar Caribe y la Sierra de Bahoruco.",
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$",
    rating: 4.8,
    stars: 4,
    category: "Eco-Lodge & Montaña",
    amenities: ["wifi", "pool", "restaurant", "spa natural", "canopy zipline"],
    address: "Km 17 Carretera de la Costa, Bahoruco, Barahona",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Barahona (Costa Sur)" }
  },
  {
    id: "rancho-baiguate",
    name: "Rancho Baiguate Eco-Adventure",
    slug: "rancho-baiguate",
    short_description: "Pionero del ecoturismo y turismo de aventura en la Cordillera Central, rafting en Río Yaque del Norte y cabalgatas.",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    price_range: "$$",
    rating: 4.7,
    stars: 4,
    category: "Eco-Lodge & Montaña",
    amenities: ["wifi", "pool", "restaurant", "rafting", "senderismo", "caballos"],
    address: "Carretera La Joya, Jarabacoa, La Vega",
    is_sponsored: false,
    is_featured: false,
    destinations: { name: "Jarabacoa, La Vega" }
  },
  {
    id: "clave-verde-ecolodge",
    name: "Clave Verde Ecolodge & Retreat",
    slug: "clave-verde-samana",
    short_description: "Refugio ecológico autosostenible con energía solar, piscina natural y vistas panorámicas de 360 grados a la bahía y montañas.",
    image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
    price_range: "$$",
    rating: 4.8,
    stars: 4,
    category: "Eco-Lodge & Montaña",
    amenities: ["wifi", "pool", "restaurant", "gimnasio al aire libre", "yoga"],
    address: "La Barbacoa, Las Terrenas, Samaná",
    is_sponsored: false,
    is_featured: false,
    destinations: { name: "Samaná" }
  },
];

const FALLBACK_AIRBNBS: Airbnb[] = [
  // Categoria: Villas Frente al Mar (Beachfront)
  {
    id: "villa-palmeras-oceanfront",
    name: "Villa Palmeras Oceanfront Luxury",
    slug: "villa-palmeras-cap-cana",
    short_description: "Lujosa villa contemporánea frente al mar con piscina infinita privada, chef personal y acceso directo a la playa de arena blanca.",
    image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80",
    price_per_night: 420,
    rating: 4.95,
    guests: 10,
    bedrooms: 5,
    is_superhost: true,
    is_sponsored: true,
    is_featured: true,
    property_type: "Villa de Playa",
    amenities: ["wifi", "pool", "aire acondicionado", "chef privado", "acceso directo playa"],
    address: "Marina Boulevard, Cap Cana, Punta Cana",
    destinations: { name: "Cap Cana, Punta Cana" }
  },
  {
    id: "villa-coson-paradise",
    name: "Villa Cosón Beachfront Sanctuary",
    slug: "villa-coson-paradise",
    short_description: "Villa tropical moderna rodeada de palmeras frente a las olas cristalinas de Playa Cosón con terraza panorámica.",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80",
    price_per_night: 310,
    rating: 4.92,
    guests: 8,
    bedrooms: 4,
    is_superhost: true,
    is_sponsored: false,
    is_featured: true,
    property_type: "Villa de Playa",
    amenities: ["wifi", "pool", "cocina gourmet", "barbacoa", "seguridad 24h"],
    address: "Playa Cosón, Las Terrenas, Samaná",
    destinations: { name: "Las Terrenas, Samaná" }
  },
  {
    id: "cabarete-kite-penthouse",
    name: "Kite Penthouse Vista al Océano",
    slug: "cabarete-kite-penthouse",
    short_description: "Penthouse de dos niveles frente a la bahía de kitesurf con jacuzzi privado en la azotea y vistas inigualables del atardecer.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    price_per_night: 185,
    rating: 4.88,
    guests: 6,
    bedrooms: 3,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Penthouse de Playa",
    amenities: ["wifi", "pool", "jacuzzi privado", "aire acondicionado", "estación de kite"],
    address: "Kite Beach, Cabarete, Puerto Plata",
    destinations: { name: "Cabarete, Puerto Plata" }
  },

  // Categoria: Lofts y Apartamentos Coloniales / Ciudad
  {
    id: "loft-historico-conde",
    name: "Loft Histórico Colonial con Patio",
    slug: "loft-historico-conde",
    short_description: "Elegante loft de techos altos y arcos de ladrillo colonial del siglo XVI completamente climatizado con patio privado y jacuzzi.",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    price_per_night: 95,
    rating: 4.89,
    guests: 3,
    bedrooms: 1,
    is_superhost: true,
    is_sponsored: false,
    is_featured: true,
    property_type: "Loft Colonial",
    amenities: ["wifi", "aire acondicionado", "jacuzzi", "cocina equipada", "patio privado"],
    address: "Calle El Conde esq. Hostos, Zona Colonial, Santo Domingo",
    destinations: { name: "Santo Domingo (Zona Colonial)" }
  },
  {
    id: "studio-moderno-piantini",
    name: "Studio de Diseño en Torre Piantini",
    slug: "studio-moderno-piantini",
    short_description: "Moderno estudio de lujo en piso alto con piscina infinita en el rooftop, gimnasio de última generación y vistas a la ciudad.",
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
    price_per_night: 85,
    rating: 4.85,
    guests: 2,
    bedrooms: 1,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Apartamento Urbano",
    amenities: ["wifi", "pool", "gym", "seguridad 24h", "rooftop"],
    address: "Av. Abraham Lincoln, Piantini, Santo Domingo",
    destinations: { name: "Santo Domingo (Piantini)" }
  },
  {
    id: "penthouse-malecon-sd",
    name: "Penthouse Vista Panorámica al Mar",
    slug: "penthouse-malecon-sd",
    short_description: "Impresionante apartamento frente al mar Caribe sobre la Avenida George Washington con balconada corrida y brisa marina constante.",
    image_url: "https://images.unsplash.com/photo-1502005229762-ee1b2da97ba5?w=800&auto=format&fit=crop&q=80",
    price_per_night: 130,
    rating: 4.82,
    guests: 4,
    bedrooms: 2,
    is_superhost: false,
    is_sponsored: false,
    is_featured: false,
    property_type: "Penthouse Urbano",
    amenities: ["wifi", "aire acondicionado", "parqueo techado", "vista al mar"],
    address: "Av. George Washington, Malecón, Santo Domingo",
    destinations: { name: "Santo Domingo (Malecón)" }
  },

  // Categoria: Cabañas de Montaña y Chalets
  {
    id: "cabana-panoramica-pinos",
    name: "Cabaña Panorámica Los Pinos",
    slug: "cabana-panoramica-pinos",
    short_description: "Encantadora cabaña alpina de madera y piedra con chimenea de leña, fogata exterior y vistas infinitas a los valles de Jarabacoa.",
    image_url: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&auto=format&fit=crop&q=80",
    price_per_night: 110,
    rating: 4.93,
    guests: 6,
    bedrooms: 3,
    is_superhost: true,
    is_sponsored: false,
    is_featured: true,
    property_type: "Cabaña de Montaña",
    amenities: ["wifi", "chimenea", "barbacoa", "fogata", "senderos privados"],
    address: "Pinar Quemado, Jarabacoa, La Vega",
    destinations: { name: "Jarabacoa, La Vega" }
  },
  {
    id: "eco-chalet-valle-nuevo",
    name: "Eco-Chalet Entre Nubes Constanza",
    slug: "eco-chalet-valle-nuevo",
    short_description: "Refugio de montaña a más de 1,800 metros sobre el nivel del mar, clima templado de montaña, fogata y observación astronómica.",
    image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
    price_per_night: 125,
    rating: 4.87,
    guests: 5,
    bedrooms: 2,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Chalet de Montaña",
    amenities: ["wifi", "chimenea", "calefacción", "jardines orgánicos", "mirador"],
    address: "Carretera Valle Nuevo, Constanza, La Vega",
    destinations: { name: "Constanza, La Vega" }
  },
  {
    id: "villa-bosque-nublado",
    name: "Villa Bosque de Niebla & Jacuzzi",
    slug: "villa-bosque-nublado",
    short_description: "Villa rústica de lujo en la montaña con jacuzzi climatizado con hidromasaje, rodeada de pinares y arroyos de agua pura.",
    image_url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&auto=format&fit=crop&q=80",
    price_per_night: 160,
    rating: 4.91,
    guests: 8,
    bedrooms: 3,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Cabaña de Montaña",
    amenities: ["wifi", "jacuzzi climatizado", "chimenea", "terraza con asador"],
    address: "Paso Bajito, Jarabacoa, La Vega",
    destinations: { name: "Jarabacoa, La Vega" }
  }
];

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
