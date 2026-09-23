import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { getStoredJSON } from "@/lib/safeStorage";
import { supabase } from "@/integrations/supabase/client";
import {
  Gift, Trophy, Star, PartyPopper, Hotel, UtensilsCrossed,
  Palmtree, Ship, Compass, Camera, Music, Heart, CheckCircle,
  Send, Clock, Users, CalendarDays, Sparkles, TrendingUp, ChevronRight
} from "lucide-react";
import relaxBeach from "@/assets/relax-beach.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";
import samanaImg from "@/assets/samana.jpg";
import hotelRoom from "@/assets/hotel-room-suite.jpg";

// Componentes modulares
import { ScratchCard } from "@/components/sorteos/ScratchCard";
import { SurveyModule, ENCUESTAS_DISPONIBLES, type SurveyId } from "@/components/sorteos/SurveyModule";
import { ViralSorteoModule } from "@/components/sorteos/ViralSorteoModule";

// ─── Premios disponibles ────────────────────────────────────────────
const premios = [
  {
    id: "weekend-punta-cana",
    titulo: "Fin de Semana en Punta Cana",
    imagen: puntaCana,
    descripcion: "2 noches all-inclusive para 2 personas en resort 5 estrellas.",
    valor: "US$ 800",
    icon: Hotel,
    color: "text-amber-500",
  },
  {
    id: "daypass-samana",
    titulo: "Day Pass en Samaná",
    imagen: samanaImg,
    descripcion: "Day pass para 2 personas con almuerzo, bebidas y actividades acuáticas.",
    valor: "US$ 250",
    icon: Palmtree,
    color: "text-emerald-500",
  },
  {
    id: "excursion-27charcos",
    titulo: "Excursión 27 Charcos",
    imagen: adventureImg,
    descripcion: "Tour guiado para 2 personas por los 27 Charcos de Damajagua con transporte.",
    valor: "US$ 180",
    icon: Compass,
    color: "text-sky-500",
  },
  {
    id: "cena-romantica",
    titulo: "Cena Gourmet para Dos",
    imagen: gastronomy,
    descripcion: "Cena de 5 tiempos con maridaje de vinos en restaurante premiado.",
    valor: "US$ 300",
    icon: UtensilsCrossed,
    color: "text-rose-500",
  },
  {
    id: "spa-wellness",
    titulo: "Sesión Spa Premium",
    imagen: hotelRoom,
    descripcion: "Día completo de spa con masaje, facial, acceso a piscina y almuerzo.",
    valor: "US$ 200",
    icon: Heart,
    color: "text-purple-500",
  },
  {
    id: "catamaran-tour",
    titulo: "Tour en Catamarán",
    imagen: relaxBeach,
    descripcion: "Paseo en catamarán con snorkel, barra libre y fiesta en el mar para 2.",
    valor: "US$ 220",
    icon: Ship,
    color: "text-cyan-500",
  },
];

