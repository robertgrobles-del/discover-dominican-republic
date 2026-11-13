import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <Card className="rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl overflow-hidden backdrop-blur-md">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-display font-bold text-foreground">
              {t("lottery.checker.title")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("lottery.checker.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              {t("lottery.checker.inputLabel")}
            </Label>
            <div className="relative">
              <Input
                type="text"
                maxLength={2}
                placeholder="42"
                value={checkNumber}
                onChange={(e) => onCheckNumberChange(e.target.value.replace(/\D/g, ""))}
                className="font-mono text-center text-3xl font-black rounded-2xl tracking-widest h-14 bg-background/90 border-border/80 focus:border-primary shadow-inner"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-11 shadow-lg shadow-primary/20"
          >
            {t("lottery.checker.button")}
          </Button>
        </form>

        {/* Result of check */}
        {checkResult && checkResult.tested && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
              checkResult.matches.length > 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                : "bg-muted/60 border-border/80 text-muted-foreground"
            }`}
          >
            {checkResult.matches.length > 0 ? (
              <>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <CheckCircle2 className="h-4 w-4" /> {t("lottery.checker.congrats")}:
                </div>
                <div className="space-y-1.5 pt-1">
                  {checkResult.matches.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-background/80 border border-emerald-500/20">
                      <span className="font-bold text-foreground">{m.draw}</span>
                      <Badge className="bg-emerald-500 text-slate-950 text-3xs font-black shadow-xs">
                        {m.position}ª Posición
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-2 space-y-1">
                <p className="font-bold text-foreground">El número {checkNumber} no ha salido hoy</p>
                <p className="text-2xs text-muted-foreground">{t("lottery.checker.noMatch")}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
