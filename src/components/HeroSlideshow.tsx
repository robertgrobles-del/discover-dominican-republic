import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, Search, Sun, Ruler, Landmark, Users, ChevronLeft, MapPin, Star, Calendar,
  Hotel, UtensilsCrossed, Waves, Award, Building2, Utensils, Mountain, Compass, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useI18n";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import heroAvif from "@/assets/whale-samana.avif";
import heroWebp from "@/assets/whale-samana.webp";
import heroBeachImg from "@/assets/hero-beach.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import adLuxuryHotelImg from "@/assets/promo/promo-luxury-hotel.jpg";
import adGastronomyImg from "@/assets/promo/promo-gastronomy-mobile.jpg";

interface SlideStat {
  icon: typeof Sun;
  value: string;
  label: string;
}

interface SlideData {
  id: number;
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  isSponsored?: boolean;
  sponsorBadge?: string;
  ctaText?: string;
  ctaLink?: string;
  card: {
    image: string;
    title: string;
    location: string;
    rating: number;
    season: string;
    badge?: string;
  };
  stats: SlideStat[];
}

const slidesData: SlideData[] = [
  {
    id: 1,
    image: whaleSamanaImg,
    tag: "Santuario Ecológico Nacional",
    title: "Samaná",
    subtitle: "El Santuario de la Naturaleza",
    description: "Donde las montañas se encuentran con el mar y miles de ballenas jorobadas acuden en su migración anual. Cascadas vírgenes, cayos turquesas y exuberante selva tropical.",
    card: {
      image: whaleSamanaImg,
      title: "Avistamiento de Ballenas",
      location: "Bahía de Samaná",
      rating: 4.9,
      season: "Ene - Mar",
    },
    stats: [
      { icon: Waves, value: "3,000+", label: "Ballenas Jorobadas" },
      { icon: Landmark, value: "32", label: "Áreas Protegidas" },
      { icon: Sun, value: "300+", label: "Días de Sol al Año" },
      { icon: Users, value: "10.3M+", label: "Visitantes Anuales" },
    ]
  },
  {
    id: 2,
    image: adLuxuryHotelImg,
    tag: "Establecimiento Destacado",
    title: "Sanctuary Cap Cana",
    subtitle: "Resort de Lujo Frente al Caribe",
    description: "Villas exclusivas con servicio de mayordomo privado, suites sobre acantilados, 5 piscinas y acceso directo al campo de golf Punta Espada PGA.",
    isSponsored: true,
    sponsorBadge: "Hotel Patrocinado",
    ctaText: "Ver Habitaciones & Tarifas",
    ctaLink: "/alojamientos",
    card: {
      image: adLuxuryHotelImg,
      title: "Sanctuary Cap Cana",
      location: "Cap Cana, Punta Cana",
      rating: 4.9,
      season: "Todo el año",
      badge: "5 Estrellas Luxury"
    },
    stats: [
      { icon: Hotel, value: "5 Diamantes", label: "Categoría Luxury" },
      { icon: Star, value: "4.9 / 5", label: "Satisfacción Huéspedes" },
      { icon: Building2, value: "324", label: "Suites & Villas" },
      { icon: Award, value: "100%", label: "Playa Privada" },
    ]
  },
  {
    id: 3,
    image: puntaCanaImg,
    tag: "Polo Turístico Líder",
    title: "Punta Cana y Bávaro",
    subtitle: "Playas de Arena Blanca y Lujo",
    description: "Más de 48 kilómetros de costa continua de arena de coralina blanca, aguas turquesas y la mayor oferta hotelera de clase mundial en el Caribe.",
    card: {
      image: puntaCanaImg,
      title: "Playas de Punta Cana",
      location: "La Altagracia",
      rating: 4.8,
      season: "Todo el año",
    },
    stats: [
      { icon: Ruler, value: "1,600 km", label: "Costas y Playas" },
      { icon: Sun, value: "28°C", label: "Temperatura Promedio" },
      { icon: Users, value: "8.5M+", label: "Llegadas por Vía Aérea" },
      { icon: Award, value: "18", label: "Campos de Golf PGA" },
    ]
  },
  {
    id: 4,
    image: adGastronomyImg,
    tag: "Experiencia Culinaria Oficial",
    title: "Restaurante La Yola",
    subtitle: "Alta Cocina Mediterránea y Mariscos",
    description: "Galardonado con tres diamantes AAA, situado sobre pilotes en la Marina de Cap Cana. Pescados frescos del día y maridaje internacional con vistas panorámicas al mar.",
    isSponsored: true,
    sponsorBadge: "Restaurante Patrocinado",
    ctaText: "Reservar Mesa",
    ctaLink: "/guia-gastronomica",
    card: {
      image: adGastronomyImg,
      title: "La Yola Restaurant",
      location: "Marina Cap Cana",
      rating: 4.9,
      season: "Todo el año",
      badge: "3 Diamantes AAA"
    },
    stats: [
      { icon: UtensilsCrossed, value: "AAA 3-Diamond", label: "Reconocimiento Gourmet" },
      { icon: Star, value: "4.9 / 5", label: "Crítica Gastronómica" },
      { icon: Utensils, value: "100% Fresco", label: "Pesca del Día Local" },
      { icon: Crown, value: "Top 1", label: "Vistas a la Marina" },
    ]
  },
  {
    id: 5,
    image: santoDomingoImg,
    tag: "Patrimonio de la Humanidad UNESCO",
    title: "Ciudad Colonial",
    subtitle: "La Primera Ciudad del Nuevo Mundo",
    description: "Camina por las calles empedradas donde comenzó la historia de América. Arquitectura del siglo XVI, museos primados, catedrales y una vibrante vida cultural y nocturna.",
    card: {
      image: santoDomingoImg,
      title: "Zona Colonial",
      location: "Santo Domingo",
      rating: 4.7,
      season: "Todo el año",
    },
    stats: [
      { icon: Landmark, value: "500+ Años", label: "De Historia Viva" },
      { icon: Award, value: "UNESCO", label: "Patrimonio Mundial" },
      { icon: Building2, value: "300+", label: "Monumentos Históricos" },
      { icon: Users, value: "1.8M+", label: "Visitas Culturales" },
    ]
  },
  {
    id: 6,
    image: heroBeachImg,
    tag: "Aventura y Naturaleza",
    title: "Puerto Plata y Costa Norte",
    subtitle: "La Cuna del Turismo y Aventura",
    description: "La capital mundial del kitesurf en Cabarete, los impresionantes 27 Charcos de Damajagua, el único teleférico del Caribe y fortalezas históricas frente al océano Atlántico.",
    card: {
      image: heroBeachImg,
      title: "27 Charcos de Damajagua",
      location: "Puerto Plata",
      rating: 4.8,
      season: "Todo el año",
    },
    stats: [
      { icon: Mountain, value: "27", label: "Cascadas Naturales" },
      { icon: Compass, value: "3,087 m", label: "Pico Duarte (Punto + Alto)" },
      { icon: Waves, value: "25 Nudos", label: "Vientos de Cabarete" },
      { icon: Users, value: "2.2M+", label: "Cruceristas Anuales" },
    ]
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&auto=format&fit=crop&q=80",
    tag: "Marca País • Cervecería Nacional Dominicana",
    title: "Cerveza Presidente",
    subtitle: "El Sabor Que Nos Une en Cada Rincón de Quisqueya 🇩🇴🍺",
    description: "Disfruta de una fría bien vestida de novia frente a las mejores playas y terrazas del país. Orgullo 100% dominicano que acompaña las mejores experiencias turísticas.",
    isSponsored: true,
    sponsorBadge: "Publicidad Oficial • Cerveza Presidente",
    ctaText: "Descubrir Puntos de Venta",
    ctaLink: "/bebidas-rd",
    card: {
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80",
      title: "Cerveza Presidente",
      location: "Disponible en todo el país",
      rating: 5.0,
      season: "Todo el año",
      badge: "Cerveza Oficial"
    },
    stats: [
      { icon: Award, value: "-2°C", label: "Servida Vestida de Novia" },
      { icon: Star, value: "100%", label: "Orgullo Dominicano" },
      { icon: Users, value: "#1", label: "Cerveza Preferida en RD" },
      { icon: Sun, value: "365 Días", label: "De Frescura Total" },
    ]
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&auto=format&fit=crop&q=80",
    tag: "Línea Aérea Bandera de Precios Bajos",
    title: "Arajet Airlines",
    subtitle: "Vuela Directo al Paraíso Dominicano desde $9.99 USD",
    description: "Conectando Santo Domingo, Punta Cana y Santiago con más de 23 destinos internacionales en Norte, Centro y Suramérica en la flota de Boeing 737 MAX más moderna del Caribe.",
    isSponsored: true,
    sponsorBadge: "Línea Aérea Patrocinada",
    ctaText: "Buscar Vuelos & Ofertas",
    ctaLink: "/como-llegar",
    card: {
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80",
      title: "Arajet Airlines",
      location: "AILA / PUJ / STI",
      rating: 4.8,
      season: "Todo el año",
      badge: "Vuelos Directos"
    },
    stats: [
      { icon: Compass, value: "23+", label: "Destinos en América" },
      { icon: Star, value: "Boeing 737", label: "Flota Nueva MAX 8" },
      { icon: Users, value: "Tarifas Low-Cost", label: "Precios Imbatibles" },
      { icon: Award, value: "Hub Caribe", label: "Santo Domingo" },
    ]
  }
];

