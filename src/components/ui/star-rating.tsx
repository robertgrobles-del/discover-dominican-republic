import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      setIsAnimating(true);
      onRatingChange(value);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const isFilled = value <= displayRating;
        const isHalfFilled = value - 0.5 <= displayRating && value > displayRating;

        return (
          <motion.button
            key={i}
            type="button"
            disabled={!interactive}
            className={cn(
              "relative transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => handleClick(value)}
            animate={isAnimating && isFilled ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Star
              className={cn(
                sizes[size],
                "transition-all duration-200",
                isFilled
                  ? "text-gold fill-gold drop-shadow-[0_0_4px_hsl(var(--gold)/0.5)]"
                  : "text-muted-foreground/30"
              )}
            />
            {isHalfFilled && (
              <Star
                className={cn(
                  sizes[size],
                  "absolute inset-0 text-gold fill-gold",
                  "clip-path-[inset(0_50%_0_0)]"
                )}
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </motion.button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Review stars display
interface ReviewStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ReviewStars({ rating, reviewCount, size = "sm", className }: ReviewStarsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StarRating rating={rating} size={size} showValue />
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount.toLocaleString()} reseñas)
        </span>
      )}
    </div>
  );
}
