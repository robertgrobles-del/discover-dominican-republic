import { useState } from "react";
import { PlaneLanding, PlaneTakeoff, Search, Clock, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface FlightItem {
  flight: string;
  airline: string;
  route: string;
  scheduledTime: string;
  estimatedTime: string;
  terminal: string;
  gate: string;
  status: "on-time" | "boarding" | "landed" | "delayed" | "cancelled";
}

const INITIAL_ARRIVALS: FlightItem[] = [
  { flight: "DM 103", airline: "Arajet", route: "San José (SJO)", scheduledTime: "13:40", estimatedTime: "13:40", terminal: "TA", gate: "A4", status: "landed" },
  { flight: "AA 1422", airline: "American Airlines", route: "Miami (MIA)", scheduledTime: "14:15", estimatedTime: "14:20", terminal: "TB", gate: "B7", status: "landed" },
  { flight: "IB 6501", airline: "Iberia", route: "Madrid (MAD)", scheduledTime: "14:50", estimatedTime: "14:50", terminal: "TB", gate: "B2", status: "on-time" },
  { flight: "DL 1890", airline: "Delta Air Lines", route: "Nueva York (JFK)", scheduledTime: "15:20", estimatedTime: "15:45", terminal: "TA", gate: "A9", status: "delayed" },
  { flight: "AF 742", airline: "Air France", route: "París (CDG)", scheduledTime: "16:10", estimatedTime: "16:10", terminal: "TB", gate: "B1", status: "on-time" },
  { flight: "CM 128", airline: "Copa Airlines", route: "Ciudad de Panamá (PTY)", scheduledTime: "16:45", estimatedTime: "16:45", terminal: "TA", gate: "A6", status: "on-time" }
];

const INITIAL_DEPARTURES: FlightItem[] = [
  { flight: "DM 205", airline: "Arajet", route: "Bogotá (BOG)", scheduledTime: "14:00", estimatedTime: "14:00", terminal: "TA", gate: "A2", status: "boarding" },
  { flight: "AA 2452", airline: "American Airlines", route: "Miami (MIA)", scheduledTime: "14:45", estimatedTime: "14:45", terminal: "TB", gate: "B5", status: "boarding" },
  { flight: "B6 406", airline: "JetBlue", route: "Boston (BOS)", scheduledTime: "15:30", estimatedTime: "15:30", terminal: "TB", gate: "B8", status: "on-time" },
  { flight: "UA 987", airline: "United Airlines", route: "Houston (IAH)", scheduledTime: "16:00", estimatedTime: "16:00", terminal: "TA", gate: "A3", status: "on-time" },
  { flight: "UX 089", airline: "Air Europa", route: "Madrid (MAD)", scheduledTime: "19:15", estimatedTime: "19:15", terminal: "TB", gate: "B4", status: "on-time" }
];

export function LiveFlightStatusBoard() {
  const [mode, setMode] = useState<"arrivals" | "departures">("arrivals");
  const [filterQuery, setFilterQuery] = useState("");

  const flights = mode === "arrivals" ? INITIAL_ARRIVALS : INITIAL_DEPARTURES;
  const filtered = flights.filter(
    (f) =>
      f.flight.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.airline.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.route.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getStatusBadge = (status: FlightItem["status"]) => {
    switch (status) {
      case "landed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Aterrizó</Badge>;
      case "on-time":
        return <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30">A Tiempo</Badge>;
      case "boarding":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse">Abordando</Badge>;
      case "delayed":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">Retrasado</Badge>;
      case "cancelled":
        return <Badge className="bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border-neutral-500/30">Cancelado</Badge>;
    }
  };

  return (
    <div className="w-full bg-card rounded-3xl border border-border/80 shadow-lg overflow-hidden">
      {/* Header del tablero estilo FIDS moderno */}
      <div className="p-6 bg-muted/30 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-xl text-foreground">
              Monitor de Vuelos en Vivo
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Información en tiempo real de aeropuertos internacionales de República Dominicana.
          </p>
        </div>

        {/* Selector Llegadas / Salidas */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-muted rounded-2xl border border-border/60">
            <button
              onClick={() => setMode("arrivals")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "arrivals"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlaneLanding className="w-4 h-4" /> Llegadas
            </button>
            <button
              onClick={() => setMode("departures")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "departures"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlaneTakeoff className="w-4 h-4" /> Salidas
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtro Rápido */}
      <div className="p-4 bg-muted/10 border-b border-border/40 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por vuelo, ciudad o aerolínea..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/70 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
          Mostrando {filtered.length} vuelos activos
        </span>
      </div>

      {/* Tabla Interactiva de Vuelos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-bold border-b border-border/60">
              <th className="py-3 px-4">Hora</th>
              <th className="py-3 px-4">Vuelo</th>
              <th className="py-3 px-4">Aerolínea</th>
              <th className="py-3 px-4">{mode === "arrivals" ? "Origen" : "Destino"}</th>
              <th className="py-3 px-4 text-center">Puerta</th>
              <th className="py-3 px-4 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary/70" />
                      {item.scheduledTime}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400 group-hover:underline cursor-pointer">
                    {item.flight}
                  </td>
                  <td className="py-3.5 px-4 text-foreground/90">
                    {item.airline}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    {item.route}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-1 rounded-md bg-muted text-[11px] font-bold text-foreground">
                      {item.terminal} • {item.gate}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No se encontraron vuelos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
