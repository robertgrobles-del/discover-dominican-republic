import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, MapPin, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface ProfileReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  location: string;
  category: string;
  created_at: string;
}

interface ProfileReviewsTabProps {
  reviews: ProfileReview[];
  reviewsLoading: boolean;
  onDeleteReview: (reviewId: string) => void;
}

export function ProfileReviewsTab({
  reviews,
  reviewsLoading,
  onDeleteReview,
}: ProfileReviewsTabProps) {
  if (reviewsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No has publicado opiniones</h3>
          <p className="text-muted-foreground mb-4">
            Comparte tus experiencias de viaje con otros viajeros.
          </p>
          <Link to="/opiniones">
            <Button>Escribir Opinión</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{review.title}</h3>
                    <Badge variant="secondary">{review.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {review.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{" "}
                      {new Date(review.created_at).toLocaleDateString("es-DO")}
                    </span>
                    <span className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{review.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onDeleteReview(review.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
