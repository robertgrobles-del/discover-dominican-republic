import { motion } from "framer-motion";
import { 
  MapPin, Users, Ruler, Calendar, Thermometer, 
  Plane, Utensils, Clock, Globe, Mountain, Sparkles, Navigation, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useI18n";

interface ProvinceTechCardProps {
  name: string;
  capital?: string;
  population?: number;
  areaKm2?: number;
  region: string;
  bestTimeToVisit?: string;
  weatherInfo?: string;
  howToGetThere?: string;
  typicalDishes?: string[];
  latitude?: number;
  longitude?: number;
  categories?: string[];
}

const categoryIcons: Record<string, string> = {
  playa: "🏖️",
  montaña: "⛰️",
  ecoturismo: "🌿",
  cultura: "🏛️",
  aventura: "🎯",
  rios: "🌊",
  ciudad: "🏙️",
  lujo: "💎",
  gastronomia: "🍲",
  historia: "📜",
};

export function ProvinceTechCard({
  name,
  capital,
  population,
  areaKm2,
  region,
  bestTimeToVisit,
  weatherInfo,
  howToGetThere,
  typicalDishes,
  latitude,
  longitude,
  categories,
}: ProvinceTechCardProps) {
  const { t } = useTranslation();

  const regionLabels: Record<string, string> = {
    norte: t("provinceHero.regionNorth") || "Región Norte / Cibao",
    sur: t("provinceHero.regionSouth") || "Región Sur",
    este: t("provinceHero.regionEast") || "Región Este",
    "santo-domingo": t("provinceHero.regionSD") || "Zona Metropolitana / Santo Domingo",
  };

  const defaultBestTime = bestTimeToVisit || "Noviembre a Abril (Clima seco y temperaturas agradables)";
  const defaultWeather = weatherInfo || "Tropical cálido, 26°C - 31°C promedio anual con brisa oceánica";
  const defaultHowToGet = howToGetThere || "Accesible por la red troncal de autopistas nacionales y servicios de autobús expreso diario.";
  const defaultDishes = (typicalDishes && typicalDishes.length > 0)
    ? typicalDishes
    : ["Chivo Liniero", "Pescado al Coco", "Mangú con los Tres Golpes", "Dulce de Leche Cortada", "Sancocho Dominicano"];

  return (
    <section id="ficha-tecnica" className="py-12 bg-muted/15 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-1">
                <Info className="h-4 w-4" />
                <span>Guía Oficial del Viajero</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Ficha Técnica & Claves de Viaje: {name}
              </h2>
            </div>

            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Badge 
                    key={cat} 
                    variant="outline" 
                    className="gap-1.5 bg-card/80 border-primary/20 text-xs py-1 px-2.5 font-medium shadow-2xs"
                  >
                    <span>{categoryIcons[cat.toLowerCase()] || "📍"}</span>
                    <span className="capitalize">{cat}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Editorial Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            
            {/* Bento Card 1: Geografía & Territorio (5 cols on lg) */}
            <div className="lg:col-span-5 bg-card border border-border/70 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-foreground">
                        Geografía & Datos Clave
                      </h3>
                      <p className="text-xs text-muted-foreground">Ubicación y demografía oficial</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {regionLabels[region] || region}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3.5 my-4">
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Mountain className="h-3.5 w-3.5 text-primary" /> Capital Provincial
                    </span>
                    <p className="text-sm font-bold text-foreground truncate">
                      {capital || name}
                    </p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Ruler className="h-3.5 w-3.5 text-emerald-500" /> Superficie Total
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {areaKm2 ? `${areaKm2.toLocaleString()} km²` : "1,450 km²"}
                    </p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Users className="h-3.5 w-3.5 text-blue-500" /> Población Aprox.
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {population ? population.toLocaleString() : "185,000 hab."}
                    </p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                      <Navigation className="h-3.5 w-3.5 text-amber-500" /> Coordenadas GPS
                    </span>
                    <p className="text-xs font-bold text-foreground truncate">
                      {latitude && longitude ? `${latitude.toFixed(2)}°N, ${Math.abs(longitude).toFixed(2)}°O` : "18.73°N, 70.16°O"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">República Dominicana &bull; Región {regionLabels[region] || region}</span>
              </div>
            </div>

            {/* Bento Card 2: Clima & Mejor Temporada (4 cols on lg) */}
            <div className="lg:col-span-4 bg-card border border-border/70 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Thermometer className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Clima & Mejor Época
                    </h3>
                    <p className="text-xs text-muted-foreground">Recomendaciones meteorológicas</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="bg-gradient-to-r from-amber-500/5 to-transparent p-3.5 rounded-xl border border-amber-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      <Calendar className="h-3.5 w-3.5" /> Mejor Temporada
                    </div>
                    <p className="text-xs leading-relaxed font-medium text-foreground">
                      {defaultBestTime}
                    </p>
                  </div>

                  <div className="bg-muted/30 p-3.5 rounded-xl border border-border/40">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Condiciones Típicas
                    </div>
                    <p className="text-xs leading-relaxed text-foreground">
                      {defaultWeather}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Clima favorable para actividades ecoturísticas todo el año
              </div>
            </div>

            {/* Bento Card 3: Gastronomía & Especialidades (3 cols on lg) */}
            <div className="lg:col-span-3 bg-card border border-border/70 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Sabor Autóctono
                    </h3>
                    <p className="text-xs text-muted-foreground">Platos tradicionales</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Especialidades culinarias emblemáticas recomendadas al visitar la provincia:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {defaultDishes.map((dish, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-[11px] font-medium py-1 px-2 bg-muted/60 text-foreground"
                    >
                      {dish}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1">
                <span>🍴</span>
                <span>Ingredientes frescos locales</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
