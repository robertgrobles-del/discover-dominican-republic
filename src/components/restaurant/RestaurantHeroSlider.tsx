import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, ChevronDown, Star, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Hotel } from "@/data/hotels";
import { Experience } from "@/data/experiences";
import promoLuxuryHotelImg from "@/assets/promo/promo-luxury-hotel.jpg";
import promoAdventureImg from "@/assets/promo/promo-adventure.jpg";

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

function buildSponsorSlides(destinationName: string, hotels: Hotel[], experiences: Experience[]): HeroSlide[] {
  const topHotel = [...hotels].sort((a, b) => b.rating - a.rating)[0];
  const topExperience = [...experiences].sort((a, b) => b.rating - a.rating)[0];

  const hotelSlide: HeroSlide = topHotel
    ? {
        image: topHotel.imageUrl,
        title: topHotel.name,
        subtitle: `Hospédate cerca en ${destinationName}`,
        description: topHotel.shortDescription,
        isSponsored: true,
        sponsorBadge: "Hotel Patrocinado",
        ctaText: "Ver Hotel",
        ctaLink: `/alojamiento/${topHotel.slug}`,
      }
    : {
        image: promoLuxuryHotelImg,
        title: "Anuncia tu Hotel Aquí",
        subtitle: destinationName,
        description: `Llega a los comensales que visitan ${destinationName}.`,
        isSponsored: true,
        sponsorBadge: "Espacio Disponible",
        ctaText: "Conviértete en Patrocinador",
        ctaLink: "/partners",
      };

  const experienceSlide: HeroSlide = topExperience
    ? {
        image: topExperience.imageUrl,
        title: topExperience.name,
        subtitle: `Vive una experiencia en ${destinationName}`,
        description: topExperience.shortDescription,
        isSponsored: true,
        sponsorBadge: "Experiencia Patrocinada",
        ctaText: "Ver Experiencia",
        ctaLink: `/experiencia/${topExperience.slug}`,
      }
    : {
        image: promoAdventureImg,
        title: "Anuncia tu Experiencia Aquí",
        subtitle: destinationName,
        description: `Da a conocer tus tours y actividades a los comensales de ${destinationName}.`,
        isSponsored: true,
        sponsorBadge: "Espacio Disponible",
        ctaText: "Conviértete en Patrocinador",
        ctaLink: "/partners",
      };

  return [hotelSlide, experienceSlide];
}

interface RestaurantHeroSliderProps {
  images: string[];
  name: string;
  location: string;
  destinationSlug?: string;
  destinationName?: string;
  rating: number;
  categoryLabel: string;
  isFeatured?: boolean;
  favoriteId: string;
  hotels: Hotel[];
  experiences: Experience[];
}

export function RestaurantHeroSlider({
  images,
  name,
  location,
  destinationSlug,
  destinationName,
  rating,
  categoryLabel,
  isFeatured,
  favoriteId,
  hotels,
  experiences,
}: RestaurantHeroSliderProps) {
  const ownImages = Array.from(new Set(images.filter(Boolean)));

  const slides: HeroSlide[] = [
    ...ownImages.slice(0, 4).map((image) => ({
      image,
      title: name,
      subtitle: location,
    })),
    ...buildSponsorSlides(destinationName || location, hotels, experiences),
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
                {slide.isSponsored ? (
                  <Badge className="bg-amber-500 text-slate-950 font-bold border-none text-[11px] uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                    {slide.sponsorBadge}
                  </Badge>
                ) : (
                  <>
                    <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                      {categoryLabel}
                    </Badge>
                    {isFeatured && (
                      <Badge className="bg-amber-500 text-white font-bold border-none shadow-md">
                        <Award className="h-3.5 w-3.5 mr-1" /> Destacado
                      </Badge>
                    )}
                    {rating > 0 && (
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {rating}
                      </div>
                    )}
                  </>
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
                  ) : destinationSlug ? (
                    <Link
                      to={`/destino/${destinationSlug}`}
                      className="flex items-center gap-2 text-white/90 text-lg hover:text-white transition-colors"
                    >
                      <MapPin className="h-5 w-5" />
                      {location}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-white/90 text-lg">
                      <MapPin className="h-5 w-5" />
                      {location}
                    </span>
                  )}
                </div>
                {!slide.isSponsored && (
                  <FavoriteButton
                    id={favoriteId}
                    type="restaurante"
                    name={name}
                    image={ownImages[0]}
                    location={location}
                    className="text-white shrink-0"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

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

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/70" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
