import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites, FavoriteType } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  name: string;
  image: string;
  location?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  className?: string;
}

export function FavoriteButton({
  id,
  type,
  name,
  image,
  location,
  size = "md",
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const isActive = isFavorite(id, type);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isActive) {
      removeFavorite(id, type);
    } else {
      addFavorite({ id, type, name, image, location });
    }
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const label = isActive ? `Eliminar ${name} de favoritos` : `Guardar ${name} en favoritos`;

  if (variant === "button") {
    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        aria-label={label}
        className={cn("gap-2", className)}
      >
        <Heart className={cn(iconSizes[size], isActive && "fill-current")} />
        {isActive ? "Guardado" : "Guardar"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={cn(
        sizeClasses[size],
        "rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110",
        isActive && "bg-primary text-primary-foreground",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isActive ? "active" : "inactive"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn(
              iconSizes[size],
              isActive ? "fill-current text-primary-foreground" : "text-foreground"
            )}
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
