import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  ChevronRight,
  Calendar,
  Droplets,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const temporadas = [
  {
    nombre: "Temporada Seca",
    meses: "Dic - Abr",
    icon: Sun,
    bgClass: "bg-amber-500",
    textClass: "text-amber-500",
    temperatura: "25-30°C",
    lluvia: "Baja",
    recomendacion: "Ideal para playas y aventuras",
  },
  {
    nombre: "Temporada Verde",
    meses: "May - Jul",
    icon: Cloud,
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-500",
    temperatura: "27-32°C",
    lluvia: "Moderada",
    recomendacion: "Precios bajos, menos turistas",
  },
  {
    nombre: "Temporada Húmeda",
    meses: "Ago - Nov",
    icon: CloudRain,
    bgClass: "bg-sky-500",
    textClass: "text-sky-500",
    temperatura: "28-33°C",
    lluvia: "Alta",
    recomendacion: "Ofertas hoteleras, surf",
  },
];

const quickTips = [
  { icon: Sun, text: "300+ días de sol al año" },
  { icon: Thermometer, text: "Agua a 25-29°C todo el año" },
  { icon: Wind, text: "Brisas alisios refrescantes" },
  { icon: Droplets, text: "Lluvias breves y tropicales" },
];

interface ClimateWidgetProps {
  variant?: "compact" | "full";
  className?: string;
}

export function ClimateWidget({ variant = "full", className = "" }: ClimateWidgetProps) {
  const currentMonth = new Date().getMonth();
  
  // Determine current season
  const getCurrentSeason = () => {
    if (currentMonth >= 11 || currentMonth <= 3) return 0; // Dry season
    if (currentMonth >= 4 && currentMonth <= 6) return 1; // Green season
    return 2; // Hurricane season
  };
  
  const currentSeasonIndex = getCurrentSeason();
  const currentSeason = temporadas[currentSeasonIndex];

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${currentSeason.bgClass} flex items-center justify-center`}>
              <currentSeason.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{currentSeason.nombre}</p>
              <p className="text-xs text-muted-foreground">{currentSeason.temperatura}</p>
            </div>
          </div>
          <Link to="/clima-temporadas">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Ver más <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-card rounded-2xl border border-border overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary-foreground/80" />
              <span className="text-primary-foreground/80 text-sm font-medium">Clima Actual</span>
            </div>
            <h3 className="font-display text-xl font-bold text-primary-foreground">
              {currentSeason.nombre}
            </h3>
            <p className="text-primary-foreground/70 text-sm">{currentSeason.meses}</p>
          </div>
          <div className={`w-16 h-16 rounded-2xl ${currentSeason.bgClass} flex items-center justify-center`}>
            <currentSeason.icon className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-primary-foreground/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary-foreground/70" />
              <span className="text-primary-foreground/70 text-xs">Temperatura</span>
            </div>
            <p className="text-primary-foreground font-bold mt-1">{currentSeason.temperatura}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-primary-foreground/70" />
              <span className="text-primary-foreground/70 text-xs">Precipitación</span>
            </div>
            <p className="text-primary-foreground font-bold mt-1">{currentSeason.lluvia}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-4">
          {currentSeason.recomendacion}
        </p>

        {/* All Seasons Overview */}
        <div className="space-y-3 mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Temporadas del Año</p>
          {temporadas.map((temp, index) => (
            <div
              key={temp.nombre}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                index === currentSeasonIndex 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-secondary/30"
              }`}
            >
              <temp.icon className={`h-5 w-5 ${temp.textClass}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{temp.nombre}</p>
                <p className="text-xs text-muted-foreground">{temp.meses}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {temp.temperatura}
              </Badge>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {quickTips.map((tip, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <tip.icon className="h-3.5 w-3.5 text-primary" />
              <span>{tip.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link to="/clima-temporadas">
          <Button className="w-full gap-2">
            <Calendar className="h-4 w-4" />
            Guía Completa de Clima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
