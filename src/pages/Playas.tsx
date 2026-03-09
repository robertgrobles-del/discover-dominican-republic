import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { MapPin, Star, Waves, Umbrella, Fish, Camera, Search, SlidersHorizontal, ArrowUpDown, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { beaches as staticBeaches, Beach } from "@/data/beaches";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useTranslation } from "@/hooks/useI18n";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

import heroBeach from "@/assets/hero-beach.jpg";

const PlayaCard = ({ playa, index, t }: { playa: any; index: number; t: (key: string) => string }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const slug = playa.slug || playa.id;
  const imageUrl = playa.imageUrl || playa.image_url || '/placeholder.svg';
  const beachType = playa.beachType || playa.beach_type || 'arena-blanca';
  const shortDesc = playa.shortDescription || playa.short_description || '';
  const destName = playa.destinationName || playa.destination_name || playa.province || '';
  const rating = playa.rating || 0;
  const waveIntensity = playa.waveIntensity || playa.wave_intensity || '';
  const sandType = playa.sandType || playa.sand_type || '';

  const beachTypeLabels: Record<string, string> = {
    'arena-blanca': t("playas.whiteSand"),
    'arena-dorada': t("playas.goldenSand"),
    'virgen': t("playas.virgin"),
    'bahia': t("playas.bay"),
    'deportiva': t("playas.sports"),
    'urbana': t("playas.urban"),
  };

  return (
    <Link
      to={`/playa/${slug}`}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 block animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}
        <img
          src={imageUrl}
          alt={playa.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
          {beachTypeLabels[beachType] || beachType}
        </Badge>
        {rating > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-semibold">{rating}</span>
          </div>
        )}
        <FavoriteButton
          id={slug}
          type="playa"
          name={playa.name}
          image={imageUrl}
          className="absolute bottom-4 right-4 z-10"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{destName}</span>
        </div>
        <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{playa.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{shortDesc}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {waveIntensity && (
            <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
              🌊 {waveIntensity}
            </span>
          )}
          {sandType && (
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
              ✨ {sandType}
            </span>
          )}
        </div>
        {(playa.activities || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(playa.activities as string[]).slice(0, 3).map((act) => (
              <span key={act} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{act}</span>
            ))}
            {(playa.activities as string[]).length > 3 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                +{(playa.activities as string[]).length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default function Playas() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [sortBy, setSortBy] = useState("destacados");
  const { t } = useTranslation();

  const beachTypeLabels: Record<string, string> = {
    'arena-blanca': t("playas.whiteSand"),
    'arena-dorada': t("playas.goldenSand"),
    'virgen': t("playas.virgin"),
    'bahia': t("playas.bay"),
    'deportiva': t("playas.sports"),
    'urbana': t("playas.urban"),
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
      const matchSearch = !search || name.includes(search.toLowerCase());
      const bType = (b as any).beachType || (b as any).beach_type || '';
      const matchType = filterType === 'todos' || bType === filterType;
      return matchSearch && matchType;
    });

    // Sort
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "nombre") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [allBeaches, search, filterType, sortBy]);

  const types = ['todos', 'arena-blanca', 'arena-dorada', 'virgen', 'bahia', 'deportiva', 'urbana'];
  const totalCount = allBeaches.length;
  const featuredCount = allBeaches.filter(b => (b as any).isFeatured || (b as any).is_featured).length;

  return (
    <PageTransition>
      <SEOHead
        title={t("playas.seoTitle")}
        description={t("playas.seoDesc")}
        keywords="playas, República Dominicana, caribe, arena blanca, Punta Cana, Samaná, Bayahibe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img src={heroBeach} alt={t("playas.seoTitle")} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Waves className="w-4 h-4 mr-2" /> {t("playas.caribbeanParadise")}
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              {t("playas.title")} <span className="text-gradient">{t("playas.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t("playas.subtitle")}
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-6 border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Umbrella, value: `${totalCount}+`, label: t("playas.beaches400"), desc: t("playas.beaches400Desc") },
                { icon: Waves, value: "26°C", label: t("playas.warmWaters"), desc: t("playas.warmWatersDesc") },
                { icon: Fish, value: "500+", label: t("playas.marineLife"), desc: t("playas.marineLifeDesc") },
                { icon: Camera, value: "∞", label: t("playas.uniqueLandscapes"), desc: t("playas.uniqueLandscapesDesc") }
              ].map((feature) => (
                <div key={feature.label} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg leading-tight">{feature.value}</p>
                    <p className="text-xs text-muted-foreground">{feature.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CompactInlineAd showDemo />

        {/* Filters */}
        <section className="py-6 border-b border-border sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("playas.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {types.map(tp => (
                  <Button
                    key={tp}
                    variant={filterType === tp ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(tp)}
                    className="text-xs"
                  >
                    {tp === 'todos' ? t("playas.all") : beachTypeLabels[tp] || tp}
                  </Button>
                ))}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
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
        </section>

        {/* Grid */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {filterType === 'todos' ? t("playas.allBeaches") : `${t("playas.beachesType")} ${beachTypeLabels[filterType]}`}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filtered.length} {filtered.length === 1 ? t("playas.beachFound") : t("playas.beachesFound")}
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
              <div className="text-center py-20">
                <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t("playas.noResults")}</p>
                <Button variant="outline" onClick={() => { setSearch(""); setFilterType("todos"); }}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        <BetweenSectionsAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
