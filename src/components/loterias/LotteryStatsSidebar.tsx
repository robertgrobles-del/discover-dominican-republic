import { Card } from "@/components/ui/card";
import { Flame, Snowflake, ShieldCheck } from "lucide-react";
import { HOT_COLD_STATS } from "@/data/loteriasData";
import { useI18n } from "@/hooks/useI18n";

export function LotteryStatsSidebar() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* HOT & COLD NUMBERS STATS */}
      <Card className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md shadow-sm p-6 space-y-5">
        <div>
          <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5" />
            </div>
            {t("lottery.stats.hot")}
          </h3>
          <p className="text-2xs text-muted-foreground mt-0.5">{t("lottery.stats.hotSubtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {HOT_COLD_STATS.hotNumbers.map((item) => (
            <div
              key={item.num}
              className="px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-700 dark:text-orange-300 text-xs font-mono font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span className="text-sm font-black">{item.num}</span>
              <span className="text-3xs opacity-80 font-sans">({item.count}x)</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border/60">
          <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Snowflake className="h-3.5 w-3.5" />
            </div>
            {t("lottery.stats.cold")}
          </h3>
          <p className="text-2xs text-muted-foreground mt-0.5">{t("lottery.stats.coldSubtitle")}</p>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          {HOT_COLD_STATS.coldNumbers.map((item) => (
            <div key={item.num} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/40">
              <span className="font-mono font-black text-foreground text-sm">{item.num}</span>
              <span className="text-2xs font-medium">{item.note}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Responsible Gaming Notice */}
      <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/70 text-2xs text-muted-foreground leading-relaxed flex items-start gap-2.5 shadow-2xs">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>{t("lottery.disclaimer")}</span>
      </div>
    </div>
  );
}
