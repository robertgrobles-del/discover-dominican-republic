import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ChevronRight, Heart, Share2, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DetailHeroBreadcrumb {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

export interface DetailHeroMetric {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DetailHeroHeaderProps {
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  categoryVariant?: "default" | "secondary" | "destructive" | "outline";
  categoryIcon?: React.ReactNode;
  breadcrumbs: DetailHeroBreadcrumb[];
  imageUrl: string;
  location?: string;
  rating?: number;
  reviewsCount?: number;
  metrics?: DetailHeroMetric[];
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
  rightAction?: React.ReactNode;
}

export const DetailHeroHeader: React.FC<DetailHeroHeaderProps> = ({
  title,
  subtitle,
  categoryBadge,
  categoryIcon,
  breadcrumbs,
  imageUrl,
  location,
  rating,
  reviewsCount,
  metrics,
  isSaved = false,
  onToggleSave,
  onShare,
  rightAction,
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[380px] md:min-h-[460px] flex flex-col justify-between">
      {/* Background Image with Layered Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
      </div>

      {/* Top Breadcrumb Bar */}
      <div className="relative z-10 container mx-auto px-4 pt-6 max-w-7xl">
        <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs text-white/80">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-white/40 shrink-0" />}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="hover:text-primary transition-colors flex items-center gap-1 font-medium hover:underline"
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white font-semibold flex items-center gap-1">
                  {crumb.icon}
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Main Hero Info Area */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-3.5">
            {/* Badges & Rating */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryBadge && (
                <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1 shadow-md border-none flex items-center gap-1">
                  {categoryIcon}
                  {categoryBadge}
                </Badge>
              )}

              {rating !== undefined && rating > 0 && (
                <Badge className="bg-amber-500/90 text-slate-950 font-black text-xs px-2.5 py-0.5 border-none flex items-center gap-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                  {rating.toFixed(1)} {reviewsCount ? `(${reviewsCount})` : ""}
                </Badge>
              )}

              {location && (
                <span className="text-xs text-white/90 flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {location}
                </span>
              )}
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm md:text-base text-white/80 max-w-2xl font-normal leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            )}

            {/* Quick Metrics Bar */}
            {metrics && metrics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {metrics.map((m, mi) => (
                  <div
                    key={mi}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-2xl text-xs"
                  >
                    {m.icon && <span className="text-primary">{m.icon}</span>}
                    <div>
                      <span className="text-[10px] text-white/60 uppercase font-bold block leading-none">
                        {m.label}
                      </span>
                      <span className="font-bold text-white text-xs mt-0.5 block leading-tight">
                        {m.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action & Buttons */}
          <div className="lg:col-span-4 flex flex-wrap lg:flex-col lg:items-end justify-start gap-3">
            <div className="flex items-center gap-2">
              {onToggleSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleSave}
                  className={`rounded-xl text-xs h-10 px-4 font-bold border-white/20 backdrop-blur-md ${
                    isSaved
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                  {isSaved ? "Guardado" : "Guardar"}
                </Button>
              )}

              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="rounded-xl text-xs h-10 px-4 font-bold border-white/20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
                >
                  <Share2 className="h-4 w-4 mr-1.5" /> Compartir
                </Button>
              )}
            </div>

            {rightAction && <div className="w-full sm:w-auto">{rightAction}</div>}
          </div>
        </div>
      </div>
    </section>
  );
};
