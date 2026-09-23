import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Clock, Globe, Sun, Moon, Sunrise, Sunset, Info, 
  Plane, Sparkles, MapPin, Search, ArrowRightLeft
} from "lucide-react";
import { PanoramaAd } from "@/components/promo";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

interface CiudadRef {
  ciudad: string;
  pais: string;
  zona: string;
  offset: number;
  emoji: string;
  region: "America" | "Europa" | "Latam";
}

const ciudadesReferencia: CiudadRef[] = [
  { ciudad: "Santo Domingo", pais: "República Dominicana", zona: "AST (UTC-4)", offset: -4, emoji: "🇩🇴", region: "America" },
  { ciudad: "Miami / Florida", pais: "Estados Unidos", zona: "EDT / EST", offset: -4, emoji: "🇺🇸", region: "America" },
  { ciudad: "Nueva York", pais: "Estados Unidos", zona: "EDT / EST", offset: -4, emoji: "🇺🇸", region: "America" },
  { ciudad: "Montreal / Toronto", pais: "Canadá", zona: "EDT / EST", offset: -4, emoji: "🇨🇦", region: "America" },
  { ciudad: "Madrid", pais: "España", zona: "CEST / CET", offset: 2, emoji: "🇪🇸", region: "Europa" },
  { ciudad: "París", pais: "Francia", zona: "CEST / CET", offset: 2, emoji: "🇫🇷", region: "Europa" },
  { ciudad: "Londres", pais: "Reino Unido", zona: "BST / GMT", offset: 1, emoji: "🇬🇧", region: "Europa" },
  { ciudad: "Frankfurt / Berlín", pais: "Alemania", zona: "CEST / CET", offset: 2, emoji: "🇩🇪", region: "Europa" },
  { ciudad: "Bogotá", pais: "Colombia", zona: "COT (UTC-5)", offset: -5, emoji: "🇨🇴", region: "Latam" },
  { ciudad: "Ciudad de México", pais: "México", zona: "CST (UTC-6)", offset: -6, emoji: "🇲🇽", region: "Latam" },
  { ciudad: "Buenos Aires", pais: "Argentina", zona: "ART (UTC-3)", offset: -3, emoji: "🇦🇷", region: "Latam" },
  { ciudad: "Los Ángeles / California", pais: "Estados Unidos", zona: "PDT (UTC-7)", offset: -7, emoji: "🇺🇸", region: "America" },
];

const datosRD = {
  zona: "Atlantic Standard Time (AST)",
  offset: "UTC -4 Horas fijas",
  dst: "Sin cambio de hora estacional (No DST)",
  amanecer: "06:15 AM - 06:40 AM",
  atardecer: "06:30 PM - 07:15 PM"
};

