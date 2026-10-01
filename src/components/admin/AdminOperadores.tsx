import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Building2, Search, CheckCircle2, XCircle, Shield, Star,
  Phone, Mail, Globe, MapPin, ArrowUpDown, ChevronDown,
  Filter, Eye, RefreshCw, BadgeCheck, AlertCircle, Users,
  Package, Compass, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Clock } from "lucide-react";
import { getStoredClaims, updateClaimStatus, StoredBusinessClaim } from "@/lib/leadStorage";

interface Operator {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  verification_status: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  created_at: string;
  // type-specific
  operator_type?: string;
  agency_type?: string;
  services?: string[] | null;
  languages?: string[] | null;
  certifications?: string[] | null;
  tour_types?: string[] | null;
}

type OperatorType = "tour_operator" | "travel_agency";

const VERIFICATION_BADGE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  verified:  { label: "Verificado",  color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: <BadgeCheck className="h-3 w-3" /> },
  pending:   { label: "Pendiente",   color: "bg-amber-500/10 text-amber-600 border-amber-200",       icon: <AlertCircle className="h-3 w-3" /> },
  rejected:  { label: "Rechazado",   color: "bg-red-500/10 text-red-600 border-red-200",             icon: <XCircle className="h-3 w-3" /> },
};

function OperatorTable({
  type,
  search,
  filterStatus,
}: {
  type: OperatorType;
  search: string;
  filterStatus: string;
}) {
  const qc = useQueryClient();
  const table = type === "tour_operator" ? "tour_operators" : "travel_agencies";

  const [verifyModal, setVerifyModal] = useState<Operator | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "rating">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: operators = [], isLoading } = useQuery<Operator[]>({
    queryKey: ["admin-operators", type, sortBy, sortDir],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .order(sortBy, { ascending: sortDir === "asc" });
      if (error) throw error;
      return (data || []) as Operator[];
    },
    staleTime: 30_000,
  });

  const toggleVerify = useMutation({
    mutationFn: async ({ op, verified, notes }: { op: Operator; verified: boolean; notes?: string }) => {
      const { data, error } = await supabase.rpc("admin_toggle_operator_verified" as any, {
        p_operator_id: op.id,
        p_type: type,
        p_verified: verified,
        p_notes: notes || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-operators"] });
      toast.success(vars.verified ? "Operador verificado ✓" : "Verificación rechazada");
      setVerifyModal(null);
      setRejectNotes("");
    },
    onError: () => toast.error("Error al actualizar verificación"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from(table as any)
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-operators"] }); toast.success("Estado actualizado"); },
    onError: () => toast.error("Error al cambiar estado"),
  });

  const filtered = operators.filter(op => {
    const matchSearch = !search ||
      op.name.toLowerCase().includes(search.toLowerCase()) ||
      op.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "verified" && op.verification_status === "verified") ||
      (filterStatus === "pending" && op.verification_status === "pending") ||
      (filterStatus === "inactive" && !op.is_active);
    return matchSearch && matchStatus;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const stats = {
    total: operators.length,
    verified: operators.filter(o => o.verification_status === "verified").length,
    pending: operators.filter(o => o.verification_status === "pending").length,
    active: operators.filter(o => o.is_active).length,
  };

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-primary" },
          { label: "Verificados", value: stats.verified, color: "text-emerald-500" },
          { label: "Pendientes", value: stats.pending, color: "text-amber-500" },
          { label: "Activos", value: stats.active, color: "text-blue-500" },
        ].map(s => (
          <div key={s.label} className="text-center p-3 rounded-xl bg-card border border-border">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Table */}
        <Card>
          <ScrollArea className="w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 pl-4 font-medium text-muted-foreground">
                    <button className="flex items-center gap-1" onClick={() => toggleSort("name")}>
                      Operador <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Contacto</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <button className="flex items-center gap-1" onClick={() => toggleSort("rating")}>
                      Rating <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Verificación</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {Array.from({ length: 6 }).map((_, j) => <td key={j} className="p-3"><Skeleton className="h-5 w-full" /></td>)}
                      </tr>
                    ))
                  : filtered.map(op => {
                      const vCfg = VERIFICATION_BADGE[op.verification_status || "pending"] || VERIFICATION_BADGE.pending;
                      return (
                        <tr
                          key={op.id}
                          className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${selectedOp?.id === op.id ? "bg-primary/5" : ""}`}
                          onClick={() => setSelectedOp(op)}
                        >
                          <td className="p-3 pl-4">
                            <div className="flex items-center gap-2">
                              {op.logo_url || op.image_url
                                ? <img src={op.logo_url || op.image_url || ""} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                                : <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-4 w-4 text-primary" />
                                  </div>
                              }
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate max-w-[180px]">{op.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {op.operator_type || op.agency_type || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              {op.phone && <p className="text-xs flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{op.phone}</p>}
                              {op.email && <p className="text-xs flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{op.email.slice(0, 24)}{op.email.length > 24 ? "…" : ""}</p>}
                            </div>
                          </td>
                          <td className="p-3">
                            {op.rating
                              ? <span className="flex items-center gap-1 font-bold text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" />{op.rating}</span>
                              : <span className="text-muted-foreground text-xs">N/A</span>
                            }
                          </td>
                          <td className="p-3">
                            <Badge className={`gap-1 text-xs border ${vCfg.color}`}>{vCfg.icon} {vCfg.label}</Badge>
                          </td>
                          <td className="p-3">
                            {op.is_active !== false
                              ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs border">Activo</Badge>
                              : <Badge className="bg-gray-500/10 text-gray-500 border-gray-200 text-xs border">Inactivo</Badge>
                            }
                          </td>
                          <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 z-50">
                                <DropdownMenuItem onClick={() => setSelectedOp(op)}>
                                  <Eye className="h-4 w-4 mr-2" /> Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {op.verification_status !== "verified" && (
                                  <DropdownMenuItem className="text-emerald-600" onClick={() => toggleVerify.mutate({ op, verified: true })}>
                                    <BadgeCheck className="h-4 w-4 mr-2" /> Verificar
                                  </DropdownMenuItem>
                                )}
                                {op.verification_status === "verified" && (
                                  <DropdownMenuItem className="text-amber-600" onClick={() => { setVerifyModal(op); }}>
                                    <RefreshCw className="h-4 w-4 mr-2" /> Quitar verificación
                                  </DropdownMenuItem>
                                )}
                                {op.verification_status === "pending" && (
                                  <DropdownMenuItem className="text-red-600" onClick={() => setVerifyModal(op)}>
                                    <XCircle className="h-4 w-4 mr-2" /> Rechazar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toggleActive.mutate({ id: op.id, active: !op.is_active })}>
                                  {op.is_active ? <XCircle className="h-4 w-4 mr-2 text-red-500" /> : <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />}
                                  {op.is_active ? "Desactivar" : "Activar"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                }
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <Building2 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      No se encontraron operadores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </Card>

        {/* Detail sidebar */}
        {selectedOp && (
          <Card className="self-start sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{selectedOp.name}</CardTitle>
                <Button variant="ghost" size="icon" aria-label="Cerrar detalles" className="h-6 w-6" onClick={() => setSelectedOp(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              {(selectedOp.logo_url || selectedOp.image_url) && (
                <img src={selectedOp.logo_url || selectedOp.image_url || ""} alt={selectedOp.name}
                  className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {selectedOp.short_description && (
                <p className="text-muted-foreground text-xs leading-relaxed">{selectedOp.short_description}</p>
              )}
              <div className="space-y-1.5">
                {selectedOp.address && <p className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />{selectedOp.address}</p>}
                {selectedOp.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{selectedOp.phone}</p>}
                {selectedOp.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{selectedOp.email}</p>}
                {selectedOp.website && (
                  <a href={selectedOp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe className="h-3.5 w-3.5" />{selectedOp.website.replace(/https?:\/\//, "")}
                  </a>
                )}
              </div>
              {selectedOp.languages && selectedOp.languages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Idiomas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedOp.languages.map(l => <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>)}
                  </div>
                </div>
              )}
              {selectedOp.certifications && selectedOp.certifications.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Certificaciones</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedOp.certifications.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                </div>
              )}
              {selectedOp.verification_notes && (
                <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-200 text-xs text-amber-700">
                  <p className="font-semibold mb-1">Notas de verificación:</p>
                  <p>{selectedOp.verification_notes}</p>
                </div>
              )}
              <div className="pt-2 flex gap-2">
                {selectedOp.verification_status !== "verified" && (
                  <Button size="sm" className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => toggleVerify.mutate({ op: selectedOp, verified: true })}>
                    <BadgeCheck className="h-3.5 w-3.5" /> Verificar
                  </Button>
                )}
                {selectedOp.verification_status === "verified" && (
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setVerifyModal(selectedOp)}>
                    <RefreshCw className="h-3.5 w-3.5" /> Quitar
                  </Button>
                )}
                {selectedOp.verification_status === "pending" && (
                  <Button size="sm" variant="outline" className="flex-1 gap-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => setVerifyModal(selectedOp)}>
                    <XCircle className="h-3.5 w-3.5" /> Rechazar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject / Un-verify modal */}
      <Dialog open={!!verifyModal} onOpenChange={open => !open && setVerifyModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyModal?.verification_status === "verified"
                ? <><RefreshCw className="h-5 w-5 text-amber-500" /> Quitar verificación</>
                : <><XCircle className="h-5 w-5 text-red-500" /> Rechazar solicitud</>
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Operador: <strong>{verifyModal?.name}</strong>
            </p>
            <div>
              <Label className="text-sm mb-1.5 block">Notas / Motivo</Label>
              <Textarea
                value={rejectNotes}
                onChange={e => setRejectNotes(e.target.value)}
                placeholder="Describe el motivo o qué debe corregir el operador..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyModal(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => verifyModal && toggleVerify.mutate({ op: verifyModal, verified: false, notes: rejectNotes })}
              disabled={toggleVerify.isPending}
            >
              {toggleVerify.isPending ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



function BusinessClaimsTable({
  search,
  filterStatus,
}: {
  search: string;
  filterStatus: string;
}) {
  const [claims, setClaims] = useState<StoredBusinessClaim[]>(() => getStoredClaims());

  const refreshClaims = () => {
    setClaims(getStoredClaims());
  };

  const handleUpdateStatus = (id: string, status: StoredBusinessClaim["status"]) => {
    updateClaimStatus(id, status);
    refreshClaims();
    toast.success(`Solicitud marcada como ${status}`);
  };

  const filtered = claims.filter(c => {
    const matchesSearch =
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      c.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      c.applicant_email.toLowerCase().includes(search.toLowerCase()) ||
      (c.rnc && c.rnc.includes(search));
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "verified" && c.status === "aprobado") ||
      (filterStatus === "pending" && (c.status === "pendiente" || c.status === "en_revision")) ||
      (filterStatus === "inactive" && c.status === "rechazado");
    return matchesSearch && matchesStatus;
  });

  const pendingCount = claims.filter(c => c.status === "pendiente" || c.status === "en_revision").length;

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" /> Solicitudes de Alta & Verificación de Negocios
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Reclamos de propiedad y altas directas enviadas desde el portal ({claims.length} totales, {pendingCount} pendientes).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshClaims}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            No se encontraron solicitudes con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y border-border">
                <tr>
                  <th className="p-3 text-left font-semibold">Negocio</th>
                  <th className="p-3 text-left font-semibold">Tipo</th>
                  <th className="p-3 text-left font-semibold">Solicitante</th>
                  <th className="p-3 text-left font-semibold">Contacto</th>
                  <th className="p-3 text-left font-semibold">RNC / Licencia</th>
                  <th className="p-3 text-left font-semibold">Estado</th>
                  <th className="p-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(claim => (
                  <tr key={claim.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      {claim.business_name}
                      {claim.notes && (
                        <p className="text-[10px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                          {claim.notes}
                        </p>
                      )}
                    </td>
                    <td className="p-3 capitalize text-muted-foreground">{claim.business_type}</td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{claim.applicant_name}</p>
                      <p className="text-[10px] text-muted-foreground">{claim.role}</p>
                    </td>
                    <td className="p-3">
                      <a href={`mailto:${claim.applicant_email}`} className="text-primary hover:underline block">
                        {claim.applicant_email}
                      </a>
                      <span className="text-[10px] text-muted-foreground">{claim.applicant_phone}</span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {claim.rnc || claim.mitur_license || <span className="text-muted-foreground">N/D</span>}
                    </td>
                    <td className="p-3">
                      {claim.status === "aprobado" && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Aprobado
                        </Badge>
                      )}
                      {claim.status === "pendiente" && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px] gap-1">
                          <Clock className="h-3 w-3" /> Pendiente
                        </Badge>
                      )}
                      {claim.status === "rechazado" && (
                        <Badge className="bg-rose-500/10 text-rose-600 border-rose-300 text-[10px] gap-1">
                          <XCircle className="h-3 w-3" /> Rechazado
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        {claim.status !== "aprobado" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(claim.id, "aprobado")}
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            Aprobar
                          </Button>
                        )}
                        {claim.status !== "rechazado" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(claim.id, "rechazado")}
                            className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            Rechazar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminOperadores() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Operadores & Negocios Registrados
          </h2>
          <p className="text-sm text-muted-foreground">Gestiona y verifica operadores, agencias y solicitudes de alta de negocios</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar operador o negocio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <Filter className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="verified">Verificados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims" className="gap-2">
            <FileCheck className="h-4 w-4 text-primary" /> Solicitudes de Alta & Reclamos
          </TabsTrigger>
          <TabsTrigger value="tour_operators" className="gap-2">
            <Compass className="h-4 w-4" /> Tour Operadores
          </TabsTrigger>
          <TabsTrigger value="travel_agencies" className="gap-2">
            <Package className="h-4 w-4" /> Agencias de Viaje
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="mt-6">
          <BusinessClaimsTable search={search} filterStatus={filterStatus} />
        </TabsContent>

        <TabsContent value="tour_operators" className="mt-6">
          <OperatorTable type="tour_operator" search={search} filterStatus={filterStatus} />
        </TabsContent>

        <TabsContent value="travel_agencies" className="mt-6">
          <OperatorTable type="travel_agency" search={search} filterStatus={filterStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
