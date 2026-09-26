export interface RoutePoint {
  value: string;
  label: string;
  lat: number;
  lng: number;
}

export interface FlightTime {
  ciudad: string;
  aeropuertoOrigen: string;
  aeropuertoDestino: string;
  tiempo: string;
  aerolineas: string;
}

export interface MaritimeRoute {
  id: string;
  nombre: string;
  tipo: string;
  ruta: string;
  frecuencia: string;
  duracion: string;
  precio: string;
  servicios: string[];
  descripcion: string;
  telefono: string;
}

export interface AirOperator {
  id: string;
  nombre: string;
  tipo: string;
  hub?: string;
  destinos?: string[];
  flota?: string;
  servicio?: string;
  descripcion: string;
}

export const tiemposVuelo: FlightTime[] = [
  { ciudad: "New York", aeropuertoOrigen: "JFK", aeropuertoDestino: "PUJ", tiempo: "3h 50m", aerolineas: "JetBlue, Delta, United" },
  { ciudad: "New York", aeropuertoOrigen: "EWR", aeropuertoDestino: "SDQ", tiempo: "3h 45m", aerolineas: "United, Spirit" },
  { ciudad: "Miami", aeropuertoOrigen: "MIA", aeropuertoDestino: "SDQ", tiempo: "2h 10m", aerolineas: "American, Arajet" },
  { ciudad: "Miami", aeropuertoOrigen: "MIA", aeropuertoDestino: "PUJ", tiempo: "2h 30m", aerolineas: "American, JetBlue" },
  { ciudad: "Madrid", aeropuertoOrigen: "MAD", aeropuertoDestino: "SDQ", tiempo: "8h 15m", aerolineas: "Iberia, Air Europa" },
  { ciudad: "Madrid", aeropuertoOrigen: "MAD", aeropuertoDestino: "PUJ", tiempo: "8h 45m", aerolineas: "Iberia, Evelop" },
  { ciudad: "Toronto", aeropuertoOrigen: "YYZ", aeropuertoDestino: "PUJ", tiempo: "4h 20m", aerolineas: "Air Canada, WestJet" },
  { ciudad: "Toronto", aeropuertoOrigen: "YYZ", aeropuertoDestino: "POP", tiempo: "4h 10m", aerolineas: "WestJet, Sunwing" },
  { ciudad: "Bogotá", aeropuertoOrigen: "BOG", aeropuertoDestino: "SDQ", tiempo: "2h 30m", aerolineas: "Avianca, Arajet" },
  { ciudad: "Panamá", aeropuertoOrigen: "PTY", aeropuertoDestino: "SDQ", tiempo: "2h 45m", aerolineas: "Copa Airlines" },
  { ciudad: "Frankfurt", aeropuertoOrigen: "FRA", aeropuertoDestino: "PUJ", tiempo: "9h 30m", aerolineas: "Condor, Eurowings" },
  { ciudad: "París", aeropuertoOrigen: "CDG", aeropuertoDestino: "PUJ", tiempo: "9h 00m", aerolineas: "Air France, Corsair" },
  { ciudad: "Fort Lauderdale", aeropuertoOrigen: "FLL", aeropuertoDestino: "SDQ", tiempo: "2h 15m", aerolineas: "Spirit, JetBlue" },
  { ciudad: "Boston", aeropuertoOrigen: "BOS", aeropuertoDestino: "PUJ", tiempo: "4h 05m", aerolineas: "JetBlue" },
  { ciudad: "Atlanta", aeropuertoOrigen: "ATL", aeropuertoDestino: "PUJ", tiempo: "3h 40m", aerolineas: "Delta" },
  { ciudad: "Charlotte", aeropuertoOrigen: "CLT", aeropuertoDestino: "PUJ", tiempo: "3h 30m", aerolineas: "American Airlines" },
  { ciudad: "Houston", aeropuertoOrigen: "IAH", aeropuertoDestino: "PUJ", tiempo: "4h 15m", aerolineas: "United" },
  { ciudad: "Montreal", aeropuertoOrigen: "YUL", aeropuertoDestino: "PUJ", tiempo: "4h 30m", aerolineas: "Air Canada, Air Transat" },
  { ciudad: "San Juan PR", aeropuertoOrigen: "SJU", aeropuertoDestino: "SDQ", tiempo: "0h 45m", aerolineas: "JetBlue, Cape Air" },
  { ciudad: "Lima", aeropuertoOrigen: "LIM", aeropuertoDestino: "SDQ", tiempo: "5h 30m", aerolineas: "LATAM, Arajet" },
  { ciudad: "México DF", aeropuertoOrigen: "MEX", aeropuertoDestino: "SDQ", tiempo: "4h 00m", aerolineas: "Arajet, Volaris" },
  { ciudad: "Londres", aeropuertoOrigen: "LGW", aeropuertoDestino: "PUJ", tiempo: "9h 15m", aerolineas: "TUI, Virgin Atlantic" },
];

