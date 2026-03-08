import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Trophy, Star, Lock, CheckCircle2, Zap,
  Filter, Eye, ChevronRight, Compass, Target, Flame
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MissionStatus = "locked" | "available" | "active" | "completed";
type FilterType = "all" | "available" | "active" | "completed";

interface Mission {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  xp: number;
  coins: number;
  difficulty: "easy" | "medium" | "hard";
  status: MissionStatus;
  region: string;
  category: string;
}

const missions: Mission[] = [
  { id: "1", title: "Zona Colonial Explorer", description: "Visita 3 museos históricos en la Zona Colonial", lat: 18.4735, lng: -69.8827, xp: 200, coins: 50, difficulty: "easy", status: "completed", region: "Santo Domingo", category: "Cultural" },
  { id: "2", title: "Conquista la Playa Bávaro", description: "Registra tu visita a la icónica playa de Bávaro", lat: 18.6878, lng: -68.4506, xp: 100, coins: 25, difficulty: "easy", status: "active", region: "Punta Cana", category: "Exploración" },
  { id: "3", title: "Avistamiento de Ballenas", description: "Vive la experiencia de avistar ballenas jorobadas", lat: 19.2057, lng: -69.3398, xp: 350, coins: 100, difficulty: "medium", status: "available", region: "Samaná", category: "Naturaleza" },
  { id: "4", title: "Sabores de Puerto Plata", description: "Prueba 3 platos típicos en restaurantes locales", lat: 19.7934, lng: -70.6884, xp: 250, coins: 60, difficulty: "medium", status: "available", region: "Puerto Plata", category: "Gastronómico" },
  { id: "5", title: "Expedición Pico Duarte", description: "Sube el pico más alto del Caribe", lat: 19.0293, lng: -70.9998, xp: 500, coins: 150, difficulty: "hard", status: "locked", region: "La Vega", category: "Aventura" },
  { id: "6", title: "El Lago Enriquillo", description: "Descubre el lago más grande de las Antillas", lat: 18.5085, lng: -71.5856, xp: 300, coins: 80, difficulty: "medium", status: "available", region: "Independencia", category: "Naturaleza" },
  { id: "7", title: "Ruta del Cacao", description: "Visita una plantación de cacao y aprende el proceso", lat: 19.3003, lng: -70.2531, xp: 200, coins: 50, difficulty: "easy", status: "completed", region: "Espaillat", category: "Cultural" },
  { id: "8", title: "Surf en Cabarete", description: "Toma una clase de surf o kitesurf", lat: 19.7580, lng: -70.4087, xp: 300, coins: 75, difficulty: "medium", status: "available", region: "Puerto Plata", category: "Aventura" },
];

const statusConfig: Record<MissionStatus, { color: string; icon: typeof MapPin; label: string; markerColor: string }> = {
  completed: { color: "text-green-500", icon: CheckCircle2, label: "Completada", markerColor: "#22c55e" },
  active: { color: "text-primary", icon: Zap, label: "En progreso", markerColor: "#3b82f6" },
  available: { color: "text-yellow-500", icon: Star, label: "Disponible", markerColor: "#eab308" },
  locked: { color: "text-muted-foreground", icon: Lock, label: "Bloqueada", markerColor: "#6b7280" },
};

const createMissionIcon = (status: MissionStatus) => {
  const color = statusConfig[status].markerColor;
  return L.divIcon({
    className: "custom-mission-marker",
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

export default function MapaMisiones() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const filtered = missions.filter(m => filter === "all" || m.status === filter);
  const completedCount = missions.filter(m => m.status === "completed").length;
  const explorationPct = Math.round((completedCount / missions.length) * 100);

  return (
    <PageTransition>
      <SEOHead title="Mapa de Misiones - Explora RD" description="Descubre misiones turísticas en el mapa interactivo de República Dominicana." />
      <div className="min-h-screen bg-background">
        <Header />

        <section className="pt-24 pb-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="h-5 w-5 text-primary" />
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Mapa de Misiones</h1>
                </div>
                <p className="text-sm text-muted-foreground">Descubre y completa misiones en todo el territorio</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Exploración</p>
                  <p className="text-lg font-bold text-primary">{explorationPct}%</p>
                </div>
                <Progress value={explorationPct} className="w-32 h-2" />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {([
                { id: "all" as const, label: "Todas", count: missions.length },
                { id: "available" as const, label: "Disponibles", count: missions.filter(m => m.status === "available").length },
                { id: "active" as const, label: "En progreso", count: missions.filter(m => m.status === "active").length },
                { id: "completed" as const, label: "Completadas", count: completedCount },
              ]).map(f => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.id)}
                  className="flex-shrink-0"
                >
                  {f.label} ({f.count})
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Map + Sidebar */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: "550px" }}>
              {/* Map */}
              <div className="lg:col-span-2 rounded-xl overflow-hidden border border-border" style={{ minHeight: "500px" }}>
                <MapContainer
                  center={[18.9, -70.0]}
                  zoom={8}
                  style={{ width: "100%", height: "100%", minHeight: "500px" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filtered.map((m) => (
                    <Marker
                      key={m.id}
                      position={[m.lat, m.lng]}
                      icon={createMissionIcon(m.status)}
                      eventHandlers={{ click: () => setSelectedMission(m) }}
                    >
                      <Popup>
                        <div className="text-center p-1">
                          <p className="font-bold text-sm">{m.title}</p>
                          <p className="text-xs text-gray-500">{m.region} • +{m.xp} XP</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Sidebar */}
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {selectedMission ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMission(null)} className="mb-3 -ml-2">&larr; Volver a la lista</Button>
                    <Badge className={`${statusConfig[selectedMission.status].color} bg-current/10 mb-3`}>
                      {statusConfig[selectedMission.status].label}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground mb-2">{selectedMission.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedMission.description}</p>
                    <div className="flex gap-2 mb-4">
                      <Badge className="bg-primary/10 text-primary">+{selectedMission.xp} XP</Badge>
                      <Badge className="bg-yellow-500/10 text-yellow-500">🪙 {selectedMission.coins}</Badge>
                      <Badge variant="outline">{selectedMission.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      <p><MapPin className="h-3 w-3 inline mr-1" />{selectedMission.region}</p>
                    </div>
                    {selectedMission.status === "available" && (
                      <Button className="w-full gap-1"><Target className="h-4 w-4" /> Aceptar misión</Button>
                    )}
                    {selectedMission.status === "active" && (
                      <Button className="w-full gap-1"><Zap className="h-4 w-4" /> Registrar visita</Button>
                    )}
                    {selectedMission.status === "completed" && (
                      <Button variant="outline" className="w-full gap-1" disabled><CheckCircle2 className="h-4 w-4" /> Completada</Button>
                    )}
                  </motion.div>
                ) : (
                  filtered.map((m) => {
                    const cfg = statusConfig[m.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.button
                        key={m.id}
                        onClick={() => setSelectedMission(m)}
                        whileHover={{ scale: 1.01 }}
                        className={`w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow ${m.status === "locked" ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: cfg.markerColor + "20" }}>
                            <StatusIcon className="h-5 w-5" style={{ color: cfg.markerColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-semibold text-foreground text-sm truncate">{m.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{m.region} • {m.category}</p>
                            <div className="flex gap-2">
                              <span className="text-xs font-medium text-primary">+{m.xp} XP</span>
                              <span className="text-xs text-yellow-500">🪙 {m.coins}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
