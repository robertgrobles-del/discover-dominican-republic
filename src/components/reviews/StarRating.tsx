import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}

export function StarRating({ rating, interactive = false, onRate }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          title={`Calificar con ${star} estrellas`}
          aria-label={`Calificar con ${star} estrellas`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${diffDays >= 14 ? "s" : ""}`;
  return date.toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });
}
