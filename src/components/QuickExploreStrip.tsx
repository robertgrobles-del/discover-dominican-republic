import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import {
  Waves, Mountain, UtensilsCrossed, ShoppingBag, TreePine, Church,
  Landmark, Tent, Ship, Dumbbell, Heart, Camera
} from "lucide-react";

const categories = [
  { icon: Waves, labelKey: "quickExplore.beaches", href: "/playas", color: "text-sky-400" },
  { icon: Mountain, labelKey: "quickExplore.mountains", href: "/montanas", color: "text-emerald-500" },
  { icon: UtensilsCrossed, labelKey: "quickExplore.gastronomy", href: "/guia-gastronomica", color: "text-orange-400" },
  { icon: ShoppingBag, labelKey: "quickExplore.shopping", href: "/compras", color: "text-pink-400" },
  { icon: TreePine, labelKey: "quickExplore.ecoTourism", href: "/ecoturismo", color: "text-green-500" },
  { icon: Church, labelKey: "quickExplore.religious", href: "/turismo-religioso", color: "text-violet-400" },
  { icon: Landmark, labelKey: "quickExplore.culture", href: "/cultura", color: "text-amber-500" },
  { icon: Tent, labelKey: "quickExplore.adventure", href: "/actividades", color: "text-red-400" },
  { icon: Ship, labelKey: "quickExplore.cruises", href: "/nautica-cruceros", color: "text-blue-400" },
  { icon: Dumbbell, labelKey: "quickExplore.sports", href: "/turismo-deportivo", color: "text-indigo-400" },
  { icon: Heart, labelKey: "quickExplore.wellness", href: "/wellness", color: "text-rose-400" },
  { icon: Camera, labelKey: "quickExplore.gallery", href: "/galeria", color: "text-teal-400" },
];

export function QuickExploreStrip() {
  const { t } = useTranslation();

  return (
    <section className="py-8 bg-card/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-6 lg:grid-cols-12 md:overflow-visible md:pb-0">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.labelKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="snap-start"
            >
              <Link
                to={cat.href}
                className="flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-xl hover:bg-accent/60 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                  <cat.icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight whitespace-nowrap">
                  {t(cat.labelKey)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
