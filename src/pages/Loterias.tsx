import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Calendar, Search, RefreshCw, Trophy, 
  Flame, Snowflake, CheckCircle2, XCircle, Clock, 
  Share2, ShieldCheck, HelpCircle, Gift
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface LotteryResult {
  id: string;
  company: "leidsa" | "nacional" | "loteka" | "real" | "primera" | "suerte" | "newyork" | "florida" | "king";
  companyName: string;
  drawName: string;
  drawTime: string;
  date: string;
  winningNumbers: string[];
  jackpotOrExtra?: string;
  colorScheme: string;
  logo: string;
}

export const DEFAULT_LOTTERY_RESULTS: LotteryResult[] = [
  // LEIDSA
  {
    id: "lei-1",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Quiniela y Palé LEIDSA",
    drawTime: "8:55 PM",
    date: "Hoy",
    winningNumbers: ["42", "18", "77"],
    jackpotOrExtra: "Súper Palé Activo",
    colorScheme: "from-red-600 to-red-900 border-red-500/30",
    logo: "🔴"
  },
  {
    id: "lei-2",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Loto, Loto Más & Súper Loto",
    drawTime: "8:55 PM (Mié/Sáb)",
    date: "Hoy",
    winningNumbers: ["04", "12", "19", "25", "31", "38"],
    jackpotOrExtra: "Acumulado: RD$ 420 Millones",
    colorScheme: "from-red-700 to-amber-900 border-red-500/30",
    logo: "🎰"
  },
  {
    id: "lei-3",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Pega 3 Más",
    drawTime: "8:55 PM",
    date: "Hoy",
    winningNumbers: ["14", "22", "09"],
    colorScheme: "from-red-600 to-rose-900 border-red-500/30",
    logo: "🔴"
  },
  {
    id: "lei-4",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Súper Kino TV",
    drawTime: "8:55 PM",
    date: "Hoy",
    winningNumbers: ["03", "07", "11", "15", "23", "34", "41", "55", "62", "79"],
    jackpotOrExtra: "Premio RD$ 25 Millones",
    colorScheme: "from-rose-600 to-pink-900 border-rose-500/30",
    logo: "📺"
  },

  // LOTERÍA NACIONAL
  {
    id: "nac-1",
    company: "nacional",
    companyName: "Lotería Nacional",
    drawName: "Gana Más (Mediodía)",
    drawTime: "2:30 PM",
    date: "Hoy",
    winningNumbers: ["88", "34", "12"],
    colorScheme: "from-blue-700 to-blue-950 border-blue-500/30",
    logo: "🏛️"
  },
  {
    id: "nac-2",
    company: "nacional",
    companyName: "Lotería Nacional",
    drawName: "Sorteo Nacional Noche",
    drawTime: "9:00 PM",
    date: "Hoy",
    winningNumbers: ["15", "73", "29"],
    colorScheme: "from-blue-800 to-indigo-950 border-blue-500/30",
    logo: "🏛️"
  },
  {
    id: "nac-3",
    company: "nacional",
    companyName: "Lotería Nacional",
    drawName: "Juega+ Pega+",
    drawTime: "2:30 PM",
    date: "Hoy",
    winningNumbers: ["05", "18", "21", "33", "02"],
    jackpotOrExtra: "Premio RD$ 300,000",
    colorScheme: "from-blue-600 to-cyan-900 border-blue-500/30",
    logo: "🔵"
  },

  // LOTEKA
  {
    id: "lot-1",
    company: "loteka",
    companyName: "LOTEKA",
    drawName: "Mega Chances",
    drawTime: "7:55 PM",
    date: "Hoy",
    winningNumbers: ["08", "24", "49", "61", "85"],
    jackpotOrExtra: "Reparte RD$ 50 Millones",
    colorScheme: "from-amber-600 to-yellow-900 border-amber-500/30",
    logo: "🟡"
  },
  {
    id: "lot-2",
    company: "loteka",
    companyName: "LOTEKA",
    drawName: "Quiniela Loteka",
    drawTime: "7:55 PM",
    date: "Hoy",
    winningNumbers: ["56", "11", "90"],
    colorScheme: "from-amber-500 to-orange-950 border-amber-500/30",
    logo: "🟡"
  },

  // LOTERÍA REAL
  {
    id: "rea-1",
    company: "real",
    companyName: "Lotería Real",
    drawName: "Quiniela Real",
    drawTime: "12:55 PM",
    date: "Hoy",
    winningNumbers: ["23", "45", "81"],
    colorScheme: "from-emerald-700 to-teal-950 border-emerald-500/30",
    logo: "👑"
  },
  {
    id: "rea-2",
    company: "real",
    companyName: "Lotería Real",
    drawName: "Loto Real",
    drawTime: "12:55 PM (Mar/Vie)",
    date: "Hoy",
    winningNumbers: ["09", "17", "22", "30", "35", "37"],
    jackpotOrExtra: "Acumulado RD$ 18.5 Millones",
    colorScheme: "from-emerald-600 to-teal-900 border-emerald-500/30",
    logo: "👑"
  },

  // LA PRIMERA
  {
    id: "pri-1",
    company: "primera",
    companyName: "La Primera",
    drawName: "La Primera Mediodía",
    drawTime: "12:00 PM",
    date: "Hoy",
    winningNumbers: ["67", "03", "49"],
    colorScheme: "from-purple-700 to-purple-950 border-purple-500/30",
    logo: "🟣"
  },
  {
    id: "pri-2",
    company: "primera",
    companyName: "La Primera",
    drawName: "La Primera Noche",
    drawTime: "8:00 PM",
    date: "Hoy",
    winningNumbers: ["38", "91", "14"],
    colorScheme: "from-purple-800 to-indigo-950 border-purple-500/30",
    logo: "🟣"
  },

  // LA SUERTE DOMINICANA
  {
    id: "sue-1",
    company: "suerte",
    companyName: "La Suerte Dominicana",
    drawName: "La Suerte Mediodía",
    drawTime: "12:30 PM",
    date: "Hoy",
    winningNumbers: ["19", "54", "02"],
    colorScheme: "from-cyan-700 to-slate-900 border-cyan-500/30",
    logo: "🍀"
  },

  // NEW YORK
  {
    id: "ny-1",
    company: "newyork",
    companyName: "New York",
    drawName: "New York Tarde (Mediodía)",
    drawTime: "3:30 PM",
    date: "Hoy",
    winningNumbers: ["72", "16", "44"],
    colorScheme: "from-slate-800 to-slate-950 border-slate-700",
    logo: "🗽"
  },
  {
    id: "ny-2",
    company: "newyork",
    companyName: "New York",
    drawName: "New York Noche",
    drawTime: "11:30 PM",
    date: "Hoy",
    winningNumbers: ["05", "89", "33"],
    colorScheme: "from-slate-900 to-slate-950 border-slate-700",
    logo: "🗽"
  },

  // FLORIDA
  {
    id: "fl-1",
    company: "florida",
    companyName: "Florida",
    drawName: "Florida Día",
    drawTime: "2:30 PM",
    date: "Hoy",
    winningNumbers: ["31", "66", "10"],
    colorScheme: "from-orange-700 to-amber-950 border-orange-500/30",
    logo: "🌴"
  }
];

