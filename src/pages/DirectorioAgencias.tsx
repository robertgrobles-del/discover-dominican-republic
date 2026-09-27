import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, MapPin, Phone, Mail, Globe, ChevronRight, ChevronLeft,
  Check, Building2, Compass, Download, FileText, Image, ShieldCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AgenciasHero } from "@/components/agencias/AgenciasHero";
import { AgenciasFilterSidebar } from "@/components/agencias/AgenciasFilterSidebar";
import { AgencyCard, DirectoryAgency } from "@/components/agencias/AgencyCard";
import { ExcursionsGrid } from "@/components/agencias/ExcursionsGrid";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Agency {
  id: string;
  name: string;
  verified: boolean;
  isDemo: boolean;
  location: string;
  rnt: string;
  description: string;
  type: string;
  status: string;
  logo: string;
  logoUrl?: string;
  hasEmail: boolean;
  hasPhone: boolean;
  hasWeb: boolean;
  phone: string;
  email: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
}

interface Excursion {
  id: string;
  title: string;
  price: number;
  duration: string;
  location: string;
  image: string;
}

// ── Mock fallback data ─────────────────────────────────────────────────────────
const mockAgencies: Agency[] = [
  {
    id: "tropical-caribbean",
    name: "Tropical Caribbean Tours",
    verified: false,
    isDemo: true,
    location: "Punta Cana",
    rnt: "RNT: En validación",
    description: "Especialistas en excursiones náuticas y safaris terrestres en la zona este. (Ficha demostrativa para operadores en proceso de registro).",
    type: "Tour Operador",
    status: "En Validación",
    logo: "TC",
    hasEmail: true,
    hasPhone: true,
    hasWeb: true,
    phone: "+18092214660",
    email: "contacto@descubrerd.do"
  },
  {
    id: "econature-republic",
    name: "EcoNature Republic",
    verified: false,
    isDemo: true,
    location: "Samaná",
    rnt: "RNT: En validación",
    description: "Pioneros en turismo sostenible y avistamiento de ballenas. Operación bajo estándares de conservación ambiental en proceso de homologación.",
    type: "Ecoturismo",
    status: "En Validación",
    logo: "EN",
    hasEmail: true,
    hasPhone: true,
    hasWeb: false,
    phone: "+18092214660",
    email: "contacto@descubrerd.do"
  },
  {
    id: "santo-domingo-experts",
    name: "Santo Domingo City Experts",
    verified: false,
    isDemo: true,
    location: "Santo Domingo",
    rnt: "RNT: En trámite",
    description: "Recorridos históricos por la Zona Colonial y experiencias gastronómicas urbanas.",
    type: "Cultural",
    status: "En Revisión",
    logo: "SD",
    hasEmail: true,
    hasPhone: false,
    hasWeb: false,
    phone: "+18092214660",
    email: "contacto@descubrerd.do"
  }
];

const mockExcursions: Excursion[] = [
  {
    id: "isla-saona-vip",
    title: "Isla Saona VIP",
    price: 45,
    duration: "8 Horas",
    location: "La Romana",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
  },
  {
    id: "los-haitises-cayo",
    title: "Los Haitises & Cayo",
    price: 85,
    duration: "6 Horas",
    location: "Samaná",
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&h=300&fit=crop"
  },
  {
    id: "santo-domingo-historico",
    title: "Santo Domingo Histórico",
    price: 60,
    duration: "5 Horas",
    location: "Sto. Dgo",
    image: "https://images.unsplash.com/photo-1585535116934-9e1a14063e35?w=400&h=300&fit=crop"
  },
  {
    id: "buggy-adventure-macao",
    title: "Buggy Adventure Macao",
    price: 120,
    duration: "4 Horas",
    location: "Punta Cana",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  }
];

const b2bResources = [
  { id: 1, title: "Kit de Marketing 2024", type: "ZIP", size: "45 MB", icon: Image },
  { id: 2, title: "Tarifas B2B Q1 2026", type: "PDF", size: "2.3 MB", icon: FileText },
  { id: 3, title: "Galería Profesional HD", type: "ZIP", size: "120 MB", icon: Image },
  { id: 4, title: "Contrato de Colaboración", type: "DOCX", size: "156 KB", icon: FileText },
];

const PAGE_SIZE = 10;

