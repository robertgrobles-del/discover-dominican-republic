import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Destination } from "@/data/destinations";
import { Hotel } from "@/data/hotels";
import { Restaurant } from "@/data/restaurants";
import promoLuxuryHotelImg from "@/assets/promo/promo-luxury-hotel.jpg";
import promoGastronomyImg from "@/assets/promo/promo-gastronomy-mobile.jpg";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  description?: string;
  isSponsored?: boolean;
  sponsorBadge?: string;
  ctaText?: string;
  ctaLink?: string;
}

const categoryLabels: Record<string, string> = {
  playa: "Playa",
  montaña: "Montaña",
  ecoturismo: "Ecoturismo",
  cultura: "Cultura",
  aventura: "Aventura",
  rios: "Ríos",
  ciudad: "Ciudad",
  lujo: "Lujo",
};

function buildSponsorSlides(destination: Destination, hotels: Hotel[], restaurants: Restaurant[]): HeroSlide[] {
  const topHotel = [...hotels].sort((a, b) => b.rating - a.rating)[0];
  const topRestaurant = [...restaurants].sort((a, b) => b.rating - a.rating)[0];

  const hotelSlide: HeroSlide = topHotel
    ? {
        image: topHotel.imageUrl,
        title: topHotel.name,
        subtitle: `Hospédate en ${destination.name}`,
        description: topHotel.shortDescription,
        isSponsored: true,
        sponsorBadge: "Hotel Patrocinado",
        ctaText: "Ver Hotel",
        ctaLink: `/alojamiento/${topHotel.slug}`,
      }
    : {
        image: promoLuxuryHotelImg,
        title: "Anuncia tu Hotel Aquí",
        subtitle: destination.name,
        description: `Llega a miles de viajeros que están planificando su visita a ${destination.name}.`,
        isSponsored: true,
        sponsorBadge: "Espacio Disponible",
        ctaText: "Conviértete en Patrocinador",
        ctaLink: "/partners",
      };

  const restaurantSlide: HeroSlide = topRestaurant
    ? {
        image: topRestaurant.imageUrl,
        title: topRestaurant.name,
        subtitle: `Gastronomía en ${destination.name}`,
        description: topRestaurant.shortDescription,
        isSponsored: true,
        sponsorBadge: "Restaurante Patrocinado",
        ctaText: "Ver Restaurante",
        ctaLink: `/restaurante/${topRestaurant.slug}`,
      }
    : {
        image: promoGastronomyImg,
        title: "Anuncia tu Restaurante Aquí",
        subtitle: destination.name,
        description: `Da a conocer tu propuesta gastronómica a los visitantes de ${destination.name}.`,
        isSponsored: true,
        sponsorBadge: "Espacio Disponible",
        ctaText: "Conviértete en Patrocinador",
        ctaLink: "/partners",
      };

  return [hotelSlide, restaurantSlide];
}

interface DestinationHeroSliderProps {
  destination: Destination;
  hotels: Hotel[];
  restaurants: Restaurant[];
}

export function DestinationHeroSlider({ destination, hotels, restaurants }: DestinationHeroSliderProps) {
  const ownImages = Array.from(new Set([destination.imageUrl, ...(destination.gallery || [])].filter(Boolean)));

  const slides: HeroSlide[] = [
    ...ownImages.slice(0, 4).map((image) => ({
      image,
      title: destination.name,
      subtitle: destination.province || "República Dominicana",
    })),
    ...buildSponsorSlides(destination, hotels, restaurants),
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      setIsAutoPlaying(false);
      diff > 0 ? nextSlide() : prevSlide();
    }
    touchStartX.current = null;
  };

  const slide = slides[currentSlide];

  return (
    <section
      className="relative h-screen w-full overflow-hidden touch-pan-y"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
            loading={currentSlide === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {slide.isSponsored && (
                  <SponsoredBadge label={slide.sponsorBadge} className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 shadow-sm" />
                )}
                {!slide.isSponsored &&
                  destination.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="bg-primary/90 text-primary-foreground">
                      {categoryLabels[cat] || cat}
                    </Badge>
                  ))}
                {!slide.isSponsored && destination.type === "provincia" && (
                  <Badge variant="outline" className="border-white/50 text-white">
                    Provincia
                  </Badge>
                )}
                {!slide.isSponsored && destination.type === "municipio" && (
                  <Badge variant="outline" className="border-white/50 text-white">
                    Municipio
                  </Badge>
                )}
              </div>

              <div className="flex items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
                    {slide.title}
                  </h1>
                  {slide.isSponsored ? (
                    <>
                      <p className="text-white/90 text-lg mb-2">{slide.subtitle}</p>
                      {slide.description && (
                        <p className="text-white/75 max-w-xl mb-6 line-clamp-2">{slide.description}</p>
                      )}
                      <Button size="lg" className="gap-2 font-display font-semibold shadow-lg" asChild>
                        <Link to={slide.ctaLink || "/partners"}>
                          {slide.ctaText}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  ) : (
                    destination.province && (
                      <Link
                        to={`/destino/${destination.provinceSlug}`}
                        className="flex items-center gap-2 text-white/90 text-lg hover:text-white transition-colors"
                      >
                        <MapPin className="h-5 w-5" />
                        {destination.province}
                      </Link>
                    )
                  )}
                </div>
                {!slide.isSponsored && (
                  <FavoriteButton
                    id={destination.id}
                    type="destino"
                    name={destination.name}
                    image={destination.imageUrl}
                    location={destination.province}
                    className="text-white shrink-0"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider controls */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 mt-10" role="group" aria-label="Controles del carrusel">
              <Button
                size="icon"
                variant="outline"
                aria-label="Slide anterior"
                className="rounded-full w-10 h-10 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                onClick={() => {
                  setIsAutoPlaying(false);
                  prevSlide();
                }}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>

              <div className="flex gap-2" role="tablist" aria-label="Paginación de slides">
                {slides.map((s, index) => (
                  <button
                    key={index}
                    role="tab"
                    aria-label={`Slide ${index + 1}: ${s.title}`}
                    aria-current={index === currentSlide ? "true" : undefined}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${
                      index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <Button
                size="icon"
                variant="outline"
                aria-label="Slide siguiente"
                className="rounded-full w-10 h-10 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                onClick={() => {
                  setIsAutoPlaying(false);
                  nextSlide();
                }}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/70" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
