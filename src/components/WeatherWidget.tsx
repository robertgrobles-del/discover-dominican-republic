import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Droplets, Wind } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WeatherData {
  city: string;
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  humidity: number;
  wind: number;
}

const mockWeatherData: WeatherData[] = [
  { city: "Santo Domingo", temp: 28, condition: "sunny", humidity: 65, wind: 12 },
  { city: "Punta Cana", temp: 30, condition: "sunny", humidity: 70, wind: 15 },
  { city: "Puerto Plata", temp: 27, condition: "partly-cloudy", humidity: 68, wind: 18 },
  { city: "Samaná", temp: 26, condition: "partly-cloudy", humidity: 72, wind: 10 },
];

const getWeatherIcon = (condition: WeatherData["condition"], className: string) => {
  switch (condition) {
    case "sunny":
      return <Sun className={className} />;
    case "cloudy":
      return <Cloud className={className} />;
    case "rainy":
      return <CloudRain className={className} />;
    case "partly-cloudy":
      return <Cloud className={className} />;
    default:
      return <Sun className={className} />;
  }
};

const getConditionLabel = (condition: WeatherData["condition"]) => {
  switch (condition) {
    case "sunny":
      return "Soleado";
    case "cloudy":
      return "Nublado";
    case "rainy":
      return "Lluvioso";
    case "partly-cloudy":
      return "Parcialmente nublado";
    default:
      return "Soleado";
  }
};

export function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState(0);
  const weather = mockWeatherData[selectedCity];
  const [rdTime, setRdTime] = useState("");
  const [showTimeMode, setShowTimeMode] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formato oficial hora RD (America/Santo_Domingo UTC-4)
      const formatter = new Intl.DateTimeFormat("es-DO", {
        timeZone: "America/Santo_Domingo",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      setRdTime(formatter.format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 30000); // Cada 30 seg
    return () => clearInterval(timer);
  }, []);

  // Alternar: Clima de la ciudad actual -> Hora oficial RD -> Siguiente ciudad Clima -> Hora oficial RD...
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTimeMode((prev) => {
        if (!prev) {
          // Si estaba mostrando clima, ahora muestra la hora
          return true;
        } else {
          // Si estaba mostrando la hora, avanza a la siguiente ciudad y muestra su clima
          setSelectedCity((c) => (c + 1) % mockWeatherData.length);
          return false;
        }
      });
    }, 4000); // 4 segundos cada estado para lectura cómoda

    return () => clearInterval(interval);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 hover:bg-black/50 border border-white/20 transition-all text-xs text-white shadow-xs backdrop-blur-sm cursor-pointer select-none min-w-[130px] justify-center"
          title="Ver hora oficial y referencias de clima de RD"
        >
          {showTimeMode ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-amber-400 text-xs">🕒</span>
              <span className="font-semibold text-white tracking-wide">RD:</span>
              <span className="text-amber-300 font-mono text-xs font-bold">{rdTime || "--:--"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              {getWeatherIcon(weather.condition, "h-3.5 w-3.5 text-amber-400 shrink-0")}
              <span className="font-bold text-white">Ejemplo</span>
              <span className="text-white/90 text-[11px] font-medium truncate max-w-[85px]">{weather.city}</span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-foreground">Clima referencial y hora RD</h4>
              {rdTime && <p className="text-xs text-amber-500 font-medium">Hora local RD: {rdTime} (GMT-4)</p>}
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">Datos de ejemplo</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {mockWeatherData.map((city, index) => (
              <button
                key={city.city}
                onClick={() => setSelectedCity(index)}
                className={`p-3 rounded-lg transition-colors text-left ${
                  selectedCity === index
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-secondary/50 hover:bg-secondary border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getWeatherIcon(city.condition, "h-4 w-4 text-primary")}
                  <span className="font-semibold text-foreground text-lg">{city.temp}°</span>
                </div>
                <p className="text-sm font-medium text-foreground">{city.city}</p>
                <p className="text-xs text-muted-foreground">{getConditionLabel(city.condition)}</p>
              </button>
            ))}
          </div>
          
          <div className="pt-3 border-t border-border">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Estas temperaturas son ilustrativas y no representan un pronóstico actual. Consulta las condiciones locales antes de viajar.
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="h-4 w-4" />
                <span>Humedad: {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind className="h-4 w-4" />
                <span>Viento: {weather.wind} km/h</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
