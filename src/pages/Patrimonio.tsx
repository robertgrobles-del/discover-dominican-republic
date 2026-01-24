import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { MapPin, Star, Clock, Users, Settings, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import santoDomingo from "@/assets/santo-domingo.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";
import history from "@/assets/history.jpg";

const categorias = ["Todo", "Ciudad Colonial", "Santiago", "Religioso", "Museos Estatales"];

const monumentos = [
  {
    id: 1,
    nombre: "Alcázar de Colón",
    ubicacion: "Plaza de España, Ciudad Colonial",
    descripcion: "Palacio virreinal fortificado construido entre 1511 y 1514. Sede del primer...",
    imagen: santoDomingo,
    rating: 4.8,
    horario: "Mar-Dom 9AM-5PM",
    precio: "RD$100 / $2 USD",
    tags: ["Audio Guía", "Familiar"],
    badge: "360°"
  },
  {
    id: 2,
    nombre: "Catedral Primada",
    ubicacion: "Parque Colón, Ciudad Colonial",
    descripcion: "La Catedral de Santa María la Menor es la catedral más antigua de Améric...",
    imagen: colonialDoor,
    rating: 4.9,
    horario: "Lun-Sab 9AM-4:30PM",
    precio: "Entrada Libre",
    tags: ["Misas Diarias"],
    badge: "AR Ready"
  },
  {
    id: 3,
    nombre: "Fortaleza Ozama",
    ubicacion: "Calle Las Damas",
    descripcion: "El fuerte militar más antiguo de origen europeo en América. Patrimonio de l...",
    imagen: history,
    rating: 4.6,
    horario: "Lun-Dom 9AM-5PM",
    precio: "RD$70",
    tags: ["Tours Grupales"],
    badge: null
  },
  {
    id: 4,
    nombre: "Monumento de Santiago",
    ubicacion: "Cerro del Castillo, Santiago",
    descripcion: "Monumento a los Héroes de la Restauración. Ofrece las mejores...",
    imagen: santoDomingo,
    rating: 4.9,
    horario: "Mar-Dom 10AM-9PM",
    precio: "RD$50",
    tags: [],
    badge: "Vista Nocturna"
  },
  {
    id: 5,
    nombre: "Casas Reales",
    ubicacion: "Calle Las Damas",
    descripcion: "Museo dedicado a la historia, vida y costumbres de la colonia española e...",
    imagen: colonialDoor,
    rating: 4.7,
    horario: "Mar-Dom 9AM-5PM",
    precio: "RD$100",
    tags: [],
    badge: null
  },
  {
    id: 6,
    nombre: "Faro a Colón",
    ubicacion: "Santo Domingo Este",
    descripcion: "Monumento en forma de cruz que alberga los restos de Cristóbal Colón...",
    imagen: history,
    rating: 4.3,
    horario: "Mar-Dom 9AM-5PM",
    precio: "RD$100",
    tags: [],
    badge: null
  }
];

export default function Patrimonio() {
  const [selectedCategoria, setSelectedCategoria] = useState("Todo");
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[50vh] flex items-end overflow-hidden pt-16">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={santoDomingo}
            alt="Patrimonio de República Dominicana"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Badge className="mb-4 bg-blue-600/20 text-blue-400 border-blue-600/30">
              DESTACADO DEL MES
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 italic">
              Guardianes de la Historia
            </h1>
            <p className="text-lg text-white/80 max-w-xl mb-6">
              Un recorrido inmersivo por la arquitectura y memoria dominicana. Descubre los secretos de la Ciudad Colonial a través de realidad aumentada.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="gap-2">
                <Play className="h-4 w-4" /> Ver Documental
              </Button>
              <Button variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Settings className="h-4 w-4" /> Tour Virtual 360°
              </Button>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategoria === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategoria(cat)}
                    className={selectedCategoria === cat ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Ordenar por:</span>
                <Button variant="ghost" size="sm">Relevancia</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Explorar Colección */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">Explorar Colección</h2>
              <Link to="/destinos" className="text-blue-500 text-sm font-medium hover:underline">
                Ver Mapa →
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monumentos.map((monumento) => (
                <div key={monumento.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-blue-500/50 transition-colors group">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src={monumento.imagen} 
                      alt={monumento.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {monumento.badge && (
                      <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                        {monumento.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-bold text-lg text-foreground">{monumento.nombre}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{monumento.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      <span>{monumento.ubicacion}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{monumento.descripcion}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" /> {monumento.horario}
                      </span>
                      <span>{monumento.precio}</span>
                    </div>

                    {monumento.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {monumento.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded flex items-center gap-1">
                            <Users className="h-3 w-3" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1">Detalles</Button>
                      <Button size="icon" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AR Banner */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-2xl p-8 md:p-12 border border-blue-500/30">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4 italic">
                    Vive la historia con Realidad Aumentada
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Apunta tu cámara a cualquier monumento marcado con el icono AR y descubre cómo se veía hace 500 años. Reconstrucciones históricas en tiempo real.
                  </p>
                  <Button variant="secondary" className="gap-2">
                    <Download className="h-4 w-4" /> Descargar App
                  </Button>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-blue-500/10 border-2 border-dashed border-blue-500/30 flex items-center justify-center">
                    <Settings className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
