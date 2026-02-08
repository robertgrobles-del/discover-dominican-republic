import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sun, Cloud, CloudRain, Thermometer, Wind, Droplets,
  Calendar, MapPin, Umbrella, Waves
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const seasons = [
  {
    name: "Temporada Alta",
    months: "Diciembre - Abril",
    weather: "Seco y agradable",
    temp: "24°C - 30°C",
    icon: Sun,
    highlights: ["Ballenas en Samaná (Ene-Mar)", "Carnaval (Feb)", "Semana Santa"],
    tips: ["Reserva con anticipación", "Precios más altos", "Playas más concurridas"],
    color: "bg-amber-500"
  },
  {
    name: "Temporada Media",
    months: "Mayo - Junio, Noviembre",
    weather: "Transición, algunas lluvias",
    temp: "25°C - 32°C",
    icon: Cloud,
    highlights: ["Menos turistas", "Buenos precios", "Clima aún favorable"],
    tips: ["Ideal para viajeros flexibles", "Buen momento para negociar"],
    color: "bg-sky-500"
  },
  {
    name: "Temporada Baja",
    months: "Julio - Octubre",
    weather: "Lluvioso, temporada de huracanes",
    temp: "26°C - 33°C",
    icon: CloudRain,
    highlights: ["Mejores ofertas", "Experiencia local auténtica"],
    tips: ["Seguro de viaje recomendado", "Lluvias son cortas", "Norte más seco"],
    color: "bg-slate-500"
  }
];

const regions = [
  { name: "Norte (Puerto Plata)", bestTime: "Ene - May", rainySeason: "Nov - Ene" },
  { name: "Este (Punta Cana)", bestTime: "Dic - Abr", rainySeason: "Sep - Nov" },
  { name: "Sur (Santo Domingo)", bestTime: "Dic - Abr", rainySeason: "May - Nov" },
  { name: "Montañas (Jarabacoa)", bestTime: "Dic - Mar", rainySeason: "May - Nov" }
];

export default function ClimaTemporadas() {
  return (
    <PageTransition>
      <SEOHead
        title="Clima y Temporadas - República Dominicana"
        description="Guía completa del clima en RD. Mejor época para viajar, temporadas y consejos por región."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-cyan-500/10 to-sky-500/10">
            <div className="container mx-auto px-4 text-center">
              <Sun className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Clima y Temporadas</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Planifica tu viaje según el clima perfecto
              </p>
            </div>
          </section>

          {/* Current Weather */}
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center p-4">
                  <Thermometer className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">28°C</div>
                  <div className="text-sm text-muted-foreground">Temperatura Actual</div>
                </Card>
                <Card className="text-center p-4">
                  <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">75%</div>
                  <div className="text-sm text-muted-foreground">Humedad</div>
                </Card>
                <Card className="text-center p-4">
                  <Wind className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">15 km/h</div>
                  <div className="text-sm text-muted-foreground">Viento</div>
                </Card>
                <Card className="text-center p-4">
                  <Waves className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">27°C</div>
                  <div className="text-sm text-muted-foreground">Temp. del Mar</div>
                </Card>
              </div>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          {/* Seasons */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Temporadas Turísticas</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {seasons.map((season) => (
                  <Card key={season.name} className="overflow-hidden">
                    <div className={`h-2 ${season.color}`} />
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${season.color} bg-opacity-20`}>
                          <season.icon className="h-8 w-8" />
                        </div>
                        <div>
                          <CardTitle>{season.name}</CardTitle>
                          <Badge variant="outline">{season.months}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Clima:</span>
                        <span>{season.weather}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Temperatura:</span>
                        <span className="font-medium">{season.temp}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Destacados:</h4>
                        <div className="flex flex-wrap gap-1">
                          {season.highlights.map((h) => (
                            <Badge key={h} variant="secondary" className="text-xs">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Tips:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {season.tips.map((tip) => (
                            <li key={tip} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <InlineAd showDemo variant="square-lg" />

          {/* Regional Weather */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Clima por Región</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {regions.map((region) => (
                  <Card key={region.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {region.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span>Mejor época: {region.bestTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Umbrella className="h-4 w-4 text-blue-500" />
                        <span>Lluvias: {region.rainySeason}</span>
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
