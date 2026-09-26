import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { River } from "@/data/rivers";
import { getSafeCoverImage } from "@/lib/imageCovers";
import { useTranslation } from "@/hooks/useI18n";

interface RioCardProps {
  rio: River;
  index: number;
}

export function RioCard({ rio, index }: RioCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = getSafeCoverImage(rio.imageUrl, "waterfall", rio.slug);

  const riverTypeLabels: Record<string, string> = {
    'montaña': t("rios.mountainRiver") || 'Río de Montaña',
    'cascada': t("rios.waterfall") || 'Cascada / Salto',
    'charco': t("rios.naturalPools") || 'Charcos & Pozas',
    'cañon': t("rios.canyon") || 'Cañón & Canyoning',
    'manantial': t("rios.spring") || 'Manantial Cristalino',
    'río': t("rios.mightyRiver") || 'Río Caudaloso'
  };

  const difficultyLabels: Record<string, { label: string; color: string }> = {
    'facil': { label: t("rios.diffEasy") || 'Fácil (Familiar)', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    'moderado': { label: t("rios.diffModerate") || 'Moderado', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    'dificil': { label: t("rios.diffDemanding") || 'Aventura Exigente', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    'experto': { label: t("rios.diffExpert") || 'Extremo / Experto', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' }
  };

  const diff = difficultyLabels[rio.difficulty] || difficultyLabels.moderado;
  const rating = Number(rio.rating) || 4.9;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/rio/${rio.slug}`}
        className="group relative overflow-hidden rounded-2xl bg-card border border-border/70 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {!imageLoaded && <Skeleton className="absolute inset-0" />}
            <img
              src={imageUrl}
              alt={rio.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              ref={(img) => { if (img?.complete) setImageLoaded(true); }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
              <Badge className="bg-background/90 backdrop-blur-md text-foreground border border-white/20 text-xs font-semibold shadow-md">
                {riverTypeLabels[rio.riverType] || rio.riverType}
              </Badge>
              {rio.isFeatured && (
                <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] shadow-md">
                  Destacado
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
            </div>

            {/* Bottom Info on Image */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{rio.mainProvinceName} {rio.destinationName && `· ${rio.destinationName}`}</span>
              </div>
            </div>

            <div className="pointer-events-auto">
              <FavoriteButton
                id={rio.slug}
                type="rio"
                name={rio.name}
                image={imageUrl}
                className="absolute bottom-3.5 right-3.5 z-10"
              />
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {rio.name}
            </h3>
            
            <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
              {rio.shortDescription || rio.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${diff.color}`}>
                {diff.label}
              </span>
              {rio.waterTemperature && (
                <span className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  💧 Agua {rio.waterTemperature}
                </span>
              )}
            </div>

            {rio.activities && rio.activities.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                {rio.activities.slice(0, 3).map((act) => (
                  <span key={act} className="text-[10px] bg-secondary/70 text-secondary-foreground px-2 py-0.5 rounded font-medium">
                    {act}
                  </span>
                ))}
                {rio.activities.length > 3 && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    +{rio.activities.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-4 pt-1 flex items-center justify-between text-xs font-medium text-primary">
          <span className="group-hover:underline flex items-center gap-1">
            Explorar balneario <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-[11px] text-muted-foreground">RD</span>
        </div>
      </Link>
    </motion.div>
  );
}
