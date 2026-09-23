import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Trash2, Plus, GripVertical, ChevronRight, Compass, Save, Share2, Mail, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { copyToClipboard, shareNative } from "@/lib/share-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const generateItineraryText = () => {
    let text = `🌴 *${tripName}*\n`;
    text += `📅 Duración: ${days.length} días\n\n`;
    
    days.forEach((day, index) => {
      text += `*Día ${index + 1}* - ${formatDate(day.date)}\n`;
      if (day.activities.length === 0) {
        text += "  Sin actividades planificadas\n";
      } else {
        day.activities.forEach((act) => {
          text += `  📍 ${act.name} (${act.location}) - ${act.duration}\n`;
        });
      }
      text += "\n";
    });
    
    text += "✈️ Planificado con RD Turismo";
    return text;
  };

  const shareViaWhatsApp = () => {
    const text = generateItineraryText();
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    toast.success("Abriendo WhatsApp para compartir");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Mi Itinerario: ${tripName}`);
    const body = encodeURIComponent(generateItineraryText().replace(/\*/g, ""));
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast.success("Abriendo correo para compartir");
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareViaWhatsApp} className="gap-2 cursor-pointer">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareViaEmail} className="gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyToClipboard(generateItineraryText())} className="gap-2 cursor-pointer">
                  <Link2 className="h-4 w-4" />
                  Copiar itinerario
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareNative({ title: tripName, text: generateItineraryText() })} className="gap-2 cursor-pointer">
                  <ExternalLink className="h-4 w-4" />
                  Compartir nativo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <Compass className="h-5 w-5 text-primary" />
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
