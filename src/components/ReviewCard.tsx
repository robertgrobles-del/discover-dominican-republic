import { useState } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface ReviewCardProps {
  entityType: string;
  entityId: string;
  entityName: string;
  className?: string;
}

const mockReviews: Review[] = [
  { id: "1", author: "María G.", rating: 5, comment: "Increíble experiencia. Todo superó nuestras expectativas.", date: "2026-02-15", helpful: 12 },
  { id: "2", author: "Carlos R.", rating: 4, comment: "Muy bueno en general, el servicio fue excelente. Recomendado.", date: "2026-01-28", helpful: 8 },
  { id: "3", author: "Ana P.", rating: 5, comment: "Perfecto para familias. Volveremos sin duda.", date: "2026-01-10", helpful: 5 },
];

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={cn("transition-colors", interactive ? "cursor-pointer" : "cursor-default")}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => onRate?.(star)}
        >
          <Star
            className={cn(
              "h-5 w-5",
              (hover || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewCard({ entityType, entityId, entityName, className }: ReviewCardProps) {
  const [reviews] = useState<Review[]>(mockReviews);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const handleSubmit = () => {
    if (newRating === 0) {
      toast.error("Selecciona una calificación");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Escribe un comentario");
      return;
    }
    toast.success("¡Gracias por tu reseña! Será publicada tras revisión.");
    setShowForm(false);
    setNewRating(0);
    setNewComment("");
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} reseñas</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} size="sm">
          {showForm ? "Cancelar" : "Escribir reseña"}
        </Button>
      </div>

      {/* Write review form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Tu calificación</p>
              <StarRating rating={newRating} onRate={setNewRating} interactive />
            </div>
            <Textarea
              placeholder={`¿Qué te pareció ${entityName}?`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} size="sm">Enviar reseña</Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{review.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-7">
                <ThumbsUp className="h-3 w-3" /> Útil ({review.helpful})
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item 27: Transparencia y Política de Reseñas */}
      <div className="p-3 bg-muted/50 rounded-xl border border-border/40 text-xs text-muted-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong>Política de Reseñas Verificadas:</strong> En Descubre RD todas las reseñas son sometidas a control anti-fraude y no pueden ser alteradas ni eliminadas a cambio de compensación económica ni por planes premium.
          </span>
        </div>
      </div>
    </div>
  );
}
