import { useState, useEffect, useCallback } from "react";
import { HOME_SECTION_FRAME, SectionWithSideAds } from "@/components/SectionWithSideAds";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslation } from "@/hooks/useI18n";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import bayahibeImg from "@/assets/bayahibe.jpg";
import jarabacoaImg from "@/assets/jarabacoa.jpg";
import lasTerrenasImg from "@/assets/las-terrenas.jpg";
import hardRockImg from "@/assets/hard-rock-punta-cana.jpg";
import { AdSlotTag } from "@/components/promo/AdSlotTag";
import { useTrackedBanner } from "@/hooks/useAdBanners";

const staticDestinations = [
  { id: "punta-cana", name: "Punta Cana", description: "Playas de arena blanca y aguas cristalinas con resorts de clase mundial.", image: puntaCanaImg },
  { id: "santo-domingo", name: "Santo Domingo", description: "La ciudad colonial más antigua de América, rica en historia y cultura.", image: santoDomingoImg },
  { id: "samana", name: "Samaná", description: "Naturaleza virgen, ballenas jorobadas y cascadas impresionantes.", image: samanaImg },
  { id: "las-terrenas", name: "Las Terrenas", description: "Playa Bonita, Cosón y Punta Popy: Caribe con aire bohemio europeo.", image: lasTerrenasImg },
  { id: "puerto-plata", name: "Puerto Plata", description: "La Costa del Ámbar con teleférico, playas doradas y 27 Charcos.", image: puertoPlataImg },
  { id: "la-romana", name: "La Romana", description: "Casa de Campo, Altos de Chavón y playas exclusivas del sureste.", image: laRomanaImg },
  { id: "jarabacoa", name: "Jarabacoa", description: "La ciudad de la eterna primavera, rafting, montañas y aventura.", image: jarabacoaImg },
  { id: "bayahibe", name: "Bayahíbe", description: "Pueblo pesquero con las mejores playas e islas vírgenes del Caribe.", image: bayahibeImg },
];

const localImageMap: Record<string, string> = {
  "punta-cana": puntaCanaImg,
  "santo-domingo": santoDomingoImg,
  "samana": samanaImg,
  "puerto-plata": puertoPlataImg,
  "la-romana": laRomanaImg,
  "jarabacoa": jarabacoaImg,
  "bayahibe": bayahibeImg,
  "las-terrenas": lasTerrenasImg,
};

const destinationTags: Record<string, string> = {
  "punta-cana": "Costas del Este",
  "santo-domingo": "Patrimonio UNESCO",
  "samana": "Santuario Natural",
  "las-terrenas": "Península & Playas",
  "puerto-plata": "Costa del Ámbar",
  "la-romana": "Caribe & Golf",
  "jarabacoa": "Montañas & Aventura",
  "bayahibe": "Arrecifes & Aguas Cristalinas",
};

interface DisplayDestination {
  id: string;
  name: string;
  description: string;
  image: string;
}

