import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Landmark, Church, MapPin, Clock, Star, Info,
  Calendar, Users, Camera, Heart
} from "lucide-react";

const museums = [
  {
    id: 1,
    name: "Museo del Hombre Dominicano",
    location: "Santo Domingo",
    type: "Etnográfico",
    rating: 4.6,
    price: "RD$100",
    hours: "9:00 AM - 5:00 PM",
    description: "La colección más completa de artefactos taínos y cultura dominicana",
    image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=600"
  },
  {
    id: 2,
    name: "Museo de las Casas Reales",
    location: "Zona Colonial",
    type: "Historia Colonial",
    rating: 4.8,
    price: "RD$75",
    hours: "9:00 AM - 5:00 PM",
    description: "Historia de la colonización española en el Nuevo Mundo",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600"
  },
  {
    id: 3,
    name: "Museo de Arte Moderno",
    location: "Santo Domingo",
    type: "Arte",
    rating: 4.5,
    price: "RD$50",
    hours: "10:00 AM - 6:00 PM",
    description: "Arte dominicano contemporáneo y latinoamericano",
    image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600"
  },
  {
    id: 4,
    name: "Museo del Ámbar",
    location: "Puerto Plata",
    type: "Ciencias Naturales",
    rating: 4.7,
    price: "RD$150",
    hours: "9:00 AM - 6:00 PM",
    description: "Colección única de ámbar dominicano con insectos prehistóricos",
    image: "https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=600"
  }
];

const monuments = [
  {
    id: 1,
    name: "Faro a Colón",
    location: "Santo Domingo Este",
    description: "Monumento a Cristóbal Colón con supuestos restos del almirante",
    year: 1992
  },
  {
    id: 2,
    name: "Monumento a los Héroes de la Restauración",
    location: "Santiago",
    description: "Símbolo de la ciudad y de la independencia dominicana",
    year: 1944
  },
  {
    id: 3,
    name: "Altar de la Patria",
    location: "Santo Domingo",
    description: "Mausoleo de los padres de la patria: Duarte, Sánchez y Mella",
    year: 1976
  }
];

export default function MuseosMonumentos() {
  return (
    <PageTransition>
      <SEOHead
        title="Museos y Monumentos - República Dominicana"
        description="Explora los museos y monumentos históricos de RD. Historia taína, colonial y arte contemporáneo."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <div className="container mx-auto px-4 text-center">
              <Landmark className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Museos y Monumentos</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre la rica historia y cultura dominicana
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="museums" className="space-y-8">
                <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 gap-2">
                  <TabsTrigger value="museums" className="flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Museos
                  </TabsTrigger>
                  <TabsTrigger value="monuments" className="flex items-center gap-2">
                    <Church className="h-4 w-4" />
                    Monumentos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="museums">
                  <div className="grid md:grid-cols-2 gap-6">
                    {museums.map((museum) => (
                      <Card key={museum.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="relative h-48">
                          <img 
                            src={museum.image} 
                            alt={museum.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-3 right-3">{museum.type}</Badge>
                        </div>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{museum.name}</CardTitle>
                            <span className="flex items-center text-yellow-500">
                              <Star className="h-4 w-4 fill-current mr-1" />
                              {museum.rating}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{museum.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              {museum.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              {museum.hours}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="secondary">{museum.price}</Badge>
                            <Button size="sm">
                              <Camera className="h-4 w-4 mr-2" />
                              Más Info
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="monuments">
                  <div className="grid md:grid-cols-3 gap-6">
                    {monuments.map((monument) => (
                      <Card key={monument.id} className="text-center p-6">
                        <Church className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">{monument.name}</h3>
                        <Badge variant="outline" className="mb-3">{monument.location}</Badge>
                        <p className="text-sm text-muted-foreground mb-3">{monument.description}</p>
                        <Badge variant="secondary">Inaugurado: {monument.year}</Badge>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          <BetweenSectionsAd showDemo />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
