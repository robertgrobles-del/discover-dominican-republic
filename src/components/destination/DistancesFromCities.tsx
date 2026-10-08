import { Car, Navigation, Clock, MapPin, Plane, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { haversineDistance, estimateRoadDistanceKm, formatDriveTime } from "@/lib/geoDistance";

interface CityDistance {
  name: string;
  slug: string;
  distance: string;
  duration: string;
  via?: string;
  code?: string;
}

// Major cities with coordinates for distance calculation
const majorCities = [
  { name: "Santo Domingo", slug: "santo-domingo", lat: 18.4861, lng: -69.9312 },
  { name: "Santiago", slug: "santiago", lat: 19.4517, lng: -70.6970 },
  { name: "Punta Cana", slug: "punta-cana", lat: 18.5601, lng: -68.3725 },
  { name: "Puerto Plata", slug: "puerto-plata", lat: 19.7934, lng: -70.6884 },
  { name: "La Romana", slug: "la-romana", lat: 18.4274, lng: -68.9728 },
  { name: "Samaná", slug: "samana", lat: 19.2058, lng: -69.3322 },
  { name: "San Juan de la Maguana", slug: "san-juan", lat: 18.8058, lng: -71.2297 },
  { name: "Higüey", slug: "higuey", lat: 18.6152, lng: -68.7078 },
];

// Major international airports in Dominican Republic
const majorAirports = [
  { name: "Aeropuerto Las Américas (SDQ)", code: "SDQ", slug: "aeropuerto-sdq", lat: 18.4297, lng: -69.6689, city: "Santo Domingo" },
  { name: "Aeropuerto de Punta Cana (PUJ)", code: "PUJ", slug: "aeropuerto-puj", lat: 18.5674, lng: -68.3634, city: "Punta Cana" },
  { name: "Aeropuerto del Cibao (STI)", code: "STI", slug: "aeropuerto-sti", lat: 19.4069, lng: -70.6044, city: "Santiago" },
  { name: "Aeropuerto Gregorio Luperón (POP)", code: "POP", slug: "aeropuerto-pop", lat: 19.7579, lng: -70.5700, city: "Puerto Plata" },
  { name: "Aeropuerto de La Romana (LRM)", code: "LRM", slug: "aeropuerto-lrm", lat: 18.4506, lng: -68.9119, city: "La Romana" },
  { name: "Aeropuerto El Catey (AZS)", code: "AZS", slug: "aeropuerto-azs", lat: 19.2706, lng: -69.7419, city: "Samaná" },
];

interface DistancesFromCitiesProps {
  latitude?: number;
  longitude?: number;
  destinationName: string;
  /** Custom distances override auto-calculation */
  customDistances?: CityDistance[];
}

export function DistancesFromCities({ latitude, longitude, destinationName, customDistances }: DistancesFromCitiesProps) {
  const [activeTab, setActiveTab] = useState<"cities" | "airports">("cities");

  if (!latitude || !longitude) return null;

  const distances: CityDistance[] = customDistances || majorCities
    .map(city => {
      const straightKm = haversineDistance(latitude, longitude, city.lat, city.lng);
      const roadKm = estimateRoadDistanceKm(straightKm);
      if (roadKm < 10) return null;
      return {
        name: city.name,
        slug: city.slug,
        distance: `${roadKm} km`,
        duration: formatDriveTime(roadKm),
      };
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(a!.distance) - parseInt(b!.distance))
    .slice(0, 6) as CityDistance[];

  const airportDistances: CityDistance[] = majorAirports
    .map(airport => {
      const straightKm = haversineDistance(latitude, longitude, airport.lat, airport.lng);
      const roadKm = estimateRoadDistanceKm(straightKm);
      return {
        name: airport.name,
        code: airport.code,
        slug: airport.slug,
        distance: `${roadKm} km`,
        duration: formatDriveTime(roadKm),
      };
    })
    .sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
    .slice(0, 4);

  const displayList = activeTab === "cities" ? distances : airportDistances;

  if (displayList.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Cómo llegar a {destinationName}
              </h2>
              <p className="text-sm text-muted-foreground">Distancias y tiempos de traslado estimados</p>
            </div>
          </div>

          {/* Toggle Cities / Airports */}
          <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("cities")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "cities" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Car className="h-3.5 w-3.5" /> Principales Ciudades
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("airports")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "airports" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plane className="h-3.5 w-3.5" /> Aeropuertos (AIT)
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((item) => (
            <div
              key={item.slug}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                {activeTab === "airports" ? (
                  <Plane className="h-5 w-5 text-primary" />
                ) : (
                  <Car className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                  {item.name}
                </p>
                {item.code && (
                  <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                    Código IATA: {item.code}
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-foreground text-sm font-mono">{item.distance}</p>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>{item.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Tiempos aproximados por carretera. Se recomienda coordinar traslados con operadores de taxi y transfer certificados.
        </p>
      </div>
    </section>
  );
}
