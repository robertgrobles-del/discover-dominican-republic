import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Destination } from "@/data/destinations";
import { useTranslation } from "@/hooks/useI18n";

interface MunicipalitiesSectionProps {
  municipalities: Destination[];
}

export function MunicipalitiesSection({ municipalities }: MunicipalitiesSectionProps) {
  const { t } = useTranslation();
  if (!municipalities || municipalities.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Home className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">{t("destinos.touristMunicipalities")}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("destinos.localCommunities")} <span className="text-gradient">{t("destinos.local")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("destinos.municipalitiesDesc")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {municipalities.slice(0, 8).map((muni, index) => (
            <motion.div key={muni.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className={index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}>
              <Link to={`/destinos/${muni.slug}`} className="group block relative rounded-2xl overflow-hidden h-full min-h-[200px] cursor-pointer">
                <img src={muni.imageUrl || "/placeholder.svg"} alt={muni.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white/60 text-xs uppercase tracking-wider">{t("destinos.municipality")}</span>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-primary transition-colors">{muni.name}</h3>
                  {muni.province && <p className="text-white/70 text-sm">{muni.province}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}