import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { getStoredJSON } from "@/lib/safeStorage";
import {
  Gift, Trophy, Star, PartyPopper, CheckCircle,
  Clock, Users, CalendarDays, Sparkles, TrendingUp, ChevronRight
} from "lucide-react";

// Componentes modulares y datos
import { premiosSorteo, sorteoReglas } from "@/data/sorteosData";
import { ScratchCard } from "@/components/sorteos/ScratchCard";
import { SurveyModule, ENCUESTAS_DISPONIBLES, type SurveyId } from "@/components/sorteos/SurveyModule";
import { ViralSorteoModule } from "@/components/sorteos/ViralSorteoModule";
import { SorteoMisionesTab } from "@/components/sorteos/SorteoMisionesTab";

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
              {premiosSorteo.map(p => (
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
                  <ScratchCard onRewardClaimed={() => {
                    const newCount = ticketCount + 1;
                    setTicketCount(newCount);
                    localStorage.setItem("sorteo_tickets_count", newCount.toString());
                  }} />
                </div>
              </TabsContent>

              {/* ═══ TAB: MISIONES DE SORTEO ═══ */}
              <TabsContent value="misiones">
                <SorteoMisionesTab
                  ticketCount={ticketCount}
                  completedTasks={completedTasks}
                  lastCheckinDate={lastCheckinDate}
                  onClaimCheckin={handleClaimCheckin}
                  onCompleteTask={handleCompleteTask}
                />
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
              {sorteoReglas.map((regla, i) => (
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