export const opcionesTransporte = [
  { titulo: "Alquiler de Auto", subtitulo: "Ruta Autopista del Nordeste (Juan Pablo II)", etiqueta: "Recomendado", desc: "Flexibilidad total" },
  { titulo: "Bus Premium", subtitulo: "Caribe Tours / Metro", precio: "$10 - $15 USD", tiempo: "4h 00m" },
];

export const operadoresAereos: AirOperator[] = [
  {
    id: "air-century",
    nombre: "Air Century",
    tipo: "Aerolínea Comercial",
    hub: "JBQ (Santo Domingo)",
    destinos: ["PUJ", "STI", "BRX"],
    descripcion: "Vuelos regulares entre las principales ciudades."
  },
  {
    id: "helidosa",
    nombre: "Helidosa",
    tipo: "Air Taxi & Ambulancia",
    flota: "Helicópteros y Aviones",
    servicio: "VIP 24/7",
    descripcion: "Servicio privado de helicópteros y aviones ejecutivos."
  },
  {
    id: "reef-jet",
    nombre: "Reef Jet",
    tipo: "Vuelos Turísticos",
    destinos: ["Samaná", "Bahía de las Águilas"],
    descripcion: "Excursiones privadas a destinos exclusivos."
  }
];

export const rutasPopulares = [
  { ruta: "Santo Domingo → Samaná", precio: "Desde $85", tipo: "Vuelo directo", duracion: "45 min" },
  { ruta: "Punta Cana → Santo Domingo", precio: "Desde $110", tipo: "Vuelo directo", duracion: "35 min" },
  { ruta: "Santo Domingo → Pedernales", precio: "Cotizar", tipo: "Charter Privado", duracion: "55 min" }
];

export const viasMaritimas: MaritimeRoute[] = [
  {
    id: "ferry-del-caribe",
    nombre: "Ferries del Caribe",
    tipo: "Ferry Internacional",
    ruta: "San Juan (PR) ↔ Santo Domingo",
    frecuencia: "3 viajes semanales",
    duracion: "12-13 horas",
    precio: "Desde $99 USD",
    servicios: ["Camarotes", "Restaurante", "WiFi", "Vehículos"],
    descripcion: "Conexión marítima entre Puerto Rico y República Dominicana. Ideal para viajeros con vehículo propio.",
    telefono: "+1 787-494-3000"
  },
  {
    id: "cruceros-amber-cove",
    nombre: "Puerto Amber Cove",
    tipo: "Terminal de Cruceros",
    ruta: "Puertos internacionales → Puerto Plata",
    frecuencia: "Varios cruceros semanales",
    duracion: "Según itinerario",
    precio: "Incluido en crucero",
    servicios: ["Duty Free", "Excursiones", "Transporte", "Restaurantes"],
    descripcion: "Terminal de cruceros de clase mundial en la costa norte. Recibe las principales líneas de cruceros.",
    telefono: "+1 809-970-3373"
  },
  {
    id: "taino-bay",
    nombre: "Puerto Taino Bay",
    tipo: "Terminal de Cruceros",
    ruta: "Puertos internacionales → Puerto Plata",
    frecuencia: "Cruceros regulares",
    duracion: "Según itinerario",
    precio: "Incluido en crucero",
    servicios: ["Centro comercial", "Restaurantes", "Tours", "Teleférico"],
    descripcion: "Puerto turístico con acceso directo al teleférico y centro de Puerto Plata.",
    telefono: "+1 809-586-1500"
  },
  {
    id: "la-romana-port",
    nombre: "Puerto de La Romana",
    tipo: "Terminal de Cruceros",
    ruta: "Caribe Este → Casa de Campo",
    frecuencia: "Cruceros estacionales",
    duracion: "Según itinerario",
    precio: "Incluido en crucero",
    servicios: ["Marina", "Resort", "Golf", "Excursiones"],
    descripcion: "Acceso al exclusivo resort Casa de Campo y Altos de Chavón.",
    telefono: "+1 809-523-3333"
  }
];

