import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle2, Landmark, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import {
  confirmOrderTransfer, deleteBankAccount, listBankAccounts, listStoreOrders, saveBankAccount, setStoreOrderStatus,
  type AdminStoreOrder, type StoreBankAccount, type StoreBankAccountInput, type StoreOrderStatus,
} from "@/lib/adminStoreApi";

const STATUS_LABEL: Record<StoreOrderStatus, string> = {
  pending: "Pendiente de pago", paid: "Pagado", processing: "En preparación", shipped: "Enviado", delivered: "Entregado",
  cancelled: "Cancelado", refunded: "Reembolsado", return_requested: "Devolución solicitada",
};
const STATUS_TONE: Record<StoreOrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-500", paid: "bg-emerald-500/15 text-emerald-500",
  processing: "bg-sky-500/15 text-sky-500", shipped: "bg-indigo-500/15 text-indigo-500",
  delivered: "bg-emerald-500/15 text-emerald-500", cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-muted text-muted-foreground", return_requested: "bg-rose-500/15 text-rose-500",
};
/** Siguiente paso que puede dar el administrador desde cada estado. */
const NEXT_STEP: Partial<Record<StoreOrderStatus, { status: "processing" | "shipped" | "delivered"; label: string }>> = {
  paid: { status: "processing", label: "Pasar a preparación" },
  processing: { status: "shipped", label: "Marcar enviado" },
  shipped: { status: "delivered", label: "Marcar entregado" },
};

const money = (amount: number, currency: string) => new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(amount);
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
const errorText = (error: unknown) => (error instanceof Error ? error.message : "Error desconocido");