export default function DirectorioAgencias() {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState("all");

  // ── Supabase: travel agencies ───────────────────────────────────────────────
  const { data: dbAgencies, isLoading: agenciesLoading } = useQuery({
    queryKey: ["travel-agencies-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_agencies")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });

  // ── Supabase: tour packages (excursions catalog) ────────────────────────────
  const { data: dbTourPackages } = useQuery({
    queryKey: ["tour-packages-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("id, name, price_from, duration, destinations, image_url, slug, is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Map DB rows → UI types ───────────────────────────────────────────────────
  const agenciesList: Agency[] = useMemo(() => {
    if (!dbAgencies || dbAgencies.length === 0) return mockAgencies;
    return dbAgencies.map((a) => ({
      id: a.slug ?? a.id,
      name: a.name,
      verified: a.is_active ?? false,
      isDemo: false,
      location: a.address ?? "República Dominicana",
      rnt: a.is_active ? "Operador Verificado" : "RNT: En validación",
      description: a.short_description ?? a.description ?? "",
      type: a.agency_type ?? "Tour Operador",
      status: a.is_active ? "Activo" : "En Validación",
      logo: a.name.slice(0, 2).toUpperCase(),
      logoUrl: a.logo_url ?? undefined,
      hasEmail: !!a.email,
      hasPhone: !!a.phone,
      hasWeb: !!a.website,
      phone: a.phone ?? "+18092214660",
      email: a.email ?? "contacto@descubrerd.do",
      website: a.website ?? undefined,
      rating: a.rating ?? undefined,
      reviewCount: a.review_count ?? undefined,
      specialties: a.specialties ?? undefined,
    }));
  }, [dbAgencies]);

  const excursions: Excursion[] = useMemo(() => {
    if (!dbTourPackages || dbTourPackages.length === 0) return mockExcursions;
    return dbTourPackages.map((p) => ({
      id: p.slug ?? p.id,
      title: p.name,
      price: p.price_from ?? 0,
      duration: p.duration ?? "",
      location: (p.destinations ?? [])[0] ?? "República Dominicana",
      image: p.image_url ?? "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    }));
  }, [dbTourPackages]);

  // ── Filtering & Pagination ───────────────────────────────────────────────────
  const filteredAgencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return agenciesList.filter((a) => {
      const matchesSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);
      const matchesVerified = !onlyVerified || a.verified;
      const matchesType = typeFilter.length === 0 || typeFilter.includes(a.type);
      const matchesRegion = regionFilter === "all" || a.location.toLowerCase().includes(regionFilter.toLowerCase());
      return matchesSearch && matchesVerified && matchesType && matchesRegion;
    });
  }, [agenciesList, searchQuery, onlyVerified, typeFilter, regionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAgencies.length / PAGE_SIZE));
  const paginatedAgencies = filteredAgencies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleTypeToggle = (type: string, checked: boolean) => {
    setTypeFilter((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type)
    );
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <AgenciasHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="directorio" className="w-full">
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger value="directorio" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4">
                <Building2 className="h-4 w-4" />
                Directorio Verificado
              </TabsTrigger>
              <TabsTrigger value="catalogo" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4">
                <Compass className="h-4 w-4" />
                Catálogo de Excursiones
              </TabsTrigger>
              <TabsTrigger value="recursos" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4">
                <Download className="h-4 w-4" />
                Recursos B2B
              </TabsTrigger>
            </TabsList>
          </div>
        </section>

        {/* Tab Content: Directorio */}
        <TabsContent value="directorio" className="mt-0">
          <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <AgenciasFilterSidebar
                  typeFilter={typeFilter}
                  onTypeToggle={handleTypeToggle}
                  regionFilter={regionFilter}
                  onRegionChange={(v) => { setRegionFilter(v); setCurrentPage(1); }}
                  onlyVerified={onlyVerified}
                  onOnlyVerifiedChange={(v) => { setOnlyVerified(v); setCurrentPage(1); }}
                  onReset={() => { setTypeFilter([]); setRegionFilter("all"); setOnlyVerified(false); setSearchQuery(""); }}
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-bold text-foreground">Directorio de Agencias</h2>
                    {agenciesLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Badge variant="secondary">{filteredAgencies.length} resultados</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Ordenar por:</span>
                    <Select defaultValue="relevancia">
                      <SelectTrigger className="w-[140px] bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevancia">Relevancia</SelectItem>
                        <SelectItem value="nombre">Nombre</SelectItem>
                        <SelectItem value="ubicacion">Ubicación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Agency Cards */}
                <div className="space-y-4 mb-8">
                  {agenciesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                        <div className="flex gap-6">
                          <div className="w-28 h-28 rounded-xl bg-muted flex-shrink-0" />
                          <div className="flex-1 space-y-3">
                            <div className="h-5 bg-muted rounded w-1/3" />
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-12 bg-muted rounded w-full" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : paginatedAgencies.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No se encontraron agencias con estos filtros.</p>
                      <p className="text-sm mt-1">Intenta ajustar la búsqueda o los filtros.</p>
                    </div>
                  ) : (
                    paginatedAgencies.map((agency, index) => (
                      <AgencyCard key={agency.id} agency={agency} index={index} />
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost" size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    {totalPages > 5 && <span className="text-muted-foreground px-2">...</span>}
                    <Button
                      variant="ghost" size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Excursions Catalog in Directorio tab */}
            <section className="mt-16 pt-16 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Catálogo de Excursiones Destacadas</h2>
                  <p className="text-sm text-muted-foreground">Experiencias B2B con comisiones preferenciales.</p>
                </div>
                <Link to="/experiencias">
                  <Button variant="link" className="text-primary gap-1">
                    Ver todo el catálogo <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <ExcursionsGrid excursions={excursions} />
            </section>
          </div>
        </TabsContent>

        {/* Tab Content: Catálogo de Excursiones */}
        <TabsContent value="catalogo" className="mt-0">
          <div className="container mx-auto px-4 py-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">Catálogo Completo de Excursiones</h2>
            <ExcursionsGrid excursions={excursions} withCardWrapper />
          </div>
        </TabsContent>

        {/* Tab Content: Recursos B2B */}
        <TabsContent value="recursos" className="mt-0">
          <div className="container mx-auto px-4 py-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Recursos B2B</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Descarga materiales oficiales de marketing, tarifas preferenciales y documentación para partners.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {b2bResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <resource.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{resource.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">{resource.type}</span>
                    <span>{resource.size}</span>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" /> Descargar
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Banners de Conversión: Sorteo de Lectores + Registro de Agencias de Viajes */}
      <div className="container mx-auto px-4 pb-16 space-y-8">
        <SorteoLectorBanner origenCategoria="Agencias de Viajes y Tours" />

        <CTARegistroEstablecimiento
          tipo="tour"
          titulo="¿Tienes una agencia de viajes o tour operador?"
          subtitulo="Inscribe tu agencia y catálogo de excursiones en el directorio oficial de Descubre RD para el gran lanzamiento. Conecta directamente con clientes B2C y B2B."
        />
      </div>

      <Footer />
    </div>
  );
}