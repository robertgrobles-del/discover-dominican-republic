import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Hotel, Waves, UtensilsCrossed, ZoomIn, ZoomOut, Locate, Fuel, HeartPulse, Landmark, Wifi, Compass, Plus, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type MapLayer = "destinations" | "hotels" | "beaches" | "restaurants" | "gas_stations" | "hospitals" | "atms" | "public_wifi" | "joyas_escondidas";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: MapLayer;
  image?: string | null;
  rating?: number | null;
  slug?: string | null;
}

const layerConfig: Record<MapLayer, { label: string; color: string; icon: any }> = {
  destinations: { label: "Destinos", color: "#10b981", icon: MapPin },
  hotels: { label: "Hoteles", color: "#6366f1", icon: Hotel },
  beaches: { label: "Playas", color: "#06b6d4", icon: Waves },
  restaurants: { label: "Restaurantes", color: "#f59e0b", icon: UtensilsCrossed },
  gas_stations: { label: "Gasolineras", color: "#ef4444", icon: Fuel },
  hospitals: { label: "Hospitales", color: "#ec4899", icon: HeartPulse },
  atms: { label: "ATMs", color: "#14b8a6", icon: Landmark },
  public_wifi: { label: "WiFi Público", color: "#8b5cf6", icon: Wifi },
  joyas_escondidas: { label: "Joyas Escondidas (UGC)", color: "#a855f7", icon: Compass },
};

