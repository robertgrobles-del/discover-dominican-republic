import { motion } from "framer-motion";
import { Clock, MapPin, Compass } from "lucide-react";

interface ItineraryStep {
  hora: string;
  titulo: string;
  desc: string;
}

interface ActivityItineraryTimelineProps {
  itinerario?: ItineraryStep[];
  duracion?: string;
}

export function ActivityItineraryTimeline({
  itinerario,
  duracion = "3 horas"
}: ActivityItineraryTimelineProps) {
  const defaultSteps: ItineraryStep[] = [
    { hora: "Inicio", titulo: "Punto de encuentro y bienvenida", desc: "Recepción de participantes, entrega de equipo y charla de seguridad con el guía líder." },
    { hora: "En ruta", titulo: "Desarrollo de la experiencia", desc: "Recorrido guiado, paradas fotográficas y explicación de la flora, fauna e historia local." },
    { hora: "Intermedio", titulo: "Pausa activa o refrigerio", desc: "Degustación de frutas frescas, agua o tiempo libre para nadar y relajarse." },
    { hora: "Cierre", titulo: "Retorno y despedida", desc: "Regreso seguro al punto de partida y entrega de recomendaciones para el resto de tu estadía." }
  ];

  const steps = itinerario && itinerario.length > 0 ? itinerario : defaultSteps;

  return (
    <div className="p-6 sm:p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Itinerario y Cronograma
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Estructura estimada de la actividad ({duracion} en total)
          </p>
        </div>
      </div>

      <div className="space-y-6 relative pl-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            viewport={{ once: true }}
            className="relative pl-8 pb-6 last:pb-0"
          >
            {/* Timeline connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%-8px)] bg-border" />
            )}
            
            {/* Timeline bullet */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              index === 0 ? "border-primary bg-primary/20" : "border-border bg-background"
            }`}>
              <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> {step.hora}
              </span>
              <h4 className="font-display font-bold text-base text-foreground">
                {step.titulo}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
