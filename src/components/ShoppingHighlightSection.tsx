import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { ShoppingBag, Star, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shoppingMalls } from "@/data/shopping-malls";
import { LazyImage } from "@/components/ui/lazy-image";

export function ShoppingHighlightSection() {
  const { t } = useTranslation();
  const featured = shoppingMalls.filter(m => m.tipo === "premium").slice(0, 4);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-3 bg-pink-500/15 text-pink-400 border-pink-500/25">
            <ShoppingBag className="h-3 w-3 mr-1" /> {t("shopping.badge")}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("shopping.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("shopping.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((mall, i) => (
            <motion.div
              key={mall.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/centro-comercial/${mall.slug}`}>
                <Card className="overflow-hidden border-border hover:border-primary/30 transition-all group h-full">
                  <div className="relative h-44 overflow-hidden">
                    <LazyImage
                      src={mall.imagen}
                      alt={mall.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground text-[10px]">
                      {mall.tiendas}+ {t("shopping.stores")}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {mall.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" /> {mall.ciudad}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-foreground">{mall.rating}</span>
                      <span className="text-muted-foreground">({mall.reviewCount})</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/compras" className="gap-2">
              {t("shopping.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
