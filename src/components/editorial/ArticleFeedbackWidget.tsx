import React, { useState } from "react";
import { ThumbsUp, Heart, Sparkles, CheckCircle2, Bookmark, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ArticleFeedbackWidgetProps {
  articleId?: string;
  articleTitle?: string;
  className?: string;
}

export function ArticleFeedbackWidget({ articleId, articleTitle, className }: ArticleFeedbackWidgetProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const reactions = [
    { id: "useful", label: "Muy Útil", icon: ThumbsUp, color: "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30" },
    { id: "love", label: "Me Encantó", icon: Heart, color: "hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30" },
    { id: "inspiring", label: "Para Mi Viaje", icon: Sparkles, color: "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30" },
  ];

  const handleReaction = (id: string, label: string) => {
    setSelectedReaction(id);
    setFeedbackSent(true);
    toast.success(`¡Gracias por tu valoración ("${label}")!`, {
      description: "Tu opinión nos ayuda a crear mejores guías y reportajes sobre Quisqueya."
    });
  };

  return (
    <div className={cn("p-6 rounded-3xl bg-gradient-to-br from-card to-muted/40 border border-border/80 text-center space-y-4 shadow-sm my-8", className)}>
      <div className="space-y-1">
        <h3 className="font-display font-bold text-base sm:text-lg text-foreground flex items-center justify-center gap-2">
          <span>¿Te fue útil este reportaje?</span>
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Valora este contenido para orientar a otros viajeros y a nuestro equipo editorial.
        </p>
      </div>

      {feedbackSent ? (
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-2xl text-xs font-semibold animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>¡Valoración registrada! Gracias por apoyar el contenido local.</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {reactions.map((r) => {
            const Icon = r.icon;
            return (
              <Button
                key={r.id}
                variant="outline"
                size="sm"
                onClick={() => handleReaction(r.id, r.label)}
                className={cn(
                  "rounded-xl text-xs font-bold gap-2 py-5 px-4 transition-all shadow-xs border-border/80",
                  r.color,
                  selectedReaction === r.id && "bg-primary text-primary-foreground border-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{r.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
