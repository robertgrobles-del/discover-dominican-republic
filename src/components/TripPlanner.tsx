import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Trash2, Plus, GripVertical, ChevronRight, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Activity {
  id: string;
  name: string;
  location: string;
  duration: string;
  time?: string;
  type: "destino" | "actividad" | "restaurante" | "hotel";
  image: string;
}

interface DayPlan {
  id: string;
  date: string;
  activities: Activity[];
}

const suggestedActivities: Activity[] = [
  { id: "a1", name: "Zona Colonial Tour", location: "Santo Domingo", duration: "3h", type: "actividad", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop" },
  { id: "a2", name: "Playa Bávaro", location: "Punta Cana", duration: "Día completo", type: "destino", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop" },
  { id: "a3", name: "Avistamiento Ballenas", location: "Samaná", duration: "4h", type: "actividad", image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=100&h=100&fit=crop" },
  { id: "a4", name: "27 Charcos", location: "Puerto Plata", duration: "5h", type: "actividad", image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100&h=100&fit=crop" },
  { id: "a5", name: "Isla Saona", location: "La Romana", duration: "Día completo", type: "destino", image: "https://images.unsplash.com/photo-1590523278191-995cbcda646b?w=100&h=100&fit=crop" },
  { id: "a6", name: "Teleférico Puerto Plata", location: "Puerto Plata", duration: "2h", type: "actividad", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop" },
];

const STORAGE_KEY = "rd-trip-planner";

export function TripPlanner() {
  const [days, setDays] = useState<DayPlan[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [
      { id: "day1", date: "2025-02-01", activities: [] },
      { id: "day2", date: "2025-02-02", activities: [] },
      { id: "day3", date: "2025-02-03", activities: [] },
    ];
  });
  
  const [tripName, setTripName] = useState("Mi Viaje a RD");
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null);

  const saveToStorage = (newDays: DayPlan[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDays));
  };

  const addDay = () => {
    const lastDay = days[days.length - 1];
    const lastDate = lastDay ? new Date(lastDay.date) : new Date();
    lastDate.setDate(lastDate.getDate() + 1);
    
    const newDay: DayPlan = {
      id: `day${Date.now()}`,
      date: lastDate.toISOString().split("T")[0],
      activities: [],
    };
    
    const newDays = [...days, newDay];
    setDays(newDays);
    saveToStorage(newDays);
  };

  const removeDay = (dayId: string) => {
    const newDays = days.filter((d) => d.id !== dayId);
    setDays(newDays);
    saveToStorage(newDays);
  };

  const addActivityToDay = (dayId: string, activity: Activity) => {
    const newActivity = { ...activity, id: `${activity.id}-${Date.now()}` };
    const newDays = days.map((day) =>
      day.id === dayId
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    );
    setDays(newDays);
    saveToStorage(newDays);
    toast.success(`${activity.name} agregada al itinerario`);
  };

  const removeActivity = (dayId: string, activityId: string) => {
    const newDays = days.map((day) =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
        : day
    );
    setDays(newDays);
    saveToStorage(newDays);
  };

  const reorderActivities = (dayId: string, newOrder: Activity[]) => {
    const newDays = days.map((day) =>
      day.id === dayId ? { ...day, activities: newOrder } : day
    );
    setDays(newDays);
    saveToStorage(newDays);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  const handleSave = () => {
    saveToStorage(days);
    toast.success("Itinerario guardado exitosamente");
  };

  const typeColors: Record<string, string> = {
    destino: "bg-blue-500/20 text-blue-400",
    actividad: "bg-green-500/20 text-green-400",
    restaurante: "bg-orange-500/20 text-orange-400",
    hotel: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Trip Days */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Input
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="text-xl font-bold bg-transparent border-none px-0 focus-visible:ring-0 w-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Guardar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {days.map((day, dayIndex) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">{dayIndex + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Día {dayIndex + 1}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(day.date)}
                    </p>
                  </div>
                </div>
                {days.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeDay(day.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="p-4 min-h-[120px]">
                {day.activities.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedActivity) {
                        addActivityToDay(day.id, draggedActivity);
                        setDraggedActivity(null);
                      }
                    }}
                  >
                    <p className="text-sm text-muted-foreground">
                      Arrastra actividades aquí o selecciona de las sugerencias
                    </p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={day.activities}
                    onReorder={(newOrder) => reorderActivities(day.id, newOrder)}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {day.activities.map((activity) => (
                        <Reorder.Item
                          key={activity.id}
                          value={activity}
                          className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <img
                            src={activity.image}
                            alt={activity.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {activity.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{activity.location}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{activity.duration}</span>
                            </div>
                          </div>
                          <Badge className={cn("text-xs", typeColors[activity.type])}>
                            {activity.type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => removeActivity(day.id, activity.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                )}
              </div>
            </motion.div>
          ))}

          <Button variant="outline" className="w-full gap-2" onClick={addDay}>
            <Plus className="h-4 w-4" /> Agregar Día
          </Button>
        </div>
      </div>

      {/* Right Column - Suggested Activities */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Actividades Sugeridas</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Arrastra o haz click para agregar a tu itinerario
            </p>

            <div className="space-y-2">
              {suggestedActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  draggable
                  onDragStart={() => setDraggedActivity(activity)}
                  onDragEnd={() => setDraggedActivity(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-secondary/50 transition-colors"
                >
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{activity.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.location}</p>
                  </div>
                  <div className="flex gap-1">
                    {days.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => addActivityToDay(day.id, activity)}
                        className="w-6 h-6 rounded bg-primary/20 text-primary text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        title={`Agregar al día ${days.indexOf(day) + 1}`}
                      >
                        {days.indexOf(day) + 1}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="link" className="w-full mt-4 gap-1 text-primary">
              Ver más actividades <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border p-5 mt-4">
            <h3 className="font-semibold text-foreground mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración</span>
                <span className="font-medium text-foreground">{days.length} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actividades</span>
                <span className="font-medium text-foreground">
                  {days.reduce((acc, day) => acc + day.activities.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinos</span>
                <span className="font-medium text-foreground">
                  {new Set(days.flatMap((d) => d.activities.map((a) => a.location))).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
