import { Clock, MapPin, Phone, Mail, Globe, Tent, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ParqueNacionalData } from "@/data/parquesNacionalesData";

interface ParqueNacionalSidebarProps {
  parque: ParqueNacionalData;
}

export function ParqueNacionalSidebar({ parque }: ParqueNacionalSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Booking Card */}
      <div className="bg-card rounded-xl border border-border p-6 sticky top-24 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tarifa de Entrada</p>
          <p className="text-3xl font-bold text-primary mt-1">{parque.precio}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Horario de Operación</p>
              <p className="text-foreground font-medium">{parque.horario}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Superficie Total</p>
              <p className="text-foreground font-medium">{parque.superficie}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://wa.me/18092214660?text=${encodeURIComponent(`Hola, vi el ${parque.nombre} en Descubre República Dominicana y deseo coordinar información sobre visitas, guías y accesos.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md"
          >
            Consultar Visita Guiada
          </a>
          <FavoriteButton
            id={parque.id}
            type="parque-nacional"
            name={parque.nombre}
            image={parque.imagenes[0]?.src || ""}
            location={parque.provincia}
            variant="button"
            className="w-full"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-border space-y-3">
          {parque.telefono && (
            <a href={`tel:${parque.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>{parque.telefono}</span>
            </a>
          )}
          {parque.email && (
            <a href={`mailto:${parque.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{parque.email}</span>
            </a>
          )}
          {parque.website && (
            <a href={parque.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Globe className="h-4 w-4 shrink-0 text-primary" />
              <span>Sitio Web Oficial</span>
            </a>
          )}
        </div>
      </div>

      {/* Servicios */}
      {parque.servicios?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-base">
            <Tent className="h-5 w-5 text-primary" />
            Servicios e Instalaciones
          </h3>
          <ul className="space-y-2.5">
            {parque.servicios.map((servicio, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{servicio}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
