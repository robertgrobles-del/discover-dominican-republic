import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Waves, AlertTriangle, CheckCircle, Info, Calendar, MapPin, 
  Search, ShieldAlert, Sparkles, Navigation
} from "lucide-react";

interface BeachStatus {
  id: string;
  name: string;
  region: "Este" | "Norte" | "Sur";
  status: "limpio" | "leve" | "moderado" | "abundante";
  lastUpdated: string;
  notes: string;
}

const mockBeaches: BeachStatus[] = [
  { id: "1", name: "Playa Bávaro", region: "Este", status: "moderado", lastUpdated: "Hoy, 10:30 AM", notes: "Limpieza activa por brigadas hoteleras." },
  { id: "2", name: "Playa Rincón", region: "Norte", status: "limpio", lastUpdated: "Ayer, 4:15 PM", notes: "Aguas cristalinas y arena blanca sin residuos." },
  { id: "3", name: "Playa Juan Dolio", region: "Este", status: "leve", lastUpdated: "Hoy, 8:00 AM", notes: "Pequeñas manchas flotantes cerca de la orilla." },
  { id: "4", name: "Playa Salinas", region: "Sur", status: "limpio", lastUpdated: "Hace 2 días", notes: "Libre de sargazo. Viento fuerte ideal para windsurf." },
  { id: "5", name: "Playa Macao", region: "Este", status: "limpio", lastUpdated: "Hoy, 11:00 AM", notes: "Excelentes condiciones para surf." },
  { id: "6", name: "Playa Frontón", region: "Norte", status: "limpio", lastUpdated: "Hace 1 día", notes: "Perfecto estado natural." },
  { id: "7", name: "Playa Boca Chica", region: "Este", status: "leve", lastUpdated: "Hoy, 9:20 AM", notes: "Bajo sargazo, apta para baño." },
  { id: "8", name: "Playa El Limón", region: "Norte", status: "abundante", lastUpdated: "Hoy, 7:30 AM", notes: "Llegada masiva de sargazo. Se recomienda precaución." },
  { id: "9", name: "Playa Pedernales", region: "Sur", status: "limpio", lastUpdated: "Hace 3 días", notes: "Completamente libre de algas." },
];

export default function ObservatorioSargazo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  const filteredBeaches = mockBeaches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "todos" || b.region === selectedRegion;
    const matchesStatus = selectedStatus === "todos" || b.status === selectedStatus;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const getStatusBadge = (status: BeachStatus["status"]) => {
    switch (status) {
      case "limpio":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none gap-1"><CheckCircle className="h-3.5 w-3.5" /> Limpia</Badge>;
      case "leve":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none gap-1"><Info className="h-3.5 w-3.5" /> Presencia Leve</Badge>;
      case "moderado":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Moderado</Badge>;
      case "abundante":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none gap-1"><ShieldAlert className="h-3.5 w-3.5" /> Abundante</Badge>;
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Observatorio de Sargazo RD - Estado de Playas"
        description="Consulta en tiempo real la presencia de sargazo en las playas de República Dominicana. Planifica tus vacaciones sabiendo qué playas están limpias."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-teal-500/10 text-teal-600 border-teal-500/20 gap-1.5">
                <Waves className="h-3.5 w-3.5 animate-pulse" /> Monitoreo Ambiental
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Observatorio de Sargazo
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Consulta el estado de limpieza y la presencia de sargazo en las principales playas de la República Dominicana en tiempo real.
              </p>
            </div>
          </section>

          {/* Interactive dashboard */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              
              {/* Satellite Alert banner */}
              <div className="p-4 bg-muted/60 border border-border rounded-xl mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Pronóstico de Corrientes del Atlántico</h3>
                    <p className="text-xs text-muted-foreground">Última captura satelital muestra corrientes desviando manchas grandes hacia el Canal de la Mona.</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary font-mono gap-1 text-xs shrink-0">
                  <Calendar className="h-3.5 w-3.5" /> Actualizado: Hoy 14:00 AST
                </Badge>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Left side: Maps & Information (Col 1) */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Mock Satellite map */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        Mapa Satelital (Simulador)
                      </CardTitle>
                      <CardDescription>Corrientes de Sargazo detectadas hoy</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-52 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center border border-border">
                        {/* Map visualization style */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&q=80&w=500')]" />
                        <div className="absolute top-4 left-4 p-2 bg-black/60 rounded text-[10px] text-white font-mono flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          SAT-V2 LIVE
                        </div>
                        {/* Simulated ocean currents & sargazo patch circles */}
                        <div className="absolute top-1/3 left-1/4 w-12 h-6 bg-amber-600/30 rounded-full blur-md animate-pulse" />
                        <div className="absolute top-1/2 right-1/4 w-20 h-10 bg-amber-600/40 rounded-full blur-md animate-pulse" />
                        <div className="absolute bottom-1/4 left-1/3 w-8 h-4 bg-emerald-600/20 rounded-full blur-md" />
                        <div className="relative text-center text-xs text-white font-medium p-4 bg-black/50 rounded-lg">
                          Vista del Caribe Oriental
                          <p className="text-[10px] text-muted-foreground mt-1">Manchas mayores concentradas al Este de Punta Cana.</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Playas óptimas</span>
                          <span className="font-semibold text-foreground">67%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Presencia Leve</span>
                          <span className="font-semibold text-foreground">22%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Presencia Alta</span>
                          <span className="font-semibold text-foreground">11%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recomendaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-3 text-muted-foreground">
                      <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-800 dark:text-emerald-300">
                        <strong>¿Qué hacer si hay sargazo?</strong>
                        <p className="mt-1">Opta por playas del Norte (Samaná, Puerto Plata) que suelen recibir muy baja cantidad de algas debido a las corrientes oceánicas.</p>
                      </div>
                      <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-800 dark:text-amber-300">
                        <strong>Piscinas Naturales:</strong>
                        <p className="mt-1">Las excursiones a bancos de arena alejados de la costa (ej. Piscina Natural de Bayahibe o Cayo Arena) están usualmente 100% limpias.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right side: Interactive beach status lookup (Col 2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Filter panel */}
                  <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Buscar playa por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                      {/* Region Filters */}
                      <select 
                        className="bg-background border border-input text-sm rounded-lg p-2 shrink-0"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        title="Región"
                        aria-label="Región"
                      >
                        <option value="todos">Todas las Regiones</option>
                        <option value="Este">Región Este</option>
                        <option value="Norte">Región Norte</option>
                        <option value="Sur">Región Sur</option>
                      </select>

                      {/* Status Filters */}
                      <select 
                        className="bg-background border border-input text-sm rounded-lg p-2 shrink-0"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        title="Estado de Sargazo"
                        aria-label="Estado de Sargazo"
                      >
                        <option value="todos">Todos los Estados</option>
                        <option value="limpio">Limpia</option>
                        <option value="leve">Leve</option>
                        <option value="moderado">Moderado</option>
                        <option value="abundante">Abundante</option>
                      </select>
                    </div>
                  </div>

                  {/* Beaches list */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredBeaches.length > 0 ? (
                      filteredBeaches.map((beach) => (
                        <Card key={beach.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <CardTitle className="text-base font-display">{beach.name}</CardTitle>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" /> Región {beach.region}
                                </span>
                              </div>
                              {getStatusBadge(beach.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 text-xs space-y-2">
                            <p className="text-muted-foreground">{beach.notes}</p>
                            <div className="pt-2 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Reporte: {beach.lastUpdated}</span>
                              <Badge variant="secondary" className="text-[9px]">UGC Verificado</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-muted-foreground">
                        No se encontraron playas que coincidan con los filtros seleccionados.
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
