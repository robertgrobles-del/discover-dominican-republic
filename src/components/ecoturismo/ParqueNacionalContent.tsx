import { motion } from "framer-motion";
import { Star, MapPin, Leaf, Bird, TreeDeciduous, Mountain, Camera, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParqueNacionalData } from "@/data/parquesNacionalesData";

interface ParqueNacionalContentProps {
  parque: ParqueNacionalData;
}

const dificultadColor: Record<string, string> = {
  Fácil: "bg-emerald-500",
  Media: "bg-amber-500",
  Difícil: "bg-red-500",
};

export function ParqueNacionalContent({ parque }: ParqueNacionalContentProps) {
  return (
    <div className="lg:col-span-2 space-y-8">
      {/* Header Info */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={`${dificultadColor[parque.dificultad] || "bg-primary"} text-white`}>
            {parque.dificultad}
          </Badge>
          {parque.etiquetas.map((etiqueta) => (
            <Badge key={etiqueta} variant="secondary">
              {etiqueta}
            </Badge>
          ))}
          <div className="flex items-center gap-1 text-amber-500 ml-auto">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{parque.rating}</span>
            <span className="text-muted-foreground">({parque.reviews} reseñas)</span>
          </div>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {parque.nombre}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span>
            {parque.ubicacion}, {parque.provincia}
          </span>
        </div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="prose prose-invert max-w-none"
      >
        <p className="text-lg text-muted-foreground leading-relaxed">
          {parque.descripcionLarga}
        </p>
      </motion.div>

      {/* Ecosistemas */}
      {parque.ecosistemas?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-500" />
            Ecosistemas
          </h2>
          <div className="flex flex-wrap gap-2">
            {parque.ecosistemas.map((eco, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              >
                {eco}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Fauna y Flora */}
      <div className="grid md:grid-cols-2 gap-6">
        {parque.fauna?.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bird className="h-5 w-5 text-primary" />
              Fauna Destacada
            </h3>
            <ul className="space-y-2">
              {parque.fauna.map((animal, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {animal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {parque.flora?.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TreeDeciduous className="h-5 w-5 text-emerald-500" />
              Flora Destacada
            </h3>
            <ul className="space-y-2">
              {parque.flora.map((planta, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {planta}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Senderos */}
      {parque.senderos?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            Senderos y Rutas
          </h2>
          <div className="space-y-4">
            {parque.senderos.map((sendero, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{sendero.nombre}</p>
                  <p className="text-sm text-muted-foreground">{sendero.distancia}</p>
                </div>
                <Badge
                  className={
                    sendero.dificultad === "Fácil"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : sendero.dificultad === "Media"
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-red-500/20 text-red-500"
                  }
                >
                  {sendero.dificultad}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividades */}
      {parque.actividades?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Actividades Disponibles
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {parque.actividades.map((actividad, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{actividad}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
