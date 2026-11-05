import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { adjustAdminUserXp, listAdminUserTransactions, listAdminUsers, setAdminUserRole, setAdminUserSuspended } from "@/lib/adminUsersApi";
import {
  Users, Search, Shield, Crown, Zap, Flame, ChevronDown,
  Ban, CheckCircle2, Plus, Minus, ArrowUpDown, Eye, X,
  TrendingUp, UserCheck, UserX, Star, Calendar, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface AdminUser {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  is_suspended: boolean;
  suspension_reason: string | null;
  avatar_url: string | null;
  created_at: string;
  total_xp: number;
  coins: number;
  current_level: number;
  streak_days: number;
  total_missions_completed: number;
  total_referrals: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  xp_amount: number | null;
  coin_amount: number | null;
  description: string | null;
  source_type: string | null;
  created_at: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  admin:     { label: "Admin",       color: "bg-red-500/10 text-red-600 border-red-200",     icon: <Shield className="h-3 w-3" /> },
  editor:    { label: "Editor",      color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: <TrendingUp className="h-3 w-3" /> },
  moderator: { label: "Moderador",   color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: <Star className="h-3 w-3" /> },
  partner:   { label: "Partner",     color: "bg-blue-500/10 text-blue-600 border-blue-200",   icon: <Crown className="h-3 w-3" /> },
  user:      { label: "Usuario",     color: "bg-gray-500/10 text-gray-600 border-gray-200",   icon: <Users className="h-3 w-3" /> },
};

export function AdminUsuarios() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"created_at" | "total_xp" | "display_name">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Modals
  const [xpModal, setXpModal] = useState<AdminUser | null>(null);
  const [suspendModal, setSuspendModal] = useState<AdminUser | null>(null);
  const [txModal, setTxModal] = useState<AdminUser | null>(null);
  const [xpAmount, setXpAmount] = useState("50");
  const [coinAmount, setCoinAmount] = useState("0");
  const [xpReason, setXpReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");

  // Fetch users
  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users", sortBy, sortDir],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        const rows = await listAdminUsers();
        const dir = sortDir === "asc" ? 1 : -1;
        return rows.sort((a, b) => {
          const x = a[sortBy] ?? "", y = b[sortBy] ?? "";
          return (x < y ? -1 : x > y ? 1 : 0) * dir;
        });
      }
      const { data, error } = await supabase
        .from("user_admin_view" as any)
        .select("*")
        .order(sortBy, { ascending: sortDir === "asc" });
      if (error) throw error;
      return (data || []) as AdminUser[];
    },
    staleTime: 30_000,
  });

  // Fetch transactions for modal
  const { data: userTxs = [], isLoading: loadingTx } = useQuery<Transaction[]>({
    queryKey: ["admin-user-tx", txModal?.id],
    queryFn: async () => {
      if (!txModal) return [];
      if (HAS_BACKEND_SESSION) return listAdminUserTransactions(txModal.id);
      const { data } = await supabase
        .from("gamification_transactions")
        .select("*")
        .eq("user_id", txModal.id)
        .order("created_at", { ascending: false })
        .limit(30);
      return (data || []) as Transaction[];
    },
    enabled: !!txModal,
  });

  // Role change state
  const [roleModal, setRoleModal] = useState<{ user: AdminUser; newRole: string } | null>(null);
  const [roleReason, setRoleReason] = useState("");

  // Mutations
  const updateRole = useMutation({
    mutationFn: async ({ userId, role, reason }: { userId: string; role: string; reason?: string }) => {
      if (HAS_BACKEND_SESSION) return setAdminUserRole(userId, role);
      const { data, error } = await supabase.rpc("admin_update_user_role" as any, {
        p_user_id: userId, p_new_role: role, p_reason: reason || null
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-users"] }); 
      toast.success("Rol actualizado correctamente"); 
      setRoleModal(null);
      setRoleReason("");
    },
    onError: (e: Error) => toast.error("Error al actualizar rol", { description: e.message }),
  });

  const toggleSuspend = useMutation({
    mutationFn: async ({ userId, suspended, reason }: { userId: string; suspended: boolean; reason?: string }) => {
      if (HAS_BACKEND_SESSION) return setAdminUserSuspended(userId, suspended, reason);
      const { data, error } = await supabase.rpc("admin_toggle_user_suspended" as any, {
        p_user_id: userId, p_suspended: suspended, p_reason: reason || null
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(vars.suspended ? "Usuario suspendido" : "Usuario reactivado");
      setSuspendModal(null);
      setSuspendReason("");
    },
    onError: (e: Error) => toast.error("Error al cambiar estado", { description: e.message }),
  });

  const awardXp = useMutation({
    mutationFn: async ({ userId, xp, coins, reason }: { userId: string; xp: number; coins: number; reason: string }) => {
      if (HAS_BACKEND_SESSION) return adjustAdminUserXp(userId, xp, coins, reason);
      const { data, error } = await supabase.rpc("admin_award_xp_to_user" as any, {
        p_user_id: userId,
        p_xp_amount: xp,
        p_coin_amount: coins,
        p_reason: reason || "Admin adjustment",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("XP otorgado correctamente");
      setXpModal(null);
      setXpAmount("50");
      setCoinAmount("0");
      setXpReason("");
    },
    onError: (e: Error) => toast.error("Error al otorgar XP", { description: e.message }),
  });

  // Filter + search
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "active" && !u.is_suspended) ||
      (filterStatus === "suspended" && u.is_suspended);
    return matchSearch && matchRole && matchStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    suspended: users.filter(u => u.is_suspended).length,
    partners: users.filter(u => u.role === "partner").length,
    newToday: users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length,
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="space-y-5">
      {/* CRM User Intelligence Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: Users,     label: "Usuarios Totales", value: stats.total,                 sub: "Registrados", color: "text-primary", bg: "bg-primary/10" },
          { icon: UserCheck, label: "Activos en Plataforma", value: stats.total - stats.suspended, sub: "Sin restricciones", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: UserX,     label: "Cuentas Suspendidas", value: stats.suspended,          sub: "Por moderación", color: "text-rose-500", bg: "bg-rose-500/10" },
          { icon: Crown,     label: "Socios / Partners", value: stats.partners,             sub: "Operadores RNT", color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Shield,    label: "Equipo Staff & Admin", value: stats.admins,            sub: "Permisos elevados", color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map(s => (
          <Card key={s.label} className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-border transition-all">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight text-foreground">{s.value}</p>
                <p className="text-2xs font-medium text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CRM Toolbar with soft lines and clean filters */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between p-3 bg-card/60 backdrop-blur-xs rounded-xl border border-border/60 shadow-xs">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          <div className="relative min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8.5 text-xs bg-background/80 rounded-lg border-border/60"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-36 h-8.5 text-xs rounded-lg border-border/60 bg-background/80">
              <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="user">Usuario Regular</SelectItem>
              <SelectItem value="partner">Partner / Operador</SelectItem>
              <SelectItem value="editor">Editor de Contenido</SelectItem>
              <SelectItem value="moderator">Moderador UGC</SelectItem>
              <SelectItem value="admin">Administrador Total</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-8.5 text-xs rounded-lg border-border/60 bg-background/80">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="suspended">Suspendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-2xs font-mono py-1 px-2 rounded-lg border-border/60 bg-muted/40">
            {filtered.length} {filtered.length === 1 ? "usuario" : "usuarios"}
          </Badge>
        </div>
      </div>

      {/* CRM Users Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <ScrollArea className="w-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-2xs">
                <th className="text-left p-3 pl-4 font-semibold text-foreground/80">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("display_name")}>
                    Usuario <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">Rol</th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("total_xp")}>
                    XP <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">Nivel</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Racha</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("created_at")}>
                    Registro <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-3 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-3"><Skeleton className="h-5 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : filtered.map(user => {
                    const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                    return (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2">
                            {user.avatar_url
                              ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                                  {(user.display_name || "U")[0].toUpperCase()}
                                </div>
                            }
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate max-w-[140px]">
                                {user.display_name || "Sin nombre"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={`gap-1 text-xs border ${roleCfg.color}`}>
                            {roleCfg.icon} {roleCfg.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-primary">{user.total_xp.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">Nv {user.current_level}</Badge>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-orange-500 font-medium">
                            <Flame className="h-3 w-3" /> {user.streak_days}d
                          </span>
                        </td>
                        <td className="p-3">
                          {user.is_suspended
                            ? <Badge className="bg-red-500/10 text-red-600 border-red-200 text-xs gap-1 border">
                                <Ban className="h-3 w-3" /> Suspendido
                              </Badge>
                            : <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs gap-1 border">
                                <CheckCircle2 className="h-3 w-3" /> Activo
                              </Badge>
                          }
                        </td>
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1">
                                Acciones <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 z-50">
                              <DropdownMenuItem onClick={() => setTxModal(user)}>
                                <Eye className="h-4 w-4 mr-2" /> Ver historial
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setXpModal(user); }}>
                                <Zap className="h-4 w-4 mr-2" /> Otorgar XP/Monedas
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setRoleModal({ user, newRole: "user" })} disabled={user.role === "user"}>
                                <Users className="h-4 w-4 mr-2" /> Rol: Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRoleModal({ user, newRole: "editor" })} disabled={user.role === "editor"}>
                                <TrendingUp className="h-4 w-4 mr-2 text-amber-500" /> Rol: Editor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRoleModal({ user, newRole: "moderator" })} disabled={user.role === "moderator"}>
                                <Star className="h-4 w-4 mr-2" /> Rol: Moderador
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRoleModal({ user, newRole: "partner" })} disabled={user.role === "partner"}>
                                <Crown className="h-4 w-4 mr-2" /> Rol: Partner
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRoleModal({ user, newRole: "admin" })} disabled={user.role === "admin"}>
                                <Shield className="h-4 w-4 mr-2" /> Rol: Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.is_suspended
                                ? <DropdownMenuItem className="text-emerald-600" onClick={() => toggleSuspend.mutate({ userId: user.id, suspended: false })}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Reactivar cuenta
                                  </DropdownMenuItem>
                                : <DropdownMenuItem className="text-red-600" onClick={() => setSuspendModal(user)}>
                                    <Ban className="h-4 w-4 mr-2" /> Suspender cuenta
                                  </DropdownMenuItem>
                              }
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
              }
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    No se encontraron usuarios con esos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* XP Modal */}
      <Dialog open={!!xpModal} onOpenChange={open => !open && setXpModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Otorgar XP / Monedas
            </DialogTitle>
          </DialogHeader>
          {xpModal && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="font-medium">{xpModal.display_name || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">{xpModal.email}</p>
                <p className="text-xs text-primary mt-1">{xpModal.total_xp.toLocaleString()} XP actuales · {xpModal.coins} monedas</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block">XP (puede ser negativo)</Label>
                  <Input
                    type="number"
                    value={xpAmount}
                    onChange={e => setXpAmount(e.target.value)}
                    placeholder="50"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[25, 50, 100, 200, -50].map(v => (
                      <button key={v} onClick={() => setXpAmount(String(v))}
                        className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                        {v > 0 ? `+${v}` : v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Monedas</Label>
                  <Input
                    type="number"
                    value={coinAmount}
                    onChange={e => setCoinAmount(e.target.value)}
                    placeholder="0"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[10, 25, 50, 100, -25].map(v => (
                      <button key={v} onClick={() => setCoinAmount(String(v))}
                        className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                        {v > 0 ? `+${v}` : v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Razón / Nota</Label>
                <Input
                  value={xpReason}
                  onChange={e => setXpReason(e.target.value)}
                  placeholder="Ej: Corrección de error, Bono especial..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setXpModal(null)}>Cancelar</Button>
            <Button
              onClick={() => xpModal && awardXp.mutate({
                userId: xpModal.id,
                xp: parseInt(xpAmount) || 0,
                coins: parseInt(coinAmount) || 0,
                reason: xpReason,
              })}
              disabled={awardXp.isPending}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {awardXp.isPending ? "Otorgando..." : "Aplicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Modal */}
      <Dialog open={!!roleModal} onOpenChange={open => !open && setRoleModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Confirmar cambio de rol
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Estás a punto de cambiar el rol del usuario <strong className="text-foreground">{roleModal?.user.display_name || roleModal?.user.email}</strong> de <Badge variant="outline">{roleModal?.user.role}</Badge> a <Badge className="bg-primary text-primary-foreground">{roleModal?.newRole}</Badge>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="role-reason" className="text-xs font-semibold">Motivo del cambio de rol (obligatorio para auditoría)</Label>
              <Textarea
                id="role-reason"
                placeholder="Indica la razón formal o ticket para este cambio de rol..."
                value={roleReason}
                onChange={e => setRoleReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModal(null)}>Cancelar</Button>
            <Button
              disabled={!roleReason.trim() || updateRole.isPending}
              onClick={() => roleModal && updateRole.mutate({ userId: roleModal.user.id, role: roleModal.newRole, reason: roleReason })}
            >
              {updateRole.isPending ? "Actualizando..." : "Confirmar Cambio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={!!suspendModal} onOpenChange={open => !open && setSuspendModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" /> Suspender cuenta
            </DialogTitle>
          </DialogHeader>
          {suspendModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de suspender a <strong>{suspendModal.display_name || suspendModal.email}</strong>?
                El usuario no podrá iniciar sesión hasta que sea reactivado.
              </p>
              <div>
                <Label className="text-sm mb-1.5 block">Razón de suspensión (opcional)</Label>
                <Textarea
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  placeholder="Ej: Incumplimiento de términos de uso..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendModal(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => suspendModal && toggleSuspend.mutate({ userId: suspendModal.id, suspended: true, reason: suspendReason })}
              disabled={toggleSuspend.isPending}
            >
              {toggleSuspend.isPending ? "Suspendiendo..." : "Confirmar suspensión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      <Dialog open={!!txModal} onOpenChange={open => !open && setTxModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Historial de {txModal?.display_name || "usuario"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "XP Total", value: txModal?.total_xp.toLocaleString(), color: "text-primary" },
              { label: "Monedas", value: txModal?.coins, color: "text-amber-500" },
              { label: "Misiones", value: txModal?.total_missions_completed, color: "text-emerald-500" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50 border border-border">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <ScrollArea className="h-72">
            {loadingTx
              ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
              : userTxs.length === 0
                ? <p className="text-center text-muted-foreground py-8">Sin transacciones</p>
                : <div className="space-y-2">
                    {userTxs.map(tx => (
                      <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.transaction_type === "earn" ? "bg-emerald-500" : "bg-red-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{tx.description || "Transacción"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("es-DO")}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {tx.xp_amount !== null && tx.xp_amount !== 0 && (
                            <p className={`text-sm font-bold ${tx.xp_amount > 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {tx.xp_amount > 0 ? "+" : ""}{tx.xp_amount} XP
                            </p>
                          )}
                          {tx.coin_amount !== null && tx.coin_amount !== 0 && (
                            <p className="text-xs text-amber-500">{tx.coin_amount > 0 ? "+" : ""}{tx.coin_amount} 🪙</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
