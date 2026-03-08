import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Mail, Building2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Establecimiento {
  id: string;
  subsector: string;
  actividad: string | null;
  rut: string | null;
  nombre: string;
  sector_zona: string | null;
  provincia: string | null;
  estatus_proceso: string | null;
  estatus_licencia: string | null;
  estatus_establecimiento: string | null;
  fecha_vencimiento: string | null;
  telefono: string | null;
  correo: string | null;
}

const ITEMS_PER_PAGE = 24;

const statusColor = (status: string | null) => {
  if (!status) return "secondary";
  const s = status.toLowerCase();
  if (s === "abierto") return "default";
  if (s === "cerrado") return "destructive";
  return "secondary";
};

const licenciaColor = (status: string | null) => {
  if (!status) return "secondary";
  const s = status.toLowerCase();
  if (s === "activa") return "default";
  if (s === "inactiva") return "destructive";
  return "outline";
};

export default function Establecimientos() {
  const [data, setData] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subsectorFilter, setSubsectorFilter] = useState("all");
  const [provinciaFilter, setProvinciaFilter] = useState("all");
  const [estatusFilter, setEstatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("establecimientos")
        .select("id, subsector, actividad, rut, nombre, sector_zona, provincia, estatus_proceso, estatus_licencia, estatus_establecimiento, fecha_vencimiento, telefono, correo")
        .eq("is_active", true)
        .order("nombre");

      if (!error && rows) setData(rows);
      setLoading(false);
    };
    fetchData();
  }, []);

  const subsectors = useMemo(() => [...new Set(data.map((d) => d.subsector))].sort(), [data]);
  const provincias = useMemo(() => [...new Set(data.map((d) => d.provincia).filter(Boolean))].sort() as string[], [data]);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchSearch = !search || d.nombre.toLowerCase().includes(search.toLowerCase()) || (d.sector_zona || "").toLowerCase().includes(search.toLowerCase());
      const matchSub = subsectorFilter === "all" || d.subsector === subsectorFilter;
      const matchProv = provinciaFilter === "all" || d.provincia === provinciaFilter;
      const matchStatus = estatusFilter === "all" || d.estatus_establecimiento === estatusFilter;
      return matchSearch && matchSub && matchProv && matchStatus;
    });
  }, [data, search, subsectorFilter, provinciaFilter, estatusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  useEffect(() => { setPage(0); }, [search, subsectorFilter, provinciaFilter, estatusFilter]);

  return (
    <>
      <SEOHead
        title="Directorio de Establecimientos Turísticos | DescubreRD"
        description="Directorio oficial de establecimientos turísticos registrados en República Dominicana: hoteles, restaurantes, agencias de viajes, tiendas y más."
      />
      <Header />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Directorio de Establecimientos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Registro oficial de {data.length.toLocaleString()} establecimientos turísticos en República Dominicana
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o zona..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subsectorFilter} onValueChange={setSubsectorFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Subsector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los subsectores</SelectItem>
                {subsectors.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={provinciaFilter} onValueChange={setProvinciaFilter}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {provincias.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={estatusFilter} onValueChange={setEstatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estatus</SelectItem>
                <SelectItem value="Abierto">Abierto</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Mostrando {paginated.length} de {filtered.length.toLocaleString()} resultados
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((est) => (
                  <Card key={est.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                          {est.nombre}
                        </h3>
                        <Badge variant={statusColor(est.estatus_establecimiento)} className="shrink-0 text-xs">
                          {est.estatus_establecimiento || "N/A"}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="font-medium text-primary/80">{est.subsector}</p>
                        {est.actividad && <p>{est.actividad}</p>}
                        {est.sector_zona && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {est.sector_zona}, {est.provincia}
                          </p>
                        )}
                        {est.telefono && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <a href={`tel:${est.telefono}`} className="hover:text-primary transition-colors">
                              {est.telefono}
                            </a>
                          </p>
                        )}
                        {est.correo && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <a href={`mailto:${est.correo}`} className="hover:text-primary transition-colors">
                              {est.correo}
                            </a>
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Badge variant={licenciaColor(est.estatus_licencia)} className="text-xs">
                          Licencia: {est.estatus_licencia || "N/A"}
                        </Badge>
                        {est.rut && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {est.rut}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
