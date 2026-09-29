import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  MapPin, Star, Droplets, TreePine, Mountain, Compass, Shield, 
  Search, Calendar, Waves, Sparkles, CheckCircle2, ChevronRight, 
  HelpCircle, AlertTriangle, ArrowUpDown, Fish, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BetweenSectionsAd, CompactInlineAd, MobileStickyFooterAd, PanoramaAd } from "@/components/promo";
import { FavoriteButton } from "@/components/FavoriteButton";
import { rivers as allRivers, River, riverTypeLabels } from "@/data/rivers";
import { getSafeCoverImage } from "@/lib/imageCovers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import rafting from "@/assets/rafting.jpg";
import adventureImg from "@/assets/adventure.jpg";
import samanaImg from "@/assets/samana.jpg";

import { RioCard } from "@/components/rios/RioCard";

export default function Rios() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [filterRegion, setFilterRegion] = useState<string>("todas");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("todos");
  const [sortBy, setSortBy] = useState("destacados");

  const filtered = useMemo(() => {
    let result = allRivers.filter((r) => {
      const name = r.name.toLowerCase();
      const prov = (r.mainProvinceName || '').toLowerCase();
      const dest = (r.destinationName || '').toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase()) || prov.includes(search.toLowerCase()) || dest.includes(search.toLowerCase());
      
      const matchType = filterType === 'todos' || r.riverType === filterType;
      const matchDifficulty = filterDifficulty === 'todos' || r.difficulty === filterDifficulty;

      let matchRegion = true;
      if (filterRegion !== 'todas') {
        const provSlug = (r.mainProvinceId || '').toLowerCase();
        if (filterRegion === 'cibao') matchRegion = provSlug.includes('la-vega') || provSlug.includes('santiago') || provSlug.includes('monsenor-nouel') || provSlug.includes('sanchez-ramirez') || provSlug.includes('espallat');
        else if (filterRegion === 'norte') matchRegion = provSlug.includes('puerto-plata') || provSlug.includes('montecristi') || provSlug.includes('dajabon');
        else if (filterRegion === 'samana') matchRegion = provSlug.includes('samana') || provSlug.includes('maria-trinidad');
        else if (filterRegion === 'sur') matchRegion = provSlug.includes('barahona') || provSlug.includes('pedernales') || provSlug.includes('peravia') || provSlug.includes('azua') || provSlug.includes('san-cristobal') || provSlug.includes('san-jose');
        else if (filterRegion === 'este') matchRegion = provSlug.includes('monte-plata') || provSlug.includes('higuey') || provSlug.includes('altagracia') || provSlug.includes('romana') || provSlug.includes('seibo');
      }

      return matchSearch && matchType && matchDifficulty && matchRegion;
    });

    if (sortBy === "rating") {
      result = [...result].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === "nombre") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, filterType, filterRegion, filterDifficulty, sortBy]);

  const types = ['todos', 'cascada', 'montaña', 'charco', 'cañon', 'manantial'];
  const totalCount = allRivers.length;

  return (
    <PageTransition>
      <SEOHead
        title="Ríos, Cascadas y Charcos de República Dominicana - Guía de Ecoturismo y Aventura"
        description="Explora los saltos de agua, ríos cristalinos y cañones más espectaculares de RD: Salto El Limón, 27 Charcos de Damajagua, Jimenoa, Baiguate, Jamao al Norte y Balneario La Plaza."
        keywords="rios republica dominicana, cascadas jarabacoa, salto el limon, 27 charcos damajagua, salto de socoa, balneario la plaza, rafting yaque del norte"
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Cinematic River & Waterfall Hero */}
        <section className="relative min-h-[55vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden">
          <img 
            src={adventureImg} 
            alt="Ríos y Cascadas de República Dominicana" 
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-fade-in" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/55 to-black/35" />
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-white border-emerald-500/40 backdrop-blur-md px-3.5 py-1 text-xs tracking-wider uppercase">
                <Droplets className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Santuarios Fluviales & Cordilleras
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
                Ríos, Cascadas & Charcos de <span className="text-primary underline decoration-primary/50 underline-offset-8">República Dominicana</span>
              </h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal">
                Aguas cristalinas de montaña, saltos imponentes de selva tropical, cañonismo y rafting en la Cordillera Central.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-6 border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Droplets, value: `${totalCount}+`, label: "Ríos & Saltos Catalogados", desc: "Pozas y manantiales" },
                { icon: Mountain, value: "3,087 m", label: "Altitud Pico Duarte", desc: "Nacimiento de cuencas" },
                { icon: Waves, value: "Nivel IV", label: "Rafting Extremo", desc: "Río Yaque del Norte" },
                { icon: TreePine, value: "100% Selva", label: "Ecosistemas Vírgenes", desc: "Ecoturismo sostenible" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/60 shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-lg leading-tight">{feature.value}</p>
                    <p className="text-xs font-semibold text-foreground/80">{feature.label}</p>
                    <p className="text-[11px] text-muted-foreground hidden sm:block">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curated River Collections Bento */}
        <section className="py-12 bg-background border-b border-border/60">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-widest mb-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Rutas de Agua Dulce</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Colecciones de Aventura Fluvial
                </h2>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Explora las mejores experiencias fluviales según tu nivel de aventura y el tipo de entorno natural.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Collection 1 */}
              <Link 
                to="/rio/salto-el-limon"
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] border border-border shadow-md"
              >
                <img src={samanaImg} alt="Saltos Majestuosos" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] mb-1.5">Cascada Top</Badge>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Saltos Majestuosos de la Selva
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">Salto El Limón, Salto de Socoa y Salto Alto</p>
                </div>
              </Link>

              {/* Collection 2 */}
              <Link 
                to="/rio/27-charcos-de-damajagua"
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] border border-border shadow-md"
              >
                <img src={adventureImg} alt="Canyoning y Adrenalina" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-red-500 text-white font-bold text-[10px] mb-1.5">Adrenalina Pura</Badge>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-primary transition-colors">
                    27 Charcos & Canyoning
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">Saltos naturales, toboganes de roca y saltos al vacío</p>
                </div>
              </Link>

              {/* Collection 3 */}
              <Link 
                to="/rio/rio-yaque-del-norte"
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] border border-border shadow-md"
              >
                <img src={rafting} alt="Rafting en Jarabacoa" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-blue-600 text-white font-bold text-[10px] mb-1.5">Rafting & Kayak</Badge>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Ríos de Montaña de Jarabacoa
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">Río Yaque del Norte, Jimenoa y Baiguate</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="py-6 border-b border-border/80 bg-card/40">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              
              {/* Region Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
                <span className="text-muted-foreground font-semibold flex-shrink-0 mr-1">Región:</span>
                {[
                  { id: "todas", label: "Todo el País" },
                  { id: "cibao", label: "Cordillera Central / Jarabacoa" },
                  { id: "samana", label: "Samaná & Costa Verde" },
                  { id: "norte", label: "Costa Norte / Puerto Plata" },
                  { id: "sur", label: "Sur Profundo / Barahona" },
                  { id: "este", label: "Monte Plata & Este" },
                ].map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setFilterRegion(reg.id)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-semibold ${
                      filterRegion === reg.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

              {/* Search & Type Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar río, cascada, charco o provincia..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-background"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex flex-wrap gap-1.5 overflow-x-auto">
                    {types.map((tp) => (
                      <Button
                        key={tp}
                        variant={filterType === tp ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType(tp)}
                        className="text-xs h-9 rounded-xl"
                      >
                        {tp === 'todos' ? "Todos los Tipos" : riverTypeLabels[tp] || tp}
                      </Button>
                    ))}
                  </div>

                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-[150px] h-9 rounded-xl text-xs">
                      <SelectValue placeholder="Dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Toda Dificultad</SelectItem>
                      <SelectItem value="facil">Fácil / Familiar</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="dificil">Aventura Exigente</SelectItem>
                      <SelectItem value="experto">Extremo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl text-xs">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="destacados">Destacados</SelectItem>
                      <SelectItem value="rating">Mejor valorados</SelectItem>
                      <SelectItem value="nombre">Nombre A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* River Cards Grid */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {filterType === 'todos' ? "Catálogo de Ríos y Cascadas" : riverTypeLabels[filterType]}
                  {filterRegion !== 'todas' && ` (${filterRegion.toUpperCase()})`}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Mostrando {filtered.length} {filtered.length === 1 ? "destino fluvial" : "destinos fluviales"} con acceso e información verificada
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((rio, index) => (
                <RioCard key={rio.slug || rio.id} rio={rio} index={index} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border p-8">
                <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-foreground mb-2">No se encontraron ríos con estos filtros</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Prueba modificando tus términos de búsqueda o seleccionando otra región montañosa.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearch(""); setFilterType("todos"); setFilterRegion("todas"); setFilterDifficulty("todos"); }}
                  className="rounded-xl"
                >
                  Restablecer Todos los Filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Hydro-Safety & Ecotourism Protocol */}
        <section className="py-12 bg-blue-950/10 border-y border-blue-500/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-widest mb-2">
                <Shield className="h-4 w-4" />
                <span>Protocolo de Seguridad Fluvial & Cuencas Hidrográficas</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Normas de Seguridad para Visitar Ríos y Cascadas en RD
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Para disfrutar de una experiencia segura en ríos de montaña y cañones naturales, ten en cuenta las siguientes recomendaciones:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">Atención a Crecidas Repentinas</h4>
                    <p className="text-xs text-muted-foreground">Si el agua cambia de color a marrón o el caudal aumenta súbitamente, sal del cauce de inmediato.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">Calzado de Agua Antideslizante</h4>
                    <p className="text-xs text-muted-foreground">Usa escarpines o tenis acuáticos para evitar resbalones en piedras húmedas de montaña.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">Contrata Guías Locales Certificados</h4>
                    <p className="text-xs text-muted-foreground">En cañones como 27 Charcos o Arroyo Frío, el acompañamiento de guías capacitados es indispensable.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">No Dejes Residuos en las Cuencas</h4>
                    <p className="text-xs text-muted-foreground">Los ríos proveen agua dulce a miles de comunidades dominicanas. Preserva la pureza de sus nacimientos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-widest mb-1.5">
                <HelpCircle className="h-4 w-4" />
                <span>Preguntas Frecuentes</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Todo sobre Ríos y Cascadas en República Dominicana
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="faq-1" className="border border-border/70 rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
                  ¿Cuál es el mejor río para hacer Rafting en el país?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  El <strong>Río Yaque del Norte</strong>, en Jarabacoa, es el único río en todo el Caribe con rápidos de clase II a IV ideales para rafting en aguas blancas durante todo el año.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border border-border/70 rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
                  ¿Se requiere reserva previa para visitar los 27 Charcos de Damajagua?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Se puede llegar directamente al centro de visitantes en Imbert (Puerto Plata), donde se asignan guías certificados, chalecos salvavidas y cascos reglamentarios.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Banner Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <BetweenSectionsAd showDemo />
        <MobileStickyFooterAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
