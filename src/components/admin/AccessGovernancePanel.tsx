import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCheck, Clock, History, RefreshCw, ShieldAlert, UserCog, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockDataNotice } from "@/components/MockDataNotice";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import {
  APPROVAL_KIND_LABEL, APPROVAL_STATUS_LABEL, UUID_PATTERN, accessEventLabel, accessGovernanceApi as api, governanceErrorMessage,
  type AccessReviewItem, type ApprovalKind, type ApprovalRequest, type ApprovalStatus,
} from "@/lib/accessGovernanceApi";

/**
 * Gobernanza de accesos (plan de accesos, puntos 53, 97, 98, 99 y 100): aprobar operaciones críticas que pidió
 * otra persona, revisar periódicamente los roles del personal y ver cómo llegó cada quien a tener sus accesos.
 */

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }) : "—");
const shortId = (id: string | null) => (id ? id.slice(0, 8) : "—");
const fail = (error: unknown) => toast.error(governanceErrorMessage(error));

export function AccessGovernancePanel() {
  if (IS_MOCK_DATA) {
    return (
      <div className="space-y-6">
        <MockDataNotice className="rounded-xl" />
        <PanelEmptyState
          icon={ShieldAlert}
          title="La gobernanza de accesos necesita el backend"
          description="Las aprobaciones, las revisiones de acceso y la línea de tiempo se guardan en el servidor. Con datos simulados no hay nada real que aprobar; con VITE_DATA_SOURCE=api esta pantalla muestra y opera las solicitudes verdaderas."
        />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ShieldAlert className="h-5 w-5 text-primary" aria-hidden /> Gobernanza de accesos
        </h2>
        <p className="text-xs text-muted-foreground">Operaciones críticas con doble aprobación, revisión periódica de roles y accesos por persona.</p>
      </div>
      <Tabs defaultValue="aprobaciones">
        <TabsList>
          <TabsTrigger value="aprobaciones" className="gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Aprobaciones</TabsTrigger>
          <TabsTrigger value="revisiones" className="gap-1.5 text-xs"><ClipboardCheck className="h-3.5 w-3.5" aria-hidden /> Revisión de accesos</TabsTrigger>
          <TabsTrigger value="persona" className="gap-1.5 text-xs"><UserCog className="h-3.5 w-3.5" aria-hidden /> Accesos de una persona</TabsTrigger>
        </TabsList>
        <TabsContent value="aprobaciones" className="space-y-4"><ApprovalsTab /></TabsContent>
        <TabsContent value="revisiones" className="space-y-4"><ReviewsTab /></TabsContent>
        <TabsContent value="persona" className="space-y-4"><PersonTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ───────────────────────────── Aprobaciones ─────────────────────────────

function ApprovalsTab() {
  const client = useQueryClient();
  const [status, setStatus] = useState<ApprovalStatus | "todas">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<{ kind: ApprovalKind; target: string; reason: string; hours: string; reference: string }>({ kind: "grant_admin", target: "", reason: "", hours: "", reference: "" });

  const query = useQuery({ queryKey: ["approvals", status], queryFn: () => api.listApprovals(status === "todas" ? undefined : status) });
  const refresh = () => client.invalidateQueries({ queryKey: ["approvals"] });

  const decide = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" | "cancel" }) =>
      action === "approve" ? api.approve(id, notes[id]?.trim() || undefined) : action === "reject" ? api.reject(id, notes[id]?.trim() ?? "") : api.cancelApproval(id),
    onSuccess: (_data, { action }) => { toast.success(action === "approve" ? "Aprobada: la operación se aplicó" : action === "reject" ? "Solicitud rechazada" : "Solicitud retirada"); void refresh(); },
    onError: fail,
  });
  const create = useMutation({
    mutationFn: () => api.requestApproval({
      kind: draft.kind, target_id: draft.target.trim(), reason: draft.reason.trim(),
      payload: draft.kind === "grant_admin" && draft.hours ? { hours: Number(draft.hours) } : draft.kind === "payout_mark_paid" ? { reference: draft.reference.trim() } : {},
    }),
    onSuccess: () => { toast.success("Solicitud creada: otra persona administradora debe aprobarla"); setDraft({ ...draft, target: "", reason: "", hours: "", reference: "" }); void refresh(); },
    onError: fail,
  });

  const canCreate = UUID_PATTERN.test(draft.target.trim()) && draft.reason.trim().length >= 10 && (draft.kind !== "payout_mark_paid" || draft.reference.trim().length >= 3);
  const required = query.data?.meta.dual_approval_required;

  return (
    <>
      {required === false && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 text-xs">
            La doble aprobación está <strong>desactivada</strong>: estas operaciones todavía se pueden hacer directamente. Para exigirla, define <span className="font-mono">DUAL_APPROVAL_REQUIRED=true</span> en el servidor (requiere al menos dos personas administradoras).
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Nueva solicitud</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="approval-kind">Operación</label>
            <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as ApprovalKind })}>
              <SelectTrigger id="approval-kind" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(APPROVAL_KIND_LABEL) as ApprovalKind[]).map((k) => <SelectItem key={k} value={k} className="text-xs">{APPROVAL_KIND_LABEL[k]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="approval-target">{draft.kind === "payout_mark_paid" ? "Id de la liquidación" : "Id de la cuenta"}</label>
            <Input id="approval-target" value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value })} placeholder="00000000-0000-4000-8000-000000000000" className="h-9 font-mono text-xs" />
          </div>
          {draft.kind === "grant_admin" && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="approval-hours">Duración en horas (vacío: permanente)</label>
              <Input id="approval-hours" type="number" min={1} max={720} value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} className="h-9 text-xs" />
            </div>
          )}
          {draft.kind === "payout_mark_paid" && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="approval-reference">Referencia del pago</label>
              <Input id="approval-reference" value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} className="h-9 text-xs" />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="approval-reason">Motivo (mínimo 10 caracteres)</label>
            <Input id="approval-reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} maxLength={300} className="h-9 text-xs" />
          </div>
          <div className="md:col-span-2">
            <Button size="sm" className="h-9 rounded-xl text-xs" disabled={!canCreate || create.isPending} onClick={() => create.mutate()}>Solicitar aprobación</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="w-[12rem]">
          <Select value={status} onValueChange={(v) => setStatus(v as ApprovalStatus | "todas")}>
            <SelectTrigger className="h-9 text-xs" aria-label="Estado de las solicitudes"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas" className="text-xs">Todas</SelectItem>
              {(Object.keys(APPROVAL_STATUS_LABEL) as ApprovalStatus[]).map((s) => <SelectItem key={s} value={s} className="text-xs">{APPROVAL_STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl text-xs" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} aria-hidden /> Actualizar
        </Button>
      </div>

      {query.isError && <ErrorCard text="No se pudieron leer las solicitudes. Comprueba que el backend esté disponible y que tu sesión sea de administración." />}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operación</TableHead><TableHead>Destino</TableHead><TableHead>Motivo</TableHead><TableHead>Solicitó</TableHead><TableHead>Estado</TableHead><TableHead className="w-[22rem]">Decisión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading && <TableRow><TableCell colSpan={6} className="p-6"><Skeleton className="h-16 w-full" /></TableCell></TableRow>}
              {query.data?.data.map((row: ApprovalRequest) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs font-semibold">{APPROVAL_KIND_LABEL[row.kind]}{typeof row.payload.hours === "number" && <span className="block font-normal text-muted-foreground">{row.payload.hours} h</span>}</TableCell>
                  <TableCell className="font-mono text-[11px]">{shortId(row.target_id)}</TableCell>
                  <TableCell className="max-w-[18rem] text-xs">{row.reason}</TableCell>
                  <TableCell className="text-xs"><span className="font-mono">{shortId(row.requested_by)}</span><span className="block text-muted-foreground">{when(row.created_at)}</span></TableCell>
                  <TableCell className="text-xs">
                    <Badge variant={row.status === "pending" ? "default" : "outline"} className="text-[10px]">{APPROVAL_STATUS_LABEL[row.status]}</Badge>
                    {row.status === "pending" && <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" aria-hidden /> vence {when(row.expires_at)}</span>}
                    {row.decision_note && <span className="mt-1 block text-[10px] text-muted-foreground">{row.decision_note}</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.status !== "pending" ? <span className="text-muted-foreground">{row.decided_by ? `${shortId(row.decided_by)} · ${when(row.decided_at)}` : "—"}</span> : row.can_decide ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input aria-label="Nota de la decisión" value={notes[row.id] ?? ""} onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })} placeholder="Nota (obligatoria para rechazar)" className="h-8 min-w-[10rem] flex-1 text-xs" />
                        <Button size="sm" className="h-8 rounded-xl text-xs" disabled={decide.isPending} onClick={() => decide.mutate({ id: row.id, action: "approve" })}>Aprobar</Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={decide.isPending || (notes[row.id]?.trim().length ?? 0) < 5} onClick={() => decide.mutate({ id: row.id, action: "reject" })}>Rechazar</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">La solicitaste tú: debe decidir otra persona.</span>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={decide.isPending} onClick={() => decide.mutate({ id: row.id, action: "cancel" })}>Retirar</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {query.data && query.data.data.length === 0 && (
                <TableRow><TableCell colSpan={6} className="p-6"><PanelEmptyState icon={CheckCircle2} title="Sin solicitudes" description="No hay solicitudes de aprobación con ese estado." /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// ───────────────────────────── Revisión de accesos ─────────────────────────────

function ReviewsTab() {
  const client = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const list = useQuery({ queryKey: ["access-reviews"], queryFn: api.listReviews });
  const openId = selected ?? list.data?.data.find((r) => r.status === "open")?.id ?? list.data?.data[0]?.id ?? null;
  const detail = useQuery({ queryKey: ["access-review", openId], enabled: !!openId, queryFn: () => api.getReview(openId!) });
  const refresh = () => { void client.invalidateQueries({ queryKey: ["access-reviews"] }); void client.invalidateQueries({ queryKey: ["access-review"] }); };

  const open = useMutation({ mutationFn: api.openReview, onSuccess: (res) => { toast.success("Revisión abierta"); setSelected(res.data.id); refresh(); }, onError: fail });
  const decide = useMutation({
    mutationFn: ({ item, decision }: { item: AccessReviewItem; decision: "keep" | "revoke" }) => api.decideItem(openId!, item.id, decision, reasons[item.id]?.trim() ?? ""),
    onSuccess: (_d, { decision }) => { toast.success(decision === "keep" ? "Acceso confirmado" : "Acceso retirado y sesiones cerradas"); refresh(); },
    onError: fail,
  });
  const close = useMutation({ mutationFn: () => api.closeReview(openId!), onSuccess: () => { toast.success("Revisión cerrada"); refresh(); }, onError: fail });

  const review = detail.data?.data;
  const pending = review?.items.filter((i) => i.decision === null).length ?? 0;
  const hasOpen = list.data?.data.some((r) => r.status === "open");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Cada 90 días se confirma o se retira cada rol del personal. Nadie revisa sus propios accesos.</p>
        <Button size="sm" className="h-8 rounded-xl text-xs" disabled={open.isPending || hasOpen} onClick={() => open.mutate()}>{hasOpen ? "Ya hay una revisión abierta" : "Abrir revisión"}</Button>
      </div>
      {list.isError && <ErrorCard text="No se pudieron leer las revisiones de acceso." />}
      {list.data && list.data.data.length === 0 && <PanelEmptyState icon={ClipboardCheck} title="Aún no hay revisiones" description="Abre la primera revisión para tomar una foto de los roles del personal. Las siguientes se abren solas cada 90 días." />}

      {list.data && list.data.data.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.data.data.map((r) => (
            <Button key={r.id} size="sm" variant={r.id === openId ? "default" : "outline"} className="h-8 rounded-xl text-xs" onClick={() => setSelected(r.id)}>
              {new Date(r.created_at).toLocaleDateString("es-DO")} · {r.status === "open" ? `${r.pending} pendientes` : `cerrada, ${r.revoked} retirados`}{r.overdue ? " · vencida" : ""}
            </Button>
          ))}
        </div>
      )}

      {review && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm">{review.status === "open" ? `Revisión abierta · límite ${when(review.due_at)}` : `Revisión cerrada el ${when(review.closed_at)}`}</CardTitle>
            {review.status === "open" && <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={pending > 0 || close.isPending} onClick={() => close.mutate()}>{pending > 0 ? `Faltan ${pending} por revisar` : "Cerrar revisión"}</Button>}
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Persona</TableHead><TableHead>Rol</TableHead><TableHead>Última sesión</TableHead><TableHead className="w-[26rem]">Decisión</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {review.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs"><span className="font-semibold">{item.display_name ?? item.email}</span><span className="block text-muted-foreground">{item.email}</span></TableCell>
                    <TableCell className="text-xs"><Badge variant="outline" className="font-mono text-[10px]">{item.role}</Badge>{item.expires_at && <span className="mt-1 block text-[10px] text-muted-foreground">vence {when(item.expires_at)}</span>}</TableCell>
                    <TableCell className="text-xs">{item.last_session_at ? when(item.last_session_at) : <span className="text-amber-600">Nunca inició sesión</span>}</TableCell>
                    <TableCell className="text-xs">
                      {item.decision ? (
                        <span className="flex items-start gap-1.5">
                          {item.decision === "keep" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <XCircle className="mt-0.5 h-3.5 w-3.5 text-destructive" aria-hidden />}
                          <span><strong>{item.decision === "keep" ? "Confirmado" : "Retirado"}</strong> · {item.justification}<span className="block text-muted-foreground">{shortId(item.decided_by)} · {when(item.decided_at)}</span></span>
                        </span>
                      ) : review.status === "open" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Input aria-label={`Justificación para ${item.email}`} value={reasons[item.id] ?? ""} onChange={(e) => setReasons({ ...reasons, [item.id]: e.target.value })} placeholder="Justificación (obligatoria)" className="h-8 min-w-[10rem] flex-1 text-xs" />
                          <Button size="sm" className="h-8 rounded-xl text-xs" disabled={decide.isPending || (reasons[item.id]?.trim().length ?? 0) < 5} onClick={() => decide.mutate({ item, decision: "keep" })}>Confirmar</Button>
                          <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs text-destructive" disabled={decide.isPending || (reasons[item.id]?.trim().length ?? 0) < 5} onClick={() => decide.mutate({ item, decision: "revoke" })}>Retirar</Button>
                        </div>
                      ) : <span className="text-muted-foreground">Sin decisión</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ───────────────────────────── Accesos de una persona ─────────────────────────────

const TEMPORARY_ROLES = ["editor", "moderator", "partner", "ambassador"];

function PersonTab() {
  const client = useQueryClient();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [grant, setGrant] = useState({ role: "moderator", hours: "24", reason: "" });

  const query = useQuery({ queryKey: ["access-timeline", userId], enabled: !!userId, queryFn: () => api.timeline(userId!) });
  const grantRole = useMutation({
    mutationFn: () => api.grantTemporaryRole(userId!, { role: grant.role, hours: Number(grant.hours), reason: grant.reason.trim() }),
    onSuccess: (res) => { toast.success(`Rol temporal concedido; vence ${when(res.data.expires_at)}`); setGrant({ ...grant, reason: "" }); void client.invalidateQueries({ queryKey: ["access-timeline"] }); },
    onError: fail,
  });
  const data = query.data?.data;
  const hours = Number(grant.hours);

  return (
    <>
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[16rem] flex-1">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="timeline-user">Id de la cuenta</label>
            <Input id="timeline-user" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && UUID_PATTERN.test(input.trim())) setUserId(input.trim()); }} placeholder="Cópialo desde Usuarios & Roles" className="h-9 font-mono text-xs" />
          </div>
          <Button size="sm" className="h-9 gap-1.5 rounded-xl text-xs" disabled={!UUID_PATTERN.test(input.trim())} onClick={() => setUserId(input.trim())}><History className="h-3.5 w-3.5" aria-hidden /> Ver accesos</Button>
        </CardContent>
      </Card>

      {query.isError && <ErrorCard text={governanceErrorMessage(query.error)} />}
      {query.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}
      {!userId && <PanelEmptyState icon={UserCog} title="Elige una cuenta" description="Verás sus roles vigentes con vencimiento y motivo, sus organizaciones y el historial de cambios de acceso." />}

      {data && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Roles vigentes</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.roles.map((r) => (
                  <div key={r.role} className="flex items-start justify-between gap-3 text-xs">
                    <Badge variant="outline" className="font-mono text-[10px]">{r.role}</Badge>
                    <span className="text-right text-muted-foreground">{r.expires_at ? `Temporal · vence ${when(r.expires_at)}` : "Permanente"}{r.grant_reason && <span className="block">{r.grant_reason}</span>}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Organizaciones</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.organizations.length === 0 && <p className="text-xs text-muted-foreground">No pertenece a ninguna organización.</p>}
                {data.organizations.map((o) => (
                  <div key={o.org_id} className="flex items-start justify-between gap-3 text-xs">
                    <span><strong>{o.business_name ?? shortId(o.org_id)}</strong><span className="block text-muted-foreground">{o.role} · desde {when(o.since)}</span></span>
                    <span className="text-muted-foreground">{o.expires_at ? `Vence ${when(o.expires_at)}` : "Sin vencimiento"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Conceder un rol temporal</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="w-[10rem]">
                <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-role">Rol</label>
                <Select value={grant.role} onValueChange={(v) => setGrant({ ...grant, role: v })}>
                  <SelectTrigger id="grant-role" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPORARY_ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="w-[8rem]">
                <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-hours">Horas (1–720)</label>
                <Input id="grant-hours" type="number" min={1} max={720} value={grant.hours} onChange={(e) => setGrant({ ...grant, hours: e.target.value })} className="h-9 text-xs" />
              </div>
              <div className="min-w-[14rem] flex-1">
                <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-reason">Motivo (mínimo 10 caracteres)</label>
                <Input id="grant-reason" value={grant.reason} onChange={(e) => setGrant({ ...grant, reason: e.target.value })} maxLength={300} className="h-9 text-xs" />
              </div>
              <Button size="sm" className="h-9 rounded-xl text-xs" disabled={grantRole.isPending || grant.reason.trim().length < 10 || !Number.isInteger(hours) || hours < 1 || hours > 720} onClick={() => grantRole.mutate()}>Conceder</Button>
              <p className="basis-full text-[11px] text-muted-foreground">La administración no se concede aquí: va por una solicitud con doble aprobación.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Línea de tiempo de accesos</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Cuándo</TableHead><TableHead>Qué pasó</TableHead><TableHead>Quién</TableHead><TableHead>Detalle</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.events.map((e, i) => (
                    <TableRow key={`${e.at}-${i}`}>
                      <TableCell className="whitespace-nowrap text-xs">{when(e.at)}</TableCell>
                      <TableCell className="text-xs font-semibold">{accessEventLabel(e.action)}</TableCell>
                      <TableCell className="font-mono text-[11px]">{e.actor_id ? shortId(e.actor_id) : "sistema"}</TableCell>
                      <TableCell className="max-w-[24rem] text-xs text-muted-foreground">{Object.entries(e.meta).filter(([, v]) => v !== null && typeof v !== "object").map(([k, v]) => `${k}: ${String(v)}`).join(" · ") || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {data.events.length === 0 && <TableRow><TableCell colSpan={4} className="p-6 text-center text-xs text-muted-foreground">Sin cambios de acceso registrados.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

function ErrorCard({ text }: { text: string }) {
  return <Card className="border-destructive/40 bg-destructive/5"><CardContent className="p-4 text-xs text-destructive">{text}</CardContent></Card>;
}
