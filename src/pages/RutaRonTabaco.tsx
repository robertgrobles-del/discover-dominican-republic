import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, GlassWater, Compass, MapPin, Sparkles, Clock, 
  BookOpen, Star, Phone, Info
} from "lucide-react";

interface TourItem {
  id: string;
  name: string;
  type: "rum" | "tobacco";
  location: string;
  highlights: string[];
  hours: string;
  phone: string;
  description: string;
}

const toursData: TourItem[] = [
  {
    id: "1",
    name: "Centro Histórico Brugal",
    type: "rum",
    location: "Puerto Plata",
    highlights: ["Cata de rones premium", "Proceso de añejamiento en barricas", "Tienda oficial"],
    hours: "Lun-Vie 9:00 AM - 5:00 PM",
    phone: "+1 (809) 261-1888",
    description: "Una de las destilerías más emblemáticas del país. El tour muestra el proceso de destilación, las inmensas bodegas de barricas de roble blanco y culmina con una degustación guiada."
  },
  {
    id: "2",
    name: "Centro Histórico del Ron Barceló",
    type: "rum",
    location: "San Pedro de Macorís",
    highlights: ["Museo interactivo", "Explicación de caña de azúcar", "Cata premium"],
    hours: "Lun-Vie 8:00 AM - 4:00 PM",
    phone: "+1 (809) 529-5777",
    description: "Descubre el único ron dominicano elaborado 100% a partir del jugo de la caña de azúcar. Ubicado en Quisqueya, incluye un museo ecológico y bodegas automatizadas."
  },
  {
    id: "3",
    name: "Tour de Cigarros La Aurora",
    type: "tobacco",
    location: "Santiago (Tamboril)",
    highlights: ["Fábrica activa de cigarros", "Rolado manual", "Historia del tabaco dominicano"],
    hours: "Lun-Sáb 9:00 AM - 4:00 PM",
    phone: "+1 (809) 241-1111",
    description: "Visita la fábrica de cigarros más antigua del país, fundada en 1903. Observa a los maestros artesanos rolando a mano hojas seleccionadas del Valle del Cibao."
  },
  {
    id: "4",
    name: "Tabacalera de García",
    type: "tobacco",
    location: "La Romana",
    highlights: ["Fábrica de puros más grande del mundo", "Marcas mundiales (Montecristo, Romeo y Julieta)", "Tienda Duty Free"],
    hours: "Lun-Vie 8:30 AM - 3:30 PM",
    phone: "+1 (809) 556-2121",
    description: "Un tour exclusivo por la fábrica donde se elaboran a mano marcas legendarias. Observa el meticuloso proceso de clasificación de hojas, control de calidad y añejamiento de puros."
  }
];

export default function RutaRonTabaco() {
  const [filterType, setFilterType] = useState<"all" | "rum" | "tobacco">("all");

  const filteredTours = toursData.filter(t => filterType === "all" || t.type === filterType);

  return (
    <PageTransition>
      <SEOHead
        title="Ruta del Ron y del Tabaco Dominicano - Tour Sensorial"
        description="Recorre las destilerías de ron más famosas y las plantaciones y fábricas de cigarros artesanales en Santiago, Puerto Plata y La Romana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                <GlassWater className="h-3.5 w-3.5" /> Ruta Gastronómica y Sensorial
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Ruta del Ron y Tabaco
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explora el legado del azúcar, la destilación del ron y el arte del tabaco dominicano enrollado a mano en el corazón del Cibao y la costa Sur.
              </p>
            </div>
          </section>

          {/* Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              
              {/* Introduction Text Card */}
              <div className="grid lg:grid-cols-3 gap-6 mb-10">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Legado y Tradición
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-3">
                    <p>
                      La República Dominicana es líder mundial en la exportación de cigarros premium hechos a mano y produce algunos de los rones añejos más premiados del planeta.
                    </p>
                    <p>
                      El fértil <strong>Valle del Cibao</strong> proporciona el microclima idóneo para cultivar tabaco de calidad inigualable, mientras que los campos de caña de azúcar del Sur e Inteligencia de la costa Norte dan vida a destilados suaves y aromáticos amparados por denominaciones de origen.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <Info className="h-5 w-5" />
                      Sabías que...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <p>
                      El país es conocido como el <strong>"Silicon Valley del Tabaco"</strong> debido a la concentración de maestros artesanos y marcas de fama internacional en la provincia de Santiago de los Caballeros.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filter controls */}
              <div className="flex gap-2 mb-8 border-b border-border pb-4">
                <Button 
                  variant={filterType === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  Ver Todo
                </Button>
                <Button 
                  variant={filterType === "rum" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("rum")}
                  className="gap-1.5"
                >
                  <GlassWater className="h-4 w-4" /> Destilerías de Ron
                </Button>
                <Button 
                  variant={filterType === "tobacco" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("tobacco")}
                  className="gap-1.5"
                >
                  <Flame className="h-4 w-4" /> Fábricas de Cigarros
                </Button>
              </div>

              {/* List of tours */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTours.map((tour) => (
                  <Card key={tour.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Badge variant="secondary" className="mb-2 uppercase text-[10px] tracking-wider">
                            {tour.type === "rum" ? "Destilados" : "Tabaco"}
                          </Badge>
                          <CardTitle className="text-lg font-display">{tour.name}</CardTitle>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {tour.location}
                        </span>
                      </div>
                      <CardDescription className="text-xs pt-1">{tour.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Highlights */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Lo Destacado</span>
                        <div className="flex flex-wrap gap-1.5">
                          {tour.highlights.map((h, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-background border-border">{h}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Schedule and Contact */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-xs text-muted-foreground">
                        <div>
                          <span className="block font-medium text-foreground">Horario:</span>
                          <span className="flex items-center gap-1.5 mt-0.5"><Clock className="h-3.5 w-3.5 text-primary" /> {tour.hours}</span>
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">Teléfono Reservas:</span>
                          <a href={`tel:${tour.phone}`} className="flex items-center gap-1.5 mt-0.5 text-primary hover:underline font-semibold">
                            <Phone className="h-3.5 w-3.5" /> {tour.phone}
                          </a>
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
