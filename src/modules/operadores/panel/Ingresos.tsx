import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useBookings } from "../api";
import { formatMoney } from "../constants";
import { useOrg } from "./OrgContext";

export function summarizeIncome(bookings: ReturnType<typeof useBookings>["data"], commissionRate: number) {
  const paid = (bookings || []).filter((b) => b.payment_status === "paid" && b.status !== "cancelled");
  const gross = paid.reduce((n, b) => n + b.total_price, 0);
  // Solo las reservas hechas en la web del operador generan comisión.
  const commission = paid.filter((b) => b.source === "web").reduce((n, b) => n + (b.total_price * commissionRate) / 100, 0);
  const settled = paid.filter((b) => b.status === "completed").reduce((n, b) => n + (b.source === "web" ? b.total_price * (1 - commissionRate / 100) : b.total_price), 0);
  return { paid, gross, commission, net: gross - commission, settled, pending: gross - commission - settled };
}

export default function Ingresos() {
  const { org } = useOrg();
  const { data: bookings = [] } = useBookings(org.id);
  const s = useMemo(() => summarizeIncome(bookings, org.commission_rate), [bookings, org.commission_rate]);
  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    s.paid.forEach((b) => { const k = b.date.slice(0, 7); map[k] = (map[k] || 0) + b.total_price; });
    return Object.entries(map).sort().map(([mes, total]) => ({ mes, total }));
  }, [s.paid]);

  const stats = [
    { label: "Ventas cobradas", value: formatMoney(s.gross) },
    { label: `Comisión (${org.commission_rate}% web)`, value: formatMoney(s.commission) },
    { label: "Ganancia neta", value: formatMoney(s.net) },
    { label: "Liquidado", value: formatMoney(s.settled) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Ingresos</h1>
      <p className="text-sm text-muted-foreground">Montos en dólares equivalentes a las reservas registradas. Solo las reservas pagadas en tu sitio web pagan comisión.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((x) => <Card key={x.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{x.label}</p><p className="font-display text-2xl font-bold">{x.value}</p></CardContent></Card>)}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Ventas por mes</CardTitle></CardHeader>
        <CardContent className="h-64">
          {byMonth.length === 0 ? <p className="text-sm text-muted-foreground">Sin cobros registrados todavía.</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Cobros</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {s.paid.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay cobros.</p> : s.paid.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border/60 pb-2 last:border-0">
              <span className="truncate">{b.contact_name} · {b.listing_title}</span>
              <span className="flex items-center gap-2"><Badge variant="outline">{b.status === "completed" ? "Liquidable" : "Retenido"}</Badge><span className="font-mono">{formatMoney(b.total_price, b.currency)}</span></span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
