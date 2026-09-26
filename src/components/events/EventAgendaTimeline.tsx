import React from "react";
import { Clock, Calendar } from "lucide-react";

interface AgendaItem {
  hora: string;
  titulo: string;
  desc: string;
}

interface EventAgendaTimelineProps {
  agenda?: AgendaItem[];
  title?: string;
}

export const EventAgendaTimeline: React.FC<EventAgendaTimelineProps> = ({
  agenda = [],
  title = "Programa & Cronograma del Evento",
}) => {
  if (!agenda || agenda.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> {title}
        </h3>
        <span className="text-xs text-muted-foreground font-semibold">
          {agenda.length} actividades programadas
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/25">
        {agenda.map((act, index) => (
          <div key={index} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:scale-110 transition-all flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-primary-foreground" />
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/60 transition-colors space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary font-mono flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" /> {act.hora}
                </span>
                <h4 className="font-bold text-sm text-foreground">{act.titulo}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {act.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
