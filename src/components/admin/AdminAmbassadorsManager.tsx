import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminAmbassadors,
  updateAdminAmbassador,
  getAdminAmbassadorPayouts,
  settleAdminAmbassadorPayout,
  type AmbassadorItem,
  type AmbassadorPayoutItem,
  type AmbassadorStatus,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, DollarSign, CheckCircle2, XCircle, Search, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<AmbassadorStatus, { label: string; badge: string }> = {
  pending: { label: "Pendiente", badge: "bg-amber-500/10 text-amber-700 border-amber-200" },
  approved: { label: "Aprobado", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rechazado", badge: "bg-red-500/10 text-red-700 border-red-200" },
  suspended: { label: "Suspendido", badge: "bg-slate-500/10 text-slate-700 border-slate-200" },
};

export default function AdminAmbassadorsManager() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"ambassadors" | "payouts">("ambassadors");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedAmbassador, setSelectedAmbassador] = useState<AmbassadorItem | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<AmbassadorPayoutItem | null>(null);
  const [payoutRef, setPayoutRef] = useState("");

  const { data: ambassadorsData, isLoading: loadingAmbassadors, refetch: refetchAmbassadors } = useQuery({
    queryKey: ["admin-ambassadors", page, statusFilter, search],
    queryFn: () =>
      getAdminAmbassadors({
        page,
        per_page: 25,
        status: statusFilter === "all" ? undefined : (statusFilter as AmbassadorStatus),
        q: search.trim() || undefined,
      }),
    enabled: tab === "ambassadors",
  });

  const { data: payoutsData, isLoading: loadingPayouts, refetch: refetchPayouts } = useQuery({
    queryKey: ["admin-ambassador-payouts", page],
    queryFn: () => getAdminAmbassadorPayouts({ page, per_page: 25 }),
    enabled: tab === "payouts",
  });

  const updateAmbassadorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: AmbassadorStatus; commission_override?: number | null; note?: string } }) =>
      updateAdminAmbassador(id, data),
    onSuccess: () => {
      toast.success("Embajador actualizado con éxito");
      setSelectedAmbassador(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ambassadors"] });
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const settlePayoutMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "paid" | "failed"; reference?: string; note?: string } }) =>
      settleAdminAmbassadorPayout(id, data),
    onSuccess: () => {
      toast.success("Pago liquidado con éxito");
      setSelectedPayout(null);
      setPayoutRef("");
      queryClient.invalidateQueries({ queryKey: ["admin-ambassador-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ambassadors"] });
    },
    onError: (err: any) => toast.error(`Error al liquidar pago: ${err.message}`),
  });

  const ambassadors = ambassadorsData?.data ?? [];
  const payouts = payoutsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" />
            Programa de Embajadores y Afiliados
          </h2>
          <p className="text-sm text-slate-500">
            Aprobación de creadores y promotores, comisiones por referidos y liquidación de pagos.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (tab === "ambassadors" ? refetchAmbassadors() : refetchPayouts())}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refrescar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={tab === "ambassadors" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => { setTab("ambassadors"); setPage(1); }}
          className="rounded-b-none gap-2"
        >
          <Award className="w-4 h-4" /> Embajadores
        </Button>
        <Button
          variant={tab === "payouts" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => { setTab("payouts"); setPage(1); }}
          className="rounded-b-none gap-2"
        >
          <DollarSign className="w-4 h-4" /> Liquidaciones y Pagos
        </Button>
      </div>

      {tab === "ambassadors" ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-card border rounded-xl p-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre, correo o código de referido..."
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-medium">
                  <tr>
                    <th className="p-3">Embajador</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Ganancias Totales</th>
                    <th className="p-3">Saldo Pendiente</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingAmbassadors ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando embajadores...</td></tr>
                  ) : ambassadors.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay embajadores registrados.</td></tr>
                  ) : (
                    ambassadors.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{a.full_name}</div>
                          <div className="text-xs text-slate-500">{a.email}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-xs text-purple-600">{a.referral_code}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={STATUS_CONFIG[a.status]?.badge}>
                            {STATUS_CONFIG[a.status]?.label || a.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold text-emerald-600">RD$ {a.total_earnings.toLocaleString()}</td>
                        <td className="p-3 font-semibold text-amber-600">RD$ {a.pending_balance.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelectedAmbassador(a)}>
                            Administrar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Payouts Table */
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-medium">
                <tr>
                  <th className="p-3">Embajador</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3">Fecha Solicitud</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingPayouts ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando liquidaciones...</td></tr>
                ) : payouts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay pagos pendientes.</td></tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-medium">{p.ambassador_name || p.ambassador_id}</td>
                      <td className="p-3 font-bold text-emerald-600">RD$ {p.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={p.status === "paid" ? "bg-emerald-500/10 text-emerald-700" : p.status === "failed" ? "bg-red-500/10 text-red-700" : "bg-amber-500/10 text-amber-700"}>
                          {p.status === "paid" ? "Pagado" : p.status === "failed" ? "Fallido" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-xs">{p.reference || "—"}</td>
                      <td className="p-3 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        {p.status === "pending" && (
                          <Button size="sm" className="bg-emerald-600 text-white" onClick={() => setSelectedPayout(p)}>
                            Confirmar Envío
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ambassador Edit Modal */}
      <Dialog open={Boolean(selectedAmbassador)} onOpenChange={(open) => !open && setSelectedAmbassador(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Gestionar Embajador</DialogTitle>
          </DialogHeader>
          {selectedAmbassador && (
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="font-bold text-slate-900 dark:text-white">{selectedAmbassador.full_name}</div>
                <div className="text-xs text-slate-500">{selectedAmbassador.email}</div>
                <div className="text-xs font-mono text-purple-600 mt-1">Código: {selectedAmbassador.referral_code}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado de la cuenta</label>
                <Select
                  defaultValue={selectedAmbassador.status}
                  onValueChange={(val: any) =>
                    updateAmbassadorMutation.mutate({
                      id: selectedAmbassador.id,
                      data: { status: val, note: "Actualizado desde panel admin" },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Aprobado / Activo</SelectItem>
                    <SelectItem value="pending">En revisión (Pendiente)</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setSelectedAmbassador(null)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Confirm Modal */}
      <Dialog open={Boolean(selectedPayout)} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Confirmar Pago de Comisiones</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-3 py-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                Vas a marcar como enviado el pago por <strong>RD$ {selectedPayout.amount.toLocaleString()}</strong>.
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Referencia Bancaria / Comprobante</label>
                <Input
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  placeholder="ej. ACH-98234123"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setSelectedPayout(null)}>Cancelar</Button>
                <Button
                  disabled={!payoutRef.trim() || settlePayoutMutation.isPending}
                  onClick={() =>
                    settlePayoutMutation.mutate({
                      id: selectedPayout.id,
                      data: { status: "paid", reference: payoutRef.trim() },
                    })
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {settlePayoutMutation.isPending ? "Confirmando..." : "Confirmar Pago"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
