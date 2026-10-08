import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, Hotel, Users, Send, CheckCircle2, Clock, AlertCircle, 
  Loader2, Plus, ArrowRight, Instagram, Video, Eye, MessageSquare, Star, Building2, MapPin
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

export default function EstanciasCreadores() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"mis-estancias" | "directorio">("mis-estancias");
  const [stayDialogOpen, setStayDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);

  // Form states for Stay listing
  const [sHotelName, setSHotelName] = useState("");
  const [sDestination, setSDestination] = useState("");
  const [sTitle, setSTitle] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sNights, setSNights] = useState(2);
  const [sGuests, setSGuests] = useState(2);
  const [sRoomType, setSRoomType] = useState("Suite Vista al Mar");
  const [sPerks, setSPerks] = useState("Alojamiento Todo Incluido, Acceso a Spa, Crédito Gastronómico");
  const [sDeliverables, setSDeliverables] = useState("1 Reel / TikTok en alta calidad, 5 Stories etiquetando al hotel, 3 Fotos profesionales");
  const [sFollowers, setSFollowers] = useState("10k+");

  // Form states for Direct Invitation
  const [invMessage, setInvMessage] = useState("");
  const [invDates, setInvDates] = useState("");

  // Queries
  const { data: stays = [], isLoading: loadingStays } = useQuery({
    queryKey: ["operator-creator-stays"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/operators/creator-stays");
        return res.data || [];
      } catch {
        return [
          {
            id: "stay-1",
            hotel_name: "Grand Bahia Luxury Resort",
            destination: "Samaná",
            stay_title: "Experiencia Fin de Semana Tropical para Creadores de Viajes",
            stay_description: "Buscamos creadores de viajes y lifestyle para documentar nuestras nuevas villas frente al mar.",
            nights_count: 3,
            guests_allowed: 2,
            room_type: "Oceanfront Villa",
            included_perks: ["Todo Incluido Premium", "Masaje en Spa", "Tour a Cayo Levantado"],
            deliverables_required: ["2 Reels", "8 Stories", "5 Fotos en alta resolución"],
            min_followers_guideline: "15k+",
            status: "open",
            applications_count: 5,
            approved_count: 1,
          }
        ];
      }
    }
  });

  const { data: creatorDirectory = [], isLoading: loadingCreators } = useQuery({
    queryKey: ["operator-creators-directory"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/operators/creators/directory");
        return res.data || [];
      } catch {
        return [
          {
            id: "cr-1",
            name: "María Fernández",
            bio: "Creadora de contenido de viajes, playas secretas y gastronomía dominicana.",
            verified: true,
            niches: ["Turismo", "Lujo", "Gastronomía"],
            social_profiles: { instagram: "@mariaviaja", followers: "45.2k", engagement: "4.8%" },
          },
          {
            id: "cr-2",
            name: "Carlos Mendoza (Aventura RD)",
            bio: "Fotógrafo y videógrafo especializado en ecoturismo y senderismo de montaña.",
            verified: true,
            niches: ["Aventura", "Ecoturismo", "Fotografía"],
            social_profiles: { instagram: "@aventurasrd", followers: "82.5k", engagement: "6.1%" },
          }
        ];
      }
    }
  });

  // Mutations
  const createStayMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post("/operators/creator-stays", {
        hotel_name: sHotelName,
        destination: sDestination,
        stay_title: sTitle,
        stay_description: sDesc,
        nights_count: Number(sNights),
        guests_allowed: Number(sGuests),
        room_type: sRoomType,
        included_perks: sPerks.split(",").map(p => p.trim()),
        deliverables_required: sDeliverables.split(",").map(d => d.trim()),
        min_followers_guideline: sFollowers,
      });
    },
    onSuccess: () => {
      toast.success("¡Estancia publicada para creadores de contenido!");
      setStayDialogOpen(false);
      setSTitle("");
      setSDesc("");
      queryClient.invalidateQueries({ queryKey: ["operator-creator-stays"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al publicar la estancia");
    }
  });

  const sendInvitationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCreator) return;
      return apiClient.post(`/operators/creators/${selectedCreator.id}/invite-stay`, {
        hotel_name: sHotelName || "Nuestro Hotel",
        invitation_message: invMessage,
        scheduled_dates: invDates || undefined,
      });
    },
    onSuccess: () => {
      toast.success(`¡Invitación enviada con éxito a ${selectedCreator?.name}!`);
      setInviteDialogOpen(false);
      setInvMessage("");
      setSelectedCreator(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al enviar la invitación");
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Estancias & Colaboraciones con Creadores
          </h1>
          <p className="text-sm text-muted-foreground">
            Ofrece estancias en tu hotel a cambio de contenido auténtico (Reels, TikTok, fotos) o invita creadores directamente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={stayDialogOpen} onOpenChange={setStayDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Publicar Oportunidad de Estancia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-primary" />
                  Nueva Estancia para Creadores de Contenido
                </DialogTitle>
                <DialogDescription>
                  Define las noches ofrecidas, beneficios incluidos y las piezas de contenido que requerirás del influencer.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nombre del Establecimiento</Label>
                    <Input 
                      placeholder="Ej. Hotel Boutique Las Terrenas" 
                      value={sHotelName} 
                      onChange={e => setSHotelName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Destino / Ubicación</Label>
                    <Input 
                      placeholder="Ej. Samaná, Las Terrenas" 
                      value={sDestination} 
                      onChange={e => setSDestination(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Título de la Oportunidad</Label>
                  <Input 
                    placeholder="Ej. Estancia 3 Noches Todo Incluido + Contenido de Playa" 
                    value={sTitle} 
                    onChange={e => setSTitle(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Noches</Label>
                    <Input type="number" value={sNights} onChange={e => setSNights(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Acompañantes</Label>
                    <Input type="number" value={sGuests} onChange={e => setSGuests(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mín. Seguidores</Label>
                    <Input value={sFollowers} onChange={e => setSFollowers(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Tipo de Habitación / Alojamiento</Label>
                  <Input value={sRoomType} onChange={e => setSRoomType(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label>Beneficios Incluidos (separados por coma)</Label>
                  <Input 
                    value={sPerks} 
                    onChange={e => setSPerks(e.target.value)} 
                    placeholder="Todo Incluido, Spa, Excursión en lancha" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Entregables Requeridos del Creador (separados por coma)</Label>
                  <Input 
                    value={sDeliverables} 
                    onChange={e => setSDeliverables(e.target.value)} 
                    placeholder="1 Reel, 5 Stories con etiqueta, 3 Fotos en alta" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Descripción de la Experiencia</Label>
                  <Textarea 
                    rows={3} 
                    placeholder="Describe qué tipo de creador buscas y qué aspectos de tu hotel te gustaría destacar..." 
                    value={sDesc} 
                    onChange={e => setSDesc(e.target.value)} 
                  />
                </div>

                <Button 
                  className="w-full bg-primary" 
                  disabled={!sTitle || !sHotelName || createStayMutation.isPending}
                  onClick={() => createStayMutation.mutate()}
                >
                  {createStayMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Publicar Oportunidad
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="mis-estancias" className="gap-2">
            <Hotel className="h-4 w-4 text-primary" /> Mis Estancias Publicadas ({stays.length})
          </TabsTrigger>
          <TabsTrigger value="directorio" className="gap-2">
            <Users className="h-4 w-4 text-blue-500" /> Directorio de Creadores ({creatorDirectory.length})
          </TabsTrigger>
        </TabsList>

        {/* Mis Estancias Tab */}
        <TabsContent value="mis-estancias" className="space-y-4">
          {loadingStays ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Cargando estancias...</div>
          ) : stays.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-lg mb-1">Sin estancias activas para creadores</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Publica noches en tu hotel para recibir aplicaciones de creadores de contenido de turismo verificados.
              </p>
              <Button onClick={() => setStayDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Publicar Primera Estancia
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stays.map((s: any) => (
                <Card key={s.id} className="border-border/60 hover:border-primary/40 transition-all">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase border-primary/30 text-primary">
                            <MapPin className="h-3 w-3 mr-1" /> {s.destination}
                          </Badge>
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                            {s.nights_count} noches · {s.guests_allowed} personas
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold">{s.stay_title}</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">{s.hotel_name}</p>
                      </div>
                      <Badge className={s.status === "open" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}>
                        {s.status === "open" ? "Abierta" : "Cerrada"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-2">{s.stay_description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="space-y-1 text-xs bg-muted/40 p-3 rounded-lg">
                      <p className="font-semibold text-foreground">Entregables Requeridos:</p>
                      <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                        {(s.deliverables_required || []).map((d: string, idx: number) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                      <span className="text-muted-foreground">
                        Postulaciones recibidas: <strong className="text-foreground">{s.applications_count || 0}</strong>
                      </span>
                      <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
                        <Users className="h-3.5 w-3.5" /> Ver Postulaciones
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Directorio de Creadores Tab */}
        <TabsContent value="directorio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creatorDirectory.map((cr: any) => (
              <Card key={cr.id} className="border-border/60 hover:border-primary/40 transition-all">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                        {cr.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                          {cr.name}
                          {cr.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{cr.social_profiles?.instagram || "@creador"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      {cr.social_profiles?.followers || "10k+"} seguidores
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-2 line-clamp-2">{cr.bio}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(cr.niches || ["Turismo"]).map((n: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{n}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      Engagement: <strong className="text-emerald-600">{cr.social_profiles?.engagement || "4.5%"}</strong>
                    </span>
                    <Button 
                      size="sm" 
                      className="gap-1.5 h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/30" 
                      variant="outline"
                      onClick={() => {
                        setSelectedCreator(cr);
                        setInviteDialogOpen(true);
                      }}
                    >
                      <Send className="h-3.5 w-3.5" /> Invitar a Estancia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Invitar Creador Directamente */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Invitar a {selectedCreator?.name}
            </DialogTitle>
            <DialogDescription>
              Envía una invitación directa personalizada a este creador con propuesta de fechas y beneficios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label>Hotel / Alojamiento</Label>
              <Input 
                placeholder="Nombre de tu hotel" 
                value={sHotelName} 
                onChange={e => setSHotelName(e.target.value)} 
              />
            </div>

            <div className="space-y-1.5">
              <Label>Fechas Propuestas</Label>
              <Input 
                placeholder="Ej. Fin de semana del 15 al 18 de Noviembre" 
                value={invDates} 
                onChange={e => setInvDates(e.target.value)} 
              />
            </div>

            <div className="space-y-1.5">
              <Label>Mensaje de Invitación</Label>
              <Textarea 
                rows={3} 
                placeholder="Hola! Nos encanta tu contenido y nos gustaría invitarte a una estancia de 2 noches todo incluido para colaborar..." 
                value={invMessage} 
                onChange={e => setInvMessage(e.target.value)} 
              />
            </div>

            <Button 
              className="w-full bg-primary" 
              disabled={!invMessage || sendInvitationMutation.isPending}
              onClick={() => sendInvitationMutation.mutate()}
            >
              {sendInvitationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar Invitación Oficial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
