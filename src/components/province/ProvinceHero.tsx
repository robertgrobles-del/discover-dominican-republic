import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, MapPin, Users, Ruler, Sparkles, 
  ExternalLink, Compass, Bed, Utensils, Award, ArrowRight, ShieldCheck, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";

export interface ProvinceSlide {
  id: string | number;
  image: string;
  tag: string;
  tagVariant?: "default" | "secondary" | "outline" | "sponsored";
  title: string;
  subtitle?: string;
  description: string;
  isSponsored?: boolean;
  sponsorName?: string;
  ctaText?: string;
  ctaLink?: string;
  highlights?: string[];
  stats?: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
}

interface ProvinceHeroProps {
  name: string;
  region: string;
  capital?: string;
  population?: number;
  areaKm2?: number;
  description: string;
  images: string[];
  highlights?: string[];
  slides?: ProvinceSlide[];
  provinceSlug?: string;
  destinations?: { name: string; shortDescription?: string; imageUrl?: string; slug?: string }[];
  hotels?: { name: string; priceRange?: string; rating?: number; imageUrl?: string; slug?: string }[];
}

export function ProvinceHero({
  name,
  region,
  capital,
  population,
  areaKm2,
  description,
  images,
  highlights,
  slides: customSlides,
  provinceSlug,
  destinations = [],
  hotels = [],
}: ProvinceHeroProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const regionLabels: Record<string, string> = {
    norte: t("provinceHero.regionNorth") || "Región Norte",
    sur: t("provinceHero.regionSouth") || "Región Sur",
    este: t("provinceHero.regionEast") || "Región Este",
    "santo-domingo": t("provinceHero.regionSD") || "Santo Domingo",
  };

  // Build rich slides dynamically if custom slides are not passed
  const activeSlides: ProvinceSlide[] = useMemo(() => {
    if (customSlides && customSlides.length > 0) {
      return customSlides;
    }

    const generated: ProvinceSlide[] = [];
    const imageList = images && images.length > 0 ? images : ["/placeholder.svg"];

    // 1. Slide Principal: Presentación de la Provincia
    generated.push({
      id: "slide-main",
      image: imageList[0],
      tag: regionLabels[region] || region || "República Dominicana",
      tagVariant: "default",
      title: name,
      subtitle: "Descubre el encanto, la historia y la naturaleza",
      description: description,
      ctaText: "Explorar Provincia",
      ctaLink: "#destinos",
      stats: [
        ...(capital ? [{ label: t("provinceHero.capital") || "Capital", value: capital, icon: MapPin }] : []),
        ...(population ? [{ label: t("provinceHero.population") || "Población", value: population.toLocaleString(), icon: Users }] : []),
        ...(areaKm2 ? [{ label: t("provinceHero.area") || "Superficie", value: `${areaKm2.toLocaleString()} km²`, icon: Ruler }] : []),
      ],
      highlights: highlights?.slice(0, 4),
    });

    // 2. Slide de Atractivos / Destinos Destacados de la Provincia
    if (destinations.length > 0 || imageList.length > 1) {
      const topDest = destinations[0];
      generated.push({
        id: "slide-destinations",
        image: topDest?.imageUrl || imageList[1 % imageList.length],
        tag: "Destino & Atractivos",
        tagVariant: "secondary",
        title: topDest ? topDest.name : `Atractivos de ${name}`,
        subtitle: "Rincones icónicos, playas y paisajes impresionantes",
        description: topDest?.shortDescription || `Conoce los puntos turísticos más emblemáticos y las mejores rutas para recorrer en ${name}.`,
        ctaText: topDest?.slug ? `Ver ${topDest.name}` : "Ver Atractivos",
        ctaLink: topDest?.slug ? `/destino/${topDest.slug}` : "#destinos",
        stats: [
          { label: "Experiencias", value: `${Math.max(destinations.length, 5)}+ Lugares`, icon: Compass },
          { label: "Naturaleza", value: "100% Caribe", icon: Sparkles }
        ],
        highlights: highlights?.slice(2, 6),
      });
    }

    // 3. Slide de Experiencias / Gastronomía & Cultura
    if (imageList.length > 2) {
      generated.push({
        id: "slide-experiences",
        image: imageList[2 % imageList.length],
        tag: "Cultura & Aventura",
        tagVariant: "secondary",
        title: `Vive la Experiencia en ${name}`,
        subtitle: "Gastronomía autóctona, tradiciones y ecoturismo",
        description: `Sumérgete en la cultura local de ${name}: disfruta de platos tradicionales, senderos naturales y la calidez de su gente.`,
        ctaText: "Ver Gastronomía & Tours",
        ctaLink: "#restaurantes",
        stats: [
          { label: "Gastronomía", value: "Sabores de RD", icon: Utensils },
          { label: "Certificación", value: "Guías Locales", icon: Award }
        ]
      });
    }

    // 4. Slide Publicitario / Patrocinio Turístico de la Provincia (Ad Slider)
    const featuredHotel = hotels[0];
    generated.push({
      id: "slide-sponsor-ad",
      image: featuredHotel?.imageUrl || imageList[3 % imageList.length] || imageList[0],
      tag: "Espacio Patrocinado",
      tagVariant: "sponsored",
      isSponsored: true,
      sponsorName: featuredHotel?.name || `Promoción Turística de ${name}`,
      title: featuredHotel ? featuredHotel.name : `Hospédate en ${name}`,
      subtitle: featuredHotel ? `Reserva tu estadía con tarifas exclusivas (${featuredHotel.priceRange || "$$"})` : "Hoteles boutique, villas y resorts certificados",
      description: `Planifica tu estadía perfecta en ${name}. Conexión directa con los alojamientos más valorados y operadores turísticos certificados.`,
      ctaText: featuredHotel?.slug ? "Ver Alojamiento & Tarifas" : "Explorar Hoteles en RD",
      ctaLink: featuredHotel?.slug ? `/alojamiento/${featuredHotel.slug}` : "/alojamientos",
      stats: [
        { label: "Calificación", value: featuredHotel?.rating ? `${featuredHotel.rating} / 5.0` : "4.9 ★", icon: Award },
        { label: "Garantía", value: "Reserva Oficial", icon: ShieldCheck }
      ]
    });

    return generated;
  }, [customSlides, images, name, region, capital, population, areaKm2, description, highlights, destinations, hotels, regionLabels, t]);

  const slideCount = activeSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [slideCount, isPaused, nextSlide]);

  const current = activeSlides[currentSlide] || activeSlides[0];

  return (
    <section 
      className="relative h-[85vh] min-h-[620px] max-h-[820px] w-full overflow-hidden bg-slate-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label={`Presentación de ${name}`}
    >
      {/* Background Slideshow Image with smooth Ken Burns Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || currentSlide}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={current.image || "/placeholder.svg"}
            alt={current.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Rich Dark Vignette & Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Progress Bar (Top) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex h-1 bg-white/10">
        {activeSlides.map((_, idx) => (
          <div key={idx} className="flex-1 overflow-hidden h-full">
            {idx === currentSlide ? (
              <motion.div
                key={`${idx}-${isPaused}`}
                initial={{ width: "0%" }}
                animate={{ width: isPaused ? "100%" : "100%" }}
                transition={{ duration: isPaused ? 0 : 7, ease: "linear" }}
                className="h-full bg-primary"
              />
            ) : (
              <div className={`h-full ${idx < currentSlide ? "bg-white/40" : "bg-transparent"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Main Slide Content Area */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl pt-8 pb-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || currentSlide}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Badge & Sponsor Pill */}
              <div className="flex flex-wrap items-center gap-2.5">
                {current.isSponsored ? (
                  <SponsoredBadge label={current.tag || "Publicidad patrocinada"} sponsor={current.sponsorName} className="gap-1.5 px-3 py-1 font-semibold backdrop-blur-md" />
                ) : (
                  <Badge className="bg-primary/25 text-primary-foreground border-primary/40 gap-1.5 px-3 py-1 font-semibold backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {current.tag}
                  </Badge>
                )}

              </div>

              {/* Dynamic Slide Title */}
              <div className="space-y-1">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
                  {current.title}
                </h1>
                {current.subtitle && (
                  <p className="text-base sm:text-lg md:text-xl font-medium text-amber-400 drop-shadow-sm">
                    {current.subtitle}
                  </p>
                )}
              </div>

              {/* Dynamic Slide Description */}
              <p className="text-sm sm:text-base md:text-lg text-slate-200/90 leading-relaxed max-w-2xl line-clamp-3 drop-shadow-sm">
                {current.description}
              </p>

              {/* Quick Stats Grid */}
              {current.stats && current.stats.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {current.stats.map((st, i) => {
                    const IconComp = st.icon || MapPin;
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-2.5 bg-slate-950/70 border border-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xs"
                      >
                        <IconComp className="h-4 w-4 text-primary shrink-0" />
                        <div className="leading-tight">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                            {st.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {st.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Highlights tags */}
              {current.highlights && current.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {current.highlights.map((hl, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-white/10 hover:bg-white/20 text-slate-200 border-white/15 backdrop-blur-sm text-xs py-1"
                    >
                      {hl}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Dynamic Call To Action Button */}
              {current.ctaText && (
                <div className="pt-2">
                  {current.ctaLink?.startsWith("#") ? (
                    <Button 
                      asChild 
                      size="lg" 
                      className="rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all gap-2"
                    >
                      <a href={current.ctaLink}>
                        <span>{current.ctaText}</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      size="lg" 
                      className="rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all gap-2"
                    >
                      <Link to={current.ctaLink || "#"}>
                        <span>{current.ctaText}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      {slideCount > 1 && (
        <>
          {/* Previous Slide Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md shadow-xl transition-transform hover:scale-110"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Next Slide Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Siguiente slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md shadow-xl transition-transform hover:scale-110"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Slide Indicator Pills / Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-xl">
            {activeSlides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Ir al slide ${index + 1}: ${slide.title}`}
                className={`transition-all duration-300 rounded-full flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold ${
                  index === currentSlide
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : slide.isSponsored ? "bg-amber-400" : "bg-white/50"}`} />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {slide.isSponsored ? "⭐ Promo" : slide.title}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
