import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";

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
  return (
    <Card className="rounded-3xl border-2 border-amber-500/30 bg-card shadow-xl overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Comprobar Mi Jugada / Número
        </CardTitle>
        <CardDescription className="text-xs">
          Verifica si tu número o palé salió premiado en cualquiera de las loterías hoy.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1 block">
              Número a Consultar (00 al 99)
            </Label>
            <Input
              type="text"
              maxLength={2}
              placeholder="Ej. 42"
              value={checkNumber}
              onChange={(e) => onCheckNumberChange(e.target.value.replace(/\D/g, ""))}
              className="font-mono text-center text-2xl font-black rounded-xl tracking-widest h-12 bg-background"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs h-10 shadow-md shadow-amber-500/20"
          >
            Comprobar Número en Sorteos
          </Button>
        </form>

        {/* Result of check */}
        {checkResult && checkResult.tested && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              checkResult.matches.length > 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                : "bg-muted/80 border-border text-muted-foreground"
            }`}
          >
            {checkResult.matches.length > 0 ? (
              <>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4" /> ¡Felicidades! Salió premiado:
                </div>
                <div className="space-y-1 pt-1">
                  {checkResult.matches.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{m.draw}</span>
                      <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black">
                        {m.position}ª Posición
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center space-y-1">
                <p className="font-bold text-foreground">El número {checkNumber} no ha salido hoy</p>
                <p className="text-[11px] text-muted-foreground">¡Sigue probando tu suerte en los próximos sorteos!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
