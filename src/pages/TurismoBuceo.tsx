import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Waves, MapPin, ShieldAlert, Sparkles, BookOpen, Clock, 
  HelpCircle, Star, Compass, Anchor
} from "lucide-react";

interface DiveSpot {
  id: string;
  name: string;
  type: "reef" | "wreck" | "cave";
  location: string;
  depth: string;
  visibility: string;
  level: "Principiante" | "Avanzado" | "Técnico";
  description: string;
}

const diveSpots: DiveSpot[] = [
  {
    id: "1",
    name: "Barco Hundido St. George",
    type: "wreck",
    location: "Bayahibe",
    depth: "30 - 40 metros (98 - 130 ft)",
    visibility: "20 - 30 metros",
    level: "Avanzado",
    description: "Un carguero transatlántico de acero de 73 metros de largo hundido en 1999. Es el pecio más famoso del país, hogar de enormes barracudas, morenas y corales incrustantes."
  },
  {
    id: "2",
    name: "Cueva El Chicho",
    type: "cave",
    location: "Parque Nacional Cotubanamá, Bayahibe",
    depth: "12 metros (39 ft)",
    visibility: "Excelente (Agua dulce cristalina)",
    level: "Técnico",
    description: "Una de las cuevas de agua dulce más espectaculares del país. Con impresionantes estalagmitas y estalactitas, requiere certificación de buceo en cavernas/cuevas (Cave Diver)."
  },
  {
    id: "3",
    name: "Pared de Isla Catalina",
    type: "reef",
    location: "Isla Catalina, La Romana",
    depth: "5 - 40 metros (16 - 130 ft)",
    visibility: "15 - 25 metros",
    level: "Principiante",
    description: "Una impresionante caída vertical que va desde arrecifes poco profundos aptos para snorkel, hasta profundidades de 40 metros llenas de abanicos de mar, esponjas y peces tropicales."
  },
  {
    id: "4",
    name: "Arrecife de Sosúa (Las Tres Piedras)",
    type: "reef",
    location: "Sosúa, Puerto Plata",
    depth: "10 - 25 metros (33 - 82 ft)",
    visibility: "15 - 20 metros",
    level: "Principiante",
    description: "Tres grandes formaciones de coral rodeadas de arena blanca en una bahía resguardada. Excelente para ver tortugas, rayas y una enorme variedad de peces de arrecife."
  }
];

export default function TurismoBuceo() {
  const [filterType, setFilterType] = useState<"all" | "reef" | "wreck" | "cave">("all");

  const filteredSpots = diveSpots.filter(s => filterType === "all" || s.type === filterType);

  return (
    <PageTransition>
      <SEOHead
        title="Buceo y Snorkel en RD - Arrecifes, Barcos Hundidos y Cuevas"
        description="Descubre los mejores puntos de buceo en República Dominicana. Explora el pecio St. George, cuevas de agua dulce y arrecifes en Sosúa y Catalina."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-blue-500/10 via-teal-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                <Waves className="h-3.5 w-3.5 animate-pulse" /> Turismo de Aventura Subacuática
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Buceo y Snorkel
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Arrecifes de coral, cuevas de agua dulce y pecios hundidos. Sitios de buceo y snorkel en todo el país, para principiantes y certificados.
              </p>
            </div>
          </section>

          {/* Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              
              {/* Intro Banner */}
              <div className="grid lg:grid-cols-3 gap-6 mb-10">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Un Paraíso Bajo el Mar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                    <p>
                      Con temperaturas del agua que oscilan entre los 26°C y 29°C todo el año, la República Dominicana es un destino idóneo para buceadores de todos los niveles.
                    </p>
                    <p>
                      La costa sur (Bayahibe, Catalina) destaca por sus aguas calmadas de excelente visibilidad y pecios históricos. La costa norte (Sosúa, Las Terrenas) ofrece formaciones rocosas complejas e inmersiones a la deriva, mientras que los sistemas de cavernas cársticas interiores del país atraen a buceadores técnicos de todo el mundo.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-500/20 bg-blue-500/5 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                      <Anchor className="h-5 w-5" />
                      Seguridad y Eco-Buceo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2">
                    <p>
                      Respeta siempre las pautas de conservación marina: no toques el coral ni alimentes a los peces.
                    </p>
                    <p>
                      Asegúrate de bucear con centros autorizados que cuenten con certificación <strong>PADI o SSI</strong> y mantengan equipos de oxígeno a bordo de las embarcaciones.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-8 border-b border-border pb-4">
                <Button 
                  variant={filterType === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  Ver Todo
                </Button>
                <Button 
                  variant={filterType === "reef" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("reef")}
                  className="gap-1.5"
                >
                  <Waves className="h-4 w-4" /> Arrecifes
                </Button>
                <Button 
                  variant={filterType === "wreck" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("wreck")}
                  className="gap-1.5"
                >
                  <Anchor className="h-4 w-4" /> Barcos Hundidos
                </Button>
                <Button 
                  variant={filterType === "cave" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("cave")}
                  className="gap-1.5"
                >
                  <Compass className="h-4 w-4" /> Cuevas y Cavernas
                </Button>
              </div>

              {/* Dive spots list */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredSpots.map((spot) => (
                  <Card key={spot.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider border-primary/30 text-primary">
                            {spot.type === "reef" ? "Arrecife" : spot.type === "wreck" ? "Pecio / Barco" : "Cueva / Caverna"}
                          </Badge>
                          <CardTitle className="text-lg font-display">{spot.name}</CardTitle>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {spot.location}
                        </span>
                      </div>
                      <CardDescription className="text-xs pt-1">{spot.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Specs info */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-lg text-center text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">Profundidad</span>
                          <span className="font-semibold text-foreground">{spot.depth}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">Visibilidad</span>
                          <span className="font-semibold text-foreground">{spot.visibility}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">Nivel Requerido</span>
                          <span className="font-semibold text-foreground">{spot.level}</span>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
