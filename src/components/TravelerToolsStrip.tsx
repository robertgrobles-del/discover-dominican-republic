import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import {
  Calculator, Backpack, ArrowLeftRight, Languages, Sparkles,
  MapPinned, Hotel, Cloud, Umbrella, Plane
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tools = [
  { icon: Sparkles, labelKey: "tools.tripPlanner", href: "/itinerario-ia" },
  { icon: Calculator, labelKey: "tools.budgetCalc", href: "/calculadora-presupuesto" },
  { icon: ArrowLeftRight, labelKey: "tools.currencyConverter", href: "/conversor-moneda" },
  { icon: Languages, labelKey: "tools.translator", href: "/traductor" },
  { icon: Backpack, labelKey: "tools.packingList", href: "/lista-empaque" },
  { icon: Hotel, labelKey: "tools.hotelComparer", href: "/comparador-hoteles" },
  { icon: MapPinned, labelKey: "tools.destinationComparer", href: "/comparador" },
  { icon: Cloud, labelKey: "tools.weatherChecker", href: "/clima" },
  { icon: Umbrella, labelKey: "tools.beachStatus", href: "/estado-playas" },
  { icon: Plane, labelKey: "travelerTools.requirements", href: "/requisitos-viaje" },
];

export function TravelerToolsStrip() {
  const { t } = useTranslation();

  return (
    <section className="py-14">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge className="mb-3 bg-accent/60 text-accent-foreground border-accent">
            {t("travelerTools.badge")}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("travelerTools.title")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("travelerTools.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.labelKey}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={tool.href}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent/40 transition-all group"
              >
                <tool.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">
                  {t(tool.labelKey)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
