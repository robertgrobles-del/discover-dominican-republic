import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Instagram,
  Twitter,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Camera,
  Play,
  Search,
  TrendingUp,
  Trophy,
  Plus,
  X,
  Send,
  Zap,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const filters = ["Todos", "Instagram", "TikTok", "Punta Cana", "Samaná", "Mejores Fotos"];

const posts = [
  {
    id: 1,
    platform: "instagram",
    user: "@island_girl_22",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=800&fit=crop",
    caption: "Los colores de Punta Cana son irreales 🌴 #LaIslaEnRedes",
    likes: 2400,
    comments: 89,
    location: "Punta Cana"
  },
  {
    id: 2,
    platform: "instagram",
    user: "@foodie_travels",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=400&fit=crop",
    caption: "No hay nada como un desayuno dominicano auténtico. El Mangú es vida. 🍳🥑 #Gastronomía #RD",
    likes: 1256,
    comments: 142,
    location: "Santo Domingo"
  },
  {
    id: 3,
    platform: "instagram",
    user: "@sunset_chaser",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=600&fit=crop",
    caption: "Atardeceres mágicos en Samaná 🌅 #Paradise",
    likes: 3890,
    comments: 234,
    location: "Samaná"
  },
  {
    id: 4,
    platform: "tiktok",
    user: "@adventure_mike",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=800&fit=crop",
    caption: "Salto El Limón 💦🌴 La mejor experiencia! #RepúblicaDominicana",
    likes: 12500,
    comments: 456,
    location: "Samaná",
    isVideo: true
  },
  {
    id: 5,
    platform: "instagram",
    user: "@coastory_buff",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=600&fit=crop",
    caption: "Recorriendo la Zona Colonial 🏛️ #SantoDomingo",
    likes: 890,
    comments: 67,
    location: "Santo Domingo"
  },
  {
    id: 6,
    platform: "twitter",
    user: "@caribe_fan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
    caption: "Acabo de reservar mis vuelos para Puerto Plata! ✈️ ¿Alguna recomendación de restaurantes con vista al mar? #RDReady #LaIslaEnRedes",
    likes: 234,
    comments: 45,
    location: "Puerto Plata",
    isText: true
  }
];

