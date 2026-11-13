import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface LotteryCheckerProps {
  checkNumber: string;
  onCheckNumberChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  checkResult: {
    tested: boolean;
    matches: { draw: string; position: number; date: string }[];
  } | null;
}

export function LotteryChecker({
  checkNumber,
  onCheckNumberChange,
  onSubmit,
  checkResult,
}: LotteryCheckerProps) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="checker-title" className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm dark:bg-card sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-3 md:w-72 md:shrink-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Sparkles className="h-5 w-5" /></span>
          <div>
            <h2 id="checker-title" className="font-display text-base font-bold text-foreground">{t("lottery.checker.title")}</h2>
            <p className="text-xs text-muted-foreground">{t("lottery.checker.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-1 items-end gap-3">
          <div className="w-28 shrink-0">
            <Label htmlFor="checker-number" className="mb-1 block text-xs font-semibold text-muted-foreground">{t("lottery.checker.inputLabel")}</Label>
            <Input id="checker-number" type="text" inputMode="numeric" maxLength={2} placeholder="00" value={checkNumber}
              onChange={(e) => onCheckNumberChange(e.target.value.replace(/\D/g, ""))}
              className="h-12 rounded-xl text-center font-mono text-2xl font-black tracking-widest" required />
          </div>
          <Button type="submit" className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700">{t("lottery.checker.button")}</Button>
        </form>

        {checkResult?.tested ? (
          <div aria-live="polite" className={`rounded-2xl border p-3 text-xs md:max-w-sm md:flex-1 ${checkResult.matches.length ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-muted/60"}`}>
            {checkResult.matches.length ? (
              <>
                <p className="mb-1.5 flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" />{t("lottery.checker.congrats")}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {checkResult.matches.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-background px-2 py-1">
                      <span className="font-semibold text-foreground">{m.draw}</span>
                      <Badge className="bg-emerald-500 text-3xs font-black text-slate-950">{m.position}.º</Badge>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p><span className="font-bold text-foreground">El {checkNumber} no ha salido hoy.</span> {t("lottery.checker.noMatch")}</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
