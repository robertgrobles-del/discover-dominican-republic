import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Award, Users, CreditCard, ChevronRight, Info } from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { toast } from "sonner";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  stadium: string;
  city: string;
  date: string;
  time: string;
  status: "scheduled" | "live" | "ended";
  score?: string;
}

const teams = [
  { name: "Tigres del Licey", short: "LIC", city: "Santo Domingo", championships: 24, color: "bg-blue-600" },
  { name: "Aguilas Cibaeñas", short: "AGU", city: "Santiago", championships: 22, color: "bg-yellow-500" },
  { name: "Leones del Escogido", short: "ESC", city: "Santo Domingo", championships: 16, color: "bg-red-600" },
  { name: "Estrellas Orientales", short: "EST", city: "San Pedro de Macorís", championships: 3, color: "bg-green-700" },
  { name: "Toros del Este", short: "TOR", city: "La Romana", championships: 3, color: "bg-orange-600" },
  { name: "Gigantes del Cibao", short: "GIG", city: "San Francisco de Macorís", championships: 2, color: "bg-purple-900" }
];

const mockGames: Game[] = [
  {
    id: "g1",
    homeTeam: "Tigres del Licey",
    awayTeam: "Aguilas Cibaeñas",
    homeLogo: "🐯",
    awayLogo: "🦅",
    stadium: "Estadio Quisqueya Juan Marichal",
    city: "Santo Domingo",
    date: "Hoy",
    time: "19:15",
    status: "live",
    score: "LIC 3 - 2 AGU (8vo Inning)"
  },
  {
    id: "g2",
    homeTeam: "Estrellas Orientales",
    awayTeam: "Toros del Este",
    homeLogo: "⭐",
    awayLogo: "🐂",
    stadium: "Estadio Tetelo Vargas",
    city: "San Pedro de Macorís",
    date: "Mañana",
    time: "19:30",
    status: "scheduled"
  },
  {
    id: "g3",
    homeTeam: "Gigantes del Cibao",
    awayTeam: "Leones del Escogido",
    homeLogo: "🐎",
    awayLogo: "🦁",
    stadium: "Estadio Julián Javier",
    city: "San Francisco de Macorís",
    date: "18 de Jun",
    time: "19:00",
    status: "scheduled"
  }
];

const stadiums = [
  { name: "Estadio Quisqueya Juan Marichal", city: "Santo Domingo", capacity: "14,469", inaugurated: "1955", home: "Licey & Escogido" },
  { name: "Estadio Cibao", city: "Santiago", capacity: "18,077", inaugurated: "1958", home: "Águilas Cibaeñas" },
  { name: "Estadio Tetelo Vargas", city: "San Pedro de Macorís", capacity: "8,000", inaugurated: "1959", home: "Estrellas Orientales" },
  { name: "Estadio Francisco A. Micheli", city: "La Romana", capacity: "7,838", inaugurated: "1979", home: "Toros del Este" }
];

