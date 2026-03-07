import { motion } from "framer-motion";
import { 
  MapPin, Users, Ruler, Calendar, Thermometer, 
  Plane, Utensils, Clock, Globe, Mountain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
};

// Region labels moved to component for i18n

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
    norte: t("provinceHero.regionNorth"),
    sur: t("provinceHero.regionSouth"),
    este: t("provinceHero.regionEast"),
    "santo-domingo": t("provinceHero.regionSD"),
  };
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="font-display text-2xl">
                  {t("techCard.title")} {name}
                </CardTitle>
                {categories && categories.length > 0 && (
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="gap-1">
                        {categoryIcons[cat]} {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Geography */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    {t("techCard.geography")}
                  </h3>
                  <div className="space-y-3">
                    <InfoRow 
                      icon={<MapPin className="h-4 w-4" />} 
                      label={t("techCard.region")} 
                      value={regionLabels[region]} 
                    />
                    {capital && (
                      <InfoRow 
                        icon={<Mountain className="h-4 w-4" />} 
                        label={t("provinceHero.capital")} 
                        value={capital} 
                      />
                    )}
                    {areaKm2 && (
                      <InfoRow 
                        icon={<Ruler className="h-4 w-4" />} 
                        label={t("techCard.area")} 
                        value={`${areaKm2.toLocaleString()} km²`} 
                      />
                    )}
                    {population && (
                      <InfoRow 
                        icon={<Users className="h-4 w-4" />} 
                        label={t("provinceHero.population")} 
                        value={population.toLocaleString()} 
                      />
                    )}
                    {latitude && longitude && (
                      <InfoRow 
                        icon={<MapPin className="h-4 w-4" />} 
                        label={t("techCard.coordinates")} 
                        value={`${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°O`} 
                      />
                    )}
                  </div>
                </div>

                <Separator className="md:hidden" />

                {/* Weather & Travel */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("techCard.travel")}
                  </h3>
                  <div className="space-y-3">
                    {bestTimeToVisit && (
                      <InfoRow 
                        icon={<Clock className="h-4 w-4" />} 
                        label={t("techCard.bestTime")} 
                        value={bestTimeToVisit} 
                      />
                    )}
                    {weatherInfo && (
                      <InfoRow 
                        icon={<Thermometer className="h-4 w-4" />} 
                        label={t("techCard.climate")} 
                        value={weatherInfo} 
                      />
                    )}
                    {howToGetThere && (
                      <InfoRow 
                        icon={<Plane className="h-4 w-4" />} 
                        label={t("techCard.howToGet")} 
                        value={howToGetThere} 
                      />
                    )}
                  </div>
                </div>

                <Separator className="md:hidden" />

                {/* Gastronomy */}
                {typicalDishes && typicalDishes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-primary" />
                      {t("techCard.gastronomy")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {typicalDishes.map((dish, index) => (
                        <Badge key={index} variant="secondary">
                          {dish}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-primary mt-0.5">{icon}</div>
      <div>
        <span className="text-xs text-muted-foreground block">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
