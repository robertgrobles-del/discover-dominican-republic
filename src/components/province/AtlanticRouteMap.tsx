import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ATLANTIC_ROUTE } from "@/data/provinceIdentity";

// El color sale de --primary, así cada provincia pinta la ruta con su identidad (.dest-theme).
const pin = (n: number, here: boolean) => L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 12px sans-serif;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);background:${here ? "hsl(var(--primary))" : "#64748b"}">${n}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export default function AtlanticRouteMap({ currentProvince }: { currentProvince: string }) {
  // shortcut: línea recta entre paradas, no el trazado real de la carretera; usar un GeoJSON de la vía si hace falta precisión.
  const path = ATLANTIC_ROUTE.map((s) => [s.lat, s.lng] as [number, number]);
  return (
    <MapContainer bounds={L.latLngBounds(path).pad(0.15)} scrollWheelZoom={false} className="h-[420px] w-full rounded-3xl border border-border z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        referrerPolicy="no-referrer"
      />
      <Polyline positions={path} pathOptions={{ color: "hsl(var(--primary))", weight: 4, dashArray: "6 8" }} />
      {ATLANTIC_ROUTE.map((s, i) => (
        <Marker key={s.name} position={[s.lat, s.lng]} icon={pin(i + 1, s.province === currentProvince)} title={s.name}>
          <Popup><strong>{s.name}</strong><br />{s.note}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
