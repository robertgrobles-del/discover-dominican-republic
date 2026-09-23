import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Clock, Calendar, ArrowLeft, Share2, Quote, Landmark, 
  MapPin, CheckCircle2, ChevronRight, User, ShieldCheck, Sparkles 
} from "lucide-react";
import { getHistoryArticleBySlug, historyArticles } from "@/data/historyArticles";
import { PanoramaAd } from "@/components/promo";
import { toast } from "sonner";

export default function HistoriaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = getHistoryArticleBySlug(slug || "");

  if (!article) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center py-20 px-4 text-center">
            <div className="max-w-md space-y-4">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto opacity-40" />
              <h1 className="font-display text-2xl font-bold text-foreground">Artículo Histórico No Encontrado</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No pudimos encontrar la publicación solicitada. Puede que la crónica o biografía haya sido reubicada.
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/historia">Volver al Archivo Histórico</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${article.title} - Historia Dominicana | Descubre RD`}
        description={article.summary}
        keywords={`${article.title}, ${article.subtitle}, historia dominicana, proceres dominicanos, ${article.era}`}
        image={article.heroImage}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.summary,
          image: article.heroImage,
          author: {
            "@type": "Organization",
            name: article.author.name
          },
          publisher: {
            "@type": "Organization",
            name: "Descubre República Dominicana",
            url: "https://descubrerd.com"
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://descubrerd.com/historia/${article.slug}`
          }
        }}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="border-b border-border/40 bg-muted/20">
            <div className="container mx-auto px-4 max-w-5xl py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground flex-wrap">
                <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to="/historia" className="hover:text-primary transition-colors">Historia Dominicana</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">{article.title}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 h-8"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: article.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Enlace de la crónica copiado al portapapeles");
                  }
                }}
              >
                <Share2 className="h-3.5 w-3.5" /> Compartir
              </Button>
            </div>
          </div>

          {/* Article Hero Banner */}
          <section className="relative min-h-[45vh] flex items-end overflow-hidden border-b border-border">
            <div className="absolute inset-0">
              <img 
                src={article.heroImage} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10 py-12">
              <div className="max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-500 text-slate-950 font-bold capitalize">
                    {article.category}
                  </Badge>
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-foreground text-xs font-semibold">
                    Época: {article.era} ({article.period})
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-muted">
                    <Clock className="h-3 w-3 mr-1" /> {article.readTime}
                  </Badge>
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight">
                  {article.title}
                </h1>
                <p className="text-base md:text-xl text-primary font-medium">
                  {article.subtitle}
                </p>

                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Publicado por: <strong className="text-foreground">{article.author.name}</strong> • {article.author.role}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Article Content & Sidebar */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="grid lg:grid-cols-12 gap-10">
                
                {/* Body Column (Col 8) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Executive Summary Lead Box */}
                  <div className="bg-card/70 backdrop-blur-md p-6 rounded-3xl border border-primary/20 shadow-sm leading-relaxed text-sm md:text-base text-foreground font-medium">
                    {article.summary}
                  </div>

                  {/* Historical Quote Callout */}
                  {article.quote && (
                    <div className="relative p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-card to-background rounded-3xl border-l-4 border-amber-500 italic shadow-xs">
                      <Quote className="h-8 w-8 text-amber-500/30 absolute top-4 right-4" />
                      <p className="text-base md:text-lg text-foreground font-serif leading-relaxed mb-3">
                        "{article.quote.text}"
                      </p>
                      <cite className="text-xs font-sans font-bold text-amber-600 dark:text-amber-400 not-italic block">
                        — {article.quote.author}
                      </cite>
                    </div>
                  )}

                  {/* Body Content Sections */}
                  <div className="space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {article.contentSections.map((sec, idx) => (
                      <div key={idx} className="space-y-3">
                        {sec.heading && (
                          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight pt-2 border-b border-border/40 pb-2">
                            {sec.heading}
                          </h2>
                        )}
                        <p>{sec.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Module */}
                  {article.timeline && article.timeline.length > 0 && (
                    <div className="space-y-6 pt-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          Hitos Cronológicos
                        </h2>
                      </div>

                      <div className="space-y-4 border-l-2 border-primary/30 ml-3 pl-6">
                        {article.timeline.map((item, idx) => (
                          <div key={idx} className="relative group">
                            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-primary rounded-full ring-4 ring-background" />
                            <Badge variant="outline" className="text-xs font-mono font-bold text-primary mb-1">
                              {item.yearOrDate}
                            </Badge>
                            <h4 className="font-display text-base font-bold text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Return Back Button */}
                  <div className="pt-6 border-t border-border">
                    <Button asChild variant="outline" className="rounded-xl gap-2 text-xs">
                      <Link to="/historia">
                        <ArrowLeft className="h-4 w-4" /> Volver a todas las publicaciones
                      </Link>
                    </Button>
                  </div>

                </div>

                {/* Sidebar (Col 4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Related Monuments / Heritage integration */}
                  {article.associatedMonumentSlugs && (
                    <Card className="rounded-3xl border-border bg-card/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-primary" />
                          Sitios Históricos Vinculados
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <p className="text-muted-foreground">
                          Puedes visitar los lugares emblemáticos donde ocurrieron estos hechos históricos:
                        </p>
                        <Button asChild variant="secondary" className="w-full text-xs rounded-xl justify-between">
                          <Link to="/patrimonio">
                            <span>Ver en Patrimonio Cultural</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Related Articles */}
                  {article.relatedItems && article.relatedItems.length > 0 && (
                    <Card className="rounded-3xl border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Crónicas Relacionadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {article.relatedItems.map((item, idx) => (
                          <Link
                            key={idx}
                            to={`/historia/${item.slug}`}
                            className="block p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20 group"
                          >
                            <span className="text-[10px] uppercase font-bold text-primary block mb-0.5">
                              {item.type}
                            </span>
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                              {item.title}
                            </span>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Fact Checking / Academic Seal */}
                  <div className="p-4 bg-muted/30 rounded-3xl border border-border text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Rigor Académico
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Todas las fuentes han sido recopiladas del Archivo General de la Nación (AGN) y las actas constitutivas de la República Dominicana.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* Bottom Panorama Ad */}
          <div className="container mx-auto px-4 max-w-5xl pb-16">
            <PanoramaAd />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
