import { useState, useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
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
  Flame, Snowflake, CheckCircle2, Clock, 
  Share2, ShieldCheck, ArrowLeft, Building2, History
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import { LotteryResult, resolveDrawSlug } from "@/data/loteriasData";
import { fetchLotteryResults, fetchLotteryDetail, fetchLotteries } from "@/services/lotteryService";
import type { LotteryCompanyWithDraws } from "@/types/lotteryRelational";
import { LotteryCard } from "@/components/loterias/LotteryCard";
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
    schedule: "La Primera Mediodía 12:00 PM / La Primera Noche 8:00 PM",
    historyText: "Con una propuesta fresca y dinámica, La Primera ha ganado terreno en el público dominicano por la rapidez de sus resultados.",
    popularDraws: ["La Primera Mediodía", "La Primera Noche"]
  },
  suerte: {
    name: "La Suerte",
    fullName: "La Suerte Dominicana",
    badge: "Sorteos Tradicionales",
    logo: "🍀",
    color: "from-cyan-700 to-slate-900",
    heroGradient: "from-cyan-600/20 via-background to-background",
    description: "La Suerte Dominicana es una de las marcas de sorteos más populares de la República Dominicana, con sorteos al mediodía y tarde.",
    schedule: "La Suerte 12:30 PM / La Suerte Tarde 6:00 PM",
    historyText: "Reconocida por la agilidad en sus quinielas y palés, La Suerte Dominicana es infaltable en el seguimiento diario de sorteos.",
    popularDraws: ["La Suerte Mediodía", "La Suerte Tarde"]
  },
  king: {
    name: "King Lottery",
    fullName: "King Lottery Caribe",
    badge: "El Rey de los Sorteos",
    logo: "👑",
    color: "from-amber-600 to-yellow-950",
    heroGradient: "from-amber-600/20 via-background to-background",
    description: "King Lottery ofrece sorteos caribeños diarios de alta premiación y transmisión en vivo.",
    schedule: "King Lottery Mediodía 12:30 PM / King Lottery Noche 7:30 PM",
    historyText: "Operando en el Caribe y ampliamente jugada en República Dominicana por sus excelentes pagos.",
    popularDraws: ["King Lottery Mediodía", "King Lottery Noche"]
  },
  newyork: {
    name: "New York",
    fullName: "Lotería de Nueva York",
    badge: "Sorteos Internacionales",
    logo: "🗽",
    color: "from-slate-800 to-slate-950",
    heroGradient: "from-slate-700/20 via-background to-background",
    description: "Resultados oficiales de los sorteos de la Lotería de Nueva York (New York Midday y Evening), ampliamente jugados en bancas dominicanas.",
    schedule: "New York Tarde 3:30 PM / New York Noche 11:30 PM",
    historyText: "Debido a la gran diáspora dominicana en EE.UU., los sorteos de Nueva York son de los más seguidos en RD.",
    popularDraws: ["New York Tarde (Mediodía)", "New York Noche"]
  },
  florida: {
    name: "Florida",
    fullName: "Lotería de la Florida",
    badge: "Sorteos Internacionales",
    logo: "🌴",
    color: "from-orange-700 to-amber-950",
    heroGradient: "from-orange-600/20 via-background to-background",
    description: "Resultados oficiales de los sorteos Pick 3 y Pick 4 de la Lotería de Florida (Día y Noche).",
    schedule: "Florida Día 2:30 PM / Florida Noche 10:30 PM",
    historyText: "Seguida masivamente por la comunidad caribeña y jugadores locales en bancas de lotería.",
    popularDraws: ["Florida Día", "Florida Noche"]
  },
  anguila: {
    name: "Anguila Lottery",
    fullName: "Anguila Lottery Oficial",
    badge: "Cuatro Emisiones Diarias",
    logo: "🌊",
    color: "from-teal-700 to-slate-950",
    heroGradient: "from-teal-600/20 via-background to-background",
    description: "Sorteos de Anguila con emisiones a las 10:00 AM, 1:00 PM, 6:00 PM y 9:00 PM.",
    schedule: "10:00 AM / 1:00 PM / 6:00 PM / 9:00 PM (Todos los días)",
    historyText: "Muy popular en el Caribe con múltiples oportunidades diarias para ganar.",
    popularDraws: ["Anguila 10:00 AM", "Anguila 1:00 PM", "Anguila 6:00 PM", "Anguila 9:00 PM"]
  }
};

