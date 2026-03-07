import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Waves, Mountain, TreePine, Droplets, Sun, Building, Sparkles, Music } from "lucide-react";
import { useTranslation } from "@/hooks/useI18n";
import { LucideIcon } from "lucide-react";

interface CategoryDef {
  id: string;
  nameKey: string;
  icon: LucideIcon;
  descKey: string;
  color: string;
  gradient: string;
  destinations: string[];
}

const categoryDefs: CategoryDef[] = [
  { id: "playa", nameKey: "destinos.catBeaches", icon: Waves, descKey: "destinos.catBeachesDesc", color: "text-cyan-500", gradient: "from-cyan-500/20 to-blue-500/20", destinations: ["Punta Cana", "Samaná", "Puerto Plata", "Bayahíbe"] },
  { id: "montaña", nameKey: "destinos.catMountain", icon: Mountain, descKey: "destinos.catMountainDesc", color: "text-emerald-500", gradient: "from-emerald-500/20 to-green-500/20", destinations: ["Jarabacoa", "Constanza", "Valle Nuevo"] },
  { id: "ecoturismo", nameKey: "destinos.catEcotourism", icon: TreePine, descKey: "destinos.catEcotourismDesc", color: "text-green-500", gradient: "from-green-500/20 to-lime-500/20", destinations: ["Los Haitises", "Jaragua", "Sierra de Bahoruco"] },
  { id: "rios", nameKey: "destinos.catRivers", icon: Droplets, descKey: "destinos.catRiversDesc", color: "text-blue-500", gradient: "from-blue-500/20 to-indigo-500/20", destinations: ["27 Charcos", "Salto del Limón", "Río Chavón"] },
  { id: "wellness", nameKey: "destinos.catWellness", icon: Sun, descKey: "destinos.catWellnessDesc", color: "text-amber-500", gradient: "from-amber-500/20 to-orange-500/20", destinations: ["Casa de Campo", "Punta Cana Spas", "Samaná"] },
  { id: "cultural", nameKey: "destinos.catCultural", icon: Building, descKey: "destinos.catCulturalDesc", color: "text-purple-500", gradient: "from-purple-500/20 to-pink-500/20", destinations: ["Zona Colonial", "Santiago", "La Vega"] },
  { id: "lujo", nameKey: "destinos.catLuxury", icon: Sparkles, descKey: "destinos.catLuxuryDesc", color: "text-yellow-500", gradient: "from-yellow-500/20 to-amber-500/20", destinations: ["Cap Cana", "Casa de Campo", "Puntacana Resort"] },
  { id: "vida-nocturna", nameKey: "destinos.catNightlife", icon: Music, descKey: "destinos.catNightlifeDesc", color: "text-pink-500", gradient: "from-pink-500/20 to-rose-500/20", destinations: ["Santo Domingo", "Punta Cana", "Sosúa"] },
];

export function DestinationsByCategory() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("destinos.byCategory")} <span className="text-gradient">{t("destinos.category")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("destinos.byCategoryDesc")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryDefs.map((category, index) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <Link to={`/destinos/categoria/${category.id}`} className="group block p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} mb-4`}>
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">{t(category.nameKey)}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t(category.descKey)}</p>
                <div className="flex flex-wrap gap-1">
                  {category.destinations.slice(0, 3).map((dest, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{dest}</span>
                  ))}
                  {category.destinations.length > 3 && <span className="text-xs text-muted-foreground">+{category.destinations.length - 3}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}