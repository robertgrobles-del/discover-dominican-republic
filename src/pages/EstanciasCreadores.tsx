import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, Hotel, MapPin, Calendar, Users, Camera, Video, Send, 
  CheckCircle2, ArrowRight, ShieldCheck, Heart, Share2, Filter, Loader2,
  Instagram, Star, Clock, Gift
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api";

export default function EstanciasCreadoresPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStay, setSelectedStay] = useState<any>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [searchDestination, setSearchDestination] = useState("");

  // Pitch Form State
  const [pitchMessage, setPitchMessage] = useState("");
  const [instagramUser, setInstagramUser] = useState("");
  const [tiktokUser, setTiktokUser] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [mediaKitUrl, setMediaKitUrl] = useState("");
  const [proposedDates, setProposedDates] = useState("");

  // Query Open Stays
  const { data: openStays = [], isLoading } = useQuery({
    queryKey: ["public-creator-stays"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any[]>("/creators/stays/open");
        return res.data || [];
      } catch {
        return [
          {
            id: "stay-1",
            hotel_name: "Grand Bahia Luxury Resort & Spa",
            destination: "Samaná",
            stay_title: "Escapada Caribeña Todo Incluido para Creadores de Viajes",
            stay_description: "Buscamos creadores apasionados por el ecoturismo y el lujo sostenible para documentar la temporada de ballenas jorobadas y nuestras nuevas Ocean Suites.",
            nights_count: 3,
            guests_allowed: 2,
            room_type: "Oceanfront Luxury Suite",
            included_perks: ["Todo Incluido Premium", "Tour de Ballenas Jorobadas", "Circuito de Spa Termal"],
            deliverables_required: ["2 Reels de alta calidad", "1 Video TikTok", "8 Stories etiquetando al hotel", "Entrega de 5 fotos RAW"],
            min_followers_guideline: "10k+",
            image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=500&fit=crop",
            operator_business_name: "Bahia Principe Hotels RD"
          },
          {
            id: "stay-2",
            hotel_name: "Eco-Lodge Montaña & Neblina",
            destination: "Jarabacoa",
            stay_title: "Experiencia Cabañas en las Nubes & Ruta del Café",
            stay_description: "Colabora con nosotros disfrutando de fogatas nocturnas, senderismo a cascadas y gastronomía orgánica en la Cordillera Central.",
            nights_count: 2,
            guests_allowed: 2,
            room_type: "Cabaña de Madera con Chimenea",
            included_perks: ["Alojamiento y Desayunos Típicos", "Tour del Café", "Paseo a Caballo"],
            deliverables_required: ["1 Reel cinemático", "5 Stories con ubicación", "Reseña detallada en blog o canal"],
            min_followers_guideline: "5k+",
            image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=500&fit=crop",
            operator_business_name: "Jarabacoa Mountain Lodges"
          },
          {
            id: "stay-3",
            hotel_name: "Boutique Colonial Heritage House",
            destination: "Santo Domingo (Zona Colonial)",
            stay_title: "Fin de Semana Histórico & Mixología Colonial",
            stay_description: "Casa colonial del siglo XVI restaurada para creadores de cultura, gastronomía y arquitectura histórica.",
            nights_count: 2,
            guests_allowed: 2,
            room_type: "Suite Virreinal",
            included_perks: ["Desayuno a la Carta", "Cata de Ron Dominicano", "Acceso Exclusivo al Rooftop"],
            deliverables_required: ["1 Reel cultural", "1 Post carrusel en Instagram", "4 Stories"],
            min_followers_guideline: "8k+",
            image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop",
            operator_business_name: "Colonial Heritage Hospitality"
          }
        ];
      }
    }
  });

  // Deliverables State
  const [deliverablesDialogOpen, setDeliverablesDialogOpen] = useState(false);
  const [deliverableLinks, setDeliverableLinks] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Query User's Applications if logged in
  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-creator-applications"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await apiClient.get<any[]>("/creators/me/stay-applications");
        return res.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // Query User's Direct Invitations if logged in
  const { data: myInvitations = [] } = useQuery({
    queryKey: ["my-creator-invitations"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await apiClient.get<any[]>("/creators/me/invitations");
        return res.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStay) return;
      return apiClient.post(`/creators/stays/${selectedStay.id}/apply`, {
        pitch_message: pitchMessage,
        social_profiles: {
          instagram: instagramUser,
          tiktok: tiktokUser,
          followers: followersCount,
          media_kit_url: mediaKitUrl || undefined,
        },
        proposed_dates: proposedDates || undefined,
      });
    },
    onSuccess: () => {
      toast.success("¡Tu postulación ha sido enviada con éxito al hotel!");
      setApplyDialogOpen(false);
      setPitchMessage("");
      setSelectedStay(null);
      queryClient.invalidateQueries({ queryKey: ["my-creator-applications"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al enviar la postulación");
    }
  });

  // Respond to Invitation Mutation
  const respondInvitationMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: "accepted" | "declined" }) => {
      return apiClient.patch(`/creators/invitations/${id}/respond`, { response });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.response === "accepted" ? "¡Invitación aceptada! El hotel se pondrá en contacto para coordinar fechas." : "Invitación rechazada.");
      queryClient.invalidateQueries({ queryKey: ["my-creator-invitations"] });
    },
    onError: (err: any) => toast.error(err.message || "Error al responder invitación"),
  });

  // Submit Deliverables Mutation
  const submitDeliverablesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAppId) return;
      const links = deliverableLinks.split("\n").map(l => l.trim()).filter(Boolean);
      return apiClient.post(`/creators/stays/${selectedAppId}/deliverables`, {
        content_links: links,
      });
    },
    onSuccess: () => {
      toast.success("¡Enlaces de contenido enviados! El equipo verificará tus publicaciones.");
      setDeliverablesDialogOpen(false);
      setDeliverableLinks("");
      setSelectedAppId(null);
      queryClient.invalidateQueries({ queryKey: ["my-creator-applications"] });
    },
    onError: (err: any) => toast.error(err.message || "Error al enviar entregables"),
  });

  const filteredStays = openStays.filter((s: any) => {
    if (!searchDestination) return true;
    const q = searchDestination.toLowerCase();
    return s.destination?.toLowerCase().includes(q) || s.hotel_name?.toLowerCase().includes(q) || s.stay_title?.toLowerCase().includes(q);
  });

  return (
    <PageTransition>
      <SEOHead 
        title="Estancias para Creadores & Influencers — Descubre RD"
        description="Aplica a estancias gratuitas en hoteles y resorts de República Dominicana a cambio de crear contenido auténtico para tu comunidad."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hero */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 max-w-5xl text-center space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Hub de Colaboraciones & Creadores
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-foreground">
              Estancias en Hoteles <span className="text-gradient">a cambio de Contenido</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conectamos hoteles, resorts y eco-lodges de República Dominicana con creadores de contenido, fotógrafos y vloggers verificados.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border/50 px-4 py-2 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Noches 100% cubiertas por el hotel
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border/50 px-4 py-2 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Acuerdos claros y sin intermediarios
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border/50 px-4 py-2 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Gana puntos XP e Insignia Verificada
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 max-w-6xl py-8 flex-1 space-y-6">
          <Tabs defaultValue="explorar" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-card border border-border p-1 rounded-xl">
                <TabsTrigger value="explorar" className="text-xs font-semibold gap-1.5">
                  <Hotel className="h-3.5 w-3.5" /> Convocatorias Abiertas ({filteredStays.length})
                </TabsTrigger>
                {user && (
                  <>
                    <TabsTrigger value="mis-postulaciones" className="text-xs font-semibold gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Mis Postulaciones ({myApplications.length})
                    </TabsTrigger>
                    <TabsTrigger value="invitaciones" className="text-xs font-semibold gap-1.5">
                      <Gift className="h-3.5 w-3.5 text-amber-500" /> Invitaciones Directas ({myInvitations.length})
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Hoteles y Resorts Verificados MITUR</span>
              </div>
            </div>

            {/* Tab: Explorar Estancias */}
            <TabsContent value="explorar" className="space-y-6">
              {/* Search bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filtrar por destino o hotel..." 
                    className="pl-9"
                    value={searchDestination}
                    onChange={e => setSearchDestination(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{filteredStays.length} estancias disponibles</span>
                </div>
              </div>

              {/* Stays Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full py-16 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    Cargando estancias abiertas...
                  </div>
                ) : filteredStays.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-muted-foreground">
                    No se encontraron estancias con ese criterio.
                  </div>
                ) : (
                  filteredStays.map((stay: any) => (
                    <Card key={stay.id} className="overflow-hidden border-border/60 hover:border-primary/50 transition-all flex flex-col group hover:shadow-lg">
                      <div className="relative h-48 w-full overflow-hidden bg-muted">
                        <img 
                          src={stay.image_url || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=500&fit=crop"} 
                          alt={stay.hotel_name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-black/70 backdrop-blur text-white border-0 text-[11px]">
                            <MapPin className="h-3 w-3 mr-1 text-primary" /> {stay.destination}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-600 text-white border-0 text-[11px] font-semibold">
                            {stay.nights_count} Noches · {stay.guests_allowed} Pers.
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="p-5 pb-2">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                          {stay.hotel_name}
                        </p>
                        <CardTitle className="text-lg font-bold line-clamp-2">{stay.stay_title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1">{stay.stay_description}</CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-foreground">Incluye: </span>
                            <span className="text-muted-foreground">{(stay.included_perks || []).slice(0, 2).join(", ")}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Requisitos: </span>
                            <span className="text-muted-foreground">{(stay.deliverables_required || []).slice(0, 2).join(" · ")}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Audiencia mín: </span>
                            <Badge variant="outline" className="text-[10px] ml-1">{stay.min_followers_guideline || "5k+"}</Badge>
                          </div>
                        </div>

                        <Button 
                          className="w-full gap-2 bg-primary hover:bg-primary/90 mt-2"
                          onClick={() => {
                            setSelectedStay(stay);
                            setApplyDialogOpen(true);
                          }}
                        >
                          <Sparkles className="h-4 w-4" /> Postular a esta Estancia
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab: Mis Postulaciones */}
            <TabsContent value="mis-postulaciones" className="space-y-4">
              {myApplications.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground space-y-2">
                  <Hotel className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold">No tienes postulaciones activas</p>
                  <p className="text-xs">Explora las convocatorias abiertas de hoteles y envía tu pitch de colaboración.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app: any) => (
                    <Card key={app.id} className="p-4 border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{app.hotel_name || "Hotel Aliado"}</span>
                          <Badge className={
                            app.status === "approved" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]" :
                            app.status === "rejected" ? "bg-rose-500/15 text-rose-600 border-rose-500/30 text-[10px]" :
                            "bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]"
                          }>
                            {app.status === "approved" ? "Aprobada 🎉" : app.status === "rejected" ? "Rechazada" : "En Revisión"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          Pitch: "{app.pitch_message}"
                        </p>
                        {app.proposed_dates && (
                          <p className="text-[11px] text-muted-foreground">Fechas propuestas: {app.proposed_dates}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === "approved" && (
                          <Button
                            size="sm"
                            className="bg-primary text-xs gap-1.5 h-8"
                            onClick={() => {
                              setSelectedAppId(app.id);
                              setDeliverablesDialogOpen(true);
                            }}
                          >
                            <Video className="h-3.5 w-3.5" /> Subir Enlaces UGC
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab: Invitaciones Directas */}
            <TabsContent value="invitaciones" className="space-y-4">
              {myInvitations.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground space-y-2">
                  <Gift className="h-8 w-8 mx-auto text-amber-500/60" />
                  <p className="font-semibold">No tienes invitaciones pendientes</p>
                  <p className="text-xs">Cuando un hotel o resort descubra tu perfil y te envíe una invitación directa, aparecerá aquí.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myInvitations.map((inv: any) => (
                    <Card key={inv.id} className="p-4 border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{inv.hotel_name}</span>
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">
                            Invitación Exclusiva
                          </Badge>
                          <Badge className={
                            inv.status === "accepted" ? "bg-emerald-500/15 text-emerald-600 text-[10px]" :
                            inv.status === "declined" ? "bg-rose-500/15 text-rose-600 text-[10px]" :
                            "bg-amber-500/15 text-amber-600 text-[10px]"
                          }>
                            {inv.status === "accepted" ? "Aceptada" : inv.status === "declined" ? "Declinada" : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          "{inv.invitation_message}"
                        </p>
                        {inv.scheduled_dates && (
                          <p className="text-[11px] text-muted-foreground">Fechas propuestas: {inv.scheduled_dates}</p>
                        )}
                      </div>

                      {inv.status === "pending" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                            disabled={respondInvitationMutation.isPending}
                            onClick={() => respondInvitationMutation.mutate({ id: inv.id, response: "accepted" })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 text-xs h-8"
                            disabled={respondInvitationMutation.isPending}
                            onClick={() => respondInvitationMutation.mutate({ id: inv.id, response: "declined" })}
                          >
                            Declinar
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Dialog de Postulación */}
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Postular a {selectedStay?.hotel_name}
              </DialogTitle>
              <DialogDescription>
                Presenta tu perfil y propuesta de contenido al equipo del hotel.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-foreground">{selectedStay?.stay_title}</p>
                <p className="text-muted-foreground">{selectedStay?.destination} · {selectedStay?.nights_count} noches para {selectedStay?.guests_allowed} personas</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Instagram Handle</Label>
                  <Input 
                    placeholder="@tuusuario" 
                    value={instagramUser} 
                    onChange={e => setInstagramUser(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>TikTok Handle (opcional)</Label>
                  <Input 
                    placeholder="@tuusuario" 
                    value={tiktokUser} 
                    onChange={e => setTiktokUser(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Seguidores Totales</Label>
                  <Input 
                    placeholder="Ej. 25k" 
                    value={followersCount} 
                    onChange={e => setFollowersCount(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Enlace a Media Kit / Portfolio</Label>
                  <Input 
                    placeholder="https://..." 
                    value={mediaKitUrl} 
                    onChange={e => setMediaKitUrl(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Fechas que te gustaría viajar</Label>
                <Input 
                  placeholder="Ej. Cualquier fin de semana de Octubre / Noviembre" 
                  value={proposedDates} 
                  onChange={e => setProposedDates(e.target.value)} 
                />
              </div>

              <div className="space-y-1.5">
                <Label>Pitch / ¿Por qué eres ideal para esta colaboración?</Label>
                <Textarea 
                  rows={3} 
                  placeholder="Cuéntale al hotel el estilo de tu contenido, tipo de audiencia y qué ideas creativas tienes para lucir sus instalaciones..." 
                  value={pitchMessage} 
                  onChange={e => setPitchMessage(e.target.value)} 
                />
              </div>

              <Button 
                className="w-full bg-primary" 
                disabled={!pitchMessage || !instagramUser || applyMutation.isPending}
                onClick={() => applyMutation.mutate()}
              >
                {applyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enviar Postulación Oficial
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Subida de Entregables UGC */}
        <Dialog open={deliverablesDialogOpen} onOpenChange={setDeliverablesDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Subir Enlaces de Contenido UGC
              </DialogTitle>
              <DialogDescription>
                Pega los enlaces directos a tus Reels, TikToks o reseñas generadas durante tu estancia.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label>Enlaces de Contenido (uno por línea)</Label>
                <Textarea
                  rows={4}
                  placeholder="https://instagram.com/reel/...\nhttps://tiktok.com/@tuusuario/video/..."
                  value={deliverableLinks}
                  onChange={e => setDeliverableLinks(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-primary"
                disabled={!deliverableLinks.trim() || submitDeliverablesMutation.isPending}
                onClick={() => submitDeliverablesMutation.mutate()}
              >
                {submitDeliverablesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmar y Enviar para Verificación
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
}
