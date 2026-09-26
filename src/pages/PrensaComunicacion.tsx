import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Search, Download, Image, FileText, Video, 
  Rss, ChevronRight, Mail, Phone, ArrowRight, 
  User, Check, Sparkles, Newspaper, Camera, 
  Award, Globe, Calendar, ExternalLink, ShieldCheck, Share2
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import gastronomiImg from "@/assets/gastronomy.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import { PreFooterPresidenteBanner } from "@/components/promo";

const downloadableResources = [
  {
    id: 1,
    icon: Download,
    title: "Kit de Logotipos Oficiales",
    description: "Vectores (SVG, EPS, AI) y PNG transparentes en alta resolución para prensa y difusión.",
    fileSize: "24.5 MB",
    action: "DESCARGAR ZIP",
  },
  {
    id: 2,
    icon: FileText,
    title: "Manual de Marca y Guía Editorial",
    description: "Guía completa de tipografías oficiales, paleta de colores cromáticos y normas de uso.",
    fileSize: "12.8 MB (PDF)",
    action: "DESCARGAR PDF",
  },
  {
    id: 3,
    icon: Image,
    title: "Banco de Imágenes 4K",
    description: "Fotografía editorial de playas, cultura, gastronomía y hotelería libres de derechos para prensa.",
    fileSize: "180+ Fotos 300dpi",
    action: "ACCEDER A DRIVE",
  },
  {
    id: 4,
    icon: Video,
    title: "B-Roll Videos & Dron 4K",
    description: "Tomas aéreas cinematográficas en 60fps sin marca de agua para cadenas de TV y creadores.",
    fileSize: "4K ProRes / MP4",
    action: "VER VIDEOTECA",
  },
];

const pressReleases = [
  {
    id: 1,
    date: { day: "24", month: "SEP", year: "2026" },
    category: "ESTADÍSTICAS",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    title: "República Dominicana supera récord histórico con más de 8.5 millones de turistas en lo que va de año",
    excerpt: "El flujo de turistas internacionales experimentó un crecimiento del 14.8% impulsado por nuevos vuelos a Punta Cana, Samaná y Cabo Rojo.",
    readTime: "3 min de lectura",
    featured: true,
  },
  {
    id: 2,
    date: { day: "18", month: "SEP", year: "2026" },
    category: "SOSTENIBILIDAD",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    title: "Inauguración de la nueva Ruta de Turismo Comunitario y Ecoturismo en Samaná y Jarabacoa",
    excerpt: "Un programa integral que integra más de 60 cooperativas locales para la conservación de manglares, saltos y cascadas vírgenes.",
    readTime: "4 min de lectura",
    featured: false,
  },
  {
    id: 3,
    date: { day: "10", month: "SEP", year: "2026" },
    category: "INVERSIÓN",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    title: "República Dominicana será sede de la Cumbre Internacional de Inversión Hotelera del Caribe 2027",
    excerpt: "Líderes de fondos de inversión globales y cadenas hoteleras se darán cita para evaluar nuevos proyectos de lujo en Pedernales y Miches.",
    readTime: "2 min de lectura",
    featured: false,
  },
  {
    id: 4,
    date: { day: "02", month: "SEP", year: "2026" },
    category: "CULTURA & GASTRONOMÍA",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    title: "El Casabe y el Merengue Dominicano son reconocidos en la Semana Gastronómica de Madrid y París",
    excerpt: "Chefs dominicanos galardonados llevaron los sabores criollos y la alta cocina autóctona a festivales culinarios de Europa.",
    readTime: "3 min de lectura",
    featured: false,
  },
];

const mediaHighlights = [
  { source: "Forbes Travel", title: "Por qué República Dominicana es el destino caribeño indiscutible para 2026", date: "Septiembre 2026", link: "#" },
  { source: "National Geographic", title: "Cabo Rojo y Bahía de las Águilas: el último paraíso virgen de las Antillas", date: "Agosto 2026", link: "#" },
  { source: "Condé Nast Traveler", title: "Los 10 mejores resorts todo incluido y boutiques coloniales del Caribe", date: "Julio 2026", link: "#" },
  { source: "The New York Times", title: "Santo Domingo: la vibrante capital que mezcla 500 años de historia con modernidad", date: "Junio 2026", link: "#" },
];

