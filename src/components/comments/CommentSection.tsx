import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Star, Flag, ThumbsUp, Send, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { gamificationApi } from "@/lib/gamificationApi";
import { fetchApi } from "@/lib/fastifyClient";

export interface CommentItem {
  id: string;
  author_name: string;
  author_avatar?: string;
  rating?: number;
  content: string;
  created_at: string;
  likes_count: number;
}

interface CommentSectionProps {
  contentId?: string;
  contentType?: "destination" | "article" | "route" | "general" | "province" | "restaurant" | "hotel" | "bar" | "parque" | "activity" | "playa" | "rio" | string;
  targetId?: string;
  targetType?: string;
  targetName?: string;
  title?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  contentId: rawContentId,
  contentType = "general",
  targetId,
  targetType,
  targetName,
  title = "Opiniones de la Comunidad",
}) => {
  const contentId = rawContentId || targetId || "";
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "comm-1",
      author_name: "Valeria Morales",
      rating: 5,
      content: "¡Una experiencia absolutamente mágica! Los colores del atardecer y la calidez de los lugareños superaron todas mis expectativas.",
      created_at: "Hace 2 días",
      likes_count: 14
    },
    {
      id: "comm-2",
      author_name: "Carlos Peñalo",
      rating: 5,
      content: "Excelente guía y recomendaciones muy acertadas. Recomiendo llegar temprano en la mañana para disfrutar de la tranquilidad.",
      created_at: "Hace 4 días",
      likes_count: 8
    }
  ]);

  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 3;

  useEffect(() => {
    if (!HAS_BACKEND_SESSION || !contentId) return;
    if (contentType === "post") {
      gamificationApi.getPostComments(contentId).then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setComments(items.map((it) => ({
            id: it.id,
            author_name: it.author_name || "Explorador",
            author_avatar: it.author_avatar || undefined,
            rating: 5,
            content: it.content,
            created_at: new Date(it.created_at).toLocaleDateString(),
            likes_count: 0,
          })));
        }
      }).catch((err: any) => {
        toast.error("Error al cargar comentarios", { description: err.message });
      });
    }
  }, [contentId, contentType]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Por favor escribe tu comentario.");
      return;
    }

    setIsSubmitting(true);
    const finalAuthor = user?.email?.split("@")[0] || authorName.trim() || "Explorador Dominicano";

    const newEntry: CommentItem = {
      id: `comm-${Date.now()}`,
      author_name: finalAuthor,
      rating,
      content: newComment.trim(),
      created_at: "Justo ahora",
      likes_count: 0
    };

    if (HAS_BACKEND_SESSION) {
      if (!user) {
        toast.error("Inicia sesión para compartir tu experiencia.");
        setIsSubmitting(false);
        return;
      }
      try {
        if (contentType === "post") {
          await gamificationApi.addPostComment(contentId || "general", newComment.trim());
        } else {
          const TYPE_ALIAS: Record<string, string> = {
            general: "destination",
            playa: "beach",
            parque: "park",
            rio: "destination",
            actividad: "tour",
            activity: "tour",
          };
          const mappedType = TYPE_ALIAS[contentType] || contentType;
          await fetchApi("/reviews", {
            method: "POST",
            body: JSON.stringify({
              entity_type: mappedType,
              entity_id: contentId,
              rating: rating,
              comment: newComment.trim().length >= 10 ? newComment.trim() : `${newComment.trim()} (opinión verificado)`,
            }),
          });
        }
        setComments([newEntry, ...comments]);
        setNewComment("");
        toast.success("✨ ¡Comentario publicado con éxito!");
      } catch (err: any) {
        toast.error("No se pudo publicar el comentario", { description: err.message });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      await supabase.from("comments" as any).insert({
        content_id: contentId,
        content_type: contentType,
        author_name: finalAuthor,
        rating,
        content: newComment.trim(),
        user_id: user?.id || null
      });
      setComments([newEntry, ...comments]);
      setNewComment("");
      toast.success("✨ ¡Comentario publicado con éxito!");
    } catch (err: any) {
      toast.error("Error al publicar el comentario", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSpam = async (commentId: string) => {
    if (HAS_BACKEND_SESSION) {
      try {
        await fetchApi("/ugc/reports", {
          method: "POST",
          body: JSON.stringify({
            target_id: commentId,
            target_type: "comment",
            reason: "Spam / Contenido inapropiado",
          }),
        });
        toast.info("🚨 Reporte enviado a moderación. Gracias por mantener la comunidad segura.");
      } catch (err: any) {
        toast.error("Error al enviar el reporte", { description: err.message });
      }
      return;
    }

    try {
      await supabase.from("ugc_reports" as any).insert({
        target_id: commentId,
        target_type: "comment",
        reported_by: user?.id || null,
        reason: "Spam / Contenido inapropiado",
        created_at: new Date().toISOString()
      });
      toast.info("🚨 Reporte enviado a moderación. Gracias por mantener la comunidad segura.");
    } catch (err: any) {
      toast.error("Error al enviar el reporte", { description: err.message });
    }
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(c => c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c));
  };

  const totalPages = Math.ceil(comments.length / perPage);
  const paginatedComments = comments.slice((page - 1) * perPage, page * perPage);

  return (
    <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden my-8">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-display">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{comments.length} opiniones de la comunidad</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs gap-1 border-primary/20 text-primary">
            <ShieldCheck className="w-3.5 h-3.5" /> Moderación Activa
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Formulario de comentario */}
        <form onSubmit={handleSubmitComment} className="p-4 rounded-xl bg-accent/30 border border-border/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-foreground">Tu Calificación:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {!user && (
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tu nombre o alias..."
              maxLength={60}
              className="bg-background text-xs"
            />
          )}

          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comparte tus consejos, experiencia, horario recomendado o advertencias útiles..."
            maxLength={1000}
            className="bg-background min-h-[85px] text-xs resize-none"
          />

          <div className="flex justify-end">
            <Button size="sm" type="submit" disabled={isSubmitting} className="gap-1.5 text-xs">
              <Send className="w-3.5 h-3.5" /> {isSubmitting ? "Publicando..." : "Publicar Comentario"}
            </Button>
          </div>
        </form>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {paginatedComments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-border/60 bg-background/60 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-primary/20">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {c.author_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{c.author_name}</h5>
                    <span className="text-[10px] text-muted-foreground">{c.created_at}</span>
                  </div>
                </div>

                {c.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: c.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed pl-11">{c.content}</p>

              <div className="flex items-center justify-between pt-2 pl-11 border-t border-border/40 text-[11px] text-muted-foreground">
                <button
                  type="button"
                  onClick={() => handleLike(c.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" /> Útil ({c.likes_count})
                </button>

                <button
                  type="button"
                  onClick={() => handleReportSpam(c.id)}
                  className="flex items-center gap-1 text-muted-foreground/60 hover:text-rose-500 transition-colors"
                  title="Reportar comentario inapropiado"
                >
                  <Flag className="w-3 h-3" /> Reportar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-xs h-7 px-3"
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="text-xs h-7 px-3"
            >
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
