import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Sun, Ruler, Landmark, Users, ChevronLeft, MapPin, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";

const slides = [
  {
    id: 1,
    image: whaleSamanaImg,
    tag: "El paraíso del Caribe",
    title: "Samaná",
    subtitle: "El Santuario de la Naturaleza",
    description: "Donde las montañas besan el mar y las ballenas jorobadas danzan cada invierno. Descubre un paraíso ecológico sin igual.",
    card: {
      image: whaleSamanaImg,
      title: "Avistamiento de Ballenas",
      location: "Bahía de Samaná",
      rating: 4.9,
      season: "Ene - Mar"
    }
  },
  {
    id: 2,
    image: heroBeachImg,
    tag: "Vive la experiencia",
    title: "El Caribe que",
    subtitle: "lo tiene todo",
    description: "Playas vírgenes, montañas majestuosas y una historia vibrante te esperan. Descubre un paraíso donde cada rincón cuenta una nueva historia.",
    card: {
      image: puntaCanaImg,
      title: "Playas de Ensueño",
      location: "Punta Cana",
      rating: 4.8,
      season: "Todo el año"
    }
  },
  {
    id: 3,
    image: santoDomingoImg,
    tag: "Historia y cultura",
    title: "Santo Domingo",
    subtitle: "La Primera Ciudad del Nuevo Mundo",
    description: "Camina por las calles donde comenzó la historia de América. Arquitectura colonial, gastronomía auténtica y noches de merengue.",
    card: {
      image: santoDomingoImg,
      title: "Zona Colonial",
      location: "Santo Domingo",
      rating: 4.7,
      season: "Todo el año"
    }
  },
];

const stats = [
  { icon: Sun, value: "300+", label: "Días de sol" },
  { icon: Ruler, value: "1,600 km", label: "De costas" },
  { icon: Landmark, value: "29", label: "Parques nacionales" },
  { icon: Users, value: "10M+", label: "Visitantes" },
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${slide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                  <span className="w-8 h-px bg-primary" />
                  {slide.tag}
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${slide.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              >
                <span className="text-foreground">{slide.title}</span>
                <br />
                <span className="text-gradient">{slide.subtitle}</span>
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${slide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-muted-foreground mb-8 max-w-lg"
              >
                {slide.description}
              </motion.p>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="gap-2 font-display" asChild>
                <Link to="/destinos">
                  Explorar Destinos
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 font-display">
                <Play className="h-4 w-4" />
                Ver Video
              </Button>
            </motion.div>
          </div>

          {/* Synced Preview Card */}
          <div className="hidden lg:flex justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`card-${slide.id}`}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-80 bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden border border-border/50 shadow-2xl"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={slide.card.image}
                    alt={slide.card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{slide.card.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-foreground mb-2">{slide.card.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{slide.card.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{slide.card.season}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Controls - Positioned to the right and lower */}
        <div className="absolute bottom-40 right-8 lg:right-16 flex items-center gap-4 z-20">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm"
            onClick={() => {
              setIsAutoPlaying(false);
              prevSlide();
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentSlide(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm"
            onClick={() => {
              setIsAutoPlaying(false);
              nextSlide();
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 py-8"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
