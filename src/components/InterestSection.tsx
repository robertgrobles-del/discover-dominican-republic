import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import adventureImg from "@/assets/adventure.jpg";
import beachImg from "@/assets/beach-category.jpg";
import historyImg from "@/assets/history.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";
import divingImg from "@/assets/diving.jpg";
import relaxBeachImg from "@/assets/relax-beach.jpg";
import carnivalImg from "@/assets/carnival.jpg";
import raftingImg from "@/assets/rafting.jpg";

const interests = [
  { title: "Aventura", image: adventureImg, link: "/experiencias?cat=aventura" },
  { title: "Playas", image: beachImg, link: "/playas" },
  { title: "Historia", image: historyImg, link: "/patrimonio" },
  { title: "Gastronomía", image: gastronomyImg, link: "/guia-gastronomica" },
  { title: "Buceo", image: divingImg, link: "/experiencias?cat=acuaticos" },
  { title: "Bienestar", image: relaxBeachImg, link: "/wellness" },
  { title: "Cultura", image: carnivalImg, link: "/cultura" },
  { title: "Ecoturismo", image: raftingImg, link: "/sostenible" },
];

// Triplicamos los items para crear el efecto infinito
const tripleInterests = [...interests, ...interests, ...interests];

export function InterestSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Función para centrar el scroll en el grupo del medio
  const resetToCenter = useCallback(() => {
    if (scrollRef.current && !isScrollingRef.current) {
      const container = scrollRef.current;
      const singleSetWidth = container.scrollWidth / 3;
      
      // Si estamos en el primer tercio, saltamos al segundo
      if (container.scrollLeft < singleSetWidth * 0.3) {
        container.scrollLeft = container.scrollLeft + singleSetWidth;
      }
      // Si estamos en el tercer tercio, saltamos al segundo
      else if (container.scrollLeft > singleSetWidth * 1.7) {
        container.scrollLeft = container.scrollLeft - singleSetWidth;
      }
    }
  }, []);

  // Auto-scroll infinito
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Iniciar en el centro
    const singleSetWidth = container.scrollWidth / 3;
    container.scrollLeft = singleSetWidth;

    let animationId: number;
    let lastTime = 0;
    const speed = 0.5; // pixels per frame

    const animate = (currentTime: number) => {
      if (!isScrollingRef.current) {
        if (lastTime) {
          const delta = currentTime - lastTime;
          container.scrollLeft += speed * (delta / 16);
          resetToCenter();
        }
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [resetToCenter]);

  // Pausar auto-scroll al interactuar
  const handleMouseEnter = () => {
    isScrollingRef.current = true;
  };

  const handleMouseLeave = () => {
    isScrollingRef.current = false;
  };

  const handleTouchStart = () => {
    isScrollingRef.current = true;
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      isScrollingRef.current = false;
      resetToCenter();
    }, 1000);
  };

  return (
    <section className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4 lg:px-8 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
            <span className="w-8 h-px bg-border" />
            Navegación
            <span className="w-8 h-px bg-border" />
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Explora por <span className="text-gradient">Interés</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Diseña tu viaje ideal basándote en lo que más te apasiona.
          </p>
        </motion.div>
      </div>

      {/* Interest Cards Carousel - Infinite */}
      <div className="flex-1 relative">
        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="h-full flex gap-4 overflow-x-auto no-scrollbar px-4 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                  {/* Background Image */}
                  <img
                    src={interest.image}
                    alt={interest.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                      {interest.title}
                    </h3>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Ver más</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
