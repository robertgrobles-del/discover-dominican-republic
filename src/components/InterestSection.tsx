import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/ui/lazy-image";
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
  { key: "interest.adventure", image: adventureImg, link: "/actividades" },
  { key: "interest.beaches", image: beachImg, link: "/playas" },
  { key: "interest.mountains", image: samanaImg, link: "/montanas" },
  { key: "interest.heritage", image: colonialDoorImg, link: "/patrimonio" },
  { key: "interest.gastronomy", image: gastronomyImg, link: "/guia-gastronomica" },
  { key: "interest.shopping", image: laRomanaImg, link: "/compras" },
  { key: "interest.diving", image: divingImg, link: "/experiencias?cat=acuaticos" },
  { key: "interest.wellness", image: relaxBeachImg, link: "/wellness" },
  { key: "interest.culture", image: carnivalImg, link: "/cultura" },
  { key: "interest.ecotourism", image: raftingImg, link: "/ecoturismo" },
  { key: "interest.religious", image: colonialDoorImg, link: "/turismo-religioso" },
  { key: "interest.cruises", image: whaleSamanaImg, link: "/nautica-cruceros" },
  { key: "interest.sports", image: puntaCanaImg, link: "/turismo-deportivo" },
];

export function InterestSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const { t } = useTranslation();

  const interests = interestKeys.map(i => ({ title: t(i.key), image: i.image, link: i.link }));
  // Use only 2x instead of 3x to reduce DOM nodes (39 → 26)
  const tripleInterests = [...interests, ...interests];

  const resetToCenter = useCallback(() => {
    if (scrollRef.current && !isScrollingRef.current) {
      const container = scrollRef.current;
      const singleSetWidth = container.scrollWidth / 2;
      if (container.scrollLeft < singleSetWidth * 0.2) {
        container.scrollLeft += singleSetWidth;
      } else if (container.scrollLeft > singleSetWidth * 1.5) {
        container.scrollLeft -= singleSetWidth;
      }
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    // Cache the single-set width once after layout
    let singleSetWidth = 0;
    requestAnimationFrame(() => {
      singleSetWidth = container.scrollWidth / 2;
      container.scrollLeft = singleSetWidth;
    });
    let animationId: number;
    let lastTime = 0;
    const speed = 0.5;
    const animate = (currentTime: number) => {
      if (!isScrollingRef.current && singleSetWidth > 0) {
        if (lastTime) {
          const delta = currentTime - lastTime;
          // Batch: read scrollLeft, compute, then write once
          const currentScroll = container.scrollLeft;
          const newScroll = currentScroll + speed * (delta / 16);
          container.scrollLeft = newScroll;
          // Inline reset check to avoid extra read
          if (newScroll < singleSetWidth * 0.2) {
            container.scrollLeft = newScroll + singleSetWidth;
          } else if (newScroll > singleSetWidth * 1.5) {
            container.scrollLeft = newScroll - singleSetWidth;
          }
        }
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleMouseEnter = () => { isScrollingRef.current = true; };
  const handleMouseLeave = () => { isScrollingRef.current = false; };
  const handleTouchStart = () => { isScrollingRef.current = true; };
  const handleTouchEnd = () => {
    setTimeout(() => { isScrollingRef.current = false; resetToCenter(); }, 1000);
  };

  return (
    <section className="flex flex-col bg-background overflow-hidden" style={{ height: 'min(80vh, 700px)' }}>
      <div className="container mx-auto px-4 lg:px-8 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
            <span className="w-8 h-px bg-border" />
            {t("common.navigation")}
            <span className="w-8 h-px bg-border" />
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            {t("interest.title")} <span className="text-gradient">{t("interest.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            {t("interest.subtitle")}
          </p>
        </motion.div>
      </div>

      <div className="flex-1 relative">
        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="h-full flex gap-4 overflow-x-auto no-scrollbar px-4 lg:px-8 will-change-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', contain: 'layout style' }}
        >
          {tripleInterests.map((interest, index) => (
            <motion.div
              key={`${interest.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % interests.length) * 0.05 }}
              className="flex-shrink-0 w-[200px] md:w-[280px] lg:w-[320px] h-full pb-8"
            >
              <Link to={interest.link} className="block h-full">
                <div className="group relative h-full rounded-2xl overflow-hidden cursor-pointer">
                  <LazyImage
                    src={interest.image}
                    alt={interest.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    containerClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                      {interest.title}
                    </h3>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      <span>{t("common.viewMore")}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
