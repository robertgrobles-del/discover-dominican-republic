import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { MapPin, Star, Heart, Leaf, Filter, Grid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

import hotelBillini from "@/assets/hotel-billini.jpg";
import hotelClareVerde from "@/assets/hotel-clare-verde.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import hotelRoomSuite from "@/assets/hotel-room-suite.jpg";

const alojamientos = [
  {
    id: "paradisus",
    nombre: "Paradisus Grand Cana",
    ubicacion: "Bávaro, Punta Cana",
    rating: 4.9,
    imagen: hotelEdenRoc,
    precio: 450,
    precioOriginal: 620,
    tags: ["All-Inclusive", "Spa", "Playa Privada"],
    tipo: "Colección Lujo",
    sostenible: false
  },
  {
    id: "eco-villas",
    nombre: "Eco Villas Samaná",
    ubicacion: "Las Terrenas, Samaná",
    rating: 4.7,
    imagen: hotelClareVerde,
    precio: 120,
    precioOriginal: null,
    tags: ["WiFi", "Energía Solar", "Cocina"],
    tipo: "Eco-Lodge",
    sostenible: true
  },
  {
    id: "embajador",
    nombre: "El Embajador Royal",
    ubicacion: "Santo Domingo",
    rating: 4.9,
    imagen: hotelBillini,
    precio: 185,
    precioOriginal: 210,
    tags: ["Business", "Piscina", "Gimnasio"],
    tipo: "Hotel Urbano",
    sostenible: false
  },
  {
    id: "surf-lodge",
    nombre: "Cabarete Surf Lodge",
    ubicacion: "Cabarete, Puerto Plata",
    rating: 4.5,
    imagen: hotelRoomSuite,
    precio: 85,
    precioOriginal: null,
    tags: ["Surf", "Bar", "Frente al Mar"],
    tipo: "Boutique",
    sostenible: false
  },
  {
    id: "casa-xvi",
    nombre: "Casa del XVI",
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    imagen: hotelBillini,
    precio: 230,
    precioOriginal: null,
    tags: ["Histórico", "Boutique", "Piscina"],
    tipo: "Heritage",
    sostenible: true
  },
  {
    id: "mountain-lodge",
    nombre: "Jarabacoa Mountain Lodge",
    ubicacion: "Jarabacoa, La Vega",
    rating: 4.6,
    imagen: hotelClareVerde,
    precio: 95,
    precioOriginal: null,
    tags: ["Naturaleza", "Rafting", "Vistas"],
    tipo: "Eco-Lodge",
    sostenible: true
  }
];

const tiposAlojamiento = ["Hoteles", "Resorts All-Inclusive", "Villas Privadas", "Apartamentos"];
const regiones = ["Punta Cana", "Santo Domingo", "Puerto Plata", "Samaná", "La Romana"];

const AlojamientoCard = ({ alojamiento, index }: { alojamiento: typeof alojamientos[0]; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}
        <img
          src={alojamiento.imagen}
          alt={alojamiento.nombre}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {alojamiento.tipo === "Colección Lujo" && (
          <Badge className="absolute top-4 left-4 bg-amber-500 text-white">
            COLECCIÓN LUJO
          </Badge>
        )}
        {alojamiento.sostenible && (
          <Badge className="absolute top-4 left-4 bg-emerald-500 text-white gap-1">
            <Leaf className="w-3 h-3" /> Sostenible
          </Badge>
        )}
        
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-lg text-foreground">{alojamiento.nombre}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">{alojamiento.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{alojamiento.ubicacion}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {alojamiento.tags.map((tag) => (
            <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Precio por noche</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">${alojamiento.precio}</span>
              {alojamiento.precioOriginal && (
                <span className="text-sm text-muted-foreground line-through">${alojamiento.precioOriginal}</span>
              )}
            </div>
          </div>
          <Link to={`/alojamiento/${alojamiento.id}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Ver detalles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Alojamientos() {
  const [priceRange, setPriceRange] = useState([50, 350]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          {/* Search Bar */}
          <div className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] p-3 rounded-lg bg-secondary">
                  <span className="text-xs text-muted-foreground">DESTINO</span>
                  <p className="font-medium text-foreground">República Dominicana</p>
                </div>
                <div className="flex-1 min-w-[150px] p-3 rounded-lg bg-secondary">
                  <span className="text-xs text-muted-foreground">FECHAS</span>
                  <p className="font-medium text-muted-foreground">Agregar fechas</p>
                </div>
                <div className="flex-1 min-w-[150px] p-3 rounded-lg bg-secondary">
                  <span className="text-xs text-muted-foreground">HUÉSPEDES</span>
                  <p className="font-medium text-foreground">2 adultos, 1 niño</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6">
                  Buscar
                </Button>
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <Grid className="w-4 h-4 mr-2" /> Lista
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="rounded-none"
                  >
                    <Map className="w-4 h-4 mr-2" /> Mapa
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="w-full lg:w-72 shrink-0">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Map Preview */}
                  <div className="rounded-xl overflow-hidden bg-secondary aspect-[4/3] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="secondary" className="gap-2">
                        <Map className="w-4 h-4" /> Ver en mapa
                      </Button>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Rango de precio</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Precio promedio por noche: ${Math.round((priceRange[0] + priceRange[1]) / 2)}
                    </p>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={50}
                      max={500}
                      step={10}
                      className="mb-4"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 rounded bg-secondary text-center text-sm">
                        $ {priceRange[0]}
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="flex-1 p-2 rounded bg-secondary text-center text-sm">
                        $ {priceRange[1]}+
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Alojamiento */}
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Tipo de Alojamiento</h3>
                    <div className="space-y-3">
                      {tiposAlojamiento.map((tipo, i) => (
                        <div key={tipo} className="flex items-center gap-3">
                          <Checkbox id={`tipo-${i}`} defaultChecked={i === 0} />
                          <label htmlFor={`tipo-${i}`} className="text-sm text-foreground cursor-pointer">
                            {tipo}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Región */}
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Región</h3>
                    <div className="space-y-3">
                      {regiones.map((region, i) => (
                        <div key={region} className="flex items-center gap-3">
                          <Checkbox id={`region-${i}`} defaultChecked={i === 0} />
                          <label htmlFor={`region-${i}`} className="text-sm text-foreground cursor-pointer">
                            {region}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Alojamientos en RD</h1>
                    <p className="text-muted-foreground">450+ lugares para hospedarte encontrados</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    Ordenar por: Recomendados
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {alojamientos.map((alojamiento, index) => (
                    <AlojamientoCard key={alojamiento.id} alojamiento={alojamiento} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button variant="outline">Anterior</Button>
                  <Button className="bg-primary text-primary-foreground">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <span className="text-muted-foreground">...</span>
                  <Button variant="outline">Siguiente</Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
