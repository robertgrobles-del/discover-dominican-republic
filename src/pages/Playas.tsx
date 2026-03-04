import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { MapPin, Star, Waves, Umbrella, Fish, Camera, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { beaches as staticBeaches, Beach } from "@/data/beaches";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";

import heroBeach from "@/assets/hero-beach.jpg";

const beachTypeLabels: Record<string, string> = {
  'arena-blanca': 'Arena Blanca',
  'arena-dorada': 'Arena Dorada',
  'virgen': 'Virgen',
  'bahia': 'Bahía',
  'deportiva': 'Deportiva',
  'urbana': 'Urbana'
};

const PlayaCard = ({ playa, index }: { playa: any; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const slug = playa.slug || playa.id;
  const imageUrl = playa.imageUrl || playa.image_url || '/placeholder.svg';
  const beachType = playa.beachType || playa.beach_type || 'arena-blanca';
  const shortDesc = playa.shortDescription || playa.short_description || '';
  const destName = playa.destinationName || playa.destination_name || playa.province || '';

  return (
    <Link
      to={`/playa/${slug}`}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500 block"
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
        {playa.rating > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-medium">{playa.rating}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{destName}</span>
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">{playa.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{shortDesc}</p>
        {(playa.activities || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(playa.activities as string[]).slice(0, 3).map((act) => (
              <span key={act} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{act}</span>
            ))}
          </div>
        )}
        <Button className="w-full">Explorar Playa</Button>
      </div>
    </Link>
  );
};

export default function Playas() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");

  // Fetch from Supabase
  const { data: dbBeaches } = useQuery({
    queryKey: ['beaches-list'],
    queryFn: async () => {
      const { data } = await supabase.from('beaches').select('*').eq('is_active', true).order('is_featured', { ascending: false });
      return data || [];
    },
  });

  // Merge static + DB, deduplicate by slug
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
    return allBeaches.filter(b => {
      const name = b.name.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase());
      const bType = (b as any).beachType || (b as any).beach_type || '';
      const matchType = filterType === 'todos' || bType === filterType;
      return matchSearch && matchType;
    });
  }, [allBeaches, search, filterType]);

  const types = ['todos', 'arena-blanca', 'arena-dorada', 'virgen', 'bahia', 'deportiva', 'urbana'];

  return (
    <PageTransition>
      <SEOHead
        title="Playas de República Dominicana - Las Mejores del Caribe"
        description="Descubre más de 400 playas paradisíacas en República Dominicana. Arena blanca, aguas turquesa y vida marina."
        keywords="playas, República Dominicana, caribe, arena blanca, Punta Cana, Samaná, Bayahibe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img src={heroBeach} alt="Playas de República Dominicana" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Waves className="w-4 h-4 mr-2" /> Paraíso Caribeño
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Playas de <span className="text-gradient">República Dominicana</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Descubre más de 1,600 km de costa con algunas de las playas más hermosas del mundo
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Umbrella, label: "400+ Playas", desc: "En todo el país" },
                { icon: Waves, label: "Aguas Cálidas", desc: "24-28°C todo el año" },
                { icon: Fish, label: "Vida Marina", desc: "Arrecifes de coral" },
                { icon: Camera, label: "Paisajes Únicos", desc: "Postales naturales" }
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CompactInlineAd showDemo />

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar playas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {types.map(t => (
                  <Button
                    key={t}
                    variant={filterType === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(t)}
                  >
                    {t === 'todos' ? 'Todas' : beachTypeLabels[t] || t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 flex-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                {filterType === 'todos' ? 'Todas las Playas' : `Playas ${beachTypeLabels[filterType]}`}
              </h2>
              <p className="text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? 'playa encontrada' : 'playas encontradas'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((playa, index) => (
                <PlayaCard key={playa.slug || playa.id} playa={playa} index={index} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron playas con esos filtros.</p>
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
