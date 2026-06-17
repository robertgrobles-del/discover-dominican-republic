import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

  // Mutations
  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase.rpc("admin_update_user_role" as any, {
        p_user_id: userId, p_new_role: role
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Rol actualizado"); },
    onError: () => toast.error("Error al actualizar rol"),
  });

  const toggleSuspend = useMutation({
    mutationFn: async ({ userId, suspended, reason }: { userId: string; suspended: boolean; reason?: string }) => {
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
    onError: () => toast.error("Error al cambiar estado"),
  });

  const awardXp = useMutation({
    mutationFn: async ({ userId, xp, coins, reason }: { userId: string; xp: number; coins: number; reason: string }) => {
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
    onError: () => toast.error("Error al otorgar XP"),
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
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: Users,     label: "Total",      value: stats.total,     color: "text-primary" },
          { icon: UserCheck, label: "Activos",     value: stats.total - stats.suspended, color: "text-emerald-500" },
          { icon: UserX,     label: "Suspendidos", value: stats.suspended, color: "text-red-500" },
          { icon: Crown,     label: "Partners",    value: stats.partners,  color: "text-blue-500" },
          { icon: Shield,    label: "Admins",      value: stats.admins,    color: "text-purple-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="moderator">Moderador</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground ml-auto">{filtered.length} usuarios</p>
      </div>

      {/* Table */}
      <Card>
        <ScrollArea className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 pl-4 font-medium text-muted-foreground">
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
                              <DropdownMenuItem onClick={() => updateRole.mutate({ userId: user.id, role: "user" })} disabled={user.role === "user"}>
                                <Users className="h-4 w-4 mr-2" /> Rol: Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRole.mutate({ userId: user.id, role: "moderator" })} disabled={user.role === "moderator"}>
                                <Star className="h-4 w-4 mr-2" /> Rol: Moderador
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRole.mutate({ userId: user.id, role: "partner" })} disabled={user.role === "partner"}>
                                <Crown className="h-4 w-4 mr-2" /> Rol: Partner
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRole.mutate({ userId: user.id, role: "admin" })} disabled={user.role === "admin"}>
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
      </Card>

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
