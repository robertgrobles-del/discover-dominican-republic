import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/promo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hotel, Star, MapPin, DollarSign, ArrowUpDown, 
  ExternalLink, Heart, Check, X, Wifi, UtensilsCrossed,
  Dumbbell, Waves, Sparkles, ShieldCheck, Umbrella, Award, Eye
} from "lucide-react";
import { hotels as allStaticHotels } from "@/data/hotels";

// Enhanced comparison interface with authentic dominican properties
interface CompareProperty {
  id: string;
  name: string;
  slug: string;
  location: string;
  province: string;
  stars: number;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  categoryLabel: string;
  amenities: {
    wifi: boolean;
    allInclusive: boolean;
    gym: boolean;
    pool: boolean;
    spa: boolean;
    beach: boolean;
    golf?: boolean;
    butler?: boolean;
    adultsOnly?: boolean;
  };
  highlights: string[];
}

const COMPARISON_HOTELS: CompareProperty[] = [
  {
    id: "sanctuary-cap-cana",
    name: "Sanctuary Cap Cana Resort & Spa",
    slug: "sanctuary-cap-cana",
    location: "Cap Cana, Punta Cana",
    province: "La Altagracia",
    stars: 5,
    rating: 4.9,
    reviews: 2450,
    pricePerNight: 480,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
    categoryLabel: "Resort Solo Adultos",
    amenities: {
      wifi: true,
      allInclusive: true,
      gym: true,
      pool: true,
      spa: true,
      beach: true,
      butler: true,
      adultsOnly: true,
      golf: true
    },
    highlights: ["Solo Adultos", "Playa Juanillo Privada", "Castillo Colonial Exclusivo", "5 Restaurantes de Autor"]
  },
  {
    id: "eden-roc-cap-cana",
    name: "Eden Roc Cap Cana Relais & Châteaux",
    slug: "eden-roc-cap-cana",
    location: "Cap Cana",
    province: "La Altagracia",
    stars: 5,
    rating: 4.95,
    reviews: 1890,
    pricePerNight: 620,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    categoryLabel: "Ultra Lujo Boutique",
    amenities: {
      wifi: true,
      allInclusive: false,
      gym: true,
      pool: true,
      spa: true,
      beach: true,
      golf: true,
      butler: true,
      adultsOnly: false
    },
    highlights: ["Miembro Relais & Châteaux", "Villas con Piscina Privada", "Punta Espada Golf", "Beach Club Caletón"]
  },
  {
    id: "casa-de-campo",
    name: "Casa de Campo Resort & Villas",
    slug: "casa-de-campo",
    location: "La Romana",
    province: "La Romana",
    stars: 5,
    rating: 4.9,
    reviews: 3560,
    pricePerNight: 550,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
    categoryLabel: "Resort de Golf & Villas",
    amenities: {
      wifi: true,
      allInclusive: false,
      gym: true,
      pool: true,
      spa: true,
      beach: true,
      golf: true,
      butler: true,
      adultsOnly: false
    },
    highlights: ["Teeth of the Dog Golf", "Marina y Altos de Chavón", "Playa Minitas", "Centro Ecuestre y Polo"]
  },
  {
    id: "casa-bonita-barahona",
    name: "Casa Bonita Tropical Lodge",
    slug: "casa-bonita-barahona",
    location: "Bahoruco, Barahona",
    province: "Barahona",
    stars: 4,
    rating: 4.85,
    reviews: 920,
    pricePerNight: 230,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
    categoryLabel: "Eco-Lodge de Selva & Mar",
    amenities: {
      wifi: true,
      allInclusive: false,
      gym: false,
      pool: true,
      spa: true,
      beach: false,
      golf: false,
      butler: false,
      adultsOnly: false
    },
    highlights: ["Reserva Biosfera Jaragua", "Piscina Infinita sobre el Mar", "Canopy Zipline", "Cocina Orgánica de la Huerta"]
  },
  {
    id: "casas-del-xvi",
    name: "Casas del XVI Boutique Hotel",
    slug: "casas-del-xvi",
    location: "Ciudad Colonial, Santo Domingo",
    province: "Santo Domingo / D.N.",
    stars: 5,
    rating: 4.92,
    reviews: 840,
    pricePerNight: 290,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    categoryLabel: "Histórico Colonial de Lujo",
    amenities: {
      wifi: true,
      allInclusive: false,
      gym: false,
      pool: true,
      spa: false,
      beach: false,
      golf: false,
      butler: true,
      adultsOnly: false
    },
    highlights: ["Casas Restauradas del Siglo XVI", "Patio Español Íntimo", "Mayordomo Privado", "Centro Histórico UNESCO"]
  }
];

