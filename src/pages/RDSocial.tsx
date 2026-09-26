import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  sanitizeInput, 
  detectSQLiPatterns, 
  ClientRateLimiter 
} from "@/lib/security";
import {
  Instagram,
  Play,
  Search,
  Camera,
} from "lucide-react";
import { 
  socialFilters, 
  staticSocialPosts, 
  topSpots, 
  weeklyWinners, 
  mockReels 
} from "@/data/socialData";
import { SocialPostCard } from "@/components/social/SocialPostCard";
import { SocialTrendingSidebar } from "@/components/social/SocialTrendingSidebar";
import { SocialReelsModal } from "@/components/social/SocialReelsModal";

export default function RDSocial() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTikTokOpen, setIsTikTokOpen] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Comment system state
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commentedPosts, setCommentedPosts] = useState<Set<string>>(new Set());
  const [postsCommentedToday, setPostsCommentedToday] = useState(0);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const DAILY_LIMIT = 3;

  // Load current comment stats on mount
  const loadCommentStats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.rpc("get_my_comment_stats");
    if (data) {
      const stats = data as { posts_today: number; total_comments: number };
      setPostsCommentedToday(stats.posts_today);
    }
    // Load which posts the user already commented on today
    const { data: myComments } = await supabase
      .from("post_comments")
      .select("post_id")
      .eq("user_id", user.id);
    if (myComments) {
      setCommentedPosts(new Set(myComments.map((c: { post_id: string }) => c.post_id)));
    }
  }, [user]);

  useEffect(() => {
    loadCommentStats();
  }, [loadCommentStats]);

  const toggleComments = (postId: number) => {
    setOpenComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleComment = async (postId: number) => {
    const postIdStr = String(postId);
    const rawText = commentText[postId] || "";
    const cleanText = sanitizeInput(rawText);

    if (!user) {
      toast.error("Inicia sesión para comentar y ganar puntos");
      return;
    }

    // Rate limiter: Max 3 comment attempts per 30 seconds per user
    const rateCheck = ClientRateLimiter.check("comment", user.id, 3, 30000, 60000);
    if (!rateCheck.allowed) {
      toast.error(`Comentarios pausados momentáneamente. Espera ${rateCheck.retryAfterSeconds} segundos.`);
      return;
    }

    if (cleanText.length < 3) {
      toast.error("El comentario debe tener al menos 3 caracteres");
      return;
    }

    if (cleanText.length > 500) {
      toast.error("El comentario no puede exceder 500 caracteres");
      return;
    }

    // Prevent malicious patterns (SQLi / XSS)
    if (detectSQLiPatterns(cleanText)) {
      ClientRateLimiter.recordAttempt("comment", user.id);
      toast.error("El comentario contiene caracteres o patrones no autorizados");
      return;
    }

    if (commentedPosts.has(postIdStr)) {
      toast.error("Ya comentaste en esta publicación");
      return;
    }
    if (postsCommentedToday >= DAILY_LIMIT) {
      toast.error(`Límite diario alcanzado. Solo puedes comentar en ${DAILY_LIMIT} posts por día.`);
      return;
    }

    setSubmitting(postId);
    try {
      const { data, error } = await supabase.rpc("post_comment", {
        p_post_id: postIdStr,
        p_content: cleanText
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; xp_awarded?: number; coins_awarded?: number; posts_today?: number };

      if (!result.success) {
        const messages: Record<string, string> = {
          already_commented: "Ya comentaste en esta publicación",
          daily_limit_reached: `Límite de ${DAILY_LIMIT} posts por día alcanzado`,
          content_too_short: "El comentario es muy corto (mínimo 3 caracteres)",
          not_authenticated: "Debes iniciar sesión para comentar"
        };
        toast.error(messages[result.error!] || "No se pudo publicar el comentario");
        return;
      }

      // Success
      setCommentedPosts(prev => new Set([...prev, postIdStr]));
      setPostsCommentedToday(result.posts_today ?? postsCommentedToday + 1);
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      toast.success(`¡Comentario publicado! +${result.xp_awarded} XP +${result.coins_awarded} 🪙`, {
        description: `${DAILY_LIMIT - (result.posts_today ?? 0)} posts más disponibles hoy`
      });
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Error al publicar el comentario. Intenta de nuevo.");
    } finally {
      setSubmitting(null);
    }
  };

  const filteredPosts = staticSocialPosts.filter((post) => {
    if (activeFilter === "Instagram" && post.platform !== "instagram") return false;
    if (activeFilter === "TikTok" && post.platform !== "tiktok") return false;
    if (activeFilter === "Punta Cana" && post.location !== "Punta Cana") return false;
    if (activeFilter === "Samaná" && post.location !== "Samaná") return false;
    if (activeFilter === "Mejores Fotos" && post.likes < 3000) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        post.caption.toLowerCase().includes(q) ||
        post.user.toLowerCase().includes(q) ||
        post.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
              alt="RD Social"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/80" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="bg-primary/20 text-primary mb-4">
              <span className="animate-pulse mr-2">●</span> EN VIVO AHORA
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
              #LaIslaEnRedes
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Fotos y videos reales de viajeros en Instagram y TikTok. Comparte los tuyos con el hashtag.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="gap-2" onClick={() => setIsTikTokOpen(true)}>
                <Play className="h-4 w-4 fill-current" /> Ver TikTok Reels RD
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => toast.info("Usa #LaIslaEnRedes en Instagram o TikTok para aparecer aquí.")}
              >
                <Camera className="h-4 w-4" /> Compartir Historia
              </Button>
            </div>
            
            <div className="flex justify-center gap-8 text-white">
              <div className="text-center">
                <p className="text-3xl font-bold">1.2M+</p>
                <p className="text-sm text-white/70">Posts Totales</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">450k</p>
                <p className="text-sm text-white/70">Viajeros</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-white/70">Tiempo Real</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrar por:</span>
                <div className="flex flex-wrap gap-2">
                  {socialFilters.map((filter) => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(filter)}
                      className="gap-1"
                    >
                      {filter === "Instagram" && <Instagram className="h-3 w-3" />}
                      {filter === "TikTok" && <Play className="h-3 w-3" />}
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Masonry Feed */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {filteredPosts.map((post, index) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  index={index}
                  isOpenComments={openComments.has(post.id)}
                  commentValue={commentText[post.id] || ""}
                  isCommented={commentedPosts.has(String(post.id))}
                  isSubmitting={submitting === post.id}
                  postsCommentedToday={postsCommentedToday}
                  dailyLimit={DAILY_LIMIT}
                  onOpenReels={() => {
                    setIsTikTokOpen(true);
                    setActiveReelIndex(0);
                    toast.info("Abriendo reproductor de Reels verticales");
                  }}
                  onToggleComments={() => toggleComments(post.id)}
                  onCommentChange={(val) => setCommentText(prev => ({ ...prev, [post.id]: val }))}
                  onSubmitComment={() => handleComment(post.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trending Spots & Photo Contests */}
        <SocialTrendingSidebar
          topSpots={topSpots}
          weeklyWinners={weeklyWinners}
        />

        {/* TikTok Style Reels Viewer */}
        <SocialReelsModal
          isOpen={isTikTokOpen}
          onClose={() => setIsTikTokOpen(false)}
          reels={mockReels}
          activeIndex={activeReelIndex}
          setActiveIndex={setActiveReelIndex}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
