import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, RefreshCw, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MockDataNotice } from "@/components/MockDataNotice";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { UUID_PATTERN } from "@/lib/accessGovernanceApi";
import { campaignErrorMessage, creatorCampaignsApi as api, type AdminCampaign, type CampaignTerms } from "@/lib/creatorCampaignsApi";

/**
 * Campañas con creadores para el personal (plan de accesos, puntos 87 a 92): redactar los términos, abrir y
 * cerrar campañas, revisar entregas, consultar quién aceptó qué versión y resolver disputas.
 */

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }) : "—");
const fail = (error: unknown) => toast.error(campaignErrorMessage(error));
const list = (text: string) => text.split(",").map((x) => x.trim()).filter(Boolean);
const STATUS: Record<AdminCampaign["status"], string> = { draft: "Borrador", open: "Abierta", closed: "Cerrada" };

const EMPTY = {
  title: "", sponsor: "", brief: "", deliverableType: "video", quantity: "1", startsOn: "", endsOn: "",
  compensation: "fixed", amount: "", currency: "DOP", pct: "", disclosure: "#publicidad visible al inicio",
  metrics: "", media: "portal", territory: "República Dominicana", days: "180", exclusive: "no", uses: "feed",
};

/** Arma los términos desde el formulario; devuelve el problema si algo falta. */
export function buildTerms(f: typeof EMPTY): { terms?: CampaignTerms; problem?: string } {
  if (f.brief.trim().length < 20) return { problem: "El brief necesita al menos 20 caracteres." };
  if (!f.startsOn || !f.endsOn) return { problem: "Indica las fechas de inicio y fin." };
  if (f.endsOn < f.startsOn) return { problem: "La campaña no puede terminar antes de empezar." };
  const quantity = Number(f.quantity), days = Number(f.days);
  if (!Number.isInteger(quantity) || quantity < 1) return { problem: "La cantidad de entregables debe ser un entero positivo." };
  if (!Number.isInteger(days) || days < 1 || days > 3650) return { problem: "El plazo de la licencia va de 1 a 3650 días: no hay licencias perpetuas." };
  if (f.disclosure.trim().length < 3) return { problem: "Indica cómo se identificará el contenido como publicidad." };
  if (!list(f.media).length || !list(f.uses).length) return { problem: "Indica al menos un medio y un uso aprobado." };
  let compensation: CampaignTerms["compensation"];
  if (f.compensation === "fixed") {
    const amount = Number(f.amount);
    if (!(amount > 0)) return { problem: "El pago fijo debe ser mayor que cero." };
    compensation = { type: "fixed", amount, currency: f.currency as "DOP" | "USD" };
  } else if (f.compensation === "commission") {
    const pct = Number(f.pct);
    if (!(pct > 0 && pct <= 50)) return { problem: "La comisión va de 0 a 50 %." };
    compensation = { type: "commission", commission_pct: pct };
  } else compensation = { type: "none" };
  return {
    terms: {
      brief: f.brief.trim(),
      deliverables: [{ type: f.deliverableType as CampaignTerms["deliverables"][number]["type"], quantity }],
      schedule: { starts_on: f.startsOn, ends_on: f.endsOn },
      compensation, disclosure: f.disclosure.trim(), metrics: list(f.metrics),
      rights: { media: list(f.media), territory: f.territory.trim(), duration_days: days, exclusive: f.exclusive === "si", approved_uses: list(f.uses) },
    },
  };
}

