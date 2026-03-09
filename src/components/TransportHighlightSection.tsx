import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { Train, CableCar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const systems = [
  {
    titleKey: "transport.metro",
    descKey: "transport.metroDesc",
    icon: Train,
    href: "/metro-santo-domingo",
    stats: "2 líneas · 34 estaciones · 33 km",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    titleKey: "transport.teleferico",
    descKey: "transport.telefericoDesc",
    icon: CableCar,
    href: "/teleferico-santo-domingo",
    stats: "3 líneas · 9 estaciones · 10.5 km",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    titleKey: "transport.monoriel",
    descKey: "transport.monorielDesc",
    icon: Train,
    href: "/monoriel-santiago",
    stats: "24 km · 10 estaciones (planificado)",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
];

export function TransportHighlightSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-card/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-3 bg-primary/15 text-primary border-primary/25">
            <Train className="h-3 w-3 mr-1" /> {t("transport.badge")}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("transport.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("transport.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {systems.map((sys, i) => (
            <motion.div
              key={sys.titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <Link to={sys.href}>
                <Card className={`border ${sys.borderColor} hover:border-primary/30 transition-all group h-full`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl ${sys.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <sys.icon className={`h-7 w-7 ${sys.color}`} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {t(sys.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(sys.descKey)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground/70">
                      {sys.stats}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("common.viewMore")} <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