export default function LoteriaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = (slug || "leidsa").toLowerCase();
  // Ficha del panel (Turso) encima de los datos locales: lo que se rellena en el panel manda.
  const [remote, setRemote] = useState<LotteryCompanyWithDraws | null | undefined>(undefined);
  const [allLotteries, setAllLotteries] = useState<LotteryCompanyWithDraws[]>([]);
  useEffect(() => {
    setRemote(undefined);
    void fetchLotteryDetail(normalizedSlug).then(setRemote);
  }, [normalizedSlug]);
  useEffect(() => { void fetchLotteries().then(setAllLotteries); }, []);
  const company = useMemo(() => {
    const local = COMPANY_INFO[normalizedSlug];
    const drawNames = remote?.draws.map((d) => d.name) ?? [];
    const schedules = [...new Set(remote?.draws.map((d) => d.schedule_description).filter(Boolean) as string[] ?? [])];
    return {
      name: remote?.name || local?.name || normalizedSlug,
      fullName: local?.fullName || remote?.name || normalizedSlug,
      badge: remote?.slogan || local?.badge || remote?.country || "Lotería",
      logo: local?.logo || "🎰",
      color: local?.color || "from-sky-600 to-blue-900",
      heroGradient: local?.heroGradient || "",
      description: remote?.description || local?.description || "",
      schedule: local?.schedule || schedules.slice(0, 2).join(" / ") || "",
      historyText: local?.historyText || remote?.description || "",
      popularDraws: local?.popularDraws || drawNames.slice(0, 4),
    };
  }, [normalizedSlug, remote]);

  const [draws, setDraws] = useState<LotteryResult[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [searchFilter, setSearchFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Checker
  const [checkNum, setCheckNum] = useState("");
  const [checkResult, setCheckResult] = useState<{
    tested: boolean;
    matches: { draw: string; pos: number }[];
  } | null>(null);

  useEffect(() => {
    const loadCompanyDraws = async () => {
      setIsLoading(true);
      try {
        const live = await fetchLotteryResults(selectedDate, normalizedSlug);
        if (live && live.length > 0) {
          const adapted: LotteryResult[] = live.map((r) => ({
            id: r.id,
            company: normalizedSlug as LotteryResult["company"],
            companyName: r.lottery_draws?.lotteries?.name || company.name,
            drawName: r.lottery_draws?.name || "Sorteo",
            drawTime: r.lottery_draws?.draw_time?.substring(0, 5) || "Hoy",
            date: r.draw_date || selectedDate,
            winningNumbers: (r.winning_numbers || []).map((n) => String(n).padStart(2, "0")),
            bonusNumber: r.bonus_number,
            jackpotOrExtra: r.jackpot_amount || undefined,
            colorScheme: company.color,
            logo: company.logo,
            logoUrl: r.lottery_draws?.logo_url || r.lottery_draws?.lotteries?.logo_url || null,
          }));
          setDraws(adapted);
        } else {
          setDraws([]); // sin resultados reales para esa fecha: nada de números de ejemplo
        }
      } catch {
        setDraws([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyDraws();
  }, [normalizedSlug, selectedDate, company.color, company.logo, company.name]);

  const handleTestNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = checkNum.trim().padStart(2, "0");
    if (!clean || clean.length < 2) {
      toast.error("Ingresa un número de 2 dígitos (00-99).");
      return;
    }

    const matches: { draw: string; pos: number }[] = [];
    draws.forEach((d) => {
      const idx = d.winningNumbers.indexOf(clean);
      if (idx !== -1) {
        matches.push({ draw: d.drawName, pos: idx + 1 });
      }
    });

    setCheckResult({ tested: true, matches });

    if (matches.length > 0) {
      toast.success(`¡El número ${clean} resultó premiado en ${matches.length} sorteo(s) de ${company.name}! 🎉`);
    } else {
      toast.info(`El número ${clean} no ha salido premiado en ${company.name} para esta fecha.`);
    }
  };

  const handleShare = (drawName: string, nums: string[]) => {
    const text = `Resultados ${company.name} (${drawName}): ${nums.join(" - ")}`;
    if (navigator.share) {
      navigator.share({ title: company.fullName, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} - Vía ${window.location.href}`);
      toast.success("Resultados copiados al portapapeles 📋");
    }
  };

  const filteredDraws = draws.filter((d) =>
    d.drawName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.winningNumbers.some((num) => num.includes(searchFilter))
  );

  const { t, locale } = useI18n();

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": company.fullName,
        "alternateName": company.name,
        "description": company.description,
        "url": `https://descubrerepdom.com/loteria/${normalizedSlug}`,
        "logo": "https://descubrerepdom.com/og-image.jpg"
      },
      {
        "@type": "ItemList",
        "name": `Sorteos Oficiales de ${company.name}`,
        "itemListElement": filteredDraws.map((d, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": d.drawName,
          "description": `Horario: ${d.drawTime}. Números ganadores: ${d.winningNumbers.join(" - ")}.`
        }))
      }
    ]
  }), [company, filteredDraws, normalizedSlug]);

  if (remote === null && !COMPANY_INFO[normalizedSlug]) return <Navigate to="/loterias" replace />;

  return (
    <PageTransition>
      <SEOHead
        title={`Resultados de ${company.name} en Vivo - ${company.fullName}`}
        description={`Consulta los números ganadores de ${company.name}: ${company.popularDraws.join(", ")}. Horarios oficiales: ${company.schedule}.`}
        keywords={`loteria ${company.name}, resultados ${company.name}, ${company.popularDraws.join(", ")}, numeros ganadores, sorteos rd`}
        url={`https://descubrerepdom.com/loteria/${normalizedSlug}`}
        image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80"
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Loterías", url: "/loterias" },
          { name: company.name, url: `/loteria/${normalizedSlug}` }
        ]}
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Link to="/loterias">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a Todas las Loterías</span>
                </Button>
              </Link>

              <Badge variant="outline" className="text-xs bg-muted/40 py-1 px-3 border-border rounded-full font-mono">
                {company.schedule}
              </Badge>
            </div>

            {/* COMPANY HERO */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 border border-sky-100 text-slate-900 p-6 sm:p-10 shadow-xl">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl sm:text-6xl select-none">{company.logo}</span>
                  <div>
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-3xs tracking-wider mb-1.5 shadow-sm">
                      {company.badge}
                    </Badge>
                    <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {company.name}
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                      {company.fullName}
                    </p>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
                  {company.description}
                </p>

                {/* Popular Draws Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {company.popularDraws.map((dName, i) => (
                    <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-slate-700 border border-sky-200">
                      {dName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SEARCH & CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/80 backdrop-blur-xl p-3.5 rounded-2xl border border-border/80 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en sorteos de esta lotería..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9.5 rounded-xl text-xs h-10 bg-background/80 border-border/80"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 bg-background/80 border border-border/80 rounded-xl px-3 py-1 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <input
                    type="date"
                    aria-label="Seleccionar fecha"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-foreground text-xs focus:outline-hidden font-bold cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* DRAWS GRID & CHECKER */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Draws List (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span>Sorteos Oficiales de {company.name}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {filteredDraws.length} sorteo(s)
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {filteredDraws.map((draw) => (
                    <LotteryCard key={draw.id} result={draw} selectedDate={selectedDate} />
                  ))}
                  {filteredDraws.length === 0 && (
                    <div className="col-span-2 text-center py-20 bg-card/60 backdrop-blur-sm border border-dashed border-border/80 rounded-3xl space-y-2">
                      <p className="font-display font-bold text-lg text-foreground">No hay sorteos disponibles</p>
                      <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto">
                        No se encontraron sorteos para la fecha seleccionada o aún no se han celebrado.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Checker & Info (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-3xl border-2 border-amber-500/30 bg-card shadow-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Comprobar Jugada en {company.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Verifica si tu bolo o quiniela salió premiado en {company.name} hoy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <form onSubmit={handleTestNumber} className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-foreground mb-1 block">
                          Número (00 al 99)
                        </Label>
                        <Input
                          type="text"
                          maxLength={2}
                          placeholder="Ej. 18"
                          value={checkNum}
                          onChange={(e) => setCheckNum(e.target.value.replace(/\D/g, ""))}
                          className="font-mono text-center text-2xl font-black rounded-xl tracking-widest h-12 bg-background"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs h-10 shadow-md shadow-amber-500/20"
                      >
                        Comprobar en {company.name}
                      </Button>
                    </form>

                    {checkResult && checkResult.tested && (
                      <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        checkResult.matches.length > 0
                          ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                          : "bg-muted/80 border-border text-muted-foreground"
                      }`}>
                        {checkResult.matches.length > 0 ? (
                          <>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" /> ¡Premiado en {company.name}!
                            </div>
                            <div className="space-y-1 pt-1">
                              {checkResult.matches.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-foreground">{m.draw}</span>
                                  <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black">
                                    {m.pos}ª Posición
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center space-y-1">
                            <p className="font-bold text-foreground">El número {checkNum} no ha salido hoy en {company.name}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company schedule & about card */}
                <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span>Sobre {company.fullName}</span>
                  </div>
                  {company.historyText ? <p className="text-xs text-muted-foreground leading-relaxed">{company.historyText}</p> : null}
                  {remote && (remote.founded || remote.phone || remote.address || remote.tv_channels || remote.website_url) ? (
                    <dl className="grid gap-2 text-xs">
                      {remote.founded ? <div><dt className="font-semibold text-foreground">Fundación</dt><dd className="text-muted-foreground">{remote.founded}</dd></div> : null}
                      {remote.tv_channels ? <div><dt className="font-semibold text-foreground">Dónde ver los sorteos</dt><dd className="text-muted-foreground">{remote.tv_channels}</dd></div> : null}
                      {remote.phone ? <div><dt className="font-semibold text-foreground">Teléfono</dt><dd><a href={`tel:${remote.phone.replace(/[^\d+]/g, "").slice(0, 10)}`} className="text-primary hover:underline">{remote.phone}</a></dd></div> : null}
                      {remote.address ? <div><dt className="font-semibold text-foreground">Dirección</dt><dd className="text-muted-foreground">{remote.address}</dd></div> : null}
                      {remote.website_url ? <div><dt className="font-semibold text-foreground">Web oficial</dt><dd><a href={remote.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{remote.website_url.replace(/^https?:\/\/(www\.)?/, "")}</a></dd></div> : null}
                    </dl>
                  ) : null}
                  <p className="text-[11px] text-muted-foreground/70 italic pt-2 border-t border-border/50">
                    Aviso: Los resultados publicados son de carácter meramente informativo y son recolectados de las transmisiones oficiales en vivo. Descubre RD no realiza venta de lotería ni apuestas.
                  </p>
                </div>
              </div>
            </div>

            {/* Other Lotteries Switcher */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Explorar otras loterías dominicanas
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(allLotteries.length ? allLotteries.map((l) => [l.slug, { name: l.name, logo: COMPANY_INFO[l.slug]?.logo || "🎰" }] as const) : Object.entries(COMPANY_INFO)).map(([key, info]) => {
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

            {/* Prefooter Promo */}
            <PreFooterPresidenteBanner />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
