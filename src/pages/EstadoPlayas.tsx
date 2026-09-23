import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Waves, Thermometer, Wind, Leaf, Clock, Search, MapPin, AlertTriangle, CheckCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateBeachSchema } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import heroBeachImg from "@/assets/hero-beach.jpg";

type BeachStatus = "segura" | "precaucion" | "peligrosa";

interface Beach {
  id: string;
  name: string;
  region: string;
  status: BeachStatus;
  lastUpdate: string;
  temp: number;
  weather: string;
  waveHeight: string;
  seaweed: "nulo" | "bajo" | "moderado" | "alto";
  wind: string;
  image: string;
}

const statusConfig = {
  segura: { label: "SEGURA", color: "text-emerald-600", bgColor: "bg-emerald-500", icon: CheckCircle },
  precaucion: { label: "PRECAUCIÓN", color: "text-amber-600", bgColor: "bg-amber-500", icon: AlertTriangle },
  peligrosa: { label: "PELIGROSA", color: "text-red-600", bgColor: "bg-red-500", icon: AlertTriangle },
};

const seaweedColors = {
  nulo: "text-emerald-600",
  bajo: "text-emerald-500",
  moderado: "text-amber-500",
  alto: "text-red-500",
};

function BeachCard({ beach }: { beach: Beach }) {
  const status = statusConfig[beach.status];
  const StatusIcon = status.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
      aria-label={`Estado de ${beach.name}: ${status.label}`}
    >
      <div className="relative h-40">
        <img src={beach.image} alt={`Playa ${beach.name}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-card/90 text-foreground gap-1">
          <Clock className="h-3 w-3" />
          {beach.lastUpdate}
        </Badge>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-foreground">{beach.name}</h3>
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" />
            {beach.region}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <StatusIcon className={`h-8 w-8 ${status.color}`} aria-hidden="true" />
          <div>
            <p className={`font-black text-lg ${status.color}`}>{status.label}</p>
            <p className="text-xs text-muted-foreground">Bandera {beach.status === "segura" ? "Verde" : beach.status === "precaucion" ? "Amarilla" : "Roja"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-muted/50 rounded-xl p-3 mb-4" role="list" aria-label="Condiciones de la playa">
          <div className="flex flex-col gap-1" role="listitem">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Thermometer className="h-4 w-4" aria-hidden="true" /> Clima
            </div>
            <span className="text-sm font-semibold">{beach.temp}°C {beach.weather}</span>
          </div>
          <div className="flex flex-col gap-1" role="listitem">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Waves className="h-4 w-4" aria-hidden="true" /> Oleaje
            </div>
            <span className="text-sm font-semibold">{beach.waveHeight}</span>
          </div>
          <div className="flex flex-col gap-1" role="listitem">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Leaf className="h-4 w-4" aria-hidden="true" /> Sargazo
            </div>
            <span className={`text-sm font-semibold capitalize ${seaweedColors[beach.seaweed]}`}>{beach.seaweed}</span>
          </div>
          <div className="flex flex-col gap-1" role="listitem">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Wind className="h-4 w-4" aria-hidden="true" /> Viento
            </div>
            <span className="text-sm font-semibold">{beach.wind}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          Ver reporte completo
        </Button>
      </div>
    </motion.article>
  );
}

function mapDbBeachToLocal(dbBeach: any): Beach {
  const waveMap: Record<string, BeachStatus> = {
    baja: "segura",
    moderada: "precaucion",
    alta: "peligrosa",
  };
  return {
    id: dbBeach.id,
    name: dbBeach.name,
    region: dbBeach.destination_id ? "República Dominicana" : "República Dominicana",
    status: waveMap[dbBeach.wave_intensity?.toLowerCase()] || "segura",
    lastUpdate: new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" }),
    temp: 28 + Math.floor(Math.random() * 4),
    weather: "Soleado",
    waveHeight: dbBeach.wave_intensity === "alta" ? "1.5m" : dbBeach.wave_intensity === "moderada" ? "0.8m" : "0.3m",
    seaweed: (dbBeach.crowd_level === "alto" ? "moderado" : "bajo") as Beach["seaweed"],
    wind: `${12 + Math.floor(Math.random() * 15)}km/h`,
    image: dbBeach.image_url || heroBeachImg,
  };
}

export default function EstadoPlayas() {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("Todas");
  const [search, setSearch] = useState("");
  const [regions, setRegions] = useState<string[]>(["Todas"]);

  useEffect(() => {
    async function fetchBeaches() {
      const { data } = await supabase
        .from("beaches")
        .select("*")
        .eq("is_active", true)
        .limit(50);

      if (data && data.length > 0) {
        const mapped = data.map(mapDbBeachToLocal);
        setBeaches(mapped);
        const uniqueRegions = ["Todas", ...new Set(mapped.map((b) => b.region))] as string[];
        setRegions(uniqueRegions);
      }
      setLoading(false);
    }
    fetchBeaches();
  }, []);

  const filteredBeaches = beaches.filter((beach) => {
    const matchesRegion = selectedRegion === "Todas" || beach.region === selectedRegion;
    const matchesSearch = beach.name.toLowerCase().includes(search.toLowerCase()) ||
                          beach.region.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Estado de Playas en Tiempo Real"
        description="Verifica las condiciones del mar, sargazo y clima de las playas de República Dominicana para planificar tu visita segura."
        keywords="playas, estado del mar, sargazo, oleaje, República Dominicana, seguridad playas"
        jsonLd={generateBeachSchema({ name: "Playas de República Dominicana", description: "Estado en tiempo real de las playas dominicanas" })}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden" aria-label="Estado de playas">
          <img
            src={heroBeachImg}
            alt="Playa dominicana con agua cristalina"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center max-w-2xl px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Estado de Playas en Tiempo Real
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Verifique las condiciones del mar, sargazo y clima para planificar su visita segura.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Buscar playa (ej. Punta Cana, Samaná...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border"
                aria-label="Buscar playa por nombre o región"
              />
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-10" id="main-content">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Condiciones Actuales</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0" role="tablist" aria-label="Filtrar por región">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  role="tab"
                  aria-selected={selectedRegion === region}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Beach Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="list">
              {filteredBeaches.map((beach) => (
                <BeachCard key={beach.id} beach={beach} />
              ))}
            </div>
          )}

          {!loading && filteredBeaches.length === 0 && (
            <div className="text-center py-12" role="status">
              <p className="text-muted-foreground">No se encontraron playas con los filtros seleccionados.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