function DestinationCard({ 
  card, isActive, onClick
}: { 
  card: SlideData["card"];
  isActive: boolean;
  onClick: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Ver destino: ${card.title}`}
      className={`flex-shrink-0 w-72 text-left transition-all duration-500 ease-out ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
      }`}
      whileHover={{ scale: isActive ? 1.02 : 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={`bg-card/90 backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-500 ${
        isActive ? 'border-primary/50 shadow-xl shadow-primary/10' : 'border-border/30 shadow-lg'
      }`}>
        <div className="aspect-[4/3] relative overflow-hidden">
          {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
          <img
            src={card.image}
            alt={card.title}
            width="288"
            height="216"
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            ref={(img) => { if (img?.complete) setImageLoaded(true); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {card.badge && (
            <div className="absolute top-3 left-3 bg-red-600 text-white font-mono font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs border border-white flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>{card.badge} • ESPACIO DISPONIBLE</span>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
            <span className="text-xs font-semibold" aria-label={`Calificación ${card.rating} de 5`}>{card.rating}</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-foreground mb-2 text-lg truncate">{card.title}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{card.location}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span>{card.season}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function HeroSlideshow({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  useEffect(() => {
    if (carouselRef.current) {
      const el = carouselRef.current;
      const cardWidth = 288 + 16;
      el.scrollTo({ left: currentSlide * cardWidth, behavior: 'smooth' });
    }
  }, [currentSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  const slide = slidesData[currentSlide];

  return (
    <section 
      className="relative min-h-[92vh] lg:min-h-screen w-full flex flex-col justify-between overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Static first image always present for instant LCP with 0 delay */}
      <div className="absolute inset-0 z-0">
        <ResponsiveImage
          src={slidesData[0].image}
          avif={heroAvif}
          webp={heroWebp}
          alt="Playas paradisíacas de República Dominicana"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          // @ts-ignore
          fetchpriority="high"
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Animated slides for non-first slides */}
      {currentSlide !== 0 && (
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 z-0"
          >
            <motion.img
              src={slide.image}
              alt={slide.title}
              width="1920"
              height="1080"
              className="h-full w-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 7, ease: "linear" }}
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Main Hero Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 lg:px-8 pt-8 lg:pt-12 pb-8">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 max-w-2xl">

            {onOpenSearch && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenSearch}
                aria-label="Abrir búsqueda global"
                className="mb-6 h-12 w-full max-w-xl justify-between rounded-xl border-border/80 bg-background/85 px-4 text-left text-muted-foreground shadow-lg backdrop-blur-md hover:border-primary/50 hover:bg-background"
              >
                <span className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span>¿Qué quieres descubrir en República Dominicana?</span>
                </span>
                <span className="hidden rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                  Buscar
                </span>
              </Button>
            )}
            
            {/* Tag / Sponsor Badge & Red Dimensions Indicator */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${slide.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-start gap-2.5 mb-4"
              >
                {slide.isSponsored && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-mono font-black text-xs sm:text-sm border-2 border-white shadow-2xl shadow-red-950/80 uppercase tracking-wider animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>SLIDER HERO (1920 × 1080) • ESPACIO PUBLICITARIO DISPONIBLE</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {slide.isSponsored && (
                    <SponsoredBadge label={slide.sponsorBadge} className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 shadow-sm" />
                  )}
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold tracking-wide">
                    <span className="w-6 h-px bg-primary" />
                    {slide.tag}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Title & Subtitle with Clear Typographic Hierarchy */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`headings-${slide.id}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
                className="mb-4"
              >
                {/* Main H1 Title - Dominant & Impactful */}
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08] line-clamp-2">
                  {slide.title}
                </h1>
                
                {/* Secondary Subtitle - Refined Accent Scale */}
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-gradient mt-2 leading-snug line-clamp-1">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Editorial Description - Distinct Paragraph Scale */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${slide.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="text-sm sm:text-base md:text-lg text-muted-foreground/90 mb-7 max-w-xl leading-relaxed line-clamp-3 font-normal"
              >
                {slide.description}
              </motion.p>
            </AnimatePresence>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="gap-2 font-display font-semibold shadow-lg shadow-primary/20" asChild>
                <Link to={slide.ctaLink || "/destinos"}>
                  {slide.ctaText || t("hero.cta")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 font-display bg-background/50 backdrop-blur-md border-border/80 hover:bg-secondary" asChild>
                <Link to="/mapa-interactivo">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t("hero.exploreMap")}
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Carousel Preview Cards (Desktop) */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-end">
            <div
              ref={carouselRef}
              role="region"
              aria-label="Carrusel de destinos turísticos y destacados"
              aria-roledescription="carrusel"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pr-4 max-w-full scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
            >
              {slidesData.map((s, index) => (
                <DestinationCard
                  key={s.id}
                  card={s.card}
                  isActive={index === currentSlide}
                  onClick={() => { setIsAutoPlaying(false); goToSlide(index); }}
                />
              ))}
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-4 mt-6 pr-4" role="group" aria-label="Controles del carrusel">
              <Button
                size="icon"
                variant="outline"
                aria-label="Slide anterior"
                className="rounded-full w-10 h-10 bg-background/60 backdrop-blur-md border-border/60 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                onClick={() => { setIsAutoPlaying(false); prevSlide(); }}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              
              <div className="flex gap-2" role="tablist" aria-label="Paginación de slides">
                {slidesData.map((s, index) => (
                  <button
                    key={index}
                    role="tab"
                    aria-label={`Slide ${index + 1}: ${s.card.title}`}
                    aria-current={index === currentSlide ? "true" : undefined}
                    tabIndex={index === currentSlide ? 0 : -1}
                    onClick={() => { setIsAutoPlaying(false); goToSlide(index); }}
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${
                      index === currentSlide ? "w-8 bg-primary shadow-xs shadow-primary/50" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <Button
                size="icon"
                variant="outline"
                aria-label="Slide siguiente"
                className="rounded-full w-10 h-10 bg-background/60 backdrop-blur-md border-border/60 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                onClick={() => { setIsAutoPlaying(false); nextSlide(); }}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Synchronized Statistics Strip (changes per active slide) */}
      <div className="relative z-10 py-6 bg-transparent">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`stats-${slide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
            >
              {slide.stats.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3.5 p-2"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <StatIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-xl md:text-2xl font-bold text-foreground truncate">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