function OrdersTab() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<StoreOrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<AdminStoreOrder | null>(null);
  const [reference, setReference] = useState("");
  const [shipping, setShipping] = useState<AdminStoreOrder | null>(null);
  const [courier, setCourier] = useState({ name: "", tracking: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-store-orders", status, search.trim(), page],
    queryFn: () => listStoreOrders({ status: status === "all" ? undefined : status, q: search.trim() || undefined, page }),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-store-orders"] });

  const confirm = useMutation({
    mutationFn: () => confirmOrderTransfer(confirming!.id, { reference: reference.trim() }),
    onSuccess: () => { toast.success("Depósito confirmado: el pedido quedó pagado"); setConfirming(null); setReference(""); refresh(); },
    onError: (e) => toast.error("No se pudo confirmar el depósito", { description: errorText(e) }),
  });
  const advance = useMutation({
    mutationFn: (input: { id: string; status: "processing" | "shipped" | "delivered" | "cancelled"; courier_name?: string; tracking_number?: string; reason?: string }) => {
      const { id, ...body } = input;
      return setStoreOrderStatus(id, body);
    },
    onSuccess: () => { toast.success("Pedido actualizado"); setShipping(null); setCourier({ name: "", tracking: "" }); refresh(); },
    onError: (e) => toast.error("No se pudo actualizar el pedido", { description: errorText(e) }),
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por número de pedido, nombre o correo" className="pl-9" aria-label="Buscar pedidos" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as StoreOrderStatus | "all"); setPage(1); }}>
          <SelectTrigger className="sm:w-60" aria-label="Filtrar por estado"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {(Object.keys(STATUS_LABEL) as StoreOrderStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">No se pudieron cargar los pedidos: {errorText(error)}</p>}
      {!isLoading && !isError && orders.length === 0 && <PanelEmptyState icon={Banknote} title="Sin pedidos" description="No hay pedidos con ese filtro." />}

      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Artículos</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const awaitingDeposit = order.payment_method === "transfer" && order.status === "pending";
                const next = NEXT_STEP[order.status];
                return (
                  <tr key={order.id} className="align-top hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{shortDate(order.created_at)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{order.payment_method === "transfer" ? "Depósito o transferencia" : "Tarjeta"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      <p className="text-xs text-muted-foreground">{order.city}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.items.map((item, i) => <p key={i}>{item.quantity} × {item.name}{item.size ? ` (${item.size})` : ""}</p>)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(order.total, order.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                      {awaitingDeposit && order.transfer_expires_at && <p className="mt-1 text-xs text-muted-foreground">Vence el {shortDate(order.transfer_expires_at)}</p>}
                      {order.tracking_number && <p className="mt-1 text-xs text-muted-foreground">{order.courier_name} · {order.tracking_number}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-1.5">
                        {awaitingDeposit && <Button size="sm" onClick={() => { setConfirming(order); setReference(""); }}><CheckCircle2 className="mr-1 h-4 w-4" /> Confirmar depósito</Button>}
                        {next && (
                          <Button size="sm" variant="outline" disabled={advance.isPending}
                            onClick={() => (next.status === "shipped" ? setShipping(order) : advance.mutate({ id: order.id, status: next.status }))}>
                            {next.label}
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "paid" || order.status === "processing") && (
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={advance.isPending}
                            onClick={() => { if (window.confirm(`¿Cancelar el pedido ${order.id}? Se devuelve el stock${order.status === "pending" ? "" : " y se reembolsa el pago"}.`)) advance.mutate({ id: order.id, status: "cancelled", reason: "Cancelado desde el panel" }); }}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{meta.total} pedidos · página {meta.page} de {meta.total_pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <Button size="sm" variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </div>
      )}

      <Dialog open={confirming !== null} onOpenChange={(open) => { if (!open) setConfirming(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar depósito</DialogTitle>
            <DialogDescription>
              {confirming && <>Pedido <strong className="font-mono">{confirming.id}</strong> de {confirming.customer_name}. Total: <strong>{money(confirming.total, confirming.currency)}</strong>. Al confirmar, el pedido queda pagado y se avisa al cliente.</>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="deposit-ref">Referencia del depósito o de la transferencia</Label>
            <Input id="deposit-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Número de comprobante" maxLength={100} />
            <p className="text-xs text-muted-foreground">Comprueba en el banco que el monto recibido cubre el total antes de confirmar.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(null)}>Cancelar</Button>
            <Button disabled={reference.trim().length < 3 || confirm.isPending} onClick={() => confirm.mutate()}>
              {confirm.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shipping !== null} onOpenChange={(open) => { if (!open) setShipping(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como enviado</DialogTitle>
            <DialogDescription>El cliente recibe la guía por correo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="courier">Transportista</Label><Input id="courier" value={courier.name} onChange={(e) => setCourier({ ...courier, name: e.target.value })} maxLength={80} /></div>
            <div className="space-y-1.5"><Label htmlFor="tracking">Número de guía</Label><Input id="tracking" value={courier.tracking} onChange={(e) => setCourier({ ...courier, tracking: e.target.value })} maxLength={80} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShipping(null)}>Cancelar</Button>
            <Button disabled={!courier.name.trim() || !courier.tracking.trim() || advance.isPending}
              onClick={() => advance.mutate({ id: shipping!.id, status: "shipped", courier_name: courier.name.trim(), tracking_number: courier.tracking.trim() })}>
              Marcar enviado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const EMPTY_ACCOUNT: StoreBankAccountInput = { bank_name: "", account_type: "corriente", account_number: "", holder_name: "", holder_document: null, currency: "DOP", notes: null, is_active: true, sort_order: 0 };

function BankAccountsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<{ id: string | null; form: StoreBankAccountInput } | null>(null);
  const { data: accounts = [], isLoading, isError, error } = useQuery({ queryKey: ["admin-bank-accounts"], queryFn: listBankAccounts });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-bank-accounts"] });

  const save = useMutation({
    mutationFn: (input: { id: string | null; form: Partial<StoreBankAccountInput> }) => saveBankAccount(input.id, input.form),
    onSuccess: () => { toast.success("Cuenta guardada"); setEditing(null); refresh(); },
    onError: (e) => toast.error("No se pudo guardar la cuenta", { description: errorText(e) }),
  });
  const remove = useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => { toast.success("Cuenta eliminada"); refresh(); },
    onError: (e) => toast.error("No se pudo eliminar la cuenta", { description: errorText(e) }),
  });

  const form = editing?.form;
  const setForm = (patch: Partial<StoreBankAccountInput>) => setEditing((cur) => (cur ? { ...cur, form: { ...cur.form, ...patch } } : cur));
  const valid = form && form.bank_name.trim().length >= 2 && form.account_number.trim().length >= 4 && form.holder_name.trim().length >= 2 && /^[A-Z]{3}$/.test(form.currency);
  const activeCount = accounts.filter((a) => a.is_active).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Las cuentas activas se muestran al cliente cuando elige pagar por depósito o transferencia.
          {!isLoading && activeCount === 0 && <strong className="text-amber-500"> No hay ninguna activa: ese método de pago no está disponible en la tienda.</strong>}
        </p>
        <Button onClick={() => setEditing({ id: null, form: { ...EMPTY_ACCOUNT, sort_order: accounts.length } })}><Plus className="mr-1 h-4 w-4" /> Agregar cuenta</Button>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">No se pudieron cargar las cuentas: {errorText(error)}</p>}
      {!isLoading && !isError && accounts.length === 0 && <PanelEmptyState icon={Landmark} title="Sin cuentas bancarias" description="Agrega al menos una cuenta para aceptar pagos por depósito o transferencia." />}

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account: StoreBankAccount) => (
          <div key={account.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{account.bank_name}</p>
                <p className="text-sm text-muted-foreground">Cuenta {account.account_type} · {account.currency}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={account.is_active ? "default" : "secondary"}>{account.is_active ? "Activa" : "Inactiva"}</Badge>
                <Switch checked={account.is_active} disabled={save.isPending} aria-label={`Activar ${account.bank_name}`}
                  onCheckedChange={(checked) => save.mutate({ id: account.id, form: { is_active: checked } })} />
              </div>
            </div>
            <p className="mt-3 font-mono text-lg font-semibold tracking-wide">{account.account_number}</p>
            <p className="text-sm">{account.holder_name}{account.holder_document ? ` · ${account.holder_document}` : ""}</p>
            {account.notes && <p className="mt-2 text-xs text-muted-foreground">{account.notes}</p>}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { const { id, ...rest } = account; setEditing({ id, form: rest }); }}><Pencil className="mr-1 h-3.5 w-3.5" /> Editar</Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={remove.isPending}
                onClick={() => { if (window.confirm(`¿Eliminar la cuenta de ${account.bank_name}?`)) remove.mutate(account.id); }}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar cuenta bancaria" : "Agregar cuenta bancaria"}</DialogTitle>
            <DialogDescription>Estos datos se muestran al cliente tal como los escribas.</DialogDescription>
          </DialogHeader>
          {form && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="ba-bank">Banco</Label><Input id="ba-bank" value={form.bank_name} maxLength={80} onChange={(e) => setForm({ bank_name: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label htmlFor="ba-type">Tipo de cuenta</Label>
                <Select value={form.account_type} onValueChange={(v) => setForm({ account_type: v as StoreBankAccount["account_type"] })}>
                  <SelectTrigger id="ba-type"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="corriente">Corriente</SelectItem><SelectItem value="ahorros">Ahorros</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ba-currency">Moneda</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ currency: v })}>
                  <SelectTrigger id="ba-currency"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="DOP">Pesos (DOP)</SelectItem><SelectItem value="USD">Dólares (USD)</SelectItem><SelectItem value="EUR">Euros (EUR)</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="ba-number">Número de cuenta</Label><Input id="ba-number" value={form.account_number} maxLength={40} onChange={(e) => setForm({ account_number: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="ba-holder">Titular</Label><Input id="ba-holder" value={form.holder_name} maxLength={120} onChange={(e) => setForm({ holder_name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="ba-doc">RNC o cédula (opcional)</Label><Input id="ba-doc" value={form.holder_document ?? ""} maxLength={30} onChange={(e) => setForm({ holder_document: e.target.value || null })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="ba-notes">Nota para el cliente (opcional)</Label><Textarea id="ba-notes" rows={2} value={form.notes ?? ""} maxLength={300} onChange={(e) => setForm({ notes: e.target.value || null })} /></div>
              <div className="flex items-center gap-2 sm:col-span-2"><Switch id="ba-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ is_active: checked })} /><Label htmlFor="ba-active">Mostrar al cliente</Label></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button disabled={!valid || save.isPending}
              onClick={() => form && save.mutate({ id: editing!.id, form: { ...form, bank_name: form.bank_name.trim(), account_number: form.account_number.trim(), holder_name: form.holder_name.trim() } })}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Pedidos reales de la tienda y cuentas bancarias para depósitos. Solo existe con sesión real contra el backend. */
export function AdminStoreOrders() {
  if (!HAS_BACKEND_SESSION) {
    return <PanelEmptyState icon={Banknote} title="Los pedidos se gestionan en el backend" description="Inicia sesión contra el backend para ver los pedidos reales y confirmar depósitos." />;
  }
  return (
    <Tabs defaultValue="orders" className="space-y-4">
      <TabsList>
        <TabsTrigger value="orders">Pedidos</TabsTrigger>
        <TabsTrigger value="accounts">Cuentas bancarias</TabsTrigger>
      </TabsList>
      <TabsContent value="orders"><OrdersTab /></TabsContent>
      <TabsContent value="accounts"><BankAccountsTab /></TabsContent>
    </Tabs>
  );
}
