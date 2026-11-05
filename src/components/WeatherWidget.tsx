import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, CloudLightning, Droplets, Wind } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchApi } from "@/lib/fastifyClient";

/** Ciudad de `GET /live/weather` (backend/src/modules/weather/service.ts). */
interface LiveWeather {
  location: string;
  name: string;
  temperature_c: number | null;
  feels_like_c: number | null;
  humidity: number | null;
  wind_kmh: number | null;
  /** Texto del proveedor (p. ej. «nubes dispersas»). */
  condition: string;
  /** Código de icono de OpenWeather (`01d`, `10n`…). */
  icon: string | null;
  observed_at: string;
  /** Observación de hace más de 3 horas. */
  stale: boolean;
}

/** Icono según el código de OpenWeather: 01 despejado, 02–04 nubes, 09/10 lluvia, 11 tormenta. */
const getWeatherIcon = (icon: string | null, className: string) => {
  const code = icon?.slice(0, 2);
  if (code === "01") return <Sun className={className} />;
  if (code === "09" || code === "10") return <CloudRain className={className} />;
  if (code === "11") return <CloudLightning className={className} />;
  return <Cloud className={className} />;
};

const temp = (c: number | null) => (c === null ? "—" : `${Math.round(c)}°`);

export function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState(0);
  const [rdTime, setRdTime] = useState("");
  const [showTimeMode, setShowTimeMode] = useState(false);

  const { data: cities = [] } = useQuery({
    queryKey: ["live-weather"],
    queryFn: async () => (await fetchApi<{ data: LiveWeather[] }>("/live/weather")).data.filter((c) => c.temperature_c !== null),
    staleTime: 10 * 60_000,
    retry: false,
  });
  const weather = cities.length ? cities[selectedCity % cities.length] : null;

  useEffect(() => {
    const updateTime = () => {
      // Formato oficial hora RD (America/Santo_Domingo UTC-4)
      const formatter = new Intl.DateTimeFormat("es-DO", {
        timeZone: "America/Santo_Domingo",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      setRdTime(formatter.format(new Date()));
    };

    updateTime();
    const timer = setInterval(updateTime, 30000); // Cada 30 seg
    return () => clearInterval(timer);
  }, []);

  // Alternar: clima de una ciudad -> hora oficial RD -> siguiente ciudad... Sin datos de clima sólo se muestra la hora.
  useEffect(() => {
    if (!cities.length) return;
    const interval = setInterval(() => {
      setShowTimeMode((prev) => {
        if (prev) setSelectedCity((c) => (c + 1) % cities.length);
        return !prev;
      });
    }, 4000); // 4 segundos cada estado para lectura cómoda

    return () => clearInterval(interval);
  }, [cities.length]);

  const timeOnly = showTimeMode || !weather;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 hover:bg-black/50 border border-white/20 transition-all text-xs text-white shadow-xs backdrop-blur-sm cursor-pointer select-none min-w-[130px] justify-center"
          title="Ver hora oficial y clima de RD"
        >
          {timeOnly ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-amber-400 text-xs">🕒</span>
              <span className="font-semibold text-white tracking-wide">RD:</span>
              <span className="text-amber-300 font-mono text-xs font-bold">{rdTime || "--:--"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              {getWeatherIcon(weather.icon, "h-3.5 w-3.5 text-amber-400 shrink-0")}
              <span className="font-bold text-white">{temp(weather.temperature_c)}</span>
              <span className="text-white/90 text-2xs font-medium truncate max-w-[85px]">{weather.name}</span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-foreground">Clima y hora RD</h4>
            {rdTime && <p className="text-xs text-amber-500 font-medium">Hora local RD: {rdTime} (GMT-4)</p>}
          </div>

          {weather ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {cities.map((city, index) => (
                  <button
                    key={city.location}
                    onClick={() => setSelectedCity(index)}
                    className={`p-3 rounded-lg transition-colors text-left ${
                      weather.location === city.location
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getWeatherIcon(city.icon, "h-4 w-4 text-primary")}
                      <span className="font-semibold text-foreground text-lg">{temp(city.temperature_c)}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{city.name}</p>
                    <p className="text-xs text-muted-foreground first-letter:uppercase">{city.condition}</p>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="h-4 w-4" />
                    <span>Humedad: {weather.humidity ?? "—"}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wind className="h-4 w-4" />
                    <span>Viento: {weather.wind_kmh === null ? "—" : Math.round(weather.wind_kmh)} km/h</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {weather.stale ? "Datos de hace más de 3 horas; " : ""}observado a las{" "}
                  {new Date(weather.observed_at).toLocaleTimeString("es-DO", { timeZone: "America/Santo_Domingo", hour: "numeric", minute: "2-digit" })}.
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">El clima no está disponible en este momento. Consulta las condiciones locales antes de viajar.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
