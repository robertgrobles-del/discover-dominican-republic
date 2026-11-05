import { useState } from "react";
import { Plane, Calendar, Users, ArrowRightLeft, Search, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DOMINICAN_AIRPORTS = [
  { code: "PUJ", city: "Punta Cana", name: "Aeropuerto Int. de Punta Cana" },
  { code: "SDQ", city: "Santo Domingo", name: "Aeropuerto Int. Las Américas" },
  { code: "STI", city: "Santiago", name: "Aeropuerto Int. del Cibao" },
  { code: "POP", city: "Puerto Plata", name: "Aeropuerto Int. Gregorio Luperón" },
  { code: "LRM", city: "La Romana", name: "Aeropuerto Int. de La Romana" },
  { code: "AZS", city: "Samaná", name: "Aeropuerto Int. Presidente Juan Bosch" },
  { code: "CBJ", city: "Pedernales", name: "Aeropuerto Int. Cabo Rojo" }
];

const POPULAR_ORIGINS = [
  { code: "JFK", city: "Nueva York", country: "EE.UU." },
  { code: "MIA", city: "Miami", country: "EE.UU." },
  { code: "MAD", city: "Madrid", country: "España" },
  { code: "BOG", city: "Bogotá", country: "Colombia" },
  { code: "YYZ", city: "Toronto", country: "Canadá" },
  { code: "CDG", city: "París", country: "Francia" }
];

export function FlightConnectionSearch() {
  const [tripType, setTripType] = useState<"round" | "oneway" | "domestic">("round");
  const [origin, setOrigin] = useState("MIA");
  const [destination, setDestination] = useState("PUJ");
  const [cabinClass, setCabinClass] = useState("economy");

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 sm:-mt-24 relative z-20 px-4">
      <div className="bg-background/85 dark:bg-card/90 backdrop-blur-xl border border-white/20 dark:border-border/60 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-primary/10">
        {/* Selector de modo y cabina */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/40">
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl">
            <button
              onClick={() => setTripType("round")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                tripType === "round"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ida y Vuelta
            </button>
            <button
              onClick={() => setTripType("oneway")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                tripType === "oneway"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Solo Ida
            </button>
            <button
              onClick={() => {
                setTripType("domestic");
                setOrigin("SDQ");
                setDestination("PUJ");
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                tripType === "domestic"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Vuelos Domésticos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="bg-muted/40 border border-border/50 text-xs font-medium rounded-xl px-3 py-1.5 text-foreground focus:outline-hidden"
            >
              <option value="economy">Clase Turista</option>
              <option value="premium">Premium Economy</option>
              <option value="business">Business / Ejecutiva</option>
            </select>
          </div>
        </div>

        {/* Barra de Campos */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 items-center">
          {/* Origen */}
          <div className="md:col-span-3 p-3 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/50 transition-colors">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" /> Origen
            </span>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-transparent font-bold text-sm sm:text-base text-foreground mt-1 focus:outline-hidden cursor-pointer"
            >
              {tripType === "domestic" ? (
                DOMINICAN_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code})
                  </option>
                ))
              ) : (
                POPULAR_ORIGINS.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.city} ({o.code}) - {o.country}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Botón de Intercambio */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs"
              title="Intercambiar ciudades"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destino */}
          <div className="md:col-span-3 p-3 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/50 transition-colors">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Plane className="w-3 h-3 text-primary" /> Destino en RD
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent font-bold text-sm sm:text-base text-foreground mt-1 focus:outline-hidden cursor-pointer"
            >
              {DOMINICAN_AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="md:col-span-3 p-3 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/50 transition-colors">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" /> Fechas estimadas
            </span>
            <p className="font-bold text-sm text-foreground mt-1 truncate">
              {tripType === "round" ? "Flexible • Próx. 30 días" : "Fecha única"}
            </p>
          </div>

          {/* Botón CTA */}
          <div className="md:col-span-2">
            <Button
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
              onClick={() => {
                const targetUrl = `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${destination}`;
                window.open(targetUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <Search className="w-4 h-4" />
              <span>Ver Vuelos</span>
            </Button>
          </div>
        </div>

        {/* Chips rápidos de rutas directas populares */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30 overflow-x-auto no-scrollbar">
          <span className="text-2xs font-semibold text-muted-foreground shrink-0">
            Rutas directas más buscadas:
          </span>
          {[
            { label: "MIA ➔ PUJ", o: "MIA", d: "PUJ" },
            { label: "JFK ➔ SDQ", o: "JFK", d: "SDQ" },
            { label: "MAD ➔ SDQ", o: "MAD", d: "SDQ" },
            { label: "BOG ➔ PUJ", o: "BOG", d: "PUJ" },
            { label: "SDQ ➔ PUJ (Doméstico)", o: "SDQ", d: "PUJ" }
          ].map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setOrigin(r.o);
                setDestination(r.d);
              }}
              className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary text-2xs font-medium text-muted-foreground transition-colors shrink-0"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