export function AdminCreatorCampaigns() {
  if (IS_MOCK_DATA) {
    return (
      <div className="space-y-6">
        <MockDataNotice className="rounded-xl" />
        <PanelEmptyState icon={Megaphone} title="Las campañas con creadores necesitan el backend" description="Términos, aceptaciones, entregas y disputas se guardan en el servidor. Con datos simulados no hay nada real que gestionar." />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold"><Megaphone className="h-5 w-5 text-primary" aria-hidden /> Campañas con creadores</h2>
        <p className="text-xs text-muted-foreground">Términos versionados, entregas, evidencia de aceptación y disputas.</p>
      </div>
      <Tabs defaultValue="campanas">
        <TabsList>
          <TabsTrigger value="campanas" className="gap-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" aria-hidden /> Campañas</TabsTrigger>
          <TabsTrigger value="disputas" className="gap-1.5 text-xs"><Scale className="h-3.5 w-3.5" aria-hidden /> Disputas e ingresos</TabsTrigger>
        </TabsList>
        <TabsContent value="campanas" className="space-y-4"><CampaignsTab /></TabsContent>
        <TabsContent value="disputas" className="space-y-4"><DisputesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CampaignsTab() {
  const client = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const set = (patch: Partial<typeof EMPTY>) => setForm({ ...form, ...patch });

  const campaigns = useQuery({ queryKey: ["admin-creator-campaigns"], queryFn: api.adminList });
  const deliverables = useQuery({ queryKey: ["admin-campaign-deliverables", selected], enabled: !!selected, queryFn: () => api.adminDeliverables(selected!) });
  const acceptances = useQuery({ queryKey: ["admin-campaign-acceptances", selected], enabled: !!selected, queryFn: () => api.adminAcceptances(selected!) });
  const refresh = () => { void client.invalidateQueries({ queryKey: ["admin-creator-campaigns"] }); void client.invalidateQueries({ queryKey: ["admin-campaign-deliverables"] }); };

  const built = buildTerms(form);
  const create = useMutation({
    mutationFn: () => api.adminCreate({ title: form.title.trim(), ...(form.sponsor.trim() ? { sponsor: form.sponsor.trim() } : {}), terms: built.terms! }),
    onSuccess: () => { toast.success("Campaña creada en borrador. Ábrela para que los creadores la vean."); setForm(EMPTY); refresh(); },
    onError: fail,
  });
  const status = useMutation({ mutationFn: ({ id, to }: { id: string; to: "open" | "closed" }) => api.adminSetStatus(id, to), onSuccess: (_d, v) => { toast.success(v.to === "open" ? "Campaña abierta" : "Campaña cerrada"); refresh(); }, onError: fail });
  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approved" | "rejected" }) => api.adminReview(id, decision, notes[id]?.trim() || undefined),
    onSuccess: (_d, v) => { toast.success(v.decision === "approved" ? "Entrega aprobada: se registró la licencia y, si aplica, el pago" : "Entrega rechazada"); refresh(); },
    onError: fail,
  });

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-sm">Nueva campaña</CardTitle><CardDescription className="text-xs">Los términos quedan como versión 1. Cambiarlos después crea una versión nueva y obliga a aceptar de nuevo.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 text-xs md:grid-cols-2">
          <Field label="Título" id="cc-title"><Input id="cc-title" value={form.title} onChange={(e) => set({ title: e.target.value })} className="h-9 text-xs" /></Field>
          <Field label="Marca (opcional)" id="cc-sponsor"><Input id="cc-sponsor" value={form.sponsor} onChange={(e) => set({ sponsor: e.target.value })} className="h-9 text-xs" /></Field>
          <div className="md:col-span-2"><Field label="Brief (qué se espera del contenido)" id="cc-brief"><Textarea id="cc-brief" value={form.brief} onChange={(e) => set({ brief: e.target.value })} rows={3} className="text-xs" /></Field></div>
          <Field label="Entregable" id="cc-type">
            <div className="flex gap-2">
              <Select value={form.deliverableType} onValueChange={(v) => set({ deliverableType: v })}>
                <SelectTrigger id="cc-type" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["video", "foto", "publicacion", "historia"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input aria-label="Cantidad" type="number" min={1} value={form.quantity} onChange={(e) => set({ quantity: e.target.value })} className="h-9 w-24 text-xs" />
            </div>
          </Field>
          <Field label="Calendario (inicio y fin)" id="cc-start">
            <div className="flex gap-2">
              <Input id="cc-start" type="date" value={form.startsOn} onChange={(e) => set({ startsOn: e.target.value })} className="h-9 text-xs" />
              <Input aria-label="Fin" type="date" value={form.endsOn} onChange={(e) => set({ endsOn: e.target.value })} className="h-9 text-xs" />
            </div>
          </Field>
          <Field label="Compensación" id="cc-comp">
            <div className="flex gap-2">
              <Select value={form.compensation} onValueChange={(v) => set({ compensation: v })}>
                <SelectTrigger id="cc-comp" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed" className="text-xs">Pago fijo</SelectItem>
                  <SelectItem value="commission" className="text-xs">Comisión</SelectItem>
                  <SelectItem value="none" className="text-xs">Sin compensación</SelectItem>
                </SelectContent>
              </Select>
              {form.compensation === "fixed" && <>
                <Input aria-label="Importe" type="number" min={1} value={form.amount} onChange={(e) => set({ amount: e.target.value })} placeholder="Importe" className="h-9 text-xs" />
                <Select value={form.currency} onValueChange={(v) => set({ currency: v })}>
                  <SelectTrigger className="h-9 w-24 text-xs" aria-label="Moneda"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="DOP" className="text-xs">DOP</SelectItem><SelectItem value="USD" className="text-xs">USD</SelectItem></SelectContent>
                </Select>
              </>}
              {form.compensation === "commission" && <Input aria-label="Porcentaje de comisión" type="number" min={1} max={50} value={form.pct} onChange={(e) => set({ pct: e.target.value })} placeholder="% (máx. 50)" className="h-9 text-xs" />}
            </div>
          </Field>
          <Field label="Divulgación publicitaria" id="cc-disc"><Input id="cc-disc" value={form.disclosure} onChange={(e) => set({ disclosure: e.target.value })} className="h-9 text-xs" /></Field>
          <Field label="Métricas (separadas por coma)" id="cc-metrics"><Input id="cc-metrics" value={form.metrics} onChange={(e) => set({ metrics: e.target.value })} placeholder="reproducciones, clics" className="h-9 text-xs" /></Field>
          <Field label="Medios de la licencia (coma)" id="cc-media"><Input id="cc-media" value={form.media} onChange={(e) => set({ media: e.target.value })} className="h-9 text-xs" /></Field>
          <Field label="Usos aprobados (coma)" id="cc-uses"><Input id="cc-uses" value={form.uses} onChange={(e) => set({ uses: e.target.value })} className="h-9 text-xs" /></Field>
          <Field label="Territorio" id="cc-terr"><Input id="cc-terr" value={form.territory} onChange={(e) => set({ territory: e.target.value })} className="h-9 text-xs" /></Field>
          <Field label="Plazo de la licencia (días) y exclusividad" id="cc-days">
            <div className="flex gap-2">
              <Input id="cc-days" type="number" min={1} max={3650} value={form.days} onChange={(e) => set({ days: e.target.value })} className="h-9 text-xs" />
              <Select value={form.exclusive} onValueChange={(v) => set({ exclusive: v })}>
                <SelectTrigger className="h-9 text-xs" aria-label="Exclusividad"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="no" className="text-xs">No exclusiva</SelectItem><SelectItem value="si" className="text-xs">Exclusiva</SelectItem></SelectContent>
              </Select>
            </div>
          </Field>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button size="sm" className="h-9 rounded-xl text-xs" disabled={create.isPending || form.title.trim().length < 3 || !built.terms} onClick={() => create.mutate()}>Crear en borrador</Button>
            {built.problem && form.brief && <span className="text-muted-foreground">{built.problem}</span>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl text-xs" onClick={() => campaigns.refetch()} disabled={campaigns.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${campaigns.isFetching ? "animate-spin" : ""}`} aria-hidden /> Actualizar</Button>
      </div>
      {campaigns.isError && <ErrorCard text={campaignErrorMessage(campaigns.error)} />}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Campaña</TableHead><TableHead>Estado</TableHead><TableHead>Versión</TableHead><TableHead>Aceptaron la vigente</TableHead><TableHead>Entregas por revisar</TableHead><TableHead className="w-64" /></TableRow></TableHeader>
            <TableBody>
              {campaigns.isLoading && <TableRow><TableCell colSpan={6} className="p-6"><Skeleton className="h-12 w-full" /></TableCell></TableRow>}
              {campaigns.data?.data.map((c) => (
                <TableRow key={c.id} className={c.id === selected ? "bg-muted/50" : ""}>
                  <TableCell className="text-xs"><span className="font-semibold">{c.title}</span>{c.sponsor && <span className="block text-muted-foreground">{c.sponsor}</span>}</TableCell>
                  <TableCell><Badge variant={c.status === "open" ? "default" : "outline"} className="text-[10px]">{STATUS[c.status]}</Badge></TableCell>
                  <TableCell className="text-xs">v{c.current_version}</TableCell>
                  <TableCell className="text-xs">{c.accepted_current}</TableCell>
                  <TableCell className="text-xs">{c.deliverables_pending}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" onClick={() => setSelected(c.id === selected ? null : c.id)}>{c.id === selected ? "Ocultar" : "Ver detalle"}</Button>
                    {c.status === "draft" && <Button size="sm" className="h-8 rounded-xl text-xs" disabled={status.isPending} onClick={() => status.mutate({ id: c.id, to: "open" })}>Abrir</Button>}
                    {c.status === "open" && <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={status.isPending} onClick={() => status.mutate({ id: c.id, to: "closed" })}>Cerrar</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.data?.data.length === 0 && <TableRow><TableCell colSpan={6} className="p-6 text-center text-xs text-muted-foreground">Aún no hay campañas.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Entregas</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              {deliverables.isLoading && <Skeleton className="h-12 w-full" />}
              {deliverables.data?.data.length === 0 && <p className="text-muted-foreground">Sin entregas todavía.</p>}
              {deliverables.data?.data.map((d) => (
                <div key={d.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span><strong>{d.video_title}</strong> · @{d.handle} · términos v{d.accepted_version}</span>
                    <Badge variant="outline" className="text-[10px]">{d.status === "submitted" ? "Por revisar" : d.status === "approved" ? "Aprobada" : "Rechazada"}</Badge>
                  </div>
                  <a href={d.video_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver la pieza</a>
                  {d.review_note && <p className="mt-1 text-muted-foreground">{d.review_note}</p>}
                  {d.status === "submitted" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Input aria-label="Nota de la revisión" value={notes[d.id] ?? ""} onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })} placeholder="Nota (opcional)" className="h-8 min-w-[10rem] flex-1 text-xs" />
                      <Button size="sm" className="h-8 rounded-xl text-xs" disabled={review.isPending} onClick={() => review.mutate({ id: d.id, decision: "approved" })}>Aprobar</Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={review.isPending} onClick={() => review.mutate({ id: d.id, decision: "rejected" })}>Rechazar</Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Evidencia de aceptación</CardTitle><CardDescription className="text-xs">Quién aceptó qué versión, cuándo y con qué huella del texto.</CardDescription></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {acceptances.isLoading && <Skeleton className="h-12 w-full" />}
              {acceptances.data?.data.length === 0 && <p className="text-muted-foreground">Nadie ha aceptado todavía.</p>}
              {acceptances.data?.data.map((a) => (
                <div key={`${a.creator_id}-${a.version}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                  <span><strong>@{a.handle}</strong> · versión {a.version}</span>
                  <span className="text-muted-foreground">{when(a.accepted_at)} · <span className="font-mono">{a.terms_hash.slice(0, 12)}…</span></span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function DisputesTab() {
  const client = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [entry, setEntry] = useState({ creatorId: "", source: "bonus", amount: "", currency: "DOP", reason: "" });
  const [reversal, setReversal] = useState({ id: "", reason: "" });

  const disputes = useQuery({ queryKey: ["admin-creator-disputes"], queryFn: () => api.adminDisputes("open") });
  const resolve = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "resolved_accepted" | "resolved_rejected" }) => api.adminResolveDispute(id, decision, notes[id]?.trim() ?? ""),
    onSuccess: () => { toast.success("Disputa resuelta. Si corresponde, registra abajo el reverso o el ajuste."); void client.invalidateQueries({ queryKey: ["admin-creator-disputes"] }); },
    onError: fail,
  });
  const addEntry = useMutation({
    mutationFn: () => api.adminLedgerEntry({ creator_id: entry.creatorId.trim(), source: entry.source as "bonus", amount: Number(entry.amount), currency: entry.currency as "DOP", reason: entry.reason.trim() }),
    onSuccess: () => { toast.success("Movimiento registrado"); setEntry({ ...entry, amount: "", reason: "" }); },
    onError: fail,
  });
  const reverse = useMutation({ mutationFn: () => api.adminReverse(reversal.id.trim(), reversal.reason.trim()), onSuccess: () => { toast.success("Movimiento revertido; el creador verá la razón"); setReversal({ id: "", reason: "" }); }, onError: fail });

  const amount = Number(entry.amount);
  return (
    <>
      {disputes.isError && <ErrorCard text={campaignErrorMessage(disputes.error)} />}
      <Card>
        <CardHeader><CardTitle className="text-sm">Disputas abiertas</CardTitle><CardDescription className="text-xs">Ordenadas por plazo de respuesta. Resolver no mueve dinero: el reverso o el ajuste se registra aparte.</CardDescription></CardHeader>
        <CardContent className="space-y-3 text-xs">
          {disputes.isLoading && <Skeleton className="h-12 w-full" />}
          {disputes.data?.data.length === 0 && <p className="text-muted-foreground">No hay disputas abiertas.</p>}
          {disputes.data?.data.map((d) => (
            <div key={d.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span><strong>@{d.handle}</strong> · {d.subject_type === "campaign" ? "campaña" : "movimiento"} <span className="font-mono">{d.subject_id.slice(0, 8)}</span></span>
                <Badge variant="outline" className={`text-[10px] ${d.overdue ? "border-destructive/40 text-destructive" : ""}`}>{d.overdue ? "Plazo vencido" : `Responder antes del ${when(d.due_at)}`}</Badge>
              </div>
              <p className="mt-1">{d.reason}</p>
              {d.evidence.map((e, i) => (
                <p key={i} className="text-muted-foreground">Evidencia: {e.label}{e.url && <> · <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">abrir</a></>}{e.text && <> · {e.text}</>}</p>
              ))}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Input aria-label="Respuesta al creador" value={notes[d.id] ?? ""} onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })} placeholder="Respuesta al creador (mínimo 10 caracteres)" className="h-8 min-w-[14rem] flex-1 text-xs" />
                <Button size="sm" className="h-8 rounded-xl text-xs" disabled={resolve.isPending || (notes[d.id]?.trim().length ?? 0) < 10} onClick={() => resolve.mutate({ id: d.id, decision: "resolved_accepted" })}>Dar la razón</Button>
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={resolve.isPending || (notes[d.id]?.trim().length ?? 0) < 10} onClick={() => resolve.mutate({ id: d.id, decision: "resolved_rejected" })}>No procede</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Registrar un movimiento</CardTitle><CardDescription className="text-xs">Bonificación, ajuste, fondo de creadores o propina. El importe de un ajuste puede ser negativo.</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Field label="Id del creador" id="le-creator"><Input id="le-creator" value={entry.creatorId} onChange={(e) => setEntry({ ...entry, creatorId: e.target.value })} className="h-9 font-mono text-xs" /></Field>
            <div className="flex gap-2">
              <Select value={entry.source} onValueChange={(v) => setEntry({ ...entry, source: v })}>
                <SelectTrigger className="h-9 text-xs" aria-label="Concepto"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus" className="text-xs">Bonificación</SelectItem>
                  <SelectItem value="adjustment" className="text-xs">Ajuste</SelectItem>
                  <SelectItem value="creator_fund" className="text-xs">Fondo de creadores</SelectItem>
                  <SelectItem value="tip" className="text-xs">Propina</SelectItem>
                </SelectContent>
              </Select>
              <Input aria-label="Importe" type="number" value={entry.amount} onChange={(e) => setEntry({ ...entry, amount: e.target.value })} placeholder="Importe" className="h-9 text-xs" />
              <Select value={entry.currency} onValueChange={(v) => setEntry({ ...entry, currency: v })}>
                <SelectTrigger className="h-9 w-24 text-xs" aria-label="Moneda"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="DOP" className="text-xs">DOP</SelectItem><SelectItem value="USD" className="text-xs">USD</SelectItem></SelectContent>
              </Select>
            </div>
            <Field label="Motivo (mínimo 10 caracteres)" id="le-reason"><Input id="le-reason" value={entry.reason} onChange={(e) => setEntry({ ...entry, reason: e.target.value })} className="h-9 text-xs" /></Field>
            <Button size="sm" className="h-9 rounded-xl text-xs" disabled={addEntry.isPending || !UUID_PATTERN.test(entry.creatorId.trim()) || !amount || entry.reason.trim().length < 10} onClick={() => addEntry.mutate()}>Registrar</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Revertir un movimiento</CardTitle><CardDescription className="text-xs">No borra el original: añade uno negativo con la razón, que el creador verá.</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Field label="Id del movimiento" id="rv-id"><Input id="rv-id" value={reversal.id} onChange={(e) => setReversal({ ...reversal, id: e.target.value })} className="h-9 font-mono text-xs" /></Field>
            <Field label="Razón (mínimo 10 caracteres)" id="rv-reason"><Input id="rv-reason" value={reversal.reason} onChange={(e) => setReversal({ ...reversal, reason: e.target.value })} className="h-9 text-xs" /></Field>
            <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs" disabled={reverse.isPending || !UUID_PATTERN.test(reversal.id.trim()) || reversal.reason.trim().length < 10} onClick={() => reverse.mutate()}>Revertir</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor={id}>{label}</label>{children}</div>;
}
function ErrorCard({ text }: { text: string }) {
  return <Card className="border-destructive/40 bg-destructive/5"><CardContent className="p-4 text-xs text-destructive">{text}</CardContent></Card>;
}
