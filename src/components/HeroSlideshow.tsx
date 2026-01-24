import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Sun, Ruler, Landmark, Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

const slides = [
  {
    id: 1,
    image: whaleSamanaImg,
    tag: "El paraíso del Caribe",
    title: "Samaná",
    subtitle: "El Santuario de la Naturaleza",
    description: "Donde las montañas besan el mar y las ballenas jorobadas danzan cada invierno. Descubre un paraíso ecológico sin igual.",
    destinations: ["Samaná", "Punta Cana", "Sto. Domingo"],
  },
  {
    id: 2,
    image: heroBeachImg,
    tag: "Vive la experiencia",
    title: "El Caribe que",
    subtitle: "lo tiene todo",
    description: "Playas vírgenes, montañas majestuosas y una historia vibrante te esperan. Descubre un paraíso donde cada rincón cuenta una nueva historia.",
    destinations: ["Punta Cana", "Puerto Plata", "La Romana"],
  },
  {
    id: 3,
    image: santoDomingoImg,
    tag: "Historia y cultura",
    title: "Santo Domingo",
    subtitle: "La Primera Ciudad del Nuevo Mundo",
    description: "Camina por las calles donde comenzó la historia de América. Arquitectura colonial, gastronomía auténtica y noches de merengue.",
    destinations: ["Zona Colonial", "Malecón", "Gastronomía"],
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
            <Button size="lg" className="gap-2 font-display">
              Explorar Destinos
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 font-display">
              <Play className="h-4 w-4" />
              Ver Video
            </Button>
          </motion.div>
        </div>

        {/* Destination Indicators - Synced with slides */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4"
        >
          <AnimatePresence mode="wait">
            {slide.destinations.map((dest, i) => (
              <motion.button
                key={`${slide.id}-${dest}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.1 }}
                className={`text-right text-sm transition-all ${
                  i === 0 ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dest}
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Slide Controls */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-10 h-10"
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
            className="rounded-full w-10 h-10"
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
