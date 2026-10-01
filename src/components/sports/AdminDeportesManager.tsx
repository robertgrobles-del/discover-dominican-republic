import { useState, useEffect } from "react";
import { 
  Trophy, Calendar, MapPin, Plus, Edit3, Trash2, CheckCircle2, 
  AlertTriangle, Clock, ShieldCheck, XCircle, Search, RefreshCw,
  Tv, Sparkles, Filter, Users, Flag, CloudRain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { trackEvent } from "@/hooks/useAnalytics";

export interface SportTournament {
  id: string;
  name: string;
  sport: "baseball" | "football" | "basketball" | "volleyball" | "golf" | "other";
  category: string;
  season: string;
  logo: string;
  is_active: boolean;
  teams: {
    id: string;
    name: string;
    short: string;
    city: string;
    logo: string;
    color: string;
  }[];
}

export interface SportGame {
  id: string;
  tournamentId: string;
  tournamentName: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  stadium: string;
  city: string;
  date: string;
  time: string;
  phase: string;
  status: "scheduled" | "live" | "postponed" | "cancelled" | "ended";
  statusNote?: string;
  homeScore?: number;
  awayScore?: number;
  liveInningOrPeriod?: string;
  broadcastChannel?: string;
  ticketPrice?: string;
  linkedEventId?: string;
}

export const DEFAULT_TOURNAMENTS: SportTournament[] = [
  {
    id: "lidom-2026",
    name: "LIDOM - Liga Dominicana de Béisbol Profesional",
    sport: "baseball",
    category: "Béisbol Invernal Profesional",
    season: "2025-2026",
    logo: "⚾",
    is_active: true,
    teams: [
      { id: "lic", name: "Tigres del Licey", short: "LIC", city: "Santo Domingo", logo: "🐯", color: "#0033A0" },
      { id: "agu", name: "Águilas Cibaeñas", short: "AGU", city: "Santiago de los Caballeros", logo: "🦅", color: "#F7A800" },
      { id: "esc", name: "Leones del Escogido", short: "ESC", city: "Santo Domingo", logo: "🦁", color: "#DA291C" },
      { id: "est", name: "Estrellas Orientales", short: "EST", city: "San Pedro de Macorís", logo: "⭐", color: "#006A4E" },
      { id: "tor", name: "Toros del Este", short: "TOR", city: "La Romana", logo: "🐂", color: "#E05A10" },
      { id: "gig", name: "Gigantes del Cibao", short: "GIG", city: "San Francisco de Macorís", logo: "🐎", color: "#4A154B" }
    ]
  },
  {
    id: "ldf-2026",
    name: "LDF - Liga Dominicana de Fútbol",
    sport: "football",
    category: "Fútbol Profesional de Primera División",
    season: "Temporada 2026",
    logo: "⚽",
    is_active: true,
    teams: [
      { id: "cibao-fc", name: "Cibao FC", short: "CIB", city: "Santiago", logo: "🟠", color: "#FF6600" },
      { id: "club-atletico-pantoja", name: "Club Atlético Pantoja", short: "PAN", city: "Santo Domingo", logo: "🟡", color: "#FFCC00" },
      { id: "atletico-vega-real", name: "Atlético Vega Real", short: "VR", city: "La Vega", logo: "🔴", color: "#CC0000" },
      { id: "atletico-san-cristobal", name: "Atlético San Cristóbal", short: "SC", city: "San Cristóbal", logo: "⚪", color: "#333333" },
      { id: "moca-fc", name: "Moca FC", short: "MOC", city: "Moca", logo: "⚫", color: "#111111" },
      { id: "atlantico-fc", name: "Atlántico FC", short: "ATL", city: "Puerto Plata", logo: "🔵", color: "#0066CC" }
    ]
  },
  {
    id: "lnb-2026",
    name: "LNB - Liga Nacional de Baloncesto",
    sport: "basketball",
    category: "Baloncesto Superior Dominicano",
    season: "Circuito 2026",
    logo: "🏀",
    is_active: true,
    teams: [
      { id: "reales-la-vega", name: "Reales de La Vega", short: "REA", city: "La Vega", logo: "👑", color: "#0047AB" },
      { id: "titanes-distrito", name: "Titanes del Distrito", short: "TIT", city: "Santo Domingo", logo: "⚡", color: "#008080" },
      { id: "soles-santo-domingo", name: "Soles de Santo Domingo Este", short: "SOL", city: "Santo Domingo Este", logo: "☀️", color: "#FFA500" },
      { id: "leones-santo-domingo", name: "Leones de Santo Domingo", short: "LEO", city: "Santo Domingo", logo: "🦁", color: "#C41E3A" },
      { id: "indios-san-francisco", name: "Indios de San Francisco", short: "IND", city: "San Francisco de Macorís", logo: "🏹", color: "#800020" },
      { id: "marineros-puerto-plata", name: "Marineros de Puerto Plata", short: "MAR", city: "Puerto Plata", logo: "⚓", color: "#002366" }
    ]
  }
];

export const DEFAULT_GAMES: SportGame[] = [
  {
    id: "game-lidom-1",
    tournamentId: "lidom-2026",
    tournamentName: "LIDOM",
    sport: "baseball",
    homeTeam: "Tigres del Licey",
    awayTeam: "Águilas Cibaeñas",
    homeLogo: "🐯",
    awayLogo: "🦅",
    stadium: "Estadio Quisqueya Juan Marichal",
    city: "Santo Domingo",
    date: "Hoy",
    time: "19:15",
    phase: "Round Robin - Semifinal",
    status: "live",
    homeScore: 4,
    awayScore: 3,
    liveInningOrPeriod: "Alta del 8vo Inning (2 Outs)",
    broadcastChannel: "Digital 15 / Licey TV / MLB.TV",
    ticketPrice: "Desde RD$ 350 Bleachers / RD$ 1,500 Palcos"
  },
  {
    id: "game-lidom-2",
    tournamentId: "lidom-2026",
    tournamentName: "LIDOM",
    sport: "baseball",
    homeTeam: "Estrellas Orientales",
    awayTeam: "Toros del Este",
    homeLogo: "⭐",
    awayLogo: "🐂",
    stadium: "Estadio Tetelo Vargas",
    city: "San Pedro de Macorís",
    date: "Hoy",
    time: "19:30",
    phase: "Round Robin - Semifinal",
    status: "postponed",
    statusNote: "Pospuesto por fuertes lluvias en San Pedro de Macorís. Reprogramado como doble cartelera mañana 4:00 PM.",
    broadcastChannel: "Coral 39 / Estrellas TV",
    ticketPrice: "Desde RD$ 300"
  },
  {
    id: "game-lidom-3",
    tournamentId: "lidom-2026",
    tournamentName: "LIDOM",
    sport: "baseball",
    homeTeam: "Gigantes del Cibao",
    awayTeam: "Leones del Escogido",
    homeLogo: "🐎",
    awayLogo: "🦁",
    stadium: "Estadio Julián Javier",
    city: "San Francisco de Macorís",
    date: "Mañana",
    time: "19:00",
    phase: "Round Robin - Semifinal",
    status: "scheduled",
    broadcastChannel: "CERTV Canal 4 / CDN Deportes",
    ticketPrice: "Desde RD$ 300"
  },
  {
    id: "game-ldf-1",
    tournamentId: "ldf-2026",
    tournamentName: "LDF",
    sport: "football",
    homeTeam: "Cibao FC",
    awayTeam: "Club Atlético Pantoja",
    homeLogo: "🟠",
    awayLogo: "🟡",
    stadium: "Estadio Cibao FC (PUCMM)",
    city: "Santiago",
    date: "Sábado 27",
    time: "18:00",
    phase: "Jornada 14 - Liguilla",
    status: "scheduled",
    broadcastChannel: "LDF TV en Vivo (YouTube)",
    ticketPrice: "Entrada General RD$ 250"
  },
  {
    id: "game-lnb-1",
    tournamentId: "lnb-2026",
    tournamentName: "LNB",
    sport: "basketball",
    homeTeam: "Reales de La Vega",
    awayTeam: "Titanes del Distrito",
    homeLogo: "👑",
    awayLogo: "⚡",
    stadium: "Polideportivo Fernando Teruel",
    city: "La Vega",
    date: "Domingo 28",
    time: "20:00",
    phase: "Serie Regular",
    status: "scheduled",
    broadcastChannel: "CDN Deportes / LNB YouTube",
    ticketPrice: "RD$ 200 - RD$ 600"
  }
];

export function AdminDeportesManager() {
  const [tournaments, setTournaments] = useState<SportTournament[]>(DEFAULT_TOURNAMENTS);
  const [games, setGames] = useState<SportGame[]>(DEFAULT_GAMES);
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Game editing modal state
  const [editingGame, setEditingGame] = useState<SportGame | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isNewGame, setIsNewGame] = useState(false);

  // Tournament creation modal state
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [newTournName, setNewTournName] = useState("");
  const [newTournSport, setNewTournSport] = useState<SportTournament["sport"]>("baseball");
  const [newTournCategory, setNewTournCategory] = useState("");
  const [newTournSeason, setNewTournSeason] = useState("2026");

  // Form states for game
  const [formData, setFormData] = useState<Partial<SportGame>>({});

  // Load from local storage / Supabase
  const loadData = () => {
    try {
      const storedTournaments = JSON.parse(localStorage.getItem("dr_sports_tournaments") || "null");
      const storedGames = JSON.parse(localStorage.getItem("dr_sports_games") || "null");

      if (storedTournaments) setTournaments(storedTournaments);
      else localStorage.setItem("dr_sports_tournaments", JSON.stringify(DEFAULT_TOURNAMENTS));

      if (storedGames) setGames(storedGames);
      else localStorage.setItem("dr_sports_games", JSON.stringify(DEFAULT_GAMES));
    } catch (err) {
      console.error("Error loading sports data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveGames = (updated: SportGame[]) => {
    setGames(updated);
    localStorage.setItem("dr_sports_games", JSON.stringify(updated));
  };

  const saveTournaments = (updated: SportTournament[]) => {
    setTournaments(updated);
    localStorage.setItem("dr_sports_tournaments", JSON.stringify(updated));
  };

  const handleOpenNewGame = () => {
    setIsNewGame(true);
    const defaultTourn = tournaments[0];
    setFormData({
      id: `game-${Date.now()}`,
      tournamentId: defaultTourn?.id || "lidom-2026",
      tournamentName: defaultTourn?.name?.split(" - ")[0] || "LIDOM",
      sport: defaultTourn?.sport || "baseball",
      homeTeam: defaultTourn?.teams[0]?.name || "Tigres del Licey",
      awayTeam: defaultTourn?.teams[1]?.name || "Águilas Cibaeñas",
      homeLogo: defaultTourn?.teams[0]?.logo || "🐯",
      awayLogo: defaultTourn?.teams[1]?.logo || "🦅",
      stadium: "Estadio Quisqueya Juan Marichal",
      city: "Santo Domingo",
      date: "Hoy",
      time: "19:30",
      phase: "Serie Regular",
      status: "scheduled",
      homeScore: 0,
      awayScore: 0,
      broadcastChannel: "CDN Deportes",
      ticketPrice: "Desde RD$ 350"
    });
    setIsGameModalOpen(true);
  };

  const handleOpenEditGame = (game: SportGame) => {
    setIsNewGame(false);
    setEditingGame(game);
    setFormData({ ...game });
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.homeTeam || !formData.awayTeam || !formData.stadium || !formData.date) {
      toast.error("Por favor completa los campos obligatorios del partido.");
      return;
    }

    const currentTournament = tournaments.find((t) => t.id === formData.tournamentId);

    const gameRecord: SportGame = {
      id: formData.id || `game-${Date.now()}`,
      tournamentId: formData.tournamentId || "lidom-2026",
      tournamentName: currentTournament ? currentTournament.name.split(" - ")[0] : (formData.tournamentName || "LIDOM"),
      sport: currentTournament ? currentTournament.sport : (formData.sport || "baseball"),
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      homeLogo: formData.homeLogo || "🏆",
      awayLogo: formData.awayLogo || "🏆",
      stadium: formData.stadium,
      city: formData.city || "República Dominicana",
      date: formData.date,
      time: formData.time || "19:30",
      phase: formData.phase || "Serie Regular",
      status: formData.status || "scheduled",
      statusNote: formData.statusNote || "",
      homeScore: Number(formData.homeScore || 0),
      awayScore: Number(formData.awayScore || 0),
      liveInningOrPeriod: formData.liveInningOrPeriod || "",
      broadcastChannel: formData.broadcastChannel || "",
      ticketPrice: formData.ticketPrice || "",
      linkedEventId: formData.linkedEventId || ""
    };

    let updatedList: SportGame[];
    if (isNewGame) {
      updatedList = [gameRecord, ...games];
      toast.success("¡Enfrentamiento calendarizado con éxito!");
    } else {
      updatedList = games.map((g) => (g.id === gameRecord.id ? gameRecord : g));
      toast.success("¡Estado del partido actualizado!");
    }

    saveGames(updatedList);

    trackEvent("click", { action: "sports_game_updated", status: gameRecord.status });

    setIsGameModalOpen(false);
  };

  const handleDeleteGame = (id: string) => {
    const updated = games.filter((g) => g.id !== id);
    saveGames(updated);
    toast.success("Partido eliminado del calendario deportivo.");
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournName.trim()) {
      toast.error("Por favor ingresa el nombre del torneo.");
      return;
    }

    const sportLogos: Record<string, string> = {
      baseball: "⚾",
      football: "⚽",
      basketball: "🏀",
      volleyball: "🏐",
      golf: "⛳",
      other: "🏆"
    };

    const newTournament: SportTournament = {
      id: `tourn-${Date.now()}`,
      name: newTournName.trim(),
      sport: newTournSport,
      category: newTournCategory.trim() || "Torneo Deportivo Oficial",
      season: newTournSeason.trim() || "2026",
      logo: sportLogos[newTournSport] || "🏆",
      is_active: true,
      teams: [
        { id: `t1-${Date.now()}`, name: "Equipo Local A", short: "T1", city: "Santo Domingo", logo: "🔵", color: "#0066CC" },
        { id: `t2-${Date.now()}`, name: "Equipo Visitante B", short: "T2", city: "Santiago", logo: "🔴", color: "#CC0000" }
      ]
    };

    const updated = [...tournaments, newTournament];
    saveTournaments(updated);
    toast.success(`¡Torneo "${newTournament.name}" creado con éxito!`);

    setNewTournName("");
    setNewTournCategory("");
    setIsTournamentModalOpen(false);
  };

  const filteredGames = games.filter((g) => {
    const matchTourn = selectedTournamentFilter === "all" || g.tournamentId === selectedTournamentFilter;
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    const matchSearch = g.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.stadium.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tournamentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTourn && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              ADMINISTRACIÓN DEPORTIVA RD
            </Badge>
            <Badge variant="outline" className="text-xs">
              LIDOM • LDF • LNB • Torneos
            </Badge>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">
            Gestión de Calendario Deportivo, Marcadores & Cancelaciones
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Calendariza enfrentamientos, modifica estados en tiempo real (Pospuesto por lluvia, Cancelado, En Vivo) y agrega nuevos torneos o ligas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsTournamentModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 font-semibold"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Agregar Torneo / Liga</span>
          </Button>

          <Button
            onClick={handleOpenNewGame}
            className="bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Calendarizar Partido</span>
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Torneos Activos</span>
              <p className="text-xl font-black text-foreground">{tournaments.length}</p>
            </div>
            <Trophy className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Partidos Totales</span>
              <p className="text-xl font-black text-primary">{games.length}</p>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">En Vivo Ahora</span>
              <p className="text-xl font-black text-emerald-500">
                {games.filter((g) => g.status === "live").length}
              </p>
            </div>
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Pospuestos / Lluvia</span>
              <p className="text-xl font-black text-amber-600">
                {games.filter((g) => g.status === "postponed" || g.status === "cancelled").length}
              </p>
            </div>
            <CloudRain className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar equipo o estadio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl text-xs h-9 bg-background"
            />
          </div>

          <Select value={selectedTournamentFilter} onValueChange={setSelectedTournamentFilter}>
            <SelectTrigger className="w-[180px] rounded-xl text-xs h-9 bg-background">
              <SelectValue placeholder="Todos los Torneos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Torneos ({tournaments.length})</SelectItem>
              {tournaments.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.logo} {t.name.split(" - ")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-xl text-xs h-9 bg-background">
              <SelectValue placeholder="Todos los Estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="scheduled">Programados</SelectItem>
              <SelectItem value="live">🔴 En Vivo</SelectItem>
              <SelectItem value="postponed">🌧️ Pospuesto por Lluvia</SelectItem>
              <SelectItem value="cancelled">❌ Cancelado</SelectItem>
              <SelectItem value="ended">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadData}
          className="rounded-xl text-xs h-9 gap-1 text-muted-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Recargar
        </Button>
      </div>

      {/* Games List */}
      <div className="space-y-3">
        {filteredGames.length === 0 ? (
          <Card className="rounded-3xl border-border p-8 text-center bg-card">
            <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold text-foreground">No hay partidos con los filtros seleccionados</p>
            <Button size="sm" onClick={handleOpenNewGame} className="mt-3 rounded-xl text-xs bg-primary text-slate-950">
              <Plus className="h-3.5 w-3.5 mr-1" /> Calendarizar Primer Juego
            </Button>
          </Card>
        ) : (
          filteredGames.map((game) => (
            <Card
              key={game.id}
              className={`rounded-2xl border transition-all ${
                game.status === "live"
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : game.status === "postponed"
                  ? "border-amber-500/50 bg-amber-500/5"
                  : game.status === "cancelled"
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-border bg-card"
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left: Tournament Badge & Matchup */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold bg-background">
                      {game.tournamentName} • {game.phase}
                    </Badge>
                    
                    {game.status === "live" && (
                      <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" /> EN VIVO
                      </Badge>
                    )}

                    {game.status === "postponed" && (
                      <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1">
                        <CloudRain className="h-3 w-3" /> POSPUESTO POR LLUVIA
                      </Badge>
                    )}

                    {game.status === "cancelled" && (
                      <Badge className="bg-red-500 text-white font-black text-[10px] gap-1">
                        <XCircle className="h-3 w-3" /> CANCELADO
                      </Badge>
                    )}

                    {game.status === "ended" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Finalizado
                      </Badge>
                    )}
                  </div>

                  {/* Teams and score */}
                  <div className="flex items-center gap-3">
                    <div className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                      <span>{game.homeLogo}</span>
                      <span>{game.homeTeam}</span>
                      {game.status === "live" || game.status === "ended" ? (
                        <span className="font-mono text-primary font-bold px-2 py-0.5 bg-primary/10 rounded-lg text-sm">
                          {game.homeScore}
                        </span>
                      ) : null}
                    </div>

                    <span className="text-xs font-bold text-muted-foreground uppercase">VS</span>

                    <div className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                      {game.status === "live" || game.status === "ended" ? (
                        <span className="font-mono text-primary font-bold px-2 py-0.5 bg-primary/10 rounded-lg text-sm">
                          {game.awayScore}
                        </span>
                      ) : null}
                      <span>{game.awayTeam}</span>
                      <span>{game.awayLogo}</span>
                    </div>
                  </div>

                  {/* Venue & Broadcast */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> {game.date} • {game.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-500" /> {game.stadium}, {game.city}
                    </span>
                    {game.broadcastChannel && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Tv className="h-3 w-3 text-cyan-400" /> {game.broadcastChannel}
                      </span>
                    )}
                  </div>

                  {/* Postponed / Status Note banner */}
                  {game.statusNote && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{game.statusNote}</span>
                    </div>
                  )}

                  {game.status === "live" && game.liveInningOrPeriod && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>⚾ {game.liveInningOrPeriod}</span>
                    </div>
                  )}
                </div>

                {/* Right: Quick actions */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditGame(game)}
                    className="rounded-xl text-xs gap-1.5 font-bold"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                    <span>Editar Estado / Marcador</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGame(game.id)}
                    className="rounded-xl text-xs text-red-500 hover:bg-red-500/10 h-8 px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* GAME MODAL (NEW / EDIT STATUS & SCORE) */}
      <Dialog open={isGameModalOpen} onOpenChange={setIsGameModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-1 w-fit">
              <Trophy className="h-3.5 w-3.5" /> Panel de Control de Partido
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              {isNewGame ? "Calendarizar Nuevo Enfrentamiento" : "Modificar Estado & Marcador del Partido"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Actualiza las condiciones del juego en tiempo real para informar a los fanáticos y turistas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveGame} className="space-y-4">
            {/* Tournament Selector */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Torneo / Liga</Label>
                <Select
                  value={formData.tournamentId}
                  onValueChange={(val) => {
                    const tourn = tournaments.find((t) => t.id === val);
                    setFormData({
                      ...formData,
                      tournamentId: val,
                      tournamentName: tourn ? tourn.name.split(" - ")[0] : "LIDOM",
                      sport: tourn?.sport || "baseball"
                    });
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tournaments.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.logo} {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Fase del Torneo</Label>
                <Input
                  placeholder="Ej. Serie Regular / Round Robin / Gran Final"
                  value={formData.phase || ""}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Teams */}
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Equipo / País Local (Home)</Label>
                <Input
                  placeholder="Ej. Tigres del Licey / Cibao FC"
                  value={formData.homeTeam || ""}
                  onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  required
                  className="rounded-xl text-xs bg-background"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Equipo / País Visitante (Away)</Label>
                <Input
                  placeholder="Ej. Águilas Cibaeñas / Pantoja"
                  value={formData.awayTeam || ""}
                  onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  required
                  className="rounded-xl text-xs bg-background"
                />
              </div>
            </div>

            {/* Status & Scores */}
            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-foreground mb-1 block">Estado del Partido *</Label>
                  <Select
                    value={formData.status || "scheduled"}
                    onValueChange={(val: SportGame["status"]) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="rounded-xl text-xs font-bold bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">🗓️ Programado</SelectItem>
                      <SelectItem value="live">🔴 En Vivo</SelectItem>
                      <SelectItem value="postponed">🌧️ Pospuesto por Lluvia / Clima</SelectItem>
                      <SelectItem value="cancelled">❌ Cancelado Oficialmente</SelectItem>
                      <SelectItem value="ended">✅ Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">Carreras / Goles Local</Label>
                  <Input
                    type="number"
                    value={formData.homeScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value, 10) || 0 })}
                    className="rounded-xl text-xs bg-background font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">Carreras / Goles Visitante</Label>
                  <Input
                    type="number"
                    value={formData.awayScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value, 10) || 0 })}
                    className="rounded-xl text-xs bg-background font-mono font-bold"
                  />
                </div>
              </div>

              {/* Status Note for Postponed / Rain */}
              {(formData.status === "postponed" || formData.status === "cancelled") && (
                <div>
                  <Label className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 block">
                    Aviso Oficial de Suspensión / Reprogramación *
                  </Label>
                  <Textarea
                    placeholder="Ej. Pospuesto por fuertes lluvias. Se jugará mañana como doble cartelera a partir de las 4:00 PM."
                    value={formData.statusNote || ""}
                    onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
                    className="rounded-xl text-xs bg-background"
                    rows={2}
                  />
                </div>
              )}

              {formData.status === "live" && (
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">Detalle En Vivo</Label>
                  <Input
                    placeholder="Ej. Alta del 8vo Inning (2 Outs, Hombres en 1ra y 2da) / Minuto 68"
                    value={formData.liveInningOrPeriod || ""}
                    onChange={(e) => setFormData({ ...formData, liveInningOrPeriod: e.target.value })}
                    className="rounded-xl text-xs bg-background"
                  />
                </div>
              )}
            </div>

            {/* Stadium, Date, Time & TV */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Estadio / Sede</Label>
                <Input
                  placeholder="Estadio Quisqueya Juan Marichal"
                  value={formData.stadium || ""}
                  onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Ciudad / Provincia</Label>
                <Input
                  placeholder="Santo Domingo"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Fecha</Label>
                <Input
                  placeholder="Hoy / 25 de Octubre 2026"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Hora</Label>
                <Input
                  placeholder="19:30"
                  value={formData.time || ""}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Transmisión TV / Streaming</Label>
                <Input
                  placeholder="Digital 15 / CDN Deportes / MLB.TV"
                  value={formData.broadcastChannel || ""}
                  onChange={(e) => setFormData({ ...formData, broadcastChannel: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Precios de Boletas</Label>
                <Input
                  placeholder="Desde RD$ 350 Bleachers / RD$ 1,500 Palcos"
                  value={formData.ticketPrice || ""}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setIsGameModalOpen(false)} className="rounded-xl text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-slate-950 font-bold rounded-xl text-xs px-6">
                Guardar y Publicar Partido
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* NEW TOURNAMENT MODAL */}
      <Dialog open={isTournamentModalOpen} onOpenChange={setIsTournamentModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold mb-1 w-fit">
              <Trophy className="h-3.5 w-3.5" /> Nueva Competición
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Crear Torneo o Liga Deportiva
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Agrega una nueva disciplina o competición oficial (ej. LDF, LNB, PGA Tour Corales, Clásico Mundial).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1 block">Nombre de la Liga / Torneo *</Label>
              <Input
                placeholder="Ej. Torneo de Baloncesto Superior del Distrito (TBS)"
                value={newTournName}
                onChange={(e) => setNewTournName(e.target.value)}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-foreground mb-1 block">Disciplina Deportiva</Label>
              <Select value={newTournSport} onValueChange={(val: SportTournament["sport"]) => setNewTournSport(val)}>
                <SelectTrigger className="rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseball">⚾ Béisbol</SelectItem>
                  <SelectItem value="football">⚽ Fútbol (LDF)</SelectItem>
                  <SelectItem value="basketball">🏀 Baloncesto (LNB / TBS)</SelectItem>
                  <SelectItem value="volleyball">🏐 Voleibol</SelectItem>
                  <SelectItem value="golf">⛳ Golf (PGA Tour)</SelectItem>
                  <SelectItem value="other">🏆 Otro Deporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-foreground mb-1 block">Categoría / Descripción</Label>
              <Input
                placeholder="Ej. Baloncesto Profesional de Primera División"
                value={newTournCategory}
                onChange={(e) => setNewTournCategory(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-foreground mb-1 block">Temporada / Año</Label>
              <Input
                placeholder="2026"
                value={newTournSeason}
                onChange={(e) => setNewTournSeason(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsTournamentModalOpen(false)} className="rounded-xl text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-slate-950 font-bold rounded-xl text-xs">
                Crear Torneo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
