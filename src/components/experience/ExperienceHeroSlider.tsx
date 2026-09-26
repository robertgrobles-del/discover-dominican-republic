import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Hotel } from "@/data/hotels";
import { Restaurant } from "@/data/restaurants";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface ExperienceHeroSliderProps {
  images: string[];
  name: string;
  subtitle: string;
  favoriteId: string;
  destinationName?: string;
  hotels?: Hotel[];
  restaurants?: Restaurant[];
}

export function ExperienceHeroSlider({
  images,
  name,
  subtitle,
  favoriteId,
}: ExperienceHeroSliderProps) {
  // Only use the experience's own images
  const ownImages = Array.from(new Set(images.filter(Boolean)));
  const finalImages = ownImages.length > 0
    ? ownImages
    : ["https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1920&h=1080&fit=crop"];

  const slides: HeroSlide[] = finalImages.map((image) => ({
    image,
    title: name,
    subtitle,
  }));

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
      className="relative h-[65vh] min-h-[500px] md:h-[80vh] w-full overflow-hidden touch-pan-y"
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
            alt={`${slide.title} - Foto ${currentSlide + 1}`}
            className="h-full w-full object-cover"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
            loading={currentSlide === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-16 md:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {slides.length > 1 && (
                <div className="mb-3">
                  <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-full text-xs text-white/80">
                    Foto {currentSlide + 1} de {slides.length}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-6">
                <div className="max-w-3xl">
                  <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-md">
                    {name}
                  </h1>

                  <p className="text-white/90 text-base sm:text-lg">
                    {subtitle}
                  </p>
                </div>

                <FavoriteButton
                  id={favoriteId}
                  type="experiencia"
                  name={name}
                  image={finalImages[0]}
                  location={subtitle}
                  className="text-white shrink-0"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider controls (only when there are multiple photos of the experience) */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 mt-8" role="group" aria-label="Controles de fotos">
              <Button
                size="icon"
                variant="outline"
                aria-label="Foto anterior"
                className="rounded-full w-9 h-9 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                onClick={() => {
                  setIsAutoPlaying(false);
                  prevSlide();
                }}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>

              <div className="flex gap-1.5" role="tablist" aria-label="Paginación de fotos">
                {slides.map((s, index) => (
                  <button
                    key={index}
                    role="tab"
                    aria-label={`Foto ${index + 1} de ${name}`}
                    aria-current={index === currentSlide ? "true" : undefined}
                    onClick={() => goToSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      index === currentSlide ? "w-7 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <Button
                size="icon"
                variant="outline"
                aria-label="Foto siguiente"
                className="rounded-full w-9 h-9 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                onClick={() => {
                  setIsAutoPlaying(false);
                  nextSlide();
                }}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <ChevronDown className="h-5 w-5 text-white/60" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
