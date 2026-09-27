import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CreatorsPayoutsTabProps {
  balance: number;
  withdrawAmount: string;
  withdrawMethod: string;
  withdrawDetails: string;
  isWithdrawing: boolean;
  onWithdrawAmountChange: (val: string) => void;
  onWithdrawMethodChange: (val: string) => void;
  onWithdrawDetailsChange: (val: string) => void;
  onWithdraw: (e: React.FormEvent) => void;
}

export function CreatorsPayoutsTab({
  balance,
  withdrawAmount,
  withdrawMethod,
  withdrawDetails,
  isWithdrawing,
  onWithdrawAmountChange,
  onWithdrawMethodChange,
  onWithdrawDetailsChange,
  onWithdraw
}: CreatorsPayoutsTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Solicitar Retiro de Fondos</CardTitle>
          <CardDescription className="text-xs">Saldo disponible: <strong>${balance.toFixed(2)} USD</strong></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onWithdraw} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Monto a Retirar (USD)</label>
              <Input 
                type="number"
                placeholder="Mínimo $50 USD"
                value={withdrawAmount}
                onChange={(e) => onWithdrawAmountChange(e.target.value)}
                required
                className="mt-1 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Método de Cobro</label>
              <select
                value={withdrawMethod}
                onChange={(e) => onWithdrawMethodChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="paypal">PayPal</option>
                <option value="banco">Transferencia Bancaria Local (Banreservas, BHD, Popular)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Datos de la Cuenta</label>
              <Input 
                placeholder={withdrawMethod === "paypal" ? "correo@paypal.com" : "Banco, No. de Cuenta, Cédula / RNC"} 
                value={withdrawDetails}
                onChange={(e) => onWithdrawDetailsChange(e.target.value)}
                required
                className="mt-1 rounded-xl text-xs"
              />
            </div>
            <Button type="submit" disabled={isWithdrawing} className="w-full rounded-xl text-xs font-bold gap-2">
              {isWithdrawing ? "Procesando transferencia..." : "Solicitar Retiro Seguro"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Historial de Transferencias</CardTitle>
          <CardDescription className="text-xs">Comprobantes y liquidaciones anteriores.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { date: "2026-09-01", method: "Transferencia BHD", amount: "$150.00 USD", status: "Completado" },
            { date: "2026-08-15", method: "PayPal", amount: "$95.00 USD", status: "Completado" }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="font-semibold text-xs text-foreground">{item.method}</p>
                <p className="text-[10px] text-muted-foreground">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-bold text-foreground">{item.amount}</p>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] uppercase">
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
