import { useState, useEffect, useMemo } from "react";
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
  Sparkles, Calendar, Search, Trophy,
  Flame, Snowflake, Clock, Share2, ArrowLeft,
  ChevronRight, BarChart3, Layers, Hash
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import { fetchDrawDetail, DrawDetailResponse } from "@/services/lotteryService";

type StatNum = { n: number; count: number; days_since: number | null };


export default function SorteoDetalle() {
  const { lotterySlug = "leidsa", drawSlug = "quiniela-pale-leidsa" } = useParams<{
    lotterySlug: string;
    drawSlug: string;
  }>();

  const { t, locale } = useI18n();
  const [data, setData] = useState<DrawDetailResponse | null>(null);
  // Calientes y fríos de los últimos 365 días, con todos los números del rango (también los que no han salido).
  const [freq, setFreq] = useState<{ total: number; hot: StatNum[]; cold: StatNum[] } | null>(null);
  const drawId = data?.draw.id;
  useEffect(() => {
    if (!drawId) return;
    let live = true;
    fetch(`/api/v1/lotteries/stats?draw=${encodeURIComponent(drawId)}&days=365`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!live || !j?.data) return;
        const list = j.data.numbers as StatNum[];
        setFreq({
          total: j.data.total_draws,
          hot: [...list].sort((a, b) => b.count - a.count).slice(0, 5),
          cold: [...list].sort((a, b) => a.count - b.count || (b.days_since ?? 1e9) - (a.days_since ?? 1e9)).slice(0, 5),
        });
      })
      .catch(() => {});
    return () => { live = false; };
  }, [drawId]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [searchNumber, setSearchNumber] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Carga de datos de la API de Turso
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const query: { year?: string; month?: string; number?: string; limit?: number } = { limit: 120 };
        if (yearFilter !== "all") query.year = yearFilter;
        if (monthFilter !== "all") query.month = monthFilter;
        if (searchNumber.trim()) query.number = searchNumber.trim();

        const res = await fetchDrawDetail(lotterySlug, drawSlug, query);
        if (isMounted) {
          if (res) {
            setData(res);
          } else {
            setData(null); // sin datos reales no se muestra nada inventado
          }
        }
      } catch {
        if (isMounted) {
          setData(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [lotterySlug, drawSlug, yearFilter, monthFilter, searchNumber]);

  // Manejo de compartir sorteo
  const handleShare = () => {
    if (!data) return;
    const text = `Histórico oficial de sorteos: ${data.draw.name} (${data.lottery.name}) en Descubre RD`;
    if (navigator.share) {
      navigator.share({ title: data.draw.name, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} - ${window.location.href}`);
      toast.success("Enlace copiado al portapapeles 📋");
    }
  };

  // Filtrado reactivo en cliente sobre los resultados devueltos
  const filteredResults = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((r) => {
      if (searchNumber.trim()) {
        const clean = searchNumber.trim().padStart(2, "0");
        const hasNum = r.winning_numbers.some((n) => String(n).padStart(2, "0") === clean);
        if (!hasNum) return false;
      }
      return true;
    });
  }, [data?.results, searchNumber]);

  const drawTitle = data?.draw.name || "Sorteo";
  const lotteryTitle = data?.lottery.name || "Lotería";

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://descubrerepdom.com/loteria/${lotterySlug}/${drawSlug}`,
        "url": `https://descubrerepdom.com/loteria/${lotterySlug}/${drawSlug}`,
        "name": `Histórico y Resultados de ${drawTitle} (${lotteryTitle})`,
        "description": `Histórico oficial de sorteos y estadísticas de ${drawTitle} de ${lotteryTitle}.`,
        "inLanguage": locale
      },
      {
        "@type": "ItemList",
        "name": `Historial de Resultados de ${drawTitle}`,
        "itemListElement": filteredResults.slice(0, 20).map((r, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": `${drawTitle} - ${r.draw_date}`,
          "description": `Números ganadores: ${r.winning_numbers.join(" - ")}${r.bonus_number !== null ? ` (Bolo +: ${r.bonus_number})` : ""}.`
        }))
      }
    ]
  }), [drawSlug, drawTitle, filteredResults, locale, lotterySlug, lotteryTitle]);

  return (
    <PageTransition>
      <SEOHead
        title={`Histórico y Resultados de ${drawTitle} (${lotteryTitle}) | Descubre RD`}
        description={`Consulta los resultados anteriores, números ganadores, estadísticas de números calientes y fríos de ${drawTitle} de ${lotteryTitle}. Horario: ${data?.draw.draw_time || "Hoy"}.`}
        keywords={`sorteo ${drawTitle}, historico ${drawTitle}, resultados ${lotteryTitle}, numeros ganadores ${drawTitle}, numeros calientes ${drawTitle}`}
        url={`https://descubrerepdom.com/loteria/${lotterySlug}/${drawSlug}`}
        image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80"
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Loterías", url: "/loterias" },
          { name: lotteryTitle, url: `/loteria/${lotterySlug}` },
          { name: drawTitle, url: `/loteria/${lotterySlug}/${drawSlug}` }
        ]}
      />

      <div className="min-h-dvh bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-8 max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/loterias" className="hover:text-foreground transition-colors">Loterías</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/loteria/${lotterySlug}`} className="hover:text-foreground transition-colors font-medium">
                {lotteryTitle}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">
                {drawTitle}
              </span>
            </nav>

            {/* Back button & Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Link to={`/loteria/${lotterySlug}`}>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a {lotteryTitle}</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Compartir Histórico</span>
                </Button>
              </div>
            </div>

            {/* Hero Card del Sorteo */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10 text-white p-6 sm:p-10 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-3xs tracking-wider px-3 py-1 shadow-sm">
                      {lotteryTitle}
                    </Badge>
                    {data?.draw.draw_time && (
                      <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-mono text-white/90 border-white/20 backdrop-blur-sm">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>Hora oficial: {data.draw.draw_time}</span>
                      </Badge>
                    )}
                    <span className="text-3xs text-slate-300 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                      {data?.draw.number_of_balls || 3} Bolos (00 al 99)
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
                    {drawTitle}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                    {data?.draw.description ||
                      `Historial oficial y estadísticas completas de los números premiados en ${drawTitle}. Consulta fechas, premios y frecuencia de salida.`}
                  </p>

                  {data?.draw.schedule_description && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{data.draw.schedule_description}</span>
                    </div>
                  )}

                  {data?.draw.how_to_play && (
                    <section aria-labelledby="como-se-gana" className="max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                      <h2 id="como-se-gana" className="text-xs font-bold uppercase tracking-wider text-primary">Cómo se gana</h2>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-200">{data.draw.how_to_play}</p>
                      <Link to="/loterias/como-se-gana" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">Reglas de todas las loterías &rarr;</Link>
                    </section>
                  )}
                </div>

                {/* Último Resultado Destacado */}
                {data?.stats.latest_result && (() => {
                  const todayStr = new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10); // hoy en RD (UTC-4, sin horario de verano)
                  const isToday = data.stats.latest_result.draw_date === todayStr;
                  return (
                    <div
                      className={`p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center sm:items-start gap-3 shrink-0 min-w-[280px] border transition-all ${
                        isToday
                          ? "bg-white/5 border-white/15"
                          : "bg-slate-900/60 border-slate-700/60 opacity-90"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-3xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Trophy className={`h-3.5 w-3.5 ${isToday ? "text-amber-400" : "text-slate-400"}`} />
                          {isToday ? "Sorteo de Hoy" : "Último disponible"}
                        </span>
                        <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded-md bg-white/10">
                          {data.stats.latest_result.draw_date}
                        </span>
                      </div>

                      {!isToday && (
                        <div className="w-full text-3xs font-medium text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0 text-amber-400" />
                          <span>Sorteo de hoy aún pendiente</span>
                        </div>
                      )}

                      <div className={`flex items-center gap-2.5 py-1 ${!isToday ? "grayscale opacity-85 hover:grayscale-0 transition-all" : ""}`}>
                        {data.stats.latest_result.winning_numbers.map((n, idx) => (
                          <div
                            key={idx}
                            className={`relative w-12 h-12 rounded-full flex flex-col items-center justify-center font-mono text-lg font-black shadow-lg select-none ${
                              !isToday
                                ? "bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 text-slate-950 border border-white/40 ring-2 ring-slate-400/20"
                                : idx === 0
                                ? "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 shadow-amber-500/30 border border-amber-200/80 ring-2 ring-amber-400/30"
                                : idx === 1
                                ? "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white shadow-blue-500/25 border border-blue-200/70 ring-2 ring-blue-400/20"
                                : idx === 2
                                ? "bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 text-white shadow-emerald-500/25 border border-emerald-200/70 ring-2 ring-emerald-400/20"
                                : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white border border-slate-600"
                            }`}
                          >
                            <span className="absolute top-1.5 left-2 w-2 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                            <span>{String(n).padStart(2, "0")}</span>
                          </div>
                        ))}
                      </div>

                      {data.stats.latest_result.jackpot_amount && (
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          {data.stats.latest_result.jackpot_amount}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Métricas y Estadísticas de Frecuencia */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Sorteos */}
              <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Sorteos en Histórico</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black font-mono text-foreground">
                    {data?.stats.total_draws ?? 0}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">Resultados guardados de este sorteo</p>
                </div>
              </Card>

              {/* Card 2: Números Calientes */}
              <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> Números Calientes
                  </span>
                  <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Últimos 365 días</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {freq && freq.total > 0 ? (
                    freq.hot.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-black">
                          {String(item.n).padStart(2, "0")}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.count}v</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">{freq ? "Sin resultados en los últimos 365 días" : "Calculando estadísticas..."}</span>
                  )}
                </div>
              </Card>

              {/* Card 3: Números Fríos */}
              <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                    <Snowflake className="h-3.5 w-3.5" /> Números Fríos
                  </span>
                  <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-400/30">Últimos 365 días</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {freq && freq.total > 0 ? (
                    freq.cold.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono text-xs font-bold">
                          {String(item.n).padStart(2, "0")}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.count}v</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">{freq ? "Sin resultados en los últimos 365 días" : "Calculando estadísticas..."}</span>
                  )}
                </div>
                {drawId ? <Link to={`/loterias/estadisticas?draw=${encodeURIComponent(drawId)}`} className="mt-3 block text-xs font-semibold text-primary hover:underline">Ver todas las estadísticas y otras fechas</Link> : null}
              </Card>
            </div>

            {/* Barra de Filtros del Histórico */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Filtrar Histórico
                  </span>

                  {/* Selector de Año */}
                  <select
                    aria-label="Filtrar por año"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">Todos los Años</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>

                  {/* Selector de Mes */}
                  <select
                    aria-label="Filtrar por mes"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">Todos los Meses</option>
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>

                {/* Buscador de Bolo Específico */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      maxLength={2}
                      placeholder="Buscar número (ej. 42)"
                      value={searchNumber}
                      onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, ""))}
                      className="pl-9 h-9 text-xs font-mono rounded-xl bg-background"
                    />
                  </div>

                  <div className="hidden sm:flex items-center border border-border rounded-xl p-0.5 bg-background">
                    <Button
                      variant={viewMode === "cards" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                      className="h-7 px-2 text-xs"
                      title="Vista tarjetas"
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-7 px-2 text-xs"
                      title="Vista tabla"
                    >
                      <Hash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Listado de Resultados Históricos */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Consultando histórico de sorteos en Turso...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              viewMode === "cards" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredResults.map((result) => (
                    <Card
                      key={result.id}
                      className="group rounded-3xl border border-border/70 bg-card/85 backdrop-blur-md hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                        <span className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {result.draw_date}
                        </span>
                        {result.jackpot_amount && (
                          <span className="text-3xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                            {result.jackpot_amount}
                          </span>
                        )}
                      </div>

                      {/* Bolos 3D Spheres */}
                      <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-1">
                        {result.winning_numbers.map((num, idx) => {
                          const isMatch = searchNumber && String(num).padStart(2, "0") === searchNumber.padStart(2, "0");
                          const isFirst = idx === 0;
                          const isSecond = idx === 1;
                          const isThird = idx === 2;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div
                                className={`relative w-12 h-12 rounded-full flex flex-col items-center justify-center font-mono font-black shadow-lg transition-transform hover:scale-110 select-none ${
                                  isFirst
                                    ? "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 shadow-amber-500/30 border border-amber-200/80 ring-2 ring-amber-400/30"
                                    : isSecond
                                    ? "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white shadow-blue-500/25 border border-blue-200/70 ring-2 ring-blue-400/20"
                                    : isThird
                                    ? "bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 text-white shadow-emerald-500/25 border border-emerald-200/70 ring-2 ring-emerald-400/20"
                                    : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white border border-slate-600"
                                } ${isMatch ? "ring-4 ring-primary scale-110" : ""}`}
                              >
                                <span className="absolute top-1.5 left-2 w-2 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                                <span className="text-base sm:text-lg leading-none tracking-tight">{String(num).padStart(2, "0")}</span>
                              </div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">
                                {idx === 0 ? "1er" : idx === 1 ? "2do" : idx === 2 ? "3er" : `${idx + 1}º`}
                              </span>
                            </div>
                          );
                        })}

                        {result.bonus_number !== null && result.bonus_number !== undefined && (
                          <div className="flex flex-col items-center gap-1">
                            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 via-red-600 to-red-800 text-white flex items-center justify-center font-mono text-base font-black shadow-lg shadow-red-500/30 ring-2 ring-rose-400/30 border border-rose-300">
                              <span className="absolute top-1.5 left-2 w-2 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                              <span>{String(result.bonus_number).padStart(2, "0")}</span>
                            </div>
                            <span className="text-[9px] uppercase font-bold text-rose-500">Bolo +</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/80">
                          <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-center">1er Premio</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-center">2do Premio</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-center">3er Premio</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-center">Otros Bolos</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-right">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono">
                        {filteredResults.map((result) => (
                          <tr key={result.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                              {result.draw_date}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black">
                                {String(result.winning_numbers[0] ?? "-").padStart(2, "0")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-300 text-slate-950 font-bold">
                                {String(result.winning_numbers[1] ?? "-").padStart(2, "0")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-700 text-white font-bold">
                                {String(result.winning_numbers[2] ?? "-").padStart(2, "0")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {result.winning_numbers.length > 3
                                ? result.winning_numbers.slice(3).map((n) => String(n).padStart(2, "0")).join(" - ")
                                : "-"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {result.jackpot_amount ? (
                                <span className="text-[10px] text-amber-500 font-sans font-bold">
                                  {result.jackpot_amount}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-sans">Oficial</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              <div className="py-16 text-center bg-card border border-dashed rounded-3xl p-8 space-y-2">
                <p className="text-base font-bold text-foreground">No se encontraron resultados para los filtros indicados.</p>
                <p className="text-xs text-muted-foreground">
                  Prueba cambiando el año o limpiando la búsqueda por número de bolo.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setYearFilter("all");
                    setMonthFilter("all");
                    setSearchNumber("");
                  }}
                  className="mt-3 text-xs"
                >
                  Restablecer Filtros
                </Button>
              </div>
            )}

            {/* Sorteos Relacionados de la Misma Lotería */}
            {data?.related_draws && data.related_draws.length > 0 && (
              <div className="pt-6 border-t border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Otros Sorteos de {lotteryTitle}
                  </h2>
                  <Link to={`/loteria/${lotterySlug}`} className="text-xs text-primary hover:underline font-semibold">
                    Ver todos los sorteos &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {data.related_draws.map((rd) => (
                    <Link
                      key={rd.id}
                      to={`/loteria/${lotterySlug}/${rd.slug}`}
                      className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between group"
                    >
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {rd.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {rd.draw_time}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
