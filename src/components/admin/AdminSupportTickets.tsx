import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSupportTickets,
  getAdminSupportTicket,
  updateAdminSupportTicket,
  sendAdminSupportMessage,
  getAdminSupportStats,
  type SupportTicketItem,
  type SupportTicketStatus,
  type SupportTicketPriority,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Headphones,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  RefreshCw,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<SupportTicketStatus, { label: string; badge: string }> = {
  open: { label: "Abierto", badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200" },
  in_progress: { label: "En proceso", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200" },
  resolved: { label: "Resuelto", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200" },
  closed: { label: "Cerrado", badge: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200" },
};

const PRIORITY_CONFIG: Record<SupportTicketPriority, { label: string; color: string }> = {
  urgent: { label: "Urgente", color: "text-red-600 font-bold" },
  high: { label: "Alta", color: "text-orange-600 font-semibold" },
  medium: { label: "Media", color: "text-amber-600" },
  low: { label: "Baja", color: "text-slate-500" },
};

export default function AdminSupportTickets() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["admin-support-stats"],
    queryFn: getAdminSupportStats,
    staleTime: 30_000,
  });

  // Ticket list
  const { data: listData, isLoading, refetch } = useQuery({
    queryKey: ["admin-support-tickets", page, statusFilter, priorityFilter, search],
    queryFn: () =>
      getAdminSupportTickets({
        page,
        per_page: 25,
        status: statusFilter === "all" ? undefined : (statusFilter as SupportTicketStatus),
        priority: priorityFilter === "all" ? undefined : (priorityFilter as SupportTicketPriority),
        q: search.trim() || undefined,
      }),
  });

  // Ticket detail query
  const { data: ticketDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-support-ticket", selectedTicketId],
    queryFn: () => (selectedTicketId ? getAdminSupportTicket(selectedTicketId) : null),
    enabled: Boolean(selectedTicketId),
  });

  // Reply mutation
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const replyMutation = useMutation({
    mutationFn: ({ id, message, internal }: { id: string; message: string; internal: boolean }) =>
      sendAdminSupportMessage(id, message, internal),
    onSuccess: () => {
      toast.success(isInternalNote ? "Nota interna guardada" : "Respuesta enviada al usuario");
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-stats"] });
    },
    onError: (err: any) => toast.error(`Error al responder: ${err.message}`),
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, priority }: { id: string; status?: SupportTicketStatus; priority?: SupportTicketPriority }) =>
      updateAdminSupportTicket(id, { status, priority }),
    onSuccess: () => {
      toast.success("Ticket actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-stats"] });
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const tickets = listData?.data ?? [];
  const meta = listData?.meta;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-primary" />
            Mesa de Ayuda y Soporte
          </h2>
          <p className="text-sm text-slate-500">
            Atención al usuario, resolución de incidencias y notas internas de soporte.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 self-start">
          <RefreshCw className="w-4 h-4" /> Refrescar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Sin asignar</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats?.unassigned ?? 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Tiempo resp. promedio (30d)</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.avg_first_response_hours != null ? `${stats.avg_first_response_hours}h` : "—"}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Resueltos (últimos 30d)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.resolved_30d ?? 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Ticket más antiguo abierto</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {stats?.oldest_hours != null ? `${stats.oldest_hours}h` : "0h"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card border rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por asunto, correo o referencia..."
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in_progress">En proceso</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-medium">
              <tr>
                <th className="p-3">Ref</th>
                <th className="p-3">Asunto & Usuario</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Mensajes</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Cargando tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron tickets con los filtros actuales.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-medium text-xs text-primary">{t.reference}</td>
                    <td className="p-3 max-w-[280px]">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{t.subject}</div>
                      <div className="text-xs text-slate-500 truncate">{t.display_name || t.email || "Usuario anónimo"}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={STATUS_CONFIG[t.status]?.badge}>
                        {STATUS_CONFIG[t.status]?.label || t.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs ${PRIORITY_CONFIG[t.priority]?.color}`}>
                        {PRIORITY_CONFIG[t.priority]?.label || t.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {t.messages}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedTicketId(t.id)}>
                        Ver conversación
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between p-3 border-t text-xs text-slate-500">
            <span>Página {meta.page} de {meta.total_pages} ({meta.total} tickets)</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button size="sm" variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details & Chat Modal */}
      <Dialog open={Boolean(selectedTicketId)} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {ticketDetail?.reference}
                </span>
                <DialogTitle className="text-base font-bold truncate max-w-md">
                  {ticketDetail?.subject}
                </DialogTitle>
              </div>
              {ticketDetail && (
                <div className="flex items-center gap-2">
                  <Select
                    value={ticketDetail.status}
                    onValueChange={(val: SupportTicketStatus) =>
                      updateStatusMutation.mutate({ id: ticketDetail.id, status: val })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abierto</SelectItem>
                      <SelectItem value="in_progress">En proceso</SelectItem>
                      <SelectItem value="resolved">Resuelto</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 flex gap-4 mt-1">
              <span>Usuario: <strong>{ticketDetail?.display_name || ticketDetail?.email}</strong></span>
              <span>Categoría: <strong>{ticketDetail?.category || "General"}</strong></span>
              <span>Prioridad: <strong>{PRIORITY_CONFIG[ticketDetail?.priority || "medium"]?.label}</strong></span>
            </div>
          </DialogHeader>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950">
            {loadingDetail ? (
              <div className="text-center py-10 text-slate-400">Cargando mensajes...</div>
            ) : (
              <>
                {/* Initial Description */}
                {ticketDetail?.description && (
                  <div className="bg-card border rounded-lg p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Solicitud original
                      </span>
                      <span>{new Date(ticketDetail.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                      {ticketDetail.description}
                    </p>
                  </div>
                )}

                {/* Messages List */}
                {Array.isArray(ticketDetail?.messages) &&
                  ticketDetail.messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg text-sm max-w-[85%] ${
                        m.internal
                          ? "bg-amber-500/10 border border-amber-300 dark:border-amber-800 ml-auto"
                          : m.is_admin_reply
                          ? "bg-primary/10 border border-primary/20 ml-auto"
                          : "bg-card border mr-auto shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1 gap-4">
                        <span className="font-semibold flex items-center gap-1">
                          {m.internal ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-600" /> Nota interna (Admin)
                            </>
                          ) : m.is_admin_reply ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-primary" /> Soporte Oficial
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3" /> {m.sender_name || "Usuario"}
                            </>
                          )}
                        </span>
                        <span>{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{m.message}</p>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Reply Form */}
          <div className="p-3 border-t bg-card space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded"
                />
                <span>Nota interna privada (el usuario no la ve ni recibe correo)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={isInternalNote ? "Escribe una nota interna para el equipo..." : "Escribe tu respuesta al usuario (se enviará por correo y notificación)..."}
                className="min-h-[70px] text-sm resize-none"
              />
              <Button
                disabled={!replyMessage.trim() || replyMutation.isPending}
                onClick={() =>
                  ticketDetail &&
                  replyMutation.mutate({
                    id: ticketDetail.id,
                    message: replyMessage.trim(),
                    internal: isInternalNote,
                  })
                }
                className="self-end gap-1.5 h-10 px-4"
              >
                <Send className="w-4 h-4" />
                {isInternalNote ? "Guardar nota" : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
