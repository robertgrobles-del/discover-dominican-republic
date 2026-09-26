import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, Calendar, Search, RefreshCw, Trophy, 
  Flame, Snowflake, CheckCircle2, XCircle, Clock, 
  Share2, ShieldCheck, ArrowLeft, Building2, Bell
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_LOTTERY_RESULTS, LotteryResult } from "@/pages/Loterias";
import { PreFooterPresidenteBanner } from "@/components/promo";

const COMPANY_INFO: Record<string, {
  name: string;
  fullName: string;
  badge: string;
  logo: string;
  color: string;
  heroGradient: string;
  description: string;
  schedule: string;
  historyText: string;
  popularDraws: string[];
}> = {
  leidsa: {
    name: "LEIDSA",
    fullName: "Lotería Electrónica Internacional Dominicana S.A.",
    badge: "La Lotería del Pueblo Dominicano",
    logo: "🔴",
    color: "from-red-600 to-red-950",
    heroGradient: "from-red-600/20 via-background to-background",
    description: "LEIDSA es la empresa pionera de lotería electrónica en República Dominicana, famosa por el Loto Millonario, Quiniela y Palé LEIDSA, Súper Kino TV y Pega 3 Más.",
    schedule: "Lunes a Sábado a las 8:55 PM / Domingos a las 3:55 PM",
    historyText: "Fundada en 1997, LEIDSA revolucionó los juegos de azar electrónicos en República Dominicana introduciendo transmisiones televisadas en vivo y los botes acumulados más grandes del Caribe.",
    popularDraws: ["Quiniela y Palé LEIDSA", "Loto, Loto Más & Súper Loto", "Súper Kino TV", "Pega 3 Más"]
  },
  nacional: {
    name: "Lotería Nacional",
    fullName: "Lotería Nacional Dominicana",
    badge: "Institución Histórica Estatal",
    logo: "🏛️",
    color: "from-blue-700 to-blue-950",
    heroGradient: "from-blue-600/20 via-background to-background",
    description: "La Lotería Nacional es la institución oficial más antigua de la República Dominicana, fundada por el Padre Billini en 1882 con fines benéficos y sociales.",
    schedule: "Gana Más 2:30 PM / Sorteo Nacional Noche 9:00 PM (Lunes a Domingos)",
    historyText: "Creada el 24 de octubre de 1882 por el Padre Francisco Xavier Billini, nació como una iniciativa filantrópica para sostener el Hospital Padre Billini y la Casa de Beneficencia.",
    popularDraws: ["Gana Más (Mediodía)", "Sorteo Nacional Noche", "Juega+ Pega+", "Billetes Tradicionales"]
  },
  loteka: {
    name: "LOTEKA",
    fullName: "Loteka Dominicana",
    badge: "Mega Chances & Más",
    logo: "🟡",
    color: "from-amber-600 to-yellow-950",
    heroGradient: "from-amber-600/20 via-background to-background",
    description: "Loteka es una de las loterías más modernas de República Dominicana, reconocida por su sorteo estrella 'Mega Chances' que reparte hasta RD$ 50 Millones.",
    schedule: "Todos los días a las 7:55 PM",
    historyText: "Loteka se ha posicionado en el mercado dominicano ofreciendo opciones innovadoras como el Mega Chances, el Extra y la Quiniela Loteka con altas tasas de premiación.",
    popularDraws: ["Mega Chances", "Quiniela Loteka", "Mega Lotto", "El Extra"]
  },
  real: {
    name: "Lotería Real",
    fullName: "Lotería Real del Cibao",
    badge: "Desde Santiago para todo el país",
    logo: "👑",
    color: "from-emerald-700 to-teal-950",
    heroGradient: "from-emerald-600/20 via-background to-background",
    description: "Originaria de Santiago de los Caballeros, la Lotería Real es una de las empresas de sorteos más confiables con sorteos de mediodía de alta sintonía.",
    schedule: "Todos los días a las 12:55 PM / Loto Real Martes y Viernes",
    historyText: "Nacida en el corazón del Cibao, Lotería Real se consolidó como una de las preferidas de las bancas de lotería dominicanas por su puntualidad y transparencia.",
    popularDraws: ["Quiniela Real", "Loto Real", "Pega 4 Real", "Quinielón Real"]
  },
  primera: {
    name: "La Primera",
    fullName: "La Primera Lotería Dominicana",
    badge: "Sorteos de Doble Horario",
    logo: "🟣",
    color: "from-purple-700 to-purple-950",
    heroGradient: "from-purple-600/20 via-background to-background",
    description: "La Primera ofrece dos sorteos diarios (mediodía y noche) con amplia presencia en bancas de lotería de todo el territorio nacional.",
    schedule: "La Primera Día 12:00 PM / La Primera Noche 8:00 PM",
    historyText: "La Primera fue creada para brindar una alternativa moderna y confiable para las jugadas de quiniela, palé y tripleta en horarios clave de la jornada.",
    popularDraws: ["La Primera Mediodía", "La Primera Noche", "Súper Palé de La Primera"]
  },
  suerte: {
    name: "La Suerte Dominicana",
    fullName: "La Suerte Dominicana",
    badge: "La Suerte en tus Manos",
    logo: "🍀",
    color: "from-cyan-700 to-slate-900",
    heroGradient: "from-cyan-600/20 via-background to-background",
    description: "La Suerte Dominicana es un consorcio de sorteos dinámico con sorteos al mediodía y en la tarde.",
    schedule: "Todos los días a las 12:30 PM y 6:00 PM",
    historyText: "La Suerte Dominicana ofrece múltiples modalidades de quinielas y combinaciones con transmisión en canales nacionales y plataformas digitales.",
    popularDraws: ["La Suerte Mediodía", "La Suerte Tarde", "Quiniela La Suerte"]
  },
  newyork: {
    name: "Lotería de New York",
    fullName: "New York Lottery (Sorteos en RD)",
    badge: "Sorteos Oficiales de NY",
    logo: "🗽",
    color: "from-slate-800 to-slate-950",
    heroGradient: "from-slate-700/20 via-background to-background",
    description: "Los resultados de los sorteos diarios de Nueva York retransmitidos y jugados ampliamente en bancas de lotería dominicanas.",
    schedule: "New York Tarde 3:30 PM / New York Noche 11:30 PM",
    historyText: "Debido a la inmensa comunidad dominicana en Nueva York, los sorteos de NY son de los más tradicionales y seguidos en toda República Dominicana.",
    popularDraws: ["New York Midday 3:30 PM", "New York Evening 11:30 PM"]
  },
  florida: {
    name: "Lotería de Florida",
    fullName: "Florida Lottery (Sorteos en RD)",
    badge: "Sorteos Oficiales de Florida",
    logo: "🌴",
    color: "from-orange-700 to-amber-950",
    heroGradient: "from-orange-600/20 via-background to-background",
    description: "Resultados oficiales de los sorteos del estado de Florida muy populares entre las bancas dominicanas.",
    schedule: "Florida Día 2:30 PM / Florida Noche 10:30 PM",
    historyText: "Al igual que New York, Florida cuenta con un gran seguimiento en bancas dominicanas por los lazos de la diáspora quisqueyana.",
    popularDraws: ["Florida Midday (Día)", "Florida Evening (Noche)"]
  },
  king: {
    name: "King Lottery",
    fullName: "King Lottery San Martín",
    badge: "Sorteos del Caribe",
    logo: "👑",
    color: "from-pink-700 to-purple-950",
    heroGradient: "from-pink-600/20 via-background to-background",
    description: "King Lottery ofrece sorteos caribeños reconocidos por su dinamismo y presencia en el mercado de bancas.",
    schedule: "King Día 12:30 PM / King Noche 7:30 PM",
    historyText: "Ampliamente jugada en el este y sur de la República Dominicana con excelentes pagos por combinaciones.",
    popularDraws: ["King Día", "King Noche"]
  }
};

