import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function InterestSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              Navegación
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Explora por <span className="text-gradient">Interés</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Diseña tu viaje ideal basándote en lo que más te apasiona.
            </p>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Interest Cards Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory"
        >
          {interests.map((interest, index) => (
            <motion.div
              key={interest.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[160px] md:w-[200px] snap-start"
            >
              <Link to={interest.link}>
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer">
                  {/* Background Image */}
                  <img
                    src={interest.image}
                    alt={interest.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
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
      </div>
    </section>
  );
}
