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
          <div className="min-h-screen bg-background flex flex-col justify-between">
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
                      <LotteryRelationalCard
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