const topSpots = [
  { name: "Montaña Redonda", location: "Miches", description: "El famoso columpio sobre las nubes. Vista panorámica 360.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop" },
  { name: "Bahía de las Águilas", location: "Pedernales", description: "Aguas cristalinas y arena blanca virgen.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop" },
  { name: "Calle de las Damas", location: "Santo Domingo", description: "La calle más antigua de América. Arquitectura colonial.", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop" },
  { name: "Hoyo Azul", location: "Punta Cana", description: "Cenote de aguas turquesas profundas escondido en un acantilado.", image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100&h=100&fit=crop" },
];

const weeklyWinners = [
  { title: "Samaná Inolvidable", author: "@traveler_jane", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=500&fit=crop", isWinner: true },
  { title: "Colores del Caribe", author: "@photo_master", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=300&h=300&fit=crop" },
  { title: "Amanecer Colonial", author: "@dawn_hunter", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&h=400&fit=crop" },
  { title: "Palmeras al Viento", author: "@island_vibes", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop" },
];

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
    const text = (commentText[postId] || "").trim();

    if (!user) {
      toast.error("Inicia sesión para comentar y ganar puntos");
      return;
    }
    if (text.length < 3) {
      toast.error("El comentario debe tener al menos 3 caracteres");
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
        p_content: text
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

  const mockReels = [
    {
      id: "r1",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-caribbean-beach-with-palm-trees-1524-large.mp4",
      user: "@explorer_rd",
      desc: "¡Descubriendo una playa secreta en Las Terrenas! El agua está increíble 🌴☀️ #DescubreRD #LasTerrenas #Naturaleza",
      likes: "14.2k",
      comments: 540
    },
    {
      id: "r2",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-diving-in-a-clear-blue-sea-44026-large.mp4",
      user: "@submarino_dr",
      desc: "Haciendo buceo libre en las cristalinas aguas de Cayo Arena. ¡Vimos un banco de peces cirujano! 🐠🤿 #Buceo #CayoArena",
      likes: "9.8k",
      comments: 320
    },
    {
      id: "r3",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-driving-on-a-curved-road-surrounded-by-forest-34316-large.mp4",
      user: "@ruteros_rd",
      desc: "Cruzando la sinuosa carretera de montaña en Constanza. ¡El clima aquí arriba es un sueño! 🏔️🚗 #Constanza #Roadtrip #Frio",
      likes: "18.5k",
      comments: 710
    }
  ];

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
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="bg-primary/20 text-primary mb-4">
              <span className="animate-pulse mr-2">●</span> EN VIVO AHORA
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
              #LaIslaEnRedes
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Descubre la República Dominicana real a través de los lentes de miles 
              de viajeros. Únete a la conversación y comparte tu aventura.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="gap-2" onClick={() => setIsTikTokOpen(true)}>
                <Play className="h-4 w-4 fill-current" /> Ver TikTok Reels RD
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
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
                  {filters.map((filter) => (
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
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="break-inside-avoid mb-6"
                >
                  <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-xl transition-shadow">
                    {!post.isText && (
                      <div 
                        className={`relative ${post.isVideo ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (post.isVideo) {
                            setIsTikTokOpen(true);
                            setActiveReelIndex(0);
                            toast.info("Abriendo reproductor de Reels verticales");
                          }
                        }}
                      >
                        <img
                          src={post.image}
                          alt={post.caption}
                          className="w-full object-cover"
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
                        <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                          <Heart className="h-4 w-4" /> {(post.likes / 1000).toFixed(1)}k
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            commentedPosts.has(String(post.id))
                              ? "text-primary font-semibold"
                              : "hover:text-primary"
                          }`}
                          title="Comentar y ganar XP"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {post.comments + (commentedPosts.has(String(post.id)) ? 1 : 0)}
                          {commentedPosts.has(String(post.id)) && (
                            <CheckCircle2 className="h-3 w-3 text-primary ml-0.5" />
                          )}
                        </button>
                        <button
                          className="ml-auto hover:text-primary transition-colors"
                          title="Compartir publicación"
                          aria-label="Compartir publicación"
                          onClick={() => {
                            navigator.share?.({ url: window.location.href, title: post.caption }) ||
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Enlace copiado");
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Comment form */}
                      <AnimatePresence>
                        {openComments.has(post.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-border space-y-2">
                              {/* Daily limit indicator */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-amber-500" />
                                  +15 XP +5🪙 por comentar
                                </span>
                                <span className={`font-medium ${
                                  postsCommentedToday >= DAILY_LIMIT
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}>
                                  {postsCommentedToday}/{DAILY_LIMIT} hoy
                                </span>
                              </div>

                              {commentedPosts.has(String(post.id)) ? (
                                <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                                  Ya comentaste en este post ✓
                                </div>
                              ) : postsCommentedToday >= DAILY_LIMIT ? (
                                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 rounded-lg px-3 py-2">
                                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                  Límite diario alcanzado. Vuelve mañana.
                                </div>
                              ) : !user ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                  Inicia sesión para comentar y ganar puntos
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Textarea
                                    placeholder="Escribe tu comentario..."
                                    value={commentText[post.id] || ""}
                                    onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="text-sm resize-none min-h-[60px]"
                                    maxLength={500}
                                    onKeyDown={e => {
                                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                        handleComment(post.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    onClick={() => handleComment(post.id)}
                                    disabled={submitting === post.id || !commentText[post.id]?.trim()}
                                    className="self-end shrink-0"
                                  >
                                    {submitting === post.id ? (
                                      <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Cargar más
              </Button>
            </div>
          </div>
        </section>

        {/* Ruta de la Foto Perfecta */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Ruta de la Foto Perfecta
              </h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Los puntos más "Instagrammables" de la isla, seleccionados por la comunidad.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Top 5 Spots</h3>
                {topSpots.map((spot, index) => (
                  <div key={spot.name} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{spot.name}</p>
                      <p className="text-sm text-primary">{spot.location}</p>
                      <p className="text-xs text-muted-foreground">{spot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Mapa interactivo con ubicaciones</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge className="bg-primary/20 text-primary mb-2">HALL OF FAME</Badge>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Mejores Fotos de la Semana
              </h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {weeklyWinners.map((winner, index) => (
                <motion.div
                  key={winner.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                    index === 0 ? "md:row-span-2" : ""
                  }`}
                >
                  <img
                    src={winner.image}
                    alt={winner.title}
                    className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {winner.isWinner && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground gap-1">
                      <Trophy className="h-3 w-3" /> Ganador #1
                    </Badge>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-semibold text-white">{winner.title}</p>
                    <p className="text-sm text-white/70">por {winner.author}</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="bg-primary rounded-xl flex items-center justify-center aspect-square cursor-pointer hover:bg-primary/90 transition-colors">
                <div className="text-center text-primary-foreground p-4">
                  <ChevronRight className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Ver Galería Completa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TikTok Style Reels Viewer */}
        <AnimatePresence>
          {isTikTokOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[2000] flex items-center justify-center p-0 md:p-4"
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTikTokOpen(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/10 z-[2010]"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Reels frame */}
              <div className="relative w-full max-w-[450px] h-full md:h-[80vh] md:rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex flex-col justify-between shadow-2xl">
                {/* Active Video Player */}
                <div className="absolute inset-0 z-0">
                  <video
                    src={mockReels[activeReelIndex].videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                </div>

                {/* Vertical navigation arrows (Side of the screen) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 text-white items-center">
                  <button
                    onClick={() => setActiveReelIndex(prev => (prev - 1 + mockReels.length) % mockReels.length)}
                    className="p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => setActiveReelIndex(prev => (prev + 1) % mockReels.length)}
                    className="p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
                  >
                    ▼
                  </button>
                </div>

                {/* Top Label */}
                <div className="relative z-10 p-4 flex justify-between items-center text-white">
                  <Badge className="bg-red-500 text-white font-bold uppercase tracking-wider text-[10px]">
                    RD Reels
                  </Badge>
                  <span className="text-xs text-white/70 font-mono">
                    {activeReelIndex + 1} / {mockReels.length}
                  </span>
                </div>

                {/* Bottom Overlay (Creator info, tags, music) */}
                <div className="relative z-10 p-6 text-white space-y-3 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs">
                      {mockReels[activeReelIndex].user.charAt(1).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">{mockReels[activeReelIndex].user}</span>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none text-[9px]">
                      Creador Local
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-white/90 leading-relaxed">
                    {mockReels[activeReelIndex].desc}
                  </p>

                  <div className="flex gap-4 pt-2 text-xs border-t border-white/10 mt-1">
                    <button className="flex items-center gap-1.5 hover:text-red-400 transition" onClick={() => toast.success("¡Me gusta registrado!")}>
                      <Heart className="h-4 w-4" /> {mockReels[activeReelIndex].likes}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-blue-400 transition" onClick={() => toast.info("Comentarios desactivados en la simulación")}>
                      <MessageCircle className="h-4 w-4" /> {mockReels[activeReelIndex].comments}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-green-400 transition" onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("¡Enlace del reel copiado!");
                    }}>
                      <Share2 className="h-4 w-4" /> Compartir
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </PageTransition>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
