import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Pause, Download, Clock, MapPin, Volume2 } from "lucide-react";

const audioGuides = [
  {
    id: 1,
    title: "Zona Colonial: Historia Viva",
    location: "Santo Domingo",
    duration: "45 min",
    stops: 12,
    language: "Español",
    description: "Recorre la primera ciudad del Nuevo Mundo con narración histórica",
    downloaded: false,
    size: "85 MB"
  },
  {
    id: 2,
    title: "Ballenas de Samaná",
    location: "Samaná",
    duration: "30 min",
    stops: 5,
    language: "Español",
    description: "Aprende sobre las ballenas jorobadas durante tu tour",
    downloaded: true,
    size: "62 MB"
  },
  {
    id: 3,
    title: "Sendero Pico Duarte",
    location: "Jarabacoa",
    duration: "2 horas",
    stops: 8,
    language: "Español",
    description: "Guía completa para la caminata al techo del Caribe",
    downloaded: false,
    size: "145 MB"
  },
  {
    id: 4,
    title: "Arte Taíno en Los Haitises",
    location: "Los Haitises",
    duration: "35 min",
    stops: 6,
    language: "Español",
    description: "Descubre las pictografías y petroglifos de nuestros ancestros",
    downloaded: false,
    size: "72 MB"
  },
  {
    id: 5,
    title: "Gastronomía Dominicana",
    location: "Nacional",
    duration: "25 min",
    stops: 10,
    language: "Español",
    description: "Historia y secretos de nuestros platos típicos",
    downloaded: true,
    size: "48 MB"
  },
  {
    id: 6,
    title: "Ruta del Café",
    location: "Jarabacoa",
    duration: "40 min",
    stops: 7,
    language: "Español",
    description: "Desde la semilla hasta tu taza: el café dominicano",
    downloaded: false,
    size: "78 MB"
  }
];

export default function AudioGuias() {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <PageTransition>
      <SEOHead
        title="Audio Guías Descargables - República Dominicana"
        description="Descarga guías de audio para explorar RD a tu ritmo. Zona Colonial, Samaná, Pico Duarte y más."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
            <div className="container mx-auto px-4 text-center">
              <Headphones className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Audio Guías</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explora a tu ritmo con narraciones profesionales
              </p>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioGuides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{guide.title}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {guide.location}
                          </div>
                        </div>
                        <Button 
                          variant={playing === guide.id ? "default" : "outline"}
                          size="icon"
                          className="shrink-0"
                          onClick={() => setPlaying(playing === guide.id ? null : guide.id)}
                        >
                          {playing === guide.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {guide.duration}
                        </span>
                        <span className="flex items-center">
                          <Volume2 className="h-4 w-4 mr-1 text-muted-foreground" />
                          {guide.stops} paradas
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{guide.language}</Badge>
                          <span className="text-xs text-muted-foreground">{guide.size}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant={guide.downloaded ? "outline" : "default"}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {guide.downloaded ? "Descargada" : "Descargar"}
                        </Button>
                      </div>

                      {playing === guide.id && (
                        <div className="pt-2 border-t">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full animate-pulse"
                              style={{ width: '35%' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>2:34</span>
                            <span>{guide.duration}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <InlineAd showDemo variant="square-lg" />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
