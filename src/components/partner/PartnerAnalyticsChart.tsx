import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ChartDataPoint } from "@/data/partnerDashboardData";

interface PartnerAnalyticsChartProps {
  data: ChartDataPoint[];
}

export function PartnerAnalyticsChart({ data }: PartnerAnalyticsChartProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Volumen de Transacciones Recientes</CardTitle>
        <CardDescription>Visualización mensual de los ingresos recaudados por reservas.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(192, 10%, 60%)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(192, 10%, 60%)" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Area type="monotone" dataKey="ventas" stroke="hsl(193, 86%, 50%)" strokeWidth={2.5} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
