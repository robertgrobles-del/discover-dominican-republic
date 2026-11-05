import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Hotel, Loader2, Search, Send, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/fastifyClient";

interface CreatorRow {
  id: string; handle: string; display_name: string; tier: string; status: string; total_views: number; total_earnings: string | number;
  balance_pending: string | number; commission_rate: string | number; social_channels: Record<string, string> | null; created_at: string;
  videos: number; links: number; clicks: number; affiliate_orders: number;
}
interface OpenStay { id: string; hotel_name: string; destination: string; stay_title: string; nights_count: number; invitations: number }

const money = (v: string | number) => `RD$ ${Number(v).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const STATUS: Record<string, string> = { approved: "Aprobado", active: "Activo", suspended: "Suspendido", under_review: "En revisión", draft: "Borrador", pending: "Pendiente" };

/**
 * Directorio de creadores para el equipo y matchmaking con estancias: la invitación se envía en nombre del operador
 * dueño de la estancia, que la ve en su panel igual que las suyas; el creador la recibe en el suyo.
 */
export function AdminCreatorsDirectory() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState<CreatorRow | null>(null);
  const [stayId, setStayId] = useState("");
  const [message, setMessage] = useState("");
  const [dates, setDates] = useState("");

  const { data: creators = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-creators", search],
    queryFn: async () => (await fetchApi<{ data: CreatorRow[] }>(`/admin/creators?per_page=100${search ? `&q=${encodeURIComponent(search)}` : ""}`)).data,
  });
  const { data: stays = [] } = useQuery({
    queryKey: ["admin-open-stays"],
    enabled: !!inviting,
    queryFn: async () => (await fetchApi<{ data: OpenStay[] }>("/admin/creator-stays/open")).data,
  });

  const openInvite = (c: CreatorRow) => { setInviting(c); setStayId(""); setDates(""); setMessage(`Hola ${c.display_name}, te proponemos esta estancia para crear contenido sobre el destino.`); };
  const invite = useMutation({
    mutationFn: () => fetchApi(`/admin/creators/${inviting!.id}/invite-stay`, { method: "POST", body: JSON.stringify({ stay_id: stayId, invitation_message: message.trim(), scheduled_dates: dates.trim() || undefined }) }),
    onSuccess: () => {
      toast.success(`Invitación enviada a @${inviting!.handle}`);
      setInviting(null);
      queryClient.invalidateQueries({ queryKey: ["admin-open-stays"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "No se pudo enviar la invitación"),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Directorio de creadores</CardTitle>
            <CardDescription>Perfil, contenido y rendimiento de sus enlaces de afiliado. Desde aquí puedes invitarlos a una estancia abierta de un operador.</CardDescription>
          </div>
          <form className="flex w-full gap-2 sm:w-80" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}>
            <Input placeholder="Buscar por nombre o @" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar creadores" />
            <Button type="submit" size="icon" variant="outline" aria-label="Buscar"><Search className="h-4 w-4" /></Button>
          </form>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-64" /> : isError ? (
            <div className="flex items-center justify-between gap-3 text-sm"><span>No se pudo cargar el directorio.</span><Button size="sm" variant="outline" onClick={() => refetch()}>Reintentar</Button></div>
          ) : creators.length === 0 ? (
            <PanelEmptyState title={search ? "Sin resultados" : "Aún no hay creadores"} description={search ? "Prueba con otro nombre o @." : "Aparecerán aquí cuando se registren en /creadores."} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creador</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Contenidos</TableHead>
                    <TableHead className="text-right">Enlaces · clics</TableHead>
                    <TableHead className="text-right">Pedidos atribuidos</TableHead>
                    <TableHead className="text-right">Saldo pendiente</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creators.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{c.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{c.handle} · <span className="capitalize">{c.tier}</span> · {Object.keys(c.social_channels ?? {}).join(", ") || "sin redes"}</p>
                      </TableCell>
                      <TableCell><Badge variant={c.status === "approved" ? "secondary" : "outline"}>{STATUS[c.status] ?? c.status}</Badge></TableCell>
                      <TableCell className="text-right">{c.videos}</TableCell>
                      <TableCell className="text-right">{c.links} · {c.clicks.toLocaleString("es-DO")}</TableCell>
                      <TableCell className="text-right">{c.affiliate_orders}</TableCell>
                      <TableCell className="text-right">{money(c.balance_pending)}</TableCell>
                      <TableCell className="text-right">{Number(c.commission_rate)} %</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1.5" disabled={c.status !== "approved"} onClick={() => openInvite(c)}><Hotel className="h-4 w-4" />Invitar a estancia</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!inviting} onOpenChange={(o) => { if (!o) setInviting(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Hotel className="h-5 w-5 text-primary" />Invitar a @{inviting?.handle}</DialogTitle>
            <DialogDescription>La invitación sale en nombre del operador de la estancia y le aparece también en su panel.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}>
            <div className="space-y-1.5">
              <Label>Estancia abierta</Label>
              <Select value={stayId} onValueChange={setStayId}>
                <SelectTrigger><SelectValue placeholder={stays.length ? "Seleccionar…" : "No hay estancias abiertas"} /></SelectTrigger>
                <SelectContent>
                  {stays.map((s) => <SelectItem key={s.id} value={s.id}>{s.hotel_name} — {s.stay_title} ({s.destination}, {s.nights_count} noches)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-msg">Mensaje</Label>
              <Textarea id="inv-msg" rows={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-dates">Fechas propuestas (opcional)</Label>
              <Input id="inv-dates" maxLength={100} placeholder="Ej. 14 al 16 de noviembre" value={dates} onChange={(e) => setDates(e.target.value)} />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={!stayId || message.trim().length < 10 || invite.isPending}>
              {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar invitación
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
