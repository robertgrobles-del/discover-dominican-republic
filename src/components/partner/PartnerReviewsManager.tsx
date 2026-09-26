import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2, Reply } from "lucide-react";
import { ReviewItem } from "@/data/partnerDashboardData";

interface PartnerReviewsManagerProps {
  reviews: ReviewItem[];
  onReplyReview: (reviewId: number, replyText: string) => void;
}

export function PartnerReviewsManager({
  reviews,
  onReplyReview
}: PartnerReviewsManagerProps) {
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  const handleSendReply = (reviewId: number) => {
    const text = replyTexts[reviewId];
    if (text && text.trim()) {
      onReplyReview(reviewId, text);
      setReplyTexts(prev => ({ ...prev, [reviewId]: "" }));
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Reseñas y Comentarios de Clientes</CardTitle>
        <CardDescription>Responde a los testimonios de los turistas para mejorar la reputación de tu marca.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-foreground text-base">{rev.author}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Publicado el {rev.date}</div>
              </div>
              <div className="flex items-center gap-0.5 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-semibold">
                <Star className="h-3 w-3 fill-yellow-500" /> {rev.rating} / 5
              </div>
            </div>

            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border italic">
              "{rev.comment}"
            </p>

            {rev.reply ? (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 ml-6 space-y-1">
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Respuesta enviada por el Partner:
                </div>
                <p className="text-sm text-foreground">{rev.reply}</p>
              </div>
            ) : (
              <div className="ml-6 space-y-2">
                <Label htmlFor={`reply-${rev.id}`} className="text-xs text-muted-foreground">Escribir respuesta oficial:</Label>
                <div className="flex gap-2">
                  <Input
                    id={`reply-${rev.id}`}
                    placeholder="Estimado cliente, agradecemos mucho su comentario..."
                    value={replyTexts[rev.id] || ""}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [rev.id]: e.target.value }))}
                  />
                  <Button size="sm" className="gap-1.5" onClick={() => handleSendReply(rev.id)}>
                    <Reply className="h-4 w-4" /> Enviar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
