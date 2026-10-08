import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/SEOHead";
import { PageTransition } from "@/components/PageTransition";
import {
  User, Calendar, Clock, Bookmark, Share2, ThumbsUp,
  ChevronLeft, Tag, Send, Mail, CheckCircle, Megaphone,
  PenTool, Compass, Newspaper, Building2, ExternalLink, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useEditorialArticle, useEditorialArticles, reactToEditorialArticle } from "@/lib/editorialApi";
import { fetchApi } from "@/lib/fastifyClient";
import { useAuth } from "@/hooks/useAuth";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { PanoramaAd, BannerAd, CompactInlineAd } from "@/components/promo";
import { SectionWithSideAds } from "@/components/SectionWithSideAds";
import { SocialShareBar } from "@/components/social/SocialShareBar";
import { ArticleTableOfContents } from "@/components/editorial/ArticleTableOfContents";
import { ArticleFeedbackWidget } from "@/components/editorial/ArticleFeedbackWidget";
import { SponsoredArticleCard } from "@/components/editorial/SponsoredArticleCard";
import { SelloVerificadoBadge } from "@/components/ui/SelloVerificadoBadge";

interface ArticleReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  author: string;
  created_at: string;
}

export default function Articulo() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError, refetch } = useEditorialArticle(slug);
  const { data: allArticles = [] } = useEditorialArticles();
  const { user } = useAuth();
  const [readProgress, setReadProgress] = useState(0);

  // Comments states
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Reactions & bookmark states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Sync likes and bookmarks from post & localStorage
  useEffect(() => {
    if (!post?.id) return;
    const initialLikes = post.reactions_count?.likes ?? 0;
    const likedLocally = localStorage.getItem(`art_liked_${post.id}`) === "true";
    setLikeCount(likedLocally ? Math.max(initialLikes, 1) : initialLikes);
    setHasLiked(likedLocally);
    setIsBookmarked(localStorage.getItem(`art_fav_${post.id}`) === "true");
  }, [post?.id, post?.reactions_count?.likes]);

  // Load real reviews from backend
  const { data: reviews = [], refetch: refetchReviews } = useQuery<ArticleReviewItem[]>({
    queryKey: ["article-reviews", post?.slug],
    queryFn: async () => {
      if (!post?.slug) return [];
      try {
        const res = await fetchApi<{ data: ArticleReviewItem[] }>(`/articles/${encodeURIComponent(post.slug)}/reviews`);
        return Array.isArray(res?.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(post?.slug),
    staleTime: 60 * 1000,
  });

  // Calculate read progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (!post) return;
    const nextState = !hasLiked;
    setHasLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      localStorage.setItem(`art_liked_${post.id}`, "true");
      toast.success("¡Gracias por valorar este artículo!");
    } else {
      localStorage.removeItem(`art_liked_${post.id}`);
    }

    // Persist reaction to backend
    try {
      await reactToEditorialArticle(post.slug, "likes", nextState ? 1 : -1);
    } catch {
      // Non-blocking for offline / degraded
    }

    // If authenticated, sync with user favorites
    if (user && HAS_BACKEND_SESSION) {
      try {
        if (nextState) {
          await fetchApi(`/me/favorites/article/${post.id}`, {
            method: "PUT",
            body: JSON.stringify({ name: post.title, image: post.imageUrl || "" }),
          });
        }
      } catch {
        // Silently tolerate
      }
    }
  };

  const handleBookmarkToggle = async () => {
    if (!post) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    if (nextState) {
      localStorage.setItem(`art_fav_${post.id}`, "true");
      toast.success("Guardado en tus lecturas");
    } else {
      localStorage.removeItem(`art_fav_${post.id}`);
      toast.success("Eliminado de guardados");
    }

    if (user && HAS_BACKEND_SESSION) {
      try {
        if (nextState) {
          await fetchApi(`/me/favorites/article/${post.id}`, {
            method: "PUT",
            body: JSON.stringify({ name: post.title, image: post.imageUrl || "" }),
          });
        } else {
          await fetchApi(`/me/favorites/article/${post.id}`, { method: "DELETE" });
        }
      } catch {
        // Silently tolerate
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error("Por favor completa tu comentario.");
      return;
    }
    if (newCommentText.trim().length < 10) {
      toast.error("El comentario debe tener al menos 10 caracteres.");
      return;
    }

    if (HAS_BACKEND_SESSION && !user) {
      toast.error("Inicia sesión para publicar comentarios en la comunidad.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      if (HAS_BACKEND_SESSION && post) {
        await fetchApi("/reviews", {
          method: "POST",
          body: JSON.stringify({
            entity_type: "article",
            entity_id: post.id,
            rating: 5,
            comment: newCommentText.trim(),
          }),
        });
        toast.success("¡Comentario enviado para moderación comunitaria!");
        setNewCommentText("");
        refetchReviews();
      } else {
        toast.success("¡Comentario recibido! Se publicará tras revisión.");
        setNewCommentText("");
      }
    } catch (err: any) {
      toast.error("No se pudo publicar el comentario", { description: err.message });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center" aria-busy="true"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (isError) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center py-20 px-4 text-center">
            <div className="max-w-md space-y-4">
              <h1 className="font-display text-2xl font-bold text-foreground">No pudimos cargar el artículo</h1>
              <p className="text-sm text-muted-foreground">Revisa tu conexión e inténtalo otra vez.</p>
              <Button onClick={() => refetch()} className="rounded-xl">Reintentar</Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!post) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center py-20 px-4 text-center">
            <div className="max-w-md space-y-4">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto opacity-40" />
              <h1 className="font-display text-2xl font-bold text-foreground">Artículo No Encontrado</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                La publicación que buscas no existe o fue movida de categoría.
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/revista">Volver a la revista</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const relatedPosts = allArticles
    .filter(p => p.slug !== post.slug && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title={`${post.title} | Descubre RD Editorial`}
          description={post.excerpt}
          image={post.imageUrl}
          keywords={post.tags.join(", ")}
          type="article"
        />

        {/* Scroll Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        <Header />

        <main className="flex-1 py-10">
          <SectionWithSideAds 
            showAds 
            leftAdSize="skyscraper" 
            rightAdSize="skyscraper" 
            className="container mx-auto max-w-4xl"
          >
            <div className="px-4">
              {/* Breadcrumb & Category */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <Link
                to="/revista"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Volver a Editorial & Revista
              </Link>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {post.categoryLabel}
              </Badge>
            </div>

            {/* Article Heading */}
            <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-6">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border mb-8">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-border shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{post.author.name}</span>
                    {post.author.verified && (
                      <CheckCircle className="h-3.5 w-3.5 text-primary fill-primary/20" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{post.author.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {post.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {post.readTime}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Enlace copiado al portapapeles");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-sm border border-border">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* PR Details Box if applicable */}
            {post.category === "prensa" && post.pressReleaseDetails && (
              <div className="mb-8 p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                  <Megaphone className="h-4 w-4" /> COMUNICADO DE PRENSA OFICIAL
                </div>
                <p className="text-muted-foreground">
                  Emitido por: <strong>{post.pressReleaseDetails.partnerName}</strong> | Contacto de medios: {post.pressReleaseDetails.contactEmail}
                </p>
              </div>
            )}

            {/* Guest Author Box if applicable */}
            {post.category === "invitados" && (
              <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <PenTool className="h-4 w-4" /> COLUMNA DE AUTOR INVITADO
                </div>
                <p className="text-muted-foreground">
                  Las opiniones expresadas en este artículo son de exclusiva responsabilidad del autor y enriquecen la diversidad de miradas sobre nuestro país.
                </p>
              </div>
            )}

            {/* Floating Share Bar (Desktop) */}
            <SocialShareBar
              title={post.title}
              description={post.excerpt}
              variant="floating"
            />

            {/* Table of Contents */}
            <ArticleTableOfContents
              items={post.sections?.map(s => ({ id: s.id, title: s.title })) || [
                { id: "introduccion", title: "1. Introducción y Contexto" },
                { id: "destacados", title: "2. Puntos Destacados y Experiencias" },
                { id: "consejos-viajero", title: "3. Consejos Prácticos y Recomendaciones" },
                { id: "reserva-directa", title: "4. Dónde Hospedarse y Reservas Directas" },
              ]}
            />

            {/* Article Content Body with In-Content Banner Ad */}
            <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed space-y-6 text-base font-normal">
              <aside aria-labelledby="article-quick-summary" className="not-prose mb-8 rounded-card border border-primary/20 bg-surface-editorial p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                    <Compass className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 id="article-quick-summary" className="font-display text-base font-bold text-foreground">Lo esencial</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    {post.tags.length > 0 && (
                      <ul aria-label="Temas clave del artículo" className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <li key={tag}>
                            <Badge variant="secondary" className="text-xs">{tag}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </aside>

              <section id="introduccion" className="scroll-mt-24">
                <p>{post.content}</p>
              </section>

              {/* In-Content Banner Ad */}
              <div className="my-8 not-prose">
                <div className="bg-muted/30 p-2 sm:p-4 rounded-2xl border border-border/70 shadow-sm flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 self-start pl-2">
                    Contenido Patrocinado
                  </span>
                  <div className="hidden md:block w-full">
                    <BannerAd 
                      size="billboard" 
                      placement="inline" 
                      showDemo 
                      industry={post.category === "experiencias" ? "hotels" : post.category === "prensa" ? "airlines" : "alcohol"}
                      className="w-full !max-w-none"
                    />
                  </div>
                  <div className="block md:hidden w-full">
                    <BannerAd 
                      size="mobile-medium" 
                      placement="inline" 
                      showDemo 
                      industry={post.category === "experiencias" ? "hotels" : post.category === "prensa" ? "airlines" : "alcohol"}
                      className="w-full !max-w-none"
                    />
                  </div>
                </div>
              </div>

              <section id="destacados" className="scroll-mt-24 space-y-4">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">Puntos Destacados & Recomendaciones</h3>
                <p>
                  Para aprovechar al máximo esta ruta, se aconseja iniciar temprano en la mañana, llevar protección solar biodegradable y coordinar traslados con operadores locales certificados con el <strong>Sello Verificado MITUR</strong>.
                </p>
              </section>

              {/* Native Sponsored Article Card / Publirreportaje Block */}
              <section id="reserva-directa" className="scroll-mt-24 not-prose">
                <SponsoredArticleCard
                  sponsorName={post.sponsor?.name || "Hoteles & Eco-Lodges de Quisqueya"}
                  sponsorCategory={post.sponsor?.category || "Alojamiento Aliado Recomendado"}
                  sponsorDescription={post.sponsor?.description || "Establecimiento con licencia oficial de turismo que garantiza tarifas directas sin comisiones y atenciones de bienvenida exclusivas."}
                  sponsorUrl={post.sponsor?.url}
                  bookingUrl={post.sponsor?.bookingUrl || "/reservas"}
                  offerText={post.sponsor?.offerText || "Reserva Directa: Hasta 15% de ahorro vs OTAs"}
                />
              </section>

              <section id="consejos-viajero" className="scroll-mt-24 space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">Consejos Prácticos para el Viajero</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Moneda:</strong> Se recomienda llevar pesos dominicanos (DOP) para compras menores en artesanías y peajes locales.</li>
                  <li><strong>Conectividad:</strong> Las zonas costeras principales disponen de excelente cobertura 4G/5G con eSIM Turista.</li>
                  <li><strong>Respeto Ambiental:</strong> No retirar caracoles, estrellas de mar ni flora autóctona protegida.</li>
                </ul>
              </section>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-border">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-lg font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Inline Social Share Bar */}
            <div className="mt-8">
              <SocialShareBar
                title={post.title}
                description={post.excerpt}
                variant="inline"
              />
            </div>

            {/* Article Feedback & Utility Widget */}
            <ArticleFeedbackWidget
              articleId={post.id}
              articleTitle={post.title}
            />

            {/* Interactions Bar */}
            <div className="flex items-center justify-between mt-8 p-4 rounded-2xl bg-card border border-border">
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="gap-2 rounded-xl text-xs"
              >
                <ThumbsUp className={`h-4 w-4 ${hasLiked ? "fill-primary-foreground" : ""}`} />
                <span>{likeCount} Me gusta</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                  <span>{isBookmarked ? "Guardado" : "Guardar"}</span>
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <section className="mt-12 pt-8 border-t border-border">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                Comentarios y Opiniones ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="p-6 rounded-2xl bg-card/60 border border-border text-center text-xs text-muted-foreground mb-8">
                  Sé el primero en compartir tu opinión o experiencia sobre este artículo.
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-card border border-border space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{rev.author}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {new Date(rev.created_at).toLocaleDateString("es-DO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Deja tu opinión</h4>
                {!user && HAS_BACKEND_SESSION && (
                  <p className="text-xs text-muted-foreground">
                    Para que tu opinión quede registrada en la comunidad oficial,{" "}
                    <Link to="/auth/login" className="text-primary underline font-medium">inicia sesión aquí</Link>.
                  </p>
                )}
                <textarea
                  placeholder="Escribe tu comentario respetuoso sobre el artículo (mínimo 10 caracteres)..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none resize-none"
                />
                <Button type="submit" size="sm" disabled={isSubmittingComment} className="rounded-xl text-xs font-bold gap-1.5">
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Publicar Comentario
                    </>
                  )}
                </Button>
              </form>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-14 pt-8 border-t border-border">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  Artículos Relacionados
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      to={rel.href}
                      className="group surface-editorial rounded-card border border-border overflow-hidden hover:border-primary/50 transition-all flex flex-col"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={rel.image ?? undefined}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {rel.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground">{rel.readMinutes ? `${rel.readMinutes} min de lectura` : ""}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Panorama Ad */}
            <div className="mt-12">
              <PanoramaAd />
            </div>
            </div>
          </SectionWithSideAds>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
