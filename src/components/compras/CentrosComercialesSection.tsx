import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Store, MapPin, ChevronRight } from "lucide-react";
import { shoppingMalls } from "@/data/shopping-malls";

const tipoColor: Record<string, string> = {
  premium: "bg-primary/20 text-primary",
  regional: "bg-blue-500/20 text-blue-400",
  outlet: "bg-amber-500/20 text-amber-400",
  lifestyle: "bg-emerald-500/20 text-emerald-400",
};

export function CentrosComercialesSection() {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          Centros Comerciales
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre los mejores centros comerciales de República Dominicana, desde malls de lujo hasta plazas locales.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shoppingMalls.map((mall, index) => (
          <motion.div
            key={mall.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/centro-comercial/${mall.slug}`} className="block group">
              <div className="bg-card rounded-xl border border-border overflow-hidden h-full hover:border-primary/30 transition-colors">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={mall.imagen}
                    alt={mall.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className={`absolute top-3 left-3 ${tipoColor[mall.tipo]}`}>
                    {mall.tipo.charAt(0).toUpperCase() + mall.tipo.slice(1)}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {mall.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {mall.ciudad}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {mall.shortDescription}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" /> {mall.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Store className="h-3 w-3" /> {mall.tiendas}+
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
