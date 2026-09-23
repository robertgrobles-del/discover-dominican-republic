import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ticket, Star, Calendar, Clock, Trophy,
  RefreshCw, Sparkles, X, Filter, ArrowLeft, BarChart2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";

interface LotteryResultRelational {
  id: string;
  draw_id: string;
  draw_date: string;
  winning_numbers: number[];
  bonus_number: number | null;
  jackpot_amount: string | null;
  is_active: boolean;
  lottery_draws: {
    id: string;
    lottery_id: string;
    name: string;
    draw_days: string[];
    draw_time: string;
    ball_range_min: number;
    ball_range_max: number;
    number_of_balls: number;
    tombolas_count: number;
    has_bonus: boolean;
    is_active: boolean;
    lotteries: {
      id: string;
      name: string;
      country: string;
      logo_url: string | null;
      is_active: boolean;
    } | null;
  } | null;
}

function useLotteryResults(filterDate?: string) {
  return useQuery({
    queryKey: ["lottery-results-relational", filterDate],
    queryFn: async () => {
      let query = supabase
        .from("lottery_results")
        .select(`
          id,
          draw_id,
          draw_date,
          winning_numbers,
          bonus_number,
          jackpot_amount,
          is_active,
          lottery_draws (
            id,
            lottery_id,
            name,
            draw_days,
            draw_time,
            ball_range_min,
            ball_range_max,
            number_of_balls,
            tombolas_count,
            has_bonus,
            is_active,
            lotteries (
              id,
              name,
              country,
              logo_url,
              is_active
            )
          )
        `)
        .eq("is_active", true);

      if (filterDate) {
        query = query.eq("draw_date", filterDate);
      }

      query = query.order("draw_date", { ascending: false }).limit(150);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as LotteryResultRelational[];
    },
  });
}

const numberColors = [
  "bg-primary text-primary-foreground",
  "bg-blue-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-purple-500 text-white",
];

