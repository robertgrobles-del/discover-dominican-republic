import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Users, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProvinceHeroProps {
  name: string;
  region: string;
  capital?: string;
  population?: number;
  areaKm2?: number;
  description: string;
  images: string[];
  highlights?: string[];
}

const regionLabels: Record<string, string> = {
  norte: "Región Norte (Cibao)",
  sur: "Región Sur",
  este: "Región Este",
  "santo-domingo": "Gran Santo Domingo",
};

export function ProvinceHero({
  name,
  region,
  capital,
  population,
  areaKm2,
  description,
  images,
  highlights,
}: ProvinceHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideCount = images.length || 1;

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={images[currentSlide] || "/placeholder.svg"}
            alt={`${name} - imagen ${currentSlide + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <MapPin className="h-3 w-3 mr-1" />
              {regionLabels[region] || region}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4"
          >
            {name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-6 line-clamp-3"
          >
            {description}
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 mb-6"
          >
            {capital && (
              <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground block">Capital</span>
                  <span className="text-sm font-semibold">{capital}</span>
                </div>
              </div>
            )}
            {population && (
              <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground block">Población</span>
                  <span className="text-sm font-semibold">{population.toLocaleString()}</span>
                </div>
              </div>
            )}
            {areaKm2 && (
              <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Ruler className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground block">Área</span>
                  <span className="text-sm font-semibold">{areaKm2.toLocaleString()} km²</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              {highlights.slice(0, 4).map((highlight, index) => (
                <Badge key={index} variant="secondary" className="bg-card/60 backdrop-blur-sm">
                  {highlight}
                </Badge>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Slide Navigation */}
      {slideCount > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-card/50 backdrop-blur-sm hover:bg-card/80"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-card/50 backdrop-blur-sm hover:bg-card/80"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-primary w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
