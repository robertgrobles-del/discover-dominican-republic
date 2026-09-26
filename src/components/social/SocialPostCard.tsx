import { motion, AnimatePresence } from "framer-motion";
import { 
  Instagram, 
  Twitter, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Play, 
  Send, 
  Zap, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SocialPost } from "@/data/socialData";

interface SocialPostCardProps {
  post: SocialPost;
  index: number;
  isOpenComments: boolean;
  commentValue: string;
  isCommented: boolean;
  isSubmitting: boolean;
  postsCommentedToday: number;
  dailyLimit: number;
  onOpenReels: () => void;
  onToggleComments: () => void;
  onCommentChange: (val: string) => void;
  onSubmitComment: () => void;
}

export function SocialPostCard({
  post,
  index,
  isOpenComments,
  commentValue,
  isCommented,
  isSubmitting,
  postsCommentedToday,
  dailyLimit,
  onOpenReels,
  onToggleComments,
  onCommentChange,
  onSubmitComment
}: SocialPostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="break-inside-avoid mb-6"
    >
      <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-xl transition-shadow">
        {!post.isText && post.image && (
          <div 
            className={`relative ${post.isVideo ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (post.isVideo) {
                onOpenReels();
              }
            }}
          >
            <img
              src={post.image}
              alt={post.caption}
              className="w-full object-cover"
              loading="lazy"
            />
            {post.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary fill-current ml-1" />
                </div>
              </div>
            )}
            <Badge className="absolute top-3 right-3 bg-card/90">
              {post.platform === "instagram" && <Instagram className="h-3 w-3" />}
              {post.platform === "tiktok" && <Play className="h-3 w-3" />}
              {post.platform === "twitter" && <Twitter className="h-3 w-3" />}
            </Badge>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.avatar}
              alt={post.user}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-foreground">{post.user}</p>
              {post.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {post.location}
                </p>
              )}
            </div>
            {post.platform === "twitter" && (
              <Twitter className="h-4 w-4 text-muted-foreground ml-auto" />
            )}
          </div>
          
          <p className="text-sm text-foreground mb-3">{post.caption}</p>
          
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <button 
              className="flex items-center gap-1 hover:text-rose-500 transition-colors"
              onClick={() => toast.success("¡Like agregado!")}
            >
              <Heart className="h-4 w-4" /> {(post.likes / 1000).toFixed(1)}k
            </button>
            <button
              onClick={onToggleComments}
              className={`flex items-center gap-1 transition-colors ${
                isCommented ? "text-primary font-semibold" : "hover:text-primary"
              }`}
              title="Comentar y ganar XP"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments + (isCommented ? 1 : 0)}
              {isCommented && (
                <CheckCircle2 className="h-3 w-3 text-primary ml-0.5" />
              )}
            </button>
            <button 
              className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("¡Enlace copiado al portapapeles!");
              }}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Inline Comment Section */}
          <AnimatePresence>
            {isOpenComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border/60 overflow-hidden"
              >
                {isCommented ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Ya comentaste en esta publicación (+50 XP). ¡Gracias por participar!</span>
                  </div>
                ) : postsCommentedToday >= dailyLimit ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Límite diario de {dailyLimit} posts alcanzado. Vuelve mañana para ganar más recompensas.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Zap className="h-3 w-3" /> Gana +50 XP y +15 Monedas
                      </span>
                      <span>{dailyLimit - postsCommentedToday} disponibles hoy</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribe un comentario..."
                        value={commentValue}
                        onChange={(e) => onCommentChange(e.target.value)}
                        maxLength={500}
                        className="text-xs h-8 bg-background"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSubmitComment();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-3 gap-1 shrink-0 text-xs"
                        onClick={onSubmitComment}
                        disabled={isSubmitting || !commentValue.trim()}
                      >
                        {isSubmitting ? (
                          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            <span>Enviar</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
