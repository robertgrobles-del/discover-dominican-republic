import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useI18n";
import adventureImg from "@/assets/adventure.jpg";
import beachImg from "@/assets/beach-category.jpg";
import historyImg from "@/assets/history.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";
import divingImg from "@/assets/diving.jpg";
import relaxBeachImg from "@/assets/relax-beach.jpg";
import carnivalImg from "@/assets/carnival.jpg";
import raftingImg from "@/assets/rafting.jpg";
import samanaImg from "@/assets/samana.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import { usePageContent } from "@/lib/pageContent";
import { AdSlotTag } from "@/components/promo/AdSlotTag";
import { useTrackedBanner } from "@/hooks/useAdBanners";

const interestKeys = [
  { key: "interest.family", titleOverride: "Planes para toda la familia", tag: "Familiar & Kids", image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80", link: "/familia-con-ninos" },
  { key: "interest.beaches", tag: "Costas & Cayos", image: beachImg, link: "/playas" },
  { key: "interest.adventure", tag: "Adrenalina", image: adventureImg, link: "/actividades" },
  { key: "interest.gastronomy", tag: "Sabor Criollo", image: gastronomyImg, link: "/guia-gastronomica" },
  { key: "interest.heritage", tag: "Historia Colonial", image: colonialDoorImg, link: "/patrimonio" },
  { key: "interest.mountains", tag: "Ecoturismo", image: samanaImg, link: "/montanas" },
  { key: "interest.diving", tag: "Mundo Submarino", image: divingImg, link: "/experiencias?cat=acuaticos" },
  { key: "interest.wellness", tag: "Lujo & Relax", image: relaxBeachImg, link: "/wellness" },
  { key: "interest.culture", tag: "Carnaval & Ritmo", image: carnivalImg, link: "/cultura" },
  { key: "interest.ecotourism", tag: "Naturaleza Viva", image: raftingImg, link: "/ecoturismo" },
  { key: "interest.shopping", tag: "Artesanías", image: laRomanaImg, link: "/compras" },
  { key: "interest.cruises", tag: "Marinas & Puertos", image: whaleSamanaImg, link: "/nautica-cruceros" },
  { key: "interest.sports", tag: "Deporte de Élite", image: puntaCanaImg, link: "/turismo-deportivo" },
];

export function InterestSection() {
  const pc = usePageContent("interest-section");
  // Tarjeta nativa 300×380 del carrusel: banner_type "native-card", placement "native", section "home-intereses".
  const { banner: ad, trackClick: trackAdClick } = useTrackedBanner({ section: "home-intereses", bannerType: "native-card", placement: "native" });
  const interestKeys = pc.data("interestKeys", __pcData.interestKeys);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const interests = interestKeys.map((i) => ({
    title: ("titleOverride" in i && i.titleOverride) ? i.titleOverride : t(i.key),
    tag: i.tag,
    image: i.image,
    link: i.link,
  }));

  const scrollManual = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="relative flex flex-col bg-muted/40 overflow-hidden py-14 lg:py-20">

      <div className="container mx-auto px-4 lg:px-8 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground text-balance">
              {t("interest.title")}{" "}
              <span className="text-primary">
                {t("interest.titleHighlight")}
              </span>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              {t("interest.subtitle")}
            </p>
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollManual("left")}
              className="rounded-full h-10 w-10 border-border/60 bg-card/60 backdrop-blur-md hover:bg-primary/20 hover:border-primary/50 transition-opacity shadow-sm"
              aria-label={pc.t("Button.aria-label.1", "Desplazar a la izquierda")}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollManual("right")}
              className="rounded-full h-10 w-10 border-border/60 bg-card/60 backdrop-blur-md hover:bg-primary/20 hover:border-primary/50 transition-opacity shadow-sm"
              aria-label={pc.t("Button.aria-label.2", "Desplazar a la derecha")}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Track with GPU composited transitions */}
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar px-4 lg:px-8 py-4 scroll-smooth snap-x snap-mandatory will-change-scroll [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {interests.map((interest, index) => (
            <div key={`interest-wrapper-${interest.link || index}`} className="flex gap-5">
              {/* Insert Sponsored Slider Banner Ad at index 2 */}
              {index === 2 && ad && (
                <div
                  key="sponsored-slider-ad-interest"
                  className="flex-shrink-0 w-[220px] sm:w-[270px] md:w-[300px] h-[380px] snap-start"
                >
                  <a 
                    href={ad?.target_url || "https://presidente.com.do"}
                    onClick={trackAdClick}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block h-full group" 
                    aria-label={ad ? `Publicidad: ${ad.sponsor || ad.name}` : pc.t("a.aria-label.1", "Publicidad: Cerveza Presidente")}
                  >
                    <div className="relative h-full rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950 via-slate-900 to-black shadow-sm">
                      <img
                        src={ad?.image_url || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80"}
                        alt={ad?.alt_text || pc.t("img.alt.1", "Cerveza Presidente Publicidad")}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 opacity-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Top Brand Tag */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-slate-950 shadow-sm">{pc.tx("span.1", "🍺 Anuncio Patrocinado")}</span>
                      </div>

                      {/* Red Centered Indicator Badge */}
                      <AdSlotTag size="300×380" className="left-4 top-12" />

                      {/* Bottom Content Area */}
                      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                        <span className="text-3xs uppercase font-bold text-amber-300">{ad ? ad.sponsor : pc.tx("span.3", "Cervecería Nacional")}</span>
                        <h3 className="font-display text-lg font-bold text-white mb-1 drop-shadow-md">{ad?.headline || ad?.name || pc.tx("h3.1", "Cerveza Presidente RD")}</h3>
                        <p className="text-xs text-slate-200 line-clamp-2 mb-2">{ad ? ad.subtext : pc.tx("p.1", "La fría vestida de novia que acompaña tus vacaciones en el Caribe.")}</p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <span>{ad?.cta_text || pc.tx("span.4", "Conocer Más")}</span>
                          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              )}

              <div
                key={`${interest.title}-${index}`}
                className="flex-shrink-0 w-[220px] sm:w-[260px] md:w-[280px] snap-start"
              >
                <Link to={interest.link} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                    <LazyImage
                      src={interest.image}
                      alt={interest.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      containerClassName="absolute inset-0"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">{interest.tag}</p>
                  <h3 className="mt-0.5 flex items-center gap-1 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {interest.title}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </h3>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Side blur fades */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { interestKeys };