// Stats for hot & cold numbers
const HOT_COLD_STATS = {
  hotNumbers: [
    { num: "42", count: 18, lastSeen: "Hoy (Leidsa)" },
    { num: "88", count: 16, lastSeen: "Hoy (Gana Más)" },
    { num: "18", count: 15, lastSeen: "Hoy (Leidsa)" },
    { num: "23", count: 14, lastSeen: "Hoy (Real)" },
    { num: "56", count: 14, lastSeen: "Ayer" }
  ],
  coldNumbers: [
    { num: "01", daysMissing: 48, note: "48 días sin salir en 1ra" },
    { num: "99", daysMissing: 39, note: "39 días sin salir en 1ra" },
    { num: "47", daysMissing: 35, note: "35 días sin salir" },
    { num: "13", daysMissing: 31, note: "31 días sin salir" }
  ]
};

export default function Loterias() {
  const [results, setResults] = useState<LotteryResult[]>(DEFAULT_LOTTERY_RESULTS);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Lucky Number Checker Tool
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [checkResult, setCheckResult] = useState<{
    tested: boolean;
    matches: { draw: string; position: number; date: string }[];
  } | null>(null);

  // Load from LocalStorage or Supabase or fallback
  const fetchLotteryData = async () => {
    try {
      const stored = localStorage.getItem("descubre_rd_lottery_results");
      if (stored) {
        setResults(JSON.parse(stored));
        return;
      }

      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("event_type", "lottery_results_sync")
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].metadata?.results) {
        setResults(data[0].metadata.results);
      }
    } catch (err) {
      console.log("Using default lottery results baseline");
    }
  };

  useEffect(() => {
    fetchLotteryData();
  }, [selectedDate]);

  const handleTestNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = checkNumber.trim().padStart(2, "0");
    if (!cleanNum || cleanNum.length < 2) {
      toast.error("Ingresa un número de 2 dígitos (ej. 42 o 08).");
      return;
    }

    const matches: { draw: string; position: number; date: string }[] = [];

    results.forEach((r) => {
      const pos = r.winningNumbers.indexOf(cleanNum);
      if (pos !== -1) {
        matches.push({
          draw: `${r.companyName} - ${r.drawName}`,
          position: pos + 1,
          date: r.date
        });
      }
    });

    setCheckResult({
      tested: true,
      matches
    });

    if (matches.length > 0) {
      toast.success(`¡El número ${cleanNum} resultó ganador en ${matches.length} sorteo(s) hoy! 🎉`);
    } else {
      toast.info(`El número ${cleanNum} no ha salido premiado en la fecha seleccionada.`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Resultados de Loterías Dominicanas - Descubre RD",
        text: "Consulta los números ganadores de Leidsa, Lotería Nacional, Loteka, Real y más.",
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace de resultados copiado al portapapeles 📋");
    }
  };

  const filteredResults = results.filter((r) => {
    const matchCompany = selectedCompany === "all" || r.company === selectedCompany;
    const matchSearch = r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.drawName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.winningNumbers.some((num) => num.includes(searchQuery));
    return matchCompany && matchSearch;
  });

  const companiesList = [
    { id: "all", name: "Todas las Loterías", logo: "🇩🇴" },
    { id: "leidsa", name: "LEIDSA", logo: "🔴" },
    { id: "nacional", name: "Lotería Nacional", logo: "🏛️" },
    { id: "loteka", name: "LOTEKA", logo: "🟡" },
    { id: "real", name: "Lotería Real", logo: "👑" },
    { id: "primera", name: "La Primera", logo: "🟣" },
    { id: "suerte", name: "La Suerte", logo: "🍀" },
    { id: "newyork", name: "New York", logo: "🗽" },
    { id: "florida", name: "Florida", logo: "🌴" }
  ];

  return (
    <PageTransition>
      <SEOHead
        title="Resultados de Loterías Dominicanas en Vivo - Leidsa, Nacional, Loteka, Real"
        description="Números ganadores de las loterías dominicanas hoy: Leidsa (Loto, Quiniela), Lotería Nacional (Gana Más), Loteka, Real, La Primera, New York y Florida. Historial y comprobador de jugadas."
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-10">
            
            {/* HERO SECTION */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-primary/20 text-white p-6 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1">
                    🇩🇴 Sorteos Oficiales de RD
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/20 text-[10px]">
                    Actualización en Tiempo Real
                  </Badge>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                  Resultados de <span className="text-amber-400">Loterías Dominicanas</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
                  Consulta al instante los números ganadores de todas las empresas de lotería en República Dominicana: LEIDSA, Lotería Nacional, LOTEKA, Lotería Real, La Primera, New York y Florida.
                </p>

                {/* Company Filter Pills */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {companiesList.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedCompany(comp.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCompany === comp.id
                          ? "bg-amber-500 text-slate-950 shadow-md font-black scale-105"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      <span>{comp.logo}</span>
                      <span>{comp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TOOLBAR: DATE FILTER & CHECKER */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Date & Search Toolbar (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Search & Date Filter Card */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por sorteo o número..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-xl text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-1 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-foreground text-xs focus:outline-hidden font-bold cursor-pointer"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="rounded-xl text-xs h-9 gap-1 font-semibold"
                    >
                      <Share2 className="h-3.5 w-3.5 text-primary" /> Compartir
                    </Button>
                  </div>
                </div>

                {/* LOTTERY RESULTS GRID */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredResults.map((result) => (
                    <Card
                      key={result.id}
                      className="rounded-3xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-md overflow-hidden flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{result.logo}</span>
                            <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                              {result.companyName}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                            {result.drawName}
                          </h3>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-primary flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" /> {result.drawTime}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">{result.date}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-4 space-y-4">
                        {/* Winning Balls Visualization */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
                          {result.winningNumbers.map((num, idx) => {
                            const isFirst = idx === 0;
                            const isSecond = idx === 1;
                            const isThird = idx === 2;

                            return (
                              <div
                                key={idx}
                                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center font-mono font-black shadow-lg transition-transform hover:scale-110 select-none ${
                                  isFirst
                                    ? "bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border-2 border-amber-300 ring-2 ring-amber-400/20"
                                    : isSecond
                                    ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white border-2 border-blue-300"
                                    : isThird
                                    ? "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-2 border-emerald-300"
                                    : "bg-gradient-to-b from-slate-700 to-slate-900 text-white border border-slate-600"
                                }`}
                              >
                                <span className="text-base sm:text-lg leading-none">{num}</span>
                                {result.winningNumbers.length <= 3 && (
                                  <span className="text-[8px] font-sans font-bold uppercase opacity-80">
                                    {isFirst ? "1ra" : isSecond ? "2da" : "3ra"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Jackpot / Extra Info */}
                        {result.jackpotOrExtra && (
                          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center text-xs font-bold text-primary flex items-center justify-center gap-1.5">
                            <Gift className="h-3.5 w-3.5 text-amber-500" />
                            <span>{result.jackpotOrExtra}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                          <Link
                            to={`/loteria/${result.company}`}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>Ver todos los sorteos de {result.companyName}</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

              </div>

              {/* Right Column: Lucky Number Checker & Hot/Cold Stats (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* LUCKY NUMBER CHECKER */}
                <Card className="rounded-3xl border-2 border-amber-500/30 bg-card shadow-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Comprobar Mi Jugada / Número
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Verifica si tu número o palé salió premiado en cualquiera de las loterías hoy.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    <form onSubmit={handleTestNumber} className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-foreground mb-1 block">
                          Número a Consultar (00 al 99)
                        </Label>
                        <Input
                          type="text"
                          maxLength={2}
                          placeholder="Ej. 42"
                          value={checkNumber}
                          onChange={(e) => setCheckNumber(e.target.value.replace(/\D/g, ""))}
                          className="font-mono text-center text-2xl font-black rounded-xl tracking-widest h-12 bg-background"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs h-10 shadow-md shadow-amber-500/20"
                      >
                        Comprobar Número en Sorteos
                      </Button>
                    </form>

                    {/* Result of check */}
                    {checkResult && checkResult.tested && (
                      <div
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          checkResult.matches.length > 0
                            ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                            : "bg-muted/80 border-border text-muted-foreground"
                        }`}
                      >
                        {checkResult.matches.length > 0 ? (
                          <>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                              <CheckCircle2 className="h-4 w-4" /> ¡Felicidades! Salió premiado:
                            </div>
                            <div className="space-y-1 pt-1">
                              {checkResult.matches.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-foreground">{m.draw}</span>
                                  <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black">
                                    {m.position}ª Posición
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center space-y-1">
                            <p className="font-bold text-foreground">El número {checkNumber} no ha salido hoy</p>
                            <p className="text-[11px] text-muted-foreground">¡Sigue probando tu suerte en los próximos sorteos!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* HOT & COLD NUMBERS STATS */}
                <Card className="rounded-3xl border-border bg-card shadow-sm p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Números Más Frecuentes (Calientes)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Mayor cantidad de salidas este mes:</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {HOT_COLD_STATS.hotNumbers.map((item) => (
                      <div
                        key={item.num}
                        className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-mono font-bold flex items-center gap-1.5"
                      >
                        <span className="text-sm font-black">{item.num}</span>
                        <span className="text-[10px] opacity-80">({item.count}x)</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Snowflake className="h-4 w-4 text-cyan-500" />
                      Números Atrasados (Fríos)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Mayor tiempo sin salir en primera:</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {HOT_COLD_STATS.coldNumbers.map((item) => (
                      <div key={item.num} className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">{item.num}</span>
                        <span className="text-[11px]">{item.note}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Responsible Gaming Notice */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Juega con responsabilidad. Los sorteos son organizados y regulados por las entidades oficiales de loterías de la República Dominicana.</span>
                </div>

              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
