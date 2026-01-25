import { Plane, Car, Bus, Ship, Clock, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TransportOption {
  tipo: "avion" | "carro" | "bus" | "barco";
  desde: string;
  duracion: string;
  descripcion: string;
  precio?: string;
}

interface HowToGetThereProps {
  aeropuertoCercano: {
    nombre: string;
    codigo: string;
    distancia: string;
  };
  opciones: TransportOption[];
}

const transportIcons = {
  avion: Plane,
  carro: Car,
  bus: Bus,
  barco: Ship,
};

const transportLabels = {
  avion: "Avión",
  carro: "Carro",
  bus: "Autobús",
  barco: "Ferry",
};

export function HowToGetThere({ aeropuertoCercano, opciones }: HowToGetThereProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8">
          Cómo Llegar
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Aeropuerto cercano */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Aeropuerto Cercano</h3>
                <p className="text-sm text-muted-foreground">Punto de llegada recomendado</p>
              </div>
            </div>
            
            <div className="bg-secondary/50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-foreground">{aeropuertoCercano.nombre}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                  {aeropuertoCercano.codigo}
                </span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{aeropuertoCercano.distancia} del destino</span>
                </div>
              </div>
            </div>
            
            <Link to="/aeropuerto">
              <Button variant="outline" size="sm" className="w-full gap-2">
                Ver vuelos disponibles <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Opciones de transporte */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              {opciones.map((opcion, index) => {
                const Icon = transportIcons[opcion.tipo];
                return (
                  <div
                    key={index}
                    className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-foreground">
                            {transportLabels[opcion.tipo]}
                          </h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{opcion.duracion}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Desde {opcion.desde}
                        </p>
                        <p className="text-sm text-foreground/80">{opcion.descripcion}</p>
                        {opcion.precio && (
                          <p className="text-sm text-primary font-medium mt-2">
                            Desde {opcion.precio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
