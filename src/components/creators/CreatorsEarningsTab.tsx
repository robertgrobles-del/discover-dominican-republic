import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Coins, Info, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { DISPUTE_STATUS_LABEL, LEDGER_STATUS_LABEL, campaignErrorMessage, creatorCampaignsApi as api, money, type LedgerEntry } from "@/lib/creatorCampaignsApi";

/**
 * Ingresos del creador por concepto (plan de accesos, puntos 90, 91 y 92). Separa lo estimado de lo confirmado,
 * explica de dónde sale cada movimiento y por qué se revirtió, y permite disputar un movimiento con evidencia.
 */

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-DO", { dateStyle: "medium" }) : "—");
const fail = (error: unknown) => toast.error(campaignErrorMessage(error));

export function CreatorsEarningsTab() {
  const client = useQueryClient();
  const [disputing, setDisputing] = useState<LedgerEntry | null>(null);
  const [draft, setDraft] = useState({ reason: "", label: "", url: "" });

  const earnings = useQuery({ queryKey: ["creator-earnings"], enabled: !IS_MOCK_DATA, queryFn: api.earnings });
  const disputes = useQuery({ queryKey: ["creator-disputes"], enabled: !IS_MOCK_DATA, queryFn: api.myDisputes });

  const open = useMutation({
    mutationFn: () => api.openDispute({
      subject_type: "ledger_entry", subject_id: disputing!.id, reason: draft.reason.trim(),
      evidence: draft.label.trim() && draft.url.trim() ? [{ label: draft.label.trim(), url: draft.url.trim() }] : [],
    }),
    onSuccess: (res) => { toast.success(`Disputa abierta. Te responderemos antes del ${when(res.data.due_at)}.`); setDisputing(null); setDraft({ reason: "", label: "", url: "" }); void client.invalidateQueries({ queryKey: ["creator-disputes"] }); },
    onError: fail,
  });
  const withdraw = useMutation({ mutationFn: api.withdrawDispute, onSuccess: () => { toast.success("Disputa retirada"); void client.invalidateQueries({ queryKey: ["creator-disputes"] }); }, onError: fail });

  if (IS_MOCK_DATA) return <PanelEmptyState icon={Coins} title="Los ingresos necesitan el backend" description="Con datos simulados no hay movimientos reales que mostrar ni disputar." />;
  if (earnings.isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (earnings.isError) return <PanelEmptyState icon={Coins} title="No pudimos cargar tus ingresos" description={campaignErrorMessage(earnings.error)} actionLabel="Reintentar" onAction={() => earnings.refetch()} />;

  const data = earnings.data!.data;
  const evidenceOk = !draft.label.trim() === !draft.url.trim() && (!draft.url.trim() || /^https:\/\//.test(draft.url.trim()));
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-2 p-4 text-xs">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>{data.notes.estimated} Una comisión se confirma a los {data.notes.attribution_window_days} días de la venta. Tienes {data.notes.dispute_window_days} días para disputar un movimiento.</p>
        </CardContent>
      </Card>

      {data.by_source.length === 0
        ? <PanelEmptyState icon={Coins} title="Aún no tienes movimientos" description="Cuando una venta se atribuya a tus piezas o se apruebe una entrega de campaña, aparecerá aquí con su concepto." />
        : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.by_source.map((s) => (
              <Card key={`${s.source}-${s.currency}`}>
                <CardContent className="space-y-1 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-black">{money(s.confirmed, s.currency)}</p>
                  <p className="text-[11px] text-muted-foreground">confirmado{s.estimated !== 0 && <> · <span className="text-amber-600">{money(s.estimated, s.currency)} estimado</span></>}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {data.entries.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Movimientos</CardTitle><CardDescription className="text-xs">Cada movimiento dice de dónde sale y en qué estado está.</CardDescription></CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Concepto y origen</TableHead><TableHead className="text-right">Importe</TableHead><TableHead>Estado</TableHead><TableHead className="w-28" /></TableRow></TableHeader>
              <TableBody>
                {data.entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs">{when(e.created_at)}</TableCell>
                    <TableCell className="text-xs">
                      <span className="font-semibold">{data.by_source.find((s) => s.source === e.source)?.label ?? e.source}</span>
                      <span className="block text-muted-foreground">{e.origin}</span>
                      {e.reason && <span className="block text-muted-foreground">Motivo: {e.reason}</span>}
                    </TableCell>
                    <TableCell className={`whitespace-nowrap text-right text-xs font-semibold ${Number(e.amount) < 0 ? "text-destructive" : ""}`}>{money(e.amount, e.currency)}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">{LEDGER_STATUS_LABEL[e.status]}</Badge>
                      {e.status === "estimated" && e.confirms_at && <span className="mt-1 block text-[10px] text-muted-foreground">se confirma el {when(e.confirms_at)}</span>}
                    </TableCell>
                    <TableCell><Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs" onClick={() => { setDisputing(e); setDraft({ reason: "", label: "", url: "" }); }}>Disputar</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {disputing && (
        <Card className="border-amber-500/40">
          <CardHeader><CardTitle className="text-base">Disputar: {disputing.origin} ({money(disputing.amount, disputing.currency)})</CardTitle><CardDescription className="text-xs">Sólo tú y el equipo verán esta disputa.</CardDescription></CardHeader>
          <CardContent className="grid gap-3 text-xs md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="dispute-reason">Qué ocurrió (mínimo 10 caracteres)</label>
              <Input id="dispute-reason" value={draft.reason} maxLength={500} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} className="h-9 text-xs" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="dispute-label">Evidencia: qué es (opcional)</label>
              <Input id="dispute-label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Captura de la entrega" className="h-9 text-xs" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="dispute-url">Evidencia: enlace https</label>
              <Input id="dispute-url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" className="h-9 text-xs" />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button size="sm" className="h-9 rounded-xl text-xs" disabled={open.isPending || draft.reason.trim().length < 10 || !evidenceOk} onClick={() => open.mutate()}>Abrir disputa</Button>
              <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs" onClick={() => setDisputing(null)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Scale className="h-4 w-4" aria-hidden /> Mis disputas</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs">
          {disputes.isLoading && <Skeleton className="h-12 w-full" />}
          {disputes.data?.data.length === 0 && <p className="text-muted-foreground">No tienes disputas.</p>}
          {disputes.data?.data.map((d) => (
            <div key={d.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{d.reason}</span>
                <Badge variant="outline" className="text-[10px]">{DISPUTE_STATUS_LABEL[d.status]}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                Abierta el {when(d.created_at)}{d.status === "open" && <> · respuesta antes del {when(d.due_at)}</>}
                {d.resolution_note && <span className="block">Respuesta del equipo: {d.resolution_note}</span>}
              </p>
              {d.status === "open" && <Button size="sm" variant="outline" className="mt-2 h-8 rounded-xl text-xs" disabled={withdraw.isPending} onClick={() => withdraw.mutate(d.id)}>Retirar disputa</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
