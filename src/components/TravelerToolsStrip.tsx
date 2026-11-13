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
    desc: "Crea tu ruta personalizada en segundos con Inteligencia Artificial según tus gustos, presupuesto y días de estancia.", 
    href: "/itinerario-ia",
    badge: "IA Generativa",
    accent: "from-primary/15 via-amber-500/10 to-transparent",
    border: "border-primary/30 hover:border-primary/60",
    cta: "Generar mi itinerario",
    featured: true
  },
  { 
    icon: Plane, 
    labelKey: "travelerTools.requirements", 
    desc: "Formulario oficial de entrada y salida (E-Ticket), visados por nacionalidad, aduanas y vacunas para entrar al país.", 
    href: "/requisitos-viaje",
    badge: "Requisito Oficial",
    accent: "from-emerald-500/15 via-teal-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    cta: "Ver requisitos de entrada",
    featured: true
  },
  { 
    icon: ArrowLeftRight, 
    labelKey: "tools.currencyConverter", 
    desc: "Tasas DOP, USD, EUR en tiempo real", 
    href: "/conversor-moneda",
  },
  { 
    icon: Cloud, 
    labelKey: "tools.weatherChecker", 
    desc: "Pronóstico del tiempo y temporadas", 
    href: "/clima",
  },
  { 
    icon: Umbrella, 
    labelKey: "tools.beachStatus", 
    desc: "Oleaje, viento y sargazo", 
    href: "/estado-playas",
  },
  { 
    icon: Calculator, 
    labelKey: "tools.budgetCalc", 
    desc: "Estima tus gastos por destino", 
    href: "/costos-viaje#calculadora",
  },
  { 
    icon: Languages, 
    labelKey: "tools.translator", 
    desc: "Diccionario y frases locales", 
    href: "/espanol-viajero#traductor",
  },
  { 
    icon: Backpack, 
    labelKey: "tools.packingList", 
    desc: "Checklist inteligente de viaje", 
    href: "/lista-empaque",
  },
  { 
    icon: Hotel, 
    labelKey: "tools.hotelComparer", 
    desc: "Compara tarifas y amenidades", 
    href: "/comparador-hoteles",
  },
  { 
    icon: MapPinned, 
    labelKey: "tools.destinationComparer", 
    desc: "Enfrenta dos destinos cara a cara", 
    href: "/comparador",
  },
];

export function TravelerToolsStrip() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-24 relative overflow-hidden bg-background">
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
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1 text-xs">
            <Compass className="h-3.5 w-3.5" />
            {t("travelerTools.badge")}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            {t("travelerTools.title")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
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
              transition={{ delay: i * 0.04, duration: 0.35 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className={tool.featured ? "sm:col-span-2" : "col-span-1"}
            >
              {tool.featured ? (
                <Link
                  to={tool.href}
                  className={`flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${tool.accent} bg-card/80 backdrop-blur-md border ${tool.border} hover:shadow-xl hover:shadow-primary/10 transition-all group relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.badge && (
                          <span className="px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider rounded-full bg-primary/15 text-primary border border-primary/30">
                            {tool.badge}
                          </span>
                        )}
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-foreground text-lg sm:text-xl mb-2 group-hover:text-primary transition-colors">
                      {t(tool.labelKey)}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                    <span>{tool.cta}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ) : (
                <Link
                  to={tool.href}
                  className="flex flex-col justify-between h-full p-4 sm:p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:bg-card/90 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/70 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <tool.icon className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                      {t(tool.labelKey)}
                    </h3>
                    <p className="text-2xs text-muted-foreground line-clamp-1 leading-snug">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
