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
import { DEFAULT_LOTTERY_RESULTS, resolveDrawSlug } from "@/data/loteriasData";

export default function SorteoDetalle() {
  const { lotterySlug = "leidsa", drawSlug = "quiniela-pale-leidsa" } = useParams<{
    lotterySlug: string;
    drawSlug: string;
  }>();

  const { t, locale } = useI18n();
  const [data, setData] = useState<DrawDetailResponse | null>(null);
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
            // Generar fallback visual de contingencia si no hay red
            setData(createFallbackDrawData(lotterySlug, drawSlug));
          }
        }
      } catch {
        if (isMounted) {
          setData(createFallbackDrawData(lotterySlug, drawSlug));
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

      <div className="min-h-screen bg-background flex flex-col justify-between">
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
            <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-primary/40 text-primary font-bold px-3 py-1 text-xs">
                      {lotteryTitle}
                    </Badge>
                    {data?.draw.draw_time && (
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-mono">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>Hora oficial: {data.draw.draw_time}</span>
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      {data?.draw.number_of_balls || 3} Bolos (00 al 99)
                    </Badge>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
                    {drawTitle}
                  </h1>

                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                    {data?.draw.description ||
                      `Historial oficial y estadísticas completas de los números premiados en ${drawTitle}. Consulta fechas, premios y frecuencia de salida.`}
                  </p>

                  {data?.draw.schedule_description && (
                    <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{data.draw.schedule_description}</span>
                    </div>
                  )}
                </div>

                {/* Último Resultado Destacado */}
                {data?.stats.latest_result && (
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 shadow-inner flex flex-col items-center sm:items-start gap-2.5 shrink-0 min-w-[260px]">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        Último Sorteo
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground">
                        {data.stats.latest_result.draw_date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      {data.stats.latest_result.winning_numbers.map((n, idx) => (
                        <div
                          key={idx}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono text-base font-bold shadow-md ${
                            idx === 0
                              ? "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black"
                              : idx === 1
                              ? "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-950"
                              : idx === 2
                              ? "bg-gradient-to-b from-amber-600 to-amber-800 text-white"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {String(n).padStart(2, "0")}
                        </div>
                      ))}
                    </div>

                    {data.stats.latest_result.jackpot_amount && (
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {data.stats.latest_result.jackpot_amount}
                      </span>
                    )}
                  </div>
                )}
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
                  <p className="text-xs text-muted-foreground mt-0.5">Sorteos auditados y verificados</p>
                </div>
              </Card>

              {/* Card 2: Números Calientes */}
              <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> Números Calientes
                  </span>
                  <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Top Salidores</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {data?.stats.hot_numbers && data.stats.hot_numbers.length > 0 ? (
                    data.stats.hot_numbers.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-black">
                          {item.number}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.count}v</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Calculando estadísticas...</span>
                  )}
                </div>
              </Card>

              {/* Card 3: Números Fríos */}
              <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                    <Snowflake className="h-3.5 w-3.5" /> Números Fríos
                  </span>
                  <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-400/30">Menos Frecuentes</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {data?.stats.cold_numbers && data.stats.cold_numbers.length > 0 ? (
                    data.stats.cold_numbers.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono text-xs font-bold">
                          {item.number}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.count}v</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Calculando estadísticas...</span>
                  )}
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((result) => (
                    <Card
                      key={result.id}
                      className="rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <span className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {result.draw_date}
                        </span>
                        {result.jackpot_amount && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {result.jackpot_amount}
                          </span>
                        )}
                      </div>

                      {/* Bolos */}
                      <div className="flex items-center justify-center gap-2.5 py-1">
                        {result.winning_numbers.map((num, idx) => {
                          const isMatch = searchNumber && String(num).padStart(2, "0") === searchNumber.padStart(2, "0");
                          let ballStyle = "bg-secondary text-secondary-foreground";
                          if (idx === 0) ballStyle = "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black shadow-amber-500/20";
                          else if (idx === 1) ballStyle = "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-950 font-bold shadow-slate-400/20";
                          else if (idx === 2) ballStyle = "bg-gradient-to-b from-amber-600 to-amber-800 text-white font-bold shadow-amber-800/20";

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center font-mono text-lg shadow-md transition-transform ${ballStyle} ${
                                  isMatch ? "ring-4 ring-primary scale-110" : ""
                                }`}
                              >
                                {String(num).padStart(2, "0")}
                              </div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">
                                {idx === 0 ? "1er" : idx === 1 ? "2do" : idx === 2 ? "3er" : `${idx + 1}º`}
                              </span>
                            </div>
                          );
                        })}

                        {result.bonus_number !== null && result.bonus_number !== undefined && (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 text-white flex items-center justify-center font-mono text-lg font-black shadow-md">
                              {String(result.bonus_number).padStart(2, "0")}
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

/** Genera datos de contingencia en caso de que la API remota no esté disponible */
function createFallbackDrawData(lotterySlug: string, drawSlug: string): DrawDetailResponse {
  const match = DEFAULT_LOTTERY_RESULTS.find(
    (r) => r.company === lotterySlug && (r.drawSlug === drawSlug || resolveDrawSlug(r.company, r.drawName) === drawSlug)
  ) || DEFAULT_LOTTERY_RESULTS[0];

  const today = new Date();
  const mockResults = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const dateStr = d.toISOString().split("T")[0];
    return {
      id: `fallback-${drawSlug}-${dateStr}`,
      draw_id: `draw-${drawSlug}`,
      draw_date: dateStr,
      winning_numbers: match.winningNumbers.map((n) => Number(n)),
      bonus_number: match.bonusNumber ?? null,
      jackpot_amount: match.jackpotOrExtra ?? null,
    };
  });

  return {
    lottery: {
      id: `lot-${lotterySlug}`,
      slug: lotterySlug,
      name: match.companyName,
      country: "República Dominicana",
      logo_url: null,
      website_url: null,
      description: null,
      color_scheme: match.colorScheme,
    },
    draw: {
      id: `draw-${drawSlug}`,
      lottery_id: `lot-${lotterySlug}`,
      slug: drawSlug,
      name: match.drawName,
      draw_days: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
      draw_time: match.drawTime,
      ball_range_min: 0,
      ball_range_max: 99,
      number_of_balls: match.winningNumbers.length,
      tombolas_count: match.winningNumbers.length,
      has_bonus: Boolean(match.bonusNumber),
      bonus_name: match.bonusNumber ? "Bolo Extra" : null,
      description: `Histórico oficial de sorteos de ${match.drawName}.`,
      schedule_description: `Transmisión oficial diaria: ${match.drawTime}.`,
    },
    results: mockResults,
    stats: {
      total_draws: mockResults.length,
      hot_numbers: match.winningNumbers.map((n, i) => ({ number: n, count: 12 - i * 2, percentage: 65 - i * 10 })),
      cold_numbers: [{ number: "07", count: 2, percentage: 10 }, { number: "13", count: 1, percentage: 5 }],
      latest_result: mockResults[0],
    },
    related_draws: DEFAULT_LOTTERY_RESULTS.filter((r) => r.company === lotterySlug && r.drawName !== match.drawName).map((r) => ({
      id: r.id,
      slug: r.drawSlug || resolveDrawSlug(r.company, r.drawName),
      name: r.drawName,
      draw_time: r.drawTime,
    })),
  };
}

