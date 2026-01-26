import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Volume2, 
  Maximize, 
  Share2,
  MapPin,
  Sun,
  Clock,
  Wind,
  Grid,
  List,
  Calendar
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const cameras = [
  {
    id: "malecon",
    name: "Malecón SD",
    location: "Santo Domingo",
    temperature: "28°C",
    status: "live",
    image: santoDomingoImg,
    description: "Disfruta de una vista panorámica en tiempo real del icónico Malecón de Santo Domingo. Esta cámara está situada estratégicamente para capturar la vibrante vida de la avenida George Washington y el inmenso Mar Caribe.",
  },
  {
    id: "bavaro",
    name: "Playa Bávaro",
    location: "Punta Cana",
    temperature: "29°C",
    status: "live",
    image: puntaCanaImg,
  },
  {
    id: "jarabacoa",
    name: "Montañas Jarabacoa",
    location: "La Vega",
    temperature: "22°C",
    status: "live",
    image: samanaImg,
  },
  {
    id: "cabarete",
    name: "Cabarete Kite Beach",
    location: "Puerto Plata",
    temperature: "30°C",
    status: "live",
    image: puertoPlataImg,
  },
  {
    id: "colonial",
    name: "Zona Colonial",
    location: "Santo Domingo",
    temperature: "27°C",
    status: "offline",
    image: santoDomingoImg,
  },
];

export default function Webcams() {
  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumb */}
        <section className="py-4 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>RD en Vivo</span>
                <span>›</span>
                <span className="text-foreground">{selectedCamera.location}</span>
              </nav>
              <Badge variant="outline" className="gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                EN VIVO
              </Badge>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Player */}
              <div className="lg:col-span-2">
                <motion.div
                  key={selectedCamera.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border"
                >
                  {/* Video Player */}
                  <div className="relative aspect-video bg-black">
                    <img
                      src={selectedCamera.image}
                      alt={selectedCamera.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay Controls */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-white font-display text-2xl font-bold drop-shadow-lg">
                          {selectedCamera.name === "Malecón SD" ? "Malecón de Santo Domingo" : selectedCamera.name}
                        </h2>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedCamera.location === "Santo Domingo" ? "Distrito Nacional" : selectedCamera.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                          <Share2 className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                          <Maximize className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Play Button */}
                    <button className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Play className="h-10 w-10 text-white fill-white" />
                      </div>
                    </button>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                      <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 h-1 bg-white/30 rounded-full">
                        <div className="w-3/4 h-full bg-primary rounded-full" />
                      </div>
                      <Badge className="bg-red-500 text-white gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </Badge>
                    </div>
                  </div>

                  {/* Weather Info */}
                  <div className="grid grid-cols-3 divide-x divide-border">
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Sun className="h-4 w-4" />
                        CLIMA ACTUAL
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-foreground">{selectedCamera.temperature}</span>
                        <Sun className="h-8 w-8 text-amber-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">Soleado, humedad 72%</p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        HORA LOCAL
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        10:42 <span className="text-lg font-normal text-muted-foreground">AM</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Zona Horaria AST (GMT-4)</p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Wind className="h-4 w-4" />
                        VIENTO
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-foreground">15</span>
                        <span className="text-lg text-muted-foreground">km/h</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wind className="h-5 w-5 text-primary rotate-45" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Dirección Noreste</p>
                    </div>
                  </div>
                </motion.div>

                {/* Description */}
                {selectedCamera.description && (
                  <div className="mt-6 p-6 bg-card rounded-2xl border border-border">
                    <h3 className="font-display font-bold text-foreground mb-2">Sobre esta vista</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {selectedCamera.description} Perfecto para verificar las condiciones del mar antes de salir o simplemente para conectar con la capital dominicana desde cualquier lugar del mundo.
                    </p>
                    <div className="flex gap-4 mt-4">
                      <Button variant="link" className="text-primary p-0">
                        Ver en mapa ↗
                      </Button>
                      <Button variant="link" className="text-primary p-0">
                        Hoteles cercanos 🏨
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-foreground">Otras Cámaras</h3>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      className="h-8 w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={viewMode === "list" ? "default" : "ghost"}
                      className="h-8 w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {cameras.map((camera) => (
                    <motion.button
                      key={camera.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedCamera(camera)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-colors text-left ${
                        selectedCamera.id === camera.id
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={camera.image}
                          alt={camera.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge 
                          className={`absolute top-1 right-1 text-[10px] px-1 py-0 ${
                            camera.status === "live" ? "bg-red-500" : "bg-muted"
                          }`}
                        >
                          {camera.status === "live" ? "LIVE" : "OFF"}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate ${
                          selectedCamera.id === camera.id ? "text-primary" : "text-foreground"
                        }`}>
                          {camera.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {camera.location} • {camera.temperature}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 p-6 bg-card rounded-2xl border border-border text-center">
                  <p className="text-muted-foreground text-sm mb-4">¿Te gusta lo que ves?</p>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planificar Viaje
                  </Button>
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