export default function LIDOM() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [ticketZone, setTicketZone] = useState<string>("Palcos");
  const [ticketQuantity, setTicketQuantity] = useState<number>(2);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const getPrice = () => {
    switch (ticketZone) {
      case "Palcos A": return 1500;
      case "Preferencia": return 800;
      case "Bleachers": return 350;
      default: return 600;
    }
  };

  const handlePurchaseTrigger = (game: Game) => {
    setSelectedGame(game);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false);
    toast.success("¡Tus boletos LIDOM se han comprado exitosamente! Revisa tu e-mail para el e-ticket QR.");
  };

  return (
    <PageTransition>
      <SEOHead
        title="LIDOM Béisbol Dominicano - Calendario y Tickets"
        description="Guía oficial de béisbol invernal LIDOM. Compra boletos, consulta calendarios, estadios y equipos."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-blue-900 to-indigo-950 p-8 md:p-12 border border-blue-500/20 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
              <div className="max-w-2xl relative z-10">
                <Badge className="mb-4 bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px]">
                  ⚾ La Pasión del Caribe
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
                  Béisbol Invernal <span className="text-blue-400">LIDOM</span>
                </h1>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Vive la experiencia del deporte rey dominicano. Disfruta de la mejor pelota invernal del mundo, estadios históricos y el ambiente más festivo del Caribe.
                </p>
                <div className="flex gap-4">
                  <a href="#calendario">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                      Ver Juegos de Hoy
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Teams display */}
            <div className="mb-12">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" /> Equipos de la Liga
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {teams.map((team) => (
                  <Card key={team.name} className="overflow-hidden bg-card/60 border border-border group hover:border-blue-500/30 transition-all duration-300">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className={`w-12 h-12 rounded-full ${team.color} text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md`}>
                        {team.short}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-1 text-foreground">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.city}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px] bg-secondary/80">
                        {team.championships} Coronas
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Games Calendar */}
            <div id="calendario" className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" /> Próximos Partidos y Boletos
                </h2>
                <div className="space-y-4">
                  {mockGames.map((game) => (
                    <Card key={game.id} className="overflow-hidden bg-card/45 border border-border hover:border-primary/20 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          {/* Teams Matchup */}
                          <div className="flex items-center gap-6 flex-1 justify-center md:justify-start">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{game.homeLogo}</span>
                              <div className="text-center md:text-left">
                                <p className="font-bold text-sm md:text-base">{game.homeTeam}</p>
                                <p className="text-xs text-muted-foreground">Home</p>
                              </div>
                            </div>
                            
                            <span className="font-display font-black text-lg text-muted-foreground">VS</span>

                            <div className="flex items-center gap-3">
                              <div className="text-center md:text-right">
                                <p className="font-bold text-sm md:text-base">{game.awayTeam}</p>
                                <p className="text-xs text-muted-foreground">Visita</p>
                              </div>
                              <span className="text-3xl">{game.awayLogo}</span>
                            </div>
                          </div>

                          {/* Stadium & Status info */}
                          <div className="flex flex-col items-center md:items-end justify-center">
                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                              <MapPin className="h-3.5 w-3.5 text-primary" /> {game.stadium}
                            </p>
                            {game.status === "live" ? (
                              <Badge className="bg-red-500 text-white font-bold animate-pulse text-[10px]">
                                {game.score}
                              </Badge>
                            ) : (
                              <p className="text-sm font-bold text-foreground">
                                {game.date} • {game.time}
                              </p>
                            )}
                          </div>

                          {/* Booking trigger button */}
                          <div>
                            <Button
                              onClick={() => handlePurchaseTrigger(game)}
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 w-full md:w-auto text-xs"
                            >
                              <CreditCard className="h-3.5 w-3.5" /> Comprar Boletos
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Stadium Directory */}
              <div>
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" /> Estadios Principales
                </h2>
                <div className="space-y-4">
                  {stadiums.map((stad) => (
                    <Card key={stad.name} className="bg-card/50 border border-border">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold">{stad.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" /> {stad.city}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-1.5">
                        <div className="flex justify-between">
                          <span>Capacidad:</span>
                          <span className="font-semibold text-foreground">{stad.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inaugurado:</span>
                          <span className="font-semibold text-foreground">{stad.inaugurated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sede de:</span>
                          <span className="font-semibold text-primary">{stad.home}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Ticket purchase parameters inside sheet/modal */}
            {selectedGame && isCheckoutOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <Card className="max-w-md w-full border border-border shadow-2xl bg-card">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg">Configurar Boletos</CardTitle>
                    <CardDescription>
                      {selectedGame.homeTeam} vs {selectedGame.awayTeam} en {selectedGame.stadium}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Zone selector */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Sector de Asientos</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Palcos A", "Preferencia", "Bleachers"].map((zone) => (
                          <button
                            key={zone}
                            type="button"
                            onClick={() => setTicketZone(zone)}
                            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                              ticketZone === zone 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "border-border hover:bg-secondary text-muted-foreground"
                            }`}
                          >
                            {zone}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity selector */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Cantidad de Entradas</label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                        >
                          -
                        </Button>
                        <span className="font-bold text-base w-8 text-center">{ticketQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                        >
                          +
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">Límite 10 por usuario</span>
                      </div>
                    </div>

                    {/* Pricing breakdown preview */}
                    <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Boletos ({ticketQuantity}x)</span>
                        <span className="font-semibold">RD$ {(getPrice() * ticketQuantity).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs border-t border-border/40 pt-2 font-bold text-foreground">
                        <span>Total estimado</span>
                        <span className="text-primary text-sm">RD$ {(getPrice() * ticketQuantity).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-border pt-4">
                      <Button variant="outline" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                        Cancelar
                      </Button>
                      
                      {/* Mount CheckoutModal directly inside */}
                      <CheckoutModal
                        isOpen={isCheckoutOpen}
                        onClose={() => setIsCheckoutOpen(false)}
                        onSuccess={handleCheckoutSuccess}
                        amount={getPrice() * ticketQuantity}
                        itemTitle={`Entradas LIDOM: ${selectedGame.homeTeam} vs ${selectedGame.awayTeam} (${ticketQuantity}x ${ticketZone})`}
                        itemType="activity"
                        itemId={selectedGame.id}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
