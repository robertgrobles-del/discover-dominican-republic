import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminMarketingLeads,
  updateAdminMarketingLeadStatus,
  type MarketingLeadItem,
  type MarketingLeadStatus,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Search, RefreshCw, Mail, Phone, Building, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<MarketingLeadStatus, { label: string; badge: string }> = {
  nuevo: { label: "Nuevo", badge: "bg-blue-500/10 text-blue-500 border-blue-200" },
  contactado: { label: "Contactado", badge: "bg-amber-500/10 text-amber-500 border-amber-200" },
  calificado: { label: "Calificado", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-200" },
  perdido: { label: "Perdido", badge: "bg-muted text-foreground border-border" },
};

export default function AdminLeadsManager() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ["admin-marketing-leads", page, statusFilter],
    queryFn: () =>
      getAdminMarketingLeads({
        page,
        per_page: 30,
        status: statusFilter === "all" ? undefined : (statusFilter as MarketingLeadStatus),
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MarketingLeadStatus }) =>
      updateAdminMarketingLeadStatus(id, status),
    onSuccess: () => {
      toast.success("Estado del lead actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-marketing-leads"] });
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const leads = leadsData?.data ?? [];
  const meta = leadsData?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-rose-500" />
            Leads y Oportunidades Comerciales
          </h2>
          <p className="text-sm text-muted-foreground">
            Seguimiento de prospectos, solicitudes de contacto B2B y campañas de marketing.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refrescar
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center bg-card border rounded-xl p-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="nuevo">Nuevo</SelectItem>
            <SelectItem value="contactado">Contactado</SelectItem>
            <SelectItem value="calificado">Calificado</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
              <tr>
                <th className="p-3">Contacto</th>
                <th className="p-3">Empresa / Origen</th>
                <th className="p-3">Interés / Mensaje</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-right">Actualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Cargando prospectos...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No hay prospectos registrados.</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 dark:hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{lead.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-xs font-medium text-foreground">
                        {lead.company || "Particular"}
                      </div>
                      <div className="text-2xs text-muted-foreground font-mono">
                        Origen: {lead.source || "web"}
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      {lead.interest && (
                        <Badge variant="outline" className="text-3xs mb-1 font-mono">
                          {lead.interest}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {lead.message || "Sin mensaje"}
                      </p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={STATUS_CONFIG[lead.status]?.badge}>
                        {STATUS_CONFIG[lead.status]?.label || lead.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Select
                        value={lead.status}
                        onValueChange={(v: MarketingLeadStatus) =>
                          updateStatusMutation.mutate({ id: lead.id, status: v })
                        }
                      >
                        <SelectTrigger className="w-28 h-8 text-xs ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nuevo">Nuevo</SelectItem>
                          <SelectItem value="contactado">Contactado</SelectItem>
                          <SelectItem value="calificado">Calificado</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between p-3 border-t text-xs text-muted-foreground">
            <span>Página {meta.page} de {meta.total_pages} ({meta.total} leads)</span>
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
    </div>
  );
}
