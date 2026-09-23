import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, MapPin, Calendar, Flag, Award, ExternalLink, 
  Sparkles, CheckCircle, Compass, Sun, ShieldCheck
} from "lucide-react";
import { PanoramaAd } from "@/components/promo";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  region: "este" | "norte" | "santo-domingo";
  holes: number;
  par: number;
  designer: string;
  greenFee: string;
  description: string;
  highlights: string[];
  image: string;
}

const golfCourses: GolfCourse[] = [
  {
    id: "1",
    name: "Teeth of the Dog (Casa de Campo)",
    location: "La Romana",
    region: "este",
    holes: 18,
    par: 72,
    designer: "Pete Dye",
    greenFee: "$395 - $495 USD",
    description: "Considerado el campo #1 del Caribe y top 50 mundial. Con 7 hoyos que bordean directamente los arrecifes del Mar Caribe.",
    highlights: ["#1 en el Caribe", "7 hoyos sobre el mar", "PGA Tour Latin America"],
    image: laRomanaImg
  },
  {
    id: "2",
    name: "Corales Golf Club (Puntacana Resort)",
    location: "Punta Cana",
    region: "este",
    holes: 18,
    par: 72,
    designer: "Tom Fazio",
    greenFee: "$350 - $450 USD",
    description: "Sede oficial del PGA TOUR Corales Championship. Famoso por su tramo final de 3 hoyos llamado 'The Devil's Elbow'.",
    highlights: ["Sede Oficial PGA TOUR", "The Devil's Elbow", "Acantilados oceánicos"],
    image: puntaCanaImg
  },
  {
    id: "3",
    name: "Punta Espada Golf Club (Cap Cana)",
    location: "Cap Cana",
    region: "este",
    holes: 18,
    par: 72,
    designer: "Jack Nicklaus",
    greenFee: "$380 - $480 USD",
    description: "Una obra maestra de Jack Nicklaus donde 8 hoyos juegan directamente a lo largo y por encima de las aguas turquesas del Caribe.",
    highlights: ["Firma Jack Nicklaus", "8 hoyos al borde del agua", "Diseño top mundial"],
    image: puntaCanaImg
  },
  {
    id: "4",
    name: "Playa Grande Golf & Ocean Club",
    location: "Río San Juan",
    region: "norte",
    holes: 18,
    par: 72,
    designer: "Robert Trent Jones Sr. / Rees Jones",
    greenFee: "$300 - $400 USD",
    description: "Conocido como el 'Pebble Beach del Caribe'. 10 hoyos se extienden sobre espectaculares acantilados frente al Océano Atlántico.",
    highlights: ["Pebble Beach del Caribe", "10 hoyos sobre acantilados", "Costa Norte Atlántica"],
    image: puertoPlataImg
  },
  {
    id: "5",
    name: "La Cana Golf Club",
    location: "Punta Cana",
    region: "este",
    holes: 27,
    par: 72,
    designer: "P.B. Dye",
    greenFee: "$220 - $295 USD",
    description: "27 hoyos divididos en tres nueves (Tortuga, Arrecife y Hacienda). Pionero ecológico con pasto paspalum regado con agua de mar tratada.",
    highlights: ["27 Hoyos de Campeonato", "Pasto ecológico Paspalum", "Club House frente a playa"],
    image: puntaCanaImg
  }
];

export default function GolfRD() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const filteredCourses = golfCourses.filter(c => selectedRegion === "all" || c.region === selectedRegion);

  return (
    <PageTransition>
      <SEOHead
        title="Golf en República Dominicana - Campos PGA y Clase Mundial"
        description="Explora los campos de golf premium de la República Dominicana: Teeth of the Dog, Corales PGA Tour, Punta Espada y Playa Grande con tarifas y diseñadores legendarios."
        keywords="golf republica dominicana, pga tour corales, teeth of the dog casa de campo, punta espada golf cap cana, campos de golf caribe"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative min-h-[40vh] flex items-center overflow-hidden border-b border-border/60">
            <div className="absolute inset-0">
              <img 
                src={laRomanaImg} 
                alt="Campos de Golf República Dominicana" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-14">
              <div className="max-w-2xl">
                <Badge className="mb-3 bg-emerald-600 text-white font-semibold">
                  <Trophy className="h-3.5 w-3.5 mr-1.5" /> Capital del Golf del Caribe
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
                  Golf de Clase Mundial en <span className="text-primary">República Dominicana</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Fairways esculpidos sobre acantilados del Caribe y el Atlántico diseñados por leyendas como Pete Dye, Jack Nicklaus y Tom Fazio. Sede oficial del PGA TOUR y destino predilecto de golfistas globales.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Metrics */}
          <section className="py-8 bg-card/40 border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reconocimiento</p>
                    <p className="text-sm md:text-base font-bold text-foreground">#1 Destino Golf Caribe</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Flag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Campos Premium</p>
                    <p className="text-sm md:text-base font-bold text-foreground">26+ Campos de Autor</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Torneo Oficial</p>
                    <p className="text-sm md:text-base font-bold text-foreground">Corales PGA TOUR</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temporada de Juego</p>
                    <p className="text-sm md:text-base font-bold text-foreground">365 Días al Año</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Courses List */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl space-y-8">
              
              {/* Region Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Campos de Campeonato Destacados
                  </h2>
                  <p className="text-xs text-muted-foreground">Selecciona por zona geográfica para consultar tee times y especificaciones</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "Todos los Campos" },
                    { id: "este", label: "Punta Cana / La Romana" },
                    { id: "norte", label: "Costa Norte" },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      size="sm"
                      variant={selectedRegion === tab.id ? "default" : "outline"}
                      className="rounded-xl text-xs"
                      onClick={() => setSelectedRegion(tab.id)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grid of Golf Courses */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden rounded-3xl border border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between group">
                    <div>
                      {/* Image cover */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img 
                          src={course.image} 
                          alt={course.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold">
                          {course.holes} Hoyos • Par {course.par}
                        </Badge>

                        <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-white/80 block">Green Fee Estimado</span>
                            <span className="text-sm font-black font-mono">{course.greenFee}</span>
                          </div>
                          <span className="text-xs text-white/90 font-semibold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md">
                            {course.designer}
                          </span>
                        </div>
                      </div>

                      <CardHeader className="p-5 pb-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{course.location}</span>
                        </div>
                        <CardTitle className="text-base font-display font-bold group-hover:text-primary transition-colors">
                          {course.name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-3 text-xs text-muted-foreground">
                        <p className="line-clamp-2 leading-relaxed">{course.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {course.highlights.map((h, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] bg-muted/60 text-muted-foreground border-none">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-5 pt-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full rounded-xl gap-1.5 text-xs font-semibold"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(course.name + " reserva tee times")}`, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Consultar Horarios & Tee Times
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

            </div>
          </section>

          {/* Bottom Panorama Ad */}
          <div className="container mx-auto px-4 max-w-6xl pb-16">
            <PanoramaAd />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
