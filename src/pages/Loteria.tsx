import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Ticket, Star, Clock, Trophy, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { LotteryResultRelational } from "@/types/lotteryRelational";
import { LotteryRelationalCard } from "@/components/loterias/LotteryRelationalCard";
import { LotteryDrawDetailView } from "@/components/loterias/LotteryDrawDetailView";
import { LotteryFiltersPanel } from "@/components/loterias/LotteryFiltersPanel";
import { LotteryChecker } from "@/components/loterias/LotteryChecker";
import { LotteryStatsSidebar } from "@/components/loterias/LotteryStatsSidebar";
import { toast } from "sonner";
import { usePageContent } from "@/lib/pageContent";

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

export default function Loteria() {
  const pc = usePageContent("loteria");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDrawId = searchParams.get("draw");

  const [filterDate, setFilterDate] = useState("");
  const [filterLotteryId, setFilterLotteryId] = useState("all");
  const [filterDrawId, setFilterDrawId] = useState("all");
  const [activeTab, setActiveTab] = useState("todos");

  const { data: results, isLoading, refetch, isFetching } = useLotteryResults(filterDate);

  // Comprobador de jugadas (antes en /loterias): busca un número entre los resultados cargados.
  const [checkNumber, setCheckNumber] = useState("");
  const [checkResult, setCheckResult] = useState<{ tested: boolean; matches: { draw: string; position: number; date: string }[] } | null>(null);
  const handleTestNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number.parseInt(checkNumber.trim(), 10);
    if (!Number.isInteger(n) || n < 0 || n > 99) {
      toast.error("Ingresa un número de 2 dígitos (ej. 42 o 08).");
      return;
    }
    const matches = (results || []).flatMap((r) => {
      const pos = r.winning_numbers.indexOf(n);
      return pos === -1 ? [] : [{ draw: `${r.lottery_draws?.lotteries?.name ?? "Lotería"} - ${r.lottery_draws?.name ?? ""}`, position: pos + 1, date: r.draw_date }];
    });
    setCheckResult({ tested: true, matches });
  };

  // Derivar opciones de filtros de los resultados actuales
  const uniqueLotteries = Array.from(
    new Map(
      (results || [])
        .map((r) => r.lottery_draws?.lotteries)
        .filter(Boolean)
        .map((l) => [l!.id, l])
    ).values()
  );

  const uniqueDraws = Array.from(
    new Map(
      (results || [])
        .map((r) => r.lottery_draws)
        .filter(Boolean)
        .map((d) => [d!.id, d])
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
    const drawResults = results.filter((r) => r.draw_id === activeDrawId);
    const firstResult = drawResults[0];

    if (firstResult && firstResult.lottery_draws) {
      const draw = firstResult.lottery_draws;
      const lottery = draw.lotteries;

      return (
        <PageTransition>
          <SEOHead
            title={`Histórico del Sorteo: ${draw.name} | ${lottery?.name || "Lotería"}`}
            description={`Resultados históricos de ${draw.name} de la lotería ${lottery?.name || ""}. Busca números ganadores por fecha y estadísticas de bolos.`}
          />
          <div className="min-h-dvh bg-background flex flex-col justify-between">
            <div>
              <Header />
              <main className="pt-24 pb-16">
                <LotteryDrawDetailView
                  drawResults={drawResults}
                  onBack={() => setSearchParams({})}
                />
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
        title={pc.t("SEOHead.title.1", "Resultados de Loterías y Sorteos | Descubre RD")}
        description={pc.t("SEOHead.description.1", "Consulta en tiempo real los resultados de los sorteos y marcas de lotería en República Dominicana y loterías americanas con histórico y buscador.")}
        keywords="loteria rd, leidsa loto, loteria nacional, quiniela pale, loteka, real, loterias dominicanas"
      />
      <div className="min-h-dvh bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
            <Badge className="mb-4 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
              <Sparkles className="h-3 w-3 mr-1" />{" "}{pc.tx("Badge.1", "Resultados Relacionales & Históricos")}</Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">{pc.tx("h1.1", "Resultados de")}{" "}<span className="text-primary italic">{pc.tx("span.1", "Lotería")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{pc.tx("p.1", "Consulta y busca los números ganadores.")}{" "}<strong>{pc.tx("strong.1", "Haz clic en cualquier sorteo")}</strong>{" "}{pc.tx("p.2", "para ver su histórico completo y estadísticas.")}</p>
          </div>
        </section>

        {/* Filters Panel */}
        <LotteryFiltersPanel
          filterDate={filterDate}
          onFilterDateChange={setFilterDate}
          filterLotteryId={filterLotteryId}
          onFilterLotteryIdChange={(val) => {
            setFilterLotteryId(val);
            setFilterDrawId("all");
          }}
          filterDrawId={filterDrawId}
          onFilterDrawIdChange={setFilterDrawId}
          uniqueLotteries={uniqueLotteries}
          uniqueDraws={uniqueDraws}
          hasActiveFilters={Boolean(hasActiveFilters)}
          onClearFilters={handleClearFilters}
        />

        {/* Results List */}
        <section className="container mx-auto px-4 py-4">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="todos" className="gap-1.5">
                  <Ticket className="h-4 w-4" />{" "}{pc.tx("TabsTrigger.1", "Todos")}</TabsTrigger>
                <TabsTrigger value="dominicanas" className="gap-1.5">{pc.tx("TabsTrigger.2", "🇩🇴 Dominicanas")}</TabsTrigger>
                <TabsTrigger value="americanas" className="gap-1.5">{pc.tx("TabsTrigger.3", "🇺🇸 Americanas")}</TabsTrigger>
                <TabsTrigger value="destacados" className="gap-1.5">
                  <Star className="h-4 w-4" />{" "}{pc.tx("TabsTrigger.4", "Acumulados")}</TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />{pc.tx("Button.1", "Actualizar")}</Button>
            </div>

            {["todos", "dominicanas", "americanas", "destacados"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredResults.map((result) => (
                      <LotteryRelationalCard
                        key={result.id}
                        result={result}
                        onClick={() => setSearchParams({ draw: result.draw_id })}
                      />
                    ))}
                    {filteredResults.length === 0 && (
                      <div className="col-span-2 text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h2 className="h3 h4 font-bold text-foreground">{pc.tx("h4.1", "No hay resultados")}</h2>
                        <p className="text-muted-foreground text-sm mt-1">{pc.tx("p.3", "No se encontraron sorteos para los filtros seleccionados.")}</p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={handleClearFilters} className="mt-2 text-primary">{pc.tx("Button.2", "Limpiar filtros de búsqueda")}</Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <LotteryChecker checkNumber={checkNumber} onCheckNumberChange={setCheckNumber} onSubmit={handleTestNumber} checkResult={checkResult} />
            <LotteryStatsSidebar />
          </aside>
          </div>
        </section>

        {/* Info card */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Clock className="h-7 w-7 text-primary mx-auto mb-3" />
                <h2 className="h3 font-display font-bold text-foreground mb-1.5">{pc.tx("h3.1", "Estructura Relacional")}</h2>
                <p className="text-xs text-muted-foreground">{pc.tx("p.4", "Configura sorteos por días de la semana, horarios, rango de bolos y cantidad de tómbolas.")}</p>
              </div>
              <div>
                <Star className="h-7 w-7 text-amber-500 mx-auto mb-3" />
                <h2 className="h3 font-display font-bold text-foreground mb-1.5">{pc.tx("h3.2", "Tómbolas Múltiples")}</h2>
                <p className="text-xs text-muted-foreground">{pc.tx("p.5", "Soporta extracción de bolos de tómbolas separadas (1ra, 2da, 3ra) que permiten números repetidos.")}</p>
              </div>
              <div>
                <Trophy className="h-7 w-7 text-emerald-500 mx-auto mb-3" />
                <h2 className="h3 font-display font-bold text-foreground mb-1.5">{pc.tx("h3.3", "Acumulados")}</h2>
                <p className="text-xs text-muted-foreground">{pc.tx("p.6", "Registra botes estimados para sorteos especiales como Lotos y botes americanos.")}</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
