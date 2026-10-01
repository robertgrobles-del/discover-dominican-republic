import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Landmark } from "lucide-react";

// Fix standard marker icons for Leaflet in React bundlers
const customTollIcon = L.divIcon({
  className: "custom-toll-marker",
  html: `
    <div style="
      background-color: #2563eb;
      color: white;
      border: 2px solid white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
    ">
      🛣️
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

export interface TollStation {
  name: string;
  lat: number;
  lng: number;
  prices: {
    cat1: number;
    cat2: number;
    cat3: number;
    cat4: number;
  };
}

export interface RouteGeoData {
  id: string;
  name: string;
  color: string;
  path: [number, number][];
  stations: TollStation[];
}

export const TOLL_ROUTES_GEO: Record<string, RouteGeoData> = {
  route_east: {
    id: "route_east",
    name: "Autovía del Este",
    color: "#2563eb",
    path: [
      [18.4861, -69.9312], // Santo Domingo
      [18.4550, -69.6700], // Las Américas Toll
      [18.4286, -69.2942], // San Pedro de Macorís
      [18.4350, -68.9600], // Coral I
      [18.5700, -68.3600], // Coral II / Punta Cana
    ],
    stations: [
      {
        name: "Peaje Las Américas",
        lat: 18.4550,
        lng: -69.6700,
        prices: { cat1: 60, cat2: 120, cat3: 180, cat4: 240 }
      },
      {
        name: "Peaje Coral I (La Romana)",
        lat: 18.4350,
        lng: -68.9600,
        prices: { cat1: 100, cat2: 200, cat3: 300, cat4: 400 }
      },
      {
        name: "Peaje Coral II (Punta Cana)",
        lat: 18.5700,
        lng: -68.3600,
        prices: { cat1: 100, cat2: 200, cat3: 300, cat4: 400 }
      }
    ]
  },
  route_north: {
    id: "route_north",
    name: "Autopista Duarte",
    color: "#059669",
    path: [
      [18.4861, -69.9312], // Santo Domingo
      [18.5800, -70.0500], // Km 25 Peaje Duarte
      [18.9100, -70.4100], // Bonao
      [19.2200, -70.5300], // La Vega
      [19.4517, -70.6970], // Santiago
    ],
    stations: [
      {
        name: "Peaje Duarte (Km 25)",
        lat: 18.5800,
        lng: -70.0500,
        prices: { cat1: 60, cat2: 120, cat3: 180, cat4: 240 }
      }
    ]
  },
  route_samana: {
    id: "route_samana",
    name: "Autopista del Nordeste (Juan Pablo II)",
    color: "#d97706",
    path: [
      [18.4861, -69.9312], // SD
      [18.5500, -69.7600], // Marbella
      [18.7800, -69.7500], // Naranjal
      [19.0500, -69.7600], // Guaraguao
      [19.1700, -69.6000], // El Catey
      [19.3000, -69.5400], // Samaná / Las Terrenas
    ],
    stations: [
      {
        name: "Peaje Marbella",
        lat: 18.5500,
        lng: -69.7600,
        prices: { cat1: 60, cat2: 120, cat3: 180, cat4: 240 }
      },
      {
        name: "Peaje Naranjal",
        lat: 18.7800,
        lng: -69.7500,
        prices: { cat1: 200, cat2: 400, cat3: 600, cat4: 800 }
      },
      {
        name: "Peaje Guaraguao",
        lat: 19.0500,
        lng: -69.7600,
        prices: { cat1: 230, cat2: 460, cat3: 690, cat4: 920 }
      },
      {
        name: "Peaje El Catey",
        lat: 19.1700,
        lng: -69.6000,
        prices: { cat1: 580, cat2: 1150, cat3: 1720, cat4: 2300 }
      }
    ]
  },
  route_south: {
    id: "route_south",
    name: "Autopista Sánchez",
    color: "#7c3aed",
    path: [
      [18.4861, -69.9312], // SD
      [18.4200, -70.0200], // Peaje Sánchez
      [18.4167, -70.1081], // San Cristóbal
      [18.2796, -70.3318], // Baní
    ],
    stations: [
      {
        name: "Peaje Sánchez (Km 12)",
        lat: 18.4200,
        lng: -70.0200,
        prices: { cat1: 60, cat2: 120, cat3: 180, cat4: 240 }
      }
    ]
  }
};

interface TollsMapProps {
  selectedRouteId: string;
  vehicleCategory: number;
}

export const TollsMap: React.FC<TollsMapProps> = ({ selectedRouteId, vehicleCategory }) => {
  const currentGeo = TOLL_ROUTES_GEO[selectedRouteId] || TOLL_ROUTES_GEO.route_east;

  const getPriceByCat = (station: TollStation) => {
    if (vehicleCategory === 1) return station.prices.cat1;
    if (vehicleCategory === 2) return station.prices.cat2;
    if (vehicleCategory === 3) return station.prices.cat3;
    return station.prices.cat4;
  };

  // Center around current route mid point
  const centerLat = currentGeo.stations.length > 0 ? currentGeo.stations[0].lat : 18.7357;
  const centerLng = currentGeo.stations.length > 0 ? currentGeo.stations[0].lng : -70.1627;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-border shadow-md relative z-0">
      <MapContainer
        key={selectedRouteId}
        center={[centerLat, centerLng]}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          referrerPolicy="no-referrer"
        />

        {/* Polylines for current route */}
        <Polyline
          positions={currentGeo.path}
          pathOptions={{ color: currentGeo.color, weight: 6, opacity: 0.8 }}
        />

        {/* Toll Markers */}
        {currentGeo.stations.map((station, idx) => (
          <Marker
            key={idx}
            position={[station.lat, station.lng]}
            icon={customTollIcon}
          >
            <Popup>
              <div className="p-2 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" />
                  {station.name}
                </h4>
                <div className="bg-slate-100 p-2 rounded text-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-blue-700">
                    <span>Tu Categoría ({vehicleCategory}):</span>
                    <span>RD$ {getPriceByCat(station)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1">
                    <div>Cat 1 (Livianos): RD$ {station.prices.cat1}</div>
                    <div>Cat 2 (Minibús): RD$ {station.prices.cat2}</div>
                    <div>Cat 3/4 (Pesados): RD$ {station.prices.cat3} - {station.prices.cat4}</div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
