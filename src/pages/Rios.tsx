import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { MapPin, Star, Droplets, TreePine, Mountain, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import rafting from "@/assets/rafting.jpg";
import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";

const rios = [
  {
    id: "yaque-norte",
    nombre: "Río Yaque del Norte",
    ubicacion: "Jarabacoa",
    rating: 4.9,
    imagen: rafting,
    descripcion: "El río más largo de RD, perfecto para rafting y kayak con rápidos de clase II-IV.",
    actividades: ["Rafting", "Kayak", "Tubing"],
    tipo: "Aventura",
    longitud: "296 km"
  },
  {
    id: "jimenoa",
    nombre: "Salto de Jimenoa",
    ubicacion: "Jarabacoa",
    rating: 4.8,
    imagen: adventure,
    descripcion: "Impresionante cascada de 40 metros rodeada de exuberante vegetación tropical.",
    actividades: ["Senderismo", "Natación", "Fotografía"],
    tipo: "Cascada",
    longitud: "40m altura"
  },
  {
    id: "damajagua",
    nombre: "27 Charcos de Damajagua",
    ubicacion: "Puerto Plata",
    rating: 4.9,
    imagen: diving,
    descripcion: "Sistema único de 27 cascadas naturales para saltar, nadar y deslizarse.",
    actividades: ["Canyoning", "Saltos", "Natación"],
    tipo: "Aventura",
    longitud: "27 charcos"
  },
  {
    id: "chavon",
    nombre: "Río Chavón",
    ubicacion: "La Romana",
    rating: 4.6,
    imagen: adventure,
    descripcion: "Río escénico que desemboca en el Caribe, famoso por el anfiteatro de Altos de Chavón.",
    actividades: ["Paseos en bote", "Pesca", "Fotografía"],
    tipo: "Escénico",
    longitud: "33 km"
  },
  {
    id: "yasica",
    nombre: "Río Yasica",
    ubicacion: "Puerto Plata",
    rating: 4.5,
    imagen: rafting,
    descripcion: "Aventura de tubing por aguas cristalinas entre paisajes montañosos.",
    actividades: ["Tubing", "Natación", "Picnic"],
    tipo: "Familiar",
    longitud: "28 km"
  },
  {
    id: "socoa",
    nombre: "Charcos de Los Militares",
    ubicacion: "Villa Altagracia",
    rating: 4.7,
    imagen: diving,
    descripcion: "Piscinas naturales de agua dulce formadas por el río Haina.",
    actividades: ["Natación", "Picnic", "Senderismo"],
    tipo: "Piscina Natural",
    longitud: "Múltiples pozas"
  }
];

const RioCard = ({ rio, index }: { rio: typeof rios[0]; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}
        <img
          src={rio.imagen}
          alt={rio.nombre}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-emerald-500/90 text-white">
          {rio.tipo}
        </Badge>
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{rio.rating}</span>
        </div>
        <div className="absolute bottom-4 left-4 text-white/90 text-sm font-medium">
          {rio.longitud}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{rio.ubicacion}</span>
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">{rio.nombre}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{rio.descripcion}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {rio.actividades.map((act) => (
            <span key={act} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
              {act}
            </span>
          ))}
        </div>

        <Link to={`/actividades`}>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Ver Detalles
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default function Rios() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={rafting}
            alt="Ríos de República Dominicana"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Droplets className="w-4 h-4 mr-2" />
              Aventura Natural
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Ríos y <span className="text-emerald-400">Cascadas</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Explora los ríos y cascadas más impresionantes del Caribe
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Droplets, label: "30+ Ríos", desc: "Para explorar" },
                { icon: Mountain, label: "Cascadas", desc: "Impresionantes" },
                { icon: TreePine, label: "Naturaleza", desc: "Virgen y exuberante" },
                { icon: Compass, label: "Aventura", desc: "Para todos los niveles" }
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rios Grid */}
        <section className="py-16 flex-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Destinos de Agua Dulce
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Desde rafting extremo hasta tranquilas piscinas naturales
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rios.map((rio, index) => (
                <RioCard key={rio.id} rio={rio} index={index} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
