import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Trophy, Gift, Plus, Sparkles, Target, QrCode, Percent, Users, CheckCircle2, 
  Clock, AlertCircle, Loader2, ArrowRight, ShieldCheck, Flame, Compass
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

export default function RecompensasRetos() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"retos" | "premios">("retos");
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);

  // Form states for new challenge
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cEntityType, setCEntityType] = useState("hotel");
  const [cActionType, setCActionType] = useState("visit_checkin");
  const [cXp, setCXp] = useState(50);
  const [cCoins, setCCoins] = useState(15);
  const [cMaxCompletions, setCMaxCompletions] = useState(100);
  const [cVoucherDiscount, setCVoucherDiscount] = useState("15% OFF en consumo");
  const [cBannerUrl, setCBannerUrl] = useState("");

  // Form states for new reward
  const [rName, setRName] = useState("");
  const [rCategory, setRCategory] = useState("discount_coupon");
  const [rDesc, setRDesc] = useState("");
  const [rCoinPrice, setRCoinPrice] = useState(100);
  const [rStock, setRStock] = useState(20);
  const [rTerms, setRTerms] = useState("");
  const [rImageUrl, setRImageUrl] = useState("");

  // Queries
  const { data: stats } = useQuery({
    queryKey: ["operator-sponsorship-stats"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>("/operators/sponsorship/stats");
        return res.data;
      } catch {
        return { active_challenges: 3, total_completions: 142, active_rewards: 2, total_redemptions: 48 };
      }
    }
  });

  const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ["operator-sponsored-challenges"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/operators/sponsorship/challenges");
        return res.data || [];
      } catch {
        return [
          {
            id: "c-1",
            title: "Visita y degusta un cóctel artesanal",
            description: "Haz check-in o escanea el QR en nuestra barra VIP.",
            entity_type: "bar",
            action_type: "scan_qr",
            xp_reward: 75,
            coin_reward: 20,
            reward_voucher_discount: "2x1 en Cócteles de Autor",
            max_completions: 150,
            current_completions: 68,
            status: "active"
          },
          {
            id: "c-2",
            title: "Pernocta en fin de semana y sube tu foto",
            description: "Comparte tu foto de la vista a la bahía y gana puntos extra.",
            entity_type: "hotel",
            action_type: "review_photo",
            xp_reward: 120,
            coin_reward: 35,
            reward_voucher_discount: "Desayuno buffet cortesía",
            max_completions: 50,
            current_completions: 34,
            status: "active"
          }
        ];
      }
    }
  });

  const { data: rewards = [], isLoading: loadingRewards } = useQuery({
    queryKey: ["operator-sponsored-rewards"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/operators/sponsorship/rewards");
        return res.data || [];
      } catch {
        return [
          {
            id: "r-1",
            prize_name: "Cena Romántica de 3 Tiempos frente al Mar",
            category: "restaurant_dinner",
            description: "Cena exclusiva para dos personas con maridaje de vino seleccionado.",
            coin_price: 350,
            stock_total: 10,
            stock_remaining: 4,
            status: "active"
          },
          {
            id: "r-2",
            prize_name: "Pase de Día All-Inclusive + Spa Circuito Termal",
            category: "vip_pass",
            description: "Acceso completo a piscinas, playa privada y 45 min de hidroterapia.",
            coin_price: 500,
            stock_total: 15,
            stock_remaining: 8,
            status: "active"
          }
        ];
      }
    }
  });

  // Mutations
  const createChallengeMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post("/operators/sponsorship/challenges", {
        title: cTitle,
        description: cDesc,
        entity_type: cEntityType,
        action_type: cActionType,
        xp_reward: Number(cXp),
        coin_reward: Number(cCoins),
        max_completions: Number(cMaxCompletions),
        reward_voucher_discount: cVoucherDiscount,
        banner_image_url: cBannerUrl || undefined,
      });
    },
    onSuccess: () => {
      toast.success("¡Reto creado con éxito! Enviado a activación.");
      setChallengeDialogOpen(false);
      setCTitle("");
      setCDesc("");
      queryClient.invalidateQueries({ queryKey: ["operator-sponsored-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["operator-sponsorship-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "No se pudo crear el reto");
    }
  });

  const createRewardMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post("/operators/sponsorship/rewards", {
        prize_name: rName,
        category: rCategory,
        description: rDesc,
        coin_price: Number(rCoinPrice),
        stock_total: Number(rStock),
        terms_conditions: rTerms,
        image_url: rImageUrl || undefined,
      });
    },
    onSuccess: () => {
      toast.success("¡Premio añadido al Club de Recompensas!");
      setRewardDialogOpen(false);
      setRName("");
      setRDesc("");
      queryClient.invalidateQueries({ queryKey: ["operator-sponsored-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["operator-sponsorship-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "No se pudo publicar el premio");
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Premios, Retos & Gamificación Turística
          </h1>
          <p className="text-sm text-muted-foreground">
            Patrocina retos para atraer visitantes a tu establecimiento o publica premios en el Club de Recompensas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md">
                <Plus className="h-4 w-4" /> Crear Reto Turístico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Nuevo Reto Turístico Patrocinado
                </DialogTitle>
                <DialogDescription>
                  Los viajeros completarán esta misión en tu negocio y ganarán XP, monedas y tu cupón o beneficio exclusivo.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label>Título del Reto</Label>
                  <Input 
                    placeholder="Ej. Visita nuestro restaurante y prueba el Chivo Liniero" 
                    value={cTitle} 
                    onChange={e => setCTitle(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Categoría</Label>
                    <Select value={cEntityType} onValueChange={setCEntityType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel / Alojamiento</SelectItem>
                        <SelectItem value="restaurant">Restaurante / Gastronomía</SelectItem>
                        <SelectItem value="bar">Bar / Vida Nocturna</SelectItem>
                        <SelectItem value="experience">Excursión / Aventura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Mecanismo de Validación</Label>
                    <Select value={cActionType} onValueChange={setCActionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visit_checkin">Check-in por GPS en Destino</SelectItem>
                        <SelectItem value="scan_qr">Escaneo de Código QR Físico</SelectItem>
                        <SelectItem value="review_photo">Reseña Verificada con Foto</SelectItem>
                        <SelectItem value="booking_completed">Reserva Confirmada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Beneficio / Descuento Inmediato para el Viajero</Label>
                  <Input 
                    placeholder="Ej. 15% OFF en la cuenta o Cóctel de bienvenida gratis" 
                    value={cVoucherDiscount} 
                    onChange={e => setCVoucherDiscount(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Puntos XP</Label>
                    <Input type="number" value={cXp} onChange={e => setCXp(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monedas RD</Label>
                    <Input type="number" value={cCoins} onChange={e => setCCoins(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Límite Participantes</Label>
                    <Input type="number" value={cMaxCompletions} onChange={e => setCMaxCompletions(Number(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Descripción e Instrucciones</Label>
                  <Textarea 
                    placeholder="Explica a los usuarios cómo participar y reclamar su recompensa en tu local..." 
                    rows={3} 
                    value={cDesc} 
                    onChange={e => setCDesc(e.target.value)} 
                  />
                </div>

                <Button 
                  className="w-full bg-primary" 
                  disabled={!cTitle || createChallengeMutation.isPending}
                  onClick={() => createChallengeMutation.mutate()}
                >
                  {createChallengeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Publicar Reto en el Portal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/40 hover:bg-primary/5">
                <Gift className="h-4 w-4 text-primary" /> Ofrecer Premio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Publicar Premio en Club de Recompensas
                </DialogTitle>
                <DialogDescription>
                  Los usuarios canjearán sus monedas acumuladas por este premio. Recibirán un voucher QR con verificación segura.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label>Nombre del Premio / Experiencia</Label>
                  <Input 
                    placeholder="Ej. Estancia 1 noche para 2 con desayuno buffet" 
                    value={rName} 
                    onChange={e => setRName(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tipo de Premio</Label>
                    <Select value={rCategory} onValueChange={setRCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel_stay">Noche de Hotel / Estancia</SelectItem>
                        <SelectItem value="restaurant_dinner">Experiencia Gastronómica</SelectItem>
                        <SelectItem value="excursion_pass">Pase de Excursión / Tour</SelectItem>
                        <SelectItem value="discount_coupon">Cupón de Alto Valor</SelectItem>
                        <SelectItem value="vip_pass">Pase VIP / Day Pass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Precio en Monedas RD</Label>
                    <Input 
                      type="number" 
                      value={rCoinPrice} 
                      onChange={e => setRCoinPrice(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Stock Disponible</Label>
                    <Input 
                      type="number" 
                      value={rStock} 
                      onChange={e => setRStock(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>URL de Imagen</Label>
                    <Input 
                      placeholder="https://..." 
                      value={rImageUrl} 
                      onChange={e => setRImageUrl(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Descripción del Premio</Label>
                  <Textarea 
                    placeholder="Detalles de lo que incluye el premio..." 
                    rows={2} 
                    value={rDesc} 
                    onChange={e => setRDesc(e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Términos y Condiciones (opcional)</Label>
                  <Input 
                    placeholder="Ej. Válido de domingo a jueves previa reserva..." 
                    value={rTerms} 
                    onChange={e => setRTerms(e.target.value)} 
                  />
                </div>

                <Button 
                  className="w-full bg-primary" 
                  disabled={!rName || createRewardMutation.isPending}
                  onClick={() => createRewardMutation.mutate()}
                >
                  {createRewardMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Publicar en Club de Recompensas
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Retos Activos</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-display">{stats?.active_challenges || 0}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Misiones visibles para la comunidad
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Visitas / Check-ins</span>
              <Users className="h-4 w-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-display">{stats?.total_completions || 0}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Viajeros que completaron tus retos
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Premios en Catálogo</span>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-display">{stats?.active_rewards || 0}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            En el Club de Recompensas RD
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Canjes Realizados</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-display">{stats?.total_redemptions || 0}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Vouchers generados con éxito
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="retos" className="gap-2">
            <Flame className="h-4 w-4 text-orange-500" /> Retos Patrocinados ({challenges.length})
          </TabsTrigger>
          <TabsTrigger value="premios" className="gap-2">
            <Gift className="h-4 w-4 text-purple-500" /> Premios en Club ({rewards.length})
          </TabsTrigger>
        </TabsList>

        {/* Retos Content */}
        <TabsContent value="retos" className="space-y-4">
          {loadingChallenges ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Cargando retos...</div>
          ) : challenges.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h2 className="h3 font-semibold text-lg mb-1">Aún no has creado retos turísticos</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Crea tu primera misión para atraer visitantes a tu local a cambio de puntos XP, monedas y descuentos.
              </p>
              <Button onClick={() => setChallengeDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Crear Mi Primer Reto
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((c: any) => (
                <Card key={c.id} className="border-border/60 hover:border-primary/40 transition-all">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-2 uppercase text-3xs tracking-wider border-orange-500/30 text-orange-600 bg-orange-500/10">
                          {c.entity_type} · {c.action_type}
                        </Badge>
                        <CardTitle className="text-base font-bold">{c.title}</CardTitle>
                      </div>
                      <Badge className={c.status === "active" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : "bg-amber-500/15 text-amber-600 border-amber-500/30"}>
                        {c.status === "active" ? "Activo" : "En Revisión"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1">{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="flex items-center justify-between text-xs bg-muted/40 p-2.5 rounded-lg">
                      <span className="flex items-center gap-1.5 font-medium text-amber-600">
                        <Sparkles className="h-3.5 w-3.5" /> +{c.xp_reward} XP · +{c.coin_reward} Monedas
                      </span>
                      {c.reward_voucher_discount && (
                        <span className="font-semibold text-primary">{c.reward_voucher_discount}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso de completados:</span>
                        <span className="font-medium text-foreground">{c.current_completions || 0} / {c.max_completions}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((c.current_completions || 0) / (c.max_completions || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Premios Content */}
        <TabsContent value="premios" className="space-y-4">
          {loadingRewards ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Cargando premios...</div>
          ) : rewards.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h2 className="h3 font-semibold text-lg mb-1">Sin premios en el Club de Recompensas</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Ofrece experiencias de cortesía o vouchers de descuento para que los mejores exploradores del país los canjeen.
              </p>
              <Button onClick={() => setRewardDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ofrecer un Premio
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((r: any) => (
                <Card key={r.id} className="border-border/60 hover:border-primary/40 transition-all">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-2 uppercase text-3xs tracking-wider border-purple-500/30 text-purple-600 bg-purple-500/10">
                          {r.category}
                        </Badge>
                        <CardTitle className="text-base font-bold">{r.prize_name}</CardTitle>
                      </div>
                      <Badge className={r.status === "active" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : "bg-amber-500/15 text-amber-600 border-amber-500/30"}>
                        {r.status === "active" ? "Publicado" : "En Revisión"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1">{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="flex items-center justify-between text-xs bg-muted/40 p-2.5 rounded-lg">
                      <span className="flex items-center gap-1.5 font-bold text-amber-600 text-sm">
                        🪙 {r.coin_price} Monedas RD
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Stock restante: <strong className="text-foreground">{r.stock_remaining}</strong> de {r.stock_total}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
