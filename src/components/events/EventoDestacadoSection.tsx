import { Calendar, MapPin, Play, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import carnival from "@/assets/carnival.jpg";

interface EventoDestacadoProps {
  evento: {
    titulo: string;
    fechas: string;
    ubicacion: string;
    countdown: { dias: number; horas: number; minutos: number };
    descripcion: string;
    agenda: Array<{ hora: string; titulo: string; desc: string }>;
  };
  labels: {
    featuredEvent: string;
    aboutEvent: string;
    dayAgenda: string;
    watchVideo: string;
    viewOnMap: string;
    interested: string;
    interestedDesc: string;
    imInterested: string;
  };
}

export function EventoDestacadoSection({ evento, labels }: EventoDestacadoProps) {
  return (
    <div className="mt-16">
      <span className="text-primary text-sm font-semibold uppercase tracking-wider">{labels.featuredEvent}</span>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mt-2 mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">{evento.titulo}</h2>
          <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {evento.fechas}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" /> {evento.ubicacion}
            </span>
          </div>
        </div>
        
        {/* Countdown */}
        <div className="flex items-center gap-2">
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <span className="text-2xl font-bold text-foreground">{evento.countdown.dias}</span>
            <p className="text-xs text-muted-foreground">DÍAS</p>
          </div>
          <span className="text-2xl text-muted-foreground">:</span>
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <span className="text-2xl font-bold text-foreground">{evento.countdown.horas}</span>
            <p className="text-xs text-muted-foreground">HRS</p>
          </div>
          <span className="text-2xl text-muted-foreground">:</span>
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <span className="text-2xl font-bold text-primary">{evento.countdown.minutos}</span>
            <p className="text-xs text-muted-foreground">MIN</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-4">{labels.aboutEvent}</h3>
          <p className="text-muted-foreground whitespace-pre-line mb-8">{evento.descripcion}</p>

          <h3 className="font-display font-bold text-lg text-foreground mb-4">{labels.dayAgenda}</h3>
          <div className="space-y-4">
            {evento.agenda.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                  {i < evento.agenda.length - 1 && <div className="w-0.5 h-full bg-border" />}
                </div>
                <div>
                  <span className="text-primary text-sm font-semibold">{item.hora}</span>
                  <h4 className="font-semibold text-foreground">{item.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden aspect-video bg-secondary relative">
            <img src={carnival} alt="Ubicación" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button size="lg" variant="secondary" className="gap-2">
                <Play className="h-5 w-5" /> {labels.watchVideo}
              </Button>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="font-semibold text-foreground mb-2">Parque de las Flores</h4>
            <p className="text-sm text-muted-foreground mb-4">Av. Pedro A. Rivera, La Vega</p>
            <Button variant="outline" className="w-full">{labels.viewOnMap}</Button>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="font-semibold text-foreground mb-2">{labels.interested}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {labels.interestedDesc}
            </p>
            <Button className="w-full gap-2">
              <ThumbsUp className="h-4 w-4" /> {labels.imInterested}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
