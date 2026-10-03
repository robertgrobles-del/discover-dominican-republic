import { useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { money } from "@/lib/creatorCampaignsApi";
import { DISCREPANCY_LABEL, HEATMAP_METRIC_LABEL, WEEKDAYS, adminInsightsApi as api, heatmapGrid, lastDays, type DiscrepancyKind, type HeatmapMetric } from "@/lib/adminInsightsApi";

/**
 * Indicadores del equipo (mejoras 103, 106, 112 y 115): tasa de rebote, índice de satisfacción, mapa de calor
 * de actividad y conciliación de cobros. Todo es agregado; sólo la conciliación muestra referencias de reservas.
 */

const RANGES = [7, 30, 90] as const;
const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-xl border border-border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-2xl font-bold">{value}</p>
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);
/** Estados comunes de carga y error; devuelve los datos sólo cuando existen. */
function Loaded<T>({ query, children }: { query: UseQueryResult<{ data: T }>; children: (data: T) => React.ReactNode }) {
  if (query.isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (query.isError || !query.data) return <PanelEmptyState icon={BarChart3} title="No pudimos cargar este reporte" description="Puede que tu rol no tenga acceso o que el servicio no responda." actionLabel="Reintentar" onAction={() => query.refetch()} />;
  return <>{children(query.data.data)}</>;
}

export function AdminInsightsPanel() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [metric, setMetric] = useState<HeatmapMetric>("page_view");
  const range = lastDays(days);
  const key = [range.from, range.to];
  const bounce = useQuery({ queryKey: ["insights", "bounce", ...key], enabled: HAS_BACKEND_SESSION, queryFn: () => api.bounce(range) });
  const satisfaction = useQuery({ queryKey: ["insights", "satisfaction", ...key], enabled: HAS_BACKEND_SESSION, queryFn: () => api.satisfaction(range) });
  const heatmap = useQuery({ queryKey: ["insights", "heatmap", metric, ...key], enabled: HAS_BACKEND_SESSION, queryFn: () => api.heatmap(range, metric) });
  const reconciliation = useQuery({ queryKey: ["insights", "reconciliation", ...key], enabled: HAS_BACKEND_SESSION, queryFn: () => api.reconciliation(range), retry: false });

  if (!HAS_BACKEND_SESSION) return <PanelEmptyState icon={BarChart3} title="Los indicadores necesitan el backend" description="Con datos simulados no hay tráfico, reseñas ni cobros reales que medir." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Indicadores y finanzas</h2>
        <div className="flex gap-1" role="group" aria-label="Periodo">
          {RANGES.map((d) => <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${days === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d} días</button>)}
        </div>
      </div>
      <Tabs defaultValue="rebote">
        <TabsList className="flex-wrap">
          <TabsTrigger value="rebote">Rebote</TabsTrigger>
          <TabsTrigger value="satisfaccion">Satisfacción</TabsTrigger>
          <TabsTrigger value="calor">Mapa de calor</TabsTrigger>
          <TabsTrigger value="conciliacion">Conciliación</TabsTrigger>
        </TabsList>

        <TabsContent value="rebote">
          <Loaded query={bounce}>{(d) => (
            <div className="space-y-4">
              {d.alert && <p className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden /> El rebote del periodo supera el umbral de {d.threshold_pct} %.</p>}
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Tasa de rebote" value={`${d.bounce_rate} %`} hint={`Umbral de alerta: ${d.threshold_pct} % con ${d.min_sessions} sesiones o más`} />
                <Stat label="Sesiones con alguna página vista" value={String(d.sessions)} />
                <Stat label="Sesiones que rebotaron" value={String(d.bounced)} />
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Páginas de entrada con más rebotes</CardTitle><CardDescription className="text-xs">Sólo entradas con 5 sesiones o más.</CardDescription></CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  {d.landing_pages.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Sin datos suficientes en este periodo.</p> : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Página</TableHead><TableHead className="text-right">Sesiones</TableHead><TableHead className="text-right">Rebotes</TableHead><TableHead className="text-right">Tasa</TableHead></TableRow></TableHeader>
                      <TableBody>{d.landing_pages.map((p) => <TableRow key={p.page}><TableCell className="text-sm">{p.page}</TableCell><TableCell className="text-right text-sm">{p.sessions}</TableCell><TableCell className="text-right text-sm">{p.bounced}</TableCell><TableCell className="text-right text-sm font-semibold">{p.bounce_rate} %</TableCell></TableRow>)}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}</Loaded>
        </TabsContent>

        <TabsContent value="satisfaccion">
          <Loaded query={satisfaction}>{(d) => (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Índice de satisfacción" value={d.index === null ? "—" : `${d.index} / 100`} hint={`Las reseñas de visitantes con sello de Pasaporte pesan ×${d.verified_weight}`} />
                <Stat label="Calificación promedio" value={d.average_rating === null ? "—" : `${d.average_rating} / 5`} hint={`${d.reviews} reseñas aprobadas`} />
                <Stat label="Promedio de visitantes con sello" value={d.average_verified_rating === null ? "—" : `${d.average_verified_rating} / 5`} hint={`${d.verified_reviews} reseñas`} />
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Por tipo de lugar</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  {d.by_entity_type.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No hay reseñas aprobadas en este periodo.</p> : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead className="text-right">Reseñas</TableHead><TableHead className="text-right">Con sello</TableHead><TableHead className="text-right">Promedio</TableHead><TableHead className="text-right">Índice</TableHead></TableRow></TableHeader>
                      <TableBody>{d.by_entity_type.map((t) => <TableRow key={t.entity_type}><TableCell className="text-sm">{t.entity_type}</TableCell><TableCell className="text-right text-sm">{t.reviews}</TableCell><TableCell className="text-right text-sm">{t.verified_reviews}</TableCell><TableCell className="text-right text-sm">{t.average_rating ?? "—"}</TableCell><TableCell className="text-right text-sm font-semibold">{t.index ?? "—"}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}</Loaded>
        </TabsContent>

        <TabsContent value="calor">
          <div className="mb-3 max-w-xs">
            <Select value={metric} onValueChange={(v) => setMetric(v as HeatmapMetric)}>
              <SelectTrigger aria-label="Actividad a mostrar" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(HEATMAP_METRIC_LABEL) as HeatmapMetric[]).map((m) => <SelectItem key={m} value={m} className="text-xs">{HEATMAP_METRIC_LABEL[m]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Loaded query={heatmap}>{(d) => {
            const grid = heatmapGrid(d.cells), max = Math.max(1, ...grid.flat());
            return (
              <Card>
                <CardHeader><CardTitle className="text-base">Actividad por día y hora (hora de Santo Domingo)</CardTitle><CardDescription className="text-xs">{d.total_events} eventos{d.peak ? ` · pico: ${WEEKDAYS[d.peak.weekday - 1]} a las ${d.peak.hour}:00 (${d.peak.events})` : ""}</CardDescription></CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="border-separate border-spacing-0.5 text-[10px]">
                    <thead><tr><td />{Array.from({ length: 24 }, (_, h) => <th key={h} scope="col" className="w-6 font-normal text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>{grid.map((row, w) => (
                      <tr key={w}>
                        <th scope="row" className="pr-2 text-left font-semibold text-muted-foreground">{WEEKDAYS[w]}</th>
                        {row.map((n, h) => <td key={h} title={`${WEEKDAYS[w]} ${h}:00 · ${n} eventos`} className="h-6 w-6 rounded-sm text-center" style={{ backgroundColor: n ? `hsl(var(--primary) / ${0.12 + 0.88 * (n / max)})` : "hsl(var(--muted))" }}><span className="sr-only">{n}</span></td>)}
                      </tr>
                    ))}</tbody>
                  </table>
                </CardContent>
              </Card>
            );
          }}</Loaded>
        </TabsContent>

        <TabsContent value="conciliacion">
          <Loaded query={reconciliation}>{(d) => (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(DISCREPANCY_LABEL) as DiscrepancyKind[]).map((k) => <Stat key={k} label={DISCREPANCY_LABEL[k]} value={String(d.discrepancy_counts[k])} />)}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card><CardHeader><CardTitle className="text-base">Cobrado</CardTitle><CardDescription className="text-xs">{d.failed_payments} cobros fallidos en el periodo</CardDescription></CardHeader>
                  <CardContent className="space-y-1 text-sm">{d.collected.length === 0 ? <p className="text-muted-foreground">Sin cobros.</p> : d.collected.map((c) => <p key={`${c.source}-${c.currency}-${c.provider}`} className="flex justify-between gap-2"><span>{c.source === "booking" ? "Reservas" : "Tienda"} · {c.provider}</span><span className="font-semibold">{money(c.net, c.currency)}</span></p>)}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Facturado (NCF)</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm">{d.invoiced.length === 0 ? <p className="text-muted-foreground">Sin comprobantes.</p> : d.invoiced.map((i) => <p key={`${i.reference_type}-${i.currency}`} className="flex justify-between gap-2"><span>{i.reference_type} · {i.invoices}</span><span className="font-semibold">{money(i.total, i.currency)}</span></p>)}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Liquidaciones</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm">{d.payouts.length === 0 ? <p className="text-muted-foreground">Sin liquidaciones.</p> : d.payouts.map((p) => <p key={`${p.status}-${p.currency}`} className="flex justify-between gap-2"><span>{p.status} · {p.payouts}</span><span className="font-semibold">{money(p.net, p.currency)}</span></p>)}</CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Lo que no cuadra</CardTitle><CardDescription className="text-xs">Hasta {d.notes.list_limit} filas por tipo. Una reserva cuenta como sin liquidar a los {d.notes.unsettled_after_days} días de completada.</CardDescription></CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  {d.discrepancies.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Todo cuadra en este periodo.</p> : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Caso</TableHead><TableHead>Referencia</TableHead><TableHead className="text-right">Cobrado</TableHead><TableHead className="text-right">Facturado</TableHead></TableRow></TableHeader>
                      <TableBody>{d.discrepancies.map((x) => <TableRow key={`${x.kind}-${x.reference_id}-${x.label}`}><TableCell><Badge variant="outline" className="text-[10px]">{DISCREPANCY_LABEL[x.kind]}</Badge></TableCell><TableCell className="text-sm">{x.label}</TableCell><TableCell className="text-right text-sm">{money(x.collected, x.currency)}</TableCell><TableCell className="text-right text-sm">{money(x.invoiced, x.currency)}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}</Loaded>
        </TabsContent>
      </Tabs>
    </div>
  );
}
