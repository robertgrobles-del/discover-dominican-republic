import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Sun, Ruler, Landmark, Users, ChevronLeft, MapPin, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useI18n";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";

interface SlideData {
  id: number;
  image: string;
  tagKey: string;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  card: {
    image: string;
    titleKey: string;
    location: string;
    rating: number;
    seasonKey: string;
  };
}

const slideTemplates: SlideData[] = [
  {
    id: 1, image: whaleSamanaImg, tagKey: "hero.caribbeanParadise",
    titleKey: "hero.slide1.title", subtitleKey: "hero.slide1.subtitle", descriptionKey: "hero.slide1.description",
    card: { image: whaleSamanaImg, titleKey: "hero.slide1.cardTitle", location: "Bahía de Samaná", rating: 4.9, seasonKey: "hero.slide1.cardSeason" }
  },
  {
    id: 2, image: heroBeachImg, tagKey: "hero.liveExperience",
    titleKey: "hero.slide2.title", subtitleKey: "hero.slide2.subtitle", descriptionKey: "hero.slide2.description",
    card: { image: puntaCanaImg, titleKey: "hero.slide2.cardTitle", location: "Punta Cana", rating: 4.8, seasonKey: "common.allYear" }
  },
  {
    id: 3, image: santoDomingoImg, tagKey: "hero.historyAndCulture",
    titleKey: "hero.slide3.title", subtitleKey: "hero.slide3.subtitle", descriptionKey: "hero.slide3.description",
    card: { image: santoDomingoImg, titleKey: "hero.slide3.cardTitle", location: "Santo Domingo", rating: 4.7, seasonKey: "common.allYear" }
  },
  {
    id: 4, image: puntaCanaImg, tagKey: "hero.luxuryAndRelax",
    titleKey: "hero.slide4.title", subtitleKey: "hero.slide4.subtitle", descriptionKey: "hero.slide4.description",
    card: { image: puntaCanaImg, titleKey: "hero.slide4.cardTitle", location: "Bávaro", rating: 4.9, seasonKey: "common.allYear" }
  },
  {
    id: 5, image: heroBeachImg, tagKey: "hero.unlimitedAdventure",
    titleKey: "hero.slide5.title", subtitleKey: "hero.slide5.subtitle", descriptionKey: "hero.slide5.description",
    card: { image: heroBeachImg, titleKey: "hero.slide5.cardTitle", location: "Puerto Plata", rating: 4.8, seasonKey: "common.allYear" }
  },
];

function DestinationCard({ 
  card, isActive, onClick, t
}: { 
  card: { image: string; title: string; location: string; rating: number; season: string };
  isActive: boolean;
  onClick: () => void;
  t: (key: string) => string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      className={`flex-shrink-0 w-72 cursor-pointer transition-all duration-500 ease-out ${
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
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold">{card.rating}</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-foreground mb-2 text-lg">{card.title}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{card.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{card.season}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [bgLoaded, setBgLoaded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const slides = slideTemplates.map(s => ({
    ...s,
    tag: t(s.tagKey),
    title: t(s.titleKey),
    subtitle: t(s.subtitleKey),
    description: t(s.descriptionKey),
    card: {
      ...s.card,
      title: t(s.card.titleKey),
      season: t(s.card.seasonKey),
    }
  }));

  const stats = [
    { icon: Sun, value: "300+", label: t("hero.sunDays") },
    { icon: Ruler, value: "1,600 km", label: t("hero.coastline") },
    { icon: Landmark, value: "29", label: t("hero.nationalParks") },
    { icon: Users, value: "10M+", label: t("hero.visitors") },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideTemplates.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideTemplates.length) % slideTemplates.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  useEffect(() => {
    if (carouselRef.current) {
      const el = carouselRef.current;
      requestAnimationFrame(() => {
        const cardWidth = 288 + 16;
        const containerWidth = el.offsetWidth;
        const scrollPosition = (currentSlide * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
        el.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
      });
    }
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Static first image always present for instant LCP */}
      <div className="absolute inset-0 z-0">
        <img
          src={slideTemplates[0].image}
          alt=""
          className={`h-full w-full object-cover transition-opacity duration-700 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}
          // @ts-ignore
          fetchPriority="high"
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />
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
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 z-0"
          >
            <motion.img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "linear" }}
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${slide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
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
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="text-lg text-muted-foreground mb-8 max-w-lg"
              >
                {slide.description}
              </motion.p>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="gap-2 font-display" asChild>
                <Link to="/destinos">
                  {t("hero.cta")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 font-display">
                <Play className="h-4 w-4" />
                Ver Video
              </Button>
            </motion.div>
          </div>

          <div className="hidden lg:flex lg:col-span-2 flex-col items-end">
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pr-4 max-w-full scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {slides.map((s, index) => (
                <DestinationCard
                  key={s.id}
                  card={s.card}
                  isActive={index === currentSlide}
                  onClick={() => { setIsAutoPlaying(false); goToSlide(index); }}
                  t={t}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 mt-6 pr-4">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                onClick={() => { setIsAutoPlaying(false); prevSlide(); }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setIsAutoPlaying(false); goToSlide(index); }}
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${
                      index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                onClick={() => { setIsAutoPlaying(false); nextSlide(); }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 py-8"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
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
