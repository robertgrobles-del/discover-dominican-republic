import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, Gift } from "lucide-react";
import { LotteryResult } from "@/data/loteriasData";

interface LotteryCardProps {
  result: LotteryResult;
}

export function LotteryCard({ result }: LotteryCardProps) {
  return (
    <Card className="rounded-3xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-md overflow-hidden flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{result.logo}</span>
            <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              {result.companyName}
            </span>
          </div>
          <h3 className="font-display font-bold text-base text-foreground mt-0.5">
            {result.drawName}
          </h3>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-primary flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" /> {result.drawTime}
          </span>
          <span className="text-[10px] text-muted-foreground block">{result.date}</span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 space-y-4">
        {/* Winning Balls Visualization */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
          {result.winningNumbers.map((num, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={idx}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center font-mono font-black shadow-lg transition-transform hover:scale-110 select-none ${
                  isFirst
                    ? "bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border-2 border-amber-300 ring-2 ring-amber-400/20"
                    : isSecond
                    ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white border-2 border-blue-300"
                    : isThird
                    ? "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-2 border-emerald-300"
                    : "bg-gradient-to-b from-slate-700 to-slate-900 text-white border border-slate-600"
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{num}</span>
                {result.winningNumbers.length <= 3 && (
                  <span className="text-[8px] font-sans font-bold uppercase opacity-80">
                    {isFirst ? "1ra" : isSecond ? "2da" : "3ra"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Jackpot / Extra Info */}
        {result.jackpotOrExtra && (
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center text-xs font-bold text-primary flex items-center justify-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-amber-500" />
            <span>{result.jackpotOrExtra}</span>
          </div>
        )}

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <Link
            to={`/loteria/${result.company}`}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Ver todos los sorteos de {result.companyName}</span>
            <span>→</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
