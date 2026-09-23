import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Calendar, User, Tag, Search, ChevronRight, Newspaper, 
  Megaphone, Compass, Sparkles, Building2, CheckCircle, 
  Send, PenTool, ArrowRight, ExternalLink, BookOpen, Flame,
  Share2, MessageSquare, CheckCircle2, ShieldCheck, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { blogPosts, BlogPost } from "@/data/blogData";
import { PanoramaAd } from "@/components/promo";
import { toast } from "sonner";

const mainTabs = [
  { id: "all", label: "Todo el Contenido", icon: Sparkles, count: blogPosts.length },
  { id: "experiencias", label: "Blog de Viajes & Rutas", icon: Compass, count: blogPosts.filter(b => b.category === "experiencias").length },
  { id: "noticias", label: "Noticias & Novedades", icon: Newspaper, count: blogPosts.filter(b => b.category === "noticias").length },
  { id: "prensa", label: "Notas de Prensa / Aliados (PR)", icon: Megaphone, count: blogPosts.filter(b => b.category === "prensa").length },
  { id: "invitados", label: "Autores Invitados", icon: PenTool, count: blogPosts.filter(b => b.category === "invitados").length },
];

export default function Blog() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Guest Author modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestBio, setGuestBio] = useState("");
  const [guestTopic, setGuestTopic] = useState("");
  const [guestDraftLink, setGuestDraftLink] = useState("");
  const [guestAcceptTerms, setGuestAcceptTerms] = useState(false);
  const [guestSubscribeNewsletter, setGuestSubscribeNewsletter] = useState(true);
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchCategory = activeTab === "all" || post.category === activeTab;
      const matchSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeTab, searchQuery]);

  const featuredPost = useMemo(() => {
    if (searchQuery) return null;
    if (activeTab === "all") {
      return blogPosts.find(p => p.isFeatured) || blogPosts[0];
    }
    return filteredPosts[0];
  }, [activeTab, searchQuery, filteredPosts]);

  const restPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter(p => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestTopic.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }
    if (!guestAcceptTerms) {
      toast.error("Debes aceptar las políticas editoriales y términos de autor invitado.");
      return;
    }

    setIsSubmittingGuest(true);
    setTimeout(() => {
      setIsSubmittingGuest(false);
      setIsGuestModalOpen(false);
      setGuestName("");
      setGuestEmail("");
      setGuestBio("");
      setGuestTopic("");
      setGuestDraftLink("");
      setGuestAcceptTerms(false);
      toast.success("¡Propuesta enviada con éxito al consejo editorial de Descubre RD! Te responderemos en 24-48 horas.");
    }, 1200);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "experiencias":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "noticias":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "prensa":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "invitados":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Revista & Blog Editorial Oficial | Descubre República Dominicana"
        description="Explora experiencias de viaje, crónicas de aventura, novedades turísticas, comunicados oficiales de prensa (PR) y artículos de autores invitados."
        keywords="blog republica dominicana, revista turismo rd, notas de prensa aliados, blog invitados turismo, guias de viaje caribe"
      />
      <Header />

      {/* Hero Header */}
      <section className="relative pt-20 pb-12 overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-background/95 to-background">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Centro Editorial & Revista Turística
            </Badge>
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 px-3 py-1 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" /> Edición 2026
            </Badge>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-4 leading-tight"
          >
            Voces, Crónicas y <br className="hidden sm:inline" />
            <span className="text-primary">Secretos de Quisqueya</span>
          </motion.h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Historias inmersivas de nuestras 32 provincias, notas de prensa de aliados del sector y la tribuna abierta para autores invitados y trotamundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por destino, autor, tema o comunicado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 text-xs sm:text-sm rounded-2xl bg-card border-border shadow-xs"
              />
            </div>

            <Button
              onClick={() => setIsGuestModalOpen(true)}
              className="w-full sm:w-auto shrink-0 h-12 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs gap-2 shadow-sm"
            >
              <PenTool className="h-4 w-4" />
              <span>Publicar como Invitado</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Navigation Tabs */}
      <section className="border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-16 z-30 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 max-w-6xl py-10 flex-1 space-y-10">
        {/* Banner for PR & Guest Authors */}
        {activeTab === "invitados" && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-left">
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                <PenTool className="h-3 w-3 mr-1" /> Convocatoria de Autores Invitados
              </Badge>
              <h3 className="font-display font-bold text-xl text-foreground">¿Eres escritor, bloguero o fotógrafo de viajes?</h3>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Comparte tus crónicas en nuestra sección editorial y conecta con más de 100,000 lectores y apasionados de República Dominicana.
              </p>
            </div>
            <Button
              onClick={() => setIsGuestModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold gap-2 shrink-0 h-10 px-5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> Enviar mi Propuesta
            </Button>
          </div>
        )}

        {activeTab === "prensa" && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-left">
              <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">
                <Megaphone className="h-3 w-3 mr-1" /> Sala de Prensa & Comunicados de Aliados
              </Badge>
              <h3 className="font-display font-bold text-xl text-foreground">Canal Oficial para Cadenas Hoteleras y Operadores Turísticos</h3>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Espacio verificado para anuncios de inversión, reconocimientos internacionales, eventos de sostenibilidad y aperturas hoteleras.
              </p>
            </div>
            <a href="mailto:prensa@descubrerd.com" className="shrink-0">
              <Button variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 rounded-xl text-xs font-bold h-10">
                Contacto de Prensa Oficial
              </Button>
            </a>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border max-w-md mx-auto p-8 shadow-sm">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="font-bold text-foreground text-lg">No encontramos publicaciones</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">Prueba ajustando los términos de búsqueda o cambiando la pestaña de categoría.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveTab("all"); }} className="rounded-xl">
              Ver todas las publicaciones
            </Button>
          </div>
        ) : (
          <>
            {/* Featured Post (Hero Card) */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Link to={`/articulo/${featuredPost.slug}`} className="group block">
                  <div className="grid lg:grid-cols-12 gap-6 bg-card rounded-3xl overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl">
                    <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden relative min-h-[300px]">
                      <img
                        src={featuredPost.imageUrl}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className={`absolute top-4 left-4 ${getCategoryBadgeClass(featuredPost.category)} backdrop-blur-md shadow-xs`}>
                        {featuredPost.categoryLabel}
                      </Badge>
                    </div>
                    <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{featuredPost.publishedAt}</span>
                          <span>•</span>
                          <span>{featuredPost.readTime} de lectura</span>
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight mb-3 leading-snug">
                          {featuredPost.title}
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={featuredPost.author.avatar}
                            alt={featuredPost.author.name}
                            className="w-9 h-9 rounded-full object-cover border border-border"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-foreground">{featuredPost.author.name}</span>
                              {featuredPost.author.verified && (
                                <CheckCircle className="h-3.5 w-3.5 text-primary fill-primary/20" />
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{featuredPost.author.role}</span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Leer artículo <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-3xl border border-border/80 overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col group shadow-xs hover:shadow-md"
                >
                  <Link to={`/articulo/${post.slug}`} className="flex flex-col h-full">
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className={`absolute top-3 left-3 text-[10px] ${getCategoryBadgeClass(post.category)} backdrop-blur-md`}>
                        {post.categoryLabel}
                      </Badge>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>{post.publishedAt}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className="font-display font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>

                      <div>
                        {post.tags && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-6 h-6 rounded-full object-cover border border-border"
                            />
                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[130px]">
                              {post.author.name}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </>
        )}

        {/* Guest Author CTA Banner */}
        <section className="mt-14 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card via-card to-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
              <PenTool className="h-3.5 w-3.5 mr-1" /> Escribe con Nosotros
            </Badge>
            <h3 className="font-display text-2xl font-bold text-foreground">¿Tienes una historia única sobre República Dominicana?</h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Postula tu crónica de viaje, reseña gastronómica o guía de aventura. Tu artículo será revisado por nuestro equipo y publicado en portada oficial.
            </p>
          </div>
          <Button
            onClick={() => setIsGuestModalOpen(true)}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl px-6 h-12 text-xs gap-2 shadow-md"
          >
            <Send className="h-4 w-4" />
            <span>Postular mi Propuesta</span>
          </Button>
        </section>

        {/* Bottom Panorama Ad */}
        <section className="mt-8">
          <PanoramaAd showDemo />
        </section>
      </main>

      {/* Guest Author Proposal Modal Dialog */}
      <Dialog open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg rounded-3xl p-6 overflow-hidden border-border bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <PenTool className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Postular Propuesta Editorial
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Programa de Autores Invitados • Descubre República Dominicana
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleGuestSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="guest-name" className="text-xs font-semibold">Nombre / Seudónimo *</Label>
                <Input
                  id="guest-name"
                  placeholder="Ej: Marcos Santos"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="rounded-xl text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guest-email" className="text-xs font-semibold">Correo Electrónico *</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="marcos@correo.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="rounded-xl text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="guest-topic" className="text-xs font-semibold">Título o Tema Propuesto *</Label>
              <Input
                id="guest-topic"
                placeholder="Ej: Los 5 Cenotes Ocultos de Los Haitises que Nadie Conoce"
                value={guestTopic}
                onChange={(e) => setGuestTopic(e.target.value)}
                className="rounded-xl text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="guest-bio" className="text-xs font-semibold">Breve Resumen o Mini Bio (Opcional)</Label>
              <Textarea
                id="guest-bio"
                placeholder="Cuéntanos brevemente de qué trata tu artículo y tu experiencia viajando por RD..."
                value={guestBio}
                onChange={(e) => setGuestBio(e.target.value)}
                className="rounded-xl text-xs min-h-[65px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="guest-link" className="text-xs font-semibold">Enlace al Borrador o Portafolio (Google Docs / Notion / Web)</Label>
              <Input
                id="guest-link"
                placeholder="https://docs.google.com/document/d/..."
                value={guestDraftLink}
                onChange={(e) => setGuestDraftLink(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <Checkbox
                id="guest-terms"
                checked={guestAcceptTerms}
                onCheckedChange={(c) => setGuestAcceptTerms(c as boolean)}
                className="mt-0.5"
                required
              />
              <Label htmlFor="guest-terms" className="text-[11px] text-muted-foreground leading-tight cursor-pointer">
                Acepto los <Link to="/terminos" target="_blank" className="text-primary underline font-medium">Términos Editoriales</Link> y certifico que el contenido propuesto es original y de mi autoría. <span className="text-red-500">*</span>
              </Label>
            </div>

            {/* Newsletter Checkbox */}
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="guest-newsletter"
                checked={guestSubscribeNewsletter}
                onCheckedChange={(c) => setGuestSubscribeNewsletter(c as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="guest-newsletter" className="text-[11px] text-muted-foreground leading-tight cursor-pointer">
                Deseo recibir convocatorias editoriales y novedades turísticas de Descubre RD.
              </Label>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGuestModalOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingGuest}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-9 gap-1.5"
              >
                {isSubmittingGuest ? "Enviando..." : "Enviar para Revisión Editorial ✓"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

