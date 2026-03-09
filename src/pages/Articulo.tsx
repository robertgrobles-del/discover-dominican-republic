import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import {
  User, Calendar, Clock, Bookmark, Share2, ThumbsUp,
  ChevronLeft, Tag
} from "lucide-react";

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
      <div className="fixed top-16 left-0 right-0 h-1 bg-border z-40">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${readProgress}%` }} />
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
          <div className="flex flex-wrap gap-2 mb-12">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-secondary text-sm rounded-full text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

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
