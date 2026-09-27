import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BarChart2, Calendar, Clock, Ticket } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LotteryResultRelational } from "@/types/lotteryRelational";
import { LotteryBall } from "@/components/loterias/LotteryBall";

interface LotteryDrawDetailViewProps {
  drawResults: LotteryResultRelational[];
  onBack: () => void;
}

export function LotteryDrawDetailView({ drawResults, onBack }: LotteryDrawDetailViewProps) {
  const firstResult = drawResults[0];
  const draw = firstResult?.lottery_draws;
  const lottery = draw?.lotteries;

  if (!draw) return null;

  // Calcular Frecuencias de números
  const numberFrequency: Record<number, number> = {};
  drawResults.forEach((res) => {
    res.winning_numbers?.forEach((n) => {
      numberFrequency[n] = (numberFrequency[n] || 0) + 1;
    });
    if (res.bonus_number !== null && res.bonus_number !== undefined) {
      numberFrequency[res.bonus_number] = (numberFrequency[res.bonus_number] || 0) + 1;
    }
  });

  const hotNumbers = Object.entries(numberFrequency)
    .map(([num, count]) => ({ number: Number(num), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <section className="container mx-auto px-4 max-w-4xl">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
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
  );
}
