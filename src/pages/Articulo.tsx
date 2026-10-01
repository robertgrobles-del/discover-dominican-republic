import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  PenTool, Compass, Newspaper, Building2, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { getBlogPostBySlug, blogPosts } from "@/data/blogData";
import { PanoramaAd, BannerAd, CompactInlineAd } from "@/components/promo";
import { SectionWithSideAds } from "@/components/SectionWithSideAds";

export default function Articulo() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(slug || "");
  const [readProgress, setReadProgress] = useState(0);

  // Comments states
  const [comments, setComments] = useState([
    { id: 1, author: "Manuel Gómez", content: "¡Excelente publicación! Muy detallada y oportuna para planificar nuestras vacaciones en familia.", date: "Hace 2 días" },
    { id: 2, author: "Sofia Martínez", content: "Gran cobertura. La información sobre la sostenibilidad y accesos es sumamente valiosa.", date: "Hace 1 día" }
  ]);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);

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

  const handleLike = () => {
    if (!hasLiked) {
      setLikeCount(prev => prev + 1);
      setHasLiked(true);
      toast.success("¡Gracias por valorar este artículo!");
    } else {
      setLikeCount(prev => prev - 1);
      setHasLiked(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor || !newCommentText) {
      toast.error("Por favor completa tu nombre y comentario.");
      return;
    }
    const newComment = {
      id: Date.now(),
      author: newCommentAuthor,
      content: newCommentText,
      date: "Ahora mismo"
    };
    setComments(prev => [...prev, newComment]);
    setNewCommentAuthor("");
    setNewCommentText("");
    toast.success("¡Comentario enviado para moderación comunitaria!");
  };

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
                <Link to="/blog">Volver al Blog Editorial</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
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
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Volver a Editorial
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

              <p>
                {post.content}
              </p>
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
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    toast.success(isBookmarked ? "Eliminado de guardados" : "Guardado en tus lecturas");
                  }}
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
                Comentarios ({comments.length})
              </h3>

              <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-card border border-border space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{comment.author}</span>
                      <span className="text-muted-foreground text-[10px]">{comment.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Deja tu opinión</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    required
                    className="rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Escribe tu comentario respetuoso sobre el artículo..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none resize-none"
                />
                <Button type="submit" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Publicar Comentario
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
                      to={`/articulo/${rel.slug}`}
                      className="group surface-editorial rounded-card border border-border overflow-hidden hover:border-primary/50 transition-all flex flex-col"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {rel.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground">{rel.readTime} de lectura</span>
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
