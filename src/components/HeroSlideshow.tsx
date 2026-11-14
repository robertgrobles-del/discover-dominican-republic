import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, Sun, Ruler, Landmark, Users, MapPin, Star, Calendar,
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
import capCanaImg from "@/assets/cap-cana.jpg";
import adGastronomyImg from "@/assets/promo/promo-gastronomy-mobile.jpg";
import { usePageContent } from "@/lib/pageContent";
import { useAdBannerList, trackBannerClick, trackBannerImpression, type AdBanner } from "@/hooks/useAdBanners";

import { AdSlotTag } from "@/components/promo/AdSlotTag";

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
      rating: 0, // sin valoraciones reales todavía
      season: "Ene - Mar",
    },
    stats: [
      { icon: Waves, value: "~3,000", label: "Ballenas por Temporada (est.)" },
      { icon: Landmark, value: "60,000+", label: "Observadores de Ballenas (2024)" },
      { icon: Sun, value: "Ene - Mar", label: "Temporada de Ballenas" },
      { icon: Users, value: "11.7M", label: "Visitantes a Nivel Nacional (2025)" },
    ]
  },
  {
    id: 3,
    image: puntaCanaImg,
    tag: "Polo Turístico Líder",
    title: "Punta Cana y Bávaro",
    subtitle: "Playas de Arena Blanca y Lujo",
    description: "Kilómetros de costa continua de arena blanca y aguas turquesas, con el aeropuerto más transitado del país y una de las mayores ofertas hoteleras del Caribe.",
    card: {
      image: puntaCanaImg,
      title: "Playas de Punta Cana",
      location: "La Altagracia",
      rating: 0, // sin valoraciones reales todavía
      season: "Todo el año",
    },
    stats: [
      { icon: Users, value: "11M+", label: "Pasajeros del Aeropuerto PUJ (2025)" },
      { icon: Ruler, value: "900", label: "Vuelos Semanales (Récord 2025)" },
      { icon: Sun, value: "51,000", label: "Pasajeros en un Día (Récord)" },
      { icon: Award, value: "Skytrax 2026", label: "Mejor Aeropuerto de C.A. y el Caribe" },
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
      rating: 0, // sin valoraciones reales todavía
      season: "Todo el año",
    },
    stats: [
      { icon: Landmark, value: "1498", label: "Fundación de Santo Domingo" },
      { icon: Award, value: "1990", label: "Patrimonio Mundial UNESCO" },
      { icon: Building2, value: "1541", label: "Catedral Primada de América" },
      { icon: Users, value: "668,000", label: "Visitantes Extranjeros (2017, BID)" },
    ]
  },
  {
    id: 6,
    image: heroBeachImg,
    tag: "Aventura y Naturaleza",
    title: "Puerto Plata y Costa Norte",
    subtitle: "La Cuna del Turismo y Aventura",
    description: "El kitesurf de Cabarete, los 27 Charcos de Damajagua, la Loma Isabel de Torres y la Fortaleza San Felipe frente al océano Atlántico.",
    card: {
      image: heroBeachImg,
      title: "27 Charcos de Damajagua",
      location: "Puerto Plata",
      rating: 0, // sin valoraciones reales todavía
      season: "Todo el año",
    },
    stats: [
      { icon: Mountain, value: "27", label: "Charcos de Damajagua" },
      { icon: Compass, value: "~790 m", label: "Loma Isabel de Torres" },
      { icon: Landmark, value: "1577", label: "Fortaleza San Felipe" },
      { icon: Users, value: "2.2M", label: "Cruceristas en Puerto Plata (2025)" },
    ]
  },

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
            <AdSlotTag size={card.badge} className="left-3 top-3" />
          )}

          {card.rating > 0 && <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
            <span className="text-xs font-semibold" aria-label={`Calificación ${card.rating} de 5`}>{card.rating}</span>
          </div>}
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
  const pc = usePageContent("hero-slideshow");
  const pageSlides = pc.data("slidesData", __pcData.slidesData);
  // Las diapositivas patrocinadas salen sólo del admin de anuncios (banner_type "hero-slide"), nunca del contenido fijo.
  const heroAds = useAdBannerList("hero-slide", "home");
  const slidesData = useMemo(
    () => [...pageSlides.filter((s) => !s.isSponsored), ...heroAds.filter((b) => b.image_url).map(adToSlide)],
    [pageSlides, heroAds],
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  }, [slidesData.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  }, [slidesData.length]);

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

  const slide = slidesData[currentSlide] ?? slidesData[0];
  const slideAdId = (slide as SlideData & { adId?: string }).adId;
  useEffect(() => { if (slideAdId) void trackBannerImpression(slideAdId); }, [slideAdId]);

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
          avif={pc.img("asset.heroAvif", heroAvif)}
          webp={pc.img("asset.heroWebp", heroWebp)}
          alt={pc.t("ResponsiveImage.alt.1", "Playas paradisíacas de República Dominicana")}
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          fetchpriority="high"
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent via-20% to-black/30" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent via-20% to-black/30" />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Main Hero Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 lg:px-8 pt-8 lg:pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 max-w-2xl min-w-0">
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
                <div className="flex items-center gap-2">
                  {slide.isSponsored && (
                    <SponsoredBadge label={slide.sponsorBadge} className="text-2xs uppercase tracking-wider px-2.5 py-0.5 shadow-sm" />
                  )}
                  <span className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold tracking-wide">
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
                {/* Rotating slide title is h2; the stable page h1 lives outside the carousel */}
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-sm line-clamp-2">
                  {slide.title}
                </h2>
                
                {/* Secondary Subtitle - Refined Accent Scale */}
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-white/90 mt-2 leading-snug line-clamp-1">
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
                className="text-sm sm:text-base md:text-lg text-white/85 mb-7 max-w-xl leading-relaxed line-clamp-2 font-normal"
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
                <Link to={slide.ctaLink || "/destinos"} onClick={() => { if (slideAdId) void trackBannerClick(slideAdId); }}>
                  {slide.ctaText || t("hero.cta")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 font-display border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white" asChild>
                <Link to="/mapa-interactivo">
                  <MapPin className="h-4 w-4" />
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
              aria-label={pc.t("div.aria-label.1", "Carrusel de destinos turísticos y destacados")}
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
            <div className="flex items-center gap-4 mt-6 pr-4" role="group" aria-label={pc.t("div.aria-label.2", "Controles del carrusel")}>
              
              <div className="flex items-center gap-2.5" role="tablist" aria-label={pc.t("div.aria-label.3", "Paginación de slides")}>
                {slidesData.map((s, index) => {
                  const isActive = index === currentSlide;
                  return (
                    <button
                      key={index}
                      role="tab"
                      aria-label={`Slide ${index + 1}: ${s.card.title}`}
                      aria-current={isActive ? "true" : undefined}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => { setIsAutoPlaying(false); goToSlide(index); }}
                      className="group relative flex flex-col justify-center py-2 cursor-pointer transition-all focus:outline-hidden"
                    >
                      <span className="sr-only">{s.card.title}</span>
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out overflow-hidden ${
                          isActive
                            ? "w-12 bg-primary/25 ring-1 ring-primary/40 shadow-xs shadow-primary/30"
                            : "w-4 bg-foreground/25 hover:bg-foreground/50 hover:w-6"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            className="h-full bg-primary rounded-full origin-left"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 6.5, ease: "linear" }}
                            key={currentSlide}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { slidesData };

function adToSlide(b: AdBanner, i: number): SlideData & { adId: string } {
  const d = b.slide_details ?? {};
  return {
    id: 10_000 + i,
    adId: b.id,
    image: b.image_url!,
    tag: d.tag || b.sponsor || "Publicidad",
    title: b.headline || b.name,
    subtitle: b.subtext || "",
    description: b.alt_text || "",
    isSponsored: true,
    sponsorBadge: `Publicidad${b.sponsor ? ` • ${b.sponsor}` : ""}`,
    ctaText: b.cta_text || undefined,
    ctaLink: b.target_url || undefined,
    card: { image: b.image_url!, title: b.headline || b.name, location: d.location || b.sponsor || "", rating: d.rating ?? 0, season: d.season || "", badge: d.badge },
    stats: (d.stats ?? []).filter((s) => s.value).slice(0, 4).map((s) => ({ icon: Star, value: s.value, label: s.label })),
  };
}
