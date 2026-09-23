import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, MapPin, Users, Compass, 
  Building2, Award, Star, ExternalLink, ArrowRight, Sparkles, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import samanaImg from "@/assets/samana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import adLuxuryHotelImg from "@/assets/promo/promo-luxury-hotel.jpg";
import adGastronomyImg from "@/assets/promo/promo-gastronomy-mobile.jpg";

export interface ProvinceSlide {
  id: number;
  slug?: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  isSponsored?: boolean;
  sponsorBadge?: string;
  sponsorBrand?: string;
  ctaText: string;
  ctaLink: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export const provinceSlidesData: ProvinceSlide[] = [
  {
    id: 1,
    slug: "samana",
    name: "Provincia Samaná",
    region: "Región Cibao Nordeste",
    tagline: "El Santuario de la Naturaleza y Ballenas Jorobadas",
    description: "Santuario marino mundial, playas vírgenes en Las Terrenas y Las Galeras, y la imponente cascada Salto del Limón entre exuberante vegetación tropical.",
    image: samanaImg,
    isSponsored: false,
    ctaText: "Explorar Samaná",
    ctaLink: "/provincia/samana",
    stats: [
      { label: "Población", value: "114,000 hab." },
      { label: "Capital", value: "Santa Bárbara" },
      { label: "Destinos Top", value: "Las Terrenas, Cayo Levantado" }
    ]
  },
  {
    id: 2,
    slug: "puerto-plata",
    name: "Provincia Puerto Plata",
    region: "Región Costa Norte",
    tagline: "La Novia del Atlántico & Cuna del Turismo",
    description: "Teleférico de la Loma Isabel de Torres, los 27 Charcos de Damajagua, la capital mundial del kitesurf en Cabarete y rica historia victoriana.",
    image: puertoPlataImg,
    isSponsored: false,
    ctaText: "Descubrir Puerto Plata",
    ctaLink: "/provincia/puerto-plata",
    stats: [
      { label: "Población", value: "330,000 hab." },
      { label: "Capital", value: "San Felipe" },
      { label: "Aventura", value: "Kitesurf, Teleférico, Cascadas" }
    ]
  },
  {
    id: 3,
    name: "Resorts & Eco-Villas Samaná Bay",
    region: "Alojamiento Exclusivo",
    tagline: "Experiencia Todo Incluido & Villas Frente al Mar",
    description: "Despierta con la brisa de la bahía en villas privadas con servicio de chef de autor, spa de hidroterapia y excursiones privadas a los arrecifes.",
    image: adLuxuryHotelImg,
    isSponsored: true,
    sponsorBadge: "Patrocinado",
    sponsorBrand: "Samaná Luxury Collection",
    ctaText: "Reservar Estadía Exclusiva",
    ctaLink: "/alojamientos",
    stats: [
      { label: "Calificación", value: "5.0 ★ Lujo" },
      { label: "Beneficio", value: "20% Off Vía Web" },
      { label: "Incluye", value: "Desayuno & Catamarán" }
    ]
  },
  {
    id: 4,
    slug: "distrito-nacional",
    name: "Santo Domingo (Distrito Nacional)",
    region: "Capital & Centro Histórico",
    tagline: "Primada de América: 500 Años de Historia y Vanguardia",
    description: "Pasea por las primeras calles y monumentos de América en la Ciudad Colonial (UNESCO), museos de talla internacional y la más vibrante escena gastronómica del Caribe.",
    image: santoDomingoImg,
    isSponsored: false,
    ctaText: "Explorar la Capital",
    ctaLink: "/provincia/distrito-nacional",
    stats: [
      { label: "Población", value: "1.05M hab." },
      { label: "Capital", value: "Santo Domingo" },
      { label: "Patrimonio", value: "Ciudad Colonial UNESCO" }
    ]
  },
  {
    id: 5,
    name: "Ruta Gastronómica & Cacao Tours del Cibao",
    region: "Experiencia Culinaria",
    tagline: "Sabores Auténticos & Fincas de Cacao Orgánico",
    description: "Un recorrido sensorial por las haciendas cacaoteras más premiadas de Duarte y Sánchez Ramírez con catas guiadas y maridaje de rones premium.",
    image: adGastronomyImg,
    isSponsored: true,
    sponsorBadge: "Patrocinado",
    sponsorBrand: "Cacao & Rum Heritage RD",
    ctaText: "Ver Tours de Sabores",
    ctaLink: "/rutas-sabor",
    stats: [
      { label: "Experiencia", value: "Cata & Degustación" },
      { label: "Ubicación", value: "Cibao Central" },
      { label: "Duración", value: "Pasadía Gourmet" }
    ]
  }
];

export function ProvincesHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % provinceSlidesData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + provinceSlidesData.length) % provinceSlidesData.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const current = provinceSlidesData[currentSlide];

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[520px] md:min-h-[580px] lg:min-h-[620px] flex flex-col justify-between"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
        touchStartX.current = null;
      }}
    >
      {/* Background Image with Smooth Crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={current.image}
            alt={current.name}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
          {/* Multi-layer gradients for optimal contrast and elegance */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Hero Slider Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-10 md:pt-16 pb-8 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Badges / Category */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {current.isSponsored ? (
              <Badge className="bg-amber-500 text-slate-950 font-black border-none text-xs px-3 py-1 uppercase tracking-wider shadow-md">
                <Crown className="h-3.5 w-3.5 mr-1" /> {current.sponsorBadge} • {current.sponsorBrand}
              </Badge>
            ) : (
              <Badge className="bg-primary/25 border-primary/40 text-primary font-semibold text-xs px-3 py-1 backdrop-blur-md">
                <Building2 className="h-3.5 w-3.5 mr-1" /> {current.region}
              </Badge>
            )}
            <Badge variant="outline" className="border-white/20 text-white/80 text-xs backdrop-blur-md">
              Slide {currentSlide + 1} de {provinceSlidesData.length}
            </Badge>
          </div>

          {/* Title */}
          <motion.h1 
            key={`title-${current.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3"
          >
            {current.name}
          </motion.h1>

          {/* Subtitle / Tagline */}
          <motion.p
            key={`tagline-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-primary font-medium text-base sm:text-lg mb-4"
          >
            {current.tagline}
          </motion.p>

          {/* Description */}
          <motion.p 
            key={`desc-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl line-clamp-3 md:line-clamp-none"
          >
            {current.description}
          </motion.p>

          {/* Key Stats Strip */}
          <motion.div 
            key={`stats-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-3 gap-3 max-w-xl mb-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"
          >
            {current.stats.map((stat, i) => (
              <div key={i} className="text-left px-2">
                <p className="text-[10px] sm:text-xs uppercase text-slate-300 font-semibold tracking-wider">{stat.label}</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-xl px-6 font-bold shadow-lg shadow-primary/25">
              <Link to={current.ctaLink}>
                {current.ctaText} <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md font-semibold"
            >
              <Link to="/destinos">
                Ver Mapa Completo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail / Slide Bar Navigation */}
      <div className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-lg py-4">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Thumbnails Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {provinceSlidesData.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all shrink-0 cursor-pointer border ${
                    isActive 
                      ? "bg-primary/20 border-primary text-white shadow-md" 
                      : "bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left max-w-[120px] sm:max-w-[140px]">
                    <p className="text-xs font-bold truncate">{slide.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {slide.isSponsored ? "★ Patrocinado" : slide.region}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Directional Next / Prev Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="h-9 w-9 rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              aria-label="Slide siguiente"
              className="h-9 w-9 rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