export const rutasFerry = [
  { ruta: "San Juan → Santo Domingo", precio: "Desde $99", frecuencia: "Lu, Mi, Vi", duracion: "12h" },
  { ruta: "Santo Domingo → San Juan", precio: "Desde $99", frecuencia: "Ma, Ju, Sa", duracion: "12h" },
  { ruta: "Mayagüez → Santo Domingo", precio: "Desde $89", frecuencia: "Bajo demanda", duracion: "8h" }
];

export const routePoints: RoutePoint[] = [
  { value: "sdq", label: "Santo Domingo (SDQ)", lat: 18.4861, lng: -69.9312 },
  { value: "puj", label: "Punta Cana (PUJ)", lat: 18.5601, lng: -68.3725 },
  { value: "samana", label: "Samaná (Las Terrenas)", lat: 19.2058, lng: -69.3322 },
  { value: "santiago", label: "Santiago de los Caballeros", lat: 19.4517, lng: -70.6970 },
  { value: "puerto-plata", label: "Puerto Plata", lat: 19.7934, lng: -70.6884 },
  { value: "la-romana", label: "La Romana", lat: 18.4274, lng: -68.9728 },
  { value: "barahona", label: "Barahona", lat: 18.2085, lng: -71.1005 },
  { value: "jarabacoa", label: "Jarabacoa", lat: 19.1200, lng: -70.6363 },
  { value: "constanza", label: "Constanza", lat: 18.9100, lng: -70.7500 },
  { value: "bayahibe", label: "Bayahíbe", lat: 18.3672, lng: -68.8370 },
  { value: "cabarete", label: "Cabarete", lat: 19.7500, lng: -70.4167 },
  { value: "sosua", label: "Sosúa", lat: 19.7570, lng: -70.5150 },
  { value: "boca-chica", label: "Boca Chica", lat: 18.4500, lng: -69.6060 },
  { value: "higuey", label: "Higüey", lat: 18.6152, lng: -68.7078 },
  { value: "pedernales", label: "Pedernales", lat: 18.0370, lng: -71.7440 },
  { value: "las-galeras", label: "Las Galeras", lat: 19.2833, lng: -69.0500 },
  { value: "cap-cana", label: "Cap Cana", lat: 18.5000, lng: -68.3800 },
  { value: "juan-dolio", label: "Juan Dolio", lat: 18.4333, lng: -69.4333 },
  { value: "la-vega", label: "La Vega", lat: 19.2220, lng: -70.5295 },
  { value: "san-cristobal", label: "San Cristóbal", lat: 18.4167, lng: -70.1000 },
];

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcRoute(origin: RoutePoint, dest: RoutePoint) {
  const straightKm = haversine(origin.lat, origin.lng, dest.lat, dest.lng);
  const roadKm = Math.round(straightKm * 1.35);
  const hours = roadKm / 60;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const time = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m} min`;
  return { distance: roadKm, time };
}
