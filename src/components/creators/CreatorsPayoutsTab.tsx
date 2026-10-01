import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CreatorPayoutsProps {
  profile: { balance_available: number | string; balance_pending: number | string } | null;
  payouts: Array<{ id: string; amount: number | string; status: string; created_at: string }>;
}

const money = (value: number | string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
};

export function CreatorsPayoutsTab({ profile, payouts }: CreatorPayoutsProps) {
  return <div className="grid md:grid-cols-2 gap-6">
    <Card className="border border-border bg-card">
      <CardHeader><CardTitle className="text-base font-bold">Saldo del creador</CardTitle><CardDescription className="text-xs">Información consultada desde el backend.</CardDescription></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>Disponible: <strong>{profile ? money(profile.balance_available) : "—"}</strong></p>
        <p>Pendiente: <strong>{profile ? money(profile.balance_pending) : "—"}</strong></p>
        <p className="text-xs text-muted-foreground">La solicitud de retiro para creadores aún no está habilitada. Esta pantalla no procesa pagos.</p>
      </CardContent>
    </Card>
    <Card className="border border-border bg-card">
      <CardHeader><CardTitle className="text-base font-bold">Pagos registrados</CardTitle><CardDescription className="text-xs">Historial devuelto por el servicio, sin datos de ejemplo.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {payouts.length === 0 ? <p className="text-xs text-muted-foreground">No hay pagos registrados.</p> : payouts.map(item => <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border">
          <div><p className="font-semibold text-xs">{new Date(item.created_at).toLocaleDateString("es-DO")}</p><p className="text-[10px] text-muted-foreground">{money(item.amount)}</p></div>
          <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
        </div>)}
      </CardContent>
    </Card>
  </div>;
}
