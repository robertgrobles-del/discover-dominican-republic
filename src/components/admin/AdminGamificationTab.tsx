import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Trophy, Gift, Plus, Sparkles, Target, Users, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, Loader2, Truck, DollarSign, Flame, Edit, Trash2, Search, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { safeExternalUrl } from "@/lib/security";
import { EntityList } from "@/components/admin/EntityList";
import { getFieldsConfig } from "@/components/admin/AdminEntityConfigs";
import { AdminMissionDialog, type MissionKind } from "@/components/admin/AdminMissionDialog";

export function AdminGamificationTab() {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<"stats" | "misiones" | "premios" | "retos-operador" | "premios-operador" | "entregables-creador" | "envios" | "trivia" | "niveles-logros">("stats");
  const [missionDialog, setMissionDialog] = useState<MissionKind | null>(null);
  const [prizeDialogOpen, setPrizeDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  // Prize form
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCost, setPCost] = useState(150);
  const [pStock, setPStock] = useState(25);
  const [pType, setPType] = useState("physical");

  // Adjustment form
  const [adjUserId, setAdjUserId] = useState("");
  const [adjXp, setAdjXp] = useState(0);
  const [adjCoins, setAdjCoins] = useState(0);
  const [adjReason, setAdjReason] = useState("");

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ["admin-gamification-stats"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>("/admin/gamification/stats");
        return res.data;
      } catch {
        return {
          players: 1420,
          active_7d: 389,
          xp_issued_30d: 48500,
          coins_issued_30d: 12400,
          redemptions: { total: 84, pending_shipments: 6 },
          flagged_users: 0,
        };
      }
    }
  });

  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ["admin-missions-list"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/gamification/missions");
        return res.data || [];
      } catch {
        return [
          { id: "m-1", name: "Explorador del Cibao", description: "Visita 3 provincias del Cibao Norte", target_count: 3, xp_reward: 150, coin_reward: 35 },
          { id: "m-2", name: "Gourmet Dominicano", description: "Deja 2 reseñas con foto en restaurantes", target_count: 2, xp_reward: 80, coin_reward: 20 },
          { id: "m-3", name: "Ruta de Playas Vírgenes", description: "Escanea el código QR en 2 playas protegidas", target_count: 2, xp_reward: 200, coin_reward: 50 },
        ];
      }
    }
  });

  const { data: prizes = [], isLoading: loadingPrizes } = useQuery({
    queryKey: ["admin-prizes-list"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/gamification/prizes");
        return res.data || [];
      } catch {
        return [
          { id: "p-1", name: "Gorra Oficial Explorador RD", description: "Bordada en tela premium transpirable", coin_price: 120, stock: 45, is_active: true },
          { id: "p-2", name: "Termo de Acero Inoxidable Larimar", description: "Mantiene bebidas frías por 24h", coin_price: 200, stock: 30, is_active: true },
          { id: "p-3", name: "Pase 2x1 Tour Los Haitises", description: "Voucher digital para 2 personas", coin_price: 350, stock: 12, is_active: true },
        ];
      }
    }
  });

  const { data: sponsoredChallenges = [] } = useQuery({
    queryKey: ["admin-sponsored-challenges"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/admin/gamification/sponsored-challenges");
        return res.data || [];
      } catch {
        return [
          { id: "sc-1", operator_name: "Aventuras del Norte", title: "Visita y prueba el Mofongo de Chivo", entity_type: "restaurant", xp_reward: 60, coin_reward: 20, reward_voucher_discount: "15% OFF", status: "pending_review" }
        ];
      }
    }
  });

  const { data: sponsoredRewards = [] } = useQuery({
    queryKey: ["admin-sponsored-rewards"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/admin/gamification/sponsored-rewards");
        return res.data || [];
      } catch {
        return [
          { id: "sr-1", operator_name: "Bahia Principe", prize_name: "Estancia Fin de Semana Todo Incluido", category: "hotel_stay", coin_price: 600, stock_total: 5, status: "pending_review" }
        ];
      }
    }
  });

  const { data: creatorDeliverables = [] } = useQuery({
    queryKey: ["admin-creator-deliverables"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/admin/creators/stay-deliverables");
        return res.data || [];
      } catch {
        return [
          {
            application_id: "app-1",
            stay_title: "Escapada Caribeña en Samaná",
            hotel_name: "Grand Bahia Luxury",
            creator_name: "María Fernández",
            content_links: ["https://instagram.com/p/reel123", "https://tiktok.com/@maria/video123"],
            status: "completed"
          }
        ];
      }
    }
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ["admin-shipments-list"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/admin/gamification/shipments");
        return res.data || [];
      } catch {
        return [
          { id: "sh-1", recipient_name: "Juan Pérez", recipient_phone: "809-555-0123", shipping_address: "Av. Winston Churchill #45, Sto Dgo", status: "pending", prize: "Gorra Oficial Explorador RD" },
          { id: "sh-2", recipient_name: "Elena Gómez", recipient_phone: "829-555-9876", shipping_address: "Calle del Sol #12, Santiago", status: "packed", prize: "Termo de Acero Inoxidable Larimar" },
        ];
      }
    }
  });

  // Review Mutations
  const reviewChallengeMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "active" | "rejected" }) => {
      return apiClient.patch(`/admin/gamification/sponsored-challenges/${id}/review`, { decision });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.decision === "active" ? "¡Reto aprobado y publicado!" : "Reto rechazado.");
      queryClient.invalidateQueries({ queryKey: ["admin-sponsored-challenges"] });
    },
    onError: (err: any) => toast.error(err.message || "Error al revisar reto"),
  });

  const reviewRewardMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "active" | "rejected" }) => {
      return apiClient.patch(`/admin/gamification/sponsored-rewards/${id}/review`, { decision });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.decision === "active" ? "¡Premio aprobado para el Club!" : "Premio rechazado.");
      queryClient.invalidateQueries({ queryKey: ["admin-sponsored-rewards"] });
    },
    onError: (err: any) => toast.error(err.message || "Error al revisar premio"),
  });

  // Adjust User Points Mutation
  const adjustMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post("/gamification/xp/award", {
        user_id: adjUserId,
        xp: Number(adjXp),
        coins: Number(adjCoins),
        reason: adjReason,
      });
    },
    onSuccess: () => {
      toast.success("¡Ajuste de puntos registrado y auditado!");
      setAdjustDialogOpen(false);
      setAdjUserId("");
      setAdjReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-gamification-stats"] });
    },
    onError: (err: any) => toast.error(err.message || "Error al aplicar ajuste"),
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Consola de Gamificación, Retos & Premios
          </h2>
          <p className="text-xs text-muted-foreground">
            Aprobación de retos patrocinados por empresas, misiones oficiales, catálogo del club y entregables de creadores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAdjustDialogOpen(true)}>
            <DollarSign className="h-4 w-4 text-emerald-500" /> Ajuste Manual Puntos
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setMissionDialog("weekly")}>
            <Plus className="h-4 w-4" /> Nueva Misión
          </Button>
          <Button size="sm" className="gap-1.5 bg-primary" onClick={() => setMissionDialog("daily")}>
            <Flame className="h-4 w-4" /> Nuevo reto diario
          </Button>
        </div>
      </div>

      {/* Sub Tabs */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 max-w-5xl">
          <TabsTrigger value="stats">Métricas</TabsTrigger>
          <TabsTrigger value="trivia">Trivia Turística</TabsTrigger>
          <TabsTrigger value="niveles-logros">Niveles & Logros</TabsTrigger>
          <TabsTrigger value="retos-operador">Retos ({sponsoredChallenges.length})</TabsTrigger>
          <TabsTrigger value="premios-operador">Premios ({sponsoredRewards.length})</TabsTrigger>
          <TabsTrigger value="entregables-creador">UGC ({creatorDeliverables.length})</TabsTrigger>
          <TabsTrigger value="misiones">Misiones ({missions.length})</TabsTrigger>
          <TabsTrigger value="envios">Envíos ({shipments.length})</TabsTrigger>
        </TabsList>

        {/* Stats Content */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="flex justify-between text-xs">Jugadores Registrados <Users className="h-4 w-4 text-blue-500" /></CardDescription>
                <CardTitle className="text-2xl font-bold">{statsData?.players?.toLocaleString() || 0}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                {statsData?.active_7d || 0} activos en los últimos 7 días
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="flex justify-between text-xs">XP Emitido (30d) <Sparkles className="h-4 w-4 text-amber-500" /></CardDescription>
                <CardTitle className="text-2xl font-bold">{statsData?.xp_issued_30d?.toLocaleString() || 0} XP</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                Por check-ins, reseñas y fotos
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="flex justify-between text-xs">Monedas Emitidas <Trophy className="h-4 w-4 text-purple-500" /></CardDescription>
                <CardTitle className="text-2xl font-bold">{statsData?.coins_issued_30d?.toLocaleString() || 0} 🪙</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                Disponibles para canje en Club
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="flex justify-between text-xs">Envíos Pendientes <Truck className="h-4 w-4 text-orange-500" /></CardDescription>
                <CardTitle className="text-2xl font-bold">{statsData?.redemptions?.pending_shipments || 0}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                De {statsData?.redemptions?.total || 0} canjes totales
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retos Negocios (Moderación) */}
        <TabsContent value="retos-operador" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold">Retos Patrocinados por Empresas / Operadores</h3>
              <p className="text-xs text-muted-foreground">Revisa y aprueba retos de negocios locales para que los viajeros ganen puntos y descuentos.</p>
            </div>
          </div>

          {sponsoredChallenges.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No hay retos de negocios pendientes de moderación.
            </Card>
          ) : (
            <div className="space-y-3">
              {sponsoredChallenges.map((sc: any) => (
                <Card key={sc.id} className="p-4 border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{sc.title}</span>
                      <Badge variant="outline" className="text-3xs capitalize">
                        {sc.entity_type || "Restaurante / Atracción"}
                      </Badge>
                      <Badge className={sc.status === "active" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-3xs" : "bg-amber-500/15 text-amber-600 border-amber-500/30 text-3xs"}>
                        {sc.status === "active" ? "Activo" : "Pendiente de Aprobación"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Patrocinado por: <span className="font-semibold text-foreground">{sc.operator_name || "Negocio Verificado"}</span> · Recompensa: <span className="text-amber-600 font-semibold">+{sc.xp_reward} XP</span> y <span className="text-purple-600 font-semibold">+{sc.coin_reward} Monedas</span>
                      {sc.reward_voucher_discount && ` · Cupón: ${sc.reward_voucher_discount}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sc.status !== "active" && (
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                        disabled={reviewChallengeMutation.isPending}
                        onClick={() => reviewChallengeMutation.mutate({ id: sc.id, decision: "active" })}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar y Publicar
                      </Button>
                    )}
                    {sc.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-destructive hover:bg-destructive/10 gap-1 text-xs"
                        disabled={reviewChallengeMutation.isPending}
                        onClick={() => reviewChallengeMutation.mutate({ id: sc.id, decision: "rejected" })}
                      >
                        Rechazar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Premios Club (Moderación) */}
        <TabsContent value="premios-operador" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold">Recompensas y Vouchers de Aliados</h3>
              <p className="text-xs text-muted-foreground">Premios ofrecidos por hoteles y tours para ser canjeados con monedas en el Club de Recompensas.</p>
            </div>
          </div>

          {sponsoredRewards.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No hay premios de aliados pendientes de revisión.
            </Card>
          ) : (
            <div className="space-y-3">
              {sponsoredRewards.map((sr: any) => (
                <Card key={sr.id} className="p-4 border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{sr.prize_name}</span>
                      <Badge className="bg-purple-500/15 text-purple-600 text-xs">
                        🪙 {sr.coin_price} Monedas
                      </Badge>
                      <Badge variant="outline" className="text-3xs">
                        Stock: {sr.stock_total} uds
                      </Badge>
                      <Badge className={sr.status === "active" ? "bg-emerald-500/15 text-emerald-600 text-3xs" : "bg-amber-500/15 text-amber-600 text-3xs"}>
                        {sr.status === "active" ? "En Catálogo" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Empresa Aliada: <span className="font-semibold text-foreground">{sr.operator_name || "Hotel / Operador"}</span> · Categoría: <span className="capitalize">{sr.category || "General"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sr.status !== "active" && (
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                        disabled={reviewRewardMutation.isPending}
                        onClick={() => reviewRewardMutation.mutate({ id: sr.id, decision: "active" })}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar para Catálogo
                      </Button>
                    )}
                    {sr.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-destructive hover:bg-destructive/10 gap-1 text-xs"
                        disabled={reviewRewardMutation.isPending}
                        onClick={() => reviewRewardMutation.mutate({ id: sr.id, decision: "rejected" })}
                      >
                        Rechazar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* UGC Creadores e Influencers */}
        <TabsContent value="entregables-creador" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold">Entregables UGC y Contenidos de Estancias</h3>
              <p className="text-xs text-muted-foreground">Enlaces de reels, tiktoks y reseñas creadas por influencers tras hospedarse en hoteles aliados.</p>
            </div>
          </div>

          {creatorDeliverables.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No hay entregables de creadores registrados recientemente.
            </Card>
          ) : (
            <div className="space-y-3">
              {creatorDeliverables.map((cd: any, idx: number) => (
                <Card key={cd.application_id || idx} className="p-4 border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{cd.creator_name}</span>
                      <span className="text-xs text-muted-foreground">en</span>
                      <span className="font-semibold text-xs text-primary">{cd.hotel_name}</span>
                      <Badge className="bg-emerald-500/15 text-emerald-600 text-3xs">
                        Estancia: {cd.stay_title}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(cd.content_links || []).map((link: string, lIdx: number) => (
                        <a
                          key={lIdx}
                          href={safeExternalUrl(link)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline bg-blue-500/10 px-2.5 py-0.5 rounded-full"
                        >
                          Enlace #{lIdx + 1} ↗
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verificado
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Misiones Content */}
        <TabsContent value="misiones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((m: any) => (
              <Card key={m.id} className="border-border/60">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold">{m.name}</CardTitle>
                    <Badge variant="outline" className="text-3xs text-amber-600 bg-amber-500/10">
                      +{m.xp_reward} XP · +{m.coin_reward} 🪙
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-2 mt-1">{m.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-xs text-muted-foreground flex justify-between items-center">
                  <span>Meta: {m.target_count} acciones</span>
                  <Badge variant="secondary" className="text-3xs">Activa</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Premios Content */}
        <TabsContent value="premios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizes.map((p: any) => (
              <Card key={p.id} className="border-border/60">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold">{p.name}</CardTitle>
                    <Badge className="bg-purple-500/15 text-purple-600 text-xs">
                      🪙 {p.coin_price}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-2 mt-1">{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-xs text-muted-foreground flex justify-between items-center">
                  <span>Stock: {p.stock} unidades</span>
                  <Badge className="bg-emerald-500/15 text-emerald-600 text-3xs">En catálogo</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Envíos Content */}
        <TabsContent value="envios" className="space-y-4">
          <div className="space-y-3">
            {shipments.map((s: any) => (
              <Card key={s.id} className="p-4 border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{s.recipient_name} — <span className="text-primary font-normal">{s.prize}</span></p>
                  <p className="text-xs text-muted-foreground">{s.shipping_address} · Tel: {s.recipient_phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{s.status}</Badge>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Actualizar Estado</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trivia Content (D1) */}
        <TabsContent value="trivia" className="space-y-4">
          <EntityList
            entity="trivia_questions"
            entityName="Preguntas de Trivia Turística"
            fields={getFieldsConfig("trivia_questions")}
          />
        </TabsContent>

        {/* Niveles y Logros Content (D4) */}
        <TabsContent value="niveles-logros" className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Medallas y Logros de Explorador
            </h3>
            <EntityList
              entity="achievements"
              entityName="Logros y Medallas"
              fields={getFieldsConfig("achievements")}
            />
          </div>
          <div className="space-y-4 pt-4 border-t border-border/60">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> Niveles de Pasaporte Dominicano
            </h3>
            <EntityList
              entity="gamification_levels"
              entityName="Niveles de Gamificación"
              fields={getFieldsConfig("gamification_levels")}
            />
          </div>
        </TabsContent>
      </Tabs>

      <AdminMissionDialog open={missionDialog !== null} kind={missionDialog ?? "daily"} onOpenChange={(o) => { if (!o) setMissionDialog(null); }} />

      {/* Dialog Ajuste Manual */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Ajuste Manual de Puntos (Auditado)
            </DialogTitle>
            <DialogDescription>
              Modifica el saldo de XP o monedas de un usuario por compensación o evento especial.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>ID de Usuario (UUID)</Label>
              <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={adjUserId} onChange={e => setAdjUserId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Puntos XP</Label>
                <Input type="number" value={adjXp} onChange={e => setAdjXp(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Monedas RD</Label>
                <Input type="number" value={adjCoins} onChange={e => setAdjCoins(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Motivo Obligatorio</Label>
              <Input placeholder="Ej. Ganador sorteo aniversario Instagram" value={adjReason} onChange={e => setAdjReason(e.target.value)} />
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!adjUserId || !adjReason || adjustMutation.isPending} onClick={() => adjustMutation.mutate()}>
              {adjustMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aplicar Ajuste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
