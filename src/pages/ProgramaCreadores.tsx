import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Eye, Sparkles, DollarSign, Upload, AlertCircle, 
  ArrowRight, Video, TrendingUp, CheckCircle, Wallet, Award,
  Hotel, Users, Link2, Copy, Gift, ShieldCheck, MapPin, Star,
  Share2, ChevronRight, Check
} from "lucide-react";
import { toast } from "sonner";
import { creatorsPool, initialSponsoredOpportunities, affiliateOffers, Creator, SponsoredOpportunity } from "@/data/creatorsData";
import { PanoramaAd } from "@/components/promo";

export default function ProgramaCreadores() {
  // Dashboard & Balance States
  const [balance, setBalance] = useState(385.50);
  const [affiliateEarnings, setAffiliateEarnings] = useState(140.00);
  const [tier, setTier] = useState("Oro");
  const [affiliateCode, setAffiliateCode] = useState("CREADOR_RD2026");
  const [copiedLink, setCopiedLink] = useState(false);

  // Matchmaking & Sponsorships States
  const [opportunities, setOpportunities] = useState<SponsoredOpportunity[]>(initialSponsoredOpportunities);
  const [selectedOpp, setSelectedOpp] = useState<SponsoredOpportunity | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("paypal");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // New Video State
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDestination, setVideoDestination] = useState("Puerto Plata (POP)");
  const [isUploading, setIsUploading] = useState(false);
  const [creatorVideos, setCreatorVideos] = useState<any[]>([
    { id: "1", title: "Guía Secreta de Hoteles en Puerto Plata", dest: "Puerto Plata (POP)", views: 18400, bookings: 38, earnings: "$76.00", status: "Aprobado", date: "2026-06-01" },
    { id: "2", title: "Snorkel secreto en Las Terrenas", dest: "Samaná", views: 9450, bookings: 19, earnings: "$38.00", status: "Aprobado", date: "2026-06-10" }
  ]);

  const handleCopyAffiliate = (url: string) => {
    navigator.clipboard.writeText(`${url}${affiliateCode}`);
    setCopiedLink(true);
    toast.success("¡Enlace de afiliado con tu código copiado al portapapeles!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAssignCreatorToHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !selectedCreatorId) {
      toast.error("Por favor selecciona una oportunidad de patrocinio y un creador del pool.");
      return;
    }

    const creator = creatorsPool.find(c => c.id === selectedCreatorId);
    setIsAssigning(true);

    setTimeout(() => {
      setOpportunities(prev => prev.map(opp => {
        if (opp.id === selectedOpp.id) {
          return {
            ...opp,
            status: "Asignada",
            assignedCreatorId: selectedCreatorId
          };
        }
        return opp;
      }));

      setIsAssigning(false);
      toast.success(`¡Creador ${creator?.name} (${creator?.handle}) asignado exitosamente al hotel ${selectedOpp.hotelName} en ${selectedOpp.destination}! 🎉`);
      setSelectedOpp(null);
      setSelectedCreatorId("");
    }, 1200);
  };

  const handleUploadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newVideo = {
        id: Date.now().toString(),
        title: videoTitle,
        dest: videoDestination,
        views: 0,
        bookings: 0,
        earnings: "$0.00",
        status: "Pendiente",
        date: new Date().toISOString().split("T")[0]
      };
      setCreatorVideos([newVideo, ...creatorVideos]);
      setVideoTitle("");
      setVideoUrl("");
      toast.success("¡Contenido enviado a revisión editorial y auditoría de métricas!");
    }, 1200);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor ingresa un monto válido.");
      return;
    }
    if (amount > balance) {
      toast.error("Saldo insuficiente en tu balance.");
      return;
    }
    if (amount < 50) {
      toast.error("El retiro mínimo es de $50 USD.");
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setBalance(prev => prev - amount);
      setWithdrawAmount("");
      setWithdrawDetails("");
      toast.success(`¡Solicitud de retiro de $${amount} USD procesada! Fondos en camino en 24-48h.`);
    }, 1500);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Creadores, Influencers y Enlaces de Afiliados | Descubre RD"
        description="Monetiza tu contenido de viajes, genera ingresos con enlaces de afiliados y postúlate a estancias patrocinadas 100% gratis en hoteles de Puerto Plata, Samaná y Punta Cana."
        keywords="creadores turismo rd, influencers republica dominicana, patrocinios hoteles pop, afiliados hoteles rd, fam trips dominicana"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 py-10">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Ecosistema de Creadores & Hoteles Patrocinadores
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  Programa de Creadores & <span className="text-primary">Matchmaking de Patrocinios</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Gana por reproducciones, comisiones de afiliados y viajes patrocinados con todo incluido en los mejores hoteles del país.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Tu Código de Afiliado</p>
                  <p className="text-xs font-mono font-bold text-primary">{affiliateCode}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleCopyAffiliate("https://descubrerd.com?ref=")} className="text-xs rounded-xl h-8">
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Balance Retirable</p>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${balance.toFixed(2)} USD</h3>
                  <span className="text-[10px] text-muted-foreground">+$140.00 de afiliados</span>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Nivel de Creador</p>
                  <h3 className="text-2xl font-black text-primary mt-1 flex items-center gap-1.5">
                    <Award className="h-6 w-6 text-primary" /> {tier}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Pago: $2.00 por cada 1K vistas</span>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Estadías Patrocinadas</p>
                  <h3 className="text-2xl font-black text-foreground mt-1 flex items-center gap-1.5">
                    <Hotel className="h-6 w-6 text-amber-500" /> 3 Asignadas
                  </h3>
                  <span className="text-[10px] text-muted-foreground">POP, Samaná, Santo Domingo</span>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Pool de Creadores</p>
                  <h3 className="text-2xl font-black text-foreground mt-1 flex items-center gap-1.5">
                    <Users className="h-6 w-6 text-blue-500" /> 100+ Activos
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Verificados por MITUR & Hoteles</span>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="patrocinios" className="space-y-6">
              <TabsList className="bg-muted p-1 rounded-2xl flex flex-wrap h-auto gap-1">
                <TabsTrigger value="patrocinios" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Hotel className="h-4 w-4" /> Matchmaking Hoteles (Estadías Gratis)
                </TabsTrigger>
                <TabsTrigger value="afiliados" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Link2 className="h-4 w-4" /> Enlaces de Afiliados
                </TabsTrigger>
                <TabsTrigger value="creadores" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Users className="h-4 w-4" /> Pool de Creadores Registrados
                </TabsTrigger>
                <TabsTrigger value="videos" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Video className="h-4 w-4" /> Mis Contenidos & Vistas
                </TabsTrigger>
                <TabsTrigger value="pagos" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Wallet className="h-4 w-4" /> Retirar Fondos
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Matchmaking de Hoteles Patrocinados */}
              <TabsContent value="patrocinios" className="space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 mb-2">
                        <Gift className="h-3.5 w-3.5 mr-1" /> Sistema de Selección de Creadores para Hoteles Patrocinadores
                      </Badge>
                      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                        Estadías Todo Incluido para Creación de Contenido
                      </h2>
                      <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                        Los hoteles y resorts patrocinadores publican convocatorias (ej. Hotel en Puerto Plata todo pagado). Como administrador o establecimiento, selecciona a los influencers adecuados de nuestro pool de más de 100 creadores registrados.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opportunities Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {opportunities.map((opp) => {
                    const assignedCreator = creatorsPool.find(c => c.id === opp.assignedCreatorId);
                    return (
                      <Card key={opp.id} className="border-border bg-card overflow-hidden flex flex-col justify-between group shadow-sm hover:border-amber-500/50 transition-all">
                        <div>
                          <div className="aspect-[16/10] overflow-hidden relative">
                            <img
                              src={opp.coverImage}
                              alt={opp.hotelName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className={`absolute top-3 right-3 text-xs ${
                              opp.status === "Abierta" 
                                ? "bg-emerald-500 text-white" 
                                : "bg-purple-600 text-white"
                            }`}>
                              {opp.status === "Abierta" ? "Convocatoria Abierta" : "Creador Asignado"}
                            </Badge>
                            <Badge className="absolute bottom-3 left-3 bg-black/60 text-white backdrop-blur-md text-[10px] border-none">
                              <MapPin className="h-3 w-3 mr-1 text-amber-400" /> {opp.destination}
                            </Badge>
                          </div>

                          <CardContent className="p-5 space-y-4">
                            <div>
                              <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                {opp.hotelName}
                              </h3>
                              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                                {opp.stayDetails}
                              </p>
                            </div>

                            <div className="space-y-2 text-xs">
                              <p className="font-bold text-muted-foreground uppercase text-[10px]">Beneficios para el Creador:</p>
                              <ul className="space-y-1">
                                {opp.perks.map((p, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5 text-foreground">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2 text-xs pt-2 border-t border-border">
                              <p className="font-bold text-muted-foreground uppercase text-[10px]">Entregables Requeridos:</p>
                              <ul className="space-y-1 text-muted-foreground text-[11px]">
                                {opp.deliverablesRequired.map((d, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    <span>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {opp.assignedCreatorId && assignedCreator && (
                              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                                <img
                                  src={assignedCreator.avatar}
                                  alt={assignedCreator.name}
                                  className="w-9 h-9 rounded-full object-cover border border-purple-500/40"
                                />
                                <div>
                                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Influencer Asignado</p>
                                  <p className="text-xs font-bold text-foreground">{assignedCreator.name} ({assignedCreator.handle})</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </div>

                        <div className="p-5 pt-0">
                          {opp.status === "Abierta" ? (
                            <Button 
                              onClick={() => setSelectedOpp(opp)} 
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs gap-1.5"
                            >
                              <Users className="h-4 w-4" /> Seleccionar Creador del Pool
                            </Button>
                          ) : (
                            <Button variant="outline" disabled className="w-full rounded-xl text-xs">
                              <ShieldCheck className="h-4 w-4 mr-1 text-purple-500" /> Misión en Progreso
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Modal / Selector Panel when opportunity is chosen */}
                {selectedOpp && (
                  <div className="p-6 rounded-3xl bg-card border-2 border-amber-500 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <Badge className="bg-amber-500 text-white mb-1">Panel de Asignación</Badge>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          Seleccionar Creador para: {selectedOpp.hotelName} ({selectedOpp.destination})
                        </h3>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOpp(null)} className="rounded-xl">
                        Cancelar
                      </Button>
                    </div>

                    <form onSubmit={handleAssignCreatorToHotel} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                          Elige un creador del Pool de 100 Registrados
                        </label>
                        <select
                          value={selectedCreatorId}
                          onChange={(e) => setSelectedCreatorId(e.target.value)}
                          required
                          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs md:text-sm text-foreground focus:outline-none"
                        >
                          <option value="">-- Seleccionar Creador / Influencer --</option>
                          {creatorsPool.map((creator) => (
                            <option key={creator.id} value={creator.id}>
                              {creator.name} ({creator.handle}) — {creator.niche} | {creator.followersCount} seguidores | Rating: {creator.rating}★
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedCreatorId && (() => {
                        const c = creatorsPool.find(cr => cr.id === selectedCreatorId);
                        if (!c) return null;
                        return (
                          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                              <div>
                                <h4 className="font-bold text-sm text-foreground">{c.name} ({c.handle})</h4>
                                <p className="text-xs text-muted-foreground">{c.bio}</p>
                                <span className="text-[10px] text-primary font-semibold">Ubicación: {c.location} • Estadías previas: {c.completedStays}</span>
                              </div>
                            </div>
                            <Badge className="bg-primary/20 text-primary">{c.niche}</Badge>
                          </div>
                        );
                      })()}

                      <Button
                        type="submit"
                        disabled={isAssigning || !selectedCreatorId}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-11 gap-2"
                      >
                        {isAssigning ? "Confirmando asignación..." : "Confirmar Viaje Patrocinado & Notificar al Creador"}
                      </Button>
                    </form>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: Enlaces de Afiliados */}
              <TabsContent value="afiliados" className="space-y-6">
                <div className="p-6 rounded-3xl bg-card border border-border space-y-2">
                  <h3 className="font-display text-xl font-bold text-foreground">Programas de Afiliados Oficiales</h3>
                  <p className="text-xs text-muted-foreground">
                    Comparte tus enlaces personalizados en tus redes sociales (Instagram Bio, YouTube description, TikTok, blog). Cada vez que un usuario reserve, ganas comisiones automáticas.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {affiliateOffers.map((offer) => (
                    <Card key={offer.id} className="border-border bg-card flex flex-col justify-between shadow-sm">
                      <CardHeader>
                        <Badge className="w-fit mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          {offer.category}
                        </Badge>
                        <CardTitle className="text-base font-bold text-foreground leading-snug">
                          {offer.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Partner: {offer.partner}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 rounded-xl bg-muted/50 space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Comisión Ofrecida</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{offer.commissionRate}</p>
                          <p className="text-[10px] text-muted-foreground">Ganancia promedio por clic (EPC): {offer.epc}</p>
                        </div>

                        <Button 
                          onClick={() => handleCopyAffiliate(offer.affiliateUrl)}
                          className="w-full rounded-xl text-xs font-bold gap-2"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copiar Enlace de Afiliado
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: Pool de Creadores Registrados */}
              <TabsContent value="creadores" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Directorio de Creadores & Influencers</h3>
                    <p className="text-xs text-muted-foreground">Más de 100 creadores de contenido registrados listos para colaboraciones hoteleras.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatorsPool.map((creator) => (
                    <Card key={creator.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
                      <CardHeader className="flex flex-row items-center gap-3">
                        <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-sm font-bold text-foreground">{creator.name}</CardTitle>
                            <Badge className="bg-primary/10 text-primary text-[9px] border-primary/20">{creator.badge}</Badge>
                          </div>
                          <p className="text-xs text-primary font-semibold">{creator.handle}</p>
                          <p className="text-[10px] text-muted-foreground">{creator.location}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">{creator.bio}</p>
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-muted/40 text-center text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Seguidores</p>
                            <p className="font-bold text-foreground">{creator.followersCount}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Engagement</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">{creator.engagementRate}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Rating</p>
                            <p className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-500" /> {creator.rating}
                            </p>
                          </div>
                        </div>

                        <Badge variant="outline" className="w-full justify-center text-[10px] font-semibold">
                          Especialidad: {creator.niche}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 4: Mis Contenidos & Vistas */}
              <TabsContent value="videos" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Upload Form */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Publicar Nuevo Contenido</CardTitle>
                      <CardDescription className="text-xs">Sube el enlace de tu Reel, TikTok o YouTube para auditar vistas y cobrar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUploadVideo} className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Título del Vídeo</label>
                          <Input
                            placeholder="Ej: 5 Hoteles Imperdibles en POP"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            required
                            className="mt-1 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Enlace del Vídeo (Instagram / TikTok / YouTube)</label>
                          <Input
                            placeholder="https://instagram.com/reel/..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            required
                            className="mt-1 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Destino Cubierto</label>
                          <select
                            value={videoDestination}
                            onChange={(e) => setVideoDestination(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                          >
                            <option value="Puerto Plata (POP)">Puerto Plata (POP)</option>
                            <option value="Samaná">Samaná</option>
                            <option value="Punta Cana">Punta Cana</option>
                            <option value="Santo Domingo">Santo Domingo (Zona Colonial)</option>
                            <option value="Jarabacoa / Constanza">Jarabacoa / Constanza</option>
                          </select>
                        </div>
                        <Button type="submit" disabled={isUploading} className="w-full rounded-xl text-xs font-bold gap-2">
                          <Upload className="h-3.5 w-3.5" />
                          {isUploading ? "Enviando..." : "Registrar para Monetización"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Right: Published List */}
                  <div className="lg:col-span-2">
                    <Card className="border-border bg-card h-full">
                      <CardHeader>
                        <CardTitle className="text-base font-bold">Tus Contenidos Auditados</CardTitle>
                        <CardDescription className="text-xs">Rendimiento, reproducciones y pagos acumulados.</CardDescription>
                      </CardHeader>
                      <CardContent className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground uppercase">
                              <th className="py-2.5 font-bold">Título</th>
                              <th className="py-2.5 font-bold">Destino</th>
                              <th className="py-2.5 font-bold">Vistas</th>
                              <th className="py-2.5 font-bold">Ganancia</th>
                              <th className="py-2.5 font-bold">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {creatorVideos.map(video => (
                              <tr key={video.id} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                                  <Video className="h-4 w-4 text-primary shrink-0" />
                                  <span>{video.title}</span>
                                </td>
                                <td className="py-3 text-muted-foreground">{video.dest}</td>
                                <td className="py-3 font-bold text-foreground">{video.views.toLocaleString()}</td>
                                <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">{video.earnings || "$0.00"}</td>
                                <td className="py-3">
                                  <Badge className={video.status === "Aprobado" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                                    {video.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 5: Pagos y Retiro */}
              <TabsContent value="pagos" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Solicitar Retiro de Fondos</CardTitle>
                      <CardDescription className="text-xs">Saldo disponible: <strong>${balance.toFixed(2)} USD</strong></CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Monto a Retirar (USD)</label>
                          <Input 
                            type="number"
                            placeholder="Mínimo $50 USD"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            required
                            className="mt-1 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Método de Cobro</label>
                          <select
                            value={withdrawMethod}
                            onChange={(e) => setWithdrawMethod(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                          >
                            <option value="paypal">PayPal</option>
                            <option value="banco">Transferencia Bancaria Local (Banreservas, BHD, Popular)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Datos de la Cuenta</label>
                          <Input 
                            placeholder={withdrawMethod === "paypal" ? "correo@paypal.com" : "Banco, No. de Cuenta, Cédula / RNC"} 
                            value={withdrawDetails}
                            onChange={(e) => setWithdrawDetails(e.target.value)}
                            required
                            className="mt-1 rounded-xl text-xs"
                          />
                        </div>
                        <Button type="submit" disabled={isWithdrawing} className="w-full rounded-xl text-xs font-bold gap-2">
                          {isWithdrawing ? "Procesando transferencia..." : "Solicitar Retiro Seguro"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Historial de Transferencias</CardTitle>
                      <CardDescription className="text-xs">Comprobantes y liquidaciones anteriores.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { date: "2026-09-01", method: "Transferencia BHD", amount: "$150.00 USD", status: "Completado" },
                        { date: "2026-08-15", method: "PayPal", amount: "$95.00 USD", status: "Completado" }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border">
                          <div>
                            <p className="font-semibold text-xs text-foreground">{item.method}</p>
                            <p className="text-[10px] text-muted-foreground">{item.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xs font-bold text-foreground">{item.amount}</p>
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] uppercase">
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-12">
              <PanoramaAd />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
