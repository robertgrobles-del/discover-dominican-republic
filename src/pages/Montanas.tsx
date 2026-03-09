import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain, Search, MapPin, Star, Ruler, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { mountains, rangeLabels, Mountain as MountainType } from "@/data/mountains";

const difficultyLabels: Record<MountainType['difficulty'], { label: string; color: string }> = {
  'facil': { label: 'Fácil', color: 'bg-green-500' },
  'moderado': { label: 'Moderado', color: 'bg-yellow-500' },
  'dificil': { label: 'Difícil', color: 'bg-orange-500' },
  'experto': { label: 'Experto', color: 'bg-red-500' }
};

export default function Montanas() {
  const [search, setSearch] = useState("");
  const [rangeFilter, setRangeFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return mountains.filter(m => {
      const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.provinceName.toLowerCase().includes(search.toLowerCase());
      const matchRange = !rangeFilter || m.range === rangeFilter;
      const matchDiff = !difficultyFilter || m.difficulty === difficultyFilter;
      return matchSearch && matchRange && matchDiff;
    });
  }, [search, rangeFilter, difficultyFilter]);

  const ranges = Object.entries(rangeLabels);

  return (
    <PageTransition>
      <SEOHead
        title="Montañas y Picos de República Dominicana | DescubreRD"
        description="Explora las montañas y picos principales de RD: Pico Duarte, Isabel de Torres, Montaña Redonda y más."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hero */}
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-emerald-900 to-green-800 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Mountain className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Montañas y Picos de RD
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Desde el Pico Duarte, la cumbre más alta del Caribe, hasta miradores con vistas al mar.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/90">
              <div className="text-center">
                <p className="text-3xl font-bold">{mountains.length}</p>
                <p className="text-sm text-white/70">Montañas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">3,098m</p>
                <p className="text-sm text-white/70">Punto más alto</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">6</p>
                <p className="text-sm text-white/70">Cordilleras</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar montaña..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={rangeFilter === "" ? "default" : "outline"} size="sm" onClick={() => setRangeFilter("")}>Todas</Button>
              {ranges.map(([key, label]) => (
                <Button key={key} variant={rangeFilter === key ? "default" : "outline"} size="sm" onClick={() => setRangeFilter(rangeFilter === key ? "" : key)}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {Object.entries(difficultyLabels).map(([key, { label }]) => (
              <Button key={key} variant={difficultyFilter === key ? "default" : "outline"} size="sm" onClick={() => setDifficultyFilter(difficultyFilter === key ? "" : key)}>
                {label}
              </Button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="container mx-auto px-4 pb-16 flex-1">
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} montañas encontradas</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, i) => {
              const diff = difficultyLabels[m.difficulty];
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/montana/${m.slug}`} className="group block rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-all">
                    <div className="relative h-48">
                      <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={`${diff.color} text-white border-none text-xs`}>{diff.label}</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-black/60 text-white border-none text-xs">{m.altitude.toLocaleString()} m</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-primary font-medium mb-1">{rangeLabels[m.range]}</p>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">{m.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{m.shortDescription}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.provinceName}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{m.rating}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
