import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/ui/lazy-image";
import { Badge } from "@/components/ui/badge";
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

const interestKeys = [
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const interests = interestKeys.map((i) => ({
    title: t(i.key),
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
    <section className="relative flex flex-col bg-background overflow-hidden py-16">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                Colecciones Temáticas
              </Badge>
              <span className="text-xs text-muted-foreground">Explora por tus pasiones</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {t("interest.title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-amber-400">
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
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollManual("right")}
              className="rounded-full h-10 w-10 border-border/60 bg-card/60 backdrop-blur-md hover:bg-primary/20 hover:border-primary/50 transition-opacity shadow-sm"
              aria-label="Desplazar a la derecha"
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
              {index === 2 && (
                <div
                  key="sponsored-slider-ad-interest"
                  className="flex-shrink-0 w-[220px] sm:w-[270px] md:w-[300px] h-[380px] snap-start"
                >
                  <a 
                    href="https://presidente.com.do" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block h-full group" 
                    aria-label="Publicidad: Cerveza Presidente"
                  >
                    <div className="relative h-full rounded-3xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950 via-slate-900 to-black shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                      <img
                        src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80"
                        alt="Cerveza Presidente Publicidad"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 opacity-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Top Brand Tag */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-slate-950 shadow-sm">
                          🍺 Anuncio Patrocinado
                        </span>
                      </div>

                      {/* Red Centered Indicator Badge */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-auto max-w-[92%] text-center">
                        <div className="bg-red-600 text-white font-mono font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-xl border-2 border-white shadow-2xl shadow-red-950/90 uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                          <span className="whitespace-nowrap">SLIDER 300×380 • ESPACIO DISPONIBLE</span>
                        </div>
                      </div>

                      {/* Bottom Content Area */}
                      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                        <span className="text-[10px] uppercase font-bold text-amber-300">Cervecería Nacional</span>
                        <h3 className="font-display text-lg font-bold text-white mb-1 drop-shadow-md">
                          Cerveza Presidente RD
                        </h3>
                        <p className="text-xs text-slate-200 line-clamp-2 mb-2">
                          La fría vestida de novia que acompaña tus vacaciones en el Caribe.
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <span>Conocer Más</span>
                          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              )}

              <div
                key={`${interest.title}-${index}`}
                className="flex-shrink-0 w-[220px] sm:w-[270px] md:w-[300px] h-[380px] snap-start"
              >
                <Link to={interest.link} className="block h-full group" aria-label={`Explorar ${interest.title}`}>
                  <div className="relative h-full rounded-3xl overflow-hidden border border-border/50 bg-card/50 shadow-lg group-hover:scale-[1.02] transition-transform duration-300 will-change-transform">
                    <LazyImage
                      src={interest.image}
                      alt={interest.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 will-change-transform"
                      containerClassName="absolute inset-0"
                    />
                    {/* Multi-layer gradient with GPU-friendly opacity transition */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top Tag Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-background/80 backdrop-blur-md text-foreground border border-border/50 shadow-sm">
                        <Compass className="h-3 w-3 text-amber-400" aria-hidden="true" />
                        {interest.tag}
                      </span>
                    </div>

                    {/* Bottom Content Area */}
                    <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                      <h3 className="font-display text-xl font-bold text-white mb-2 drop-shadow-md">
                        {interest.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <span>{t("common.viewMore")}</span>
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
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
