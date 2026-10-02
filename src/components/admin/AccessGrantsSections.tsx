import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UUID_PATTERN, accessGovernanceApi as api, governanceErrorMessage } from "@/lib/accessGovernanceApi";

/** Secciones de la gobernanza de accesos para invitar personal (punto 17) y conceder permisos acotados (85, 95, 96). */

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }) : "sin vencimiento");
const fail = (error: unknown) => toast.error(governanceErrorMessage(error));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_STATUS: Record<string, string> = { open: "Abierta", accepted: "Aceptada", revoked: "Revocada", expired: "Vencida" };

export function StaffInvitationsTab() {
  const client = useQueryClient();
  const [draft, setDraft] = useState({ email: "", role: "editor" });
  const query = useQuery({ queryKey: ["staff-invitations"], queryFn: api.listStaffInvitations });
  const refresh = () => client.invalidateQueries({ queryKey: ["staff-invitations"] });
  const invite = useMutation({ mutationFn: () => api.inviteStaff(draft.email.trim(), draft.role as "editor"), onSuccess: () => { toast.success("Invitación enviada por correo"); setDraft({ ...draft, email: "" }); void refresh(); }, onError: fail });
  const revoke = useMutation({ mutationFn: api.revokeStaffInvitation, onSuccess: () => { toast.success("Invitación revocada"); void refresh(); }, onError: fail });

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-sm">Invitar a un editor o moderador</CardTitle><CardDescription className="text-xs">El rol se concede cuando la persona acepta con la cuenta de ese correo, ya verificado. La administración no se concede por invitación: va por doble aprobación.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 text-xs">
          <div className="min-w-[16rem] flex-1">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="invite-email">Correo</label>
            <Input id="invite-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="h-9 text-xs" />
          </div>
          <div className="w-[10rem]">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="invite-role">Rol</label>
            <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v })}>
              <SelectTrigger id="invite-role" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="editor" className="text-xs">editor</SelectItem><SelectItem value="moderator" className="text-xs">moderator</SelectItem></SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-9 rounded-xl text-xs" disabled={invite.isPending || !EMAIL.test(draft.email.trim())} onClick={() => invite.mutate()}>Enviar invitación</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Correo</TableHead><TableHead>Rol</TableHead><TableHead>Estado</TableHead><TableHead>Vence</TableHead><TableHead className="w-28" /></TableRow></TableHeader>
            <TableBody>
              {query.isLoading && <TableRow><TableCell colSpan={5} className="p-6"><Skeleton className="h-10 w-full" /></TableCell></TableRow>}
              {query.isError && <TableRow><TableCell colSpan={5} className="p-6 text-xs text-destructive">{governanceErrorMessage(query.error)}</TableCell></TableRow>}
              {query.data?.data.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-xs">{i.email}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">{i.role}</Badge></TableCell>
                  <TableCell className="text-xs">{INVITE_STATUS[i.status] ?? i.status}</TableCell>
                  <TableCell className="text-xs">{when(i.expires_at)}</TableCell>
                  <TableCell>{i.status === "open" && <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={revoke.isPending} onClick={() => revoke.mutate(i.id)}>Revocar</Button>}</TableCell>
                </TableRow>
              ))}
              {query.data?.data.length === 0 && <TableRow><TableCell colSpan={5} className="p-6 text-center text-xs text-muted-foreground">Aún no hay invitaciones.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export function CapabilityGrantsTab() {
  const client = useQueryClient();
  const [draft, setDraft] = useState({ userId: "", capability: "catalog.manage", collections: "", recordIds: "", hours: "", reason: "" });
  const query = useQuery({ queryKey: ["capability-grants"], queryFn: () => api.listGrants() });
  const refresh = () => client.invalidateQueries({ queryKey: ["capability-grants"] });

  const collections = draft.collections.split(",").map((x) => x.trim()).filter(Boolean);
  const recordIds = draft.recordIds.split(",").map((x) => x.trim()).filter(Boolean);
  const catalog = draft.capability === "catalog.manage";
  const hours = draft.hours ? Number(draft.hours) : undefined;
  const problem = !UUID_PATTERN.test(draft.userId.trim()) ? "Indica el id de la cuenta."
    : draft.reason.trim().length < 10 ? "El motivo necesita al menos 10 caracteres."
      : catalog && !collections.length ? "Indica al menos una colección."
        : recordIds.some((id) => !UUID_PATTERN.test(id)) ? "Algún id de registro no es válido."
          : recordIds.length && collections.length !== 1 ? "Los registros concretos pertenecen a una sola colección."
            : recordIds.length && !hours ? "Delegar registros concretos exige un vencimiento."
              : hours !== undefined && !(Number.isInteger(hours) && hours >= 1) ? "Las horas deben ser un entero positivo."
                : null;

  const grant = useMutation({
    mutationFn: () => api.grantCapability({ user_id: draft.userId.trim(), capability: draft.capability as "catalog.manage", reason: draft.reason.trim(), ...(catalog ? { collections, record_ids: recordIds } : {}), ...(hours ? { hours } : {}) }),
    onSuccess: () => { toast.success("Permiso concedido"); setDraft({ ...draft, reason: "", recordIds: "" }); void refresh(); },
    onError: fail,
  });
  const revoke = useMutation({ mutationFn: api.revokeGrant, onSuccess: () => { toast.success("Permiso revocado: el acceso se corta de inmediato"); void refresh(); }, onError: fail });

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-sm">Conceder un permiso acotado</CardTitle><CardDescription className="text-xs">No cambia el rol de la persona. Gestionar el catálogo permite crear borradores, editar y enviar a revisión; publicar sigue siendo de editor o administración. La analítica es de sólo lectura, sin exportar.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 text-xs md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-user">Id de la cuenta</label>
            <Input id="grant-user" value={draft.userId} onChange={(e) => setDraft({ ...draft, userId: e.target.value })} className="h-9 font-mono text-xs" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-capability">Permiso</label>
            <Select value={draft.capability} onValueChange={(v) => setDraft({ ...draft, capability: v })}>
              <SelectTrigger id="grant-capability" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="catalog.manage" className="text-xs">Gestionar colecciones del catálogo</SelectItem>
                <SelectItem value="analytics.read" className="text-xs">Analítica de sólo lectura</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {catalog && <>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-collections">Colecciones (separadas por coma)</label>
              <Input id="grant-collections" value={draft.collections} onChange={(e) => setDraft({ ...draft, collections: e.target.value })} placeholder="events, articles" className="h-9 text-xs" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-records">Sólo estos registros (ids, opcional)</label>
              <Input id="grant-records" value={draft.recordIds} onChange={(e) => setDraft({ ...draft, recordIds: e.target.value })} placeholder="Para delegar un evento concreto" className="h-9 font-mono text-xs" />
            </div>
          </>}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-hours-x">Vence en (horas; vacío: sin vencimiento)</label>
            <Input id="grant-hours-x" type="number" min={1} value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} className="h-9 text-xs" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="grant-reason-x">Motivo</label>
            <Input id="grant-reason-x" value={draft.reason} maxLength={300} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} className="h-9 text-xs" />
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button size="sm" className="h-9 rounded-xl text-xs" disabled={grant.isPending || !!problem} onClick={() => grant.mutate()}>Conceder</Button>
            {problem && draft.userId && <span className="text-muted-foreground">{problem}</span>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Persona</TableHead><TableHead>Permiso y alcance</TableHead><TableHead>Motivo</TableHead><TableHead>Vence</TableHead><TableHead className="w-28" /></TableRow></TableHeader>
            <TableBody>
              {query.isLoading && <TableRow><TableCell colSpan={5} className="p-6"><Skeleton className="h-10 w-full" /></TableCell></TableRow>}
              {query.isError && <TableRow><TableCell colSpan={5} className="p-6 text-xs text-destructive">{governanceErrorMessage(query.error)}</TableCell></TableRow>}
              {query.data?.data.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="text-xs">{g.email}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-semibold">{g.capability === "analytics.read" ? "Analítica de sólo lectura" : "Catálogo"}</span>
                    {g.collections.length > 0 && <span className="block text-muted-foreground">{g.collections.join(", ")}{g.record_ids.length > 0 && ` · ${g.record_ids.length} registro(s)`}</span>}
                  </TableCell>
                  <TableCell className="max-w-[18rem] text-xs">{g.reason}</TableCell>
                  <TableCell className="text-xs">{when(g.expires_at)}</TableCell>
                  <TableCell><Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={revoke.isPending} onClick={() => revoke.mutate(g.id)}>Revocar</Button></TableCell>
                </TableRow>
              ))}
              {query.data?.data.length === 0 && <TableRow><TableCell colSpan={5} className="p-6 text-center text-xs text-muted-foreground">No hay permisos acotados vigentes.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
