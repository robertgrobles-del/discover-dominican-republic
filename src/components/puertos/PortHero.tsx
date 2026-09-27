import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Ship, Anchor, Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PortDetailData } from "@/data/puertosDetalleData";

interface PortHeroProps {
  puerto: PortDetailData;
}

export function PortHero({ puerto }: PortHeroProps) {
  return (
    <section className="relative h-[50vh] min-h-[400px]">
      <div className="absolute inset-0">
        <img
          src={puerto.image}
          alt={puerto.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/puertos-marinas" className="hover:text-primary transition-colors">
              Puertos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{puerto.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Anchor className="h-3 w-3 mr-1" /> {puerto.type}
            </Badge>
            <FavoriteButton
              id={puerto.id}
              type="destino"
              name={puerto.name}
              image={puerto.image}
              location={puerto.location}
              variant="button"
            />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {puerto.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {puerto.rating > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{puerto.rating}</span>
                  <span>({puerto.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{puerto.location}</span>
            </div>
            {puerto.schedule.avgShipsPerWeek && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Ship className="h-4 w-4" />
                  <span>{puerto.schedule.avgShipsPerWeek}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