export function InteractiveMap({ className }: { className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const clusterGroup = useRef<any>(null);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(["destinations", "hotels", "beaches", "joyas_escondidas"]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // UGC Collaborative Map States
  const [ugcPins, setUgcPins] = useState<MapMarker[]>([]);
  const [isReportMode, setIsReportMode] = useState(false);
  const [reportCoords, setReportCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Load UGC pins from local storage
  useEffect(() => {
    const saved = localStorage.getItem("ugc_joyas_escondidas");
    if (saved) {
      try {
        setUgcPins(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading UGC pins", e);
      }
    }
  }, []);

  // Map Click event handler for report mode
  useEffect(() => {
    const handleMapClick = (e: any) => {
      if (isReportMode) {
        setReportCoords({ lat: e.detail.lat, lng: e.detail.lng });
        setShowReportDialog(true);
      }
    };
    window.addEventListener("map-click", handleMapClick);
    return () => window.removeEventListener("map-click", handleMapClick);
  }, [isReportMode]);

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportCoords) return;

    const newPin: MapMarker = {
      id: "ugc-" + Date.now(),
      name: reportTitle,
      lat: reportCoords.lat,
      lng: reportCoords.lng,
      type: "joyas_escondidas"
    };

    const updated = [newPin, ...ugcPins];
    setUgcPins(updated);
    localStorage.setItem("ugc_joyas_escondidas", JSON.stringify(updated));

    toast.success(`¡"${reportTitle}" agregada al mapa colaborativo! Pendiente de aprobación.`);
    
    // Reset state
    setShowReportDialog(false);
    setReportTitle("");
    setReportDescription("");
    setReportCoords(null);
    setIsReportMode(false);
  };

  const { data: markers = [] } = useQuery({
    queryKey: ["map-markers", activeLayers],
    queryFn: async () => {
      const results: MapMarker[] = [];
      if (activeLayers.includes("destinations")) {
        const { data } = await supabase.from("destinations").select("id, name, latitude, longitude, image_url, slug").not("latitude", "is", null);
        data?.forEach((d) => results.push({ id: d.id, name: d.name, lat: Number(d.latitude), lng: Number(d.longitude), type: "destinations", image: d.image_url, slug: d.slug }));
      }
      if (activeLayers.includes("hotels")) {
        const { data } = await supabase.from("hotels").select("id, name, latitude, longitude, image_url, rating, slug").eq("is_active", true).not("latitude", "is", null);
        data?.forEach((h) => results.push({ id: h.id, name: h.name, lat: Number(h.latitude), lng: Number(h.longitude), type: "hotels", image: h.image_url, rating: h.rating ? Number(h.rating) : null, slug: h.slug }));
      }
      if (activeLayers.includes("beaches")) {
        const { data } = await supabase.from("beaches").select("id, name, latitude, longitude, image_url, rating, slug").eq("is_active", true).not("latitude", "is", null);
        data?.forEach((b) => results.push({ id: b.id, name: b.name, lat: Number(b.latitude), lng: Number(b.longitude), type: "beaches", image: b.image_url, rating: b.rating ? Number(b.rating) : null, slug: b.slug }));
      }
      if (activeLayers.includes("restaurants")) {
        const { data } = await supabase.from("restaurants").select("id, name, latitude, longitude, image_url, rating, slug").eq("is_active", true).not("latitude", "is", null);
        data?.forEach((r) => results.push({ id: r.id, name: r.name, lat: Number(r.latitude), lng: Number(r.longitude), type: "restaurants", image: r.image_url, rating: r.rating ? Number(r.rating) : null, slug: r.slug }));
      }
      if (activeLayers.includes("gas_stations")) {
        const mockGas = [
          { id: "gas-1", name: "Sunix Winston Churchill", lat: 18.4682, lng: -69.9427, type: "gas_stations" as const },
          { id: "gas-2", name: "Texaco Las Américas", lat: 18.4901, lng: -69.8324, type: "gas_stations" as const },
          { id: "gas-3", name: "Shell Punta Cana", lat: 18.5721, lng: -68.3615, type: "gas_stations" as const },
          { id: "gas-4", name: "Total Las Terrenas", lat: 19.3178, lng: -69.5392, type: "gas_stations" as const }
        ];
        results.push(...mockGas);
      }
      if (activeLayers.includes("hospitals")) {
        const mockHosp = [
          { id: "hosp-1", name: "Clínica Abreu (SD)", lat: 18.4673, lng: -69.9056, type: "hospitals" as const },
          { id: "hosp-2", name: "Centro Médico Punta Cana", lat: 18.5912, lng: -68.4201, type: "hospitals" as const },
          { id: "hosp-3", name: "Hospiten Santo Domingo", lat: 18.4599, lng: -69.9312, type: "hospitals" as const },
          { id: "hosp-4", name: "Centro Médico Las Terrenas", lat: 19.3121, lng: -69.5412, type: "hospitals" as const }
        ];
        results.push(...mockHosp);
      }
      if (activeLayers.includes("atms")) {
        const mockAtms = [
          { id: "atm-1", name: "Cajero Popular - Zona Colonial", lat: 18.4735, lng: -69.8864, type: "atms" as const },
          { id: "atm-2", name: "Cajero Banreservas - Aeropuerto SDQ", lat: 18.4298, lng: -69.6687, type: "atms" as const },
          { id: "atm-3", name: "Cajero BHD - Downtown Punta Cana", lat: 18.5802, lng: -68.3995, type: "atms" as const },
          { id: "atm-4", name: "Cajero Popular - Las Terrenas Centro", lat: 19.3190, lng: -69.5441, type: "atms" as const }
        ];
        results.push(...mockAtms);
      }
      if (activeLayers.includes("public_wifi")) {
        const mockWifi = [
          { id: "wifi-1", name: "WiFi Gratis - Parque Colón (SD)", lat: 18.4731, lng: -69.8858, type: "public_wifi" as const },
          { id: "wifi-2", name: "WiFi Público - Parque Independencia", lat: 18.4715, lng: -69.8925, type: "public_wifi" as const },
          { id: "wifi-3", name: "WiFi Público - Plaza San Juan Punta Cana", lat: 18.6111, lng: -68.4190, type: "public_wifi" as const },
          { id: "wifi-4", name: "WiFi Gratis - Playa Bonita Las Terrenas", lat: 19.3142, lng: -69.5615, type: "public_wifi" as const }
        ];
        results.push(...mockWifi);
      }
      if (activeLayers.includes("joyas_escondidas")) {
        results.push(...ugcPins);
      }
      return results;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    Promise.all([import("leaflet"), import("leaflet.markercluster")]).then(([L]) => {
      const map = L.map(mapRef.current!, {
        center: [18.9, -70.0],
        zoom: 8,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      clusterGroup.current = (L as any).markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });
      map.addLayer(clusterGroup.current);
      leafletMap.current = map;

      map.on("click", (e: any) => {
        window.dispatchEvent(new CustomEvent("map-click", { detail: { lat: e.latlng.lat, lng: e.latlng.lng } }));
      });
    });

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update markers with clustering
  useEffect(() => {
    if (!leafletMap.current || !clusterGroup.current) return;

    import("leaflet").then((L) => {
      clusterGroup.current.clearLayers();

      markers.forEach((m) => {
        const config = layerConfig[m.type];
        const icon = L.divIcon({
          className: "custom-map-marker",
          html: `<div style="background:${config.color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([m.lat, m.lng], { icon });

        // Rich popup
        const popupContent = `
          <div style="min-width:200px;font-family:system-ui,sans-serif;">
            ${m.image ? `<img src="${m.image}" alt="${m.name}" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;margin:-12px -12px 8px -12px;width:calc(100% + 24px);" />` : ""}
            <div style="padding:0 2px;">
              <span style="display:inline-block;font-size:10px;padding:2px 6px;border-radius:4px;background:${config.color}22;color:${config.color};margin-bottom:4px;">${config.label}</span>
              <h4 style="margin:4px 0;font-weight:600;font-size:14px;">${m.name}</h4>
              ${m.rating ? `<p style="font-size:12px;color:#888;">⭐ ${m.rating}</p>` : ""}
              ${["destinations", "hotels", "beaches", "restaurants"].includes(m.type) 
                ? `<a href="/${m.type === "destinations" ? "destino" : m.type === "hotels" ? "alojamiento" : m.type === "beaches" ? "playa" : "restaurante"}/${m.slug || m.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:hsl(var(--primary));text-decoration:none;font-weight:500;">Ver detalle →</a>` 
                : `<span style="font-size:11px;color:#888;display:inline-block;margin-top:4px;">Servicio público / Utilidad</span>`}
            </div>
          </div>`;

        marker.bindPopup(popupContent, { maxWidth: 250, className: "custom-popup" });
        marker.bindTooltip(m.name, { direction: "top", offset: [0, -14] });

        marker.on("click", () => {
          setSelectedMarker(m);
        });

        clusterGroup.current.addLayer(marker);
      });
    });
  }, [markers]);

  const toggleLayer = (layer: MapLayer) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const handleZoom = (delta: number) => leafletMap.current?.setZoom((leafletMap.current?.getZoom() || 8) + delta);
  const handleCenter = () => leafletMap.current?.setView([18.9, -70.0], 8, { animate: true });

  return (
    <div className={cn("relative", className)}>
      <div ref={mapRef} className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border shadow-lg" />

      {/* Layer controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-2 flex flex-col gap-1">
            {(Object.keys(layerConfig) as MapLayer[]).map((layer) => {
              const config = layerConfig[layer];
              const active = activeLayers.includes(layer);
              return (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span
                    className={[
                      "w-3 h-3 rounded-full border-2 flex-shrink-0",
                      active ? "bg-primary border-primary" : "border-muted-foreground bg-transparent",
                    ].join(" ")}
                    role="presentation"
                    aria-hidden="true"
                  />
                  {config.label}
                </button>
              );
            })}

            <Button 
              variant={isReportMode ? "destructive" : "default"} 
              size="sm" 
              className="mt-2 w-full text-xs font-bold gap-1 h-8"
              onClick={() => {
                setIsReportMode(!isReportMode);
                if (!isReportMode) {
                  toast.info("Haz clic en cualquier punto del mapa para agregar una Joya Escondida.");
                }
              }}
            >
              {isReportMode ? (
                <>Cancelar Reporte</>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Agregar Joya UGC
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
        <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur-sm h-8 w-8" onClick={() => handleZoom(1)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur-sm h-8 w-8" onClick={() => handleZoom(-1)}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur-sm h-8 w-8" onClick={handleCenter}>
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 z-[1000] hidden md:block">
        <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
          {markers.length} puntos en el mapa
        </Badge>
      </div>

      {/* UGC Report Dialog */}
      {showReportDialog && reportCoords && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-border bg-card shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Reportar Joya Escondida
            </h3>
            <p className="text-xs text-muted-foreground">
              Ayuda a otros viajeros compartiendo un lugar especial no catalogado. Tu reporte será revisado por moderadores.
            </p>
            <form onSubmit={handleSaveReport} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Nombre del Lugar</label>
                <Input 
                  placeholder="Ej. Charco Azul, Cabarete" 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Descripción / ¿Por qué es especial?</label>
                <Textarea 
                  placeholder="Ej. Una piscina natural de agua cristalina azul turquesa rodeada de selva densa. Poco concurrida..." 
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
              <div className="p-3 bg-secondary/40 rounded-lg text-xs flex gap-2 items-center text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                Coordenadas capturadas: {reportCoords.lat.toFixed(4)}, {reportCoords.lng.toFixed(4)}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportCoords(null);
                    setIsReportMode(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Publicar Joya
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
