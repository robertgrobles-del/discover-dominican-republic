import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, Gift, History, ChevronRight } from "lucide-react";
import { LotteryResult, resolveDrawSlug } from "@/data/loteriasData";

interface LotteryCardProps {
  result: LotteryResult;
  /** Fecha consultada: si el resultado es de otro día (el sorteo de hoy aún no salió), la tarjeta va en gris. */
  selectedDate?: string;
}

export function LotteryCard({ result, selectedDate }: LotteryCardProps) {
  const drawSlug = result.drawSlug || resolveDrawSlug(result.company, result.drawName);
  const previous = Boolean(selectedDate && result.date && result.date !== selectedDate);

  return (
    <Card className={`group rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
      previous
        ? "border-border/70 bg-muted/20 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 shadow-sm"
        : "border-border/70 bg-card/85 backdrop-blur-md hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
    }`}>
      <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <Link to={`/loteria/${result.company}`} className="flex items-center gap-1.5 group/brand">
            <span className="text-base select-none">{result.logo}</span>
            <span className="text-xs font-black text-foreground group-hover/brand:text-primary transition-colors uppercase tracking-wider">
              {result.companyName}
            </span>
          </Link>
          <Link to={`/loteria/${result.company}/${drawSlug}`}>
            <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors mt-0.5">
              {result.drawName}
            </h3>
          </Link>
        </div>

        <div className="text-right">
          <span className={`text-xs font-mono font-bold flex items-center gap-1 justify-end px-2.5 py-0.5 rounded-full border ${
            previous
              ? "text-muted-foreground bg-muted/70 border-border"
              : "text-primary bg-primary/10 border-primary/20"
          }`}>
            <Clock className="h-3 w-3" /> {result.drawTime}
          </span>
          <span className="text-3xs font-semibold text-muted-foreground block mt-1">
            {previous ? `Último disponible: ${result.date}` : result.date}
          </span>
          {previous && (
            <span className="text-3xs font-bold text-amber-500/90 block">
              Sorteo de hoy aún pendiente
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 space-y-4">
        {/* Previous Date Banner if not from queried date */}
        {previous && (
          <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 text-center text-3xs text-muted-foreground font-semibold flex items-center justify-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>Mostrando último resultado registrado (<strong className="text-foreground">{result.date}</strong>)</span>
          </div>
        )}

        {/* Winning Balls 3D Spheres Visualization */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
          {result.winningNumbers.map((num, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            const ballStyle = previous
              ? "bg-gradient-to-br from-slate-400 via-slate-600 to-slate-800 text-white shadow-slate-900/30 border border-slate-400/40 ring-1 ring-slate-400/20"
              : isFirst
              ? "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 shadow-amber-500/30 border border-amber-200/80 ring-2 ring-amber-400/30"
              : isSecond
              ? "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white shadow-blue-500/25 border border-blue-200/70 ring-2 ring-blue-400/20"
              : isThird
              ? "bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 text-white shadow-emerald-500/25 border border-emerald-200/70 ring-2 ring-emerald-400/20"
              : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white shadow-black/30 border border-slate-600";

            return (
              <div
                key={idx}
                className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center font-mono font-black shadow-lg transition-transform hover:scale-110 select-none ${ballStyle}`}
              >
                {/* 3D Specular Highlight reflection */}
                <span className="absolute top-1.5 left-2.5 w-2.5 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                
                <span className="text-base sm:text-lg leading-none tracking-tight">{num}</span>
                {result.winningNumbers.length <= 3 && (
                  <span className={`text-[8px] font-sans font-bold uppercase mt-0.5 leading-none ${previous ? "text-slate-200" : isFirst ? "text-slate-950/80" : "text-white/80"}`}>
                    {isFirst ? "1ra" : isSecond ? "2da" : "3ra"}
                  </span>
                )}
              </div>
            );
          })}
          {result.bonusNumber !== null && result.bonusNumber !== undefined && (
            <div className="flex flex-col items-center justify-center">
              <div className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center font-mono font-black shadow-lg ring-2 border ${
                previous
                  ? "bg-gradient-to-br from-slate-500 via-slate-700 to-slate-900 text-white border-slate-400 ring-slate-400/20"
                  : "bg-gradient-to-br from-rose-400 via-red-600 to-red-800 text-white shadow-red-500/30 ring-rose-400/30 border-rose-300"
              }`}>
                <span className="absolute top-1.5 left-2.5 w-2.5 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                <span className="text-base sm:text-lg leading-none">{String(result.bonusNumber).padStart(2, "0")}</span>
                <span className="text-[8px] font-sans font-bold uppercase text-white/90 mt-0.5 leading-none">Bolo +</span>
              </div>
            </div>
          )}
        </div>

        {/* Jackpot / Extra Info */}
        {result.jackpotOrExtra && (
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center text-xs font-bold text-primary flex items-center justify-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-primary" />
            <span>{result.jackpotOrExtra}</span>
          </div>
        )}

        {/* Bottom card links */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
          <Link
            to={`/loteria/${result.company}/${drawSlug}`}
            className="text-primary hover:underline flex items-center gap-1 font-bold group-hover:gap-1.5 transition-all"
          >
            <History className="h-3.5 w-3.5" />
            <span>Ver Histórico</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link
            to={`/loteria/${result.company}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium text-2xs"
          >
            <span>Todos los sorteos</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

