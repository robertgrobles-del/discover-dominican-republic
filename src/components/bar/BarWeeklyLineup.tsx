import { Music, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LineupEvent {
  day: string;
  title: string;
  desc: string;
  time: string;
  badge: string;
}

interface BarWeeklyLineupProps {
  lineup?: LineupEvent[];
}

export function BarWeeklyLineup({ lineup }: BarWeeklyLineupProps) {
  const defaultLineup: LineupEvent[] = [
    { day: "Jueves", title: "Noche de Ritmos Latinos", desc: "Bachata sensual, salsa brava y cócteles 2x1 hasta la medianoche con banda en vivo.", time: "20:00 - 02:00", badge: "Live Band" },
    { day: "Viernes", title: "Sunset to Sunrise Sessions", desc: "DJ Set internacional de Deep House, Afrobeat y Tech-House con show de luces.", time: "21:00 - 04:00", badge: "Guest DJ" },
    { day: "Sábado", title: "Glow VIP Saturday", desc: "La fiesta más cotizada del destino con servicio de botellas premium y show temático.", time: "22:00 - 05:00", badge: "Top Night" },
    { day: "Domingo", title: "Sunset Chill & Cocktails", desc: "Tarde relajada al atardecer con mixología botánica y ritmos acústicos.", time: "17:00 - 01:00", badge: "Chillout" }
  ];

  const events = lineup && lineup.length > 0 ? lineup : defaultLineup;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Music className="h-6 w-6 text-primary" />
          Cartelera Semanal de Eventos & DJs
        </h3>
        <p className="text-sm text-muted-foreground">Programación de fiestas, shows temáticos y artistas en vivo</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((event, index) => (
          <div key={index} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-colors flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px]">
                  {event.day} • {event.badge}
                </Badge>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" /> {event.time}
                </span>
              </div>
              <h4 className="font-display text-base font-bold text-foreground mb-1">{event.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{event.desc}</p>
            </div>
            <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-primary flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3" /> Acceso sin cover con reserva VIP previa
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
