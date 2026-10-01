import { Link } from "react-router-dom";
import { Star, ChevronRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  nombre: string;
  imagen: string;
  categoria: string;
  rating: number;
  duracion: string;
  precio: number;
}

interface DestinationActivitiesProps {
  activities: Activity[];
  destinoId: string;
}

export function DestinationActivities({ activities, destinoId }: DestinationActivitiesProps) {
  return (
    <section id="destination-activities" className="scroll-mt-32 py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Actividades Recomendadas
            </h2>
            <p className="text-muted-foreground">
              Las mejores experiencias que puedes vivir en este destino
            </p>
          </div>
          <Link to={`/actividades?destino=${destinoId}`}>
            <Button variant="outline" className="gap-2">
              Ver todas <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to={`/actividad/${activity.id}`}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={activity.imagen}
                  alt={activity.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-primary/90">
                  {activity.categoria}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {activity.nombre}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{activity.duracion}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{activity.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">
                    ${activity.precio}<span className="text-xs text-muted-foreground font-normal">/persona</span>
                  </span>
                  <Button size="sm" variant="ghost" className="text-primary">
                    Ver más
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