export default function ComparadorHoteles() {
  const [selectedHotels, setSelectedHotels] = useState<string[]>([
    "sanctuary-cap-cana",
    "eden-roc-cap-cana",
    "casa-de-campo"
  ]);

  const hotelsToCompare = useMemo(() => {
    return COMPARISON_HOTELS.filter((h) => selectedHotels.includes(h.id));
  }, [selectedHotels]);

  const toggleHotel = (hotelId: string) => {
    if (selectedHotels.includes(hotelId)) {
      if (selectedHotels.length > 1) {
        setSelectedHotels((prev) => prev.filter((id) => id !== hotelId));
      }
    } else if (selectedHotels.length < 3) {
      setSelectedHotels((prev) => [...prev, hotelId]);
    } else {
      // Reemplaza el último
      setSelectedHotels((prev) => [prev[0], prev[1], hotelId]);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Comparador de Hoteles y Resorts - República Dominicana"
        description="Compara lado a lado tarifas por noche, amenidades exclusivas, playa privada, régimen de comidas y calificaciones de los mejores hoteles de República Dominicana."
        keywords="comparador hoteles republica dominicana, comparar resorts punta cana, hoteles todo incluido vs boutique rd"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-rose-500 selection:text-white">
        <Header />

        {/* HERO EDITORIAL */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-card via-background to-background border-b border-border">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 mb-4 px-4 py-1.5 text-xs font-mono tracking-widest uppercase">
              HERRAMIENTA INTELIGENTE DE VIAJE
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight">
              Comparador de <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">Hoteles y Resorts</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Analiza tarifas, régimen de comidas, campos de golf, amenidades y distancias de playa para elegir tu estancia soñada en Quisqueya.
            </p>
          </div>
        </section>

        {/* SELECTOR DE HOTELES CHIPS */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md py-4 border-b border-border shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Elige hasta 3 hoteles para comparar:
                </p>
                <p className="text-xs text-muted-foreground">
                  ({selectedHotels.length}/3 seleccionados)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMPARISON_HOTELS.map((hotel) => {
                  const isSelected = selectedHotels.includes(hotel.id);
                  return (
                    <button
                      key={hotel.id}
                      onClick={() => toggleHotel(hotel.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-105"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-border" />
                      )}
                      <span>{hotel.name.split(" ")[0]} {hotel.name.split(" ")[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* TABLA / MATRIZ DE COMPARACIÓN */}
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            {hotelsToCompare.length >= 2 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {hotelsToCompare.map((hotel, idx) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card rounded-3xl border border-border overflow-hidden shadow-lg flex flex-col justify-between hover:border-rose-500/40 transition-all duration-300"
                  >
                    <div>
                      {/* IMAGEN HOTEL CON BADGE */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border-white/20 text-xs">
                          {hotel.categoryLabel}
                        </Badge>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                          <span className="text-xs font-medium flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-rose-400" />
                            {hotel.location}
                          </span>
                          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded text-xs font-bold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {hotel.rating}
                          </div>
                        </div>
                      </div>

                      {/* DETALLE PRINCIPAL */}
                      <div className="p-6">
                        <h3 className="font-display text-xl font-bold text-foreground mb-1 leading-tight line-clamp-2">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {hotel.province} • {hotel.reviews.toLocaleString()} opiniones verificadas
                        </p>

                        {/* TARIFA */}
                        <div className="bg-muted/40 rounded-2xl p-4 mb-6 border border-border/60 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground block">Tarifa Promedio</span>
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                              ${hotel.pricePerNight} <span className="text-xs font-normal text-muted-foreground">USD / noche</span>
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                            Mejor Precio Garantizado
                          </Badge>
                        </div>

                        {/* MATRIZ DE AMENIDADES */}
                        <div className="space-y-3 mb-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Servicios y Facilidades
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-2 p-2 rounded-lg ${hotel.amenities.allInclusive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                              {hotel.amenities.allInclusive ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5" />}
                              <span>Todo Incluido</span>
                            </div>

                            <div className={`flex items-center gap-2 p-2 rounded-lg ${hotel.amenities.beach ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                              {hotel.amenities.beach ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5" />}
                              <span>Playa Privada</span>
                            </div>

                            <div className={`flex items-center gap-2 p-2 rounded-lg ${hotel.amenities.golf ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                              {hotel.amenities.golf ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5" />}
                              <span>Campo de Golf</span>
                            </div>

                            <div className={`flex items-center gap-2 p-2 rounded-lg ${hotel.amenities.spa ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                              {hotel.amenities.spa ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5" />}
                              <span>Spa de Lujo</span>
                            </div>

                            <div className={`flex items-center gap-2 p-2 rounded-lg ${hotel.amenities.butler ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
                              {hotel.amenities.butler ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5" />}
                              <span>Mayordomo</span>
                            </div>

                            <div className={`flex items-center gap-2 p-2 rounded-lg ${hotel.amenities.adultsOnly ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-muted/40 text-muted-foreground"}`}>
                              {hotel.amenities.adultsOnly ? <Check className="h-3.5 w-3.5 text-rose-500" /> : <span className="text-muted-foreground text-[10px]">Familiar</span>}
                              <span>{hotel.amenities.adultsOnly ? "Solo Adultos" : "Ambiente Familiar"}</span>
                            </div>
                          </div>
                        </div>

                        {/* DESTACADOS */}
                        <div className="space-y-2 mb-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Puntos Fuertes
                          </p>
                          <ul className="space-y-1.5">
                            {hotel.highlights.map((h, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* BOTÓN CTA DETALLE */}
                    <div className="p-6 pt-0">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-5 rounded-xl gap-2">
                        <Link to={`/alojamiento/${hotel.slug}`}>
                          <Eye className="h-4 w-4" />
                          Ver Ficha Completa y Tarifas
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border max-w-md mx-auto">
                <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Selecciona al menos 2 alojamientos</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Usa los selectores de la barra superior para comparar tarifas y amenidades.
                </p>
                <Button onClick={() => setSelectedHotels(["sanctuary-cap-cana", "eden-roc-cap-cana", "casa-de-campo"])}>
                  Restaurar Selección Recomendada
                </Button>
              </div>
            )}
          </div>
        </main>

        <BetweenSectionsAd position="comparador-footer" />

        <Footer />
      </div>
    </PageTransition>
  );
}
