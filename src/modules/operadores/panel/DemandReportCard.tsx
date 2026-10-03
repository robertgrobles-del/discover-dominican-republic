import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { HttpError } from "@/lib/httpClient";
import { money } from "@/lib/creatorCampaignsApi";
import { operatorToolsApi as api, recentQuarters, toolsErrorMessage } from "@/lib/operatorToolsApi";

const QUARTERS = recentQuarters(6);

/** Reporte trimestral de demanda de los planes Premium y Corporativo: cifras del trimestre y hallazgos comprobables. */
export function DemandReportCard() {
  const [quarter, setQuarter] = useState(QUARTERS[0]!);
  const report = useQuery({ queryKey: ["op", "demand", quarter], enabled: HAS_BACKEND_SESSION, queryFn: () => api.demand(quarter), retry: false });
  if (!HAS_BACKEND_SESSION) return null;
  const d = report.data?.data;
  const notIncluded = report.error instanceof HttpError && report.error.status === 403;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" aria-hidden /> Reporte trimestral de demanda</CardTitle>
            <CardDescription className="text-xs">Por fecha de servicio, comparado con el trimestre anterior.</CardDescription>
          </div>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger aria-label="Trimestre" className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{QUARTERS.map((q) => <SelectItem key={q} value={q} className="text-xs">{q}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {report.isLoading && <Skeleton className="h-24 w-full" />}
        {report.isError && <p className={notIncluded ? "text-muted-foreground" : "text-destructive"}>{notIncluded ? "Este reporte está incluido en los planes Premium y Corporativo." : toolsErrorMessage(report.error)}</p>}
        {d && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Reservas</p><p className="font-display text-2xl font-bold">{d.totals.bookings}</p><p className="text-[11px] text-muted-foreground">{d.previous.growth_pct === null ? "sin comparación" : `${d.previous.growth_pct >= 0 ? "+" : ""}${d.previous.growth_pct} % vs ${d.compared_to}`}</p></div>
              <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Viajeros</p><p className="font-display text-2xl font-bold">{d.totals.guests}</p><p className="text-[11px] text-muted-foreground">{d.totals.average_party_size} por reserva</p></div>
              <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Anticipación</p><p className="font-display text-2xl font-bold">{d.totals.average_lead_days ?? "—"}</p><p className="text-[11px] text-muted-foreground">días en promedio</p></div>
              <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Cancelaciones</p><p className="font-display text-2xl font-bold">{d.totals.cancellation_rate} %</p><p className="text-[11px] text-muted-foreground">{d.totals.cancelled} reservas</p></div>
            </div>
            {d.totals.revenue.length > 0 && <p className="text-xs text-muted-foreground">Valor reservado: {d.totals.revenue.map((r) => money(r.booked_value, r.currency)).join(" · ")}</p>}
            <div>
              <p className="mb-1 font-semibold">Hallazgos</p>
              <ul className="list-disc space-y-1 pl-5">{d.findings.map((f) => <li key={f}>{f}</li>)}</ul>
              <p className="mt-2 text-[11px] text-muted-foreground">Generado por {d.generated_by}.</p>
            </div>
            {d.top_listings.length > 0 && (
              <div>
                <p className="mb-1 font-semibold">Servicios más demandados</p>
                <ul className="space-y-1 text-xs">{d.top_listings.map((l) => <li key={l.listing_id} className="flex justify-between gap-2"><span>{l.title}</span><span className="text-muted-foreground">{l.guests} viajeros · {l.bookings} reservas</span></li>)}</ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
