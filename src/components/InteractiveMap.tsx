import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Hotel, Waves, UtensilsCrossed, ZoomIn, ZoomOut, Locate } from "lucide-react";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type MapLayer = "destinations" | "hotels" | "beaches" | "restaurants";

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

const layerConfig: Record<MapLayer, { label: string; color: string; icon: typeof MapPin }> = {
  destinations: { label: "Destinos", color: "#10b981", icon: MapPin },
  hotels: { label: "Hoteles", color: "#6366f1", icon: Hotel },
  beaches: { label: "Playas", color: "#06b6d4", icon: Waves },
  restaurants: { label: "Restaurantes", color: "#f59e0b", icon: UtensilsCrossed },
};

export function InteractiveMap({ className }: { className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const clusterGroup = useRef<any>(null);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(["destinations", "hotels", "beaches"]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

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
              <a href="/${m.type === "destinations" ? "destino" : m.type === "hotels" ? "alojamiento" : m.type === "beaches" ? "playa" : "restaurante"}/${m.slug || m.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:hsl(var(--primary));text-decoration:none;font-weight:500;">Ver detalle →</a>
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
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{ backgroundColor: active ? config.color : "transparent", borderColor: config.color }}
                  />
                  {config.label}
                </button>
              );
            })}
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
    </div>
  );
}
