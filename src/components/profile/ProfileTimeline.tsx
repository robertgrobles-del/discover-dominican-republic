import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";

interface ProfileTimelineProps {
  timelineEvents: any[];
  newTimelineDest: string;
  setNewTimelineDest: (dest: string) => void;
  newTimelineDate: string;
  setNewTimelineDate: (date: string) => void;
  newTimelineNotes: string;
  setNewTimelineNotes: (notes: string) => void;
  handleAddTimelineEvent: (e: React.FormEvent) => void;
}

export function ProfileTimeline({
  timelineEvents,
  newTimelineDest,
  setNewTimelineDest,
  newTimelineDate,
  setNewTimelineDate,
  newTimelineNotes,
  setNewTimelineNotes,
  handleAddTimelineEvent,
}: ProfileTimelineProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agregar Destino a mi Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTimelineEvent} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-semibold">Destino</label>
              <Input
                placeholder="Ej. Jarabacoa, Las Terrenas..."
                value={newTimelineDest}
                onChange={(e) => setNewTimelineDest(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold">Fecha del Viaje</label>
              <Input
                type="date"
                value={newTimelineDate}
                onChange={(e) => setNewTimelineDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold">Notas del viaje</label>
              <Textarea
                placeholder="Describe brevemente tus mejores recuerdos..."
                value={newTimelineNotes}
                onChange={(e) => setNewTimelineNotes(e.target.value)}
                rows={3}
                className="mt-1 resize-none"
              />
            </div>
            <Button type="submit" className="w-full text-xs font-bold gap-1">
              <Plus className="h-3.5 w-3.5" /> Agregar Parada
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Línea de Tiempo de Viajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No has añadido paradas a tu línea de tiempo todavía.
            </p>
          ) : (
            <div className="relative border-l border-border ml-2 pl-4 space-y-6 py-2">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-sm" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{event.name}</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{event.date}</p>
                    {event.notes && (
                      <p className="text-[11px] text-muted-foreground mt-1 bg-secondary/30 p-2 rounded-lg border border-border/50 italic leading-relaxed">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
