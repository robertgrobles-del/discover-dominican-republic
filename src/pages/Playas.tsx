import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  MapPin, Star, Waves, Umbrella, Fish, Camera, Search, 
  ArrowUpDown, ShieldCheck, Sun, Compass, Wind, Sparkles,
  Heart, Navigation, HelpCircle, CheckCircle2, ChevronRight, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { beaches as staticBeaches, Beach } from "@/data/beaches";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BetweenSectionsAd, CompactInlineAd, MobileStickyFooterAd, PanoramaAd } from "@/components/promo";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useTranslation } from "@/hooks/useI18n";
import { getSafeCoverImage } from "@/lib/imageCovers";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import heroBeach from "@/assets/hero-beach.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";
import adventureImg from "@/assets/adventure.jpg";

import { PlayaCard } from "@/components/playas/PlayaCard";

export default function Playas() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [filterRegion, setFilterRegion] = useState<string>("todas");
  const [sortBy, setSortBy] = useState("destacados");
  const { t } = useTranslation();

  const beachTypeLabels: Record<string, string> = {
    'arena-blanca': t("playas.whiteSand") || "Arena Blanca",
    'arena-dorada': t("playas.goldenSand") || "Arena Dorada",
    'virgen': t("playas.virgin") || "Vírgenes / Ecoturismo",
    'bahia': t("playas.bay") || "Bahías Mansas",
    'deportiva': t("playas.sports") || "Surf & Deportes",
    'urbana': t("playas.urban") || "Urbanas",
  };

  const { data: dbBeaches, isLoading } = useQuery({
    queryKey: ['beaches-list'],
    queryFn: async () => {
      const { data } = await supabase.from('beaches').select('*').eq('is_active', true).order('is_featured', { ascending: false });
      return data || [];
    },
  });

  const allBeaches = useMemo(() => {
    const merged = [...staticBeaches];
    const slugs = new Set(merged.map(b => b.slug));
    (dbBeaches || []).forEach(db => {
      if (db.slug && !slugs.has(db.slug)) {
        merged.push(db as any);
        slugs.add(db.slug);
      }
    });
    return merged;
  }, [dbBeaches]);

  const filtered = useMemo(() => {
    let result = allBeaches.filter(b => {
      const name = b.name.toLowerCase();
      const prov = (b.province || '').toLowerCase();
      const dest = (b.destinationName || '').toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase()) || prov.includes(search.toLowerCase()) || dest.includes(search.toLowerCase());
      
      const bType = (b as any).beachType || (b as any).beach_type || '';
      const matchType = filterType === 'todos' || bType === filterType;

      let matchRegion = true;
      if (filterRegion !== 'todas') {
        const provSlug = (b.provinceSlug || b.provinceId || '').toLowerCase();
        if (filterRegion === 'este') matchRegion = provSlug.includes('altagracia') || provSlug.includes('romana') || provSlug.includes('san-pedro') || provSlug.includes('seibo') || provSlug.includes('hato-mayor');
        else if (filterRegion === 'norte') matchRegion = provSlug.includes('puerto-plata') || provSlug.includes('montecristi') || provSlug.includes('espallat') || provSlug.includes('maria-trinidad');
        else if (filterRegion === 'samana') matchRegion = provSlug.includes('samana');
        else if (filterRegion === 'sur') matchRegion = provSlug.includes('pedernales') || provSlug.includes('barahona') || provSlug.includes('peravia') || provSlug.includes('azua') || provSlug.includes('san-cristobal');
        else if (filterRegion === 'santo-domingo') matchRegion = provSlug.includes('santo-domingo') || dest.includes('boca chica');
      }

      return matchSearch && matchType && matchRegion;
    });

    // Sort
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "nombre") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [allBeaches, search, filterType, filterRegion, sortBy]);

  const types = ['todos', 'arena-blanca', 'arena-dorada', 'virgen', 'bahia', 'deportiva', 'urbana'];
  const totalCount = allBeaches.length;

  return (
    <PageTransition>
      <SEOHead
        title="Playas de República Dominicana - Guía Oficial de Costas y Arrecifes"
        description="Descubre las mejores playas de República Dominicana: arena blanca, bahías vírgenes, surf en Cabarete, piscinas naturales en Saona y Bahía de las Águilas."
        keywords="playas republica dominicana, playa bavaro, bahia de las aguilas, playa rincon, playa juanillo, cabarete surf, mejores playas caribe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Editorial Cinematic Hero */}
        <section className="relative min-h-[55vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden">
          <img 
            src={heroBeach} 
            alt="Playas de República Dominicana" 
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-fade-in" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/20 hover:bg-primary/30 text-white border-primary/40 backdrop-blur-md px-3.5 py-1 text-xs tracking-wider uppercase">
                <Waves className="w-3.5 h-3.5 mr-2 text-primary" /> Santuarios del Caribe Insular
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
                Guía de Playas de <span className="text-primary underline decoration-primary/50 underline-offset-8">República Dominicana</span>
              </h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal">
                Más de 1,600 km de costas tropicales: desde piscinas naturales de arena blanca inmaculada hasta bahías vírgenes y santuarios de surf del Atlántico.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Live Coastal Status & Environmental Banner */}
        <section className="border-y border-border/80 bg-card/60 backdrop-blur-md sticky top-16 z-20 shadow-xs">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Semáforo Costero en Vivo: Playas Aptas para Baño
                </div>
                <span className="hidden md:inline text-xs text-muted-foreground">
                  Aguas a 27°C - 29°C &bull; Índice UV Favorable
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/estado-playas">
                  <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary gap-1 h-8">
                    <ShieldCheck className="h-3.5 w-3.5" /> Ver Estado de Oleaje & Sargazo
                  </Button>
                </Link>
                <Link to="/buceo-snorkel">
                  <Button variant="outline" size="sm" className="text-xs gap-1 h-8 border-primary/30">
                    <Fish className="h-3.5 w-3.5 text-primary" /> Guía de Arrecifes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-6 border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Umbrella, value: `${totalCount}+`, label: "Playas Catalogadas", desc: "Costas y cayos vírgenes" },
                { icon: Waves, value: "27°C", label: "Temperatura Promedio", desc: "Aguas cálidas todo el año" },
                { icon: ShieldCheck, value: "8+", label: "Banderas Azules", desc: "Certificación de sostenibilidad" },
                { icon: Compass, value: "1,600 km", label: "Extensión Costera", desc: "Atlántico y Mar Caribe" }
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

        {/* Curated Beach Collections (Editorial Bento) */}
        <section className="py-12 bg-background border-b border-border/60">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-widest mb-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Curaduría Especial</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Colecciones de Playas Destacadas
                </h2>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Selecciones temáticas diseñadas para planificar tu próxima escapada según tu estilo de viaje.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Collection 1 */}
              <Link 
                to="/playa/bahia-de-las-aguilas"
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] border border-border shadow-md"
              >
                <img src={samanaImg} alt="Playas Vírgenes" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] mb-1.5">Ecoturismo Top</Badge>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Santuarios Vírgenes & Desconexión
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">Bahía de las Águilas, Playa Rincón y Canto de la Playa</p>
                </div>
              </Link>

              {/* Collection 2 */}
              <Link 
                to="/playa/playa-bavaro"
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] border border-border shadow-md"
              >
                <img src={relaxBeach} alt="Playas de Arena Blanca" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-primary text-primary-foreground font-bold text-[10px] mb-1.5">Relax & Lujo</Badge>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Arena Blanca & Piscinas de Cristal
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">Bávaro, Juanillo, Bayahíbe y Dominicus</p>
                </div>
              </Link>

              {/* Collection 3 */}
              <Link 
                to="/playa/playa-cabarete"
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] border border-border shadow-md"
              >
                <img src={adventureImg} alt="Playas de Surf" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-blue-600 text-white font-bold text-[10px] mb-1.5">Aventura en el Mar</Badge>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Meca del Surf, Kitesurf & Olas
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">Cabarete, Playa Encuentro, Macao y Cosón</p>
                </div>
              </Link>
            </div>

            {/* TABLA DE AMANECER, ATARDECER Y MAREAS POR COSTA */}
            <div className="mt-8 p-6 bg-card rounded-3xl border border-border space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Sol & Mareas: ¿Hacia dónde mira cada costa?
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  Ideal para Fotografía & Surf
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                {/* Amaneceres */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                    <span>🌅 Mejores Playas para Amanecer (Costa Este)</span>
                    <span className="font-mono text-[11px]">~06:20 AM</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Punta Cana, Macao, Cabeza de Toro:</strong> Salida del sol directo sobre el horizonte marino con tonos rosados y dorados de ensueño.
                  </p>
                </div>

                {/* Atardeceres */}
                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-2">
                  <div className="flex items-center justify-between font-bold text-orange-600 dark:text-orange-400">
                    <span>🌇 Mejores Playas para Atardecer (Costa Sur y Oeste)</span>
                    <span className="font-mono text-[11px]">~06:50 PM</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Bahía de las Águilas, Bayahíbe, Las Terrenas:</strong> Puesta de sol en el mar con cielo encendido y aguas en calma absoluta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="py-6 border-b border-border/80 bg-card/40">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              
              {/* Region Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
                <span className="text-muted-foreground font-semibold flex-shrink-0 mr-1">Costas:</span>
                {[
                  { id: "todas", label: "Todas las Costas" },
                  { id: "este", label: "Costa Este / Punta Cana" },
                  { id: "samana", label: "Península de Samaná" },
                  { id: "norte", label: "Costa Norte / Atlántico" },
                  { id: "sur", label: "Sur Profundo & Caribe" },
                  { id: "santo-domingo", label: "Santo Domingo & Cercanías" },
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
                    placeholder="Buscar por nombre de playa, provincia o destino..."
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
                        {tp === 'todos' ? "Todos los Tipos" : beachTypeLabels[tp] || tp}
                      </Button>
                    ))}
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-9 rounded-xl text-xs">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="destacados">Destacados</SelectItem>
                      <SelectItem value="rating">Mejor valoradas</SelectItem>
                      <SelectItem value="nombre">Nombre A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Beach Cards Grid */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {filterType === 'todos' ? "Catálogo de Playas" : `Playas de ${beachTypeLabels[filterType]}`}
                  {filterRegion !== 'todas' && ` (${filterRegion.toUpperCase()})`}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Mostrando {filtered.length} {filtered.length === 1 ? "playa registrada" : "playas registradas"} con información verificada
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((playa, index) => (
                  <PlayaCard key={playa.slug || playa.id} playa={playa} index={index} t={t} />
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border p-8">
                <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-foreground mb-2">No se encontraron playas con estos filtros</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Prueba modificando tus términos de búsqueda o seleccionando otra región costera.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearch(""); setFilterType("todos"); setFilterRegion("todas"); }}
                  className="rounded-xl"
                >
                  Restablecer Todos los Filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Environmental Stewardship Section */}
        <section className="py-12 bg-emerald-950/10 border-y border-emerald-500/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-widest mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Caribe Sostenible & Protección Costera</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Decálogo del Bañista Responsable en República Dominicana
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Ayúdanos a preservar la biodiversidad de nuestros arrecifes de coral, manglares y santuarios marinos con estas prácticas esenciales:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">Protector Solar Reef-Safe</h4>
                    <p className="text-xs text-muted-foreground">Usa filtros solares a base de minerales biodegradables (sin oxibenzona) para no dañar los corales.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">Cero Plásticos de un Solo Uso</h4>
                    <p className="text-xs text-muted-foreground">Lleva tu termo reutilizable y recoge cualquier residuo antes de retirarte de la playa.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">No Tocar Arrecifes ni Fauna</h4>
                    <p className="text-xs text-muted-foreground">No pises corales ni saques estrellas de mar del agua; son ecosistemas vivos sumamente frágiles.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">Respeta los Nidos de Tortuga</h4>
                    <p className="text-xs text-muted-foreground">En playas del sur y este, respeta las áreas delimitadas de desove de tortugas carey y tinglar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-widest mb-1.5">
                <HelpCircle className="h-4 w-4" />
                <span>Preguntas Frecuentes</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Todo lo que Debes Saber sobre las Playas Dominicanas
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="faq-1" className="border border-border/70 rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
                  ¿Son todas las playas públicas en República Dominicana?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Sí. De acuerdo con la Constitución y las leyes dominicanas, la franja costera de los 60 metros marítimos es de dominio público y de libre acceso para todos los ciudadanos y visitantes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border border-border/70 rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
                  ¿Cuál es la mejor temporada para visitar las playas?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  El clima tropical permite disfrutar de las playas los 365 días del año con aguas a 26°C - 29°C. La temporada con menor probabilidad de lluvias y aguas más calmas abarca desde diciembre hasta finales de abril.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border border-border/70 rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
                  ¿Qué significan los colores de las banderas en las playas?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  <strong>Verde:</strong> Condiciones excelentes y mar en calma. <br/>
                  <strong>Amarilla:</strong> Precaución por corrientes u oleaje moderado. <br/>
                  <strong>Roja:</strong> Prohibido el baño por fuerte oleaje o corrientes submarinas peligrosas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* High-Impact Beach Tourism Banner */}
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
