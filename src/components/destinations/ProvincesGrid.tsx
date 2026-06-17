import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Destination } from "@/data/destinations";
import { useTranslation } from "@/hooks/useI18n";

interface ProvincesGridProps {
  provinces: Destination[];
}

export function ProvincesGrid({ provinces }: ProvincesGridProps) {
  const { t } = useTranslation();
  if (!provinces || provinces.length === 0) return null;

  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">{t("destinos.32Provinces")}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("destinos.exploreByProvince")} <span className="text-gradient">{t("destinos.province")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("destinos.provinceDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {provinces.slice(0, 15).map((province, index) => (
            <motion.div key={province.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <Link to={`/provincia/${province.slug}`} className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={province.imageUrl || "/placeholder.svg"} alt={province.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  {province.region && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full capitalize">{province.region}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{province.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{province.region}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {provinces.length > 15 && (
          <div className="text-center mt-8">
            <Link to="/provincias">
              <Button variant="outline" size="lg">{t("destinos.viewAll32")}</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}