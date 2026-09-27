import { motion } from "framer-motion";
import { Fuel, Shield, Wifi } from "lucide-react";
import { MarinaAmenity, MarinaService } from "@/data/marinasDetalleData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  fuel: Fuel,
  badge: Shield,
  electrical: Wifi,
  security: Shield,
};

interface MarinaContentProps {
  descripcionLarga: string;
  servicios: MarinaService[];
  amenidades: MarinaAmenity[];
}

export function MarinaContent({ descripcionLarga, servicios, amenidades }: MarinaContentProps) {
  return (
    <div className="lg:col-span-2 space-y-8">
      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Experiencia Náutica de Clase Mundial
        </h2>
        <p className="text-muted-foreground leading-relaxed">{descripcionLarga}</p>
      </motion.div>

      {/* Services */}
      {servicios.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Servicios del Puerto</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {servicios.map((servicio, index) => {
              const IconComponent = iconMap[servicio.icono] || Shield;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{servicio.titulo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{servicio.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Amenities Gallery */}
      {amenidades.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-6">Estilo de Vida y Amenidades</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {amenidades.map((amenidad, index) => (
              <div key={index} className="group">
                <div className="overflow-hidden rounded-lg aspect-[4/3] mb-3 shadow-sm">
                  <img
                    src={amenidad.imagen}
                    alt={amenidad.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {amenidad.titulo}
                </h4>
                <p className="text-sm text-muted-foreground">{amenidad.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
