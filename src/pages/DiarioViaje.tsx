import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Plus, Trash2, Printer, Share2, 
  Sparkles, Check, Copy, Eye, Edit3, Type 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface JournalPage {
  id: string;
  image: string;
  text: string;
  location: string;
  layout: "split" | "full-text" | "full-image";
}

export default function DiarioViaje() {
  const { user } = useAuth();
  
  // Editor states
  const [diaryTitle, setDiaryTitle] = useState("Aventura en la Costa Norte");
  const [diarySubtitle, setDiarySubtitle] = useState("Descubriendo Samaná y Puerto Plata");
  const [magazineStyle, setMagazineStyle] = useState<"editorial" | "minimal" | "vintage">("editorial");
  const [pages, setPages] = useState<JournalPage[]>([
    {
      id: "page-1",
      image: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=800&auto=format&fit=crop&q=80",
      text: "Nuestra primera parada fue la majestuosa península de Samaná. El trayecto por el bulevar del Atlántico ya es una experiencia inolvidable por sus vistas panorámicas. Al llegar, las palmeras nos dieron la bienvenida en una de las playas más impresionantes del Caribe.",
      location: "Las Terrenas, Samaná",
      layout: "split"
    },
    {
      id: "page-2",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      text: "El sol de la tarde pintó el cielo de tonos rosados y naranjas sobre las olas. Caminar descalzos por la arena fina y sentir la brisa tropical fue un momento de pura paz. Definitivamente República Dominicana lo tiene todo.",
      location: "Playa Rincón",
      layout: "split"
    }
  ]);

  // Mode state
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddPage = () => {
    const newPage: JournalPage = {
      id: "page-" + Date.now(),
      image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop&q=80",
      text: "Escribe tu bitácora de viaje aquí...",
      location: "Lugar del Viaje",
      layout: "split"
    };
    setPages([...pages, newPage]);
    toast.success("¡Nueva página añadida al diario!");
  };

  const handleRemovePage = (id: string) => {
    if (pages.length <= 1) {
      toast.error("El diario de viaje debe tener al menos una página.");
      return;
    }
    setPages(pages.filter(p => p.id !== id));
    toast.info("Página eliminada.");
  };

  const handleUpdatePage = (id: string, updates: Partial<JournalPage>) => {
    setPages(pages.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleCopyLink = () => {
    const dummyUrl = `${window.location.origin}/diario-viaje/compartir/rd-${Math.floor(100000 + Math.random() * 900000)}`;
    navigator.clipboard.writeText(dummyUrl);
    setCopied(true);
    toast.success("¡Enlace de revista copiado al portapapeles! 🔗");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageTransition>
      <SEOHead
        title="Diario de Viaje Digital | Descubre RD"
        description="Crea tu diario de viajes interactivo en formato de revista digital con fotos y bloques de texto. Compártelo con amigos."
      />
      <div className="min-h-screen flex flex-col bg-background print:bg-white print:text-black">
        <div className="print:hidden">
          <Header />
        </div>

        <main className="flex-1 pt-24 pb-12 print:pt-0">
          <div className="container mx-auto px-4 max-w-5xl">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-display text-foreground">Diario en Formato Revista</h1>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={mode === "edit" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setMode("edit")}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Edit3 className="h-4 w-4" /> Editar
                </Button>
                <Button 
                  variant={mode === "preview" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setMode("preview")}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Eye className="h-4 w-4" /> Previsualizar Revista
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)} className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5">
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>
              </div>
            </div>

            {/* Mode Content */}
            {mode === "edit" ? (
              <div className="grid lg:grid-cols-3 gap-8 print:hidden">
                {/* Left side: Config */}
                <div className="space-y-6">
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Type className="h-4 w-4" />
                        Ajustes Editor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Título Principal</label>
                        <Input 
                          value={diaryTitle} 
                          onChange={(e) => setDiaryTitle(e.target.value)} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Subtítulo</label>
                        <Input 
                          value={diarySubtitle} 
                          onChange={(e) => setDiarySubtitle(e.target.value)} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Estilo Editorial</label>
                        <select
                          value={magazineStyle}
                          onChange={(e) => setMagazineStyle(e.target.value as any)}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                          title="Estilo Editorial"
                        >
                          <option value="editorial">Clásico Editorial (Serif)</option>
                          <option value="minimal">Minimalista Moderno (Sans-Serif)</option>
                          <option value="vintage">Bitácora Vintage (Italic Cursiva)</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleAddPage} className="w-full font-bold gap-2">
                    <Plus className="h-4 w-4" /> Añadir Página
                  </Button>
                </div>

                {/* Right side: Pages Editor List */}
                <div className="lg:col-span-2 space-y-6">
                  {pages.map((page, index) => (
                    <Card key={page.id} className="border border-border bg-card shadow-sm">
                      <CardHeader className="pb-2 border-b border-border/50 flex flex-row justify-between items-center">
                        <Badge variant="outline" className="text-xs font-bold text-primary">
                          Página {index + 1}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemovePage(page.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">Ubicación</label>
                            <Input 
                              value={page.location} 
                              onChange={(e) => handleUpdatePage(page.id, { location: e.target.value })} 
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">Diseño de Maquetación</label>
                            <select
                              value={page.layout}
                              onChange={(e) => handleUpdatePage(page.id, { layout: e.target.value as any })}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                              title="Diseño de Maquetación"
                            >
                              <option value="split">Dividido (Foto + Texto)</option>
                              <option value="full-text">Completo Texto</option>
                              <option value="full-image">Completo Imagen</option>
                            </select>
                          </div>
                        </div>

                        {page.layout !== "full-text" && (
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">URL de Imagen</label>
                            <Input 
                              value={page.image} 
                              onChange={(e) => handleUpdatePage(page.id, { image: e.target.value })} 
                              className="mt-1"
                            />
                          </div>
                        )}

                        {page.layout !== "full-image" && (
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">Texto del artículo</label>
                            <Textarea
                              value={page.text}
                              onChange={(e) => handleUpdatePage(page.id, { text: e.target.value })}
                              rows={5}
                              className="mt-1 resize-none leading-relaxed"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Magazine View */
              <div className={`magazine-container py-12 px-6 md:px-12 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-2xl shadow-inner min-h-[600px] print:border-none print:shadow-none print:bg-white`}>
                
                {/* Cover info */}
                <div className="text-center space-y-4 max-w-xl mx-auto border-b-2 border-stone-400 pb-12 mb-12">
                  <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-stone-500">REVISTA DE VIAJES INDEPENDIENTE</span>
                  <h1 className={`text-4xl md:text-6xl font-extrabold text-stone-900 dark:text-stone-100 ${
                    magazineStyle === "editorial" ? "font-serif" : magazineStyle === "vintage" ? "font-serif italic" : "font-sans uppercase"
                  }`}>
                    {diaryTitle}
                  </h1>
                  <p className="text-stone-500 text-sm md:text-base font-medium">{diarySubtitle}</p>
                  <p className="text-xs text-stone-400">Escrito por: {user?.email?.split("@")[0] || "Explorador RD"}</p>
                </div>

                {/* Magazine Pages flow */}
                <div className="space-y-16">
                  {pages.map((page, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <div 
                        key={page.id} 
                        className={`grid md:grid-cols-2 gap-8 items-center border-b border-stone-300 dark:border-stone-800 pb-12 last:border-none last:pb-0 ${
                          page.layout === "full-text" ? "md:grid-cols-1 max-w-2xl mx-auto" : page.layout === "full-image" ? "md:grid-cols-1" : ""
                        }`}
                      >
                        {page.layout === "split" && (
                          <>
                            {isEven ? (
                              <>
                                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-stone-950">
                                  <img src={page.image} alt="Stop" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-4">
                                  <Badge className="bg-stone-500 text-white border-none text-[9px] uppercase tracking-wider font-semibold">
                                    📍 {page.location}
                                  </Badge>
                                  <p className={`text-stone-800 dark:text-stone-200 text-base leading-relaxed first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left ${
                                    magazineStyle === "editorial" ? "font-serif" : magazineStyle === "vintage" ? "font-serif italic" : "font-sans"
                                  }`}>
                                    {page.text}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-4 order-2 md:order-1">
                                  <Badge className="bg-stone-500 text-white border-none text-[9px] uppercase tracking-wider font-semibold">
                                    📍 {page.location}
                                  </Badge>
                                  <p className={`text-stone-800 dark:text-stone-200 text-base leading-relaxed ${
                                    magazineStyle === "editorial" ? "font-serif" : magazineStyle === "vintage" ? "font-serif italic" : "font-sans"
                                  }`}>
                                    {page.text}
                                  </p>
                                </div>
                                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-stone-950 order-1 md:order-2">
                                  <img src={page.image} alt="Stop" className="w-full h-full object-cover" />
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {page.layout === "full-text" && (
                          <div className="space-y-4 text-center">
                            <Badge className="bg-stone-500 text-white border-none text-[9px] uppercase tracking-wider font-semibold">
                              📍 {page.location}
                            </Badge>
                            <p className={`text-stone-800 dark:text-stone-200 text-lg leading-relaxed max-w-xl mx-auto ${
                              magazineStyle === "editorial" ? "font-serif" : magazineStyle === "vintage" ? "font-serif italic" : "font-sans"
                            }`}>
                              {page.text}
                            </p>
                          </div>
                        )}

                        {page.layout === "full-image" && (
                          <div className="space-y-4">
                            <div className="aspect-[21/9] rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-stone-950">
                              <img src={page.image} alt="Full cover" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                              <Badge className="bg-stone-500 text-white border-none text-[9px] uppercase tracking-wider font-semibold">
                                📍 {page.location}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        <div className="print:hidden">
          <Footer />
        </div>

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
            <Card className="max-w-md w-full border-border bg-card shadow-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Compartir Revista Digital
              </h3>
              <p className="text-xs text-muted-foreground">
                Copia este enlace de acceso rápido para que otros viajeros o amigos puedan ver tu bitácora de viaje en un elegante formato de revista interactiva.
              </p>

              <div className="flex gap-2 items-center">
                <Input 
                  value={`${window.location.origin}/diario-viaje/compartir/rd-${Math.floor(100000 + Math.random() * 900000)}`}
                  readOnly 
                  className="bg-secondary/40 font-mono text-xs text-foreground focus:ring-0 cursor-default"
                />
                <Button size="icon" onClick={handleCopyLink} className="shrink-0 h-10 w-10">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowShareModal(false)}>
                  Cerrar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