export function DestinationsSection() {
  const { t } = useTranslation();
  // Tarjeta nativa 350×460 dentro del carrusel: banner_type "native-card", placement "native", section "home-destinos".
  const { banner: ad, trackClick: trackAdClick } = useTrackedBanner({ section: "home-destinos", bannerType: "native-card", placement: "native" });
  const [localDestinations, setDestinations] = useState<DisplayDestination[]>(staticDestinations);
  // Las provincias del panel no salen aquí: esta sección es de destinos, no de provincias.
  const destinations = localDestinations;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    async function fetchDestinations() {
      const { data } = await supabase
        .from("destinations")
        .select("id, name, slug, short_description, image_url")
        .limit(15);

      if (data && data.length > 0) {
        const staticSlugs = new Set(staticDestinations.map(d => d.id));
        const dbExtras: DisplayDestination[] = data
          .filter(d => !staticSlugs.has(d.slug || ""))
          .map(d => ({
            id: d.slug || d.id,
            name: d.name,
            description: d.short_description || "",
            image: localImageMap[d.slug || ""] || d.image_url || puntaCanaImg,
          }));

        // Update static entries with DB data (e.g. descriptions)
        const merged = staticDestinations.map(sd => {
          const dbMatch = data.find(d => d.slug === sd.id);
          return dbMatch ? { ...sd, description: dbMatch.short_description || sd.description } : sd;
        });

        setDestinations([...merged, ...dbExtras]);
      }
    }
    fetchDestinations();
  }, []);

  return (
    <section className="bg-background py-20 lg:py-24">
      <div className={HOME_SECTION_FRAME}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-primary" />
              {t("destinations.popular")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("destinations.immerse")}{" "}
              <span className="text-gradient">{t("destinations.paradise")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm md:text-base leading-relaxed">
              {t("destinations.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex lg:hidden items-center gap-2">
              <Button variant="outline" size="icon" onClick={scrollPrev} disabled={!canScrollPrev} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={scrollNext} disabled={!canScrollNext} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Link to="/destinos">
              <Button variant="outline" className="rounded-xl border-border/80 hover:bg-secondary gap-2 font-semibold">
                {t("destinations.viewAll")}
                <ChevronRight className="h-4 w-4 text-primary" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <SectionWithSideAds section="home-destinos">
          {/* Desktop Bento Grid */}
          <div className="hidden lg:grid grid-cols-12 gap-5 mb-8">
            {/* Bento Card 1 - Hero Destination (7 cols) */}
            {destinations[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-7 h-[460px] group relative rounded-3xl overflow-hidden border border-border/50 bg-card/40 shadow-xl"
              >
                <Link to={`/destino/${destinations[0].id}`} className="block h-full">
                  <LazyImage
                    src={localImageMap[destinations[0].id] || destinations[0].image}
                    alt={destinations[0].name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    containerClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white border border-white/15 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {destinationTags[destinations[0].id] || "Polo Turístico"}
                    </span>
                  </div>

                  <FavoriteButton
                    id={destinations[0].id}
                    type="destino"
                    name={destinations[0].name}
                    image={localImageMap[destinations[0].id] || destinations[0].image}
                    className="absolute top-5 right-5 z-10"
                  />

                  {/* Bottom Content Area */}
                  <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                    <span className="text-xs uppercase tracking-widest font-semibold text-primary/90 mb-1 block">
                      Destino Emblemático
                    </span>
                    <h3 className="font-display text-3xl lg:text-4xl font-extrabold text-white mb-2 group-hover:text-primary transition-colors">
                      {destinations[0].name}
                    </h3>
                    <p className="text-sm text-white/85 max-w-lg line-clamp-2 mb-4 leading-relaxed">
                      {destinations[0].description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <span>{t("destinations.explore")}</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Bento Card 2 - Secondary Destination OR Sponsored Resort Ad (5 cols) */}
            {ad ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="col-span-5 h-[460px] group relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-xl bg-slate-950"
              >
                <Link to={ad.target_url || "/alojamientos"} onClick={trackAdClick} className="block h-full">
                  <img
                    src={ad.image_url || hardRockImg}
                    alt={ad.alt_text || ad.name || "Alojamiento patrocinado"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  
                  <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                    <SponsoredBadge label={ad.sponsor || "Hotel patrocinado"} className="text-xs uppercase tracking-wider shadow-sm" />
                  </div>
                  <AdSlotTag size="350×460" className="left-5 top-14" />

                  <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                    <span className="text-xs uppercase tracking-widest font-bold text-amber-400 mb-1 block">
                      {ad.sponsor || "Punta Cana • 5 Estrellas"}
                    </span>
                    <h3 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {ad.headline || ad.name}
                    </h3>
                    <p className="text-sm text-slate-200 line-clamp-2 mb-4 leading-relaxed">
                      {ad.subtext || "Todo Incluido de Lujo con piscinas infinitas, gastronomía gourmet y acceso a playas de arena blanca."}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-amber-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      <span>{ad.cta_text || "Ver Ofertas & Reserva"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ) : destinations[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="col-span-5 h-[460px] group relative rounded-3xl overflow-hidden border border-border/50 bg-card/40 shadow-xl"
              >
                <Link to={`/destino/${destinations[1].id}`} className="block h-full">
                  <LazyImage
                    src={localImageMap[destinations[1].id] || destinations[1].image}
                    alt={destinations[1].name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    containerClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  
                  <div className="absolute top-5 left-5 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white border border-white/15 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {destinationTags[destinations[1].id] || "Polo Turístico"}
                    </span>
                  </div>

                  <FavoriteButton
                    id={destinations[1].id}
                    type="destino"
                    name={destinations[1].name}
                    image={localImageMap[destinations[1].id] || destinations[1].image}
                    className="absolute top-5 right-5 z-10"
                  />

                  <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                    <span className="text-xs uppercase tracking-widest font-semibold text-primary/90 mb-1 block">
                      Historia & Cultura
                    </span>
                    <h3 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {destinations[1].name}
                    </h3>
                    <p className="text-sm text-white/85 line-clamp-2 mb-4 leading-relaxed">
                      {destinations[1].description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <span>{t("destinations.explore")}</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Bento Row 2 (3 columns x 4 cols) */}
            {(ad ? destinations.slice(1, 4) : destinations.slice(2, 5)).map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="col-span-4 h-[360px] group relative rounded-3xl overflow-hidden border border-border/50 bg-card/40 shadow-xl"
              >
                <Link to={`/destino/${dest.id}`} className="block h-full">
                  <LazyImage
                    src={localImageMap[dest.id] || dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    containerClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white border border-white/15 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {destinationTags[dest.id] || "Destino RD"}
                    </span>
                  </div>

                  <FavoriteButton
                    id={dest.id}
                    type="destino"
                    name={dest.name}
                    image={localImageMap[dest.id] || dest.image}
                    className="absolute top-4 right-4 z-10"
                  />

                  <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                    <h3 className="font-display text-xl font-bold text-white mb-1.5 group-hover:text-primary transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 mb-3 leading-relaxed">
                      {dest.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                      <span>{t("destinations.explore")}</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile & Tablet Carousel */}
          <div className="lg:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {destinations.map((destination, index) => (
                <div key={destination.id} className="flex gap-4">
                  {/* Insert Sponsored Resort Carousel Banner at index 1 */}
                  {index === 1 && ad && (
                    <motion.div
                      key="sponsored-destination-resort-ad-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex-shrink-0 w-[280px] sm:w-[320px]"
                    >
                      <div className="group relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-xl bg-slate-950">
                        <Link to={ad?.target_url || "/alojamientos"} onClick={trackAdClick} className="block h-full">
                          <img
                            src={ad?.image_url || hardRockImg}
                            alt={ad?.alt_text || ad?.name || "Hard Rock Hotel Punta Cana Publicidad"}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          
                          <div className="absolute top-4 left-4 z-10">
                            <SponsoredBadge label={ad?.sponsor || "Hotel patrocinado"} className="text-xs uppercase tracking-wider shadow-sm" />
                          </div>
                          <AdSlotTag size="350×460" className="left-4 top-12" />

                          <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                            <span className="text-xs uppercase font-bold text-amber-300">{ad ? ad.sponsor : "Punta Cana • 5 Estrellas"}</span>
                            <h3 className="font-display text-2xl font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                              {ad?.headline || ad?.name || "Hard Rock Hotel & Casino"}
                            </h3>
                            <p className="text-sm text-slate-200 line-clamp-2 mb-4">
                              {ad?.subtext ?? "Todo Incluido de Lujo con 13 piscinas, campo de golf Nicklaus y acceso exclusivo al casino."}
                            </p>
                            <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold group-hover:gap-2 transition-all">
                              <span>{ad?.cta_text || "Ver Ofertas & Reserva"}</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.1, 0.5) }}
                    className="flex-shrink-0 w-[280px] sm:w-[320px]"
                  >
                    <div className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-border/50 bg-card/40 shadow-lg">
                      <Link to={`/destino/${destination.id}`} className="block h-full">
                        <LazyImage
                          src={localImageMap[destination.id] || destination.image}
                          alt={destination.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          containerClassName="absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                        
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white border border-white/15 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {destinationTags[destination.id] || "Polo Turístico"}
                          </span>
                        </div>

                        <FavoriteButton
                          id={destination.id}
                          type="destino"
                          name={destination.name}
                          image={localImageMap[destination.id] || destination.image}
                          className="absolute top-4 right-4 z-10"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                          <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                            {destination.name}
                          </h3>
                          <p className="text-sm text-white/85 line-clamp-2 mb-4">
                            {destination.description}
                          </p>
                          <div className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                            <span>{t("destinations.explore")}</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </SectionWithSideAds>
      </div>
    </section>
  );
}
