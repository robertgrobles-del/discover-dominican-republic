import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface BadgeItem {
  key: string;
  icon: string;
  name: string;
  desc: string;
  detail?: string;
  xp: number;
  link?: string;
  color?: string;
  border?: string;
  rarity?: BadgeRarity;
  progress?: number;   // 0-100
  progressLabel?: string;
  isSecret?: boolean;
  earned: boolean;
}

const RARITY_CONFIG: Record<BadgeRarity, {
  label: string;
  badgeClass: string;
  glowClass: string;
  borderClass: string;
  shimmer: boolean;
  stars: number;
}> = {
  common:    { label: "Común",    badgeClass: "bg-gray-500/20 text-gray-500",    glowClass: "",                                            borderClass: "border-gray-300",   shimmer: false, stars: 1 },
  uncommon:  { label: "Inusual",  badgeClass: "bg-emerald-500/20 text-emerald-600", glowClass: "shadow-emerald-500/20",                    borderClass: "border-emerald-400", shimmer: false, stars: 2 },
  rare:      { label: "Raro",     badgeClass: "bg-blue-500/20 text-blue-600",    glowClass: "shadow-blue-500/25 shadow-lg",                borderClass: "border-blue-400",   shimmer: false, stars: 3 },
  epic:      { label: "Épico",    badgeClass: "bg-purple-500/20 text-purple-600", glowClass: "shadow-purple-500/30 shadow-xl",             borderClass: "border-purple-400", shimmer: true,  stars: 4 },
  legendary: { label: "Legendario", badgeClass: "bg-amber-500/20 text-amber-600", glowClass: "shadow-amber-500/40 shadow-2xl",             borderClass: "border-amber-400",  shimmer: true,  stars: 5 },
};

interface BadgeCardProps {
  badge: BadgeItem;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  showDetails?: boolean;
}

export function BadgeCard({ badge, size = "md", showProgress = true, showDetails = true }: BadgeCardProps) {
  const rarity = badge.rarity || "common";
  const cfg = RARITY_CONFIG[rarity];

  const sizeClasses = {
    sm: "p-3 rounded-xl",
    md: "p-5 rounded-2xl",
    lg: "p-6 rounded-3xl",
  };
  const iconSizes = { sm: "text-3xl", md: "text-5xl", lg: "text-6xl" };

  return (
    <motion.div
      whileHover={badge.earned ? { y: -4, scale: 1.02 } : { scale: 1.01 }}
      className={`relative border-2 text-center transition-all ${sizeClasses[size]} ${
        badge.earned
          ? `bg-gradient-to-br from-card to-card/80 ${cfg.borderClass} ${cfg.glowClass}`
          : "bg-card border-border opacity-65"
      }`}
    >
      {/* Shimmer for epic/legendary */}
      {badge.earned && cfg.shimmer && (
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none" aria-hidden="true" role="presentation">
          <div
            className={[
              "absolute inset-0 opacity-30",
              rarity === "legendary"
                ? "bg-[linear-gradient(45deg,transparent_40%,rgba(251,191,36,0.4)_50%,transparent_60%)] bg-[length:200%_200%] animate-[shimmer_3s_ease-in-out_infinite]"
                : "bg-[linear-gradient(45deg,transparent_40%,rgba(139,92,246,0.4)_50%,transparent_60%)] bg-[length:200%_200%] animate-[shimmer_3s_ease-in-out_infinite]",
            ].join(" ")}
          />
        </div>
      )}

      {/* Lock / earned indicator */}
      <div className="absolute -top-2.5 -right-2.5">
        {badge.earned ? (
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        ) : badge.isSecret ? (
          <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shadow-md text-sm">
            ❓
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shadow-md">
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Icon */}
      <div className={`${iconSizes[size]} mb-2 block ${!badge.earned && "grayscale opacity-50"}`}>
        {badge.isSecret && !badge.earned ? "🔒" : badge.icon}
      </div>

      {/* Rarity stars */}
      {size !== "sm" && (
        <div className="flex justify-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-[8px] ${i < cfg.stars ? "text-amber-400" : "text-border"}`}>★</span>
          ))}
        </div>
      )}

      {/* Name */}
      <h3 className={`font-bold text-foreground ${size === "sm" ? "text-xs" : "text-sm"} mb-1 leading-tight`}>
        {badge.isSecret && !badge.earned ? "???" : badge.name}
      </h3>

      {showDetails && !badge.isSecret && (
        <p className={`text-muted-foreground mb-2 ${size === "sm" ? "text-[9px]" : "text-xs"}`}>
          {badge.desc}
        </p>
      )}

      {/* Rarity badge */}
      <Badge className={`text-[9px] px-1.5 py-0.5 mb-2 ${cfg.badgeClass}`}>
        {badge.isSecret && !badge.earned ? "Secreto" : cfg.label}
      </Badge>

      {/* XP */}
      {size !== "sm" && (
        <div className="flex justify-center mb-3">
          <Badge variant="secondary" className="text-xs gap-1">
            <Zap className="h-2.5 w-2.5" /> {badge.xp} XP
          </Badge>
        </div>
      )}

      {/* Progress bar */}
      {showProgress && !badge.earned && badge.progress !== undefined && badge.progress > 0 && !badge.isSecret && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
            <span>Progreso</span>
            <span>{badge.progressLabel || `${badge.progress}%`}</span>
          </div>
          <Progress value={badge.progress} className="h-1.5" />
        </div>
      )}

      {/* CTA */}
      {showDetails && size !== "sm" && badge.link && (
        <Button
          asChild
          size="sm"
          variant={badge.earned ? "outline" : "default"}
          className="w-full text-xs"
        >
          <Link to={badge.link}>
            {badge.earned ? "Ver más" : badge.isSecret ? "Descubrir" : "Comenzar"}
          </Link>
        </Button>
      )}
    </motion.div>
  );
}

interface BadgeAlbumProps {
  badges: BadgeItem[];
  title?: string;
  columns?: 2 | 3 | 4 | 5;
}

export function BadgeAlbum({ badges, title, columns = 4 }: BadgeAlbumProps) {
  const earned = badges.filter(b => b.earned).length;
  const total = badges.length;

  const colClasses: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5",
  };

  const rarityOrder: Record<BadgeRarity, number> = {
    legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4
  };

  const sorted = [...badges].sort((a, b) => {
    // Earned first, then by rarity
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return (rarityOrder[a.rarity || "common"] - rarityOrder[b.rarity || "common"]);
  });

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{earned}/{total}</span>
            <Progress value={(earned / Math.max(total, 1)) * 100} className="w-20 h-2" />
          </div>
        </div>
      )}
      <div className={`grid ${colClasses[columns]} gap-4`}>
        {sorted.map((badge, i) => (
          <motion.div
            key={badge.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <BadgeCard badge={badge} size="md" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
