import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import {
  Calculator, Backpack, ArrowLeftRight, Languages, Sparkles,
  MapPinned, Hotel, Cloud, Umbrella, Plane, Compass, ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tools = [
  { 
    icon: Sparkles, 
    labelKey: "tools.tripPlanner", 
    desc: "Crea tu ruta personalizada en segundos con Inteligencia Artificial", 
    href: "/itinerario-ia",
    badge: "IA",
    accent: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-500/30",
    iconColor: "text-amber-500",
    featured: true
  },
  { 
    icon: ArrowLeftRight, 
    labelKey: "tools.currencyConverter", 
    desc: "Tasas DOP, USD, EUR en tiempo real", 
    href: "/conversor-moneda",
    accent: "from-emerald-500/20 to-transparent",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500"
  },
  { 
    icon: Cloud, 
    labelKey: "tools.weatherChecker", 
    desc: "Pronóstico del tiempo y temporadas", 
    href: "/clima",
    accent: "from-sky-500/20 to-transparent",
    border: "border-sky-500/20",
    iconColor: "text-sky-500"
  },
  { 
    icon: Umbrella, 
    labelKey: "tools.beachStatus", 
    desc: "Oleaje, viento y sargazo", 
    href: "/estado-playas",
    accent: "from-cyan-500/20 to-transparent",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-500"
  },
  { 
    icon: Calculator, 
    labelKey: "tools.budgetCalc", 
    desc: "Estima tus gastos por destino", 
    href: "/calculadora-presupuesto",
    accent: "from-indigo-500/20 to-transparent",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-500"
  },
  { 
    icon: Languages, 
    labelKey: "tools.translator", 
    desc: "Diccionario y frases locales", 
    href: "/traductor",
    accent: "from-purple-500/20 to-transparent",
    border: "border-purple-500/20",
    iconColor: "text-purple-500"
  },
  { 
    icon: Backpack, 
    labelKey: "tools.packingList", 
    desc: "Checklist inteligente de viaje", 
    href: "/lista-empaque",
    accent: "from-rose-500/20 to-transparent",
    border: "border-rose-500/20",
    iconColor: "text-rose-500"
  },
  { 
    icon: Hotel, 
    labelKey: "tools.hotelComparer", 
    desc: "Compara tarifas y amenidades", 
    href: "/comparador-hoteles",
    accent: "from-blue-500/20 to-transparent",
    border: "border-blue-500/20",
    iconColor: "text-blue-500"
  },
  { 
    icon: MapPinned, 
    labelKey: "tools.destinationComparer", 
    desc: "Enfrenta dos destinos cara a cara", 
    href: "/comparador",
    accent: "from-teal-500/20 to-transparent",
    border: "border-teal-500/20",
    iconColor: "text-teal-500"
  },
  { 
    icon: Plane, 
    labelKey: "travelerTools.requirements", 
    desc: "E-Ticket, visados y aduanas", 
    href: "/requisitos-viaje",
    accent: "from-amber-600/20 to-transparent",
    border: "border-amber-600/20",
    iconColor: "text-amber-600"
  },
];

export function TravelerToolsStrip() {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1">
            <Compass className="h-3.5 w-3.5" />
            {t("travelerTools.badge")}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("travelerTools.title")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {t("travelerTools.subtitle")}
          </p>
        </motion.div>

        {/* Bento-style tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.labelKey}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={tool.featured ? "sm:col-span-2" : "col-span-1"}
            >
              <Link
                to={tool.href}
                className={`flex flex-col justify-between h-full p-6 rounded-2xl bg-gradient-to-br ${tool.accent} bg-card/60 backdrop-blur-md border ${tool.border} hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-background/80 border border-border/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {tool.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          {tool.badge}
                        </span>
                      )}
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-foreground text-base mb-1.5 group-hover:text-primary transition-colors">
                    {t(tool.labelKey)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Abrir herramienta</span>
                  <span>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
