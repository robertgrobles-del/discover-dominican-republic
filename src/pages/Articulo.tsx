import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import {
  User, Calendar, Clock, Bookmark, Share2, ThumbsUp,
  ChevronLeft, Tag, Send, Mail
} from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  author_image: string | null;
  published_at: string | null;
  created_at: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string | null;
  image_url: string | null;
  category: string | null;
  excerpt: string | null;
}

export default function Articulo() {
  const { slug: id } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);

  // Comments & Subscription states
  const [comments, setComments] = useState([
    { id: 1, author: "Manuel Gómez", content: "¡Excelente artículo! Muy detallado y útil para planificar mi viaje. Me encantaron las recomendaciones gastronómicas.", date: "Hace 2 días" },
    { id: 2, author: "Sofia Martinez", content: "República Dominicana es verdaderamente increíble. Fui el mes pasado y seguí algunos de estos consejos, recomendados 100%.", date: "Hace 1 día" }
  ]);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // AMP HTML Link Relation Injection
  useEffect(() => {
    if (!article || !id) return;
    let ampLink = document.querySelector('link[rel="amphtml"]') as HTMLLinkElement;
    if (!ampLink) {
      ampLink = document.createElement("link");
      ampLink.setAttribute("rel", "amphtml");
      document.head.appendChild(ampLink);
    }
    ampLink.setAttribute("href", `${window.location.origin}/amp/articulo/${id}`);
    return () => {
      ampLink?.remove();
    };
  }, [article, id]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setIsSubscribing(true);
    setTimeout(() => {
      toast.success(`¡Te has suscrito con éxito a la categoría ${article?.category}! Recibirás notificaciones por email.`);
      setSubscribeEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor || !newCommentText) {
      toast.error("Por favor completa todos los campos del comentario.");
      return;
    }
    const commentObj = {
      id: Date.now(),
      author: newCommentAuthor,
      content: newCommentText,
      date: "Ahora mismo"
    };
    setComments(prev => [...prev, commentObj]);
    setNewCommentAuthor("");
    setNewCommentText("");
    toast.success("¡Comentario publicado con éxito!");
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(Math.min((scrolled / height) * 100, 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      setLoading(true);

      // Try by slug first, then by id
      let query = supabase.from("articles").select("*").eq("is_published", true);
      const { data: bySlug } = await query.eq("slug", id).maybeSingle();

      let art = bySlug as Article | null;
      if (!art) {
        const { data: byId } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .eq("is_published", true)
          .maybeSingle();
        art = byId as Article | null;
      }

      setArticle(art);

      // Fetch related articles
      if (art) {
        const { data: relatedData } = await supabase
          .from("articles")
          .select("id, title, slug, image_url, category, excerpt")
          .eq("is_published", true)
          .neq("id", art.id)
          .limit(3);
        setRelated((relatedData as RelatedArticle[]) || []);
      }

      setLoading(false);
    };
    fetchArticle();
  }, [id]);

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4 max-w-4xl">
          <Skeleton className="aspect-[21/9] rounded-2xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
          <p className="text-muted-foreground mb-6">Este artículo no está disponible o ha sido removido.</p>
          <Link to="/blog"><Button>Volver al Blog</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={article.title} description={article.excerpt || ""} image={article.image_url || undefined} />
      <Header />

      {/* Reading Progress */}
      <div className="fixed top-16 left-0 right-0 z-40 h-1">
        <Progress
          value={readProgress}
          className="h-1 rounded-none"
          aria-label="Progreso de lectura"
        />
      </div>

      {/* Hero */}
      {article.image_url && (
        <section className="pt-20">
          <div className="aspect-[21/9] max-h-[500px] relative overflow-hidden">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        </section>
      )}

      <main className={`container mx-auto px-4 max-w-4xl ${article.image_url ? "-mt-24 relative" : "pt-24"}`}>
        <div className="mb-6">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ChevronLeft className="h-4 w-4" /> Volver al Blog
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {article.category && <Badge className="mb-3">{article.category}</Badge>}
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {article.author_name || "Redacción"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(article.published_at || article.created_at)}
            </span>
          </div>
        </motion.div>

        {/* Content */}
        <article className="prose prose-invert max-w-none mb-12">
          {article.content ? (
            <ReactMarkdown>{article.content}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">{article.excerpt}</p>
          )}
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-secondary text-sm rounded-full text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Subscription Box */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-card to-primary/5">
          <div className="space-y-1 md:max-w-md">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              ¿Te gusta este contenido?
            </h3>
            <p className="text-xs text-muted-foreground">
              Suscríbete para recibir alertas instantáneas cuando publiquemos nuevos artículos de la categoría <strong className="text-primary font-bold">{article.category || "Cultura"}</strong>.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto min-w-[280px]">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              required
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <Button type="submit" disabled={isSubscribing} className="gap-1 text-xs px-4">
              {isSubscribing ? "..." : "Suscribirse"}
            </Button>
          </form>
        </section>

        {/* Comments Section */}
        <section className="border-t border-border pt-10 mb-12 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Comentarios ({comments.length})</h2>
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                      {comment.author[0]}
                    </div>
                    {comment.author}
                  </span>
                  <span className="text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="p-6 rounded-xl border border-border bg-card/60 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Escribe un comentario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Comentario</label>
              <textarea
                rows={3}
                placeholder="¿Qué opinas sobre este artículo?..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs resize-none"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="gap-2 text-xs">
                <Send className="h-3.5 w-3.5" />
                Publicar Comentario
              </Button>
            </div>
          </form>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border pt-12 mb-12">
            <h2 className="text-2xl font-bold mb-8">También te puede interesar</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} to={`/articulo/${r.slug || r.id}`} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <img
                      src={r.image_url || "/placeholder.svg"}
                      alt={r.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {r.category && <Badge variant="secondary" className="text-xs mb-1">{r.category}</Badge>}
                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">{r.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
