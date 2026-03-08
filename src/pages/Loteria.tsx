import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Ticket, Star, Calendar, Clock, TrendingUp, Trophy,
  DollarSign, RefreshCw, ChevronRight, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LotteryResult {
  id: string;
  lottery_name: string;
  slug: string;
  draw_date: string;
  draw_time: string | null;
  draw_type: string;
  winning_numbers: number[];
  bonus_number: number | null;
  jackpot_amount: string | null;
  next_draw_date: string | null;
  next_jackpot_estimate: string | null;
  is_featured: boolean;
}

function useLotteryResults() {
  return useQuery({
    queryKey: ["lottery-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_results")
        .select("*")
        .eq("is_active", true)
        .order("draw_date", { ascending: false })
        .order("lottery_name", { ascending: true });
      if (error) throw error;
      return (data || []) as LotteryResult[];
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
      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-md transition-transform hover:scale-110 ${
        isBonus
          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-2 ring-yellow-300"
          : numberColors[index % numberColors.length]
      }`}
    >
      {number}
    </div>
  );
}

function LotteryCard({ result }: { result: LotteryResult }) {
  const drawDate = new Date(result.draw_date + "T12:00:00");
  const formattedDate = format(drawDate, "EEEE d 'de' MMMM", { locale: es });
  const isDominicana = result.draw_type !== "americana";

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg animate-fade-in">
      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between ${
        result.is_featured
          ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
          : "bg-muted/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDominicana ? "bg-primary/15 text-primary" : "bg-blue-500/15 text-blue-500"
          }`}>
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">{result.lottery_name}</h3>
            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formattedDate}
              {result.draw_time && (
                <><span className="mx-1">·</span><Clock className="h-3 w-3" /> {result.draw_time}</>
              )}
            </p>
          </div>
        </div>
        {result.is_featured && (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            <Star className="h-3 w-3 mr-1" /> Destacado
          </Badge>
        )}
      </div>

      {/* Numbers */}
      <div className="px-5 py-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Números ganadores
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {result.winning_numbers.map((num, i) => (
            <LotteryBall key={i} number={num} index={i} />
          ))}
          {result.bonus_number !== null && (
            <>
              <span className="text-muted-foreground text-xl mx-1">+</span>
              <LotteryBall number={result.bonus_number} index={0} isBonus />
            </>
          )}
        </div>
      </div>

      {/* Prize info */}
      {(result.jackpot_amount || result.next_jackpot_estimate) && (
        <div className="px-5 pb-5 flex flex-wrap gap-3">
          {result.jackpot_amount && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Premio Mayor</p>
                <p className="font-bold text-foreground text-sm">{result.jackpot_amount}</p>
              </div>
            </div>
          )}
          {result.next_jackpot_estimate && result.next_draw_date && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Próximo sorteo</p>
                <p className="font-bold text-foreground text-sm">{result.next_jackpot_estimate}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Loteria() {
  const { data: results, isLoading, refetch, isFetching } = useLotteryResults();
  const [activeTab, setActiveTab] = useState("todos");

  const dominicanas = results?.filter((r) => r.draw_type !== "americana") || [];
  const americanas = results?.filter((r) => r.draw_type === "americana") || [];
  const featured = results?.filter((r) => r.is_featured) || [];

  const getFilteredResults = () => {
    switch (activeTab) {
      case "dominicanas": return dominicanas;
      case "americanas": return americanas;
      case "destacados": return featured;
      default: return results || [];
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Resultados de Lotería RD | Leidsa, Nacional, Loteka, Real"
        description="Consulta los últimos resultados de las loterías dominicanas: Leidsa, Lotería Nacional, Loteka, Real y loterías americanas. Números ganadores actualizados."
        keywords="loteria dominicana, resultados loteria, leidsa, loteria nacional, loteka, numeros ganadores"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
            <Badge className="mb-4 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
              <Sparkles className="h-3 w-3 mr-1" /> Resultados Actualizados
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Resultados de <span className="text-primary italic">Lotería</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Consulta los números ganadores de Leidsa, Lotería Nacional, Loteka, Real y loterías americanas.
            </p>
            <Button
              variant="outline"
              className="mt-6 gap-2"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Actualizar resultados
            </Button>
          </div>
        </section>

        {/* Featured jackpots */}
        {featured.length > 0 && (
          <section className="container mx-auto px-4 -mt-6 mb-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {featured.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary/30 transition-all"
                >
                  <Ticket className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground truncate">{r.lottery_name}</p>
                  {r.jackpot_amount && (
                    <p className="font-bold text-foreground mt-1 text-sm">{r.jackpot_amount}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        <section className="container mx-auto px-4 py-8">
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
                  <Star className="h-4 w-4" /> Destacados
                </TabsTrigger>
              </TabsList>
            </div>

            {["todos", "dominicanas", "americanas", "destacados"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {getFilteredResults().map((result) => (
                      <LotteryCard key={result.id} result={result} />
                    ))}
                    {getFilteredResults().length === 0 && (
                      <div className="col-span-2 text-center py-16">
                        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay resultados disponibles.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Info section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">Horarios de Sorteo</h3>
                <p className="text-sm text-muted-foreground">
                  Leidsa: 12:55 PM y 8:55 PM · Nacional: Sáb 8:00 PM · Loteka: 7:55 PM
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-amber-500/15 flex items-center justify-center mb-4">
                  <DollarSign className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">Premios Acumulados</h3>
                <p className="text-sm text-muted-foreground">
                  Sigue los jackpots acumulados y no te pierdas las grandes oportunidades.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                  <RefreshCw className="h-7 w-7 text-emerald-500" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">Actualización Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Resultados actualizados después de cada sorteo por nuestro equipo.
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
