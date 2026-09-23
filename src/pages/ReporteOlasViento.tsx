import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wind, Waves, Thermometer, Compass, Calendar, AlertTriangle,
  MapPin, Info, Navigation, ArrowUpRight, Sparkles, ShieldCheck, Sun, Clock
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PanoramaAd } from "@/components/promo";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

interface MarineReport {
  location: string;
  regionName: string;
  windSpeed: number; // knots
  windDirection: string;
  waveHeight: number; // meters
  waveInterval: number; // seconds
  swellDirection: string;
  waterTemp: number; // °C
  kiteRating: "Excelente" | "Moderado" | "Pobre";
  surfRating: "Excelente" | "Moderado" | "Pobre";
  swimmingSafe: boolean;
  bestTime: string;
  description: string;
}

const spotsList: Record<string, MarineReport> = {
  cabarete: {
    location: "Bahía de Cabarete & Playa Bozo Beach",
    regionName: "Costa Norte (Puerto Plata)",
    windSpeed: 19,
    windDirection: "ENE (Este-Nordeste)",
    waveHeight: 1.8,
    waveInterval: 9,
    swellDirection: "NE",
    waterTemp: 27,
    kiteRating: "Excelente",
    surfRating: "Moderado",
    swimmingSafe: false,
    bestTime: "1:30 PM - 6:00 PM (Viento térmico)",
    description: "La meca del Kitesurf y Windsurf en el Caribe. Viento térmico consistente casi 300 días al año con aguas cálidas."
  },
  encuentro: {
    location: "Playa Encuentro (Surf Point)",
    regionName: "Costa Norte (Cabarete)",
    windSpeed: 11,
    windDirection: "E (Este)",
    waveHeight: 2.2,
    waveInterval: 12,
    swellDirection: "N-NE",
    waterTemp: 27,
    kiteRating: "Moderado",
    surfRating: "Excelente",
    swimmingSafe: false,
    bestTime: "06:30 AM - 11:00 AM (Viento Offshore)",
    description: "El punto de surf por excelencia de la isla con fondo de arrecife y picos de izquierda y derecha de clase mundial."
  },
  terrenas: {
    location: "Playa El Portillo & Punta Popy",
    regionName: "Península de Samaná",
    windSpeed: 13,
    windDirection: "E (Este)",
    waveHeight: 1.1,
    waveInterval: 7,
    swellDirection: "ENE",
    waterTemp: 28,
    kiteRating: "Moderado",
    surfRating: "Pobre",
    swimmingSafe: true,
    bestTime: "Todo el día para SUP / 2:00 PM para Kite",
    description: "Aguas turquesas ideales para foil, stand-up paddleboard (SUP) y navegación en catamarán con viento constante."
  },
  macao: {
    location: "Playa Macao (Punta Cana)",
    regionName: "Costa Este (La Altagracia)",
    windSpeed: 9,
    windDirection: "SE (Sudeste)",
    waveHeight: 1.6,
    waveInterval: 10,
    swellDirection: "ENE",
    waterTemp: 28,
    kiteRating: "Pobre",
    surfRating: "Excelente",
    swimmingSafe: true,
    bestTime: "07:00 AM - 12:00 PM",
    description: "Playa de fondo de arena ideal para escuelas de surf, principiantes e intermedios con rompiente abierta al Atlántico."
  },
  barahona: {
    location: "Playa Los Patos & Bahoruco",
    regionName: "Costa Sur (Barahona)",
    windSpeed: 15,
    windDirection: "SE (Sudeste)",
    waveHeight: 2.0,
    waveInterval: 11,
    swellDirection: "S-SE",
    waterTemp: 26,
    kiteRating: "Moderado",
    surfRating: "Excelente",
    swimmingSafe: false,
    bestTime: "Temprano en la mañana",
    description: "Potentes olas tubulares sobre fondo de guijarros en el suroeste profundo, recomendadas para surfistas experimentados."
  }
};

