import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight, Calendar } from "lucide-react";
import { PortData } from "@/data/portsData";

interface PortCardProps {
  port: PortData;
  index: number;
}

export function PortCard({ port, index }: PortCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-3 gap-0">
          {/* Image */}
          <div className="relative h-64 lg:h-auto">
            <img
              src={port.image}
              alt={port.name}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 left-4">{port.type}</Badge>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">{port.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{port.location}</span>
                  <span className="text-xs">({port.coordinates})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>{port.schedule}</span>
              </div>
            </div>

            {/* Cruise Lines */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                Líneas de Cruceros
              </h3>
              <div className="flex flex-wrap gap-2">
                {port.cruiseLines.map((line) => (
                  <Badge key={line} variant="outline">{line}</Badge>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                Facilidades
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {port.facilities.map((facility) => (
                  <div key={facility.name} className="flex items-center gap-2 text-sm">
                    <facility.icon className="h-4 w-4 text-primary" />
                    <span>{facility.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                Actividades Cercanas
              </h3>
              <div className="flex flex-wrap gap-2">
                {port.nearbyAttractions.map((attraction) => (
                  <Link key={attraction} to={`/destino/${port.location.toLowerCase().replace(' ', '-')}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                      {attraction}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={`/puerto/${port.id}`}>
                <Button className="gap-2">
                  Ver Detalle Completo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Agregar al Plan
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
