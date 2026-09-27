import { Link } from "react-router-dom";
import { Clock, Calendar, Navigation, ChevronRight } from "lucide-react";
import { PortSchedule } from "@/data/puertosDetalleData";

interface PortSidebarProps {
  schedule: PortSchedule;
  nearbyDestinations: string[];
  coordinates: string;
}

export function PortSidebar({ schedule, nearbyDestinations, coordinates }: PortSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Schedule Card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-display font-bold text-foreground mb-4">Horarios</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Horario</p>
              <p className="font-medium text-foreground">{schedule.openHours}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Temporada Alta</p>
              <p className="font-medium text-foreground">{schedule.peakSeason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Destinations */}
      {nearbyDestinations.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-display font-bold text-foreground mb-4">Destinos Cercanos</h3>
          <div className="space-y-2">
            {nearbyDestinations.map((dest) => (
              <Link
                key={dest}
                to={`/destino/${dest.toLowerCase().replace(/ /g, "-")}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-foreground">{dest}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Location / Coordinates */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
          <div className="text-center p-4">
            <Navigation className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-mono">{coordinates}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
