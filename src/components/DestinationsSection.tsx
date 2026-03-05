import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import divingImg from "@/assets/diving.jpg";
import raftingImg from "@/assets/rafting.jpg";

const staticDestinations = [
  { id: "punta-cana", name: "Punta Cana", description: "Playas de arena blanca y aguas cristalinas con resorts de clase mundial.", image: puntaCanaImg },
  { id: "santo-domingo", name: "Santo Domingo", description: "La ciudad colonial más antigua de América, rica en historia y cultura.", image: santoDomingoImg },
  { id: "samana", name: "Samaná", description: "Naturaleza virgen, ballenas jorobadas y cascadas impresionantes.", image: samanaImg },
  { id: "puerto-plata", name: "Puerto Plata", description: "La Costa del Ámbar con teleférico, playas doradas y 27 Charcos.", image: puertoPlataImg },
  { id: "la-romana", name: "La Romana", description: "Casa de Campo, Altos de Chavón y playas exclusivas del sureste.", image: laRomanaImg },
  { id: "jarabacoa", name: "Jarabacoa", description: "La ciudad de la eterna primavera, rafting, montañas y aventura.", image: raftingImg },
  { id: "bayahibe", name: "Bayahíbe", description: "Pueblo pesquero con las mejores playas e islas vírgenes del Caribe.", image: divingImg },
];

const localImageMap: Record<string, string> = {
  "punta-cana": puntaCanaImg,
  "santo-domingo": santoDomingoImg,
  "samana": samanaImg,
  "puerto-plata": puertoPlataImg,
  "la-romana": laRomanaImg,
  "jarabacoa": raftingImg,
  "bayahibe": divingImg,
};

interface DisplayDestination {
  id: string;
  name: string;
  description: string;
  image: string;
}

export function DestinationsSection() {
  const [destinations, setDestinations] = useState<DisplayDestination[]>(staticDestinations);
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
            image: d.image_url || puntaCanaImg,
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
    <section className="min-h-screen flex flex-col justify-center bg-background py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              Destinos Populares
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Sumérgete en nuestros{" "}
              <span className="text-gradient">paraísos</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Desde playas de arenas blancas hasta las cimas más altas del Caribe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={scrollPrev} disabled={!canScrollPrev} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={scrollNext} disabled={!canScrollNext} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Link to="/destinos">
              <Button variant="link" className="text-primary gap-2">
                Ver todos los destinos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.1, 0.5) }}
                className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[350px]"
              >
                <div className="group relative aspect-[3/4] rounded-xl overflow-hidden">
                  <Link to={`/destino/${destination.id}`} className="block h-full">
                    <LazyImage
                      src={localImageMap[destination.id] || destination.image}
                      alt={destination.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      containerClassName="absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <FavoriteButton
                      id={destination.id}
                      type="destino"
                      name={destination.name}
                      image={localImageMap[destination.id] || destination.image}
                      className="absolute top-4 right-4 z-10"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {destination.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {destination.description}
                      </p>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Explorar destino</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