export default function ReporteOlasViento() {
  const [selectedSpot, setSelectedSpot] = useState<string>("cabarete");

  const { data: dbReports } = useQuery({
    queryKey: ["marine-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marine_reports")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const getReport = (): MarineReport => {
    const base = spotsList[selectedSpot] || spotsList.cabarete;
    if (dbReports && dbReports.length > 0) {
      const matched = dbReports.find((r: { location?: string }) => r.location?.toLowerCase().includes(selectedSpot.toLowerCase())) as Record<string, unknown> | undefined;
      if (matched) {
        return {
          ...base,
          location: String(matched.location || base.location),
          windSpeed: Number(matched.wind_speed || base.windSpeed),
          windDirection: String(matched.wind_direction || base.windDirection),
          waveHeight: Number(matched.wave_height || base.waveHeight),
          waveInterval: Number(matched.wave_period || base.waveInterval),
          waterTemp: Number(matched.water_temp || base.waterTemp),
          kiteRating: matched.condition_rating === "Excelente" ? "Excelente" : matched.condition_rating === "Buena" ? "Moderado" : "Pobre",
          surfRating: matched.condition_rating === "Excelente" ? "Excelente" : matched.condition_rating === "Buena" ? "Moderado" : "Pobre",
        };
      }
    }
    return base;
  };

  const report = getReport();

  const getRatingBadge = (rating: "Excelente" | "Moderado" | "Pobre") => {
    switch (rating) {
      case "Excelente":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none">Excelente</Badge>;
      case "Moderado":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold border-none">Moderado</Badge>;
      case "Pobre":
        return <Badge className="bg-slate-500 hover:bg-slate-600 text-white font-bold border-none">Pobre</Badge>;
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Reporte de Olas, Viento y Mareas en RD | Descubre República Dominicana"
        description="Consulta en tiempo real la altura de olas, viento (nudos), temperatura del agua y condiciones para surf y kitesurf en Cabarete, Encuentro, Las Terrenas y Macao."
        keywords="reporte olas dominicana, viento cabarete hoy, surf playa encuentro, kitesurf dominicana mareas, olas punta cana macao"
      />
      
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="pb-20">
          {/* Hero Fotográfico Marítimo */}
          <section className="relative min-h-[48vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={puertoPlataImg} 
                alt="Condiciones de oleaje y viento en las playas de República Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/35" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-cyan-500/30 text-cyan-200 border-cyan-400/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Waves className="h-3.5 w-3.5 mr-1.5 text-cyan-300" /> Monitoreo Marítimo & Deportes Náuticos
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4 drop-shadow-md">
                Reporte de <span className="text-cyan-400 italic">Olas y Viento</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Condiciones en tiempo real para surf, kitesurf, windsurf y natación en los principales spots costeros de República Dominicana.
              </p>
            </div>
          </section>

          {/* Selector de Spots */}
          <section className="container mx-auto px-4 -mt-8 relative z-20 max-w-5xl">
            <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-xl flex gap-2 overflow-x-auto justify-start sm:justify-center">
              {[
                { id: "cabarete", name: "Cabarete (Kite)" },
                { id: "encuentro", name: "Playa Encuentro (Surf)" },
                { id: "terrenas", name: "Las Terrenas (Samaná)" },
                { id: "macao", name: "Macao (Punta Cana)" },
                { id: "barahona", name: "Los Patos (Barahona)" }
              ].map((spot) => (
                <Button
                  key={spot.id}
                  variant={selectedSpot === spot.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpot(spot.id)}
                  className={`shrink-0 text-xs font-bold rounded-xl transition-all ${
                    selectedSpot === spot.id ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""
                  }`}
                >
                  {spot.name}
                </Button>
              ))}
            </div>
          </section>

          {/* Reporte Detallado del Spot */}
          <section className="container mx-auto px-4 mt-12 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Lado Izquierdo: Métricas Físicas (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Cabecera del Spot */}
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                      {report.regionName}
                    </span>
                    <h3 className="font-display font-bold text-2xl text-foreground mt-0.5">{report.location}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">{report.description}</p>
                  </div>
                  <Badge variant="secondary" className="bg-background border text-xs shrink-0 font-mono">
                    <Clock className="h-3 w-3 mr-1 text-primary" /> Medición 24h
                  </Badge>
                </div>

                {/* Grid de Métricas */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Viento */}
                  <Card className="border border-border/80 shadow-xs">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl shrink-0">
                        <Wind className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Velocidad Viento</span>
                        <span className="font-extrabold text-2xl text-foreground font-mono">{report.windSpeed}</span>
                        <span className="text-xs text-muted-foreground ml-1">Nudos (Knots)</span>
                        <p className="text-[11px] text-primary font-semibold mt-1 flex items-center gap-1">
                          <Navigation className="h-3 w-3 rotate-45" /> {report.windDirection}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Olas */}
                  <Card className="border border-border/80 shadow-xs">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl shrink-0">
                        <Waves className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Altura Oleaje</span>
                        <span className="font-extrabold text-2xl text-foreground font-mono">{report.waveHeight}m</span>
                        <span className="text-xs text-muted-foreground ml-1">({report.waveInterval}s período)</span>
                        <p className="text-[11px] text-cyan-600 font-semibold mt-1 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Swell: {report.swellDirection}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Temperatura Agua */}
                  <Card className="border border-border/80 shadow-xs">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
                        <Thermometer className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Temperatura Agua</span>
                        <span className="font-extrabold text-2xl text-foreground font-mono">{report.waterTemp}°C</span>
                        <span className="text-xs text-muted-foreground ml-1">/ 81°F</span>
                        <p className="text-[11px] text-muted-foreground mt-1">Sin traje de neopreno</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seguridad de Baño */}
                  <Card className="border border-border/80 shadow-xs">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 ${report.swimmingSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {report.swimmingSafe ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Seguridad Bañistas</span>
                        <span className="font-bold text-base text-foreground block">
                          {report.swimmingSafe ? 'Apto para Nado' : 'Bandera Roja / Fuerte'}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {report.swimmingSafe ? 'Sin corrientes peligrosas' : 'Corrientes de resaca activas'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Lado Derecho: Diagnóstico Deportivo (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="border border-border/80 shadow-md">
                  <CardHeader className="bg-muted/15 pb-4 border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-cyan-500" />
                      <span>Diagnóstico Deportivo Hoy</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Evaluación técnica según vientos térmicos y mareas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center p-3.5 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2.5">
                        <Wind className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm text-foreground">Kitesurf / Wingfoil</span>
                      </div>
                      {getRatingBadge(report.kiteRating)}
                    </div>

                    <div className="flex justify-between items-center p-3.5 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2.5">
                        <Waves className="h-4 w-4 text-cyan-500" />
                        <span className="font-bold text-sm text-foreground">Surf / Bodyboard</span>
                      </div>
                      {getRatingBadge(report.surfRating)}
                    </div>

                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-1 text-xs">
                      <span className="font-bold text-foreground block">⏰ Ventana Óptima de Sesión:</span>
                      <p className="text-muted-foreground leading-relaxed">{report.bestTime}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </section>

          {/* Banner Publicitario Panorama */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <PanoramaAd />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
