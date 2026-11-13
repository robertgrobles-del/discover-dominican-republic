import { Card } from "@/components/ui/card";
import { Flame, Snowflake, ShieldCheck } from "lucide-react";
import { HOT_COLD_STATS } from "@/data/loteriasData";
import { useI18n } from "@/hooks/useI18n";

export function LotteryStatsSidebar() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* HOT & COLD NUMBERS STATS */}
      <Card className="rounded-3xl border-border bg-card shadow-sm p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            {t("lottery.stats.hot")}
          </h3>
          <p className="text-2xs text-muted-foreground">{t("lottery.stats.hotSubtitle")}:</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {HOT_COLD_STATS.hotNumbers.map((item) => (
            <div
              key={item.num}
              className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <span className="text-sm font-black">{item.num}</span>
              <span className="text-3xs opacity-80">({item.count}x)</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Snowflake className="h-4 w-4 text-cyan-500" />
            {t("lottery.stats.cold")}
          </h3>
          <p className="text-2xs text-muted-foreground">{t("lottery.stats.coldSubtitle")}:</p>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {HOT_COLD_STATS.coldNumbers.map((item) => (
            <div key={item.num} className="flex items-center justify-between">
              <span className="font-mono font-bold text-foreground">{item.num}</span>
              <span className="text-2xs">{item.note}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Responsible Gaming Notice */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-2xs text-muted-foreground leading-relaxed flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>{t("lottery.disclaimer")}</span>
      </div>
    </div>
  );
}
