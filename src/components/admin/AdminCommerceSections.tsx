import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money } from "@/lib/creatorCampaignsApi";
import { UUID_PATTERN } from "@/lib/accessGovernanceApi";
import { BID_STATUS_LABEL, LICENSE_STATUS_LABEL, LICENSE_TYPE_LABEL, adminCommerceApi as api, commerceErrorMessage, upcomingMondays, type LicenseRequest } from "@/lib/adminCommerceApi";

const fail = (error: unknown) => toast.error(commerceErrorMessage(error));
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-DO", { dateStyle: "medium" }) : "—");
const WEEKS = upcomingMondays(8);

/** Subasta semanal de posiciones patrocinadas: pujas ordenadas, precio mínimo del espacio y cierre. */
export function AdminAuctionsSection() {
  const client = useQueryClient();
  const [slotId, setSlotId] = useState("");
  const [week, setWeek] = useState(WEEKS[0]!);
  const [reserve, setReserve] = useState("");
  const slots = useQuery({ queryKey: ["admin", "ad-slots"], queryFn: api.slots });
  const board = useQuery({ queryKey: ["admin", "auction", slotId, week], enabled: !!slotId, queryFn: () => api.board(slotId, week) });
  const refresh = () => { void client.invalidateQueries({ queryKey: ["admin", "auction"] }); void client.invalidateQueries({ queryKey: ["admin", "ad-slots"] }); };
  const close = useMutation({ mutationFn: () => api.closeAuction(slotId, week), onSuccess: (res) => { toast.success(`Subasta cerrada: ${res.data.winners} ganadores, ${money(res.data.amount_due, "DOP")} por facturar`); refresh(); }, onError: fail });
  const configure = useMutation({ mutationFn: (enabled: boolean) => api.setSlotAuction(slotId, enabled, Number(reserve || board.data?.data.slot.reserve || 0)), onSuccess: () => { toast.success("Espacio actualizado"); setReserve(""); refresh(); }, onError: fail });

  const d = board.data?.data;
  const reserveOk = reserve === "" || (Number(reserve) >= 0 && Number.isFinite(Number(reserve)));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="auction-slot" className="text-xs">Espacio</Label>
          <Select value={slotId} onValueChange={setSlotId}>
            <SelectTrigger id="auction-slot" className="h-9 text-xs"><SelectValue placeholder={slots.isLoading ? "Cargando…" : "Elige un espacio"} /></SelectTrigger>
            <SelectContent>{(slots.data?.data ?? []).map((s) => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}{s.auction_enabled ? "" : " (sin subasta)"}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="auction-week" className="text-xs">Semana (empieza el lunes)</Label>
          <Select value={week} onValueChange={setWeek}>
            <SelectTrigger id="auction-week" className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{WEEKS.map((w) => <SelectItem key={w} value={w} className="text-xs">{day(`${w}T12:00:00Z`)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {slotId && board.isLoading && <Skeleton className="h-32 w-full rounded-2xl" />}
      {board.isError && <p className="text-sm text-destructive">{commerceErrorMessage(board.error)}</p>}
      {d && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">{d.slot.name}</CardTitle><CardDescription className="text-xs">{d.slot.positions} posiciones · precio mínimo {money(d.slot.reserve, "DOP")} · {d.slot.auction_enabled ? "en subasta" : "sin subasta"}{d.closed && <> · cerrada el {day(d.closed.closed_at)}</>}</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="auction-reserve" className="text-xs">Nuevo precio mínimo (DOP)</Label>
                <Input id="auction-reserve" inputMode="decimal" value={reserve} onChange={(e) => setReserve(e.target.value)} aria-invalid={!reserveOk} className="h-9 w-40 text-xs" />
              </div>
              <Button size="sm" variant="outline" className="h-9 text-xs" disabled={!reserveOk || configure.isPending} onClick={() => configure.mutate(true)}>{d.slot.auction_enabled ? "Guardar precio" : "Activar subasta"}</Button>
              {d.slot.auction_enabled && <Button size="sm" variant="ghost" className="h-9 text-xs" disabled={configure.isPending} onClick={() => configure.mutate(false)}>Desactivar</Button>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Pujas de la semana</CardTitle><CardDescription className="text-xs">Al cerrar ganan las {d.slot.positions} más altas; en empate, la que llegó primero. Cada ganador debe lo que pujó.</CardDescription></CardHeader>
            <CardContent className="space-y-3 overflow-x-auto p-0">
              {d.bids.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No hay pujas para esta semana.</p> : (
                <Table>
                  <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Anunciante</TableHead><TableHead>Anuncio</TableHead><TableHead className="text-right">Puja</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                  <TableBody>{d.bids.map((b) => (
                    <TableRow key={b.id} className={!d.closed && b.rank <= d.slot.positions ? "bg-primary/5" : undefined}>
                      <TableCell className="text-sm">{b.rank}</TableCell>
                      <TableCell className="text-sm">{b.advertiser_name}<span className="block text-xs text-muted-foreground">{b.campaign_name}</span></TableCell>
                      <TableCell className="text-sm">{b.creative_title}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{money(b.amount, b.currency)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{BID_STATUS_LABEL[b.status]}</Badge></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              )}
              {!d.closed && d.bids.length > 0 && <div className="p-4 pt-0"><Button size="sm" className="h-9 text-xs" disabled={close.isPending} onClick={() => { if (window.confirm("¿Cerrar la subasta? No se puede deshacer.")) close.mutate(); }}>Cerrar subasta y adjudicar</Button></div>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/** Licencias de imágenes: ofertar una imagen editorial y decidir las solicitudes, anotando el comprobante del pago. */
export function AdminLicensesSection() {
  const client = useQueryClient();
  const [status, setStatus] = useState<LicenseRequest["status"]>("requested");
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [offer, setOffer] = useState({ asset_id: "", title: "", editorial: "", commercial: "" });
  const requests = useQuery({ queryKey: ["admin", "license-requests", status], queryFn: () => api.licenseRequests(status) });
  const refresh = () => client.invalidateQueries({ queryKey: ["admin", "license-requests"] });
  const decide = useMutation({ mutationFn: (v: { id: string; approve: boolean }) => api.decideLicense(v.id, { approve: v.approve, ...(v.approve ? { payment_reference: refs[v.id]?.trim() } : {}) }), onSuccess: (_r, v) => { toast.success(v.approve ? "Licencia aprobada por un año" : "Solicitud rechazada"); void refresh(); }, onError: fail });
  const create = useMutation({ mutationFn: () => api.createOffer({ asset_id: offer.asset_id.trim(), title: offer.title.trim(), price_editorial: Number(offer.editorial), price_commercial: Number(offer.commercial) }), onSuccess: () => { toast.success("Imagen ofertada: su original ya no es público"); setOffer({ asset_id: "", title: "", editorial: "", commercial: "" }); }, onError: fail });

  const price = (v: string) => v !== "" && Number(v) >= 0 && Number.isFinite(Number(v));
  const offerOk = UUID_PATTERN.test(offer.asset_id.trim()) && offer.title.trim().length >= 3 && price(offer.editorial) && price(offer.commercial);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Ofertar una imagen</CardTitle><CardDescription className="text-xs">Sólo imágenes editoriales aprobadas de la biblioteca. Al ofertarla, el original deja de ser público; la vista previa sigue visible.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1 md:col-span-2"><Label htmlFor="lic-asset" className="text-xs">Identificador de la imagen</Label><Input id="lic-asset" value={offer.asset_id} onChange={(e) => setOffer({ ...offer, asset_id: e.target.value })} placeholder="00000000-0000-0000-0000-000000000000" className="h-9 text-xs" /></div>
          <div className="space-y-1 md:col-span-2"><Label htmlFor="lic-title" className="text-xs">Título</Label><Input id="lic-title" value={offer.title} maxLength={200} onChange={(e) => setOffer({ ...offer, title: e.target.value })} className="h-9 text-xs" /></div>
          <div className="space-y-1"><Label htmlFor="lic-ed" className="text-xs">Precio editorial (DOP)</Label><Input id="lic-ed" inputMode="decimal" value={offer.editorial} onChange={(e) => setOffer({ ...offer, editorial: e.target.value })} className="h-9 text-xs" /></div>
          <div className="space-y-1"><Label htmlFor="lic-com" className="text-xs">Precio comercial (DOP)</Label><Input id="lic-com" inputMode="decimal" value={offer.commercial} onChange={(e) => setOffer({ ...offer, commercial: e.target.value })} className="h-9 text-xs" /></div>
          <div className="flex items-end"><Button size="sm" className="h-9 text-xs" disabled={!offerOk || create.isPending} onClick={() => create.mutate()}>Ofertar</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Solicitudes de licencia</CardTitle>
            <Select value={status} onValueChange={(v) => setStatus(v as LicenseRequest["status"])}>
              <SelectTrigger aria-label="Estado" className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(LICENSE_STATUS_LABEL) as LicenseRequest["status"][]).map((s) => <SelectItem key={s} value={s} className="text-xs">{LICENSE_STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {requests.isLoading && <Skeleton className="h-16 w-full" />}
          {requests.isError && <p className="text-destructive">{commerceErrorMessage(requests.error)}</p>}
          {requests.data?.data.length === 0 && <p className="text-muted-foreground">No hay solicitudes en este estado.</p>}
          {requests.data?.data.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{r.title}</span>
                <span className="font-semibold">{money(r.price, r.currency)} · {LICENSE_TYPE_LABEL[r.license_type]}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.licensee_name} · pedida el {day(r.created_at)}<span className="block">Uso previsto: {r.intended_use}</span>{r.payment_reference && <span className="block">Comprobante: {r.payment_reference}</span>}{r.expires_at && <span className="block">Vigente hasta el {day(r.expires_at)}</span>}</p>
              {r.status === "requested" && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Input aria-label="Comprobante del pago" value={refs[r.id] ?? ""} onChange={(e) => setRefs({ ...refs, [r.id]: e.target.value })} placeholder="Comprobante del pago" className="h-8 min-w-[12rem] flex-1 text-xs" />
                  <Button size="sm" className="h-8 text-xs" disabled={decide.isPending || (refs[r.id]?.trim().length ?? 0) < 3} onClick={() => decide.mutate({ id: r.id, approve: true })}>Aprobar</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.id, approve: false })}>Rechazar</Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