export default function ZonasHorarias() {
  const [horaRD, setHoraRD] = useState(new Date());
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraRD(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getHoraEnCiudad = (offset: number) => {
    const rdOffset = -4;
    const diff = offset - rdOffset;
    const horaLocal = new Date(horaRD.getTime() + diff * 60 * 60 * 1000);
    return horaLocal;
  };

  const formatHora = (date: Date) => {
    return date.toLocaleTimeString('es-DO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const esDia = (hora: Date) => {
    const h = hora.getHours();
    return h >= 6 && h < 19;
  };

  const filteredCiudades = ciudadesReferencia.filter(c => {
    const matchesRegion = filterRegion === "all" || c.region === filterRegion;
    const matchesSearch = c.ciudad.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.pais.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Zona Horaria y Hora Actual en República Dominicana | Descubre RD"
        description="Consulta la hora actual en tiempo real en República Dominicana (AST / UTC-4), comparador con husos horarios de EE.UU., Europa y Latinoamérica, y consejos contra el jet lag."
        keywords="hora actual republica dominicana, zona horaria punta cana, hora santo domingo ahora, diferencia horaria espana dominicana, hora ast caribe"
      />
      
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="pb-20">
          {/* Hero Fotográfico con Reloj en Vivo */}
          <section className="relative min-h-[48vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={santoDomingoImg} 
                alt="Zona Horaria de República Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/65 to-black/35" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-primary/20 text-white border-primary/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" /> Husos Horarios & Horas de Vuelo
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4 drop-shadow-md">
                Zona Horaria de <span className="text-primary italic">República Dominicana</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                República Dominicana opera en <strong>Atlantic Standard Time (AST / UTC-4)</strong> todo el año, sin variaciones por horario de verano.
              </p>
            </div>
          </section>

          {/* Reloj Principal en Tiempo Real */}
          <section className="container mx-auto px-4 -mt-10 relative z-20 max-w-4xl">
            <Card className="overflow-hidden border border-border/80 shadow-2xl bg-card">
              <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground p-8 text-center">
                <Badge className="bg-white/20 text-white border-none mb-3 text-xs font-semibold">
                  🇩🇴 Hora Oficial de Santo Domingo
                </Badge>
                <div className="text-5xl md:text-7xl font-extrabold font-mono tracking-wider drop-shadow-sm mb-2">
                  {formatHora(horaRD)}
                </div>
                <p className="text-sm md:text-base opacity-90 capitalize font-medium">
                  {horaRD.toLocaleDateString('es-DO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/50">
                    <Globe className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                    <p className="font-bold text-xs text-foreground">{datosRD.zona}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{datosRD.offset}</p>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/50">
                    <Sparkles className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                    <p className="font-bold text-xs text-foreground">Horario de Verano</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{datosRD.dst}</p>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/50">
                    <Sunrise className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
                    <p className="font-bold text-xs text-foreground">Salida del Sol</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{datosRD.amanecer}</p>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/50">
                    <Sunset className="h-5 w-5 mx-auto mb-1.5 text-orange-500" />
                    <p className="font-bold text-xs text-foreground">Puesta de Sol</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{datosRD.atardecer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Comparador de Ciudades Emisoras */}
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Diferencias Horarias</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Hora en Ciudades Emisoras de Viajeros
                </h2>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Filtrar ciudad..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <div className="flex gap-1">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "America", label: "Norteamérica" },
                    { id: "Europa", label: "Europa" },
                    { id: "Latam", label: "Latam" },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={filterRegion === tab.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterRegion(tab.id)}
                      className="text-xs h-9"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCiudades.map((c) => {
                const horaLocal = getHoraEnCiudad(c.offset);
                const dia = esDia(horaLocal);
                const diff = c.offset - (-4);
                const isRD = c.ciudad === "Santo Domingo";

                return (
                  <Card 
                    key={c.ciudad} 
                    className={`overflow-hidden border transition-all ${
                      isRD ? "border-primary bg-primary/5 shadow-md" : "border-border/80 hover:border-primary/40 bg-card"
                    }`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl shrink-0">{c.emoji}</span>
                        <div>
                          <p className="font-bold text-sm text-foreground">{c.ciudad}</p>
                          <p className="text-[11px] text-muted-foreground">{c.pais}</p>
                          <span className="text-[10px] text-muted-foreground/80 font-mono">{c.zona}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1">
                          {dia ? (
                            <Sun className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Moon className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="text-lg font-bold font-mono text-foreground">
                            {formatHora(horaLocal).split(" ")[0]}
                          </span>
                        </div>
                        <Badge 
                          variant={isRD ? "default" : "secondary"} 
                          className="text-[10px] font-semibold"
                        >
                          {diff === 0 
                            ? "Misma hora que RD" 
                            : diff > 0 
                              ? `+${diff}h adelante` 
                              : `${diff}h atrás`
                          }
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Consejos Clave para el Viajero & Jet Lag */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Recomendaciones para Viajeros Internacionales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground leading-relaxed">
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-1.5">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    📱 Sincronización Automática
                  </h4>
                  <p>
                    Al aterrizar en los aeropuertos PUJ, SDQ o STI, tu smartphone se conectará a las redes locales (Claro / Altice) y ajustará la hora automáticamente a UTC-4.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-1.5">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    ✈️ Vuelos desde Europa
                  </h4>
                  <p>
                    Los viajeros provenientes de España, Francia o Alemania enfrentan una diferencia de 5 a 6 horas. Se recomienda hidratarse abundantemente y exponerse a la luz solar caribeña durante las primeras mañanas.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-1.5">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    ☀️ Días Equilibrados Todo el Año
                  </h4>
                  <p>
                    Por su latitud cercana al ecuador (18°N), la duración de la luz solar oscila entre 11 y 13 horas los 365 días del año.
                  </p>
                </div>
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
