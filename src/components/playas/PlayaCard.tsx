import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getSafeCoverImage } from "@/lib/imageCovers";

interface PlayaCardProps {
  playa: any;
  index: number;
  t: (key: string) => string;
}

export function PlayaCard({ playa, index, t }: PlayaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const slug = playa.slug || playa.id;
  const imageUrl = getSafeCoverImage(playa.imageUrl || playa.image_url, "beach", playa.provinceSlug || playa.slug);
  const beachType = playa.beachType || playa.beach_type || 'arena-blanca';
  const shortDesc = playa.shortDescription || playa.short_description || '';
  const destName = playa.destinationName || playa.destination_name || playa.province || '';
  const rating = Number(playa.rating) || 4.8;
  const waveIntensity = playa.waveIntensity || playa.wave_intensity || 'calma';
  const sandType = playa.sandType || playa.sand_type || 'Arena blanca';

  const beachTypeLabels: Record<string, string> = {
    'arena-blanca': t("playas.whiteSand") || "Arena Blanca",
    'arena-dorada': t("playas.goldenSand") || "Arena Dorada",
    'virgen': t("playas.virgin") || "Virgen / Ecoturismo",
    'bahia': t("playas.bay") || "Bahía Tranquila",
    'deportiva': t("playas.sports") || "Surf & Deportes",
    'urbana': t("playas.urban") || "Urbana",
  };

  const waveColors: Record<string, string> = {
    calma: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    moderada: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    fuerte: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/playa/${slug}`}
        className="group relative overflow-hidden rounded-2xl bg-card border border-border/70 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {!imageLoaded && <Skeleton className="absolute inset-0" />}
            <img
              src={imageUrl}
              alt={playa.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              ref={(img) => { if (img?.complete) setImageLoaded(true); }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <Badge className="absolute top-3.5 left-3.5 bg-background/90 backdrop-blur-md text-foreground border border-white/20 text-xs font-semibold shadow-md">
              {beachTypeLabels[beachType] || beachType}
            </Badge>

            {rating > 0 && (
              <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
              </div>
            )}

            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{destName}</span>
              </div>
            </div>

            <div className="pointer-events-auto">
              <FavoriteButton
                id={slug}
                type="playa"
                name={playa.name}
                image={imageUrl}
                className="absolute bottom-3.5 right-3.5 z-10"
              />
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {playa.name}
            </h3>
            
            <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
              {shortDesc}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {waveIntensity && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${waveColors[waveIntensity] || waveColors.calma}`}>
                  🌊 Oleaje {waveIntensity}
                </span>
              )}
              {sandType && (
                <span className="text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  ✨ {sandType}
                </span>
              )}
            </div>

            {(playa.activities || []).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                {(playa.activities as string[]).slice(0, 3).map((act) => (
                  <span key={act} className="text-[10px] bg-secondary/70 text-secondary-foreground px-2 py-0.5 rounded font-medium">
                    {act}
                  </span>
                ))}
                {(playa.activities as string[]).length > 3 && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    +{(playa.activities as string[]).length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-4 pt-1 flex items-center justify-between text-xs font-medium text-primary">
          <span className="group-hover:underline flex items-center gap-1">
            Explorar detalles <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-[11px] text-muted-foreground">RD</span>
        </div>
      </Link>
    </motion.div>
  );
}
