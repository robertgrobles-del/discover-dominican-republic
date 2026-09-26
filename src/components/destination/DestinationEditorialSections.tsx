import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Hotel, Utensils, Wine, Star, MapPin, 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hotel as HotelType } from "@/data/hotels";
import { Restaurant } from "@/data/restaurants";
import { Bar } from "@/data/bars";
import { Experience } from "@/data/experiences";

interface DestinationEditorialSectionsProps {
  destinoNombre: string;
  hotels: HotelType[];
  restaurants: Restaurant[];
  bars: Bar[];
  experiences: Experience[];
}

export function DestinationEditorialSections({
  destinoNombre,
  hotels,
  restaurants,
  bars,
}: DestinationEditorialSectionsProps) {
  const hotelsCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!hotelsCarouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = hotelsCarouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate approx active slide index
    const cardWidth = 400; // Average card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  useEffect(() => {
    checkScroll();
    const ref = hotelsCarouselRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        ref.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [hotels]);

  const scrollHotels = (direction: "left" | "right") => {
    if (!hotelsCarouselRef.current) return;
    const scrollAmount = hotelsCarouselRef.current.clientWidth * 0.85;
    hotelsCarouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-24 py-12">

      {/* ========================================================= */}
      {/* 1. SECCIÓN HOTELES & RESORTS: CARRUSEL INTERACTIVO "Luxury Hospitality Magazine" */}
      {/* ========================================================= */}
      <section id="resorts-section" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <Hotel className="h-4 w-4" /> Alojamientos Icónicos &amp; Todo Incluido
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Hoteles &amp; Resorts Recomendados en {destinoNombre}
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Desliza para explorar las estancias más exclusivas con playas privadas, suites con vista al mar y gastronomía gourmet todo incluido.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            {/* Carousel Navigation Buttons */}
            {hotels.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollHotels("left")}
                  disabled={!canScrollLeft}
                  className="rounded-full h-10 w-10 border-border bg-card/80 hover:bg-card hover:border-primary disabled:opacity-40 transition-all shadow-sm"
                  aria-label="Hotel anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollHotels("right")}
                  disabled={!canScrollRight}
                  className="rounded-full h-10 w-10 border-border bg-card/80 hover:bg-card hover:border-primary disabled:opacity-40 transition-all shadow-sm"
                  aria-label="Siguiente hotel"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            <Link
              to="/alojamientos"
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 group ml-2"
            >
              Ver todos ({hotels.length})
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {hotels.length > 0 ? (
          <div className="relative group/carousel">
            {/* Interactive Scrollable Carousel Container */}
            <div
              ref={hotelsCarouselRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40"
              style={{ scrollbarWidth: "thin" }}
            >
              {hotels.map((hotel, index) => {
                const isFirstFeatured = index === 0;
                return (
                  <article
                    key={hotel.id}
                    className={`w-[85vw] sm:w-[380px] lg:w-[410px] shrink-0 snap-start bg-card rounded-3xl overflow-hidden border shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5 ${
                      isFirstFeatured ? "border-primary ring-2 ring-primary/20" : "border-border/80 hover:border-primary/40"
                    }`}
                  >
                    <div>
                      {/* Image Header with Badge & Star Rating */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        
                        {/* Featured Highlight Badge */}
                        {isFirstFeatured && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-amber-500 text-black font-black text-[11px] uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-300">
                              ★ Hotel Destacado
                            </span>
                          </div>
                        )}

                        {/* Floating Rating */}
                        <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-foreground shadow-sm flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {hotel.rating} <span className="text-muted-foreground font-normal">({hotel.reviewCount})</span>
                        </span>

                        {/* Category Badge */}
                        <span className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-[11px] font-extrabold uppercase px-3 py-1 rounded-lg tracking-wider shadow-md">
                          {hotel.category || "All-Inclusive"}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-6">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{hotel.location || hotel.province}</span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                          {hotel.name}
                        </h3>

                        <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed line-clamp-2">
                          {hotel.shortDescription}
                        </p>

                        {/* Amenities Pills */}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-muted/80 text-foreground font-medium px-2.5 py-1 rounded-md border border-border/50"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer with Price and Details Button */}
                    <div className="p-6 pt-0">
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground block font-bold tracking-wider">
                            {hotel.stars} Estrellas
                          </span>
                          <span className="text-base font-black text-foreground">
                            {hotel.priceRange || "$$$$"}
                          </span>
                        </div>
                        <Button size="sm" asChild className="rounded-xl font-bold px-4">
                          <Link to={`/alojamiento/${hotel.slug}`}>
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Carousel progress dots / indicators on mobile/desktop */}
            {hotels.length > 3 && (
              <div className="flex justify-center items-center gap-1.5 pt-4">
                {Array.from({ length: Math.min(hotels.length, 6) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (hotelsCarouselRef.current) {
                        hotelsCarouselRef.current.scrollTo({
                          left: i * 380,
                          behavior: "smooth",
                        });
                      }
                    }}
                    aria-label={`Ir al hotel ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === i ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">
            Explora la oferta hotelera general de la República Dominicana en nuestra guía de alojamientos.
          </p>
        )}
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN RESTAURANTES: Diseño "Bistró & Culinary Cards" */}
      {/* ========================================================= */}
      <section id="restaurantes-section" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">
              <Utensils className="h-4 w-4 text-amber-500" /> Experiencias Culinarias &amp; Bistrós
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Dónde Comer en {destinoNombre}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Desde mariscos frescos a orillas del mar hasta alta cocina fusión y especialidades dominicanas de autor.
            </p>
          </div>
          <Link
            to="/restaurantes"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 group self-start md:self-auto shrink-0"
          >
            Ver todos los restaurantes ({restaurants.length})
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {restaurants.slice(0, 6).map((rest, index) => {
              const isFirstFeatured = index === 0;
              return (
                <article
                  key={rest.id}
                  className={`bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between ${
                    isFirstFeatured ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border hover:border-amber-500/40"
                  }`}
                >
                  <div>
                    {/* Image with warm culinary gradient */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={rest.imageUrl}
                        alt={rest.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        {isFirstFeatured ? (
                          <span className="bg-amber-500 text-black font-black text-[10px] uppercase px-2.5 py-1 rounded-md shadow-md border border-amber-300">
                            ★ Gastronomía Destacada
                          </span>
                        ) : (
                          <span className="bg-amber-500/90 backdrop-blur-md text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md">
                            {rest.category || "Gastronomía"}
                          </span>
                        )}
                      </div>

                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1 border border-white/20">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {rest.rating}
                      </span>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1 text-[11px] text-white/80">
                          <MapPin className="h-3 w-3 text-amber-400" />
                          <span className="truncate">{rest.location || rest.province}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {rest.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {rest.shortDescription}
                      </p>

                      {/* Cuisine pills */}
                      {rest.cuisineType && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {rest.cuisineType.slice(0, 3).map((type, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Signature dishes preview */}
                      {rest.signatureDishes && rest.signatureDishes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/60">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">
                            Plato Sugerido:
                          </span>
                          <p className="text-xs font-semibold text-foreground truncate">
                            🍽️ {rest.signatureDishes[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">
                        {rest.priceRange || "$$ - $$$"}
                      </span>
                      <Button size="sm" variant="outline" asChild className="rounded-xl font-bold border-amber-500/30 text-foreground hover:bg-amber-500/10 hover:text-amber-600">
                        <Link to={`/restaurante/${rest.slug}`}>
                          Ficha &amp; Menú
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">
            Descubre nuestra guía gastronómica completa con chefs y restaurantes galardonados.
          </p>
        )}
      </section>

      {/* ========================================================= */}
      {/* 3. SECCIÓN VIDA NOCTURNA & BARES: Diseño "Nightlife Chic" (4 columnas compactas) */}
      {/* ========================================================= */}
      {bars.length > 0 && (
        <section id="vida-nocturna-section" className="scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
                <Wine className="h-4 w-4 text-purple-400" /> Beach Clubs, Rooftops &amp; Coctelería
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Vida Nocturna &amp; Bares en {destinoNombre}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Discotecas de talla mundial, shows acrobáticos, beach clubs al atardecer y coctelería de autor.
              </p>
            </div>
            <Link
              to="/vida-nocturna"
              className="text-sm font-semibold text-purple-400 hover:underline flex items-center gap-1 group self-start md:self-auto shrink-0"
            >
              Ver todos los bares ({bars.length})
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4 COLUMNS COMPACT GRID WITH DISTINCT NIGHTLIFE DESIGN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bars.slice(0, 8).map((bar, index) => {
              const isFirstFeatured = index === 0;
              return (
                <article
                  key={bar.id}
                  className={`group relative bg-card/90 rounded-2xl overflow-hidden border shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 ${
                    isFirstFeatured ? "border-purple-500 ring-2 ring-purple-500/30" : "border-border/80 hover:border-purple-500/60"
                  }`}
                >
                  <div>
                    {/* Compact Nightlife Image with Mood Lighting */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={bar.imageUrl}
                        alt={bar.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-0.5 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        {isFirstFeatured ? (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md border border-purple-400">
                            ★ Club Destacado
                          </span>
                        ) : (
                          <span className="bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                            {bar.barType === 'nightclub' ? 'Discoteca' : bar.barType === 'beach-bar' ? 'Beach Club' : 'Rooftop Bar'}
                          </span>
                        )}
                      </div>

                      <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1 border border-white/20">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {bar.rating}
                      </span>

                      {/* Bottom Title on Image */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <span className="text-[10px] text-purple-300 font-semibold block uppercase tracking-wider truncate">
                          {bar.location || bar.province}
                        </span>
                        <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors truncate">
                          {bar.name}
                        </h3>
                      </div>
                    </div>

                    {/* Compact Body Content */}
                    <div className="p-3.5 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {bar.shortDescription}
                      </p>

                      {/* Music / Vibe Tags */}
                      {bar.musicStyle && bar.musicStyle.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {bar.musicStyle.slice(0, 2).map((style, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-md border border-purple-500/20 truncate"
                            >
                              🎵 {style}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-3.5 pt-0">
                    <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {bar.priceRange || "$$$"}
                      </span>
                      <Button size="sm" variant="secondary" asChild className="h-7 text-xs rounded-lg font-bold px-2.5 bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white dark:text-purple-300">
                        <Link to={`/bar/${bar.slug}`}>
                          Ver Club
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