// ─── Formulario de Registro ─────────────────────────────────────────
function RegistroSorteo() {
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", pais: "", edad: "",
    visitado: "", intereses: [] as string[], acepta: false,
  });

  const interesesOpciones = [
    "Playas", "Aventura", "Gastronomía", "Cultura", "Naturaleza",
    "Bienestar", "Vida nocturna", "Golf", "Buceo", "Ecoturismo",
  ];

  const toggleInteres = (i: string) => {
    setForm(prev => ({
      ...prev,
      intereses: prev.intereses.includes(i) ? prev.intereses.filter(x => x !== i) : [...prev.intereses, i],
    }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.acepta) {
      toast.error("Completa los campos obligatorios y acepta los términos");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contest_registrations").insert({
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono || null,
      pais: form.pais || null,
      edad: form.edad || null,
      visitado: form.visitado || null,
      intereses: form.intereses.length ? form.intereses : null,
    });
    setLoading(false);
    if (error) { toast.error("Error al registrar. Intenta de nuevo."); return; }
    toast.success("🎉 ¡Registro exitoso! Ya participas en el sorteo. ¡Buena suerte!");
    setForm({ nombre: "", email: "", telefono: "", pais: "", edad: "", visitado: "", intereses: [], acepta: false });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <PartyPopper className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">¡Regístrate y Participa!</h2>
        <p className="text-muted-foreground">Completa el formulario y entra automáticamente en el sorteo de premios increíbles.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block">Nombre completo *</Label>
            <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" required />
          </div>
          <div>
            <Label className="mb-1.5 block">Email *</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" required />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 block">Teléfono</Label>
            <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+1 809-000-0000" />
          </div>
          <div>
            <Label className="mb-1.5 block">País de residencia</Label>
            <Select value={form.pais} onValueChange={v => setForm({ ...form, pais: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {["República Dominicana", "Estados Unidos", "Canadá", "España", "Colombia", "México", "Brasil", "Alemania", "Francia", "Italia", "Reino Unido", "Argentina", "Chile", "Puerto Rico", "Otro"].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Rango de edad</Label>
            <Select value={form.edad} onValueChange={v => setForm({ ...form, edad: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {["18-25", "26-35", "36-45", "46-55", "56-65", "65+"].map(e => (
                  <SelectItem key={e} value={e}>{e} años</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block">¿Has visitado República Dominicana antes?</Label>
          <RadioGroup value={form.visitado} onValueChange={v => setForm({ ...form, visitado: v })} className="flex flex-wrap gap-4">
            {["Nunca", "1 vez", "2-3 veces", "4+ veces", "Vivo aquí"].map(opt => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`visit-${opt}`} />
                <Label htmlFor={`visit-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="mb-2 block">¿Qué tipo de turismo te interesa?</Label>
          <div className="flex flex-wrap gap-2">
            {interesesOpciones.map(i => (
              <Badge
                key={i}
                variant={form.intereses.includes(i) ? "default" : "outline"}
                className="cursor-pointer text-sm py-1.5 px-3 transition-colors"
                onClick={() => toggleInteres(i)}
              >
                {i}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="acepta"
            checked={form.acepta}
            onCheckedChange={v => setForm({ ...form, acepta: v === true })}
          />
          <label htmlFor="acepta" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            Acepto los <a href="/terminos" className="text-primary underline">términos y condiciones</a> del sorteo y la <a href="/terminos" className="text-primary underline">política de privacidad</a>. Confirmo ser mayor de 18 años. *
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          <Gift className="h-4 w-4" /> {loading ? "Registrando..." : "Registrarme y participar"}
        </Button>
      </form>
    </div>
  );
}

// ─── Página Principal ───────────────────────────────────────────────
export default function SorteosYPremios() {
  const [encuestaActiva, setEncuestaActiva] = useState<SurveyId | null>(null);

  // Estados de gamificación de sorteos
  const [ticketCount, setTicketCount] = useState<number>(() => {
    const saved = localStorage.getItem("sorteo_tickets_count");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [completedTasks, setCompletedTasks] = useState<string[]>(() =>
    getStoredJSON<string[]>("sorteo_completed_tasks", [])
  );

  const [lastCheckinDate, setLastCheckinDate] = useState<string | null>(() => {
    return localStorage.getItem("sorteo_last_checkin");
  });

  const handleClaimCheckin = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (lastCheckinDate === todayStr) {
      toast.error("Ya reclamaste tu ticket diario hoy. ¡Vuelve mañana!");
      return;
    }
    
    const newCount = ticketCount + 1;
    setTicketCount(newCount);
    localStorage.setItem("sorteo_tickets_count", newCount.toString());
    
    setLastCheckinDate(todayStr);
    localStorage.setItem("sorteo_last_checkin", todayStr);
    
    toast.success("🔥 ¡Reclamo diario exitoso! +1 Ticket de Sorteo.");
  };

  const handleCompleteTask = (taskId: string, pointsAwarded: number, taskName: string) => {
    if (completedTasks.includes(taskId)) {
      toast.info(`Ya completaste la misión: ${taskName}`);
      return;
    }

    const newTasks = [...completedTasks, taskId];
    setCompletedTasks(newTasks);
    localStorage.setItem("sorteo_completed_tasks", JSON.stringify(newTasks));

    const newCount = ticketCount + pointsAwarded;
    setTicketCount(newCount);
    localStorage.setItem("sorteo_tickets_count", newCount.toString());

    toast.success(`🎯 Misión Completada: ${taskName}! +${pointsAwarded} Tickets de Sorteo.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Sorteos y Encuestas - Gana Premios Turísticos en RD"
        description="Participa en sorteos de fines de semana, day passes, excursiones y cenas gratis. Completa encuestas turísticas y gana premios increíbles."
        keywords="sorteos turismo RD, ganar premios viaje, encuestas turísticas dominicanas, concursos turismo"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 animate-pulse">
              <Gift className="h-3 w-3 mr-1" /> ¡Premios Increíbles!
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Participa y <span className="text-primary">Gana Premios</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Regístrate o completa nuestras encuestas turísticas y participa automáticamente para ganar fines de semana, excursiones, cenas y mucho más.
            </p>

            {/* Countdown badge */}
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 mb-8">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Próximo sorteo: 30 de Abril 2026</span>
            </div>
          </div>
        </section>

        {/* Premios */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🎁 Premios que Puedes Ganar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {premios.map(p => (
                <div key={p.id} className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/30 transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img src={p.imagen} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p.icon className={`h-5 w-5 ${p.color} mb-1`} />
                    <p className="text-white text-xs font-semibold line-clamp-2">{p.titulo}</p>
                    <p className="text-white/70 text-[10px]">{p.valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabs: Registro + Raspa y Gana + Misiones + Encuestas */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="registro" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-10">
                <TabsTrigger value="registro" className="gap-1.5" onClick={() => setEncuestaActiva(null)}>
                  <PartyPopper className="h-4 w-4" /> Regístrate
                </TabsTrigger>
                <TabsTrigger value="raspadito" className="gap-1.5" onClick={() => setEncuestaActiva(null)}>
                  <Sparkles className="h-4 w-4" /> Raspadito
                </TabsTrigger>
                <TabsTrigger value="misiones" className="gap-1.5" onClick={() => setEncuestaActiva(null)}>
                  <Trophy className="h-4 w-4" /> Misiones
                </TabsTrigger>
                <TabsTrigger value="encuestas" className="gap-1.5" onClick={() => setEncuestaActiva(null)}>
                  <Star className="h-4 w-4" /> Encuestas
                </TabsTrigger>
              </TabsList>

              {/* ═══ TAB: REGISTRO MULTI-PUNTOS AVANZADO ═══ */}
              <TabsContent value="registro">
                <ViralSorteoModule onPointsUpdated={(newPts) => setTicketCount(newPts)} />
              </TabsContent>

              {/* ═══ TAB: RASPA Y GANA (MODULAR) ═══ */}
              <TabsContent value="raspadito">
                <div className="py-4">
                  <ScratchCard onRewardClaimed={(r) => {
                    const newCount = ticketCount + 1;
                    setTicketCount(newCount);
                    localStorage.setItem("sorteo_tickets_count", newCount.toString());
                  }} />
                </div>
              </TabsContent>

              {/* ═══ TAB: MISIONES DE SORTEO ═══ */}
              <TabsContent value="misiones">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Banner de Boletos */}
                  <Card className="bg-gradient-to-r from-primary/95 via-violet-850 to-indigo-900 text-white relative overflow-hidden shadow-xl rounded-2xl border-none">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                      <Gift className="h-48 w-48 text-white" />
                    </div>
                    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      <div className="space-y-2 text-center md:text-left">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] uppercase font-mono tracking-wider">
                          Panel de Sorteos
                        </Badge>
                        <h2 className="font-display text-2xl md:text-3xl font-extrabold">Tus Oportunidades Acumuladas</h2>
                        <p className="text-white/80 text-xs max-w-md">
                          Completa las misiones sociales de abajo para ganar más boletos. Cada boleto representa una participación en el sorteo mensual.
                        </p>
                      </div>

                      {/* Ticket Badge */}
                      <div className="bg-white text-primary p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-primary/20 shadow-lg min-w-[150px] relative">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-900 border-r border-white/20" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-900 border-l border-white/20" />
                        
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Boletos</span>
                        <h3 className="text-4xl font-mono font-black mt-1">{ticketCount}</h3>
                        <Badge variant="outline" className="mt-2 text-[10px] border-primary/20 text-primary">
                          #SorteoAbril
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Listado de Misiones */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-display text-lg font-bold text-foreground">Misiones Disponibles</h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        {completedTasks.length} / 4 Completadas
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Check-in Diario */}
                      <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <CalendarDays className="h-5 w-5 text-primary" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                              +1 Ticket Diario
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">Entrada Diaria (Check-in)</h4>
                            <p className="text-xs text-muted-foreground leading-normal mt-1">
                              Ingresa a la aplicación todos los días para reclamar un ticket de participación extra.
                            </p>
                          </div>
                          <div className="pt-2">
                            {lastCheckinDate === new Date().toISOString().split("T")[0] ? (
                              <Button disabled className="w-full text-xs font-bold h-9">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Reclamado Hoy
                              </Button>
                            ) : (
                              <Button onClick={handleClaimCheckin} className="w-full text-xs font-bold h-9 bg-primary hover:bg-primary/90">
                                Reclamar Boleto Diario
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Compartir Descubre RD */}
                      <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Send className="h-5 w-5 text-primary" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                              +2 Tickets
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">Compartir la Página</h4>
                            <p className="text-xs text-muted-foreground leading-normal mt-1">
                              Comparte nuestro portal en tus redes y motiva a tus amigos a descubrir República Dominicana.
                            </p>
                          </div>
                          <div className="pt-2">
                            {completedTasks.includes("share_page") ? (
                              <Button disabled variant="outline" className="w-full text-xs font-bold h-9">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Completado
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="w-full text-xs font-bold h-9 border-primary/20 text-primary hover:bg-primary/5"
                                onClick={() => handleCompleteTask("share_page", 2, "Compartir la página")}
                              >
                                Compartir enlace
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seguir Instagram */}
                      <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Camera className="h-5 w-5 text-primary" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                              +2 Tickets
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">Seguir en Instagram</h4>
                            <p className="text-xs text-muted-foreground leading-normal mt-1">
                              Únete a nuestra comunidad visual en @DescubreRD para contenido exclusivo diario de la isla.
                            </p>
                          </div>
                          <div className="pt-2">
                            {completedTasks.includes("follow_ig") ? (
                              <Button disabled variant="outline" className="w-full text-xs font-bold h-9">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Siguiendo
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="w-full text-xs font-bold h-9 border-primary/20 text-primary hover:bg-primary/5"
                                onClick={() => {
                                  window.open("https://instagram.com", "_blank");
                                  handleCompleteTask("follow_ig", 2, "Seguir en Instagram");
                                }}
                              >
                                Seguir en Instagram
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seguir TikTok */}
                      <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Music className="h-5 w-5 text-primary" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                              +2 Tickets
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">Seguir en TikTok</h4>
                            <p className="text-xs text-muted-foreground leading-normal mt-1">
                              Mira videos cortos e inspiradores de los rincones ocultos de RD en nuestra cuenta oficial.
                            </p>
                          </div>
                          <div className="pt-2">
                            {completedTasks.includes("follow_tk") ? (
                              <Button disabled variant="outline" className="w-full text-xs font-bold h-9">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Siguiendo
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="w-full text-xs font-bold h-9 border-primary/20 text-primary hover:bg-primary/5"
                                onClick={() => {
                                  window.open("https://tiktok.com", "_blank");
                                  handleCompleteTask("follow_tk", 2, "Seguir en TikTok");
                                }}
                              >
                                Seguir en TikTok
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ═══ TAB: ENCUESTAS (MODULAR) ═══ */}
              <TabsContent value="encuestas">
                {encuestaActiva ? (
                  <div>
                    <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => setEncuestaActiva(null)}>
                      ← Volver a encuestas
                    </Button>
                    <SurveyModule
                      survey={ENCUESTAS_DISPONIBLES.find(e => e.id === encuestaActiva)!}
                      onBack={() => setEncuestaActiva(null)}
                      onCompleted={() => {
                        const newCount = ticketCount + 1;
                        setTicketCount(newCount);
                        localStorage.setItem("sorteo_tickets_count", newCount.toString());
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Encuestas Turísticas</h2>
                      <p className="text-muted-foreground">Completa una o más encuestas y multiplica tus oportunidades de ganar.</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" /> Cada encuesta = 1 entrada adicional al sorteo
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      {ENCUESTAS_DISPONIBLES.map(enc => (
                        <Card
                          key={enc.id}
                          className="group cursor-pointer border-border hover:border-primary/30 hover:shadow-lg transition-all"
                          onClick={() => setEncuestaActiva(enc.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <enc.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{enc.titulo}</h3>
                                <p className="text-xs text-muted-foreground mb-3">{enc.desc}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {enc.tiempo}</span>
                                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {enc.preguntas} preguntas</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <Gift className="h-3 w-3" /> +1 entrada al sorteo
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">¿Cómo Funciona?</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: 1, icon: Users, title: "Regístrate", desc: "Completa el formulario con tus datos básicos." },
                { step: 2, icon: Star, title: "Responde encuestas", desc: "Cada encuesta completada suma una entrada extra." },
                { step: 3, icon: Trophy, title: "Sorteo mensual", desc: "Seleccionamos ganadores al azar cada mes." },
                { step: 4, icon: Gift, title: "¡Disfruta tu premio!", desc: "Te contactamos para coordinar tu experiencia." },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    {s.step}
                  </div>
                  <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reglas */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4 text-center">Reglas del Sorteo</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Debes ser mayor de 18 años para participar.",
                "El registro te da 1 entrada al sorteo. Cada encuesta completada suma 1 entrada adicional.",
                "Los ganadores se seleccionan aleatoriamente el último día de cada mes.",
                "Los premios no son transferibles ni canjeables por dinero.",
                "Los ganadores serán contactados por email dentro de las 48 horas posteriores al sorteo.",
                "Los premios deben ser utilizados dentro de los 6 meses siguientes al sorteo.",
                "DescubreRD se reserva el derecho de modificar los premios por otros de igual o mayor valor.",
              ].map((regla, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {regla}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
