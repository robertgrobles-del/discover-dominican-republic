import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, MapPin, Plus, Filter, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EstablishmentCard } from "@/components/establishments/EstablishmentCard";
import { usePublicEstablishments } from "@/lib/stagingContent";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "hotel", label: "Hoteles" },
  { id: "restaurante", label: "Restaurantes" },
  { id: "bar", label: "Bares" },
  { id: "cafe", label: "Cafeterías" },
  { id: "tour", label: "Tours" },
  { id: "transporte", label: "Transporte" },
  { id: "comercio", label: "Comercios" },
];

export default function NegociosDirectorio() {
  const { data: establishments = [], isLoading } = usePublicEstablishments();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");

  const provinces = useMemo(() => {
    const set = new Set<string>();
    establishments.forEach((e) => {
      if (e.province) set.add(e.province);
    });
    return Array.from(set).sort();
  }, [establishments]);

  const filtered = useMemo(() => {
    return establishments.filter((e) => {
      const matchCategory = selectedCategory === "all" || e.type === selectedCategory;
      const matchProvince = selectedProvince === "all" || e.province === selectedProvince;
      const query = search.toLowerCase().trim();
      const matchSearch =
        !query ||
        e.name.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query)) ||
        (e.province && e.province.toLowerCase().includes(query)) ||
        (e.address && e.address.toLowerCase().includes(query));
      return matchCategory && matchProvince && matchSearch;
    });
  }, [establishments, selectedCategory, selectedProvince, search]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead
        title="Directorio de Empresas y Negocios Turísticos | Descubre RD"
        description="Explora hoteles, restaurantes, bares, operadores de tours y negocios locales verificados en República Dominicana. Contacto directo y sin comisiones."
        url="/negocios"
        image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80"
        keywords="negocios republica dominicana, directorio turismo rd, hoteles rd, restaurantes punta cana, tours santo domingo"
        geo={{
          placename: "República Dominicana",
          region: "DO",
        }}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Negocios", url: "/negocios" },
        ]}
      />
      <Header />

      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-24 md:pt-28">
        {/* Breadcrumb nav */}
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-foreground">Directorio de Empresas</li>
          </ol>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-12 shadow-sm">
          <div className="max-w-2xl">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 font-semibold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Empresas y Negocios Verificados
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Directorio Turístico de República Dominicana
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg leading-relaxed">
              Encuentra los mejores hoteles, restaurantes, bares, operadores y servicios turísticos verificados en todo el país. Contacto directo con cada empresa.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="gap-2 rounded-xl">
                <Link to="/registra-tu-negocio">
                  <Plus className="h-4 w-4" /> Registrar mi negocio gratis
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <section aria-label="Filtros del directorio" className="mt-10 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar negocio por nombre, cocina, servicio o dirección..."
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            {provinces.length > 0 && (
              <select
                aria-label="Filtrar por provincia"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Todas las provincias ({provinces.length})</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>

          {/* Category Tabs */}
          <div role="tablist" aria-label="Categorías" className="flex flex-wrap gap-1.5 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Results grid */}
        <section className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center max-w-lg mx-auto my-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">No se encontraron negocios</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search || selectedCategory !== "all" || selectedProvince !== "all"
                  ? "Prueba cambiando los filtros o el término de búsqueda."
                  : "Sé el primero en registrar tu empresa en el directorio turístico oficial de la República Dominicana."}
              </p>
              <Button asChild className="mt-6 gap-2 rounded-xl">
                <Link to="/registra-tu-negocio">
                  <Plus className="h-4 w-4" /> Registrar mi negocio
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <EstablishmentCard key={item.id} establishment={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