function LotteryBall({ number, index, isBonus }: { number: number; index: number; isBonus?: boolean }) {
  return (
    <div
      className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base shadow-md transition-transform hover:scale-110 ${
        isBonus
          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-2 ring-yellow-300"
          : numberColors[index % numberColors.length]
      }`}
    >
      {number}
    </div>
  );
}

function LotteryCard({ result, onClick }: { result: LotteryResultRelational; onClick?: () => void }) {
  const drawDate = new Date(result.draw_date + "T12:00:00");
  const formattedDate = format(drawDate, "EEEE d 'de' MMMM", { locale: es });
  
  const draw = result.lottery_draws;
  const lottery = draw?.lotteries;
  if (!draw || !lottery) return null;

  return (
    <div 
      onClick={onClick}
      className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/40 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between active:scale-[0.99]"
    >
      <div>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between bg-muted/30 group-hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 text-primary overflow-hidden border">
              {lottery.logo_url ? (
                <img src={lottery.logo_url} alt={lottery.name} className="w-full h-full object-cover" />
              ) : (
                <Ticket className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{lottery.name}</h3>
                <span className="text-[10px] bg-muted border px-1.5 py-0.5 rounded text-muted-foreground">{lottery.country}</span>
              </div>
              <p className="text-xs font-semibold text-primary">{draw.name}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] text-muted-foreground capitalize flex items-center gap-1 bg-background">
            <Calendar className="h-3 w-3" /> {formattedDate}
            <span className="mx-1">·</span>
            <Clock className="h-3 w-3" /> {draw.draw_time.substring(0, 5)}
          </Badge>
        </div>

        {/* Numbers */}
        <div className="px-5 py-5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Números ganadores</span>
            <span className="normal-case text-muted-foreground/80 font-normal">
              Rango: {draw.ball_range_min}-{draw.ball_range_max} | Cantidad: {draw.number_of_balls}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {result.winning_numbers?.map((num, i) => (
              <LotteryBall key={i} number={num} index={i} />
            ))}
            {result.bonus_number !== null && result.bonus_number !== undefined && (
              <>
                <span className="text-muted-foreground text-xl mx-0.5">+</span>
                <LotteryBall number={result.bonus_number} index={0} isBonus />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-5 pb-4 pt-3 border-t border-border/50 bg-muted/10 flex flex-wrap gap-2 items-center justify-between mt-auto">
        <div className="flex gap-1.5">
          {draw.tombolas_count > 1 && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              {draw.tombolas_count} Tómbolas
            </Badge>
          )}
          {draw.has_bonus && (
            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-2 py-0.5">
              Bolo Extra
            </Badge>
          )}
          <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ver historial →</span>
        </div>
        {result.jackpot_amount ? (
          <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-2.5 py-1 border border-primary/20">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <div>
              <p className="text-[9px] text-muted-foreground uppercase leading-none">Acumulado</p>
              <p className="font-bold text-primary text-xs mt-0.5">{result.jackpot_amount}</p>
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">Sorteo Completado</span>
        )}
      </div>
    </div>
  );
}

export default function Loteria() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDrawId = searchParams.get("draw");

  const [filterDate, setFilterDate] = useState("");
  const [filterLotteryId, setFilterLotteryId] = useState("all");
  const [filterDrawId, setFilterDrawId] = useState("all");
  const [activeTab, setActiveTab] = useState("todos");

  const { data: results, isLoading, refetch, isFetching } = useLotteryResults(filterDate);

  // Derivar opciones de filtros de los resultados actuales
  const uniqueLotteries = Array.from(
    new Map(
      (results || [])
        .map(r => r.lottery_draws?.lotteries)
        .filter(Boolean)
        .map(l => [l!.id, l])
    ).values()
  );

  const uniqueDraws = Array.from(
    new Map(
      (results || [])
        .map(r => r.lottery_draws)
        .filter(Boolean)
        .map(d => [d!.id, d])
    ).values()
  );

  const getFilteredResults = () => {
    let filtered = results || [];

    // Filtro por pestaña (País)
    if (activeTab === "dominicanas") {
      filtered = filtered.filter(
        (r) => r.lottery_draws?.lotteries?.country === "República Dominicana"
      );
    } else if (activeTab === "americanas") {
      filtered = filtered.filter(
        (r) => r.lottery_draws?.lotteries?.country !== "República Dominicana"
      );
    } else if (activeTab === "destacados") {
      filtered = filtered.filter(
        (r) => r.jackpot_amount !== null || r.lottery_draws?.has_bonus === true
      );
    }

    // Filtro por Lotería
    if (filterLotteryId !== "all") {
      filtered = filtered.filter((r) => r.lottery_draws?.lottery_id === filterLotteryId);
    }

    // Filtro por Sorteo
    if (filterDrawId !== "all") {
      filtered = filtered.filter((r) => r.draw_id === filterDrawId);
    }

    return filtered;
  };

  const hasActiveFilters = filterDate || filterLotteryId !== "all" || filterDrawId !== "all";

  const handleClearFilters = () => {
    setFilterDate("");
    setFilterLotteryId("all");
    setFilterDrawId("all");
  };

  const filteredResults = getFilteredResults();

  // Vista Detallada de Sorteo Único
  if (activeDrawId && results && results.length > 0) {
    const drawResults = results.filter(r => r.draw_id === activeDrawId);
    const firstResult = drawResults[0];

    if (firstResult && firstResult.lottery_draws) {
      const draw = firstResult.lottery_draws;
      const lottery = draw.lotteries;

      // Calcular Frecuencias de números
      const numberFrequency: Record<number, number> = {};
      let totalNumbersCount = 0;
      drawResults.forEach(res => {
        res.winning_numbers?.forEach(n => {
          numberFrequency[n] = (numberFrequency[n] || 0) + 1;
          totalNumbersCount++;
        });
        if (res.bonus_number !== null && res.bonus_number !== undefined) {
          numberFrequency[res.bonus_number] = (numberFrequency[res.bonus_number] || 0) + 1;
          totalNumbersCount++;
        }
      });

      const hotNumbers = Object.entries(numberFrequency)
        .map(([num, count]) => ({ number: Number(num), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return (
        <PageTransition>
          <SEOHead
            title={`Histórico del Sorteo: ${draw.name} | ${lottery?.name || "Lotería"}`}
            description={`Resultados históricos de ${draw.name} de la lotería ${lottery?.name || ""}. Busca números ganadores por fecha y estadísticas de bolos.`}
          />
          <div className="min-h-screen bg-background flex flex-col justify-between">
            <div>
              <Header />
              <main className="pt-24 pb-16">
                <section className="container mx-auto px-4 max-w-4xl">
                  {/* Back button */}
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchParams({})} 
                    className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Volver a Loterías
                  </Button>

                  {/* Draw Header Card */}
                  <Card className="border border-border/85 shadow-md mb-8">
                    <CardHeader className="bg-muted/10 pb-6 flex flex-row items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 border text-primary overflow-hidden">
                          {lottery?.logo_url ? (
                            <img src={lottery.logo_url} alt={lottery.name} className="w-full h-full object-cover" />
                          ) : (
                            <Ticket className="h-7 w-7" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">{lottery?.name}</Badge>
                            <span className="text-xs text-muted-foreground">{lottery?.country}</span>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">{draw.name}</h2>
                        </div>
                      </div>
                      <div className="bg-background border rounded-xl p-3 text-center shadow-xs text-xs space-y-1">
                        <p className="text-muted-foreground font-semibold">Configuración del Sorteo</p>
                        <p className="font-bold text-foreground">
                          Rango Bolos: {draw.ball_range_min}-{draw.ball_range_max} | Bolos: {draw.number_of_balls}
                        </p>
                        <p className="text-primary font-bold">
                          Hora: {draw.draw_time.substring(0, 5)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Se realiza los días: <strong>{draw.draw_days.join(", ")}</strong></span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hot numbers statistics */}
                  {hotNumbers.length > 0 && (
                    <Card className="border shadow-xs p-5 mb-8">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-1.5">
                        <BarChart2 className="h-4 w-4 text-amber-500" />
                        <span>Bolos más Frecuentes (Últimos 150 sorteos)</span>
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 items-center">
                        {hotNumbers.map((hn, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-muted/40 border p-2 rounded-xl">
                            <LotteryBall number={hn.number} index={idx} />
                            <div className="pr-1">
                              <p className="text-[10px] text-muted-foreground uppercase leading-none">Salidas</p>
                              <p className="text-sm font-bold text-foreground mt-1">{hn.count} veces</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Dedicated Results logs */}
                  <Card className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Histórico de Resultados</CardTitle>
                      <CardDescription>Lista cronológica de números ganadores.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        {drawResults.map((result) => {
                          const dateObj = new Date(result.draw_date + "T12:00:00");
                          return (
                            <div key={result.id} className="border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/10">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="font-bold text-sm text-foreground">
                                  {format(dateObj, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                {result.winning_numbers?.map((num, i) => (
                                  <LotteryBall key={i} number={num} index={i} />
                                ))}
                                {result.bonus_number !== null && result.bonus_number !== undefined && (
                                  <>
                                    <span className="text-muted-foreground text-xl mx-0.5">+</span>
                                    <LotteryBall number={result.bonus_number} index={0} isBonus />
                                  </>
                                )}
                              </div>
                              {result.jackpot_amount ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                                  Loto Más: {result.jackpot_amount}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Completado</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </main>
            </div>
            <Footer />
          </div>
        </PageTransition>
      );
    }
  }

  return (
    <PageTransition>
      <SEOHead
        title="Resultados de Loterías y Sorteos | Descubre RD"
        description="Consulta en tiempo real los resultados de los sorteos y marcas de lotería en República Dominicana y loterías americanas con histórico y buscador."
        keywords="loteria rd, leidsa loto, loteria nacional, quiniela pale, loteka, real, loterias dominicanas"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
            <Badge className="mb-4 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
              <Sparkles className="h-3 w-3 mr-1" /> Resultados Relacionales & Históricos
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Resultados de <span className="text-primary italic">Lotería</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Consulta y busca los números ganadores. <strong>Haz clic en cualquier sorteo</strong> para ver su histórico completo y estadísticas.
            </p>
          </div>
        </section>

        {/* Filters Panel */}
        <section className="container mx-auto px-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold">
              <Filter className="h-5 w-5" />
              <span>Buscador y Filtros de Sorteos</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date-filter" className="text-xs font-semibold text-muted-foreground">
                  Buscar por Fecha
                </Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-background"
                />
              </div>

              {/* Lotería */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lottery-filter" className="text-xs font-semibold text-muted-foreground">
                  Marca de Lotería
                </Label>
                <select
                  id="lottery-filter"
                  title="Filtrar por marca de lotería"
                  aria-label="Filtrar por marca de lotería"
                  value={filterLotteryId}
                  onChange={(e) => {
                    setFilterLotteryId(e.target.value);
                    setFilterDrawId("all");
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Todas las Marcas</option>
                  {uniqueLotteries.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorteo */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="draw-filter" className="text-xs font-semibold text-muted-foreground">
                  Sorteo Específico
                </Label>
                <select
                  id="draw-filter"
                  title="Filtrar por sorteo específico"
                  aria-label="Filtrar por sorteo específico"
                  value={filterDrawId}
                  onChange={(e) => setFilterDrawId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Todos los Sorteos</option>
                  {uniqueDraws
                    .filter((d) => filterLotteryId === "all" || d.lottery_id === filterLotteryId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-destructive hover:bg-destructive/10 gap-1.5">
                  <X className="h-4 w-4" /> Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Results List */}
        <section className="container mx-auto px-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="todos" className="gap-1.5">
                  <Ticket className="h-4 w-4" /> Todos
                </TabsTrigger>
                <TabsTrigger value="dominicanas" className="gap-1.5">
                  🇩🇴 Dominicanas
                </TabsTrigger>
                <TabsTrigger value="americanas" className="gap-1.5">
                  🇺🇸 Americanas
                </TabsTrigger>
                <TabsTrigger value="destacados" className="gap-1.5">
                  <Star className="h-4 w-4" /> Acumulados
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>

            {["todos", "dominicanas", "americanas", "destacados"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredResults.map((result) => (
                      <LotteryCard 
                        key={result.id} 
                        result={result} 
                        onClick={() => setSearchParams({ draw: result.draw_id })}
                      />
                    ))}
                    {filteredResults.length === 0 && (
                      <div className="col-span-2 text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h4 className="font-bold text-foreground">No hay resultados</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          No se encontraron sorteos para los filtros seleccionados.
                        </p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={handleClearFilters} className="mt-2 text-primary">
                            Limpiar filtros de búsqueda
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Info card */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Clock className="h-7 w-7 text-primary mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground mb-1.5">Estructura Relacional</h3>
                <p className="text-xs text-muted-foreground">
                  Configura sorteos por días de la semana, horarios, rango de bolos y cantidad de tómbolas.
                </p>
              </div>
              <div>
                <Star className="h-7 w-7 text-amber-500 mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground mb-1.5">Tómbolas Múltiples</h3>
                <p className="text-xs text-muted-foreground">
                  Soporta extracción de bolos de tómbolas separadas (1ra, 2da, 3ra) que permiten números repetidos.
                </p>
              </div>
              <div>
                <Trophy className="h-7 w-7 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground mb-1.5">Acumulados</h3>
                <p className="text-xs text-muted-foreground">
                  Registra botes estimados para sorteos especiales como Lotos y botes americanos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
