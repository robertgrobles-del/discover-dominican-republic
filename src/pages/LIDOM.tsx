import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Calendar, MapPin, CloudRain, Tv, Ticket,
  Settings, Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AdminDeportesManager, DEFAULT_GAMES, DEFAULT_TOURNAMENTS, SportGame, SportTournament } from "@/components/sports/AdminDeportesManager";
import { LidomStandingsAndLeaders } from "@/components/sports/LidomStandingsAndLeaders";
import { LidomTeamsAndStadiums } from "@/components/sports/LidomTeamsAndStadiums";

export default function LIDOM() {
  const [tournaments, setTournaments] = useState<SportTournament[]>(DEFAULT_TOURNAMENTS);
  const [games, setGames] = useState<SportGame[]>(DEFAULT_GAMES);
  const [selectedTournament, setSelectedTournament] = useState<string>("lidom-2026");
  const [selectedGame, setSelectedGame] = useState<SportGame | null>(null);
  
  // Ticket modal state
  const [ticketZone, setTicketZone] = useState<string>("Palcos A");
  const [ticketQuantity, setTicketQuantity] = useState<number>(2);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Admin Manager dialog
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    try {
      const storedTournaments = JSON.parse(localStorage.getItem("dr_sports_tournaments") || "null");
      const storedGames = JSON.parse(localStorage.getItem("dr_sports_games") || "null");
      if (storedTournaments) setTournaments(storedTournaments);
      if (storedGames) setGames(storedGames);
    } catch (err) {
      console.error("Error loading LIDOM games:", err);
    }
  }, []);

  const getPrice = () => {
    switch (ticketZone) {
      case "Palcos A": return 1500;
      case "Palcos AA": return 1100;
      case "Preferencia": return 750;
      case "Bleachers": return 350;
      default: return 600;
    }
  };

  const handlePurchaseTrigger = (game: SportGame) => {
    setSelectedGame(game);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false);
    toast.success("¡Tus boletos oficiales se han emitido exitosamente! Revisa tu pase digital con código QR.");
  };

  // Filter games by active tournament
  const currentGames = games.filter(
    (g) => selectedTournament === "all" || g.tournamentId === selectedTournament
  );

  // Check if there is any postponed game for weather alert
  const postponedGames = games.filter((g) => g.status === "postponed" || g.status === "cancelled");

  return (
    <PageTransition>
      <SEOHead
        title="LIDOM Béisbol Dominicano & Deportes - Calendario, Boletas y Marcadores"
        description="Guía oficial de béisbol invernal LIDOM y deportes dominicanos. Consulta calendarios en vivo, estados del clima, estadios, equipos y compra de boletas."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-10">
            
            {/* HERO SECTION */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-500/20 text-white p-6 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-60" />
              <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-blue-600 text-white font-extrabold uppercase tracking-widest text-[10px] px-3 py-1">
                    ⚾ Pasión Nacional Dominicana
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/20 text-[10px]">
                    Temporada 2025-2026
                  </Badge>
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Settings className="h-3 w-3 text-primary" /> Panel de Control Deportivo
                  </button>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  Béisbol Invernal <span className="text-blue-400">LIDOM</span> & Multideportes
                </h1>

                <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
                  Vive la experiencia del deporte rey en la República Dominicana. Disfruta de la mejor pelota invernal del mundo, partidos en vivo, gastronomía del play y compra de boletas oficiales.
                </p>

                {/* Tournament Selector Strip */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {tournaments.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTournament(t.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedTournament === t.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      <span>{t.logo}</span>
                      <span>{t.name.split(" - ")[0]}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTournament("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTournament === "all"
                        ? "bg-primary text-slate-950 font-black shadow-md"
                        : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    Ver Todo
                  </button>
                </div>
              </div>
            </div>

            {/* WEATHER / POSTPONEMENT ALERT NOTIFICATION */}
            {postponedGames.length > 0 && (
              <div className="rounded-2xl p-4 bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                    <CloudRain className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span>Aviso Oficial de Clima & Reprogramaciones</span>
                      <Badge className="bg-amber-500 text-slate-950 text-[10px] font-black">
                        {postponedGames.length} {postponedGames.length === 1 ? "Juego Afectado" : "Juegos Afectados"}
                      </Badge>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {postponedGames[0].statusNote || `${postponedGames[0].homeTeam} vs ${postponedGames[0].awayTeam} en ${postponedGames[0].stadium} ha sido pospuesto por lluvias.`}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAdminOpen(true)}
                  className="rounded-xl text-xs font-bold border-amber-500/40 shrink-0"
                >
                  Ver Detalles de Reprogramación
                </Button>
              </div>
            )}

            {/* LIVE SCORES & SCHEDULE SECTION */}
            <section className="space-y-4" id="calendario">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    Cartelera de Partidos & Marcadores en Vivo
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Horarios oficiales, transmisiones de televisión y estados del terreno en tiempo real.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAdminOpen(true)}
                  className="rounded-xl text-xs gap-1.5 font-bold bg-primary text-slate-950 self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" /> Calendarizar / Editar Juego
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentGames.map((game) => (
                  <Card 
                    key={game.id} 
                    className={`rounded-3xl border transition-all overflow-hidden ${
                      game.status === "live"
                        ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10 bg-emerald-500/5"
                        : game.status === "postponed"
                        ? "border-amber-500/60 bg-amber-500/5"
                        : "border-border/80 bg-card hover:border-primary/40"
                    }`}
                  >
                    <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {game.tournamentName} • {game.phase}
                      </Badge>

                      {game.status === "live" && (
                        <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950" /> EN VIVO
                        </Badge>
                      )}

                      {game.status === "postponed" && (
                        <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1">
                          <CloudRain className="h-3 w-3" /> POSPUESTO
                        </Badge>
                      )}

                      {game.status === "cancelled" && (
                        <Badge className="bg-red-500 text-white font-black text-[10px]">
                          CANCELADO
                        </Badge>
                      )}

                      {game.status === "scheduled" && (
                        <span className="text-xs text-primary font-bold">{game.date} • {game.time}</span>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 space-y-4">
                      {/* Teams Matchup */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{game.homeLogo}</span>
                            <span className="font-bold text-foreground text-sm sm:text-base">{game.homeTeam}</span>
                          </div>
                          {(game.status === "live" || game.status === "ended") && (
                            <span className="font-mono text-xl font-black text-foreground">{game.homeScore}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{game.awayLogo}</span>
                            <span className="font-bold text-foreground text-sm sm:text-base">{game.awayTeam}</span>
                          </div>
                          {(game.status === "live" || game.status === "ended") && (
                            <span className="font-mono text-xl font-black text-foreground">{game.awayScore}</span>
                          )}
                        </div>
                      </div>

                      {/* Live Inning / Status Note */}
                      {game.status === "live" && game.liveInningOrPeriod && (
                        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300 text-center">
                          ⚾ {game.liveInningOrPeriod}
                        </div>
                      )}

                      {game.status === "postponed" && game.statusNote && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 leading-tight">
                          🌧️ {game.statusNote}
                        </div>
                      )}

                      {/* Location & TV */}
                      <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{game.stadium}, {game.city}</span>
                        </div>
                        {game.broadcastChannel && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Tv className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{game.broadcastChannel}</span>
                          </div>
                        )}
                      </div>

                      {/* Buy Tickets Button */}
                      <Button
                        onClick={() => handlePurchaseTrigger(game)}
                        disabled={game.status === "cancelled" || game.status === "ended"}
                        className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl text-xs h-10 gap-2 shadow-sm"
                      >
                        <Ticket className="h-4 w-4" />
                        <span>{game.ticketPrice ? "Comprar / Reservar Boletas" : "Obtener Entradas"}</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* TABLA DE POSICIONES & LÍDERES COMPONENT */}
            <LidomStandingsAndLeaders />

            {/* EQUIPOS Y GUÍA GASTRONÓMICA DE ESTADIOS */}
            <LidomTeamsAndStadiums />

          </div>
        </main>

        <Footer />
      </div>

      {/* TICKET CHECKOUT MODAL */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-1 w-fit">
              <Ticket className="h-3.5 w-3.5" /> Boletería Oficial
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Boletas para {selectedGame?.homeTeam} vs {selectedGame?.awayTeam}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedGame?.stadium} • {selectedGame?.date} - {selectedGame?.time}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Zona del Estadio</label>
              <div className="grid grid-cols-2 gap-2">
                {["Palcos A", "Palcos AA", "Preferencia", "Bleachers"].map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setTicketZone(zone)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      ticketZone === zone
                        ? "bg-primary text-slate-950 border-primary shadow-sm"
                        : "bg-background hover:bg-muted text-foreground border-border"
                    }`}
                  >
                    <div>{zone}</div>
                    <div className="text-[10px] opacity-80">
                      {zone === "Palcos A" && "RD$ 1,500"}
                      {zone === "Palcos AA" && "RD$ 1,100"}
                      {zone === "Preferencia" && "RD$ 750"}
                      {zone === "Bleachers" && "RD$ 350"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Cantidad de Entradas</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTicketQuantity(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      ticketQuantity === num
                        ? "bg-primary text-slate-950 border-primary"
                        : "bg-background hover:bg-muted text-foreground border-border"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/60 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Total a Pagar</span>
                <span className="font-mono text-xl font-black text-foreground">
                  RD$ {(getPrice() * ticketQuantity).toLocaleString()}
                </span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                E-Ticket QR Inmediato
              </Badge>
            </div>

            <Button
              onClick={handleCheckoutSuccess}
              className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black rounded-xl text-sm h-11 shadow-md shadow-primary/20"
            >
              Confirmar y Emitir E-Tickets (+50 XP)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SPORTS ADMIN DIALOG */}
      <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border bg-card">
          <AdminDeportesManager />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
