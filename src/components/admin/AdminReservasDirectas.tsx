// Administración de Operadores RD + Tienda: verificación de organizaciones,
// moderación de servicios, reservas/comisiones y pedidos de la tienda.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Ban, ExternalLink, Trash2, XCircle, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { deleteListing, fetchAllBookings, fetchOrgs, paidAmount, saveListing, updateOrg, useOpMutation } from "@/modules/operadores/api";
import { BOOKING_STATUS_LABEL, CATEGORY_META, LISTING_STATUS_LABEL, VERIFICATION_LABEL, formatMoney } from "@/modules/operadores/constants";
import type { Listing, OperatorOrg, OrgVerification } from "@/modules/operadores/types";
import { supabase } from "@/integrations/supabase/client";
import { adminBookingsApi, type AdminBookingStatus } from "@/lib/adminBookingsApi";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ORDER_STATUS_LABEL, formatDop, updateProduct, useOrders, useProducts,
  useAdminOrders, adminConfirmTransfer, adminUpdateOrderStatus, type StoreOrder,
} from "@/modules/tienda/api";

const ORG_KEY = ["admin", "op-orgs"];
const LST_KEY = ["admin", "op-listings"];
const BK_KEY = ["admin", "op-bookings"];

function Orgs() {
  const { data: orgs = [] } = useQuery({ queryKey: ORG_KEY, queryFn: fetchOrgs });
  const [filter, setFilter] = useState<OrgVerification | "all">("all");
  const patch = useOpMutation(({ id, p }: { id: string; p: Partial<OperatorOrg> }) => updateOrg(id, p), [ORG_KEY, ["op"]]);
  const list = orgs.filter((o) => filter === "all" || o.verification === filter);
  const set = (o: OperatorOrg, p: Partial<OperatorOrg>, msg: string) => patch.mutate({ id: o.id, p }, { onSuccess: () => toast.success(msg) });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "verified", "unverified", "rejected"] as const).map((k) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} className="rounded-full" onClick={() => setFilter(k)}>{k === "all" ? "Todas" : VERIFICATION_LABEL[k]} ({k === "all" ? orgs.length : orgs.filter((o) => o.verification === k).length})</Button>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Sin organizaciones en este estado.</p>}
      {list.map((o) => (
        <Card key={o.id}><CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold flex items-center gap-2 truncate">{o.business_name} <Badge variant={o.verification === "verified" ? "default" : "secondary"}>{VERIFICATION_LABEL[o.verification]}</Badge></p>
            <p className="text-xs text-muted-foreground">{o.email || "sin correo"} · {o.province || "sin zona"} · /operador/{o.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs">Comisión %<Input type="number" min={0} max={50} className="h-8 w-16" defaultValue={o.commission_rate} aria-label={`Comisión de ${o.business_name}`} onBlur={(e) => { const v = Number(e.target.value); if (v >= 0 && v <= 50 && v !== o.commission_rate) set(o, { commission_rate: v }, "Comisión actualizada"); }} /></label>
            <label className="flex items-center gap-2 text-xs">Sitio<Switch checked={o.website_enabled} onCheckedChange={(v) => set(o, { website_enabled: v }, v ? "Sitio activado" : "Sitio desactivado")} aria-label={`Sitio de ${o.business_name}`} /></label>
            {o.verification !== "verified" && <Button size="sm" className="gap-1" onClick={() => set(o, { verification: "verified" }, "Organización verificada")}><BadgeCheck className="h-3.5 w-3.5" /> Verificar</Button>}
            {o.verification !== "rejected" && <Button size="sm" variant="outline" className="gap-1" onClick={() => set(o, { verification: "rejected", website_enabled: false }, "Organización rechazada")}><XCircle className="h-3.5 w-3.5" /> Rechazar</Button>}
            <Button size="sm" variant="ghost" asChild><Link to={`/operador/${o.slug}`} target="_blank" aria-label="Ver sitio"><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}

function Listings() {
  const { data: rows = [] } = useQuery({
    queryKey: LST_KEY,
    queryFn: async () => { const { data } = await (supabase as any).from("operator_listings").select("*"); return (data || []) as Listing[]; },
  });
  const { data: orgs = [] } = useQuery({ queryKey: ORG_KEY, queryFn: fetchOrgs });
  const names = useMemo(() => new Map(orgs.map((o) => [o.id, o.business_name])), [orgs]);
  const keys = [LST_KEY, ["op"]];
  const save = useOpMutation((l: Listing) => saveListing(l), keys);
  const del = useOpMutation(deleteListing, keys);
  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Aún no hay servicios.</p>}
      {rows.map((l) => (
        <Card key={l.id}><CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0"><p className="font-semibold truncate">{l.title}</p><p className="text-xs text-muted-foreground">{names.get(l.org_id) || l.org_id} · {CATEGORY_META[l.category]?.label} · {formatMoney(l.price, l.currency)}</p></div>
          <div className="flex items-center gap-2">
            <Badge variant={l.status === "published" ? "default" : "secondary"}>{LISTING_STATUS_LABEL[l.status]}</Badge>
            {l.status === "published" && <Button size="sm" variant="outline" className="gap-1" onClick={() => save.mutate({ ...l, status: "paused" }, { onSuccess: () => toast.success("Servicio pausado por moderación") })}><Ban className="h-3.5 w-3.5" /> Pausar</Button>}
            <ConfirmActionDialog
              trigger={<Button size="icon" variant="ghost" aria-label={`Eliminar ${l.title}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              title="Eliminar servicio"
              description={`Se eliminará “${l.title}”. Esta acción no se puede deshacer.`}
              confirmLabel="Eliminar"
              onConfirm={() => del.mutate(l.id, { onSuccess: () => toast.success("Servicio eliminado") })}
            />
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}

function BookingsReal() {
  const [status, setStatus] = useState<AdminBookingStatus | "all">("all");
  const [q, setQ] = useState("");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...BK_KEY, "real", status, q],
    queryFn: () => adminBookingsApi.list({ per_page: 50, ...(status !== "all" ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) }),
  });
  const rows = data?.data ?? [];
  const paid = rows.filter((b) => b.amount_paid > 0 && b.status !== "cancelled");
  const gross = paid.reduce((n, b) => n + b.amount_paid, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "confirmed", "in_progress", "completed", "cancelled"] as const).map((k) => (
          <Button key={k} size="sm" variant={status === k ? "default" : "outline"} className="rounded-full" onClick={() => setStatus(k)}>{k === "all" ? "Todas" : BOOKING_STATUS_LABEL[k]}</Button>
        ))}
        <Input className="h-8 w-56" placeholder="Buscar nombre, correo o referencia" aria-label="Buscar reservas" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isError && <p className="text-sm text-destructive">No se pudieron cargar las reservas: {error instanceof Error ? error.message : "error del servidor"}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Cargando reservas…</p>}
      {!isLoading && !isError && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Reservas (total con este filtro)", String(data?.meta.total ?? 0)], ["Cobrado en esta página", formatMoney(gross)]].map(([l, v]) => (
              <Card key={l}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="font-display text-2xl font-bold">{v}</p></CardContent></Card>
            ))}
          </div>
          {rows.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Sin reservas con este filtro.</p>}
          <div className="space-y-2">
            {rows.map((b) => (
              <Card key={b.id}><CardContent className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="truncate">{b.reference} · {b.operator.name} · {b.contact.name} · {b.listing.title} · {b.date}</span>
                <span className="flex items-center gap-2"><Badge variant="secondary">{BOOKING_STATUS_LABEL[b.status]}</Badge><span className="font-mono">{formatMoney(b.total_price, b.currency)}</span></span>
              </CardContent></Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Bookings() {
  return HAS_BACKEND_SESSION ? <BookingsReal /> : <BookingsDemo />;
}

function BookingsDemo() {
  const { data: rows = [] } = useQuery({ queryKey: BK_KEY, queryFn: fetchAllBookings });
  const { data: orgs = [] } = useQuery({ queryKey: ORG_KEY, queryFn: fetchOrgs });
  const rate = useMemo(() => new Map(orgs.map((o) => [o.id, o.commission_rate])), [orgs]);
  const names = useMemo(() => new Map(orgs.map((o) => [o.id, o.business_name])), [orgs]);
  const paid = rows.filter((b) => paidAmount(b) > 0 && b.status !== "cancelled");
  const gross = paid.reduce((n, b) => n + paidAmount(b), 0);
  const commission = paid.filter((b) => b.source === "web").reduce((n, b) => n + (paidAmount(b) * (rate.get(b.org_id) ?? 8)) / 100, 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Reservas totales", String(rows.length)], ["Ventas cobradas", formatMoney(gross)], ["Comisión generada", formatMoney(commission)]].map(([l, v]) => (
          <Card key={l}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="font-display text-2xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>
      <div className="space-y-2">
        {rows.slice(0, 50).map((b) => (
          <Card key={b.id}><CardContent className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="truncate">{names.get(b.org_id) || b.org_id} · {b.contact_name} · {b.listing_title}</span>
            <span className="flex items-center gap-2"><Badge variant="secondary">{BOOKING_STATUS_LABEL[b.status]}</Badge><span className="font-mono">{formatMoney(b.total_price, b.currency)}</span></span>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function Store() {
  const { data: products = [] } = useProducts();
  const { data: orders = [], refetch: refetchOrders } = useAdminOrders();
  const prodMut = useOpMutation(({ id, p }: { id: string; p: any }) => adminUpdateOrderStatus(id, p), [["store"]]);
  const ordMut = useOpMutation(
    ({ id, s }: { id: string; s: StoreOrder["status"] }) => adminUpdateOrderStatus(id, s),
    [["store"]]
  );

  const [confirmModalOrder, setConfirmModalOrder] = useState<StoreOrder | null>(null);
  const [transferRef, setTransferRef] = useState("");
  const [transferAmountInput, setTransferAmountInput] = useState<string>("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const handleOpenConfirmTransfer = (order: StoreOrder) => {
    setConfirmModalOrder(order);
    setTransferRef("");
    setTransferAmountInput(order.total ? String(order.total) : "");
  };

  const handleExecuteConfirmTransfer = async () => {
    if (!confirmModalOrder) return;
    if (!transferRef.trim() || transferRef.trim().length < 3) {
      toast.error("Ingresa la referencia del depósito o transferencia (mínimo 3 caracteres)");
      return;
    }
    const amt = transferAmountInput ? Number(transferAmountInput) : undefined;
    if (amt !== undefined && (isNaN(amt) || amt <= 0)) {
      toast.error("El monto ingresado no es válido");
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      await adminConfirmTransfer(confirmModalOrder.id, transferRef.trim(), amt);
      toast.success("✅ Depósito confirmado. El pedido pasó a estado pagado.");
      setConfirmModalOrder(null);
      refetchOrders();
    } catch (err: any) {
      toast.error("Error al confirmar depósito", { description: err?.message || "No se pudo procesar" });
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Productos ({products.length})</CardTitle></CardHeader><CardContent className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 text-sm border-b border-border/60 pb-2 last:border-0">
            <span className="truncate">{p.emoji} {p.name} · {formatDop(p.price)}</span>
            <label className="flex items-center gap-2 text-xs shrink-0">Stock<Input type="number" min={0} className="h-8 w-16" defaultValue={p.stock} aria-label={`Stock de ${p.name}`} onBlur={(e) => { const v = Number(e.target.value); if (v >= 0 && v !== p.stock) prodMut.mutate({ id: p.id, p: { stock: v } }, { onSuccess: () => toast.success("Stock actualizado") }); }} /></label>
          </div>
        ))}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Pedidos ({orders.length})</CardTitle></CardHeader><CardContent className="space-y-3">
        {orders.length === 0 && <p className="text-sm text-muted-foreground">Sin pedidos todavía.</p>}
        {orders.map((o) => {
          const isTransfer = o.payment_method === "transfer" || !o.payment_method;
          const isPending = o.status === "pending";
          return (
            <div key={o.id} className="text-sm border-b border-border/60 pb-3 last:border-0 space-y-1.5">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-semibold block truncate">{o.customer_name} · {o.city}</span>
                  <span className="text-2xs text-muted-foreground block">
                    {isTransfer ? "🏦 Depósito / Transferencia" : "💳 Tarjeta"} · {new Date(o.created_at).toLocaleDateString("es-DO")}
                  </span>
                </div>
                <span className="font-mono font-bold text-foreground">{formatDop(o.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {(o.items || []).map((i) => `${i.qty}× ${i.name}`).join(", ")}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Select
                  value={o.status}
                  onValueChange={(v) => ordMut.mutate({ id: o.id, s: v as StoreOrder["status"] }, { onSuccess: () => toast.success("Pedido actualizado") })}
                >
                  <SelectTrigger className="h-8 w-36 text-xs" aria-label="Estado del pedido"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(ORDER_STATUS_LABEL) as StoreOrder["status"][]).map((s) => <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
                </Select>

                {isTransfer && isPending && (
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                    onClick={() => handleOpenConfirmTransfer(o)}
                  >
                    Confirmar depósito
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent></Card>

      {/* Modal para confirmar depósito / transferencia bancaria */}
      <Dialog open={!!confirmModalOrder} onOpenChange={(open) => (!open ? setConfirmModalOrder(null) : undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Depósito o Transferencia</DialogTitle>
            <DialogDescription>
              Registra el número de comprobante o referencia bancaria para marcar el pedido como pagado.
            </DialogDescription>
          </DialogHeader>

          {confirmModalOrder && (
            <div className="space-y-4 py-2 text-sm">
              <div className="bg-muted/40 p-3 rounded-xl space-y-1 text-xs">
                <p><strong>Pedido:</strong> {confirmModalOrder.id}</p>
                <p><strong>Cliente:</strong> {confirmModalOrder.customer_name} ({confirmModalOrder.customer_email})</p>
                <p><strong>Total a cobrar:</strong> {formatDop(confirmModalOrder.total)}</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-reservas-directas-f2" className="text-xs font-semibold text-foreground">
                  Número de Referencia o Comprobante <span className="text-destructive">*</span>
                </label>
                <Input id="admin-reservas-directas-f2"
                  placeholder="Ej: DEP-894210 o Ref Bancaria"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-reservas-directas-f1" className="text-xs font-semibold text-foreground">
                  Monto Verificado (DOP)
                </label>
                <Input id="admin-reservas-directas-f1"
                  type="number"
                  placeholder={String(confirmModalOrder.total)}
                  value={transferAmountInput}
                  onChange={(e) => setTransferAmountInput(e.target.value)}
                  className="h-9"
                />
                <p className="text-2xs text-muted-foreground">
                  Debe ser igual o mayor a {formatDop(confirmModalOrder.total)}.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOrder(null)}
              disabled={isSubmittingTransfer}
            >
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleExecuteConfirmTransfer}
              disabled={isSubmittingTransfer}
            >
              {isSubmittingTransfer ? "Confirmando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminReservasDirectas() {
  return (
    <Tabs defaultValue="orgs">
      <TabsList className="flex flex-wrap h-auto">
        <TabsTrigger value="orgs">Organizaciones</TabsTrigger>
        <TabsTrigger value="listings">Servicios</TabsTrigger>
        <TabsTrigger value="bookings">Reservas y comisiones</TabsTrigger>
        <TabsTrigger value="store">Tienda</TabsTrigger>
      </TabsList>
      <TabsContent value="orgs" className="mt-4"><Orgs /></TabsContent>
      <TabsContent value="listings" className="mt-4"><Listings /></TabsContent>
      <TabsContent value="bookings" className="mt-4"><Bookings /></TabsContent>
      <TabsContent value="store" className="mt-4"><Store /></TabsContent>
    </Tabs>
  );
}