export default function LoteriaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = (slug || "").toLowerCase();

  // Find info
  const company = COMPANY_INFO[normalizedSlug] || COMPANY_INFO.leidsa;
  
  // State for lottery data
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [checkingNumber, setCheckingNumber] = useState("");
  const [checkResult, setCheckResult] = useState<{ found: boolean; draws: { drawName: string; position: number }[] } | null>(null);

  // Load results from storage or fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem("descubre_rd_lottery_results");
      let allResults: LotteryResult[] = stored ? JSON.parse(stored) : DEFAULT_LOTTERY_RESULTS;
      
      const filtered = allResults.filter(
        (r) => r.company.toLowerCase() === normalizedSlug || 
               r.companyName.toLowerCase().includes(normalizedSlug)
      );

      if (filtered.length > 0) {
        setResults(filtered);
      } else {
        // Fallback to defaults
        const defaultFiltered = DEFAULT_LOTTERY_RESULTS.filter(
          (r) => r.company.toLowerCase() === normalizedSlug
        );
        setResults(defaultFiltered.length > 0 ? defaultFiltered : DEFAULT_LOTTERY_RESULTS.slice(0, 3));
      }
    } catch {
      setResults(DEFAULT_LOTTERY_RESULTS.filter(r => r.company.toLowerCase() === normalizedSlug));
    }
  }, [normalizedSlug]);

  const handleCheckNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = checkingNumber.trim().padStart(2, "0");
    if (!cleanNum || cleanNum.length < 2) {
      toast.error("Por favor ingresa un número de 2 dígitos.");
      return;
    }

    const matches: { drawName: string; position: number }[] = [];
    results.forEach((r) => {
      r.winningNumbers.forEach((num, idx) => {
        if (num === cleanNum) {
          matches.push({ drawName: r.drawName, position: idx + 1 });
        }
      });
    });

    if (matches.length > 0) {
      setCheckResult({ found: true, draws: matches });
      toast.success(`¡El número ${cleanNum} salió premiado en ${matches.length} sorteo(s)! 🎉`);
    } else {
      setCheckResult({ found: false, draws: [] });
      toast.info(`El número ${cleanNum} no resultó premiado en los sorteos registrados de hoy.`);
    }
  };

  const handleShare = (drawName: string, numbers: string[]) => {
    const text = `Resultados ${company.name} - ${drawName}: ${numbers.join(" - ")} | Vía Descubre RD`;
    if (navigator.share) {
      navigator.share({ title: `Resultados ${company.name}`, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      toast.success("Resultados copiados al portapapeles.");
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={`Resultados de ${company.name} - Lotería de Hoy República Dominicana`}
        description={`Consulta los últimos resultados de ${company.fullName}: ${company.popularDraws.join(", ")}. Números ganadores, horarios de sorteos y estadísticas en vivo.`}
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-10">
            
            {/* Navigation breadcrumb */}
            <div className="flex items-center justify-between">
              <Link
                to="/loterias"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a todas las Loterías</span>
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 bg-card/60 backdrop-blur-xs">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Actualizado en tiempo real</span>
                </Badge>
              </div>
            </div>

            {/* Hero Company Banner */}
            <div className={`relative overflow-hidden rounded-3xl border border-border p-6 sm:p-10 bg-gradient-to-br ${company.heroGradient}`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{company.logo}</span>
                    <div>
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 text-xs">
                        {company.badge}
                      </Badge>
                      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mt-1">
                        Resultados {company.name}
                      </h1>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-foreground/80 pt-2">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{company.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Number Checker in Hero */}
                <Card className="w-full md:w-80 bg-card/90 backdrop-blur-md border-border shrink-0 shadow-lg">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      Comprobar mi número
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Verifica si tu bolo salió hoy en {company.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <form onSubmit={handleCheckNumber} className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          maxLength={2}
                          placeholder="Ej: 42"
                          value={checkingNumber}
                          onChange={(e) => setCheckingNumber(e.target.value.replace(/\D/g, ""))}
                          className="text-center font-mono font-bold text-lg"
                        />
                        <Button type="submit" size="sm" className="font-bold px-4">
                          Verificar
                        </Button>
                      </div>
                      {checkResult && (
                        <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                          checkResult.found 
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {checkResult.found ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                              <div>
                                <span>¡Premiado en:</span>
                                {checkResult.draws.map((d, i) => (
                                  <div key={i} className="text-foreground">
                                    • {d.drawName} ({d.position}º lugar)
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                              <span>No premiado en los sorteos registrados de hoy.</span>
                            </>
                          )}
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sorteos Cards Grid */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    Sorteos y Números Ganadores de Hoy
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Resultados oficiales certificados para {company.name}
                  </p>
                </div>
                
                {/* Date filter */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 text-xs">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Fecha:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none text-foreground font-medium text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((draw) => (
                  <Card 
                    key={draw.id} 
                    className={`overflow-hidden border-2 bg-card rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 ${draw.colorScheme}`}
                  >
                    <CardHeader className="p-5 pb-3 bg-card/60 backdrop-blur-xs border-b border-border/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-background/80 flex items-center justify-center text-lg shadow-xs">
                            {draw.logo || company.logo}
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold font-display text-foreground">
                              {draw.drawName}
                            </CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1.5 mt-0.5 text-muted-foreground font-medium">
                              <Clock className="h-3 w-3 text-primary" />
                              <span>{draw.drawTime}</span>
                              <span>•</span>
                              <span>{draw.date}</span>
                            </CardDescription>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleShare(draw.drawName, draw.winningNumbers)}
                          title="Compartir resultados"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      {/* Winning Numbers Balls */}
                      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
                        {draw.winningNumbers.map((num, idx) => {
                          const isGold = idx === 0;
                          const isSilver = idx === 1;
                          const isBronze = idx === 2;

                          let ballBg = "bg-primary text-primary-foreground";
                          if (isGold) ballBg = "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black shadow-amber-500/30";
                          else if (isSilver) ballBg = "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-950 font-bold shadow-slate-400/30";
                          else if (isBronze) ballBg = "bg-gradient-to-b from-amber-600 to-amber-800 text-white font-bold shadow-amber-800/30";
                          else ballBg = "bg-secondary text-secondary-foreground font-bold";

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-mono shadow-md transform hover:scale-105 transition-transform ${ballBg}`}>
                                {num}
                              </div>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                {idx === 0 ? "1er" : idx === 1 ? "2do" : idx === 2 ? "3er" : `${idx + 1}º`}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Jackpot / Extras */}
                      {draw.jackpotOrExtra && (
                        <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold text-center">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          <span>{draw.jackpotOrExtra}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Other Lotteries Switcher */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Explorar otras loterías dominicanas
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(COMPANY_INFO).map(([key, info]) => {
                  if (key === normalizedSlug) return null;
                  return (
                    <Link key={key} to={`/loteria/${key}`}>
                      <Button variant="outline" size="sm" className="rounded-xl gap-2 hover:border-primary/50">
                        <span>{info.logo}</span>
                        <span>{info.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Historical info & disclaimer */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Sobre {company.fullName}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {company.historyText}
              </p>
              <p className="text-[11px] text-muted-foreground/70 italic pt-2 border-t border-border/50">
                Aviso: Los resultados publicados son de carácter meramente informativo y son recolectados de las transmisiones oficiales en vivo. Descubre RD no realiza venta de lotería ni apuestas. En caso de discrepancia, prevalecerán las actas oficiales de los sorteos de la empresa emisora.
              </p>
            </div>

            {/* Prefooter Promo */}
            <PreFooterPresidenteBanner />

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
