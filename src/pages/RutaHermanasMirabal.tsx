import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Calendar, Landmark, BookOpen, Compass, 
  Map, History, ArrowRight, Star, Heart
} from "lucide-react";
import { toast } from "sonner";

interface RouteStop {
  id: string;
  name: string;
  location: string;
  type: string;
  description: string;
  highlights: string[];
  hours: string;
  price: string;
}

const routeStops: RouteStop[] = [
  {
    id: "stop1",
    name: "Casa-Museo Hermanas Mirabal",
    location: "Conuco, Salcedo",
    type: "Museo Histórico",
    description: "La última residencia de las hermanas Patria, Minerva y María Teresa Mirabal. Conserva sus pertenencias personales, vestimentas, biblioteca y los hermosos jardines que ellas mismas cuidaban.",
    highlights: ["Objetos personales intactos", "Jardín de la memoria", "Mausoleo donde reposan sus restos junto a Manolo Tavárez Justo"],
    hours: "Mar - Dom: 9:00 AM - 5:00 PM",
    price: "Contribución voluntaria (Sugerido RD$100)"
  },
  {
    id: "stop2",
    name: "Ojo de Agua (Casa Natal)",
    location: "Salcedo",
    type: "Sitio Histórico",
    description: "El lugar donde nacieron y crecieron las mariposas. Se conserva la estructura de la vivienda materna y un monumento en su honor rodeado de una frondosa vegetación.",
    highlights: ["Paredón del recuerdo", "Manantial natural Ojo de Agua", "Infografía interactiva sobre su niñez"],
    hours: "Abierto 24/7 (Exterior)",
    price: "Gratuito"
  },
  {
    id: "stop3",
    name: "Ruta de los Murales de Salcedo",
    location: "Centro de Salcedo",
    type: "Galería de Arte Urbano",
    description: "Un museo a cielo abierto con cientos de murales pintados por artistas nacionales y locales. Rinde tributo a la libertad, los derechos humanos y la memoria de las Hermanas Mirabal.",
    highlights: ["Más de 300 murales artísticos", "Parque de la Cultura", "Ruta caminable guiada"],
    hours: "Abierto 24/7",
    price: "Gratuito"
  },
  {
    id: "stop4",
    name: "Ecoparque de la Paz",
    location: "Salcedo",
    type: "Ecoturismo & Reflexión",
    description: "Un espacio ecológico ideal para la meditación y el esparcimiento familiar. Diseñado para honrar la paz y la no violencia contra la mujer en un entorno natural rodeado de lagunas y árboles nativos.",
    highlights: ["Senderos de caminata", "Monumento a la Paz", "Avistamiento de aves locales"],
    hours: "Todos los días: 8:00 AM - 6:00 PM",
    price: "Gratuito"
  }
];

export default function RutaHermanasMirabal() {
  const [activeStop, setActiveStop] = useState<string>("stop1");
  const currentStop = routeStops.find(s => s.id === activeStop) || routeStops[0];

  const handleStartRoute = () => {
    toast.success("Ruta Hermanas Mirabal guardada en tu itinerario. ¡Disfruta el viaje histórico!");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Ruta Histórica Hermanas Mirabal - Descubre RD"
        description="Sigue los pasos de Patria, Minerva y María Teresa Mirabal en Salcedo. Explora el museo, su casa natal, los famosos murales artísticos y el Ecoparque de la Paz."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-rose-500/10 text-rose-600 border-rose-500/20 gap-1">
                <History className="h-3.5 w-3.5" /> Ruta de la Libertad y Memoria Histórica
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display">
                Ruta Hermanas Mirabal
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Recorre la provincia de los murales y rinde tributo a las heroínas nacionales en su tierra natal, Salcedo. Un viaje de arte, ecología e historia patria.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={handleStartRoute} className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                  <Map className="h-4.5 w-4.5" /> Iniciar Ruta Digital
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => toast.info("Guía de audio disponible próximamente.")}>
                  <BookOpen className="h-4.5 w-4.5" /> Descargar Folleto PDF
                </Button>
              </div>
            </div>
          </section>

          {/* Core Content */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Timeline / Stops Selector (Col 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="h-5 w-5 text-rose-500" />
                    <h2 className="text-xl font-bold font-display">Paradas del Recorrido</h2>
                  </div>

                  <div className="relative border-l border-muted-foreground/30 ml-4 pl-6 space-y-8">
                    {routeStops.map((stop, index) => {
                      const isActive = stop.id === activeStop;
                      return (
                        <div 
                          key={stop.id}
                          className="relative cursor-pointer group"
                          onClick={() => setActiveStop(stop.id)}
                        >
                          {/* Dot indicator */}
                          <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                            isActive 
                              ? "bg-rose-500 border-rose-500 scale-125 shadow-sm shadow-rose-500/50" 
                              : "bg-background border-muted-foreground/50 group-hover:border-rose-400"
                          }`} />
                          
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Parada {index + 1}</span>
                          <h3 className={`text-base font-semibold transition-colors ${
                            isActive ? "text-rose-500 font-bold" : "text-foreground group-hover:text-rose-400"
                          }`}>{stop.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {stop.location}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Stop Details (Col 7) */}
                <div className="lg:col-span-7">
                  <Card className="border-rose-500/10 shadow-lg">
                    <CardHeader className="bg-rose-500/5 border-b border-rose-500/10">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 border-rose-500/30 text-rose-600 bg-rose-500/5 text-[10px]">
                            {currentStop.type}
                          </Badge>
                          <CardTitle className="text-2xl font-display text-foreground">{currentStop.name}</CardTitle>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-rose-500 shrink-0"
                          onClick={() => toast.success("Añadido a favoritos")}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-1.5 text-xs font-semibold text-rose-600/80 mt-1">
                        <MapPin className="h-4 w-4" /> {currentStop.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <History className="h-4 w-4 text-rose-500" /> Sobre esta parada
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentStop.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-foreground">Aspectos Destacados:</h4>
                        <ul className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {currentStop.highlights.map((h, i) => (
                            <li key={i} className="flex items-center gap-2 bg-muted/40 p-2 rounded border border-border">
                              <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 fill-amber-500" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Horarios de Entrada:</span>
                          <span className="font-semibold flex items-center gap-1 text-foreground">
                            <Calendar className="h-4.5 w-4.5 text-rose-500" /> {currentStop.hours}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Costo de Entrada:</span>
                          <span className="font-semibold text-foreground">
                            {currentStop.price}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button 
                          onClick={() => {
                            toast.success(`Mostrando ruta vial hacia ${currentStop.name} en el mapa.`);
                          }}
                          className="w-full sm:w-auto gap-1 text-xs"
                        >
                          Cómo llegar <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </div>

              </div>

            </div>
          </section>

          {/* Historical Legacy section */}
          <section className="bg-muted/40 py-16 border-t border-border">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <Landmark className="h-10 w-10 text-rose-500 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">El Legado de las Mariposas</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
                El 25 de noviembre, fecha del trágico asesinato de Patria, Minerva y María Teresa Mirabal en 1960, fue declarado por la ONU como el <strong>Día Internacional de la Eliminación de la Violencia contra la Mujer</strong>. Su valentía transformó la historia dominicana y el mundo.
              </p>
              <Badge variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-600 px-4 py-1.5 text-xs font-semibold">
                Salcedo, Provincia Hermanas Mirabal, República Dominicana
              </Badge>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
