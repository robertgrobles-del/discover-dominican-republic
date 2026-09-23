import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Map, MapPin, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Navigation } from "lucide-react";

export function AdminRouteBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [newStopNotes, setNewStopNotes] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState("");

  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ["admin-routes-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("id, title, slug, difficulty, duration_hours, distance_km")
        .eq("is_active", true);

      if (error) throw error;
      if (data && data.length > 0 && !selectedRouteId) {
        setSelectedRouteId(data[0].id);
      }
      return data || [];
    },
  });

  const { data: stops, isLoading: stopsLoading } = useQuery({
    queryKey: ["admin-route-stops", selectedRouteId],
    queryFn: async () => {
      if (!selectedRouteId) return [];
      const { data, error } = await supabase
        .from("route_stops")
        .select(`
          id,
          route_id,
          stop_order,
          destination_id,
          place_name,
          latitude,
          longitude,
          notes
        `)
        .eq("route_id", selectedRouteId)
        .order("stop_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedRouteId,
  });

  const { data: destinations } = useQuery({
    queryKey: ["admin-destinations-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("id, name, latitude, longitude")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0 && !selectedDestinationId) {
        setSelectedDestinationId(data[0].id);
      }
      return data || [];
    },
  });

  const addStopMutation = useMutation({
    mutationFn: async (newStop: { route_id: string; stop_order: number; destination_id: string; place_name: string; latitude?: number; longitude?: number; notes?: string }) => {
      const { data, error } = await supabase
        .from("route_stops")
        .insert([newStop])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-route-stops", selectedRouteId] });
      setNewStopNotes("");
      toast({
        title: "Parada añadida",
        description: "Se ha agregado la parada al circuito turístico.",
      });
    },
  });

  const deleteStopMutation = useMutation({
    mutationFn: async (stopId: string) => {
      const { error } = await supabase
        .from("route_stops")
        .delete()
        .eq("id", stopId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-route-stops", selectedRouteId] });
      toast({
        title: "Parada eliminada",
        description: "Se ha removido la parada de la ruta.",
        variant: "destructive",
      });
    },
  });

  const reorderStopMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("route_stops")
        .update({ stop_order: newOrder })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-route-stops", selectedRouteId] });
    },
  });

  const handleAddStop = () => {
    if (!selectedRouteId || !selectedDestinationId) return;
    const dest = destinations?.find((d) => d.id === selectedDestinationId);
    if (!dest) return;

    const nextOrder = stops ? stops.length + 1 : 1;

    addStopMutation.mutate({
      route_id: selectedRouteId,
      stop_order: nextOrder,
      destination_id: selectedDestinationId,
      place_name: dest.name,
      latitude: dest.latitude ? Number(dest.latitude) : undefined,
      longitude: dest.longitude ? Number(dest.longitude) : undefined,
      notes: newStopNotes,
    });
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (!stops) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const currentStop = stops[index];
    const siblingStop = stops[targetIndex];

    await Promise.all([
      reorderStopMutation.mutateAsync({ id: currentStop.id, newOrder: siblingStop.stop_order }),
      reorderStopMutation.mutateAsync({ id: siblingStop.id, newOrder: currentStop.stop_order }),
    ]);

    toast({
      title: "Orden actualizado",
      description: "Se ha reordenado la secuencia del circuito.",
    });
  };

  const selectedRoute = routes?.find((r) => r.id === selectedRouteId);

  return (
    <div className="grid md:grid-cols-5 gap-6">
      {/* Route and Settings Selection */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4" /> Seleccionar Ruta
            </CardTitle>
            <CardDescription>Escoge el circuito que deseas planificar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route-select">Circuito Turístico</Label>
              <select
                id="route-select"
                title="Seleccionar Circuito Turístico"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedRouteId || ""}
                onChange={(e) => {
                  setSelectedRouteId(e.target.value);
                }}
              >
                <option value="" disabled>Selecciona una ruta...</option>
                {routes?.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            {selectedRoute && (
              <div className="p-4 rounded-xl bg-secondary/30 space-y-2 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalles de Ruta</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-background rounded-lg border">
                    <p className="font-bold text-primary">{selectedRoute.duration_hours || 0}h</p>
                    <p className="text-[10px] text-muted-foreground">Duración</p>
                  </div>
                  <div className="p-2 bg-background rounded-lg border">
                    <p className="font-bold text-primary">{selectedRoute.distance_km || 0} km</p>
                    <p className="text-[10px] text-muted-foreground">Distancia</p>
                  </div>
                  <div className="p-2 bg-background rounded-lg border">
                    <p className="font-bold text-primary capitalize">{selectedRoute.difficulty || "n/a"}</p>
                    <p className="text-[10px] text-muted-foreground">Dificultad</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Stops form */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" /> Añadir Parada
            </CardTitle>
            <CardDescription>Inserta un nuevo destino al itinerario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination-select">Destino Asociado</Label>
              <select
                id="destination-select"
                title="Seleccionar Destino"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedDestinationId}
                onChange={(e) => setSelectedDestinationId(e.target.value)}
              >
                {destinations?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stop-notes">Notas / Indicaciones del Guía</Label>
              <Input
                id="stop-notes"
                placeholder="Ej: Visita al faro histórico o almuerzo local..."
                className="text-xs"
                value={newStopNotes}
                onChange={(e) => setNewStopNotes(e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-1.5"
              onClick={handleAddStop}
              disabled={!selectedRouteId || !selectedDestinationId}
            >
              <Plus className="h-4 w-4" /> Agregar Parada
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Visual Stops Timeline */}
      <div className="md:col-span-3 space-y-6">
        <Card className="border border-border/50 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" /> Secuencia de Paradas
              </span>
              <span className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full font-medium">{stops?.length || 0} paradas</span>
            </CardTitle>
            <CardDescription>Orden de paradas intermedias del circuito turístico</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {/* Visual Timeline Connected nodes */}
            <div className="space-y-4 flex-1">
              {stops && stops.length > 0 ? (
                <div className="relative border-l border-border pl-6 space-y-6 ml-3">
                  {stops.map((stop, index) => (
                    <div key={stop.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background text-[10px] text-primary-foreground font-bold">
                        {index + 1}
                      </span>
                      
                      <div className="p-3 rounded-xl border bg-secondary/15 hover:border-primary/50 transition-colors flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-foreground">{stop.place_name}</h4>
                          {stop.notes && <p className="text-[10px] text-muted-foreground">"{stop.notes}"</p>}
                          {stop.latitude && stop.longitude && (
                            <span className="text-[9px] font-mono text-muted-foreground block">
                              Lat: {stop.latitude.toFixed(4)} | Lng: {stop.longitude.toFixed(4)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Mover parada arriba"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Mover parada abajo"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleMove(index, "down")}
                            disabled={index === stops.length - 1}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Eliminar parada"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteStopMutation.mutate(stop.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-center p-6 text-muted-foreground">
                  <MapPin className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-semibold mb-1">Sin paradas en el circuito</p>
                  <p className="text-xs">Selecciona y agrega destinos del buscador lateral para trazar la ruta.</p>
                </div>
              )}
            </div>

            {stops && stops.length > 1 && (
              <div className="pt-4 border-t mt-6 flex items-center justify-between text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                  Mapa de la ruta conectado y listo para mostrar en el perfil del viajero.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
