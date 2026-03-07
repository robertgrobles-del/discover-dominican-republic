import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, MapPin, Send, Image, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  location: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_name?: string;
  liked_by_me?: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export default function FeedSocial() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("social_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsData && postsData.length > 0) {
      const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.id, p.display_name]) || []);

      let likedSet = new Set<string>();
      if (user) {
        const { data: likes } = await supabase
          .from("social_likes")
          .select("post_id")
          .eq("user_id", user.id);
        likedSet = new Set(likes?.map((l: any) => l.post_id) || []);
      }

      setPosts(
        postsData.map((p: any) => ({
          ...p,
          author_name: profileMap.get(p.user_id) || "Viajero",
          liked_by_me: likedSet.has(p.id),
        }))
      );
    } else {
      setPosts([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("social-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "social_posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  const handlePost = async () => {
    if (!user) { toast.error("Inicia sesión para publicar"); return; }
    if (!newContent.trim() && !newImageUrl.trim()) return;

    setPosting(true);
    const { error } = await supabase.from("social_posts").insert({
      user_id: user.id,
      content: newContent.trim() || null,
      image_url: newImageUrl.trim() || null,
      location: newLocation.trim() || null,
    } as any);

    if (error) {
      toast.error("Error al publicar");
    } else {
      setNewContent("");
      setNewImageUrl("");
      setNewLocation("");
      toast.success("¡Publicado!");
      fetchPosts();
    }
    setPosting(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) { toast.error("Inicia sesión para dar like"); return; }

    if (isLiked) {
      await supabase.from("social_likes").delete().eq("user_id", user.id).eq("post_id", postId);
      await supabase.from("social_posts").update({ likes_count: Math.max(0, (posts.find(p => p.id === postId)?.likes_count || 1) - 1) } as any).eq("id", postId);
    } else {
      await supabase.from("social_likes").insert({ user_id: user.id, post_id: postId } as any);
      await supabase.from("social_posts").update({ likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + 1 } as any).eq("id", postId);
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: !isLiked, likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1 }
          : p
      )
    );
  };

  const loadComments = async (postId: string) => {
    setShowComments(postId);
    const { data } = await supabase
      .from("social_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.id, p.display_name]) || []);
      setComments(data.map((c: any) => ({ ...c, author_name: profileMap.get(c.user_id) || "Viajero" })));
    } else {
      setComments([]);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) { toast.error("Inicia sesión para comentar"); return; }
    if (!newComment.trim()) return;

    await supabase.from("social_comments").insert({
      user_id: user.id,
      post_id: postId,
      content: newComment.trim(),
    } as any);

    await supabase.from("social_posts").update({ comments_count: (posts.find(p => p.id === postId)?.comments_count || 0) + 1 } as any).eq("id", postId);

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    setNewComment("");
    loadComments(postId);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Feed Social | Viajeros RD" description="Comparte tus experiencias de viaje en República Dominicana." />
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Feed de Viajeros</h1>
            <p className="text-muted-foreground">Comparte tus experiencias y descubre las de otros viajeros</p>
          </motion.div>

          {/* New Post */}
          {user ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border mb-8">
              <Textarea
                placeholder="¿Qué descubriste hoy en RD? 🌴"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[80px] mb-3 resize-none"
              />
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="URL de imagen (opcional)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Input
                    placeholder="📍 Ubicación"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePost} disabled={posting || (!newContent.trim() && !newImageUrl.trim())} className="gap-2">
                  <Send className="h-4 w-4" /> Publicar
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8 text-center">
              <p className="text-muted-foreground mb-3">Inicia sesión para compartir tus experiencias</p>
              <Link to="/login"><Button>Iniciar Sesión</Button></Link>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 border border-border space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="aspect-video rounded-xl" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">¡Sé el primero en compartir tu experiencia! 🌊</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {(post.author_name || "V")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{post.author_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{timeAgo(post.created_at)}</span>
                        {post.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" /> {post.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  {post.content && <p className="px-4 pb-3 text-sm whitespace-pre-wrap">{post.content}</p>}

                  {/* Image */}
                  {post.image_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 flex items-center gap-4 border-t border-border">
                    <button
                      onClick={() => handleLike(post.id, !!post.liked_by_me)}
                      className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${post.liked_by_me ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() => showComments === post.id ? setShowComments(null) : loadComments(post.id)}
                      className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments_count}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  <AnimatePresence>
                    {showComments === post.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                          {comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">Sin comentarios aún</p>
                          ) : (
                            comments.map((c) => (
                              <div key={c.id} className="flex gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="text-xs bg-secondary">{(c.author_name || "V")[0]}</AvatarFallback>
                                </Avatar>
                                <div className="bg-secondary rounded-xl px-3 py-2 flex-1">
                                  <p className="text-xs font-medium">{c.author_name}</p>
                                  <p className="text-sm">{c.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {user && (
                          <div className="p-4 pt-0 flex gap-2">
                            <Input
                              placeholder="Escribe un comentario..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                              className="text-sm"
                            />
                            <Button size="icon" onClick={() => handleComment(post.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
