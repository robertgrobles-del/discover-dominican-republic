import { Link } from "react-router-dom";
import { ChevronRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MarinaDetailData } from "@/data/marinasDetalleData";

interface MarinaHeroProps {
  marina: MarinaDetailData;
}

export function MarinaHero({ marina }: MarinaHeroProps) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/puertos-marinas" className="hover:text-primary transition-colors">
            Marinas
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{marina.nombre}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="container mx-auto px-4 mb-8">
        <div className="relative rounded-xl overflow-hidden min-h-[400px] lg:min-h-[500px] group shadow-lg">
          <img
            src={marina.imagenes[0].src}
            alt={marina.imagenes[0].alt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-2">
                  <Badge className="bg-primary text-primary-foreground">
                    <BadgeCheck className="w-3.5 h-3.5 mr-1 inline" /> Premium
                  </Badge>
                  <span>{marina.ubicacion}, RD</span>
                </div>
                <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight mb-2">
                  {marina.nombre}
                </h1>
                <p className="text-white/80 text-lg max-w-xl">
                  {marina.descripcion}
                </p>
              </div>
              <div className="flex gap-3">
                <FavoriteButton
                  id={marina.id}
                  type="puerto"
                  name={marina.nombre}
                  image={marina.imagenes[0].src}
                  location={marina.ubicacion}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
