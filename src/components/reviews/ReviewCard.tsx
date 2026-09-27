import { motion } from "framer-motion";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  CheckCircle,
  User,
  MapPin,
  Heart,
  Users,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating, formatDate } from "@/components/reviews/StarRating";

export interface ReviewItem {
  id: string;
  author_name: string;
  verified: boolean;
  rating: number;
  created_at: string;
  traveler_type: "solo" | "couple" | "family" | "business";
  location: string;
  category: string;
  title: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  video_url?: string;
  helpful_count: number;
  user_id: string;
}

export const travelerTypes = [
  { id: "solo", label: "Solo", icon: User },
  { id: "couple", label: "Pareja", icon: Heart },
  { id: "family", label: "Familia", icon: Users },
  { id: "business", label: "Negocios", icon: Briefcase },
];

interface ReviewCardProps {
  review: ReviewItem;
  onShare: () => void;
  onReply: () => void;
}

export function ReviewCard({ review, onShare, onReply }: ReviewCardProps) {
  const TravelerIcon =
    travelerTypes.find((t) => t.id === review.traveler_type)?.icon || User;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            {review.verified && (
              <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5">
                <CheckCircle className="h-4 w-4 text-primary fill-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{review.author_name}</h3>
              {review.verified && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                >
                  Viajero Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{formatDate(review.created_at)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TravelerIcon className="h-3 w-3" />
                {travelerTypes.find((t) => t.id === review.traveler_type)?.label}
              </span>
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {review.location}
        </Badge>
        <Badge variant="secondary">{review.category}</Badge>
      </div>

      <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.content}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, i) => (
            <div key={i} className="w-24 h-24 rounded-lg overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {review.videoUrl && (
        <div className="mb-4 rounded-xl overflow-hidden max-w-[320px] border border-border">
          <video src={review.videoUrl} controls className="w-full object-cover h-[180px]" />
        </div>
      )}
      {review.video_url && !review.videoUrl && (
        <div className="mb-4 rounded-xl overflow-hidden max-w-[320px] border border-border">
          <video src={review.video_url} controls className="w-full object-cover h-[180px]" />
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ThumbsUp className="h-4 w-4" />
          Útil ({review.helpful_count})
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={onReply}>
          <MessageSquare className="h-4 w-4" />
          Responder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground ml-auto"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
}