const pressTeam = [
  {
    name: "Lic. Carmen Méndez",
    role: "Directora General de Comunicaciones",
    email: "prensa@descubrerd.com",
    phone: "+1 (809) 221-4660 ext. 204",
    location: "Santo Domingo, D.N.",
  },
  {
    name: "Lic. Alejandro Batista",
    role: "Relaciones Internacionales & Media Tours",
    email: "internacional@descubrerd.com",
    phone: "+1 (809) 221-4660 ext. 208",
    location: "Miami / Santo Domingo",
  },
  {
    name: "Dra. Sofía Valenzuela",
    role: "Coordinación de Acreditaciones & B-Roll",
    email: "medios@descubrerd.com",
    phone: "+1 (809) 221-4660 ext. 215",
    location: "Punta Cana / Santo Domingo",
  },
];

export default function PrensaComunicacion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mediaOutlet, setMediaOutlet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleDownload = (resourceTitle: string) => {
    toast.success(`Iniciando descarga segura de: ${resourceTitle}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success("¡Suscripción confirmada! Recibirás los boletines de prensa oficiales.");
    }, 1200);
  };

  const filteredReleases = pressReleases.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Sala de Prensa y Comunicación Oficial - Descubre República Dominicana"
        description="Centro de noticias, comunicados oficiales, notas de prensa, banco de imágenes 4K, manuales de marca y contacto para periodistas y medios internacionales."
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-12">
            
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-900 via-primary/10 to-background p-8 sm:p-12 shadow-xl">
              <div className="relative z-10 max-w-3xl space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-xs font-bold gap-1.5 px-3 py-1">
                  <Newspaper className="h-3.5 w-3.5" /> Sala de Prensa Oficial & Media Center
                </Badge>
                
                <h1 className="font-display text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                  Comunicación, Medios & Sala de Prensa
                </h1>
                
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Accede a comunicados de prensa certificados, estadísticas turísticas en tiempo real, videoteca 4K en ProRes, banco de imágenes en alta resolución y contactos para medios nacionales e internacionales.
                </p>

                {/* Quick Search */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar comunicados, estadísticas o fechas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-2xl bg-card/80 border-border text-xs sm:text-sm h-11"
                    />
                  </div>
                  <Button className="h-11 px-6 rounded-2xl font-bold gap-1.5 shrink-0">
                    <Search className="h-4 w-4" /> Buscar Notas
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Media Kit Resources Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Download className="h-6 w-6 text-primary" />
                    Kit de Recursos Oficiales para Periodistas
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Materiales oficiales libres de derechos editoriales para cobertura televisiva, radial, digital e impresa.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {downloadableResources.map((res) => {
                  const Icon = res.icon;
                  return (
                    <Card key={res.id} className="rounded-3xl border-border bg-card hover:border-primary/50 transition-all shadow-md flex flex-col justify-between p-6">
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-base text-foreground leading-snug">{res.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{res.description}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] font-mono font-medium text-muted-foreground">{res.fileSize}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDownload(res.title)}
                          className="rounded-xl text-xs gap-1.5 font-bold hover:bg-primary hover:text-primary-foreground"
                        >
                          <Download className="h-3.5 w-3.5" /> {res.action}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Main Tabs: Comunicados & Acreditaciones */}
            <Tabs defaultValue="comunicados" className="w-full space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-lg bg-muted/60 p-1 rounded-2xl">
                <TabsTrigger value="comunicados" className="rounded-xl font-bold text-xs sm:text-sm">
                  Comunicados
                </TabsTrigger>
                <TabsTrigger value="cobertura" className="rounded-xl font-bold text-xs sm:text-sm">
                  Prensa Global
                </TabsTrigger>
                <TabsTrigger value="boletin" className="rounded-xl font-bold text-xs sm:text-sm">
                  Acreditación & Boletín
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: COMUNICADOS */}
              <TabsContent value="comunicados" className="space-y-6">
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    size="sm"
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    className="rounded-full text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "estadísticas" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("estadísticas")}
                    className="rounded-full text-xs"
                  >
                    Estadísticas & Llegadas
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "sostenibilidad" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("sostenibilidad")}
                    className="rounded-full text-xs"
                  >
                    Sostenibilidad & Naturaleza
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "inversión" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("inversión")}
                    className="rounded-full text-xs"
                  >
                    Inversión & Negocios
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "cultura" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("cultura")}
                    className="rounded-full text-xs"
                  >
                    Cultura & Gastronomía
                  </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  
                  {/* Releases Feed (2 Cols) */}
                  <div className="lg:col-span-2 space-y-4">
                    {filteredReleases.map((release) => (
                      <Card key={release.id} className="rounded-3xl border-border bg-card hover:border-primary/40 transition-all p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {/* Date block */}
                          <div className="w-16 h-16 rounded-2xl bg-muted flex flex-col items-center justify-center shrink-0 border border-border text-center">
                            <span className="font-mono text-xl font-black text-foreground">{release.date.day}</span>
                            <span className="text-[10px] font-bold text-primary uppercase">{release.date.month} {release.date.year}</span>
                          </div>

                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] font-bold uppercase rounded-lg ${release.badgeColor}`}>
                                {release.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">• {release.readTime}</span>
                            </div>

                            <h3 className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors cursor-pointer">
                              {release.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {release.excerpt}
                            </p>

                            <div className="pt-2 flex items-center justify-between">
                              <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary gap-1">
                                Leer comunicado completo <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1">
                                <Download className="h-3.5 w-3.5" /> Descargar PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Sidebar Media Contacts & Highlights */}
                  <div className="space-y-6">
                    <Card className="rounded-3xl border-border bg-card p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <h3 className="font-bold text-base text-foreground">Contacto de Prensa</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Atención directa a corresponsales, agencias de noticias internacionales y equipos de filmación.
                      </p>

                      <div className="space-y-3 pt-2">
                        {pressTeam.map((member, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                            <p className="font-bold text-xs text-foreground">{member.name}</p>
                            <p className="text-[11px] text-primary font-medium">{member.role}</p>
                            <div className="text-[11px] text-muted-foreground flex flex-col gap-0.5 pt-1">
                              <a href={`mailto:${member.email}`} className="hover:underline flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {member.email}
                              </a>
                              <a href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {member.phone}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: COBERTURA GLOBAL */}
              <TabsContent value="cobertura" className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {mediaHighlights.map((item, idx) => (
                    <Card key={idx} className="rounded-3xl border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                          {item.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground leading-snug">{item.title}</h3>
                      <div className="pt-2">
                        <a href={item.link} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                          <span>Ver artículo original</span> <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: ACREDITACIONES & BOLETÍN */}
              <TabsContent value="boletin" className="space-y-6">
                <div className="max-w-2xl mx-auto">
                  <Card className="rounded-3xl border-border bg-card shadow-xl p-8 space-y-6">
                    {isSubscribed ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <Check className="h-8 w-8" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-foreground">¡Suscripción & Registro Exitoso!</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                          Te hemos registrado en el padrón de medios oficiales. Recibirás en tu correo los comunicados en primicia con embargo informativo y accesos a conferencias de prensa.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                            Padrón de Prensa & Cobertura
                          </Badge>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                            Acreditación para Medios y Boletín
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Regístrate para recibir notas de prensa exclusivas, convocatorias a viajes de prensa (Fam Trips) y material audiovisual.
                          </p>
                        </div>

                        <form onSubmit={handleNewsletterSubmit} className="space-y-4 text-xs sm:text-sm">
                          <div className="space-y-1.5">
                            <Label htmlFor="name">Nombre y Apellido del Periodista / Redactor</Label>
                            <Input
                              id="name"
                              placeholder="Ej: Lic. Juan Pérez"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="email">Correo Corporativo de Prensa</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="prensa@periodico.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="outlet">Medio de Comunicación / Agencia</Label>
                            <Input
                              id="outlet"
                              placeholder="Ej: CNN en Español, Periódico Hoy, Blog de Viajes..."
                              value={mediaOutlet}
                              onChange={(e) => setMediaOutlet(e.target.value)}
                              required
                            />
                          </div>

                          <Button type="submit" size="lg" className="w-full font-bold rounded-2xl" disabled={isSubmitting}>
                            {isSubmitting ? "Procesando registro..." : "Completar Registro de Prensa"}
                          </Button>
                        </form>
                      </>
                    )}
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* PreFooter Promo */}
            <PreFooterPresidenteBanner />

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
