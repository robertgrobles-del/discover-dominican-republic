import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Ticket, Trophy } from "lucide-react";
import { LotteryResultRelational } from "@/types/lotteryRelational";
import { LotteryBall } from "@/components/loterias/LotteryBall";

export function LotteryRelationalCard({
  result,
  onClick,
}: {
  result: LotteryResultRelational;
  onClick?: () => void;
}) {
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
                <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {lottery.name}
                </h3>
                <span className="text-[10px] bg-muted border px-1.5 py-0.5 rounded text-muted-foreground">
                  {lottery.country}
                </span>
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
          <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Ver historial →
          </span>
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
