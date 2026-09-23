import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/promo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, Camera, QrCode, Trophy, Clock, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const checkInLocations = [
  {
    id: 1,
    name: "Zona Colonial",
    city: "Santo Domingo",
    type: "Patrimonio",
    points: 50,
    checkedIn: true,
    checkinTime: "Hace 2 días",
    badge: "Explorador Colonial"
  },
  {
    id: 2,
    name: "Playa Bávaro",
    city: "Punta Cana",
    type: "Playa",
    points: 30,
    checkedIn: true,
    checkinTime: "Hace 5 días",
    badge: "Amante del Mar"
  },
  {
    id: 3,
    name: "Pico Duarte",
    city: "Jarabacoa",
    type: "Montaña",
    points: 100,
    checkedIn: false,
    badge: "Conquistador de Cumbres"
  },
  {
    id: 4,
    name: "Bahía de las Águilas",
    city: "Pedernales",
    type: "Playa",
    points: 75,
    checkedIn: false,
    badge: "Explorador Extremo"
  },
  {
    id: 5,
    name: "Cayo Levantado",
    city: "Samaná",
    type: "Isla",
    points: 60,
    checkedIn: false,
    badge: "Navegante del Caribe"
  },
  {
    id: 6,
    name: "Monumento a los Héroes",
    city: "Santiago",
    type: "Monumento",
    points: 40,
    checkedIn: false,
    badge: "Patriota"
  }
];

export default function CheckInDigital() {
  const { toast } = useToast();
  const [locations, setLocations] = useState(checkInLocations);
  const totalPoints = locations.filter(l => l.checkedIn).reduce((sum, l) => sum + l.points, 0);
  const checkedCount = locations.filter(l => l.checkedIn).length;

  const handleCheckIn = (locationId: number) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, checkedIn: true, checkinTime: "Ahora" } : loc
    ));
    const location = locations.find(l => l.id === locationId);
    toast({
      title: "¡Check-in exitoso! 🎉",
      description: `Has ganado ${location?.points} puntos y el badge "${location?.badge}"`,
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Check-in Digital en Destinos - República Dominicana"
        description="Registra tu visita a los destinos de RD y gana puntos, badges y recompensas exclusivas."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="container mx-auto px-4 text-center">
              <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Check-in Digital</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Registra tus visitas y colecciona badges exclusivos
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="py-8 border-b">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{checkedCount}</div>
                  <div className="text-sm text-muted-foreground">Lugares visitados</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{totalPoints}</div>
                  <div className="text-sm text-muted-foreground">Puntos totales</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{checkedCount}</div>
                  <div className="text-sm text-muted-foreground">Badges ganados</div>
                </div>
              </div>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <Card 
                    key={location.id} 
                    className={`hover:shadow-xl transition-shadow ${
                      location.checkedIn ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {location.name}
                            {location.checkedIn && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {location.city}
                          </div>
                        </div>
                        <Badge variant="outline">{location.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold">{location.points} puntos</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {location.badge}
                        </Badge>
                      </div>

                      {location.checkedIn ? (
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-green-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {location.checkinTime}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Camera className="h-4 w-4 mr-2" />
                              Añadir Foto
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleCheckIn(location.id)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Hacer Check-in
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <InlineAd showDemo variant="medium" />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
