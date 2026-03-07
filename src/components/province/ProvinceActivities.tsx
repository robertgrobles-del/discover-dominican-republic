import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useI18n";

interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  count?: number;
}

interface ProvinceActivitiesProps {
  provinceName: string;
  provinceSlug: string;
  categories?: string[];
}

const allActivities: ActivityCategory[] = [
  { 
    id: "playa", 
    name: "Playas", 
    icon: "🏖️", 
    description: "Arenas doradas y aguas cristalinas",
    color: "from-cyan-500/20 to-blue-500/20"
  },
  { 
    id: "aventura", 
    name: "Aventura", 
    icon: "🎯", 
    description: "Adrenalina y experiencias extremas",
    color: "from-orange-500/20 to-red-500/20"
  },
  { 
    id: "ecoturismo", 
    name: "Ecoturismo", 
    icon: "🌿", 
    description: "Naturaleza y biodiversidad",
    color: "from-green-500/20 to-emerald-500/20"
  },
  { 
    id: "cultura", 
    name: "Cultura", 
    icon: "🏛️", 
    description: "Historia y tradiciones locales",
    color: "from-purple-500/20 to-indigo-500/20"
  },
  { 
    id: "montaña", 
    name: "Montaña", 
    icon: "⛰️", 
    description: "Senderismo y paisajes elevados",
    color: "from-stone-500/20 to-slate-500/20"
  },
  { 
    id: "rios", 
    name: "Ríos y Cascadas", 
    icon: "🌊", 
    description: "Aguas dulces y aventura fluvial",
    color: "from-teal-500/20 to-cyan-500/20"
  },
  { 
    id: "gastronomia", 
    name: "Gastronomía", 
    icon: "🍽️", 
    description: "Sabores y cocina tradicional",
    color: "from-amber-500/20 to-yellow-500/20"
  },
  { 
    id: "golf", 
    name: "Golf", 
    icon: "⛳", 
    description: "Campos de clase mundial",
    color: "from-lime-500/20 to-green-500/20"
  },
  { 
    id: "buceo", 
    name: "Buceo y Snorkel", 
    icon: "🤿", 
    description: "Arrecifes y vida marina",
    color: "from-blue-500/20 to-indigo-500/20"
  },
  { 
    id: "wellness", 
    name: "Bienestar", 
    icon: "🧘", 
    description: "Spas y relajación",
    color: "from-pink-500/20 to-rose-500/20"
  },
];

export function ProvinceActivities({ 
  provinceName, 
  provinceSlug,
  categories = [] 
}: ProvinceActivitiesProps) {
  const { t } = useTranslation();

  // Filter activities based on province categories, or show all
  const displayActivities = categories.length > 0 
    ? allActivities.filter(act => categories.includes(act.id) || 
        (categories.includes("playa") && act.id === "buceo") ||
        (categories.includes("ecoturismo") && (act.id === "montaña" || act.id === "rios"))
      ).slice(0, 8)
    : allActivities.slice(0, 8);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary">
            {t("provinceAct.badge")}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("provinceAct.title")} {provinceName}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("provinceAct.subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                to={`/actividades?tipo=${activity.id}&provincia=${provinceSlug}`}
                className="block group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <CardContent className={`p-6 bg-gradient-to-br ${activity.color}`}>
                    <div className="text-4xl mb-4">{activity.icon}</div>
                    <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {activity.description}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      {t("provinceAct.viewActivities")}
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
