import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Search, Clock, ChevronRight, Landmark, Calendar, 
  User, Award, Sparkles, Compass, ArrowRight, Quote, Library
} from "lucide-react";
import { historyArticles, HistoryArticle } from "@/data/historyArticles";
import { PanoramaAd } from "@/components/promo";
import historyHeroImg from "@/assets/history.jpg";

const eras = [
  { id: "all", label: "Todas las Épocas" },
  { id: "Prehispánica", label: "Época Taína / Prehispánica" },
  { id: "Colonial", label: "Época Colonial (1492 - 1821)" },
  { id: "Independencia", label: "Independencias (1821 - 1844)" },
  { id: "Restauración", label: "Gesta Restauradora (1863 - 1865)" },
  { id: "Siglo XX", label: "Siglo XX & Contemporánea" },
];

const categories = [
  { id: "all", label: "Todos los Temas" },
  { id: "biografia", label: "Biografías de Próceres" },
  { id: "evento", label: "Hechos & Acontecimientos" },
  { id: "batalla", label: "Batallas Históricas" },
];

export default function HistoriaIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredArticles = useMemo(() => {
    return historyArticles.filter((article) => {
      const matchQuery = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchEra = selectedEra === "all" || article.era === selectedEra;
      const matchCat = selectedCategory === "all" || article.category === selectedCategory;
      return matchQuery && matchEra && matchCat;
    });
  }, [searchQuery, selectedEra, selectedCategory]);

  return (
    <PageTransition>
      <SEOHead
        title="Historia de la República Dominicana - Biografías, Hechos y Próceres"
        description="Explora la historia completa de la República Dominicana: la biografía de Juan Pablo Duarte, la Independencia Efímera, la Restauración y los monumentos patrimoniales."
        keywords="historia dominicana, juan pablo duarte biografia, independencia efimera, guerra restauracion, historia de la republica dominicana"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative min-h-[42vh] flex items-center overflow-hidden border-b border-border/60">
            <div className="absolute inset-0">
              <img 
                src={historyHeroImg} 
                alt="Historia de la República Dominicana" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-14">
              <div className="max-w-3xl">
                <Badge className="mb-3 bg-amber-500/20 text-amber-500 border-amber-500/30 backdrop-blur-md">
                  <Library className="h-3.5 w-3.5 mr-1.5" /> Archivo Histórico y Cultural Oficial
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
                  Historia de la <span className="text-primary">República Dominicana</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Descubre los acontecimientos, próceres, batallas y momentos cumbres que forjaron la identidad y soberanía de la nación dominicana. Conecta cada suceso histórico con los monumentos y sitios patrimoniales del país.
                </p>
              </div>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <section className="py-8 bg-card/40 border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar próceres (ej: Juan Pablo Duarte), hechos (ej: Independencia Efímera)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-xs md:text-sm rounded-2xl bg-background"
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {categories.map((c) => (
                    <Button
                      key={c.id}
                      size="sm"
                      variant={selectedCategory === c.id ? "default" : "outline"}
                      className="rounded-xl text-xs h-9"
                      onClick={() => setSelectedCategory(c.id)}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Eras pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="font-bold text-muted-foreground mr-1 shrink-0 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Época:
                </span>
                {eras.map((era) => (
                  <button
                    key={era.id}
                    onClick={() => setSelectedEra(era.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 font-medium ${
                      selectedEra === era.id
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {era.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Articles Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Publicaciones & Crónicas Históricas ({filteredArticles.length})
                  </h2>
                  <p className="text-xs text-muted-foreground">Relatos documentados y avalados por historiadores dominicanos</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">{filteredArticles.length} Artículos</Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/historia/${article.slug}`}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden rounded-3xl border border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between group-hover:-translate-y-1 duration-300">
                        <div>
                          {/* Image Cover */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                            <img 
                              src={article.heroImage} 
                              alt={article.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            <Badge className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 text-[10px] font-bold border-none capitalize">
                              {article.category}
                            </Badge>

                            <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                              <span className="text-xs font-mono font-bold bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-lg">
                                {article.period}
                              </span>
                              <span className="text-[11px] text-white/90 font-medium">
                                {article.readTime} de lectura
                              </span>
                            </div>
                          </div>

                          <CardHeader className="p-5 pb-2">
                            <Badge variant="outline" className="w-fit text-[10px] text-primary border-primary/30 mb-1">
                              Época de {article.era}
                            </Badge>
                            <CardTitle className="text-lg font-display font-bold group-hover:text-primary transition-colors line-clamp-1">
                              {article.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                              {article.subtitle}
                            </p>
                          </CardHeader>

                          <CardContent className="p-5 pt-0 space-y-3 text-xs text-muted-foreground">
                            <p className="line-clamp-3 leading-relaxed">
                              {article.summary}
                            </p>
                          </CardContent>
                        </div>

                        <div className="p-5 pt-0 border-t border-border/60 mt-2 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                          <span>Leer crónica completa</span>
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-foreground">No encontramos crónicas históricas con esos filtros</p>
                    <p className="text-xs mt-1">Prueba seleccionando "Todas las Épocas" o una palabra clave distinta.</p>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Bottom Panorama Ad */}
          <div className="container mx-auto px-4 max-w-6xl pb-16">
            <PanoramaAd />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
