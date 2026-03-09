import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Trophy, Star, Lock, CheckCircle2, Zap,
  ChevronRight, Compass, Target, Flame
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type MissionStatus = "locked" | "available" | "active" | "completed";
type FilterType = "all" | "available" | "active" | "completed";

interface MapMission {
  id: string;
  name: string;
  description: string;
  short_description: string;
  icon: string;
  xp_reward: number;
  coin_reward: number;
  target_count: number;
  category: string;
  mission_type: string;
  min_level: number;
  // Location from destination
  lat: number;
  lng: number;
  region: string;
  status: MissionStatus;
  progress: number;
}

const statusConfig: Record<MissionStatus, { color: string; label: string; markerColor: string }> = {
  completed: { color: "text-green-500", label: "Completada", markerColor: "#22c55e" },
  active: { color: "text-primary", label: "En progreso", markerColor: "#3b82f6" },
  available: { color: "text-yellow-500", label: "Disponible", markerColor: "#eab308" },
  locked: { color: "text-muted-foreground", label: "Bloqueada", markerColor: "#6b7280" },
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

// Default locations for missions by category
const categoryLocations: Record<string, { lat: number; lng: number; region: string }[]> = {
  exploration: [
    { lat: 18.47, lng: -69.88, region: "Santo Domingo" },
    { lat: 18.69, lng: -68.45, region: "Punta Cana" },
    { lat: 19.21, lng: -69.34, region: "Samaná" },
    { lat: 19.79, lng: -70.69, region: "Puerto Plata" },
  ],
  gastronomy: [
    { lat: 18.50, lng: -69.90, region: "Santo Domingo" },
    { lat: 19.45, lng: -70.69, region: "Santiago" },
    { lat: 18.42, lng: -68.97, region: "La Romana" },
  ],
  culture: [
    { lat: 18.47, lng: -69.88, region: "Zona Colonial" },
    { lat: 19.30, lng: -70.25, region: "La Vega" },
    { lat: 19.45, lng: -70.70, region: "Santiago" },
  ],
  social: [
    { lat: 18.48, lng: -69.93, region: "Santo Domingo" },
    { lat: 18.69, lng: -68.41, region: "Bávaro" },
  ],
  engagement: [
    { lat: 18.50, lng: -69.85, region: "Santo Domingo" },
    { lat: 19.76, lng: -70.41, region: "Cabarete" },
  ],
  commerce: [
    { lat: 18.49, lng: -69.89, region: "Santo Domingo" },
    { lat: 18.69, lng: -68.42, region: "Punta Cana" },
  ],
  referral: [
    { lat: 18.48, lng: -69.90, region: "Santo Domingo" },
  ],
  planning: [
    { lat: 18.50, lng: -69.88, region: "Santo Domingo" },
    { lat: 19.03, lng: -71.00, region: "Jarabacoa" },
  ],
};

export default function MapaMisiones() {
  const { user } = useAuth();
  const { missions, userMissions, userGamification, loading } = useGamification();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedMission, setSelectedMission] = useState<MapMission | null>(null);

  // Map missions to map data with locations
  const mapMissions: MapMission[] = missions.map((m, i) => {
    const progress = userMissions.find(um => um.mission_id === m.id);
    const isLocked = (userGamification?.current_level || 1) < m.min_level;
    const isCompleted = progress?.is_completed || false;
    const isActive = !isCompleted && (progress?.progress || 0) > 0;

    const locations = categoryLocations[m.category] || categoryLocations.exploration;
    const loc = locations[i % locations.length];

    return {
      id: m.id,
      name: m.name,
      description: m.description || m.short_description,
      short_description: m.short_description,
      icon: m.icon,
      xp_reward: m.xp_reward,
      coin_reward: m.coin_reward,
      target_count: m.target_count,
      category: m.category,
      mission_type: m.mission_type,
      min_level: m.min_level,
      lat: loc.lat + (Math.random() - 0.5) * 0.1,
      lng: loc.lng + (Math.random() - 0.5) * 0.1,
      region: loc.region,
      status: isLocked ? "locked" : isCompleted ? "completed" : isActive ? "active" : "available",
      progress: progress?.progress || 0,
    };
  });

  const filtered = mapMissions.filter(m => filter === "all" || m.status === filter);
  const completedCount = mapMissions.filter(m => m.status === "completed").length;
  const explorationPct = mapMissions.length > 0 ? Math.round((completedCount / mapMissions.length) * 100) : 0;

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
                { id: "all" as const, label: "Todas", count: mapMissions.length },
                { id: "available" as const, label: "Disponibles", count: mapMissions.filter(m => m.status === "available").length },
                { id: "active" as const, label: "En progreso", count: mapMissions.filter(m => m.status === "active").length },
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
            {loading ? (
              <Skeleton className="h-[550px] rounded-xl" />
            ) : (
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
                            <p className="font-bold text-sm">{m.icon} {m.name}</p>
                            <p className="text-xs text-gray-500">{m.region} • +{m.xp_reward} XP</p>
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
                      <Button variant="ghost" size="sm" onClick={() => setSelectedMission(null)} className="mb-3 -ml-2">&larr; Volver</Button>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl">{selectedMission.icon}</span>
                        <Badge variant="outline">{statusConfig[selectedMission.status].label}</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{selectedMission.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{selectedMission.description}</p>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
                          <Zap className="h-3 w-3 mr-1" /> +{selectedMission.xp_reward} XP
                        </Badge>
                        {selectedMission.coin_reward > 0 && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            🪙 {selectedMission.coin_reward}
                          </Badge>
                        )}
                        <Badge variant="outline">{selectedMission.category}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-4">
                        <p><MapPin className="h-3 w-3 inline mr-1" />{selectedMission.region}</p>
                      </div>

                      {selectedMission.status !== "completed" && selectedMission.status !== "locked" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-medium">{selectedMission.progress}/{selectedMission.target_count}</span>
                          </div>
                          <Progress value={(selectedMission.progress / selectedMission.target_count) * 100} className="h-2" />
                        </div>
                      )}

                      {selectedMission.status === "completed" && (
                        <Button variant="outline" className="w-full gap-1" disabled>
                          <CheckCircle2 className="h-4 w-4" /> Completada
                        </Button>
                      )}
                      {selectedMission.status === "locked" && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Requiere nivel {selectedMission.min_level}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    filtered.map((m) => {
                      const cfg = statusConfig[m.status];
                      return (
                        <motion.button
                          key={m.id}
                          onClick={() => setSelectedMission(m)}
                          whileHover={{ scale: 1.01 }}
                          className={`w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow ${m.status === "locked" ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{m.status === "locked" ? "🔒" : m.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-sm truncate">{m.name}</h4>
                              <p className="text-xs text-muted-foreground mb-1">{m.region} • {m.category}</p>
                              <div className="flex gap-2">
                                <span className="text-xs font-medium text-primary">+{m.xp_reward} XP</span>
                                {m.coin_reward > 0 && <span className="text-xs text-yellow-500">🪙 {m.coin_reward}</span>}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                  {filtered.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay misiones en esta categoría</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
