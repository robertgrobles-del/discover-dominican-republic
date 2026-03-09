import { Car, Navigation, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface CityDistance {
  name: string;
  slug: string;
  distance: string;
  duration: string;
  via?: string;
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

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Approximate road distance (multiply straight-line by factor for DR terrain)
function roadDistance(km: number): number {
  return Math.round(km * 1.35);
}

// Estimate drive time based on road distance (avg ~60 km/h for DR roads)
function driveTime(km: number): string {
  const hours = km / 60;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

interface DistancesFromCitiesProps {
  latitude?: number;
  longitude?: number;
  destinationName: string;
  /** Custom distances override auto-calculation */
  customDistances?: CityDistance[];
}

export function DistancesFromCities({ latitude, longitude, destinationName, customDistances }: DistancesFromCitiesProps) {
  if (!latitude || !longitude) return null;

  const distances: CityDistance[] = customDistances || majorCities
    .map(city => {
      const straightKm = haversine(latitude, longitude, city.lat, city.lng);
      const roadKm = roadDistance(straightKm);
      // Skip if too close (same city) or too far
      if (roadKm < 10) return null;
      return {
        name: city.name,
        slug: city.slug,
        distance: `${roadKm} km`,
        duration: driveTime(roadKm),
      };
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(a!.distance) - parseInt(b!.distance))
    .slice(0, 6) as CityDistance[];

  if (distances.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Navigation className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Cómo llegar a {destinationName}
            </h2>
            <p className="text-sm text-muted-foreground">Distancias desde las principales ciudades</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {distances.map((city) => (
            <Link
              key={city.slug}
              to={`/destino/${city.slug}`}
              className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  Desde {city.name}
                </p>
                {city.via && (
                  <p className="text-xs text-muted-foreground">vía {city.via}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-foreground text-sm">{city.distance}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{city.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Distancias y tiempos aproximados por carretera. Pueden variar según condiciones del tráfico.
        </p>
      </div>
    </section>
  );
}
